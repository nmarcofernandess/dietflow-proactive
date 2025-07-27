import React, { useRef, useCallback, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAgendaInteligente } from '@/hooks/useAgendaInteligente';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Agendamento, StatusAgendamento } from '@/types/agenda';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CheckCircle, 
  Plus, 
  Settings, 
  Lock,
  Monitor,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

interface CalendarioProps {
  onNovoAgendamento: () => void;
  onEditarAgendamento: (agendamento: Agendamento) => void;
  onConfigurarAgenda: () => void;
  onBloquearAgenda: () => void;
}

export function Calendario({ 
  onNovoAgendamento, 
  onEditarAgendamento,
  onConfigurarAgenda,
  onBloquearAgenda 
}: CalendarioProps) {
  const { 
    agendamentos, 
    dataSelecionada, 
    setDataSelecionada, 
    agendamentosDoDia, 
    estatisticasDoDia,
    atualizarStatusAgendamento, 
    removerAgendamento 
  } = useAgendaInteligente();

  const { configuracao, isHorarioBloqueado } = useConfiguracoes();
  const { toast } = useToast();
  const calendarRef = useRef<FullCalendar>(null);
  const [visualizacao, setVisualizacao] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('timeGridWeek');

  // Forçar re-render quando eventos mudam
  useEffect(() => {
    if (calendarRef.current) {
      setTimeout(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.refetchEvents();
      }, 0);
    }
  }, [agendamentos]);

  // Converter agendamentos para eventos do FullCalendar
  const eventos = agendamentos.map(agendamento => ({
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

  // Função para fornecer eventos ao FullCalendar
  const eventsFunction = useCallback((info: any, successCallback: any) => {
    successCallback(eventos);
  }, [eventos]);

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
      case 'agendado': return 'hsl(210 100% 56%)';  // Primary blue
      case 'confirmado': return 'hsl(142 76% 36%)'; // Success green  
      case 'cancelado': return 'hsl(0 84% 60%)';    // Destructive red
      case 'bloqueado': return 'hsl(215 16% 47%)';  // Muted gray
      default: return 'hsl(210 100% 56%)';
    }
  }

  function getTextColor(status: StatusAgendamento): string {
    return status === 'bloqueado' ? 'hsl(var(--muted-foreground))' : '#ffffff';
  }

  // Cores para badges da lista
  const getBadgeColor = (status: Agendamento['status']) => {
    switch (status) {
      case 'confirmado': return 'flow';
      case 'agendado': return 'warning';
      case 'cancelado': return 'inactive';
      case 'bloqueado': return 'muted';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: Agendamento['status']) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'agendado': return 'Agendado';
      case 'cancelado': return 'Cancelado';
      case 'bloqueado': return 'Bloqueado';
      default: return status;
    }
  };

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
    
    setDataSelecionada(selectInfo.startStr.split('T')[0]);
    onNovoAgendamento();
  }, [onNovoAgendamento, setDataSelecionada, isHorarioBloqueado, toast]);

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
          {extendedProps.tipoConsulta.replace('_', ' ')} - R$ {extendedProps.valor}
        </div>
        {extendedProps.motivoConsulta && (
          <div className="text-xs text-current/70 truncate">
            {extendedProps.motivoConsulta}
          </div>
        )}
      </div>
    );
  };

  // Botões de navegação customizados
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
    }
  };

  const confirmarAgendamento = (id: number) => {
    atualizarStatusAgendamento(id, 'confirmado');
  };

  const cancelarAgendamento = (id: number) => {
    atualizarStatusAgendamento(id, 'cancelado');
  };

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
          <Button variant="outline" onClick={onBloquearAgenda}>
            <Lock className="w-4 h-4 mr-2" />
            Bloquear
          </Button>
          <Button variant="medical" onClick={onNovoAgendamento}>
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
            ← Anterior
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={irParaHoje}
          >
            Hoje
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navegarMes('next')}
          >
            Próximo →
          </Button>
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
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm bg-background"
          />
        </div>
      </div>

      {/* Legenda de status */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary"></div>
          <span className="text-sm">Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142 76% 36%)' }}></div>
          <span className="text-sm">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive"></div>
          <span className="text-sm">Cancelado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted"></div>
          <span className="text-sm">Bloqueado</span>
        </div>
      </div>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          <div className="calendar-container">
            <style>{`
              .calendar-container .fc {
                --fc-small-font-size: 0.75rem;
                --fc-page-bg-color: transparent;
                --fc-neutral-bg-color: hsl(var(--muted));
                --fc-neutral-text-color: hsl(var(--muted-foreground));
                --fc-border-color: hsl(var(--border));
                --fc-button-text-color: hsl(var(--primary-foreground));
                --fc-button-bg-color: hsl(var(--primary));
                --fc-button-border-color: hsl(var(--primary));
                --fc-button-hover-bg-color: hsl(var(--primary));
                --fc-button-hover-border-color: hsl(var(--primary));
                --fc-button-active-bg-color: hsl(var(--primary));
                --fc-button-active-border-color: hsl(var(--primary));
                --fc-event-bg-color: hsl(var(--primary));
                --fc-event-border-color: hsl(var(--primary));
                --fc-event-text-color: hsl(var(--primary-foreground));
                --fc-today-bg-color: hsl(var(--accent) / 0.3);
              }

              .calendar-container .fc-event {
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 6px;
                border-width: 1px;
                margin: 1px;
              }

              .calendar-container .fc-event:hover {
                filter: brightness(1.1);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }

              .calendar-container .fc-toolbar-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: hsl(var(--foreground));
              }

              .calendar-container .fc-button {
                border-radius: 6px;
                font-weight: 500;
                padding: 0.5rem 1rem;
                transition: all 0.2s ease;
              }

              .calendar-container .fc-button:not(:disabled):hover {
                transform: translateY(-1px);
              }

              .calendar-container .fc-daygrid-day-number {
                color: hsl(var(--foreground));
                font-weight: 500;
              }

              .calendar-container .fc-col-header-cell-cushion {
                color: hsl(var(--muted-foreground));
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.75rem;
                letter-spacing: 0.05em;
              }

              .calendar-container .fc-timegrid-slot-label-cushion {
                color: hsl(var(--muted-foreground));
                font-size: 0.75rem;
              }

              .calendar-container .fc-scrollgrid {
                border-color: hsl(var(--border));
              }

              .calendar-container .fc-scrollgrid td {
                border-color: hsl(var(--border));
              }

              @media (max-width: 768px) {
                .calendar-container .fc-toolbar {
                  flex-direction: column;
                  gap: 0.5rem;
                }

                .calendar-container .fc-toolbar-chunk {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 0.25rem;
                }

                .calendar-container .fc-button {
                  padding: 0.25rem 0.5rem;
                  font-size: 0.75rem;
                }

                .calendar-container .fc-toolbar-title {
                  font-size: 1.25rem;
                  margin: 0.5rem 0;
                }
              }
            `}</style>

            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={window.innerWidth >= 768 ? 'timeGridWeek' : 'dayGridDay'}
              locale={ptBrLocale}
              timeZone="America/Sao_Paulo"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay configuracoes bloquear novaTarefa',
              }}
              customButtons={{
                novaTarefa: {
                  text: 'Nova Consulta',
                  click: () => onNovoAgendamento(),
                },
                configuracoes: {
                  text: 'Configurações',
                  click: () => onConfigurarAgenda(),
                },
                bloquear: {
                  text: 'Bloquear',
                  click: () => onBloquearAgenda(),
                },
              }}
              events={eventsFunction}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              select={handleSelect}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              eventOverlap={false}
              selectOverlap={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              businessHours={Object.entries(configuracao.horarios)
                .filter(([_, horario]) => horario.ativo)
                .map(([dia, horario]) => ({
                  daysOfWeek: [
                    ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].indexOf(dia)
                  ],
                  startTime: horario.inicio,
                  endTime: horario.fim,
                }))}
              slotDuration={`00:${configuracao.tempoConsulta || '60'}:00`}
              slotLabelInterval="01:00:00"
              height="auto"
              contentHeight="600px"
              nowIndicator={true}
              scrollTime="08:00:00"
              eventDisplay="block"
              dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
              }}
              allDaySlot={false}
              expandRows={true}
              handleWindowResize={true}
              stickyHeaderDates={true}
              aspectRatio={window.innerWidth >= 768 ? 2 : 1.2}
              eventClassNames={(arg) => {
                const evento = eventos.find(e => e.id === arg.event.id);
                if (!evento) return [];
                
                return [
                  `event-status-${evento.extendedProps.statusAgendamento}`,
                  `event-modalidade-${evento.extendedProps.modalidadeConsulta}`,
                  evento.extendedProps.statusPagamento === 'pendente' ? 'event-payment-pending' : '',
                ].filter(Boolean);
              }}
            />
          </div>

          {/* Legenda */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Legenda</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <h5 className="font-medium mb-2">Status</h5>
                <div className="space-y-1">
                  {[
                    { status: 'agendado', color: 'bg-primary', label: 'Agendado' },
                    { status: 'confirmado', color: 'bg-emerald-500', label: 'Confirmado' },
                    { status: 'cancelado', color: 'bg-destructive', label: 'Cancelado' },
                    { status: 'bloqueado', color: 'bg-muted', label: 'Bloqueado' },
                  ].map(({ status, color, label }) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Modalidade</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Presencial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3 w-3" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Híbrido</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Indicadores</h5>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-yellow-600" />
                    <span>Pagamento pendente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    <span>Requer atenção</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos do dia selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agendamentos de {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
          </CardTitle>
          <CardDescription>
            {agendamentosDoDia.length} agendamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agendamentosDoDia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para esta data</p>
              <Button variant="outline" className="mt-4" onClick={onNovoAgendamento}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentosDoDia.map((agendamento) => (
                <div 
                  key={agendamento.id}
                  className="p-4 border border-border rounded-lg hover:shadow-medical transition-all duration-300 cursor-pointer"
                  onClick={() => onEditarAgendamento(agendamento)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{agendamento.horario}</div>
                        <div className="text-xs text-muted-foreground">{agendamento.duracao}min</div>
                      </div>
                      
                      <Separator orientation="vertical" className="h-12" />
                      
                      <div>
                        <h4 className="font-semibold text-foreground">{agendamento.pacienteNome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {agendamento.tipo} • {agendamento.local}
                          {agendamento.videoconferencia && " • Videoconferência"}
                        </p>
                        {agendamento.observacoes && (
                          <p className="text-xs text-muted-foreground mt-1">{agendamento.observacoes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeColor(agendamento.status)}>
                        {getStatusLabel(agendamento.status)}
                      </Badge>
                      
                      {agendamento.status === 'agendado' && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="flow" 
                            size="sm"
                            onClick={() => confirmarAgendamento(agendamento.id)}
                          >
                            Confirmar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}