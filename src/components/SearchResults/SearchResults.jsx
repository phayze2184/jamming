//Imports
import Tracklist from '../Tracklist/Tracklist';
import styles from './SearchResults.module.css';
// SearchResults component that filters out tracks already in the playlist and renders the available search results with an add action
function SearchResults({ results, onAddTrack, playlistTrackIds }) {
  const available = results.filter(t => !playlistTrackIds.has(t.id));

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Results</h2>
      {/* If there are no available tracks, show an empty state message. Otherwise, render the Tracklist with the add action. */}
      {available.length === 0
        ? <p className={styles.empty}>No tracks found.</p>
        : <Tracklist tracks={available} actionLabel="+" onTrackAction={onAddTrack} />
      }
    </section>
  );
}

export default SearchResults;
