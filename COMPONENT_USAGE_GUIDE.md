# دليل استخدام المكونات الجديدة

## نظرة عامة
تم إنشاء مكونين رئيسيين جديدين لتحسين مظهر الخدمات:

---

## 1. OfficialStamp - الختم الرسمي

### الموقع
```typescript
/workspace/src/components/OfficialStamp.tsx
```

### الاستخدام

```typescript
import OfficialStamp from "@/components/OfficialStamp";

<OfficialStamp 
  serviceKey="aramex"           // مفتاح الخدمة
  serviceName="أرامكس - Aramex" // اسم الخدمة
  type="paid"                    // نوع الختم: approved, verified, paid, secured
  transactionId="optional"       // اختياري - رقم المعاملة
/>
```

### الأنواع المتاحة

#### 1. `approved` - مُعتمد
- أيقونة: CheckCircle
- نص عربي: "مُعتمد"
- نص إنجليزي: "APPROVED"
- دوران: -15 درجة

#### 2. `verified` - مُوثّق
- أيقونة: Shield
- نص عربي: "مُوثّق"
- نص إنجليزي: "VERIFIED"
- دوران: 12 درجة

#### 3. `paid` - مدفوع
- أيقونة: BadgeCheck
- نص عربي: "مدفوع"
- نص إنجليزي: "PAID"
- دوران: -8 درجة

#### 4. `secured` - محمي
- أيقونة: Lock
- نص عربي: "محمي"
- نص إنجليزي: "SECURED"
- دوران: 10 درجة

### الميزات
- ✅ يتكيف تلقائياً مع ألوان الخدمة
- ✅ أنيميشن ظهور احترافي
- ✅ دوران تلقائي للحدود
- ✅ تاريخ تلقائي بالتقويم الهجري
- ✅ تأثير hover للتكبير
- ✅ أحجام متجاوبة (32x32 على الهاتف، 40x40 على الكمبيوتر)

### أمثلة الاستخدام

#### في صفحة الإيصال
```typescript
{/* في الأعلى - يسار */}
<div className="absolute top-0 left-4">
  <OfficialStamp 
    serviceKey={serviceKey}
    serviceName={serviceName}
    type="verified"
  />
</div>

{/* في الأعلى - يمين */}
<div className="absolute top-0 right-4">
  <OfficialStamp 
    serviceKey={serviceKey}
    serviceName={serviceName}
    type="paid"
  />
</div>

{/* في الأسفل - وسط */}
<div className="flex justify-center mt-6">
  <OfficialStamp 
    serviceKey={serviceKey}
    serviceName={serviceName}
    type="approved"
  />
</div>
```

---

## 2. ServiceBadge - شارة الخدمة

### الموقع
```typescript
/workspace/src/components/ServiceBadge.tsx
```

### الاستخدام

```typescript
import ServiceBadge from "@/components/ServiceBadge";

<ServiceBadge 
  serviceKey="aramex"           // مفتاح الخدمة
  serviceName="أرامكس - Aramex" // اسم الخدمة
  size="lg"                      // الحجم: sm, md, lg
  showIcon={true}                // اختياري - إظهار أيقونة الدرع (افتراضي: true)
/>
```

### الأحجام المتاحة

#### 1. `sm` - صغير
- padding: `px-2 py-1`
- نص: `text-xs`
- أيقونات: `w-3 h-3`
- الاستخدام: في الجداول والقوائم

#### 2. `md` - متوسط
- padding: `px-3 py-1.5`
- نص: `text-sm`
- أيقونات: `w-4 h-4`
- الاستخدام: في المحتوى العادي

#### 3. `lg` - كبير
- padding: `px-4 py-2`
- نص: `text-base`
- أيقونات: `w-5 h-5`
- الاستخدام: في العناوين والصفحات الرئيسية

### الميزات
- ✅ ألوان مطابقة للعلامة التجارية
- ✅ حدود ملونة بألوان الشركة
- ✅ ظل ملون خفيف
- ✅ أيقونة الدرع والتحقق
- ✅ تأثير hover للتكبير
- ✅ أنيميشن fade-in

### أمثلة الاستخدام

#### في المقدمة
```typescript
<div className="flex justify-center mb-4">
  <ServiceBadge 
    serviceKey={serviceKey}
    serviceName={serviceName}
    size="lg"
  />
</div>
```

#### في الجدول
```typescript
<td>
  <ServiceBadge 
    serviceKey={serviceKey}
    serviceName={serviceName}
    size="sm"
  />
</td>
```

#### بدون أيقونة الدرع
```typescript
<ServiceBadge 
  serviceKey={serviceKey}
  serviceName={serviceName}
  size="md"
  showIcon={false}
/>
```

---

## 3. مفاتيح الخدمات المتاحة

### جميع الخدمات
```typescript
// الإمارات
'aramex' | 'dhl' | 'fedex' | 'ups' | 'empost'

// السعودية
'smsa' | 'aramex' | 'dhl' | 'zajil' | 'naqel' | 'saudipost' | 'fedex' | 'ups'

// الكويت
'kwpost' | 'dhlkw' | 'aramex' | 'fedex' | 'ups'

// قطر
'qpost' | 'dhlqa' | 'aramex' | 'fedex' | 'ups'

// عُمان
'omanpost' | 'dhlom' | 'aramex' | 'fedex' | 'ups'

// البحرين
'bahpost' | 'dhlbh' | 'aramex' | 'fedex' | 'ups'
```

---

## 4. أنماط CSS الجديدة

### الخطوط
```css
/* خط الإيصالات */
className="font-receipt"

/* خط رسمي */
className="font-official"

/* أرقام متساوية */
className="font-mono-numbers"
```

### الأنيميشن
```css
/* ظهور الختم */
className="animate-stamp"

/* تلاشي */
className="animate-fade-in"

/* نبض مضيء */
className="animate-pulse-glow"
```

---

## 5. أمثلة كاملة

### مثال: صفحة إيصال كاملة

```typescript
import OfficialStamp from "@/components/OfficialStamp";
import ServiceBadge from "@/components/ServiceBadge";

const PaymentReceipt = () => {
  const serviceKey = "aramex";
  const serviceName = "أرامكس - Aramex";
  
  return (
    <div className="container">
      {/* العنوان مع الشارة */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          تم الدفع بنجاح!
        </h1>
        <ServiceBadge 
          serviceKey={serviceKey}
          serviceName={serviceName}
          size="lg"
        />
      </div>
      
      {/* الأختام الرسمية */}
      <div className="relative">
        <div className="absolute top-0 left-4">
          <OfficialStamp 
            serviceKey={serviceKey}
            serviceName={serviceName}
            type="verified"
          />
        </div>
        <div className="absolute top-0 right-4">
          <OfficialStamp 
            serviceKey={serviceKey}
            serviceName={serviceName}
            type="paid"
          />
        </div>
        
        {/* محتوى الإيصال */}
        <Card className="p-8">
          {/* التفاصيل هنا */}
        </Card>
      </div>
      
      {/* ختم إضافي في الأسفل للهواتف */}
      <div className="flex justify-center mt-6 sm:hidden">
        <OfficialStamp 
          serviceKey={serviceKey}
          serviceName={serviceName}
          type="approved"
        />
      </div>
    </div>
  );
};
```

### مثال: قائمة خدمات

```typescript
const ServicesList = ({ services }) => {
  return (
    <div className="grid gap-4">
      {services.map(service => (
        <div key={service.id} className="flex items-center justify-between p-4 border rounded">
          <div>
            <h3 className="font-bold">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </div>
          <ServiceBadge 
            serviceKey={service.key}
            serviceName={service.name}
            size="sm"
          />
        </div>
      ))}
    </div>
  );
};
```

---

## 6. نصائح الاستخدام

### للأختام الرسمية
✅ استخدم `verified` للتحقق من الهوية  
✅ استخدم `paid` لتأكيد الدفع  
✅ استخدم `approved` للموافقات  
✅ استخدم `secured` للأمان والحماية  

### للشارات
✅ استخدم `lg` في العناوين والصفحات الرئيسية  
✅ استخدم `md` في المحتوى العادي  
✅ استخدم `sm` في الجداول والقوائم  

### للتموضع
✅ ضع الأختام في الزوايا أو الأسفل  
✅ ضع الشارات في المقدمة أو بجانب النص  
✅ استخدم `absolute` positioning للأختام  
✅ استخدم `flex` centering للشارات  

---

## 7. الاستكشاف والإصلاح

### المشكلة: الختم لا يظهر
**الحل:**
- تحقق من `serviceKey` صحيح
- تأكد من استيراد المكون
- تحقق من CSS loaded

### المشكلة: الألوان غير صحيحة
**الحل:**
- تحقق من `serviceKey` مطابق للقائمة
- تأكد من `serviceLogos.ts` محدث
- تحقق من branding function

### المشكلة: الأنيميشن لا تعمل
**الحل:**
- تأكد من `index.css` محمل
- تحقق من `@keyframes` موجودة
- أعد تشغيل dev server

---

## الخلاصة

المكونات الجديدة جاهزة للاستخدام في جميع الصفحات:
- ✅ `OfficialStamp` - للأختام الرسمية
- ✅ `ServiceBadge` - للشارات المخصصة
- ✅ أنماط CSS محسّنة
- ✅ أنيميشن احترافية
- ✅ توافق كامل مع جميع الخدمات

استخدمها لإضفاء مظهر احترافي ورسمي على جميع صفحات الدفع! 🎉
