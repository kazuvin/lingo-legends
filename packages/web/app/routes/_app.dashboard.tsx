import { useWordsGetWords } from '@lingo-legends/shared/generated/react-query';
import { LegendCard } from '~/components/game/legend-card';

export default function Dashboard() {
  const { data, isLoading, error } = useWordsGetWords({
    random: true,
    count: 12,
  });

  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6 lg:px-8">
      <div className="grid grid-cols-6 gap-4">
        {(data?.words || []).map((word) => (
          <LegendCard key={word.lemma} word={word} />
        ))}
      </div>
    </div>
  );
}
