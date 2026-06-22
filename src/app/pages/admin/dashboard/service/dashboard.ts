import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDashboard } from '../interface/idashboard';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/dashboard/load';

  obtenerResumen(institucionId?: number | null): Observable<IDashboard> {
    let queryUrl = this.url;
    if (institucionId !== undefined) {
      // Si institucionId es null o 0, enviamos 0 que el backend interpreta como "Todas"
      const val = institucionId === null ? 0 : institucionId;
      queryUrl += `?institucionId=${val}`;
    }
    return this.http.get<IDashboard>(queryUrl);
  }

  obtenerInstituciones(): Observable<any> {
    return this.http.get<any>(environment.API_URL + '/instituciones/listar/pagina');
  }
}
