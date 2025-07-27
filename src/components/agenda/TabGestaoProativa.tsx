import { useState } from "react";
import { 
  Users, 
  Filter, 
  MessageCircle, 
  Calendar,
  Settings,
  ExternalLink,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAgendaInteligente } from "@/hooks/useAgendaInteligente";
import { criarLinkWhatsApp, formatarTelefone } from "@/utils/algoritmos";
import { StatusPaciente, SituacaoPaciente, LocalAtendimento } from "@/types/agenda";

interface TabGestaoProativaProps {
  onConfigurarGestao: () => void;
  onNovoAgendamento: () => void;
}

export function TabGestaoProativa({ 
  onConfigurarGestao,
  onNovoAgendamento 
}: TabGestaoProativaProps) {
  const {
    configuracao,
    filtros,
    pacientesFiltrados,
    metricas,
    atualizarFiltroStatus,
    atualizarFiltroSituacao,
    atualizarFiltroLocal,
    atualizarFiltroAgendamento
  } = useAgendaInteligente();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const getStatusColor = (status: StatusPaciente) => {
    switch (status) {
      case 'Flow': return 'flow';
      case 'Ativo': return 'active';
      case 'Inativo': return 'inactive';
      case 'Novo': return 'new';
      default: return 'secondary';
    }
  };

  const getSituacaoColor = (situacao: SituacaoPaciente) => {
    switch (situacao) {
      case 'Agora': return 'destructive';
      case 'Atrasado': return 'warning';
      case 'Próximo': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleStatusFilter = (status: StatusPaciente, checked: boolean) => {
    if (checked) {
      atualizarFiltroStatus([...filtros.status, status]);
    } else {
      atualizarFiltroStatus(filtros.status.filter(s => s !== status));
    }
  };

  const handleSituacaoFilter = (situacao: SituacaoPaciente, checked: boolean) => {
    if (checked) {
      atualizarFiltroSituacao([...filtros.situacao, situacao]);
    } else {
      atualizarFiltroSituacao(filtros.situacao.filter(s => s !== situacao));
    }
  };

  const handleLocalFilter = (local: LocalAtendimento, checked: boolean) => {
    if (checked) {
      atualizarFiltroLocal([...filtros.localAtendimento, local]);
    } else {
      atualizarFiltroLocal(filtros.localAtendimento.filter(l => l !== local));
    }
  };

  const gerarLinkWhatsApp = (paciente: any) => {
    const template = "Olá, sua consulta está agendada!"; // configuracao.templatesWhatsApp[paciente.status.toLowerCase() as keyof typeof configuracao.templatesWhatsApp];
    return criarLinkWhatsApp(
      paciente.nome,
      paciente.telefone,
      paciente.tipoUltimoAtendimento || 'consulta',
      paciente.localAtendimento,
      template,
      {} // configuracao.datasAtendimentoPorCidade
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestão Proativa</h2>
          <p className="text-muted-foreground">Gerencie seus pacientes de forma inteligente</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={onConfigurarGestao}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar IA
          </Button>
          <Button variant="medical" onClick={onNovoAgendamento}>
            <Calendar className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">pacientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-flow">{metricas.distribuicaoPorStatus?.Flow || 0}</div>
            <p className="text-xs text-muted-foreground">ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-active">{metricas.distribuicaoPorStatus?.Ativo || 0}</div>
            <p className="text-xs text-muted-foreground">regulares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-inactive">{metricas.distribuicaoPorStatus?.Inativo || 0}</div>
            <p className="text-xs text-muted-foreground">inativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-new">{metricas.distribuicaoPorStatus?.Novo || 0}</div>
            <p className="text-xs text-muted-foreground">prospects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metricas.distribuicaoPorSituacao?.Agora || 0}</div>
            <p className="text-xs text-muted-foreground">para contatar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros Inteligentes</CardTitle>
            <CardDescription>Combine múltiplos critérios para segmentar seus pacientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Status */}
              <div>
                <h4 className="font-medium mb-3">Status</h4>
                <div className="space-y-2">
                  {(['Flow', 'Ativo', 'Inativo', 'Novo'] as StatusPaciente[]).map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filtros.status.includes(status)}
                        onCheckedChange={(checked) => handleStatusFilter(status, checked as boolean)}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm">
                        <Badge variant={getStatusColor(status)} className="mr-2">
                          {status}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Situação */}
              <div>
                <h4 className="font-medium mb-3">Situação</h4>
                <div className="space-y-2">
                  {(['Agora', 'Atrasado', 'Próximo'] as SituacaoPaciente[]).map(situacao => (
                    <div key={situacao} className="flex items-center space-x-2">
                      <Checkbox
                        id={`situacao-${situacao}`}
                        checked={filtros.situacao.includes(situacao)}
                        onCheckedChange={(checked) => handleSituacaoFilter(situacao, checked as boolean)}
                      />
                      <label htmlFor={`situacao-${situacao}`} className="text-sm">
                        <Badge variant={getSituacaoColor(situacao)} className="mr-2">
                          {situacao}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local */}
              <div>
                <h4 className="font-medium mb-3">Local de Atendimento</h4>
                <div className="space-y-2">
                  {(['Santa Rita', 'Luiz Antonio', 'Cornélio', 'Londrina', 'Online', 'Consultório', 'Domicílio'] as LocalAtendimento[]).map(local => (
                    <div key={local} className="flex items-center space-x-2">
                      <Checkbox
                        id={`local-${local}`}
                        checked={filtros.localAtendimento.includes(local)}
                        onCheckedChange={(checked) => handleLocalFilter(local, checked as boolean)}
                      />
                      <label htmlFor={`local-${local}`} className="text-sm">
                        {local}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agendamento */}
              <div>
                <h4 className="font-medium mb-3">Agendamento</h4>
                <Select 
                  value={filtros.statusAgendamento} 
                  onValueChange={(value: "todos" | "agendados" | "nao_agendados") => atualizarFiltroAgendamento(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="agendados">Agendados</SelectItem>
                    <SelectItem value="nao_agendados">Não Agendados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Painel de Controle</CardTitle>
          <CardDescription>
            {pacientesFiltrados.length} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum paciente encontrado com os filtros selecionados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pacientesFiltrados.map((paciente) => (
                <div 
                  key={paciente.id}
                  className="p-4 border border-border rounded-lg hover:shadow-medical transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{paciente.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatarTelefone(paciente.telefone)} • {paciente.localAtendimento}
                        </p>
                        {paciente.ultimoAtendimento && (
                          <p className="text-xs text-muted-foreground">
                            Último atendimento: {new Date(paciente.ultimoAtendimento).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Badge variant={getStatusColor(paciente.status)}>
                          {paciente.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {paciente.diasSemAtendimento < 999 ? `${paciente.diasSemAtendimento} dias` : 'Novo'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={getSituacaoColor(paciente.situacao)}>
                          {paciente.situacao}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {paciente.agendado ? 'Agendado' : 'Livre'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(gerarLinkWhatsApp(paciente), '_blank')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={onNovoAgendamento}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar
                        </Button>
                      </div>
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