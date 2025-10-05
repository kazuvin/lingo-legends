import { useWordsGetRandom } from '@lingo-legends/shared/generated/react-query';

export default function Dashboard() {
  const { data, isLoading, error } = useWordsGetRandom({
    count: '5',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Dashboard - Random Words</h1>
      <div>
        <p>Count: {data?.count}</p>
        <ul>
          {data?.words.map((word) => (
            <li key={word.id}>
              <strong>{word.lemma}</strong> ({word.posCode}) - {word.gloss}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
