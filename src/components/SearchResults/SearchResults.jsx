import Tracklist from '../Tracklist/Tracklist';
import styles from './SearchResults.module.css';

function SearchResults({ results, onAddTrack, playlistTrackIds }) {
  const available = results.filter(t => !playlistTrackIds.has(t.id));

  function renderContent() {
    if (results.length === 0) {
      return <p className={styles.empty}>Search for music above to get started.</p>;
    }
    if (available.length === 0) {
      return <p className={styles.empty}>All results are already in your playlist.</p>;
    }
    return <Tracklist tracks={available} actionLabel="+" onTrackAction={onAddTrack} />;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Results</h2>
      {renderContent()}
    </section>
  );
}

export default SearchResults;
