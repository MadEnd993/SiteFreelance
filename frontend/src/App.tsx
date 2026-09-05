import { useState, useRef, useCallback } from "react";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const ROOMS = [
  "1-местный «Эконом» с вентилятором",
  "1-местный «Стандарт» с кондиционером",
  "2-местный «Стандарт» с кондиционером",
];

const ROOM_CATEGORIES = [
  {
    id: "econom",
    badge: "Эконом",
    title: "1-местный «Эконом»",
    subtitle: "с вентилятором",
    price: "от 1 500 ₽",
    period: "за ночь",
    desc: "Уютный одноместный номер с необходимым минимумом для комфортного отдыха. Вентилятор, удобная кровать, общий санузел на этаже.",
    features: [
      "Вентилятор",
      "1 кровать",
      "Общий санузел",
      "Wi-Fi",
      "Завтрак по запросу",
    ],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1588840103995-02893d4eb8fd?w=800&h=600&fit=crop&auto=format",
        alt: "Одноместный номер эконом, белая кровать",
      },
      {
        url: "https://images.unsplash.com/photo-1561391922-3c04a61b77d4?w=800&h=600&fit=crop&auto=format",
        alt: "Кровать у окна с занавесками",
      },
      {
        url: "https://images.unsplash.com/photo-1759523621990-58a409b68fad?w=800&h=600&fit=crop&auto=format",
        alt: "Свет через тонкие занавески",
      },
    ],
  },
  {
    id: "standard1",
    badge: "Стандарт",
    title: "1-местный «Стандарт»",
    subtitle: "с кондиционером",
    price: "от 2 200 ₽",
    period: "за ночь",
    desc: "Просторный одноместный номер с кондиционером и собственным санузлом. Идеально для деловых поездок и одиночного отдыха.",
    features: [
      "Кондиционер",
      "1 кровать",
      "Собственный санузел",
      "Wi-Fi",
      "Завтрак по запросу",
    ],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&auto=format",
        alt: "Стандартный номер, белая постель",
      },
      {
        url: "https://images.unsplash.com/photo-1630660664869-c9d3cc676880?w=800&h=600&fit=crop&auto=format",
        alt: "Мягкая белая подушка на кровати",
      },
      {
        url: "https://images.unsplash.com/photo-1610395762237-c5bf3d6b7836?w=800&h=600&fit=crop&auto=format",
        alt: "Светлый номер с деревянной тумбой",
      },
    ],
  },
  {
    id: "standard2",
    badge: "Стандарт",
    title: "2-местный «Стандарт»",
    subtitle: "с кондиционером",
    price: "от 3 200 ₽",
    period: "за ночь",
    desc: "Двухместный номер с двумя отдельными кроватями и кондиционером. Подходит для пар или друзей, путешествующих вместе.",
    features: [
      "Кондиционер",
      "2 кровати",
      "Собственный санузел",
      "Wi-Fi",
      "Завтрак по запросу",
    ],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1680210851458-b7dc5685e06e?w=800&h=600&fit=crop&auto=format",
        alt: "Две кровати в двухместном номере",
      },
      {
        url: "https://images.unsplash.com/photo-1741506131058-533fcf894483?w=800&h=600&fit=crop&auto=format",
        alt: "Просторный двухместный номер",
      },
      {
        url: "https://images.unsplash.com/photo-1763419161907-1e00b2f883c5?w=800&h=600&fit=crop&auto=format",
        alt: "Две кровати с тумбочкой и часами",
      },
    ],
  },
];

const MESSENGERS = [
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "max", label: "Max", icon: "📲" },
  { id: "phone", label: "Звонок", icon: "📞" },
];

const AMENITIES = [
  { icon: "🏊", title: "Бассейн", desc: "Открытый, с 8:00 до 21:00" },
  { icon: "🌳", title: "Зелёный сад", desc: "Тенистые беседки и зоны отдыха" },
  { icon: "🍳", title: "Завтрак", desc: "Домашние завтраки по запросу" },
  { icon: "🚗", title: "Парковка", desc: "Бесплатная охраняемая стоянка" },
  { icon: "🛝", title: "Детская площадка", desc: "Безопасная зона для детей" },
  { icon: "🌿", title: "Тихий двор", desc: "Уединение и покой" },
  { icon: "❄️", title: "Кондиционер", desc: "Во всех номерах" },
  { icon: "📶", title: "Wi-Fi", desc: "Бесплатный высокоскоростной" },
];

function Lightbox({
  photos,
  startIdx,
  title,
  onClose,
}: {
  photos: { url: string; alt: string }[];
  startIdx: number;
  title: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + photos.length - 1) % photos.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % photos.length);
  };

  // keyboard navigation
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setIdx((i) => (i + photos.length - 1) % photos.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % photos.length);
      if (e.key === "Escape") onClose();
    },
    [photos.length, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "rgba(10, 24, 32, 0.92)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
      onKeyDown={handleKey}
      tabIndex={0}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-white/10"
        style={{
          color: "rgba(245,240,232,0.8)",
          fontSize: "1.4rem",
          background: "rgba(255,255,255,0.06)",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Закрыть"
      >
        ✕
      </button>

      {/* Title & counter */}
      <div className="absolute top-5 left-6">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            color: "#F5F0E8",
            fontWeight: 600,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(245,240,232,0.45)",
            marginTop: "2px",
          }}
        >
          {idx + 1} / {photos.length}
        </p>
      </div>

      {/* Image */}
      <div
        className="relative flex items-center justify-center"
        style={{ maxWidth: "90vw", maxHeight: "82vh", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={idx}
          src={photos[idx].url.replace("w=800&h=600", "w=1400&h=900")}
          alt={photos[idx].alt}
          style={{
            maxWidth: "100%",
            maxHeight: "82vh",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            display: "block",
            animation: "lbFadeIn 0.18s ease",
          }}
        />

        {/* Prev / Next */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 flex items-center justify-center w-11 h-11 rounded-full transition-all hover:bg-white/15"
              style={{
                transform: "translate(-50%, -50%)",
                background: "rgba(255,255,255,0.08)",
                border: "none",
                cursor: "pointer",
                color: "#F5F0E8",
                fontSize: "1.1rem",
              }}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 flex items-center justify-center w-11 h-11 rounded-full transition-all hover:bg-white/15"
              style={{
                transform: "translate(50%, -50%)",
                background: "rgba(255,255,255,0.08)",
                border: "none",
                cursor: "pointer",
                color: "#F5F0E8",
                fontSize: "1.1rem",
              }}
              aria-label="Следующее фото"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot strip */}
      <div
        className="absolute bottom-6 left-1/2 flex gap-2"
        style={{ transform: "translateX(-50%)" }}
      >
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setIdx(i);
            }}
            style={{
              width: idx === i ? "24px" : "7px",
              height: "7px",
              borderRadius: "4px",
              background:
                idx === i ? "var(--color-gold-light)" : "rgba(255,255,255,0.3)",
              transition: "all 0.2s ease",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Фото ${i + 1}`}
          />
        ))}
      </div>

      <style>{`@keyframes lbFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

function RoomCard({ room }: { room: (typeof ROOM_CATEGORIES)[0] }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const idx = Math.min(2, Math.floor((x / rect.width) * 3));
      setPhotoIdx(idx);
    },
    [],
  );

  return (
    <>
      {lightbox !== null && (
        <Lightbox
          photos={room.photos}
          startIdx={lightbox}
          title={`${room.title} ${room.subtitle}`}
          onClose={() => setLightbox(null)}
        />
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(28,61,79,0.1)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Photo slider area */}
        <div
          ref={cardRef}
          className="relative"
          style={{
            height: "260px",
            background: "var(--color-teal)",
            overflow: "hidden",
            cursor: "zoom-in",
          }}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            setPhotoIdx(0);
          }}
          onClick={() => setLightbox(photoIdx)}
        >
          {room.photos.map((photo, i) => (
            <img
              key={i}
              src={photo.url}
              alt={photo.alt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: photoIdx === i ? 1 : 0,
                transition: "opacity 0.22s ease",
              }}
            />
          ))}

          {/* Zoom icon overlay on hover */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
          >
            <div
              style={{
                background: "rgba(10,24,32,0.45)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="5"
                  stroke="#F5F0E8"
                  strokeWidth="1.4"
                />
                <path
                  d="M11.5 11.5L16 16"
                  stroke="#F5F0E8"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 5v5M5 7.5h5"
                  stroke="#F5F0E8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Dot indicators */}
          <div
            className="absolute bottom-3 left-1/2 flex gap-1.5"
            style={{
              transform: "translateX(-50%)",
              opacity: hovered ? 1 : 0.6,
              transition: "opacity 0.2s",
              pointerEvents: "none",
            }}
          >
            {room.photos.map((_, i) => (
              <div
                key={i}
                style={{
                  width: photoIdx === i ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: photoIdx === i ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "all 0.22s ease",
                }}
              />
            ))}
          </div>

          {/* Badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 text-xs tracking-widest uppercase"
            style={{
              background: "rgba(28,61,79,0.75)",
              color: "var(--color-gold-light)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.12em",
              fontSize: "0.62rem",
              borderRadius: "3px",
              backdropFilter: "blur(4px)",
            }}
          >
            {room.badge}
          </div>

          {/* Hover zone guides */}
          <div
            className="absolute inset-0 flex"
            style={{
              pointerEvents: "none",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRight:
                    i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Hint below photo */}
        <div
          className="flex items-center justify-center gap-2 py-1.5"
          style={{
            background: "rgba(28,61,79,0.04)",
            borderBottom: "1px solid rgba(28,61,79,0.07)",
          }}
        >
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            style={{ opacity: 0.35 }}
          >
            <path
              d="M1 5h12M1 5l3-3M1 5l3 3M13 5l-3-3M13 5l-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: "0.67rem",
              color: "rgba(28,61,79,0.4)",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-body)",
            }}
          >
            листайте курсором · кликните для увеличения
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 p-6 flex-1">
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                color: "var(--color-teal)",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {room.title}
            </h3>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--color-gold)",
                marginTop: "2px",
                fontStyle: "italic",
                fontFamily: "var(--font-body)",
              }}
            >
              {room.subtitle}
            </p>
          </div>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--color-sand)",
              lineHeight: 1.65,
              fontFamily: "var(--font-body)",
            }}
          >
            {room.desc}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {room.features.map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 text-xs"
                style={{
                  background: "rgba(28,61,79,0.06)",
                  color: "var(--color-teal-mid)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                }}
              >
                {f}
              </span>
            ))}
          </div>
          <div
            className="mt-auto pt-4 flex items-end justify-between"
            style={{ borderTop: "1px solid rgba(28,61,79,0.08)" }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  color: "var(--color-teal)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {room.price}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(28,61,79,0.45)",
                  marginTop: "3px",
                }}
              >
                {room.period}
              </p>
            </div>
            <a
              href="#booking"
              className="px-5 py-2.5 text-xs tracking-widest uppercase transition-all hover:opacity-90"
              style={{
                background: "var(--color-teal)",
                color: "#F5F0E8",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                borderRadius: "4px",
                fontSize: "0.68rem",
              }}
            >
              Забронировать
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function DateSelect({
  label,
  prefix,
  values,
  onChange,
  minDate,
}: {
  label: string;
  prefix: string;
  values: { day: string; month: string; year: string };
  onChange: (field: string, val: string) => void;
  minDate?: Date;
}) {
  const selectedYear = Number(values.year) || 0;
  const selectedMonth = Number(values.month) || 0;

  const availableMonths =
    minDate && selectedYear === minDate.getFullYear()
      ? MONTHS.map((_, i) => i + 1).filter((m) => m >= minDate.getMonth() + 1)
      : MONTHS.map((_, i) => i + 1);

  const availableDays =
    minDate &&
    selectedYear === minDate.getFullYear() &&
    selectedMonth === minDate.getMonth() + 1
      ? DAYS.filter((d) => d >= minDate.getDate())
      : DAYS;

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium tracking-wide uppercase"
        style={{
          color: "var(--color-sand)",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.08em",
          fontSize: "0.72rem",
        }}
      >
        {label} <span style={{ color: "var(--color-gold)" }}>*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={values.day}
          onChange={(e) => onChange(`${prefix}_day`, e.target.value)}
          className="px-3 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
          style={{
            borderColor: "rgba(28,61,79,0.18)",
            background: "rgba(255,255,255,0.7)",
            color: values.day ? "var(--color-teal)" : "rgba(28,61,79,0.4)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="">День</option>
          {availableDays.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={values.month}
          onChange={(e) => onChange(`${prefix}_month`, e.target.value)}
          className="px-3 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
          style={{
            borderColor: "rgba(28,61,79,0.18)",
            background: "rgba(255,255,255,0.7)",
            color: values.month ? "var(--color-teal)" : "rgba(28,61,79,0.4)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="">Месяц</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {MONTHS[m - 1]}
            </option>
          ))}
        </select>
        <select
          value={values.year}
          onChange={(e) => onChange(`${prefix}_year`, e.target.value)}
          className="px-3 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
          style={{
            borderColor: "rgba(28,61,79,0.18)",
            background: "rgba(255,255,255,0.7)",
            color: values.year ? "var(--color-teal)" : "rgba(28,61,79,0.4)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="">Год</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    checkin_day: "",
    checkin_month: "",
    checkin_year: "",
    checkout_day: "",
    checkout_month: "",
    checkout_year: "",
    guests: "2",
    room: "",
    wishes: "",
    messenger: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setField = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const checkinDate = new Date(
      Number(form.checkin_year),
      Number(form.checkin_month) - 1,
      Number(form.checkin_day),
    );
    const tomorrow = getTomorrow();

    if (checkinDate < tomorrow) {
      alert("Дата заезда не может быть раньше завтрашнего дня");
      return;
    }

    setIsSubmitting(true);

    const checkin = `${form.checkin_year}-${String(form.checkin_month).padStart(2, "0")}-${String(form.checkin_day).padStart(2, "0")}`;
    const checkout = `${form.checkout_year}-${String(form.checkout_month).padStart(2, "0")}-${String(form.checkout_day).padStart(2, "0")}`;

    try {
      const res = await fetch("http://localhost:8080/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          checkin,
          checkout,
          guests: form.guests,
          roomType: form.room,
          message: form.wishes,
          messenger: form.messenger,
        }),
      });

      if (!res.ok) throw new Error("Ошибка отправки");

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--color-pearl)", minHeight: "100vh" }}>
      {/* ── Navigation ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{
          background: "rgba(28, 61, 79, 0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "1.5rem" }}>🪨</span>
          <span
            className="text-xl tracking-wider"
            style={{
              fontFamily: "var(--font-display)",
              color: "#F5F0E8",
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            Жемчуг
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            ["#about", "О нас"],
            ["#amenities", "Удобства"],
            ["#rooms", "Номера"],
            ["#booking", "Бронирование"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm tracking-widest uppercase transition-colors hover:opacity-100"
              style={{
                color: "rgba(245,240,232,0.7)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                fontSize: "0.7rem",
              }}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="#booking"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-xs tracking-widest uppercase transition-all hover:opacity-90"
          style={{
            background: "var(--color-gold)",
            color: "#fff",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
            borderRadius: "4px",
          }}
        >
          Забронировать
        </a>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative flex items-end"
        style={{ height: "100vh", minHeight: "600px" }}
      >
        <div
          className="absolute inset-0 bg-teal-900"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1762388871200-7baab4326ef8?w=1600&h=1000&fit=crop&auto=format)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(14,35,45,0.92) 0%, rgba(14,35,45,0.4) 50%, rgba(14,35,45,0.15) 100%)",
          }}
        />

        <div className="relative z-10 w-full px-8 md:px-16 pb-20 md:pb-24">
          <div className="max-w-4xl">
            <p
              className="mb-4 tracking-widest uppercase"
              style={{
                color: "var(--color-gold-light)",
                fontFamily: "var(--font-display)",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
              }}
            >
              Гостевой дом · Краснодарский край
            </p>
            <h1
              className="mb-6 leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 8vw, 7rem)",
                fontWeight: 700,
                color: "#F5F0E8",
                lineHeight: 1.05,
              }}
            >
              Жемчуг
            </h1>
            <p
              className="mb-10 max-w-lg leading-relaxed"
              style={{
                color: "rgba(245,240,232,0.75)",
                fontSize: "1.05rem",
                fontFamily: "var(--font-body)",
              }}
            >
              Тихое место среди зелени — с бассейном, уютными номерами и
              домашней атмосферой у самого моря.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#booking"
                className="inline-flex items-center gap-2 px-8 py-4 font-medium text-sm tracking-widest uppercase transition-all hover:opacity-90"
                style={{
                  background: "var(--color-gold)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.12em",
                  borderRadius: "4px",
                }}
              >
                Забронировать номер
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm tracking-widest uppercase transition-all"
                style={{
                  border: "1px solid rgba(245,240,232,0.4)",
                  color: "rgba(245,240,232,0.85)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.12em",
                  borderRadius: "4px",
                }}
              >
                Узнать больше
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="absolute bottom-0 right-0 hidden md:flex"
          style={{
            background: "rgba(28,61,79,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          {[
            ["8", "номеров"],
            ["50 м", "до моря"],
            ["⭐ 4.9", "рейтинг"],
          ].map(([val, lbl]) => (
            <div
              key={lbl}
              className="flex flex-col items-center px-10 py-5 border-l"
              style={{ borderColor: "rgba(245,240,232,0.1)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "#F5F0E8",
                  fontWeight: 600,
                }}
              >
                {val}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(245,240,232,0.55)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-8 md:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="mb-4 tracking-widest uppercase"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              О нас
            </p>
            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "var(--color-teal)",
                fontWeight: 600,
              }}
            >
              Место, где <em>отдыхают</em>
              <br />
              по-настоящему
            </h2>
            <p
              className="mb-5 leading-relaxed"
              style={{ color: "var(--color-sand)", fontSize: "1.02rem" }}
            >
              Гостевой дом «Жемчуг» — это небольшой уютный отель в тихом уголке
              Черноморского побережья. Мы принимаем гостей уже более десяти лет
              и знаем, что такое настоящий отдых.
            </p>
            <p
              className="leading-relaxed"
              style={{ color: "var(--color-sand)", fontSize: "1.02rem" }}
            >
              Зелёный двор с бассейном, тенистые беседки, домашние завтраки и
              внимательный персонал — всё для того, чтобы вы ощутили себя дома,
              но лучше.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1779269751207-3fea011ce0d1?w=700&h=850&fit=crop&auto=format"
              alt="Бассейн гостевого дома Жемчуг в окружении зелени"
              className="w-full object-cover"
              style={{ height: "480px", borderRadius: "6px" }}
            />
            <div
              className="absolute -bottom-6 -left-6 px-6 py-5 hidden md:block"
              style={{
                background: "var(--color-teal)",
                borderRadius: "4px",
                minWidth: "180px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--color-gold-light)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                10+
              </p>
              <p
                style={{
                  color: "rgba(245,240,232,0.7)",
                  fontSize: "0.78rem",
                  marginTop: "4px",
                  letterSpacing: "0.06em",
                }}
              >
                лет принимаем гостей
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section
        id="amenities"
        className="py-24 px-8 md:px-16"
        style={{ background: "var(--color-teal)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="mb-3 tracking-widest uppercase"
              style={{
                color: "var(--color-gold-light)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              Удобства
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "#F5F0E8",
                fontWeight: 600,
              }}
            >
              Всё для комфортного отдыха
            </h2>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: "rgba(245,240,232,0.08)" }}
          >
            {AMENITIES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center px-6 py-8 transition-all hover:bg-white/5"
                style={{ background: "var(--color-teal)" }}
              >
                <span className="text-3xl mb-4">{icon}</span>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    color: "#F5F0E8",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(245,240,232,0.55)",
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section
        id="gallery"
        className="py-24 px-8 md:px-16"
        style={{ background: "var(--color-pearl-dark)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p
              className="mb-3 tracking-widest uppercase"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              Галерея
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--color-teal)",
                fontWeight: 600,
              }}
            >
              Атмосфера «Жемчуга»
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 row-span-2 md:col-span-1 md:row-span-1">
              <img
                src="https://images.unsplash.com/photo-1782112963398-9e5af652029f?w=700&h=500&fit=crop&auto=format"
                alt="Бассейн с зонтиком и садом"
                className="w-full object-cover"
                style={{ height: "320px", borderRadius: "6px" }}
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1780571616416-e44643f9f427?w=500&h=320&fit=crop&auto=format"
                alt="Терраса с плетёными креслами у бассейна"
                className="w-full object-cover"
                style={{ height: "155px", borderRadius: "6px" }}
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1760067537723-bb12d2674e15?w=500&h=320&fit=crop&auto=format"
                alt="Уютный номер с двумя кроватями"
                className="w-full object-cover"
                style={{ height: "155px", borderRadius: "6px" }}
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1780989863103-3321f3d22a6c?w=500&h=320&fit=crop&auto=format"
                alt="Шезлонги у бассейна с пальмами"
                className="w-full object-cover"
                style={{ height: "155px", borderRadius: "6px" }}
              />
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1775744244614-beb197cfac53?w=500&h=320&fit=crop&auto=format"
                alt="Светлый номер с кованой кроватью"
                className="w-full object-cover"
                style={{ height: "155px", borderRadius: "6px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Rooms ── */}
      <section
        id="rooms"
        className="py-24 px-8 md:px-16"
        style={{ background: "var(--color-pearl)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p
              className="mb-3 tracking-widest uppercase"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              Номера
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--color-teal)",
                fontWeight: 600,
              }}
            >
              Выберите свой номер
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ROOM_CATEGORIES.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking Form ── */}
      <section
        id="booking"
        className="py-24 px-8 md:px-16"
        style={{ background: "var(--color-pearl)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="mb-3 tracking-widest uppercase"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
              }}
            >
              Бронирование
            </p>
            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--color-teal)",
                fontWeight: 600,
              }}
            >
              Оставьте заявку
            </h2>
            <p style={{ color: "var(--color-sand)", fontSize: "1rem" }}>
              Мы свяжемся с вами в течение часа и подтвердим бронирование
            </p>
          </div>

          {submitted ? (
            <div
              className="text-center py-20 px-8"
              style={{
                background: "rgba(255,255,255,0.6)",
                borderRadius: "12px",
                border: "1px solid rgba(28,61,79,0.1)",
              }}
            >
              <div className="text-5xl mb-6">🌿</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--color-teal)",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                Заявка принята!
              </h3>
              <p
                style={{
                  color: "var(--color-sand)",
                  fontSize: "1.05rem",
                  maxWidth: "360px",
                  margin: "0 auto",
                }}
              >
                Спасибо, {form.name || "дорогой гость"}! Мы свяжемся с вами в
                ближайшее время.
              </p>
              <button
                className="mt-8 px-8 py-3 text-sm tracking-widest uppercase transition-all hover:opacity-90"
                onClick={() => setSubmitted(false)}
                style={{
                  background: "var(--color-teal)",
                  color: "#F5F0E8",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.1em",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Новая заявка
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 p-8 md:p-12"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(28,61,79,0.1)",
                borderRadius: "12px",
              }}
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Ваше имя <span style={{ color: "var(--color-gold)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(28,61,79,0.18)",
                    background: "rgba(255,255,255,0.7)",
                    color: "var(--color-teal)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Телефон <span style={{ color: "var(--color-gold)" }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  required
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(28,61,79,0.18)",
                    background: "rgba(255,255,255,0.7)",
                    color: "var(--color-teal)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Check-in date */}
              <DateSelect
                label="Дата заезда"
                prefix="checkin"
                values={{
                  day: form.checkin_day,
                  month: form.checkin_month,
                  year: form.checkin_year,
                }}
                onChange={setField}
                minDate={getTomorrow()}
              />

              {/* Check-out date */}
              <DateSelect
                label="Дата выезда"
                prefix="checkout"
                values={{
                  day: form.checkout_day,
                  month: form.checkout_month,
                  year: form.checkout_year,
                }}
                onChange={setField}
              />

              {/* Time note */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(28,61,79,0.05)",
                  border: "1px solid rgba(28,61,79,0.08)",
                  color: "var(--color-teal-mid)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span>🕐</span>
                <span>
                  Время заезда: <strong>с 14:00</strong>&nbsp; | &nbsp;Выезд:{" "}
                  <strong>до 11:00</strong>
                </span>
              </div>

              {/* Guests */}
              <div className="flex flex-col gap-2">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Количество гостей{" "}
                  <span style={{ color: "var(--color-gold)" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.guests}
                  onChange={(e) => setField("guests", e.target.value)}
                  className="w-32 px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(28,61,79,0.18)",
                    background: "rgba(255,255,255,0.7)",
                    color: "var(--color-teal)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Room category */}
              <div className="flex flex-col gap-2">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Категория номера
                </label>
                <select
                  value={form.room}
                  onChange={(e) => setField("room", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(28,61,79,0.18)",
                    background: "rgba(255,255,255,0.7)",
                    color: form.room
                      ? "var(--color-teal)"
                      : "rgba(28,61,79,0.4)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">— Выберите номер —</option>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wishes */}
              <div className="flex flex-col gap-2">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Пожелания или дополнительная информация
                </label>
                <textarea
                  rows={4}
                  placeholder="Ваши пожелания, вопросы..."
                  value={form.wishes}
                  onChange={(e) => setField("wishes", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: "rgba(28,61,79,0.18)",
                    background: "rgba(255,255,255,0.7)",
                    color: "var(--color-teal)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
                <p
                  className="text-xs"
                  style={{ color: "rgba(28,61,79,0.45)", fontStyle: "italic" }}
                >
                  💡 Можете указать предпочтения по виду из окна, близости к
                  бассейну или детской площадке
                </p>
              </div>

              {/* Messenger */}
              <div className="flex flex-col gap-3">
                <label
                  className="block"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-sand)",
                  }}
                >
                  Выберите мессенджер для связи{" "}
                  <span style={{ color: "var(--color-gold)" }}>*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MESSENGERS.map(({ id, label, icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setField("messenger", id)}
                      className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg border transition-all"
                      style={{
                        borderColor:
                          form.messenger === id
                            ? "var(--color-gold)"
                            : "rgba(28,61,79,0.18)",
                        background:
                          form.messenger === id
                            ? "rgba(184,148,74,0.1)"
                            : "rgba(255,255,255,0.7)",
                        color:
                          form.messenger === id
                            ? "var(--color-gold)"
                            : "var(--color-teal)",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        fontWeight: form.messenger === id ? 600 : 400,
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-sm tracking-widest uppercase mt-2 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: "var(--color-teal)",
                  color: "#F5F0E8",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.14em",
                  borderRadius: "6px",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "0.82rem",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? "Отправляем…" : "📩\u00A0 Отправить заявку"}
              </button>

              <p
                className="text-center text-xs"
                style={{ color: "rgba(28,61,79,0.4)", fontStyle: "italic" }}
              >
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{ background: "var(--color-teal)" }}
        className="px-8 md:px-16 py-16"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "1.3rem" }}>🪨</span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  color: "#F5F0E8",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                }}
              >
                Жемчуг
              </span>
            </div>
            <p
              style={{
                color: "rgba(245,240,232,0.55)",
                fontSize: "0.88rem",
                lineHeight: 1.7,
              }}
            >
              Гостевой дом на черноморском побережье.
              <br />
              Уют, природа и отдых для всей семьи.
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold-light)",
                marginBottom: "14px",
              }}
            >
              Контакты
            </p>
            <div
              className="flex flex-col gap-2"
              style={{ color: "rgba(245,240,232,0.7)", fontSize: "0.9rem" }}
            >
              <a
                href="tel:+79991234567"
                className="hover:text-white transition-colors"
              >
                +7 (999) 123-45-67
              </a>
              <a
                href="mailto:zhemchug@mail.ru"
                className="hover:text-white transition-colors"
              >
                zhemchug@mail.ru
              </a>
              <p
                style={{
                  color: "rgba(245,240,232,0.45)",
                  fontSize: "0.83rem",
                  marginTop: "4px",
                }}
              >
                Краснодарский край, Геленджик
              </p>
            </div>
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold-light)",
                marginBottom: "14px",
              }}
            >
              Режим работы
            </p>
            <div
              className="flex flex-col gap-1"
              style={{ color: "rgba(245,240,232,0.7)", fontSize: "0.88rem" }}
            >
              <p>
                Заезд: <strong style={{ color: "#F5F0E8" }}>с 14:00</strong>
              </p>
              <p>
                Выезд: <strong style={{ color: "#F5F0E8" }}>до 11:00</strong>
              </p>
              <p
                style={{
                  marginTop: "8px",
                  color: "rgba(245,240,232,0.45)",
                  fontSize: "0.82rem",
                }}
              >
                Администрация работает круглосуточно
              </p>
            </div>
          </div>
        </div>
        <div
          className="max-w-6xl mx-auto mt-12 pt-8"
          style={{ borderTop: "1px solid rgba(245,240,232,0.1)" }}
        >
          <p
            style={{
              color: "rgba(245,240,232,0.3)",
              fontSize: "0.78rem",
              textAlign: "center",
            }}
          >
            © 2025 Гостевой дом «Жемчуг». Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
