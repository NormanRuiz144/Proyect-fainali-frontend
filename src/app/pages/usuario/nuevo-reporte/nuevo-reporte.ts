import { Component, signal, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { NuevoReporteService } from './service/nuevo-reporte.service';
import { AuthService } from '../../../auth/service/auth-service';
import { UsuarioService } from '../../../features/usuario/service/usuario-service';
import { UbicacionService } from '../../../features/ubicacion/service/ubicacion-service';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-reporte.html',
  styleUrl: './nuevo-reporte.css'
})
export class NuevoReporte implements OnInit, AfterViewInit, OnDestroy {
  private reporteService = inject(NuevoReporteService);
  public authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private ubicacionService = inject(UbicacionService);
  private interactionService = inject(InteractionService);
  private router = inject(Router);
  municipioSeleccionado = signal(false);
  ubicacionObtenida = signal(false);
  
  // Señales para el Dashboard del Ciudadano
  vistaActual = signal<'nuevo' | 'historial' | 'perfil'>('historial');
  historialReportes = signal<any[]>([]);
  filtroInstitucion = signal<string>('todas');
  sidebarAbierto = signal<boolean>(true);
  reporteSeleccionado = signal<any>(null);
  
  // Datos de Perfil
  usuarioActual = signal<any>(null);
  perfilDepartamentos = signal<any[]>([]);
  perfilMunicipios = signal<any[]>([]);
  perfilSectores = signal<any[]>([]);
  perfilForm = signal({
    correo: '',
    idDepartamento: '',
    idMunicipio: '',
    idSector: ''
  });
  
  // Señal para almacenar las previsualizaciones de imágenes y sus archivos correspondientes
  imagenesPrevisualizacion = signal<{ url: string, name: string, file: File }[]>([]);

  // Señal para manejar la imagen ampliada en el Lightbox
  imagenAmpliada = signal<string | null>(null);
  
  // Señales para los catálogos
  instituciones = signal<any[]>([]);
  problematicas = signal<any[]>([]);
  sectores = signal<any[]>([]);
  municipios = signal<any[]>([]);

  // Señal para manejar la institución autoseleccionada
  institucionSeleccionada = signal<string>('');

  // Señal para manejar el placeholder dinámico
  placeholderActual = signal<string>('Ej: Describe detalladamente el problema, su ubicación exacta y cómo afecta a la comunidad.');

  // Diccionario con los ejemplos.
  ejemplosProblematicas: Record<string, string> = {
    'Fuga de agua en la calle': 'Ej: Hay una fuga de agua masiva frente a la pulpería de Doña María. El agua está llegando hasta la calle principal.',
    'Incendio': 'Ej: Hay un incendio en un predio baldío cerca del mercado central, las llamas están creciendo rápidamente.',
    'Alteracion y disturbio': 'Ej: Hay un grupo de personas alterando el orden público y haciendo mucho ruido frente al parque.',
    'Baches en la calle': 'Ej: Hay un bache muy profundo en la intersección que está dañando las llantas de los vehículos al pasar.',
    'Aguas estancadas': 'Ej: El agua de la lluvia se ha quedado estancada en la cuneta desde hace una semana y hay muchos zancudos.',
    'Cables tendidos': 'Ej: Un camión pasó arrancando los cables de luz y ahora están colgando peligrosamente a media calle.',
  };

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  // Coordenadas por defecto para cuando el mapa cargue aparezca rivas por defecto
  private defaultLat = 11.4394;
  private defaultLng = -85.8268;

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarHistorial();
    this.cargarDatosPerfil();
  }

  private cargarHistorial(): void {
    this.reporteService.obtenerHistorialUsuario().subscribe({
      next: (res) => {
        const reportes = res.lista_Reportes || res.data || [];
        this.historialReportes.set(reportes);
        
        // Si no hay historial, mostramos el formulario
        if (reportes.length === 0) {
          this.vistaActual.set('nuevo');
        } else {
          this.vistaActual.set('historial');
          this.reporteSeleccionado.set(reportes[0]); // Seleccionar el primer reporte
        }
      },
      error: (err) => {
        console.error('Error cargando historial', err);
        this.vistaActual.set('nuevo');
      }
    });
  }

  // Obtener la lista de instituciones únicas a partir del historial del usuario
  get institucionesHistorial() {
    const reportes = this.historialReportes();
    const insts = new Map();
    reportes.forEach(r => {
      if (r.institucion) {
        insts.set(r.institucion.id, r.institucion.nombreInstitucion);
      }
    });
    return Array.from(insts.entries()).map(([id, nombre]) => ({ id, nombre }));
  }

  // Retornar los reportes filtrados por institución
  get reportesFiltrados() {
    const filtro = this.filtroInstitucion();
    if (filtro === 'todas') {
      return this.historialReportes();
    }
    return this.historialReportes().filter(r => r.institucion?.id?.toString() === filtro);
  }

  private cargarDatosPerfil(): void {
    const usuario = this.authService.usuarioActual();
    if (usuario) {
      this.usuarioActual.set(usuario);
      this.perfilForm.update(f => ({ ...f, correo: usuario.correo }));
      
      this.ubicacionService.obtenerDepartamentos().subscribe(res => this.perfilDepartamentos.set(res));
      
      // Si el usuario ya tiene un sector asignado, cargar la cadena completa (dpto, muni, sector).
      if (usuario.sector?.municipio) {
        const idDpto = usuario.sector.municipio.idDepartamentos || (usuario.sector.municipio as any)['id_departamentos'];
        const idMuni = usuario.sector.idMunicipios || (usuario.sector as any)['id_municipios'];
        const idSect = usuario.sector.id;

        if (idDpto) {
          this.perfilForm.update(f => ({ ...f, idDepartamento: idDpto.toString() }));
          this.ubicacionService.obtenerMunicipiosPorDepartamento(idDpto).subscribe(res => {
            this.perfilMunicipios.set(res);
            if (idMuni) {
              this.perfilForm.update(f => ({ ...f, idMunicipio: idMuni.toString() }));
              this.ubicacionService.obtenerSectoresPorMunicipio(idMuni).subscribe(resSectores => {
                this.perfilSectores.set(resSectores);
                if (idSect) {
                  this.perfilForm.update(f => ({ ...f, idSector: idSect.toString() }));
                }
              });
            }
          });
        }
      } else if (usuario.idSector) {
         this.perfilForm.update(f => ({ ...f, idSector: usuario.idSector.toString() }));
      }
    }
  }

  cambiarVista(vista: 'nuevo' | 'historial' | 'perfil') {
    this.vistaActual.set(vista);
    if (window.innerWidth <= 1024) {
      this.sidebarAbierto.set(false);
    }
    if (vista === 'nuevo') {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    }
  }

  async cerrarSesion() {
    const confirm = await this.interactionService.confirmar('Cerrar Sesión', '¿Seguro que deseas salir?');
    if (confirm) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  onPerfilDepartamentoChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.perfilForm.update(f => ({ ...f, idDepartamento: id, idMunicipio: '', idSector: '' }));
    this.perfilMunicipios.set([]);
    this.perfilSectores.set([]);
    if (id) {
      this.ubicacionService.obtenerMunicipiosPorDepartamento(Number(id)).subscribe(res => this.perfilMunicipios.set(res));
    }
  }

  onPerfilMunicipioChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.perfilForm.update(f => ({ ...f, idMunicipio: id, idSector: '' }));
    this.perfilSectores.set([]);
    if (id) {
      this.ubicacionService.obtenerSectoresPorMunicipio(Number(id)).subscribe(res => this.perfilSectores.set(res));
    }
  }

  onPerfilSectorChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.perfilForm.update(f => ({ ...f, idSector: id }));
  }

  async guardarPerfil() {
    const usuario = this.usuarioActual();
    if (!usuario) return;

    await this.interactionService.showLoading();
    const datosActualizados: any = {};
    if (this.perfilForm().correo) datosActualizados.correo = this.perfilForm().correo;
    if (this.perfilForm().idSector) datosActualizados.idSector = Number(this.perfilForm().idSector);

    this.usuarioService.actualizarUsuario(usuario.id, datosActualizados).subscribe({
      next: async (res) => {
        await this.interactionService.hideLoading();
        await this.interactionService.showToast('Perfil actualizado correctamente', 'success');
      },
      error: async (err) => {
        await this.interactionService.hideLoading();
        await this.interactionService.mostrarError(err);
      }
    });
  }

  private cargarCatalogos(): void {
    this.reporteService.obtenerInstituciones().subscribe({
      next: (res) => this.instituciones.set(res.lista_Instituciones || res),
      error: (err) => {
        console.error('Error cargando instituciones', err);
        this.interactionService.mostrarError(err);
      },
    });
    this.reporteService.obtenerMunicipios().subscribe({
      next: (res) => this.municipios.set(res.lista_Municipios || res),
      error: (err) => {
        console.error('Error cargando municipios', err);
        this.interactionService.mostrarError(err);
      },
    });
  }

  onInstitucionChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.institucionSeleccionada.set(id);
    this.problematicas.set([]);
    this.placeholderActual.set('Ej: Describe detalladamente el problema, su ubicación exacta y cómo afecta a la comunidad.');
    if (id) {
      this.reporteService.obtenerProblematicasPorInstitucion(Number(id)).subscribe({
        next: (res) => {
          const raw = res.lista_problematicas || [];
          this.problematicas.set(raw.map((item: any) => item.problematica));
        },
        error: async (err) => {
          console.error('Error cargando problemáticas por institución', err);
          await this.interactionService.mostrarError(err);
        },
      });
    }
  }

  onMunicipioChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.sectores.set([]);
    this.municipioSeleccionado.set(true);
    if (id) {
      this.ubicacionService.obtenerSectoresPorMunicipio(id).subscribe({
        next: (data) => this.sectores.set(data),
        error: () => this.sectores.set([]),
      });
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    // Liberar recursos de las imágenes previsualizadas
    this.imagenesPrevisualizacion().forEach(img => URL.revokeObjectURL(img.url));
  }

  private initMap(): void {
    // Configuración para arreglar el problema de las imágenes de Leaflet en Angular
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Inicializar el mapa
    this.map = L.map('mapa-ubicacion').setView([this.defaultLat, this.defaultLng], 13);

    // Cargar las capas del mapa desde OpenStreetMap (¡100% Gratis!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Agregar un pin movible
    this.marker = L.marker([this.defaultLat, this.defaultLng], {
      draggable: true
    }).addTo(this.map);

    // Escuchar cuando el usuario arrastra el pin
    this.marker.on('dragend', () => {
      const position = this.marker?.getLatLng();
      if (position) {
        console.log(`Pin movido a: Lat ${position.lat}, Lng ${position.lng}`);
      }
    });

    // Asegurar rediseño y posicionamiento correcto de las cuadrículas (tiles) de Leaflet
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  // Método para cambiar el placeholder dinámicamente
  cambiarPlaceholder(event: Event) {
    const idSeleccionado = (event.target as HTMLSelectElement).value;
    console.log('🔍 [cambiarPlaceholder] ID de problemática seleccionado:', idSeleccionado);
    console.log('📚 [cambiarPlaceholder] Problemáticas cargadas en el frontend:', this.problematicas());

    // Buscamos la problemática seleccionada en el arreglo
    const problema = this.problematicas().find(p => p.id.toString() === idSeleccionado);
    console.log('🎯 [cambiarPlaceholder] Objeto problemática encontrado en la lista:', problema);
    
    // Si encontramos la problemática y tenemos un ejemplo para ella en el diccionario:
    if (problema && this.ejemplosProblematicas[problema.problema]) {
      const nuevoPlaceholder = this.ejemplosProblematicas[problema.problema];
      console.log('💡 [cambiarPlaceholder] Seteando nuevo placeholder:', nuevoPlaceholder);
      this.placeholderActual.set(nuevoPlaceholder);

    } else {
      console.warn('⚠️ [cambiarPlaceholder] No hay coincidencia exacta para la problemática "' + (problema ? problema.problema : 'desconocida') + '" en tus diccionarios.');
      // Mensaje por defecto si la problemática no está en el diccionario o es nula
      this.placeholderActual.set('Ej: Describe detalladamente el problema, su ubicación exacta y cómo afecta a la comunidad.');
    }
  }

  obtenerUbicacion() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    // Pedir ubicación al dispositivo
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.ubicacionObtenida.set(true);

        if (this.map && this.marker) {
          // Centrar el mapa en la ubicación real del usuario
          this.map.setView([lat, lng], 17);
          this.marker.setLatLng([lat, lng]);
          
          // Forzar rediseño de Leaflet tras centrar
          setTimeout(() => {
            this.map?.invalidateSize();
          }, 100);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación', error);
        alert('No pudimos obtener tu ubicación. Por favor, mueve el pin rojo al lugar del problema manualmente.');
      },
      { enableHighAccuracy: true }
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const nuevosArchivos = Array.from(input.files);
      const imagenesActuales = this.imagenesPrevisualizacion();
      
      // Limitar a un máximo de 6 imágenes en total
      if (imagenesActuales.length + nuevosArchivos.length > 6) {
        alert('Solo puedes subir hasta 6 imágenes en total.');
        return;
      }

      const nuevasPrevisualizaciones = nuevosArchivos.map(file => {
        return {
          url: URL.createObjectURL(file),
          name: file.name,
          file: file
        };
      });

      this.imagenesPrevisualizacion.set([...imagenesActuales, ...nuevasPrevisualizaciones]);
    }
  }

  eliminarImagen(index: number) {
    const imagenesActuales = this.imagenesPrevisualizacion();
    URL.revokeObjectURL(imagenesActuales[index].url);
    const nuevasImagenes = imagenesActuales.filter((_, i) => i !== index);
    this.imagenesPrevisualizacion.set(nuevasImagenes);

    // Si ya no quedan imágenes, vaciamos el valor del input file original
    if (nuevasImagenes.length === 0) {
      const archivosInput = document.getElementById('archivos-evidencia') as HTMLInputElement;
      if (archivosInput) {
        archivosInput.value = '';
      }
    }
  }

  limpiarImagenes() {
    this.imagenesPrevisualizacion().forEach(img => URL.revokeObjectURL(img.url));
    this.imagenesPrevisualizacion.set([]);
    const archivosInput = document.getElementById('archivos-evidencia') as HTMLInputElement;
    if (archivosInput) {
      archivosInput.value = '';
    }
  }

  ampliarImagen(url: string) {
    this.imagenAmpliada.set(url);
  }

  cerrarModalImagen() {
    this.imagenAmpliada.set(null);
  }

  enviarReporte(event: Event) {
    event.preventDefault();
    const lat = this.marker?.getLatLng().lat;
    const lng = this.marker?.getLatLng().lng;

    // Obtener valores de los inputs por su ID
    const idProblematica = (document.getElementById('problematica') as HTMLSelectElement).value;
    const idInstitucion = (document.getElementById('institucion') as HTMLSelectElement).value;
    const idSector = (document.getElementById('sector') as HTMLSelectElement).value;
    const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
    const archivosInput = document.getElementById('archivos-evidencia') as HTMLInputElement;

    if (!idProblematica || !idInstitucion || !idSector || !descripcion) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const usuarioLogueado = this.authService.usuarioActual();
    if (!usuarioLogueado) {
      alert('Debes iniciar sesión para poder enviar un reporte.');
      return;
    }

    const formData = new FormData();
    // Valores dinámicos del usuario autenticado
    formData.append('idUsuario', usuarioLogueado.id.toString()); 
    formData.append('nvlPrioridad', '5');
    formData.append('idProblematica', idProblematica);
    formData.append('idInstitucion', idInstitucion);
    formData.append('idSector', idSector);
    
    // El backend espera "ubicacion" y "descripcion"
    const ubicacionGPS = `Lat: ${lat}, Lng: ${lng}`;
    formData.append('ubicacion', ubicacionGPS);
    formData.append('descripcion', descripcion);

    // Adjuntar imágenes si existen en nuestra señal
    const imagenes = this.imagenesPrevisualizacion();
    if (imagenes.length > 0) {
      for (let i = 0; i < imagenes.length; i++) {
        formData.append('formato[]', imagenes[i].file);
      }
    }

    // Enviar reporte a través del servicio
    this.reporteService.crearReporte(formData).subscribe({
      next: async (respuesta) => {
        await this.interactionService.showToast('Reporte enviado con éxito', 'success');
        (event.target as HTMLFormElement).reset(); // Limpiar el formulario
        this.limpiarImagenes();
        // Recargar el historial para que aparezca el nuevo reporte
        this.cargarHistorial();
        this.vistaActual.set('historial');
      },
      error: async (error) => {
        console.error('Error enviando reporte:', error);
        await this.interactionService.mostrarError(error);
      }
    });
  }
}
