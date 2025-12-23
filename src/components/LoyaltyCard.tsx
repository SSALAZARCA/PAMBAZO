import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface LoyaltyCardProps {
    customerId: string;
}

interface LoyaltyData {
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    lifetime_points: number;
    points_to_next_tier: number;
    next_tier: string;
}

const tierConfig = {
    Bronze: {
        color: '#CD7F32',
        gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)',
        icon: '🥉',
        minPoints: 0,
        maxPoints: 499
    },
    Silver: {
        color: '#C0C0C0',
        gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
        icon: '🥈',
        minPoints: 500,
        maxPoints: 1499
    },
    Gold: {
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
        icon: '🥇',
        minPoints: 1500,
        maxPoints: 4999
    },
    Platinum: {
        color: '#E5E4E2',
        gradient: 'linear-gradient(135deg, #E5E4E2, #B9B9B9)',
        icon: '💎',
        minPoints: 5000,
        maxPoints: Infinity
    }
};

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ customerId }) => {
    const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadLoyaltyData();
    }, [customerId]);

    const loadLoyaltyData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/v1/loyalty/${customerId}`);
            if (response.success) {
                setLoyaltyData(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Error al cargar datos de lealtad');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loyalty-card loading">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (error || !loyaltyData) {
        return (
            <div className="loyalty-card error">
                <p>⚠️ {error || 'No se pudo cargar la información'}</p>
            </div>
        );
    }

    const tier = tierConfig[loyaltyData.tier];
    const progress = loyaltyData.points_to_next_tier > 0
        ? ((loyaltyData.points - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100
        : 100;

    return (
        <div className="loyalty-card-container">
            <div className="loyalty-card" style={{ background: tier.gradient }}>
                <div className="card-header">
                    <div className="tier-badge">
                        <span className="tier-icon">{tier.icon}</span>
                        <span className="tier-name">{loyaltyData.tier}</span>
                    </div>
                    <div className="points-display">
                        <span className="points-value">{loyaltyData.points.toLocaleString()}</span>
                        <span className="points-label">Puntos</span>
                    </div>
                </div>

                <div className="card-body">
                    {loyaltyData.points_to_next_tier > 0 ? (
                        <>
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>Progreso a {loyaltyData.next_tier}</span>
                                    <span className="points-needed">{loyaltyData.points_to_next_tier} puntos más</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="max-tier">
                            <span className="crown-icon">👑</span>
                            <span>¡Nivel Máximo Alcanzado!</span>
                        </div>
                    )}

                    <div className="lifetime-points">
                        <span className="label">Puntos Totales Acumulados:</span>
                        <span className="value">{loyaltyData.lifetime_points.toLocaleString()}</span>
                    </div>
                </div>

                <div className="card-footer">
                    <button className="btn-rewards" onClick={() => window.location.href = '/rewards'}>
                        🎁 Ver Recompensas
                    </button>
                </div>
            </div>

            <div className="tier-benefits">
                <h3>Beneficios de {loyaltyData.tier}</h3>
                <ul>
                    {loyaltyData.tier === 'Bronze' && (
                        <>
                            <li>✅ 1 punto por cada $10 gastados</li>
                            <li>✅ Ofertas exclusivas mensuales</li>
                            <li>✅ Acceso a programa de lealtad</li>
                        </>
                    )}
                    {loyaltyData.tier === 'Silver' && (
                        <>
                            <li>✅ 1.5 puntos por cada $10 gastados</li>
                            <li>✅ 5% descuento en cumpleaños</li>
                            <li>✅ Acceso anticipado a nuevos productos</li>
                            <li>✅ Ofertas exclusivas semanales</li>
                        </>
                    )}
                    {loyaltyData.tier === 'Gold' && (
                        <>
                            <li>✅ 2 puntos por cada $10 gastados</li>
                            <li>✅ 10% descuento permanente</li>
                            <li>✅ Producto gratis en cumpleaños</li>
                            <li>✅ Prioridad en reservas</li>
                            <li>✅ Eventos exclusivos</li>
                        </>
                    )}
                    {loyaltyData.tier === 'Platinum' && (
                        <>
                            <li>✅ 3 puntos por cada $10 gastados</li>
                            <li>✅ 15% descuento permanente</li>
                            <li>✅ Menú degustación gratis mensual</li>
                            <li>✅ Reservas VIP garantizadas</li>
                            <li>✅ Acceso a chef privado</li>
                            <li>✅ Concierge personalizado</li>
                        </>
                    )}
                </ul>
            </div>

            <style>{`
        .loyalty-card-container {
          max-width: 500px;
          margin: 0 auto;
        }

        .loyalty-card {
          border-radius: 20px;
          padding: 24px;
          color: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .loyalty-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20%, -20%); }
        }

        .loyalty-card.loading,
        .loyalty-card.error {
          background: #f3f4f6;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .tier-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .tier-icon {
          font-size: 24px;
        }

        .tier-name {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .points-display {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .points-value {
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .points-label {
          font-size: 14px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-body {
          position: relative;
          z-index: 1;
          margin-bottom: 20px;
        }

        .progress-section {
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          opacity: 0.95;
        }

        .points-needed {
          font-weight: 600;
        }

        .progress-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1));
          border-radius: 6px;
          transition: width 0.5s ease;
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
        }

        .max-tier {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .crown-icon {
          font-size: 24px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .lifetime-points {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-size: 14px;
        }

        .lifetime-points .value {
          font-weight: 700;
        }

        .card-footer {
          position: relative;
          z-index: 1;
        }

        .btn-rewards {
          width: 100%;
          padding: 14px;
          background: rgba(255, 255, 255, 0.95);
          color: #1f2937;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-rewards:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          background: white;
        }

        .tier-benefits {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .tier-benefits h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #1f2937;
        }

        .tier-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tier-benefits li {
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
          font-size: 15px;
        }

        .tier-benefits li:last-child {
          border-bottom: none;
        }
      `}</style>
        </div>
    );
};

export default LoyaltyCard;
