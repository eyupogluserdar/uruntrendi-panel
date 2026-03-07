import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { POSPanel } from './components/POSPanel'
import { OrdersPanel } from './components/OrdersPanel'
import { Login } from './components/Login'
import { PresenceIndicator } from './components/PresenceIndicator'
import { } from 'lucide-react'
import type { Filament, Product, Order, OrderItem, PaymentMethod, User } from './types'

import { Navigation } from './components/Navigation'
import { ProductForm } from './components/ProductForm'
import { StockTracking } from './components/StockTracking'
import { FinancePanel } from './components/FinancePanel'
import type { Tab } from './types'

function App() {
  const [electricityRate, setElectricityRate] = useState<number>(() => {
    const saved = localStorage.getItem('electricityRate');
    return saved ? parseFloat(saved) : 4.0;
  });

  const [filaments, setFilaments] = useState<Filament[]>(() => {
    const saved = localStorage.getItem('filaments');
    return saved ? JSON.parse(saved) : [
      { id: 'f1', brand: 'Microzey', type: 'PLA', price_per_kg: 450, color: 'Siyah', stock_g: 1000 },
      { id: 'f2', brand: 'Bambu Lab', type: 'PETG', price_per_kg: 600, color: 'Beyaz', stock_g: 1000 }
    ];
  });

  const [activeTab, setActiveTab] = useState<Tab>('vitrin');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [
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
    ];
  });
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const [user] = useState<User | null>({
    id: 'admin-id',
    username: 'admin',
    full_name: 'Sistem Yöneticisi',
    role: 'admin'
  });

  const [devicePowerWatt, setDevicePowerWatt] = useState<number>(() => {
    const saved = localStorage.getItem('devicePowerWatt');
    return saved ? parseInt(saved) : 100;
  });

  useEffect(() => {
    localStorage.setItem('electricityRate', electricityRate.toString());
  }, [electricityRate]);

  useEffect(() => {
    localStorage.setItem('devicePowerWatt', devicePowerWatt.toString());
  }, [devicePowerWatt]);

  useEffect(() => {
    localStorage.setItem('filaments', JSON.stringify(filaments));
  }, [filaments]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Yeni Ürün Ekle sekmesine geçişte editingProduct'ı temizle
  useEffect(() => {
    if (activeTab === 'yeni-urun' && !editingProduct) {
      setEditingProduct(undefined);
    }
  }, [activeTab, editingProduct]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        product_id: product.id,
        title: product.title,
        quantity: 1,
        price: product.sale_price,
        filament_id: product.filament_id,
        weight_g: product.weight_g
      }];
    });
  };

  const handleProcessOrder = (paymentMethod: PaymentMethod, isPostDated: boolean, targetDate: string, notes: string) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: [...cart],
      total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      payment_method: paymentMethod,
      is_post_dated: isPostDated,
      target_date: isPostDated ? targetDate : undefined,
      is_payment_received: false,
      is_delivered: false,
      is_tracked: false,
      status: 'Bekliyor',
      notes: notes,
      created_at: new Date().toISOString()
    };

    cart.forEach(item => {
      if (item.filament_id) {
        setFilaments(prev => prev.map(f =>
          f.id === item.filament_id ? { ...f, stock_g: Math.max(0, f.stock_g - (item.weight_g * item.quantity)) } : f
        ));
      }
    });

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsPOSOpen(false);
  };

  const handleUpdateOrderFlags = (id: string, field: 'payment' | 'delivery') => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        if (field === 'payment') return { ...o, is_payment_received: true };
        if (field === 'delivery') {
          return { ...o, is_delivered: true, status: 'Teslim Edildi' as const };
        }
      }
      return o;
    }));
  };

  const handleUpdateOrderTracked = (id: string, isTracked: boolean) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, is_tracked: isTracked } : o));
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'yeni-urun') {
      setEditingProduct(undefined);
    }
    setActiveTab(tab);
  };

  if (!user) {
    return <Login onLogin={() => { }} />;
  }

  return (
    <div className="app-layout">
      <Navigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.length}
        onOpenPOS={() => setIsPOSOpen(true)}
      />

      <main className="main-content">
        <header style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          marginBottom: '40px', gap: '20px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            padding: '12px 24px', borderRadius: '30px',
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <PresenceIndicator currentProfile={user as any} />
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{user.full_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'vitrin' && (
          <Dashboard
            filaments={filaments}
            electricityRate={electricityRate}
            devicePowerWatt={devicePowerWatt}
            products={products}
            onAddToCart={handleAddToCart}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setActiveTab('yeni-urun');
            }}
          />
        )}
        {activeTab === 'stok-takibi' && (
          <StockTracking products={products} />
        )}
        {activeTab === 'bilanco' && (
          <FinancePanel orders={orders} products={products} />
        )}
        {(activeTab === 'siparisler' || activeTab === 'teslim-edilenler') && (
          <OrdersPanel
            orders={orders.filter(o =>
              activeTab === 'siparisler'
                ? (o.status === 'Bekliyor')
                : (o.status === 'Teslim Edildi')
            )}
            type={activeTab === 'siparisler' ? 'bekleyenler' : 'teslim edilenler'}
            onUpdateOrderFlags={handleUpdateOrderFlags}
            onUpdateOrderTracked={handleUpdateOrderTracked}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
        {activeTab === 'yeni-urun' && (
          <ProductForm
            onClose={() => setActiveTab('vitrin')}
            onSave={(newProduct) => {
              if (editingProduct) {
                setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
              } else {
                setProducts([newProduct, ...products]);
              }
              setActiveTab('vitrin');
            }}
            electricityRate={electricityRate}
            devicePowerWatt={devicePowerWatt}
            filaments={filaments}
            initialProduct={editingProduct}
            isPage={true}
          />
        )}
        {activeTab === 'ayarlar' && (
          <SettingsPanel
            rate={electricityRate}
            onRateChange={setElectricityRate}
            powerWatt={devicePowerWatt}
            onPowerWattChange={setDevicePowerWatt}
            filaments={filaments}
            onFilamentsChange={setFilaments}
            onClose={() => setActiveTab('vitrin')}
            profile={user as any}
            isPage={true}
          />
        )}
      </main>

      {isPOSOpen && (
        <POSPanel
          cart={cart}
          onUpdateCart={setCart}
          onClose={() => setIsPOSOpen(false)}
          onProcessOrder={handleProcessOrder}
        />
      )}
    </div>
  );
}

export default App;
