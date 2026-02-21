import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const EMOJI_OPTIONS = ['📌', '🎯', '💊', '🎁', '🏠', '🚗', '💻', '📱', '🎵', '🍺', '🌮', '💇', '🏋️', '📚', '🎬', '✈️', '🎮', '👕', '💰', '🔒'];

const maskName = (name) => {
    if (!name) return '***';
    return name.length > 2 ? name.substring(0, 2) + '***' : name + '***';
};

export function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('📌');
    const [newIsPrivate, setNewIsPrivate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('📌');

    // Privacy modal
    const [privacyModal, setPrivacyModal] = useState(null);
    const [privacyPassword, setPrivacyPassword] = useState('');
    const [privacyError, setPrivacyError] = useState('');
    const [privacyLoading, setPrivacyLoading] = useState(false);

    // Delete modal
    const [deleteModal, setDeleteModal] = useState(null); // { category }
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [sortBy, setSortBy] = useState('creation'); // 'creation' | 'alphabetical'

    const {
        getCustomCategories, addCustomCategory, updateCustomCategory,
        deleteCustomCategory, toggleCategoryPrivacy, revealPrivateExpenses
    } = useApi();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCustomCategories();
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await addCustomCategory({
                name: newName.trim(),
                icon: newIcon,
                is_private: newIsPrivate,
            });
            setNewName('');
            setNewIcon('📌');
            setNewIsPrivate(false);
            setShowAddForm(false);
            loadCategories();
        } catch (err) {
            alert('Error al crear categoría. Verifica que el nombre no esté duplicado.');
        }
    };

    const handleEdit = async (id) => {
        if (!editName.trim()) return;
        try {
            await updateCustomCategory(id, { name: editName.trim(), icon: editIcon });
            setEditingId(null);
            loadCategories();
        } catch (err) {
            alert('Error al actualizar categoría.');
        }
    };

    const handleDelete = async (id) => {
        const cat = categories.find(c => c.id === id);
        setDeleteModal({ category: cat });
        setDeletePassword('');
        setDeleteError('');
    };

    const confirmDelete = async () => {
        if (!deleteModal) return;
        const cat = deleteModal.category;

        // Si es privada, verificar contraseña primero
        if (cat.is_private) {
            if (!deletePassword) {
                setDeleteError('Ingresa tu contraseña para eliminar una categoría privada');
                return;
            }
            setDeleteLoading(true);
            setDeleteError('');
            try {
                // Usamos revealPrivateExpenses como una forma de verificar la contraseña
                await revealPrivateExpenses(deletePassword);
            } catch (err) {
                setDeleteError('Contraseña incorrecta');
                setDeleteLoading(false);
                return;
            }
        }

        try {
            setDeleteLoading(true);
            await deleteCustomCategory(cat.id);
            setDeleteModal(null);
            loadCategories();
        } catch (err) {
            setDeleteError('Error al eliminar la categoría');
        } finally {
            setDeleteLoading(false);
        }
    };

    const openPrivacyToggle = (category) => {
        setPrivacyModal({ categoryId: category.id, currentPrivacy: category.is_private });
        setPrivacyPassword('');
        setPrivacyError('');
    };

    const handleTogglePrivacy = async () => {
        if (!privacyPassword) {
            setPrivacyError('Ingresa tu contraseña');
            return;
        }
        setPrivacyLoading(true);
        setPrivacyError('');
        try {
            await toggleCategoryPrivacy(
                privacyModal.categoryId,
                privacyPassword,
                !privacyModal.currentPrivacy
            );
            setPrivacyModal(null);
            loadCategories();
        } catch (err) {
            try {
                const errorData = JSON.parse(err.message);
                setPrivacyError(errorData.error || 'Error al cambiar privacidad');
            } catch {
                setPrivacyError('Contraseña incorrecta');
            }
        } finally {
            setPrivacyLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p>Cargando categorías...</p>
            </div>
        );
    }

    return (
        <>
            <h1 style={{ marginBottom: '8px' }}>Mis Categorías</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Crea categorías personalizadas para tus gastos. Las privadas ocultan los datos.
            </p>

            {/* Category List */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3>🏷️ Categorías</h3>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)',
                                fontSize: '0.75rem',
                                background: 'white'
                            }}
                        >
                            <option value="creation">Por orden agregado</option>
                            <option value="alphabetical">Alfabéticamente</option>
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{ padding: '8px 16px' }}
                    >
                        {showAddForm ? 'Cancelar' : '+ Nueva'}
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <form onSubmit={handleAdd} style={{
                        background: 'var(--bg-light)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Gimnasio, Mascotas..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                maxLength={30}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ícono</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setNewIcon(emoji)}
                                        style={{
                                            width: '40px', height: '40px',
                                            border: newIcon === emoji ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                                            borderRadius: '8px',
                                            background: newIcon === emoji ? 'white' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                cursor: 'pointer', userSelect: 'none'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={newIsPrivate}
                                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)' }}
                                />
                                <span>🔒 Categoría privada</span>
                            </label>
                        </div>

                        {newIsPrivate && (
                            <p style={{
                                color: 'var(--text-secondary)', fontSize: '0.8rem',
                                background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px',
                                marginBottom: '12px'
                            }}>
                                ⚠️ Los gastos de esta categoría mostrarán datos ocultos. Solo se revelan con tu contraseña.
                            </p>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                            Crear categoría
                        </button>
                    </form>
                )}

                {/* Categories list */}
                {categories.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🏷️</p>
                        <p>No tienes categorías personalizadas</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                            Crea una para organizar tus gastos a tu manera
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...categories].sort((a, b) => {
                            if (sortBy === 'alphabetical') {
                                return a.name.localeCompare(b.name);
                            }
                            // Orden por creación (ID o created_at)
                            return new Date(a.created_at) - new Date(b.created_at);
                        }).map((cat) => (
                            <div key={cat.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--bg-white)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease'
                            }}>
                                {editingId === cat.id ? (
                                    /* Edit mode */
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <select
                                            value={editIcon}
                                            onChange={(e) => setEditIcon(e.target.value)}
                                            style={{
                                                width: '48px', height: '36px',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '6px', fontSize: '1.25rem',
                                                textAlign: 'center', cursor: 'pointer'
                                            }}
                                        >
                                            {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{ flex: 1, padding: '6px 10px' }}
                                            maxLength={30}
                                        />
                                        <button
                                            onClick={() => handleEdit(cat.id)}
                                            className="btn btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        >✓</button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        >✕</button>
                                    </div>
                                ) : (
                                    /* View mode */
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{cat.is_private ? '🔒' : cat.icon}</span>
                                            <div>
                                                <span style={{ fontWeight: 600 }}>{cat.is_private ? maskName(cat.name) : cat.name}</span>
                                                {cat.is_private && (
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        fontSize: '0.7rem',
                                                        background: '#EF4444',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: 600
                                                    }}>🔒 PRIVADA</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {/* Toggle Privacy */}
                                            <button
                                                onClick={() => openPrivacyToggle(cat)}
                                                style={{
                                                    background: 'none', border: 'none',
                                                    cursor: 'pointer', padding: '6px',
                                                    color: cat.is_private ? 'var(--balance-negative)' : 'var(--text-secondary)',
                                                    fontSize: '1rem'
                                                }}
                                                title={cat.is_private ? 'Quitar privacidad' : 'Hacer privada'}
                                            >
                                                {cat.is_private ? '🔓' : '🔒'}
                                            </button>
                                            {/* Edit */}
                                            <button
                                                onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditIcon(cat.icon); }}
                                                style={{
                                                    background: 'none', border: 'none',
                                                    color: 'var(--primary-blue-light)',
                                                    cursor: 'pointer', padding: '6px'
                                                }}
                                                title="Editar"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                style={{
                                                    background: 'none', border: 'none',
                                                    color: 'var(--balance-negative)',
                                                    cursor: 'pointer', padding: '6px'
                                                }}
                                                title="Eliminar"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="card" style={{ background: 'var(--bg-light)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '0.875rem' }}>🔒 ¿Cómo funciona la privacidad?</h4>
                <ul style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    paddingLeft: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <li>Las categorías privadas ocultan el nombre, monto y descripción de sus gastos</li>
                    <li>Solo se muestran las dos primeras letras del nombre</li>
                    <li>Para ver los datos completos, ingresa tu contraseña</li>
                    <li>Cambiar la privacidad siempre requiere confirmación con contraseña</li>
                </ul>
            </div>

            {/* Privacy Toggle Modal */}
            {privacyModal && (
                <div className="modal-overlay" onClick={() => setPrivacyModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {privacyModal.currentPrivacy ? '🔓 Quitar privacidad' : '🔒 Hacer privada'}
                            </h2>
                            <button className="modal-close" onClick={() => setPrivacyModal(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
                            {privacyModal.currentPrivacy
                                ? 'Los gastos de esta categoría volverán a ser visibles para todos.'
                                : 'Los gastos de esta categoría serán ocultados. Solo verás las 2 primeras letras.'}
                        </p>

                        <div className="form-group">
                            <label className="form-label">Confirma tu contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Tu contraseña"
                                value={privacyPassword}
                                onChange={(e) => setPrivacyPassword(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {privacyError && (
                            <p style={{ color: 'var(--balance-negative)', marginBottom: '12px', fontSize: '0.875rem' }}>
                                {privacyError}
                            </p>
                        )}

                        <button
                            onClick={handleTogglePrivacy}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                            disabled={privacyLoading || !privacyPassword}
                        >
                            {privacyLoading ? 'Verificando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            )}
            {/* Modal de Eliminación */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">🗑️ Eliminar categoría</h2>
                            <button className="modal-close" onClick={() => setDeleteModal(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem' }}>
                                ¿Estás seguro de que quieres eliminar la categoría <strong>"{deleteModal.category.is_private ? maskName(deleteModal.category.name) : deleteModal.category.name}"</strong>?
                            </p>
                            <div style={{
                                background: 'var(--bg-light)',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-light)'
                            }}>
                                <p style={{ margin: '0 0 8px 0' }}>• Los gastos asociados se moverán a <strong>"Otros"</strong>.</p>
                                {deleteModal.category.is_private && (
                                    <p style={{ margin: 0, color: 'var(--balance-negative)', fontWeight: '500' }}>
                                        ⚠️ IMPORTANTE: Sus datos dejarán de estar ocultos y serán visibles.
                                    </p>
                                )}
                            </div>
                        </div>

                        {deleteModal.category.is_private && (
                            <div className="form-group">
                                <label className="form-label">Confirma con tu contraseña</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Tu contraseña de HormigApp"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        {deleteError && (
                            <p style={{ color: 'var(--balance-negative)', marginBottom: '16px', fontSize: '0.875rem' }}>
                                {deleteError}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setDeleteModal(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{
                                    flex: 2,
                                    background: deleteModal.category.is_private ? '#e11d48' : 'var(--primary-blue)'
                                }}
                                onClick={confirmDelete}
                                disabled={deleteLoading || (deleteModal.category.is_private && !deletePassword)}
                            >
                                {deleteLoading ? 'Eliminando...' : 'Eliminar categoría'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
