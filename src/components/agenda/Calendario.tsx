import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAgendaInteligente } from '@/hooks/useAgendaInteligente';
import { Agendamento, StatusAgendamento, EventoAgenda } from '@/types/agenda';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CheckCircle, 
  Plus, 
  Settings, 
  Monitor,
  AlertCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

interface CalendarioProps {
  onNovoAgendamento: () => void;
  onEditarAgendamento: (agendamento: Agendamento) => void;
  onConfigurarAgenda: () => void;
}

export function Calendario({ 
  onNovoAgendamento, 
  onEditarAgendamento,
  onConfigurarAgenda 
}: CalendarioProps) {
  const { 
    agendamentos, 
    dataSelecionada, 
    setDataSelecionada, 
    agendamentosDoDia, 
    estatisticasDoDia,
    atualizarStatusAgendamento, 
    atualizarAgendamento,
    configuracao,
    isHorarioBloqueado
  } = useAgendaInteligente();

  const { toast } = useToast();
  const calendarRef = useRef<FullCalendar>(null);
  const [visualizacao, setVisualizacao] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('timeGridWeek');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Forçar re-render quando eventos mudam
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    }
  }, [agendamentos]);

  // Converter agendamentos para eventos do FullCalendar
  const eventos: EventoAgenda[] = useMemo(() => {
    return agendamentos.map(agendamento => ({
      id: agendamento.id.toString(),
      title: `${agendamento.pacienteNome} - ${agendamento.tipo}`,
      start: `${agendamento.data}T${agendamento.horario}`,
      end: `${agendamento.data}T${addMinutes(agendamento.horario, agendamento.duracao)}`,
      backgroundColor: getStatusColor(agendamento.status),
      borderColor: getStatusColor(agendamento.status),
      textColor: getTextColor(agendamento.status),
      extendedProps: {
        agendamento,
        pacienteNome: agendamento.pacienteNome,
        statusAgendamento: agendamento.status,
        modalidadeConsulta: agendamento.videoconferencia ? 'online' : 'presencial',
        tipoConsulta: agendamento.tipo,
        valor: '150',
        statusPagamento: 'pendente',
        motivoConsulta: agendamento.observacoes || '',
      },
    }));
  }, [agendamentos]);

  // Função para adicionar minutos ao horário
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  // Cores baseadas no status para FullCalendar
  function getStatusColor(status: StatusAgendamento): string {
    switch (status) {
      case 'agendado': return 'hsl(var(--primary))';
      case 'confirmado': return 'hsl(var(--flow))'; 
      case 'cancelado': return 'hsl(var(--destructive))';
      case 'bloqueado': return 'hsl(var(--muted))';
      default: return 'hsl(var(--primary))';
    }
  }

  function getTextColor(status: StatusAgendamento): string {
    return status === 'bloqueado' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))';
  }

  // Manipular clique em evento
  const handleEventClick = useCallback((info: any) => {
    const agendamento = info.event.extendedProps.agendamento;
    onEditarAgendamento(agendamento);
  }, [onEditarAgendamento]);

  // Manipular clique em data
  const handleDateClick = useCallback((info: any) => {
    setDataSelecionada(info.dateStr);
    onNovoAgendamento();
  }, [onNovoAgendamento, setDataSelecionada]);

  // Manipular seleção de horário
  const handleSelect = useCallback((selectInfo: any) => {
    const startDate = new Date(selectInfo.start);
    const hora = startDate.toTimeString().substring(0, 5);
    
    // Verificar se o horário está bloqueado
    if (isHorarioBloqueado(startDate, hora)) {
      toast({
        title: "Horário bloqueado",
        description: "Este horário não está disponível para agendamento.",
        variant: "destructive"
      });
      return;
    }
    
    // Definir a data selecionada
    const dataStr = selectInfo.startStr.split('T')[0];
    setDataSelecionada(dataStr);
    
    // Abrir modal de novo agendamento
    onNovoAgendamento();
  }, [onNovoAgendamento, setDataSelecionada, isHorarioBloqueado, toast]);

  // Manipular drag e drop de eventos
  const handleEventDrop = useCallback((dropInfo: any) => {
    const { event } = dropInfo;
    
    try {
      const agendamento = agendamentos.find(a => a.id.toString() === event.id);
      if (!agendamento) return;

      const novaData = event.start.toISOString().split('T')[0];
      const novaHora = event.start.toTimeString().substring(0, 5);

      // Verificar se novo horário está bloqueado
      if (isHorarioBloqueado(event.start, novaHora)) {
        dropInfo.revert();
        toast({
          title: "Horário bloqueado",
          description: "Este horário não está disponível.",
          variant: "destructive"
        });
        return;
      }

      const agendamentoAtualizado = {
        ...agendamento,
        data: novaData,
        horario: novaHora
      };

      atualizarAgendamento(agendamentoAtualizado);
      
      toast({
        title: 'Evento movido',
        description: 'O agendamento foi movido com sucesso.',
      });
    } catch (error) {
      dropInfo.revert();
      toast({
        title: 'Erro ao mover evento',
        description: 'Não foi possível mover o agendamento.',
        variant: 'destructive',
      });
    }
  }, [agendamentos, isHorarioBloqueado, atualizarAgendamento, toast]);

  const handleEventResize = useCallback((resizeInfo: any) => {
    const { event } = resizeInfo;
    
    try {
      const agendamento = agendamentos.find(a => a.id.toString() === event.id);
      if (!agendamento) return;

      const inicio = new Date(event.start);
      const fim = new Date(event.end);
      const novaDuracao = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60));

      const agendamentoAtualizado = {
        ...agendamento,
        duracao: novaDuracao
      };

      atualizarAgendamento(agendamentoAtualizado);
      
      toast({
        title: 'Evento redimensionado',
        description: 'A duração do agendamento foi alterada com sucesso.',
      });
    } catch (error) {
      resizeInfo.revert();
      toast({
        title: 'Erro ao redimensionar evento',
        description: 'Não foi possível alterar a duração do agendamento.',
        variant: 'destructive',
      });
    }
  }, [agendamentos, atualizarAgendamento, toast]);

  // Ícones para modalidade e status
  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case 'presencial': return <User className="h-3 w-3" />;
      case 'online': return <Monitor className="h-3 w-3" />;
      case 'hibrido': return <Clock className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado': return <Clock className="h-3 w-3" />;
      case 'confirmado': return <CalendarIcon className="h-3 w-3" />;
      case 'cancelado': return <AlertCircle className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  // Renderizar conteúdo do evento
  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;
    const isSmallView = eventInfo.view.type === 'dayGridMonth';

    if (isSmallView) {
      return (
        <div className="fc-event-content p-1 text-xs">
          <div className="flex items-center gap-1 truncate">
            {getStatusIcon(extendedProps.statusAgendamento)}
            <span className="truncate">{extendedProps.pacienteNome}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="fc-event-content p-2 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {getStatusIcon(extendedProps.statusAgendamento)}
            <span className="font-medium text-sm truncate">
              {extendedProps.pacienteNome}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {getModalidadeIcon(extendedProps.modalidadeConsulta)}
            {extendedProps.statusPagamento === 'pendente' && (
              <DollarSign className="h-3 w-3 text-yellow-600" />
            )}
          </div>
        </div>
        <div className="text-xs text-current/80">
          {extendedProps.tipoConsulta} - R$ {extendedProps.valor}
        </div>
        {extendedProps.motivoConsulta && (
          <div className="text-xs text-current/70 truncate">
            {extendedProps.motivoConsulta}
          </div>
        )}
      </div>
    );
  };

  // Navegação do calendário
  const navegarMes = (direction: 'prev' | 'next') => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') {
        calendarApi.prev();
      } else {
        calendarApi.next();
      }
    }
  };

  const mudarVisualizacao = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setVisualizacao(view as any);
    }
  };

  const irParaHoje = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setDataSelecionada(new Date().toISOString().split('T')[0]);
    }
  };

  const irParaData = (date: Date | undefined) => {
    if (!date) return;
    
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
      setDataSelecionada(date.toISOString().split('T')[0]);
      setDatePickerOpen(false);
    }
  };

  // Configurar horários de funcionamento para o FullCalendar
  const businessHours = useMemo(() => {
    const dias = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const diasPt = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    
    return dias.map((dia, index) => {
      const diaPt = diasPt[index];
      const horario = configuracao?.horarios[diaPt];
      
      if (!horario?.ativo) return null;
      
      return {
        daysOfWeek: [index],
        startTime: horario.inicio,
        endTime: horario.fim
      };
    }).filter(Boolean);
  }, [configuracao]);

  return (
    <div className="space-y-6 p-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agenda Médica</h2>
          <p className="text-muted-foreground">Gerencie seus agendamentos de forma inteligente</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onConfigurarAgenda}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button variant="default" onClick={onNovoAgendamento}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Métricas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Dia</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasDoDia.total}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos para {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-flow">{estatisticasDoDia.confirmados}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasDoDia.total > 0 
                ? `${Math.round((estatisticasDoDia.confirmados / estatisticasDoDia.total) * 100)}% confirmados`
                : 'Nenhum agendamento'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agendamentosDoDia.length > 0 ? agendamentosDoDia[0].horario : '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {agendamentosDoDia.length > 0 ? agendamentosDoDia[0].pacienteNome : 'Nenhum agendamento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{agendamentos.length}</div>
            <p className="text-xs text-muted-foreground">todos os agendamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de navegação e visualização */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarMes('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={irParaHoje}
          >
            <Home className="w-4 h-4 mr-1" />
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarMes('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("w-auto justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(new Date(dataSelecionada), "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(dataSelecionada)}
                onSelect={irParaData}
                initialFocus
                className="pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={visualizacao === 'dayGridMonth' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => mudarVisualizacao('dayGridMonth')}
          >
            Mês
          </Button>
          <Button 
            variant={visualizacao === 'timeGridWeek' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => mudarVisualizacao('timeGridWeek')}
          >
            Semana
          </Button>
          <Button 
            variant={visualizacao === 'timeGridDay' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => mudarVisualizacao('timeGridDay')}
          >
            Dia
          </Button>
          <Button 
            variant={visualizacao === 'listWeek' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => mudarVisualizacao('listWeek')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
          <span>Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--flow))' }}></div>
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
          <span>Cancelado</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="w-3 h-3" />
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3 h-3" />
          <span>Presencial</span>
        </div>
      </div>

      {/* Calendário */}
      <Card>
        <CardContent className="p-0">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={visualizacao}
            locale={ptBrLocale}
            headerToolbar={false}
            events={eventos}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            select={handleSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventContent={renderEventContent}
            selectable={true}
            editable={true}
            droppable={true}
            dayMaxEvents={true}
            weekends={true}
            businessHours={businessHours}
            selectMirror={true}
            nowIndicator={true}
            height="auto"
            aspectRatio={1.8}
            expandRows={true}
            stickyHeaderDates={true}
            dayHeaders={true}
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              hour12: false
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: false
            }}
            selectConstraint="businessHours"
            eventConstraint="businessHours"
            validRange={{
              start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 ano atrás
              end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)    // 1 ano a frente
            }}
            dateAlignment="week"
            dayHeaderClassNames="fc-col-header-cell fc-day"
            dayCellClassNames="fc-daygrid-day"
            viewClassNames="fc-view"
            eventClassNames="fc-event cursor-pointer hover:opacity-80 transition-opacity"
            // selectClassNames="fc-select bg-primary/20"
            unselectAuto={true}
            selectOverlap={false}
            eventOverlap={false}
            slotEventOverlap={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}