// Imports 
import Tracklist from '../Tracklist/Tracklist';
import styles from './Playlist.module.css';
// Playlist component with controlled input for playlist name, conditional rendering for empty state, and save button
function Playlist({ tracks, playlistName, onNameChange, onRemoveTrack, onSave }) {
  return (
    <section className={styles.section}>
      <input
        className={styles.nameInput}
        type="text"
        value={playlistName}
        onChange={(e) => onNameChange(e.target.value)}
        aria-label="Playlist name"
      />
      {tracks.length === 0
        ? <p className={styles.empty}>Add tracks from the search results.</p>
        : <Tracklist tracks={tracks} actionLabel="−" onTrackAction={onRemoveTrack} />
      }
      <button className={styles.saveButton} onClick={onSave} disabled={tracks.length === 0}>
        Save to Spotify
      </button>
    </section>
  );
}

export default Playlist;
