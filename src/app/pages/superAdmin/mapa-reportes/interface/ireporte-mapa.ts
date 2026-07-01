export interface IReporteMapa {
  id: number;
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado' | string | null;
  nvl_prioridad: number | null;
  fecha_gen: string | null;
  descripcion: string | null;
  lat: number;
  lng: number;
  institucion: {
    id: number;
    nombreInstitucion: string;
  } | null;
  problematica: {
    id: number;
    problema: string | null;
  } | null;
}

export interface IReporteMapaFiltros {
  estado?: string;
  idInstitucion?: string;
  idProblematica?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface IReporteMapaResponse {
  total: number;
  totalConUbicacion: number;
  totalSinUbicacion: number;
  data: IReporteMapa[];
}
