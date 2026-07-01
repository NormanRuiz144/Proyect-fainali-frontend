import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UbicacionService } from '../service/ubicacion.service';
import { Departamento, Municipio, Sector } from '../interface/ubicacion.interface';
import { PaginationMeta } from '../../problematicas/interface/problematica';
import { InteractionService } from '../../../shared/service/interaction.service';

type Tab = 'departamentos' | 'municipios' | 'sectores';
type ModalMode = 'crear' | 'editar' | 'eliminar' | 'restaurar';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ubicacion.html',
  styleUrl: './ubicacion.css',
})
export class UbicacionComponent implements OnInit {
  private ubicacionService = inject(UbicacionService);
  private interactionService = inject(InteractionService);

  activeTab = signal<Tab>('departamentos');

  // Data
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);
  sectores = signal<Sector[]>([]);

  cargando = signal(false);
  error = signal<string | null>(null);

  // Modal State
  mostrarModal = signal(false);
  modalModo = signal<ModalMode>('crear');
  itemAProcesar = signal<any>(null);

  // Form State
  formDepartamento = signal<Partial<Departamento>>({});
  formMunicipio = signal<Partial<Municipio>>({});
  formSector = signal<Partial<Sector>>({});

  // Filter State
  filtroDepartamento = signal<number | undefined>(undefined);
  filtroMunicipio = signal<number | undefined>(undefined);
  filtroDepartamentoSector = signal<number | undefined>(undefined);
  formSectorDepartamento = signal<number | undefined>(undefined);
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

  municipiosParaFiltroSector = computed(() => {
    const depId = Number(this.filtroDepartamentoSector());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  municipiosParaModalSector = computed(() => {
    const depId = Number(this.formSectorDepartamento());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  onFiltroDepartamentoSectorChange(val: any) {
    this.filtroDepartamentoSector.set(val);
    this.filtroMunicipio.set(undefined);
  }

  onFormSectorDepartamentoChange(val: any) {
    this.formSectorDepartamento.set(val);
    const data = this.formSector();
    data.idMunicipio = undefined;
    this.formSector.set(data);
  }

  ngOnInit() {
    this.cargarDatos();
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.filtroDepartamento.set(undefined);
    this.filtroMunicipio.set(undefined);
    this.filtroDepartamentoSector.set(undefined);
    this.mostrarInhabilitados.set(false);
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.error.set(null);

    const tab = this.activeTab();
    if (tab === 'departamentos') {
      this.ubicacionService.obtenerDepartamentosPag(this.paginaActual().toString()).subscribe({
        next: (res) => {
          this.departamentos.set(
            res.lista_Departamentos.data.filter(
              (d) => d.isDeleted == this.mostrarInhabilitados(),
            ) || [],
          );
          this.paginacion.set(res.lista_Departamentos.meta);
          this.paginaActual.set(res.lista_Departamentos.meta.currentPage);

          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudieron cargar los departamentos.');
          this.cargando.set(false);
        },
      });
    } else if (tab === 'municipios') {
      this.cargarDepartamentosSilencioso();
      this.ubicacionService.obtenerMunicipiosPag(this.paginaActual().toString()).subscribe({
        next: (res) => {
          this.municipios.set(
            res.lista_Municipios.data.filter((d) => d.isDeleted == this.mostrarInhabilitados()) ||
              [],
          );
          this.paginacion.set(res.lista_Municipios.meta);
          this.paginaActual.set(res.lista_Municipios.meta.currentPage);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudieron cargar los municipios.');
          this.cargando.set(false);
        },
      });
    } else if (tab === 'sectores') {
      this.cargarDepartamentosSilencioso();
      this.cargarMunicipiosSilencioso();
      this.ubicacionService.obtenerSectoresPag(this.paginaActual().toString()).subscribe({
        next: (res) => {
          this.sectores.set(
            res.lista_Sectores.data.filter((d) => d.isDeleted == this.mostrarInhabilitados()) || [],
          );
          this.paginacion.set(res.lista_Sectores.meta);
          this.paginaActual.set(res.lista_Sectores.meta.currentPage);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudieron cargar los sectores.');
          this.cargando.set(false);
        },
      });
    }
  }

  irPagina(pag: number) {
    if (pag < 1 || pag > (this.paginacion()?.lastPage ?? 1) || pag === this.paginaActual()) return;
    this.paginaActual.set(pag);
    this.cargarDatos();
  }

  buscarFiltro() {
    this.cargando.set(true);
    this.error.set(null);
    this.paginacion.set(null);
    const tab = this.activeTab();

    if (tab === 'municipios') {
      const depId = this.filtroDepartamento();
      if (!depId || depId === undefined || String(depId) === 'undefined') {
        this.paginaActual.set(1);
        this.cargarDatos();
        return;
      }
      this.ubicacionService.municipiosPorDepartamento(depId).subscribe({
        next: (res) => {
          this.municipios.set(res.lista_Municipios || []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se encontraron municipios para este departamento.');
          this.municipios.set([]);
          this.cargando.set(false);
        },
      });
    } else if (tab === 'sectores') {
      const muniId = this.filtroMunicipio();
      if (!muniId || muniId === undefined || String(muniId) === 'undefined') {
        this.paginaActual.set(1);
        this.cargarDatos();
        return;
      }
      this.ubicacionService.sectoresPorMunicipio(muniId).subscribe({
        next: (res) => {
          this.sectores.set(res.lista_Sectores || []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se encontraron sectores para este municipio.');
          this.sectores.set([]);
          this.cargando.set(false);
        },
      });
    }
  }

  cargarDepartamentosSilencioso() {
    // if (this.departamentos().length === 0) {
    this.ubicacionService.obtenerDepartamentos().subscribe({
      next: (res) => {
        this.departamentos.set(res.lista_Departamentos || []);
      },
    });
    // }
  }

  cargarMunicipiosSilencioso() {
    // if (this.municipios().length === 0) {
    this.ubicacionService.obtenerMunicipios().subscribe({
      next: (res) => this.municipios.set(res.lista_Municipios || []),
    });
    // }
  }

  // --- Helpers for Display ---
  getNombreDepartamento(idDepart?: number): string {
    if (!idDepart) return 'N/A';
    const dep = this.departamentos().find((d) => d.id === idDepart);
    return dep?.nom_departamento || dep?.nomDepartamento || `ID: ${idDepart}`;
  }

  getNombreMunicipio(idMuni?: number): string {
    if (!idMuni) return 'N/A';
    const muni = this.municipios().find((m) => m.id === idMuni);
    return muni?.nom_municipio || muni?.nomMunicipio || `ID: ${idMuni}`;
  }

  // --- Modal Logic ---
  abrirModalCrear() {
    this.modalModo.set('crear');
    this.formDepartamento.set({ nomDepartamento: '' });
    this.formMunicipio.set({ nomMunicipio: '', idDepartamento: undefined });
    this.formSectorDepartamento.set(undefined);
    this.formSector.set({ nomSector: '', idMunicipio: undefined });
    this.mostrarModal.set(true);
  }

  abrirModalEditar(item: any) {
    this.modalModo.set('editar');
    const tab = this.activeTab();
    if (tab === 'departamentos') {
      this.formDepartamento.set({
        id: item.id,
        nomDepartamento: item.nom_departamento || item.nomDepartamento,
      });
    } else if (tab === 'municipios') {
      this.formMunicipio.set({
        id: item.id,
        nomMunicipio: item.nom_municipio || item.nomMunicipio,
        idDepartamento: item.id_departamento || item.idDepartamento,
      });
    } else if (tab === 'sectores') {
      const idMuni = item.id_municipios || item.idMunicipios || item.idMunicipio;
      this.formSector.set({
        id: item.id,
        nomSector: item.nombre_sector || item.nombreSector || item.nomSector,
        idMunicipio: idMuni,
      });

      const muni = this.municipios().find((m) => m.id == idMuni);
      if (muni) {
        this.formSectorDepartamento.set(muni.id_departamento || muni.idDepartamento);
      } else {
        this.formSectorDepartamento.set(undefined);
      }
    }
    this.mostrarModal.set(true);
  }

  abrirModalEliminar(item: any) {
    this.modalModo.set('eliminar');
    this.itemAProcesar.set(item);
    this.mostrarModal.set(true);
  }

  abrirModalRestaurar(item: any) {
    this.modalModo.set('restaurar');
    this.itemAProcesar.set(item);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardar() {
    const tab = this.activeTab();
    const modo = this.modalModo();
    this.cargando.set(true);

    if (modo === 'eliminar' || modo === 'restaurar') {
      const id = this.itemAProcesar()?.id;
      if (!id) {
        this.cargando.set(false);
        return;
      }

      if (modo === 'eliminar') {
        if (tab === 'departamentos') {
          this.ubicacionService.eliminarDepartamento(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Departamento eliminado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        } else if (tab === 'municipios') {
          this.ubicacionService.eliminarMunicipio(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Municipio eliminado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        } else if (tab === 'sectores') {
          this.ubicacionService.eliminarSector(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Sector eliminado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        }
      } else {
        if (tab === 'departamentos') {
          this.ubicacionService.restaurarDepartamento(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Departamento restaurado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        } else if (tab === 'municipios') {
          this.ubicacionService.restaurarMunicipio(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Municipio restaurado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        } else if (tab === 'sectores') {
          this.ubicacionService.restaurarSector(id).subscribe({
            next: () => {
              this.cargarDatos();
              this.cerrarModal();
              this.interactionService.showToast('Sector restaurado correctamente', 'success');
            },
            error: (err) => {
              this.interactionService.mostrarError(err);
              this.cargando.set(false);
            },
          });
        }
      }
      return;
    }

    if (tab === 'departamentos') {
      const data = this.formDepartamento();
      if (!data.nomDepartamento) {
        this.interactionService.showToast('Nombre es requerido', 'warning');
        this.cargando.set(false);
        return;
      }

      if (modo === 'crear') {
        this.ubicacionService.crearDepartamento(data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Departamento creado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      } else if (data.id) {
        this.ubicacionService.actualizarDepartamento(data.id, data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Departamento actualizado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      }
    } else if (tab === 'municipios') {
      const data = this.formMunicipio();
      if (!data.nomMunicipio || !data.idDepartamento) {
        this.interactionService.showToast('Nombre y departamento son requeridos', 'warning');
        this.cargando.set(false);
        return;
      }

      data.idDepartamento = Number(data.idDepartamento);

      if (modo === 'crear') {
        this.ubicacionService.crearMunicipio(data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Municipio creado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      } else if (data.id) {
        this.ubicacionService.actualizarMunicipio(data.id, data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Municipio actualizado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      }
    } else if (tab === 'sectores') {
      const data = this.formSector();
      if (!data.nomSector || !data.idMunicipio) {
        this.interactionService.showToast('Nombre y municipio son requeridos', 'warning');
        this.cargando.set(false);
        return;
      }

      data.idMunicipio = Number(data.idMunicipio);

      if (modo === 'crear') {
        this.ubicacionService.crearSector(data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Sector creado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      } else if (data.id) {
        this.ubicacionService.actualizarSector(data.id, data).subscribe({
          next: () => {
            this.cargarDatos();
            this.cerrarModal();
            this.interactionService.showToast('Sector actualizado correctamente', 'success');
          },
          error: (err) => {
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
      }
    }
  }

  cambiarFiltroInhabilitados() {
    this.mostrarInhabilitados.set(!this.mostrarInhabilitados());
    this.cargarDatos();
  }
}
