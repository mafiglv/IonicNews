import { Component, OnInit } from '@angular/core';
import { ExchangeService } from '../../services/exchange.service';
import { StorageService } from '../../services/storage.service';
import { Conversion } from '../../models/conversion.model';
import { Currency } from '../../models/currency.model';
import { currencies } from '../../data/currencies';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true
})
export class HomePage implements OnInit {
  fromCurrency: string = 'USD';
  toCurrency: string = 'BRL';
  amount: number = 1;
  result: number = 0;
  exchangeRate: number = 0;
  date: string = '';

  allCurrencies: Currency[] = currencies;
  filteredFrom: Currency[] = [];
  filteredTo: Currency[] = [];

  constructor(
    private exchangeService: ExchangeService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    // Inicializa o Storage (já feito dentro do próprio StorageService)
    // Prepara as listas filtráveis
    this.filteredFrom = this.allCurrencies;
    this.filteredTo = this.allCurrencies;

    // Carrega a última conversão (para preencher o formulário)
    const last = await this.storageService.getLastConversion();
    if (last) {
      this.fromCurrency = last.base;
      this.toCurrency = last.target;
      this.amount = last.amount;
      this.result = last.result;
      this.exchangeRate = last.rate;
      this.date = last.date;
    }

    // Executa a primeira conversão (para exibir resultado logo que a Home abra)
    this.convert();
  }

  convert() {
    this.exchangeService.convert(this.fromCurrency, this.toCurrency, this.amount)
      .subscribe({
        next: async (data) => {
          this.exchangeRate = data.rate;
          this.result = data.result;
          this.date = data.date;

          // Cria o objeto Conversion
          const conv: Conversion = {
            base: this.fromCurrency,
            target: this.toCurrency,
            amount: this.amount,
            result: this.result,
            rate: this.exchangeRate,
            date: this.date
          };

          // 1) Salva no histórico completo
          await this.storageService.addConversionToHistory(conv);

          // 2) Salva também como "última conversão"
          await this.storageService.saveLastConversion(conv);
        },
        error: async () => {
          // Se estiver offline, tenta recuperar "lastConversion"
          const saved = await this.storageService.getLastConversion();
          if (saved 
              && saved.base === this.fromCurrency 
              && saved.target === this.toCurrency) {
            this.exchangeRate = saved.rate;
            this.result = saved.amount * saved.rate;
            this.date = saved.date;
          }
        }
      });
  }

  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.convert();
  }

  filterCurrencies(event: any, type: 'from' | 'to') {
    const query = event.target.value.toLowerCase();
    const filtered = this.allCurrencies.filter(currency =>
      currency.name.toLowerCase().includes(query) ||
      currency.code.toLowerCase().includes(query)
    );
    if (type === 'from') {
      this.filteredFrom = filtered;
    } else {
      this.filteredTo = filtered;
    }
  }
}
