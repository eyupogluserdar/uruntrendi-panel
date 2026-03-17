/**
 * ÜrünTrendi Yardımcı Fonksiyonlar
 */

/**
 * Elektrik giderini hesaplar
 * @param hours Saat
 * @param minutes Dakika
 * @param rate kWh Birim Fiyatı (TL)
 * @param powerWatt Cihaz Güç Tüketimi (Watt)
 */
export const calculateElectricityCost = (hours: number, minutes: number, seconds: number = 0, rate: number, powerWatt: number = 100): number => {
    const totalHours = hours + (minutes / 60) + (seconds / 3600);
    const powerKW = powerWatt / 1000;
    return totalHours * powerKW * rate;
};

/**
 * Flament maliyetini hesaplar
 */
export const calculateFilamentCost = (weightG: number = 0, pricePerKg: number = 0): number => {
    return (weightG / 1000) * pricePerKg;
};

/**
 * Trendyol uyumlu (EAN-13 benzeri) benzersiz barkod üretir
 * 869 ile başlar (Türkiye kodu gibi)
 */
export const generateUniqueBarcode = (): string => {
    const prefix = "869";
    const timestamp = Date.now().toString().slice(-9); // Son 9 hane
    const random = Math.floor(Math.random() * 10).toString(); // 1 hane rastgele

    const base = prefix + timestamp + random;

    // Basit bir kontrol basamağı hesabı (EAN-13 algoritması özeti)
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    return base + checkDigit;
};

/**
 * Para formatlama
 */
export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(val);
};
