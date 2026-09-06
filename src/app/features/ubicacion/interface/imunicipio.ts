import { PaginationMeta } from '../../problematicas/interface/problematica';
import { Municipio } from './ubicacion.interface';

export interface IMunicipio {
  id: number;
  nomMunicipio: string;
  is_deleted: boolean;
}

export interface MunicipioResponse {
  lista_Municipios: IMunicipio[];
}

export interface ListarMunicipioPagResponse {
  lista_Municipios: { meta: PaginationMeta; data: Municipio[] };
}
