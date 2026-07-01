import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BanService } from '../service/ban-service';
import { InteractionService } from '../../../shared/service/interaction.service';
import { IBannedUser } from '../interface/iban';

@Component({
  selector: 'app-usuarios-baneados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-baneados.html',
  styleUrl: './usuarios-baneados.css',
})
export class UsuariosBaneadosComponent implements OnInit {
  private banService = inject(BanService);
  private interactionService = inject(InteractionService);

  baneados = signal<IBannedUser[]>([]);
  cargando = signal(false);

  ngOnInit() {
    this.cargarBaneados();
  }

  cargarBaneados() {
    this.cargando.set(true);
    this.banService.obtenerBaneados().subscribe({
      next: (res: any) => {
        const rawData = res.data || [];
        this.baneados.set(
          rawData.map((item: any) => {
            const user = item.user ?? {};
            const tipoBan = item.tipo_ban ?? item.tipoBan;

            return {
              id: item.id,
              usuario: {
                id: item.user_id ?? item.userId ?? user.id ?? 0,
                nombres: user.nombres ?? '',
                apellidos: user.apellidos ?? '',
                correo: user.correo ?? '',
                numeroCedula: user.numero_cedula ?? user.numeroCedula ?? '',
              },
              motivo: item.motivo ?? '',
              tipo: tipoBan === 'PERMANENTE' ? 'permanente' : 'temporal',
              fechaBan: item.fecha_inicio ?? item.fechaInicio,
              fechaFin: item.fecha_fin ?? item.fechaFin,
              activo: item.activo,
            };
          })
        );
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios baneados', err);
        this.interactionService.mostrarError(err);
        this.cargando.set(false);
      },
    });
  }

  diasRestantes(fechaFin: string | undefined): number | null {
    if (!fechaFin) return null;

    const [year, month, day] = fechaFin.substring(0, 10).split('-').map(Number);
    if (!year || !month || !day) return null;

    const fin = new Date(year, month - 1, day);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  async desbanear(usuario: IBannedUser) {
    const confirmado = await this.interactionService.confirmar(
      'Desbanear Usuario',
      `¿Estás seguro de que deseas desbanear a "${usuario.usuario.nombres} ${usuario.usuario.apellidos}"?`,
    );
    if (!confirmado) return;

    this.cargando.set(true);
    this.banService.desbanearUsuario(usuario.usuario.id).subscribe({
      next: () => {
        this.interactionService.showToast('Usuario desbaneado exitosamente', 'success');
        this.cargarBaneados();
      },
      error: (err) => {
        console.error('Error al desbanear usuario', err);
        this.interactionService.mostrarError(err);
        this.cargando.set(false);
      },
    });
  }
}
