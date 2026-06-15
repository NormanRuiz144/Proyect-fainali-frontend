import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';
import {
  ActualizarProblematicaResponse,
  cargarInstitucionesAsociadasResponse,
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

  eliminarProblematica(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  restaurarProblematica(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/restaurar/${id}`, {});
  }

  // Cargar las problematicas asociadas a una institucion
  cargarProblematicasInstitucion(problematicaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/filtrar/${problematicaId}`);
  }
  // Cargar instituciones asociadas a una problematica
  cargarInstitucionesAsociadas(
    problematicaId: number,
  ): Observable<cargarInstitucionesAsociadasResponse> {
    return this.http.get<cargarInstitucionesAsociadasResponse>(
      `${this.apiUrl}/listar-instituciones-asociadas/${problematicaId}`,
    );
  }
  // Asignar problematica con Instituciones
  asignarProblematicaAInstitucion(problematicaId: number, institucionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar`, {
      idProblematica: problematicaId,
      idInstitucion: institucionId,
    });
  }

  desasignarProblematicaDeInstitucion(
    problematicaId: number,
    institucionId: number,
  ): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar-asociacion`, {
      body: { idProblematica: problematicaId, idInstitucion: institucionId },
    });
  }
}
