import { caching } from 'cache-manager';

export class Cache {
  private cacheManager: any;

  constructor(options: { ttl?: number }) {
    this.initialize(options);
  }

  private async initialize(options: { ttl?: number }) {
    this.cacheManager = await caching('memory', {
      max: 100,
      ttl: (options.ttl || 60) * 1000 // Convert to milliseconds
    });
  }

  public async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  public async set(key: string, value: any): Promise<void> {
    await this.cacheManager.set(key, value);
  }

  public async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  public async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}
