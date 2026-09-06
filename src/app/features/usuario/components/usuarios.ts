import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../service/usuario-service';
import { IUsuario, IUsuarioListaItem } from '../interface/iusuario';
import { InstitucionesService } from '../../instituciones/service/instituciones.service';
import { Institucion } from '../../instituciones/interface/instituciones';
import { UbicacionService } from '../../ubicacion/service/ubicacion.service';
import { Departamento, Municipio, Sector } from '../../ubicacion/interface/ubicacion.interface';
import { IRoles } from '../../roles/interface/roles';
import { RolesService } from '../../roles/service/roles.service';
import { PaginationMeta } from '../../problematicas/interface/problematica';
import { BanService } from '../../ban/service/ban-service';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolesService);
  private institucionesService = inject(InstitucionesService);
  private ubicacionService = inject(UbicacionService);
  private banService = inject(BanService);
  private interactionService = inject(InteractionService);

  usuarios = signal<IUsuarioListaItem[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  roles = signal<IRoles[]>([]);
  sectores = signal<Sector[]>([]);
  instituciones = signal<Institucion[]>([]);
  departamentos = signal<Departamento[]>([]);
  municipios = signal<Municipio[]>([]);

  formSectorDepartamento = signal<number | undefined>(undefined);
  formSectorMunicipio = signal<number | undefined>(undefined);

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

  municipiosParaSector = computed(() => {
    const depId = Number(this.formSectorDepartamento());
    if (!depId || isNaN(depId)) return [];
    return this.municipios().filter(
      (m) => m.id_departamento === depId || m.idDepartamento === depId,
    );
  });

  sectoresParaSector = computed(() => {
    const muniId = Number(this.formSectorMunicipio());
    if (!muniId || isNaN(muniId)) return [];
    return this.sectores().filter(
      (s) => s.idMunicipios === muniId || s.idMunicipio === muniId || s.id_municipios === muniId,
    );
  });

  // Modal states
  mostrarModal = signal(false);
  modalModo = signal<'crear' | 'editar'>('crear');

  mostrarModalReasignar = signal(false);
  usuarioReasignarId = signal<number | null>(null);

  mostrarModalBaja = signal(false);
  usuarioBajaId = signal<number | null>(null);

  mostrarModalBan = signal(false);
  usuarioBanId = signal<number | null>(null);
  banForm = signal<{ motivo: string; tipo: 'permanente' | 'temporal'; fechaFin: string }>({
    motivo: '',
    tipo: 'permanente',
    fechaFin: '',
  });

  usuarioActual = signal<Partial<IUsuario> & { contrasena?: string }>({
    numeroCedula: '',
    nombres: '',
    apellidos: '',
    sexo: '',
    correo: '',
    contrasena: '',
    idSector: undefined as unknown as number,
    idRol: undefined as unknown as number,
    idInstitucion: undefined as unknown as number,
  });

  reasignarForm = signal<{ idRol: number; idInstitucion: number }>({
    idRol: undefined as unknown as number,
    idInstitucion: undefined as unknown as number,
  });

  ngOnInit() {
    this.cargarUsuarios(this.paginaActual());
    this.cargarDatosFormulario();
  }

  cargarUsuarios(pag: number) {
    this.cargando.set(true);
    this.error.set(null);
    this.usuarioService.obtenerUsuarios(String(pag)).subscribe({
      next: (res) => {
        if (res.lista) {
          this.usuarios.set(res.lista.data.filter((u) => u.idRol !== 1));
          this.paginacion.set(res.lista.meta);
          this.paginaActual.set(res.lista.meta.currentPage);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error.set('No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      },
    });
  }

  irPagina(pag: number) {
    if (pag < 1 || pag > (this.paginacion()?.lastPage ?? 1) || pag === this.paginaActual()) return;
    this.paginaActual.set(pag);
    this.cargarUsuarios(pag);
  }

  cargarDatosFormulario() {
    this.rolService.listarRoles().subscribe({
      next: (res) => {
        this.roles.set(res.lista_Rol.filter((r): r is IRoles => r.id !== 1) || []);
      },
      error: () => console.error('Error cargando roles'),
    });

    this.ubicacionService.obtenerSectores().subscribe({
      next: (res) => this.sectores.set(res.lista_Sectores || []),
      error: () => console.error('Error cargando sectores'),
    });

    this.ubicacionService.obtenerDepartamentos().subscribe({
      next: (res) => this.departamentos.set(res.lista_Departamentos || []),
      error: () => console.error('Error cargando departamentos'),
    });

    this.ubicacionService.obtenerMunicipios().subscribe({
      next: (res) => this.municipios.set(res.lista_Municipios || []),
      error: () => console.error('Error cargando municipios'),
    });

    this.institucionesService.obtenerInstituciones().subscribe({
      next: (res) => this.instituciones.set(res.lista_Instituciones || []),
      error: () => console.error('Error cargando instituciones'),
    });
  }

  onFormSectorDepartamentoChange(val: any) {
    this.formSectorDepartamento.set(val);
    this.formSectorMunicipio.set(undefined);
    this.usuarioActual.set({ ...this.usuarioActual(), idSector: undefined as unknown as number });
  }

  onFormSectorMunicipioChange(val: any) {
    this.formSectorMunicipio.set(val);
    this.usuarioActual.set({ ...this.usuarioActual(), idSector: undefined as unknown as number });
  }

  obtenerNombreRol(idRol: number): string {
    const rol = this.roles().find((r) => r.id === idRol);
    return rol?.rol ?? `Rol #${idRol}`;
  }

  abrirModalCrear() {
    this.modalModo.set('crear');
    this.usuarioActual.set({
      numeroCedula: '',
      nombres: '',
      apellidos: '',
      sexo: '',
      correo: '',
      contrasena: '',
      idSector: undefined as unknown as number,
      idRol: undefined as unknown as number,
      idInstitucion: undefined as unknown as number,
    });
    this.formSectorDepartamento.set(undefined);
    this.formSectorMunicipio.set(undefined);
    this.mostrarModal.set(true);
  }

  abrirModalEditar(usuario: IUsuarioListaItem) {
    this.modalModo.set('editar');
    this.usuarioActual.set({
      id: usuario.id,
      numeroCedula: '',
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      sexo: '',
      idSector: usuario.id_sector ?? (undefined as unknown as number),
      idRol: usuario.idRol,
      idInstitucion: undefined as unknown as number,
      contrasena: '',
    });
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.usuarioActual.set({
      numeroCedula: '',
      nombres: '',
      apellidos: '',
      sexo: '',
      correo: '',
      contrasena: '',
      idSector: undefined as unknown as number,
      idRol: undefined as unknown as number,
      idInstitucion: undefined as unknown as number,
    });
  }

  guardarUsuario() {
    const usuario = this.usuarioActual();

    if (!usuario.nombres?.trim() || !usuario.apellidos?.trim() || !usuario.correo?.trim()) {
      this.interactionService.showToast(
        'Los campos nombres, apellidos y correo son requeridos.',
        'warning',
      );
      return;
    }

    if (this.modalModo() === 'crear') {
      if (!usuario.numeroCedula?.trim() || !usuario.contrasena?.trim()) {
        this.interactionService.showToast(
          'Cédula y contraseña son requeridos para crear un usuario.',
          'warning',
        );
        return;
      }
      if (!usuario.idSector || !usuario.idRol) {
        this.interactionService.showToast('Debe seleccionar un sector y un rol.', 'warning');
        return;
      }

      this.cargando.set(true);
      this.usuarioService
        .crearUsuario({
          numeroCedula: usuario.numeroCedula,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          sexo: usuario.sexo || undefined,
          correo: usuario.correo,
          contrasena: usuario.contrasena,
          idSector: usuario.idSector,
          idRol: 2,
          idInstitucion: usuario.idInstitucion || undefined,
        })
        .subscribe({
          next: () => {
            this.cargarUsuarios(this.paginaActual());
            this.cerrarModal();
            this.interactionService.showToast('Usuario creado correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
    } else {
      if (!usuario.id) {
        this.interactionService.showToast('No se puede identificar el usuario a editar.', 'error');
        return;
      }
      this.cargando.set(true);
      this.usuarioService
        .actualizarUsuario(usuario.id, {
          numeroCedula: usuario.numeroCedula || undefined,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          sexo: usuario.sexo || undefined,
          idSector: usuario.idSector,
        })
        .subscribe({
          next: () => {
            this.cargarUsuarios(this.paginaActual());
            this.cerrarModal();
            this.interactionService.showToast('Usuario actualizado correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.interactionService.mostrarError(err);
            this.cargando.set(false);
          },
        });
    }
  }

  abrirModalReasignar(usuario: IUsuarioListaItem) {
    this.usuarioReasignarId.set(usuario.id);
    this.reasignarForm.set({
      idRol: usuario.idRol,
      idInstitucion: undefined as unknown as number,
    });
    this.mostrarModalReasignar.set(true);
  }

  cerrarModalReasignar() {
    this.mostrarModalReasignar.set(false);
    this.usuarioReasignarId.set(null);
  }

  guardarReasignar() {
    const userId = this.usuarioReasignarId();
    if (!userId) return;

    const data = this.reasignarForm();
    if (!data.idRol) {
      this.interactionService.showToast('Debe seleccionar un rol.', 'warning');
      return;
    }

    this.cargando.set(true);
    this.usuarioService.reasignarUsuario(userId, data).subscribe({
      next: () => {
        this.cargarUsuarios(this.paginaActual());
        this.cerrarModalReasignar();
        this.interactionService.showToast('Usuario reasignado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.interactionService.mostrarError(err);
        this.cargando.set(false);
      },
    });
  }

  abrirModalBaja(usuario: IUsuarioListaItem) {
    this.usuarioBajaId.set(usuario.id);
    this.mostrarModalBaja.set(true);
  }

  cerrarModalBaja() {
    this.mostrarModalBaja.set(false);
    this.usuarioBajaId.set(null);
  }

  confirmarBaja(idInstitucion: number) {
    const userId = this.usuarioBajaId();
    if (!userId) return;

    this.cargando.set(true);
    this.usuarioService.bajaUsuario(userId, idInstitucion).subscribe({
      next: () => {
        this.cargarUsuarios(this.paginaActual());
        this.cerrarModalBaja();
        this.interactionService.showToast('Usuario dado de baja correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.interactionService.mostrarError(err);
        this.cargando.set(false);
      },
    });
  }

  abrirModalBan(usuario: IUsuarioListaItem) {
    this.usuarioBanId.set(usuario.id);
    this.banForm.set({ motivo: '', tipo: 'permanente', fechaFin: '' });
    this.mostrarModalBan.set(true);
  }

  cerrarModalBan() {
    this.mostrarModalBan.set(false);
    this.usuarioBanId.set(null);
  }

  confirmarBan() {
    const userId = this.usuarioBanId();
    if (!userId) return;

    const form = this.banForm();
    if (!form.motivo?.trim()) {
      this.interactionService.showToast('Debe ingresar un motivo para el ban.', 'warning');
      return;
    }
    if (form.tipo === 'temporal' && !form.fechaFin) {
      this.interactionService.showToast(
        'Debe seleccionar una fecha de fin para el ban temporal.',
        'warning',
      );
      return;
    }

    this.cargando.set(true);
    this.banService
      .banearUsuario({
        userId: userId,
        motivo: form.motivo,
        tipo: form.tipo,
        fechaFin: form.tipo === 'temporal' ? form.fechaFin : undefined,
      })
      .subscribe({
        next: () => {
          this.cargarUsuarios(this.paginaActual());
          this.cerrarModalBan();
          this.interactionService.showToast('Usuario baneado exitosamente', 'success');
        },
        error: (err) => {
          console.error(err);
          this.interactionService.mostrarError(err);
          this.cargando.set(false);
        },
      });
  }
}
