export interface IMunicipio {
  id: number;
  nomMunicipio: string;
  is_deleted: boolean;
}

export interface MunicipioResponse {
  lista_Municipios: IMunicipio[];
}
