export interface Institucion {
  id: number;
  nombreInstitucion: string;
  idMunicipio: number;
  created_at?: string;
  updated_at?: string;
  isDeleted: boolean;
}

export interface ListarInstitucionesResponse {
  lista_Instituciones: Institucion[];
}

export interface CrearInstitucionResponse {
  mensaje: string;
  institucione: Institucion;
}

export interface ActualizarInstitucionResponse {
  mensaje: string;
  // institucione: Institucion;
}
