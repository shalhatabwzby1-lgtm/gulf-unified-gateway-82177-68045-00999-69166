import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { useCreateLink } from "@/hooks/useSupabase";
import { ArrowRight, FileText, Copy, Check, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

const CreateInvoiceLink = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const countryData = getCountryByCode(country || "");
  
  const createLink = useCreateLink();
  
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }
  ]);
  const [notes, setNotes] = useState<string>("");
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  
  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }]);
  };
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };
  
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleCreate = async () => {
    if (!countryData || !invoiceNumber || !clientName || totalAmount <= 0) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const payload = {
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      items: items.filter(item => item.description && item.quantity > 0 && item.unit_price > 0),
      notes,
      total_amount: totalAmount,
      currency: countryData.currency,
      issue_date: new Date().toISOString(),
    };
    
    try {
      const link = await createLink.mutateAsync({
        type: "invoice",
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
            
            <h2 className="text-xl font-bold mb-2">تم إنشاء الفاتورة بنجاح!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              شارك هذا الرابط مع عملائك
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
              إنشاء فاتورة جديدة
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
                  background: "linear-gradient(135deg, hsl(210 95% 50%), hsl(220 90% 60%))",
                }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إنشاء فاتورة - {countryData.nameAr}</h1>
                <p className="text-xs text-muted-foreground">أنشئ فاتورة احترافية</p>
              </div>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-4">
              {/* Invoice Number */}
              <div>
                <Label className="text-sm mb-2">رقم الفاتورة *</Label>
                <Input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="مثال: INV-2025-001"
                  className="h-9 text-sm"
                />
              </div>
              
              {/* Client Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">معلومات العميل</h3>
                <div>
                  <Label className="text-sm mb-2">اسم العميل *</Label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="أدخل اسم العميل"
                    className="h-9 text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm mb-2">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">بنود الفاتورة</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 ml-1" />
                    إضافة بند
                  </Button>
                </div>
                
                {items.map((item, index) => (
                  <Card key={item.id} className="p-3 bg-secondary/30">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">البند {index + 1}</span>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-xs mb-1">الوصف</Label>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="وصف الخدمة أو المنتج"
                          className="h-8 text-xs"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1">الكمية</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs mb-1">السعر ({countryData.currency})</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, "unit_price", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="text-left pt-1 border-t">
                        <span className="text-xs text-muted-foreground">المجموع: </span>
                        <span className="text-xs font-semibold">
                          {formatCurrency(item.quantity * item.unit_price, countryData.currency)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Notes */}
              <div>
                <Label className="text-sm mb-2">ملاحظات (اختياري)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات أو شروط..."
                  className="min-h-[80px] text-sm"
                />
              </div>
              
              {/* Total Amount */}
              <div className="bg-gradient-primary p-4 rounded-xl text-primary-foreground">
                <p className="text-xs mb-1">المبلغ الإجمالي</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount, countryData.currency)}
                </p>
              </div>
              
              {/* Create Button */}
              <Button
                onClick={handleCreate}
                disabled={createLink.isPending || !invoiceNumber || !clientName || totalAmount <= 0}
                className="w-full py-5"
              >
                {createLink.isPending ? (
                  <span className="text-sm">جاري الإنشاء...</span>
                ) : (
                  <>
                    <span className="ml-2 text-sm">إنشاء الفاتورة</span>
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceLink;
