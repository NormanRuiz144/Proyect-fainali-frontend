import { PaginationMeta } from '../../problematicas/interface/problematica';
import { Sector } from './ubicacion.interface';

export interface ISector {
  id: number;
  nombreSector: string;
  is_deleted: boolean;
}

export interface SectorResponse {
  lista_Sectores: ISector[];
}

export interface ListarSectorPagResponse {
  lista_Sectores: { meta: PaginationMeta; data: Sector[] };
}
