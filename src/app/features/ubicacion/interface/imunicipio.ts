export interface IMunicipio {
  id: number;
  nomMunicipio: string;
}

export interface MunicipioResponse {
  lista_Municipios: IMunicipio[];
}
