import styles from './Track.module.css';

function Track({ track, actionLabel, onAction }) {
  return (
    <div className={styles.track}>
      <div className={styles.info}>
        <span className={styles.name}>{track.name}</span>
        <span className={styles.meta}>{track.artist} · {track.album}</span>
      </div>
      <button className={styles.action} onClick={() => onAction(track)} aria-label={actionLabel}>
        {actionLabel}
      </button>
    </div>
  );
}

export default Track;
