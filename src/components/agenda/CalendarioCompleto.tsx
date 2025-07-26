import React, { useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAgendaInteligente } from '@/hooks/useAgendaInteligente';
import { Agendamento, StatusAgendamento } from '@/types/agenda';
import { CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarioCompletoProps {
  onNovoAgendamento: () => void;
  onEditarAgendamento: (agendamento: Agendamento) => void;
}

export function CalendarioCompleto({ onNovoAgendamento, onEditarAgendamento }: CalendarioCompletoProps) {
  const { agendamentos, atualizarStatusAgendamento, removerAgendamento } = useAgendaInteligente();
  const calendarRef = useRef<FullCalendar>(null);

  // Debug: log agendamentos
  console.log('CalendarioCompleto - agendamentos:', agendamentos);

  // Converter agendamentos para eventos do FullCalendar
  const eventos = agendamentos.map(agendamento => {
    const evento = {
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
    };
    console.log('Evento criado:', evento);
    return evento;
  });

  console.log('Todos os eventos:', eventos);

  // Função para adicionar minutos ao horário
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  // Cores baseadas no status
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

  // Manipular clique em evento
  const handleEventClick = useCallback((info: any) => {
    const agendamento = info.event.extendedProps.agendamento;
    onEditarAgendamento(agendamento);
  }, [onEditarAgendamento]);

  // Manipular clique em data
  const handleDateClick = useCallback((info: any) => {
    onNovoAgendamento();
  }, [onNovoAgendamento]);

  // Manipular seleção de horário
  const handleSelect = useCallback((info: any) => {
    onNovoAgendamento();
  }, [onNovoAgendamento]);

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
    }
  };

  const irParaHoje = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  };

  return (
    <Card className="p-6">
      {/* Cabeçalho com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Agenda Médica</h2>
          <p className="text-muted-foreground">Gerencie seus agendamentos e consultas</p>
        </div>
        
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
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarVisualizacao('dayGridMonth')}
            >
              Mês
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarVisualizacao('timeGridWeek')}
            >
              Semana
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarVisualizacao('timeGridDay')}
            >
              Dia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarVisualizacao('listWeek')}
            >
              Lista
            </Button>
          </div>
          
          <Button onClick={onNovoAgendamento}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Legenda de status */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
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
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={eventos}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          selectable={true}
          dayMaxEvents={true}
          height="auto"
          eventDisplay="block"
        />
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-primary/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">
            {agendamentos.filter(a => a.status === 'agendado').length}
          </div>
          <div className="text-sm text-muted-foreground">Agendados</div>
        </div>
        
        <div className="p-4 bg-success/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-success">
            {agendamentos.filter(a => a.status === 'confirmado').length}
          </div>
          <div className="text-sm text-muted-foreground">Confirmados</div>
        </div>
        
        <div className="p-4 bg-destructive/10 rounded-lg text-center">
          <div className="text-2xl font-bold text-destructive">
            {agendamentos.filter(a => a.status === 'cancelado').length}
          </div>
          <div className="text-sm text-muted-foreground">Cancelados</div>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl font-bold text-muted-foreground">
            {agendamentos.length}
          </div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>
    </Card>
  );
}