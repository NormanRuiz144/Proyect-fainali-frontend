import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProblematicaService } from '../service/problematica.service';
import { Problematica } from '../interface/problematica';
import { Institucion } from '../../instituciones/interface/instituciones';
import { InstitucionesService } from '../../instituciones/service/instituciones.service';
import { Departamento, Municipio } from '../../ubicacion/interface/ubicacion.interface';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';

@Component({
  selector: 'app-problematicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problematicas.html',
  styleUrl: './problematicas.css',
})
export class ProblematicasComponent implements OnInit {
  private problematicaService = inject(ProblematicaService);
  private institucionService = inject(InstitucionesService);
  private ubicacionService = inject(UbicacionService);

  problematicas = signal<Problematica[]>([]);
  institucionesAsociadas = signal<Institucion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Modal State Principal
  mostrarModal = signal(false);
  modalModo = signal<'crear' | 'editar' | 'eliminar' | 'restaurar'>('crear');
  itemAProcesar = signal<any>(null);

  // Form State
  problematicaActual = signal<Partial<Problematica>>({ problema: '' });

  // Modal Instituciones State
  mostrarModalInstituciones = signal(false);
  mostrarInhabilitados = signal(false);

  problematicaActiva = signal<Problematica | null>(null);
  cargandoAsignacion = signal(false);

  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  institucionesTotales = signal<Institucion[]>([]);

  filtroDepartamento = signal<number | undefined>(undefined);
  filtroMunicipio = signal<number | undefined>(undefined);
  institucionSeleccionada = signal<number | undefined>(undefined);

  municipiosFiltrados = computed(() => {
    const depId = Number(this.filtroDepartamento());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  institucionesFiltradas = computed(() => {
    const munId = Number(this.filtroMunicipio());
    if (!munId || isNaN(munId)) return [];
    return this.institucionesTotales().filter((i) => i.idMunicipio == munId);
  });

  ngOnInit() {
    this.cargarProblematicas();
  }

  cargarProblematicas() {
    this.cargando.set(true);
    this.problematicaService.obtenerProblematicas().subscribe({
      next: (res) => {
        if (res.lista_Problematicas) {
          this.problematicas.set(
            res.lista_Problematicas.filter((p) => p.isDeleted == this.mostrarInhabilitados()),
          );
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
            this.cargarProblematicas();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al eliminar la problemática');
            this.cargando.set(false);
          },
        });
      } else {
        this.problematicaService.restaurarProblematica(id).subscribe({
          next: () => {
            this.cargarProblematicas();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al restaurar la problemática');
            this.cargando.set(false);
          },
        });
      }
      return;
    }

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

  filtarProblematicaByInst(institucionId: number) {}

  // ==========================================
  // Lógica de Asignación de Instituciones
  // ==========================================

  cargarDatosUbicacion() {
    if (this.departamentos().length === 0) {
      this.ubicacionService.obtenerDepartamentos().subscribe({
        next: (res) => this.departamentos.set(res.lista_Departamentos || []),
      });
    }
    if (this.municipios().length === 0) {
      this.ubicacionService.obtenerMunicipios().subscribe({
        next: (res) => this.municipios.set(res.lista_Municipios || []),
      });
    }
    if (this.institucionesTotales().length === 0) {
      this.institucionService.obtenerInstituciones().subscribe({
        next: (res) => this.institucionesTotales.set(res.lista_Instituciones || []),
      });
    }
  }

  abrirModalInstituciones(problematica: Problematica) {
    this.problematicaActiva.set(problematica);
    this.mostrarModalInstituciones.set(true);

    this.filtroDepartamento.set(undefined);
    this.filtroMunicipio.set(undefined);
    this.institucionSeleccionada.set(undefined);
    this.institucionesAsociadas.set([]);

    this.cargarDatosUbicacion();

    if (problematica.id) {
      this.cargarInstitucionesAsociadas(problematica.id);
    }
  }

  cerrarModalInstituciones() {
    this.mostrarModalInstituciones.set(false);
    this.problematicaActiva.set(null);
  }

  cargarInstitucionesAsociadas(idProblematica: number) {
    this.cargandoAsignacion.set(true);
    this.problematicaService.cargarInstitucionesAsociadas(idProblematica).subscribe({
      next: (res) => {
        const lista = res.lista_instituciones.map((item: any) => item.institucion) as Institucion[];
        this.institucionesAsociadas.set(Array.isArray(lista) ? lista : []);
        this.cargandoAsignacion.set(false);
      },
      error: (err) => {
        console.error('Error al cargar instituciones asociadas', err);
        this.institucionesAsociadas.set([]);
        this.cargandoAsignacion.set(false);
      },
    });
  }

  asignarInstitucion() {
    const idProb = this.problematicaActiva()?.id;
    const idInst = Number(this.institucionSeleccionada());

    if (!idProb || !idInst || isNaN(idInst)) {
      alert('Seleccione una institución válida');
      return;
    }

    this.cargandoAsignacion.set(true);
    this.problematicaService.asignarProblematicaAInstitucion(idProb, idInst).subscribe({
      next: () => {
        this.cargarInstitucionesAsociadas(idProb);
        this.institucionSeleccionada.set(undefined);
      },
      error: (err) => {
        console.error(err);
        alert('Error al asignar institución. Puede que ya esté asignada.');
        this.cargandoAsignacion.set(false);
      },
    });
  }

  desasignarInstitucion(idInst: number) {
    const idProb = this.problematicaActiva()?.id;
    if (!idProb) return;

    if (!confirm('¿Está seguro de que desea desvincular esta institución?')) return;

    this.cargandoAsignacion.set(true);
    this.problematicaService.desasignarProblematicaDeInstitucion(idProb, idInst).subscribe({
      next: () => {
        this.cargarInstitucionesAsociadas(idProb);
      },
      error: (err) => {
        console.error(err);
        alert('Error al desasignar institución');
        this.cargandoAsignacion.set(false);
      },
    });
  }

  onFiltroDepartamentoChange(val: any) {
    this.filtroDepartamento.set(val);
    this.filtroMunicipio.set(undefined);
    this.institucionSeleccionada.set(undefined);
  }

  onFiltroMunicipioChange(val: any) {
    this.filtroMunicipio.set(val);
    this.institucionSeleccionada.set(undefined);
  }

  cambiarFiltroInhabilitados() {
    this.mostrarInhabilitados.set(!this.mostrarInhabilitados());
    this.cargarProblematicas();
  }
}
