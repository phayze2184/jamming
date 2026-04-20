import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Modal from '../Modal/Modal';
import styles from './App.module.css';
import Spotify from '../../utils/Spotify';

function App() {
  // Search results returned from Spotify.
  const [searchResults, setSearchResults] = useState([]);
  // The editable name for the playlist the user is building.
  const [playlistName, setPlaylistName] = useState('My Playlist');
  // Tracks currently selected for the playlist.
  const [playlistTracks, setPlaylistTracks] = useState([]);
  // Used to disable the save button and show "Saving..." while the request runs.
  const [isSaving, setIsSaving] = useState(false);
  // Controls the success modal after a playlist is saved.
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    // If Spotify redirects back with auth query params, finish the auth flow once on load.
    const params = new URLSearchParams(window.location.search);
    if (params.get('code') || params.get('error')) {
      Spotify.getAccessToken().catch(console.error);
    }
  }, []);

  // A Set gives us fast duplicate checks when adding tracks.
  const playlistTrackIds = new Set(playlistTracks.map((t) => t.id));

  function handleSearch(term) {
    // Ignore empty or whitespace-only searches before calling the API.
    const trimmed = term.trim();
    if (!trimmed) return;

    // Store the latest search results so the left column can render them.
    Spotify.search(trimmed)
      .then((tracks) => setSearchResults(tracks))
      .catch((err) => alert(`Search failed: ${err.message}`));
  }

  function handleAddTrack(track) {
    // Prevent the same track from being added twice.
    if (!playlistTrackIds.has(track.id)) {
      setPlaylistTracks((prev) => [...prev, track]);
    }
  }

  function handleRemoveTrack(track) {
    // Remove the clicked track from the playlist by id.
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== track.id));
  }

  function handleSave() {
    const trimmedName = playlistName.trim();
    // Spotify expects an array of track URIs, not the full track objects.
    const trackUris = playlistTracks.map((t) => t.uri);

    if (!trimmedName) {
      alert('Please enter a name for your playlist before saving.');
      return;
    }

    setIsSaving(true);

    // After a successful save, reset the editor back to its default state.
    Spotify.savePlaylist(trimmedName, trackUris)
      .then(() => {
        setSavedMessage(`"${trimmedName}" was saved to your Spotify account!`);
        setPlaylistTracks([]);
        setPlaylistName('My Playlist');
      })
      .catch((err) => alert(`Failed to save playlist: ${err.message}`))
      .finally(() => setIsSaving(false));
  }

  return (
    <div className={styles.app}>
      {/* Success feedback is rendered only after a save completes. */}
      {savedMessage && <Modal message={savedMessage} onClose={() => setSavedMessage('')} />}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <header className={styles.header}>
        <div className={styles.logo}>
          Ja<span className={styles.logoAccent}>mmm</span>ing
        </div>
        <p className={styles.tagline}>Build your perfect playlist</p>
      </header>
      <main className={styles.main}>
        {/* SearchBar sends the entered term back up through handleSearch. */}
        <div className={styles.searchSection}>
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className={styles.columns}>
          <div className={styles.panel}>
            {/* Search results can add tracks, but already-added ids are filtered out downstream. */}
            <SearchResults
              results={searchResults}
              onAddTrack={handleAddTrack}
              playlistTrackIds={playlistTrackIds}
            />
          </div>
          <div className={styles.divider} />
          <div className={styles.panel}>
            {/* Playlist receives both the current data and the callbacks that mutate it. */}
            <Playlist
              tracks={playlistTracks}
              onRemoveTrack={handleRemoveTrack}
              onSave={handleSave}
              playlistName={playlistName}
              onNameChange={setPlaylistName}
              isSaving={isSaving}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
