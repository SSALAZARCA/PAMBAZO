import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';

interface TipModalProps {
    orderId: string;
    orderTotal: number;
    onClose: () => void;
    onSuccess?: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ orderId, orderTotal, onClose, onSuccess }) => {
    const [tipType, setTipType] = useState<'percentage' | 'custom'>('percentage');
    const [tipPercentage, setTipPercentage] = useState(15);
    const [customAmount, setCustomAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tipAmount = tipType === 'percentage'
        ? (orderTotal * tipPercentage / 100)
        : customAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/api/v1/tips', {
                order_id: orderId,
                amount: tipType === 'custom' ? customAmount : undefined,
                percentage: tipType === 'percentage' ? tipPercentage : undefined,
                payment_method: paymentMethod
            });

            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Error al agregar propina');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💰 Agregar Propina</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="order-summary">
                            <p>Total de la orden: <strong>${orderTotal.toFixed(2)}</strong></p>
                        </div>

                        <div className="tip-type-selector">
                            <button
                                type="button"
                                className={`tip-type-btn ${tipType === 'percentage' ? 'active' : ''}`}
                                onClick={() => setTipType('percentage')}
                            >
                                Porcentaje
                            </button>
                            <button
                                type="button"
                                className={`tip-type-btn ${tipType === 'custom' ? 'active' : ''}`}
                                onClick={() => setTipType('custom')}
                            >
                                Monto Personalizado
                            </button>
                        </div>

                        {tipType === 'percentage' ? (
                            <div className="percentage-options">
                                <h3>Selecciona un porcentaje:</h3>
                                <div className="percentage-buttons">
                                    {[10, 15, 20, 25].map((percent) => (
                                        <button
                                            key={percent}
                                            type="button"
                                            className={`percentage-btn ${tipPercentage === percent ? 'active' : ''}`}
                                            onClick={() => setTipPercentage(percent)}
                                        >
                                            {percent}%
                                            <span className="amount">${(orderTotal * percent / 100).toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="custom-percentage">
                                    <label>O ingresa un porcentaje:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tipPercentage}
                                        onChange={(e) => setTipPercentage(Number(e.target.value))}
                                        className="percentage-input"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="custom-amount">
                                <label>Monto de la propina:</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                                        className="amount-input"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="payment-method">
                            <label>Método de pago:</label>
                            <div className="payment-options">
                                <button
                                    type="button"
                                    className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    💵 Efectivo
                                </button>
                                <button
                                    type="button"
                                    className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    💳 Tarjeta
                                </button>
                                <button
                                    type="button"
                                    className={`payment-btn ${paymentMethod === 'digital' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('digital')}
                                >
                                    📱 Digital
                                </button>
                            </div>
                        </div>

                        <div className="tip-summary">
                            <h3>Resumen:</h3>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${orderTotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Propina:</span>
                                <span>${tipAmount.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${(orderTotal + tipAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || tipAmount <= 0}>
                            {loading ? 'Procesando...' : `Agregar Propina $${tipAmount.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .order-summary {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          text-align: center;
        }

        .order-summary p {
          margin: 0;
          font-size: 18px;
          color: #4b5563;
        }

        .order-summary strong {
          color: #059669;
          font-size: 24px;
        }

        .tip-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tip-type-btn {
          padding: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tip-type-btn:hover {
          border-color: #3b82f6;
        }

        .tip-type-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }

        .percentage-options h3 {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 12px;
        }

        .percentage-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .percentage-btn {
          padding: 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .percentage-btn:hover {
          border-color: #10b981;
          transform: translateY(-2px);
        }

        .percentage-btn.active {
          border-color: #10b981;
          background: #d1fae5;
          color: #059669;
        }

        .percentage-btn .amount {
          font-size: 14px;
          color: #6b7280;
        }

        .percentage-btn.active .amount {
          color: #059669;
          font-weight: 600;
        }

        .custom-percentage {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .custom-percentage label {
          font-size: 14px;
          color: #6b7280;
        }

        .percentage-input {
          width: 80px;
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          text-align: center;
        }

        .custom-amount {
          margin-bottom: 24px;
        }

        .custom-amount label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #4b5563;
          font-weight: 500;
        }

        .amount-input-wrapper {
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          background: white;
        }

        .amount-input-wrapper .currency {
          font-size: 20px;
          color: #6b7280;
          margin-right: 8px;
        }

        .amount-input {
          flex: 1;
          border: none;
          font-size: 20px;
          outline: none;
        }

        .payment-method {
          margin-bottom: 24px;
        }

        .payment-method label {
          display: block;
          margin-bottom: 12px;
          font-size: 14px;
          color: #4b5563;
          font-weight: 500;
        }

        .payment-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .payment-btn {
          padding: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .payment-btn:hover {
          border-color: #8b5cf6;
        }

        .payment-btn.active {
          border-color: #8b5cf6;
          background: #f5f3ff;
          color: #8b5cf6;
        }

        .tip-summary {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .tip-summary h3 {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 16px;
          color: #6b7280;
        }

        .summary-row.total {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 14px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #4b5563;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default TipModal;
