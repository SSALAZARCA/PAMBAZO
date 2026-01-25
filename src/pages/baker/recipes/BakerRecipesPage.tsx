import React, { useState } from 'react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { User } from '../../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
    Search,
    Clock,
    Flame,
    Users,
    ChefHat,
    BookOpen,
    Star,
    TrendingUp
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { BAKERY_RECIPES } from '../../../data/bakeryRecipes';

interface BakerRecipesPageProps {
    user: User;
    onLogout: () => void;
}

export const BakerRecipesPage: React.FC<BakerRecipesPageProps> = ({ user, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const categories = ['Todas', ...new Set(BAKERY_RECIPES.map(r => r.category))];

    const filteredRecipes = BAKERY_RECIPES.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Fácil': return 'bg-green-100 text-green-700';
            case 'Intermedio': return 'bg-yellow-100 text-yellow-700';
            case 'Avanzado': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout user={user} onLogout={onLogout}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-orange-600" />
                            Recetas de Panadería
                        </h1>
                        <p className="text-gray-600 mt-1">Biblioteca completa de recetas y procedimientos</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        {filteredRecipes.length} Recetas
                    </Badge>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="Buscar recetas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={selectedCategory === cat ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={selectedCategory === cat ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recipes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map(recipe => (
                        <Dialog key={recipe.id}>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-medium">{recipe.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {recipe.category}
                                            </Badge>
                                            <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                                                {recipe.difficulty}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{recipe.prepTime + recipe.bakingTime} min</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Flame className="w-4 h-4" />
                                                <span>{recipe.temperature}°C</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span>{recipe.yield} uds</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ChefHat className="w-4 h-4" />
                                                <span>{recipe.steps.length} pasos</span>
                                            </div>
                                        </div>
                                        <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                                            Ver Receta Completa
                                        </Button>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl flex items-center gap-2">
                                        <ChefHat className="w-6 h-6 text-orange-600" />
                                        {recipe.name}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    {/* Info Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <Clock className="w-5 h-5 text-blue-600 mb-1" />
                                            <p className="text-xs text-gray-600">Preparación</p>
                                            <p className="text-sm font-bold">{recipe.prepTime} min</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg">
                                            <Flame className="w-5 h-5 text-orange-600 mb-1" />
                                            <p className="text-xs text-gray-600">Horneado</p>
                                            <p className="text-sm font-bold">{recipe.bakingTime} min @ {recipe.temperature}°C</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <Users className="w-5 h-5 text-green-600 mb-1" />
                                            <p className="text-xs text-gray-600">Rendimiento</p>
                                            <p className="text-sm font-bold">{recipe.yield} unidades</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-purple-600 mb-1" />
                                            <p className="text-xs text-gray-600">Dificultad</p>
                                            <p className="text-sm font-bold">{recipe.difficulty}</p>
                                        </div>
                                    </div>

                                    {/* Ingredients */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-3">Ingredientes</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {recipe.ingredients.map((ing, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                                                    <span className="text-sm">
                                                        <span className="font-medium">{ing.quantity}</span> {ing.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Steps */}
                                    <div>
                                        <h3 className="font-bold text-lg mb-3">Procedimiento</h3>
                                        <ol className="space-y-3">
                                            {recipe.steps.map((step, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Tips */}
                                    {recipe.tips.length > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                                💡 Tips del Maestro
                                            </h3>
                                            <ul className="space-y-2">
                                                {recipe.tips.map((tip, idx) => (
                                                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                                                        <span className="text-yellow-600">•</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>

                {filteredRecipes.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No se encontraron recetas</p>
                        <p className="text-gray-400 text-sm">Intenta con otros términos de búsqueda</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BakerRecipesPage;
