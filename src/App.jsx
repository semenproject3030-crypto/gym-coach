import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Dumbbell, TrendingDown, Flame, ChevronRight, Plus, Check, X, Info, BarChart3, History as HistoryIcon, User, Target, Calendar, ArrowLeft, AlertTriangle, Lightbulb, Clock, Minus, Trash2, Trophy, Scale } from 'lucide-react';
import { storage } from './storage.js';

// ============ EXERCISE DATABASE ============
const EXERCISES = {
  squat: {
    name: 'Приседания со штангой',
    muscles: 'Квадрицепсы • Ягодицы • Кор',
    equipment: 'Штанга, стойка',
    technique: [
      'Штанга на верхней части трапеций, не на шее',
      'Ноги на ширине плеч, носки слегка развёрнуты',
      'Опускайся до параллели бедра с полом (или чуть ниже)',
      'Колени идут по направлению носков, не заваливаются внутрь',
      'Спина прямая, взгляд вперёд, корпус напряжён'
    ],
    mistakes: [
      'Отрыв пяток от пола — снизь вес или поставь блины под пятки',
      'Круглая спина внизу — работай над мобильностью голеностопа',
      'Колени внутрь — слабые ягодицы, сознательно разводи'
    ],
    tip: 'Делай глубокий вдох перед опусканием и держи живот напряжённым всё повторение',
    rest: 180
  },
  bench: {
    name: 'Жим штанги лёжа',
    muscles: 'Грудь • Трицепс • Передняя дельта',
    equipment: 'Штанга, горизонтальная скамья',
    technique: [
      'Лопатки сведены и прижаты к скамье — это база',
      'Хват чуть шире плеч, запястья прямые',
      'Опускай штангу на нижнюю часть груди (соски)',
      'Локти под углом ~45–60° к корпусу, не в стороны на 90°',
      'Ноги упёрты в пол — без них нет стабильности'
    ],
    mistakes: [
      'Локти развёрнуты на 90° — травмоопасно для плеч',
      'Отрыв таза от скамьи — это уже не жим',
      'Штанга на шее — опускай ниже, на грудь'
    ],
    tip: 'На последнем подходе не иди до отказа в одиночку — оставляй 1–2 повтора в запасе',
    rest: 180
  },
  barbell_row: {
    name: 'Тяга штанги в наклоне',
    muscles: 'Широчайшие • Ромбовидные • Задняя дельта',
    equipment: 'Штанга',
    technique: [
      'Наклон корпуса ~45°, спина прямая, поясница нейтральна',
      'Штангу тянешь к нижней части живота, а не к груди',
      'Локти идут назад и вдоль корпуса',
      'В верхней точке сведи лопатки, задержка 1 сек',
      'Опускай под контролем, не бросай'
    ],
    mistakes: [
      'Читинг корпусом — толку не будет, снизь вес',
      'Круглая спина — прямая угроза пояснице',
      'Тянешь руками, а не спиной — сосредоточься на сведении лопаток'
    ],
    tip: 'Представь, что локти — это крюки, и тяни ими, забудь про бицепс',
    rest: 120
  },
  seated_db_press: {
    name: 'Жим гантелей сидя',
    muscles: 'Плечи • Трицепс • Верх груди',
    equipment: 'Гантели, скамья со спинкой',
    technique: [
      'Скамья с вертикальной спинкой, спина плотно прижата',
      'Гантели на уровне плеч, локти под углом ~75°',
      'Жми вверх по небольшой дуге, в верху гантели почти касаются',
      'Не блокируй локти жёстко в верху',
      'Опускай под контролем, без отбива от плеч'
    ],
    mistakes: [
      'Отрыв поясницы от спинки — теряешь стабильность',
      'Локти строго в стороны на 90° — плечевой сустав перегружен',
      'Слишком тяжёлый вес — попа уезжает, спина выгибается'
    ],
    tip: 'Сидя ты можешь жать тяжелее, чем стоя — нет читинга ногами. Не жалей вес',
    rest: 90
  },
  curl: {
    name: 'Подъём на бицепс со штангой',
    muscles: 'Бицепс • Предплечья',
    equipment: 'Штанга (прямой или EZ-гриф)',
    technique: [
      'Локти прижаты к корпусу и зафиксированы',
      'Поднимай штангу только силой бицепса',
      'В верхней точке — пиковое сокращение 1 сек',
      'Опускай медленнее, чем поднимаешь (2-3 сек)',
      'Не раскачивайся корпусом'
    ],
    mistakes: [
      'Читинг корпусом — 80% работы бицепса потеряно',
      'Локти уходят вперёд — штанга катится по бедру вверх, неправильно',
      'Короткая амплитуда — работай полностью от прямых рук'
    ],
    tip: 'Если не можешь без читинга — сбрось вес. Бицепс любит технику, а не эго',
    rest: 75
  },
  plank: {
    name: 'Планка',
    muscles: 'Кор • Пресс • Стабилизаторы',
    equipment: 'Коврик',
    technique: [
      'Предплечья под плечами, локти 90°',
      'Тело — прямая линия от пяток до макушки',
      'Ягодицы напряжены, таз подкручен',
      'Пресс втянут и напряжён',
      'Дыхание ровное, не задерживай'
    ],
    mistakes: [
      'Провисающий таз — главная ошибка, нет смысла так стоять',
      'Поднятый таз — легче, но мышцы не работают',
      'Смотришь вперёд — шея напрягается, смотри в пол'
    ],
    tip: 'Лучше 30 секунд идеальной техники, чем 2 минуты с провисом',
    rest: 60
  },
  hyperext: {
    name: 'Гиперэкстензия с весом',
    muscles: 'Разгибатели спины • Ягодицы • Бицепс бедра',
    equipment: 'Тренажёр для гиперэкстензий, блин',
    technique: [
      'Бёдра упёрты в подушку, ноги зафиксированы валиками',
      'Тело — прямая линия от пяток до головы в верхней точке',
      'Опускайся вниз только до момента, пока спина остаётся прямой',
      'Поднимайся за счёт ягодиц и разгибателей спины',
      'Не переразгибайся в верхней точке — стой ровно'
    ],
    mistakes: [
      'Округление спины внизу — снизь амплитуду или вес',
      'Рывки и инерция — медленно вниз, мощно вверх',
      'Переразгиб назад в верху — поясница страдает'
    ],
    tip: 'Держи блин у груди скрестив руки — так удобнее распределяется вес',
    rest: 90
  },
  pullup: {
    name: 'Подтягивания (или тяга верхнего блока)',
    muscles: 'Широчайшие • Бицепс • Задняя дельта',
    equipment: 'Турник или блочный тренажёр',
    technique: [
      'Хват на ширине плеч или чуть шире, прямой хват',
      'Начинай движение со сведения лопаток вниз',
      'Тяни грудью к перекладине, локти вниз и назад',
      'В верхней точке подбородок выше перекладины',
      'Опускайся под контролем, не просто падай'
    ],
    mistakes: [
      'Рывки корпусом — теряешь работу спины',
      'Неполная амплитуда вниз — мышца не растягивается',
      'Тянешь бицепсом — думай о локтях, не о руках'
    ],
    tip: 'Если подтягиваний пока мало — делай негативы: запрыгнул вверх, опускайся 4 секунды',
    rest: 120
  },
  incline_db: {
    name: 'Жим гантелей на наклонной',
    muscles: 'Верх груди • Передняя дельта • Трицепс',
    equipment: 'Гантели, наклонная скамья (30°)',
    technique: [
      'Угол скамьи 30° — больше включает плечи, меньше грудь',
      'Гантели на уровне груди, локти под углом 45°',
      'Жми по лёгкой дуге, в верху гантели сближаются',
      'Опускай до ощущения растяжения груди',
      'Лопатки сведены и прижаты'
    ],
    mistakes: [
      'Слишком крутой угол (45°+) — работают плечи, не грудь',
      'Локти в стороны на 90° — плечо перегружено',
      'Гантели летят вниз — опускай медленно, 2 сек'
    ],
    tip: 'На верхней трети движения максимально сожми грудь — там самая мякотка',
    rest: 120
  },
  seated_leg_curl: {
    name: 'Сгибание ног сидя в тренажёре',
    muscles: 'Бицепс бедра • Икроножные',
    equipment: 'Тренажёр для сгибаний сидя',
    technique: [
      'Бёдра прижаты валиком, спина к спинке тренажёра',
      'Валик под голеностопом, не на середине голени',
      'Сгибай ноги под себя силой бицепса бедра',
      'В нижней точке — короткая задержка 1 сек',
      'Возвращай ноги медленно, 2-3 сек, без бросания'
    ],
    mistakes: [
      'Подключение поясницы и таза — таз должен быть зафиксирован',
      'Слишком тяжёлый вес — амплитуда теряется',
      'Бросание ног обратно — теряешь половину работы'
    ],
    tip: 'В верхней точке (ноги прямые) — растяни бицепс бедра 1-2 сек, потом сгибай. Так чувство мышцы максимальное',
    rest: 75
  },
  lateral: {
    name: 'Махи гантелями в стороны',
    muscles: 'Средняя дельта',
    equipment: 'Гантели',
    technique: [
      'Лёгкий наклон корпуса вперёд, локти слегка согнуты',
      'Поднимай гантели до уровня плеч, не выше',
      'Мизинец чуть выше большого пальца в верху',
      'Представь, что льёшь воду из кувшинов',
      'Опускай медленно, 2-3 секунды'
    ],
    mistakes: [
      'Подъём выше плеч — включается трапеция, не дельта',
      'Читинг корпусом — половина работы теряется',
      'Слишком тяжёлый вес — это изоляция, не жим'
    ],
    tip: 'Дельту убивает не вес, а время под нагрузкой. Делай чисто',
    rest: 60
  },
  hanging_leg: {
    name: 'Подъём ног в висе',
    muscles: 'Нижний пресс • Кор',
    equipment: 'Турник',
    technique: [
      'Вис на прямых руках, плечи активны (не провисай)',
      'Поднимай ноги силой пресса, а не маятником',
      'Можно с согнутыми коленями, если прямые тяжело',
      'В верхней точке таз немного подкручен',
      'Опускай медленно, без раскачки'
    ],
    mistakes: [
      'Раскачка всем телом — пресс почти не работает',
      'Короткая амплитуда (ноги на 45°) — сделай хотя бы до 90°',
      'Расслабленные плечи в висе — травмоопасно'
    ],
    tip: 'Если сложно в висе — начни с подъёмов в упоре на локтях на специальной станции',
    rest: 60
  },
  rdl: {
    name: 'Румынская тяга',
    muscles: 'Бицепс бедра • Ягодицы • Поясница',
    equipment: 'Штанга',
    technique: [
      'Ноги на ширине таза, штанга в руках у бёдер',
      'Отводи таз НАЗАД, не приседай',
      'Штанга скользит вплотную к ногам вниз',
      'Опускай до ощущения растяжения бицепса бедра',
      'Поднимайся за счёт толчка таза вперёд'
    ],
    mistakes: [
      'Приседание вместо наклона — это уже не РТ',
      'Круглая спина — опускайся меньше, работай на мобильность',
      'Штанга далеко от ног — травмоопасно для поясницы'
    ],
    tip: 'Это упражнение не про "вниз как можно ниже", а про растяжение бицепса бедра',
    rest: 150
  },
  leg_press: {
    name: 'Жим ногами',
    muscles: 'Квадрицепсы • Ягодицы',
    equipment: 'Тренажёр',
    technique: [
      'Ноги на платформе на ширине плеч, носки чуть врозь',
      'Опускай платформу до угла в колене ~90°',
      'Поясница прижата к спинке ВСЕГДА',
      'Колени идут по направлению носков',
      'Не блокируй колени в верхней точке'
    ],
    mistakes: [
      'Отрыв поясницы — уменьши амплитуду или положи подушку',
      'Колени внутрь — разверни носки чуть больше',
      'Пятки отрываются — ноги ниже на платформе'
    ],
    tip: 'Хочешь больше ягодиц — ставь ноги выше. Больше квадров — ниже',
    rest: 120
  },
  close_bench: {
    name: 'Жим лёжа узким хватом',
    muscles: 'Трицепс • Внутренняя грудь',
    equipment: 'Штанга',
    technique: [
      'Хват на ширине плеч (не уже — вредно для запястий)',
      'Локти прижаты к корпусу, идут назад',
      'Опускай штангу на низ груди',
      'Выжимай вверх за счёт трицепса',
      'Лопатки сведены, ноги упёрты'
    ],
    mistakes: [
      'Слишком узкий хват (кулаки вместе) — запястья под угрозой',
      'Локти в стороны — это обычный жим, а не узкий',
      'Штанга на шее — ниже, на грудь'
    ],
    tip: 'Это лучшее упражнение на массу трицепса — не жалей усилий',
    rest: 120
  },
  db_row: {
    name: 'Тяга гантели в наклоне',
    muscles: 'Широчайшие • Ромбовидные',
    equipment: 'Гантель, скамья',
    technique: [
      'Одно колено и рука на скамье, спина параллельно полу',
      'Гантель в свободной руке, на прямой руке внизу',
      'Тяни к поясу, локоть идёт вдоль корпуса вверх-назад',
      'В верхней точке сведи лопатку',
      'Опускай под контролем, полное растяжение внизу'
    ],
    mistakes: [
      'Разворот корпуса — работа спины теряется',
      'Тянешь к груди, а не к поясу — подключается бицепс сильнее',
      'Рывки — это тяга, не рывок'
    ],
    tip: 'Делай слабую сторону первой — и только столько же повторов на сильную',
    rest: 90
  },
  tricep_ext: {
    name: 'Французский жим',
    muscles: 'Трицепс (все головки)',
    equipment: 'EZ-гриф или гантель',
    technique: [
      'Лёжа или сидя, руки прямо вверх над плечами',
      'Сгибай только в локтях, плечи неподвижны',
      'Опускай штангу за голову или ко лбу',
      'Выжимай только трицепсом, без плеч',
      'Локти не разводи в стороны — строго прямо'
    ],
    mistakes: [
      'Локти разъезжаются — работает меньшая часть трицепса',
      'Помогаешь плечами — это уже жим, а не французский',
      'Слишком тяжёлый вес — это изоляция, держи форму'
    ],
    tip: 'Немного заведи плечи назад за голову — больше растяжения, больше результата',
    rest: 75
  },
  calf: {
    name: 'Подъём на носки стоя',
    muscles: 'Икроножные',
    equipment: 'Тренажёр или степ',
    technique: [
      'Носки на краю платформы, пятки свисают',
      'Опускайся вниз до максимального растяжения икры',
      'Поднимайся на максимум вверх, на самые подушечки',
      'Задержка в верхней точке 1 сек',
      'Медленное опускание, 2-3 сек'
    ],
    mistakes: [
      'Короткая амплитуда — икры не вырастут',
      'Пружинишь — мышца работает в 3 раза меньше',
      'Помощь коленями — согнул-разогнул, икра ни при чём'
    ],
    tip: 'Икры любят большие объёмы. Высокие повторы (15-20) часто работают лучше',
    rest: 60
  }
};

// ============ PROGRAMS ============
const PROGRAMS = {
  A: {
    name: 'Тренировка A',
    focus: 'Ноги + Жим',
    exercises: [
      { id: 'squat', sets: 4, reps: '6-8' },
      { id: 'bench', sets: 4, reps: '6-8' },
      { id: 'barbell_row', sets: 3, reps: '8-10' },
      { id: 'seated_db_press', sets: 3, reps: '10-12' },
      { id: 'curl', sets: 3, reps: '10-12' },
      { id: 'plank', sets: 3, reps: '45 сек' }
    ]
  },
  B: {
    name: 'Тренировка B',
    focus: 'Спина + Тяги',
    exercises: [
      { id: 'hyperext', sets: 4, reps: '10-12' },
      { id: 'pullup', sets: 4, reps: '8-10' },
      { id: 'incline_db', sets: 3, reps: '8-10' },
      { id: 'seated_leg_curl', sets: 3, reps: '12-15' },
      { id: 'lateral', sets: 3, reps: '12-15' },
      { id: 'hanging_leg', sets: 3, reps: '10-12' }
    ]
  },
  C: {
    name: 'Тренировка C',
    focus: 'Полное тело',
    exercises: [
      { id: 'seated_leg_curl', sets: 4, reps: '10-12' },
      { id: 'leg_press', sets: 4, reps: '10-12' },
      { id: 'close_bench', sets: 3, reps: '8-10' },
      { id: 'db_row', sets: 3, reps: '10 (на руку)' },
      { id: 'tricep_ext', sets: 3, reps: '10-12' },
      { id: 'plank', sets: 3, reps: '45 сек' }
    ]
  }
};

const NEXT_PROGRAM = { A: 'B', B: 'C', C: 'A' };

// ============ UTILITIES ============
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
};
const fmtFullDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};
const daysBetween = (d1, d2) => Math.floor((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
const todayIso = () => new Date().toISOString().split('T')[0];

// Progressive overload suggestion
const suggestWeight = (exerciseId, history) => {
  const past = history
    .filter(w => w.exercises.some(e => e.id === exerciseId))
    .slice(-3);
  if (past.length === 0) return null;
  const lastSession = past[past.length - 1];
  const lastEx = lastSession.exercises.find(e => e.id === exerciseId);
  if (!lastEx || !lastEx.sets.length) return null;
  const weights = lastEx.sets.map(s => s.weight).filter(w => w > 0);
  if (weights.length === 0) return null;
  const maxWeight = Math.max(...weights);
  const topReps = lastEx.sets[lastEx.sets.length - 1]?.reps || 0;
  const targetReps = { squat: 8, bench: 8, barbell_row: 10, seated_db_press: 12, pullup: 10, incline_db: 10, hyperext: 12, leg_press: 12, seated_leg_curl: 12 }[exerciseId] || 12;
  if (topReps >= targetReps) {
    const increment = ['squat', 'bench'].includes(exerciseId) ? 2.5 : 1;
    return { weight: maxWeight + increment, hint: `+${increment} кг — в прошлый раз всё закрыл` };
  }
  return { weight: maxWeight, hint: 'тот же вес — добей диапазон повторов' };
};

// ============ MAIN APP ============
export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [weightLog, setWeightLog] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [nextProgram, setNextProgram] = useState('A');
  const [view, setView] = useState('today');
  const [activeSession, setActiveSession] = useState(null);
  const [exerciseDetail, setExerciseDetail] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await storage.get('profile');
      const wl = await storage.get('weight-log', []);
      const ol = await storage.get('workout-log', []);
      const np = await storage.get('next-program', 'A');
      setProfile(p);
      setWeightLog(wl || []);
      setWorkoutLog(ol || []);
      setNextProgram(np || 'A');
      setLoading(false);
    })();
  }, []);

  const saveProfile = async (p) => {
    setProfile(p);
    await storage.set('profile', p);
  };
  const addWeight = async (weight) => {
    const date = todayIso();
    const filtered = weightLog.filter(w => w.date !== date);
    const newLog = [...filtered, { date, weight: parseFloat(weight) }].sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(newLog);
    await storage.set('weight-log', newLog);
    if (profile) await saveProfile({ ...profile, currentWeight: parseFloat(weight) });
  };
  const saveWorkout = async (session) => {
    const entry = {
      date: todayIso(),
      program: session.program,
      exercises: session.exercises.map(e => ({
        id: e.id,
        sets: e.sets.filter(s => s.done).map(s => ({ reps: s.reps, weight: s.weight }))
      })).filter(e => e.sets.length > 0)
    };
    const newLog = [...workoutLog, entry];
    setWorkoutLog(newLog);
    await storage.set('workout-log', newLog);
    const newNext = NEXT_PROGRAM[session.program];
    setNextProgram(newNext);
    await storage.set('next-program', newNext);
    setActiveSession(null);
    setView('today');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
        <div className="text-[#d4ff2e] mono text-sm animate-pulse">ЗАГРУЗКА...</div>
      </div>
    );
  }

  if (!profile) {
    return <SetupScreen onSave={saveProfile} />;
  }

  if (view === 'session' && activeSession) {
    return (
      <SessionScreen
        session={activeSession}
        setSession={setActiveSession}
        onFinish={saveWorkout}
        onCancel={() => { setActiveSession(null); setView('today'); }}
        history={workoutLog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f2eb]">
      <div className="grain" />

      <header className="border-b border-white/5 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] mono text-[#d4ff2e] tracking-[0.2em] mb-1">ТРЕНЕР • {profile.startWeight}→{profile.goalWeight}</div>
            <h1 className="display text-2xl font-bold leading-none">{['ВОСКРЕСЕНЬЕ','ПОНЕДЕЛЬНИК','ВТОРНИК','СРЕДА','ЧЕТВЕРГ','ПЯТНИЦА','СУББОТА'][new Date().getDay()]}</h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] mono text-white/40 tracking-wider">ДЕНЬ</div>
            <div className="display text-3xl font-bold">{Math.max(1, daysBetween(profile.startDate, todayIso()) + 1)}</div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 pb-28 max-w-2xl mx-auto">
        {view === 'today' && <TodayView profile={profile} weightLog={weightLog} workoutLog={workoutLog} nextProgram={nextProgram} onStartWorkout={(prog) => {
          const program = PROGRAMS[prog];
          setActiveSession({
            program: prog,
            startTime: Date.now(),
            exercises: program.exercises.map(ex => ({
              id: ex.id,
              targetSets: ex.sets,
              targetReps: ex.reps,
              sets: Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false }))
            }))
          });
          setView('session');
        }} onAddWeight={addWeight} onShowExercise={(id) => setExerciseDetail(id)} />}

        {view === 'progress' && <ProgressView profile={profile} weightLog={weightLog} workoutLog={workoutLog} onAddWeight={addWeight} />}
        {view === 'history' && <HistoryView workoutLog={workoutLog} onShowExercise={(id) => setExerciseDetail(id)} />}
        {view === 'profile' && <ProfileView profile={profile} onSave={saveProfile} workoutLog={workoutLog} weightLog={weightLog} />}
      </main>

      {exerciseDetail && (
        <ExerciseModal exerciseId={exerciseDetail} onClose={() => setExerciseDetail(null)} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0908] border-t border-white/10 px-2 py-2 z-50" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-4 gap-1 max-w-2xl mx-auto">
          {[
            { id: 'today', icon: Dumbbell, label: 'Сегодня' },
            { id: 'progress', icon: BarChart3, label: 'Прогресс' },
            { id: 'history', icon: HistoryIcon, label: 'Журнал' },
            { id: 'profile', icon: User, label: 'Профиль' }
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition ${view === t.id ? 'text-[#d4ff2e]' : 'text-white/40'}`}>
              <t.icon size={20} strokeWidth={view === t.id ? 2.5 : 1.8} />
              <span className="text-[10px] mono tracking-wider uppercase">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ============ SETUP SCREEN ============
function SetupScreen({ onSave }) {
  const [startWeight, setStartWeight] = useState('101.5');
  const [goalWeight, setGoalWeight] = useState('75');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f2eb] px-5 py-10 flex flex-col max-w-lg mx-auto">
      <div className="text-[10px] mono text-[#d4ff2e] tracking-[0.3em] mb-3">ЗНАКОМСТВО</div>
      <h1 className="display text-4xl font-extrabold mb-2 leading-[0.95]">Добро<br/>пожаловать.</h1>
      <p className="text-white/60 text-sm mb-10">Настроим твоё путешествие. Это займёт минуту.</p>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Как к тебе обращаться</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя (необязательно)"
            className="w-full bg-transparent border-b border-white/20 focus:border-[#d4ff2e] outline-none py-3 text-lg display" />
        </div>

        <div>
          <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Текущий вес, кг</label>
          <input value={startWeight} onChange={e => setStartWeight(e.target.value)} type="number" step="0.1" inputMode="decimal"
            className="w-full bg-transparent border-b border-white/20 focus:border-[#d4ff2e] outline-none py-3 text-3xl display font-bold" />
        </div>

        <div>
          <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Цель, кг</label>
          <input value={goalWeight} onChange={e => setGoalWeight(e.target.value)} type="number" step="0.1" inputMode="decimal"
            className="w-full bg-transparent border-b border-white/20 focus:border-[#d4ff2e] outline-none py-3 text-3xl display font-bold text-[#d4ff2e]" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6">
          <div className="text-[10px] mono tracking-wider text-[#d4ff2e] mb-2">ТВОЯ ПРОГРАММА</div>
          <div className="text-sm leading-relaxed text-white/80">
            Full Body A/B/C • 3×в неделю<br/>
            Прогрессивная перегрузка<br/>
            Сохранение мышц на дефиците
          </div>
        </div>
      </div>

      <button onClick={() => onSave({
          name: name.trim(),
          startWeight: parseFloat(startWeight),
          currentWeight: parseFloat(startWeight),
          goalWeight: parseFloat(goalWeight),
          startDate: todayIso(),
          daysPerWeek: 3,
          experience: 'intermediate'
        })}
        disabled={!startWeight || !goalWeight}
        className="mt-10 bg-[#d4ff2e] text-black py-5 rounded-2xl display font-bold text-lg tracking-tight flex items-center justify-between px-6 disabled:opacity-40">
        <span>Поехали</span>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

// ============ TODAY VIEW ============
function TodayView({ profile, weightLog, workoutLog, nextProgram, onStartWorkout, onAddWeight, onShowExercise }) {
  const program = PROGRAMS[nextProgram];
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const totalLost = profile.startWeight - profile.currentWeight;
  const toGo = profile.currentWeight - profile.goalWeight;
  const totalToLose = profile.startWeight - profile.goalWeight;
  const progress = Math.max(0, Math.min(100, (totalLost / totalToLose) * 100));

  const streak = useMemo(() => {
    if (workoutLog.length === 0) return 0;
    const dates = [...new Set(workoutLog.map(w => w.date))].sort().reverse();
    let count = 0;
    const today = new Date(todayIso());
    const last = new Date(dates[0]);
    const daysSinceLast = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (daysSinceLast > 4) return 0;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = Math.floor((new Date(dates[i]) - new Date(dates[i + 1])) / (1000 * 60 * 60 * 24));
      if (diff <= 4) count++;
      else break;
    }
    return count + 1;
  }, [workoutLog]);

  const workedOutToday = workoutLog.some(w => w.date === todayIso());

  return (
    <div className="space-y-5">
      {profile.name && (
        <div className="text-white/60 text-sm">Привет, {profile.name}.</div>
      )}

      <div className="bg-gradient-to-br from-[#141311] to-[#0a0908] border border-white/10 rounded-3xl p-6 overflow-hidden relative">
        <div className="absolute top-4 right-4">
          <TrendingDown size={24} className="text-[#d4ff2e]" />
        </div>
        <div className="text-[10px] mono tracking-[0.2em] text-white/50 mb-3">ТЕКУЩИЙ ВЕС</div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="display text-6xl font-extrabold leading-none">{profile.currentWeight}</div>
          <div className="mono text-white/40 text-sm">кг</div>
        </div>

        <div className="flex items-center justify-between text-[11px] mono text-white/50 mb-2">
          <span>СТАРТ {profile.startWeight}</span>
          <span className="text-[#d4ff2e]">−{totalLost.toFixed(1)} кг</span>
          <span>ЦЕЛЬ {profile.goalWeight}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#d4ff2e] rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 text-sm text-white/70">Осталось сбросить <span className="text-[#d4ff2e] font-semibold">{toGo.toFixed(1)} кг</span></div>

        <button onClick={() => setShowWeightInput(!showWeightInput)} className="mt-4 text-[11px] mono tracking-wider text-[#d4ff2e] flex items-center gap-1 hover:opacity-80">
          <Plus size={13} /> ОБНОВИТЬ ВЕС
        </button>
        {showWeightInput && (
          <div className="mt-3 flex gap-2">
            <input value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" step="0.1" inputMode="decimal"
              placeholder="Вес, кг"
              className="flex-1 bg-white/5 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none text-lg display font-bold" />
            <button onClick={() => { if (weightInput) { onAddWeight(weightInput); setWeightInput(''); setShowWeightInput(false); } }}
              className="bg-[#d4ff2e] text-black px-5 rounded-xl mono text-sm font-bold">OK</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Flame size={16} className="text-[#d4ff2e] mb-2" />
          <div className="display text-2xl font-bold">{streak}</div>
          <div className="text-[10px] mono text-white/50 tracking-wider uppercase mt-1">Стрик</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Dumbbell size={16} className="text-[#d4ff2e] mb-2" />
          <div className="display text-2xl font-bold">{workoutLog.length}</div>
          <div className="text-[10px] mono text-white/50 tracking-wider uppercase mt-1">Всего</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Calendar size={16} className="text-[#d4ff2e] mb-2" />
          <div className="display text-2xl font-bold">{Math.max(0, daysBetween(profile.startDate, todayIso()))}</div>
          <div className="text-[10px] mono text-white/50 tracking-wider uppercase mt-1">Дней</div>
        </div>
      </div>

      <div className="bg-[#d4ff2e] text-black rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] mono tracking-[0.2em] opacity-60 mb-1">{workedOutToday ? 'СЛЕДУЮЩАЯ' : 'СЕГОДНЯ В ЗАЛЕ'}</div>
            <h2 className="display text-3xl font-extrabold leading-tight">{program.name}</h2>
            <div className="text-sm font-medium mt-1 opacity-70">{program.focus}</div>
          </div>
          <div className="display text-5xl font-extrabold opacity-30">{nextProgram}</div>
        </div>

        <div className="space-y-1 mt-4 mb-5">
          {program.exercises.map((ex, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-black/10 last:border-0">
              <span className="font-medium">{EXERCISES[ex.id].name}</span>
              <span className="mono text-xs opacity-60">{ex.sets}×{ex.reps}</span>
            </div>
          ))}
        </div>

        {workedOutToday ? (
          <div className="bg-black/10 rounded-xl py-3 px-4 text-center">
            <Check size={18} className="inline mr-2" />
            <span className="text-sm font-medium">Тренировка уже выполнена сегодня</span>
          </div>
        ) : (
          <button onClick={() => onStartWorkout(nextProgram)}
            className="w-full bg-black text-[#d4ff2e] py-4 rounded-2xl display font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition">
            НАЧАТЬ ТРЕНИРОВКУ
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="text-[#d4ff2e] shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] mono tracking-wider text-white/50 uppercase mb-1">Совет дня</div>
            <div className="text-sm text-white/80 leading-relaxed">
              {[
                'На дефиците главное — сохранить мышцы. Работай тяжело в базе, не экономь на весах.',
                'Пей воду до, во время и после тренировки. Обезвоживание тормозит прогресс.',
                'Сон — это треть результата. Меньше 7 часов = хуже восстановление и больше голода.',
                'Если тяжело физически — 10% недоспать можно. Если психологически — отдохни день.',
                'Техника важнее веса. Всегда. Сбрось вес, если форма ломается.',
                'Белок в каждом приёме пищи. Цель ~1.8-2 г/кг цели (то есть ~135-150 г в день).',
                'Не взвешивайся каждый день. Раз в неделю, утром натощак — самое честное.'
              ][daysBetween(profile.startDate, todayIso()) % 7]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SESSION SCREEN ============
function SessionScreen({ session, setSession, onFinish, onCancel, history }) {
  const [currentEx, setCurrentEx] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [modalExerciseId, setModalExerciseId] = useState(null);

  useEffect(() => {
    if (!restTimer) return;
    const t = setInterval(() => {
      setRestSeconds(s => {
        if (s <= 1) { clearInterval(t); setRestTimer(null); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restTimer]);

  const program = PROGRAMS[session.program];
  const ex = session.exercises[currentEx];
  const exMeta = EXERCISES[ex.id];
  const suggestion = suggestWeight(ex.id, history);

  const updateSet = (setIdx, field, value) => {
    const newExercises = [...session.exercises];
    newExercises[currentEx].sets[setIdx][field] = value;
    setSession({ ...session, exercises: newExercises });
  };

  const toggleDone = (setIdx) => {
    const newExercises = [...session.exercises];
    const set = newExercises[currentEx].sets[setIdx];
    const wasDone = set.done;
    set.done = !set.done;
    setSession({ ...session, exercises: newExercises });
    if (!wasDone && exMeta.rest) {
      setRestSeconds(exMeta.rest);
      setRestTimer(Date.now());
    }
  };

  const addSet = () => {
    const newExercises = [...session.exercises];
    newExercises[currentEx].sets.push({ weight: '', reps: '', done: false });
    setSession({ ...session, exercises: newExercises });
  };

  const removeSet = (setIdx) => {
    const newExercises = [...session.exercises];
    newExercises[currentEx].sets.splice(setIdx, 1);
    setSession({ ...session, exercises: newExercises });
  };

  const totalSetsAllEx = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSetsAllEx = session.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const overallPct = (doneSetsAllEx / totalSetsAllEx) * 100;

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#f5f2eb] pb-24 max-w-2xl mx-auto">
      <header className="sticky top-0 bg-[#0a0908]/95 backdrop-blur z-40 px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onCancel} className="text-white/60 flex items-center gap-1 text-sm">
            <X size={18} /> Отмена
          </button>
          <div className="text-[10px] mono tracking-wider text-[#d4ff2e]">{program.name} • {program.focus}</div>
          <button onClick={() => onFinish(session)}
            disabled={doneSetsAllEx === 0}
            className="text-[#d4ff2e] mono text-sm font-bold disabled:opacity-30">ГОТОВО</button>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#d4ff2e] transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
      </header>

      {restTimer && restSeconds > 0 && (
        <div className="fixed top-24 left-5 right-5 max-w-2xl mx-auto bg-[#d4ff2e] text-black rounded-2xl p-4 z-50 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <Clock size={20} />
            <div>
              <div className="text-[10px] mono tracking-wider opacity-70">ОТДЫХ</div>
              <div className="display text-2xl font-extrabold leading-none">{Math.floor(restSeconds/60)}:{(restSeconds%60).toString().padStart(2,'0')}</div>
            </div>
          </div>
          <button onClick={() => { setRestTimer(null); setRestSeconds(0); }} className="text-xs mono font-bold">ПРОПУСТИТЬ</button>
        </div>
      )}

      <main className="px-5 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-[10px] mono text-white/50 tracking-wider mb-1">УПРАЖНЕНИЕ {currentEx + 1} ИЗ {session.exercises.length}</div>
            <h2 className="display text-3xl font-extrabold leading-tight mb-1">{exMeta.name}</h2>
            <div className="text-sm text-white/60">{exMeta.muscles}</div>
          </div>
          <button onClick={() => setModalExerciseId(ex.id)} className="bg-white/5 border border-white/10 rounded-xl p-3 ml-3">
            <Info size={18} className="text-[#d4ff2e]" />
          </button>
        </div>

        <div className="flex gap-2 text-xs mb-5">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 mono">{ex.targetSets} × {ex.targetReps}</div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 mono text-white/60">Отдых {exMeta.rest}с</div>
        </div>

        {suggestion && (
          <div className="bg-[#d4ff2e]/10 border border-[#d4ff2e]/30 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-2">
              <Target size={16} className="text-[#d4ff2e] mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] mono tracking-wider text-[#d4ff2e] mb-1">РЕКОМЕНДАЦИЯ</div>
                <div className="text-sm"><span className="display font-bold text-lg">{suggestion.weight} кг</span> — {suggestion.hint}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 items-center text-[10px] mono tracking-wider text-white/40 uppercase px-2">
            <span>Сет</span>
            <span>Вес, кг</span>
            <span>Повторы</span>
            <span></span>
            <span></span>
          </div>
          {ex.sets.map((set, idx) => (
            <div key={idx} className={`grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 items-center rounded-2xl p-3 transition ${set.done ? 'bg-[#d4ff2e]/5 border border-[#d4ff2e]/20' : 'bg-white/5 border border-white/10'}`}>
              <div className="display font-bold text-lg w-8 text-center">{idx + 1}</div>
              <input value={set.weight} onChange={e => updateSet(idx, 'weight', e.target.value)} type="number" step="0.5" inputMode="decimal"
                placeholder={suggestion ? suggestion.weight.toString() : '0'}
                className={`bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-3 py-2.5 outline-none display font-bold text-lg w-full ${set.done ? 'text-[#d4ff2e]' : ''}`} />
              <input value={set.reps} onChange={e => updateSet(idx, 'reps', e.target.value)} type="number" inputMode="numeric"
                placeholder={ex.targetReps.split('-')[0]}
                className={`bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-3 py-2.5 outline-none display font-bold text-lg w-full ${set.done ? 'text-[#d4ff2e]' : ''}`} />
              <button onClick={() => toggleDone(idx)}
                disabled={!set.weight || !set.reps}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${set.done ? 'bg-[#d4ff2e] text-black' : 'bg-white/5 border border-white/10 text-white/40'} disabled:opacity-30`}>
                <Check size={18} strokeWidth={3} />
              </button>
              <button onClick={() => removeSet(idx)} className="w-8 h-10 text-white/30 flex items-center justify-center">
                <Minus size={16} />
              </button>
            </div>
          ))}
          <button onClick={addSet} className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl py-3 text-sm text-white/60 flex items-center justify-center gap-2 hover:bg-white/10">
            <Plus size={16} /> Добавить сет
          </button>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={() => setCurrentEx(Math.max(0, currentEx - 1))}
            disabled={currentEx === 0}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 mono text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30">
            <ArrowLeft size={16} /> ПРЕД.
          </button>
          <button onClick={() => setCurrentEx(Math.min(session.exercises.length - 1, currentEx + 1))}
            disabled={currentEx === session.exercises.length - 1}
            className="flex-1 bg-[#d4ff2e] text-black rounded-2xl py-4 mono text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30">
            СЛЕД. <ChevronRight size={16} />
          </button>
        </div>

        <div className="mt-8 space-y-1">
          <div className="text-[10px] mono tracking-wider text-white/40 uppercase mb-3">Все упражнения</div>
          {session.exercises.map((e, i) => {
            const done = e.sets.filter(s => s.done).length;
            const total = e.sets.length;
            return (
              <button key={i} onClick={() => setCurrentEx(i)}
                className={`w-full text-left rounded-xl py-3 px-4 flex items-center justify-between transition ${i === currentEx ? 'bg-[#d4ff2e]/10 border border-[#d4ff2e]/30' : 'bg-white/5 border border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <span className={`mono text-xs ${done === total ? 'text-[#d4ff2e]' : 'text-white/40'}`}>{i + 1}</span>
                  <span className="text-sm font-medium">{EXERCISES[e.id].name}</span>
                </div>
                <span className="mono text-xs text-white/50">{done}/{total}</span>
              </button>
            );
          })}
        </div>
      </main>

      {modalExerciseId && (
        <ExerciseModal exerciseId={modalExerciseId} onClose={() => setModalExerciseId(null)} />
      )}
    </div>
  );
}

// ============ EXERCISE MODAL ============
function ExerciseModal({ exerciseId, onClose }) {
  const ex = EXERCISES[exerciseId];
  if (!ex) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-[#141311] border-t md:border border-white/10 md:rounded-3xl rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#141311]/95 backdrop-blur p-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="text-[10px] mono tracking-wider text-[#d4ff2e] mb-1">ТЕХНИКА ВЫПОЛНЕНИЯ</div>
            <h2 className="display text-2xl font-extrabold leading-tight">{ex.name}</h2>
            <div className="text-sm text-white/60 mt-1">{ex.muscles}</div>
          </div>
          <button onClick={onClose} className="bg-white/5 rounded-xl p-2 shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <div className="text-[10px] mono tracking-wider text-white/50 uppercase mb-3 flex items-center gap-2">
              <Check size={13} className="text-[#d4ff2e]" /> КАК ПРАВИЛЬНО
            </div>
            <ol className="space-y-2.5">
              {ex.technique.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="display font-bold text-[#d4ff2e] shrink-0 w-6">{i + 1}</span>
                  <span className="text-white/85">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-[10px] mono tracking-wider text-white/50 uppercase mb-3 flex items-center gap-2">
              <AlertTriangle size={13} className="text-orange-400" /> ЧАСТЫЕ ОШИБКИ
            </div>
            <ul className="space-y-2.5">
              {ex.mistakes.map((m, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-orange-400 shrink-0">×</span>
                  <span className="text-white/85">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#d4ff2e]/10 border border-[#d4ff2e]/30 rounded-2xl p-4">
            <div className="flex gap-3">
              <Lightbulb size={18} className="text-[#d4ff2e] shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] mono tracking-wider text-[#d4ff2e] mb-1">СОВЕТ</div>
                <div className="text-sm leading-relaxed text-white/90">{ex.tip}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-[9px] mono tracking-wider text-white/40 uppercase mb-1">Оборудование</div>
              <div className="text-white/80">{ex.equipment}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-[9px] mono tracking-wider text-white/40 uppercase mb-1">Отдых между сетами</div>
              <div className="text-white/80 mono">{ex.rest} секунд</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PROGRESS VIEW ============
function ProgressView({ profile, weightLog, workoutLog, onAddWeight }) {
  const [weightInput, setWeightInput] = useState('');

  const chartData = useMemo(() => {
    const log = [...weightLog];
    if (log.length === 0 || log[0].date !== profile.startDate) {
      log.unshift({ date: profile.startDate, weight: profile.startWeight });
    }
    return log.map(e => ({ date: fmtDate(e.date), weight: e.weight }));
  }, [weightLog, profile]);

  const totalLost = profile.startWeight - profile.currentWeight;
  const totalToLose = profile.startWeight - profile.goalWeight;
  const progress = (totalLost / totalToLose) * 100;

  const workoutsByWeek = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7 + 6));
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const count = workoutLog.filter(w => {
        const d = new Date(w.date);
        return d >= start && d <= end;
      }).length;
      weeks.push({ week: `−${i}н`, count });
    }
    return weeks;
  }, [workoutLog]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] mono tracking-[0.2em] text-[#d4ff2e] mb-2">ПРОГРЕСС</div>
        <h2 className="display text-3xl font-extrabold">Путь к {profile.goalWeight} кг</h2>
      </div>

      <div className="bg-gradient-to-br from-[#141311] to-[#0a0908] border border-white/10 rounded-3xl p-6">
        <div className="text-[10px] mono text-white/50 tracking-wider mb-2">СБРОШЕНО</div>
        <div className="display text-6xl font-extrabold text-[#d4ff2e] leading-none mb-2">{totalLost.toFixed(1)}</div>
        <div className="mono text-sm text-white/60">кг из {totalToLose.toFixed(1)} • {progress.toFixed(0)}%</div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] mono tracking-wider text-white/50 uppercase">График веса</div>
            <div className="text-sm mt-1">{weightLog.length} замеров</div>
          </div>
          <Scale size={20} className="text-[#d4ff2e]" />
        </div>

        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="wColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4ff2e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4ff2e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: '#ffffff60', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#ffffff60', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#141311', border: '1px solid #ffffff20', borderRadius: 12, fontFamily: 'JetBrains Mono', fontSize: 12 }} />
              <ReferenceLine y={profile.goalWeight} stroke="#d4ff2e" strokeDasharray="3 3" label={{ value: 'Цель', fill: '#d4ff2e', fontSize: 10 }} />
              <Area type="monotone" dataKey="weight" stroke="#d4ff2e" strokeWidth={2.5} fill="url(#wColor)" dot={{ fill: '#d4ff2e', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-white/40 text-sm">Добавь замеры, чтобы увидеть график</div>
        )}

        <div className="mt-4 flex gap-2">
          <input value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" step="0.1" inputMode="decimal"
            placeholder="Записать вес сегодня"
            className="flex-1 bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none" />
          <button onClick={() => { if (weightInput) { onAddWeight(weightInput); setWeightInput(''); } }}
            className="bg-[#d4ff2e] text-black px-5 rounded-xl mono text-sm font-bold">
            <Plus size={16} className="inline mr-1" /> OK
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
        <div className="text-[10px] mono tracking-wider text-white/50 uppercase mb-4">Частота тренировок</div>
        <div className="flex items-end gap-3 h-32">
          {workoutsByWeek.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="display text-xs text-white/60">{w.count}</div>
              <div className="w-full bg-[#d4ff2e] rounded-t-md transition-all" style={{ height: `${(w.count / 5) * 100}%`, minHeight: w.count > 0 ? '8%' : '2%', opacity: w.count > 0 ? 1 : 0.2 }} />
              <div className="mono text-[10px] text-white/40">{w.week}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/60">Цель: 3×в неделю</span>
          <span className="mono text-[#d4ff2e]">{workoutsByWeek[3]?.count || 0}/3 на этой неделе</span>
        </div>
      </div>
    </div>
  );
}

// ============ HISTORY VIEW ============
function HistoryView({ workoutLog, onShowExercise }) {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...workoutLog].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] mono tracking-[0.2em] text-[#d4ff2e] mb-2">ЖУРНАЛ</div>
        <h2 className="display text-3xl font-extrabold">{sorted.length} {sorted.length === 1 ? 'тренировка' : sorted.length < 5 ? 'тренировки' : 'тренировок'}</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-white/30" />
          <div className="text-sm text-white/60">Пока пусто. Первая тренировка появится тут сразу после завершения.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((w, idx) => {
            const program = PROGRAMS[w.program];
            const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
            const totalVolume = w.exercises.reduce((a, e) => a + e.sets.reduce((sa, s) => sa + s.weight * s.reps, 0), 0);
            const isOpen = expanded === idx;

            return (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : idx)} className="w-full p-4 flex items-center justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="display font-bold text-lg">{program?.name}</span>
                      <span className="text-[10px] mono bg-[#d4ff2e]/20 text-[#d4ff2e] px-2 py-0.5 rounded">{w.program}</span>
                    </div>
                    <div className="text-xs text-white/50 mono">{fmtFullDate(w.date)} • {totalSets} сетов • {Math.round(totalVolume)} кг объём</div>
                  </div>
                  <ChevronRight size={18} className={`text-white/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                    {w.exercises.map((e, ei) => (
                      <div key={ei}>
                        <button onClick={() => onShowExercise(e.id)} className="text-left w-full">
                          <div className="text-sm font-medium mb-1 flex items-center gap-2 hover:text-[#d4ff2e]">
                            {EXERCISES[e.id]?.name}
                            <Info size={11} className="opacity-50" />
                          </div>
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                          {e.sets.map((s, si) => (
                            <span key={si} className="text-[11px] mono bg-black/30 border border-white/10 rounded px-2 py-1">
                              {s.weight}×{s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ PROFILE VIEW ============
function ProfileView({ profile, onSave, workoutLog, weightLog }) {
  const [editMode, setEditMode] = useState(false);
  const [startWeight, setStartWeight] = useState(profile.startWeight);
  const [goalWeight, setGoalWeight] = useState(profile.goalWeight);
  const [currentWeight, setCurrentWeight] = useState(profile.currentWeight);
  const [name, setName] = useState(profile.name || '');
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    onSave({ ...profile, startWeight: parseFloat(startWeight), goalWeight: parseFloat(goalWeight), currentWeight: parseFloat(currentWeight), name: name.trim() });
    setEditMode(false);
  };

  const reset = async () => {
    await storage.delete('profile');
    await storage.set('weight-log', []);
    await storage.set('workout-log', []);
    await storage.set('next-program', 'A');
    window.location.reload();
  };

  const exportData = () => {
    const data = {
      profile,
      weightLog,
      workoutLog,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-coach-backup-${todayIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] mono tracking-[0.2em] text-[#d4ff2e] mb-2">ПРОФИЛЬ</div>
        <h2 className="display text-3xl font-extrabold">{profile.name || 'Твои данные'}</h2>
      </div>

      {!editMode ? (
        <>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/60">Старт</span>
              <span className="display font-bold">{profile.startWeight} кг</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/60">Текущий вес</span>
              <span className="display font-bold">{profile.currentWeight} кг</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/60">Цель</span>
              <span className="display font-bold text-[#d4ff2e]">{profile.goalWeight} кг</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-white/60">Программа</span>
              <span className="mono text-xs">Full Body A/B/C • 3×/нед</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Опыт</span>
              <span className="mono text-xs">Средний</span>
            </div>
          </div>

          <button onClick={() => setEditMode(true)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 font-medium">
            Изменить данные
          </button>

          <button onClick={exportData} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 font-medium text-sm">
            Экспорт данных (резервная копия)
          </button>

          <div className="bg-gradient-to-br from-[#d4ff2e]/10 to-transparent border border-[#d4ff2e]/20 rounded-2xl p-5">
            <Trophy size={20} className="text-[#d4ff2e] mb-2" />
            <div className="display font-bold text-lg mb-1">Итоги</div>
            <div className="text-sm text-white/70 leading-relaxed">
              Ты занимаешься {Math.max(1, daysBetween(profile.startDate, todayIso()) + 1)} {daysBetween(profile.startDate, todayIso()) === 0 ? 'день' : daysBetween(profile.startDate, todayIso()) < 4 ? 'дня' : 'дней'}.
              Провёл {workoutLog.length} {workoutLog.length === 1 ? 'тренировку' : workoutLog.length < 5 ? 'тренировки' : 'тренировок'}.
              Сбросил {(profile.startWeight - profile.currentWeight).toFixed(1)} кг.
            </div>
          </div>

          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="w-full text-red-400/70 text-xs mono tracking-wider py-3">
              СБРОСИТЬ ВСЕ ДАННЫЕ
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
              <div className="text-sm mb-4">Это удалит все тренировки, замеры веса и прогресс. Отменить нельзя.</div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmReset(false)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-sm">Отмена</button>
                <button onClick={reset} className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Удалить всё
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5">
          <div>
            <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Имя</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Стартовый вес</label>
            <input value={startWeight} onChange={e => setStartWeight(e.target.value)} type="number" step="0.1"
              className="w-full bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Текущий вес</label>
            <input value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} type="number" step="0.1"
              className="w-full bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="text-[10px] mono tracking-wider text-white/50 uppercase mb-2 block">Цель</label>
            <input value={goalWeight} onChange={e => setGoalWeight(e.target.value)} type="number" step="0.1"
              className="w-full bg-black/30 border border-white/10 focus:border-[#d4ff2e] rounded-xl px-4 py-3 outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditMode(false)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3">Отмена</button>
            <button onClick={save} className="flex-1 bg-[#d4ff2e] text-black rounded-xl py-3 font-bold">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
