import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { IRoles } from '../interface/roles';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/roles`;

  listarRoles(): Observable<{ lista_Rol: IRoles[] }> {
    return this.http.get<{ lista_Rol: IRoles[] }>(`${this.apiUrl}/listar`);
  }
}
