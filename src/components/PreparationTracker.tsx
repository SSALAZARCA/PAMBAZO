import React from 'react';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  Circle,
  Play,
  AlertCircle
} from 'lucide-react';
import { PreparationStage } from '../../shared/types';

interface PreparationTrackerProps {
  batchId: string;
  className?: string;
}

const PreparationTracker: React.FC<PreparationTrackerProps> = ({ batchId, className = '' }) => {
  const {
    getPreparationWorkflowByBatchId,
    updatePreparationStage,
    completePreparationStage,
    updatePreparationStatus
  } = useStore();

  const workflow = getPreparationWorkflowByBatchId(batchId);

  if (!workflow) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">No hay proceso de preparación activo</span>
        </div>
      </div>
    );
  }

  const currentStage = workflow.stages.find(stage => stage.status === 'in_progress');
  const completedStages = workflow.stages.filter(stage => stage.status === 'completed').length;
  const totalStages = workflow.stages.length;
  const progress = (completedStages / totalStages) * 100;

  const handleStartStage = (stageId: string) => {
    try {
      updatePreparationStage(workflow.id, stageId, {
        status: 'in_progress',
        startTime: new Date()
      });
      toast.success('Etapa iniciada');
    } catch (error) {
      toast.error('Error al iniciar la etapa');
    }
  };

  const handleCompleteStage = (stageId: string) => {
    try {
      completePreparationStage(workflow.id, stageId);

      // Verificar si todas las etapas están completadas
      const updatedWorkflow = getPreparationWorkflowByBatchId(batchId);
      if (updatedWorkflow) {
        const allCompleted = updatedWorkflow.stages.every(stage => stage.status === 'completed');
        if (allCompleted) {
          updatePreparationStatus(workflow.id, 'completed');
          toast.success('¡Proceso de preparación completado!');
        } else {
          toast.success('Etapa completada');
        }
      }
    } catch (error) {
      toast.error('Error al completar la etapa');
    }
  };

  const getStageIcon = (stage: PreparationStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStageColor = (stage: PreparationStage) => {
    switch (stage.status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Preparación: {workflow.productName}
          </h3>
          <p className="text-sm text-gray-500">
            {completedStages} de {totalStages} etapas completadas
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
          <div className="text-xs text-gray-500">Progreso</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {workflow.stages.map((stage) => {
          const isNext = currentStage ? stage.order === currentStage.order + 1 : stage.order === 1;
          const canStart = stage.status === 'pending' && isNext;
          const canComplete = stage.status === 'in_progress';

          return (
            <div key={stage.id} className={`border rounded-lg p-4 ${getStageColor(stage)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStageIcon(stage)}
                  <div>
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <p className="text-sm text-gray-600">{stage.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDuration(stage.estimatedDuration)}
                      </span>
                      {stage.startTime && (
                        <span className="text-xs text-gray-500">
                          Iniciado: {stage.startTime.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {stage.endTime && (
                        <span className="text-xs text-green-600">
                          Completado: {stage.endTime.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {canStart && (
                    <button
                      onClick={() => handleStartStage(stage.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Play className="h-3 w-3" />
                      <span>Iniciar</span>
                    </button>
                  )}
                  {canComplete && (
                    <button
                      onClick={() => handleCompleteStage(stage.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Completar</span>
                    </button>
                  )}
                  {stage.status === 'completed' && (
                    <span className="text-green-600 text-sm font-medium">✓ Completado</span>
                  )}
                </div>
              </div>

              {/* Stage Notes */}
              {stage.notes && (
                <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm text-gray-600">
                  <strong>Notas:</strong> {stage.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Notes */}
      {workflow.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Notas del lote:</h5>
          <p className="text-sm text-gray-600">{workflow.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PreparationTracker;