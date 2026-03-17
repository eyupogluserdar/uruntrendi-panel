import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Barcode, Maximize2, Image as ImageIcon, Upload, ChevronDown, ChevronUp, Copy, Check, Zap, Tag, Receipt } from 'lucide-react';
import { ImageZoom } from './ImageZoom';
import type { Product, Filament } from '../types';
import {
    calculateElectricityCost,
    calculateFilamentCost,
    generateUniqueBarcode,
} from '../utils/calculations';
import { uploadImage } from '../lib/supabase';

interface ProductFormProps {
    onClose: () => void;
    onSave: (product: Product) => void;
    electricityRate: number;
    devicePowerWatt: number;
    filaments: Filament[];
    initialProduct?: Product;
    isPage?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSave, electricityRate, devicePowerWatt, filaments, initialProduct, isPage }) => {
    const [formData, setFormData] = useState<Partial<Product>>(initialProduct || {
        title: '',
        weight_g: 0,
        print_time_h: 0,
        print_time_m: 0,
        print_time_s: 0,
        filament_id: filaments.length > 0 ? filaments[0].id : '',
        filament_price_per_kg: filaments.length > 0 ? filaments[0].price_per_kg : 600,
        sale_price: 0,
        stock_count: 0,
        min_stock_alert: 5,
        barcodes: [],
        image_url: ''
    });

    const [showZoom, setShowZoom] = useState(false);
    const [isBarcodesExpanded, setIsBarcodesExpanded] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [costs, setCosts] = useState({
        electricity: 0,
        filament: 0,
        total: 0
    });

    useEffect(() => {
        // En güncel filaman fiyatını al
        const selectedFilament = filaments.find(f => f.id === formData.filament_id);
        const currentPrice = selectedFilament ? selectedFilament.price_per_kg : (formData.filament_price_per_kg || 600);

        const electricity = calculateElectricityCost(formData.print_time_h || 0, formData.print_time_m || 0, formData.print_time_s || 0, electricityRate, devicePowerWatt);
        const filament = calculateFilamentCost(formData.weight_g || 0, currentPrice);

        setCosts({
            electricity,
            filament,
            total: electricity + filament
        });
    }, [formData.print_time_h, formData.print_time_m, formData.print_time_s, formData.weight_g, formData.filament_id, electricityRate, devicePowerWatt, filaments]);

    const handleBarcodeRefresh = () => {
        const newBarcodes = Array.from({ length: formData.stock_count || 1 }, () => generateUniqueBarcode());
        setFormData({ ...formData, barcodes: newBarcodes });
    };

    const handleStockChange = (count: number) => {
        const newBarcodes = Array.from({ length: count }, (_, i) => {
            // Mevcut barkodları koru, eksikse yeni üret
            return formData.barcodes?.[i] || generateUniqueBarcode();
        });
        setFormData({ ...formData, stock_count: count, barcodes: newBarcodes });
    };

    const copyToClipboard = (text: string, idx: number | 'all') => {
        navigator.clipboard.writeText(text);
        if (typeof idx === 'number') {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const publicUrl = await uploadImage(file);
                setFormData({ ...formData, image_url: publicUrl });
            } catch (error: any) {
                console.error('Image upload error:', error);
                alert('Resim yüklenirken hata oluştu: ' + error.message);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Eğer barkodlar henüz üretilmemişse (yeni ürünse veya stok değiştiyse)
        const finalBarcodes = formData.barcodes && formData.barcodes.length === (formData.stock_count || 0)
            ? formData.barcodes
            : Array.from({ length: formData.stock_count || 1 }, () => generateUniqueBarcode());

        const finalProduct = {
            ...formData,
            id: initialProduct?.id || Math.random().toString(36).substr(2, 9),
            barcodes: finalBarcodes,
            electricity_cost: costs.electricity,
            filament_cost: costs.filament,
            total_cost: costs.total,
            profit: (formData.sale_price || 0) - costs.total,
        } as Product;
        onSave(finalProduct);
    };

    const containerStyle: React.CSSProperties = isPage ? {
        width: '100%',
        padding: '0'
    } : {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        padding: '20px'
    };

    return (
        <div style={containerStyle}>
            <div className={isPage ? "" : "glass-card fade-in"} style={{
                width: '100%',
                maxWidth: isPage ? 'none' : '900px',
                maxHeight: isPage ? 'none' : '90vh',
                overflowY: isPage ? 'visible' : 'auto',
                padding: isPage ? '0' : '40px',
                boxShadow: isPage ? 'none' : '0 25px 50px rgba(0,0,0,0.5)',
                background: isPage ? 'transparent' : undefined,
                border: isPage ? 'none' : undefined
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{initialProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Resim Önizleme */}
                <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <div
                        onClick={() => formData.image_url && setShowZoom(true)}
                        style={{
                            width: '100%',
                            height: '300px',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: formData.image_url ? 'zoom-in' : 'default',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {formData.image_url ? (
                            <>
                                <img src={formData.image_url} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image_url: '' }); }}
                                        style={{ background: 'rgba(239, 68, 68, 0.8)', padding: '6px', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', color: 'white' }}>
                                        <Maximize2 size={14} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                <ImageIcon size={48} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                <p style={{ fontSize: '0.8rem' }}>Resim URL'si girin veya dosya yükleyin</p>
                            </div>
                        )}
                    </div>
                </div>

                {showZoom && formData.image_url && (
                    <ImageZoom
                        src={formData.image_url}
                        alt={formData.title || 'Ürün'}
                        onClose={() => setShowZoom(false)}
                    />
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Ürün Adı</label>
                            <input type="text" required style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Ürün Görseli</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Resim URL (https://...)"
                                    style={{ ...inputStyle, flex: 1 }}
                                    value={formData.image_url?.startsWith('data:') ? 'Bilgisayardan Yüklendi' : formData.image_url}
                                    readOnly={formData.image_url?.startsWith('data:')}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                />
                                <label className="btn" style={{
                                    background: 'var(--surface)',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: isUploading ? 0.6 : 1
                                }}>
                                    {isUploading ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
                                    <span style={{ fontSize: '0.9rem' }}>{isUploading ? 'Yükleniyor...' : "PC'den Seç"}</span>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Ağırlık (Gram)</label>
                            <input type="number" required style={inputStyle} value={formData.weight_g} onChange={e => setFormData({ ...formData, weight_g: parseFloat(e.target.value) })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Üretim Süresi (Saat)</label>
                                <input type="number" min="0" required style={inputStyle} value={formData.print_time_h} onChange={e => setFormData({ ...formData, print_time_h: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Dakika</label>
                                <input type="number" min="0" max="59" required style={inputStyle} value={formData.print_time_m} onChange={e => setFormData({ ...formData, print_time_m: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Saniye</label>
                                <input type="number" min="0" max="59" required style={inputStyle} value={formData.print_time_s} onChange={e => setFormData({ ...formData, print_time_s: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={labelStyle}>En (X) mm</label>
                                <input type="number" step="0.1" style={inputStyle} value={formData.length_mm || ''} onChange={e => setFormData({ ...formData, length_mm: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Boy (Y) mm</label>
                                <input type="number" step="0.1" style={inputStyle} value={formData.width_mm || ''} onChange={e => setFormData({ ...formData, width_mm: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Yükseklik (Z) mm</label>
                                <input type="number" step="0.1" style={inputStyle} value={formData.height_mm || ''} onChange={e => setFormData({ ...formData, height_mm: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Flament Seçimi</label>
                                <select
                                    style={inputStyle}
                                    value={formData.filament_id}
                                    onChange={e => {
                                        const f = filaments.find(fl => fl.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            filament_id: e.target.value,
                                            filament_price_per_kg: f ? f.price_per_kg : formData.filament_price_per_kg
                                        });
                                    }}
                                >
                                    {filaments.length === 0 && <option value="">Önce Ayarlar'dan Flament Ekleyin</option>}
                                    {filaments.map(f => (
                                        <option key={f.id} value={f.id}>{f.brand} {f.type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Satış Fiyatı (TL)</label>
                                <input type="number" required style={inputStyle} value={formData.sale_price} onChange={e => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Mevcut Stok (Adet)</label>
                            <input type="number" min="0" style={inputStyle} value={formData.stock_count} onChange={e => handleStockChange(parseInt(e.target.value) || 0)} />
                        </div>

                        <div>
                            <label style={labelStyle}>Kritik Stok Sınırı</label>
                            <input type="number" style={inputStyle} value={formData.min_stock_alert} onChange={e => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) })} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <div
                                onClick={() => setIsBarcodesExpanded(!isBarcodesExpanded)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--glass-border)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Barcode size={20} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Üretilen Barkodlar</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formData.barcodes?.length || 0} Adet Barkod Hazır</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleBarcodeRefresh(); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                    >
                                        <RefreshCw size={14} /> Yenile
                                    </button>
                                    {isBarcodesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {isBarcodesExpanded && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: '1px solid var(--glass-border)',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '10px',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    {formData.barcodes?.map((bc, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => copyToClipboard(bc, idx)}
                                            style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text)',
                                                background: 'rgba(255,255,255,0.07)',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid transparent'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <span style={{ fontFamily: 'monospace' }}>{bc}</span>
                                            {copiedIdx === idx ? <Check size={14} color="var(--success)" /> : <Copy size={14} color="var(--text-muted)" />}
                                        </div>
                                    ))}
                                    {(!formData.barcodes || formData.barcodes.length === 0) && (
                                        <div style={{ gridColumn: 'span 10', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px' }}>
                                            Stok girildiğinde barkodlar burada liste halinde görünecek.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Zap size={14} /> <span>Elektrik Gideri:</span>
                            </div>
                            <span style={{ fontWeight: '600' }}>{costs.electricity.toFixed(2)} TL</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Tag size={14} /> <span>Flament Gideri:</span>
                            </div>
                            <span style={{ fontWeight: '600' }}>{costs.filament.toFixed(2)} TL</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: '4px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Receipt size={16} color="var(--warning)" /> <span>Toplam Maliyet:</span>
                            </div>
                            <span style={{ color: 'var(--warning)', fontSize: '1.1rem' }}>{costs.total.toFixed(2)} TL</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px', alignItems: 'center' }}>
                            <span>Tahmini Kar:</span>
                            <span style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{((formData.sale_price || 0) - costs.total).toFixed(2)} TL</span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        <Save size={20} /> Kaydet
                    </button>
                </form>
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    outline: 'none',
    fontSize: '1rem'
};
