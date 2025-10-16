# API Context Usage

This document explains how to use the new API Context system in the Neon Beat Admin Frontend.

## Overview

The API functionality has been refactored from a simple hook (`useNeonBeatApi`) to a context-based system for better state management and to avoid duplicate API connections.

## Architecture

### ApiContext (`src/Context/ApiContext.tsx`)
- Main context provider that manages API state
- Handles server connection, SSE initialization, and API calls
- Must be wrapped within a `MessageContext.Provider`

### useApiContext (`src/Hooks/useApiContext.tsx`)
- Hook to consume the API context
- Returns `getGames`, `isServerReady`, and `apiBaseUrl`

### useNeonBeatApi (`src/Hooks/useNeonBeatApi.tsx`)
- Backward compatibility hook that wraps `useApiContext`
- Existing components can continue using this without changes

## Usage

### 1. Setup (already done in App.tsx)
```tsx
import { ApiProvider } from './Context/ApiContext'
import MessageContext from './Context/MessageContext'

<MessageContext.Provider value={{ messageApi }}>
  <ApiProvider>
    {/* Your app components */}
  </ApiProvider>
</MessageContext.Provider>
```

### 2. Using the API in components

#### Option A: Using the new hook (recommended)
```tsx
import { useApiContext } from '../Hooks/useApiContext'

const MyComponent = () => {
  const { getGames, isServerReady, apiBaseUrl } = useApiContext()
  
  // Use the API methods
}
```

#### Option B: Using the legacy hook (backward compatibility)
```tsx
import useNeonBeatApi from '../Hooks/useNeonBeatApi'

const MyComponent = () => {
  const { getGames, isServerReady } = useNeonBeatApi()
  
  // Use the API methods (same as before)
}
```

## Features

- **Single SSE Connection**: Only one Server-Sent Events connection is maintained
- **Automatic Health Check**: Checks backend availability on initialization
- **Error Handling**: Integrated with message API for user notifications
- **TypeScript Support**: Fully typed with proper interfaces
- **Environment Variables**: Supports `VITE_API_BASE_URL` configuration

## API Methods

### getGames()
- **Returns**: `Promise<Game[]>`
- **Description**: Fetches all games from the admin API

### isServerReady
- **Type**: `boolean | null`
- **Description**: Server connection status (null = checking, true = connected, false = error)

### apiBaseUrl
- **Type**: `string`
- **Description**: The base URL for API calls

## Migration Guide

Existing components using `useNeonBeatApi` will continue to work without changes. However, for new components, it's recommended to use `useApiContext` directly for better clarity.