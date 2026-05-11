import { useEffect, useState } from 'react';
import client from '../../api/client';
import { 
    Settings, Loader2, CheckCircle2, 
    Image as ImageIcon, X, Palette, MessageCircle, Store, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const brandPresets = [
    { 
        id: 'luxury-gold', name: 'Luxury Gold', 
        font: "'Prompt', sans-serif", from: '#bf953f', to: '#fcf6ba', 
        shadow: '0px 2px 4px rgba(0,0,0,0.5)', stroke: '0.5px #8a6d3b' 
    },
    { 
        id: 'cyber-neon', name: 'Cyber Neon', 
        font: "'Kanit', sans-serif", from: '#00f2fe', to: '#4facfe', 
        shadow: '0px 0px 15px #4facfe', stroke: 'none' 
    },
    { 
        id: 'vintage-thai', name: 'Siam Heritage', 
        font: "'Chonburi', cursive", from: '#8e2de2', to: '#4a00e0', 
        shadow: '2px 2px 0px #ffffff', stroke: '1px #ffffff' 
    },
    { 
        id: 'midnight-glass', name: 'Midnight', 
        font: "'Prompt', sans-serif", from: '#232526', to: '#414345', 
        shadow: '0px 5px 15px rgba(0,0,0,1)', stroke: '0.5px rgba(255,255,255,0.2)' 
    },
    // คุณสามารถก๊อปปี้สไตล์ใหม่ๆ มาวางเพิ่มตรงนี้ได้ทันที
];

export default function GlobalSettings() {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    
    const [globalData, setGlobalData] = useState({
        name: '',
        logo_url: '',
        theme_color: '#ffd700',
        line_channel_token: '',
        line_target_id: '',
        line_id: '',
        brand_config: {
            font_family: "'Prompt', sans-serif",
            name_color_from: "#FFF7CC",
            name_color_to: "#D4AF37",
            text_shadow: "0px 2px 1px #996515, 0px 10px 15px rgba(0,0,0,0.5)",
            text_stroke: 'none',
            logo_type: "image",
            logo_emoji: "👑"
        }
    });

    useEffect(() => {
        fetchShopData();
    }, []);

    const fetchShopData = async () => {
        setLoading(true);
        try {
            const res = await client.get('/shops/');
            if (res.data && res.data.length > 0) {
                const shop = res.data[0];
                setGlobalData({
                    name: shop.name || '',
                    logo_url: shop.logo_url || '',
                    theme_color: shop.theme_color || '#ffd700',
                    line_channel_token: shop.line_channel_token || '',
                    line_target_id: shop.line_target_id || '',
                    line_id: shop.line_id || '',
                    brand_config: {
                        font_family: shop.brand_config?.font_family || "'Prompt', sans-serif",
                        name_color_from: shop.brand_config?.name_color_from || "#FFF7CC",
                        name_color_to: shop.brand_config?.name_color_to || "#D4AF37",
                        text_shadow: shop.brand_config?.text_shadow || "0px 2px 1px #996515, 0px 10px 15px rgba(0,0,0,0.5)",
                        text_stroke: shop.brand_config?.text_stroke || 'none',
                        logo_type: shop.brand_config?.logo_type || "image",
                        logo_emoji: shop.brand_config?.logo_emoji || "👑"
                    }
                });
            }
        } catch (err) {
            toast.error('โหลดข้อมูลการตั้งค่าไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'theme');

        try {
            const res = await client.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setGlobalData(prev => ({ ...prev, logo_url: res.data.url }));
            toast.success('อัปโหลดโลโก้สำเร็จ');
        } catch (err) {
            toast.error('อัปโหลดล้มเหลว');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await client.put('/shops/config', globalData);
            toast.success('บันทึกการตั้งค่าทั่วไปสำเร็จ');
        } catch (err: any) {
            toast.error('บันทึกไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
            <p className="animate-pulse font-medium">กำลังโหลดข้อมูลระบบ...</p>
        </div>
    );

    return (
        <div className="pb-20 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Global Settings</h1>
                        <p className="text-slate-500 text-sm">ตั้งค่าระบบและแบรนด์</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={submitting} 
                    className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} บันทึกการตั้งค่า
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. ข้อมูลร้านค้าและอัตลักษณ์แบรนด์ */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                        <Store size={20} className="text-blue-500" /> ข้อมูลและอัตลักษณ์แบรนด์
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* ชื่อร้าน */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ชื่อร้าน (Brand Name)</label>
                            <input 
                                type="text" 
                                value={globalData.name} 
                                onChange={e => setGlobalData({...globalData, name: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-bold"
                                placeholder="เช่น Thailot System"
                            />
                        </div>

                        {/* 🟢 ส่วนสไตล์สำเร็จรูป (รวม 3D และ Neon) */}
                        <div className="space-y-3 md:col-span-2 mt-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-yellow-500"/> รูปแบบชื่อแบรนด์ (Brand Text Style)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {brandPresets.map(preset => {
                                    // เช็คว่าสไตล์ปัจจุบันตรงกับปุ่มไหน
                                    const isActive = globalData.brand_config.name_color_from === preset.from && globalData.brand_config.font_family === preset.font;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            // 🔴 เซ็ตค่า shadow เข้าไปด้วยตอนกดเลือก
                                            onClick={() => setGlobalData({
                                                ...globalData, 
                                                brand_config: {
                                                    ...globalData.brand_config, 
                                                    font_family: preset.font, 
                                                    name_color_from: preset.from, 
                                                    name_color_to: preset.to,
                                                    text_shadow: preset.shadow
                                                }
                                            })}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden relative group ${
                                                isActive
                                                    ? 'border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10'
                                                    : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="bg-slate-900 w-full py-3 rounded-xl flex items-center justify-center shadow-inner">
                                                <span
                                                    className="text-xl md:text-2xl font-black uppercase tracking-tighter"
                                                    style={{
                                                        fontFamily: preset.font,
                                                        backgroundImage: `linear-gradient(to bottom, ${preset.from}, ${preset.to})`,
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        filter: `drop-shadow(${preset.shadow})` // พรีวิวสไตล์สมจริง
                                                    }}
                                                >
                                                    {globalData.name ? globalData.name.substring(0, 8) : 'LOTTO'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{preset.name}</span>
                                                {isActive && <CheckCircle2 size={14} className="text-blue-500" />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette size={14}/> สีธีมหลักของเว็บ (Primary App Color)
                            </label>
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 max-w-sm">
                                <input 
                                    type="color" 
                                    value={globalData.theme_color} 
                                    onChange={e => setGlobalData({...globalData, theme_color: e.target.value})}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                />
                                <input 
                                    type="text" 
                                    value={globalData.theme_color}
                                    onChange={e => setGlobalData({...globalData, theme_color: e.target.value})}
                                    className="flex-1 bg-transparent border-none outline-none font-mono uppercase text-slate-600 font-bold"
                                />
                            </div>
                        </div>

                        {/* โลโก้ */}
                        <div className="space-y-2 md:col-span-2 mt-2 pt-6 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                <span>โลโก้ร้าน (Logo)</span>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button type="button" onClick={() => setGlobalData({...globalData, brand_config: {...globalData.brand_config, logo_type: 'image'}})} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${globalData.brand_config.logo_type !== 'emoji' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>รูปภาพ</button>
                                    <button type="button" onClick={() => setGlobalData({...globalData, brand_config: {...globalData.brand_config, logo_type: 'emoji'}})} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${globalData.brand_config.logo_type === 'emoji' ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-500'}`}>อีโมจิเรืองแสง</button>
                                </div>
                            </label>

                            {globalData.brand_config.logo_type === 'emoji' ? (
                                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center">
                                    <input type="text" maxLength={2} value={globalData.brand_config.logo_emoji} onChange={e => setGlobalData({...globalData, brand_config: {...globalData.brand_config, logo_emoji: e.target.value}})} className="w-24 h-24 text-5xl text-center bg-white border border-yellow-200 rounded-full shadow-inner outline-none focus:ring-4 focus:ring-yellow-400/30" />
                                    <p className="text-xs text-yellow-600 mt-3 font-medium">พิมพ์อีโมจิที่ต้องการ 1 ตัว</p>
                                </div>
                            ) : (
                                <div className="relative group w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-300 transition-colors">
                                    {globalData.logo_url ? (
                                        <>
                                            <img src={globalData.logo_url} className="w-full h-full object-contain p-4" alt="Logo" />
                                            <button type="button" onClick={() => setGlobalData({...globalData, logo_url: ''})} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            {uploadingLogo ? <Loader2 className="animate-spin text-blue-500 mx-auto" /> : <ImageIcon className="text-slate-300 mx-auto" size={32} />}
                                            <p className="text-xs text-slate-400 font-bold uppercase mt-2">อัปโหลดรูป</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. การเชื่อมต่อ API & LINE */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                        <MessageCircle size={20} className="text-green-500" /> การเชื่อมต่อ LINE (LINE OA Integration)
                    </h3>
                    
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">LINE Channel Token</label>
                            <textarea 
                                rows={3}
                                value={globalData.line_channel_token} 
                                onChange={e => setGlobalData({...globalData, line_channel_token: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">LINE Target ID (กลุ่มเป้าหมาย)</label>
                            <input 
                                type="text" 
                                value={globalData.line_target_id} 
                                onChange={e => setGlobalData({...globalData, line_target_id: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                ไอดีไลน์สำหรับติดต่อ
                            </label>
                            <p className="text-[14px] text-slate-500 mb-2">ใส่ ID (มี @) หรือลิงก์ (https://lin.ee/...) เพื่อให้ผู้เล่นกดติดต่อจากหน้า Login</p>
                            <input 
                                type="text" 
                                value={globalData.line_id} 
                                onChange={e => setGlobalData({...globalData, line_id: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                placeholder="เช่น @thailotto หรือลิงก์สั้น"
                            />
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}