import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import {
  IBanRequest,
  IBanearResponse,
  IBaneadosListResponse,
  IDesbanearResponse,
} from '../interface/iban';

@Injectable({
  providedIn: 'root',
})
export class BanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/usuarios`;

  banearUsuario(data: IBanRequest): Observable<IBanearResponse> {
    return this.http.post<IBanearResponse>(`${this.apiUrl}/bannear`, {
      userId: data.userId,
      motivo: data.motivo,
      fechaFin: data.fechaFin,
      tipo: data.tipo.toUpperCase(),
    });
  }

  obtenerBaneados(): Observable<IBaneadosListResponse> {
    return this.http.get<IBaneadosListResponse>(`${this.apiUrl}/baneados/listar`);
  }

  desbanearUsuario(id: number): Observable<IDesbanearResponse> {
    return this.http.put<IDesbanearResponse>(`${this.apiUrl}/desbanear/${id}`, {});
  }
}
