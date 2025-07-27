import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Plus, Clock, Calendar as CalendarIcon, Ban, Settings, CalendarX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { BloqueioHorario } from "@/types/agenda";

interface ModalConfiguracoesProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIAS_SEMANA = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

const TEMPOS_CONSULTA = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora e 30 minutos' },
  { value: '120', label: '2 horas' },
  { value: '150', label: '2 horas e 30 minutos' },
  { value: '180', label: '3 horas' }
];

const TIPOS_BLOQUEIO = [
  { value: 'unico', label: 'Bloqueio único' },
  { value: 'recorrente', label: 'Bloqueio recorrente' }
];

const TIPOS_RECORRENCIA = [
  { value: 'semanal', label: 'Repetir semanalmente' },
  { value: 'mensal', label: 'Repetir mensalmente' }
];

const MOTIVOS_COMUNS = [
  'Reunião',
  'Consulta médica pessoal',
  'Viagem',
  'Feriado',
  'Capacitação',
  'Evento',
  'Manutenção do consultório',
  'Outro'
];

export function ModalConfiguracoes({ isOpen, onClose }: ModalConfiguracoesProps) {
  const { toast } = useToast();
  const {
    configuracao,
    bloqueios,
    updateConfiguracao,
    updateHorarioDia,
    adicionarIntervalo,
    removerIntervalo,
    updateIntervalo,
    adicionarBloqueio,
    removerBloqueio,
  } = useConfiguracoes();

  const [diaAtivo, setDiaAtivo] = useState('segunda');
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [novoBloqueio, setNovoBloqueio] = useState({
    horaInicio: '12:00',
    horaFim: '13:00',
    motivo: '',
    tipo: 'unico' as 'unico' | 'recorrente',
    recorrencia: 'semanal' as 'semanal' | 'mensal'
  });

  const handleDiaToggle = (dia: string, ativo: boolean) => {
    updateHorarioDia(dia, { ativo });
  };

  const handleHorarioChange = (dia: string, campo: 'inicio' | 'fim', valor: string) => {
    updateHorarioDia(dia, { [campo]: valor });
  };

  const handleAdicionarBloqueio = () => {
    if (!dataSelecionada) {
      toast({
        title: "Data obrigatória",
        description: "Selecione uma data para o bloqueio.",
        variant: "destructive"
      });
      return;
    }

    if (!novoBloqueio.motivo.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo do bloqueio.",
        variant: "destructive"
      });
      return;
    }

    if (novoBloqueio.horaInicio >= novoBloqueio.horaFim) {
      toast({
        title: "Horário inválido",
        description: "O horário de início deve ser anterior ao horário de fim.",
        variant: "destructive"
      });
      return;
    }

    const bloqueio: Omit<BloqueioHorario, 'id'> = {
      data: dataSelecionada,
      horaInicio: novoBloqueio.horaInicio,
      horaFim: novoBloqueio.horaFim,
      motivo: novoBloqueio.motivo,
      tipo: novoBloqueio.tipo,
      recorrencia: novoBloqueio.tipo === 'recorrente' ? novoBloqueio.recorrencia : undefined
    };

    adicionarBloqueio(bloqueio);
    
    // Reset form
    setNovoBloqueio({
      horaInicio: '12:00',
      horaFim: '13:00',
      motivo: '',
      tipo: 'unico',
      recorrencia: 'semanal'
    });

    toast({
      title: "Bloqueio adicionado",
      description: `Horário bloqueado para ${format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })}.`,
    });
  };

  const handleSalvar = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da agenda foram atualizadas com sucesso.",
    });
    onClose();
  };

  const diasAtivos = DIAS_SEMANA.filter(dia => configuracao.horarios[dia.key].ativo);
  const horarioDiaAtivo = configuracao.horarios[diaAtivo];

  const bloqueiosParaData = dataSelecionada 
    ? bloqueios.filter(b => 
        format(b.data, 'yyyy-MM-dd') === format(dataSelecionada, 'yyyy-MM-dd')
      )
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Configurações da Agenda
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
              <TabsTrigger value="bloqueios">Bloquear Horários</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Configurações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="tempo-consulta">Tempo médio de consulta</Label>
                    <Select 
                      value={configuracao.tempoConsulta} 
                      onValueChange={(value) => updateConfiguracao({ tempoConsulta: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPOS_CONSULTA.map(tempo => (
                          <SelectItem key={tempo.value} value={tempo.value}>
                            {tempo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Dias de atendimento</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DIAS_SEMANA.map(dia => (
                        <div key={dia.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={dia.key}
                            checked={configuracao.horarios[dia.key].ativo}
                            onCheckedChange={(checked) => handleDiaToggle(dia.key, checked as boolean)}
                          />
                          <Label htmlFor={dia.key} className="text-sm">
                            {dia.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Resumo da configuração</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Tempo de consulta: {TEMPOS_CONSULTA.find(t => t.value === configuracao.tempoConsulta)?.label}</p>
                      <p>Dias ativos: {diasAtivos.length} dia(s)</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {diasAtivos.map(dia => (
                          <Badge key={dia.key} variant="secondary" className="text-xs">
                            {dia.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuração de Horários por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {diasAtivos.map(dia => (
                        <Button
                          key={dia.key}
                          variant={diaAtivo === dia.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiaAtivo(dia.key)}
                        >
                          {dia.label}
                        </Button>
                      ))}
                    </div>

                    {diasAtivos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione pelo menos um dia de atendimento acima</p>
                      </div>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {DIAS_SEMANA.find(d => d.key === diaAtivo)?.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="inicio">Horário de início</Label>
                              <Input
                                type="time"
                                value={horarioDiaAtivo.inicio}
                                onChange={(e) => handleHorarioChange(diaAtivo, 'inicio', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fim">Horário de término</Label>
                              <Input
                                type="time"
                                value={horarioDiaAtivo.fim}
                                onChange={(e) => handleHorarioChange(diaAtivo, 'fim', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Intervalos (pausas)</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => adicionarIntervalo(diaAtivo)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar intervalo
                              </Button>
                            </div>

                            {horarioDiaAtivo.intervalos.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Nenhum intervalo configurado para este dia.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {horarioDiaAtivo.intervalos.map((intervalo) => (
                                  <div key={intervalo.id} className="flex items-center gap-2 p-3 border rounded-lg">
                                    <Input
                                      type="time"
                                      value={intervalo.inicio}
                                      onChange={(e) => updateIntervalo(diaAtivo, intervalo.id, 'inicio', e.target.value)}
                                      className="w-32"
                                    />
                                    <span className="text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={intervalo.fim}
                                      onChange={(e) => updateIntervalo(diaAtivo, intervalo.id, 'fim', e.target.value)}
                                      className="w-32"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removerIntervalo(diaAtivo, intervalo.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bloqueios" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendário */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarX className="w-4 h-4" />
                      Selecionar Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={dataSelecionada}
                      onSelect={setDataSelecionada}
                      locale={ptBR}
                      className="rounded-md border pointer-events-auto"
                    />
                    
                    {dataSelecionada && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm">
                          Data selecionada: {format(dataSelecionada, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        {bloqueiosParaData.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {bloqueiosParaData.length} bloqueio(s) existente(s) nesta data
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Formulário de Novo Bloqueio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Plus className="w-4 h-4" />
                      Novo Bloqueio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hora-inicio">Horário de início</Label>
                        <Input
                          type="time"
                          value={novoBloqueio.horaInicio}
                          onChange={(e) => setNovoBloqueio(prev => ({ ...prev, horaInicio: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hora-fim">Horário de fim</Label>
                        <Input
                          type="time"
                          value={novoBloqueio.horaFim}
                          onChange={(e) => setNovoBloqueio(prev => ({ ...prev, horaFim: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de bloqueio</Label>
                      <Select 
                        value={novoBloqueio.tipo} 
                        onValueChange={(value: 'unico' | 'recorrente') => 
                          setNovoBloqueio(prev => ({ ...prev, tipo: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_BLOQUEIO.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {novoBloqueio.tipo === 'recorrente' && (
                      <div className="space-y-2">
                        <Label htmlFor="recorrencia">Recorrência</Label>
                        <Select 
                          value={novoBloqueio.recorrencia} 
                          onValueChange={(value: 'semanal' | 'mensal') => 
                            setNovoBloqueio(prev => ({ ...prev, recorrencia: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_RECORRENCIA.map(recorrencia => (
                              <SelectItem key={recorrencia.value} value={recorrencia.value}>
                                {recorrencia.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="motivo">Motivo do bloqueio</Label>
                      <Select 
                        value={novoBloqueio.motivo} 
                        onValueChange={(value) => setNovoBloqueio(prev => ({ ...prev, motivo: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione ou digite um motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOTIVOS_COMUNS.map(motivo => (
                            <SelectItem key={motivo} value={motivo}>
                              {motivo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Textarea
                        placeholder="Ou digite um motivo personalizado..."
                        value={novoBloqueio.motivo}
                        onChange={(e) => setNovoBloqueio(prev => ({ ...prev, motivo: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleAdicionarBloqueio}
                      className="w-full"
                      disabled={!dataSelecionada || !novoBloqueio.motivo.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Bloqueio
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Bloqueios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Bloqueios Configurados ({bloqueios.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bloqueios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum bloqueio configurado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bloqueios.map((bloqueio) => (
                        <div key={bloqueio.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">
                                {format(bloqueio.data, "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <Badge variant={bloqueio.tipo === 'recorrente' ? 'secondary' : 'outline'}>
                                {bloqueio.horaInicio} - {bloqueio.horaFim}
                              </Badge>
                              {bloqueio.tipo === 'recorrente' && (
                                <Badge variant="default" className="text-xs">
                                  {bloqueio.recorrencia}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{bloqueio.motivo}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerBloqueio(bloqueio.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}