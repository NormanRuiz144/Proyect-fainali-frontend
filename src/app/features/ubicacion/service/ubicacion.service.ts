import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';
import { Departamento, Municipio, Sector } from '../interface/ubicacion.interface';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  // --- Departamentos ---
  obtenerDepartamentos(): Observable<{ lista_Departamentos: Departamento[] }> {
    return this.http.get<{ lista_Departamentos: Departamento[] }>(
      `${this.apiUrl}/departamento/listar`,
    );
  }

  crearDepartamento(data: Partial<Departamento>): Observable<any> {
    return this.http.post(`${this.apiUrl}/departamento/agregar`, data);
  }

  actualizarDepartamento(id: number, data: Partial<Departamento>): Observable<any> {
    return this.http.put(`${this.apiUrl}/departamento/actu/${id}`, data);
  }

  eliminarDepartamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departamento/eliminar/${id}`);
  }

  restaurarDepartamento(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/departamento/restaurar/${id}`, {});
  }

  // --- Municipios ---
  obtenerMunicipios(): Observable<{ lista_Municipios: Municipio[] }> {
    return this.http.get<{ lista_Municipios: Municipio[] }>(`${this.apiUrl}/municipios/listar`);
  }

  municipiosPorDepartamento(idDepart: number): Observable<{ lista_Municipios: Municipio[] }> {
    return this.http.get<{ lista_Municipios: Municipio[] }>(
      `${this.apiUrl}/departamento/${idDepart}/municipios`,
    );
  }

  crearMunicipio(data: Partial<Municipio>): Observable<any> {
    return this.http.post(`${this.apiUrl}/municipios/agregar`, data);
  }

  actualizarMunicipio(id: number, data: Partial<Municipio>): Observable<any> {
    return this.http.put(`${this.apiUrl}/municipios/actu/${id}`, data);
  }

  eliminarMunicipio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/municipios/eliminar/${id}`);
  }

  restaurarMunicipio(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/municipios/restaurar/${id}`, {});
  }

  // --- Sectores ---
  obtenerSectores(): Observable<{ lista_Sectores: Sector[] }> {
    return this.http.get<{ lista_Sectores: Sector[] }>(`${this.apiUrl}/sectores/listar`);
  }

  sectoresPorMunicipio(idMuni: number): Observable<{ lista_Sectores: Sector[] }> {
    return this.http.get<{ lista_Sectores: Sector[] }>(
      `${this.apiUrl}/municipios/${idMuni}/sectores`,
    );
  }

  crearSector(data: Partial<Sector>): Observable<any> {
    return this.http.post(`${this.apiUrl}/sectores/agregar`, data);
  }

  actualizarSector(id: number, data: Partial<Sector>): Observable<any> {
    return this.http.put(`${this.apiUrl}/sectores/actu/${id}`, data);
  }

  eliminarSector(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sectores/eliminar/${id}`);
  }

  restaurarSector(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sectores/restaurar/${id}`, {});
  }
}
