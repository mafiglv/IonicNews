import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Conversion } from '../models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    const store = await this.storage.create();
    this._storage = store;
  }

  
  public async set(key: string, value: any): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
    return this._storage!.set(key, value);
  }

  
  public async get<T = any>(key: string): Promise<T | undefined> {
    if (!this._storage) {
      await this.init();
    }
    return this._storage!.get(key);
  }

  public async remove(key: string): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
    await this._storage!.remove(key);
  }

  public async clear(): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
    await this._storage!.clear();
  }

  
  public async getHistory(): Promise<Conversion[]> {
    const history: Conversion[] = (await this.get<Conversion[]>('conversionHistory')) || [];
    return history;
  }

  
  public async addConversionToHistory(conv: Conversion): Promise<void> {
    const history: Conversion[] = (await this.get<Conversion[]>('conversionHistory')) || [];
    history.unshift(conv);
    await this.set('conversionHistory', history);
  }

  public async clearHistory(): Promise<void> {
    await this.remove('conversionHistory');
  }

  public async saveLastConversion(conv: Conversion): Promise<void> {
    await this.set('lastConversion', conv);
  }

  public async getLastConversion(): Promise<Conversion | null> {
    const last = await this.get<Conversion>('lastConversion');
    return last || null;
  }
}
