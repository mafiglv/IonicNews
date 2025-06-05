import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel
} from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { Currency } from '../../models/currency.model';
import { currencies } from '../../data/currencies';
import { ExchangeService } from '../../services/exchange.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss']
})
export class ChartPage implements OnInit {
  @ViewChild('canvasChart', { static: true }) canvasChart!: ElementRef<HTMLCanvasElement>;
  fromCurrency: string = 'USD';
  toCurrency: string = 'NGN';
  allCurrencies: Currency[] = currencies;
  filteredFrom: Currency[] = [];
  filteredTo: Currency[] = [];
  periodOptions = [
    { label: '48H', days: 2 },
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '6M', days: 180 },
    { label: '12M', days: 365 },
    { label: '5Y', days: 365 * 5 }
  ];
  selectedPeriod = this.periodOptions[2]; 
  chartInstance: Chart<'line'> | null = null;
  isLoadingHistory: boolean = false;
  lastUpdatedText: string = '';

  constructor(private exchangeService: ExchangeService) {}

  ngOnInit() {
    this.filteredFrom = [...this.allCurrencies];
    this.filteredTo = [...this.allCurrencies];
    this.loadHistoryData();
  }

  
  filterCurrencies(event: any, type: 'from' | 'to') {
    const query = (event.detail.value as string).toLowerCase();
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

 
  onCurrencyChange() {
    this.loadHistoryData();
  }

  
  onPeriodChange(period: { label: string; days: number }) {
    this.selectedPeriod = period;
    this.loadHistoryData();
  }

  private loadHistoryData() {
    this.isLoadingHistory = true;

    const today = new Date();
    const endDate = this.formatDateYMD(today);

    const start = new Date();
    start.setDate(today.getDate() - this.selectedPeriod.days);
    const startDate = this.formatDateYMD(start);

    this.exchangeService
      .getTimeSeries(this.fromCurrency, this.toCurrency, startDate, endDate)
      .subscribe(dataPoints => {
        this.isLoadingHistory = false;

        const labels = dataPoints.map(dp => dp.date);
        const rates = dataPoints.map(dp => dp.rate);

        if (dataPoints.length > 0) {
          const lastDate = dataPoints[dataPoints.length - 1].date;
          this.lastUpdatedText = `Atualizado em ${this.formatDateDisplay(lastDate)}`;
        } else {
          this.lastUpdatedText = 'Nenhum dado disponível';
        }

        this.renderChart(labels, rates);
      });
  }

  private renderChart(labels: string[], rates: number[]) {
    const ctx = this.canvasChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: `Taxa: 1 ${this.fromCurrency} → ${this.toCurrency}`,
            data: rates,
            tension: 0.25,
            fill: false,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            ticks: {
              maxTicksLimit: 5,
              autoSkip: true
            }
          },
          y: {
            display: true
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => {
                const value = context.parsed.y as number;
                return ` ${value.toFixed(4)} ${this.toCurrency}`;
              }
            }
          }
        }
      }
    };

    this.chartInstance = new Chart(ctx, config);
  }

  
  private formatDateYMD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateDisplay(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR');
  }
}
