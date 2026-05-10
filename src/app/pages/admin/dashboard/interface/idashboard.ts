export interface IDashboard {
  kpis: {
    reportesActivos: number;
    indiceResolucion: number;
    tiempoPromedioDias: number;
    alertasAltaPrioridad: number;
  };
  porProblema: {
    problema: string;
    total: number;
  }[];
  porSector: {
    sector: string;
    total: number;
  }[];
  institucion: {
    nombre: string;
    cargaTrabajo: number;
  };
  seguimiento: {
    descripcion: string;
    fecha: string | null;
  }[];
}
