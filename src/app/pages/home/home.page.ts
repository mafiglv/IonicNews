import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExchangeService } from 'src/app/services/exchange.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  amount: number = 1;
  fromCurrency: string = 'BRL';
  toCurrency: string = 'USD';
  result: number | null = null;
  lastUpdate: string = '';
  error: string = '';

  availableCurrencies = [
    { code: 'BRL', label: 'Real Brasileiro', flag: '🇧🇷' },
    { code: 'USD', label: 'Dólar Americano', flag: '🇺🇸' },
    { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', label: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'JPY', label: 'Iene Japonês', flag: '🇯🇵' }
  ];

  constructor(
    private exchangeService: ExchangeService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    const defaultCur = await this.storageService.get('defaultCurrency');
    if (defaultCur) this.fromCurrency = defaultCur;
    const lastTo = await this.storageService.get('lastToCurrency');
    if (lastTo) this.toCurrency = lastTo;
  }

  swapCurrencies() {
    [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
  }

  async convert() {
    this.error = '';
    this.result = null;

    if (!this.amount || this.amount <= 0) {
      this.error = 'Insira um valor válido.';
      return;
    }
    if (this.fromCurrency === this.toCurrency) {
      this.error = 'Escolha moedas diferentes.';
      return;
    }

    const offline = (await this.storageService.get('offlineMode')) || false;

    if (offline) {
      const cachedRate = await this.storageService.get('lastRate');
      if (cachedRate) {
        this.result = this.amount * cachedRate;
        this.lastUpdate = 'Última taxa em cache';
      } else {
        this.error = 'Modo offline e sem dados salvos.';
      }
      return;
    }

    this.exchangeService.convert(this.fromCurrency, this.toCurrency, this.amount).subscribe(
      async (data) => {
        this.result = Number(data.result.toFixed(4));
        this.lastUpdate = data.date;
        await this.storageService.saveConversion({
          base: this.fromCurrency,
          target: this.toCurrency,
          amount: this.amount,
          result: this.result,
          rate: data.rate,
          date: this.lastUpdate,
        });
        await this.storageService.set('lastRate', data.rate);
        await this.storageService.set('lastToCurrency', this.toCurrency);
      },
      (err) => {
        this.error = 'Erro ao obter taxa: ' + err.message;
      }
    );
  }
}
