import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/hormigapplogo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://hormigapp.onrender.com/api';

export function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Verificar token al cargar
    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/password-reset/verify/${token}/`);
            const data = await response.json();

            if (response.ok && data.valid) {
                setValid(true);
            } else {
                setError(data.error || 'Enlace inválido o expirado');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/password-reset/confirm/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    password,
                    password_confirm: passwordConfirm
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Redirigir al login después de 3 segundos
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--bg-light)'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {!valid ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
                        <h2 style={{ marginBottom: '12px' }}>Enlace inválido</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {error}
                        </p>
                        <Link
                            to="/forgot-password"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Solicitar nuevo enlace
                        </Link>
                    </div>
                ) : success ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ marginBottom: '12px', color: 'var(--balance-positive)' }}>
                            ¡Contraseña actualizada!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Redirigiendo al login...
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img src={logoImg} alt="HormigApp" style={{ width: '140px', margin: '0 auto 12px', display: 'block' }} />
                            <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                                Nueva contraseña
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Ingresa tu nueva contraseña
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="card">
                            <div className="form-group">
                                <label className="form-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p style={{
                                    color: 'var(--balance-negative)',
                                    marginBottom: '16px',
                                    fontSize: '0.875rem'
                                }}>
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '12px' }}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Cambiar contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
