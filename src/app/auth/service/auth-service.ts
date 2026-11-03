import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ILogin } from '../interfaces/ilogin';
import { map, Observable, tap } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';

type ProfileResponse = ILogin | { data: ILogin };
type SessionResponse = AuthResponse | { user: ILogin; token: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/auth`;
  private profileUrl = `${environment.API_URL}/account/profile`;
  private usuario = signal<ILogin | null>(
    (() => {
      try {
        const v = localStorage.getItem('usuario');
        return v ? AuthService.normalizarUsuario(JSON.parse(v)) : null;
      } catch {
        return null;
      }
    })(),
  );
  private token = signal<string | null>(localStorage.getItem('token') || null);

  public usuarioActual = computed(() => this.usuario());
  public estaAutenticado = computed(() => this.token() !== null);
  public esOperador = computed(() => this.usuario()?.operador !== null && this.usuario()?.operador !== undefined);
  public permisos = computed(() => this.usuario()?.permisos ?? []);

  iniciarSesion(correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, { correo, password })
      .pipe(tap((res) => this.establecerSesion(res)));
  }

  establecerSesion(res: SessionResponse): boolean {
    const sesion = 'data' in res ? res.data : res;
    if (!sesion?.user || !sesion.token) return false;

    const usuarioNormalizado = AuthService.normalizarUsuario(sesion.user);
    this.usuario.set(usuarioNormalizado);
    this.token.set(sesion.token);
    localStorage.setItem('token', sesion.token);
    localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
    return true;
  }

  sincronizarUsuario(usuario: ILogin): void {
    const usuarioNormalizado = AuthService.normalizarUsuario(usuario);
    this.usuario.set(usuarioNormalizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
  }

  obtenerPerfilActual(): Observable<ILogin> {
    return this.http.get<ProfileResponse>(this.profileUrl).pipe(
      map((res) => AuthService.normalizarUsuario(res)),
      tap((usuario) => this.sincronizarUsuario(usuario)),
    );
  }

  tienePermiso(permiso: string): boolean {
    return this.permisos().includes(permiso);
  }

  tieneAlgunoDe(permisos: string[]): boolean {
    return permisos.some((permiso) => this.tienePermiso(permiso));
  }

  private static normalizarUsuario(res: ProfileResponse | any): ILogin {
    if (res?.data) return res.data;
    return res;
  }

  /** Limpia la sesión local. El cierre remoto se incorporará donde se confirme la UX global. */
  logout(): void {
    this.usuario.set(null);
    this.token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  obtenerToken(): string | null {
    return this.token();
  }
}
