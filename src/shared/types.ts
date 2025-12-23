// Tipos compartidos para el sistema de gestión de panadería

export interface PreparationStage {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number; // en minutos
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface PreparationTemplate {
  id: string;
  productId: string;
  productName: string;
  stages: Omit<PreparationStage, 'id' | 'status' | 'startTime' | 'endTime'>[];
  totalEstimatedTime: number; // en minutos
  notes?: string;
}

export interface PreparationWorkflow {
  id: string;
  batchId: string;
  productId: string;
  productName: string;
  templateId: string;
  status: 'active' | 'completed' | 'cancelled';
  stages: PreparationStage[];
  startTime: Date;
  endTime?: Date;
  notes?: string;
}

// Tipos existentes del sistema (si no están definidos en otro lugar)
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  materials: { materialId: string; quantity: number }[];
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'preparing' | 'baking' | 'cooling' | 'ready';
  ovenId?: string;
  startTime: Date;
  estimatedEndTime?: Date;
  actualEndTime?: Date;
  notes?: string;
}

export interface Oven {
  id: string;
  name: string;
  status: 'idle' | 'heating' | 'baking' | 'paused' | 'maintenance';
  currentTemperature: number;
  targetTemperature: number;
  currentBatchId?: string;
  capacity: number;
}

export interface StockAlert {
  id: string;
  materialId: string;
  materialName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
  acknowledged: boolean;
  createdAt: Date;
}

export interface QualityCheck {
  id: string;
  batchId: string;
  productName: string;
  checkType: 'visual' | 'texture' | 'taste' | 'temperature';
  result: 'passed' | 'failed' | 'pending';
  notes?: string;
  checkedBy: string;
  checkedAt: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}