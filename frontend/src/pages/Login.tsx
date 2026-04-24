import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { loginApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Loader2, User, Lock, Eye, EyeOff, ShieldCheck, Crown 
} from 'lucide-react';

export default function Login() {
  const { shop } = useShop(); 
  const config = shop?.login_config || {
    background_url: '',
    background_overlay: 0.3,
    box_position: { x: 50, y: 50 },
    box_style: { is_glassmorphism: true, border_color: '#ffd700' }
  };

  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ----------------------------------------------------
  // 1. ส่วนรับ Token จาก URL (Impersonate / Auto Login) 
  // ----------------------------------------------------
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');

      if (tokenFromUrl) {
          const autoLogin = async () => {
              try {
                  localStorage.setItem('token', tokenFromUrl);
                  localStorage.setItem('is_impersonating', 'true');
                  await login(tokenFromUrl); 
                  
                  toast.success('ยืนยันตัวตนสำเร็จ');
                  window.history.replaceState({}, document.title, window.location.pathname);
                  
                  setTimeout(() => {
                      navigate('/', { replace: true });
                  }, 100);

              } catch (err: any) {
                //   console.error("Auto Login Failed:", err);
                  toast.error(err.response?.data?.detail || 'Token ไม่ถูกต้อง หรือ หมดอายุ');
                  localStorage.removeItem('token');
              }
          };
          autoLogin();
      }
  }, [login, navigate]);

  // ----------------------------------------------------
  // 2. Function Login ปกติ
  // ----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('กรุณากรอกข้อมูลให้ครบ');

    setIsLoading(true);
    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await loginApi(formData as any); 
        await login(res.access_token);
        
        toast.success('เข้าสู่ระบบสำเร็จ');
        navigate('/');
    } catch (err: any) {
        // console.error("Login Error:", err);
        const msg = err.response?.data?.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 transition-all duration-700"
      style={{ 
        backgroundImage: config.background_url ? `url(${config.background_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500"
        style={{ backgroundColor: `rgba(0, 0, 0, ${config.background_overlay ?? 0.3})` }}
      />

      {/* 🟢 กล่อง Login แบบขยับตำแหน่งได้ */}
      <div 
        className={`relative z-10 w-[90%] sm:w-full max-w-md p-6 sm:p-8 transition-all duration-500
          ${config.box_style?.is_glassmorphism 
            ? 'bg-white/10 backdrop-blur-2xl border-white/20' 
            : 'bg-slate-900 border-slate-700'} 
          border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
        style={{ 
          position: 'absolute',
          left: `${config.box_position?.x ?? 50}%`,
          top: `${config.box_position?.y ?? 50}%`,
          transform: 'translate(-50%, -50%)',
          borderColor: config.box_style?.border_color || '#ffd700',
          margin: 0 // 🟢 บังคับไม่ให้มี margin มาดันกล่องจนเบี้ยว
        }}
      >
        <div className="flex flex-col items-center mb-8">
            
            {/* 🟢 ส่วน Logo & Crown แบบ Premium */}
            {shop?.logo_url ? (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-yellow-600 to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img 
                        src={shop.logo_url} 
                        alt="Shop Logo" 
                        className="relative w-24 h-24 object-contain mb-4 drop-shadow-2xl"
                    />
                </div>
            ) : (
                <div className="relative mb-6 flex justify-center items-center group">
                    {/* ออร่าสีทองด้านหลัง */}
                    <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full group-hover:bg-yellow-500/30 transition duration-700"></div>
                    {/* วงกลมรองรับมงกุฎ */}
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.2)]">
                        <Crown className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" strokeWidth={1.5} />
                    </div>
                </div>
            )}

            {/* <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-gray-200 to-yellow-600 tracking-tighter text-center uppercase" */}
                <h1 className="text-5xl font-black tracking-[0.2em] bg-linear-to-b from-[#FFF] via-[#d4af37] to-[#8a6e28] bg-clip-text text-transparent drop-shadow-sm select-none"
                style={{ fontFamily: "'Cinzel', serif" }} 
            >
                {shop?.name || 'Thailot'}
            </h1>
            <div className="h-1 w-12 bg-linear-to-r from-transparent via-yellow-500 to-transparent mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                        <User size={18} />
                    </div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all shadow-inner"
                        placeholder="กรอกชื่อผู้ใช้งาน"
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                        <Lock size={18} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all shadow-inner"
                        placeholder="กรอกรหัสผ่าน"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-black uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 relative overflow-hidden group/btn"
                style={{ 
                    background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)',
                }}
            >
                <div className="absolute inset-0 bg-white/20 group-hover/btn:translate-x-full transition-transform duration-500 ease-in-out skew-x-12 -ml-20 w-1/2 h-full"></div>
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'LOGIN ACCESS'}
            </button>
        </form>

        <div className="mt-8 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 text-[10px] text-white uppercase tracking-widest">
                <ShieldCheck size={12} className="text-yellow-500" />
                <span>SECURE CONNECTION SYSTEM</span>
            </div>
        </div>
      </div>
    </div>
  );
}