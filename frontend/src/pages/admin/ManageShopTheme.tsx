import { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import client from '../../api/client';
import { 
    Palette, Loader2, Globe, 
    Image as ImageIcon, CheckCircle2,
    Move, Maximize, MousePointer2, Upload, X, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageShopTheme() {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);

    const previewRef = useRef<HTMLDivElement>(null);
    const draggableNodeRef = useRef<HTMLDivElement>(null);

    // State สำหรับควบคุมตำแหน่งกล่องให้ลื่นไหล (คำนวณจากมุมซ้ายบน)
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [shopData, setShopData] = useState({
        logo_url: '',
        theme_color: '#2563EB',
        line_channel_token: '',
        line_target_id: '',
        login_config: {
            background_url: '',
            background_overlay: 0.3,
            box_position: { x: 50, y: 50 },
            box_style: { 
                is_glassmorphism: true, 
                border_color: '#ffd700',
                border_width: 2 
            },
            logo_size: 120,
            font_family: 'Kanit'
        }
    });

    const fetchShopConfig = async () => {
        setLoading(true);
        try {
            const res = await client.get('/shops/');
            if (res.data && res.data.length > 0) {
                const myShop = res.data[0];
                setShopData({
                    logo_url: myShop.logo_url || '',
                    theme_color: myShop.theme_color || '#2563EB',
                    line_channel_token: myShop.line_channel_token || '',
                    line_target_id: myShop.line_target_id || '',
                    login_config: myShop.login_config || shopData.login_config
                });
            }
        } catch (err) {
            toast.error('โหลดข้อมูลร้านไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopConfig();
    }, []);

    // 🟢 แปลงค่าพิกัด Database (Center) -> ให้ Draggable (Top-Left) ตอนโหลดเสร็จ
    useEffect(() => {
        const timer = setTimeout(() => {
            if (previewRef.current && draggableNodeRef.current && !loading) {
                const containerW = previewRef.current.offsetWidth;
                const containerH = previewRef.current.offsetHeight;
                const boxW = draggableNodeRef.current.offsetWidth;
                const boxH = draggableNodeRef.current.offsetHeight;

                // หาจุดกึ่งกลางเป็น Pixel
                const centerX = (shopData.login_config.box_position.x * containerW) / 100;
                const centerY = (shopData.login_config.box_position.y * containerH) / 100;

                // เซ็ตค่าให้ Draggable ดึงจากมุมซ้ายบน
                setDragPos({
                    x: centerX - (boxW / 2),
                    y: centerY - (boxH / 2)
                });
            }
        }, 200); // ดีเลย์เล็กน้อยรอให้ DOM เรนเดอร์กล่องเสร็จ
        return () => clearTimeout(timer);
    }, [loading]);

    const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
        const isLogo = type === 'logo';
        isLogo ? setUploadingLogo(true) : setUploadingBg(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'theme');

        try {
            const res = await client.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const imageUrl = res.data.url;
            
            if (isLogo) {
                setShopData(prev => ({ ...prev, logo_url: imageUrl }));
                toast.success('อัปโหลดโลโก้สำเร็จ');
            } else {
                setShopData(prev => ({
                    ...prev,
                    login_config: { ...prev.login_config, background_url: imageUrl }
                }));
                toast.success('อัปโหลดพื้นหลังสำเร็จ');
            }
        } catch (err) {
            toast.error('อัปโหลดรูปภาพไม่สำเร็จ');
        } finally {
            isLogo ? setUploadingLogo(false) : setUploadingBg(false);
        }
    };

    // 🟢 ขยับแบบ 60FPS โดยไม่สะดุด
    const handleDrag = (_e: any, data: any) => {
        setDragPos({ x: data.x, y: data.y });
    };

    // 🟢 แปลงค่า Draggable (Top-Left) -> กลับไปบันทึกลง Database (Center)
    const handleDragStop = (_e: any, data: any) => {
        if (!previewRef.current || !draggableNodeRef.current) return;
        const containerW = previewRef.current.offsetWidth;
        const containerH = previewRef.current.offsetHeight;
        const boxW = draggableNodeRef.current.offsetWidth;
        const boxH = draggableNodeRef.current.offsetHeight;

        // คำนวณกลับเป็นจุดกึ่งกลาง
        const centerX = data.x + (boxW / 2);
        const centerY = data.y + (boxH / 2);

        // แปลงเป็นเปอร์เซ็นต์
        const xPercent = Math.round((centerX / containerW) * 100);
        const yPercent = Math.round((centerY / containerH) * 100);

        setShopData(prev => ({
            ...prev,
            login_config: { ...prev.login_config, box_position: { x: xPercent, y: yPercent } }
        }));
    };

    const handleSaveShop = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await client.put('/shops/config', shopData);
            toast.success('บันทึกข้อมูลร้านค้าเรียบร้อย');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'บันทึกไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
            <p className="animate-pulse font-medium">กำลังเตรียมสตูดิโอออกแบบของคุณ...</p>
        </div>
    );

    return (
        <div className="pb-20 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            
            {/* Header Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Palette size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Design Studio</h1>
                        <p className="text-slate-500 text-sm">ปรับแต่งอัตลักษณ์และหน้าแรกของร้านค้าคุณ</p>
                    </div>
                </div>
                <button 
                    onClick={handleSaveShop}
                    disabled={submitting}
                    className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    บันทึกการเปลี่ยนแปลง
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Controls */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Brand Identity */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                            <Globe size={18} className="text-blue-500" /> อัตลักษณ์แบรนด์
                        </h3>
                        
                        {/* Logo Upload Area */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">โลโก้ร้าน (Shop Logo)</label>
                            <div className="relative group">
                                <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
                                    {shopData.logo_url ? (
                                        <>
                                            <img src={shopData.logo_url} className="w-full h-full object-contain p-4" alt="Preview" />
                                            <button 
                                                onClick={() => setShopData({...shopData, logo_url: ''})}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center space-y-2">
                                            {uploadingLogo ? <Loader2 className="animate-spin text-blue-500 mx-auto" /> : <Upload className="text-slate-300 mx-auto" size={28} />}
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">คลิกเพื่ออัปโหลด</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Theme Color */}
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">สีหลัก (Theme Color)</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <input 
                                    type="color" value={shopData.theme_color} 
                                    onChange={e => setShopData({...shopData, theme_color: e.target.value})}
                                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                                />
                                <input 
                                    type="text" value={shopData.theme_color}
                                    onChange={e => setShopData({...shopData, theme_color: e.target.value})}
                                    className="flex-1 bg-transparent border-none outline-none font-mono text-sm uppercase text-slate-600"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Login Settings */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                            <Maximize size={18} className="text-purple-500" /> หน้า Login
                        </h3>

                        {/* Background Upload */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">พื้นหลัง (Login Background)</label>
                            <div className="relative group h-40 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200">
                                {shopData.login_config.background_url ? (
                                    <img src={shopData.login_config.background_url} className="w-full h-full object-cover opacity-60" alt="BG Preview" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-2">
                                        <ImageIcon size={32} className="opacity-20" />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">ยังไม่ได้เลือกพื้นหลัง</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                    {uploadingBg ? (
                                        <Loader2 className="animate-spin text-white" size={24} />
                                    ) : (
                                        <Camera className="text-white" size={24} />
                                    )}
                                    <span className="text-white text-[10px] font-bold">เปลี่ยนรูปภาพ</span>
                                    <input 
                                        type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Overlay Control */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-xs font-black text-slate-400 uppercase">ความมืดพื้นหลัง</label>
                                <span className="text-xs font-bold text-purple-600">{Math.round(shopData.login_config.background_overlay * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.05"
                                value={shopData.login_config.background_overlay}
                                onChange={(e) => setShopData({
                                    ...shopData, 
                                    login_config: {...shopData.login_config, background_overlay: parseFloat(e.target.value)}
                                })}
                                className="w-full accent-purple-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Glassmorphism Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${shopData.login_config.box_style.is_glassmorphism ? 'bg-green-500' : 'bg-slate-300'}`} />
                                <span className="text-sm font-bold text-slate-700">เอฟเฟกต์กระจก (Glass)</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={shopData.login_config.box_style.is_glassmorphism}
                                onChange={(e) => setShopData({
                                    ...shopData,
                                    login_config: {
                                        ...shopData.login_config,
                                        box_style: { ...shopData.login_config.box_style, is_glassmorphism: e.target.checked }
                                    }
                                })}
                                className="w-5 h-5 accent-indigo-600 cursor-pointer"
                            />
                        </div>

                    </section>
                </div>

                {/* Right Preview Builder */}
                <div className="lg:col-span-2">
                    {/* แก้ไข Class ตามข้อแนะนำ Tailwind */}
                    <div className="bg-slate-900 rounded-[2.5rem] border-12 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-175 relative">
                        {/* Simulator Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md z-20">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <span className="text-[10px] font-bold text-white/40 uppercase ml-2 tracking-widest">Login Live Preview</span>
                            </div>
                            <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                                <span className="text-[10px] font-mono text-blue-400">X: {shopData.login_config.box_position.x}% Y: {shopData.login_config.box_position.y}%</span>
                            </div>
                        </div>

                        {/* Simulation Canvas - เพิ่ม aspect-video เพื่อให้สัดส่วนจอเหมือนจริง */}
                        <div 
                            ref={previewRef}
                            className="relative flex-1 w-full aspect-video bg-slate-950 bg-cover bg-center transition-all duration-700"
                            style={{ backgroundImage: `url(${shopData.login_config.background_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'})` }}
                        >
                            {/* Dynamic Dark Overlay */}
                            <div 
                                className="absolute inset-0 pointer-events-none transition-all duration-500"
                                style={{ backgroundColor: `rgba(0,0,0, ${shopData.login_config.background_overlay})` }}
                            />

                            {/* Draggable Login Container */}
                            <Draggable 
                                nodeRef={draggableNodeRef}
                                bounds="parent"
                                position={dragPos}
                                onDrag={handleDrag}
                                onStop={handleDragStop}
                            >
                                {/* 🟢 ลบ position: absolute และ translate จาก Style เพื่อให้ Draggable ทำงาน 100% */}
                                <div 
                                    ref={draggableNodeRef}
                                    className={`absolute z-10 p-8 w-64 cursor-move select-none transition-shadow
                                        ${shopData.login_config.box_style.is_glassmorphism 
                                            ? 'bg-white/10 backdrop-blur-2xl border-white/20' 
                                            : 'bg-slate-900 border-slate-700'} 
                                        border shadow-2xl rounded-4xl flex flex-col items-center space-y-5`}
                                >
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                        <Move size={24} className="text-white/20 animate-pulse" />
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <div className="h-1.5 w-1/2 bg-white/20 rounded-full mx-auto" />
                                        <div className="h-8 w-full bg-blue-500/40 rounded-xl" />
                                        <div className="h-8 w-full bg-slate-700/50 rounded-xl" />
                                    </div>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Drag to Position</p>
                                </div>
                            </Draggable>

                            {/* Helper Tip */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md border border-white/10 text-white/60 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                                <MousePointer2 size={12} className="text-blue-400" /> ลากกล่องเพื่อจัดวางตำแหน่งหน้าจริง
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}