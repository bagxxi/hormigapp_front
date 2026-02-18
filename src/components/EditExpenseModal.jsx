import { useState, useEffect } from 'react';

const CATEGORIES = [
    { value: 'cafe', label: 'Café', icon: '☕' },
    { value: 'snacks', label: 'Snacks', icon: '🍪' },
    { value: 'transporte', label: 'Transporte', icon: '🚌' },
    { value: 'delivery', label: 'Delivery', icon: '🛵' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎮' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'otros', label: 'Otros', icon: '📦' },
];

/**
 * Modal reutilizable para editar gastos.
 * @param {Object} expense - El gasto a editar
 * @param {'ant'|'fixed'} type - Tipo de gasto: 'ant' (hormiga) o 'fixed' (fijo)
 * @param {Function} onClose - Cerrar modal
 * @param {Function} onSubmit - Callback con (id, data) al guardar
 */
export function EditExpenseModal({ expense, type = 'ant', onClose, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('cafe');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (expense) {
            setAmount(Math.round(expense.amount || 0).toString());
            if (type === 'ant') {
                setCategory(expense.category || 'cafe');
                setDescription(expense.description || '');
            } else {
                setName(expense.name || '');
            }
        }
    }, [expense, type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = type === 'ant'
                ? { amount: parseFloat(amount), category, description: description || null }
                : { name, amount: parseInt(amount) || 0 };

            await onSubmit(expense.id, data);
        } catch (err) {
            try {
                const errorData = JSON.parse(err.message);
                const firstError = Object.values(errorData)[0];
                setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } catch {
                setError('Error al guardar los cambios. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {type === 'ant' ? 'Editar gasto' : 'Editar gasto fijo'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Nombre - solo para gastos fijos */}
                    {type === 'fixed' && (
                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Arriendo, Netflix, etc."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Monto */}
                    <div className="form-group">
                        <label className="form-label">Monto (CLP)</label>
                        <input
                            type={type === 'ant' ? 'number' : 'text'}
                            inputMode="numeric"
                            className="form-input"
                            placeholder="Ej: 2500"
                            value={amount}
                            onChange={(e) => {
                                if (type === 'fixed') {
                                    setAmount(e.target.value.replace(/\D/g, ''));
                                } else {
                                    setAmount(e.target.value);
                                }
                            }}
                            required
                            min={type === 'ant' ? '1' : undefined}
                            autoFocus={type === 'ant'}
                        />
                    </div>

                    {/* Categoría - solo para gastos hormiga */}
                    {type === 'ant' && (
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        style={{
                                            padding: '12px 8px',
                                            border: category === cat.value ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                            borderRadius: '8px',
                                            background: category === cat.value ? 'var(--bg-light)' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Descripción - solo para gastos hormiga */}
                    {type === 'ant' && (
                        <div className="form-group">
                            <label className="form-label">
                                Descripción (opcional)
                                <span style={{
                                    float: 'right',
                                    fontSize: '0.75rem',
                                    color: description.length >= 25 ? 'var(--balance-warning)' : 'var(--text-secondary)',
                                    fontWeight: description.length >= 30 ? '600' : '400'
                                }}>
                                    {description.length}/30
                                </span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Café en Starbucks"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={30}
                            />
                        </div>
                    )}

                    {error && (
                        <p style={{ color: 'var(--balance-negative)', marginBottom: '16px', fontSize: '0.875rem' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                        disabled={loading || !amount || (type === 'fixed' && !name)}
                    >
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
