export interface ILogin {
  id: number;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  correo: string;
  contrasena: string;
  idSector: number;
  idRol: number;
  idInstitucion: number | null;
  createdAt: string;
  updatedAt: string;
  rol: { rol: string };
  institucion?: {
    id: number;
    nombreInstitucion: string;
    idMunicipio: number;
  } | null;
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
