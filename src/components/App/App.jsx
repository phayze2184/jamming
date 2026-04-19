// Imports

import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import styles from './App.module.css';

// Mock data for testing - 7 tracks with id, name, artist, and album properties
const MOCK_TRACKS = [
  { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
  { id: '2', name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
  { id: '3', name: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3' },
  { id: '4', name: 'Peaches', artist: 'Justin Bieber', album: 'Justice' },
  { id: '5', name: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR' },
  { id: '6', name: 'Montero', artist: 'Lil Nas X', album: 'MONTERO' },
  { id: '7', name: 'Kiss Me More', artist: 'Doja Cat ft. SZA', album: 'Planet Her' },
];
// Main App component
function App() {
  const [searchResults, setSearchResults] = useState(MOCK_TRACKS);
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
// Create a Set of track IDs in the playlist for O(1) lookup when adding tracks
  const playlistTrackIds = new Set(playlistTracks.map(t => t.id));
// Handlers for search, adding/removing tracks, and saving playlist
  const handleSearch = (term) => {
    const filtered = MOCK_TRACKS.filter(t =>
        // Case-insensitive search across name, artist, and album
      t.name.toLowerCase().includes(term.toLowerCase()) ||
      t.artist.toLowerCase().includes(term.toLowerCase()) ||
      t.album.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };
  // When adding a track, check if it's already in the playlist using the Set for efficient lookup
  const handleAddTrack = (track) => {
    if (!playlistTrackIds.has(track.id)) {
      setPlaylistTracks(prev => [...prev, track]);
    }
  };
  // When removing a track, filter it out of the playlistTracks state
  const handleRemoveTrack = (track) => {
    setPlaylistTracks(prev => prev.filter(t => t.id !== track.id));
  };
  // Simulate saving the playlist - in a real app, this would involve calling the Spotify API
  const handleSave = () => {
    // Will be replaced with Spotify API call
    alert(`Saving "${playlistName}" with ${playlistTracks.length} tracks to Spotify!`);
    setPlaylistTracks([]);
    setPlaylistName('My Playlist');
  };
// Render the app with header, search bar, search results, and playlist panels
  return (
    <div className={styles.app}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>Jam</span>mming
        </div>
        <p className={styles.tagline}>Build your perfect playlist</p>
      </header>

      <main className={styles.main}>
        <div className={styles.searchSection}>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className={styles.columns}>
          <div className={styles.panel}>
            <SearchResults
              results={searchResults}
              onAddTrack={handleAddTrack}
              playlistTrackIds={playlistTrackIds}
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.panel}>
            <Playlist
              tracks={playlistTracks}
              onRemoveTrack={handleRemoveTrack}
              onSave={handleSave}
              playlistName={playlistName}
              onNameChange={setPlaylistName}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
