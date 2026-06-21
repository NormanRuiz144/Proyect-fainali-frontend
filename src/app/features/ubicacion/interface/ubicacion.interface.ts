export interface Departamento {
  id?: number;
  nomDepartamento?: string; // used for creating
  nom_departamento?: string; // typically returned by Adonis backend
  isDeleted: boolean;
}

export interface Municipio {
  id?: number;
  nomMunicipio?: string; // used for creating
  nom_municipio?: string; // typically returned by Adonis
  idDepartamento?: number;
  id_departamento?: number;
  isDeleted: boolean;
}

export interface Sector {
  id?: number;
  nomSector?: string; // expected by validator
  nombreSector?: string; // from model
  nombre_sector?: string; // from DB
  idMunicipio?: number; // expected by validator
  idMunicipios?: number; // from model
  id_municipios?: number; // from DB
  isDeleted: boolean;
}
