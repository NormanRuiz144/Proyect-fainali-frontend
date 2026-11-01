/** Perfil que devuelve la API para la sesión autenticada. */
export interface ILogin {
  id: number;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  sexo: string | null;
  correo: string;
  /** La API nunca expone la contraseña. */
  idSector: number;
  createdAt: string;
  updatedAt: string;
  sector: {
    id: number;
    nomSector: string;
  } | null;
  /** Es null para ciudadanos y contiene el id del operador para personal autorizado. */
  operador: {
    id: number;
  } | null;
  permisos: string[];

  /** Compatibilidad temporal para componentes heredados no expuestos por el portal. */
  rol?: { rol: string };
  idInstitucion?: number | null;
  institucion?: { id: number; nombreInstitucion: string; idMunicipio: number } | null;

}
