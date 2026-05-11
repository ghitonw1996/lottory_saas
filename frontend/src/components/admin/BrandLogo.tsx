// src/components/BrandLogo.tsx

interface BrandConfig {
    logo_type?: 'image' | 'emoji';
    logo_emoji?: string;
    name_color_from?: string;
    name_color_to?: string;
    font_family?: string;
    text_shadow?: string; 
    text_stroke?: string;
}

interface BrandLogoProps {
    name: string;
    logoUrl?: string;
    brandConfig?: BrandConfig;
    className?: string;     
    overrideName?: string;  
}

export default function BrandLogo({ 
    name, 
    logoUrl, 
    brandConfig, 
    className = "flex flex-col items-center", 
    overrideName 
}: BrandLogoProps) {
    
    // ตั้งค่า Default กันพัง
    const config = brandConfig || {};
    const displayName = overrideName || name || 'Thailot';

    return (
        <div className={`relative z-10 ${className}`}>
            
            {/* 🟢 ส่วน Logo (อีโมจิ หรือ รูปภาพ) */}
            {config.logo_type === 'emoji' ? (
                <div className="relative mb-6 flex justify-center items-center group">
                    <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full group-hover:bg-yellow-500/30 transition duration-700"></div>
                    <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.2)]">
                        <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] relative z-10">
                            {config.logo_emoji || '👑'}
                        </span>
                    </div>
                </div>
            ) : logoUrl ? (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img src={logoUrl} alt="Shop Logo" className="relative w-20 h-20 md:w-24 md:h-24 object-contain mb-4 drop-shadow-2xl" />
                </div>
            ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-yellow-500/30 bg-black/50 shadow-inner flex items-center justify-center mb-6">
                    <span className="text-yellow-500 text-3xl font-black">L</span>
                </div>
            )}

            {/* 🟢 ส่วนชื่อร้าน (ฟอนต์, สี Gradient, และ เงา 3D) */}
            <h1 
                className="text-2xl md:text-4xl font-black tracking-tighter text-center uppercase"
                style={{
                    fontFamily: config.font_family || 'sans-serif',
                    backgroundImage: `linear-gradient(to bottom, ${config.name_color_from || '#f3f4f6'}, ${config.name_color_to || '#ca8a04'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: config.text_shadow ? `drop-shadow(${config.text_shadow})` : 'drop-shadow(0px 4px 10px rgba(0,0,0,0.4))',
                    WebkitTextStroke: config.text_stroke || 'none',
                }}
            >
                {displayName}
            </h1>
            
            {/* เส้นขีดใต้ชื่อร้าน ปรับสีตามสี To ของแบรนด์ และเพิ่มเงาเรืองแสง */}
            <div 
                className="h-1 w-12 mt-2 rounded-full shadow-lg"
                style={{
                    backgroundImage: `linear-gradient(to right, transparent, ${config.name_color_to || '#ca8a04'}, transparent)`,
                    boxShadow: config.text_shadow ? `0 0 10px ${config.name_color_to}` : 'none'
                }}
            ></div>
        </div>
    );
}