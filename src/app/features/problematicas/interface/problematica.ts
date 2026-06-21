import { Institucion } from '../../instituciones/interface/instituciones';

export interface Problematica {
  id?: number;
  problema: string;
  created_at?: string;
  updated_at?: string;
  isDeleted: boolean;
}

export interface ListarProblematicasResponse {
  lista_Problematicas: Problematica[];
}

export interface CrearProblematicaResponse {
  mensaje: string;
  problematicas: Problematica;
}

export interface ActualizarProblematicaResponse {
  mensaje: string;
  problematica: Problematica;
}

export interface cargarInstitucionesAsociadasResponse {
  lista_instituciones: {
    id: number;
    idInstitucion: number;
    idProblematica: number;
    institucion: Institucion;
  }[];
}
