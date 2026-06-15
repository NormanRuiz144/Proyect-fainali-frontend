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
