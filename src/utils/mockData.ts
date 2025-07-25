import { Paciente, PacienteComStatus, Agendamento, BloqueioAgenda, ConfiguracaoAgenda, ConfiguracaoGestaoProativa } from "@/types/agenda";

// Mock Pacientes
export const mockPacientes: Paciente[] = [
  { id: 1, nome: "Maria Silva Santos", telefone: "5516987654321", localAtendimento: "Santa Rita", permuta: false },
  { id: 2, nome: "João Pedro Oliveira", telefone: "5516987654322", localAtendimento: "Luiz Antonio", permuta: false },
  { id: 3, nome: "Ana Carolina Ferreira", telefone: "5516987654323", localAtendimento: "Online", permuta: true },
  { id: 4, nome: "Carlos Eduardo Moreira", telefone: "5516987654324", localAtendimento: "Cornélio", permuta: false },
  { id: 5, nome: "Juliana Costa Lima", telefone: "5516987654325", localAtendimento: "Londrina", permuta: false },
  { id: 6, nome: "Roberto Alves Souza", telefone: "5516987654326", localAtendimento: "Consultório", permuta: false },
  { id: 7, nome: "Fernanda Rodrigues", telefone: "5516987654327", localAtendimento: "Domicílio", permuta: true },
  { id: 8, nome: "Lucas Martins Silva", telefone: "5516987654328", localAtendimento: "Online", permuta: false },
  { id: 9, nome: "Patricia Santos Nunes", telefone: "5516987654329", localAtendimento: "Santa Rita", permuta: false },
  { id: 10, nome: "Anderson Lima Costa", telefone: "5516987654330", localAtendimento: "Luiz Antonio", permuta: false },
  { id: 11, nome: "Carla Beatriz Araujo", telefone: "5516987654331", localAtendimento: "Cornélio", permuta: true },
  { id: 12, nome: "Diego Fernando Alves", telefone: "5516987654332", localAtendimento: "Londrina", permuta: false },
  { id: 13, nome: "Gabriela Mendes Rosa", telefone: "5516987654333", localAtendimento: "Online", permuta: false },
  { id: 14, nome: "Henrique Barbosa", telefone: "5516987654334", localAtendimento: "Consultório", permuta: false },
  { id: 15, nome: "Isabella Cristina Ramos", telefone: "5516987654335", localAtendimento: "Domicílio", permuta: true },
];

// Mock Agendamentos (próximas duas semanas)
export const mockAgendamentos: Agendamento[] = [
  {
    id: 1,
    pacienteId: 1,
    pacienteNome: "Maria Silva Santos",
    data: "2025-01-27",
    horario: "09:00",
    tipo: "Consulta",
    duracao: 60,
    status: "confirmado",
    local: "Santa Rita",
    avisarPaciente: true,
    controleFinanceiro: true,
    observacoes: "Primeira consulta"
  },
  {
    id: 2,
    pacienteId: 3,
    pacienteNome: "Ana Carolina Ferreira",
    data: "2025-01-27",
    horario: "14:00",
    tipo: "Retorno",
    duracao: 45,
    status: "agendado",
    local: "Online",
    avisarPaciente: true,
    controleFinanceiro: false,
    videoconferencia: true
  },
  {
    id: 3,
    pacienteId: 6,
    pacienteNome: "Roberto Alves Souza",
    data: "2025-01-28",
    horario: "10:30",
    tipo: "Consulta",
    duracao: 60,
    status: "confirmado",
    local: "Consultório",
    avisarPaciente: true,
    controleFinanceiro: true
  },
  {
    id: 4,
    pacienteId: 8,
    pacienteNome: "Lucas Martins Silva",
    data: "2025-01-29",
    horario: "16:00",
    tipo: "Retorno",
    duracao: 45,
    status: "agendado",
    local: "Online",
    avisarPaciente: true,
    controleFinanceiro: false,
    videoconferencia: true
  },
  {
    id: 5,
    pacienteId: 12,
    pacienteNome: "Diego Fernando Alves",
    data: "2025-01-30",
    horario: "09:30",
    tipo: "Consulta",
    duracao: 60,
    status: "confirmado",
    local: "Londrina",
    avisarPaciente: true,
    controleFinanceiro: true
  }
];

// Mock Bloqueios
export const mockBloqueios: BloqueioAgenda[] = [
  {
    id: 1,
    tipo: "intervalo",
    dataInicial: "2025-02-10",
    dataFinal: "2025-02-14",
    horaInicial: "08:00",
    horaFinal: "18:00",
    titulo: "Férias",
    informacoes: "Período de descanso"
  },
  {
    id: 2,
    tipo: "recorrente",
    dataInicial: "2025-01-25",
    diaSemana: "sabado",
    horaInicial: "12:00",
    horaFinal: "14:00",
    titulo: "Almoço",
    informacoes: "Intervalo para almoço aos sábados"
  }
];

// Configuração padrão da agenda
export const mockConfiguracaoAgenda: ConfiguracaoAgenda = {
  diasTrabalho: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"],
  tempoMedioConsulta: 60,
  horariosPorDia: {
    segunda: { inicio: "08:00", fim: "18:00", intervalos: [{ inicio: "12:00", fim: "13:00" }] },
    terca: { inicio: "08:00", fim: "18:00", intervalos: [{ inicio: "12:00", fim: "13:00" }] },
    quarta: { inicio: "08:00", fim: "18:00", intervalos: [{ inicio: "12:00", fim: "13:00" }] },
    quinta: { inicio: "08:00", fim: "18:00", intervalos: [{ inicio: "12:00", fim: "13:00" }] },
    sexta: { inicio: "08:00", fim: "18:00", intervalos: [{ inicio: "12:00", fim: "13:00" }] },
    sabado: { inicio: "08:00", fim: "12:00" }
  }
};

// Configuração padrão da gestão proativa
export const mockConfiguracaoGestaoProativa: ConfiguracaoGestaoProativa = {
  limitesClassificacao: {
    flow: 30,
    ativo: 90
  },
  frequenciaPorLocal: {
    "Santa Rita": 15,
    "Luiz Antonio": 15,
    "Cornélio": 15,
    "Londrina": 15,
    "Online": 15,
    "Consultório": 15,
    "Domicílio": 15
  },
  datasAtendimentoPorCidade: {
    "Santa Rita": "2025-01-30",
    "Luiz Antonio": "2025-01-31",
    "Cornélio": "2025-02-01",
    "Londrina": "2025-02-02",
    "Online": "2025-01-28",
    "Consultório": "2025-01-27",
    "Domicílio": "2025-01-29"
  },
  templatesWhatsApp: {
    flow: `Olá {primeiro_nome}, tudo bem? 
É da Clínica do Nutricionista Marco Fernandes.

▫️ Posso agendar sua {tipo} para {data}?

Aguardo seu retorno! 😊`,
    ativo: `Olá {primeiro_nome}, tudo bem? 
Aqui é o Marco, nutricionista. 

Notei que já faz um tempo desde nossa última consulta. Como tem se sentido com o protocolo alimentar que prescrevi? 🍎

Que tal agendarmos uma nova consulta para conversarmos e fazermos os ajustes necessários para o seu progresso? 📅

Aguardo seu retorno. Um abraço!`,
    inativo: `Olá {primeiro_nome}, tudo bem? 
Aqui é o Marco, nutricionista. 

Senti sua falta! Como você tem se alimentado? 🍎

Que tal retornarmos com o acompanhamento nutricional? Tenho vagas para {data} em {local}.

Aguardo seu retorno. Um abraço!`,
    novo: `Olá {primeiro_nome}, tudo bem? 
É da Clínica do Nutricionista Marco Fernandes.

Gostaria de agendar sua primeira consulta nutricional para {data} em {local}?

Será um prazer ajudá-lo(a) a alcançar seus objetivos! 😊

Aguardo seu retorno!`
  }
};

// Dados de exemplo de últimos atendimentos para cálculo de status
export const mockUltimosAtendimentos = [
  { pacienteId: 1, data: "2025-01-15", tipo: "Consulta" }, // 12 dias = Flow
  { pacienteId: 2, data: "2024-12-20", tipo: "Retorno" }, // 36 dias = Ativo  
  { pacienteId: 3, data: "2025-01-20", tipo: "Consulta" }, // 7 dias = Flow
  { pacienteId: 4, data: "2024-11-01", tipo: "Consulta" }, // 85 dias = Ativo
  { pacienteId: 5, data: "2024-10-15", tipo: "Retorno" }, // 102 dias = Inativo
  { pacienteId: 6, data: "2025-01-22", tipo: "Consulta" }, // 5 dias = Flow
  { pacienteId: 7, data: "2024-09-10", tipo: "Consulta" }, // 137 dias = Inativo
  { pacienteId: 8, data: "2025-01-10", tipo: "Retorno" }, // 17 dias = Flow
  { pacienteId: 9, data: "2024-12-01", tipo: "Consulta" }, // 55 dias = Ativo
  { pacienteId: 10, data: "2025-01-18", tipo: "Retorno" }, // 9 dias = Flow
  // Pacientes 11-15 são novos (sem atendimento anterior)
];