import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Product } from '../types';

interface StockTrackingProps {
    products: Product[];
}

export const StockTracking: React.FC<StockTrackingProps> = ({ products }) => {
    const lowStockProducts = products.filter(p => p.stock_count <= p.min_stock_alert);

    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
            <header style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '16px',
                        background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'white' }}>
                            Stok Takibi
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Düşük stoklu ürünleri kontrol edin</p>
                    </div>
                </div>
            </header>

            {lowStockProducts.length > 0 ? (
                <div className="fade-in">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 24px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '16px',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        marginBottom: '24px'
                    }}>
                        <AlertCircle size={20} color="var(--danger)" />
                        <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
                            Kritik Stok Uyarısı
                        </h2>
                        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', background: 'var(--danger)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
                            {lowStockProducts.length} Ürün Kritik Seviyede
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="glass-card fade-in" style={{
                                padding: '24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(239, 68, 68, 0.03)',
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                scale: '1'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px', color: 'white' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Minimum Limit: {p.min_stock_alert} Adet</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--danger)', fontWeight: '900', fontSize: '1.5rem' }}>{p.stock_count}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--danger)', opacity: 0.8, textTransform: 'uppercase', fontWeight: '800' }}>Kalan Adet</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', opacity: 0.8 }}>
                    <div style={{ marginBottom: '20px', color: 'var(--success)' }}>
                        <AlertCircle size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Her Şey Yolunda!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Şu an kritik stok seviyesinde ürün bulunmuyor.</p>
                </div>
            )}
        </div>
    );
};
