# Neon Beat Admin Frontend

A modern admin dashboard for managing Neon Beat game sessions, playlists, and configurations. Built with React 19, TypeScript, and Ant Design.

## 🚀 Tech Stack

### Core Technologies
- **React 19** - Latest React with enhanced concurrent features
- **TypeScript 5.9** - Type-safe JavaScript with latest features
- **Vite 7** - Lightning-fast build tool and dev server
- **Ant Design 5** - Enterprise-class UI design language
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & API
- **React Context API** - Centralized state management
- **Server-Sent Events (SSE)** - Real-time updates from backend
- **Custom Hooks** - Reusable business logic

### Development Tools
- **ESLint 9** - Code linting with modern flat config
- **Prettier 3** - Code formatting with Tailwind plugin
- **TypeScript ESLint** - TypeScript-specific linting rules

## 📁 Project Structure

```
neon-beat-admin-front/
├── public/                          # Static assets
│   └── images/                      # Image assets
│       ├── background.png
│       └── logo.png
├── src/
│   ├── Components/                  # React components
│   │   ├── AdminHome.tsx           # Main admin dashboard
│   │   └── AdminHome.css           # Component styles
│   ├── Context/                     # React contexts
│   │   ├── ApiContext.tsx          # API management context
│   │   └── MessageContext.tsx      # Message/notification context
│   ├── Hooks/                       # Custom React hooks
│   │   ├── useApiContext.tsx       # API context consumer hook
│   │   └── useNeonBeatGame.tsx    # Games and playlists management
│   ├── assets/                      # Source assets
│   │   ├── background.png
│   │   └── logo.png
│   ├── App.tsx                      # Root application component
│   ├── App.css                      # Global application styles
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global CSS imports
├── API_CONTEXT_USAGE.md            # API context documentation
├── index.html                       # HTML template
├── package.json                     # Dependencies and scripts
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript project config
├── tsconfig.app.json               # TypeScript app-specific config
├── tsconfig.node.json              # TypeScript Node.js config
├── tailwind.config.js              # Tailwind CSS configuration
├── eslint.config.js                # ESLint configuration
└── .prettierrc                     # Prettier configuration
```

## 🏗️ Architecture Overview

### Context-Based State Management
The application uses React Context API for centralized state management:

- **MessageContext**: Manages global notifications and messages
- **ApiContext**: Handles API connections, server health, and data fetching

### Component Hierarchy
```
App
├── ConfigProvider (Ant Design theme)
├── MessageContext.Provider
└── ApiProvider
    └── AdminHome (Main dashboard)
```

### API Integration
- RESTful API communication with backend
- Server-Sent Events for real-time updates
- Environment-based configuration (`VITE_API_BASE_URL`)

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ 
- **npm** 9+ or **yarn** 1.22+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neon-beat-admin-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

### Development Commands

#### Start Development Server
```bash
npm run dev
```
- Starts Vite dev server on `http://localhost:5173`
- Hot module replacement enabled
- Serves from `/admin` base path

#### Build for Production
```bash
npm run build
```
- Compiles TypeScript
- Builds optimized production bundle
- Outputs to `dist/` directory
- Generates source maps

#### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Useful for testing production optimizations

#### Code Quality
```bash
# Lint code
npm run lint

# Format code (via editor or manual)
npx prettier --write .
```

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)
- **Base Path**: `/admin` (for deployment under subpath)
- **Plugins**: React JSX transform, Tailwind CSS
- **Source Maps**: Enabled for debugging

### TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive type checking
- **Module System**: ES2022 with bundler resolution
- **JSX**: React 19 automatic runtime
- **Verbatim Module Syntax**: Enforced for clarity

### Styling
- **Ant Design**: Dark theme with custom primary color (`#9E339F`)
- **Tailwind CSS**: Utility-first approach with Prettier plugin
- **Custom Components**: CSS modules for component-specific styles

## 📱 Progressive Web App (PWA)

The Neon Beat Admin Frontend is built as a Progressive Web App with the following features:

### PWA Features
- **App Manifest** (`public/manifest.json`) - Installable web app with proper metadata
- **Service Worker** (`public/sw.js`) - Offline functionality and caching
- **App Shortcuts** - Quick access to Games, Playlists, and Teams sections
- **Responsive Design** - Optimized for desktop and tablet use
- **Offline Support** - Basic offline functionality with cached assets

### Installation
Users can install the admin dashboard as a standalone app:
1. **Desktop**: Click the install button in the address bar (Chrome/Edge)
2. **Mobile**: Add to home screen from browser menu
3. **PWA Store**: Available through PWA directories

### Service Worker Capabilities
- **Static Asset Caching** - Images, CSS, and JS files cached for offline use
- **Runtime Caching** - Dynamic content cached during use
- **Background Sync** - Queued actions when connectivity is restored
- **Push Notifications** - Ready for future notification features

### PWA Configuration
- **Theme Color**: `#9E339F` (Neon Beat purple)
- **Background Color**: `#141414` (Dark theme)
- **Display Mode**: Standalone (full-screen app experience)
- **Orientation**: Landscape-primary (optimized for admin tasks)

## 🌐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

## 📦 Build Output

The build process generates:
- **Static Assets**: Optimized images, fonts, and other resources
- **JavaScript Bundles**: Code-split chunks for efficient loading
- **CSS Files**: Compiled and optimized stylesheets
- **Source Maps**: For production debugging
- **HTML Template**: With injected asset references

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Considerations
- **Base Path**: Application is configured for `/admin` subpath
- **Static Hosting**: Compatible with any static hosting service
- **Environment Variables**: Set `VITE_API_BASE_URL` for production API
- **CORS**: Ensure backend allows requests from your domain

### Example Deployment (Nginx)
```nginx
location /admin {
    alias /path/to/neon-beat-admin-front/dist;
    try_files $uri $uri/ /admin/index.html;
}
```

## 🔍 Development Workflow

1. **Start Backend**: Ensure Neon Beat backend is running on configured port
2. **Start Frontend**: `npm run dev`
3. **Code Changes**: Hot reload automatically reflects changes
4. **Testing**: Use browser dev tools and React DevTools
5. **Linting**: Run `npm run lint` before commits
6. **Build**: Test production build with `npm run build && npm run preview`

## 📚 Additional Documentation

- [API Context Usage](./API_CONTEXT_USAGE.md) - Detailed API integration guide
- [Component Architecture](./src/Components/README.md) - Component design patterns
- [TypeScript Interfaces](./src/types/README.md) - Type definitions and contracts

## 🤝 Contributing

1. Follow the established TypeScript and React patterns
2. Use the context-based state management approach
3. Maintain consistent code formatting with Prettier
4. Add appropriate TypeScript types for new features
5. Test changes with both development and production builds

## 📋 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
npm run lint           # Lint code

# Maintenance
npm install            # Install dependencies
npm update            # Update dependencies
npm audit             # Security audit
```