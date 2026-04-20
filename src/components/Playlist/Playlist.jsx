import Tracklist from '../Tracklist/Tracklist';
import styles from './Playlist.module.css';

function Playlist({ tracks, playlistName, onNameChange, onRemoveTrack, onSave, isSaving }) {
  return (
    <section className={styles.section}>
      <input
        id="playlist-name"
        name="playlist-name"
        className={styles.nameInput}
        type="text"
        value={playlistName}
        onChange={(e) => onNameChange(e.target.value)}
        aria-label="Playlist name"
        maxLength={100}
      />
      <div className={styles.tracklistWrapper}>
        {tracks.length === 0
          ? <p className={styles.empty}>Add tracks from the search results.</p>
          : <Tracklist tracks={tracks} actionLabel="−" onTrackAction={onRemoveTrack} />
        }
      </div>
      <button
        className={styles.saveButton}
        onClick={onSave}
        disabled={tracks.length === 0 || isSaving || !playlistName.trim()}
      >
        {isSaving ? 'Saving...' : 'Save to Spotify'}
      </button>
    </section>
  );
}

export default Playlist;
