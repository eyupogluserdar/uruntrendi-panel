import React, { useState } from 'react';
import { X, ShoppingBasket, Trash2, CreditCard, Banknote, Calendar, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import type { OrderItem, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/calculations';

interface POSPanelProps {
    cart: OrderItem[];
    onUpdateCart: (cart: OrderItem[]) => void;
    onClose: () => void;
    onProcessOrder: (paymentMethod: PaymentMethod, isPostDated: boolean, targetDate: string, notes: string) => void;
}

export const POSPanel: React.FC<POSPanelProps> = ({ cart, onUpdateCart, onClose, onProcessOrder }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nakit');
    const [isPostDated, setIsPostDated] = useState(false);
    const [targetDate, setTargetDate] = useState<string>('');
    const [notes, setNotes] = useState('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (productId: string, delta: number) => {
        const newCart = cart.map(item => {
            if (item.product_id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        onUpdateCart(newCart);
    };

    const removeItem = (productId: string) => {
        onUpdateCart(cart.filter(item => item.product_id !== productId));
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(24px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: '1000px',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '28px 40px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                        }}>
                            <ShoppingBasket size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Kasa Paneli</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{cart.length}</span> Ürün Listeleniyor
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: '12px', borderRadius: '14px', display: 'flex',
                        transition: 'all 0.2s'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <X size={24} />
                    </button>
                </div>

                {/* Two Column Layout Container */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* Left Column: Product List (Wider) */}
                    <div style={{
                        flex: 1.4,
                        overflowY: 'auto',
                        padding: '40px',
                        background: 'rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '10px'
                        }}>
                            <span>SEPET İÇERİĞİ</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(99, 102, 241, 0.15)' }}></div>
                        </div>

                        {cart.length === 0 ? (
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', opacity: 0.3
                            }}>
                                <ShoppingBasket size={64} style={{ marginBottom: '24px' }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Sepetiniz henüz boş.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product_id} className="glass-card fade-in" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '24px 32px',
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '24px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'white', marginBottom: '6px' }}>{item.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                                                <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1rem' }}>{formatCurrency(item.price)}</span>
                                            </div>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>x {item.quantity} Adet</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'rgba(0,0,0,0.4)',
                                            borderRadius: '16px',
                                            padding: '6px',
                                            border: '1px solid rgba(255,255,255,0.08)'
                                        }}>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                style={{
                                                    background: 'transparent', border: 'none', color: 'white',
                                                    cursor: 'pointer', padding: '10px 16px', fontSize: '1.4rem',
                                                    fontWeight: '800', transition: 'all 0.2s', borderRadius: '12px'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >-</button>
                                            <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: '900', fontSize: '1.3rem', color: 'white' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, 1)}
                                                style={{
                                                    background: 'transparent', border: 'none', color: 'white',
                                                    cursor: 'pointer', padding: '10px 16px', fontSize: '1.4rem',
                                                    fontWeight: '800', transition: 'all 0.2s', borderRadius: '12px'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.product_id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                                                color: 'var(--danger)', cursor: 'pointer',
                                                padding: '16px', borderRadius: '18px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Order Details & Sidebar */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '40px',
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px'
                    }}>
                        {/* Payment Method Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ödeme Yöntemi</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    onClick={() => setPaymentMethod('Nakit')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        padding: '16px', borderRadius: '16px', border: '2px solid',
                                        borderColor: paymentMethod === 'Nakit' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        background: paymentMethod === 'Nakit' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.01)',
                                        color: paymentMethod === 'Nakit' ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer', fontWeight: '800', fontSize: '1rem', transition: 'all 0.2s'
                                    }}
                                >
                                    <Banknote size={20} /> Nakit
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('Kart')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        padding: '16px', borderRadius: '16px', border: '2px solid',
                                        borderColor: paymentMethod === 'Kart' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        background: paymentMethod === 'Kart' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.01)',
                                        color: paymentMethod === 'Kart' ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer', fontWeight: '800', fontSize: '1rem', transition: 'all 0.2s'
                                    }}
                                >
                                    <CreditCard size={20} /> Kart
                                </button>
                            </div>
                        </div>

                        {/* Post-Dated Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sipariş Zamanlaması</div>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                padding: '20px', borderRadius: '18px', background: isPostDated ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid', borderColor: isPostDated ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)',
                                fontSize: '1rem', fontWeight: '700', color: isPostDated ? 'var(--warning)' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={isPostDated}
                                    onChange={(e) => setIsPostDated(e.target.checked)}
                                    style={{ width: '22px', height: '22px', accentColor: 'var(--warning)' }}
                                />
                                <Calendar size={20} /> İleri Tarihli Sipariş
                            </label>

                            {isPostDated && (
                                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tahmini Teslimat:</label>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        style={{
                                            padding: '14px 20px', borderRadius: '14px', border: '1px solid var(--warning)',
                                            background: 'rgba(245, 158, 11, 0.05)', color: 'white', outline: 'none',
                                            fontSize: '1rem', width: '100%'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sipariş Notu</div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Özel talepler, paketleme detayları..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '18px 24px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    resize: 'none',
                                    lineHeight: '1.5',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        {/* Summary Card with Confirm Button */}
                        <div style={{
                            marginTop: 'auto',
                            padding: '32px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                            borderRadius: '28px',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Toplam Tutar</div>
                                    <div style={{ fontSize: '2.4rem', fontWeight: '950', color: 'white', letterSpacing: '-0.04em', lineHeight: '1' }}>{formatCurrency(total)}</div>
                                </div>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)'
                                }}>
                                    <Info size={18} />
                                </div>
                            </div>

                            <button
                                onClick={() => onProcessOrder(paymentMethod, isPostDated, targetDate, notes)}
                                disabled={cart.length === 0 || (isPostDated && !targetDate)}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    fontSize: '1.2rem',
                                    fontWeight: '900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: '0 12px 30px rgba(99, 102, 241, 0.5)',
                                    opacity: (cart.length === 0 || (isPostDated && !targetDate)) ? 0.5 : 1
                                }}
                            >
                                <CheckCircle2 size={24} /> <span>Siparişi Onayla</span> <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
};
