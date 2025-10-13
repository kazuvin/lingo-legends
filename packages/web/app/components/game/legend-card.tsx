import { type Word } from '@lingo-legends/shared/generated/react-query';
import { formatLemma, getPosCodeColor } from './utils';
import { useI18n } from '~/lib/i18n';

type LegendCardProps = {
  word: Word;
};

export function LegendCard({ word }: LegendCardProps) {
  const { t } = useI18n();
  const colors = getPosCodeColor(word.posCode);

  return (
    <div
      className="border-border relative flex h-72 cursor-pointer flex-col items-center space-y-2 rounded-lg border px-4 py-12 transition-all duration-150 ease-in-out hover:-translate-y-1"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <div
        className="absolute top-4 left-4 flex items-center justify-center rounded-full text-lg font-semibold"
        style={{ color: colors.badge }}
      >
        {t(`posCode.${word.posCode}`, { ns: 'game' })}
      </div>
      <div className="text-xl font-semibold">{formatLemma(word.lemma)}</div>
      <div className="text-xs opacity-70">{word.gloss}</div>
    </div>
  );
}
