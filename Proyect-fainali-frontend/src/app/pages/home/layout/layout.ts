import { UsuarioService } from './../../../features/usuario/service/usuario-service';

import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../auth/service/auth-service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Router, RouterOutlet } from '@angular/router';
import { InteractionService } from '../../../shared/service/interaction.service';
import { UbicacionService } from '../../../features/ubicacion/service/ubicacion-service';
import { IDepartamento } from '../../../features/ubicacion/interface/idepartamento';
import { IMunicipio } from '../../../features/ubicacion/interface/imunicipio';
import { ISector } from '../../../features/ubicacion/interface/isector';
import { IRegistro } from '../../../features/usuario/interface/ireguistro';




const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSW_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  imports: [RouterOutlet, ReactiveFormsModule]
})
export class Layout {
  public authService = inject(AuthService)
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private ubicacionService = inject(UbicacionService);
  private router = inject(Router);
  private interactionService = inject(InteractionService);

  departamentos = signal<IDepartamento[]>([]);
  municipios = signal<IMunicipio[]>([]);
  sectores = signal<ISector[]>([]);


  //Enlaces de navegacion
  enlaces = [
    { ruta: '/inicio', etiqueta: 'Inicio' },
  ]
  //navegar en los enlaces
  async navegar(ruta: string) {

  }



  esModal = this.interactionService.modalAuth;
  vistaAuth = this.interactionService.vistaAuth;

  //Definir Formulario
  loginForm!: FormGroup
  registroForm!: FormGroup

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDepartamentos();
  }
  //Alternar vista entre el Login y el registro
  cambiarVista(vista: 'login' | 'registro') {
    this.interactionService.vistaAuth.set(vista);

    if (vista === 'login') {
      this.loginForm.reset()
    } else {
      this.registroForm.reset({ activo: true })
    }
  }
  // Inicializar formularios
  private inicializarFormularios() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(PASSW_PATTERN)],
      ],
    });

    this.registroForm = this.fb.group({
      numeroCedula: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      sexo: [
        '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(1)]
      ],
      correo: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      contrasena: [
        '',
        [Validators.required, Validators.pattern(PASSW_PATTERN)]
      ],
      confirmationContra: [
        '',
        [Validators.required, Validators.pattern(PASSW_PATTERN)]
      ],
      idSector: [null, [Validators.required]],
    });
  }

  cargarDepartamentos() {
    this.ubicacionService.obtenerDepartamentos().subscribe({
      next: (data) => this.departamentos.set(data),
      error: (err) => this.interactionService.mostrarError(err),
    });
  }

  onDepartamentoChange(id: number) {
    this.municipios.set([]);
    this.sectores.set([]);
    this.registroForm.patchValue({ idSector: null });
    if (!id) return;
    this.ubicacionService.obtenerMunicipiosPorDepartamento(id).subscribe({
      next: (data) => this.municipios.set(data),
      error: (err) => this.interactionService.mostrarError(err),
    });
  }

  onMunicipioChange(id: number) {
    this.sectores.set([]);
    this.registroForm.patchValue({ idSector: null });
    if (!id) return;
    this.ubicacionService.obtenerSectoresPorMunicipio(id).subscribe({
      next: (data) => this.sectores.set(data),
      error: (err) => this.interactionService.mostrarError(err),
    });
  }

  // validar los controles//
  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // Iniciar sesión
  async enviarLogin() {
    await this.interactionService.showLoading()

    const { email, password } = this.loginForm.value;

    this.authService.iniciarSesion(email, password).subscribe({
      next: async (res) => {
        await this.interactionService.hideLoading();

        // Error 1: La propiedad 'cerrarModal' no existe
        this.cerrarModal();

        // if(res.usuario.rol === 'Administrador') {
        //   this.router.navigate(['/admin'])
        //} else
        {
          this.router.navigate(['/inicio']);
        }

        await this.interactionService.showToast(
          `Bienvenido vago!`
        )
      },
      error: async (err) => {
        await this.interactionService.hideLoading();
        await this.interactionService.mostrarError(err);
      }
    });
  }

  // Registrar un nuevo usuario
  async enviarRegistro() {
    await this.interactionService.showLoading();

    const val = this.registroForm.value;
    const usuario: any = {
      numeroCedula: val.numeroCedula,
      nombres: val.nombres,
      apellidos: val.apellidos,
      sexo: val.sexo,
      correo: val.correo,
      contrasena: val.contrasena,
      confirmationContra: val.confirmationContra,
      idSector: Number(val.idSector),
    };

    console.log("Datos enviados al backend:", JSON.stringify(usuario, null, 2));

    this.usuarioService.registrarUsuario(usuario).subscribe({
      next: async (res) => {
        await this.interactionService.hideLoading();
        console.log('Registro response:', JSON.stringify(res, null, 2));
        this.authService.establecerSesion(res);
        this.cerrarModal();
        await this.interactionService.showToast('Cuenta creada correctamente', 'success');
        this.router.navigate(['/inicio']);
      },
      error: async (err) => {
        await this.interactionService.hideLoading();
        await this.interactionService.mostrarError(err);
      },
    })
  }

  // Cerrar sesión
  async salir() {
    const confirm = await this.interactionService.confirmar(
      'Cerrar Sesión',
      '¿Seguro que desea salir?',
    );

    if (confirm) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  abrirModal() {
    this.interactionService.abrirModalAuth('login');
  }

  cerrarModal() {
    this.interactionService.cerrarModalAuth();
    if (this.loginForm) {
      this.loginForm.reset();
    }

    if (this.registroForm) {
      this.registroForm.reset({ activo: true });
    }
  }
}
