import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IRespuestaReportes } from '../interface/ireporte';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private url = environment.API_URL + '/reportes/listar';

  obtenerReportes(): Observable<IRespuestaReportes> {
    // descomentar cuando el login ya este
    // return this.http.get<IRespuestaReportes>(this.url);

    // datos de prueba
    const mockData: IRespuestaReportes = {
      lista_Reportes: [
        {
          id: 101,
          descripcion: 'Fuga de agua masiva en la calle principal, el agua llega hasta la acera.',
          estado: 'Pendiente',
          nvlPrioridad: 10,
          fechaGen: new Date(Date.now() - 3600000).toISOString(),
          formato: null,
          problematica: { problema: 'Falta de Agua / Fuga' },
          usuario: { nombres: 'Juan', apellidos: 'Pérez' }
        },
        {
          id: 102,
          descripcion: 'Poste de luz caído bloqueando el paso vehicular.',
          estado: 'En Proceso',
          nvlPrioridad: 10,
          fechaGen: new Date(Date.now() - 86400000).toISOString(),
          formato: null,
          problematica: { problema: 'Alumbrado Público' },
          usuario: { nombres: 'María', apellidos: 'López' }
        },
        {
          id: 103,
          descripcion: 'Bache profundo causando daños a los vehículos.',
          estado: 'Finalizado',
          nvlPrioridad: 5,
          fechaGen: new Date(Date.now() - 172800000).toISOString(),
          formato: null,
          problematica: { problema: 'Baches en calles' },
          usuario: { nombres: 'Carlos', apellidos: 'García' }
        },
        {
          id: 104,
          descripcion: 'Vecinos con música a alto volumen a las 3 AM.',
          estado: 'Pendiente',
          nvlPrioridad: 3,
          fechaGen: new Date(Date.now() - 500000).toISOString(),
          formato: null,
          problematica: { problema: 'Ruido nocturno' },
          usuario: { nombres: 'Ana', apellidos: 'Martínez' }
        }
      ]
    };

    return of(mockData).pipe(delay(600));
  }
}
