import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { IDashboard } from '../interface/idashboard';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/dashboard';

  obtenerResumen(): Observable<IDashboard> {
    return this.http.get<any>(this.url).pipe(
      map((data) => ({
        kpis: {
          reportesActivos: data.kpis.incidenciasActivas,
          indiceResolucion: data.kpis.indiceResolucion,
          tiempoPromedioDias: data.kpis.tiempoPromedioDias,
          alertasAltaPrioridad: data.kpis.alertasAltaPrioridad,
        },
        porProblema: data.problemasFrecuentes,
        porSector: data.zonasActivas,
        institucion: { nombre: 'Comunica', cargaTrabajo: data.kpis.totalIncidencias },
        seguimiento: data.seguimientosRecientes,
      })),
    );
  }

  /** @deprecated Instituciones no existen en el modelo actual. */
  obtenerInstituciones(): Observable<{ lista_Instituciones: never[] }> {
    return of({ lista_Instituciones: [] });
  }
}
