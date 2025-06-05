import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiKey = '658ac89a775a22d9bb1a19f5';
  private apiUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest`;
  private timeseriesBaseUrl = 'https://api.exchangerate.host';

  constructor(private http: HttpClient, private storage: StorageService) {}

  getRates(baseCurrency: string): Observable<any> {
    const url = `${this.apiUrl}/${baseCurrency}`;

    if (navigator.onLine) {
      return this.http.get<any>(url).pipe(
        switchMap(data => {
          // Agora StorageService.set() existe
          return from(this.storage.set(`rates_${baseCurrency}`, data)).pipe(map(() => data));
        }),
        catchError(() => {
          return from(this.storage.get<any>(`rates_${baseCurrency}`)).pipe(
            switchMap(cached => {
              if (cached) return of(cached);
              throw new Error('Falha na API e sem cache disponível');
            })
          );
        })
      );
    } else {
      return from(this.storage.get<any>(`rates_${baseCurrency}`)).pipe(
        switchMap(cached => {
          if (cached) return of(cached);
          throw new Error('Offline e sem dados em cache');
        })
      );
    }
  }

  convert(base: string, target: string, amount: number): Observable<{ rate: number; result: number; date: string }> {
    return this.getRates(base).pipe(
      map((data: any) => {
        const rate: number = data.conversion_rates[target];
        const result: number = rate * amount;
        const date: string = data.time_last_update_utc;
        return { rate, result, date };
      })
    );
  }

  getTimeSeries(
    base: string,
    target: string,
    startDate: string,
    endDate: string
  ): Observable<{ date: string; rate: number }[]> {
    const url = `${this.timeseriesBaseUrl}/timeseries?start_date=${startDate}&end_date=${endDate}&base=${base}&symbols=${target}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        const ratesObj = response.rates || {};
        const entries: { date: string; rate: number }[] = Object.keys(ratesObj)
          .map(dateStr => ({
            date: dateStr,
            rate: ratesObj[dateStr][target]
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        return entries;
      }),
      catchError(err => {
        console.error('Erro ao buscar timeseries:', err);
        return of([]);
      })
    );
  }
}
