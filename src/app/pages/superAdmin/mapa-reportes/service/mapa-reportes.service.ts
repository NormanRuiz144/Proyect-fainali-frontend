import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IReporteMapaFiltros, IReporteMapaResponse } from '../interface/ireporte-mapa';

@Injectable({
  providedIn: 'root',
})
export class MapaReportesService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/reportes/mapa`;

  obtenerReportesMapa(filtros: IReporteMapaFiltros): Observable<IReporteMapaResponse> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<IReporteMapaResponse>(this.url, { params });
  }
}
