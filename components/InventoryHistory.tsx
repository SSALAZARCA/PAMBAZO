import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Package, DollarSign, Calendar, User, FileText, Search, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function InventoryHistory() {
  const { inventoryEntries, financialTransactions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('entries');

  // Filtrar entradas de inventario
  const filteredEntries = inventoryEntries.filter(entry =>
    entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar transacciones financieras (solo gastos de inventario)
  const inventoryTransactions = financialTransactions.filter(transaction =>
    transaction.category === 'Compra de inventario' &&
    (transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular totales
  const totalEntries = inventoryEntries.length;
  const totalSpent = inventoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const averageEntryValue = totalEntries > 0 ? totalSpent / totalEntries : 0;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-xl font-bold">{totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invertido</p>
                <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Promedio por Entrada</p>
                <p className="text-xl font-bold">${averageEntryValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto, proveedor o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries">Entradas de Inventario</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones Financieras</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-3">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron entradas que coincidan con la búsqueda' : 'No hay entradas de inventario registradas'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{entry.itemName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.quantity} unidades • ${entry.unitCost.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${entry.totalCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.entryDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {entry.supplier}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {entry.userName}
                      </Badge>
                      {entry.invoiceNumber && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {entry.invoiceNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3">
          {inventoryTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron transacciones que coincidan con la búsqueda' : 'No hay transacciones financieras registradas'}
                </p>
              </CardContent>
            </Card>
          ) : (
            inventoryTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{transaction.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          -${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {transaction.userName}
                      </Badge>
                      {transaction.reference && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {transaction.reference}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InventoryHistory;