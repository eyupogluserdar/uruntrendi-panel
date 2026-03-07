import React, { useState } from 'react';
import { Plus, Search, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import type { Product, Filament } from '../types';

interface DashboardProps {
    electricityRate: number;
    devicePowerWatt: number;
    filaments: Filament[];
    onOpenSettings: () => void;
    onAddToCart: (product: Product) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ electricityRate, devicePowerWatt, filaments, onOpenSettings, onAddToCart }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            title: 'Bambu Vazo',
            image_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=400',
            weight_g: 150,
            print_time_h: 5,
            print_time_m: 30,
            filament_id: 'f1',
            filament_price_per_kg: 450,
            electricity_cost: 2.2,
            filament_cost: 67.5,
            total_cost: 69.7,
            sale_price: 350,
            profit: 280.3,
            stock_count: 2,
            min_stock_alert: 5,
            barcodes: ['8690001112223', '8690001112223-2']
        },
        {
            id: '2',
            title: 'Kulaklık Askısı',
            image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400',
            weight_g: 80,
            print_time_h: 3,
            print_time_m: 0,
            filament_id: 'f1',
            filament_price_per_kg: 450,
            electricity_cost: 1.2,
            filament_cost: 36,
            total_cost: 37.2,
            sale_price: 150,
            profit: 112.8,
            stock_count: 12,
            min_stock_alert: 3,
            barcodes: ['8690001112224']
        }
    ]);

    const lowStockProducts = products.filter(p => p.stock_count <= p.min_stock_alert);

    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '48px',
                marginTop: '10px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '900',
                        letterSpacing: '-0.02em',
                        marginBottom: '4px'
                    }}>
                        ÜrünTrendi
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>3D Üretim ve Stok Yönetimi</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" onClick={onOpenSettings} style={{ padding: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SettingsIcon size={20} />
                    </button>
                    <button className="btn btn-primary" onClick={() => { setSelectedProduct(undefined); setIsFormOpen(true); }} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        <Plus size={20} /> <span className="hide-mobile">Yeni Ürün Ekle</span>
                    </button>
                </div>
            </header>

            {/* Stok Uyarı Bölümü - Daha modern ve kompakt */}
            {lowStockProducts.length > 0 && (
                <div className="fade-in" style={{ marginBottom: '40px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 24px',
                        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), transparent)',
                        borderRadius: '16px',
                        borderLeft: '4px solid var(--danger)',
                        marginBottom: '16px'
                    }}>
                        <AlertCircle size={20} color="var(--danger)" />
                        <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Kritik Stok Takibi
                        </h2>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '20px' }}>
                            {lowStockProducts.length} Ürün
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="glass-card" style={{
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(239, 68, 68, 0.03)',
                                borderColor: 'rgba(239, 68, 68, 0.2)'
                            }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.title}</span>
                                <span style={{ color: 'var(--danger)', fontWeight: '800', fontSize: '0.85rem' }}>{p.stock_count} Adet</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Arama ve Filtre - Daha geniş ve premium */}
            <div className="glass-card" style={{
                marginBottom: '48px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(15, 23, 42, 0.4)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}>
                <div style={{ padding: '12px' }}>
                    <Search size={22} color="var(--primary)" />
                </div>
                <input
                    type="text"
                    placeholder="Ürün adı, barkod veya kategori ara..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        outline: 'none',
                        width: '100%',
                        fontSize: '1.1rem',
                        padding: '12px 0'
                    }}
                />
            </div>

            {/* Ana Liste - Grid ve Spacing iyileştirmesi */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '32px'
            }}>
                {products.map(product => (
                    <div key={product.id} className="fade-in">
                        <ProductCard
                            product={product}
                            electricityRate={electricityRate}
                            devicePowerWatt={devicePowerWatt}
                            filaments={filaments}
                            onClick={(p) => { setSelectedProduct(p); setIsFormOpen(true); }}
                            onAddToCart={() => onAddToCart(product)}
                        />
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <ProductForm
                    onClose={() => setIsFormOpen(false)}
                    electricityRate={electricityRate}
                    devicePowerWatt={devicePowerWatt}
                    filaments={filaments}
                    onSave={(newProduct) => {
                        if (selectedProduct) {
                            setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
                        } else {
                            setProducts([newProduct, ...products]);
                        }
                        setIsFormOpen(false);
                    }}
                    initialProduct={selectedProduct}
                />
            )}

            <style>{`
                @media (max-width: 600px) {
                    .hide-mobile { display: none; }
                }
                input::placeholder {
                    color: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};
