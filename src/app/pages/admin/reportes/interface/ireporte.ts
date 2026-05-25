export interface IReporte {
  id: number;
  descripcion: string;
  estado: 'Pendiente' | 'En Proceso' | 'Finalizado';
  nvlPrioridad: number;
  fechaGen: string;
  formato: string | null;
  problematica?: {
    problema: string;
  };
  institucion?: {
    id?: number;
    nombreInstitucion: string;
  };
  usuario?: {
    id?: number;
    nombres: string;
    apellidos: string;
    numeroCedula?: string;
    correo?: string;
    sexo?: string | null;
  };
}

export interface IRespuestaReportes {
  lista_Reportes: IReporte[];
}
