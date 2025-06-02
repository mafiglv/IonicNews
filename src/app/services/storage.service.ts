import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Conversion } from '../models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    // inicia o Storage assim que o serviço for instanciado
    this.init();
  }

  // Inicialização do Ionic Storage
  private async init(): Promise<void> {
    const store = await this.storage.create();
    this._storage = store;
  }

  // Salva uma conversão no “history” (mantém até 10 itens)
  async saveConversion(conversion: Conversion): Promise<void> {
    if (!this._storage) {
      // garante que _storage esteja inicializado
      await this.init();
    }
    // A partir deste ponto, _storage não é mais null → uso de non-null assertion (_storage!)
    const history: Conversion[] = (await this._storage!.get('history')) || [];
    history.unshift(conversion);
    // Mantém somente os 10 mais recentes
    await this._storage!.set('history', history.slice(0, 10));
  }

  // Retorna o array de conversões armazenadas (ou [] se não existir)
  async getHistory(): Promise<Conversion[]> {
    if (!this._storage) {
      await this.init();
    }
    const history: Conversion[] = (await this._storage!.get('history')) || [];
    return history;
  }

  // Remove todo o histórico
  async clearHistory(): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
    await this._storage!.remove('history');
  }

  // Armazena um valor genérico sob a chave `key`
  async set(key: string, value: any): Promise<void> {
    if (!this._storage) {
      await this.init();
    }
    await this._storage!.set(key, value);
  }

  // Recupera o valor genérico armazenado na chave `key`
  async get(key: string): Promise<any> {
    if (!this._storage) {
      await this.init();
    }
    const val = await this._storage!.get(key);
    return val;
  }
}
