import React, { useState } from 'react';
import { Wallet, TrendingUp, Calendar, CreditCard, Banknote, History, PieChart, ChevronRight, X, Package, PackageOpen, Filter } from 'lucide-react';
import type { Order, Product } from '../types';
import { formatCurrency } from '../utils/calculations';

interface FinancePanelProps {
    orders: Order[];
    products: Product[];
}

export const FinancePanel: React.FC<FinancePanelProps> = ({ orders, products }) => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
    const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null);

    // Helper to get product cost (for profit calculation)
    const getProductCost = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product ? product.total_cost : 0;
    };

    // Safe date ISO string helper
    const getSafeDateIso = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    // Filter processed orders (delivered or paid)
    const processedOrders = orders.filter(o => o.status === 'Teslim Edildi' || o.is_payment_received);

    // Get all unique months from orders
    const availableMonths = Array.from(new Set(processedOrders.map(o => {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) return currentMonthStr;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))).sort((a, b) => b.localeCompare(a));

    if (!availableMonths.includes(currentMonthStr)) {
        availableMonths.unshift(currentMonthStr);
    }

    // Daily Metrics (Today)
    const todayStr = now.toISOString().split('T')[0];
    const dailyOrders = processedOrders.filter(o => getSafeDateIso(o.created_at) === todayStr);

    const dailyBalance = dailyOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const dailyProfit = dailyOrders.reduce((sum, o) => {
        const orderProfit = o.items.reduce((pSum, item) => {
            const cost = getProductCost(item.product_id);
            return pSum + (item.price - cost) * item.quantity;
        }, 0);
        return sum + orderProfit;
    }, 0);

    // General Metrics (All Time)
    const totalBalance = processedOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalProfit = processedOrders.reduce((sum, o) => {
        const orderProfit = o.items.reduce((pSum, item) => {
            const cost = getProductCost(item.product_id);
            return pSum + (item.price - cost) * item.quantity;
        }, 0);
        return sum + orderProfit;
    }, 0);

    // Payment methods for Today
    const dailyCash = dailyOrders.filter(o => o.payment_method === 'Nakit').reduce((sum, o) => sum + o.total_amount, 0);
    const dailyCard = dailyOrders.filter(o => o.payment_method === 'Kart').reduce((sum, o) => sum + o.total_amount, 0);

    // Month Metrics (For the selected month)
    const monthOrders = processedOrders.filter(o => {
        const d = new Date(o.created_at);
        if (isNaN(d.getTime())) return false;
        const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return mStr === selectedMonth;
    });

    const monthBalance = monthOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const monthProfit = monthOrders.reduce((sum, o) => {
        const orderProfit = o.items.reduce((pSum, item) => {
            const cost = getProductCost(item.product_id);
            return pSum + (item.price - cost) * item.quantity;
        }, 0);
        return sum + orderProfit;
    }, 0);

    // Group month orders by date
    const ordersByDate = monthOrders.reduce((acc, order) => {
        const dateStr = getSafeDateIso(order.created_at);
        if (!dateStr) return acc;
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const sortedDates = Object.keys(ordersByDate).sort((a, b) => b.localeCompare(a));

    // Detail Modal Content
    const detailOrders = selectedDetailDate ? (processedOrders.filter(o => getSafeDateIso(o.created_at) === selectedDetailDate)) : [];
    const detailTotal = detailOrders.reduce((sum, o) => sum + o.total_amount, 0);

    const soldProducts = detailOrders.reduce((acc, order) => {
        order.items.forEach(item => {
            if (!acc[item.product_id]) {
                acc[item.product_id] = { title: item.title, quantity: 0, total: 0 };
            }
            acc[item.product_id].quantity += item.quantity;
            acc[item.product_id].total += item.price * item.quantity;
        });
        return acc;
    }, {} as Record<string, { title: string, quantity: number, total: number }>);

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val) {
            setSelectedDetailDate(val);
        }
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
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <Wallet size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Bilanço ve Finans</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Satış ve kâr durumunuzun analizi</p>
                </div>

                {/* Tarih Seçici */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <label htmlFor="date-picker" style={{ fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Calendar size={16} color="var(--primary)" />
                        Tarih Seç:
                    </label>
                    <input
                        id="date-picker"
                        type="date"
                        onChange={handleDateSelect}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            outline: 'none',
                            colorScheme: 'dark'
                        }}
                    />
                </div>
            </header>

            {/* Summary Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <div className="glass-card fade-in" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Bugünkü Durum</div>
                        <Calendar size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{formatCurrency(dailyBalance)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '600' }}>
                        Kâr: {formatCurrency(dailyProfit)}
                    </div>
                </div>

                <div className="glass-card fade-in" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>{getMonthName(selectedMonth)} Toplamı</div>
                        <TrendingUp size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{formatCurrency(monthBalance)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '600' }}>
                        Kâr: {formatCurrency(monthProfit)}
                    </div>
                </div>

                <div className="glass-card fade-in" style={{ padding: '28px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Genel Durum (Tüm Zamanlar)</div>
                        <PieChart size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{formatCurrency(totalBalance)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.95rem', fontWeight: '800' }}>
                        Toplam Kâr: {formatCurrency(totalProfit)}
                    </div>
                </div>
            </div>

            {/* Payment Details Card + History Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', alignItems: 'start' }}>
                {/* Bugunkü Ödeme Detayları (Restored) */}
                <div className="glass-card fade-in" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Filter size={18} color="var(--primary)" />
                        Ödeme Dökümü (Bugün)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(245, 158, 11, 0.05)',
                            borderRadius: '18px',
                            border: '1px solid rgba(245, 158, 11, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Banknote size={18} />
                                </div>
                                <span style={{ fontWeight: '700', color: 'white' }}>Nakit</span>
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>{formatCurrency(dailyCash)}</span>
                        </div>

                        <div style={{
                            padding: '20px',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '18px',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={18} />
                                </div>
                                <span style={{ fontWeight: '700', color: 'white' }}>Kart</span>
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>{formatCurrency(dailyCard)}</span>
                        </div>
                    </div>
                </div>

                {/* Satış Geçmişi Card */}
                <div className="glass-card fade-in" style={{ padding: '32px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={20} color="var(--primary)" />
                            Satış Geçmişi
                        </h3>

                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '8px',
                            maxWidth: '100%'
                        }}>
                            {availableMonths.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMonth(m)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        background: selectedMonth === m ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: selectedMonth === m ? 'white' : 'var(--text-muted)',
                                        border: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {getMonthName(m)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sortedDates.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px',
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.01)',
                                borderRadius: '20px',
                                border: '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                Bu ay için henüz satış verisi bulunmuyor.
                            </div>
                        ) : (
                            sortedDates.map(dateStr => {
                                const dayOrders = ordersByDate[dateStr];
                                const dayTotal = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
                                const d = new Date(dateStr);
                                const isToday = dateStr === todayStr;

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => setSelectedDetailDate(dateStr)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px 24px',
                                            background: isToday ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                                            borderRadius: '16px',
                                            border: '1px solid',
                                            borderColor: isToday ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                                            width: '100%',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="history-item"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                padding: '8px 12px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '10px',
                                                textAlign: 'center',
                                                minWidth: '60px'
                                            }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>{d.getDate()}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.toLocaleDateString('tr-TR', { month: 'short' })}</div>
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: '700', color: 'white', marginBottom: '2px' }}>
                                                    {isToday ? 'Bugün' : d.toLocaleDateString('tr-TR', { weekday: 'long' })}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dayOrders.length} Sipariş Tamamlandı</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>{formatCurrency(dayTotal)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '700' }}>Ciro</div>
                                            </div>
                                            <ChevronRight size={20} color="var(--text-muted)" />
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedDetailDate && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(16px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card fade-in" style={{
                        width: '100%', maxWidth: '600px', maxHeight: '85vh',
                        display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Günü İncele</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', margin: 0, marginTop: '2px' }}>
                                    {new Date(selectedDetailDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDetailDate(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '12px', borderRadius: '14px', display: 'flex' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Package size={14} />
                                    Satılan Ürünler
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.values(soldProducts).map((product, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '20px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '18px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <PackageOpen size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'white' }}>{product.title}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{product.quantity} Adet</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'white' }}>{formatCurrency(product.total)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                padding: '32px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                                borderRadius: '24px',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>Günlük Toplam Ciro</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: '950', color: 'white', letterSpacing: '-0.03em' }}>{formatCurrency(detailTotal)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .history-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                    transform: scale(1.005) translateY(-2px);
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};
