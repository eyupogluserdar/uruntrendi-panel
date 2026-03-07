import { Box, BarChart3, AlertTriangle, Tag, ShoppingCart } from 'lucide-react';
import type { Product, Filament } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ProductCardProps {
    product: Product;
    filaments: Filament[];
    onClick: (product: Product) => void;
    onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, filaments, onClick, onAddToCart }) => {
    const isLowStock = product.stock_count <= product.min_stock_alert;

    const selectedFilament = filaments.find(f => f.id === product.filament_id);

    return (
        <div className="glass-card fade-in" onClick={() => onClick(product)} style={{
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            {isLowStock && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    <AlertTriangle size={14} /> Düşük Stok
                </div>
            )}

            <div style={{
                width: '100%',
                height: '200px',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.6)'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${product.image_url})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    transition: 'transform 0.5s ease'
                }} className="card-image-bg" />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(2, 6, 23, 0.8))'
                }} />

                {!product.image_url && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                        <Box size={64} />
                    </div>
                )}

                {/* Kar margin was here, now hidden for customer view */}
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                    marginBottom: '16px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {product.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ağırlık</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <Box size={16} color="var(--primary)" />
                            <span>{product.weight_g}g</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Boyutlar (X/Y/Z)</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: 'var(--text)', fontSize: '0.9rem' }}>
                                <span>{product.length_mm || 0}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>x</span>
                                <span>{product.width_mm || 0}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>x</span>
                                <span>{product.height_mm || 0} mm</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mevcut Stok</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <BarChart3 size={16} color="var(--primary)" />
                            <span style={{ color: isLowStock ? 'var(--danger)' : 'var(--text)' }}>{product.stock_count} Adet</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satış Fiyatı</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: 'var(--success)', fontSize: '1.1rem' }}>
                            {formatCurrency(product.sale_price)}
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: 'auto',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Tag size={12} />
                        <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedFilament ? `${selectedFilament.brand} ${selectedFilament.type}` : 'Flament Seçilmedi'}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (product.stock_count > 0) onAddToCart();
                        }}
                        disabled={product.stock_count <= 0}
                        className="btn btn-primary"
                        style={{
                            padding: '10px 16px',
                            fontSize: '0.85rem',
                            opacity: product.stock_count > 0 ? 1 : 0.4,
                            cursor: product.stock_count > 0 ? 'pointer' : 'not-allowed',
                            minWidth: '120px'
                        }}
                    >
                        <ShoppingCart size={16} /> Kasaya Ekle
                    </button>
                </div>
            </div>
            <style>{`
                .glass-card:hover .card-image-bg {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};
