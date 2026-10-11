import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  CalendarDays,
  Repeat,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LocateFixed,
  Check,
  Search,
  X,
  Clock,
  BookOpen,
  Briefcase,
  Users,
  Target,
} from "lucide-react";
import "./style.css";
import Select from "./Select";
import {afterPrayer, activityCapacity} from "./prayer";
import { coordinates, cities, nearestCity } from "./location";
type Task = {
  id: string;
  title: string;
  minutes: number;
  period: number;
  category: string;
  date: string;
  repeat: number[];
  enabled: boolean;
};
type Data = {
  tasks: Task[];
  done: Record<string, boolean>;
  lang: string;
  dark: boolean;
  city: string;
  prayerMinutes: number;
};
const key = "prayer-planner-v1";
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => localDate(new Date());
const shift = (d: string, n: number) => {
  const v = new Date(d + "T12:00");
  v.setDate(v.getDate() + n);
  return localDate(v);
};
const names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const icons = [Sunrise, Sun, CloudSun, Sunset, Moon];
const cats = ["Spirituel", "Travail", "Personnel", "Famille", "Santé"];
const translations: Record<string, string[]> = {
  fr: [
    "Tableau de bord",
    "Vue quotidienne",
    "Vue hebdomadaire",
    "Tâches récurrentes",
    "Statistiques",
    "Paramètres",
    "Organise ta vie entre les prières",
    "Ajouter une activité",
    "Activités du jour",
    "terminées",
    "Temps planifié",
    "Temps accompli",
    "Matinée · Énergie et concentration",
    "Travail et apprentissage",
    "Projets personnels",
    "Temps en famille",
    "Détente et préparation du lendemain",
    "Aujourd’hui",
    "Enregistrer",
    "Annuler",
    "Titre",
    "Durée (minutes)",
    "Période",
    "Catégorie",
    "Répétition",
    "Aucune",
    "Chaque jour",
    "Jours spécifiques",
    "Langue",
    "Ville",
    "Apparence",
    "Clair",
    "Sombre",
    "Chargement des horaires…",
    "Horaires indisponibles. Vérifiez votre connexion et réessayez.",
    "Réessayer",
    "Aucune activité pour ce jour",
    "Rechercher une activité",
    "Votre journée, en toute sérénité.",
    "Calendrier",
    "Objectifs de la semaine",
  ],
  ar: [
    "لوحة التحكم",
    "العرض اليومي",
    "العرض الأسبوعي",
    "الأنشطة المتكررة",
    "الإحصائيات",
    "الإعدادات",
    "نظّم حياتك بين الصلوات",
    "إضافة نشاط",
    "أنشطة اليوم",
    "مكتملة",
    "الوقت المخطط",
    "الوقت المنجز",
    "الصباح · طاقة وتركيز",
    "العمل والتعلم",
    "المشاريع الشخصية",
    "وقت العائلة",
    "الراحة والاستعداد للغد",
    "اليوم",
    "حفظ",
    "إلغاء",
    "العنوان",
    "المدة (بالدقائق)",
    "الفترة",
    "الفئة",
    "التكرار",
    "بدون",
    "يومياً",
    "أيام محددة",
    "اللغة",
    "المدينة",
    "المظهر",
    "فاتح",
    "داكن",
    "جارٍ تحميل المواقيت…",
    "تعذر تحميل المواقيت. تحقق من الاتصال وأعد المحاولة.",
    "إعادة المحاولة",
    "لا توجد أنشطة لهذا اليوم",
    "البحث عن نشاط",
    "يومك، بهدوء وطمأنينة.",
    "التقويم",
    "أهداف الأسبوع",
  ],
  en: [
    "Dashboard",
    "Daily view",
    "Weekly view",
    "Recurring activities",
    "Statistics",
    "Settings",
    "Organise your life between prayers",
    "Add activity",
    "Today’s activities",
    "completed",
    "Planned time",
    "Completed time",
    "Morning · Energy and focus",
    "Work and learning",
    "Personal projects",
    "Family time",
    "Rest and prepare for tomorrow",
    "Today",
    "Save",
    "Cancel",
    "Title",
    "Duration (minutes)",
    "Period",
    "Category",
    "Repeat",
    "Never",
    "Every day",
    "Specific weekdays",
    "Language",
    "City",
    "Appearance",
    "Light",
    "Dark",
    "Loading prayer times…",
    "Prayer times unavailable. Check your connection and retry.",
    "Retry",
    "No activities for this day",
    "Search activities",
    "Your day, with peace of mind.",
    "Calendar",
    "Weekly goals",
  ],
};
const initial: Data = {
  tasks: [
    ["Lecture du Coran", 30, 0, 0],
    ["Planifier la journée", 15, 0, 2],
    ["Travail sur le projet", 120, 0, 1],
    ["Pause déjeuner", 45, 1, 4],
    ["Cours en ligne", 60, 1, 1],
    ["Révision", 60, 1, 1],
    ["Développement web", 90, 2, 2],
    ["Lecture", 30, 2, 2],
    ["Sport", 30, 2, 4],
    ["Dîner en famille", 45, 3, 3],
    ["Discussion / échanges", 30, 3, 3],
    ["Préparation du lendemain", 30, 4, 2],
    ["Lecture spirituelle", 30, 4, 0],
    ["Repos", 480, 4, 4],
  ].map((v, i) => ({
    id: "seed-" + i,
    title: String(v[0]),
    minutes: Number(v[1]),
    period: Number(v[2]),
    category: cats[Number(v[3])],
    date: today(),
    repeat: i === 0 ? [0, 1, 2, 3, 4, 5, 6] : [],
    enabled: true,
  })),
  done: {},
  lang: "fr",
  dark: false,
  city: "Rabat",
  prayerMinutes: 30,
};
function load(): Data {
  try {
    const d = JSON.parse(localStorage.getItem(key) || "null");
    return d && Array.isArray(d.tasks) && d.done
      ? { ...initial, ...d }
      : initial;
  } catch {
    return initial;
  }
}
function App() {
  const [data, setData] = useState<Data>(load);
  const [date, setDate] = useState(today());
  const [view, setView] = useState(0);
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Task | null>(null);
  const [mode, setMode] = useState("none");
  const [times, setTimes] = useState<Record<string, string> | null>(null);
  const [nextFajr, setNextFajr] = useState("");
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  const locationRequest = useRef(0);
  useEffect(
    () => () => {
      locationRequest.current += 1;
    },
    [],
  );
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<{
    key: string;
    city?: string;
    distance?: number;
  } | null>(null);
  const locationText: Record<string, Record<string, string>> = {
    ar: {
      detect: "تحديد أقرب مدينة",
      loading: "جارٍ تحديد المدينة…",
      denied: "لم يُسمح بالوصول إلى الموقع. يمكنك اختيار المدينة يدوياً.",
      unavailable: "تعذر تحديد الموقع. اختر المدينة يدوياً أو أعد المحاولة.",
      timeout: "انتهت مهلة تحديد الموقع. أعد المحاولة.",
      unsupported:
        "تحديد الموقع غير متاح هنا. افتح التطبيق عبر HTTPS أو localhost.",
      outside: "لا توجد مدينة مدعومة بالقرب من موقعك. اختر المدينة يدوياً.",
      found: "تم اختيار أقرب مدينة:",
      hint: "بعد موافقتك على إذن الموقع، نختار أقرب مدينة من القائمة (ضمن 75 كم). تُستخدم مواقيت المدينة؛ لا نحتفظ بإحداثيات موقعك.",
    },
    fr: {
      detect: "Détecter la ville proche",
      loading: "Localisation…",
      denied: "Accès à la position refusé. Choisissez une ville manuellement.",
      unavailable: "Position indisponible. Réessayez ou choisissez une ville.",
      timeout: "La localisation a expiré. Réessayez.",
      unsupported: "Localisation indisponible. Utilisez HTTPS ou localhost.",
      outside:
        "Aucune ville prise en charge à proximité. Choisissez une ville.",
      found: "Ville la plus proche :",
      hint: "Avec votre autorisation, nous choisissons la ville la plus proche de la liste (à moins de 75 km). Les horaires sont ceux de cette ville. Vos coordonnées ne sont pas conservées.",
    },
    en: {
      detect: "Detect nearest city",
      loading: "Locating…",
      denied: "Location permission denied. Choose a city manually.",
      unavailable: "Location unavailable. Retry or choose a city.",
      timeout: "Location request timed out. Please retry.",
      unsupported: "Location unavailable here. Use HTTPS or localhost.",
      outside: "No supported city nearby. Choose a city manually.",
      found: "Nearest city selected:",
      hint: "With your permission, we select the nearest listed city within 75 km and use its prayer times. Your coordinates are not stored.",
    },
  };
  const lt = (key: string) => (locationText[data.lang] || locationText.fr)[key];
  const selectCity = (city: string) => {
    locationRequest.current += 1;
    setLocating(false);
    setData((previous) => ({ ...previous, city }));
    setLocationMessage(null);
  };
  const detectCity = () => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setLocationMessage({ key: "unsupported" });
      return;
    }
    const request = ++locationRequest.current;
    setLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== locationRequest.current) return;
        const nearest = nearestCity(
          position.coords.latitude,
          position.coords.longitude,
        );
        setLocating(false);
        if (nearest.distance > 75 || position.coords.accuracy > 75000) {
          setLocationMessage({ key: "outside" });
          return;
        }
        setData((previous) => ({ ...previous, city: nearest.city }));
        setLocationMessage({
          key: "found",
          city: nearest.city,
          distance: Math.round(nearest.distance),
        });
      },
      (error) => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setLocationMessage({
          key:
            error.code === 1
              ? "denied"
              : error.code === 3
                ? "timeout"
                : "unavailable",
        });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };
  const locateButton = (
    <button
      type="button"
      className="locate-city"
      aria-label={lt("detect")}
      disabled={locating}
      onClick={detectCity}
      title={lt("hint")}
    >
      <LocateFixed size={17} />
      <span>{lt(locating ? "loading" : "detect")}</span>
    </button>
  );

  const t = (i: number) => translations[data.lang]?.[i] || translations.fr[i];
  const prayerLabels = data.lang === "ar" ? {title:"وقت الصلاة",setting:"المدة المحجوزة لكل صلاة",available:"للأنشطة",reserved:"محجوز يومياً للصلاة",nextDay:"اليوم التالي",note:"تُخصم هذه المدة من كل فترة قبل تخطيط الأنشطة.",tooLong:"وقت الصلاة يتجاوز هذه الفترة"} : data.lang === "en" ? {title:"Prayer",setting:"Time reserved for each prayer",available:"for activities",reserved:"reserved daily for prayers",nextDay:"next day",note:"This duration is deducted from each period before planning activities.",tooLong:"Prayer time exceeds this period"} : {title:"Prière",setting:"Durée réservée à chaque prière",available:"pour les activités",reserved:"réservées chaque jour aux prières",nextDay:"lendemain",note:"Cette durée est déduite de chaque période avant de planifier les activités.",tooLong:"Le créneau de prière dépasse cette période"};
  const prayerIcon = <svg aria-hidden="true" viewBox="0 0 64 64" width="18" height="18" fill="currentColor"><path d="M24 48V28c0-10 8-11 8-17 0 6 8 7 8 17v20h-6V35h-4v13zM9 50V30h4v20zm42 0V30h4v20zM7 29l4-8 4 8zm42 0l4-8 4 8zM2 57Q32 33 62 57v3Q32 44 2 60z"/></svg>;
  const locale =
    data.lang === "ar" ? "ar-MA" : data.lang === "en" ? "en-GB" : "fr-FR";
  const weekdays =
    data.lang === "ar"
      ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
      : data.lang === "en"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
    document.documentElement.lang = data.lang;
    document.documentElement.dir = data.lang === "ar" ? "rtl" : "ltr";
  }, [data]);
  useEffect(() => {
    let lastToday = today();
    const timer = setInterval(() => {
      const now = today();
      if (now !== lastToday) {
        setDate((d) => (d === lastToday ? now : d));
        lastToday = now;
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => {
      ctrl.abort();
      setStatus("error");
    }, 15000);
    setTimes(null);
    setStatus("loading");
    const get = async (d: string) => {
      const cacheKey = `prayer-times-v3:${data.city}:${d}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
      const [latitude, longitude] = coordinates[data.city] || coordinates.Rabat;
      const formatted = d.split("-").reverse().join("-");
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${formatted}?latitude=${latitude}&longitude=${longitude}&method=21&timezonestring=Africa%2FCasablanca`,
        { signal: ctrl.signal },
      );
      if (!res.ok) throw Error();
      const json = await res.json();
      if (json.code !== 200) throw Error();
      const result = json.data.timings;
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    };
    Promise.all([get(date), get(shift(date, 1))])
      .then(([a, b]) => {
        if (!ctrl.signal.aborted) {
          clearTimeout(timeout);
          setTimes(a);
          setNextFajr(b.Fajr.slice(0, 5));
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setStatus("error");
      });
    return () => {
      clearTimeout(timeout);
      ctrl.abort();
    };
  }, [date, data.city, retry]);
  const visible = (d: string) =>
    data.tasks.filter(
      (a) =>
        a.enabled &&
        (a.repeat.length
          ? d >= a.date && a.repeat.includes(new Date(d + "T12:00").getDay())
          : a.date === d),
    );
  const tasks = visible(date);
  const done = (a: Task, d = date) => !!data.done[`${d}:${a.id}`];
  const completed = tasks.filter((a) => done(a));
  const planned = tasks.reduce((s, a) => s + a.minutes, 0);
  const accomplished = completed.reduce((s, a) => s + a.minutes, 0);
  const pct = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 0;
  const format = (n: number) =>
    n >= 60
      ? `${Math.floor(n / 60)}h ${n % 60 ? String(n % 60).padStart(2, "0") : ""}`
      : `${n} min`;
  const toggle = (a: Task, d = date) =>
    setData({ ...data, done: { ...data.done, [`${d}:${a.id}`]: !done(a, d) } });
  const add = (period = 0) => {
    setEdit({
      id: crypto.randomUUID(),
      title: "",
      minutes: 30,
      period,
      category: cats[0],
      date,
      repeat: [],
      enabled: true,
    });
    setMode("none");
  };
  const open = (a: Task) => {
    setEdit({ ...a });
    setMode(
      a.repeat.length === 7 ? "daily" : a.repeat.length ? "days" : "none",
    );
  };
  const remove = (a: Task) =>
    setData({ ...data, tasks: data.tasks.filter((v) => v.id !== a.id) });
  const minutes = (s: string) =>
    Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const span = (p: number) =>
    times
      ? (minutes(p === 4 ? nextFajr : times[names[p + 1]]) -
          minutes(times[names[p]]) +
          1440) %
        1440
      : 0;
  const weekStart = shift(
    date,
    -((new Date(date + "T12:00").getDay() + 6) % 7),
  );
  const week = Array.from({ length: 7 }, (_, i) => shift(weekStart, i));
  const month = new Date(date + "T12:00");
  month.setDate(1);
  const start = shift(localDate(month), -((month.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => shift(start, i));
  const navIcons = [
    Home,
    CalendarDays,
    CalendarDays,
    Repeat,
    BarChart3,
    Settings,
  ];
  const taskRow = (a: Task, d = date) => (
    <div className={"task-row " + (done(a, d) ? "completed" : "")} key={a.id}>
      <button
        className="checkbox"
        aria-label={t(9) + " " + a.title}
        onClick={() => toggle(a, d)}
      >
        {done(a, d) && <Check size={13} />}
      </button>
      <span className="task-title">{a.title}</span>
      <span className="task-time">{format(a.minutes)}</span>
      <button
        className="icon-btn"
        title={t(20)}
        aria-label={"Edit " + a.title}
        onClick={() => open(a)}
      >
        <Pencil size={13} />
      </button>
      <button
        className="icon-btn delete"
        aria-label={"Delete " + a.title}
        onClick={() => remove(a)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
  return (
    <div className={data.dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand">
          <span className="mosque">
            <svg viewBox="0 0 64 64" width="45" height="45" fill="currentColor">
              <path d="M24 48V28c0-10 8-11 8-17 0 6 8 7 8 17v20h-6V35h-4v13zM9 50V30h4v20zm42 0V30h4v20zM7 29l4-8 4 8zm42 0l4-8 4 8zM2 57Q32 33 62 57v3Q32 44 2 60z" />
            </svg>
          </span>
          <div>
            <h1>Prayer Planner</h1>
            <p>{t(6)}</p>
          </div>
        </div>
        <nav>
          {navIcons.map((Icon, i) => (
            <button
              key={i}
              className={view === i ? "active" : ""}
              onClick={() => setView(i)}
            >
              <Icon size={20} />
              {t(i)}
            </button>
          ))}
        </nav>
        <div className="sidebar-settings">
          <small>{t(30)}</small>
          <button
            className="theme-switch"
            onClick={() => setData({ ...data, dark: !data.dark })}
          >
            <Sun size={20} />
            <span className={"switch " + (data.dark ? "on" : "")} />
            <Moon size={18} />
          </button>
          <small>{t(28)}</small>
          <Select
            aria-label={t(28)}
            value={data.lang}
            onChange={(e) => setData({ ...data, lang: e.target.value })}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </Select>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <div className="night-sky" aria-hidden="true">
            <svg className="night-stars" viewBox="0 0 1000 120" preserveAspectRatio="none">
              <g fill="currentColor">
                <circle cx="45" cy="75" r="1.1"/><circle cx="125" cy="54" r="1"/>
                <circle cx="230" cy="79" r="1.2"/><circle cx="395" cy="63" r=".8"/>
                <circle cx="510" cy="18" r="1.1"/><circle cx="558" cy="47" r="1.5"/>
                <circle cx="625" cy="12" r=".8"/><circle cx="680" cy="36" r="1.2"/>
                <circle cx="744" cy="68" r=".8"/><circle cx="780" cy="14" r="1"/>
                <circle cx="872" cy="67" r="1.3"/><circle cx="950" cy="83" r=".9"/>
              </g>
              <path d="M606 34v6m-3-3h6M713 13v5m-2.5-2.5h5" stroke="currentColor" strokeWidth="1"/>
            </svg>
            <svg className="night-crescent" viewBox="0 0 32 32"><path fill="currentColor" d="M27 20.5A13 13 0 0 1 11.5 5a13 13 0 1 0 15.5 15.5Z"/></svg>
          </div>
          <div className="location">
            <MapPin size={17} />
            <Select
              value={data.city}
              aria-label={t(29)}
              onChange={(e) => selectCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <span className="country">Maroc</span>
            {locateButton}
          </div>
          <div className="header-date">
            {new Date(date + "T12:00").toLocaleDateString(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            <small>
              {new Intl.DateTimeFormat(locale + "-u-ca-islamic", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(date + "T12:00"))}
            </small>
          </div>
          <div className="header-actions">
            <button
              className="round"
              aria-label={t(5)}
              onClick={() => setView(5)}
            >
              <Settings size={19} />
            </button>
            <button
              type="button"
              className="round header-theme-toggle"
              aria-label={data.lang === "ar" ? (data.dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن") : data.lang === "en" ? (data.dark ? "Switch to light mode" : "Switch to dark mode") : (data.dark ? "Activer le mode clair" : "Activer le mode nuit")}
              title={data.lang === "ar" ? (data.dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن") : data.lang === "en" ? (data.dark ? "Switch to light mode" : "Switch to dark mode") : (data.dark ? "Activer le mode clair" : "Activer le mode nuit")}
              onClick={() => setData(previous => ({...previous, dark: !previous.dark}))}
            >
              {data.dark ? <Sun size={19}/> : <Moon size={19}/>}
            </button>
          </div>
          <svg className="skyline" viewBox="0 0 800 110" aria-hidden="true">
            <path
              fill="currentColor"
              d="M0 110V88h28V72h18v16h20V60h16v28h25V75h25v35h12V32h5V17h6V7h4v10h6v15h5v78h13V65h12v-9h10v9h12v45h16V82h30V65q20-30 40 0v17h30v28h18V73h20V54h7V39h8V28h5v11h8v15h7v56h15V85h24V68h14v17h23v25h15V48h6V27h9V12h6v15h9v21h6v62h17V78h18v-8h14v8h18v32h15V80h20V60q15-23 30 0v20h20v30h19V70h22V54h15v16h25v40h19V85h17V63h8V44h8V33h5v11h8v19h8v47h23V75h22v35h20V85h24v25z"
            />
          </svg>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <span className="eyebrow">PRAYER PLANNER</span>
              <h2>{t(view)}</h2>
            </div>
            <div className="date-controls">
              <button
                aria-label="Previous"
                onClick={() => setDate(shift(date, view === 2 ? -7 : -1))}
              >
                <ChevronLeft size={17} />
              </button>
              <button onClick={() => setDate(today())}>{t(17)}</button>
              <input
                aria-label={t(39)}
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
              />
              <button
                aria-label="Next"
                onClick={() => setDate(shift(date, view === 2 ? 7 : 1))}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </section>
          <div className="prayer-strip">
            {names.map((name, i) => {
              const Icon = icons[i];
              return (
                <div key={name} className={"prayer-card tone-" + i}>
                  <span className="prayer-icon">
                    <Icon size={31} />
                  </span>
                  <div>
                    <small>
                      {data.lang === "ar"
                        ? ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"][i]
                        : name}
                    </small>
                    <strong>{times ? times[name].slice(0, 5) : "—:—"}</strong>
                  </div>
                  <span className="prayer-line" />
                </div>
              );
            })}
          </div>
          {locationMessage && (
            <div role="status" className="notice location-notice">
              {lt(locationMessage.key)}{" "}
              {locationMessage.city && (
                <strong>
                  {locationMessage.city} · {locationMessage.distance} km
                </strong>
              )}
            </div>
          )}
          {status !== "ready" && (
            <div role="status" className="notice">
              {t(status === "loading" ? 33 : 34)}
              {status === "error" && (
                <button onClick={() => setRetry(retry + 1)}>{t(35)}</button>
              )}
            </div>
          )}
          {view <= 1 ? (
            <div className="dashboard-grid">
              <section>
                <div className="activity-toolbar">
                  <span>
                    {tasks.length} {t(8)}
                  </span>
                  <label>
                    <Search size={15} />
                    <input
                      placeholder={t(37)}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                {names.map((name, i) => {
                  const Icon = icons[i];
                  const group = tasks.filter(
                    (a) =>
                      a.period === i &&
                      a.title.toLowerCase().includes(search.toLowerCase()),
                  );
                  const used = tasks.filter(a => a.period === i).reduce((s, a) => s + a.minutes, 0);
                  const totalCapacity = span(i);
                  const capacity = activityCapacity(totalCapacity, data.prayerMinutes);
                  const remaining = Math.max(0, capacity - used);
                  const remainingLabel = data.lang === "ar" ? "متبقٍ" : data.lang === "en" ? "remaining" : "restant";
                  const prayerEnd = times ? afterPrayer(times[name], data.prayerMinutes) : null;
                  return (
                    <article className={"period tone-" + i} key={name}>
                      <div className="period-label">
                        <Icon size={38} />
                        <div className="period-details">
                        <h3>
                          {name} <span>→</span> {names[(i + 1) % 5]}
                        </h3>
                        <p>
                          {times
                            ? `${times[name].slice(0, 5)} – ${i === 4 ? nextFajr : times[names[i + 1]].slice(0, 5)}`
                            : "—"}
                        </p>
                        <small>{times ? `${format(capacity)} ${prayerLabels.available}` : "—"}</small>
                        </div>
                        <div className="ring-area">
                          <div
                            className="ring"
                            role="img"
                            aria-label={times ? `${format(remaining)} ${remainingLabel}` : "—"}
                            title={times ? `${format(used)} / ${format(capacity)}` : "—"}
                            style={{ background: `conic-gradient(var(--accent) ${capacity ? remaining / capacity * 360 : 0}deg, var(--ring-track) 0deg)` }}
                          >
                            <div>
                              <strong>{times ? format(remaining) : "—"}</strong>
                              <small>{remainingLabel}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="period-content">
                        <h3>
                          <span className="category-icon">
                            {i === 0 ? (
                              <BookOpen size={17} />
                            ) : i === 1 ? (
                              <Briefcase size={17} />
                            ) : i === 3 ? (
                              <Users size={17} />
                            ) : i === 4 ? (
                              <Moon size={17} />
                            ) : (
                              <Target size={17} />
                            )}
                          </span>
                          {t(12 + i)}
                        </h3>
                        <div className="prayer-reservation">
                          <span className="reserved-icon">{prayerIcon}</span>
                          <strong>{prayerLabels.title}</strong>
                          <span className="reserved-time">{times && prayerEnd ? `${times[name].slice(0,5)} → ${prayerEnd.time}${prayerEnd.nextDay ? ` (${prayerLabels.nextDay})` : ""}` : "—:— → —:—"}</span>
                          <span className="reserved-duration">{format(data.prayerMinutes)}</span>
                        </div>
                        {times && data.prayerMinutes > totalCapacity && <p className="overbook">{prayerLabels.tooLong}</p>}
                        {times && used > capacity && <p className="overbook">{data.lang === "ar" ? "تجاوز سعة الفترة" : data.lang === "en" ? "Over capacity" : "Période surchargée"}</p>}
                        <div>{group.map((a) => taskRow(a))}</div>
                        <button className="add-activity" onClick={() => add(i)}>
                          <Plus size={15} />
                          {t(7)}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
              <aside className="right-column">
                <div className="panel">
                  <div className="panel-title">
                    <h3>
                      <CalendarDays size={16} />
                      {t(39)}
                    </h3>
                    <span className="muted">
                      {month.toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mini-calendar">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <small key={d}>{weekdays[d]}</small>
                    ))}
                    {cells.map((d) => (
                      <button
                        key={d}
                        className={
                          (d === date ? "selected " : "") +
                          (d.slice(0, 7) !== date.slice(0, 7) ? "muted" : "")
                        }
                        onClick={() => setDate(d)}
                      >
                        {Number(d.slice(-2))}
                        {visible(d).length > 0 && <i />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <h3>
                    <Check size={16} />
                    {t(8)}
                  </h3>
                  <div className="progress-caption">
                    <span>
                      {completed.length} / {tasks.length} {t(9)}
                    </span>
                    <strong>{pct}%</strong>
                  </div>
                  <div className="progress">
                    <i style={{ width: pct + "%" }} />
                  </div>
                  {cats.map((c, i) => {
                    const group = tasks.filter((a) => a.category === c);
                    return (
                      <div className="category-summary" key={c}>
                        <span>
                          <i
                            style={{
                              background: [
                                "#9a7adb",
                                "#efa625",
                                "#60ac95",
                                "#ef806f",
                                "#67a7d0",
                              ][i],
                            }}
                          />
                          {data.lang === "ar"
                            ? ["روحاني", "العمل", "شخصي", "العائلة", "الصحة"][i]
                            : c}
                        </span>
                        <small>
                          {group.filter((a) => done(a)).length} / {group.length}
                        </small>
                      </div>
                    );
                  })}
                </div>
                <div className="panel">
                  <div className="panel-title">
                    <h3>
                      <Repeat size={16} />
                      {t(3)}
                    </h3>
                    <button className="text-link" onClick={() => setView(3)}>
                      {data.lang === "ar" ? "إدارة" : "Gérer"}
                    </button>
                  </div>
                  {data.tasks
                    .filter((a) => a.repeat.length)
                    .slice(0, 4)
                    .map((a) => (
                      <div className="recurring-small" key={a.id}>
                        <span className="repeat-badge">
                          <Repeat size={16} />
                        </span>
                        <div>
                          <strong>{a.title}</strong>
                          <small>
                            {a.repeat.length === 7
                              ? t(26)
                              : a.repeat.map((d) => weekdays[d]).join(" · ")}
                          </small>
                        </div>
                        <button
                          aria-label={a.title}
                          className={"switch " + (a.enabled ? "on" : "")}
                          onClick={() =>
                            setData({
                              ...data,
                              tasks: data.tasks.map((v) =>
                                v.id === a.id
                                  ? { ...v, enabled: !v.enabled }
                                  : v,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                  <button
                    className="add-activity"
                    onClick={() => {
                      add();
                      setMode("daily");
                    }}
                  >
                    <Plus size={15} />
                    {t(7)}
                  </button>
                </div>
                <div className="panel reflection">
                  <Moon size={23} />
                  <p>{t(38)}</p>
                  <small>{t(6)}</small>
                </div>
              </aside>
            </div>
          ) : view === 2 ? (
            <section className="weekly-grid">
              {week.map((d) => (
                <div
                  className={"panel week-day " + (d === today() ? "today" : "")}
                  key={d}
                >
                  <button
                    className="week-title"
                    onClick={() => {
                      setDate(d);
                      setView(1);
                    }}
                  >
                    {new Date(d + "T12:00").toLocaleDateString(locale, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </button>
                  <div className="week-prayers">{prayerIcon}<span>5 × {format(data.prayerMinutes)} · {prayerLabels.title}</span></div>
                  {visible(d).length === 0 && <p className="muted">{t(36)}</p>}
                  {visible(d).map((a) => (
                    <div key={a.id} className={"week-task tone-" + a.period}>
                      <small>
                        {names[a.period]} → {names[(a.period + 1) % 5]}
                      </small>
                      {taskRow(a, d)}
                    </div>
                  ))}
                  <button
                    className="add-activity"
                    onClick={() => {
                      setDate(d);
                      setEdit({
                        id: crypto.randomUUID(),
                        title: "",
                        minutes: 30,
                        period: 0,
                        category: cats[0],
                        date: d,
                        repeat: [],
                        enabled: true,
                      });
                      setMode("none");
                    }}
                  >
                    <Plus size={14} />
                    {t(7)}
                  </button>
                </div>
              ))}
            </section>
          ) : view === 3 ? (
            <section className="panel roomy">
              <div className="panel-title">
                <h3>{t(3)}</h3>
                <button
                  className="primary"
                  onClick={() => {
                    add();
                    setMode("daily");
                  }}
                >
                  <Plus size={16} />
                  {t(7)}
                </button>
              </div>
              {data.tasks
                .filter((a) => a.repeat.length)
                .map((a) => (
                  <div className="recurrence-row" key={a.id}>
                    <div>
                      <strong>{a.title}</strong>
                      <p className="muted">
                        {names[a.period]} → {names[(a.period + 1) % 5]} ·{" "}
                        {format(a.minutes)} ·{" "}
                        {a.repeat.length === 7
                          ? t(26)
                          : a.repeat.map((d) => weekdays[d]).join(" / ")}
                      </p>
                    </div>
                    <button
                      className={"switch " + (a.enabled ? "on" : "")}
                      aria-label={a.title}
                      onClick={() =>
                        setData({
                          ...data,
                          tasks: data.tasks.map((v) =>
                            v.id === a.id ? { ...v, enabled: !v.enabled } : v,
                          ),
                        })
                      }
                    />
                    <button
                      className="icon-btn"
                      aria-label={"Edit " + a.title}
                      onClick={() => open(a)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="icon-btn delete"
                      aria-label={"Delete " + a.title}
                      onClick={() => remove(a)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
            </section>
          ) : view === 4 ? (
            <section>
              <div className="stat-grid">
                {[
                  [t(8), `${completed.length}/${tasks.length}`],
                  [t(9), pct + "%"],
                  [t(10), format(planned)],
                  [t(11), format(accomplished)],
                ].map(([label, value]) => (
                  <div className="panel stat" key={label}>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="panel roomy">
                <h3>{t(2)}</h3>
                <div className="chart">
                  {week.map((d) => {
                    const a = visible(d);
                    const p = a.length
                      ? Math.round(
                          (a.filter((v) => done(v, d)).length / a.length) * 100,
                        )
                      : 0;
                    return (
                      <div key={d}>
                        <strong>{p}%</strong>
                        <div className="bar-track">
                          <i style={{ height: p + "%" }} />
                        </div>
                        <small>
                          {new Date(d + "T12:00").toLocaleDateString(locale, {
                            weekday: "short",
                          })}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : (
            <section className="panel settings-panel">
              <h3>{t(5)}</h3>
              <label>
                {t(28)}
                <Select
                  value={data.lang}
                  onChange={(e) => setData({ ...data, lang: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </Select>
              </label>
              <label>
                {t(29)}
                <Select
                  value={data.city}
                  onChange={(e) => selectCity(e.target.value)}
                >
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </label>
              <div className="location-settings">
                {locateButton}
                <p className="muted">{lt("hint")}</p>
              </div>
              <label>
                {prayerLabels.setting}
                <Select value={data.prayerMinutes} onChange={e => setData(previous => ({...previous, prayerMinutes:Number(e.target.value)}))}>
                  {Array.from({length:24}, (_,i)=>(i+1)*5).map(n => <option key={n} value={n}>{format(n)}</option>)}
                </Select>
              </label>
              <p className="muted">{prayerLabels.note} {format(data.prayerMinutes * 5)} {prayerLabels.reserved}.</p>
              <label>
                {t(30)}
                <Select
                  value={String(data.dark)}
                  onChange={(e) =>
                    setData({ ...data, dark: e.target.value === "true" })
                  }
                >
                  <option value="false">{t(31)}</option>
                  <option value="true">{t(32)}</option>
                </Select>
              </label>
              <p className="muted">
                {data.lang === "ar"
                  ? "تُحفظ الأنشطة والإعدادات على هذا المتصفح. مواقيت الصلاة: AlAdhan، طريقة المغرب (21)."
                  : "Les activités et paramètres sont enregistrés sur ce navigateur. Horaires : AlAdhan, méthode Maroc (21)."}
              </p>
            </section>
          )}
          <footer>
            <span>
              <Clock size={14} /> {t(6)}
            </span>
            <a
              href="https://aladhan.com/prayer-times-api"
              target="_blank"
              rel="noreferrer"
            >
              AlAdhan · Morocco (21)
            </a>
          </footer>
        </main>
      </div>
      {edit && (
        <div className="modal-backdrop" onClick={() => setEdit(null)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const a = {
                ...edit,
                title: edit.title.trim(),
                repeat:
                  mode === "daily"
                    ? [0, 1, 2, 3, 4, 5, 6]
                    : mode === "days"
                      ? edit.repeat
                      : [],
              };
              if (!a.title || (mode === "days" && !a.repeat.length)) return;
              setData({
                ...data,
                tasks: data.tasks.some((v) => v.id === a.id)
                  ? data.tasks.map((v) => (v.id === a.id ? a : v))
                  : [...data.tasks, a],
              });
              setEdit(null);
            }}
          >
            <div className="panel-title">
              <h3>{t(7)}</h3>
              <button
                type="button"
                className="icon-btn"
                aria-label={t(19)}
                onClick={() => setEdit(null)}
              >
                <X size={20} />
              </button>
            </div>
            <label>
              {t(20)}
              <input
                autoFocus
                required
                maxLength={120}
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </label>
            <div className="form-grid">
              <label>
                {t(21)}
                <input
                  type="number"
                  required
                  min={1}
                  max={1440}
                  value={edit.minutes}
                  onChange={(e) =>
                    setEdit({ ...edit, minutes: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t(23)}
                <Select
                  value={edit.category}
                  onChange={(e) =>
                    setEdit({ ...edit, category: e.target.value })
                  }
                >
                  {cats.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </label>
            </div>
            <label>
              {t(22)}
              <Select
                value={edit.period}
                onChange={(e) =>
                  setEdit({ ...edit, period: Number(e.target.value) })
                }
              >
                {names.map((n, i) => (
                  <option key={n} value={i}>
                    {n} → {names[(i + 1) % 5]}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              {t(39)}
              <input
                type="date"
                required
                value={edit.date}
                onChange={(e) => setEdit({ ...edit, date: e.target.value })}
              />
            </label>
            <label>
              {t(24)}
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="none">{t(25)}</option>
                <option value="daily">{t(26)}</option>
                <option value="days">{t(27)}</option>
              </Select>
            </label>
            {mode === "days" && (
              <div className="day-picker">
                {weekdays.map((d, i) => (
                  <label key={d}>
                    <input
                      type="checkbox"
                      checked={edit.repeat.includes(i)}
                      onChange={() =>
                        setEdit({
                          ...edit,
                          repeat: edit.repeat.includes(i)
                            ? edit.repeat.filter((v) => v !== i)
                            : [...edit.repeat, i],
                        })
                      }
                    />
                    {d}
                  </label>
                ))}
                {!edit.repeat.length && <small>{t(27)}</small>}
              </div>
            )}
            <div className="form-actions">
              <button type="button" onClick={() => setEdit(null)}>
                {t(19)}
              </button>
              <button className="primary" type="submit">
                {t(18)}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
