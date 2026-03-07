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
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const [user] = useState<User | null>(() => ({
    id: 'admin-' + Math.random().toString(36).substr(2, 9),
    username: 'admin',
    full_name: 'Sistem Yöneticisi',
    role: 'admin'
  }));

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
      console.log('--- Supabase Veri Çekme Başlatıldı ---');

      if (!supabase) {
        console.error('HATA: Supabase bağlantısı kurulamadı! Lütfen Render panelindeki Environment Variables ayarlarını kontrol et.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('1. Ürünler çekiliyor...');
        const prodRes = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (prodRes.error) {
          console.error('Ürün çekme hatası:', prodRes.error);
          throw new Error('Ürünler: ' + prodRes.error.message);
        }
        setProducts(prodRes.data || []);

        console.log('2. Filamanlar çekiliyor...');
        const filRes = await supabase.from('filaments').select('*').order('created_at', { ascending: false });
        if (filRes.error) {
          console.error('Filaman çekme hatası:', filRes.error);
          throw new Error('Filamanlar: ' + filRes.error.message);
        }
        setFilaments(filRes.data || []);

        console.log('3. Siparişler çekiliyor...');
        const ordRes = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ordRes.error) {
          console.error('Sipariş çekme hatası:', ordRes.error);
          throw new Error('Siparişler: ' + ordRes.error.message);
        }
        setOrders(ordRes.data || []);

        console.log('--- Tüm veriler başarıyla yüklendi ---');
      } catch (error: any) {
        console.error('GENEL HATA:', error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Supabase Real-time Synchronization
  useEffect(() => {
    if (!supabase) return;

    // Listen to changes in the 'products' table
    const productSubscription = supabase.channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Product sync:', payload.eventType);
        if (payload.eventType === 'INSERT') {
          setProducts((prev) => {
            if (prev.find(p => p.id === payload.new.id)) return prev;
            return [payload.new as Product, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setProducts((prev) => prev.map((p) => p.id === payload.new.id ? payload.new as Product : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      })
      .subscribe();

    // Listen to changes in the 'filaments' table
    const filamentSubscription = supabase.channel('public:filaments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'filaments' }, (payload) => {
        console.log('Filament sync:', payload.eventType);
        if (payload.eventType === 'INSERT') {
          setFilaments((prev) => {
            if (prev.find(f => f.id === payload.new.id)) return prev;
            return [payload.new as Filament, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setFilaments((prev) => prev.map((f) => f.id === payload.new.id ? (payload.new as Filament) : f));
        } else if (payload.eventType === 'DELETE') {
          setFilaments((prev) => prev.filter((f) => f.id !== payload.old.id));
        }
      })
      .subscribe();

    // Listen to changes in the 'orders' table
    const orderSubscription = supabase.channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order sync:', payload.eventType);
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => {
            if (prev.find(o => o.id === payload.new.id)) return prev;
            return [payload.new as Order, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) => prev.map((o) => o.id === payload.new.id ? (payload.new as Order) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase?.removeChannel(productSubscription);
      supabase?.removeChannel(filamentSubscription);
      supabase?.removeChannel(orderSubscription);
    };
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

  if (isLoading || fetchError) {
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    const maskedUrl = supabaseUrl ? supabaseUrl.replace(/(https?:\/\/).*/, '$1' + '***.supabase.co') : 'EKSIK';

    return (
      <div style={{
        height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'white',
        padding: '20px', textAlign: 'center'
      }}>
        {isLoading ? (
          <>
            <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '20px' }}></div>
            <p style={{ fontWeight: '600', letterSpacing: '1px' }}>VERİLER YÜKLENİYOR...</p>
          </>
        ) : (
          <div className="glass-card" style={{ padding: '40px', maxWidth: '500px' }}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '20px' }}>Bağlantı Hatası!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
              Veritabanına ulaşılamıyor. Lütfen şu bilgileri kontrol edin:
            </p>

            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '10px' }}><strong>Hata:</strong> <span style={{ color: 'var(--warning)' }}>{fetchError}</span></div>
              <div style={{ marginBottom: '10px' }}><strong>URL:</strong> <code>{maskedUrl}</code></div>
              <div><strong>Key:</strong> <code>{(import.meta.env.VITE_SUPABASE_ANON_KEY || '').length > 0 ? 'Mevcut (' + (import.meta.env.VITE_SUPABASE_ANON_KEY || '').length + ' karakter)' : 'EKSIK'}</code></div>
            </div>

            <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ width: '100%' }}>
              Sayfayı Yenile ve Tekrar Dene
            </button>
            <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              İpucu: Eğer URL veya Key yanlışsa Render panelinden düzeltip tekrar deploy edin.
            </p>
          </div>
        )}
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
