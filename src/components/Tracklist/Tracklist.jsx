import Track from '../Track/Track';
import styles from './Tracklist.module.css';

function Tracklist({ tracks, actionLabel, onTrackAction }) {
  return (
    <ul className={styles.list}>
      {tracks.map(track => (
        <li key={track.id}>
          <Track track={track} actionLabel={actionLabel} onAction={onTrackAction} />
        </li>
      ))}
    </ul>
  );
}

export default Tracklist;
