import { EventEmitter } from 'events';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';

import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseProviderConfig {
  channel: string;
  awareness?: awarenessProtocol.Awareness;
  resyncInterval?: number | false;
  defaultValue?: object;
}

// Define event types for better intellisense
export interface SupabaseProviderEvents {
  // Connection events
  connect: (provider: SupabaseProvider) => void;
  disconnect: (provider: SupabaseProvider) => void;
  error: (provider: SupabaseProvider) => void;

  // Sync events
  synced: (synced: boolean[]) => void;
  sync: (synced: boolean[]) => void;

  // Status events
  status: (
    status: { status: 'connecting' | 'connected' | 'disconnected' }[]
  ) => void;

  // Data events
  message: (update: Uint8Array) => void;
  awareness: (update: Uint8Array) => void;
}

export default class SupabaseProvider extends EventEmitter {
  awareness: awarenessProtocol.Awareness;
  connected = false;
  private channel: RealtimeChannel | null = null;

  private _synced = false;
  private resyncInterval: NodeJS.Timeout | undefined;
  protected logger: (message: string, ...optionalParams: unknown[]) => void;
  readonly id: number;

  version = 0;

  // Override EventEmitter methods for better typing
  on<K extends keyof SupabaseProviderEvents>(
    event: K,
    listener: SupabaseProviderEvents[K]
  ): this {
    return super.on(event, listener as any);
  }

  once<K extends keyof SupabaseProviderEvents>(
    event: K,
    listener: SupabaseProviderEvents[K]
  ): this {
    return super.once(event, listener as any);
  }

  emit<K extends keyof SupabaseProviderEvents>(
    event: K,
    ...args: Parameters<SupabaseProviderEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  off<K extends keyof SupabaseProviderEvents>(
    event: K,
    listener: SupabaseProviderEvents[K]
  ): this {
    return super.off(event, listener as any);
  }

  isOnline(online?: boolean): boolean {
    if (!online && online !== false) {
      return this.connected;
    }

    this.connected = online;
    return this.connected;
  }

  onDocumentUpdate(update: Uint8Array, origin: unknown) {
    if (origin !== this) {
      this.logger(
        'document updated locally, broadcasting update to peers',
        this.isOnline()
      );
      this.emit('message', update);
    }
  }

  onAwarenessUpdate(
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) {
    const changedClients = added.concat(updated).concat(removed);
    const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
      this.awareness,
      changedClients
    );
    this.emit('awareness', awarenessUpdate);
  }

  removeSelfFromAwarenessOnUnload() {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      'window unload'
    );
  }

  private onConnect() {
    this.logger('connected');

    if (this.config.defaultValue) {
      this.logger('applying update to yjs');
      try {
        const string = JSON.stringify(this.config.defaultValue);
        this.applyUpdate(Uint8Array.from(string));
      } catch (error) {
        this.logger(`Error: ${error}`);
      }
    }

    this.logger('setting connected flag to true');
    this.isOnline(true);

    this.emit('status', [{ status: 'connected' }]);

    if (this.awareness.getLocalState() !== null) {
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID]
      );
      this.emit('awareness', awarenessUpdate);
    }
  }

  private applyUpdate(update: Uint8Array, origin?: unknown) {
    this.version++;
    Y.applyUpdate(this.doc, update, origin);
  }

  private disconnect() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private connect() {
    this.channel = this.supabase.channel(this.config.channel);
    if (this.channel) {
      this.channel
        .on(
          REALTIME_LISTEN_TYPES.BROADCAST,
          { event: 'message' },
          ({ payload }) => {
            this.onMessage(Uint8Array.from(payload), this);
          }
        )
        .on(
          REALTIME_LISTEN_TYPES.BROADCAST,
          { event: 'awareness' },
          ({ payload }) => {
            this.onAwareness(Uint8Array.from(payload));
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            this.emit('connect', this);
          }

          if (status === 'CHANNEL_ERROR') {
            this.logger('CHANNEL_ERROR', err);
            this.emit('error', this);
          }

          if (status === 'TIMED_OUT') {
            this.emit('disconnect', this);
          }

          if (status === 'CLOSED') {
            this.emit('disconnect', this);
          }
        });
    }
  }

  constructor(
    private doc: Y.Doc,
    private supabase: SupabaseClient,
    private config: SupabaseProviderConfig
  ) {
    super();

    this.awareness =
      this.config.awareness || new awarenessProtocol.Awareness(doc);

    this.config = config || {};
    this.id = doc.clientID;

    this.supabase = supabase;
    this.on('connect', this.onConnect);
    this.on('disconnect', this.onDisconnect);

    this.logger = console.log;

    this.logger('constructor initializing');
    this.logger(`connecting to Supabase Realtime ${doc.guid}`);

    if (
      this.config.resyncInterval ||
      typeof this.config.resyncInterval === 'undefined'
    ) {
      if (this.config.resyncInterval && this.config.resyncInterval < 3000) {
        throw new Error('resync interval of less than 3 seconds');
      }
      this.logger(
        `setting resync interval to every ${(this.config.resyncInterval || 5000) / 1000} seconds`
      );
      this.resyncInterval = setInterval(() => {
        this.logger('resyncing (resync interval elapsed)');
        this.emit('message', Y.encodeStateAsUpdate(this.doc));
        if (this.channel) {
          this.channel.send({
            type: 'broadcast',
            event: 'message',
            payload: Array.from(Y.encodeStateAsUpdate(this.doc)),
          });
        }
      }, this.config.resyncInterval || 5000);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(
        'beforeunload',
        this.removeSelfFromAwarenessOnUnload
      );
    } else if (typeof process !== 'undefined') {
      process.on('exit', () => this.removeSelfFromAwarenessOnUnload);
    }
    this.on('awareness', (update) => {
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'awareness',
          payload: Array.from(update),
        });
      }
    });
    this.on('message', (update) => {
      if (this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'message',
          payload: Array.from(update),
        });
      }
    });

    this.connect();
    this.doc.on('update', this.onDocumentUpdate.bind(this));
    this.awareness.on('update', this.onAwarenessUpdate.bind(this));
  }

  get synced() {
    return this._synced;
  }

  set synced(state) {
    if (this._synced !== state) {
      this.logger(`setting sync state to ${state}`);
      this._synced = state;
      this.emit('synced', [state]);
      this.emit('sync', [state]);
    }
  }

  onConnecting() {
    if (!this.isOnline()) {
      this.logger('connecting');
      this.emit('status', [{ status: 'connecting' }]);
    }
  }

  onDisconnect() {
    this.logger('disconnected');

    this.synced = false;
    this.isOnline(false);
    this.logger('set connected flag to false');
    if (this.isOnline()) {
      this.emit('status', [{ status: 'disconnected' }]);
    }

    // update awareness (keep all users except local)
    // FIXME? compare to broadcast channel behavior
    const states = Array.from(this.awareness.getStates().keys()).filter(
      (client) => client !== this.doc.clientID
    );
    awarenessProtocol.removeAwarenessStates(this.awareness, states, this);
  }

  onMessage(message: Uint8Array, origin: unknown) {
    if (!this.isOnline()) {
      return;
    }

    try {
      this.applyUpdate(message, this);
    } catch (err) {
      this.logger(`Error: ${err}`);
    }
  }

  onAwareness(message: Uint8Array) {
    awarenessProtocol.applyAwarenessUpdate(this.awareness, message, this);
  }

  onAuth(message: Uint8Array) {
    this.logger(`received ${message.byteLength} bytes from peer: ${message}`);

    if (!message) {
      this.logger('Permission denied to channel');
    }
    this.logger('processed message (type = MessageAuth)');
  }

  destroy() {
    this.logger('destroying');

    if (this.resyncInterval) {
      clearInterval(this.resyncInterval);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'beforeunload',
        this.removeSelfFromAwarenessOnUnload
      );
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => this.removeSelfFromAwarenessOnUnload);
    }

    this.awareness.off('update', this.onAwarenessUpdate);
    this.doc.off('update', this.onDocumentUpdate);

    if (this.channel) {
      this.disconnect();
    }
  }
}
