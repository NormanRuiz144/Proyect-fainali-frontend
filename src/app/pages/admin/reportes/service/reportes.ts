import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IRespuestaReportes } from '../interface/ireporte';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/incidencias';

  obtenerReportes(): Observable<IRespuestaReportes> {
    return this.http
      .get<any>(this.url)
      .pipe(map((res) => ({ lista_Reportes: res.lista_Incidencias?.data ?? [] }) as IRespuestaReportes));
  }

  actualizarEstadoReporte(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.url}/${id}/estado`, { estado });
  }
}
