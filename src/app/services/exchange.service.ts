import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiKey = '658ac89a775a22d9bb1a19f5';

  private apiUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest`;

  constructor(private http: HttpClient) {}

  getRates(baseCurrency: string): Observable<any> {
    const url = `${this.apiUrl}/${baseCurrency}`;
    return this.http.get<any>(url);
  }
  convert(base: string, target: string, amount: number): Observable<{ rate: number; result: number; date: string }> {
    return this.getRates(base).pipe(
      map((data: any) => {
        const rate: number = data.conversion_rates[target];
        const result: number = rate * amount;
        const date: string = data.time_last_update_utc;

        return {
          rate,
          result,
          date
        };
      })
    );
  }
}
