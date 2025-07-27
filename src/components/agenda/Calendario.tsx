import React, { useRef, useCallback, useState } from 'react';
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
  Lock 
} from 'lucide-react';
import { toast } from 'sonner';

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

  const calendarRef = useRef<FullCalendar>(null);
  const [visualizacao, setVisualizacao] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');

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
    },
  }));

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
  const handleSelect = useCallback((info: any) => {
    setDataSelecionada(info.startStr.split('T')[0]);
    onNovoAgendamento();
  }, [onNovoAgendamento, setDataSelecionada]);

  // Renderizar conteúdo do evento
  const renderEventContent = (eventInfo: any) => {
    const agendamento = eventInfo.event.extendedProps.agendamento;
    
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{agendamento.pacienteNome}</div>
        <div className="text-xs opacity-90 truncate">{agendamento.tipo}</div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          <span>{agendamento.horario}</span>
        </div>
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
      <Card className="p-6">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // Usar nossos próprios controles
            events={eventos}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            select={handleSelect}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventContent={renderEventContent}
            height="auto"
            locale="pt-br"
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            expandRows={true}
            eventDisplay="block"
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Segunda a sexta
              startTime: '08:00',
              endTime: '18:00',
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: false
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </div>
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