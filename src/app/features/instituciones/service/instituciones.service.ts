import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import {
  ActualizarInstitucionResponse,
  CrearInstitucionResponse,
  Institucion,
  ListarInstitucionesResponse,
} from '../interface/instituciones';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstitucionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/instituciones`;

  obtenerInstituciones(): Observable<ListarInstitucionesResponse> {
    return this.http.get<ListarInstitucionesResponse>(`${this.apiUrl}/listar`);
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
}
