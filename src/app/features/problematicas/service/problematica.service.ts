import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import {
  ActualizarProblematicaResponse,
  CrearProblematicaResponse,
  ListarProblematicasPagResponse,
  ListarProblematicasResponse,
  Problematica,
} from '../interface/problematica';

@Injectable({
  providedIn: 'root',
})
export class ProblematicaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/problematicas`;

  obtenerProblematicas(): Observable<ListarProblematicasResponse> {
    return this.http.get<ListarProblematicasResponse>(this.apiUrl);
  }

  obtenerProblematicasPag(pag: string): Observable<ListarProblematicasPagResponse> {
    return this.http.get<ListarProblematicasPagResponse>(
      `${this.apiUrl}?page=${pag}`,
    );
  }

  crearProblematica(problematica: Partial<Problematica>): Observable<CrearProblematicaResponse> {
    return this.http.post<CrearProblematicaResponse>(this.apiUrl, {
      problematica: problematica.problema,
    });
  }

  actualizarProblematica(
    id: number,
    problematica: Partial<Problematica>,
  ): Observable<ActualizarProblematicaResponse> {
    return this.http.put<ActualizarProblematicaResponse>(`${this.apiUrl}/${id}`, {
      problematica: problematica.problema,
    });
  }

  eliminarProblematica(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  restaurarProblematica(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/restaurar`, {});
  }

}
