import { type Word } from '@lingo-legends/shared/generated/react-query';
import { formatLemma } from './utils';
import { useI18n } from '~/lib/i18n';

type LegendCardProps = {
  word: Word;
};

export function LegendCard({ word }: LegendCardProps) {
  const { t } = useI18n();

  return (
    <div className="border-border flex h-72 cursor-pointer flex-col rounded-lg border bg-white transition-all duration-150 ease-in-out">
      <div className="border-border border-b p-3 text-center text-xl font-semibold">{formatLemma(word.lemma)}</div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {word.meanings.map((meaning) => {
          return (
            <div key={meaning.id} className="space-y-1">
              <div className="text-xs font-semibold text-gray-600">
                {t(`posCode.${meaning.posCode}`, { ns: 'game' })}
              </div>
              <div className="text-xs text-gray-700">{meaning.gloss}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
