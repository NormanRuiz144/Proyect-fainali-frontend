import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { expand, map, Observable, reduce, takeWhile } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IReporteMapaFiltros, IReporteMapaResponse } from '../interface/ireporte-mapa';

@Injectable({
  providedIn: 'root',
})
export class MapaReportesService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/incidencias`;

  obtenerReportesMapa(filtros: IReporteMapaFiltros): Observable<IReporteMapaResponse> {
    let params = new HttpParams().set('page', '1');
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.idProblematica) params = params.set('idProblematica', filtros.idProblematica);

    return this.http.get<any>(this.url, { params }).pipe(
      expand((respuesta) => {
        const meta = respuesta.lista_Incidencias?.meta;
        return meta && meta.currentPage < meta.lastPage
          ? this.http.get<any>(this.url, { params: params.set('page', String(meta.currentPage + 1)) })
          : [];
      }),
      reduce((acumulado: any[], respuesta) => acumulado.concat(respuesta.lista_Incidencias?.data ?? []), []),
      map((incidencias) => {
        const data = incidencias
          .map((incidencia) => this.aReporteMapa(incidencia))
          .filter((incidencia): incidencia is IReporteMapaResponse['data'][number] => incidencia !== null);
        return { total: incidencias.length, totalConUbicacion: data.length, totalSinUbicacion: incidencias.length - data.length, data };
      }),
    );
  }

  private aReporteMapa(incidencia: any): IReporteMapaResponse['data'][number] | null {
    const match = String(incidencia.ubicacion ?? '').match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);
    if (!match) return null;
    return {
      id: incidencia.id, estado: incidencia.estado, nvl_prioridad: incidencia.nvlPrioridad,
      fecha_gen: incidencia.fechaGen, descripcion: incidencia.descripcion, lat: Number(match[1]), lng: Number(match[2]),
      institucion: null,
      problematica: incidencia.problematica ? { id: incidencia.problematica.id, problema: incidencia.problematica.problematica } : null,
    };
  }
}
