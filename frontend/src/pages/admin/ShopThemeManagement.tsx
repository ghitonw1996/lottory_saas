import { useState } from 'react';
import { Store } from 'lucide-react';

import ManageShopTheme from './ManageShopTheme'; 

export default function ShopThemeManagement() {
  const [activeTab, setActiveTab] = useState('theme-login');

  const tabs = [
    { id: 'theme-login', label: 'จัดการธีม Login', icon: Store },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-10 animate-fade-in">
      
      {/* --- Header Card --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                <Store className="text-blue-600 hidden md:block" size={28} />
                จัดการธีมสีและรูปแบบร้านค้า
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
                ตั้งค่าธีมร้านค้า
            </p>
        </div>
        
        {/* --- Scrollable Tabs (Mobile Friendly) --- */}
        <div className="px-4 md:px-6 bg-gray-50/50">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200
                                ${isActive 
                                    ? 'bg-white text-blue-600 shadow-md shadow-blue-100 text-base scale-105 ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            <Icon size={isActive ? 20 : 18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-125 overflow-hidden relative">
        <div className="p-4 md:p-6">
            
            {/* Tab 1: จัดการ layout หน้า login และธีมสีหลักของร้าน */}
            {activeTab === 'theme-login' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ManageShopTheme />
                </div>
            )}

        </div>
      </div>
    </div>
  );
}