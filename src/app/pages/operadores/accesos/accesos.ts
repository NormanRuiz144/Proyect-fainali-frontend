import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { AuthService } from '../../../auth/service/auth-service';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accesos.html',
  styleUrl: './accesos.css',
})
export class AccesosComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private interaction = inject(InteractionService);
  operadores = signal<any[]>([]);
  permisos = signal<any[]>([]);
  asignaciones = signal<any[]>([]);
  idOperador = signal<number | null>(null);
  idPermiso = signal<number | null>(null);
  cargando = signal(true);
  private api = environment.API_URL;

  ngOnInit() { this.cargar(); }
  cargar() {
    this.cargando.set(true);
    if (this.auth.tienePermiso('operadores.ver')) this.http.get<any>(`${this.api}/operadores`).subscribe({ next: (r) => this.operadores.set(r.listaOperadores?.data ?? []), error: (e) => this.interaction.mostrarError(e) });
    if (this.auth.tienePermiso('permisos.ver')) this.http.get<any>(`${this.api}/permisos`).subscribe({ next: (r) => this.permisos.set(r.listaPermisos?.data ?? []), error: (e) => this.interaction.mostrarError(e) });
    if (this.auth.tienePermiso('permisos.administrar')) this.http.get<any>(`${this.api}/operador-permisos`).subscribe({ next: (r) => { this.asignaciones.set(r.listaAsignaciones?.data ?? []); this.cargando.set(false); }, error: (e) => { this.cargando.set(false); this.interaction.mostrarError(e); } }); else this.cargando.set(false);
  }
  asignar() {
    const idOperador = this.idOperador(); const idPermiso = this.idPermiso();
    if (!idOperador || !idPermiso) return;
    this.http.post<any>(`${this.api}/operador-permisos`, { idOperador, idPermiso, activo: true }).subscribe({ next: () => { this.interaction.showToast('Permiso asignado.', 'success'); this.cargar(); }, error: (e) => this.interaction.mostrarError(e) });
  }
  cambiarEstado(asignacion: any) { this.http.put(`${this.api}/operador-permisos/${asignacion.id}`, { activo: !asignacion.activo }).subscribe({ next: () => this.cargar(), error: (e) => this.interaction.mostrarError(e) }); }
}
