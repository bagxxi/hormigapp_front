import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EditExpenseModal } from '../components/EditExpenseModal';

const CATEGORY_ICONS = {
    cafe: '☕',
    snacks: '🍪',
    transporte: '🚌',
    delivery: '🛵',
    entretenimiento: '🎮',
    compras: '🛍️',
    otros: '📦'
};

export function Home() {
    const [budget, setBudget] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const { getBudget, getExpenses, addExpense, updateExpense } = useApi();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [budgetData, expensesData] = await Promise.all([
                getBudget(),
                getExpenses()
            ]);
            setBudget(budgetData);
            setExpenses(expensesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBalanceStatus = (available) => {
        if (available <= 0) return 'negative';
        if (available < 10000) return 'warning';
        return 'positive';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        }
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    };

    const handleAddExpense = async (data) => {
        try {
            await addExpense(data);
            setShowModal(false);
            loadData();
        } catch (error) {
            throw error;
        }
    };

    const handleEditExpense = async (id, data) => {
        await updateExpense(id, data);
        setEditingExpense(null);
        loadData();
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    // Verificar si el presupuesto está configurado (monthly_income > 0)
    const isBudgetConfigured = budget && budget.monthly_income > 0;
    const availableMoney = budget?.available_money || 0;

    return (
        <>
            {/* Banner de configuración de presupuesto */}
            {!isBudgetConfigured && (
                <div className="setup-banner card">
                    <div className="setup-banner-icon">📋</div>
                    <h3>¡Configura tu presupuesto!</h3>
                    <p>Para comenzar a registrar tus gastos hormiga, primero debes configurar tu ingreso mensual y meta de ahorro.</p>
                    <Link to="/presupuesto" className="btn btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                        Configurar presupuesto
                    </Link>
                </div>
            )}

            {/* Balance Card - Solo mostrar si hay presupuesto configurado */}
            {isBudgetConfigured && (
                <div className="card balance-card">
                    <p className="balance-label">Saldo disponible para gastos</p>
                    <p className={`balance-amount ${getBalanceStatus(availableMoney)}`}>
                        {formatCurrency(availableMoney)}
                    </p>
                    <p className="balance-subtitle">
                        De {formatCurrency(budget?.monthly_income || 0)} de ingreso mensual
                    </p>
                </div>
            )}

            {/* Recent Expenses */}
            <section>
                <div className="section-header">
                    <h2 className="section-title">Últimos gastos</h2>
                    <Link to="/historial" className="section-link">Ver todos</Link>
                </div>

                {expenses.length === 0 ? (
                    <div className="card empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <p>No hay gastos registrados</p>
                        <p>{isBudgetConfigured ? '¡Registra tu primer gasto hormiga!' : 'Configura tu presupuesto para comenzar'}</p>
                    </div>
                ) : (
                    <div className="expense-list">
                        {expenses.slice(0, 5).map((expense) => (
                            <div key={expense.id} className="expense-item">
                                <div className="expense-info">
                                    <div className={`expense-icon ${expense.category || ''}`}>
                                        {expense.is_private ? '🔒' : (expense.custom_category_icon || CATEGORY_ICONS[expense.category] || '📦')}
                                    </div>
                                    <div className="expense-details">
                                        <h4>{expense.category_display}{expense.is_private && <span style={{ marginLeft: '4px', fontSize: '0.65rem', color: '#EF4444' }}>PRIVADO</span>}</h4>
                                        <span>{expense.description || 'Sin descripción'} • {formatDate(expense.date)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="expense-amount">
                                        {expense.is_private && expense.amount === '***' ? '$ ***' : formatCurrency(expense.amount)}
                                    </span>
                                    {!expense.is_private && (
                                        <button
                                            onClick={() => setEditingExpense(expense)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--primary-blue-light)',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                            title="Editar"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* FAB Button - Solo mostrar si hay presupuesto configurado */}
            {isBudgetConfigured && (
                <button className="fab" onClick={() => setShowModal(true)} title="Añadir gasto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            )}

            {/* Add Expense Modal */}
            {showModal && (
                <AddExpenseModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleAddExpense}
                />
            )}

            {/* Edit Expense Modal */}
            {editingExpense && (
                <EditExpenseModal
                    expense={editingExpense}
                    type="ant"
                    onClose={() => setEditingExpense(null)}
                    onSubmit={handleEditExpense}
                />
            )}
        </>
    );
}
