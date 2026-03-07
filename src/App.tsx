import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { POSPanel } from './components/POSPanel'
import { OrdersPanel } from './components/OrdersPanel'
import { Login } from './components/Login'
import { PresenceIndicator } from './components/PresenceIndicator'
import { LayoutGrid, ShoppingCart, ClipboardList, CheckCircle2 } from 'lucide-react'
import type { Filament, Product, Order, OrderItem, PaymentMethod, User } from './types'

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

  const [activeTab, setActiveTab] = useState<'vitrin' | 'siparisler' | 'teslim-edilenler'>('vitrin');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  const [user, setUser] = useState<User | null>({
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

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateOrderFlags = (id: string, field: 'payment' | 'delivery') => {
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

  const updateOrderTracked = (id: string, isTracked: boolean) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, is_tracked: isTracked } : o));
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 900,
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
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
          {/* Logout button hidden to simplify UI */}
        </div>
      </div>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'vitrin' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitrin')}
        >
          <LayoutGrid size={24} />
          <span>Vitrin</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'siparisler' ? 'active' : ''}`}
          onClick={() => setActiveTab('siparisler')}
        >
          <ClipboardList size={24} />
          <span>Siparişler</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'teslim-edilenler' ? 'active' : ''}`}
          onClick={() => setActiveTab('teslim-edilenler')}
        >
          <CheckCircle2 size={24} />
          <span>Teslim Edilenler</span>
        </button>
        <div className="nav-divider"></div>
        <button className="nav-item pos-btn" onClick={() => setIsPOSOpen(true)}>
          <div className="cart-badge">{cart.length}</div>
          <ShoppingCart size={24} />
          <span>Kasa</span>
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'vitrin' && (
          <Dashboard
            filaments={filaments}
            electricityRate={electricityRate}
            devicePowerWatt={devicePowerWatt}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAddToCart={handleAddToCart}
          />
        )}
        {(activeTab === 'siparisler' || activeTab === 'teslim-edilenler') && (
          <OrdersPanel
            orders={orders.filter(o =>
              activeTab === 'siparisler' ? o.status === 'Bekliyor' : o.status === 'Teslim Edildi'
            )}
            type={activeTab === 'siparisler' ? 'bekleyenler' : 'teslim edilenler'}
            onUpdateStatus={updateOrderStatus}
            onUpdateOrderFlags={updateOrderFlags}
            onUpdateOrderTracked={updateOrderTracked}
          />
        )}
      </main>

      {isSettingsOpen && (
        <SettingsPanel
          rate={electricityRate}
          onRateChange={setElectricityRate}
          powerWatt={devicePowerWatt}
          onPowerWattChange={setDevicePowerWatt}
          filaments={filaments}
          onFilamentsChange={setFilaments}
          onClose={() => setIsSettingsOpen(false)}
          profile={user as any}
        />
      )}

      {isPOSOpen && (
        <POSPanel
          cart={cart}
          onUpdateCart={setCart}
          onClose={() => setIsPOSOpen(false)}
          onProcessOrder={handleProcessOrder}
        />
      )}
    </div>
  )
}

export default App
