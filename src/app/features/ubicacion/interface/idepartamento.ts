import { PaginationMeta } from '../../problematicas/interface/problematica';
import { Departamento } from './ubicacion.interface';

export interface IDepartamento {
  id: number;
  nomDepartamento: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  is_deleted: boolean;
}

export interface DepartamentoResponse {
  lista_Departamentos: IDepartamento[];
}

export interface ListarDepartamentoPagResponse {
  lista_Departamentos: { meta: PaginationMeta; data: Departamento[] };
}
