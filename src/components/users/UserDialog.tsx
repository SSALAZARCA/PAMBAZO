import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import api, { User } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface UserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUserSaved: () => void;
    userToEdit?: User | null;
    currentUserRole?: string;
}

const ROLES = [
    { value: 'customer', label: 'Cliente' },
    { value: 'waiter', label: 'Mesero' },
    { value: 'kitchen', label: 'Cocina' },
    { value: 'baker', label: 'Panadero' },
    { value: 'admin', label: 'Administrador' },
    { value: 'owner', label: 'Dueño' },
];

export const UserDialog: React.FC<UserDialogProps> = ({
    isOpen,
    onClose,
    onUserSaved,
    userToEdit,
    currentUserRole
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'customer',
        password: '',
        phone: ''
    });

    // Filter roles based on current user permissions
    const availableRoles = ROLES.filter(role => {
        // Owner sees everything
        if (currentUserRole === 'owner') return true;

        // Admin cannot create/edit Owner or Admin users
        if (currentUserRole === 'admin') {
            return role.value !== 'owner' && role.value !== 'admin';
        }

        // Others (shouldn't be here but fallback) see nothing or limited
        return false;
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                role: userToEdit.role || 'customer',
                password: '', // Password empty on edit
                phone: userToEdit.phone || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'customer',
                password: '',
                phone: ''
            });
        }
    }, [userToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Nombre y Correo son requeridos');
            return;
        }

        // Security check for role assignment
        if (currentUserRole === 'admin' && (formData.role === 'admin' || formData.role === 'owner')) {
            toast.error('No tienes permisos para asignar este rol');
            return;
        }

        if (!userToEdit && !formData.password) {
            toast.error('La contraseña es requerida para nuevos usuarios');
            return;
        }

        setIsLoading(true);

        try {
            if (userToEdit) {
                // Update
                const updateData: any = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role as any,
                    phone: formData.phone
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }

                const response = await api.users.update(userToEdit.id, updateData);
                if (response.success) {
                    toast.success('Usuario actualizado correctamente');
                    onUserSaved();
                    onClose();
                } else {
                    toast.error(response.error || 'Error al actualizar usuario');
                }
            } else {
                // Create
                const response = await api.users.create(formData as any);
                if (response.success) {
                    toast.success('Usuario creado correctamente');
                    onUserSaved();
                    onClose();
                } else {
                    toast.error(response.error || 'Error al crear usuario');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Error al guardar el usuario');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white text-black">
                <DialogHeader>
                    <DialogTitle>{userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="juan@pambazo.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            {availableRoles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono (Opcional)</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+57 300 123 4567"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {userToEdit ? 'Contraseña (Dejar en blanco para mantener)' : 'Contraseña'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="******"
                            required={!userToEdit}
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
