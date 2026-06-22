export interface IRegistro {
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  correo: string;
  contrasena: string;
  confirmationContra: string;
  idInstitucion: number;
  idSector: number;
  idRol: number;
}

export interface IUsuario {
  id: number;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  correo: string;
  idSector: number | null;
  idRol: number;
  idInstitucion: number | null;
  createdAt?: string;
  updatedAt?: string;
  rol?: { id: number; rol: string };
  Institucion?: { id: number; nombreInstitucion: string; idMunicipio: number };
  sector?: { 
    id: number; 
    nombreSector: string; 
    idMunicipios: number;
    municipio?: {
      id: number;
      nomMunicipio: string;
      idDepartamentos: number;
    }
  };
}

export interface IUsuarioListaItem {
  id: number;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  id_sector: number | null;
  idRol: number;
}

export interface IListarUsuariosResponse {
  lista: IUsuarioListaItem[];
}

export interface IOperacionUsuarioResponse {
  message: string;
  Usuario?: IUsuario;
  user?: IUsuario;
}

export interface IBajaUsuarioResponse {
  message: string;
}
