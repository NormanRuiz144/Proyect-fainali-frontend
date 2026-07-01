import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ILogin } from '../interfaces/ilogin';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  // private url = `${environment.API_URL.replace('/api', '')}/auth`
  private url = `${environment.API_URL}/auth`;
  private usuario = signal<ILogin | null>(
    (() => {
      try {
        const v = localStorage.getItem('usuario');
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    })(),
  );
  //Recuperar el token
  private token = signal<string | null>(localStorage.getItem('token') || null);

  // Crear una señal solo lectura para que otros componentes sepan si el usuario esta autorizado o no//

  public usuarioActual = computed(() => this.usuario());
  public estaAutenticado = computed(() => this.token());
  public rolUsuario = computed(() => this.usuario()?.rol.rol || null);

  // Iniciar sesión
  iniciarSesion(email: string, contrasena: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, { correo: email, contrasena })
      .pipe(tap((res) => this.establecerSesion(res)));
  }

  //Guardar los datos en signal y localStorage

  establecerSesion(res: AuthResponse): void {
    if (!res?.data) return;
    this.usuario.set(res.data.user);
    this.token.set(res.data.token);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.user));
  }

  //borrar los datos de sesion

  // Borrar los datos de sesión
  logout(): void {
    this.usuario.set(null);
    this.token.set(null);
    localStorage.clear();
  }

  // Retornar el token actual para usarlo
  obtenerToken(): string | null {
    return this.token();
  }
}
