export interface ISuperAdminDashboard {
  kpis: {
    totalReportes: number;
    reportesActivos: number;
    reportesFinalizados: number;
    indiceResolucion: number;
    tiempoPromedioDias: number;
    alertasAltaPrioridad: number;
    baneosActivos: number;
  };
  instituciones: {
    total: number;
    ranking: {
      id: number;
      nombre: string;
      totalReportes: number;
      reportesActivos: number;
      indiceResolucion: number;
      tiempoPromedioDias: number;
    }[];
    sinAdmin: {
      id: number;
      nombre: string;
    }[];
  };
  reportes: {
    porEstado: {
      estado: string;
      total: number;
    }[];
    tendencia: {
      fecha: string;
      total: number;
    }[];
  };
  problemasFrecuentes: {
    problema: string;
    total: number;
  }[];
  zonasActivas: {
    sector: string;
    municipio: string;
    total: number;
  }[];
  usuariosModeracion: {
    totalUsuarios: number;
    ciudadanos: number;
    admins: number;
    porRol: {
      rol: string;
      total: number;
    }[];
    baneos: {
      activos: number;
      temporales: number;
      permanentes: number;
      porVencer: {
        userId: number;
        nombre: string;
        fechaFin: string | null;
        diasRestantes: number | null;
      }[];
    };
  };
  alertas: {
    reportesAltaPrioridad: {
      id: number;
      estado: string;
      fecha: string;
      prioridad: number;
    }[];
    reportesPendientesAntiguos: {
      id: number;
      estado: string;
      fecha: string;
      diasPendiente: number;
    }[];
    institucionesSinAdmin: {
      id: number;
      nombre: string;
    }[];
    baneosPorVencer: {
      userId: number;
      nombre: string;
      fechaFin: string | null;
      diasRestantes: number | null;
    }[];
  };
  actividadReciente: {
    tipo: 'reporte' | 'seguimiento' | 'baneo';
    descripcion: string;
    fecha: string | null;
  }[];
}
