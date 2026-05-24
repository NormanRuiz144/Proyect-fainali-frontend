import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProblematicaService } from '../service/problematica.service';
import { Problematica } from '../interface/problematica';

@Component({
  selector: 'app-problematicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problematicas.html',
  styleUrl: './problematicas.css',
})
export class ProblematicasComponent implements OnInit {
  private problematicaService = inject(ProblematicaService);

  problematicas = signal<Problematica[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Modal State
  mostrarModal = signal(false);
  modalModo = signal<'crear' | 'editar'>('crear');

  // Form State
  problematicaActual = signal<Partial<Problematica>>({ problema: '' });

  ngOnInit() {
    this.cargarProblematicas();
  }

  cargarProblematicas() {
    this.cargando.set(true);
    this.problematicaService.obtenerProblematicas().subscribe({
      next: (res) => {
        if (res.lista_Problematicas) {
          this.problematicas.set(res.lista_Problematicas);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando problemáticas', err);
        this.error.set('No se pudieron cargar las problemáticas.');
        this.cargando.set(false);
      },
    });
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

  cerrarModal() {
    this.mostrarModal.set(false);
    this.problematicaActual.set({ problema: '' });
  }

  guardarProblematica() {
    if (!this.problematicaActual().problema?.trim()) {
      alert('El nombre del problema es requerido');
      return;
    }

    const problematica = this.problematicaActual();
    this.cargando.set(true);

    if (this.modalModo() === 'crear') {
      this.problematicaService.crearProblematica(problematica).subscribe({
        next: () => {
          this.cargarProblematicas();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear la problemática');
          this.cargando.set(false);
        },
      });
    } else {
      if (problematica.id) {
        this.problematicaService.actualizarProblematica(problematica.id, problematica).subscribe({
          next: () => {
            this.cargarProblematicas();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al actualizar la problemática');
            this.cargando.set(false);
          },
        });
      }
    }
  }
}
