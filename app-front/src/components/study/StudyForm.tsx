"use client";

import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CreateStudyPayload } from "@/services/study";
import { parsePDFToStudy } from "@/lib/pdfParser";

interface StudyFormProps {
  onSubmit: (payload: CreateStudyPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

function StringListField({
  label, placeholder, items, onChange,
}: {
  label: string; placeholder: string; items: string[]; onChange: (items: string[]) => void;
}) {
  function update(idx: number, value: string) {
    const next = [...items]; next[idx] = value; onChange(next);
  }
  function add() { onChange([...items, ""]); }
  function remove(idx: number) { onChange(items.filter((_, i) => i !== idx)); }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={`${placeholder} ${idx + 1}`}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar
        </button>
      </div>
    </div>
  );
}

function TextareaField({
  id, label, value, onChange, placeholder, required, rows = 3,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`resize-none ${inputCls}`}
      />
    </div>
  );
}

export function StudyForm({ onSubmit, loading, error }: StudyFormProps) {
  const [title, setTitle] = useState("");
  const [verse, setVerse] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [explanation, setExplanation] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);
  const [applicationIndividual, setApplicationIndividual] = useState("");
  const [applicationGroup, setApplicationGroup] = useState("");
  const [prayerTopics, setPrayerTopics] = useState<string[]>([""]);
  const [conclusion, setConclusion] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePDFImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const parsed = await parsePDFToStudy(file);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.verse) setVerse(parsed.verse);
      if (parsed.introduction) setIntroduction(parsed.introduction);
      if (parsed.explanation) setExplanation(parsed.explanation);
      if (parsed.questions?.length) setQuestions(parsed.questions);
      if (parsed.applicationIndividual) setApplicationIndividual(parsed.applicationIndividual);
      if (parsed.applicationGroup) setApplicationGroup(parsed.applicationGroup);
      if (parsed.prayerTopics?.length) setPrayerTopics(parsed.prayerTopics);
      if (parsed.conclusion) setConclusion(parsed.conclusion);
    } catch {
      setImportError("Não foi possível ler o PDF. Verifique o arquivo e tente novamente.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      title: title.trim(), verse: verse.trim(), introduction: introduction.trim(),
      explanation: explanation.trim(),
      questions: questions.map((q) => q.trim()).filter(Boolean),
      applicationIndividual: applicationIndividual.trim(),
      applicationGroup: applicationGroup.trim(),
      prayerTopics: prayerTopics.map((t) => t.trim()).filter(Boolean),
      conclusion: conclusion.trim(),
    });
  }

  const sectionHeader = "mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";
  const divider = "border-t border-gray-100 pt-1 dark:border-gray-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Botão importar PDF ── */}
      <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">Importar de PDF</p>
        <p className="mb-3 text-xs text-blue-600 dark:text-blue-400">
          O arquivo será lido automaticamente. Revise os campos após a importação.
        </p>
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePDFImport} className="hidden" id="pdf-upload" />
        <label htmlFor="pdf-upload">
          <Button type="button" variant="secondary" size="sm" loading={importing} onClick={() => fileInputRef.current?.click()}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {importing ? "Lendo PDF..." : "Selecionar PDF"}
          </Button>
        </label>
        {importError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{importError}</p>}
      </div>

      {/* ── Título e versículo ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelCls}>Título <span className="text-red-500">*</span></label>
          <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: O Pai Nosso" className={inputCls} />
        </div>
        <div>
          <label htmlFor="verse" className={labelCls}>Versículo base <span className="text-red-500">*</span></label>
          <input id="verse" type="text" required value={verse} onChange={(e) => setVerse(e.target.value)} placeholder="Ex: Mateus 6:9-13" className={inputCls} />
        </div>
      </div>

      <TextareaField id="introduction" label="Introdução" required value={introduction} onChange={setIntroduction} placeholder="Contexto e abertura do estudo..." rows={3} />
      <TextareaField id="explanation" label="Explicação" required value={explanation} onChange={setExplanation} placeholder="Desenvolvimento e explicação do texto..." rows={5} />

      <div className={divider}>
        <p className={sectionHeader}>Perguntas para discussão</p>
        <StringListField label="Perguntas" placeholder="Pergunta" items={questions} onChange={setQuestions} />
      </div>

      <div className={divider}>
        <p className={sectionHeader}>Aplicação</p>
        <div className="space-y-4">
          <TextareaField id="appIndividual" label="Individual" value={applicationIndividual} onChange={setApplicationIndividual} placeholder="O que cada pessoa pode fazer durante a semana..." rows={2} />
          <TextareaField id="appGroup" label="Em grupo" value={applicationGroup} onChange={setApplicationGroup} placeholder="O que o grupo pode fazer junto..." rows={2} />
        </div>
      </div>

      <div className={divider}>
        <p className={sectionHeader}>Oração</p>
        <StringListField label="Tópicos de oração" placeholder="Tópico" items={prayerTopics} onChange={setPrayerTopics} />
      </div>

      <TextareaField id="conclusion" label="Conclusão" value={conclusion} onChange={setConclusion} placeholder="Fechamento do estudo..." rows={2} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}

      <Button type="submit" loading={loading} fullWidth size="lg">Salvar estudo</Button>
    </form>
  );
}
