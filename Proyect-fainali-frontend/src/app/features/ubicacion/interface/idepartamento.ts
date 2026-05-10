export interface IDepartamento {
  id: number;
  nomDepartamento: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DepartamentoResponse {
  lista_Departamentos: IDepartamento[];
}
