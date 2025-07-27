import { useState, useEffect, useCallback } from 'react';
import { ConfiguracaoAgenda, BloqueioHorario, HorarioDia } from '@/types/agenda';

const CONFIGURACAO_STORAGE_KEY = 'configuracaoAgenda';
const BLOQUEIOS_STORAGE_KEY = 'bloqueiosAgenda';

const CONFIGURACAO_INICIAL: ConfiguracaoAgenda = {
  tempoConsulta: '60',
  horarios: {
    segunda: { ativo: true, inicio: '08:00', fim: '17:00', intervalos: [] },
    terca: { ativo: true, inicio: '08:00', fim: '17:00', intervalos: [] },
    quarta: { ativo: true, inicio: '08:00', fim: '17:00', intervalos: [] },
    quinta: { ativo: true, inicio: '08:00', fim: '17:00', intervalos: [] },
    sexta: { ativo: true, inicio: '08:00', fim: '17:00', intervalos: [] },
    sabado: { ativo: false, inicio: '08:00', fim: '12:00', intervalos: [] },
    domingo: { ativo: false, inicio: '08:00', fim: '12:00', intervalos: [] }
  }
};

export const useConfiguracoes = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAgenda>(CONFIGURACAO_INICIAL);
  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const savedConfiguracao = localStorage.getItem(CONFIGURACAO_STORAGE_KEY);
      const savedBloqueios = localStorage.getItem(BLOQUEIOS_STORAGE_KEY);

      if (savedConfiguracao) {
        setConfiguracao(JSON.parse(savedConfiguracao));
      }

      if (savedBloqueios) {
        const parsedBloqueios = JSON.parse(savedBloqueios);
        // Converter strings de data de volta para objetos Date
        const bloqueiosComData = parsedBloqueios.map((bloqueio: any) => ({
          ...bloqueio,
          data: new Date(bloqueio.data)
        }));
        setBloqueios(bloqueiosComData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persistir configurações quando mudarem
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CONFIGURACAO_STORAGE_KEY, JSON.stringify(configuracao));
    }
  }, [configuracao, loading]);

  // Persistir bloqueios quando mudarem
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(BLOQUEIOS_STORAGE_KEY, JSON.stringify(bloqueios));
    }
  }, [bloqueios, loading]);

  // Sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONFIGURACAO_STORAGE_KEY && e.newValue) {
        try {
          setConfiguracao(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Erro ao sincronizar configurações:', error);
        }
      }

      if (e.key === BLOQUEIOS_STORAGE_KEY && e.newValue) {
        try {
          const parsedBloqueios = JSON.parse(e.newValue);
          const bloqueiosComData = parsedBloqueios.map((bloqueio: any) => ({
            ...bloqueio,
            data: new Date(bloqueio.data)
          }));
          setBloqueios(bloqueiosComData);
        } catch (error) {
          console.error('Erro ao sincronizar bloqueios:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Atualizar configuração geral
  const updateConfiguracao = useCallback((novaConfiguracao: Partial<ConfiguracaoAgenda>) => {
    setConfiguracao(prev => ({ ...prev, ...novaConfiguracao }));
  }, []);

  // Atualizar horário de um dia específico
  const updateHorarioDia = useCallback((dia: string, horario: Partial<HorarioDia>) => {
    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          ...horario
        }
      }
    }));
  }, []);

  // Adicionar intervalo a um dia
  const adicionarIntervalo = useCallback((dia: string) => {
    const novoIntervalo = {
      id: Date.now().toString(),
      inicio: '12:00',
      fim: '13:00'
    };

    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          intervalos: [...prev.horarios[dia].intervalos, novoIntervalo]
        }
      }
    }));
  }, []);

  // Remover intervalo de um dia
  const removerIntervalo = useCallback((dia: string, intervaloId: string) => {
    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          intervalos: prev.horarios[dia].intervalos.filter(i => i.id !== intervaloId)
        }
      }
    }));
  }, []);

  // Atualizar intervalo específico
  const updateIntervalo = useCallback((dia: string, intervaloId: string, campo: 'inicio' | 'fim', valor: string) => {
    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          intervalos: prev.horarios[dia].intervalos.map(intervalo =>
            intervalo.id === intervaloId
              ? { ...intervalo, [campo]: valor }
              : intervalo
          )
        }
      }
    }));
  }, []);

  // Adicionar bloqueio
  const adicionarBloqueio = useCallback((bloqueio: Omit<BloqueioHorario, 'id'>) => {
    const novoBloqueio: BloqueioHorario = {
      ...bloqueio,
      id: Date.now().toString()
    };

    setBloqueios(prev => [...prev, novoBloqueio]);
    return novoBloqueio;
  }, []);

  // Remover bloqueio
  const removerBloqueio = useCallback((id: string) => {
    setBloqueios(prev => prev.filter(b => b.id !== id));
  }, []);

  // Validar se horário está bloqueado
  const isHorarioBloqueado = useCallback((data: Date, hora: string) => {
    return bloqueios.some(bloqueio => {
      const mesmoDia = bloqueio.data.toDateString() === data.toDateString();
      const horaNum = parseInt(hora.replace(':', ''));
      const inicioNum = parseInt(bloqueio.horaInicio.replace(':', ''));
      const fimNum = parseInt(bloqueio.horaFim.replace(':', ''));
      
      return mesmoDia && horaNum >= inicioNum && horaNum < fimNum;
    });
  }, [bloqueios]);

  // Obter horários disponíveis para um dia
  const getHorariosDisponiveis = useCallback((data: Date) => {
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][data.getDay()];
    const horarioDia = configuracao.horarios[diaSemana];
    
    if (!horarioDia?.ativo) {
      return [];
    }

    const horarios: string[] = [];
    const inicio = horarioDia.inicio;
    const fim = horarioDia.fim;
    const tempoConsulta = parseInt(configuracao.tempoConsulta);
    
    // Gerar slots de horário
    let horaAtual = inicio;
    while (horaAtual < fim) {
      // Verificar se não está em intervalo de pausa
      const emIntervalo = horarioDia.intervalos.some(intervalo => 
        horaAtual >= intervalo.inicio && horaAtual < intervalo.fim
      );
      
      // Verificar se não está bloqueado
      const bloqueado = isHorarioBloqueado(data, horaAtual);
      
      if (!emIntervalo && !bloqueado) {
        horarios.push(horaAtual);
      }
      
      // Avançar para próximo slot
      const [hora, minuto] = horaAtual.split(':').map(Number);
      const proximoMinuto = hora * 60 + minuto + tempoConsulta;
      const proximaHora = Math.floor(proximoMinuto / 60);
      const proximoMin = proximoMinuto % 60;
      horaAtual = `${proximaHora.toString().padStart(2, '0')}:${proximoMin.toString().padStart(2, '0')}`;
    }
    
    return horarios;
  }, [configuracao, isHorarioBloqueado]);

  return {
    configuracao,
    bloqueios,
    loading,
    updateConfiguracao,
    updateHorarioDia,
    adicionarIntervalo,
    removerIntervalo,
    updateIntervalo,
    adicionarBloqueio,
    removerBloqueio,
    isHorarioBloqueado,
    getHorariosDisponiveis,
  };
};