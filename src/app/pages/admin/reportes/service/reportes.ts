import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IRespuestaReportes } from '../interface/ireporte';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/reportes';

  obtenerReportes(): Observable<IRespuestaReportes> {
    return this.http.get<IRespuestaReportes>(`${this.url}/listar`);
  }
  // obtenerReportes(idInstitucion: number): Observable<IRespuestaReportes> {
  //   return this.http.get<IRespuestaReportes>(`${this.url}/listarInst/${idInstitucion}`);
  // }
}
