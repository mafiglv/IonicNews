import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  defaultCurrency: string = 'BRL';
  offlineMode: boolean = false;
  error: string = '';
  successMessage: string = '';

  availableCurrencies = [
    { code: 'BRL', label: 'Real (BRL)' },
    { code: 'USD', label: 'Dólar (USD)' },
    { code: 'EUR', label: 'Euro (EUR)' },
    { code: 'GBP', label: 'Libra (GBP)' },
    { code: 'JPY', label: 'Iene (JPY)' },
  ];

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    try {
      const storedDefault = await this.storageService.get('defaultCurrency');
      if (storedDefault) this.defaultCurrency = storedDefault;

      const storedOffline = await this.storageService.get('offlineMode');
      this.offlineMode = storedOffline === true;
    } catch (e: any) {
      this.error = 'Erro ao carregar configurações: ' + e.message;
    }
  }

  async saveSettings() {
    this.error = '';
    this.successMessage = '';

    try {
      await this.storageService.set('defaultCurrency', this.defaultCurrency);
      await this.storageService.set('offlineMode', this.offlineMode);
      this.successMessage = 'Configurações salvas com sucesso!';
    } catch (e: any) {
      this.error = 'Erro ao salvar: ' + e.message;
    }

    setTimeout(() => (this.successMessage = ''), 3000);
  }

  async clearHistory() {
    try {
      await this.storageService.clearHistory();
      this.successMessage = 'Histórico limpo com sucesso!';
    } catch (e: any) {
      this.error = 'Erro ao limpar histórico: ' + e.message;
    }
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}
