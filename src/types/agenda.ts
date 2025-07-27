export type StatusPaciente = "Flow" | "Ativo" | "Inativo" | "Novo";
export type SituacaoPaciente = "Agora" | "Atrasado" | "Próximo";
export type LocalAtendimento = "Consultório" | "Domicílio" | "Online" | "Santa Rita" | "Luiz Antonio" | "Cornélio" | "Londrina";
export type StatusAgendamento = "agendado" | "confirmado" | "cancelado" | "bloqueado";
export type TipoConsulta = "Consulta" | "Retorno" | "Outros";
export type TipoBloqueio = "intervalo" | "recorrente";

export interface Paciente {
  id: number;
  nome: string;
  telefone: string;
  localAtendimento: LocalAtendimento;
  permuta: boolean;
}

export interface PacienteComStatus extends Paciente {
  status: StatusPaciente;
  situacao: SituacaoPaciente;
  ultimoAtendimento?: string; // YYYY-MM-DD
  diasSemAtendimento: number;
  agendado: boolean;
  tipoUltimoAtendimento?: string;
  frequenciaAtendimento: number;
}

export interface Agendamento {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  tipo: TipoConsulta;
  duracao: number; // minutos
  status: StatusAgendamento;
  local: LocalAtendimento;
  observacoes?: string;
  avisarPaciente: boolean;
  controleFinanceiro: boolean;
  videoconferencia?: boolean;
}

export interface BloqueioHorario {
  id: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  motivo: string;
  tipo: 'unico' | 'recorrente';
  recorrencia?: 'semanal' | 'mensal';
}

export interface IntervaloHorario {
  id: string;
  inicio: string;
  fim: string;
}

export interface HorarioDia {
  ativo: boolean;
  inicio: string;
  fim: string;
  intervalos: IntervaloHorario[];
}

export interface ConfiguracaoAgenda {
  tempoConsulta: string;
  horarios: {
    [diaSemana: string]: HorarioDia;
  };
}

export interface BloqueioAgenda {
  id: number;
  tipo: TipoBloqueio;
  dataInicial: string; // YYYY-MM-DD
  dataFinal?: string; // YYYY-MM-DD para intervalos
  diaSemana?: string; // para recorrente
  horaInicial: string; // HH:MM
  horaFinal: string; // HH:MM
  titulo?: string;
  informacoes?: string;
}

export interface ConfiguracaoGestaoProativa {
  limitesClassificacao: {
    flow: number; // dias
    ativo: number; // dias
  };
  frequenciaPorLocal: {
    [local: string]: number; // dias
  };
  datasAtendimentoPorCidade: {
    [cidade: string]: string; // YYYY-MM-DD
  };
  templatesWhatsApp: {
    flow: string;
    ativo: string;
    inativo: string;
    novo: string;
  };
}

export interface EstatisticasAgenda {
  totalAgendamentos: number;
  agendamentosConfirmados: number;
  distribuicaoPorStatus: Record<StatusAgendamento, number>;
}

export interface MetricasGestaoProativa {
  totalPacientes: number;
  distribuicaoPorStatus: Record<StatusPaciente, number>;
  distribuicaoPorSituacao: Record<SituacaoPaciente, number>;
  pacientesAgendados: number;
  pacientesNaoAgendados: number;
}

export interface FiltrosGestaoProativa {
  status: StatusPaciente[];
  situacao: SituacaoPaciente[];
  localAtendimento: LocalAtendimento[];
  statusAgendamento: "todos" | "agendados" | "nao_agendados";
}

export interface EventoAgenda {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    agendamento: Agendamento;
    pacienteNome: string;
    statusAgendamento: StatusAgendamento;
    modalidadeConsulta: "presencial" | "online" | "hibrido";
    tipoConsulta: TipoConsulta;
    valor?: string;
    statusPagamento?: "pendente" | "pago" | "cancelado";
    motivoConsulta?: string;
  };
}

export interface NovoAgendamentoForm {
  pacienteId: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: TipoConsulta;
  status: StatusAgendamento;
  local: LocalAtendimento;
  videoconferencia: boolean;
  recorrencia: "nunca" | "diariamente" | "semanalmente" | "mensalmente";
  controleFinanceiro: boolean;
  observacoes: string;
  avisarPaciente: boolean;
}