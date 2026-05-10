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
    return this.http.get<IDashboard>(this.url);
  }
}
