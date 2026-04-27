"use client";

import { useState, useEffect } from "react";
import { BIBLE_BOOKS, type BibleBookMeta } from "@/lib/bible-books";
import { fetchBibleBook } from "@/services/bible";
import { useFontSize } from "@/hooks/useFontSize";
import { localCache } from "@/lib/local-cache";

const POS_KEY = "biblia-pos";

export default function BibliaPage() {
  const [abbrev, setAbbrev] = useState("gn");
  const [chapter, setChapter] = useState(0);
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"book" | "chapter">("book");
  const [testament, setTestament] = useState<"AT" | "NT">("AT");
  const [pendingAbbrev, setPendingAbbrev] = useState("gn");
  const { fontSize, cycleFontSize } = useFontSize();

  const bookMeta = BIBLE_BOOKS.find((b) => b.abbrev === abbrev)!;
  const pendingMeta = BIBLE_BOOKS.find((b) => b.abbrev === pendingAbbrev)!;

  // Restore saved position on mount
  useEffect(() => {
    const saved = localCache.get<{ abbrev: string; chapter: number }>(POS_KEY);
    if (saved?.data) {
      setAbbrev(saved.data.abbrev);
      setPendingAbbrev(saved.data.abbrev);
      setChapter(saved.data.chapter);
    }
  }, []);

  // Fetch book when abbrev changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBibleBook(abbrev)
      .then((chapters) => {
        if (!cancelled) {
          setVerses(chapters[chapter] ?? []);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abbrev]);

  // Update verses when chapter changes (data already loaded)
  useEffect(() => {
    if (loading) return;
    fetchBibleBook(abbrev).then((chapters) => {
      setVerses(chapters[chapter] ?? []);
    });
    localCache.set(POS_KEY, { abbrev, chapter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  const openModal = () => {
    const meta = BIBLE_BOOKS.find((b) => b.abbrev === abbrev);
    setTestament(meta?.testament ?? "AT");
    setPendingAbbrev(abbrev);
    setStep("book");
    setShowModal(true);
  };

  const handleBookSelect = (a: string) => {
    const meta = BIBLE_BOOKS.find((b) => b.abbrev === a)!;
    setPendingAbbrev(a);
    if (meta.chapterCount === 1) {
      setAbbrev(a);
      setChapter(0);
      localCache.set(POS_KEY, { abbrev: a, chapter: 0 });
      setShowModal(false);
    } else {
      setStep("chapter");
    }
  };

  const handleChapterSelect = (ch: number) => {
    const changing = pendingAbbrev !== abbrev;
    setChapter(ch);
    localCache.set(POS_KEY, { abbrev: pendingAbbrev, chapter: ch });
    if (changing) setAbbrev(pendingAbbrev);
    setShowModal(false);
  };

  const fontClass =
    fontSize === "sm"
      ? "text-sm leading-relaxed"
      : fontSize === "base"
      ? "text-base leading-relaxed"
      : "text-lg leading-relaxed";

  const fontLabel =
    fontSize === "sm" ? "Aa" : fontSize === "base" ? "Aa+" : "Aa++";

  const maxChapter = bookMeta?.chapterCount ?? 1;

  return (
    <>
      {/* Sub-header sticky abaixo do header principal */}
      <div className="sticky top-14 z-30 -mx-4 flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-2.5">
        <button
          onClick={openModal}
          className="flex min-w-0 flex-1 items-center gap-1 text-left"
        >
          <span className="truncate font-semibold text-gray-800">
            {bookMeta?.name ?? "—"} · Cap. {chapter + 1}
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={cycleFontSize}
          title="Tamanho da fonte"
          className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50"
        >
          {fontLabel}
        </button>

        <button
          onClick={() => setChapter((c) => Math.max(0, c - 1))}
          disabled={chapter === 0}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          ‹
        </button>
        <button
          onClick={() => setChapter((c) => Math.min(maxChapter - 1, c + 1))}
          disabled={chapter >= maxChapter - 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Versículos */}
      <div className="mt-4 pb-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm">Carregando...</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error} — Verifique a conexão e tente novamente.
          </div>
        )}

        {!loading && !error && (
          <div className={`space-y-3 ${fontClass}`}>
            {verses.map((verse, i) => (
              <p key={i} className="text-gray-800">
                <span className="mr-1.5 font-bold text-blue-500">{i + 1}</span>
                {verse}
              </p>
            ))}
            {verses.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                Nenhum versículo encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal seletor (book sheet) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-h-[78vh] overflow-hidden rounded-t-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "book" ? (
              <BookSelector
                testament={testament}
                onTestamentChange={setTestament}
                currentAbbrev={abbrev}
                onSelect={handleBookSelect}
              />
            ) : (
              <ChapterSelector
                bookMeta={pendingMeta}
                currentChapter={pendingAbbrev === abbrev ? chapter : -1}
                onSelect={handleChapterSelect}
                onBack={() => setStep("book")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── BookSelector ─────────────────────────────────────────────────────────────

function BookSelector({
  testament,
  onTestamentChange,
  currentAbbrev,
  onSelect,
}: {
  testament: "AT" | "NT";
  onTestamentChange: (t: "AT" | "NT") => void;
  currentAbbrev: string;
  onSelect: (abbrev: string) => void;
}) {
  const books = BIBLE_BOOKS.filter((b) => b.testament === testament);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-gray-100">
        {(["AT", "NT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTestamentChange(t)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              testament === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "AT" ? "Antigo Testamento" : "Novo Testamento"}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-1.5">
          {books.map((book) => (
            <button
              key={book.abbrev}
              onClick={() => onSelect(book.abbrev)}
              className={`rounded-lg px-2 py-2.5 text-left text-sm transition-colors ${
                book.abbrev === currentAbbrev
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {book.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ChapterSelector ──────────────────────────────────────────────────────────

function ChapterSelector({
  bookMeta,
  currentChapter,
  onSelect,
  onBack,
}: {
  bookMeta: BibleBookMeta;
  currentChapter: number;
  onSelect: (chapter: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-gray-100 px-4 py-3">
        <button
          onClick={onBack}
          className="mr-3 text-sm font-medium text-blue-600"
        >
          ← Livros
        </button>
        <span className="font-semibold text-gray-800">{bookMeta.name}</span>
      </div>
      <div className="overflow-y-auto p-3">
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: bookMeta.chapterCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
                i === currentChapter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
