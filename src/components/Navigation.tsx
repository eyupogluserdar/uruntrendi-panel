import React from 'react';
import { LayoutGrid, ClipboardList, CheckCircle2, ShoppingCart, PlusCircle, Settings, AlertCircle, Wallet } from 'lucide-react';

interface NavigationProps {
    activeTab: 'vitrin' | 'siparisler' | 'teslim-edilenler' | 'yeni-urun' | 'stok-takibi' | 'bilanco' | 'ayarlar';
    setActiveTab: (tab: 'vitrin' | 'siparisler' | 'teslim-edilenler' | 'yeni-urun' | 'stok-takibi' | 'bilanco' | 'ayarlar') => void;
    cartCount: number;
    onOpenPOS: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
    activeTab,
    setActiveTab,
    cartCount,
    onOpenPOS
}) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '1rem', color: 'white' }}>ÜT</span>
                </div>
                <span>ÜrünTrendi</span>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'vitrin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vitrin')}
                >
                    <LayoutGrid size={20} />
                    <span>Vitrin</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'siparisler' ? 'active' : ''}`}
                    onClick={() => setActiveTab('siparisler')}
                >
                    <ClipboardList size={20} />
                    <span>Siparişler</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'teslim-edilenler' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teslim-edilenler')}
                >
                    <CheckCircle2 size={20} />
                    <span>Teslim Edilenler</span>
                </button>

                <div className="nav-divider"></div>

                <button
                    className={`nav-item ${activeTab === 'yeni-urun' ? 'active' : ''}`}
                    onClick={() => setActiveTab('yeni-urun')}
                >
                    <PlusCircle size={20} />
                    <span>Yeni Ürün Ekle</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'stok-takibi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stok-takibi')}
                >
                    <AlertCircle size={20} />
                    <span>Stok Takibi</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'bilanco' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bilanco')}
                >
                    <Wallet size={20} />
                    <span>Bilanço</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'ayarlar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ayarlar')}
                >
                    <Settings size={20} />
                    <span>Ayarlar</span>
                </button>
            </nav>

            <div className="nav-divider"></div>

            <button className="nav-item pos-btn" onClick={onOpenPOS}>
                <ShoppingCart size={20} />
                <span>Kasa</span>
                {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
            </button>
        </aside>
    );
};
