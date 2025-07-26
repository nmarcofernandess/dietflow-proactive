import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, MapPin, Settings, User } from "lucide-react";
import { mockPacientes } from "@/utils/mockData";
import { NovoAgendamentoForm, TipoConsulta, LocalAtendimento } from "@/types/agenda";
import { useAgendaInteligente } from "@/hooks/useAgendaInteligente";
import { Agendamento } from "@/types/agenda";
import { useEffect } from "react";

interface ModalNovoAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentoEditando?: Agendamento | null;
}

export function ModalNovoAgendamento({ isOpen, onClose, agendamentoEditando }: ModalNovoAgendamentoProps) {
  const { adicionarAgendamento, atualizarAgendamento } = useAgendaInteligente();
  
  const [form, setForm] = useState<NovoAgendamentoForm>({
    pacienteId: 0,
    data: new Date().toISOString().split('T')[0],
    horaInicio: "09:00",
    horaFim: "10:00",
    tipo: "Consulta",
    status: "agendado",
    local: "Consultório",
    videoconferencia: false,
    recorrencia: "nunca",
    controleFinanceiro: true,
    observacoes: "",
    avisarPaciente: true
  });

  // Carregar dados do agendamento para edição
  useEffect(() => {
    if (agendamentoEditando) {
      const duracao = agendamentoEditando.duracao || 60;
      const horaFim = calcularHoraFim(agendamentoEditando.horario, agendamentoEditando.tipo);
      
      setForm({
        pacienteId: agendamentoEditando.pacienteId,
        data: agendamentoEditando.data,
        horaInicio: agendamentoEditando.horario,
        horaFim: horaFim,
        tipo: agendamentoEditando.tipo,
        status: agendamentoEditando.status,
        local: agendamentoEditando.local,
        videoconferencia: agendamentoEditando.videoconferencia || false,
        recorrencia: "nunca",
        controleFinanceiro: agendamentoEditando.controleFinanceiro,
        observacoes: agendamentoEditando.observacoes || "",
        avisarPaciente: agendamentoEditando.avisarPaciente
      });
    } else {
      // Reset para novo agendamento
      setForm({
        pacienteId: 0,
        data: new Date().toISOString().split('T')[0],
        horaInicio: "09:00",
        horaFim: "10:00",
        tipo: "Consulta",
        status: "agendado",
        local: "Consultório",
        videoconferencia: false,
        recorrencia: "nunca",
        controleFinanceiro: true,
        observacoes: "",
        avisarPaciente: true
      });
    }
  }, [agendamentoEditando]);

  const calcularHoraFim = (horaInicio: string, tipo: TipoConsulta) => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const duracao = tipo === "Retorno" ? 45 : 60; // minutos
    
    const inicioMinutos = hora * 60 + minuto;
    const fimMinutos = inicioMinutos + duracao;
    
    const horaFim = Math.floor(fimMinutos / 60);
    const minutoFim = fimMinutos % 60;
    
    return `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit form data:', form);
    
    if (form.pacienteId === 0) {
      alert("Por favor, selecione um paciente");
      return;
    }

    const pacienteSelecionado = mockPacientes.find(p => p.id === form.pacienteId);
    if (!pacienteSelecionado) return;

    const duracao = form.tipo === "Retorno" ? 45 : 60;

    if (agendamentoEditando) {
      // Atualizar agendamento existente
      const agendamentoAtualizado = {
        ...agendamentoEditando,
        pacienteId: form.pacienteId,
        pacienteNome: pacienteSelecionado.nome,
        data: form.data,
        horario: form.horaInicio,
        tipo: form.tipo,
        duracao,
        status: form.status,
        local: form.local,
        observacoes: form.observacoes,
        avisarPaciente: form.avisarPaciente,
        controleFinanceiro: form.controleFinanceiro,
        videoconferencia: form.videoconferencia
      };
      
      atualizarAgendamento(agendamentoAtualizado);
    } else {
      // Criar novo agendamento
      adicionarAgendamento({
        pacienteId: form.pacienteId,
        pacienteNome: pacienteSelecionado.nome,
        data: form.data,
        horario: form.horaInicio,
        tipo: form.tipo,
        duracao,
        status: form.status,
        local: form.local,
        observacoes: form.observacoes,
        avisarPaciente: form.avisarPaciente,
        controleFinanceiro: form.controleFinanceiro,
        videoconferencia: form.videoconferencia
      });
    }

    onClose();
    
    // Reset form
    setForm({
      pacienteId: 0,
      data: new Date().toISOString().split('T')[0],
      horaInicio: "09:00",
      horaFim: "10:00",
      tipo: "Consulta",
      status: "agendado",
      local: "Consultório",
      videoconferencia: false,
      recorrencia: "nunca",
      controleFinanceiro: true,
      observacoes: "",
      avisarPaciente: true
    });
  };

  const updateForm = (field: keyof NovoAgendamentoForm, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calcular hora fim quando hora início ou tipo mudarem
      if (field === 'horaInicio' || field === 'tipo') {
        updated.horaFim = calcularHoraFim(
          field === 'horaInicio' ? value : updated.horaInicio,
          field === 'tipo' ? value : updated.tipo
        );
      }
      
      return updated;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {agendamentoEditando ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {agendamentoEditando 
              ? 'Edite as informações do agendamento abaixo' 
              : 'Crie um novo agendamento preenchendo as informações abaixo'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1: Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Informações do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente">Paciente *</Label>
                  <Select 
                    value={form.pacienteId.toString()} 
                    onValueChange={(value) => updateForm('pacienteId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPacientes.map(paciente => (
                        <SelectItem key={paciente.id} value={paciente.id.toString()}>
                          {paciente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="avisarPaciente"
                    checked={form.avisarPaciente}
                    onCheckedChange={(checked) => updateForm('avisarPaciente', checked)}
                  />
                  <Label htmlFor="avisarPaciente">Enviar notificação para paciente</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Data e Horário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data de Início *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={form.data}
                    onChange={(e) => updateForm('data', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora Início *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => updateForm('horaInicio', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaFim">Hora Fim</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={form.horaFim}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Detalhes da Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Detalhes da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Consulta</Label>
                  <Select 
                    value={form.tipo} 
                    onValueChange={(value: TipoConsulta) => updateForm('tipo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Situação</Label>
                  <Select 
                    value={form.status} 
                    onValueChange={(value) => updateForm('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="local">Local de Atendimento</Label>
                  <Select 
                    value={form.local} 
                    onValueChange={(value: LocalAtendimento) => updateForm('local', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultório">Consultório</SelectItem>
                      <SelectItem value="Domicílio">Domicílio</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Santa Rita">Santa Rita</SelectItem>
                      <SelectItem value="Luiz Antonio">Luiz Antonio</SelectItem>
                      <SelectItem value="Cornélio">Cornélio</SelectItem>
                      <SelectItem value="Londrina">Londrina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="videoconferencia"
                  checked={form.videoconferencia}
                  onCheckedChange={(checked) => updateForm('videoconferencia', checked)}
                />
                <Label htmlFor="videoconferencia">Videoconferência</Label>
              </div>
            </CardContent>
          </Card>

          {/* Seção 4: Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recorrencia">Recorrência</Label>
                  <Select 
                    value={form.recorrencia} 
                    onValueChange={(value) => updateForm('recorrencia', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nunca">Nunca</SelectItem>
                      <SelectItem value="diariamente">Diariamente</SelectItem>
                      <SelectItem value="semanalmente">Semanalmente</SelectItem>
                      <SelectItem value="mensalmente">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="controleFinanceiro"
                    checked={form.controleFinanceiro}
                    onCheckedChange={(checked) => updateForm('controleFinanceiro', checked)}
                  />
                  <Label htmlFor="controleFinanceiro">Controle financeiro</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre o agendamento..."
                  value={form.observacoes}
                  onChange={(e) => updateForm('observacoes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="medical">
              {agendamentoEditando ? 'Salvar Alterações' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}