import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Bot, Sparkles } from "lucide-react";
import { TabAgendamento } from "@/components/agenda/TabAgendamento";
import { TabGestaoProativa } from "@/components/agenda/TabGestaoProativa";
import { ModalNovoAgendamento } from "@/components/agenda/modals/ModalNovoAgendamento";
import heroImage from "@/assets/hero-medical-dashboard.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("agendamento");
  const [isModalNovoAgendamentoOpen, setIsModalNovoAgendamentoOpen] = useState(false);

  // Funções placeholder para modais que serão implementados depois
  const handleConfigurarAgenda = () => {
    console.log("Configurar agenda - Modal será implementado");
  };

  const handleBloquearAgenda = () => {
    console.log("Bloquear agenda - Modal será implementado");
  };

  const handleConfigurarGestao = () => {
    console.log("Configurar gestão - Modal será implementado");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative bg-gradient-medical/90 text-white">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-full">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold">
                  AGENDA DIETFLOW
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Sistema de agenda inteligente com gestão proativa de pacientes
              </p>
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Agendamento Inteligente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span>Gestão Proativa com IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-glow border-0">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none h-14">
                <TabsTrigger 
                  value="agendamento" 
                  className="flex items-center gap-2 text-base data-[state=active]:shadow-medical"
                >
                  <Calendar className="w-5 h-5" />
                  Agendamento
                </TabsTrigger>
                <TabsTrigger 
                  value="gestao" 
                  className="flex items-center gap-2 text-base data-[state=active]:shadow-medical"
                >
                  <Bot className="w-5 h-5" />
                  Gestão Proativa
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="agendamento" className="mt-0">
                <TabAgendamento
                  onNovoAgendamento={() => setIsModalNovoAgendamentoOpen(true)}
                  onConfigurarAgenda={handleConfigurarAgenda}
                  onBloquearAgenda={handleBloquearAgenda}
                />
              </TabsContent>
              
              <TabsContent value="gestao" className="mt-0">
                <TabGestaoProativa
                  onConfigurarGestao={handleConfigurarGestao}
                  onNovoAgendamento={() => setIsModalNovoAgendamentoOpen(true)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ModalNovoAgendamento
        isOpen={isModalNovoAgendamentoOpen}
        onClose={() => setIsModalNovoAgendamentoOpen(false)}
      />
    </div>
  );
};

export default Index;