export const DESIGN_PRINCIPLES = {
  beliefs: {
    belief01_frictionless_duality: {
      title: 'Frictionless Duality',
      thai: 'ความง่ายและความแม่นยำไม่จำเป็นต้องเลือก',
      components: ['TeslaCard', 'TeslaPill', 'TeslaButton'],
    },
    belief02_living_balance_sheet: {
      title: 'Living Balance Sheet',
      thai: 'ทุกบาทมีชีวิตและหายใจได้',
      components: ['TeslaCard', 'TeslaInput'],
    },
    belief03_privacy_aura: {
      title: 'Privacy Aura',
      thai: 'ข้อมูลของคุณไม่ออกจากเครื่อง',
      components: ['GlassSurface', 'TeslaPill'],
    },
    belief04_lifetime_ownership: {
      title: 'Lifetime Ownership',
      thai: 'ลงทุนครั้งเดียว เป็นเจ้าของตลอดชีวิต',
      components: ['TeslaCard'],
    },
    belief05_end_of_day_discipline: {
      title: 'End-of-Day Discipline',
      thai: 'วินิจฉัยไม่ใช่บันทึก',
      components: ['TeslaPill', 'TeslaButton'],
    },
  },
  decisionMatrix: {
    question: "Does this serve the user, or the designer's aesthetics?",
  },
  accessibility: {
    wcagLevel: 'AA',
    colorContrast: '4.5:1 minimum',
    touchTarget: '44x44pt minimum',
  },
  antiPatterns: {
    noRed: 'Use Amber (#F97316) for warnings',
    noEmoji: 'Use [Icon: Name] format',
    noAds: 'Zero ads guaranteed',
    noBankPasswords: 'Privacy-first approach',
  },
};
