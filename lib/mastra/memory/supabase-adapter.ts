import { createClient } from '@/lib/supabase/server';
// StorageAdapter interface - defined locally since @mastra/memory might not export it
interface StorageAdapter {
  get(key: string): any | Promise<any>;
  set(key: string, value: any): void | Promise<void>;
  delete(key: string): void | Promise<void>;
  has(key: string): boolean | Promise<boolean>;
  clear(): void | Promise<void>;
  keys(): string[] | Promise<string[]>;
}

// In-memory storage fallback
class InMemoryStorage {
  private store: Map<string, any> = new Map();
  
  get(key: string): any {
    return this.store.get(key) || null;
  }
  
  set(key: string, value: any): void {
    this.store.set(key, value);
  }
  
  delete(key: string): void {
    this.store.delete(key);
  }
  
  has(key: string): boolean {
    return this.store.has(key);
  }
  
  clear(): void {
    this.store.clear();
  }
  
  keys(): string[] {
    return Array.from(this.store.keys());
  }
  
  size(): number {
    return this.store.size;
  }
}

export class SupabaseMemoryAdapter implements StorageAdapter {
  private tableName = 'agent_memory';
  private userId: string;
  private inMemoryFallback: InMemoryStorage;
  private useInMemory = false;
  
  constructor(userId: string) {
    this.userId = userId;
    this.inMemoryFallback = new InMemoryStorage();
  }
  
  async get(key: string): Promise<any> {
    if (this.useInMemory) {
      return this.inMemoryFallback.get(`${this.userId}:${key}`);
    }
    
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('value')
        .eq('key', `${this.userId}:${key}`)
        .single();
      
      if (error) {
        console.warn('Supabase memory read failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        return this.inMemoryFallback.get(`${this.userId}:${key}`);
      }
      
      return data?.value || null;
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      return this.inMemoryFallback.get(`${this.userId}:${key}`);
    }
  }
  
  async set(key: string, value: any): Promise<void> {
    const fullKey = `${this.userId}:${key}`;
    
    if (this.useInMemory) {
      this.inMemoryFallback.set(fullKey, value);
      return;
    }
    
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          key: fullKey,
          value,
          userId: this.userId,
          updatedAt: new Date().toISOString(),
        });
        
      if (error) {
        console.warn('Supabase memory write failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        this.inMemoryFallback.set(fullKey, value);
      }
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      this.inMemoryFallback.set(fullKey, value);
    }
  }
  
  async delete(key: string): Promise<void> {
    const fullKey = `${this.userId}:${key}`;
    
    if (this.useInMemory) {
      this.inMemoryFallback.delete(fullKey);
      return;
    }
    
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('key', fullKey);
        
      if (error) {
        console.warn('Supabase memory delete failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        this.inMemoryFallback.delete(fullKey);
      }
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      this.inMemoryFallback.delete(fullKey);
    }
  }
  
  async has(key: string): Promise<boolean> {
    const fullKey = `${this.userId}:${key}`;
    
    if (this.useInMemory) {
      return this.inMemoryFallback.has(fullKey);
    }
    
    try {
      const supabase = await createClient();
      
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('key', fullKey);
        
      if (error) {
        console.warn('Supabase memory check failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        return this.inMemoryFallback.has(fullKey);
      }
      
      return (count ?? 0) > 0;
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      return this.inMemoryFallback.has(fullKey);
    }
  }
  
  async clear(): Promise<void> {
    if (this.useInMemory) {
      // Clear only user's keys from in-memory storage
      const keysToDelete = this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`));
      keysToDelete.forEach(key => this.inMemoryFallback.delete(key));
      return;
    }
    
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('userId', this.userId);
        
      if (error) {
        console.warn('Supabase memory clear failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        const keysToDelete = this.inMemoryFallback.keys()
          .filter(key => key.startsWith(`${this.userId}:`));
        keysToDelete.forEach(key => this.inMemoryFallback.delete(key));
      }
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      const keysToDelete = this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`));
      keysToDelete.forEach(key => this.inMemoryFallback.delete(key));
    }
  }
  
  async keys(): Promise<string[]> {
    if (this.useInMemory) {
      return this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`))
        .map(key => key.replace(`${this.userId}:`, ''));
    }
    
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('key')
        .eq('userId', this.userId);
        
      if (error) {
        console.warn('Supabase memory keys failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        return this.inMemoryFallback.keys()
          .filter(key => key.startsWith(`${this.userId}:`))
          .map(key => key.replace(`${this.userId}:`, ''));
      }
      
      return data?.map(row => row.key.replace(`${this.userId}:`, '')) || [];
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      return this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`))
        .map(key => key.replace(`${this.userId}:`, ''));
    }
  }
  
  async size(): Promise<number> {
    if (this.useInMemory) {
      return this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`))
        .length;
    }
    
    try {
      const supabase = await createClient();
      
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('userId', this.userId);
        
      if (error) {
        console.warn('Supabase memory size failed, falling back to in-memory:', error.message);
        this.useInMemory = true;
        return this.inMemoryFallback.keys()
          .filter(key => key.startsWith(`${this.userId}:`))
          .length;
      }
      
      return count || 0;
    } catch (error) {
      console.warn('Supabase connection failed, using in-memory storage');
      this.useInMemory = true;
      return this.inMemoryFallback.keys()
        .filter(key => key.startsWith(`${this.userId}:`))
        .length;
    }
  }
}