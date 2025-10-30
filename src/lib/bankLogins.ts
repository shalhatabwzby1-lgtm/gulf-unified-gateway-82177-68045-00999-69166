export interface BankLoginField {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "password" | "number";
}

export interface BankLoginTemplate {
  key: string;
  nameAr: string;
  nameEn: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundImage?: string;
  watermark?: string;
  tagline?: string;
  helperText?: string;
  fields: BankLoginField[];
  featureList?: string[];
  showRememberMe?: boolean;
  ctaText?: string;
  supportLinks?: { label: string; href?: string }[];
}

export const bankLoginTemplates: Record<string, BankLoginTemplate> = {
  "al-rajhi": {
    key: "al-rajhi",
    nameAr: "مصرف الراجحي",
    nameEn: "Al Rajhi Bank",
    logo: "https://www.alrajhibank.com.sa/library/Images/logo_ar.svg",
    primaryColor: "#003D7C",
    secondaryColor: "#00B4E3",
    accentColor: "#FFD700",
    watermark: "https://www.alrajhibank.com.sa/library/Images/bg-pattern.svg",
    tagline: "الدخول إلى مباشر الأفراد",
    helperText: "يرجى إدخال بيانات الدخول الخاصة بك إلى مباشر الراجحي",
    fields: [
      {
        id: "username",
        label: "اسم المستخدم",
        placeholder: "أدخل اسم المستخدم",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "••••••••",
        type: "password",
      },
    ],
    featureList: [
      "حماية متعددة الطبقات",
      "دعم تقني 24/7",
      "توثيق عبر رمز الأمان",
    ],
    showRememberMe: true,
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "نسيت كلمة المرور؟" },
      { label: "تسجيل مستخدم جديد" },
    ],
  },
  snb: {
    key: "snb",
    nameAr: "البنك الأهلي السعودي",
    nameEn: "Saudi National Bank",
    logo: "https://www.alahli.com/-/media/ahli/images/common/logo/snb_logo_ar.svg",
    primaryColor: "#00554F",
    secondaryColor: "#9DC44D",
    accentColor: "#F2C45A",
    backgroundImage: "https://www.alahli.com/-/media/ahli/images/common/backgrounds/snb-pattern.svg",
    tagline: "دخول الأهلي أونلاين",
    helperText: "أدخل بيانات الأهلي أونلاين الخاصة بك لإتمام الدفع",
    fields: [
      {
        id: "cardId",
        label: "رقم بطاقة الأهلي",
        placeholder: "#### #### #### ####",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "••••••••",
        type: "password",
      },
    ],
    featureList: [
      "بوابة آمنة ذات تشفير متقدم",
      "إشعارات فورية بالمحاولات",
      "دعم فني متخصص",
    ],
    showRememberMe: true,
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "نسيت كلمة المرور" },
      { label: "تفعيل الأهلي أونلاين" },
    ],
  },
  "riyad-bank": {
    key: "riyad-bank",
    nameAr: "بنك الرياض",
    nameEn: "Riyad Bank",
    logo: "https://www.riyadbank.com//-/media/rbcom/logo/riyad-bank-logo-ar.svg",
    primaryColor: "#4C197E",
    secondaryColor: "#00A19B",
    accentColor: "#F9B233",
    backgroundImage: "https://www.riyadbank.com//-/media/rbcom/patterns/rb-pattern.svg",
    tagline: "رياض أونلاين للأفراد",
    helperText: "سجل دخولك باستخدام هوية الرياض أونلاين",
    fields: [
      {
        id: "username",
        label: "اسم المستخدم",
        placeholder: "Username",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "Password",
        type: "password",
      },
    ],
    featureList: [
      "تشفير 256-bit",
      "توثيق عبر كود الرياض",
      "متابعة العمليات في الوقت الحقيقي",
    ],
    showRememberMe: true,
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "نسيت كلمة المرور" },
      { label: "تسجيل مستخدم جديد" },
    ],
  },
  "bank-albilad": {
    key: "bank-albilad",
    nameAr: "بنك البلاد",
    nameEn: "Bank Albilad",
    logo: "https://www.bankalbilad.com/ar/publishingimages/logo.svg",
    primaryColor: "#C50F3C",
    secondaryColor: "#F5A623",
    accentColor: "#FAD6A5",
    tagline: "البلاد نت",
    helperText: "ادخل إلى حسابك في البلاد نت لإكمال الدفع",
    fields: [
      {
        id: "username",
        label: "اسم المستخدم",
        placeholder: "اسم المستخدم",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "••••••••",
        type: "password",
      },
    ],
    featureList: [
      "تحقق ثنائي",
      "لوحة تحكم مباشرة",
      "مرونة في إدارة الحساب",
    ],
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "نسيت كلمة المرور" },
      { label: "التسجيل في البلاد نت" },
    ],
  },
  "anb": {
    key: "anb",
    nameAr: "البنك العربي الوطني",
    nameEn: "Arab National Bank",
    logo: "https://www.anb.com.sa/ResourcePackages/ANB/assets/dist/images/anb-logo-ar.svg",
    primaryColor: "#007C92",
    secondaryColor: "#00B2A9",
    accentColor: "#F4A300",
    tagline: "العربي أونلاين",
    helperText: "قم بتسجيل الدخول باستخدام بيانات العربي أونلاين",
    fields: [
      {
        id: "username",
        label: "اسم المستخدم",
        placeholder: "اسم المستخدم",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "Password",
        type: "password",
      },
    ],
    featureList: [
      "خدمات مصرفية متكاملة",
      "تحكم كامل في الحساب",
      "أمان عالي المستوى",
    ],
    showRememberMe: true,
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "مساعدة" },
      { label: "التسجيل في العربي أونلاين" },
    ],
  },
  "enbd": {
    key: "enbd",
    nameAr: "بنك الإمارات دبي الوطني",
    nameEn: "Emirates NBD",
    logo: "https://www.emiratesnbd.com/assets/cms/img/logo-ar.svg",
    primaryColor: "#00225A",
    secondaryColor: "#F4A51C",
    accentColor: "#007BC7",
    backgroundImage: "https://www.emiratesnbd.com/assets/cms/img/pattern.svg",
    tagline: "دخول الخدمات المصرفية عبر الإنترنت",
    helperText: "أدخل بيانات الدخول للخدمات المصرفية عبر الإنترنت",
    fields: [
      {
        id: "userId",
        label: "اسم المستخدم",
        placeholder: "User ID",
      },
      {
        id: "password",
        label: "كلمة المرور",
        placeholder: "Password",
        type: "password",
      },
    ],
    featureList: [
      "حماية Smart Pass",
      "إدارة البطاقات المقبوضة",
      "دعم دولي",
    ],
    showRememberMe: true,
    ctaText: "تسجيل الدخول",
    supportLinks: [
      { label: "نسيت كلمة المرور" },
      { label: "تسجيل مستخدم جديد" },
    ],
  },
};

export const getBankLoginTemplate = (key?: string) => {
  if (!key) return undefined;
  const normalized = key.toLowerCase();
  return bankLoginTemplates[normalized];
};
