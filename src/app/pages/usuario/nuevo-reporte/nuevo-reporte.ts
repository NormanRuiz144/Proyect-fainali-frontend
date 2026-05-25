import { Component, signal, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { NuevoReporteService } from './service/nuevo-reporte.service';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nuevo-reporte.html',
  styleUrl: './nuevo-reporte.css'
})
export class NuevoReporte implements OnInit, AfterViewInit, OnDestroy {
  private reporteService = inject(NuevoReporteService);
  ubicacionObtenida = signal(false);
  
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

  // Diccionario para vincular cada problema con una palabra clave de su Institución
  institucionPorProblema: Record<string, string> = {
    'Fuga de agua en la calle': 'ENACAL',
    'Incendio': 'Polic',
    'Alteracion y disturbio': 'Polic',
    'Baches en la calle': 'Alcald',
    'Aguas estancadas': 'MINSA',
    'Cables tendidos': 'ENATREL', 
  };

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  // Coordenadas por defecto para cuando el mapa cargue aparezca rivas por defecto
  private defaultLat = 11.4394;
  private defaultLng = -85.8268;

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.reporteService.obtenerInstituciones().subscribe(res => this.instituciones.set(res.lista_Instituciones || res));
    this.reporteService.obtenerProblematicas().subscribe(res => this.problematicas.set(res.lista_Problematicas || res));
    this.reporteService.obtenerSectores().subscribe(res => this.sectores.set(res.lista_Sectores || res));
    this.reporteService.obtenerMunicipios().subscribe(res => this.municipios.set(res.lista_Municipios || res));
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Configuración para arreglar el problema de las imágenes de Leaflet en Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
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
  }

  // Método para cambiar el placeholder dinámicamente
  cambiarPlaceholder(event: Event) {
    const idSeleccionado = (event.target as HTMLSelectElement).value;
    // Buscamos la problemática seleccionada en el arreglo
    const problema = this.problematicas().find(p => p.id.toString() === idSeleccionado);
    
    // Si encontramos la problemática y tenemos un ejemplo para ella en el diccionario:
    if (problema && this.ejemplosProblematicas[problema.problema]) {
      this.placeholderActual.set(this.ejemplosProblematicas[problema.problema]);

      // LÓGICA DE AUTO-SELECCIÓN DE INSTITUCIÓN
      const palabraClaveInst = this.institucionPorProblema[problema.problema];
      if (palabraClaveInst) {
        // Buscamos la institución en la lista que contenga la palabra clave (ignorando mayúsculas)
        const instEncontrada = this.instituciones().find(i => 
          i.nombreInstitucion.toLowerCase().includes(palabraClaveInst.toLowerCase())
        );

        if (instEncontrada) {
          console.log('✅ Institución encontrada automáticamente:', instEncontrada.nombreInstitucion);
          // Actualizamos la señal, lo que cambiará el select en el HTML
          this.institucionSeleccionada.set(instEncontrada.id.toString());
        } else {
          console.warn('❌ No se encontró ninguna institución en tu base de datos que contenga la palabra:', palabraClaveInst);
        }
      }

    } else {
      // Mensaje por defecto si la problemática no está en el diccionario
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
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación', error);
        alert('No pudimos obtener tu ubicación. Por favor, mueve el pin rojo al lugar del problema manualmente.');
      },
      { enableHighAccuracy: true }
    );
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

    const formData = new FormData();
    // Valores fijos temporales (mientras no hay login)
    formData.append('idUsuario', '2'); 
    formData.append('nvlPrioridad', '5');

    // Valores del formulario
    formData.append('idProblematica', idProblematica);
    formData.append('idInstitucion', idInstitucion);
    formData.append('idSector', idSector);
    
    // El backend espera una "ubicacion", mandaremos las coordenadas y la descripción juntas
    const ubicacionCombinada = `Lat: ${lat}, Lng: ${lng} | Desc: ${descripcion}`;
    formData.append('ubicacion', ubicacionCombinada);

    // Adjuntar imágenes si existen
    if (archivosInput.files && archivosInput.files.length > 0) {
      for (let i = 0; i < archivosInput.files.length; i++) {
        formData.append('formato[]', archivosInput.files[i]);
      }
    }

    this.reporteService.crearReporte(formData).subscribe({
      next: (respuesta) => {
        alert('¡Reporte enviado con exito man!\n' + respuesta.mensaje);
        (event.target as HTMLFormElement).reset(); // Limpiar el formulario
      },
      error: (error) => {
        console.error('Error enviando reporte:', error);
        alert('Hubo un problema enviando el reporte.');
      }
    });
  }
}
