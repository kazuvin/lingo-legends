import { type Word } from '@lingo-legends/shared/generated/react-query';
import { formatLemma, getPosCodeColor } from './utils';
import { useI18n } from '~/lib/i18n';

type LegendCardProps = {
  word: Word;
};

export function LegendCard({ word }: LegendCardProps) {
  const { t } = useI18n();
  // 最初の意味の品詞で背景色を決定
  const firstMeaning = word.meanings[0];
  const colors = getPosCodeColor(firstMeaning?.posCode);

  return (
    <div
      className="border-border relative flex h-auto min-h-72 cursor-pointer flex-col space-y-3 rounded-lg border px-4 py-6 transition-all duration-150 ease-in-out hover:-translate-y-1"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <div className="text-center text-xl font-semibold">{formatLemma(word.lemma)}</div>

      <div className="space-y-2 overflow-y-auto">
        {word.meanings.map((meaning) => {
          const meaningColors = getPosCodeColor(meaning.posCode);
          return (
            <div key={meaning.id} className="space-y-1">
              <div
                className="text-xs font-semibold"
                style={{ color: meaningColors.badge }}
              >
                {t(`posCode.${meaning.posCode}`, { ns: 'game' })}
              </div>
              <div className="text-xs opacity-70">{meaning.gloss}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
