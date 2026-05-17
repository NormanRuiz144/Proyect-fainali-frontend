import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { DepartamentoResponse, IDepartamento } from '../interface/idepartamento';
import { IMunicipio, MunicipioResponse } from '../interface/imunicipio';
import { ISector, SectorResponse } from '../interface/isector';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_URL.replace('/api', '');

  obtenerDepartamentos(): Observable<IDepartamento[]> {
    return this.http
      .get<DepartamentoResponse>(`${this.baseUrl}/departamento/listar`)
      .pipe(map((res) => res.lista_Departamentos));
  }

  obtenerMunicipiosPorDepartamento(idDepartamento: number): Observable<IMunicipio[]> {
    return this.http
      .get<MunicipioResponse>(`${this.baseUrl}/departamento/${idDepartamento}/municipios`)
      .pipe(map((res) => res.lista_Municipios));
  }

  obtenerSectoresPorMunicipio(idMunicipio: number): Observable<ISector[]> {
    return this.http
      .get<SectorResponse>(`${this.baseUrl}/municipios/${idMunicipio}/sectores`)
      .pipe(map((res) => res.lista_Sectores));
  }
}
