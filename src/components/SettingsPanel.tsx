import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Zap, Save, Plus, Trash2, Tag, Users } from 'lucide-react';
import type { Filament, UserProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { supabase } from '../lib/supabase';

interface SettingsPanelProps {
    rate: number;
    onRateChange: (newRate: number) => void;
    powerWatt: number;
    onPowerWattChange: (newWatt: number) => void;
    filaments: Filament[];
    onFilamentsChange: (newFilaments: Filament[]) => void;
    onClose: () => void;
    profile: UserProfile | null;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ rate, onRateChange, powerWatt, onPowerWattChange, filaments, onFilamentsChange, onClose, profile }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
    const [tempRate, setTempRate] = useState(rate);
    const [tempPower, setTempPower] = useState(powerWatt);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newFilament, setNewFilament] = useState<Partial<Filament>>({ brand: '', type: 'PLA', price_per_kg: 0, stock_g: 0 });

    // User management state
    const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
    const [newUser, setNewUser] = useState({ username: '', fullName: '', password: '', role: 'manager' as const });
    const [userLoading, setUserLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchProfiles();
        }
    }, [activeTab]);

    const fetchProfiles = async () => {
        if (!supabase) return;
        setUserLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('full_name');
        if (!error && data) setUserProfiles(data);
        setUserLoading(false);
    };

    const handleCreateUser = async () => {
        if (!supabase || !newUser.username || !newUser.password) {
            setUserError('Lütfen tüm alanları doldurun.');
            return;
        }
        setUserLoading(true);
        setUserError(null);

        const email = `${newUser.username.trim().toLowerCase()}@uruntrendi.local`;

        // Supabase Auth requires an e-mail. We map username to an internal e-mail.
        const { data, error } = await supabase.auth.signUp({
            email,
            password: newUser.password,
            options: {
                data: {
                    full_name: newUser.fullName,
                    role: newUser.role
                }
            }
        });

        if (error) {
            setUserError(error.message);
        } else {
            // Profil tablosuna ekleme
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: newUser.fullName || newUser.username,
                    role: newUser.role
                });
                if (profileError) console.error('Profile creation error:', profileError);
            }
            fetchProfiles();
            setNewUser({ username: '', fullName: '', password: '', role: 'manager' });
        }
        setUserLoading(false);
    };

    const handleDeleteUser = async (id: string) => {
        if (!supabase || id === profile?.id) return;
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (!error) fetchProfiles();
        else alert('Kullanıcı silinemedi: ' + error.message);
    };

    const handleSaveRate = () => {
        onRateChange(tempRate);
    };

    const handleSavePower = () => {
        onPowerWattChange(tempPower);
    };

    const handleAddFilament = () => {
        if (newFilament.brand && newFilament.price_per_kg) {
            if (editingId) {
                onFilamentsChange(filaments.map(f => f.id === editingId ? { ...f, ...newFilament } as Filament : f));
                setEditingId(null);
            } else {
                const filament: Filament = {
                    id: Math.random().toString(36).substring(2, 9),
                    brand: newFilament.brand,
                    type: newFilament.type || 'PLA',
                    price_per_kg: newFilament.price_per_kg,
                    stock_g: newFilament.stock_g || 0
                };
                onFilamentsChange([...filaments, filament]);
            }
            setNewFilament({ brand: '', type: 'PLA', price_per_kg: 0, stock_g: 0 });
        }
    };

    const handleEditStart = (f: Filament) => {
        setEditingId(f.id);
        setNewFilament({ brand: f.brand, type: f.type, price_per_kg: f.price_per_kg, stock_g: f.stock_g });
    };

    const handleRemoveFilament = (id: string | undefined) => {
        if (!id) return;
        onFilamentsChange(filaments.filter(f => f.id !== id));
    };

    const inputStyle: React.CSSProperties = {
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        background: 'rgba(15, 23, 42, 0.6)',
        color: 'white',
        fontSize: '0.95rem',
        outline: 'none',
        width: '100%',
        transition: 'all 0.2s'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            padding: '20px'
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '40px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <SettingsIcon size={22} />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Ayarlar</h2>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: '8px', borderRadius: '10px'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {profile?.role === 'admin' && (
                    <div style={{
                        display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)',
                        padding: '6px', borderRadius: '14px', marginBottom: '32px'
                    }}>
                        <button
                            onClick={() => setActiveTab('general')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                background: activeTab === 'general' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Genel Ayarlar
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                background: activeTab === 'users' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Users size={16} /> Kullanıcı Yönetimi
                        </button>
                    </div>
                )}

                {activeTab === 'general' ? (
                    <>
                        <section style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={16} color="var(--warning)" /> Elektrik ve Güç Tüketimi
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Birim Fiyat (TL/kWh)</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input type="number" step="0.01" value={tempRate} onChange={(e) => setTempRate(parseFloat(e.target.value))} style={inputStyle} />
                                        <button onClick={handleSaveRate} className="btn btn-primary" style={{ padding: '12px' }}><Save size={18} /></button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Cihaz Güç Tüketimi (Watt)</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input type="number" step="1" value={tempPower} onChange={(e) => setTempPower(parseInt(e.target.value))} style={inputStyle} />
                                        <button onClick={handleSavePower} className="btn btn-primary" style={{ padding: '12px' }}><Save size={18} /></button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>P1S için ortalama 100W önerilir.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={16} color="var(--primary)" /> Flament Kütüphanesi
                            </h3>
                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: editingId ? '1px solid var(--primary)' : '1px dashed var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{editingId ? 'Flament Düzenle' : 'Yeni Flament Ekle'}</span>
                                    {editingId && <button onClick={() => { setEditingId(null); setNewFilament({ brand: '', type: 'PLA', price_per_kg: 0, stock_g: 0 }); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>İptal</button>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <input placeholder="Marka" style={inputStyle} value={newFilament.brand} onChange={e => setNewFilament({ ...newFilament, brand: e.target.value })} />
                                    <select style={inputStyle} value={newFilament.type} onChange={e => setNewFilament({ ...newFilament, type: e.target.value })}>
                                        <option value="PLA">PLA</option>
                                        <option value="PETG">PETG</option>
                                        <option value="ABS">ABS</option>
                                        <option value="ASA">ASA</option>
                                        <option value="TPU">TPU</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <input type="number" placeholder="Kg Fiyatı (TL)" style={inputStyle} value={newFilament.price_per_kg || ''} onChange={e => setNewFilament({ ...newFilament, price_per_kg: parseFloat(e.target.value) })} />
                                    <input type="number" placeholder="Stok (Gr)" style={inputStyle} value={newFilament.stock_g || ''} onChange={e => setNewFilament({ ...newFilament, stock_g: parseInt(e.target.value) })} />
                                </div>
                                <button onClick={handleAddFilament} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
                                    {editingId ? <Save size={18} /> : <Plus size={18} />}
                                    {editingId ? 'Değişiklikleri Kaydet' : 'Kütüphaneye Ekle'}
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filaments.map(f => (
                                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{f.brand} {f.type}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCurrency(f.price_per_kg)} / kg <span style={{ opacity: 0.5 }}>•</span> Stok: {f.stock_g} gr</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditStart(f)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}><Save size={18} /></button>
                                            <button onClick={() => handleRemoveFilament(f.id)} style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="fade-in">
                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px dashed var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px' }}>Yeni Kullanıcı</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <input placeholder="Kullanıcı Adı" style={inputStyle} value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                                <input placeholder="Tam Adı" style={inputStyle} value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <input type="password" placeholder="Şifre" style={inputStyle} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}>
                                    <option value="manager">Yetkili (Manager)</option>
                                    <option value="admin">Yönetici (Admin)</option>
                                </select>
                            </div>
                            {userError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '12px' }}>{userError}</p>}
                            <button onClick={handleCreateUser} disabled={userLoading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
                                {userLoading ? 'Oluşturuluyor...' : 'Kaydet'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {userProfiles.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>{p.full_name} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>({p.role.toUpperCase()})</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {p.id.substring(0, 8)}...</div>
                                    </div>
                                    <button onClick={() => handleDeleteUser(p.id)} disabled={p.id === profile?.id} style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: p.id === profile?.id ? 'transparent' : 'var(--danger)', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <style>{`
                input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
            `}</style>
        </div>
    );
};
