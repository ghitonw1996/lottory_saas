import { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import client from '../../api/client';
import { 
    Palette, Loader2,
    Image as ImageIcon, CheckCircle2,
    Move, Maximize, MousePointer2, Upload, X, Camera,
    ChevronUp, ChevronDown, Square, Layers, Droplets
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageShopTheme() {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // States สำหรับ Loading รูปภาพ
    const [uploadingBg, setUploadingBg] = useState(false);
    const [uploadingBoxBg, setUploadingBoxBg] = useState(false);

    // State สำหรับ Accordion Menu
    const [openSection, setOpenSection] = useState<string>('bg');

    const previewRef = useRef<HTMLDivElement>(null);
    const draggableNodeRef = useRef<HTMLDivElement>(null);

    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [shopData, setShopData] = useState({
        login_config: {
            background_url: '',
            background_overlay: 0.3,
            box_position: { x: 50, y: 50 },
            box_style: { 
                is_glassmorphism: true, 
                border_color: '#ffd700',
                border_width: 2,
                width: 40,        // ใช้เป็น %
                height: 50,       // ใช้เป็น %
                border_radius: 24,
                shadow_x: 0,
                shadow_y: 20,
                shadow_blur: 50,
                shadow_color: '#00000080',
                box_bg_opacity: 0.1,
                box_bg_blur: 20,
                box_background_url: ''
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
                if (myShop.login_config) {
                    setShopData(prev => ({
                        login_config: {
                            ...prev.login_config,
                            ...myShop.login_config,
                            box_style: {
                                ...prev.login_config.box_style,
                                ...(myShop.login_config.box_style || {})
                            },
                            box_position: {
                                ...prev.login_config.box_position,
                                ...(myShop.login_config.box_position || {})
                            }
                        }
                    }));
                }
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

    // 🟢 แปลงค่าพิกัด Database (Center) -> ให้ Draggable (Top-Left) โดยรองรับ %
    useEffect(() => {
        const timer = setTimeout(() => {
            if (previewRef.current && !loading) {
                const containerW = previewRef.current.offsetWidth;
                const containerH = previewRef.current.offsetHeight;
                
                // ดึงขนาด % จาก State มาแปลงเป็น Pixel เพื่อให้ Drag คำนวณได้ถูก
                const styleW = shopData.login_config.box_style.width ?? 40;
                const styleH = shopData.login_config.box_style.height ?? 50;
                const boxW = (styleW / 100) * containerW;
                const boxH = (styleH / 100) * containerH;

                // หาจุดกึ่งกลางเป็น Pixel
                const centerX = (shopData.login_config.box_position.x * containerW) / 100;
                const centerY = (shopData.login_config.box_position.y * containerH) / 100;

                setDragPos({
                    x: centerX - (boxW / 2),
                    y: centerY - (boxH / 2)
                });
            }
        }, 50); 
        return () => clearTimeout(timer);
    }, [
        loading, 
        shopData.login_config.box_style.width, 
        shopData.login_config.box_style.height,
        shopData.login_config.box_position.x,
        shopData.login_config.box_position.y
    ]);

    // 🟢 ฟังก์ชันอัปโหลด รองรับทั้งรูปพื้นหลังหลัก และ พื้นหลังกล่อง
    const handleFileUpload = async (file: File, type: 'background' | 'box_bg') => {
        if (type === 'background') setUploadingBg(true);
        else setUploadingBoxBg(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'theme');

        try {
            const res = await client.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const imageUrl = res.data.url;
            
            setShopData(prev => {
                const next = { ...prev };
                if (type === 'background') {
                    next.login_config.background_url = imageUrl;
                } else {
                    next.login_config.box_style.box_background_url = imageUrl;
                }
                return next;
            });
            
            toast.success('อัปโหลดรูปภาพสำเร็จ');
        } catch (err) {
            toast.error('อัปโหลดรูปภาพไม่สำเร็จ');
        } finally {
            if (type === 'background') setUploadingBg(false);
            else setUploadingBoxBg(false);
        }
    };

    const handleDrag = (_e: any, data: any) => {
        setDragPos({ x: data.x, y: data.y });
    };

    const handleDragStop = (_e: any, data: any) => {
        if (!previewRef.current || !draggableNodeRef.current) return;
        const containerW = previewRef.current.offsetWidth;
        const containerH = previewRef.current.offsetHeight;
        const boxW = draggableNodeRef.current.offsetWidth;
        const boxH = draggableNodeRef.current.offsetHeight;

        const centerX = data.x + (boxW / 2);
        const centerY = data.y + (boxH / 2);

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

    // --- Helper Functions ---
    const toggleSection = (section: string) => {
        setOpenSection(prev => prev === section ? '' : section);
    };

    const updateBoxStyle = (key: string, value: any) => {
        setShopData(prev => ({
            ...prev,
            login_config: {
                ...prev.login_config,
                box_style: { ...prev.login_config.box_style, [key]: value }
            }
        }));
    };

    const updateBoxPosition = (key: string, value: any) => {
        setShopData(prev => ({
            ...prev,
            login_config: {
                ...prev.login_config,
                box_position: { ...prev.login_config.box_position, [key]: value }
            }
        }));
    };

    // ตัวแปรสั้นๆ สำหรับใช้ใน JSX
    const style = shopData.login_config.box_style;
    const position = shopData.login_config.box_position;

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
            <p className="animate-pulse font-medium">กำลังเตรียมสตูดิโอออกแบบของคุณ...</p>
        </div>
    );

    return (
        <div className="pb-20 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 🟢 Left Controls (Accordion) */}
                <div className="lg:col-span-4 space-y-4">
                    
                    {/* 1. Page Background */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <button onClick={() => toggleSection('bg')} className="flex items-center justify-between w-full mb-2 outline-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ImageIcon size={18} className="text-indigo-500" /> พื้นหลังหน้าเว็บ
                            </h3>
                            {openSection === 'bg' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        
                        {openSection === 'bg' && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="relative h-32 bg-slate-900 rounded-xl overflow-hidden border">
                                    {shopData.login_config.background_url && <img src={shopData.login_config.background_url} className="w-full h-full object-cover opacity-50"/>}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none hover:bg-black/20 transition-colors">
                                        {uploadingBg ? <Loader2 className="animate-spin"/> : <Camera size={24}/>}
                                        <span className="text-[10px] font-bold mt-1 uppercase">เปลี่ยนพื้นหลัง</span>
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'background')}/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Overlay</span><span>{Math.round(shopData.login_config.background_overlay * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.05" value={shopData.login_config.background_overlay} onChange={(e) => setShopData({...shopData, login_config: {...shopData.login_config, background_overlay: parseFloat(e.target.value)}})} className="w-full h-1.5 bg-slate-100 rounded-lg accent-indigo-500 appearance-none cursor-pointer"/>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 2. Size & Position */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <button onClick={() => toggleSection('size')} className="flex items-center justify-between w-full mb-2 outline-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Maximize size={18} className="text-blue-500" /> ขนาดและตำแหน่ง
                            </h3>
                            {openSection === 'size' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        {openSection === 'size' && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>กว้าง (Width)</span><span>{style.width ?? 40}%</span></div>
                                    <input type="range" min="10" max="100" value={style.width ?? 40} onChange={(e) => updateBoxStyle('width', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500 appearance-none cursor-pointer"/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>สูง (Height)</span><span>{style.height ?? 50}%</span></div>
                                    <input type="range" min="10" max="100" value={style.height ?? 50} onChange={(e) => updateBoxStyle('height', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500 appearance-none cursor-pointer"/>
                                </div>
                                <div className="pt-4 mt-2 border-t border-slate-100 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase text-blue-600"><span>ตำแหน่งแนวนอน (แกน X)</span><span>{position.x}%</span></div>
                                        <input type="range" min="0" max="100" value={position.x} onChange={(e) => updateBoxPosition('x', parseInt(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg accent-blue-600 appearance-none cursor-pointer"/>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase text-blue-600"><span>ตำแหน่งแนวตั้ง (แกน Y)</span><span>{position.y}%</span></div>
                                        <input type="range" min="0" max="100" value={position.y} onChange={(e) => updateBoxPosition('y', parseInt(e.target.value))} className="w-full h-1.5 bg-blue-100 rounded-lg accent-blue-600 appearance-none cursor-pointer"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 3. Borders & Shape */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <button onClick={() => toggleSection('border')} className="flex items-center justify-between w-full mb-2 outline-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Square size={18} className="text-emerald-500" /> ขอบและรูปทรง
                            </h3>
                            {openSection === 'border' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        {openSection === 'border' && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความมน (Radius)</span><span>{style.border_radius ?? 24}px</span></div>
                                    <input type="range" min="0" max="100" value={style.border_radius ?? 24} onChange={(e) => updateBoxStyle('border_radius', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-emerald-500 appearance-none cursor-pointer"/>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">ขนาดขอบ (px)</label>
                                        <input type="number" value={style.border_width ?? 2} onChange={(e) => updateBoxStyle('border_width', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">สีขอบ</label>
                                        <input type="color" value={style.border_color ?? '#ffd700'} onChange={(e) => updateBoxStyle('border_color', e.target.value)} className="w-10 h-10 block bg-transparent border-none cursor-pointer p-0"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 4. Shadow Settings */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <button onClick={() => toggleSection('shadow')} className="flex items-center justify-between w-full mb-2 outline-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Layers size={18} className="text-orange-500" /> เงา (Shadow)
                            </h3>
                            {openSection === 'shadow' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        {openSection === 'shadow' && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">แกน X (px)</label>
                                        <input type="number" value={style.shadow_x ?? 0} onChange={(e) => updateBoxStyle('shadow_x', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">แกน Y (px)</label>
                                        <input type="number" value={style.shadow_y ?? 20} onChange={(e) => updateBoxStyle('shadow_y', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความฟุ้ง (Blur)</span><span>{style.shadow_blur ?? 50}px</span></div>
                                    <input type="range" min="0" max="100" value={style.shadow_blur ?? 50} onChange={(e) => updateBoxStyle('shadow_blur', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-orange-500 appearance-none cursor-pointer"/>
                                </div>
                                <div className="flex items-center justify-between">
                                     <label className="text-xs font-bold text-slate-400 uppercase">สีเงา</label>
                                     {/* Note: บาง Browser input type="color" ไม่รับ rgba เราอาจจะใช้ hex แบบย่อ */}
                                     <input type="color" value={(style.shadow_color || '#000000').slice(0, 7)} onChange={(e) => updateBoxStyle('shadow_color', e.target.value)} className="w-8 h-8 cursor-pointer border-0 bg-transparent p-0"/>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 5. Effects & Box Style */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <button onClick={() => toggleSection('effects')} className="flex items-center justify-between w-full mb-2 outline-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Droplets size={18} className="text-cyan-500" /> สไตล์และเอฟเฟกต์
                            </h3>
                            {openSection === 'effects' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        {openSection === 'effects' && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-700">เอฟเฟกต์กระจก (Glass)</span>
                                    <input type="checkbox" checked={style.is_glassmorphism} onChange={(e) => updateBoxStyle('is_glassmorphism', e.target.checked)} className="w-5 h-5 accent-cyan-600"/>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความใสพื้นหลังกล่อง</span><span>{Math.round((style.box_bg_opacity ?? 0.1) * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={style.box_bg_opacity ?? 0.1} onChange={(e) => updateBoxStyle('box_bg_opacity', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-cyan-500 appearance-none cursor-pointer"/>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความเบลอ (Backdrop Blur)</span><span>{style.box_bg_blur ?? 20}px</span></div>
                                    <input type="range" min="0" max="40" step="1" value={style.box_bg_blur ?? 20} onChange={(e) => updateBoxStyle('box_bg_blur', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-cyan-500 appearance-none cursor-pointer"/>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ภาพพื้นหลังกล่อง (เล็ก)</label>
                                    <div className="relative h-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-cyan-400 transition-colors">
                                        {style.box_background_url ? (
                                            <>
                                                <img src={style.box_background_url} className="w-full h-full object-cover"/>
                                                <button onClick={() => updateBoxStyle('box_background_url', '')} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full z-10"><X size={10}/></button>
                                            </>
                                        ) : (
                                            uploadingBoxBg ? <Loader2 size={16} className="animate-spin text-cyan-500" /> : <Upload size={16} className="text-slate-300"/>
                                        )}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'box_bg')}/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* 🟢 Right Preview Builder */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900 rounded-[2.5rem] border-[12px] border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative h-full">
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
                                <span className="text-[10px] font-mono text-blue-400">X: {position.x}% Y: {position.y}%</span>
                            </div>
                        </div>

                        <div 
                            ref={previewRef}
                            className="relative flex-1 w-full bg-slate-950 bg-cover bg-center transition-all duration-700"
                            style={{ backgroundImage: `url(${shopData.login_config.background_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'})` }}
                        >
                            <div 
                                className="absolute inset-0 pointer-events-none transition-all duration-500"
                                style={{ backgroundColor: `rgba(0,0,0, ${shopData.login_config.background_overlay})` }}
                            />

                            <Draggable 
                                nodeRef={draggableNodeRef}
                                bounds="parent"
                                position={dragPos}
                                onDrag={handleDrag}
                                onStop={handleDragStop}
                            >
                                <div 
                                    ref={draggableNodeRef}
                                    className="absolute z-10 cursor-move select-none flex flex-col justify-center overflow-hidden transition-all duration-300 ease-out"
                                    style={{ 
                                        // 🟢 ผูกค่า CSS ทั้งหมดจากที่คุณตั้งไว้
                                        width: `${style.width ?? 40}%`,
                                        minHeight: `${style.height ?? 50}%`,
                                        borderRadius: `${style.border_radius ?? 24}px`,
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
                                    }}
                                >
                                    <div className="absolute top-4 right-4 text-white/30 animate-pulse pointer-events-none z-20">
                                        <Move size={20} />
                                    </div>
                                    
                                    <div className="w-full px-6 space-y-4 pointer-events-none opacity-80 z-10">
                                        <div className="h-12 w-full bg-black/40 border border-white/10 rounded-xl flex items-center px-4">
                                            <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                                            <div className="ml-3 h-2 w-32 bg-slate-500 rounded-full"></div>
                                        </div>
                                        <div className="h-12 w-full bg-black/40 border border-white/10 rounded-xl flex items-center px-4">
                                            <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                                            <div className="ml-3 h-2 w-24 bg-slate-500 rounded-full"></div>
                                        </div>
                                        <div className="h-12 w-full bg-linear-to-r from-yellow-600 to-yellow-400 rounded-xl mt-6 flex items-center justify-center shadow-lg">
                                            <span className="text-xs font-bold text-black">LOGIN ACCESS</span>
                                        </div>
                                    </div>
                                </div>
                            </Draggable>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md border border-white/10 text-white/60 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                                <MousePointer2 size={12} className="text-blue-400" /> ลากกล่องเพื่อจัดวาง หรือตั้งค่าแถบด้านข้าง
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}