import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ISuperAdminDashboard } from '../interface/isuper-admin-dashboard';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminDashboardService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/dashboard/super-admin`;

  obtenerResumen(): Observable<ISuperAdminDashboard> {
    return this.http.get<ISuperAdminDashboard>(this.url);
  }
}
