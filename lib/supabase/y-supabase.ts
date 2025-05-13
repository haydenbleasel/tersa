import {
  REALTIME_LISTEN_TYPES,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';
import debounce from 'debounce';
import * as Y from 'yjs';

export interface SupabaseProviderConfig {
  channel: string;
  tableName: string;
  columnName: string;
  idName?: string;
  id: string | number;
  resyncInterval?: number | false;
}

type EventMap = {
  connect: CustomEvent<SupabaseProvider>;
  disconnect: CustomEvent<SupabaseProvider>;
  error: CustomEvent<SupabaseProvider>;
  status: CustomEvent<{ status: string }[]>;
  message: CustomEvent<Uint8Array>;
  save: CustomEvent<number>;
  synced: CustomEvent<boolean[]>;
  sync: CustomEvent<boolean[]>;
};

class EventBus extends EventTarget {
  emit<K extends keyof EventMap>(eventName: K, detail: EventMap[K]['detail']) {
    const event = new CustomEvent(eventName, { detail });
    this.dispatchEvent(event);
  }

  on<K extends keyof EventMap>(
    eventName: K,
    listener: (event: EventMap[K]) => void
  ) {
    this.addEventListener(eventName, listener as EventListener);
  }

  off<K extends keyof EventMap>(
    eventName: K,
    listener: (event: EventMap[K]) => void
  ) {
    this.removeEventListener(eventName, listener as EventListener);
  }
}

export interface SupabaseProvider {
  id: number;
  version: number;
  isOnline: (online?: boolean) => boolean;
  onDocumentUpdate: (update: Uint8Array, origin: unknown) => void;
  save: () => Promise<void>;
  destroy: () => void;
  onConnecting: () => void;
  onDisconnect: () => void;
  onMessage: (message: Uint8Array, origin: unknown) => void;
  get synced(): boolean;
  set synced(state: boolean);
}

const EVENT_NAME = 'canvas-update';

export default function createSupabaseProvider(
  doc: Y.Doc,
  supabase: SupabaseClient,
  config: SupabaseProviderConfig
): SupabaseProvider {
  const emitter = new EventBus();
  const logger = (message: string, ...args: unknown[]) => {
    console.log(`[y-${doc.clientID}] ${message}`, ...args);
  };

  let connected = false;
  let channel: RealtimeChannel | null = null;
  let _synced = false;
  let resyncInterval: NodeJS.Timeout | undefined;
  let version = 0;

  const id = doc.clientID;

  const debouncedSave = debounce(async () => {
    const content = Array.from(Y.encodeStateAsUpdate(doc));

    logger('saving to database');

    const { error } = await supabase
      .from(config.tableName)
      .update({ [config.columnName]: content })
      .eq(config.idName || 'id', config.id);

    if (error) {
      throw error;
    }

    emitter.emit('save', version);
  }, 1000);

  const isOnline = (online?: boolean): boolean => {
    if (!online && online !== false) return connected;
    connected = online;
    return connected;
  };

  const onDocumentUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin !== provider) {
      logger(
        'document updated locally, broadcasting update to peers',
        isOnline()
      );
      emitter.emit('message', update);
      debouncedSave();
    }
  };

  const save = async () => {
    const content = Array.from(Y.encodeStateAsUpdate(doc));

    logger('saving to database');

    const { error } = await supabase
      .from(config.tableName)
      .update({ [config.columnName]: content })
      .eq(config.idName || 'id', config.id);

    if (error) {
      throw error;
    }

    emitter.emit('save', version);
  };

  const applyUpdate = (update: Uint8Array, origin?: unknown) => {
    version++;
    Y.applyUpdate(doc, update, origin);
  };

  const disconnect = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };

  const connect = () => {
    channel = supabase.channel(config.channel);
    if (channel) {
      channel
        .on(
          REALTIME_LISTEN_TYPES.BROADCAST,
          { event: EVENT_NAME },
          ({ payload }) => {
            onMessage(Uint8Array.from(payload), provider);
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            emitter.emit('connect', provider);
          }

          if (status === 'CHANNEL_ERROR') {
            logger('CHANNEL_ERROR', err);
            emitter.emit('error', provider);
          }

          if (status === 'TIMED_OUT') {
            emitter.emit('disconnect', provider);
          }

          if (status === 'CLOSED') {
            emitter.emit('disconnect', provider);
          }
        });
    }
  };

  const onConnect = async () => {
    logger('connected');

    const { data, error, status } = await supabase
      .from(config.tableName)
      .select<string, { [key: string]: number[] }>(`${config.columnName}`)
      .eq(config.idName || 'id', config.id)
      .single();

    logger('retrieved data from supabase', status);

    if (data?.[config.columnName]) {
      logger('applying update to yjs');
      try {
        applyUpdate(Uint8Array.from(data[config.columnName]));
      } catch (error) {
        logger(
          'Error applying update:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    logger('setting connected flag to true');
    isOnline(true);

    emitter.emit('status', [{ status: 'connected' }]);
  };

  const onConnecting = () => {
    if (!isOnline()) {
      logger('connecting');
      emitter.emit('status', [{ status: 'connecting' }]);
    }
  };

  const onDisconnect = () => {
    logger('disconnected');

    _synced = false;
    isOnline(false);
    logger('set connected flag to false');
    if (isOnline()) {
      emitter.emit('status', [{ status: 'disconnected' }]);
    }
  };

  const onMessage = (message: Uint8Array, origin: unknown) => {
    if (!isOnline()) return;
    try {
      applyUpdate(message, provider);
    } catch (err) {
      logger(
        'Error processing message:',
        err instanceof Error ? err.message : String(err)
      );
    }
  };

  const destroy = () => {
    logger('destroying');

    if (resyncInterval) {
      clearInterval(resyncInterval);
    }

    doc.off('update', onDocumentUpdate);

    if (channel) disconnect();
  };

  // Set up event listeners
  emitter.on('connect', onConnect);
  emitter.on('disconnect', onDisconnect);

  // Set up resync interval if configured
  if (config.resyncInterval || typeof config.resyncInterval === 'undefined') {
    if (config.resyncInterval && config.resyncInterval < 3000) {
      throw new Error('resync interval of less than 3 seconds');
    }
    logger(
      `setting resync interval to every ${(config.resyncInterval || 5000) / 1000} seconds`
    );
    resyncInterval = setInterval(() => {
      logger('resyncing (resync interval elapsed)');
      emitter.emit('message', Y.encodeStateAsUpdate(doc));
      if (channel)
        channel.send({
          type: 'broadcast',
          event: EVENT_NAME,
          payload: Array.from(Y.encodeStateAsUpdate(doc)),
        });
    }, config.resyncInterval || 5000);
  }

  // Set up message event listeners
  emitter.on('message', (event) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: EVENT_NAME,
        payload: Array.from(event.detail),
      });
    }
  });

  // Initialize connection
  connect();
  doc.on('update', onDocumentUpdate);

  // Create provider object
  const provider: SupabaseProvider = {
    id,
    version,
    isOnline,
    onDocumentUpdate,
    save,
    destroy,
    onConnecting,
    onDisconnect,
    onMessage,
    get synced() {
      return _synced;
    },
    set synced(state) {
      if (_synced !== state) {
        logger(`setting sync state to ${state}`);
        _synced = state;
        emitter.emit('synced', [state]);
        emitter.emit('sync', [state]);
      }
    },
  };

  return provider;
}
