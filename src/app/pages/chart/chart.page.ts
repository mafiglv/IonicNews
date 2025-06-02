import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/services/storage.service';
import { Conversion } from 'src/app/models/conversion.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss']
})
export class ChartPage implements AfterViewInit {
  history: Conversion[] = [];
  error: string = '';

  constructor(private storageService: StorageService) {}

  async ngAfterViewInit() {
    try {
      this.history = await this.storageService.getHistory();
      this.renderChart();
    } catch (e: any) {
      this.error = 'Erro ao buscar histórico para gráfico: ' + e.message;
    }
  }

  renderChart() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (!canvas) {
      this.error = 'Elemento de gráfico não encontrado.';
      return;
    }

    const last10 = this.history.slice(0, 10).reverse();
    const labels = last10.map(h => `${h.base}→${h.target}`);
    const dataPoints = last10.map(h => h.result);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Resultado da Conversão',
            data: dataPoints,
            borderColor: '#3e64ff',
            backgroundColor: 'rgba(62, 100, 255, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: {
            ticks: { color: '#333' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#333' }
          }
        }
      }
    });
  }
}