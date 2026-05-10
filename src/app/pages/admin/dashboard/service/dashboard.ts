import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDashboard } from '../interface/idashboard';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/dashboard/load';

  obtenerResumen(): Observable<IDashboard> {
    // descomentar cuando el login ya este
    // return this.http.get<IDashboard>(this.url);

    // datos de prueba
    const mockData: IDashboard = {
      kpis: {
        reportesActivos: 15,
        indiceResolucion: 85,
        tiempoPromedioDias: 1,
        alertasAltaPrioridad: 3
      },
      porProblema: [
        { problema: 'Fuga de Agua', total: 8 },
        { problema: 'Alumbrado Público', total: 4 },
        { problema: 'Bache en la Calle', total: 2 },
        { problema: 'Acumulación de Basura', total: 1 }
      ],
      porSector: [
        { sector: 'Barrio San Francisco', total: 6 },
        { sector: 'Barrio La Puebla', total: 5 },
        { sector: 'Popoyuapa', total: 4 }
      ],
      seguimiento: [
        { descripcion: 'Fuga reparada frente a escuela', fecha: new Date().toISOString() },
        { descripcion: 'Poste reportado caído', fecha: new Date(Date.now() - 3600000).toISOString() },
        { descripcion: 'Bache enorme cerca de la iglesia', fecha: new Date(Date.now() - 86400000).toISOString() }
      ],
      institucion: {
        nombre: 'Alcaldía de Rivas',
        cargaTrabajo: 15
      }
    };

    return of(mockData).pipe(delay(600));
  }
}
