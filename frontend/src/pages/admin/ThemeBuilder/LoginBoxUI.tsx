import { User, Lock } from 'lucide-react';

export default function LoginBoxUI({ shopData }: { shopData: any }) {
    const config = shopData.login_config;
    const brand = shopData.brand_config || {};

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 relative z-10 pointer-events-none select-none">
            <div className="flex flex-col items-center mb-8 relative z-10">
                {/* จัดการโลโก้ */}
                {brand.logo_type === 'emoji' ? (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center mb-6 relative group">
                        <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl transition-all"></div>
                        <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] relative z-10">
                            {brand.logo_emoji || '👑'}
                        </span>
                    </div>
                ) : shopData.logo_url ? (
                    <img src={shopData.logo_url} alt="Shop Logo" className="relative w-20 h-20 md:w-24 md:h-24 object-contain mb-4 drop-shadow-2xl" />
                ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-inner flex items-center justify-center mb-6">
                        <span className="text-yellow-500 text-3xl font-black">L</span>
                    </div>
                )}

                {/* จัดการชื่อร้านด้วยฟอนต์และสีที่เลือก */}
                <h1 
                    className="text-2xl md:text-4xl font-black tracking-tighter text-center uppercase drop-shadow-md"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, ${brand.name_color_from || '#f3f4f6'}, ${brand.name_color_to || '#ca8a04'})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        // 🔴 ใช้ฟอนต์ที่ผู้ใช้เลือก
                        fontFamily: brand.font_family || 'sans-serif' 
                    }}
                >
                    {shopData.name}
                </h1>
                <div 
                    className="h-1 w-12 mt-2 rounded-full" 
                    style={{ backgroundImage: `linear-gradient(to right, transparent, ${brand.name_color_to || '#ca8a04'}, transparent)` }}
                ></div>
            </div>

            {/* ส่วน Input ฟอร์ม (แสดงเป็นตัวอย่าง) */}
            <div className="space-y-4 md:space-y-5 w-full relative z-10 px-2 md:px-0">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><User size={18} /></div>
                    <div className="w-full h-11 md:h-[52px] bg-black/40 border border-white/10 rounded-xl flex items-center px-11 shadow-inner backdrop-blur-md">
                        <span className="text-gray-500 text-sm">กรอกชื่อผู้ใช้งาน</span>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><Lock size={18} /></div>
                    <div className="w-full h-11 md:h-[52px] bg-black/40 border border-white/10 rounded-xl flex items-center px-11 shadow-inner backdrop-blur-md">
                        <span className="text-gray-500 text-sm">กรอกรหัสผ่าน</span>
                    </div>
                </div>
                <div className="w-full py-3.5 md:py-4 rounded-xl text-sm md:text-base font-bold text-black uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center mt-4" style={{ background: `linear-gradient(135deg, ${config.name_color_to || '#b8860b'} 0%, #ffd700 50%, ${config.name_color_to || '#b8860b'} 100%)` }}>
                    LOGIN ACCESS
                </div>
            </div>
        </div>
    );
}