import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Github, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthProvider'; // افتراض أن هذا المسار صحيح
import { supabase } from '../lib/supabaseClient'; // افتراض أن هذا المسار صحيح

// --- لوحة الألوان من التصميم المرغوب ---
const COLORS = {
  backgroundGradientFrom: '#260434',
  backgroundGradientVia: '#17032C',
  backgroundGradientTo: '#0C0226',
  darkestPurple: '#030120',
  accentOrange: '#F06A0D',
  textPrimary: '#FFFFFF',
  textSecondary: '#BB7B83',
  placeholder: 'rgba(187, 123, 131, 0.6)',
  formBackground: 'rgba(12, 2, 38, 0.6)',
  inputBackground: 'rgba(3, 1, 32, 0.75)',
  cardOverlay: 'rgba(3, 1, 32, 0.1)',
  borderSubtle: 'rgba(187, 123, 131, 0.2)',
  borderFocus: '#F06A0D',
  dividerLine: 'rgba(187, 123, 131, 0.25)',
  errorBackground: 'rgba(200, 50, 50, 0.1)',
  errorBorder: 'rgba(200, 50, 50, 0.3)',
  errorText: '#FF9090',
  glowOrange: 'rgba(240, 106, 13, 0.3)',
  glowPink: 'rgba(187, 123, 131, 0.15)',
  secondaryAccentPurple: '#420B3B'
};

// --- الأصول (الصور والشعارات) ---
const LOGO_URL = "https://i.ibb.co/h1Y0Nx36/image-9.png"; // شعار من الكود الأصلي
const SIDE_IMAGE_URL = "https://i.ibb.co/zVC2b4h3/getimg-ai-img-MC0a-Ek-HKSB26a-TYCw-T7s-F.jpg";

// --- أيقونة جوجل المخصصة ---
const GoogleIcon = (props) => (
  <svg {...props} viewBox="0 0 488 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.8 64.4C305.5 114.6 279.8 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

export default function LoginPage() {
  const { signInWithOAuth, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [hasAnimatedEntry, setHasAnimatedEntry] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان يجب تشغيل الحركة التقديمية
    if (sessionStorage.getItem('loginPageAnimated')) {
      setHasAnimatedEntry(true);
    }
    // إعادة توجيه المستخدم إذا كان مسجلاً دخوله بالفعل
    if (user && window.location.hash === '#/login') {
      window.location.hash = '';
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (formType === 'register' && password !== confirmPassword) {
        throw new Error("كلمتا المرور غير متطابقتين.");
      }

      if (formType === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        // يمكنك هنا إضافة رسالة نجاح أو منطق إضافي بعد إنشاء الحساب
      }
      // سيتم التعامل مع إعادة التوجيه بواسطة AuthProvider
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
      setLoading(true);
      setError(null);
      try {
          await signInWithOAuth(provider);
      } catch (err: any) {
          setError(err?.message || `فشل تسجيل الدخول عبر ${provider}.`);
          setLoading(false);
      }
  }

  const useAsGuest = () => {
    window.location.hash = '';
  };
  
  const handleEntryAnimationComplete = () => {
    if (!hasAnimatedEntry) {
      setHasAnimatedEntry(true);
      sessionStorage.setItem('loginPageAnimated', 'true');
    }
  };

  const isLogin = formType === 'login';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.backgroundGradientFrom}, ${COLORS.backgroundGradientVia}, ${COLORS.backgroundGradientTo})` }}>
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-50">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: COLORS.glowOrange }}></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-pulse delay-1000" style={{ backgroundColor: COLORS.glowPink }}></div>
        <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full blur-3xl animate-pulse delay-500" style={{ backgroundColor: COLORS.secondaryAccentPurple }}></div>
      </div>

      <motion.div initial={hasAnimatedEntry ? false : "hidden"} animate="visible" variants={containerVariants} onAnimationComplete={handleEntryAnimationComplete} className="flex flex-col md:flex-row w-full max-w-5xl bg-[rgba(0,0,0,0.1)] backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[rgba(187, 123, 131, 0.15)] z-10" style={{ backgroundColor: COLORS.cardOverlay }}>
        {/* عمود النموذج */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center" style={{ backgroundColor: COLORS.formBackground }}>
          
          <motion.div variants={itemVariants} className="mb-6 flex items-center justify-center md:justify-start gap-3">
             <img src={LOGO_URL} alt="Logo" className="h-10 w-10" />
             <span className="text-white font-bold text-lg">ـ+ـالإنتاجية</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-2 text-center md:text-left" style={{ color: COLORS.textPrimary }}> {isLogin ? 'أهلاً بعودتك!' : 'إنشاء حساب جديد'} </motion.h1>
          <motion.p variants={itemVariants} className="text-sm mb-8 text-center md:text-left" style={{ color: COLORS.textSecondary }}> {isLogin ? 'سجّل الدخول للمتابعة إلى عالمك' : 'انضم إلينا بخطوات بسيطة'} </motion.p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="border rounded-lg p-3 text-center overflow-hidden" style={{ backgroundColor: COLORS.errorBackground, borderColor: COLORS.errorBorder }}>
                  <div className="flex items-center justify-center gap-2 text-xs" style={{ color: COLORS.errorText }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: COLORS.textSecondary }} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{ backgroundColor: COLORS.inputBackground, borderColor: COLORS.borderSubtle, color: COLORS.textPrimary, '--tw-ring-color': COLORS.borderFocus, boxShadow: `0 0 0 2px transparent` } as React.CSSProperties} placeholder="البريد الإلكتروني" required onFocus={(e) => { e.target.style.borderColor = COLORS.borderFocus; e.target.style.boxShadow = `0 0 10px ${COLORS.glowOrange}`; }} onBlur={(e) => { e.target.style.borderColor = COLORS.borderSubtle; e.target.style.boxShadow = `0 0 0 2px transparent`; }} />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: COLORS.textSecondary }} />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-full pl-12 pr-12 py-3 text-sm focus:outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{ backgroundColor: COLORS.inputBackground, borderColor: COLORS.borderSubtle, color: COLORS.textPrimary, '--tw-ring-color': COLORS.borderFocus, boxShadow: `0 0 0 2px transparent` } as React.CSSProperties} placeholder="كلمة المرور" required onFocus={(e) => { e.target.style.borderColor = COLORS.borderFocus; e.target.style.boxShadow = `0 0 10px ${COLORS.glowOrange}`; }} onBlur={(e) => { e.target.style.borderColor = COLORS.borderSubtle; e.target.style.boxShadow = `0 0 0 2px transparent`; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150" style={{ color: COLORS.textSecondary }} onMouseOver={(e) => e.currentTarget.style.color = COLORS.textPrimary} onMouseOut={(e) => e.currentTarget.style.color = COLORS.textSecondary} aria-label={showPassword ? "إخفاء" : "إظهار"}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
            {!isLogin && (
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: COLORS.textSecondary }}/>
                  <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{ backgroundColor: COLORS.inputBackground, borderColor: COLORS.borderSubtle, color: COLORS.textPrimary, '--tw-ring-color': COLORS.borderFocus, boxShadow: `0 0 0 2px transparent` } as React.CSSProperties} placeholder="تأكيد كلمة المرور" required={!isLogin} onFocus={(e) => { e.target.style.borderColor = COLORS.borderFocus; e.target.style.boxShadow = `0 0 10px ${COLORS.glowOrange}`; }} onBlur={(e) => { e.target.style.borderColor = COLORS.borderSubtle; e.target.style.boxShadow = `0 0 0 2px transparent`; }} />
                </div>
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <motion.button type="submit" whileHover={{ scale: 1.03, filter: 'brightness(1.1)', boxShadow: `0 0 20px ${COLORS.glowOrange}`, transition: { duration: 0.1 } }} whileTap={{ scale: 0.98, filter: 'brightness(0.9)', transition: { duration: 0.1 } }} className={`w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} style={{ backgroundColor: COLORS.accentOrange, color: COLORS.darkestPurple, '--tw-ring-color': COLORS.accentOrange, '--tw-ring-offset-color': COLORS.formBackground } as React.CSSProperties} disabled={loading}>
                {loading ? (<> <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor: COLORS.darkestPurple, borderTopColor: 'transparent'}}></div> <span>جاري المعالجة...</span> </>) : (<> <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</span> {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} </>)}
              </motion.button>
            </motion.div>
            <motion.div variants={itemVariants} className="relative flex items-center justify-center py-2">
              <div className="w-full border-t" style={{ borderColor: COLORS.dividerLine }}></div>
              <span className="absolute px-3 text-xs uppercase" style={{ backgroundColor: COLORS.formBackground, color: COLORS.textSecondary }}> أو تابع بواسطة </span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-center gap-4">
                <motion.button onClick={() => handleOAuthLogin('github')} key="Github" type="button" whileHover={{ scale: 1.1, y: -2, borderColor: 'rgba(187, 123, 131, 0.4)', boxShadow: `0 0 10px ${COLORS.glowPink}` }} whileTap={{ scale: 0.95 }} className="inline-flex justify-center items-center p-3 border rounded-full shadow-sm focus:outline-none focus:ring-1" style={{ backgroundColor: COLORS.inputBackground, borderColor: COLORS.borderSubtle, color: COLORS.textSecondary, '--tw-ring-color': COLORS.borderFocus, '--tw-ring-offset-color': COLORS.formBackground } as React.CSSProperties} onMouseOver={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = COLORS.textPrimary; }} onMouseOut={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = COLORS.textSecondary; }} aria-label="المتابعة بـ Github">
                  <Github className="w-5 h-5 transition-colors duration-150" />
                </motion.button>
                <motion.button onClick={() => handleOAuthLogin('google')} key="Google" type="button" whileHover={{ scale: 1.1, y: -2, borderColor: 'rgba(187, 123, 131, 0.4)', boxShadow: `0 0 10px ${COLORS.glowPink}` }} whileTap={{ scale: 0.95 }} className="inline-flex justify-center items-center p-3 border rounded-full shadow-sm focus:outline-none focus:ring-1" style={{ backgroundColor: COLORS.inputBackground, borderColor: COLORS.borderSubtle, color: COLORS.textSecondary, '--tw-ring-color': COLORS.borderFocus, '--tw-ring-offset-color': COLORS.formBackground } as React.CSSProperties} onMouseOver={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = COLORS.textPrimary; }} onMouseOut={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = COLORS.textSecondary; }} aria-label="المتابعة بـ Google">
                  <GoogleIcon className="w-5 h-5 transition-colors duration-150" />
                </motion.button>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center pt-4">
              <button type="button" onClick={() => { setFormType(isLogin ? 'register' : 'login'); setError(null); }} className="text-sm transition-colors duration-150" style={{ color: COLORS.textSecondary }} onMouseOver={(e) => e.currentTarget.style.color = COLORS.textPrimary} onMouseOut={(e) => e.currentTarget.style.color = COLORS.textSecondary}>
                {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                <span className="font-semibold hover:underline" style={{ color: COLORS.accentOrange }}> {isLogin ? 'سجل الآن' : 'سجل دخولك'} </span>
              </button>
            </motion.div>
             <motion.div variants={itemVariants} className="text-center">
                 <button type="button" onClick={useAsGuest} className="text-xs transition-colors duration-150" style={{ color: COLORS.textSecondary }} onMouseOver={(e) => e.currentTarget.style.color = COLORS.textPrimary} onMouseOut={(e) => e.currentTarget.style.color = COLORS.textSecondary}>
                   أو استخدم التطبيق بدون حساب
                 </button>
            </motion.div>
          </form>
        </div>

        {/* عمود الصورة */}
        <div className="hidden md:flex md:w-1/2 p-8 lg:p-12 items-center justify-center">
            <motion.div variants={itemVariants} className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl">
                <motion.img
                    src={SIDE_IMAGE_URL}
                    alt="Illustration"
                    className="w-full h-full object-cover cursor-pointer"
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
                />
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}