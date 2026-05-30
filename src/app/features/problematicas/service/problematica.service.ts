import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';
import {
  ActualizarProblematicaResponse,
  CrearProblematicaResponse,
  ListarProblematicasResponse,
  Problematica,
} from '../interface/problematica';

@Injectable({
  providedIn: 'root',
})
export class ProblematicaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/problematica`;

  obtenerProblematicas(): Observable<ListarProblematicasResponse> {
    return this.http.get<ListarProblematicasResponse>(`${this.apiUrl}/listar`);
  }

  crearProblematica(problematica: Partial<Problematica>): Observable<CrearProblematicaResponse> {
    return this.http.post<CrearProblematicaResponse>(`${this.apiUrl}/agregar`, {
      problema: problematica.problema,
    });
  }

  actualizarProblematica(
    id: number,
    problematica: Partial<Problematica>,
  ): Observable<ActualizarProblematicaResponse> {
    return this.http.put<ActualizarProblematicaResponse>(`${this.apiUrl}/actu/${id}`, {
      problema: problematica.problema,
    });
  }
}
