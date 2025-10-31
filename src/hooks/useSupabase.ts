import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CHALETS, SHIPPING_CARRIERS } from "@/lib/data";
import { findLinkById, saveLink } from "@/lib/localLinks";

// Types from database
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

export interface ShippingCarrier {
  id: string;
  name: string;
  country_code: string;
  services: string[];
  contact: string | null;
  website: string | null;
  logo_path: string | null;
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

const isBrowser = typeof window !== "undefined";

const generateId = () => {
  if (isBrowser && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
};

const encodeSignature = (payload: unknown) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch (error) {
    console.error("Failed to encode signature", error);
    return "";
  }
};

const PAYMENT_STORAGE_KEY = "local-payments-v1";

const toBase64Url = (value: string) => {
  const base64 = btoa(value);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
};

interface EncodedLinkData {
  seed: string;
  type: string;
  country_code: string;
  provider_id: string | null;
  payload: any;
  status: string;
  created_at: string;
  version: number;
}

const encodeLinkIdentifier = (data: EncodedLinkData) => {
  return toBase64Url(encodeURIComponent(JSON.stringify(data)));
};

const decodeLinkIdentifier = (id: string): EncodedLinkData | null => {
  try {
    const json = decodeURIComponent(fromBase64Url(id));
    const data = JSON.parse(json) as EncodedLinkData;
    if (data && typeof data === "object" && "type" in data) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const buildLink = (id: string, data: EncodedLinkData): Link => {
  const origin = isBrowser ? window.location.origin : "";
  return {
    id,
    type: data.type,
    country_code: data.country_code,
    provider_id: data.provider_id,
    payload: data.payload,
    microsite_url: `${origin}/r/${data.country_code}/${data.type}/${id}`,
    payment_url: `${origin}/pay/${id}`,
    signature: encodeSignature(data.payload),
    status: data.status,
    created_at: data.created_at,
  };
};

const getStoredPayments = (): Payment[] => {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(PAYMENT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Payment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored payments", error);
    window.localStorage.removeItem(PAYMENT_STORAGE_KEY);
    return [];
  }
};

const savePayments = (payments: Payment[]) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error("Failed to persist payments", error);
  }
};

const upsertPayment = (payment: Payment) => {
  const payments = getStoredPayments();
  const existingIndex = payments.findIndex((item) => item.id === payment.id);
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  savePayments(payments);
  return payment;
};

const findPaymentById = (paymentId: string): Payment | undefined => {
  return getStoredPayments().find((payment) => payment.id === paymentId);
};

// Fetch chalets by country
export const useChalets = (countryCode?: string) => {
  return useQuery({
    queryKey: ["chalets", countryCode],
    queryFn: async () => {
      const code = countryCode?.toUpperCase();
      const filtered = code ? CHALETS.filter((chalet) => chalet.countryCode === code) : CHALETS;
      return filtered.map((chalet) => ({
        id: chalet.id,
        name: chalet.name,
        country_code: chalet.countryCode,
        city: chalet.city,
        address: chalet.address,
        default_price: chalet.defaultPrice,
        images: chalet.images,
        provider_id: chalet.providerId || null,
        verified: chalet.verified,
        amenities: chalet.amenities || [],
        capacity: chalet.capacity || 0,
      })) as Chalet[];
    },
    enabled: true,
  });
};

// Fetch shipping carriers by country
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      const code = countryCode?.toUpperCase();
      const filtered = code ? SHIPPING_CARRIERS.filter((carrier) => carrier.countryCode === code) : SHIPPING_CARRIERS;
      return filtered.map((carrier) => ({
        id: carrier.id,
        name: carrier.name,
        country_code: carrier.countryCode,
        services: carrier.services,
        contact: carrier.contact,
        website: carrier.website,
        logo_path: carrier.logoPath,
      })) as ShippingCarrier[];
    },
    enabled: true,
  });
};

// Create link
export const useCreateLink = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkData: {
      type: string;
      country_code: string;
      provider_id?: string;
      payload: any;
    }) => {
      const encodedPayload: EncodedLinkData = {
        seed: generateId(),
        type: linkData.type,
        country_code: linkData.country_code,
        provider_id: linkData.provider_id ?? null,
        payload: linkData.payload,
        status: "active",
        created_at: new Date().toISOString(),
        version: 1,
      };

      const linkId = encodeLinkIdentifier(encodedPayload);
      const link = buildLink(linkId, encodedPayload);

      saveLink(link);
      return link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "تم إنشاء الرابط",
        description: "تم إنشاء رابط الخدمة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الرابط",
        variant: "destructive",
      });
    },
  });
};

// Fetch link by ID
export const useLink = (linkId?: string) => {
  return useQuery({
    queryKey: ["link", linkId],
    queryFn: async () => {
      if (!linkId) {
        throw new Error("Link ID is required");
      }
      const decoded = decodeLinkIdentifier(linkId);
      if (decoded) {
        const link = buildLink(linkId, decoded);
        saveLink(link);
        return link;
      }
      const link = findLinkById(linkId);
      if (link) return link;
      throw new Error("Link not found");
    },
    enabled: !!linkId && isBrowser,
  });
};

// Create payment
export const useCreatePayment = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (paymentData: {
      link_id: string;
      amount: number;
      currency: string;
    }) => {
      // Generate OTP (4 digits)
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const payment: Payment = {
        id: generateId(),
        link_id: paymentData.link_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: "pending",
        otp,
        attempts: 0,
        locked_until: null,
        receipt_url: null,
        cardholder_name: null,
        last_four: null,
        created_at: new Date().toISOString(),
      };

      upsertPayment(payment);
      return payment;
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الدفعة",
        variant: "destructive",
      });
    },
  });
};

// Fetch payment by ID
export const usePayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }
      const payment = findPaymentById(paymentId);
      if (payment) return payment;
      throw new Error("Payment not found");
    },
    enabled: !!paymentId && isBrowser,
    refetchInterval: 2000, // Refresh every 2 seconds for OTP status
  });
};

// Update payment (for OTP verification)
export const useUpdatePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      paymentId,
      updates,
    }: {
      paymentId: string;
      updates: Partial<Payment>;
    }) => {
      const existing = findPaymentById(paymentId);
      if (!existing) {
        throw new Error("Payment not found");
      }

      const updated: Payment = {
        ...existing,
        ...updates,
      };

      upsertPayment(updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
    },
  });
};
