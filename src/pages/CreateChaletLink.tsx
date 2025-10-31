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
import { ArrowRight, Home, Copy, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/lib/paymentFlow";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [createdPaymentLink, setCreatedPaymentLink] = useState<string | null>(null);
  const [createdMicrositeLink, setCreatedMicrositeLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ payment?: boolean; microsite?: boolean }>({});
  
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
      payment_method: paymentMethod,
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "chalet",
        country_code: country!,
        provider_id: selectedChalet.provider_id || undefined,
        payload,
      });
      
      setCreatedPaymentLink(`${window.location.origin}/pay/${link.id}/confirm`);
      setCreatedMicrositeLink(link.microsite_url);
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };
  
  const handleCopy = (value: string, type: "payment" | "microsite") => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
      toast({
        title: "تم النسخ!",
        description: type === "payment" ? "تم نسخ رابط الدفع" : "تم نسخ رابط المعاينة",
      });
    });
  };
  
  if (!countryData) {
    return <div className="p-8 text-center">دولة غير صحيحة</div>;
  }
  
  if (createdPaymentLink && createdMicrositeLink) {
    return (
      <div className="min-h-screen py-6" dir="rtl">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">تم إنشاء الرابط بنجاح!</h2>
              <p className="text-sm text-muted-foreground">شارك روابط الدفع والمعاينة مع عملائك</p>
            </div>

            <div className="space-y-5 text-right">
              <div>
                <p className="text-xs text-muted-foreground mb-1">رابط الدفع</p>
                <div className="bg-secondary/40 p-3 rounded-lg text-xs break-all mb-2">
                  {createdPaymentLink}
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => handleCopy(createdPaymentLink, "payment")}>
                    {copied.payment ? (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span className="text-sm">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        <span className="text-sm">نسخ رابط الدفع</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(createdPaymentLink, "_blank")}
                  >
                    <span className="ml-2 text-sm">معاينة الدفع</span>
                    <Eye className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">رابط المعاينة (المايكروسايت)</p>
                <div className="bg-secondary/40 p-3 rounded-lg text-xs break-all mb-2">
                  {createdMicrositeLink}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleCopy(createdMicrositeLink, "microsite")}
                  >
                    {copied.microsite ? (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        <span className="text-sm">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-2" />
                        <span className="text-sm">نسخ رابط المعاينة</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(createdMicrositeLink, "_blank")}
                  >
                    <span className="ml-2 text-sm">عرض المعاينة</span>
                    <Eye className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>

              <Button variant="ghost" className="text-sm" onClick={() => navigate("/services")}>
                إنشاء رابط جديد
              </Button>
            </div>
          </Card>
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

              <div>
                <Label className="text-sm mb-2">طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">بيانات البطاقة</SelectItem>
                    <SelectItem value="bank-login">تسجيل الدخول البنكي</SelectItem>
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
