import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calculator, Timer, BookOpen, Pause, RotateCcw, Plus } from 'lucide-react';

const BakerTools: React.FC = () => {
    return (
        <Card className="h-full border-none shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Herramientas de Panadero
                </CardTitle>
                <CardDescription>Utilidades para tu jornada diaria</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="calculator" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-slate-200 bg-transparent p-0">
                        <TabsTrigger
                            value="calculator"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-orange-600 data-[state=active]:text-orange-700 data-[state=active]:bg-orange-50/50"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            Calculadora
                        </TabsTrigger>
                        <TabsTrigger
                            value="timers"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-orange-600 data-[state=active]:text-orange-700 data-[state=active]:bg-orange-50/50"
                        >
                            <Timer className="w-4 h-4 mr-2" />
                            Temporizadores
                        </TabsTrigger>
                        <TabsTrigger
                            value="recipes"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-orange-600 data-[state=active]:text-orange-700 data-[state=active]:bg-orange-50/50"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Manual
                        </TabsTrigger>
                    </TabsList>

                    {/* CALCULADORA DE PORCENTAJES */}
                    <TabsContent value="calculator" className="p-6 space-y-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Calculadora de Masas (Porcentajes)</h3>
                            <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-2">
                                    <Label>Peso Base Harina (g)</Label>
                                    <Input type="number" placeholder="Ej. 1000" className="bg-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Agua (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" placeholder="60" className="bg-white" />
                                            <span className="text-sm font-bold text-slate-500">= 600g</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Sal (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" placeholder="2" className="bg-white" />
                                            <span className="text-sm font-bold text-slate-500">= 20g</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Levadura (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" placeholder="1" className="bg-white" />
                                            <span className="text-sm font-bold text-slate-500">= 10g</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Masa Madre (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" placeholder="20" className="bg-white" />
                                            <span className="text-sm font-bold text-slate-500">= 200g</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-700">Peso Total Masa</span>
                                        <span className="font-bold text-xl text-orange-600">1830 g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TEMPORIZADORES */}
                    <TabsContent value="timers" className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Temporizadores Activos</h3>
                            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Nuevo</Button>
                        </div>

                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div>
                                        <p className="font-medium text-slate-900">{i === 1 ? 'Horno 1 - Pan Francés' : 'Fermentación - Lote #45'}</p>
                                        <p className="text-2xl font-mono font-bold text-orange-600 tracking-wider">
                                            {i === 1 ? '14:30' : '45:00'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-orange-600">
                                            <Pause className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-600">
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* MANUAL / RECETAS RÁPIDAS */}
                    <TabsContent value="recipes" className="p-0">
                        <div className="border-b border-slate-100 p-4">
                            <Input placeholder="Buscar receta rápida..." className="bg-slate-50" />
                        </div>
                        <div className="h-[300px] overflow-y-auto p-4 space-y-2">
                            {['Pan de Bono', 'Croissant', 'Pan Aliñado', 'Mogolla'].map((item) => (
                                <div key={item} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700">{item}</span>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-orange-600">Ver</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default BakerTools;
