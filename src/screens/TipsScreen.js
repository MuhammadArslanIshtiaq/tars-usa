import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES as ALL_LANGUAGES } from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';
import { getDownloadedLanguageCodes, isBundledLanguage } from '../utils/languagePacks';

const TipCard = ({ title, items, isRTL }) => {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, isRTL ? styles.rtlText : null]}>{title}</Text>
      <View style={styles.cardList}>
        {items.map((t) => (
          <View key={t} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={[styles.bulletText, isRTL ? styles.rtlText : null]}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const TipsScreen = ({ navigation }) => {
  const { username, preferences, updatePreferences } = useUser();
  const [selectedLanguage, setSelectedLanguage] = useState(preferences?.language || 'en');
  const [availableLanguages, setAvailableLanguages] = useState(
    ALL_LANGUAGES.filter((l) => isBundledLanguage(l.code))
  );
  const isRTL = selectedLanguage === 'ar' || selectedLanguage === 'ur';

  useEffect(() => {
    const next = preferences?.language || 'en';
    setSelectedLanguage(next);
  }, [preferences?.language]);

  useEffect(() => {
    const loadAvailable = async () => {
      const downloaded = await getDownloadedLanguageCodes();
      const allow = new Set(['en', 'es', ...downloaded]);
      setAvailableLanguages(ALL_LANGUAGES.filter((l) => allow.has(l.code)));
    };
    loadAvailable();
  }, []);

  const handleChangeLanguage = async (nextLanguage) => {
    setSelectedLanguage(nextLanguage);
    try {
      await updatePreferences({ language: nextLanguage });
    } catch {
      // ignore
    }
  };

  const copy = useMemo(() => {
    const t = {
      en: {
        screenTitle: 'Tips',
        heroTitle: 'Tips for Passing the Driver Test',
        heroSubtitle: 'Generic advice for both the written (theory) and the road (practical) test.',
        sections: {
          theory: 'Written (Theory) Test',
          practical: 'Road (Practical) Test',
          instantFail: 'Common Instant-Fail Mistakes',
          checklist: 'Test Day Checklist',
        },
        bullets: {
          theory: [
            'Study signs + right-of-way rules first; they appear in many questions.',
            'Don’t memorize only answers—understand why the rule exists (safer decisions).',
            'Take short practice sessions daily and review mistakes immediately.',
            'Watch for “most” / “best” wording—these questions test judgment.',
            'If two options look correct, pick the one that is safer and more defensive.',
            'Sleep well before the test—fatigue causes easy mistakes.',
          ],
          practical: [
            'Do a calm start: adjust seat, mirrors, and buckle up before moving.',
            'Use obvious mirror + shoulder checks; make it visible to the examiner.',
            'Signal early and keep signaling through the full maneuver.',
            'Complete stops: stop line first, then creep forward only if needed for visibility.',
            'Maintain smooth speed control—avoid sudden braking or jerky acceleration.',
            'Keep a safe following distance (3+ seconds) and increase it in bad conditions.',
          ],
          instantFail: [
            'Rolling stop at stop signs or red lights (when turning is allowed).',
            'Failing to yield to pedestrians or traffic with right of way.',
            'Unsafe lane change (no blind-spot check / cutting someone off).',
            'Speeding in school zones or construction zones.',
            'Crossing solid lines where prohibited or ignoring traffic control devices.',
          ],
          checklist: [
            'Arrive early with required documents and a roadworthy vehicle.',
            'Know basic controls: lights, wipers, defrost, hazards, parking brake.',
            'Keep both hands on the wheel and scan far ahead (not just the hood).',
            'Stay calm—if you make a small mistake, recover safely and continue.',
          ],
        },
      },
      es: {
        screenTitle: 'Consejos',
        heroTitle: 'Consejos para aprobar el examen de manejo',
        heroSubtitle: 'Consejos generales para el examen escrito (teoría) y el examen práctico (carretera).',
        sections: {
          theory: 'Examen escrito (teoría)',
          practical: 'Examen práctico (carretera)',
          instantFail: 'Errores comunes que desaprueban al instante',
          checklist: 'Lista para el día del examen',
        },
        bullets: {
          theory: [
            'Estudia primero las señales y las reglas de prioridad; aparecen con frecuencia.',
            'No memorices solo respuestas: entiende el motivo de la regla (decisiones más seguras).',
            'Practica un poco cada día y revisa los errores al momento.',
            'Fíjate en palabras como “más” o “mejor”; evalúan tu criterio.',
            'Si dos opciones parecen correctas, elige la más segura y defensiva.',
            'Duerme bien antes del examen: el cansancio provoca errores.',
          ],
          practical: [
            'Empieza con calma: ajusta asiento, espejos y abróchate antes de moverte.',
            'Haz visibles los chequeos de espejos y punto ciego (hombro).',
            'Señaliza con anticipación y mantén la señal durante toda la maniobra.',
            'Detenciones completas: primero la línea de alto; avanza solo si hace falta ver mejor.',
            'Controla la velocidad con suavidad; evita frenadas o aceleraciones bruscas.',
            'Mantén distancia segura (3+ segundos) y aumenta con mal clima.',
          ],
          instantFail: [
            'No detenerse completamente en STOP o semáforo en rojo (cuando se permite girar).',
            'No ceder el paso a peatones o a quien tiene prioridad.',
            'Cambio de carril inseguro (sin punto ciego / cerrando el paso).',
            'Exceso de velocidad en zonas escolares o de obras.',
            'Cruzar líneas continuas donde está prohibido o ignorar señales.',
          ],
          checklist: [
            'Llega temprano con documentos y un vehículo en buen estado.',
            'Conoce controles básicos: luces, limpiaparabrisas, desempañador, intermitentes, freno de mano.',
            'Manos en el volante y mirada lejos (no solo cerca del auto).',
            'Mantén la calma: si fallas en algo pequeño, recupérate con seguridad y continúa.',
          ],
        },
      },
      fr: {
        screenTitle: 'Conseils',
        heroTitle: 'Conseils pour réussir l’examen de conduite',
        heroSubtitle: 'Conseils généraux pour l’écrit (théorie) et la conduite (pratique).',
        sections: {
          theory: 'Écrit (théorie)',
          practical: 'Conduite (pratique)',
          instantFail: 'Erreurs fréquentes éliminatoires',
          checklist: 'Checklist du jour J',
        },
        bullets: {
          theory: [
            'Commence par les panneaux et les règles de priorité : elles reviennent souvent.',
            'Ne mémorise pas seulement les réponses : comprends le “pourquoi” (plus sûr).',
            'Petites sessions quotidiennes et correction immédiate des erreurs.',
            'Attention aux formulations “le meilleur / le plus” : elles testent le jugement.',
            'Si deux réponses semblent justes, choisis la plus prudente et défensive.',
            'Dors bien avant l’examen : la fatigue fait rater des questions simples.',
          ],
          practical: [
            'Départ calme : siège, rétros, ceinture avant de bouger.',
            'Contrôles visibles : rétros + angle mort (épaule).',
            'Clignotant tôt et maintenu pendant toute la manœuvre.',
            'Arrêt complet : d’abord à la ligne, puis avance doucement si besoin de visibilité.',
            'Conduite souple : évite freinages/accélérations brusques.',
            'Distance de sécurité (3+ secondes), augmente-la si mauvaises conditions.',
          ],
          instantFail: [
            'Arrêt glissé au STOP ou au feu rouge (même si le virage est autorisé).',
            'Non-respect de la priorité des piétons ou des autres usagers.',
            'Changement de voie dangereux (pas d’angle mort / couper la route).',
            'Vitesse excessive en zone scolaire ou de travaux.',
            'Franchir une ligne continue ou ignorer la signalisation.',
          ],
          checklist: [
            'Arrive tôt avec les documents et un véhicule en bon état.',
            'Savoir les commandes : feux, essuie-glaces, dégivrage, warnings, frein à main.',
            'Deux mains sur le volant et regard loin devant.',
            'Reste calme : après une petite erreur, récupère en sécurité et continue.',
          ],
        },
      },
      vi: {
        screenTitle: 'Mẹo',
        heroTitle: 'Mẹo để vượt qua bài thi lái xe',
        heroSubtitle: 'Mẹo chung cho bài thi lý thuyết và bài thi thực hành.',
        sections: {
          theory: 'Bài thi lý thuyết',
          practical: 'Bài thi thực hành',
          instantFail: 'Lỗi dễ trượt ngay',
          checklist: 'Danh sách ngày thi',
        },
        bullets: {
          theory: [
            'Học biển báo và quyền ưu tiên trước; xuất hiện rất nhiều trong câu hỏi.',
            'Đừng chỉ học thuộc đáp án—hãy hiểu lý do của quy tắc (an toàn hơn).',
            'Luyện tập ngắn mỗi ngày và xem lại lỗi ngay lập tức.',
            'Chú ý các từ “tốt nhất / nhiều nhất”; chúng kiểm tra khả năng phán đoán.',
            'Nếu hai đáp án đều đúng, chọn đáp án an toàn và phòng vệ hơn.',
            'Ngủ đủ trước ngày thi để tránh sai sót đơn giản.',
          ],
          practical: [
            'Bắt đầu bình tĩnh: chỉnh ghế, gương và thắt dây an toàn trước khi chạy.',
            'Quan sát rõ ràng: gương + ngoái vai (điểm mù) để giám khảo thấy.',
            'Bật xi-nhan sớm và giữ xuyên suốt thao tác.',
            'Dừng hẳn: dừng ở vạch trước, chỉ nhích lên nếu cần nhìn rõ.',
            'Giữ tốc độ mượt; tránh phanh/ga giật cục.',
            'Giữ khoảng cách an toàn (3+ giây) và tăng khi điều kiện xấu.',
          ],
          instantFail: [
            'Dừng không hoàn toàn ở STOP hoặc đèn đỏ (khi được phép rẽ).',
            'Không nhường người đi bộ hoặc xe có quyền ưu tiên.',
            'Chuyển làn nguy hiểm (không kiểm tra điểm mù / cắt đầu xe).',
            'Chạy quá tốc độ ở khu trường học hoặc công trình.',
            'Vượt vạch liền khi cấm hoặc bỏ qua biển báo/đèn tín hiệu.',
          ],
          checklist: [
            'Đến sớm với giấy tờ cần thiết và xe đủ điều kiện.',
            'Biết các nút cơ bản: đèn, gạt mưa, sấy kính, đèn khẩn cấp, phanh tay.',
            'Giữ hai tay trên vô-lăng và nhìn xa phía trước.',
            'Bình tĩnh—nếu lỡ sai nhỏ, xử lý an toàn và tiếp tục.',
          ],
        },
      },
      zh: {
        screenTitle: '技巧',
        heroTitle: '通过驾驶考试的小技巧',
        heroSubtitle: '适用于笔试（理论）和路考（实操）的通用建议。',
        sections: {
          theory: '笔试（理论）',
          practical: '路考（实操）',
          instantFail: '常见直接判失败误区',
          checklist: '考试当天清单',
        },
        bullets: {
          theory: [
            '先学习交通标志和让行规则，这些最常考。',
            '不要只背答案，理解规则原因（更安全）。',
            '每天短时间练习，立刻复盘错题。',
            '留意“最”“最佳”等措辞，它考察判断力。',
            '两项都像对时，选择更安全、更防御性的选项。',
            '考前保证睡眠，疲劳会导致低级错误。',
          ],
          practical: [
            '起步前调整座椅、后视镜并系好安全带。',
            '明显地做后视镜+回头盲区观察，让考官看见。',
            '提前打转向灯，并在整个动作过程中保持。',
            '完全停车：先停在停止线，再必要时缓慢前探。',
            '速度控制要平稳，避免急刹或猛加速。',
            '保持安全车距（3秒以上），恶劣天气再加大。',
          ],
          instantFail: [
            'Stop标志或红灯未完全停稳（允许转弯时也一样）。',
            '未礼让行人或未按优先权通行。',
            '危险变道（不看盲区/切入过近）。',
            '学校区域或施工区超速。',
            '违法压实线或无视交通控制装置。',
          ],
          checklist: [
            '提前到场，带齐证件，车辆状况良好。',
            '熟悉基本控制：灯光、雨刷、除雾、双闪、手刹。',
            '双手握方向盘，视线看远处而不是车头前。',
            '保持冷静：小失误后安全纠正，继续完成考试。',
          ],
        },
      },
      ko: {
        screenTitle: '팁',
        heroTitle: '운전시험 합격 팁',
        heroSubtitle: '필기(이론)와 도로(실기) 시험에 공통으로 도움이 되는 조언입니다.',
        sections: {
          theory: '필기(이론) 시험',
          practical: '도로(실기) 시험',
          instantFail: '즉시 탈락하기 쉬운 실수',
          checklist: '시험 당일 체크리스트',
        },
        bullets: {
          theory: [
            '표지판과 양보/우선권 규정을 먼저 공부하세요. 자주 출제됩니다.',
            '정답만 외우지 말고 규정의 이유를 이해하세요(더 안전).',
            '매일 짧게 연습하고 틀린 문제는 바로 복습하세요.',
            '“가장/최고” 같은 표현에 주의하세요. 판단력을 묻습니다.',
            '두 개가 모두 맞아 보이면 더 안전하고 방어적인 선택을 고르세요.',
            '시험 전 충분히 수면하세요. 피로는 실수를 부릅니다.',
          ],
          practical: [
            '출발 전 좌석·거울 조정, 안전벨트 착용을 먼저 하세요.',
            '거울 확인 + 어깨로 사각지대 확인을 크게 보여주세요.',
            '방향지시등은 미리 켜고, 동작이 끝날 때까지 유지하세요.',
            '완전 정지: 정지선에서 먼저 멈추고 필요할 때만 천천히 전진.',
            '속도는 부드럽게. 급가속/급제동을 피하세요.',
            '안전거리(3초 이상)를 유지하고 악천후엔 더 늘리세요.',
          ],
          instantFail: [
            '정지 표지 또는 빨간불에서 완전히 멈추지 않기.',
            '보행자 또는 우선권 차량에 양보하지 않기.',
            '위험한 차선 변경(사각지대 미확인/급끼어들기).',
            '스쿨존/공사 구간 과속.',
            '실선 침범 금지 위반 또는 교통 통제 무시.',
          ],
          checklist: [
            '일찍 도착하고 필요한 서류와 차량 상태를 확인하세요.',
            '기본 조작: 라이트, 와이퍼, 성에 제거, 비상등, 주차 브레이크.',
            '양손 운전, 시선은 멀리.',
            '침착하게. 작은 실수는 안전하게 수습하고 계속 진행하세요.',
          ],
        },
      },
      tl: {
        screenTitle: 'Mga Tip',
        heroTitle: 'Mga tip para pumasa sa driving test',
        heroSubtitle: 'Pangkalahatang payo para sa written (theory) at road (practical) test.',
        sections: {
          theory: 'Written (Theory) Test',
          practical: 'Road (Practical) Test',
          instantFail: 'Karaniwang instant-fail na pagkakamali',
          checklist: 'Checklist sa araw ng exam',
        },
        bullets: {
          theory: [
            'Unahin ang road signs at right-of-way; madalas ito sa mga tanong.',
            'Huwag puro memorize—unawain kung bakit may rule (mas ligtas).',
            'Mag-practice nang maiksi araw-araw at i-review agad ang mali.',
            'Mag-ingat sa “pinaka / pinakamahusay” na salita—judgment ang sinusukat.',
            'Kung dalawang sagot ang mukhang tama, piliin ang mas ligtas at defensive.',
            'Matulog nang maayos bago ang exam para iwas careless mistakes.',
          ],
          practical: [
            'Magsimula nang kalmado: ayusin ang upuan, salamin, at seatbelt.',
            'Gawing halata ang mirror + shoulder checks para makita ng examiner.',
            'Mag-signal nang maaga at panatilihin hanggang matapos ang maneuver.',
            'Full stop: huminto muna sa stop line; umusad lang kung kailangan para makita.',
            'Makinis na kontrol sa bilis; iwas biglang preno o biglang arangkada.',
            'Panatilihin ang safe distance (3+ seconds) at dagdagan kapag masama ang panahon.',
          ],
          instantFail: [
            'Rolling stop sa stop sign o red light (kahit pinapayagan ang turn).',
            'Hindi pag-yield sa pedestrians o sa may right of way.',
            'Delikadong lane change (walang blind-spot check / cutting off).',
            'Overspeed sa school zone o construction zone.',
            'Paglampas sa solid line o pag-ignore ng traffic control.',
          ],
          checklist: [
            'Dumating nang maaga at dalhin ang mga kailangan at roadworthy na sasakyan.',
            'Alam ang basic controls: ilaw, wiper, defrost, hazard, parking brake.',
            'Dalawang kamay sa manibela at tumingin sa malayo.',
            'Kalmado lang—kung may maliit na mali, bumawi nang ligtas at magpatuloy.',
          ],
        },
      },
      ar: {
        screenTitle: 'نصائح',
        heroTitle: 'نصائح لاجتياز اختبار القيادة',
        heroSubtitle: 'نصائح عامة للاختبار النظري (الكتابي) والاختبار العملي على الطريق.',
        sections: {
          theory: 'الاختبار النظري (الكتابي)',
          practical: 'الاختبار العملي على الطريق',
          instantFail: 'أخطاء شائعة تؤدي للرسوب فورًا',
          checklist: 'قائمة يوم الاختبار',
        },
        bullets: {
          theory: [
            'ابدأ بدراسة إشارات الطريق وأولوية المرور؛ فهي تتكرر كثيرًا.',
            'لا تحفظ الإجابات فقط—افهم سبب القاعدة (قرارات أكثر أمانًا).',
            'تدرّب لفترات قصيرة يوميًا وراجع الأخطاء مباشرة.',
            'انتبه لكلمات مثل “الأفضل/الأكثر” لأنها تختبر الحكم.',
            'إذا بدت إجابتان صحيحتين، اختر الأكثر أمانًا وقيادة دفاعية.',
            'نم جيدًا قبل الاختبار لأن التعب يسبب أخطاء بسيطة.',
          ],
          practical: [
            'ابدأ بهدوء: اضبط المقعد والمرايا واربط حزام الأمان قبل الانطلاق.',
            'اجعل فحص المرايا والكتف واضحًا ليراه الفاحص.',
            'أشّر مبكرًا واستمر بالإشارة طوال المناورة.',
            'توقف كامل: توقف عند خط التوقف أولًا ثم تقدّم ببطء إن لزم لتحسين الرؤية.',
            'حافظ على سلاسة السرعة وتجنب الفرملة أو التسارع المفاجئ.',
            'اترك مسافة أمان (3 ثوانٍ أو أكثر) وزدها في الظروف السيئة.',
          ],
          instantFail: [
            'توقف غير كامل عند إشارة التوقف أو الإشارة الحمراء (حتى عند السماح بالانعطاف).',
            'عدم إعطاء الأولوية للمشاة أو لمن له حق المرور.',
            'تغيير مسار غير آمن (بدون فحص النقطة العمياء/قطع الطريق).',
            'السرعة الزائدة في مناطق المدارس أو مواقع العمل.',
            'تجاوز خطوط متصلة حيث يمنع أو تجاهل إشارات المرور.',
          ],
          checklist: [
            'احضر مبكرًا ومعك الوثائق المطلوبة ومركبة صالحة للطريق.',
            'اعرف عناصر التحكم الأساسية: الأضواء، المساحات، إزالة الضباب، الإشارات التحذيرية، فرامل اليد.',
            'أبقِ يديك على المقود وراقب الطريق بعيدًا للأمام.',
            'ابقَ هادئًا—إذا أخطأت خطأً بسيطًا، صحّحه بأمان وأكمل.',
          ],
        },
      },
      ur: {
        screenTitle: 'ٹپس',
        heroTitle: 'ڈرائیونگ ٹیسٹ پاس کرنے کے لیے ٹپس',
        heroSubtitle: 'تحریری (تھیوری) اور روڈ (پریکٹیکل) ٹیسٹ دونوں کے لیے عمومی مشورے۔',
        sections: {
          theory: 'تحریری (تھیوری) ٹیسٹ',
          practical: 'روڈ (پریکٹیکل) ٹیسٹ',
          instantFail: 'عام غلطیاں جو فوراً فیل کرا سکتی ہیں',
          checklist: 'ٹیسٹ ڈے چیک لسٹ',
        },
        bullets: {
          theory: [
            'سب سے پہلے روڈ سائنز اور رائٹ آف وے کے اصول پڑھیں؛ یہ اکثر آتے ہیں۔',
            'صرف جواب نہ رٹیں—قاعدے کی وجہ سمجھیں (زیادہ محفوظ فیصلہ).',
            'روزانہ تھوڑا پریکٹس کریں اور غلطیاں فوراً ریویو کریں۔',
            '“سب سے بہتر/زیادہ” جیسے الفاظ پر دھیان دیں؛ یہ ججمنٹ چیک کرتے ہیں۔',
            'اگر دو آپشن درست لگیں تو زیادہ محفوظ اور دفاعی والا چنیں۔',
            'ٹیسٹ سے پہلے اچھی نیند لیں—تھکن آسان غلطیاں کروا دیتی ہے۔',
          ],
          practical: [
            'پرسکون آغاز کریں: سیٹ، آئینے سیٹ کریں اور سیٹ بیلٹ باندھیں۔',
            'مِرر اور شولڈر چیک واضح کریں تاکہ ایگزامینر دیکھ سکے۔',
            'جلدی اشارہ دیں اور پورا موومنٹ مکمل ہونے تک رکھیں۔',
            'مکمل اسٹاپ: پہلے اسٹاپ لائن پر رکیں، ضرورت ہو تو آہستہ آگے بڑھیں۔',
            'اسپیڈ ہموار رکھیں—اچانک بریک یا ایکسیلیریشن سے بچیں۔',
            'محفوظ فاصلہ (3+ سیکنڈ) رکھیں اور خراب موسم میں بڑھائیں۔',
          ],
          instantFail: [
            'اسٹاپ سائن یا ریڈ لائٹ پر رولنگ اسٹاپ (موڑ کی اجازت ہو تب بھی).',
            'پیدل چلنے والوں یا جس کو حق ہو اسے راستہ نہ دینا۔',
            'غیر محفوظ لین چینج (بلائنڈ اسپاٹ چیک کے بغیر).',
            'اسکول زون یا کنسٹرکشن زون میں اوور اسپیڈ۔',
            'جہاں منع ہو وہاں سولیڈ لائن کراس کرنا یا سائنلز نظر انداز کرنا۔',
          ],
          checklist: [
            'جلدی پہنچیں، ضروری دستاویزات اور درست گاڑی کے ساتھ۔',
            'بنیادی کنٹرولز جانیں: لائٹس، وائپرز، ڈیفراسٹ، ہیزرڈ، پارکنگ بریک۔',
            'دونوں ہاتھ اسٹیئرنگ پر اور نظر دور رکھیں۔',
            'پرسکون رہیں—چھوٹی غلطی ہو تو محفوظ طریقے سے درست کر کے جاری رکھیں۔',
          ],
        },
      },
      hi: {
        screenTitle: 'टिप्स',
        heroTitle: 'ड्राइविंग टेस्ट पास करने के टिप्स',
        heroSubtitle: 'लिखित (थ्योरी) और रोड (प्रैक्टिकल) टेस्ट के लिए सामान्य सलाह।',
        sections: {
          theory: 'लिखित (थ्योरी) टेस्ट',
          practical: 'रोड (प्रैक्टिकल) टेस्ट',
          instantFail: 'आम गलतियाँ जो तुरंत फेल करा सकती हैं',
          checklist: 'टेस्ट डे चेकलिस्ट',
        },
        bullets: {
          theory: [
            'पहले रोड साइन और राइट-ऑफ-वे नियम पढ़ें; ये अक्सर पूछे जाते हैं।',
            'सिर्फ उत्तर न रटें—नियम का कारण समझें (सुरक्षित निर्णय)।',
            'रोज़ थोड़ी प्रैक्टिस करें और गलतियाँ तुरंत रिव्यू करें।',
            '“सबसे/श्रेष्ठ” जैसे शब्दों पर ध्यान दें—ये जजमेंट टेस्ट करते हैं।',
            'अगर दो विकल्प सही लगें, तो अधिक सुरक्षित/डिफेंसिव विकल्प चुनें।',
            'टेस्ट से पहले अच्छी नींद लें—थकान से आसान गलतियाँ होती हैं।',
          ],
          practical: [
            'शांत शुरुआत: सीट, मिरर सेट करें और सीटबेल्ट लगाएँ।',
            'मिरर + शोल्डर चेक साफ़ दिखाएँ ताकि एग्ज़ामिनर देख सके।',
            'जल्दी संकेत दें और पूरी मैनूवर के दौरान रखें।',
            'पूरी तरह रुकें: पहले स्टॉप लाइन पर, जरूरत हो तो धीरे आगे बढ़ें।',
            'स्पीड स्मूथ रखें—अचानक ब्रेक/एक्सेलरेशन से बचें।',
            'सेफ डिस्टेंस (3+ सेकंड) रखें और खराब मौसम में बढ़ाएँ।',
          ],
          instantFail: [
            'स्टॉप साइन/रेड लाइट पर रोलिंग स्टॉप (टर्न की अनुमति हो तब भी)।',
            'पैदल यात्रियों या जिसे प्राथमिकता हो उसे रास्ता न देना।',
            'असुरक्षित लेन चेंज (ब्लाइंड स्पॉट चेक नहीं).',
            'स्कूल ज़ोन/कंस्ट्रक्शन ज़ोन में ओवरस्पीड।',
            'जहाँ मना हो वहाँ सॉलिड लाइन पार करना या सिग्नल अनदेखा करना।',
          ],
          checklist: [
            'जल्दी पहुँचें और जरूरी दस्तावेज़ व सही हालत की गाड़ी रखें।',
            'बेसिक कंट्रोल जानें: लाइट्स, वाइपर, डिफ्रॉस्ट, हज़ार्ड, पार्किंग ब्रेक।',
            'दोनों हाथ स्टीयरिंग पर रखें और नजर दूर रखें।',
            'शांत रहें—छोटी गलती हो तो सुरक्षित तरीके से सुधारें और आगे बढ़ें।',
          ],
        },
      },
    };
    return t[selectedLanguage] || t.en;
  }, [selectedLanguage]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={handleChangeLanguage}
        languages={availableLanguages}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={{ color: 'white' }}
      />
      <TouchableOpacity style={styles.headerButton} onPress={handleBackPress} accessibilityRole="button" accessibilityLabel="Back">
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header username={username} navigation={navigation} pageTitle="Tips" titleOnly>
        {renderHeaderRight()}
      </Header>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="bulb-outline" size={22} color={COLORS.primary2} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, isRTL ? styles.rtlText : null]}>{copy.heroTitle}</Text>
            <Text style={[styles.heroSubtitle, isRTL ? styles.rtlText : null]}>{copy.heroSubtitle}</Text>
          </View>
        </View>

        <TipCard
          title={copy.sections.theory}
          items={copy.bullets.theory}
          isRTL={isRTL}
        />

        <TipCard
          title={copy.sections.practical}
          items={copy.bullets.practical}
          isRTL={isRTL}
        />

        <TipCard
          title={copy.sections.instantFail}
          items={copy.bullets.instantFail}
          isRTL={isRTL}
        />

        <TipCard
          title={copy.sections.checklist}
          items={copy.bullets.checklist}
          isRTL={isRTL}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  languageButton: { marginRight: 10 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  hero: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 90, 168, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  heroSubtitle: { marginTop: 4, fontSize: 13, fontWeight: '600', color: COLORS.textMuted, lineHeight: 18 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
  cardList: { gap: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: COLORS.primary2, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937', lineHeight: 20 },
});

export default TipsScreen;

