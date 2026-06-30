import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IRegistro } from '../interface/ireguistro';
import {
  IBajaUsuarioResponse,
  IListarUsuariosPagResponse,
  IListarUsuariosResponse,
  IOperacionUsuarioResponse,
  IUsuario,
} from '../interface/iusuario';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { AuthResponse } from '../../../auth/interfaces/auth-response';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_URL.replace('/api', '');
  private apiUrl = `${environment.API_URL}/usuarios`;

  registrarUsuario(usuario: IRegistro): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/public/registro`, usuario);
  }

  obtenerRoles(): Observable<{ lista_Rol: { id: number; rol: string }[] }> {
    return this.http.get<{ lista_Rol: { id: number; rol: string }[] }>(
      `${environment.API_URL}/roles/listar`,
    );
  }

  obtenerUsuarios(pag: string): Observable<IListarUsuariosPagResponse> {
    return this.http.get<IListarUsuariosPagResponse>(`${this.apiUrl}/listar/pagina/?page=${pag}`);
  }

  crearUsuario(
    usuario: Partial<IUsuario> & { contrasena?: string },
  ): Observable<IOperacionUsuarioResponse> {
    return this.http.post<IOperacionUsuarioResponse>(`${this.apiUrl}/crear`, usuario);
  }

  obtenerUsuario(id: number): Observable<IOperacionUsuarioResponse> {
    return this.http.get<IOperacionUsuarioResponse>(`${this.apiUrl}/obtener/${id}`);
  }

  actualizarUsuario(id: number, usuario: Partial<IUsuario>): Observable<IOperacionUsuarioResponse> {
    return this.http.put<IOperacionUsuarioResponse>(`${this.apiUrl}/actualizar/${id}`, usuario);
  }

  reasignarUsuario(
    id: number,
    data: { idRol: number; idInstitucion: number },
  ): Observable<IOperacionUsuarioResponse> {
    return this.http.put<IOperacionUsuarioResponse>(`${this.apiUrl}/reasignar/${id}`, data);
  }

  bajaUsuario(id: number, idInstitucion: number): Observable<IBajaUsuarioResponse> {
    return this.http.put<IBajaUsuarioResponse>(`${this.apiUrl}/bajaInst/${id}`, { idInstitucion });
  }
}
