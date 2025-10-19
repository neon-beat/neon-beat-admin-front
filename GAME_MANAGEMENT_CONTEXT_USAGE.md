# Game Management Context Usage

This document explains how to use the new Game Management Context system in the Neon Beat Admin Frontend.

## Overview

The game management functionality has been refactored from a simple hook (`useNeonBeatGame`) to a context-based system for better state management, centralized game logic, and improved performance.

## Architecture

### GameManagementContext (`src/Context/GameManagementContext.tsx`)
- Main context provider that manages game, playlist, team, and buzzer state
- Handles data loading, creation, and SSE event handling
- Must be wrapped within both `MessageContext.Provider` and `ApiProvider`

### useGameManagement (`src/Hooks/useGameManagement.tsx`)
- Hook to consume the GameManagementContext
- Returns all game management state and actions
- Provides type-safe access to game functionality

### useNeonBeatGame (`src/Hooks/useNeonBeatGame.tsx`)
- Backward compatibility hook that wraps `useGameManagement`
- Existing components can continue using this without changes
- Re-exports all types for compatibility

## Usage

### 1. Setup (already done in App.tsx)
```tsx
import { GameManagementProvider } from './Context/GameManagementContext'
import { ApiProvider } from './Context/ApiContext'
import MessageContext from './Context/MessageContext'

<MessageContext.Provider value={{ messageApi }}>
  <ApiProvider>
    <GameManagementProvider>
      {/* Your app components */}
    </GameManagementProvider>
  </ApiProvider>
</MessageContext.Provider>
```

### 2. Using Game Management in components

#### Option A: Using the new hook (recommended)
```tsx
import { useGameManagement } from '../Hooks/useGameManagement'

const MyComponent = () => {
  const { 
    games, 
    playlists, 
    teams,
    loadGames,
    createGameWithPlaylist,
    importPlaylist 
  } = useGameManagement()
  
  // Use the game management methods
}
```

#### Option B: Using the legacy hook (backward compatibility)
```tsx
import useNeonBeatGame from '../Hooks/useNeonBeatGame'

const MyComponent = () => {
  const { games, playlists, createGameWithPlaylist } = useNeonBeatGame()
  
  // Use the methods (same as before)
}
```

## Available State & Actions

### State
- **games**: `Game[]` - List of all games
- **playlists**: `Playlist[]` - List of all playlists  
- **teams**: `Team[]` - List of all teams
- **currentTeamPairing**: `Team | undefined` - Currently pairing team
- **game**: `Game | undefined` - Current active game
- **song**: `Song | undefined` - Current active song
- **buzzers**: `Buzzer[]` - List of available buzzers

### Actions
- **loadGames()**: `Promise<void>` - Refresh games list
- **loadPlaylists()**: `Promise<void>` - Refresh playlists list  
- **loadTeams()**: `Promise<void>` - Refresh teams list
- **importPlaylist(payload)**: `Promise<void>` - Import a new playlist
- **createGameWithPlaylist(payload)**: `Promise<void>` - Create game with playlist
- **createTeamWithoutBuzzer(name)**: `Promise<void>` - Create a new team

## Features

- **Centralized State**: All game-related state managed in one place
- **Automatic Data Loading**: Loads games and playlists when server is ready
- **SSE Integration**: Listens for real-time pairing events
- **Error Handling**: Integrated with message API for user notifications
- **TypeScript Support**: Fully typed with proper interfaces
- **Performance Optimized**: Uses `useCallback` for action functions

## Types & Interfaces

### Game Interface
```tsx
interface Game {
  id: string;
  name: string;
  playlist: Playlist;
  teams?: Team[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}
```

### Playlist Interface
```tsx
interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}
```

### Team Interface
```tsx
interface Team {
  id?: string;
  buzzer_id?: string;
  name: string;
  score?: number;
}
```

### Song Interface
```tsx
interface Song {
  id: string;
  bonus_fields: Field[];
  guess_duration_ms: number;
  point_fields: Field[];
  starts_at_ms: number;
  url: string;
}
```

## SSE Events Handled

- **pairing.assigned**: Handles team-buzzer pairing notifications

## Migration Guide

Existing components using `useNeonBeatGame` will continue to work without changes. However, for new components, it's recommended to use `useGameManagement` directly for:

- Better clarity of what functionality you're using
- Direct access to loading functions
- More explicit dependency management

## Benefits of Context Pattern

1. **Single Source of Truth**: All game state managed centrally
2. **Performance**: Prevents unnecessary re-renders and duplicate API calls
3. **Consistency**: Ensures all components see the same data
4. **Maintainability**: Easier to modify game logic in one place
5. **Testing**: Easier to mock and test game management logic