export interface IBanRequest {
  userId: number;
  motivo: string;
  tipo: 'permanente' | 'temporal';
  fechaFin?: string;
}

export interface IBannedUser {
  id: number;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    numeroCedula: string;
  };
  motivo: string;
  tipo: 'permanente' | 'temporal';
  fechaBan: string;
  fechaFin?: string;
  activo: boolean;
}

export interface IBaneadosListResponse {
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
  data?: IBannedUser[];
}

export interface IBanearResponse {
  message: string;
}

export interface IDesbanearResponse {
  message: string;
}
