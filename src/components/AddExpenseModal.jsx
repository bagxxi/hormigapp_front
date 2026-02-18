import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const DEFAULT_CATEGORIES = [
    { value: 'cafe', label: 'Café', icon: '☕' },
    { value: 'snacks', label: 'Snacks', icon: '🍪' },
    { value: 'transporte', label: 'Transporte', icon: '🚌' },
    { value: 'delivery', label: 'Delivery', icon: '🛵' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎮' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'otros', label: 'Otros', icon: '📦' },
];

export function AddExpenseModal({ onClose, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('cafe');
    const [customCategoryId, setCustomCategoryId] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [customCategories, setCustomCategories] = useState([]);

    const { getCustomCategories } = useApi();

    useEffect(() => {
        loadCustomCategories();
    }, []);

    const loadCustomCategories = async () => {
        try {
            const data = await getCustomCategories();
            setCustomCategories(data);
        } catch (err) {
            console.error('Error loading custom categories:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                amount: parseFloat(amount),
                description: description || null
            };

            if (customCategoryId) {
                data.custom_category_id = customCategoryId;
            } else {
                data.category = category;
            }

            await onSubmit(data);
        } catch (err) {
            // Intentar parsear el mensaje de error del backend
            try {
                const errorData = JSON.parse(err.message);
                if (errorData.amount) {
                    setError(Array.isArray(errorData.amount) ? errorData.amount[0] : errorData.amount);
                } else if (errorData.category) {
                    setError(Array.isArray(errorData.category) ? errorData.category[0] : errorData.category);
                } else if (errorData.error) {
                    setError(errorData.error);
                } else if (errorData.detail) {
                    setError(errorData.detail);
                } else {
                    const firstError = Object.values(errorData)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
                }
            } catch {
                setError('Error al guardar el gasto. Verifica los datos e intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (catValue) => {
        setCategory(catValue);
        setCustomCategoryId(null);
    };

    const handleCustomCategorySelect = (catId) => {
        setCustomCategoryId(catId);
        setCategory('');
    };

    const isSelectedDefault = (catValue) => !customCategoryId && category === catValue;
    const isSelectedCustom = (catId) => customCategoryId === catId;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Añadir gasto</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Monto (CLP)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Ej: 2500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Categoría</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.value)}
                                    style={{
                                        padding: '12px 8px',
                                        border: isSelectedDefault(cat.value) ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        background: isSelectedDefault(cat.value) ? 'var(--bg-light)' : 'white',
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

                        {/* Custom Categories */}
                        {customCategories.length > 0 && (
                            <>
                                <p style={{
                                    fontSize: '0.75rem', color: 'var(--text-secondary)',
                                    margin: '12px 0 8px', fontWeight: 500
                                }}>Mis categorías:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {customCategories.map((cat) => (
                                        <button
                                            key={`custom-${cat.id}`}
                                            type="button"
                                            onClick={() => handleCustomCategorySelect(cat.id)}
                                            style={{
                                                padding: '12px 8px',
                                                border: isSelectedCustom(cat.id) ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                                borderRadius: '8px',
                                                background: isSelectedCustom(cat.id) ? 'var(--bg-light)' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                position: 'relative'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {cat.is_private ? '🔒' : cat.icon}
                                            </span>
                                            <span style={{
                                                maxWidth: '100%', overflow: 'hidden',
                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {cat.name}
                                            </span>
                                            {cat.is_private && (
                                                <span style={{
                                                    position: 'absolute', top: '4px', right: '4px',
                                                    fontSize: '0.5rem', background: '#EF4444',
                                                    color: 'white', padding: '1px 3px',
                                                    borderRadius: '3px', fontWeight: 700
                                                }}>P</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

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

                    {error && (
                        <p style={{ color: 'var(--balance-negative)', marginBottom: '16px', fontSize: '0.875rem' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Guardando...' : 'Guardar gasto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
