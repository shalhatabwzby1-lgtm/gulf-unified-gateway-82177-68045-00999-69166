// Local Storage System - No External API Required
// This replaces Supabase for offline/local operation

export interface Chalet {
  id: string;
  name: string;
  country_code: string;
  city: string;
  address: string;
  default_price: number;
  images: string[];
  provider_id: string | null;
  verified: boolean;
  amenities: string[];
  capacity: number;
}

export interface Link {
  id: string;
  type: string;
  country_code: string;
  provider_id: string | null;
  payload: any;
  microsite_url: string;
  payment_url: string;
  signature: string;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  link_id: string | null;
  amount: number;
  currency: string;
  status: string;
  otp: string | null;
  attempts: number;
  locked_until: string | null;
  receipt_url: string | null;
  cardholder_name: string | null;
  last_four: string | null;
  created_at: string;
}

// Storage Keys
const KEYS = {
  CHALETS: 'gulf_chalets',
  LINKS: 'gulf_links',
  PAYMENTS: 'gulf_payments',
};

// Initialize with sample data if empty
const initializeStorage = () => {
  // Sample Chalets Data
  if (!localStorage.getItem(KEYS.CHALETS)) {
    const sampleChalets: Chalet[] = [
      {
        id: 'chalet-1',
        name: 'شاليه الياسمين',
        country_code: 'SA',
        city: 'جدة',
        address: 'حي الشاطئ، جدة',
        default_price: 500,
        images: [],
        provider_id: null,
        verified: true,
        amenities: ['مسبح', 'مطبخ', 'تكييف'],
        capacity: 10,
      },
      {
        id: 'chalet-2',
        name: 'شاليه النخيل',
        country_code: 'SA',
        city: 'الرياض',
        address: 'حي الملقا، الرياض',
        default_price: 400,
        images: [],
        provider_id: null,
        verified: true,
        amenities: ['حديقة', 'شواء', 'واي فاي'],
        capacity: 8,
      },
    ];
    localStorage.setItem(KEYS.CHALETS, JSON.stringify(sampleChalets));
  }
};

// Chalets CRUD
export const localStorageDB = {
  // Get all chalets
  getChalets: (countryCode?: string): Promise<Chalet[]> => {
    initializeStorage();
    return new Promise((resolve) => {
      const chalets = JSON.parse(localStorage.getItem(KEYS.CHALETS) || '[]');
      if (countryCode) {
        resolve(chalets.filter((c: Chalet) => c.country_code === countryCode));
      } else {
        resolve(chalets);
      }
    });
  },

  // Create Link
  createLink: (linkData: {
    type: string;
    country_code: string;
    provider_id?: string;
    payload: any;
  }): Promise<Link> => {
    return new Promise((resolve) => {
      const linkId = crypto.randomUUID();
      const micrositeUrl = `${window.location.origin}/r/${linkData.country_code}/${linkData.type}/${linkId}`;
      const paymentUrl = `${window.location.origin}/pay/${linkId}`;
      const signature = btoa(encodeURIComponent(JSON.stringify(linkData.payload)));
      
      const newLink: Link = {
        id: linkId,
        type: linkData.type,
        country_code: linkData.country_code,
        provider_id: linkData.provider_id || null,
        payload: linkData.payload,
        microsite_url: micrositeUrl,
        payment_url: paymentUrl,
        signature,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const links = JSON.parse(localStorage.getItem(KEYS.LINKS) || '[]');
      links.push(newLink);
      localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
      
      resolve(newLink);
    });
  },

  // Get Link by ID
  getLink: (linkId: string): Promise<Link | null> => {
    return new Promise((resolve) => {
      const links = JSON.parse(localStorage.getItem(KEYS.LINKS) || '[]');
      const link = links.find((l: Link) => l.id === linkId);
      resolve(link || null);
    });
  },

  // Create Payment
  createPayment: (paymentData: {
    link_id: string;
    amount: number;
    currency: string;
  }): Promise<Payment> => {
    return new Promise((resolve) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newPayment: Payment = {
        id: crypto.randomUUID(),
        link_id: paymentData.link_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        otp,
        attempts: 0,
        locked_until: null,
        receipt_url: null,
        cardholder_name: null,
        last_four: null,
        created_at: new Date().toISOString(),
      };

      const payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || '[]');
      payments.push(newPayment);
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
      
      resolve(newPayment);
    });
  },

  // Get Payment by ID
  getPayment: (paymentId: string): Promise<Payment | null> => {
    return new Promise((resolve) => {
      const payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || '[]');
      const payment = payments.find((p: Payment) => p.id === paymentId);
      resolve(payment || null);
    });
  },

  // Update Payment
  updatePayment: (paymentId: string, updates: Partial<Payment>): Promise<Payment> => {
    return new Promise((resolve, reject) => {
      const payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || '[]');
      const index = payments.findIndex((p: Payment) => p.id === paymentId);
      
      if (index === -1) {
        reject(new Error('Payment not found'));
        return;
      }

      payments[index] = { ...payments[index], ...updates };
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
      
      resolve(payments[index]);
    });
  },

  // Clear all data (for testing)
  clearAll: () => {
    localStorage.removeItem(KEYS.CHALETS);
    localStorage.removeItem(KEYS.LINKS);
    localStorage.removeItem(KEYS.PAYMENTS);
  },
};
