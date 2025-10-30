# تعليمات رفع المشروع إلى GitHub

## ⚠️ تحذير أمني
**لا تشارك GitHub Token أبداً علنياً!**
- Token الذي شاركته تم كشفه ويجب إلغاؤه فوراً
- اذهب إلى: https://github.com/settings/tokens
- احذف Token القديم
- أنشئ token جديد واحتفظ به سرياً

---

## 📋 الخطوات

### 1. إنشاء Repository جديد على GitHub

انتقل إلى: https://github.com/new

املأ التفاصيل:
- **Repository name**: `gulf-unified-platform` (أو أي اسم تريده)
- **Description**: `Gulf Unified Payment Platform - Shipping & Chalet Services`
- **Visibility**: Private (موصى به) أو Public
- **لا تضف** README أو .gitignore أو license (لأنها موجودة بالفعل)

---

### 2. تكوين Git في المشروع

افتح Terminal في مجلد المشروع وشغّل:

```bash
# التأكد من وجود git repository
cd /workspace
git status

# إذا لم يكن هناك repository، قم بالتهيئة
git init

# إضافة جميع الملفات
git add .

# إنشاء commit
git commit -m "Initial commit: Gulf Unified Platform with all features

- Official stamps and service badges
- Payment flow for shipping and chalet services  
- Bank login and card payment options
- Copy and preview link buttons
- Link type selection (card/login)
- All GCC shipping services supported
- Telegram integration
- Netlify Forms integration"
```

---

### 3. ربط المشروع بـ GitHub

```bash
# استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub
# استبدل REPO_NAME باسم الـ repository الذي أنشأته
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# مثال:
# git remote add origin https://github.com/yourusername/gulf-unified-platform.git
```

---

### 4. رفع الكود إلى GitHub

#### الطريقة 1: باستخدام Token (موصى بها)

```bash
# استبدل NEW_TOKEN بالـ token الجديد الذي أنشأته
# استبدل YOUR_USERNAME باسم المستخدم
# استبدل REPO_NAME باسم الـ repository

git push https://NEW_TOKEN@github.com/YOUR_USERNAME/REPO_NAME.git main

# أو إذا كان الـ branch اسمه master:
# git push https://NEW_TOKEN@github.com/YOUR_USERNAME/REPO_NAME.git master
```

#### الطريقة 2: باستخدام GitHub CLI (أسهل وأكثر أماناً)

```bash
# تثبيت GitHub CLI إذا لم يكن مثبتاً
# https://cli.github.com/

# تسجيل الدخول
gh auth login

# إنشاء repository ورفع الكود مباشرة
gh repo create gulf-unified-platform --private --source=. --push
```

---

### 5. التحقق من النجاح

بعد الرفع، اذهب إلى:
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

يجب أن ترى جميع ملفات المشروع!

---

## 🔒 نصائح أمنية

### 1. لا تضع Tokens في الكود
**أبداً** لا تضع GitHub tokens أو أي مفاتيح API في:
- الكود المصدري
- الـ commits
- المحادثات العامة
- الملفات التي سترفعها

### 2. استخدم متغيرات البيئة
ضع الـ tokens والمفاتيح في:
- ملفات `.env` (وأضفها إلى `.gitignore`)
- GitHub Secrets (للـ CI/CD)
- Environment variables في Netlify

### 3. أنشئ .gitignore صحيح
تأكد من وجود `.gitignore` يتضمن:
```
.env
.env.local
*.log
node_modules/
.DS_Store
```

### 4. راجع قبل الـ push
دائماً راجع:
```bash
git status
git diff
```

قبل أن تعمل push

---

## 📱 إعداد Netlify (إذا أردت)

### 1. اربط GitHub مع Netlify
1. اذهب إلى: https://app.netlify.com/
2. اضغط "Add new site" → "Import an existing project"
3. اختر GitHub
4. اختر الـ repository
5. Netlify سيكتشف إعدادات Vite تلقائياً

### 2. أضف Environment Variables
في إعدادات Netlify، أضف:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TELEGRAM_BOT_TOKEN`
- `VITE_TELEGRAM_CHAT_ID`

---

## ✅ النتيجة

بعد اتباع هذه الخطوات:
- ✅ الكود محفوظ على GitHub
- ✅ يمكنك العمل من أي جهاز
- ✅ Version control كامل
- ✅ إمكانية النشر على Netlify
- ✅ مشاركة آمنة مع الفريق

---

## 🆘 مشاكل شائعة

### المشكلة: "Permission denied"
**الحل**: تأكد من صلاحيات الـ token:
- repo (كامل)
- workflow (إذا كنت تستخدم GitHub Actions)

### المشكلة: "Remote already exists"
**الحل**:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### المشكلة: "Branch main doesn't exist"
**الحل**:
```bash
# تحقق من اسم الـ branch
git branch

# إذا كان master، استخدم:
git push https://NEW_TOKEN@github.com/YOUR_USERNAME/REPO_NAME.git master

# أو أعد تسمية الـ branch:
git branch -M main
```

---

## 📞 المساعدة

إذا واجهت أي مشاكل:
1. راجع الأخطاء في Terminal
2. تأكد من Token صحيح وله الصلاحيات المطلوبة
3. تأكد من اسم الـ repository صحيح
4. جرب GitHub CLI - أسهل!

---

**ملاحظة مهمة**: 
🔴 **احذف Token القديم فوراً!** 🔴
Token الذي شاركته في المحادثة مكشوف ويمكن لأي شخص استخدامه.
