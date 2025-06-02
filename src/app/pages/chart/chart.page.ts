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
  history!: Conversion[];
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

    // Prepara labels e dados (últimas 10 entradas)
    const last10 = this.history.slice(0, 10);
    const labels = last10.map(h => `${h.base}→${h.target}`);
    const dataPoints = last10.map(h => h.result);

    // Cria o gráfico de barras
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Resultado',
            data: dataPoints,
            backgroundColor: 'rgba(70, 130, 180, 0.7)', // SteelBlue translúcido
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: {
              color: '#333333',
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#333333'
            }
          }
        }
      }
    });
  }
}
