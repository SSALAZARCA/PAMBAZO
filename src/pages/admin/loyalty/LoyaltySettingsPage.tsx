import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../../components/ui/dialog';
import { Plus, Edit, Trash2, Save, Gift, Settings, Database } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'sonner';
import { User } from '../../../../shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface LoyaltySettingsPageProps {
    user: User;
    onLogout: () => void;
}

interface Reward {
    id: number;
    name: string;
    points: number;
    image: string;
    description: string;
    productId?: string;
}

export const LoyaltySettingsPage: React.FC<LoyaltySettingsPageProps> = ({ user, onLogout }) => {
    const [config, setConfig] = useState({ amountPerPoint: 1000, enabled: true });
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [formData, setFormData] = useState<Partial<Reward>>({
        name: '',
        points: 100,
        image: '🎁',
        description: '',
        productId: 'none'
    });

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    const fetchData = async () => {
        try {
            const [configRes, rewardsRes] = await Promise.all([
                api.loyalty.getConfig(),
                api.loyalty.getRewards()
            ]);
            if (configRes.success && configRes.data) setConfig(configRes.data);
            if (rewardsRes.success && rewardsRes.data) {
                const rewardsData = (rewardsRes.data as any).data || rewardsRes.data;
                setRewards(Array.isArray(rewardsData) ? rewardsData : []);
            }
        } catch (error) {
            console.error('Error fetching loyalty settings:', error);
            toast.error('Error al cargar configuración');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.products.getAll();
            if (res.success && res.data) {
                const prodList = (res.data as any).products || res.data;
                setProducts(Array.isArray(prodList) ? prodList : []);
            }
        } catch (e) { console.error(e); }
    };

    const handleSaveConfig = async () => {
        try {
            const res = await api.loyalty.updateConfig(config);
            if (res.success) toast.success('Configuración guardada');
            else toast.error('Error al guardar');
        } catch (error) {
            toast.error('Error al guardar configuración');
        }
    };

    const handleSaveReward = async () => {
        try {
            const payload = { ...formData };
            if (payload.productId === 'none') {
                delete payload.productId;
            }

            if (editingReward) {
                await api.loyalty.updateReward(editingReward.id, payload);
                toast.success('Recompensa actualizada');
            } else {
                await api.loyalty.createReward(payload);
                toast.success('Recompensa creada');
            }
            setIsModalOpen(false);
            setEditingReward(null);
            fetchData();
        } catch (error) {
            toast.error('Error al guardar recompensa');
        }
    };

    const handleDeleteReward = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta recompensa?')) return;
        try {
            await api.loyalty.deleteReward(id);
            toast.success('Recompensa eliminada');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const openModal = (reward?: Reward) => {
        if (reward) {
            setEditingReward(reward);
            setFormData({ ...reward, productId: reward.productId || 'none' });
        } else {
            setEditingReward(null);
            setFormData({ name: '', points: 100, image: '🎁', description: '', productId: 'none' });
        }
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Gift className="w-8 h-8 text-orange-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Sistema de Puntos de Lealtad</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CONFIGURATION CARD */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Configuración General
                            </CardTitle>
                            <CardDescription>Defina cómo se ganan los puntos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="enabled-mode">Sistema Activo</Label>
                                <Switch
                                    id="enabled-mode"
                                    checked={config.enabled}
                                    onCheckedChange={(c) => setConfig({ ...config, enabled: c })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Dinero por Punto ($)</Label>
                                <Input
                                    type="number"
                                    value={config.amountPerPoint}
                                    onChange={(e) => setConfig({ ...config, amountPerPoint: parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    El cliente gana 1 punto por cada ${config.amountPerPoint} gastados.
                                </p>
                            </div>
                            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleSaveConfig}>
                                <Save className="w-4 h-4 mr-2" /> Guardar Config
                            </Button>
                        </CardContent>
                    </Card>

                    {/* REWARDS CARD */}
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="w-5 h-5" /> Catálogo de Recompensas
                                </CardTitle>
                                <CardDescription>Administre los productos disponibles para canje.</CardDescription>
                            </div>
                            <Button onClick={() => openModal()} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" /> Nueva Recompensa
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recompensa</TableHead>
                                        <TableHead>Costo (Puntos)</TableHead>
                                        <TableHead>Producto Vinculado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(rewards) && rewards.map((reward) => (
                                        <TableRow key={reward.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{reward.image}</span>
                                                    <div>
                                                        <p className="font-bold">{reward.name}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{reward.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-orange-600">{reward.points} pts</div>
                                            </TableCell>
                                            <TableCell>
                                                {reward.productId ? (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                        {products.find(p => p.id === reward.productId)?.name || 'Producto ID: ' + reward.productId}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Sin vínculo</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openModal(reward)}>
                                                        <Edit className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteReward(reward.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!Array.isArray(rewards) || rewards.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                No hay recompensas configuradas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* MODAL DIALOG */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nombre de la Recompensa</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Café Gratis"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Costo en Puntos</Label>
                                    <Input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Emoji / Icono</Label>
                                    <Input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="Ej. ☕"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descripción corta para el cliente..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vincular con Inventario (Opcional)</Label>
                                <Select
                                    value={formData.productId || 'none'}
                                    onValueChange={(val) => {
                                        setFormData(prev => {
                                            const next = { ...prev };
                                            if (val === 'none') delete next.productId;
                                            else next.productId = val;
                                            return next;
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar producto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Ninguno --</SelectItem>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-gray-500">
                                    Al canjear, se descontará 1 unidad del inventario de este producto automáticamente.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveReward} className="bg-orange-600 hover:bg-orange-700">Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};
