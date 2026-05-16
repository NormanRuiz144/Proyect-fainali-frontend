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
  usuario?: {
    nombres: string;
    apellidos: string;
  };
}

export interface IRespuestaReportes {
  lista_Reportes: IReporte[];
}
