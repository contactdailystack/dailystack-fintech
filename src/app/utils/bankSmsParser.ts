// Bank SMS parser — extracts transaction data from Thai bank SMS formats
// Supports: SCB, KBank, UOB, and generic fallback for other banks

export interface ParsedSmsResult {
  amount: number;
  walletId: string;       // resolved by Dashboard from bankName
  categoryName: string;
  notes: string;
  bankName: string;
}

/** Find matching wallet ID from wallets list by bank name, or return first bank wallet */
export const resolveWalletIdByBankName = (
  bankName: string,
  wallets: Array<{ id: string; name: string; type: string }>
): string => {
  const bankNames: Record<string, string[]> = {
    SCB:    ['scb', 'ไทยพาณิชย์', 'ธนาคารไทยพาณิชย์'],
    KBank:  ['kbank', 'กสิกร', 'ธนาคารกสิกรไทย'],
    UOB:    ['uob', 'ยูโอบี', 'ธนาคารยูโอบี'],
    BBL:    ['bbl', 'กรุงเทพ', 'ธนาคารกรุงเทพ'],
    Krungthai: ['ktb', 'กรุงศรี', 'ธนาคารกรุงศรีอยุธยา'],
    TMB:    ['tmb', 'ทีเอ็มบี', 'ธนาคารทีเอ็มบี'],
  };

  const aliases = bankNames[bankName] ?? [bankName.toLowerCase()];

  for (const w of wallets) {
    const wName = w.name.toLowerCase();
    if (aliases.some((alias) => wName.includes(alias))) {
      return w.id;
    }
  }

  // Fallback: first bank wallet
  const bankWallet = wallets.find((w) => w.type === 'bank');
  return bankWallet?.id ?? wallets[0]?.id ?? '';
};

export const parseBankSms = (text: string): ParsedSmsResult | null => {
  const scbRegex = /SCB:\s*จ่ายบัตร\s*[xX]-\d+\s*จำนวน\s*([\d,.]+)\s*บาท\s*ที่\s*(.+)/i;
  const kbankRegex = /KBank:\s*โอนเงิน\s*([\d,.]+)\s*บาท\s*ไปยัง\s*(.+)/i;
  const uobRegex = /UOB:\s*รูดบัตร\s*[xX]-\d+\s*จำนวน\s*([\d,.]+)\s*บาท\s*ที่\s*(.+)/i;

  let amount = 0;
  let notes = '';
  let bankName = '';
  let categoryName = 'General';

  if (scbRegex.test(text)) {
    const match = text.match(scbRegex);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      notes = match[2].trim();
      bankName = 'SCB';
    }
  } else if (kbankRegex.test(text)) {
    const match = text.match(kbankRegex);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      notes = match[2].trim();
      bankName = 'KBank';
    }
  } else if (uobRegex.test(text)) {
    const match = text.match(uobRegex);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      notes = match[2].trim();
      bankName = 'UOB';
    }
  } else {
    // Generic fallback parser — extract what we can
    const genericAmountRegex = /(?:จำนวน|โอนเงิน|จ่าย|transfer|spend)\s*([\d,.]+)\s*บาท/i;
    const amountMatch = text.match(genericAmountRegex);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    if (/scb/i.test(text)) {
      bankName = 'SCB';
    } else if (/kbank/i.test(text)) {
      bankName = 'KBank';
    } else if (/uob/i.test(text)) {
      bankName = 'UOB';
    } else if (/bbl/i.test(text)) {
      bankName = 'BBL';
    } else if (/krungthai/i.test(text)) {
      bankName = 'Krungthai';
    } else if (/tmb/i.test(text)) {
      bankName = 'TMB';
    } else {
      bankName = 'Bank';
    }

    notes = text.length > 60 ? text.substring(0, 60) + '...' : text;
  }

  if (amount <= 0) return null;

  // Keyword-based category mapping
  const ltext = (notes + ' ' + text).toLowerCase();
  if (/netflix|spotify|youtube|disney|apple|chatgpt|starbucks|grab|prime|hbo/i.test(ltext)) {
    categoryName = 'Entertainment & Subscriptions';
  } else if (/food|ร้าน|ข้าว|กาแฟ|coffee|cafe|starbuck|mk|shabu|somtam|ส้มตำ|ชาบู|อาหาร/i.test(ltext)) {
    categoryName = 'Food & Dining';
  } else if (/น้ำมัน|รถ|taxi|grab|bts|mrt|รถไฟฟ้า|ขนส่ง|taxi/i.test(ltext)) {
    categoryName = 'Transportation';
  } else if (/shopee|lazada|central|central Pattaya|ทอง|jewel/i.test(ltext)) {
    categoryName = 'Shopping';
  }

  return { amount, walletId: bankName, categoryName, notes, bankName };
};
