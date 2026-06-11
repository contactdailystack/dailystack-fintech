import React from 'react';

interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  color: string;
}

interface WalletSectionProps {
  wallets: Wallet[];
}

export const WalletSection: React.FC<WalletSectionProps> = ({ wallets }) => {
  return (
    <section>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 font-kanit">
        กระเป๋าเงินและบัญชีสะสม (Swipe to explore)
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4
        md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-4 md:gap-4
        snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
        {wallets.map((w) => (
          <div key={w.id} className="snap-start shrink-0 w-[180px] md:w-auto bg-white border-0 shadow-lg
            rounded-2xl p-4 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-spring cursor-pointer relative overflow-hidden group text-[#000000]">
            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${w.color}`} />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{w.type}</p>
            <h4 className="font-black text-[#000000] text-sm truncate">{w.name}</h4>
            <p className="text-xl font-extrabold text-[#000000] mt-3 font-mono">
              {w.balance.toLocaleString()}
              <span className="text-[10px] text-gray-500 font-normal ml-1">THB</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
