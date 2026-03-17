import React from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, Filament } from '../types';

interface DashboardProps {
    filaments: Filament[];
    products: Product[];
    onAddToCart: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ filaments, products, onAddToCart, onEditProduct, onDeleteProduct }) => {
    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
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
                            filaments={filaments}
                            onClick={() => onEditProduct(product)}
                            onAddToCart={() => onAddToCart(product)}
                            onDelete={() => onDeleteProduct(product.id)}
                        />
                    </div>
                ))}
            </div>

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
