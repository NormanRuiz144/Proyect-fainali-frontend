import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import { Departamento, Municipio, Sector } from '../interface/ubicacion.interface';
import { ListarDepartamentoPagResponse } from '../interface/idepartamento';
import { ListarSectorPagResponse } from '../interface/isector';
import { ListarMunicipioPagResponse } from '../interface/imunicipio';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  // --- Departamentos ---
  obtenerDepartamentos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departamentos`);
  }
  obtenerDepartamentosPag(pag: string): Observable<ListarDepartamentoPagResponse> {
    return this.http.get<ListarDepartamentoPagResponse>(
      `${this.apiUrl}/departamentos?page=${pag}`,
    );
  }

  crearDepartamento(data: Partial<Departamento>): Observable<any> {
    return this.http.post(`${this.apiUrl}/departamentos`, data);
  }

  actualizarDepartamento(id: number, data: Partial<Departamento>): Observable<any> {
    return this.http.put(`${this.apiUrl}/departamentos/${id}`, data);
  }

  eliminarDepartamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departamentos/${id}`);
  }

  restaurarDepartamento(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/departamentos/${id}/restaurar`, {});
  }

  // --- Municipios ---
  obtenerMunicipios(): Observable<{ lista_Municipios: Municipio[] }> {
    return this.http.get<{ lista_Municipios: Municipio[] }>(
      `${this.apiUrl}/municipios`,
    );
  }
  obtenerMunicipiosPag(pag: string): Observable<ListarMunicipioPagResponse> {
    return this.http.get<ListarMunicipioPagResponse>(
      `${this.apiUrl}/municipios?page=${pag}`,
    );
  }

  municipiosPorDepartamento(idDepart: number): Observable<{ lista_Municipios: Municipio[] }> {
    return this.http.get<{ lista_Municipios: Municipio[] }>(
      `${this.apiUrl}/departamentos/${idDepart}/municipios`,
    );
  }

  crearMunicipio(data: Partial<Municipio>): Observable<any> {
    return this.http.post(`${this.apiUrl}/municipios`, data);
  }

  actualizarMunicipio(id: number, data: Partial<Municipio>): Observable<any> {
    return this.http.put(`${this.apiUrl}/municipios/${id}`, data);
  }

  eliminarMunicipio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/municipios/${id}`);
  }

  restaurarMunicipio(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/municipios/${id}/restaurar`, {});
  }

  // --- Sectores ---
  obtenerSectores(): Observable<{ lista_Sectores: Sector[] }> {
    return this.http.get<{ lista_Sectores: Sector[] }>(`${this.apiUrl}/sectores`);
  }
  obtenerSectoresPag(pag: string): Observable<ListarSectorPagResponse> {
    return this.http.get<ListarSectorPagResponse>(
      `${this.apiUrl}/sectores?page=${pag}`,
    );
  }

  sectoresPorMunicipio(idMuni: number): Observable<{ lista_Sectores: Sector[] }> {
    return this.http.get<{ lista_Sectores: Sector[] }>(
      `${this.apiUrl}/sectores?idMunicipio=${idMuni}`,
    );
  }

  crearSector(data: Partial<Sector>): Observable<any> {
    return this.http.post(`${this.apiUrl}/sectores`, data);
  }

  actualizarSector(id: number, data: Partial<Sector>): Observable<any> {
    return this.http.put(`${this.apiUrl}/sectores/${id}`, data);
  }

  eliminarSector(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sectores/${id}`);
  }

  restaurarSector(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sectores/${id}/restaurar`, {});
  }
}
