import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Bot, MessageCircle, Sparkles, Settings, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfiguracaoIA {
  algoritmo: {
    limiteFlow: number;
    limiteAtivo: number;
    janelaAgora: number;
  };
  frequenciaPorLocal: {
    santaRita: number;
    luizAntonio: number;
    cornelio: number;
    londrina: number;
    online: number;
  };
  datasAtendimento: {
    santaRita: string;
    luizAntonio: string;
    cornelio: string;
    londrina: string;
    online: string;
  };
  templatesWhatsApp: {
    clinica: string;
    drMarco: string;
  };
  configuracaoAvancada: {
    recalcularAutomaticamente: boolean;
    alertasPacientesUrgentes: boolean;
    mostrarApenasParaContato: boolean;
  };
}

interface ModalConfigurarGestaoProativaProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAIS_ATENDIMENTO = [
  { key: 'santaRita', label: 'Santa Rita', icon: '🏥' },
  { key: 'luizAntonio', label: 'Luiz Antônio', icon: '🏥' },
  { key: 'cornelio', label: 'Cornélio', icon: '🏥' },
  { key: 'londrina', label: 'Londrina', icon: '🏥' },
  { key: 'online', label: 'Online', icon: '💻' }
];

const TEMPLATE_CLINICA_DEFAULT = `Olá {primeiro_nome}, tudo bem? 
É da Clínica do Nutricionista Marco Fernandes.

▫️ Posso agendar sua {tipo} para {data}?

Aguardo seu retorno! 😊`;

const TEMPLATE_DR_MARCO_DEFAULT = `Olá {primeiro_nome}, tudo bem? 
Aqui é o Marco, nutricionista. 

Notei que já faz {dias_sem_atendimento} dias desde nossa última {ultimo_atendimento}. Como tem se sentido com o protocolo alimentar que prescrevi? 🍎

Que tal agendarmos uma nova consulta para conversarmos e fazermos os ajustes necessários para o seu progresso? 📅

Aguardo seu retorno. Um abraço!`;

export function ModalConfigurarGestaoProativa({ isOpen, onClose }: ModalConfigurarGestaoProativaProps) {
  const { toast } = useToast();
  
  const [configuracao, setConfiguracao] = useState<ConfiguracaoIA>({
    algoritmo: {
      limiteFlow: 30,
      limiteAtivo: 90,
      janelaAgora: 5
    },
    frequenciaPorLocal: {
      santaRita: 15,
      luizAntonio: 15,
      cornelio: 15,
      londrina: 15,
      online: 15
    },
    datasAtendimento: {
      santaRita: new Date().toISOString().split('T')[0],
      luizAntonio: new Date().toISOString().split('T')[0],
      cornelio: new Date().toISOString().split('T')[0],
      londrina: new Date().toISOString().split('T')[0],
      online: new Date().toISOString().split('T')[0]
    },
    templatesWhatsApp: {
      clinica: TEMPLATE_CLINICA_DEFAULT,
      drMarco: TEMPLATE_DR_MARCO_DEFAULT
    },
    configuracaoAvancada: {
      recalcularAutomaticamente: true,
      alertasPacientesUrgentes: true,
      mostrarApenasParaContato: false
    }
  });

  const handleAlgoritmoChange = (campo: keyof typeof configuracao.algoritmo, valor: number) => {
    setConfiguracao(prev => ({
      ...prev,
      algoritmo: {
        ...prev.algoritmo,
        [campo]: valor
      }
    }));
  };

  const handleFrequenciaChange = (local: keyof typeof configuracao.frequenciaPorLocal, valor: number) => {
    setConfiguracao(prev => ({
      ...prev,
      frequenciaPorLocal: {
        ...prev.frequenciaPorLocal,
        [local]: valor
      }
    }));
  };

  const handleDataChange = (local: keyof typeof configuracao.datasAtendimento, valor: string) => {
    setConfiguracao(prev => ({
      ...prev,
      datasAtendimento: {
        ...prev.datasAtendimento,
        [local]: valor
      }
    }));
  };

  const handleTemplateChange = (template: keyof typeof configuracao.templatesWhatsApp, valor: string) => {
    setConfiguracao(prev => ({
      ...prev,
      templatesWhatsApp: {
        ...prev.templatesWhatsApp,
        [template]: valor
      }
    }));
  };

  const handleAvancadaChange = (config: keyof typeof configuracao.configuracaoAvancada, valor: boolean) => {
    setConfiguracao(prev => ({
      ...prev,
      configuracaoAvancada: {
        ...prev.configuracaoAvancada,
        [config]: valor
      }
    }));
  };

  const resetarPadroes = () => {
    setConfiguracao({
      algoritmo: {
        limiteFlow: 30,
        limiteAtivo: 90,
        janelaAgora: 5
      },
      frequenciaPorLocal: {
        santaRita: 15,
        luizAntonio: 15,
        cornelio: 15,
        londrina: 15,
        online: 15
      },
      datasAtendimento: {
        santaRita: new Date().toISOString().split('T')[0],
        luizAntonio: new Date().toISOString().split('T')[0],
        cornelio: new Date().toISOString().split('T')[0],
        londrina: new Date().toISOString().split('T')[0],
        online: new Date().toISOString().split('T')[0]
      },
      templatesWhatsApp: {
        clinica: TEMPLATE_CLINICA_DEFAULT,
        drMarco: TEMPLATE_DR_MARCO_DEFAULT
      },
      configuracaoAvancada: {
        recalcularAutomaticamente: true,
        alertasPacientesUrgentes: true,
        mostrarApenasParaContato: false
      }
    });
    
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas para os valores padrão.",
    });
  };

  const handleSalvar = () => {
    console.log('Salvando configurações de gestão proativa:', configuracao);
    toast({
      title: "Configurações salvas",
      description: "As configurações da gestão proativa foram atualizadas com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-5 h-5 text-primary" />
            Configurações da Gestão Proativa
          </DialogTitle>
          <CardDescription>
            Configure algoritmos, frequências e templates para otimizar o acompanhamento de pacientes
          </CardDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="algoritmo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="algoritmo">Algoritmo</TabsTrigger>
              <TabsTrigger value="frequencias">Frequências</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="avancado">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="algoritmo" className="space-y-6 mt-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    Algoritmo de Classificação de Pacientes
                  </CardTitle>
                  <CardDescription>
                    Configure os parâmetros que definem como os pacientes são classificados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Flow (Pacientes Ativos): {configuracao.algoritmo.limiteFlow} dias</Label>
                        <Slider
                          value={[configuracao.algoritmo.limiteFlow]}
                          onValueChange={(value) => handleAlgoritmoChange('limiteFlow', value[0])}
                          max={45}
                          min={15}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          Pacientes que tiveram atendimento nos últimos X dias
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label>Ativo (Em Acompanhamento): {configuracao.algoritmo.limiteAtivo} dias</Label>
                        <Slider
                          value={[configuracao.algoritmo.limiteAtivo]}
                          onValueChange={(value) => handleAlgoritmoChange('limiteAtivo', value[0])}
                          max={120}
                          min={60}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          Pacientes em acompanhamento regular
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Janela "Agora" (Urgente): ±{configuracao.algoritmo.janelaAgora} dias</Label>
                        <Slider
                          value={[configuracao.algoritmo.janelaAgora]}
                          onValueChange={(value) => handleAlgoritmoChange('janelaAgora', value[0])}
                          max={10}
                          min={3}
                          step={1}
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          Margem de tolerância para contato urgente
                        </p>
                      </div>

                      <Card className="bg-background">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Preview das Classificações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Badge variant="active" className="mr-2">
                            Flow: ≤ {configuracao.algoritmo.limiteFlow} dias
                          </Badge>
                          <br />
                          <Badge variant="secondary" className="mr-2">
                            Ativo: {configuracao.algoritmo.limiteFlow + 1} - {configuracao.algoritmo.limiteAtivo} dias
                          </Badge>
                          <br />
                          <Badge variant="inactive">
                            Inativo: &gt; {configuracao.algoritmo.limiteAtivo} dias
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="frequencias" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Frequência por Local de Atendimento
                  </CardTitle>
                  <CardDescription>
                    Configure a frequência ideal de retorno para cada local
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LOCAIS_ATENDIMENTO.map(local => (
                      <Card key={local.key}>
                        <CardContent className="p-4">
                          <Label className="flex items-center gap-2 mb-3">
                            <span>{local.icon}</span>
                            {local.label}
                          </Label>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              min={7}
                              max={60}
                              value={configuracao.frequenciaPorLocal[local.key as keyof typeof configuracao.frequenciaPorLocal]}
                              onChange={(e) => handleFrequenciaChange(
                                local.key as keyof typeof configuracao.frequenciaPorLocal, 
                                Number(e.target.value)
                              )}
                            />
                            <p className="text-xs text-muted-foreground">dias entre consultas</p>
                          </div>
                          
                          <div className="mt-3 space-y-1">
                            <Label className="text-xs">Próxima data:</Label>
                            <Input
                              type="date"
                              value={configuracao.datasAtendimento[local.key as keyof typeof configuracao.datasAtendimento]}
                              onChange={(e) => handleDataChange(
                                local.key as keyof typeof configuracao.datasAtendimento, 
                                e.target.value
                              )}
                              className="text-xs"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Templates de Mensagens WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Configure as mensagens automáticas que serão enviadas aos pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="template-clinica">Mensagem da Clínica</Label>
                      <Textarea
                        id="template-clinica"
                        value={configuracao.templatesWhatsApp.clinica}
                        onChange={(e) => handleTemplateChange('clinica', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <div className="text-xs text-muted-foreground">
                        <strong>Variáveis disponíveis:</strong> {`{primeiro_nome}, {tipo}, {data}, {local}`}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="template-dr-marco">Mensagem do Dr. Marco</Label>
                      <Textarea
                        id="template-dr-marco"
                        value={configuracao.templatesWhatsApp.drMarco}
                        onChange={(e) => handleTemplateChange('drMarco', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <div className="text-xs text-muted-foreground">
                        <strong>Variáveis disponíveis:</strong> {`{primeiro_nome}, {dias_sem_atendimento}, {ultimo_atendimento}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avancado" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Configurações Avançadas
                  </CardTitle>
                  <CardDescription>
                    Opções avançadas para personalizar o comportamento do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {Object.entries({
                        recalcularAutomaticamente: {
                          label: 'Recalcular Automaticamente',
                          description: 'Atualizar classificações quando configurações mudarem'
                        },
                        alertasPacientesUrgentes: {
                          label: 'Alertas de Pacientes Urgentes',
                          description: 'Destacar visualmente pacientes que precisam de contato urgente'
                        },
                        mostrarApenasParaContato: {
                          label: 'Mostrar Apenas Para Contato',
                          description: 'Filtrar automaticamente apenas pacientes que precisam ser contatados'
                        }
                      }).map(([key, config]) => (
                        <div key={key} className="flex items-start space-x-2 p-4 border rounded-lg">
                          <Checkbox
                            id={key}
                            checked={configuracao.configuracaoAvancada[key as keyof typeof configuracao.configuracaoAvancada]}
                            onCheckedChange={(checked) => 
                              handleAvancadaChange(key as keyof typeof configuracao.configuracaoAvancada, checked as boolean)
                            }
                          />
                          <div className="space-y-1">
                            <Label htmlFor={key} className="font-medium">{config.label}</Label>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Ações do Sistema</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          variant="outline" 
                          onClick={resetarPadroes}
                          className="w-full"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Resetar para Padrões
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Restaurar todas as configurações para os valores padrão do sistema
                        </p>
                      </CardContent>
                    </Card>
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
            <Bot className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}