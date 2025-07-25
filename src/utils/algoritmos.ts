import { PacienteComStatus, StatusPaciente, SituacaoPaciente, LocalAtendimento, ConfiguracaoGestaoProativa } from "@/types/agenda";
import { mockUltimosAtendimentos, mockAgendamentos } from "./mockData";

/**
 * Formata telefone para padrão WhatsApp brasileiro
 */
export function formatarTelefone(phone: string): string {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  // Adiciona código do país se não tiver
  let formattedPhone = digits.startsWith("55") ? digits : "55" + digits;
  
  // Formatação: 55.DDD.NNNN.NNNN
  if (formattedPhone.length >= 13) {
    return `${formattedPhone.slice(0, 2)}.${formattedPhone.slice(2, 4)}.${formattedPhone.slice(4, 8)}.${formattedPhone.slice(8)}`;
  } else if (formattedPhone.length >= 12) {
    return `${formattedPhone.slice(0, 2)}.${formattedPhone.slice(2, 4)}.${formattedPhone.slice(4, 7)}.${formattedPhone.slice(7)}`;
  }
  
  return formattedPhone;
}

/**
 * Calcula dias entre duas datas
 */
export function calcularDiasEntreDatas(dataInicial: string, dataFinal: string = new Date().toISOString().split('T')[0]): number {
  const inicio = new Date(dataInicial);
  const fim = new Date(dataFinal);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula status do paciente baseado nos dias sem atendimento
 */
export function calcularStatusPaciente(
  diasSemAtendimento: number | null,
  configuracao: ConfiguracaoGestaoProativa
): StatusPaciente {
  if (diasSemAtendimento === null || diasSemAtendimento >= 999) {
    return "Novo";
  }
  
  if (diasSemAtendimento <= configuracao.limitesClassificacao.flow) {
    return "Flow";
  }
  
  if (diasSemAtendimento <= configuracao.limitesClassificacao.ativo) {
    return "Ativo";
  }
  
  return "Inativo";
}

/**
 * Calcula situação temporal do paciente
 */
export function calcularSituacao(
  diasSemAtendimento: number | null,
  localAtendimento: LocalAtendimento,
  configuracao: ConfiguracaoGestaoProativa,
  janelaAgora: number = 5
): SituacaoPaciente {
  if (diasSemAtendimento === null || diasSemAtendimento >= 999) {
    return "Próximo"; // Novos pacientes são para contato futuro
  }
  
  const frequencia = configuracao.frequenciaPorLocal[localAtendimento] || 15;
  
  if (diasSemAtendimento >= frequencia - janelaAgora && diasSemAtendimento <= frequencia + janelaAgora) {
    return "Agora";
  }
  
  if (diasSemAtendimento > frequencia + janelaAgora) {
    return "Atrasado";
  }
  
  return "Próximo";
}

/**
 * Verifica se paciente está agendado
 */
export function verificarSeAgendado(pacienteId: number): boolean {
  return mockAgendamentos.some(agendamento => 
    agendamento.pacienteId === pacienteId && 
    agendamento.status !== "cancelado" &&
    new Date(agendamento.data) >= new Date()
  );
}

/**
 * Cria link do WhatsApp com mensagem personalizada
 */
export function criarLinkWhatsApp(
  nome: string,
  telefone: string,
  tipo: string,
  local: LocalAtendimento,
  template: string,
  datasAtendimento?: Record<string, string>
): string {
  if (!telefone || !nome) return '';
  
  const telefoneFormatado = formatarTelefone(telefone).replace(/\./g, '');
  const primeiroNome = nome.split(' ')[0];
  
  // Obter data da cidade se disponível
  const dataLocal = datasAtendimento?.[local] || '';
  const dataFormatada = dataLocal ? new Date(dataLocal).toLocaleDateString('pt-BR') : local;
  
  // Substituir placeholders na mensagem
  const mensagemPersonalizada = template
    .replace(/\{primeiro_nome\}/g, primeiroNome)
    .replace(/\{tipo\}/g, tipo || 'consulta')
    .replace(/\{data\}/g, dataFormatada)
    .replace(/\{local\}/g, local);
  
  const mensagemCodificada = encodeURIComponent(mensagemPersonalizada);
  
  return `https://api.whatsapp.com/send/?phone=${telefoneFormatado}&text=${mensagemCodificada}&type=phone_number&app_absent=0`;
}

/**
 * Processa dados dos pacientes e calcula status/situação
 */
export function processarPacientesComStatus(
  pacientes: any[],
  configuracao: ConfiguracaoGestaoProativa
): PacienteComStatus[] {
  const hoje = new Date().toISOString().split('T')[0];
  
  return pacientes.map(paciente => {
    // Buscar último atendimento
    const ultimoAtendimento = mockUltimosAtendimentos.find(at => at.pacienteId === paciente.id);
    
    // Calcular dias sem atendimento
    const diasSemAtendimento = ultimoAtendimento 
      ? calcularDiasEntreDatas(ultimoAtendimento.data, hoje)
      : null;
    
    // Calcular status e situação
    const status = calcularStatusPaciente(diasSemAtendimento, configuracao);
    const situacao = calcularSituacao(diasSemAtendimento, paciente.localAtendimento, configuracao);
    
    // Verificar se está agendado
    const agendado = verificarSeAgendado(paciente.id);
    
    // Obter frequência para o local
    const frequenciaAtendimento = configuracao.frequenciaPorLocal[paciente.localAtendimento] || 15;
    
    return {
      ...paciente,
      status,
      situacao,
      ultimoAtendimento: ultimoAtendimento?.data,
      diasSemAtendimento: diasSemAtendimento || 999, // 999 para novos pacientes
      agendado,
      tipoUltimoAtendimento: ultimoAtendimento?.tipo,
      frequenciaAtendimento
    };
  });
}

/**
 * Filtra pacientes baseado nos critérios selecionados
 */
export function filtrarPacientes(
  pacientes: PacienteComStatus[],
  filtros: {
    status: StatusPaciente[];
    situacao: SituacaoPaciente[];
    localAtendimento: LocalAtendimento[];
    statusAgendamento: "todos" | "agendados" | "nao_agendados";
  }
): PacienteComStatus[] {
  return pacientes.filter(paciente => {
    // Filtro por status
    if (!filtros.status.includes(paciente.status)) return false;
    
    // Filtro por situação
    if (!filtros.situacao.includes(paciente.situacao)) return false;
    
    // Filtro por local
    if (!filtros.localAtendimento.includes(paciente.localAtendimento)) return false;
    
    // Filtro por agendamento
    if (filtros.statusAgendamento === "agendados" && !paciente.agendado) return false;
    if (filtros.statusAgendamento === "nao_agendados" && paciente.agendado) return false;
    
    return true;
  });
}

/**
 * Calcula métricas da gestão proativa
 */
export function calcularMetricas(pacientes: PacienteComStatus[]) {
  const total = pacientes.length;
  
  const distribuicaoPorStatus = pacientes.reduce((acc, paciente) => {
    acc[paciente.status] = (acc[paciente.status] || 0) + 1;
    return acc;
  }, {} as Record<StatusPaciente, number>);
  
  const distribuicaoPorSituacao = pacientes.reduce((acc, paciente) => {
    acc[paciente.situacao] = (acc[paciente.situacao] || 0) + 1;
    return acc;
  }, {} as Record<SituacaoPaciente, number>);
  
  const agendados = pacientes.filter(p => p.agendado).length;
  const naoAgendados = total - agendados;
  
  return {
    totalPacientes: total,
    distribuicaoPorStatus,
    distribuicaoPorSituacao,
    pacientesAgendados: agendados,
    pacientesNaoAgendados: naoAgendados
  };
}

/**
 * Gera slots de horário disponíveis para um dia
 */
export function gerarSlotsHorario(
  data: string,
  horaInicio: string,
  horaFim: string,
  duracaoSlot: number = 30,
  intervalos: Array<{ inicio: string; fim: string }> = []
): string[] {
  const slots: string[] = [];
  const inicio = new Date(`${data}T${horaInicio}:00`);
  const fim = new Date(`${data}T${horaFim}:00`);
  
  let current = new Date(inicio);
  
  while (current < fim) {
    const horaSlot = current.toTimeString().slice(0, 5);
    
    // Verificar se não está em intervalo
    const estaEmIntervalo = intervalos.some(intervalo => {
      const inicioIntervalo = `${data}T${intervalo.inicio}:00`;
      const fimIntervalo = `${data}T${intervalo.fim}:00`;
      return current >= new Date(inicioIntervalo) && current < new Date(fimIntervalo);
    });
    
    if (!estaEmIntervalo) {
      slots.push(horaSlot);
    }
    
    current = new Date(current.getTime() + duracaoSlot * 60000);
  }
  
  return slots;
}

/**
 * Valida se um horário está disponível para agendamento
 */
export function validarHorarioDisponivel(
  data: string,
  horario: string,
  duracao: number = 60
): boolean {
  const dataHorario = new Date(`${data}T${horario}:00`);
  const dataFim = new Date(dataHorario.getTime() + duracao * 60000);
  
  // Verificar conflitos com agendamentos existentes
  const conflito = mockAgendamentos.some(agendamento => {
    if (agendamento.data !== data) return false;
    if (agendamento.status === "cancelado") return false;
    
    const agendamentoInicio = new Date(`${data}T${agendamento.horario}:00`);
    const agendamentoFim = new Date(agendamentoInicio.getTime() + agendamento.duracao * 60000);
    
    // Verificar sobreposição
    return (dataHorario < agendamentoFim && dataFim > agendamentoInicio);
  });
  
  return !conflito;
}