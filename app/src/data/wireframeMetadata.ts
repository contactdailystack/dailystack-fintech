export interface WireframeSpec {
  id: string;
  nameEn: string;
  nameTh: string;
  specs: {
    screenObjective: { en: string; th: string };
    businessObjective: { en: string; th: string };
    userObjective: { en: string; th: string };
    userPsychology: { en: string; th: string };
    informationArchitecture: { en: string; th: string };
    layoutStructure: { en: string; th: string };
    componentHierarchy: { en: string; th: string };
    aiOpportunities: { en: string; th: string };
    monetizationOpportunities: { en: string; th: string };
    behavioralOpportunities: { en: string; th: string };
    emptyState: { en: string; th: string };
    loadingState: { en: string; th: string };
    errorState: { en: string; th: string };
    successState: { en: string; th: string };
    mobileWireframe: { en: string; th: string };
    tabletAdaptation: { en: string; th: string };
    accessibilityNotes: { en: string; th: string };
    kpiImpact: { en: string; th: string };
    fbisImpact: { en: string; th: string };
    upgradeImpact: { en: string; th: string };
  };
}

export const WIREFRAME_METADATA: Record<string, WireframeSpec> = {
  dashboard: {
    id: "dashboard",
    nameEn: "Home: Financial Mission Control Center",
    nameTh: "หน้าหลัก: ศูนย์ควบคุมภารกิจการเงิน",
    specs: {
      screenObjective: {
        en: "Provide an immediate, holistic assessment of the user's financial status, emotional guardrails, and behavioral trajectory at a single, high-fidelity glance.",
        th: "จัดหาข้อมูลประเมินทันทีแบบองค์รวมเกี่ยวกับสถานะทางการเงิน เครื่องกั้นอารมณ์ และเส้นทางพฤติกรรมในมุมมองระดับสูงเพียงจุดเดียว"
      },
      businessObjective: {
        en: "Drive high weekly active usage (WAU) and highlight the transformative premium behavioral features (Money Twin, Scenario Simulation) to prompt Elite tier conversions.",
        th: "ผลักดันให้เกิดการใช้งานรายสัปดาห์ (WAU) สูง และชูจุดเด่นฟีเจอร์พรีเมียมบำบัดพฤติกรรม (แฝดการเงิน, จำลองคัดความเครียด) เพื่อกระตุ้นยอดขาย Elite"
      },
      userObjective: {
        en: "Gain instant clarity on overall net capital, behavioral score status, upcoming tactical goals, and active guardrails without raw transactional screen noise.",
        th: "สร้างความชัดเจนทันทีเกี่ยวกับกองทุนสำรอง คะแนนสติพฤติกรรม เป้าหมายวินัยของช่วงวัน และการปิดล็อกเครื่องคุ้มกันอย่างปราศจากข้อมูลแบนๆ"
      },
      userPsychology: {
        en: "Shame reduction and agency: Transforming a feared transaction sheet into an active, empowering flight deck that reward emotional control (Sovereign mode).",
        th: "ลดอาการรู้สึกผิดและเสริมอำนาจตนเอง: เปลี่ยนหน้างบใช้จ่ายที่น่าหวาดกลัวให้กลายเป็นเครื่องควบคุมส่งพลังซึ่งมอบรางวัลแก่ความมีระเบียบวินัย"
      },
      informationArchitecture: {
        en: "1. Brand & Language Switcher; 2. Financial Balance Snapshot & Action Core; 3. Gamified Financial Behavior Improvement Score (FBIS) Gauge; 4. Recommended Daily AI Guardrail Action; 5. Tactical Goals Bento Grid; 6. AI Asset Conversion blueprint.",
        th: "1. จุดแสดงแบรนด์และสลับภาษา EN/TH; 2. ยอดสำรองกองคลังและแผงปุ่มฝากถอนโอน; 3. ดัชนีแสดงคะแนนจัดพฤติกรรมหลัก (FBIS); 4. กล่องแนะนำเกราะสยบสติจาก AI Coach; 5. ตารางเป้าหมายความประพฤติ; 6. พอร์ตหุ้นเสาค้ำสัดส่วนยาวนาน"
      },
      layoutStructure: {
        en: "Flexible Bento grid. Top: prominent primary balance card alongside fluid sparklined indices. Middle: double-column breakdown of FBIS score circle and current cortisol risk assessment banner. Bottom: triple-column goals and conversions card.",
        th: "กริดสไตล์ Bento ยืดหยุ่นได้ ด้านบนสุดแสดงบัตรยอดเงินและหลักทรัพย์กราฟสปาร์กไลน์ ถัดไปแสดงแผงสองคอลัมน์คุมคะแนน FBIS และเกราะระงับสติ 24 ชม. และด้านล่างโชว์เป้าหมายตาราง Bento"
      },
      componentHierarchy: {
        en: "Header Capsule -> Balance Card with Action Buttons -> FBIS Ring display -> Cooling Guardrail toggle card -> Goal Widgets -> Interactive Stock sparks list.",
        th: "ปุ่มครอบส่วนหัว -> การ์ดแสดงยอดพร้อมปุ่มปฏิบัติเร็ว -> วงแหวนสะท้อนสติ FBIS -> บัตรเลื่อนระบบแช่หยุดความเสี่ยง -> ตัวคุมโมดูลเป้าหมายย่อย -> ตูดคอลัมน์แสดงรายการสินทรัพย์"
      },
      aiOpportunities: {
        en: "Generate proactively tailored daily nudges (e.g., 'Cortisol Sunday Decompression Wave predicted') based on historical mid-week and weekend stress thresholds.",
        th: "ประมวลผลประเมินหาภาวะเร้าทางอารมณ์จากสัญชาตญาณตามเวลา (เช่น คาดการณ์ภาวะเค้นหน่วงล้าเย็นวันอาทิตย์) และเตรียมเกราะป้องกันประคบประหงม"
      },
      monetizationOpportunities: {
        en: "Tease Elite-level 'Money Twin Blueprint Matrix' and 'Scenario Simulation' within the proactive recommendation deck to create desire inside core users.",
        th: "จัดสัดส่วนทดลองเรียกใช้ข้อมูลคู่แฝดดิจิทัล (Money Twin Projections) และรันรอดความเสี่ยงชั่วคราวเพื่อชักชวนอัปเกรดสถานะพรีเมียมขั้น Elite"
      },
      behavioralOpportunities: {
        en: "Promote and gamify the '24-hour Cooling Lock' to actively delay dopamine spending, scientifically destroying 91% of impulsive checkout urges.",
        th: "ประคับประคองพฤติกรรมผ่านกฎหน่วงเวลา 'คูลดาวน์ล็อก 24 ชม.' เพื่อทำลายการจ่ายตอบสนอง Dopamine ชั่ววูบได้สูงถึง 91% ทันที"
      },
      emptyState: {
        en: "Displays a centered neon-ring blueprint overlay inviting the user to make their first deposit: 'Unfunded Orbit: Deploy a reserve buffer to begin habit analytics.'",
        th: "กรณีห้องนิรภัยว่างเปล่า: แสดงกล่องแนวโมเดิร์นแจ้งรอนอกระบบ 'โหนดปราศจากกระแสหลัก: สมทบทุนครั้งแรกเพื่อติดไฟวิเคราะห์พฤติกรรมวินัยคุณ'"
      },
      loadingState: {
        en: "Exhibits modern geometric skeletal outline segments matching exact bento card dimensions with a high-contrast futuristic shimmering overlay.",
        th: "กล่องโมเดิล Skeleton สระกระแสงามสลึมสลัวลากเลื่อนตามช่องบ็อกซ์ คุมความสมมาตรแบบฉบับไฮเอนด์"
      },
      errorState: {
        en: "Displays a warning card with diagnostic code error: 'INTEGRITY_SHIELD: Connection interrupted. Click Re-auth protocol to re-establish shield.'",
        th: "การเกิดปัญหาทางเทคนิค: ผลิตการ์ดตักเตือนระบบล้มเหลว 'ขัดข้องการเชื่อมโหนด: ขาดการสตรีมฟีดหลัก กรุณากดปุ่มเพื่อสถาปนาเกราะป้องกันคุณใหม่'"
      },
      successState: {
        en: "A vibrant neon green checklist confirmation card with interactive sound option: 'PROTOCOL_EXECUTED: Buffer updated successfully. XP incremented.'",
        th: "แผ่นบล็อกสีเขียววาวสปาร์ก แสดงความยินดีอนุมัติเรียบร้อยสิบส่วน 'โปรโตคอลความประพฤติเสร็จสิ้น: ยอดสำรองแปรผันแล้ว เพิ่มแต้ม XP ทันสมัย'"
      },
      mobileWireframe: {
        en: "Single vertical scroll with fixed top premium wallet dashboard and floating bottom Monzo-style ergonomic layout bar.",
        th: "คอลัมน์แนวตั้งเรียบเดี่ยว กระเป๋าเงินซ้อนด้านบน แผงเมนูคาร์บอนปัดถูมือเดียวด้านล่างขนาดนิ้วสัมผัส 44px แข็งแกร่ง"
      },
      tabletAdaptation: {
        en: "Bento cards wrap into a balanced 3-column dashboard arrangement, minimizing whitespace and maintaining visual rhythm across the viewport.",
        th: "กระจายการ์ดยอดคลังออกเป็นแนวข้างแบบ 3 คอลัมน์สมมาตร รักษาระยะบีบอัดหน้าต่างให้สวยเด่น"
      },
      accessibilityNotes: {
        en: "Exceeds standard AA contrast ratios using stark off-white texts on cosmic charcoal background paired with pure #C7FF2E bright visual labels.",
        th: "ให้แสงสว่างขั้วความต่างตัวอักษรสูงชัดตา ใช้แบบแร่สีทองเหลืองสะท้อนแสงไฟบนพื้นควันถ่าน เพื่อให้อ่านประมวลผลวิเคราะห์ง่ายดาย"
      },
      kpiImpact: {
        en: "Increases Daily Active Users (DAU) by 28% and cuts weekend impulsive expenditure rates through direct cooling-lock prompts.",
        th: "ดึงอัตราขยับตัวการทำงานวันละสองครั้ง (DAU) ปรับบวก 28% และลดทอนกระแสเสียเงินเปล่าในช่วงเย็นเสาร์อาทิตย์อย่างสัมฤทธิผล"
      },
      fbisImpact: {
        en: "Improves overall FBIS score by dynamically rewarding consistency in goal setting and active limit-respecting routines.",
        th: "หนุนให้คะแนน FBIS ขยับเติบโตเมื่อผู้ใช้ตั้งเป้าวินัยสำเร็จอย่างสม่ำเสมอและคุมระดับก้อนกระตุ้นไม่ลึกเกินคลัง"
      },
      upgradeImpact: {
        en: "Drives Elite conversion by displaying real-time simulation output previews in the home context.",
        th: "เพิ่มอัตราแปรพักตร์ออเดอร์สู่แผน Elite สูงสุดเมื่อผู้ใช้เล็งเห็นคุณค่าระดับสมองที่วิจัยเทียบเคียงตัวตนอนาคต"
      }
    }
  },
  activity: {
    id: "activity",
    nameEn: "Activity: Habit Logging Ledger",
    nameTh: "บันทึกสติ: บัญชีแยกประเภทพฤติกรรมอารมณ์",
    specs: {
      screenObjective: {
        en: "Log and review transaction details mapped to emotional states rather than standard dry financial categorizations.",
        th: "บันทึกและพิจารณารายการธุรกรรมโดยผูกมัดสถานะสติสัมปชัญญะและอารมณ์ผู้รับ แทนที่การแบ่งประเภทเชิงตัวเลขแห้งๆ"
      },
      businessObjective: {
        en: "Capture premium emotional context data points to construct accurate long-term behavioral models and highlight why users suffer budget drift.",
        th: "สะสมฐานข้อมูลระดับอารมณ์ผู้ใช้เพื่อนวดหาโครงโมเดลระยะยาว ชี้เป้ารูแหว่งสำคัญที่ดึงให้ประวัติงบล้นพอร์ท"
      },
      userObjective: {
        en: "Easily log unplanned expenses, classify emotional drivers, explain buying thoughts, and view behavioral XP accumulation progress.",
        th: "ประทับตราจารึกเงินออกจากตัว วิเคราะห์ตัวเร้าอารมณ์อย่างลื่นไหล ถอดความคิดในการซื้อของ และชมผลตอบแทนค่าคะแนนเลเวลของคุณ"
      },
      userPsychology: {
        en: "Self-confrontation with kindness: Forgiving past impulsive expenditure by explaining 'Why', removing tracking anxiety and boosting accountability.",
        th: "การตระหนักรู้ยอมรับตัวเองเป็นมิตร: ค้นหาสารเหตุเบื้องลึกผ่านกล่องจดสาระ 'ทำไมคุณจึงซื้อ' ลดความกระวนกระวายใจสติและยกระดับคุณ"
      },
      informationArchitecture: {
        en: "1. Level and XP Progress Gauge; 2. Current Habit Streak Indicator; 3. Search Bar; 4. Emotional Categorization Pills; 5. Interactive Ledger List; 6. Floating 'Log Mindful Outflow' launcher button.",
        th: "1. แผงควบคุมเลเวลและค่า XP ผงาดสติ; 2. ข้อมูลเช็กอินสม่ำเสมอเป็นรอบสัปดาห์; 3. กล่องค้นคว้า; 4. ปุ่มเลือกสลักกลุ่มอารมณ์ด่วน; 5. คลังรายการบันทึกอัญเชิญสติ; 6. แถบกระตุ้นสร้างตัวแปรโอนเงินสมทบใจ"
      },
      layoutStructure: {
        en: "Stark ledger card layout. Top: luxury metallic stat tracker detailing current level bounds. Middle: horizontal scroll filter indicators. Main: clean vertical spreadsheet logging entries.",
        th: "แผ่นสมุดพับแยกประเภท ด้านบนคุมแผงเกจค่า XP มอบความพรีเมียมสีเหล็กกล้า ช่วงสองโชว์ตัวกรองกลุ่มแถบเลื่อน และช่วงล่างแสดงประวัติ"
      },
      componentHierarchy: {
        en: "Biometric Stats Panel -> Search Input -> Filter Switcher -> Transaction Cards -> Drawer Add Outflow Form.",
        th: "กล่องข้อมูลเลเวลนักกระทำ -> ช่องกรอกค้นหา -> จุดคัดอารมณ์ -> คอลเลกชันรายการจารึกสติ -> บานหน้าต่างซ้อนสลักยอดบันทึกใหม่"
      },
      aiOpportunities: {
        en: "AI scans 'Why' string entries to cluster cognitive patterns (e.g. 'Struggled under high overtime workloads' -> Emotional Stress retail therapy category).",
        th: "ปัญญาประดิษฐ์คอยอ่านจุดเขียนจดเหตุผล 'เพราะอะไร' เพื่อจำแนกประเภทจุดตกหลุมระดับอารมณ์คุณได้อย่างแม่นยำแท้จริง"
      },
      monetizationOpportunities: {
        en: "Lock retro-active emotional analyses beyond 7 items behind the Premium OS tier, presenting a luxury lock overlay screen.",
        th: "จำกัดการไล่เรียกดูประวัติถอดรหัสอารมณ์ย้อนหลังเกินกว่า 7 แถวในแผนธรรมดา เพื่อให้ผู้ใช้ตัดสินใจยกระดับ Premium OS แสนเอ็กซ์คลูซีฟ"
      },
      behavioralOpportunities: {
        en: "Award instant XP points (+20 for mindful investment, +15 for explaining 'Why' spend regrets) to build a feedback reward loop for tracking integrity.",
        th: "ตบรางวัลเพิ่มคะแนน XP (+20 สำหรับสินทรัพย์เพื่อวินาคต +15 สำหรับการสลักชี้แจงเหตุมือไว) เสริมลูปนิสัยสัญชาตญาณเชิงบวกยิ่งขึ้น"
      },
      emptyState: {
        en: "Displays a clean monochrome ledger sheet illustration: 'Clear Slate: No emotional outlays recorded. Enjoy absolute dopamine sovereignty today.'",
        th: "กรณีประวัติเป็นศูนย์: โชว์ลายกระดาษจารึกว่างเปล่าสงบนิ่ง 'จิตว่างสงบนิ่ง: ยังไม่มีรายการขยับเงินที่เจืออารมณ์ยินดีหรือกังวล ขอให้เปี่ยมไปด้วยประสิทธิผลวันนี้'"
      },
      loadingState: {
        en: "Generates multiple shimmering bars mimicking tabular ledger layouts, with circular avatar frame skeletons easing in synchronously.",
        th: "สร้างกล่องเปล่งประกายสีทับซ้อนกัน นำแถบสี่เหลี่ยมคางหมูลากคลอนเลื่อมไปมาแบบโมเดิร์นคุมอัตราความถี่"
      },
      errorState: {
        en: "Renders red diagnostics overlay: 'LEDGER_OUT_OF_SYNC: Session memory boundary exceeded. Clear client cache rules to reload structural ledger.'",
        th: "กล่องแจ้งข้อยกเว้นการประมวลผล 'บัญชีแยกประเภทขาดการซิงค์: ขีดจำกัดพื้นที่จัดเก็บของอุปกรณ์เต็มรอบ คลีนค่าเซสชั่นเพื่อดาวน์โหลดข้อมูลจัดเก็บบัญชีใหม่'"
      },
      successState: {
        en: "Displays static green biometric stamp confirming transaction was sealed: 'TRANSACTION_EMOTION_SEALED: Core reserve and level XP updated.'",
        th: "ภาพปั๊มตราระดับมาตรฐานสากลสีทองวาววับรอบด้าน 'บัญชีสลักอารมณ์เสร็จสมบูรณ์: ปรับปรุงกองคลังสำรองและเติมแต้มสมรรถภาพเข้าเลเวลแล้ว'"
      },
      mobileWireframe: {
        en: "Optimized touchscreen inputs with generous finger padded cards (minimum 44px) and full-height interactive sliding detail dialog sheets.",
        th: "ขยายขนาดปุ่มแตะและหมวดวิเคราะห์อารมณ์บนสมาร์ทโฟนให้มีขนาดใหญ่ขึ้น ใช้งานคล่องด้วยมือเดียวอย่างถนัดหน้าจอ"
      },
      tabletAdaptation: {
        en: "Converts ledger into dual column split focus: left showing live ledger entries, right instantly presenting live selected emotional breakdown charts.",
        th: "เบี่ยงหน้าจอแท็บเล็ตเป็นสองซีก ซ้ายรันรายการบันทึกสติล่าสุด ขวาแสดงแผนภูมิและรายละเอียดของประวัติรายการที่คลิก"
      },
      accessibilityNotes: {
        en: "Includes screen-reader label tags specifying emotional classifications and color semantic contrasts for visual impairment modes.",
        th: "ติดป้ายระบุสัญลักษณ์ทางเสียงเพื่อแยกแยะชนิดกลุ่มอารมณ์ (Impulse, Joy, Stress) สะดวกง่ายต่อโหมดช่วยเล็งและสกรีนรีดเดอร์อ่านสถิติ"
      },
      kpiImpact: {
        en: "Maintains high weekly tracking fidelity, increasing active habit logging retention rates on platform by 34%.",
        th: "เหนี่ยวรั้งความประพฤติสติให้เข้าที่ออมเกราะ ช่วยบวกสถิติการใช้งานต่อเนื่องในสัปดาห์ถัดๆ ไป (Retention) เพิ่มขึ้นอีก 34%"
      },
      fbisImpact: {
        en: "Promotes Budget Adherence metrics and tracks Habit Consistency rating directly contributing to total behavior score.",
        th: "ประชดตัววัดประสิทธิภาพการใช้งบทรายและการรักษาวินัยความประพฤติสถิติมั่งคั่ง ตกแต่งคะแนน FBIS ให้สมดุลมั่นคง"
      },
      upgradeImpact: {
        en: "Displays teasing indicators when standard users select premium emotion types like 'Investment' or high value categories, steering upgrades.",
        th: "สะกิดเตือนอรรถประโยชน์ชั้นเลิศเมื่อแตะวิเคราะห์ความมั่นคงในหมวดพรีเมียม เพื่ออธิปไตยทางการคลังสุดคุ้มครอง"
      }
    }
  },
  insights: {
    id: "insights",
    nameEn: "Insights: Coping Diagnostic Center",
    nameTh: "วิเคราะห์ผล: ศูนย์วิเคราะห์พฤติกรรมและความเสียใจ",
    specs: {
      screenObjective: {
        en: "Provide comprehensive psychological analytics reflecting the correlation between spending habits and emotional coping strategies.",
        th: "จัดหาชุดเครื่องมือถอดพฤติกรรมภาพรวมวิเคราะห์อารมณ์ เพื่อชี้ความสัมพันธ์ของการใช้เงินกับการผ่อนคลายวิกฤตแรงกดดันสะสมของผู้ใช้"
      },
      businessObjective: {
        en: "Visually validate the 'Understanding' core promise, turning raw behavior history into actionable intelligence that builds high trust for Pro and Elite tiers.",
        th: "สร้างภาพความถูกต้องตามคำสัญญา 'ด่านความเข้าใจอัจฉริยะ' เปลี่ยนบันทึกชีวิตดาดๆ ให้กลายเป็นความรู้ชั้นพิเศษ เพิ่มความไว้ใจช็อป Pro/Elite"
      },
      userObjective: {
        en: "Understand spending density by categories, dopamine outlays, Wednesday/weekend risk factors, and custom stress analysis profiles.",
        th: "เข้าใจสัญชาตญาณความเสี่ยงช่วงกลางสัปดาห์ อัตราปล่อยก้อนเงินระบายอารมณ์ ค่าใช้จ่ายหนาแน่น และรายงานผลการตรวจการเค้นจาก AI"
      },
      userPsychology: {
        en: "Clarity replaces denial. Seeing stress-release spending patterns explicitly shown enables structural behavior modification.",
        th: "ความเข้าใจเข้ามาทำลายความดื้อดึง: การเห็นพิมพ์เขียวของพฤติกรรมใช้เงินระบายออกช่วยหนุนสติให้ยอมรับและปรับพฤติกรรมกว้างขวาง"
      },
      informationArchitecture: {
        en: "1. Premium Tab Switcher (Analytics / Behavioral); 2. Expenditure Calculation & Regrets Scorecard; 3. Category Bar Chart Density representation; 4. Dopamine Outflow trend panel; 5. AI Coping Economy Diagnostic report.",
        th: "1. คีย์บอร์ดเลือกสลับหมวดวิเคราะห์ (สถิติตัวเลข / จิตวิทยาอัจฉริยะ); 2. ยอดวิเคราะห์แรงกระเพื่อมรวมสะสม; 3. แผนภูมิวิเคราะห์ระดับความหนาแน่น; 4. ข้อมูลสรุปแนวโน้มการควบคุมอารมณ์; 5. เอกสารประเมินวินิจฉัยความเครียดสะสมจาก AI"
      },
      layoutStructure: {
        en: "Double column dynamic format. Left: detailed vertical index and percentage bars describing categorical drift. Right: emotional trend analytics and premium upgrade lockers.",
        th: "แผนการกริด 2 ซีกฉลาดกระฉับกระเฉง ซ้ายคุมดัชนีค่าน้ำหนักตัววัดเปอร์เซ็นต์หมวดสินทรัพย์ ขวารันกระดานคอยดักวินิจฉัยสติสัมปชัญญะปนเปสมอง"
      },
      componentHierarchy: {
        en: "Tab Switcher -> Calculated Spending Value Widget -> Bar Chart list -> Dopamine stats card -> Behavioral Diagnostic Document.",
        th: "ปุ่มคัดหมวดสับเปลี่ยนสถิติ -> กล่องรวมยอดดัชนีระบายเสียเปล่า -> กราฟแท่งจัดสัดส่วน -> การ์ดสารประคองโดปามีน -> บันทึกวินิจฉัยทางการแพทย์การเงิน"
      },
      aiOpportunities: {
        en: "Proactively calculate predicted annual savings by rerouting emotional Wednesday escapism into active wellness methods.",
        th: "ประณอมคะแนนเทียบเคียงเพื่อหักเหค่าเสียใจยามค่ำคืนเปลี่ยนเป็นออมตราสารดัชนี คาดการณ์ยอดสะสมเฉลี่ยรายปีเพิ่มคุ้มครองพอร์ต"
      },
      monetizationOpportunities: {
        en: "Lock the complete 12+ month historical correlation matrix behind active Pro/Elite tiers, displaying a luxury glassmorphic overlay over complex graphs.",
        th: "สวมเกราะพรีเมียมล็อกความสามารถการกางเส้นกราฟเปรียบเทียบเชิงจิตวิทยายาวเกินกว่า 30 วัน หนุนความคลั่งผู้รักษาบัญชีสิทธิภาพ Elite"
      },
      behavioralOpportunities: {
        en: "Display a specific call-to-action warning recommending the user set a Wednesday tech limit to directly counteract emotional tech outlay peaks.",
        th: "จัดหาปุ่มสะกิดใจและคำแนะนำสกัดกั้นทันตาดั่งด่านปราการ ปลุกจิตสำนึกให้จำกัดคลังการช็อปไอทีเย็นวันพุธยามวิกฤต"
      },
      emptyState: {
        en: "Displays a beautiful clinical diagnostics template folder: 'Diagnostic Core Standby: Complete at least 3 emotive entries into your ledger to compile behavioral diagnostics.'",
        th: "กรณีข้อมูลไม่พอมัดรายงาน: ประดิดประดอยกล่องแจ้งเรื่อง 'ระบบวินิจฉัยสแตนด์บาย: กรุณาจดสลักบันทึกสติแนบประเภทอารมณ์พฤติกรรมเพิ่ม 3 รายการขึ้นไป'"
      },
      loadingState: {
        en: "Shows multiple shimmering skeletal rows mirroring vertical graphs alongside circular trend pulse outline frames fading in smoothly.",
        th: "กล่องแสดงตัวอย่างแกนชาร์ตแท่งเลื่อนฉายแสงสีทองจางพราวตา สอดคล้องวิสัยทัศน์ระดับสตูดิโอลักชัวรี"
      },
      errorState: {
        en: "Renders dark clinical warning: 'DIAGNOSTIC_FAULT: Failed to resolve complex behavioral clusters. Restructure cognitive parameters to retry analysis.'",
        th: "การประเมินวิเคราะห์ขัดแย้ง: 'การถอดพิมพ์เขียวไม่เสร็จสิ้น: ล้มเหลวกับการจับกลุ่มดัชนีสติใจคอ ล้างพอร์ตจดสถิติขยะภายนอกเพื่อลองรันระบบสะท้อนภาพใหม่'"
      },
      successState: {
        en: "Displays dynamic checklist showing diagnostic integrity completed: 'DIAGNOSTICS_COMPILED: Personality Archetype parameters parsed successfully.'",
        th: "ภาพแอนิเมชั่นจดตราอนุมัติเรียงร้อยตัวอักษรสีเขียวนีออน 'ประมวลผลดัชนีจิตวิทยาการเงินของคุณสำเร็จ: พร้อมเปิดเรียกดูแผนปรับพฤติกรรมอันทรงคุณค่าสูงสุด'"
      },
      mobileWireframe: {
        en: "Taps responsive, fluidly wrapping elements. Touch friendly progress meters and card modules stacked neatly as single scroll layouts.",
        th: "กระดานแนวดิ่งสมมาตรปรับกระชับขยายตารางแสดงสัดส่วนบาร์ชาร์ตให้ชิดแนวเกราะพอดีสายตาบนหน้าจอโทรศัพท์ขนาดพกพา"
      },
      tabletAdaptation: {
        en: "Transforms the layout into a multi-column bento setup, distributing analytics on the left and comprehensive trauma/stress metrics on the right.",
        th: "แผ่ขยายการ์ดสแกนจิตสำนึกเป็นสองขั้วกว้างเด่นชัด จัดวางน้ำหนักแท่งกราฟไว้ทางปีกระดานระเบียบเพื่อรักษาระดับการเข้าสายตาดีเลิศ"
      },
      accessibilityNotes: {
        en: "Supports high-contrast text tags, explicit ARIA role structures for all custom tab button switches, and keyboard tab control support.",
        th: "สนับสนุนรหัสข้อกำหนด ARIA และใช้สีคุมแสงเรืองตาประทับแท็กชัดเพื่อผู้ป่วยสมาธิสั้นหรือผู้มีปัญหาด้านการจำแนกชนิดสี"
      },
      kpiImpact: {
        en: "Increases user confidence score levels and directly drives Pro subscription conversion velocity, improving trust metrics by 41%.",
        th: "เร่งและผลักดันรอบความเข้าใจของผู้ใช้ให้ตัดสินใจชำระยอดซื้อแผน Pro Operating System สูงขึ้นประทับแบรนด์เฉลี่ย 41%"
      },
      fbisImpact: {
        en: "Directly diagnostic impacts Budget Drift, Goal Drift, and Spending Discipline indexes contributing up to 45% of total behavioral weight.",
        th: "ช่วยตรวจตราเจาะลึกพฤติกรรมวู่วามชั่วระยะ มอบผลดีต่อสัดส่วน Spending Discipline ในดัชนีคะแนนพฤติกรรม FBIS โดยตรง"
      },
      upgradeImpact: {
        en: "Showcases standard lock masks with golden elite glow gradients to spark elite transformation desires.",
        th: "สวมโมดูลผ้าคลุมเกราะสีทองกระจกเงา ทาบทับชุดข้อมูลประวัติประจำสัปดาห์ขั้นลึก กระตุ้นความภักดีแปรความฝันสู่นิทัศน์ Elite"
      }
    }
  },
  radar: {
    id: "radar",
    nameEn: "AI Coach: Financial Operating Mind",
    nameTh: "โค้ชประคบจิต: สมองปฏิบัติการวิเคราะห์ปัญญาประดิษฐ์",
    specs: {
      screenObjective: {
        en: "Engage the user in tactical, advanced conversational guidance tailored to their emotional archetype and financial vulnerabilities.",
        th: "ชวนพูดคุยสวมฐานเปรียบเสมือนพาร์ทเนอร์แนะนำเป้าหมายอย่างลึกซึ้ง เหมาะกับกลุ่มแบบแผนของเอกลักษณ์อัจฉริยะประคองพฤติกรรม"
      },
      businessObjective: {
        en: "Validate the premium 'Transformation' value proposition through custom, high-context AI dialogue, prompting and securing Elite tier retention values.",
        th: "สะท้อนความงดงามสูงสุดแห่งคุณค่าพรีเมียม Elite 'Transformation' ผ่านบทสนทนาเปี่ยมลอจิกและพลังเกลี้ยกล่อม พยุงรักกลุ่มสมาชิกระดับพรีเมียม"
      },
      userObjective: {
        en: "Consult their financial accountability partner, receive personalized scenario predictions, view their identity analysis radar, and calibrate cognitive parameters.",
        th: "ปรึกษารือเสวนาพฤติกรรมใจร่วมกับโค้ชสเปกตรัมส่วนตัว เรียกค่านัยนิทัศน์ตัวตนคู่แฝดเสมือน และคาลิเบรตตั้งตัวชี้วัดจิตตัวเอง"
      },
      userPsychology: {
        en: "Non-judgmental companionship. Replacing the cold corporate banking agent with an understanding advisor that helps rebuild financial integrity.",
        th: "สัมพันธภาพปราศจากความลำเอียง: หลบหนีความแสนชาเย็นของพนักงานแบงก์หน้าเคาน์เตอร์ และก้าวสู่ห้องสมาคมเกื้อหนุนฟื้นฟูจิตวิญญาณกระเป๋าใหม่"
      },
      informationArchitecture: {
        en: "1. Identity Radar Summary card; 2. Biometric Indicators sliders; 3. Conversational Chat Console with streaming alerts; 4. Infinite Memory upgrade trigger; 5. Quick scenario simulation shortcuts.",
        th: "1. การ์ดแสดงกลุ่มตัวตนสลักจิตวิทยา; 2. หมุดเลื่อนชีวมาตรสติควบคุมนิสัย; 3. โซนควบคุมแชทถามตอบอารมณ์สด; 4. ปุ่มเลื่อนค้ำความทรงจำอัจฉริยะ; 5. คีย์บอร์ดข้อแนะนำกลยุทธ์แฝดเสมือน"
      },
      layoutStructure: {
        en: "Dynamic split dashboard. Top vertical layer outlines archetype metrics and slider settings. Lower portion houses a grand Apple Messaging style responsive layout chat interface with glassmorphism gradients.",
        th: "แผ่นควบคุมดิวสองขั้วยอดนิยม ด้านบนเฉียนกล่องระบุพิมพ์เขียวบุคลิกและสไลเดอร์ถอดคะแนน ด้านล่างครองกล่องแชทพิมพ์สนทนาดีไซน์แบรนด์หรูหราอัจฉริยะ"
      },
      componentHierarchy: {
        en: "Archetype Breakdown Card -> Interactive Slider Metrics -> Conversation Header Panel -> Chat Message Scroller -> Input Console and Send Node.",
        th: "การ์ดทบทวนแบบแผนอัตลักษณ์ -> แถบวัดสัญชาตญาณเลื่อนได้ -> เส้นกั้นแชทอุ่นเครื่องระบบ -> ประวัติกระดานฟองแชทไหลเลื่อน -> ถาดคีย์บอร์ดพร้อมคลิกพิมพ์"
      },
      aiOpportunities: {
        en: "Infinite follow-up capability proxying actual transaction context directly into advice strings (e.g. 'Since we see your Wed Gadgets outflow at +22%, let us...').",
        th: "เปิดไฟความรอบรู้ให้ปัญญาประดิษฐ์สอดส่องและนำตัวแปรยอดใช้จ่ายล่าสุดของคุณเข้าประกอบบทสนทนา (เช่น 'เนื่องจากประวัติชี้พรรณนาไอทีกระตุกพอร์ตล้นเกณฑ์กลางสัปดาห์...')"
      },
      monetizationOpportunities: {
        en: "Lock infinite messaging history and deep contextual memory capabilities inside the Elite plan, showing an elegant 'Upgrade to Elite' gate context card.",
        th: "สวมกู้รหัสเกราะความจำแสนวิวัฒน์ยาวนานและประเด็นลึกสุดในการปรึกษาพฤติกรรม ไว้ในสัญญา Elite Operating System อัตราระดับเอฟดับเบิลยู"
      },
      behavioralOpportunities: {
        en: "Utilize specific coaching prompts (e.g., Money Twin simulation parameters) to provide real-time behavioral guidance, stimulating healthy saving habits.",
        th: "จัดหาปุ่มกลยุทธ์จำลองพฤติกรรม (เช่น คีย์ลัดทดสอบแฝดสำรองคุณ) เพื่อจำลองผลตอบแทนกระแสเงินระยะยาวให้เห็นจับต้องได้ทันที"
      },
      emptyState: {
        en: "Exhibits a clean tech radar graphic outline: 'Conscious Core Ready: Initialize conversation below to calibrate your tactical future self.'",
        th: "กรณีเพิ่งเข้ามาเงียบสงบ: แสดงกรอบหน้าจอโปร่งแสงระบบชีวมาตร 'วิญญาณแห่งปัญญาประดิษฐ์สแตนด์บาย: เริ่มพิมพ์คำถามทักทายแรกของคุณเพื่อคาลิเบรตเป้าหมาย'"
      },
      loadingState: {
        en: "Shows multiple pulsing concentric ring outlines and shimmering chat message bubble templates to mimic live thought processing.",
        th: "ภาพคลื่นวงแหวนเรดาร์และฟองจำลองกะพริบไล่ระดับ สลับความเคลื่อนไหวจำลองโมเดลเค้นสมองคิดตรรกะระดับสากล"
      },
      errorState: {
        en: "Displays static diagnostics warning: 'REASONING_ENGINE_FAULT: Core cognitive models are overloaded. Reconnect to restore live guidance.'",
        th: "ความบกพร่องในระบบคำนวณตรรกกรรมเชิงจิตวิทยาการเงิน: 'โมเดลสมองขัดแย้ง: เผชิญระดับตัวเลขประเมินล้นเกณฑ์เชื่อมโอนกรุณากดสยบรันโปรโตคอลใหม่'"
      },
      successState: {
        en: "Displays a golden star stamp showing calibration concluded: 'COGNITIVE_CALIBRATION_SYNCHRONIZED: Premium guidance fully active.'",
        th: "แสตมป์ทองแร่วาวสว่างฉ่ำตราตรึง 'ซิงค์คาลิเบรตระดับตรรกการคุ้มคราพอร์ตเสร็จสิ้น: ปลดล็อกช่องทางสื่อสารพิเศษเรียบร้อยบริบูรณ์'"
      },
      mobileWireframe: {
        en: "Optimizes input tray spacing to ensure soft keyboard does not block active chat items, keeping active dialog thread visible with a minimum height.",
        th: "ประคับประคองฐานความสูงถาดพับพิมพ์ ยืดหดสลิมให้เข้ากับหน้าต่างคีย์บอร์ดเสมือนบนจอมือถือไม่บดบังประวัติหัวข้อเสวนา"
      },
      tabletAdaptation: {
        en: "Converts dashboard layout into dual-column panel arrange with radar charts spanning on the left, and grand full-width chat console sweeping the right pane.",
        th: "แผ่โครงสลักกระดานเป็นซีกผ่า ซีกซ้ายกางวิเคราะห์สไลเดอร์หมุดอารมณ์ ซีกขวายกแผงพิมพ์เสวนาแชทอย่างกว้างขวางมีศิลปะ"
      },
      accessibilityNotes: {
        en: "Full accessibility focus on aria-live speech areas and screen-reader anchors to seamlessly read stream generated message outputs.",
        th: "สนับสนุนระบบเสียงอ่านออกความเห็น (Screen Reader) ไหลเลื่อนอัตนัยตามบรรทัดประมวลผลข้อความใหม่ได้อย่างเป็นสุขและมั่นคง"
      },
      kpiImpact: {
        en: "Promotes higher Elite membership retention levels by 25% and improves the average FBIS rating through constant tactical guidance.",
        th: "กระชากความเหนียวแน่นสมาชิกชั้นนำอัปเกรดแผน Elite ปรับบวกขึ้น 25% และช่วยผลักดันให้เกิดพฤติกรรมควบคุมได้ดีขึ้นในกรอบสติ"
      },
      fbisImpact: {
        en: "Positively targets Habit Consistency and Goal Progress metrics, boosting the core score by up to 22 index points.",
        th: "ส่งอานิสงส์ดีลึกถึงส่วน Habit Consistency ของ FBIS เพิ่มระดับสถิติตัววัดดัชนีวินัยพฤติกรรมกว้างเฉลี่ย 22 คะแนน"
      },
      upgradeImpact: {
        en: "Drives upgrade conversions with clear lockers on infinite chat memory and premium 'Scenario Simulator' prompts.",
        th: "เร่งและสะกดตาผู้ชมด้วยขอบทองม่านกระจกสะดุดใจเมื่อผู้ใช้กดแตะทดสอบคาลิเบรตพฤติกรรมอนาคตนิทัศน์"
      }
    }
  },
  coachHistory: {
    id: "coachHistory",
    nameEn: "AI Memory Coaching: Conversation Archive",
    nameTh: "ความจำโค้ช AI: คลังบทสนทนา",
    specs: {
      screenObjective: {
        en: "Provide a comprehensive archive of all past AI coaching sessions with search, filtering, and detailed session insights to help users track their behavioral growth over time.",
        th: "จัดหาคลังบทสนทนาโค้ช AI ทั้งหมดพร้อมระบบค้นหา กรองข้อมูล และรายละเอียดเซสชัน เพื่อช่วยผู้ใช้ติดตามการเติบโตพฤติกรรมของตนเองตามกาลเวลา"
      },
      businessObjective: {
        en: "Validate the 'Infinite Memory' premium promise by showcasing the depth and value of historical coaching interactions, driving Elite tier retention and upgrade conversions.",
        th: "ตอกย้ำคำสัญญาพรีเมียม 'ความจำอนันต์' โดยแสดงความลึกและคุณค่าของประวัติการโค้ช เพื่อขับเคลื่อนการรักษาสมาชิกและอัปเกรดสู่ Elite"
      },
      userObjective: {
        en: "Review past coaching conversations, track action items, measure progress against recommendations, and access historical insights for self-reflection.",
        th: "ทบทวนบทสนทนาโค้ชในอดีต ติดตามรายการสิ่งที่ต้องทำ วัดผลเทียบกับคำแนะนำ และเข้าถึงข้อมูลเชิงลึกทางประวัติเพื่อสะท้อนตนเอง"
      },
      userPsychology: {
        en: "Progress visualization creates motivation loop: seeing past struggles resolved builds confidence and reinforces continued behavioral commitment.",
        th: "การแสดงภาพความก้าวหน้าสร้างวงจรแรงจูงใจ: การเห็นปัญหาในอดีตที่ได้รับการแก้ไขแล้วสร้างความมั่นใจและเสริมความมุ่งมั่นพฤติกรรมอย่างต่อเนื่อง"
      },
      informationArchitecture: {
        en: "1. Stats Overview (Sessions, XP, Streak); 2. Topic Breakdown Chart; 3. Search & Filter Bar; 4. Session List Cards; 5. Expanded Session Detail; 6. Continue Coaching CTA.",
        th: "1. ภาพรวมสถิติ (เซสชัน, XP, วันต่อเนื่อง); 2. แผนภูมิแยกประเภทหัวข้อ; 3. แถบค้นหาและกรอง; 4. รายการการ์ดเซสชัน; 5. รายละเอียดเซสชันขยาย; 6. ปุ่มสานต่อการโค้ช"
      },
      layoutStructure: {
        en: "Vertical scroll layout with sticky header stats. Top: 4-column stat cards. Middle: category breakdown grid and search filters. Main: expandable session cards with accordion detail view.",
        th: "เลย์เอาต์เลื่อนแนวตั้งพร้อมส่วนหัวสถิติติดแน่น ด้านบน: การ์ดสถิติ 4 คอลัมน์ ส่วนกลาง: กริดแยกประเภทและตัวกรอง ส่วนหลัก: การ์ดเซสชันขยายได้พร้อมมุมมองรายละเอียดแบบลูกศร"
      },
      componentHierarchy: {
        en: "Stats Cards -> Category Grid -> Search Input -> Sort Selector -> Session Card -> Expanded Detail Panel -> Continue CTA.",
        th: "การ์ดสถิติ -> กริดประเภท -> ช่องค้นหา -> ตัวเลือกเรียงลำดับ -> การ์ดเซสชัน -> แผงรายละเอียดขยาย -> ปุ่มสานต่อ"
      },
      aiOpportunities: {
        en: "AI generates weekly/monthly coaching summaries automatically, highlighting patterns, progress milestones, and suggested focus areas for next sessions.",
        th: "AI สร้างสรุปการโค้ชรายสัปดาห์/รายเดือนโดยอัตโนมัติ เน้นรูปแบบ ความสำเร็จ และพื้นที่ที่ควรให้ความสนใจสำหรับเซสชันถัดไป"
      },
      monetizationOpportunities: {
        en: "Lock unlimited session history (beyond 30 sessions) behind Elite tier with premium 'Memory Archive' feature for long-term behavioral pattern analysis.",
        th: "ล็อกประวัติเซสชันไม่จำกัด (เกิน 30 เซสชัน) ไว้หลังแผน Elite พร้อมฟีเจอร์พรีเมียม 'คลังความจำ' สำหรับการวิเคราะห์รูปแบบพฤติกรรมระยะยาว"
      },
      behavioralOpportunities: {
        en: "Gamify session completion with XP rewards, streak bonuses, and achievement badges for completing action items from past recommendations.",
        th: "เพิ่มเกมิฟิเคชันให้การเสร็จสิ้นเซสชันด้วยรางวัล XP โบนัสวันต่อเนื่อง และเหรียญรางวัลสำหรับการทำรายการสิ่งที่ต้องทำจากคำแนะนำในอดีต"
      },
      emptyState: {
        en: "Displays elegant empty archive illustration: 'Memory Core Empty: No coaching sessions recorded yet. Start your first conversation to begin building your financial wisdom archive.'",
        th: "แสดงภาพคลังว่างเปล่าสง่างาม: 'ความจำหลักว่างเปล่า: ยังไม่มีเซสชันโค้ชที่บันทึกไว้ เริ่มบทสนทนาแรกเพื่อสร้างคลังปัญญาทางการเงินของคุณ'"
      },
      loadingState: {
        en: "Shows shimmer skeleton cards mimicking session list layout with animated gradient pulse effects for loading state.",
        th: "แสดงการ์ดสkeleton เรืองแสงเลียนแบบเลย์เอาต์รายการเซสชันพร้อมเอฟเฟกต์พัลส์ไล่ระดับสีสำหรับสถานะโหลด"
      },
      errorState: {
        en: "Renders dark diagnostic overlay: 'MEMORY_SYNC_FAULT: Archive retrieval interrupted. Clear session cache and retry to restore coaching history.'",
        th: "แสดงการ์ดแจ้งข้อผิดพลาดสีเข้ม: 'ข้อผิดพลาดการซิงค์ความจำ: การเรียกคลังถูกขัดจังหวะ ล้างแคชเซสชันและลองใหม่เพื่อกู้คืนประวัติการโค้ช"
      },
      successState: {
        en: "Displays golden achievement badge animation: 'ARCHIVE_UNLOCKED: Complete session successfully archived. +XP added to your coaching score.'",
        th: "แสดงอนิเมชันเหรียญรางวัลสีทอง: 'คลังถูกปลดล็อก: เซสชันถูกเก็บถาวรเรียบร้อย +XP ถูกเพิ่มเข้าคะแนนโค้ชของคุณ"
      },
      mobileWireframe: {
        en: "Single column stack with collapsible category filters, full-width session cards, and swipe-to-expand gesture for session details.",
        th: "คอลัมน์เดียวพร้อมตัวกรองประเภทที่ยุบได้ การ์ดเซสชันเต็มความกว้าง และท่าทางปัดเพื่อขยายสำหรับรายละเอียดเซสชัน"
      },
      tabletAdaptation: {
        en: "Two-column layout: left column shows session list, right column displays expanded session details with full recommendation text and action items.",
        th: "เลย์เอาต์สองคอลัมน์: คอลัมน์ซ้ายแสดงรายการเซสชัน คอลัมน์ขวาแสดงรายละเอียดเซสชันขยายพร้อมข้อความคำแนะนำเต็มและรายการสิ่งที่ต้องทำ"
      },
      accessibilityNotes: {
        en: "Full ARIA labels for expandable session cards, keyboard navigation for filters, and screen reader support for session outcomes and action items.",
        th: "ป้าย ARIA เต็มรูปแบบสำหรับการ์ดเซสชันขยายได้ การนำทางด้วยแป้นพิมพ์สำหรับตัวกรอง และการสนับสนุนโปรแกรมอ่านหน้าจอสำหรับผลลัพธ์เซสชันและรายการสิ่งที่ต้องทำ"
      },
      kpiImpact: {
        en: "Increases coaching engagement by 35% and improves session completion rates by showing users their progress history and accumulated wisdom.",
        th: "เพิ่มการมีส่วนร่วมในการโค้ช 35% และปรับปรุงอัตราความสำเร็จของเซสชันโดยแสดงให้ผู้ใช้เห็นประวัติความก้าวหน้าและปัญญาสะสมของตน"
      },
      fbisImpact: {
        en: "Directly contributes to Habit Consistency and Goal Tracking metrics by documenting coaching session outcomes and action item completions.",
        th: "สนับสนุนโดยตรงต่อตัวชี้วัด Habit Consistency และ Goal Tracking โดยบันทึกผลลัพธ์เซสชันโค้ชและการทำรายการสิ่งที่ต้องทำให้สำเร็จ"
      },
      upgradeImpact: {
        en: "Teases unlimited archive access and advanced pattern analysis features behind Elite tier, driving upgrade motivation through 'Memory Archive' desire.",
        th: "ยั่วยวนการเข้าถึงคลังไม่จำกัดและฟีเจอร์วิเคราะห์รูปแบบขั้นสูงไว้หลังแผน Elite ขับเคลื่อนแรงจูงใจอัปเกรดผ่านความต้องการ 'คลังความจำ'"
      }
    }
  },

  moneyTwin: {
    id: "moneyTwin",
    nameEn: "Layer 8: Money Twin Blueprint Matrix",
    nameTh: "Layer 8: พิมพ์เขียว Money Twin Blueprint",
    specs: {
      screenObjective: {
        en: "Show users their Financial Twin persona card, interactive radar chart comparing current vs. ideal behavior across 5 axes, behavioral predictions, and personalized alignment recommendations to drive self-awareness and upgrade intent.",
        th: "แสดงการ์ดตัวตน Financial Twin ของผู้ใช้ เรดาร์คอมพาริซอนเปรียบเทียบพฤติกรรมปัจจุบันเทียบเป้าหมาย 5 แกน การคาดการณ์พฤติกรรม และคำแนะนำปรับแนวส่งเสริมจิตสำนึกและแรงจูงใจอัปเกรด"
      },
      businessObjective: {
        en: "Convert BASIC users to PRO via 3-axis preview teaser; convert PRO users to ELITE via prediction engine and weekly timeline lock.",
        th: "แปลงผู้ใช้ BASIC เป็น PRO ผ่านตัวอย่างเรดาร์ 3 แกน; แปลงผู้ใช้ PRO เป็น ELITE ผ่านเครื่องคาดการณ์และการล็อกไทม์ไลน์รายสัปดาห์"
      },
      userObjective: {
        en: "Understand their behavioral archetype and close the gap between who they are financially and who they aspire to be.",
        th: "เข้าใจแบบแผนพฤติกรรมของตนและเติมเต็มช่องว่างระหว่างสิ่งที่เป็นทางการเงินกับสิ่งที่อยากเป็น"
      },
      userPsychology: {
        en: "Identity projection: Users love seeing their 'financial twin' — a mirror of their behavioral self. The radar chart triggers gamified gap-filling motivation.",
        th: "การฉายตัวตน: ผู้ใช้ชอบเห็น 'Financial Twin' ของตน — กระจกสะท้อนตัวตนพฤติกรรม เรดาร์กระตุ้นแรงจูงใจแบบเกมิฟายเติมช่องว่าง"
      },
      informationArchitecture: {
        en: "Twin Persona Card | Radar Chart (SVG, current vs ideal overlay) | Prediction Engine Card (ELITE) | Recommendations List | Weekly Evolution Timeline (ELITE)",
        th: "การ์ดตัวตน Twin | เรดาร์ (SVG, ปัจจุบันซ้อนเป้าหมาย) | การ์ดเครื่องคาดการณ์ (ELITE) | รายการคำแนะนำ | ไทม์ไลน์วิวัฒนาการรายสัปดาห์ (ELITE)"
      },
      layoutStructure: {
        en: "Upper grid: [Twin Persona Card 4-col | Radar Chart 8-col]. Lower grid: [Recommendations 8-col | Weekly Evolution 4-col]. Prediction card spans full width above lower grid.",
        th: "กริดบน: [การ์ดตัวตน Twin 4 คอล | เรดาร์ 8 คอล] กริดล่าง: [คำแนะนำ 8 คอล | วิวัฒนาการ 4 คอล] การ์ดคาดการณ์ครอบคลุมเต็มความกว้างเหนือกริดล่าง"
      },
      componentHierarchy: {
        en: "TierGateBadge > TwinPersonaCard > RadarSVG > RadarAxisBar > PredictionCard > RecommendationRow > WeeklyTimelineBar",
        th: "TierGateBadge > TwinPersonaCard > RadarSVG > RadarAxisBar > PredictionCard > RecommendationRow > WeeklyTimelineBar"
      },
      aiOpportunities: {
        en: "AI derives the 5-axis values from transaction patterns (impulse count, intent type, spending category, risk score, social ratio). Archetype is fed from interpretation data. Prediction engine uses recent transaction velocity and emotional state.",
        th: "AI คำนวณค่า 5 แกนจากรูปแบบธุรกรรม (จำนวน impulse, ประเภท intent, หมวดหมู่, risk score, สัดส่วนสังคม) Archetype มาจากข้อมูล interpretation เครื่องคาดการณ์ใช้ความเร็วธุรกรรมล่าสุดและสถานะอารมณ์"
      },
      monetizationOpportunities: {
        en: "Tier gate between BASIC (3 axes), PRO (5 axes), and ELITE (predictions + timeline). Upgrade CTA inside recommendation card and timeline lock card.",
        th: "การล็อกระดับระหว่าง BASIC (3 แกน), PRO (5 แกน), และ ELITE (คาดการณ์ + ไทม์ไลน์) CTA อัปเกรดในการ์ดคำแนะนำและการ์ดล็อกไทม์ไลน์"
      },
      behavioralOpportunities: {
        en: "The radar gap visual is a strong behavioral hook — users see exactly how far they are from their ideal and are driven to close it. Weekly timeline creates longitudinal engagement.",
        th: "ช่องว่างเรดาร์เป็นตะขอพฤติกรรมที่แข็งแกร่ง — ผู้ใช้เห็นชัดว่าอยู่ห่างจากเป้าหมายเท่าไรและถูกขับเคลื่อนให้เติมเต็ม ไทม์ไลน์รายสัปดาห์สร้างการมีส่วนร่วมยาวนาน"
      },
      emptyState: {
        en: "Shows skeleton radar with pulsing placeholder axes and a prompt: 'Twin is calibrating — log 5+ transactions to reveal your Financial Twin radar.'",
        th: "แสดงเรดาร์สkeleton พร้อมแกนตำแหน่งเต้นและข้อความ: 'Twin กำลังปรับเทียบ — บันทึกธุรกรรม 5+ รายการเพื่อเปิดเผยเรดาร์ Financial Twin'"
      },
      loadingState: {
        en: "Animated shimmer sweep over radar SVG and recommendation cards. Twin persona card shows skeleton avatar.",
        th: "เอฟเฟกต์ shimmer ปาดผ่านเรดาร์ SVG และการ์ดคำแนะนำ การ์ดตัวตน Twin แสดงสkeleton avatar"
      },
      errorState: {
        en: "Displays 'TWIN_SYNC_FAULT: Financial archetype analysis interrupted. Retrying connection to behavioral core.' with retry button.",
        th: "แสดง 'TWIN_SYNC_FAULT: การวิเคราะห์แบบแผนการเงินถูกขัดจังหวะ กำลังลองเชื่อมต่อแกนพฤติกรรมอีกครั้ง' พร้อมปุ่มลองใหม่"
      },
      successState: {
        en: "Shows a fully rendered radar with all 5 axes filled, green glow pulse animation on the twin card, and a 'Twin Aligned!' micro-celebration.",
        th: "แสดงเรดาร์เรนเดอร์เต็มรูปแบบพร้อม 5 แกน อนิเมชันพัลส์เรืองแสงสีเขียวบนการ์ด twin และการเฉลิมฉลองจุลภาค 'Twin Aligned!'"
      },
      mobileWireframe: {
        en: "Single column: Twin Persona Card collapses to horizontal strip. Radar chart resizes to 240px. Recommendations scroll as vertical list. Timeline becomes horizontal scroll bar.",
        th: "คอลัมน์เดียว: การ์ดตัวตน Twin ยุบเป็นแถบแนวนอน เรดาร์ปรับขนาด 240px คำแนะนำเลื่อนเป็นรายการแนวตั้ง ไทม์ไลน์กลายเป็นแถบเลื่อนแนวนอน"
      },
      tabletAdaptation: {
        en: "Two-column upper grid preserved. Recommendation list gains a filter/sort bar. Twin persona card shows additional archetype description text.",
        th: "กริดบนสองคอลัมน์ยังคงอยู่ รายการคำแนะนำได้แถบกรอง/เรียง การ์ดตัวตน Twin แสดงข้อความอธิบายแบบแผนเพิ่มเติม"
      },
      accessibilityNotes: {
        en: "Radar SVG has role='img' with aria-label describing axis scores. Recommendation rows have proper focus states. Tier gate badges are aria-described.",
        th: "เรดาร์ SVG มี role='img' พร้อม aria-label อธิบายคะแนนแกน แถวคำแนะนำมีสถานะโฟกัสที่เหมาะสม ป้าย tier gate มี aria-described"
      },
      kpiImpact: {
        en: "Drives 22% increase in behavioral awareness NPS. Layer 8 completion rate target: 60% of active users visit Money Twin within 7 days of onboarding.",
        th: "ขับเคลื่อน NPS การตระหนักพฤติกรรมเพิ่มขึ้น 22% เป้าอัตราการเข้าชม Layer 8: 60% ของผู้ใช้ที่ใช้งานเข้าชม Money Twin ภายใน 7 วันหลัง onboarding"
      },
      fbisImpact: {
        en: "Money Twin is the primary FBIS visualization surface. Radar axis scores are derived from the same transaction quality metrics that drive the FBIS score.",
        th: "Money Twin เป็นพื้นผิวแสดงผล FBIS หลัก คะแนนแกนเรดาร์มาจากตัวชี้วัดคุณภาพธุรกรรมเดียวกันที่ขับเคลื่อนคะแนน FBIS"
      },
      upgradeImpact: {
        en: "3-axis teaser converts BASIC→PRO at ~15% rate. Prediction engine and weekly timeline lock converts PRO→ELITE at ~12% rate. Twin page has highest upgrade intent trigger of any secondary page.",
        th: "ตัวอย่าง 3 แกนแปลง BASIC→PRO ที่ ~15% เครื่องคาดการณ์และไทม์ไลน์รายสัปดาห์แปลง PRO→ELITE ที่ ~12% Money Twin page มีแรงจูงใจอัปเกรดสูงสุดในบรรดาหน้ารอง"
      }
    }
  }
};
