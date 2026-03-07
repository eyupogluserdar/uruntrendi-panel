import React from 'react';
import { Package, Calendar, CreditCard, Banknote, Clock, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';
import { formatCurrency } from '../utils/calculations';

interface OrdersPanelProps {
    orders: Order[];
    type: 'bekleyenler' | 'teslim edilenler';
    onUpdateOrderFlags?: (id: string, field: 'payment' | 'delivery') => void;
    onUpdateOrderTracked?: (id: string, isTracked: boolean) => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
    orders,
    type,
    onUpdateOrderFlags,
    onUpdateOrderTracked
}) => {

    const getRemainingTime = (targetDate?: string) => {
        if (!targetDate) return null;

        const now = new Date();
        const target = new Date(targetDate);

        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

        const diffTime = targetDay.getTime() - nowDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: `${Math.abs(diffDays)} gün gecikti`, color: 'var(--danger)', isNear: true };
        if (diffDays === 0) return { label: 'Bugün Teslimat', color: '#fbbf24', isNear: true };
        if (diffDays === 1) return { label: 'Yarın Teslimat', color: '#fbbf24', isNear: true };

        return { label: `${diffDays} gün kaldı`, color: 'var(--primary)', isNear: false };
    };

    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                marginTop: '10px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: type === 'bekleyenler' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                            color: type === 'bekleyenler' ? 'var(--primary)' : 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${type === 'bekleyenler'
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(16,185,129,0.2)'}`,
                        }}>
                            {type === 'bekleyenler' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                        </div>

                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                            {type === 'bekleyenler'
                                ? 'Aktif Siparişler'
                                : 'Teslim Edilenler'}
                        </h1>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {orders.length} toplam kayıt bulundu
                    </p>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="glass-card fade-in"
                     style={{ textAlign: 'center', padding: '100px 20px', borderStyle: 'dashed' }}>
                    <Package size={64} style={{ marginBottom: '24px', opacity: 0.1 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Henüz kayıtlı bir sipariş bulunmuyor.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '24px'
                }}>
                    {orders.map(order => {

                        const timeInfo = getRemainingTime(order.target_date);

                        const isUrgent =
                            order.is_post_dated &&
                            timeInfo?.isNear &&
                            order.status === 'Bekliyor';

                        const isTrackedActive =
                            order.is_tracked &&
                            order.status === 'Bekliyor';

                        const shouldPulse = isUrgent && !order.is_tracked;

                        return (
                            <div key={order.id}
                                 className={`glass-card fade-in ${shouldPulse ? 'pulse-border' : ''} ${isTrackedActive ? 'tracked-active' : ''}`}
                                 style={{
                                     padding: '28px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     transition: 'all 0.3s ease',
                                     border: isTrackedActive
                                         ? '2px solid #10b981'
                                         : shouldPulse
                                             ? '1px solid rgba(251,191,36,0.4)'
                                             : '1px solid var(--glass-border)',
                                 }}>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '4px'
                                        }}>
                                            Sipariş #{order.id}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.9rem',
                                            color: 'var(--text)'
                                        }}>
                                            <Calendar size={14} color="var(--primary)" />

                                            {new Date(order.created_at).toLocaleString('tr-TR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '6px 14px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: '800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {order.payment_method === 'Nakit'
                                            ? <Banknote size={16}/>
                                            : <CreditCard size={16}/>}

                                        {order.payment_method.toUpperCase()}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(0,0,0,0.15)',
                                    borderRadius: '16px',
                                    marginBottom: '20px',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx}
                                             style={{
                                                 display: 'flex',
                                                 justifyContent: 'space-between',
                                                 marginBottom: '10px',
                                                 fontSize: '0.95rem'
                                             }}>
                                            <span style={{ fontWeight: '500' }}>
                                                <span style={{
                                                    color: 'var(--primary)',
                                                    fontWeight: '800'
                                                }}>
                                                    {item.quantity}x
                                                </span> {item.title}
                                            </span>

                                            <span style={{
                                                color: 'var(--text-muted)',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}>
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}

                                    <div style={{
                                        marginTop: '12px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            Toplam:
                                        </span>

                                        <span style={{
                                            fontSize: '1.4rem',
                                            fontWeight: '900',
                                            color: 'var(--primary)',
                                            letterSpacing: '-0.02em'
                                        }}>
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
