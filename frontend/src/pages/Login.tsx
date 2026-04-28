import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { loginApi, registerApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    Loader2, User, Lock, Eye, EyeOff, ShieldCheck, Crown, UserPlus, MessageCircle
} from 'lucide-react';

export default function Login() {
    const { shop } = useShop(); 
    
    // ตั้งค่า Default กรณี Database ส่งค่ามาไม่ครบ
    const config = shop?.login_config || {};
    const position = config.box_position || { x: 50, y: 50 };
    const style = config.box_style || {};

    const { login } = useAuth();
    const navigate = useNavigate();

    // States
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ----------------------------------------------------
    // 1. รับ Token จาก URL (Impersonate / Auto Login) 
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
                    setTimeout(() => navigate('/', { replace: true }), 100);
                } catch (err: any) {
                    toast.error(err.response?.data?.detail || 'Token ไม่ถูกต้อง หรือ หมดอายุ');
                    localStorage.removeItem('token');
                }
            };
            autoLogin();
        }
    }, [login, navigate]);

    // ----------------------------------------------------
    // 2. Login
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
            const msg = err.response?.data?.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------
    // 3. Register
    // ----------------------------------------------------
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !password || !confirmPassword) return toast.error('กรุณากรอกข้อมูลให้ครบ');
        if (password !== confirmPassword) return toast.error('รหัสผ่านไม่ตรงกัน');
        if (!shop?.id) return toast.error('ไม่พบข้อมูลร้านค้า (Shop ID)');

        setIsLoading(true);
        try {
            await registerApi({
                username: username,
                password: password,
                shop_id: shop.id
            });
            
            toast.success('สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...');

            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            const res = await loginApi(formData as any); 
            await login(res.access_token);
            
            navigate('/');
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'การสมัครสมาชิกผิดพลาด';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-dvh w-dvw overflow-y-auto flex items-center justify-center overflow-hidden bg-slate-950 transition-all duration-700 bg-cover bg-center bg-no-repeat"
            style={{ 
                backgroundImage: config.background_url ? `url(${config.background_url})` : 'none',
            }}
        >
            <div 
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500"
                style={{ backgroundColor: `rgba(0, 0, 0, ${config.background_overlay ?? 0.3})` }}
            />
            
            {/* 🟢 กล่อง Login รับค่า CSS จาก Settings ทั้งหมดแบบ 1:1 */}
            <div 
                className="relative z-10 p-6 sm:p-8 transition-all duration-500 flex flex-col justify-center overflow-hidden"
                style={{ 
                    position: 'absolute',
                    left: `${position.x ?? 50}%`,
                    top: `${position.y ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                    
                    // 🟢 ใช้ clamp ป้องกันกล่องเล็กเกินไปในมือถือ แม้แอดมินจะตั้งไว้ 20% ก็ตาม
                    width: `clamp(340px, ${style.width ?? 40}%, 95vw)`,
                    minHeight: `clamp(400px, ${style.height ?? 50}%, 90vh)`,
                    
                    borderRadius: `${style.border_radius ?? 24}px`,
                    borderStyle: 'solid',
                    borderWidth: `${style.border_width ?? 2}px`,
                    borderColor: style.border_color ?? '#ffd700',
                    boxShadow: `${style.shadow_x ?? 0}px ${style.shadow_y ?? 20}px ${style.shadow_blur ?? 50}px ${style.shadow_color ?? 'rgba(0,0,0,0.5)'}`,
                    
                    backgroundColor: style.is_glassmorphism 
                        ? `rgba(255, 255, 255, ${style.box_bg_opacity ?? 0.1})` 
                        : (style.box_background_url ? 'transparent' : '#0f172a'),
                    backgroundImage: style.box_background_url ? `url(${style.box_background_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    
                    backdropFilter: style.is_glassmorphism ? `blur(${style.box_bg_blur ?? 20}px)` : 'none',
                    WebkitBackdropFilter: style.is_glassmorphism ? `blur(${style.box_bg_blur ?? 20}px)` : 'none',
                    margin: 0 
                }}
            >
                <div className="flex flex-col items-center mb-8 relative z-10">
                    {/* ส่วน Logo & Crown */}
                    {shop?.logo_url ? (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-r from-yellow-600 to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <img src={shop.logo_url} alt="Shop Logo" className="relative w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
                        </div>
                    ) : (
                        <div className="relative mb-6 flex justify-center items-center group">
                            <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full group-hover:bg-yellow-500/30 transition duration-700"></div>
                            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.2)]">
                                <Crown className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" strokeWidth={1.5} />
                            </div>
                        </div>
                    )}

                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-b from-gray-200 to-yellow-600 tracking-tighter text-center uppercase drop-shadow-md">
                        {isRegister ? 'REGISTER' : (shop?.name || 'Thailot')}
                    </h1>
                    <div className="h-1 w-12 bg-linear-to-r from-transparent via-yellow-500 to-transparent mt-2 rounded-full"></div>
                </div>

                <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5 relative z-10">
                    {/* Username Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1 drop-shadow-sm">
                            {isRegister ? 'Phone Number / Username' : 'Username'}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50 transition-all shadow-inner backdrop-blur-md"
                                placeholder={isRegister ? "เบอร์โทรศัพท์ของคุณ" : "กรอกชื่อผู้ใช้งาน"}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1 drop-shadow-sm">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50 transition-all shadow-inner backdrop-blur-md"
                                placeholder="กรอกรหัสผ่าน"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    {isRegister && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest ml-1 drop-shadow-sm">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-yellow-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50 transition-all shadow-inner backdrop-blur-md"
                                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-bold text-black uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 relative overflow-hidden group/btn"
                        style={{ background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)' }}
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover/btn:translate-x-full transition-transform duration-500 ease-in-out skew-x-12 -ml-20 w-1/2 h-full"></div>
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isRegister ? 'CREATE ACCOUNT' : 'LOGIN ACCESS')}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-4 relative z-10">
                    <button 
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setUsername('');
                            setPassword('');
                            setConfirmPassword('');
                        }}
                        className="text-sm text-gray-300 hover:text-yellow-400 transition-colors flex items-center gap-2 drop-shadow-md"
                    >
                        {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
                    </button>

                    {shop?.line_id && (
                        <a 
                            href={
                                shop.line_id.startsWith('http') 
                                    ? shop.line_id 
                                    : shop.line_id.startsWith('@') 
                                        ? `https://line.me/R/ti/p/${shop.line_id}`
                                        : `https://line.me/ti/p/~${shop.line_id}`
                            } 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors bg-green-900/40 px-5 py-2.5 rounded-full border border-green-500/30 backdrop-blur-md shadow-lg"
                        >
                            <MessageCircle size={14} /> ติดต่อแอดมิน
                        </a>
                    )}
                </div>

                <div className="mt-6 flex justify-center opacity-40 hover:opacity-100 transition-opacity relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] text-white uppercase tracking-widest drop-shadow-md">
                        <ShieldCheck size={12} className="text-yellow-500" />
                        <span>SECURE CONNECTION SYSTEM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}