import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Package, DollarSign, User, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

interface InventoryEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
    costPerUnit?: number;
  };
}

export function InventoryEntryDialog({ isOpen, onClose, item }: InventoryEntryDialogProps) {
  console.log('🎯 InventoryEntryDialog renderizado:', { isOpen, item: item?.name });

  const { user, addInventoryEntry, addFinancialTransaction } = useStore();
  const [formData, setFormData] = useState({
    quantity: '',
    supplier: '',
    totalCost: '',
    invoiceNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitCost = formData.quantity && formData.totalCost
    ? (parseFloat(formData.totalCost) / parseFloat(formData.quantity)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || !formData.supplier || !formData.totalCost) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (parseFloat(formData.totalCost) <= 0) {
      toast.error('El costo total debe ser mayor a 0');
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const quantity = parseFloat(formData.quantity);
      const totalCost = parseFloat(formData.totalCost);
      const unitCostValue = totalCost / quantity;

      // Registrar entrada de inventario
      addInventoryEntry({
        itemId: item.id,
        itemName: item.name,
        quantity,
        unitCost: unitCostValue,
        totalCost,
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber || undefined,
        userId: user.id,
        userName: user.name || 'Usuario'
      });

      // Registrar transacción financiera
      addFinancialTransaction({
        type: 'expense',
        category: 'Compra de inventario',
        amount: totalCost,
        description: `Entrada de ${quantity} ${item.unit} de ${item.name}`,
        reference: formData.invoiceNumber || undefined,
        userId: user.id,
        userName: user.name || 'Usuario'
      });

      toast.success(`Entrada registrada exitosamente: ${quantity} ${item.unit} de ${item.name}`);

      // Limpiar formulario
      setFormData({
        quantity: '',
        supplier: '',
        totalCost: '',
        invoiceNumber: ''
      });

      onClose();
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      toast.error('Error al registrar la entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        quantity: '',
        supplier: '',
        totalCost: '',
        invoiceNumber: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Entrada de Inventario
          </DialogTitle>
          <DialogDescription>
            Registrar nueva entrada para: <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del producto */}
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-orange-800">{item.name}</p>
                <p className="text-sm text-orange-600">Stock actual: {item.currentStock} {item.unit}</p>
              </div>
              {item.costPerUnit && (
                <div className="text-right">
                  <p className="text-sm text-orange-600">Costo actual</p>
                  <p className="font-medium text-orange-800">${item.costPerUnit.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Cantidad a ingresar *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={`Cantidad en ${item.unit}`}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Proveedor */}
          <div className="space-y-2">
            <Label htmlFor="supplier" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Proveedor *
            </Label>
            <Input
              id="supplier"
              type="text"
              placeholder="Nombre del proveedor"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Costo total */}
          <div className="space-y-2">
            <Label htmlFor="totalCost" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costo total *
            </Label>
            <Input
              id="totalCost"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.totalCost}
              onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Costo unitario calculado */}
          {formData.quantity && formData.totalCost && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Costo unitario:</span>
                <span className="font-medium text-blue-800">${unitCost} por {item.unit}</span>
              </div>
            </div>
          )}

          {/* Número de factura */}
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Número de factura (opcional)
            </Label>
            <Input
              id="invoiceNumber"
              type="text"
              placeholder="Ej: FAC-001234"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryEntryDialog;