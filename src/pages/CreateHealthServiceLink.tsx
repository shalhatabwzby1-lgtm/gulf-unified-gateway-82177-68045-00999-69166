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
import { ArrowRight, Heart, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const healthServices = [
  { value: "consultation", label: "استشارة طبية", labelEn: "Medical Consultation" },
  { value: "homecare", label: "رعاية منزلية", labelEn: "Home Care" },
  { value: "laboratory", label: "فحوصات مخبرية", labelEn: "Laboratory Tests" },
  { value: "radiology", label: "أشعة وتصوير", labelEn: "Radiology" },
  { value: "pharmacy", label: "صيدلية", labelEn: "Pharmacy" },
  { value: "physiotherapy", label: "علاج طبيعي", labelEn: "Physiotherapy" },
  { value: "dental", label: "خدمات أسنان", labelEn: "Dental Services" },
  { value: "vaccination", label: "تطعيمات", labelEn: "Vaccination" },
];

const CreateHealthServiceLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country || "");
  
  const createLink = useCreateLink();
  
  const [serviceType, setServiceType] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const selectedService = healthServices.find(s => s.value === serviceType);
  
  const handleCreate = async () => {
    if (!countryData || !serviceType || !providerName || !patientName || !patientPhone || amount <= 0) {
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
      provider_name: providerName,
      patient_name: patientName,
      patient_phone: patientPhone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      service_description: serviceDescription,
      amount,
      currency: countryData.currency,
      notes,
      booking_date: new Date().toISOString(),
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "health",
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
              شارك هذا الرابط مع المريض
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
              إنشاء حجز جديد
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
                  background: "linear-gradient(135deg, hsl(0 85% 55%), hsl(10 80% 60%))",
                }}
              >
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">الخدمات الصحية - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">احجز خدمة صحية</p>
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
                    {healthServices.map((service) => (
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
                  {/* Provider Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">معلومات مقدم الخدمة</h3>
                    <div>
                      <Label className="text-sm mb-2">اسم المستشفى / العيادة / المركز *</Label>
                      <Input
                        type="text"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                        placeholder="أدخل اسم مقدم الخدمة"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Patient Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">معلومات المريض</h3>
                    <div>
                      <Label className="text-sm mb-2">اسم المريض *</Label>
                      <Input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="أدخل اسم المريض"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">رقم الهاتف *</Label>
                      <Input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="مثال: +966512345678"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Appointment Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">تفاصيل الموعد (اختياري)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2">التاريخ</Label>
                        <Input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2">الوقت</Label>
                        <Input
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Description */}
                  <div>
                    <Label className="text-sm mb-2">وصف الخدمة (اختياري)</Label>
                    <Textarea
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      placeholder="مثال: فحص شامل، استشارة متخصصة..."
                      className="min-h-[80px] text-sm"
                    />
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
                      <p className="text-xs mb-1">المبلغ المطلوب</p>
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
                    disabled={createLink.isPending || !providerName || !patientName || !patientPhone || amount <= 0}
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

export default CreateHealthServiceLink;
