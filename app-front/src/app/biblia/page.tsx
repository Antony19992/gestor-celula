"use client";

import { useState, useEffect } from "react";
import { BIBLE_BOOKS, type BibleBookMeta } from "@/lib/bible-books";
import { fetchBibleBook } from "@/services/bible";
import { useFontSize } from "@/hooks/useFontSize";
import { localCache } from "@/lib/local-cache";

const POS_KEY = "biblia-pos";
const BM_KEY  = "gc:biblia-bm";
const HL_KEY  = "gc:biblia-hl";

interface Bookmark {
  abbrev: string;
  chapter: number;
  bookName: string;
}

// ─── Helpers de storage ───────────────────────────────────────────────────────

function loadBookmarks(): Bookmark[] {
  try { return JSON.parse(localStorage.getItem(BM_KEY) ?? "[]"); } catch { return []; }
}

function saveBookmarks(bm: Bookmark[]) {
  try { localStorage.setItem(BM_KEY, JSON.stringify(bm)); } catch {}
}

function loadHighlights(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(HL_KEY) ?? "[]")); } catch { return new Set(); }
}

function saveHighlights(hl: Set<string>) {
  try { localStorage.setItem(HL_KEY, JSON.stringify([...hl])); } catch {}
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function BibliaPage() {
  const [abbrev, setAbbrev]           = useState("gn");
  const [chapter, setChapter]         = useState(0);
  const [verses, setVerses]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [step, setStep]               = useState<"book" | "chapter">("book");
  const [testament, setTestament]     = useState<"AT" | "NT">("AT");
  const [pendingAbbrev, setPendingAbbrev] = useState("gn");

  const [bookmarks, setBookmarks]     = useState<Bookmark[]>([]);
  const [highlights, setHighlights]   = useState<Set<string>>(new Set());

  const { fontSize, cycleFontSize } = useFontSize();

  const bookMeta   = BIBLE_BOOKS.find((b) => b.abbrev === abbrev)!;
  const pendingMeta = BIBLE_BOOKS.find((b) => b.abbrev === pendingAbbrev)!;
  const maxChapter = bookMeta?.chapterCount ?? 1;
  const isBookmarked = bookmarks.some((b) => b.abbrev === abbrev && b.chapter === chapter);

  // ── Restaurar posição e dados persistidos ──────────────────────────────────
  useEffect(() => {
    setBookmarks(loadBookmarks());
    setHighlights(loadHighlights());

    const saved = localCache.get<{ abbrev: string; chapter: number }>(POS_KEY);
    if (saved?.data) {
      setAbbrev(saved.data.abbrev);
      setPendingAbbrev(saved.data.abbrev);
      setChapter(saved.data.chapter);
    }
  }, []);

  // ── Carregar livro ao mudar abbrev ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBibleBook(abbrev)
      .then((chapters) => {
        if (!cancelled) { setVerses(chapters[chapter] ?? []); setLoading(false); }
      })
      .catch((e: Error) => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abbrev]);

  // ── Atualizar versículos ao mudar capítulo ─────────────────────────────────
  useEffect(() => {
    if (loading) return;
    fetchBibleBook(abbrev).then((chapters) => setVerses(chapters[chapter] ?? []));
    localCache.set(POS_KEY, { abbrev, chapter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  // ── Marcador de página ─────────────────────────────────────────────────────
  const toggleBookmark = () => {
    const next = isBookmarked
      ? bookmarks.filter((b) => !(b.abbrev === abbrev && b.chapter === chapter))
      : [...bookmarks, { abbrev, chapter, bookName: bookMeta?.name ?? "" }];
    setBookmarks(next);
    saveBookmarks(next);
  };

  const removeBookmark = (bm: Bookmark) => {
    const next = bookmarks.filter((b) => !(b.abbrev === bm.abbrev && b.chapter === bm.chapter));
    setBookmarks(next);
    saveBookmarks(next);
  };

  const goToBookmark = (bm: Bookmark) => {
    setPendingAbbrev(bm.abbrev);
    setAbbrev(bm.abbrev);
    setChapter(bm.chapter);
    localCache.set(POS_KEY, { abbrev: bm.abbrev, chapter: bm.chapter });
    setShowModal(false);
  };

  // ── Marcador de texto ──────────────────────────────────────────────────────
  const toggleHighlight = (key: string) => {
    const next = new Set(highlights);
    next.has(key) ? next.delete(key) : next.add(key);
    setHighlights(next);
    saveHighlights(next);
  };

  // ── Seletor de livro/capítulo ──────────────────────────────────────────────
  const openModal = (initialStep: "book" | "chapter" = "book") => {
    const meta = BIBLE_BOOKS.find((b) => b.abbrev === abbrev);
    setTestament(meta?.testament ?? "AT");
    setPendingAbbrev(abbrev);
    setStep(initialStep);
    setShowModal(true);
  };

  const handleBookSelect = (a: string) => {
    const meta = BIBLE_BOOKS.find((b) => b.abbrev === a)!;
    setPendingAbbrev(a);
    if (meta.chapterCount === 1) {
      setAbbrev(a); setChapter(0);
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

  // ── Classes utilitárias ────────────────────────────────────────────────────
  const fontClass =
    fontSize === "sm" ? "text-sm leading-relaxed" :
    fontSize === "base" ? "text-base leading-relaxed" : "text-lg leading-relaxed";

  const iconBtnCls =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800";

  return (
    <>
      {/* ── Sub-header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 -mx-4 flex items-center gap-1.5 border-b border-gray-100 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
        {/* Título + seletor */}
        <button onClick={() => openModal("book")} className="flex min-w-0 flex-1 items-center gap-1 text-left">
          <span className="truncate font-semibold text-gray-800 dark:text-gray-100">
            {bookMeta?.name ?? "—"} · Cap. {chapter + 1}
          </span>
          <svg className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Tamanho da fonte */}
        <button onClick={cycleFontSize} title="Tamanho da fonte"
          className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
          {fontSize === "sm" ? "Aa" : fontSize === "base" ? "Aa+" : "Aa++"}
        </button>

        {/* Marcador de página */}
        <button onClick={toggleBookmark} title={isBookmarked ? "Remover marcador" : "Adicionar marcador"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isBookmarked
              ? "border-amber-300 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          }`}>
          <svg className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Prev / Next */}
        <button onClick={() => setChapter((c) => Math.max(0, c - 1))} disabled={chapter === 0} className={iconBtnCls}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => setChapter((c) => Math.min(maxChapter - 1, c + 1))} disabled={chapter >= maxChapter - 1} className={iconBtnCls}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Versículos ───────────────────────────────────────────────────────── */}
      <div className="mt-4 pb-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400 dark:text-gray-500">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Carregando...</span>
          </div>
        )}
        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
            {error} — Verifique a conexão e tente novamente.
          </div>
        )}
        {!loading && !error && (
          <div className={`space-y-1 ${fontClass}`}>
            {verses.map((verse, i) => {
              const hlKey = `${abbrev}-${chapter}-${i}`;
              const isHl  = highlights.has(hlKey);
              return (
                <p
                  key={i}
                  onClick={() => toggleHighlight(hlKey)}
                  className={`-mx-1 cursor-pointer rounded-lg px-1 py-1 text-gray-800 transition-colors dark:text-gray-200 ${
                    isHl
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span className={`mr-1.5 font-bold ${isHl ? "text-amber-600 dark:text-amber-400" : "text-blue-500"}`}>
                    {i + 1}
                  </span>
                  {verse}
                </p>
              );
            })}
            {verses.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Nenhum versículo encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Modal seletor (livro / capítulo / marcadores) ────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="max-h-[78vh] overflow-hidden rounded-t-2xl bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            {step === "book" ? (
              <BookSelector
                testament={testament}
                onTestamentChange={setTestament}
                currentAbbrev={abbrev}
                bookmarks={bookmarks}
                onSelect={handleBookSelect}
                onGoToBookmark={goToBookmark}
                onRemoveBookmark={removeBookmark}
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

type SelectorTab = "AT" | "NT" | "BM";

function BookSelector({
  testament, onTestamentChange, currentAbbrev,
  bookmarks, onSelect, onGoToBookmark, onRemoveBookmark,
}: {
  testament: "AT" | "NT";
  onTestamentChange: (t: "AT" | "NT") => void;
  currentAbbrev: string;
  bookmarks: Bookmark[];
  onSelect: (abbrev: string) => void;
  onGoToBookmark: (bm: Bookmark) => void;
  onRemoveBookmark: (bm: Bookmark) => void;
}) {
  const [tab, setTab] = useState<SelectorTab>(testament);

  const handleTabClick = (t: SelectorTab) => {
    setTab(t);
    if (t === "AT" || t === "NT") onTestamentChange(t);
  };

  const books = (tab === "AT" || tab === "NT") ? BIBLE_BOOKS.filter((b) => b.testament === tab) : [];

  const tabCls = (t: SelectorTab) =>
    `flex-1 py-3 text-sm font-semibold transition-colors ${
      tab === t
        ? "border-b-2 border-blue-600 text-blue-600"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`;

  return (
    <div className="flex h-full flex-col">
      {/* Abas */}
      <div className="flex shrink-0 border-b border-gray-100 dark:border-gray-800">
        <button className={tabCls("AT")} onClick={() => handleTabClick("AT")}>Antigo</button>
        <button className={tabCls("NT")} onClick={() => handleTabClick("NT")}>Novo</button>
        <button className={tabCls("BM")} onClick={() => handleTabClick("BM")}>
          <span className="flex items-center justify-center gap-1">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Salvos
            {bookmarks.length > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                {bookmarks.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="overflow-y-auto p-3">
        {tab === "BM" ? (
          bookmarks.length === 0 ? (
            <div className="py-10 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum marcador salvo ainda.</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Toque no ★ para salvar um capítulo.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {bookmarks.map((bm, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <button
                    onClick={() => onGoToBookmark(bm)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <svg className="h-4 w-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{bm.bookName}</span>
                      <span className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">Capítulo {bm.chapter + 1}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bm)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400 dark:text-gray-600 dark:hover:bg-red-900/20"
                    title="Remover marcador"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {books.map((book) => (
              <button key={book.abbrev} onClick={() => onSelect(book.abbrev)}
                className={`rounded-lg px-2 py-2.5 text-left text-sm transition-colors ${
                  book.abbrev === currentAbbrev
                    ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-900/30"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}>
                {book.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ChapterSelector ──────────────────────────────────────────────────────────

function ChapterSelector({
  bookMeta, currentChapter, onSelect, onBack,
}: {
  bookMeta: BibleBookMeta; currentChapter: number;
  onSelect: (chapter: number) => void; onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <button onClick={onBack} className="mr-3 text-sm font-medium text-blue-600">← Livros</button>
        <span className="font-semibold text-gray-800 dark:text-gray-100">{bookMeta.name}</span>
      </div>
      <div className="overflow-y-auto p-3">
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {Array.from({ length: bookMeta.chapterCount }, (_, i) => (
            <button key={i} onClick={() => onSelect(i)}
              className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
                i === currentChapter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
