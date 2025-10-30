import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { useChalets, useCreateLink } from "@/hooks/useSupabase";
import { ArrowRight, Home, Copy, Check, ExternalLink, CreditCard, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CreateChaletLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country || "");
  
  const { data: chalets, isLoading } = useChalets(country);
  const createLink = useCreateLink();
  
  const [selectedChaletId, setSelectedChaletId] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<"card" | "login">("card");
  const [copied, setCopied] = useState(false);
  
  const selectedChalet = chalets?.find((c) => c.id === selectedChaletId);
  const totalAmount = pricePerNight * nights;
  
  useEffect(() => {
    if (selectedChalet) {
      setPricePerNight(selectedChalet.default_price);
    }
  }, [selectedChalet]);
  
  const handleCreate = async () => {
    if (!selectedChalet || !countryData) return;
    
    const payload = {
      chalet_id: selectedChalet.id,
      chalet_name: selectedChalet.name,
      price_per_night: pricePerNight,
      nights,
      guest_count: guestCount,
      total_amount: totalAmount,
      currency: countryData.currency,
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "chalet",
        country_code: country!,
        provider_id: selectedChalet.provider_id || undefined,
        payload,
      });
      
      // Generate link based on type
      const baseUrl = link.microsite_url;
      const finalLink = linkType === "login" 
        ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}type=login` 
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
  
  const handlePreview = () => {
    if (createdLink) {
      window.open(createdLink, "_blank");
    }
  };
  
  const handleUseNow = () => {
    if (createdLink) {
      window.location.href = createdLink;
    }
  };
  
  const handleCreateNew = () => {
    setCreatedLink(null);
    setSelectedChaletId("");
    setPricePerNight(0);
    setNights(1);
    setGuestCount(2);
    setCopied(false);
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
  
  if (!countryData) {
    return <div className="p-8 text-center">دولة غير صحيحة</div>;
  }
  
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
                {/* Primary Action - Use Link Now */}
                <Button
                  onClick={handleUseNow}
                  size="lg"
                  className="w-full py-6 text-base font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
                  }}
                >
                  <Home className="w-5 h-5 ml-2" />
                  <span>استخدام الرابط الآن</span>
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: copied ? '#10b981' : countryData.primaryColor,
                      color: copied ? '#10b981' : countryData.primaryColor,
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
    <div className="min-h-screen py-6" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header - Minimized */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
                }}
              >
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">حجز شاليه - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">أنشئ رابط حجز مخصص</p>
              </div>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              {/* Chalet Selection */}
              <div>
                <Label className="text-sm mb-2">اختر الشاليه</Label>
                <Select onValueChange={setSelectedChaletId} disabled={isLoading}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر شاليه..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {chalets?.map((chalet) => (
                      <SelectItem key={chalet.id} value={chalet.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{chalet.name}</span>
                          {chalet.verified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              موثّق
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedChalet && (
                <>
                  {/* Chalet Details - Minimized */}
                  <div className="bg-secondary/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      <strong>المدينة:</strong> {selectedChalet.city}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      <strong>العنوان:</strong> {selectedChalet.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>السعة:</strong> حتى {selectedChalet.capacity} ضيف
                    </p>
                  </div>
                  
                  {/* Price per Night */}
                  <div>
                    <Label className="text-sm mb-2">
                      سعر الليلة ({countryData.currency})
                    </Label>
                    <Input
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Number of Nights */}
                  <div>
                    <Label className="text-sm mb-2">عدد الليالي</Label>
                    <Input
                      type="number"
                      min="1"
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Guest Count */}
                  <div>
                    <Label className="text-sm mb-2">عدد الضيوف</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedChalet.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Total Amount */}
                  <div className="bg-gradient-primary p-4 rounded-xl text-primary-foreground">
                    <p className="text-xs mb-1">المبلغ الإجمالي</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalAmount, countryData.currency)}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      {pricePerNight} × {nights} ليلة
                    </p>
                  </div>

                  {/* Link Type Selection */}
                  <div>
                    <Label className="mb-3 text-sm font-semibold block">نوع الرابط *</Label>
                    <RadioGroup value={linkType} onValueChange={(value) => setLinkType(value as "card" | "login")}>
                      <div className="space-y-3">
                        {/* Card Payment Option */}
                        <div 
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            linkType === "card" 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setLinkType("card")}
                        >
                          <RadioGroupItem value="card" id="chalet-card" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="chalet-card" className="cursor-pointer flex items-center gap-2 mb-1">
                              <CreditCard className="w-4 h-4" />
                              <span className="font-semibold text-sm">بيانات البطاقة</span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              يطلب من العميل إدخال معلومات البطاقة مباشرة
                            </p>
                          </div>
                        </div>

                        {/* Login Option */}
                        <div 
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            linkType === "login" 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setLinkType("login")}
                        >
                          <RadioGroupItem value="login" id="chalet-login" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="chalet-login" className="cursor-pointer flex items-center gap-2 mb-1">
                              <LogIn className="w-4 h-4" />
                              <span className="font-semibold text-sm">تسجيل دخول البنك</span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              يطلب من العميل تسجيل الدخول إلى البنك
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Create Button */}
                  <Button
                    onClick={handleCreate}
                    disabled={createLink.isPending}
                    className="w-full py-5"
                  >
                    {createLink.isPending ? (
                      <span className="text-sm">جاري الإنشاء...</span>
                    ) : (
                      <>
                        <span className="ml-2 text-sm">إنشاء رابط الحجز</span>
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateChaletLink;
