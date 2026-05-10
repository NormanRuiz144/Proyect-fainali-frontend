import { Component, signal, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nuevo-reporte.html',
  styleUrl: './nuevo-reporte.css'
})
export class NuevoReporte implements AfterViewInit, OnDestroy {
  
  ubicacionObtenida = signal(false);
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  // Coordenadas por defecto (Rivas, Nicaragua)
  private defaultLat = 11.4394;
  private defaultLng = -85.8268;

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
    
    alert(`¡Simulación exitosa!\n\nSe enviarán estos datos al backend:\nCoordenadas: Lat ${lat}, Lng ${lng}\n+ idProblematica, idInstitucion, fotos, etc.`);
  }
}
