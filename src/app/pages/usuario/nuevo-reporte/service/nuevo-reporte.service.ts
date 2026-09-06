import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class NuevoReporteService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/reportes/agregar';

  crearReporte(datos: FormData): Observable<any> {
    return this.http.post(this.url, datos);
  }

  obtenerHistorialUsuario(): Observable<any> {
    return this.http.get(environment.API_URL + '/reportes/historial');
  }

  obtenerInstituciones(): Observable<any> {
    return this.http.get(environment.API_URL + '/instituciones/listar/pagina');
  }

  obtenerProblematicas(): Observable<any> {
    return this.http.get(environment.API_URL + '/problematica/listar/pagina/');
  }

  obtenerSectores(): Observable<any> {
    return this.http.get(environment.API_URL + '/sectores/listar');
  }

  obtenerMunicipios(): Observable<any> {
    return this.http.get(environment.API_URL + '/municipios/listar/pagina');
  }

  obtenerProblematicasPorInstitucion(idInst: number): Observable<any> {
    return this.http.get(environment.API_URL + `/problematica/filtrar/${idInst}`);
  }
}
