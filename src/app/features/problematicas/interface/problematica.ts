export interface Problematica {
  id?: number;
  problema: string;
  created_at?: string;
  updated_at?: string;
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
