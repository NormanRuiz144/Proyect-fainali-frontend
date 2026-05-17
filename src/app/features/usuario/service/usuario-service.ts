import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IRegistro } from '../interface/ireguistro';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { AuthResponse } from '../../../auth/interfaces/auth-response';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private http = inject(HttpClient);
  private baseUrl = environment.API_URL.replace('/api', '');

  registrarUsuario(usuario: IRegistro): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/registro`, usuario);
  }
}
