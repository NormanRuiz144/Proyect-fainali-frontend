import { Institucion } from './../interface/instituciones';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InstitucionesService } from '../service/instituciones.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Departamento, Municipio } from '../../ubicacion/interface/ubicacion.interface';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';

@Component({
  selector: 'app-instituciones',
  templateUrl: './instituciones.html',
  styleUrls: ['./instituciones.css'],
  imports: [CommonModule, FormsModule],
})
export class InstitucionesComponent implements OnInit {
  private instituticionService = inject(InstitucionesService);
  private ubicacionService = inject(UbicacionService);

  instituciones = signal<Institucion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);

  // Modal State
  mostrarModal = signal(false);
  mostrarInhabilitados = signal(false);
  modalModo = signal<'crear' | 'editar' | 'eliminar' | 'restaurar'>('crear');
  itemAProcesar = signal<any>(null);

  filtroDepartamento = signal<number | undefined>(undefined);
  filtroMunicipio = signal<number | undefined>(undefined);

  formSectorDepartamento = signal<number | undefined>(undefined);
  formMunicipio = signal<Partial<Municipio>>({});
  fromInstitucion = signal<Partial<Institucion>>({
    id: undefined,
    nombreInstitucion: '',
    idMunicipio: undefined,
  });

  ngOnInit() {
    this.cargarInstituciones();
    this.cargarDatos();
  }

  cargarInstituciones() {
    this.cargando.set(true);
    this.instituticionService.obtenerInstituciones().subscribe({
      next: (res) => {
        if (res.lista_Instituciones) {
          this.instituciones.set(
            res.lista_Instituciones.filter((i) => i.isDeleted == this.mostrarInhabilitados()),
          );
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando instituciones', err);
        this.error.set('No se pudieron cargar las instituciones.');
        this.cargando.set(false);
      },
    });
  }

  cargarDepartamentosSilencioso() {
    if (this.departamentos().length === 0) {
      this.ubicacionService.obtenerDepartamentos().subscribe({
        next: (res) => this.departamentos.set(res.lista_Departamentos || []),
      });
    }
  }

  cargarDatos() {
    this.cargando.set(true);
    this.error.set(null);

    this.cargarDepartamentosSilencioso();
    this.ubicacionService.obtenerMunicipios().subscribe({
      next: (res) => {
        this.municipios.set(res.lista_Municipios || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los municipios.');
        this.cargando.set(false);
      },
    });
  }

  abrirModalCrear() {
    this.modalModo.set('crear');
    this.fromInstitucion.set({ id: undefined, nombreInstitucion: '', idMunicipio: undefined });
    this.mostrarModal.set(true);
    this.formMunicipio.set({ nomMunicipio: '', idDepartamento: undefined });
    this.formSectorDepartamento.set(undefined);
  }

  abrirModalEditar(institucion: Institucion) {
    this.modalModo.set('editar');

    this.fromInstitucion.set({
      id: institucion.id,
      nombreInstitucion: institucion.nombreInstitucion,
      idMunicipio: institucion.idMunicipio,
    });
    this.mostrarModal.set(true);
  }

  abrirModalEliminar(institucion: Institucion) {
    this.modalModo.set('eliminar');
    this.itemAProcesar.set(institucion);
    this.mostrarModal.set(true);
  }

  abrirModalRestaurar(institucion: Institucion) {
    this.modalModo.set('restaurar');
    this.itemAProcesar.set(institucion);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.fromInstitucion.set({ id: undefined, nombreInstitucion: '', idMunicipio: undefined });
  }

  guardarInstitucion() {
    if (this.modalModo() === 'eliminar' || this.modalModo() === 'restaurar') {
      const id = this.itemAProcesar()?.id;
      if (!id) return;
      this.cargando.set(true);

      if (this.modalModo() === 'eliminar') {
        this.instituticionService.eliminarInstitucion(id).subscribe({
          next: () => {
            this.cargarInstituciones();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al eliminar la Institucion');
            this.cargando.set(false);
          },
        });
      } else {
        this.instituticionService.restaurarInstitucion(id).subscribe({
          next: () => {
            this.cargarInstituciones();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al restaurar la Institucion');
            this.cargando.set(false);
          },
        });
      }
      return;
    }

    if (!this.fromInstitucion().nombreInstitucion?.trim()) {
      alert('El nombre de la institución es requerido');
      return;
    }

    const institucion = this.fromInstitucion();
    console.log(institucion);
    this.cargando.set(true);

    if (this.modalModo() === 'crear') {
      const data = this.fromInstitucion();
      this.instituticionService.crearInstitucion(data.idMunicipio!, institucion).subscribe({
        next: () => {
          this.cargarInstituciones();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear la Institucion');
          this.cargando.set(false);
        },
      });
    } else {
      if (institucion.id) {
        this.instituticionService.actualizarInstitucion(institucion.id, institucion).subscribe({
          next: () => {
            this.cargarInstituciones();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            alert('Error al actualizar la institución');
            this.cargando.set(false);
          },
        });
      }
    }
  }

  municipiosParaFiltro = computed(() => {
    const depId = Number(this.filtroDepartamento());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  municipiosParaModal = computed(() => {
    const depId = Number(this.formSectorDepartamento());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  onFormSectorDepartamentoChange(val: any) {
    this.formSectorDepartamento.set(val);
    const data = this.formMunicipio();
    data.id = undefined;
    this.formMunicipio.set(data);
  }

  onMunicipioChange(val: any) {
    this.fromInstitucion.set({
      ...this.fromInstitucion(),
      idMunicipio: val,
    });
  }

  cambiarFiltroInhabilitados() {
    this.mostrarInhabilitados.set(!this.mostrarInhabilitados());
    this.cargarInstituciones();
  }
}
