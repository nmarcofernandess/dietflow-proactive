import { useState, useEffect, useMemo } from "react";
import { 
  PacienteComStatus, 
  Agendamento, 
  ConfiguracaoGestaoProativa,
  FiltrosGestaoProativa,
  StatusPaciente,
  SituacaoPaciente,
  LocalAtendimento,
  EventoAgenda
} from "@/types/agenda";
import { 
  mockPacientes, 
  mockAgendamentos, 
  mockConfiguracaoGestaoProativa 
} from "@/utils/mockData";
import { 
  processarPacientesComStatus, 
  filtrarPacientes, 
  calcularMetricas 
} from "@/utils/algoritmos";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

export function useAgendaInteligente() {
  // Integrar com hook de configurações
  const { configuracao: configAgenda, isHorarioBloqueado } = useConfiguracoes();
  
  // Estados principais
  const [configuracao, setConfiguracao] = useState<ConfiguracaoGestaoProativa>(mockConfiguracaoGestaoProativa);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Filtros da gestão proativa
  const [filtros, setFiltros] = useState<FiltrosGestaoProativa>({
    status: ["Flow", "Ativo", "Inativo", "Novo"] as StatusPaciente[],
    situacao: ["Agora", "Atrasado", "Próximo"] as SituacaoPaciente[],
    localAtendimento: ["Santa Rita", "Luiz Antonio", "Cornélio", "Londrina", "Online", "Consultório", "Domicílio"] as LocalAtendimento[],
    statusAgendamento: "todos"
  });

  // Processar pacientes com status calculado
  const pacientesComStatus = useMemo(() => {
    return processarPacientesComStatus(mockPacientes, configuracao);
  }, [configuracao]);

  // Aplicar filtros
  const pacientesFiltrados = useMemo(() => {
    return filtrarPacientes(pacientesComStatus, filtros);
  }, [pacientesComStatus, filtros]);

  // Calcular métricas
  const metricas = useMemo(() => {
    return calcularMetricas(pacientesFiltrados);
  }, [pacientesFiltrados]);

  // Agendamentos do dia selecionado
  const agendamentosDoDia = useMemo(() => {
    return agendamentos.filter(agendamento => agendamento.data === dataSelecionada);
  }, [agendamentos, dataSelecionada]);

  // Estatísticas do dia
  const estatisticasDoDia = useMemo(() => {
    const totalDia = agendamentosDoDia.length;
    const confirmadosDia = agendamentosDoDia.filter(a => a.status === "confirmado").length;
    return { total: totalDia, confirmados: confirmadosDia };
  }, [agendamentosDoDia]);

  // Funções para atualizar filtros
  const atualizarFiltroStatus = (status: StatusPaciente[]) => {
    setFiltros(prev => ({ ...prev, status }));
  };

  const atualizarFiltroSituacao = (situacao: SituacaoPaciente[]) => {
    setFiltros(prev => ({ ...prev, situacao }));
  };

  const atualizarFiltroLocal = (localAtendimento: LocalAtendimento[]) => {
    setFiltros(prev => ({ ...prev, localAtendimento }));
  };

  const atualizarFiltroAgendamento = (statusAgendamento: "todos" | "agendados" | "nao_agendados") => {
    setFiltros(prev => ({ ...prev, statusAgendamento }));
  };

  // Função para adicionar novo agendamento
  const adicionarAgendamento = (novoAgendamento: Omit<Agendamento, 'id'>) => {
    const id = Math.max(...agendamentos.map(a => a.id), 0) + 1;
    setAgendamentos(prev => [...prev, { ...novoAgendamento, id }]);
  };

  // Função para atualizar status de agendamento
  const atualizarStatusAgendamento = (id: number, novoStatus: Agendamento['status']) => {
    setAgendamentos(prev => prev.map(agendamento => 
      agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento
    ));
  };

  // Função para atualizar agendamento completo
  const atualizarAgendamento = (agendamentoAtualizado: Agendamento) => {
    setAgendamentos(prev => prev.map(agendamento => 
      agendamento.id === agendamentoAtualizado.id ? agendamentoAtualizado : agendamento
    ));
  };

  // Função para remover agendamento
  const removerAgendamento = (id: number) => {
    setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
  };

  // Função para atualizar configuração
  const atualizarConfiguracao = (novaConfiguracao: Partial<ConfiguracaoGestaoProativa>) => {
    setConfiguracao(prev => ({ ...prev, ...novaConfiguracao }));
  };

  return {
    // Estados
    configuracaoGestao: configuracao,
    agendamentos,
    dataSelecionada,
    filtros,
    
    // Dados processados
    pacientesComStatus,
    pacientesFiltrados,
    metricas,
    agendamentosDoDia,
    estatisticasDoDia,
    
    // Configurações integradas
    configuracao: configAgenda,
    isHorarioBloqueado,
    
    // Ações
    setDataSelecionada,
    atualizarFiltroStatus,
    atualizarFiltroSituacao,
    atualizarFiltroLocal,
    atualizarFiltroAgendamento,
    adicionarAgendamento,
    atualizarStatusAgendamento,
    atualizarAgendamento,
    removerAgendamento,
    atualizarConfiguracao,
  };
}