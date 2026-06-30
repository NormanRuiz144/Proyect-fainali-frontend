import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ILogin } from '../../../auth/interfaces/ilogin';
import { Problematica } from '../../../features/problematicas/interface/problematica';
import { ProblematicaService } from '../../../features/problematicas/service/problematica.service';
import { EstadoAdminService } from '../../../shared/service/estado-admin.service';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-configuracion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionAdmin implements OnInit {
  private problematicaService = inject(ProblematicaService);
  private estadoAdminService = inject(EstadoAdminService);
  private interactionService = inject(InteractionService);

  usuario = computed<ILogin | null>(() => this.estadoAdminService.usuarioLogueado());
  institucionNombre = signal('Institución no asignada');
  problematicasAsociadas = signal<Problematica[]>([]);
  problematicasDisponibles = signal<Problematica[]>([]);
  problematicaSeleccionada = signal<number | null>(null);
  cargando = signal(false);
  guardando = signal(false);
  sinInstitucion = computed(() => !this.usuario()?.idInstitucion);

  ngOnInit(): void {
    const institucion = this.usuario()?.institucion?.nombreInstitucion;
    if (institucion) {
      this.institucionNombre.set(institucion);
    }

    if (!this.sinInstitucion()) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      asociadas: this.problematicaService.listarProblematicasMiInstitucion(),
      disponibles: this.problematicaService.listarProblematicasDisponiblesMiInstitucion(),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ asociadas, disponibles }) => {
          this.institucionNombre.set(
            asociadas.institucion?.nombreInstitucion ||
              disponibles.institucion?.nombreInstitucion ||
              this.institucionNombre(),
          );
          this.problematicasAsociadas.set(
            (asociadas.lista_problematicas || [])
              .map((relacion) => relacion.problematica)
              .filter(Boolean),
          );
          this.problematicasDisponibles.set(disponibles.lista_problematicas || []);
          this.problematicasSeleccionadasLimpias();
        },
        error: (err) => {
          void this.interactionService.mostrarError(err);
        },
      });
  }

  agregarProblematica(): void {
    const idProblematica = this.problematicaSeleccionada();
    if (!idProblematica) {
      this.interactionService.showToast('Selecciona una problemática para asociar.', 'warning');
      return;
    }

    this.guardando.set(true);
    this.problematicasServiceAction(() =>
      this.problematicaService.asignarProblematicaMiInstitucion(idProblematica),
    );
  }

  async quitarProblematica(problematica: Problematica): Promise<void> {
    if (!problematica.id) return;

    const confirmado = await this.interactionService.confirmar(
      'Quitar problemática',
      `¿Deseas quitar "${problematica.problema}" de tu institución?`,
    );

    if (!confirmado) return;

    this.guardando.set(true);
    this.problematicasServiceAction(() =>
      this.problematicaService.eliminarProblematicaMiInstitucion(problematica.id!),
    );
  }

  private problematicasServiceAction(action: () => Observable<any>): void {
    const request = action();
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (res: any) => {
        this.interactionService.showToast(res?.mensaje || 'Configuración actualizada.', 'success');
        this.cargarDatos();
      },
      error: (err: any) => {
        void this.interactionService.mostrarError(err);
      },
    });
  }

  private problematicasSeleccionadasLimpias(): void {
    const seleccion = this.problematicaSeleccionada();
    const existe = this.problematicasDisponibles().some((problematica) => problematica.id === seleccion);
    if (!existe) {
      this.problematicaSeleccionada.set(null);
    }
  }
}
