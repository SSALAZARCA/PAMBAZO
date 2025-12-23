import React from 'react';
import { Clock, Flame, Snowflake, CheckCircle, ShoppingCart } from 'lucide-react';
import { PAMBAZO } from '../../shared/types';

interface ProductionFlowIndicatorProps {
  currentStatus: PAMBAZO.ProductionStatus | PAMBAZO.FinishedProductStatus;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProductionFlowIndicator: React.FC<ProductionFlowIndicatorProps> = ({
  currentStatus,
  showLabels = true,
  size = 'md',
  className = ''
}) => {
  const stages = [
    {
      key: 'preparing',
      label: 'Preparando',
      icon: Clock,
      color: 'yellow'
    },
    {
      key: 'baking',
      label: 'Horneando',
      icon: Flame,
      color: 'orange'
    },
    {
      key: 'cooling',
      label: 'Enfriando',
      icon: Snowflake,
      color: 'blue'
    },
    {
      key: 'ready',
      label: 'Listo',
      icon: CheckCircle,
      color: 'green'
    },
    {
      key: 'available_for_sale',
      label: 'Disponible',
      icon: ShoppingCart,
      color: 'purple'
    }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.key === currentStatus);
  };

  const currentStageIndex = getCurrentStageIndex();

  const getStageStyle = (index: number) => {
    const stage = stages[index];
    const isActive = index === currentStageIndex;
    const isCompleted = index < currentStageIndex;
    const isPending = index > currentStageIndex;

    let bgColor = 'bg-gray-200';
    let textColor = 'text-gray-500';
    let iconColor = 'text-gray-400';
    let borderColor = 'border-gray-200';

    if (!stage) {
      return {
        bgColor,
        textColor,
        iconColor,
        borderColor,
        isActive: false,
        isCompleted: false,
        isPending: false
      };
    }

    if (isActive) {
      switch (stage.color) {
        case 'yellow':
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
          iconColor = 'text-yellow-600';
          borderColor = 'border-yellow-300';
          break;
        case 'orange':
          bgColor = 'bg-orange-100';
          textColor = 'text-orange-800';
          iconColor = 'text-orange-600';
          borderColor = 'border-orange-300';
          break;
        case 'blue':
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
          iconColor = 'text-blue-600';
          borderColor = 'border-blue-300';
          break;
        case 'green':
          bgColor = 'bg-green-100';
          textColor = 'text-green-800';
          iconColor = 'text-green-600';
          borderColor = 'border-green-300';
          break;
        case 'purple':
          bgColor = 'bg-purple-100';
          textColor = 'text-purple-800';
          iconColor = 'text-purple-600';
          borderColor = 'border-purple-300';
          break;
      }
    } else if (isCompleted) {
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      iconColor = 'text-green-500';
      borderColor = 'border-green-200';
    }

    return {
      bgColor,
      textColor,
      iconColor,
      borderColor,
      isActive,
      isCompleted,
      isPending
    };
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-1',
          stage: 'p-2',
          icon: 'h-3 w-3',
          text: 'text-xs',
          connector: 'h-0.5'
        };
      case 'lg':
        return {
          container: 'gap-4',
          stage: 'p-4',
          icon: 'h-6 w-6',
          text: 'text-sm',
          connector: 'h-1'
        };
      default:
        return {
          container: 'gap-2',
          stage: 'p-3',
          icon: 'h-4 w-4',
          text: 'text-xs',
          connector: 'h-0.5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center ${sizeClasses.container} ${className}`}>
      {stages.map((stage, index) => {
        const style = getStageStyle(index);
        const Icon = stage.icon;
        const isLast = index === stages.length - 1;

        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center">
              {/* Icono y estado */}
              <div
                className={`
                  ${style.bgColor} ${style.borderColor} 
                  border-2 rounded-full ${sizeClasses.stage}
                  flex items-center justify-center
                  transition-all duration-300
                  ${style.isActive ? 'scale-110 shadow-md' : ''}
                `}
              >
                <Icon className={`${sizeClasses.icon} ${style.iconColor}`} />
              </div>

              {/* Etiqueta */}
              {showLabels && (
                <span className={`mt-1 ${sizeClasses.text} ${style.textColor} font-medium text-center`}>
                  {stage.label}
                </span>
              )}
            </div>

            {/* Conector */}
            {!isLast && (
              <div className="flex-1 flex items-center">
                <div
                  className={`
                    flex-1 ${sizeClasses.connector} rounded-full
                    transition-all duration-300
                    ${index < currentStageIndex
                      ? 'bg-green-400'
                      : index === currentStageIndex
                        ? 'bg-gradient-to-r from-green-400 to-gray-300'
                        : 'bg-gray-300'
                    }
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProductionFlowIndicator;