import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/services/storage.service';
import { Conversion } from 'src/app/models/conversion.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  history: Conversion[] = [];
  error: string = '';

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    try {
      this.history = await this.storageService.getHistory();
    } catch (e: any) {
      this.error = 'Erro ao carregar histórico: ' + e.message;
    }
  }
}
