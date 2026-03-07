import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) {
            setError('Supabase bağlantısı henüz kurulmadı.');
            return;
        }

        setLoading(true);
        setError(null);

        // Map username to internal email format for Supabase Auth
        const internalEmail = `${username.trim().toLowerCase()}@uruntrendi.local`;

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: internalEmail,
            password,
        });

        if (loginError) {
            setError(loginError.message === 'Invalid login credentials'
                ? 'E-posta veya şifre hatalı.'
                : loginError.message);
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top left, #1e1b4b, #020617)',
            padding: '20px'
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '48px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        <LogIn size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '8px' }}>Hoş Geldiniz</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Lütfen devam etmek için giriş yapın</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Kullanıcı Adı"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '16px 16px 16px 48px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
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
                                padding: '16px 16px 16px 48px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px', borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            padding: '16px', borderRadius: '16px', fontSize: '1.1rem',
                            fontWeight: '800', display: 'flex', justifyContent: 'center',
                            marginTop: '10px', boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
                        Ürün Trendi POS Sistemi v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};
