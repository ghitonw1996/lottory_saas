import { useState } from 'react';
import { Store, MonitorPlay } from 'lucide-react';
import ManageShopTheme from './ManageShopTheme'; 

export default function ShopThemeManagement() {
  const [isEditing, setIsEditing] = useState(false);

  // ถ้าเปิดโหมดแก้ไข ให้โหลดคอมโพเนนต์เต็มจอ
  if (isEditing) {
    return <ManageShopTheme onClose={() => setIsEditing(false)} />;
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-10 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                <Store className="text-blue-600 hidden md:block" size={28} />
                จัดการธีมสีและรูปแบบร้านค้า
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
                ตั้งค่าธีมหน้าต่าง Login และการแสดงผล
            </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
         <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <MonitorPlay size={40} className="text-blue-600" />
         </div>
         <h3 className="text-2xl font-bold text-gray-800 mb-2">หน้าต่างปรับแต่ง Login</h3>
         <p className="text-gray-500 mb-8 max-w-md mx-auto">
            เข้าสู่โหมดปรับแต่งหน้า Login แบบเต็มหน้าจอ เพื่อให้การแสดงผลสเกลแม่นยำ 100% และไม่ถูกจำกัดพื้นที่โดยเมนูด้านข้าง
         </p>
         <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
         >
            <MonitorPlay size={20} />
            เปิดตัวปรับแต่งธีม (Full Screen)
         </button>
      </div>
    </div>
  );
}