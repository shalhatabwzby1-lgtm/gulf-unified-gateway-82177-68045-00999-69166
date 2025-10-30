import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { localStorageDB } from "@/lib/localStorage";

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

// Fetch chalets by country - Using Local Storage (No API required)
export const useChalets = (countryCode?: string) => {
  return useQuery({
    queryKey: ["chalets", countryCode],
    queryFn: async () => {
      return await localStorageDB.getChalets(countryCode);
    },
    enabled: !!countryCode,
  });
};

// Fetch shipping carriers by country - Not needed with local data
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      // Return empty array - we use gccShippingServices instead
      return [] as ShippingCarrier[];
    },
    enabled: false, // Disabled - not needed
  });
};

// Create link - Using Local Storage (No API required)
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
      return await localStorageDB.createLink(linkData);
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

// Fetch link by ID - Using Local Storage (No API required)
export const useLink = (linkId?: string) => {
  return useQuery({
    queryKey: ["link", linkId],
    queryFn: async () => {
      return await localStorageDB.getLink(linkId!);
    },
    enabled: !!linkId,
  });
};

// Create payment - Using Local Storage (No API required)
export const useCreatePayment = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (paymentData: {
      link_id: string;
      amount: number;
      currency: string;
    }) => {
      return await localStorageDB.createPayment(paymentData);
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

// Fetch payment by ID - Using Local Storage (No API required)
export const usePayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      return await localStorageDB.getPayment(paymentId!);
    },
    enabled: !!paymentId,
    refetchInterval: 2000, // Refresh every 2 seconds for OTP status
  });
};

// Update payment (for OTP verification) - Using Local Storage (No API required)
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
      return await localStorageDB.updatePayment(paymentId, updates);
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
