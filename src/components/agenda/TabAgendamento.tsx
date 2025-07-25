import { useState } from "react";
import { Calendar, Clock, Users, CheckCircle, Plus, Settings, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAgendaInteligente } from "@/hooks/useAgendaInteligente";
import { Agendamento } from "@/types/agenda";

interface TabAgendamentoProps {
  onNovoAgendamento: () => void;
  onConfigurarAgenda: () => void;
  onBloquearAgenda: () => void;
}

export function TabAgendamento({ 
  onNovoAgendamento, 
  onConfigurarAgenda, 
  onBloquearAgenda 
}: TabAgendamentoProps) {
  const { 
    dataSelecionada, 
    setDataSelecionada, 
    agendamentosDoDia, 
    estatisticasDoDia,
    atualizarStatusAgendamento
  } = useAgendaInteligente();

  const [visualizacao, setVisualizacao] = useState<'diario' | 'semanal' | 'mensal'>('diario');

  const getStatusColor = (status: Agendamento['status']) => {
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

  const confirmarAgendamento = (id: number) => {
    atualizarStatusAgendamento(id, 'confirmado');
  };

  const cancelarAgendamento = (id: number) => {
    atualizarStatusAgendamento(id, 'cancelado');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agenda</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Dia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
      </div>

      {/* Controles de visualização */}
      <div className="flex items-center gap-2">
        <Button 
          variant={visualizacao === 'diario' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setVisualizacao('diario')}
        >
          Diário
        </Button>
        <Button 
          variant={visualizacao === 'semanal' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setVisualizacao('semanal')}
        >
          Semanal
        </Button>
        <Button 
          variant={visualizacao === 'mensal' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setVisualizacao('mensal')}
        >
          Mensal
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="px-3 py-2 border border-input rounded-md text-sm"
        />
      </div>

      {/* Lista de agendamentos do dia */}
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
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                  className="p-4 border border-border rounded-lg hover:shadow-medical transition-all duration-300"
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
                      <Badge variant={getStatusColor(agendamento.status)}>
                        {getStatusLabel(agendamento.status)}
                      </Badge>
                      
                      {agendamento.status === 'agendado' && (
                        <div className="flex gap-1">
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