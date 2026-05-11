import { useState } from 'react';
import { 
    Loader2, Camera, ChevronUp, ChevronDown, 
    Square, Maximize, Image as ImageIcon, Droplets, 
    ArrowLeft, CheckCircle2, PaintBucket, Sparkles
} from 'lucide-react';

export default function ThemeSidebar({ 
    shopData, setShopData, onClose, onSave, submitting, onUploadBg 
}: { 
    shopData: any, setShopData: any, onClose?: () => void, onSave: (e: any) => void, submitting: boolean, onUploadBg: (file: File) => void 
}) {
    const [openSection, setOpenSection] = useState<string>('brand');
    const [uploadingBg, setUploadingBg] = useState(false);

    const toggleSection = (section: string) => setOpenSection(prev => prev === section ? '' : section);
    
    // Helper ช่วยย่นโค้ดการอัปเดต State
    const updateBoxStyle = (key: string, value: any) => setShopData((prev: any) => ({ ...prev, login_config: { ...prev.login_config, box_style: { ...prev.login_config.box_style, [key]: value } } }));
    const updateConfig = (key: string, value: any) => setShopData((prev: any) => ({ ...prev, login_config: { ...prev.login_config, [key]: value } }));

    const config = shopData.login_config;
    const style = config.box_style;

    return (
        <div className="order-2 md:order-1 h-[45vh] md:h-full w-full md:w-[380px] bg-white flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.2)] z-20 shrink-0">
            <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                <button onClick={onClose} className="p-2 bg-white text-slate-600 rounded-lg border hover:bg-slate-100 transition-colors"><ArrowLeft size={20} /></button>
                <div className="text-right">
                    <h1 className="text-base md:text-lg font-black text-slate-800 leading-tight">Theme Builder</h1>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">100% Scale Precision</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <button onClick={() => toggleSection('bg')} className="flex items-center justify-between w-full mb-2">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><ImageIcon size={18} className="text-indigo-500" /> พื้นหลังหน้าเว็บ</h3>
                        {openSection === 'bg' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {openSection === 'bg' && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="relative h-28 bg-slate-900 rounded-xl overflow-hidden border">
                                {config.background_url && <img src={config.background_url} className="w-full h-full object-cover opacity-50"/>}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none hover:bg-black/20 transition-colors">
                                    {uploadingBg ? <Loader2 className="animate-spin"/> : <Camera size={24}/>}
                                    <span className="text-[10px] font-bold mt-1 uppercase">เปลี่ยนพื้นหลัง</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                                    if(e.target.files?.[0]){
                                        setUploadingBg(true);
                                        await onUploadBg(e.target.files[0]);
                                        setUploadingBg(false);
                                    }
                                }}/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Overlay ความมืด</span><span>{Math.round(config.background_overlay * 100)}%</span></div>
                                <input type="range" min="0" max="1" step="0.05" value={config.background_overlay} onChange={(e) => updateConfig('background_overlay', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-indigo-500 appearance-none cursor-pointer"/>
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <button onClick={() => toggleSection('size')} className="flex items-center justify-between w-full mb-2">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Maximize size={18} className="text-blue-500" /> ขนาดกล่อง</h3>
                        {openSection === 'size' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {openSection === 'size' && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>กว้าง (Width)</span><span>{style.width ?? 40}%</span></div>
                                <input type="range" min="10" max="100" value={style.width ?? 40} onChange={(e) => updateBoxStyle('width', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500 appearance-none cursor-pointer"/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>สูง (Min-Height)</span><span>{style.height ?? 50}%</span></div>
                                <input type="range" min="10" max="100" value={style.height ?? 50} onChange={(e) => updateBoxStyle('height', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-blue-500 appearance-none cursor-pointer"/>
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <button onClick={() => toggleSection('border')} className="flex items-center justify-between w-full mb-2">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Square size={18} className="text-emerald-500" /> ขอบและเงา (Shadow)</h3>
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
                                    <input type="number" value={style.border_width ?? 2} onChange={(e) => updateBoxStyle('border_width', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">สีขอบ</label>
                                    <input type="color" value={style.border_color ?? '#ffd700'} onChange={(e) => updateBoxStyle('border_color', e.target.value)} className="w-10 h-10 block bg-transparent border-none cursor-pointer p-0"/>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">เงาแกน X (px)</label>
                                        <input type="number" value={style.shadow_x ?? 0} onChange={(e) => updateBoxStyle('shadow_x', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">เงาแกน Y (px)</label>
                                        <input type="number" value={style.shadow_y ?? 20} onChange={(e) => updateBoxStyle('shadow_y', parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-sm outline-none"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความฟุ้งกระจาย (Blur)</span><span>{style.shadow_blur ?? 50}px</span></div>
                                    <input type="range" min="0" max="100" value={style.shadow_blur ?? 50} onChange={(e) => updateBoxStyle('shadow_blur', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-orange-500 appearance-none cursor-pointer"/>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">สีเงา (Color)</label>
                                    <input type="color" value={(style.shadow_color || '#000000').slice(0, 7)} onChange={(e) => updateBoxStyle('shadow_color', e.target.value)} className="w-8 h-8 cursor-pointer border-0 bg-transparent p-0"/>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <button onClick={() => toggleSection('effects')} className="flex items-center justify-between w-full mb-2">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Droplets size={18} className="text-cyan-500" /> เอฟเฟกต์และสีกล่อง</h3>
                        {openSection === 'effects' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {openSection === 'effects' && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                <div className="flex items-center gap-2">
                                    <PaintBucket size={16} className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-700">สีกล่อง (Base Color)</span>
                                </div>
                                <input type="color" value={style.box_bg_color || '#ffffff'} onChange={(e) => updateBoxStyle('box_bg_color', e.target.value)} className="w-8 h-8 block bg-transparent border-none cursor-pointer p-0"/>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                <span className="text-sm font-bold text-slate-700">เปิดใช้ความโปร่งใส (Glass)</span>
                                <input type="checkbox" checked={style.is_glassmorphism} onChange={(e) => updateBoxStyle('is_glassmorphism', e.target.checked)} className="w-5 h-5 accent-cyan-600"/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความโปร่งใส (Opacity)</span><span>{Math.round((style.box_bg_opacity ?? 0.1) * 100)}%</span></div>
                                <input type="range" min="0" max="1" step="0.01" value={style.box_bg_opacity ?? 0.1} onChange={(e) => updateBoxStyle('box_bg_opacity', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-cyan-500 appearance-none cursor-pointer"/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>ความเบลอ (Blur)</span><span>{style.box_bg_blur ?? 20}px</span></div>
                                <input type="range" min="0" max="40" step="1" value={style.box_bg_blur ?? 20} onChange={(e) => updateBoxStyle('box_bg_blur', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-cyan-500 appearance-none cursor-pointer"/>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <div className="p-3 md:p-4 border-t bg-white shrink-0">
                <button onClick={onSave} disabled={submitting} className="w-full bg-slate-900 hover:bg-black text-white px-6 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold shadow-lg shadow-slate-200 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} บันทึกธีม
                </button>
            </div>
        </div>
    );
}