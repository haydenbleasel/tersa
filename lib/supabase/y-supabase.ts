import {
  REALTIME_LISTEN_TYPES,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';
import debounce from 'debounce';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';

export interface SupabaseProviderConfig {
  channel: string;
  tableName: string;
  columnName: string;
  idName?: string;
  id: string | number;
  awareness?: awarenessProtocol.Awareness;
  resyncInterval?: number | false;
}

type EventMap = {
  connect: CustomEvent<SupabaseProvider>;
  disconnect: CustomEvent<SupabaseProvider>;
  error: CustomEvent<SupabaseProvider>;
  status: CustomEvent<{ status: string }[]>;
  message: CustomEvent<Uint8Array>;
  awareness: CustomEvent<Uint8Array>;
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
  awareness: awarenessProtocol.Awareness;
  id: number;
  version: number;
  isOnline: (online?: boolean) => boolean;
  onDocumentUpdate: (update: Uint8Array, origin: unknown) => void;
  onAwarenessUpdate: (
    update: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => void;
  removeSelfFromAwarenessOnUnload: () => void;
  save: () => Promise<void>;
  destroy: () => void;
  onConnecting: () => void;
  onDisconnect: () => void;
  onMessage: (message: Uint8Array, origin: unknown) => void;
  onAwareness: (message: Uint8Array) => void;
  onAuth: (message: Uint8Array) => void;
  get synced(): boolean;
  set synced(state: boolean);
}

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

  const awareness = config.awareness || new awarenessProtocol.Awareness(doc);
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

  const onAwarenessUpdate = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    try {
      const changedClients = added.concat(updated).concat(removed);
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        changedClients
      );
      if (awarenessUpdate && awarenessUpdate.length > 0) {
        emitter.emit('awareness', awarenessUpdate);
      }
    } catch (error) {
      logger(
        'Error encoding awareness update:',
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const removeSelfFromAwarenessOnUnload = () => {
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [doc.clientID],
      'window unload'
    );
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
          { event: 'message' },
          ({ payload }) => {
            onMessage(Uint8Array.from(payload), provider);
          }
        )
        .on(
          REALTIME_LISTEN_TYPES.BROADCAST,
          { event: 'awareness' },
          ({ payload }) => {
            onAwareness(Uint8Array.from(payload));
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

    if (awareness.getLocalState() !== null) {
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        [doc.clientID]
      );
      emitter.emit('awareness', awarenessUpdate);
    }
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

    const states = Array.from(awareness.getStates().keys()).filter(
      (client) => client !== doc.clientID
    );
    awarenessProtocol.removeAwarenessStates(awareness, states, provider);
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

  const onAwareness = (message: Uint8Array) => {
    try {
      if (!message || message.length === 0) {
        logger('Received empty awareness update');
        return;
      }
      awarenessProtocol.applyAwarenessUpdate(awareness, message, provider);
    } catch (error) {
      logger(
        'Error applying awareness update:',
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const onAuth = (message: Uint8Array) => {
    logger(`received ${message.byteLength} bytes from peer: ${message}`);

    if (!message) {
      logger('Permission denied to channel');
    }
    logger('processed message (type = MessageAuth)');
  };

  const destroy = () => {
    logger('destroying');

    if (resyncInterval) {
      clearInterval(resyncInterval);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'beforeunload',
        removeSelfFromAwarenessOnUnload
      );
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => removeSelfFromAwarenessOnUnload);
    }

    awareness.off('update', onAwarenessUpdate);
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
          event: 'message',
          payload: Array.from(Y.encodeStateAsUpdate(doc)),
        });
    }, config.resyncInterval || 5000);
  }

  // Set up window/process event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', removeSelfFromAwarenessOnUnload);
  } else if (typeof process !== 'undefined') {
    process.on('exit', () => removeSelfFromAwarenessOnUnload);
  }

  // Set up awareness and message event listeners
  emitter.on('awareness', (event) => {
    if (channel)
      channel.send({
        type: 'broadcast',
        event: 'awareness',
        payload: Array.from(event.detail),
      });
  });

  emitter.on('message', (event) => {
    if (channel)
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: Array.from(event.detail),
      });
  });

  // Initialize connection
  connect();
  doc.on('update', onDocumentUpdate);
  awareness.on('update', onAwarenessUpdate);

  // Create provider object
  const provider: SupabaseProvider = {
    awareness,
    id,
    version,
    isOnline,
    onDocumentUpdate,
    onAwarenessUpdate,
    removeSelfFromAwarenessOnUnload,
    save,
    destroy,
    onConnecting,
    onDisconnect,
    onMessage,
    onAwareness,
    onAuth,
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
