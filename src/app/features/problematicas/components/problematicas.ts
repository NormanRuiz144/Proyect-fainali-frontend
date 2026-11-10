import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProblematicaService } from '../service/problematica.service';
import { PaginationMeta, Problematica } from '../interface/problematica';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-problematicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problematicas.html',
  styleUrl: './problematicas.css',
})
export class ProblematicasComponent implements OnInit {
  private problematicaService = inject(ProblematicaService);
  private interactionService = inject(InteractionService);

  problematicas = signal<Problematica[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Modal State Principal
  mostrarModal = signal(false);
  modalModo = signal<'crear' | 'editar' | 'eliminar' | 'restaurar'>('crear');
  itemAProcesar = signal<any>(null);

  // Form State
  problematicaActual = signal<Partial<Problematica>>({ problema: '' });

  mostrarInhabilitados = signal(false);

  // Signals para interactuar con las paginas
  paginaActual = signal<number>(1);
  paginacion = signal<PaginationMeta | null>(null);
  paginas = computed(() => {
    const meta = this.paginacion();
    if (!meta) return [];
    const paginas: number[] = [];
    const rango = 2;
    const inicio = Math.max(meta.firstPage, meta.currentPage - rango);
    const fin = Math.min(meta.lastPage, meta.currentPage + rango);
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  });

  ngOnInit() {
    this.cargarProblematicas(this.paginaActual());
  }

  cargarProblematicas(pag: number) {
    this.cargando.set(true);
    this.problematicaService.obtenerProblematicasPag(String(pag)).subscribe({
      next: (res) => {
        const lista = (res as any).listaProblematicas ?? (res as any).lista_Problematicas;
        if (lista) {
          this.problematicas.set(
            lista.data
              .map((problematica: any) => ({
                ...problematica,
                problema: problematica.problematica ?? problematica.problema,
              }))
              .filter((problematica: Problematica) =>
                problematica.isDeleted === this.mostrarInhabilitados(),
              ),
          );
          this.paginacion.set(lista.meta);
          this.paginaActual.set(lista.meta.currentPage);
        }

        this.error.set(null);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando problemáticas', err);
        this.error.set('No se pudieron cargar las problemáticas.');
        this.cargando.set(false);
      },
    });
  }

  irPagina(pag: number) {
    if (pag < 1 || pag > (this.paginacion()?.lastPage ?? 1) || pag === this.paginaActual()) return;
    this.cargarProblematicas(pag);
  }

  abrirModalCrear() {
    this.modalModo.set('crear');
    this.problematicaActual.set({ problema: '' });
    this.mostrarModal.set(true);
  }

  abrirModalEditar(problematica: Problematica) {
    this.modalModo.set('editar');
    this.problematicaActual.set({ ...problematica });
    this.mostrarModal.set(true);
  }

  abrirModalEliminar(problematica: Problematica) {
    this.modalModo.set('eliminar');
    this.itemAProcesar.set(problematica);
    this.mostrarModal.set(true);
  }

  abrirModalRestaurar(problematica: Problematica) {
    this.modalModo.set('restaurar');
    this.itemAProcesar.set(problematica);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.problematicaActual.set({ problema: '' });
  }

  guardarProblematica() {
    if (this.modalModo() === 'eliminar' || this.modalModo() === 'restaurar') {
      const id = this.itemAProcesar()?.id;
      if (!id) return;
      this.cargando.set(true);

      if (this.modalModo() === 'eliminar') {
        this.problematicaService.eliminarProblematica(id).subscribe({
          next: () => {
            this.cargarProblematicas(this.paginaActual());
            this.cerrarModal();
            this.interactionService.showToast('Problemática eliminada correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      } else {
        this.problematicaService.restaurarProblematica(id).subscribe({
          next: () => {
            this.cargarProblematicas(this.paginaActual());
            this.cerrarModal();
            this.interactionService.showToast('Problemática restaurada correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      }
      return;
    }

    if (!this.problematicaActual().problema?.trim()) {
      this.interactionService.showToast('El nombre del problema es requerido', 'warning');
      return;
    }

    const problematica = this.problematicaActual();
    this.cargando.set(true);

    if (this.modalModo() === 'crear') {
      this.problematicaService.crearProblematica(problematica).subscribe({
        next: () => {
          this.cargarProblematicas(this.paginaActual());
          this.cerrarModal();
          this.interactionService.showToast('Problemática creada correctamente', 'success');
        },
        error: (err) => {
          console.error(err);
          this.interactionService.mostrarError(err);
          this.cargando.set(false);
        },
      });
    } else {
      if (problematica.id) {
        this.problematicaService.actualizarProblematica(problematica.id, problematica).subscribe({
          next: () => {
            this.cargarProblematicas(this.paginaActual());
            this.cerrarModal();
            this.interactionService.showToast('Problemática actualizada correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      }
    }
  }

  cambiarFiltroInhabilitados() {
    this.mostrarInhabilitados.set(!this.mostrarInhabilitados());
    this.cargarProblematicas(this.paginaActual());
  }
}
