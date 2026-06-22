import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class NuevoReporteService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/reportes/agregar';

  crearReporte(datos: FormData): Observable<any> {
    return this.http.post(this.url, datos);
  }

  obtenerInstituciones(): Observable<any> {
    return this.http.get(environment.API_URL + '/instituciones/listar');
  }

  obtenerProblematicas(): Observable<any> {
    return this.http.get(environment.API_URL + '/problematica/listar/pagina/null');
  }

  obtenerSectores(): Observable<any> {
    return this.http.get(environment.API_URL + '/sectores/listar');
  }

  obtenerMunicipios(): Observable<any> {
    return this.http.get(environment.API_URL + '/municipios/listar');
  }
}
