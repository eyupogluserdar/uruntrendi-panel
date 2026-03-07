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
import { supabase } from './lib/supabase'
import type { Tab } from './types'

function App() {
  const [electricityRate, setElectricityRate] = useState<number>(() => {
    const saved = localStorage.getItem('electricityRate');
    return saved ? parseFloat(saved) : 4.0;
  });

  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('vitrin');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Business data now synced to Supabase, removing localStorage effects

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log('Attempting to fetch all data from Supabase...');
      if (!supabase) {
        console.error('Supabase client is not initialized!');
        setIsLoading(false);
        return;
      }

      try {
        const [prodRes, filRes, ordRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('filaments').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        if (prodRes.error) throw prodRes.error;
        if (filRes.error) throw filRes.error;
        if (ordRes.error) throw ordRes.error;

        setProducts(prodRes.data || []);
        setFilaments(filRes.data || []);
        setOrders(ordRes.data || []);
        console.log('All data fetched successfully');
      } catch (error: any) {
        console.error('Supabase fetch error:', error);
        alert('Veriler yüklenirken hata oluştu: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleProcessOrder = async (paymentMethod: PaymentMethod, isPostDated: boolean, targetDate: string, notes: string) => {
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

    if (supabase) {
      const { error } = await supabase.from('orders').insert([newOrder]);
      if (error) {
        alert('Sipariş kaydedilirken hata oluştu: ' + error.message);
        return;
      }

      // Decrement filament stock in Supabase
      for (const item of cart) {
        if (item.filament_id) {
          const filament = filaments.find(f => f.id === item.filament_id);
          if (filament) {
            const newStock = Math.max(0, filament.stock_g - (item.weight_g * item.quantity));
            await supabase.from('filaments').update({ stock_g: newStock }).eq('id', filament.id);
            setFilaments(prev => prev.map(f => f.id === filament.id ? { ...f, stock_g: newStock } : f));
          }
        }
      }
    }

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsPOSOpen(false);
  };

  const handleUpdateOrderFlags = async (id: string, field: 'payment' | 'delivery') => {
    let update: Partial<Order> = {};
    if (field === 'payment') update = { is_payment_received: true };
    if (field === 'delivery') update = { is_delivered: true, status: 'Teslim Edildi' };

    if (supabase) {
      const { error } = await supabase.from('orders').update(update).eq('id', id);
      if (error) {
        alert('Sipariş güncellenirken hata oluştu: ' + error.message);
        return;
      }
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...update } : o));
  };

  const handleUpdateOrderTracked = async (id: string, isTracked: boolean) => {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ is_tracked: isTracked }).eq('id', id);
      if (error) {
        alert('Takip durumu güncellenirken hata oluştu: ' + error.message);
        return;
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, is_tracked: isTracked } : o));
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Siparişi silmek istediğinize emin misiniz?')) {
      if (supabase) {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) {
          alert('Sipariş silinirken hata oluştu: ' + error.message);
          return;
        }
      }
      setOrders(orders.filter(o => o.id !== id));
    }
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

  if (isLoading) {
    return (
      <div style={{
        height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'white'
      }}>
        <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '20px' }}></div>
        <p style={{ fontWeight: '600', letterSpacing: '1px' }}>VERİLER YÜKLENİYOR...</p>
      </div>
    );
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
          <StockTracking
            products={products}
            onDeleteProduct={async (productId: string) => {
              if (!supabase) return;
              if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                const { error } = await supabase
                  .from('products')
                  .delete()
                  .eq('id', productId);

                if (error) {
                  alert('Ürün silinirken hata oluştu: ' + error.message);
                } else {
                  setProducts(products.filter(p => p.id !== productId));
                }
              }
            }}
          />
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
            onSave={async (newProduct: Product) => {
              console.log('Attempting to save product:', newProduct);
              if (!supabase) {
                alert('Supabase bağlantısı kurulamadı. Lütfen ayarlarınızı kontrol edin.');
                return;
              }

              try {
                if (editingProduct) {
                  const { error } = await supabase
                    .from('products')
                    .update(newProduct)
                    .eq('id', newProduct.id);

                  if (error) {
                    console.error('Supabase update error:', error);
                    alert('Ürün güncellenirken hata oluşti: ' + error.message);
                  } else {
                    setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
                    setActiveTab('vitrin');
                  }
                } else {
                  const { error } = await supabase
                    .from('products')
                    .insert([newProduct]);

                  if (error) {
                    console.error('Supabase insert error details:', error);
                    alert('Ürün eklenirken hata oluştu: ' + (error.message || JSON.stringify(error)));
                  } else {
                    setProducts([newProduct, ...products]);
                    setActiveTab('vitrin');
                  }
                }
              } catch (err) {
                console.error('Unexpected error during save:', err);
                alert('Beklenmedik bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
              }
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
