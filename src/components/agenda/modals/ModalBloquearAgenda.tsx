import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Ban, Clock, CalendarX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BloqueioHorario {
  id: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  motivo: string;
  tipo: 'unico' | 'recorrente';
  recorrencia?: 'semanal' | 'mensal';
}

interface ModalBloquearAgendaProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function ModalBloquearAgenda({ isOpen, onClose }: ModalBloquearAgendaProps) {
  const { toast } = useToast();
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [novoBloqueio, setNovoBloqueio] = useState({
    horaInicio: '12:00',
    horaFim: '13:00',
    motivo: '',
    tipo: 'unico' as 'unico' | 'recorrente',
    recorrencia: 'semanal' as 'semanal' | 'mensal'
  });

  const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([
    {
      id: '1',
      data: new Date(),
      horaInicio: '12:00',
      horaFim: '13:00',
      motivo: 'Almoço',
      tipo: 'recorrente',
      recorrencia: 'semanal'
    }
  ]);

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

    const novoId = Date.now().toString();
    const bloqueio: BloqueioHorario = {
      id: novoId,
      data: dataSelecionada,
      horaInicio: novoBloqueio.horaInicio,
      horaFim: novoBloqueio.horaFim,
      motivo: novoBloqueio.motivo,
      tipo: novoBloqueio.tipo,
      recorrencia: novoBloqueio.tipo === 'recorrente' ? novoBloqueio.recorrencia : undefined
    };

    setBloqueios(prev => [...prev, bloqueio]);
    
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

  const handleRemoverBloqueio = (id: string) => {
    setBloqueios(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Bloqueio removido",
      description: "O bloqueio foi removido com sucesso.",
    });
  };

  const handleSalvar = () => {
    console.log('Salvando bloqueios:', bloqueios);
    toast({
      title: "Bloqueios salvos",
      description: `${bloqueios.length} bloqueio(s) configurado(s) com sucesso.`,
    });
    onClose();
  };

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
            <Ban className="w-5 h-5 text-destructive" />
            Bloquear Horários da Agenda
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
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
                  className="rounded-md border"
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
          <Card className="mt-6">
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
                    <div key={bloqueio.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-medical transition-all">
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
                        onClick={() => handleRemoverBloqueio(bloqueio.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Bloqueios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}