import { Study } from "@/types";
import { Card } from "@/components/ui/Card";
import { FontSize } from "@/hooks/useFontSize";

const textClass: Record<FontSize, string> = {
  sm: "text-sm",
  base: "text-lg",
  lg: "text-2xl",
};

interface StudyViewerProps {
  study: Study;
  fontSize?: FontSize;
}

export function StudyViewer({ study, fontSize = "sm" }: StudyViewerProps) {
  const tx = textClass[fontSize];
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-5 text-white">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-200">
          Estudo
        </p>
        <h1 className="text-xl font-bold leading-tight">{study.title}</h1>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
          <svg className="h-4 w-4 flex-shrink-0 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm font-medium italic text-white">{study.verse}</p>
        </div>
      </div>

      {/* Introdução */}
      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Introdução
        </h2>
        <p className={`${tx} leading-relaxed text-gray-700 dark:text-gray-300`}>
          {study.introduction}
        </p>
      </Card>

      {/* Explicação */}
      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Explicação
        </h2>
        <p className={`whitespace-pre-line ${tx} leading-relaxed text-gray-700 dark:text-gray-300`}>
          {study.explanation}
        </p>
      </Card>

      {/* Aplicação */}
      {(study.applicationIndividual || study.applicationGroup) && (
        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Aplicação
          </h2>
          <div className="space-y-3">
            {study.applicationIndividual && (
              <div>
                <p className="mb-1 text-xs font-medium text-blue-600">Individual</p>
                <p className={`${tx} leading-relaxed text-gray-700 dark:text-gray-300`}>
                  {study.applicationIndividual}
                </p>
              </div>
            )}
            {study.applicationGroup && (
              <div>
                <p className="mb-1 text-xs font-medium text-violet-600">Em grupo</p>
                <p className={`${tx} leading-relaxed text-gray-700 dark:text-gray-300`}>
                  {study.applicationGroup}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tópicos de oração */}
      {study.prayerTopics.length > 0 && (
        <Card>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Tópicos de Oração
          </h2>
          <ul className="space-y-1.5">
            {study.prayerTopics.map((topic, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                <span className={`${tx} text-gray-700 dark:text-gray-300`}>{topic}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Conclusão */}
      {study.conclusion && (
        <Card>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Conclusão
          </h2>
          <p className={`${tx} leading-relaxed text-gray-700 dark:text-gray-300`}>
            {study.conclusion}
          </p>
        </Card>
      )}
    </div>
  );
}
