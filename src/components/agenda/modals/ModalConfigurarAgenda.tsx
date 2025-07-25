import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Intervalo {
  id: string;
  inicio: string;
  fim: string;
}

interface HorarioDia {
  ativo: boolean;
  inicio: string;
  fim: string;
  intervalos: Intervalo[];
}

interface ConfiguracaoAgenda {
  tempoConsulta: string;
  horarios: Record<string, HorarioDia>;
}

interface ModalConfigurarAgendaProps {
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

export function ModalConfigurarAgenda({ isOpen, onClose }: ModalConfigurarAgendaProps) {
  const { toast } = useToast();
  const [diaAtivo, setDiaAtivo] = useState('segunda');
  
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAgenda>({
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
  });

  const handleDiaToggle = (dia: string, ativo: boolean) => {
    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          ativo
        }
      }
    }));
  };

  const handleHorarioChange = (dia: string, campo: 'inicio' | 'fim', valor: string) => {
    setConfiguracao(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [campo]: valor
        }
      }
    }));
  };

  const adicionarIntervalo = (dia: string) => {
    const novoIntervalo: Intervalo = {
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
  };

  const removerIntervalo = (dia: string, intervaloId: string) => {
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
  };

  const handleIntervaloChange = (dia: string, intervaloId: string, campo: 'inicio' | 'fim', valor: string) => {
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
  };

  const handleSalvar = () => {
    console.log('Salvando configurações da agenda:', configuracao);
    toast({
      title: "Configurações salvas",
      description: "As configurações da agenda foram atualizadas com sucesso.",
    });
    onClose();
  };

  const diasAtivos = DIAS_SEMANA.filter(dia => configuracao.horarios[dia.key].ativo);
  const horarioDiaAtivo = configuracao.horarios[diaAtivo];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-primary" />
            Configurações da Agenda
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
              <TabsTrigger value="horarios">Horários por Dia</TabsTrigger>
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
                      onValueChange={(value) => setConfiguracao(prev => ({ ...prev, tempoConsulta: value }))}
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
            </TabsContent>

            <TabsContent value="horarios" className="space-y-6 mt-6">
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
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione pelo menos um dia de atendimento na aba "Configurações Gerais"</p>
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
                                      onChange={(e) => handleIntervaloChange(diaAtivo, intervalo.id, 'inicio', e.target.value)}
                                      className="w-32"
                                    />
                                    <span className="text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={intervalo.fim}
                                      onChange={(e) => handleIntervaloChange(diaAtivo, intervalo.id, 'fim', e.target.value)}
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