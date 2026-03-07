import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as UserIcon, LogIn, Lock, AlertCircle } from 'lucide-react';
import type { User as AppUser } from '../types';

interface LoginProps {
    onLogin: (user: AppUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

        try {
            // Check if user exists in the custom 'users' table
            const { data: users, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username.trim().toLowerCase())
                .eq('password', password);

            if (fetchError) {
                // Table might not exist yet or there's an RLS error
                if (username.toLowerCase() === 'admin' && password === '1234') {
                    // Try auto-creating only if it is the known initial admin
                    const { data: newUser, error: createError } = await supabase
                        .from('users')
                        .insert([
                            {
                                username: 'admin',
                                password: '1234',
                                full_name: 'Sistem Yöneticisi',
                                role: 'admin'
                            }
                        ])
                        .select();

                    if (!createError && newUser && newUser.length > 0) {
                        onLogin(newUser[0] as AppUser);
                        return;
                    }
                    setError(`Giriş Hatası: ${fetchError.message}. Lütfen SQL kodlarını Supabase Editor'de çalıştırdığınızdan emin olun.`);
                } else {
                    setError(`Hata: ${fetchError.message}`);
                }
            } else if (users && users.length > 0) {
                // Map the user roles if missing from DB for some reason, but they should be there
                const loggedInUser: AppUser = {
                    id: users[0].id,
                    username: users[0].username,
                    full_name: users[0].full_name || users[0].username,
                    role: users[0].role || 'admin',
                    created_at: users[0].created_at
                };
                onLogin(loggedInUser);
            } else {
                // Explicitly check for initial admin/1234 if table is empty
                if (username.toLowerCase() === 'admin' && password === '1234') {
                    const { data: allUsers } = await supabase.from('users').select('id').limit(1);
                    if (!allUsers || allUsers.length === 0) {
                        const { data: newUser, error: createError } = await supabase
                            .from('users')
                            .insert([{ username: 'admin', password: '1234', full_name: 'Sistem Yöneticisi', role: 'admin' }])
                            .select();
                        if (!createError && newUser) {
                            onLogin(newUser[0]);
                            return;
                        }
                    }
                }
                setError('Kullanıcı adı veya şifre hatalı.');
            }
        } catch (err) {
            setError('Bağlantı hatası oluştu.');
        } finally {
            setLoading(false);
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
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}>
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                            disabled={loading}
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
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
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
