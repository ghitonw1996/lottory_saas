import { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Monitor, Tablet, Smartphone, MousePointer2, Move } from 'lucide-react';
import LoginBoxUI from './LoginBoxUI';

const hexToRgba = (hex: string, alpha: number) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ThemeSimulator({ shopData, setShopData }: { shopData: any, setShopData: any }) {
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [scale, setScale] = useState(1);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const draggableNodeRef = useRef<HTMLDivElement>(null);

    const style = shopData.login_config.box_style;
    const position = shopData.login_config.box_position;

    const getBaseDims = () => {
        switch (viewMode) {
            case 'mobile': return { width: 390, height: 844, borderRadius: 40 };
            case 'tablet': return { width: 820, height: 1180, borderRadius: 32 };
            default: return { width: 1440, height: 900, borderRadius: 16 };
        }
    };

    useEffect(() => {
        const updateScale = () => {
            if (previewWrapperRef.current) {
                const wrapperW = previewWrapperRef.current.clientWidth;
                const wrapperH = previewWrapperRef.current.clientHeight;
                const dims = getBaseDims();
                const scaleW = (wrapperW * 0.95) / dims.width;
                const scaleH = (wrapperH * 0.95) / dims.height;
                setScale(Math.min(scaleW, scaleH, 1));
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [viewMode]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (previewRef.current && draggableNodeRef.current) {
                const containerW = previewRef.current.clientWidth;
                const containerH = previewRef.current.clientHeight;
                const boxW = draggableNodeRef.current.offsetWidth;
                const boxH = draggableNodeRef.current.offsetHeight;

                const centerX = (position.x * containerW) / 100;
                const centerY = (position.y * containerH) / 100;

                setDragPos({ x: centerX - (boxW / 2), y: centerY - (boxH / 2) });
            }
        }, 150); 
        return () => clearTimeout(timer);
    }, [viewMode, scale, style.width, style.height, position.x, position.y]);

    const handleDrag = (_e: any, data: any) => setDragPos({ x: data.x, y: data.y });

    const handleDragStop = (_e: any, data: any) => {
        if (!previewRef.current || !draggableNodeRef.current) return;
        const containerW = previewRef.current.clientWidth;
        const containerH = previewRef.current.clientHeight;
        const boxW = draggableNodeRef.current.offsetWidth;
        const boxH = draggableNodeRef.current.offsetHeight;

        const centerX = data.x + (boxW / 2);
        const centerY = data.y + (boxH / 2);

        const xPercent = Math.round((centerX / containerW) * 100);
        const yPercent = Math.round((centerY / containerH) * 100);

        setShopData((prev: any) => ({
            ...prev,
            login_config: { ...prev.login_config, box_position: { x: xPercent, y: yPercent } }
        }));
    };

    return (
        <div className="order-1 md:order-2 flex-1 flex flex-col h-[55vh] md:h-full bg-[#050810] relative overflow-hidden">
            <div className="absolute top-2 md:top-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="flex items-center bg-white/10 backdrop-blur-md p-1 md:p-1.5 rounded-full md:rounded-2xl border border-white/20 gap-1 pointer-events-auto scale-90 md:scale-100">
                    <button onClick={() => setViewMode('desktop')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${viewMode === 'desktop' ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/20'}`}><Monitor size={16} /><span className="hidden sm:block">Desktop</span></button>
                    <button onClick={() => setViewMode('tablet')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${viewMode === 'tablet' ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/20'}`}><Tablet size={16} /><span className="hidden sm:block">Tablet</span></button>
                    <button onClick={() => setViewMode('mobile')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${viewMode === 'mobile' ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/20'}`}><Smartphone size={16} /><span className="hidden sm:block">Mobile</span></button>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-50 pointer-events-none hidden md:flex">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white flex items-center gap-2">
                    <MousePointer2 size={14} className="text-blue-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">X: {position.x}%, Y: {position.y}%</span>
                </div>
            </div>

            <div ref={previewWrapperRef} className="flex-1 flex items-center justify-center p-0 md:p-4 w-full h-full overflow-hidden">
                <div 
                    ref={previewRef}
                    className={`relative bg-slate-950 bg-cover bg-center overflow-hidden shrink-0 ${viewMode !== 'desktop' ? 'ring-8 ring-slate-800 border-[12px] border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'shadow-2xl border border-white/10'}`}
                    style={{ 
                        width: `${getBaseDims().width}px`, height: `${getBaseDims().height}px`, borderRadius: `${getBaseDims().borderRadius}px`,
                        transform: `scale(${scale})`, transformOrigin: 'center center',
                        backgroundImage: `url(${shopData.login_config.background_url})` 
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0, ${shopData.login_config.background_overlay})` }}/>

                    <Draggable key={viewMode} scale={scale} nodeRef={draggableNodeRef} bounds="parent" position={dragPos} onDrag={handleDrag} onStop={handleDragStop}>
                        <div 
                            ref={draggableNodeRef}
                            className="absolute z-10 cursor-move flex flex-col justify-center overflow-hidden transition-shadow duration-300 group hover:ring-4 hover:ring-blue-500/50"
                            style={{ 
                                width: `clamp(320px, ${style.width ?? 40}%, 95%)`, minHeight: `clamp(400px, ${style.height ?? 50}%, 90%)`,
                                borderRadius: `${style.border_radius ?? 24}px`, borderWidth: `${style.border_width ?? 2}px`,
                                borderStyle: 'solid', borderColor: style.border_color ?? '#ffd700',
                                boxShadow: `${style.shadow_x ?? 0}px ${style.shadow_y ?? 20}px ${style.shadow_blur ?? 50}px ${style.shadow_color ?? 'rgba(0,0,0,0.5)'}`,
                                backgroundColor: style.is_glassmorphism ? hexToRgba(style.box_bg_color || '#ffffff', style.box_bg_opacity ?? 0.1) : (style.box_bg_color || '#0f172a'),
                                backdropFilter: style.is_glassmorphism ? `blur(${style.box_bg_blur ?? 20}px)` : 'none',
                                WebkitBackdropFilter: style.is_glassmorphism ? `blur(${style.box_bg_blur ?? 20}px)` : 'none',
                                margin: 0
                            }}
                        >
                            <div className="absolute top-4 right-4 text-white/50 opacity-0 md:group-hover:opacity-100 transition-opacity z-20"><Move size={20} className="animate-bounce" /></div>
                            
                            {/* เรียกใช้ Component กล่อง Login ที่เพิ่งแยกออกไป */}
                            <LoginBoxUI shopData={shopData} />
                            
                        </div>
                    </Draggable>
                </div>
            </div>
        </div>
    );
}