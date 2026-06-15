export interface ISector {
  id: number;
  nombreSector: string;
  is_deleted: boolean;
}

export interface SectorResponse {
  lista_Sectores: ISector[];
}
