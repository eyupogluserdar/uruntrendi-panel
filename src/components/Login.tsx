import React, { useState } from 'react';
import { LogIn, Lock, AlertCircle } from 'lucide-react';
import type { User as AppUser } from '../types';

interface LoginProps {
    onLogin: (user: AppUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Hardcoded master password supplied by the user
    const MASTER_PASSWORD = 'rntrnd2026';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password === MASTER_PASSWORD) {
            // Save login state to localStorage so the user won't be prompted again 
            // on the same device unless they explicitly log out.
            localStorage.setItem('isAuthenticated', 'true');

            // Generate a local mock admin user to satisfy the App's user state
            const loggedInUser: AppUser = {
                id: 'admin-' + Math.random().toString(36).substr(2, 9),
                username: 'admin',
                full_name: 'Sistem Yöneticisi',
                role: 'admin'
            };
            onLogin(loggedInUser);
        } else {
            setError('Şifre hatalı. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background pulse */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                        color: 'white'
                    }}>
                        <LogIn size={32} />
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: 'white', letterSpacing: '-0.02em' }}>Hoş Geldiniz</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Lütfen devam etmek için giriş yapın</p>

                    <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                        {/* Removed Username Input */}

                        <div style={{ marginBottom: '24px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 48px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '14px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                className="login-input"
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                color: '#ef4444',
                                fontSize: '0.85rem',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            Giriş Yap
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: '32px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                    Ürün Trendi POS Sistemi v2.0
                </div>
            </div>

            <style>{`
                .login-input:focus {
                    border-color: var(--primary) !important;
                    background: rgba(15, 23, 42, 0.8) !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
