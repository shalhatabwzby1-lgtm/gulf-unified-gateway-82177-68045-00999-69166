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
import { ArrowRight, Building2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contractTypes = [
  { value: "rental", label: "عقد إيجار", labelEn: "Rental Agreement" },
  { value: "employment", label: "عقد عمل", labelEn: "Employment Contract" },
  { value: "service", label: "عقد خدمات", labelEn: "Service Agreement" },
  { value: "partnership", label: "عقد شراكة", labelEn: "Partnership Agreement" },
  { value: "sale", label: "عقد بيع", labelEn: "Sales Contract" },
  { value: "nda", label: "عقد سرية", labelEn: "Non-Disclosure Agreement" },
  { value: "maintenance", label: "عقد صيانة", labelEn: "Maintenance Contract" },
  { value: "consultancy", label: "عقد استشارات", labelEn: "Consultancy Agreement" },
];

const CreateContractLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country || "");
  
  const createLink = useCreateLink();
  
  const [contractType, setContractType] = useState<string>("");
  const [contractNumber, setContractNumber] = useState<string>("");
  const [firstPartyName, setFirstPartyName] = useState<string>("");
  const [firstPartyId, setFirstPartyId] = useState<string>("");
  const [secondPartyName, setSecondPartyName] = useState<string>("");
  const [secondPartyId, setSecondPartyId] = useState<string>("");
  const [contractStartDate, setContractStartDate] = useState<string>("");
  const [contractEndDate, setContractEndDate] = useState<string>("");
  const [contractDuration, setContractDuration] = useState<string>("");
  const [contractDescription, setContractDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const selectedContractType = contractTypes.find(c => c.value === contractType);
  
  const handleCreate = async () => {
    if (!countryData || !contractType || !contractNumber || !firstPartyName || !secondPartyName || amount <= 0) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const payload = {
      contract_type: contractType,
      contract_type_name: selectedContractType?.label,
      contract_number: contractNumber,
      first_party_name: firstPartyName,
      first_party_id: firstPartyId,
      second_party_name: secondPartyName,
      second_party_id: secondPartyId,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
      contract_duration: contractDuration,
      contract_description: contractDescription,
      amount,
      currency: countryData.currency,
      payment_terms: paymentTerms,
      notes,
      created_date: new Date().toISOString(),
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "contract",
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
              شارك هذا الرابط مع الطرف الآخر
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
              إنشاء عقد جديد
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
                  background: "linear-gradient(135deg, hsl(40 95% 55%), hsl(30 90% 50%))",
                }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إنشاء عقد - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">أنشئ عقد إلكتروني</p>
              </div>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              {/* Contract Type Selection */}
              <div>
                <Label className="text-sm mb-2">نوع العقد *</Label>
                <Select onValueChange={setContractType}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="اختر نوع العقد..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="text-sm">
                          {type.label}
                          <span className="text-xs text-muted-foreground mr-2">
                            ({type.labelEn})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedContractType && (
                <>
                  {/* Contract Number */}
                  <div>
                    <Label className="text-sm mb-2">رقم العقد *</Label>
                    <Input
                      type="text"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="مثال: CON-2025-001"
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  {/* First Party Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">الطرف الأول</h3>
                    <div>
                      <Label className="text-sm mb-2">الاسم / المنشأة *</Label>
                      <Input
                        type="text"
                        value={firstPartyName}
                        onChange={(e) => setFirstPartyName(e.target.value)}
                        placeholder="أدخل اسم الطرف الأول"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">رقم الهوية / السجل التجاري (اختياري)</Label>
                      <Input
                        type="text"
                        value={firstPartyId}
                        onChange={(e) => setFirstPartyId(e.target.value)}
                        placeholder="رقم الهوية أو السجل"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Second Party Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">الطرف الثاني</h3>
                    <div>
                      <Label className="text-sm mb-2">الاسم / المنشأة *</Label>
                      <Input
                        type="text"
                        value={secondPartyName}
                        onChange={(e) => setSecondPartyName(e.target.value)}
                        placeholder="أدخل اسم الطرف الثاني"
                        className="h-9 text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">رقم الهوية / السجل التجاري (اختياري)</Label>
                      <Input
                        type="text"
                        value={secondPartyId}
                        onChange={(e) => setSecondPartyId(e.target.value)}
                        placeholder="رقم الهوية أو السجل"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Contract Period */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">مدة العقد</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-2">تاريخ البدء</Label>
                        <Input
                          type="date"
                          value={contractStartDate}
                          onChange={(e) => setContractStartDate(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2">تاريخ الانتهاء</Label>
                        <Input
                          type="date"
                          value={contractEndDate}
                          onChange={(e) => setContractEndDate(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm mb-2">مدة العقد (اختياري)</Label>
                      <Input
                        type="text"
                        value={contractDuration}
                        onChange={(e) => setContractDuration(e.target.value)}
                        placeholder="مثال: سنة واحدة، 6 أشهر، إلخ"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Contract Description */}
                  <div>
                    <Label className="text-sm mb-2">وصف العقد</Label>
                    <Textarea
                      value={contractDescription}
                      onChange={(e) => setContractDescription(e.target.value)}
                      placeholder="وصف تفصيلي للعقد والشروط الأساسية..."
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                  
                  {/* Financial Terms */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">الشروط المالية</h3>
                    <div>
                      <Label className="text-sm mb-2">
                        القيمة الإجمالية ({countryData.currency}) *
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
                    
                    <div>
                      <Label className="text-sm mb-2">شروط الدفع (اختياري)</Label>
                      <Textarea
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        placeholder="مثال: دفعة مقدمة 50%، والباقي عند التسليم..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <Label className="text-sm mb-2">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أضف أي ملاحظات أو شروط إضافية..."
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                  
                  {/* Total Amount Display */}
                  {amount > 0 && (
                    <div className="bg-gradient-primary p-4 rounded-xl text-primary-foreground">
                      <p className="text-xs mb-1">قيمة العقد</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(amount, countryData.currency)}
                      </p>
                      <p className="text-xs mt-1 opacity-80">
                        {selectedContractType.label}
                      </p>
                    </div>
                  )}
                  
                  {/* Create Button */}
                  <Button
                    onClick={handleCreate}
                    disabled={createLink.isPending || !contractNumber || !firstPartyName || !secondPartyName || amount <= 0}
                    className="w-full py-5"
                  >
                    {createLink.isPending ? (
                      <span className="text-sm">جاري الإنشاء...</span>
                    ) : (
                      <>
                        <span className="ml-2 text-sm">إنشاء العقد</span>
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

export default CreateContractLink;
