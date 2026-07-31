export class CacheManager {
  private static cache: Map<string, { value: any; expiry: number }> = new Map()

  static get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    return item.value as T
  }

  static set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiry })
  }

  static clear(): void {
    this.cache.clear()
  }
}
