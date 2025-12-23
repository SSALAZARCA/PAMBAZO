import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';

interface ReservationFormProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        party_size: 2,
        reservation_date: '',
        reservation_time: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await apiClient.post('/api/v1/reservations', formData);
            setSuccess(true);

            setTimeout(() => {
                onSuccess?.();
                onClose?.();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    // Get min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="reservation-form-container">
            <div className="reservation-form-card">
                <div className="form-header">
                    <h2>📅 Nueva Reserva</h2>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>×</button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="customer_name">
                                <span className="icon">👤</span>
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                id="customer_name"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer_phone">
                                <span className="icon">📱</span>
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                id="customer_phone"
                                name="customer_phone"
                                value={formData.customer_phone}
                                onChange={handleChange}
                                required
                                placeholder="Ej: +52 123 456 7890"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer_email">
                                <span className="icon">📧</span>
                                Email
                            </label>
                            <input
                                type="email"
                                id="customer_email"
                                name="customer_email"
                                value={formData.customer_email}
                                onChange={handleChange}
                                placeholder="ejemplo@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reservation_date">
                                <span className="icon">📆</span>
                                Fecha *
                            </label>
                            <input
                                type="date"
                                id="reservation_date"
                                name="reservation_date"
                                value={formData.reservation_date}
                                onChange={handleChange}
                                min={today}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reservation_time">
                                <span className="icon">🕐</span>
                                Hora *
                            </label>
                            <input
                                type="time"
                                id="reservation_time"
                                name="reservation_time"
                                value={formData.reservation_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="party_size">
                                <span className="icon">👥</span>
                                Número de Personas *
                            </label>
                            <select
                                id="party_size"
                                name="party_size"
                                value={formData.party_size}
                                onChange={handleChange}
                                required
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                                ))}
                                <option value={15}>Más de 10 personas</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="notes">
                                <span className="icon">📝</span>
                                Notas Especiales
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ej: Celebración de cumpleaños, preferencia de mesa cerca de la ventana, alergias alimentarias..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <span className="icon">✅</span>
                            ¡Reserva creada exitosamente!
                        </div>
                    )}

                    <div className="form-footer">
                        {onClose && (
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="btn-primary" disabled={loading || success}>
                            {loading ? '⏳ Procesando...' : success ? '✅ Reserva Creada' : '📅 Crear Reserva'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .reservation-form-container {
          padding: 20px;
        }

        .reservation-form-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          margin: 0 auto;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .form-header h2 {
          margin: 0;
          font-size: 28px;
          color: #1f2937;
          font-weight: 700;
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

        form {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-group label .icon {
          font-size: 18px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .alert .icon {
          font-size: 20px;
        }

        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #d1fae5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .form-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-secondary,
        .btn-primary {
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #4b5563;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: 1;
          }

          .form-footer {
            flex-direction: column;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </div>
    );
};

export default ReservationForm;
