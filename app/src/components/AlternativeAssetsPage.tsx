import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, X, TrendingUp,
  ChevronRight, Crown, Gem, LineChart,
  ShieldCheck, Coins, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../data/translations';
import { useAuthContext } from '../services/AuthContext';
import {
  fetchAlternativeAssets,
  addAlternativeAsset,
  updateAlternativeAsset,
  deleteAlternativeAsset,
  type AlternativeAsset,
  type AssetType,
} from '../services/alternativeAssetsService';

const ASSET_TYPE_CONFIG: Record<AssetType, { label: { en: string; th: string }; icon: React.ReactNode; color: string }> = {
  gold:         { label: { en: 'Gold Savings',         th: 'ออมทอง' },            icon: <Gem          className="w-4 h-4" />, color: 'text-amber-400' },
  mutual_fund:   { label: { en: 'Mutual Fund',           th: 'กองทุนรวม' },        icon: <LineChart    className="w-4 h-4" />, color: 'text-blue-400' },
  bond:         { label: { en: 'Government Bond',         th: 'พันธบัตร' },          icon: <ShieldCheck  className="w-4 h-4" />, color: 'text-emerald-400' },
  crypto:       { label: { en: 'Cryptocurrency',          th: 'คริปโต' },            icon: <Coins        className="w-4 h-4" />, color: 'text-purple-400' },
  other:        { label: { en: 'Other Assets',           th: 'สินทรัพย์อื่น' },     icon: <TrendingUp    className="w-4 h-4" />, color: 'text-zinc-400' },
};

interface AlternativeAssetsPageProps {
  onNavigateToUpgrade: () => void;
  lang: Language;
}

export default function AlternativeAssetsPage({ onNavigateToUpgrade, lang }: AlternativeAssetsPageProps) {
  const auth = useAuthContext();
  const [assets, setAssets] = useState<AlternativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = translations[lang];

  const [form, setForm] = useState({
    asset_name: '',
    asset_type: 'gold' as AssetType,
    current_value: '',
    currency: 'THB',
    purchase_price: '',
    purchase_date: '',
    notes: '',
  });

  const isElite = auth.tier === 'elite';

  useEffect(() => {
    if (isElite) {
      loadAssets();
    } else {
      setLoading(false);
    }
  }, [isElite]);

  const loadAssets = async () => {
    setLoading(true);
    const data = await fetchAlternativeAssets();
    setAssets(data);
    setLoading(false);
  };

  const totalValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const gainLoss = assets.reduce((sum, a) => {
    const current = Number(a.current_value || 0);
    const purchase = Number(a.purchase_price || 0);
    return sum + (current - purchase);
  }, 0);
  const gainLossPct = assets.reduce((sum, a) => {
    const current = Number(a.current_value || 0);
    const purchase = Number(a.purchase_price || 0);
    if (!purchase) return sum;
    return sum + ((current - purchase) / purchase) * 100;
  }, 0);

  const resetForm = () => {
    setForm({ asset_name: '', asset_type: 'gold', current_value: '', currency: 'THB', purchase_price: '', purchase_date: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (asset: AlternativeAsset) => {
    setForm({
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      current_value: String(asset.current_value || ''),
      currency: asset.currency || 'THB',
      purchase_price: String(asset.purchase_price || ''),
      purchase_date: asset.purchase_date || '',
      notes: asset.notes || '',
    });
    setEditingId(asset.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      asset_name: form.asset_name,
      asset_type: form.asset_type,
      current_value: Number(form.current_value),
      currency: form.currency,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      purchase_date: form.purchase_date || undefined,
      notes: form.notes || undefined,
    };

    if (editingId) {
      const updated = await updateAlternativeAsset(editingId, payload);
      if (updated) setAssets(prev => prev.map(a => a.id === editingId ? updated : a));
    } else {
      const added = await addAlternativeAsset(payload);
      if (added) setAssets(prev => [added, ...prev]);
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteAlternativeAsset(id);
    if (ok) setAssets(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(val);
  };

  // Non-ELITE view
  if (!isElite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0B0F0A]">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#171C15] border border-[#C7FF2E]/20 mx-auto">
              <Crown className="w-7 h-7 text-[#FFD700]" />
            </div>
            <h2 className="font-display font-black text-2xl text-white">
              {lang === 'en' ? 'Alternative Assets' : 'สินทรัพย์ทางเลือก'}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {lang === 'en'
                ? 'Track gold, mutual funds, bonds, and crypto alongside your DailyStack portfolio.'
                : 'ติดตามทองคำ กองทุนรวม พันธบัตร และคริปโต ควบคู่กับพอร์ตโฟลิโอ DailyStack ของคุณ'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {Object.entries(ASSET_TYPE_CONFIG).map(([key, cfg]) => (
              <div key={key} className="p-4 rounded-xl bg-[#171C15] border border-zinc-800 space-y-2">
                <div className={`flex items-center gap-2 ${cfg.color}`}>
                  {cfg.icon}
                  <span className="font-mono text-[10px] uppercase tracking-widest">{cfg.label[lang]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFD700]/10 to-[#C7FF2E]/10 border border-[#FFD700]/20 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-[#FFD700]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFD700]">ELITE Tier</span>
            </div>
            <p className="text-xs text-zinc-400">
              {lang === 'en'
                ? 'Unlock full alternative asset tracking with AI-powered portfolio insights.'
                : 'ปลดล็อกการติดตามสินทรัพย์ทางเลือกพร้อม AI-powered portfolio insights'}
            </p>
            <button
              onClick={onNavigateToUpgrade}
              className="w-full py-3.5 rounded-xl bg-[#FFD700] text-black font-display font-black text-xs uppercase tracking-wider hover:bg-[#FFD700]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {lang === 'en' ? 'Upgrade to ELITE' : 'อัปเกรดเป็น ELITE'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ELITE Full View
  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white pb-24">
      <div className="absolute top-20 right-0 w-[280px] h-[280px] rounded-full bg-[#FFD700]/5 blur-[100px] pointer-events-none" />
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#FFD700]" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#FFD700]">ELITE</span>
          </div>
          <button onClick={onNavigateToUpgrade} className="text-[10px] font-mono text-zinc-500 hover:text-white transition-colors">
            {lang === 'en' ? 'Manage Plan' : 'จัดการแผน'}
          </button>
        </div>
        <h1 className="font-display font-black text-2xl text-white">
          {lang === 'en' ? 'Alternative Assets' : 'สินทรัพย์ทางเลือก'}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {lang === 'en' ? 'Your total wealth picture beyond cash' : 'ภาพรวมความมั่งคั่งนอกเหนือเงินสด'}
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="px-4 mb-6">
        <div className="p-5 rounded-2xl bg-[#171C15] border border-zinc-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                {lang === 'en' ? 'Total Portfolio Value' : 'มูลค่าพอร์ตโฟลิโอรวม'}
              </p>
              <p className="font-display font-black text-3xl text-white">
                {loading ? '—' : formatCurrency(totalValue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#FFD700]" />
            </div>
          </div>
          {!loading && assets.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
              <div>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  {lang === 'en' ? 'Total P/L' : 'กำไร/ขาดทุน'}
                </p>
                <p className={`font-display font-bold text-sm ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  {lang === 'en' ? 'Avg Return' : 'ผลตอบแทนเฉลี่ย'}
                </p>
                <p className={`font-display font-bold text-sm ${gainLossPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gainLossPct >= 0 ? '+' : ''}{gainLossPct.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset List */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            {lang === 'en' ? 'Your Assets' : 'สินทรัพย์ของคุณ'} ({assets.length})
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD700] text-black font-mono font-bold text-[10px] uppercase tracking-wider hover:bg-[#FFD700]/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Add Asset' : 'เพิ่มสินทรัพย์'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin border-[#FFD700] border-t-transparent" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#171C15] border border-zinc-800 mx-auto">
              <Gem className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-display font-medium text-zinc-400">
                {lang === 'en' ? 'No assets tracked yet' : 'ยังไม่มีสินทรัพย์ที่ติดตาม'}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {lang === 'en' ? 'Add your first gold, fund, or bond' : 'เพิ่มทอง กองทุน หรือพันธบัตรแรกของคุณ'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Add First Asset' : 'เพิ่มสินทรัพย์แรก'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {assets.map((asset) => {
                const cfg = ASSET_TYPE_CONFIG[asset.asset_type];
                const currentVal = Number(asset.current_value || 0);
                const purchaseVal = Number(asset.purchase_price || 0);
                const pl = currentVal - purchaseVal;
                const plPct = purchaseVal ? ((currentVal - purchaseVal) / purchaseVal) * 100 : 0;
                return (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-xl bg-[#171C15] border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-900 shrink-0 ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-white truncate">{asset.asset_name}</p>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{cfg.label[lang]}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-sm text-white">{formatCurrency(currentVal)}</p>
                        {purchaseVal > 0 && (
                          <p className={`font-mono text-[9px] ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pl >= 0 ? '+' : ''}{formatCurrency(pl)} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleEdit(asset)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(asset.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {asset.notes && (
                      <p className="mt-2 text-[10px] text-zinc-600 font-sans pl-12">{asset.notes}</p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#0B0F0A] rounded-t-3xl sm:rounded-2xl border border-zinc-800 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-black text-lg text-white">
                  {editingId ? (lang === 'en' ? 'Edit Asset' : 'แก้ไขสินทรัพย์') : (lang === 'en' ? 'Add New Asset' : 'เพิ่มสินทรัพย์ใหม่')}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Asset Type' : 'ประเภทสินทรัพย์'}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.entries(ASSET_TYPE_CONFIG) as [AssetType, typeof ASSET_TYPE_CONFIG.gold][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, asset_type: key }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.asset_type === key ? 'border-[#FFD700] bg-[#FFD700]/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                      >
                        <span className={cfg.color}>{cfg.icon}</span>
                        <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider text-center leading-tight">{cfg.label[lang]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Asset Name' : 'ชื่อสินทรัพย์'}
                  </label>
                  <input type="text" required value={form.asset_name}
                    onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))}
                    placeholder={lang === 'en' ? 'e.g. Gold Savings 1 Baht' : 'เช่น ออมทอง 1 บาท'}
                    className="w-full px-4 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 outline-none transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Current Value (THB)' : 'มูลค่าปัจจุบัน (บาท)'}
                  </label>
                  <input type="number" required min="0" step="0.01" value={form.current_value}
                    onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 outline-none transition-all font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      {lang === 'en' ? 'Purchase Price' : 'ราคาซื้อ'}
                    </label>
                    <input type="number" min="0" step="0.01" value={form.purchase_price}
                      onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      {lang === 'en' ? 'Purchase Date' : 'วันที่ซื้อ'}
                    </label>
                    <input type="date" value={form.purchase_date}
                      onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-sm text-white focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    {lang === 'en' ? 'Notes' : 'บันทึก'}
                  </label>
                  <textarea rows={2} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={lang === 'en' ? 'Optional notes...' : 'บันทึกเพิ่มเติม...'}
                    className="w-full px-4 py-3 rounded-xl bg-[#171C15] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 outline-none transition-all font-sans resize-none"
                  />
                </div>
                <button type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FFD700] text-black font-display font-black text-xs uppercase tracking-wider hover:bg-[#FFD700]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {editingId ? (lang === 'en' ? 'Update Asset' : 'อัปเดตสินทรัพย์') : (lang === 'en' ? 'Add Asset' : 'เพิ่มสินทรัพย์')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) setDeletingId(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0B0F0A] rounded-2xl border border-zinc-800 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white">
                    {lang === 'en' ? 'Delete Asset?' : 'ลบสินทรัพย์?'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {lang === 'en' ? 'This action cannot be undone.' : 'การกระทำนี้ไม่สามารถย้อนกลับได้'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
                </button>
                <button onClick={() => handleDelete(deletingId)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-all"
                >
                  {lang === 'en' ? 'Delete' : 'ลบ'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
