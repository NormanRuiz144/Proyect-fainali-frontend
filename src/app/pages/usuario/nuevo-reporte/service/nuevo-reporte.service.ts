import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class NuevoReporteService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/incidencias';

  crearReporte(datos: FormData): Observable<any> {
    return this.http.post(this.url, datos);
  }

  obtenerHistorialUsuario(): Observable<any> {
    return this.http.get(environment.API_URL + '/incidencias/historial');
  }

  obtenerInstituciones(): Observable<any> {
    return this.http.get(environment.API_URL + '/public/problematicas');
  }

  obtenerProblematicas(): Observable<any> {
    return this.http.get(environment.API_URL + '/public/problematicas');
  }

  obtenerSectores(): Observable<any> {
    return this.http.get(environment.API_URL + '/public/sectores');
  }

  obtenerMunicipios(): Observable<any> {
    return this.http.get(environment.API_URL + '/public/departamentos');
  }

  obtenerProblematicasPorInstitucion(idInst: number): Observable<any> {
    return this.http.get(environment.API_URL + '/public/problematicas');
  }
}
