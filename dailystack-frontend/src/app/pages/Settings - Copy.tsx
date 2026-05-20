import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics'; // แก้ไข: ปรับระดับ Path เป็น ../../ เพื่อให้ถอยขึ้นไปหาโฟลเดอร์ src/utils ได้อย่างถูกต้อง
import { User, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ดึงข้อมูลชื่อเล่นเดิมที่มีอยู่แล้วในฐานข้อมูลขึ้นมาแสดงผลในฟอร์มเมื่อหน้าจอเริ่มทำงาน
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setNickname(data.nickname || '');
        }
      }
    };
    fetchCurrentProfile();
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').update({ nickname }).eq('user_id', user.id);
        await trackEvent('profile_updated', { nickname });
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-10 font-sans">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User size={24} className="text-primary" /> Settings
      </h1>
      <div className="bg-dark-card p-6 rounded-2xl border border-white/5 max-w-lg">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nickname</label>
        <input 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
          className="w-full bg-dark-bg p-3 rounded-xl border border-white/8 mb-4 text-white focus:outline-none focus:border-primary/60 transition-all" 
        />
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-primary text-dark-bg px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Save size={16}/> {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default Settings;