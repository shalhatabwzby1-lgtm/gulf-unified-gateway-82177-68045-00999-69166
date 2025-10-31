export type PaymentMethod = "card" | "bank-login";

export interface PaymentFlowState {
  linkId: string;
  method: PaymentMethod;
  bankKey?: string;
  updatedAt: string;
}

const STORAGE_KEY = "paymentFlowState";

const isBrowser = typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const getStoredState = (): PaymentFlowState | null => {
  if (!isBrowser) return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PaymentFlowState;
    return parsed;
  } catch (error) {
    console.error("Failed to parse payment flow state", error);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const getPaymentFlowState = (linkId?: string): PaymentFlowState | null => {
  const state = getStoredState();
  if (!state) return null;
  if (linkId && state.linkId !== linkId) return null;
  return state;
};

export const setPaymentFlowState = (state: PaymentFlowState) => {
  if (!isBrowser) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to store payment flow state", error);
  }
};

export const updatePaymentFlowState = (linkId: string, changes: Partial<PaymentFlowState>) => {
  const current = getPaymentFlowState(linkId) || {
    linkId,
    method: "card" as PaymentMethod,
    updatedAt: new Date().toISOString(),
  };

  const next: PaymentFlowState = {
    ...current,
    ...changes,
    linkId,
    updatedAt: new Date().toISOString(),
  };

  setPaymentFlowState(next);
  return next;
};

export const clearPaymentFlowState = () => {
  if (!isBrowser) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};

export const ensurePaymentFlowLink = (linkId: string) => {
  const state = getPaymentFlowState();
  if (!state || state.linkId !== linkId) {
    setPaymentFlowState({
      linkId,
      method: "card",
      updatedAt: new Date().toISOString(),
    });
  }
};

export const setPaymentMethod = (linkId: string, method: PaymentMethod) => {
  updatePaymentFlowState(linkId, { method });
};

export const setPaymentBank = (linkId: string, bankKey?: string) => {
  updatePaymentFlowState(linkId, { bankKey });
};

export const getPaymentMethod = (linkId?: string): PaymentMethod | null => {
  return getPaymentFlowState(linkId)?.method ?? null;
};

export const getPaymentBank = (linkId?: string): string | undefined => {
  return getPaymentFlowState(linkId)?.bankKey;
};
