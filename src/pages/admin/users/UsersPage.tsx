import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
// Removed invalid import
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, UserPlus, Search, Filter, Trash2, Edit } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import api, { User } from '../../../services/api';
import { UserDialog } from '../../../components/users/UserDialog';
import { toast } from 'sonner';

interface UsersPageProps {
    user: User;
    onLogout: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ user, onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // CRUD State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.users.getAll();
            if (response.success) {
                // Handle potential variations in response structure
                const usersData = Array.isArray(response.data)
                    ? response.data
                    : (response.data as any)?.users || (response.data as any)?.data || [];

                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await api.users.delete(userId);
            if (response.success) {
                toast.success('Usuario eliminado correctamente');
                fetchUsers();
            } else {
                toast.error('Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error al eliminar usuario');
        }
    };

    const handleUserSaved = () => {
        fetchUsers();
        setIsDialogOpen(false);
    };

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800',
            baker: 'bg-orange-100 text-orange-800',
            waiter: 'bg-blue-100 text-blue-800',
            kitchen: 'bg-green-100 text-green-800',
            customer: 'bg-gray-100 text-gray-800',
            owner: 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-500">
                            Administra los usuarios del sistema ({users.length})
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Button>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Lista de Usuarios
                            </CardTitle>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-10 w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg font-semibold text-blue-600 uppercase">
                                                    {(u.name || u.email || '?').charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{u.name || 'Sin nombre'}</h3>
                                                <p className="text-sm text-gray-500">{u.email}</p>
                                                <p className="text-xs text-gray-400">{u.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={getRoleBadge(u.role)}>
                                                {u.role}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(u)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(u.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No se encontraron usuarios
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <UserDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onUserSaved={handleUserSaved}
                    userToEdit={selectedUser}
                    currentUserRole={user.role}
                />
            </div>
        </DashboardLayout>
    );
};

export default UsersPage;
