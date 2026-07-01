import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import {
  ActualizarInstitucionResponse,
  CrearInstitucionResponse,
  Institucion,
  ListarInstitucionesResponse,
  ListarInstitucionPagResponse,
} from '../interface/instituciones';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstitucionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/instituciones`;

  obtenerInstituciones(): Observable<ListarInstitucionesResponse> {
    return this.http.get<ListarInstitucionesResponse>(`${this.apiUrl}/listar/pagina`);
  }

  obtenerInstitucionesPag(pag: string): Observable<ListarInstitucionPagResponse> {
    return this.http.get<ListarInstitucionPagResponse>(`${this.apiUrl}/listar/pagina/?page=${pag}`);
  }

  crearInstitucion(
    idMunicipio: Number,
    institucion: Partial<Institucion>,
  ): Observable<CrearInstitucionResponse> {
    return this.http.post<CrearInstitucionResponse>(`${this.apiUrl}/agregar`, {
      idMunicipio: idMunicipio,
      nombreInstitucion: institucion.nombreInstitucion,
    });
  }

  actualizarInstitucion(
    id: number,
    institucion: Partial<Institucion>,
  ): Observable<ActualizarInstitucionResponse> {
    return this.http.put<ActualizarInstitucionResponse>(`${this.apiUrl}/actu/${id}`, {
      nombreInstitucion: institucion.nombreInstitucion,
      idMunicipio: institucion.idMunicipio,
    });
  }

  eliminarInstitucion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  restaurarInstitucion(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/restaurar/${id}`, {});
  }
}
