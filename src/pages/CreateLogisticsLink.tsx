import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { useCreateLink } from "@/hooks/useSupabase";
import { ArrowRight, Truck, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const logisticsServices = [
  { value: "warehousing", label: "تخزين وإدارة مستودعات", labelEn: "Warehousing" },
  { value: "freight", label: "شحن بضائع", labelEn: "Freight Forwarding" },
  { value: "customs", label: "تخليص جمركي", labelEn: "Customs Clearance" },
  { value: "distribution", label: "توزيع وتوصيل", labelEn: "Distribution" },
  { value: "packaging", label: "تعبئة وتغليف", labelEn: "Packaging" },
  { value: "inventory", label: "إدارة مخزون", labelEn: "Inventory Management" },
  { value: "express", label: "شحن سريع", labelEn: "Express Delivery" },
  { value: "bulk", label: "شحن بالجملة", labelEn: "Bulk Shipping" },
];

const CreateLogisticsLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country || "");
  
  const createLink = useCreateLink();
  
  const [serviceType, setServiceType] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [originAddress, setOriginAddress] = useState<string>("");
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [shipmentDetails, setShipmentDetails] = useState<string>("");
  const [weight, setWeight] = useState<number>(0);
  const [dimensions, setDimensions] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const selectedService = logisticsServices.find(s => s.value === serviceType);
  
  const handleCreate = async () => {
    if (!countryData || !serviceType || !companyName || !contactPerson || !contactPhone || amount <= 0) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const payload = {
      service_type: serviceType,
      service_name: selectedService?.label,
      company_name: companyName,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      origin_address: originAddress,
      destination_address: destinationAddress,
      shipment_details: shipmentDetails,
      weight,
      dimensions,
      amount,
      currency: countryData.currency,
      notes,
      request_date: new Date().toISOString(),
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "logistics",
        country_code: country!,
        payload,
      });
      
      setCreatedLink(link.microsite_url);
    } catch (error) {
      console.error("Error creating link:", error);
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
  
  if (!countryData) {
    return <div className="p-8 text-center">دولة غير صحيحة</div>;
  }
  
  if (createdLink) {
    return (
      <div className="min-h-screen py-6" dir="rtl">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto p-4 text-center">
            <div className="w-14 h-14 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-white" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">تم إنشاء الرابط بنجاح!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              شارك هذا الرابط مع العميل
            </p>
            
            <div className="bg-secondary/50 p-3 rounded-lg mb-4 break-all">
              <code className="text-xs">{createdLink}</code>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 ml-2" />
                    <span className="text-sm">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 ml-2" />
                    <span className="text-sm">نسخ الرابط</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(createdLink, "_blank")}
              >
                <span className="ml-2 text-sm">عرض المعاينة</span>
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              className="mt-4 text-sm"
              onClick={() => navigate("/services")}
            >
              إنشاء طلب جديد
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-6" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(260 95% 55%), hsl(280 90% 60%))",
                }}
              >
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">الخدمات اللوجستية - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">أنشئ طلب خدمة لوجستية</p>
              </div>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              {/* Service Type Selection */}
              <div>
                <Label className="text-sm mb-2">نوع الخدمة *</Label>
                <Select onValueChange={setServiceType}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="اختر نوع الخدمة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {logisticsServices.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="text-sm">
                          {service.label}
                          <span className="text-xs text-muted-foreground mr-2">
                            ({service.labelEn})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedService && (
                <>
                  {/* Company Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">معلومات الشركة</h3>
                    <div>
                      <Label className="text-sm mb-2">اسم الشركة *</Label>
                      <Input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="أدخل اسم الشركة"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">معلومات التواصل</h3>
                    <div>
                      <Label className="text-sm mb-2">اسم المسؤول *</Label>
                      <Input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="أدخل اسم المسؤول"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">رقم الهاتف *</Label>
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="مثال: +966512345678"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Shipment Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">تفاصيل الشحنة</h3>
                    
                    <div>
                      <Label className="text-sm mb-2">عنوان الاستلام (اختياري)</Label>
                      <Input
                        type="text"
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        placeholder="المدينة، الشارع، رقم المبنى"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">عنوان التوصيل (اختياري)</Label>
                      <Input
                        type="text"
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        placeholder="المدينة، الشارع، رقم المبنى"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">وصف البضاعة</Label>
                      <Textarea
                        value={shipmentDetails}
                        onChange={(e) => setShipmentDetails(e.target.value)}
                        placeholder="وصف مفصل للبضاعة والخدمة المطلوبة..."
                        className="min-h-[80px] text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2">الوزن (كجم)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          className="h-9 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2">الأبعاد</Label>
                        <Input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="مثال: 50×40×30 سم"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <Label className="text-sm mb-2">
                      المبلغ ({countryData.currency}) *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <Label className="text-sm mb-2">ملاحظات (اختياري)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أضف أي ملاحظات إضافية..."
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                  
                  {/* Total Amount Display */}
                  {amount > 0 && (
                    <div className="bg-gradient-primary p-4 rounded-xl text-primary-foreground">
                      <p className="text-xs mb-1">المبلغ الإجمالي</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(amount, countryData.currency)}
                      </p>
                      <p className="text-xs mt-1 opacity-80">
                        {selectedService.label}
                      </p>
                    </div>
                  )}
                  
                  {/* Create Button */}
                  <Button
                    onClick={handleCreate}
                    disabled={createLink.isPending || !companyName || !contactPerson || !contactPhone || amount <= 0}
                    className="w-full py-5"
                  >
                    {createLink.isPending ? (
                      <span className="text-sm">جاري الإنشاء...</span>
                    ) : (
                      <>
                        <span className="ml-2 text-sm">إنشاء رابط الدفع</span>
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

export default CreateLogisticsLink;
