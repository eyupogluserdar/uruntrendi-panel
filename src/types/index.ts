export interface Filament {
  id: string;
  brand: string;
  type: string; // PLA, PETG, etc.
  price_per_kg: number;
  color?: string;
  stock_g: number;
}

export interface Product {
  id: string;
  title: string;
  image_url: string;
  weight_g: number;
  print_time_h: number;
  print_time_m: number;
  filament_id?: string; // Reference to selected filament
  filament_price_per_kg: number; // Snapshot of price at creation or for fallbacks
  electricity_cost: number;
  filament_cost: number;
  total_cost: number;
  sale_price: number;
  profit: number;
  stock_count: number;
  min_stock_alert: number;
  barcodes: string[];
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  created_at?: string;
}

export interface Settings {
  electricity_rate: number; // TL/kWh
  printer_wattage: number; // Watts (e.g., 100 for P1S)
}

export type OrderStatus = 'Bekliyor' | 'Teslim Edildi' | 'İptal Edildi';
export type PaymentMethod = 'Nakit' | 'Kart';

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  filament_id?: string;
  weight_g: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  is_post_dated: boolean;
  target_date?: string;
  is_payment_received?: boolean;
  is_delivered?: boolean;
  is_tracked?: boolean;
  status: OrderStatus;
  notes?: string;
  created_at: string;
}

export type UserRole = 'admin' | 'manager';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export type Tab = 'vitrin' | 'siparisler' | 'teslim-edilenler' | 'yeni-urun' | 'stok-takibi' | 'bilanco' | 'ayarlar';
