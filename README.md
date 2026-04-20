# Jamming

Jamming is a React app that lets you search Spotify for tracks, build a custom playlist, and save that playlist to your Spotify account.

This project uses Vite for local development and the Spotify Web API for search and playlist creation.

You can access the web app [here](https://phayze2184.github.io/jamming/).

## What It Does

- Search Spotify by song, artist, or album
- Add tracks to a custom playlist
- Remove tracks before saving
- Rename the playlist
- Save the playlist directly to your Spotify account

## Tech Stack

- React
- Vite
- JavaScript
- CSS Modules
- Spotify Web API

## Running The Project

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in your browser:

```text
http://127.0.0.1:3000/
```

## Important Spotify Setup Note

This project builds the Spotify redirect URI from the current app URL, so it can work both locally and on GitHub Pages.

You still need to register the allowed callback URLs in your Spotify Developer Dashboard.

Add these redirect URIs:

```text
http://127.0.0.1:3000/
https://phayze2184.github.io/jamming/
```

If you deploy to a different GitHub account, repo name, domain, or path, update the GitHub Pages URL in your Spotify app settings too.

## Deploying To GitHub Pages

This repo includes a GitHub Actions workflow that builds the app and deploys it to GitHub Pages.

### Before you deploy

1. Push your code to GitHub.
2. Make sure your default deployment branch is `main`, or update `.github/workflows/deploy.yml`.
3. In your GitHub repository, go to `Settings -> Pages`.
4. Set the source to `GitHub Actions`.
5. In the Spotify Developer Dashboard, add these redirect URIs:

```text
https://phayze2184.github.io/jamming/
```

### How deployment works

- The workflow file is `.github/workflows/deploy.yml`
- A push to `main` triggers the build and deployment
- You can also run it manually from the `Actions` tab

### Important deployment note

This project uses the Vite base path:

```text
/jamming/
```

That matches the current repository name. If you rename the repository, you also need to update:

- `vite.config.js`
- the GitHub Pages URL in Spotify Developer Dashboard

## Available Scripts

### `npm run dev`

Starts the Vite development server.

### `npm run build`

Creates a production build in the `dist` folder.

### `npm run preview`

Runs a local preview of the production build.

### `npm run lint`

Runs ESLint on the project.

## Project Structure

```text
src/
  components/
    App/
    Modal/
    Playlist/
    SearchBar/
    SearchResults/
    Track/
    Tracklist/
  utils/
    Spotify.js
```

## Notes

- The app keeps Spotify auth data in `localStorage`.
- Playlist saving uses Spotify track URIs, not the full track objects.
- The UI prevents duplicate tracks from being added to the same playlist.

## Future Improvements

- Move Spotify configuration into environment variables
- Add better error handling in the UI
- Add loading states for search results
- Add tests for playlist and auth behavior

## Author

Built as part of the Jamming project, then extended with playlist saving, updated Spotify auth handling, and a refreshed UI.
