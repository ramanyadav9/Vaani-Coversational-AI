# Conversational AI - Intelligent Outbound Call System

A professional, full-stack application with React + TypeScript frontend and Node.js backend for managing AI-powered outbound calls using ElevenLabs API.

## Features

- **Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Glassmorphism Design**: Beautiful backdrop blur effects and gradient overlays
- **Smooth Animations**: Framer Motion for fluid page transitions and micro-interactions
- **Responsive Layout**: Mobile-first design with elegant scaling
- **Type-Safe**: Full TypeScript coverage with strict type checking
- **Agent Management**: Browse, search, and filter AI agents by category
- **Outbound Calling**: Initiate calls with phone number validation
- **Call History**: View past conversations with expandable transcripts
- **Real-time Updates**: Automatic status updates and refresh functionality

## Project Structure

```
con-ai/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── server.js       # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Styles
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json            # Root package.json with helper scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- ElevenLabs API credentials

### Running the Application

You need **TWO separate terminals**:

#### Terminal 1 - Backend Server
```bash
npm run backend
```
✅ Backend runs on: **http://localhost:3000**

#### Terminal 2 - Frontend Dev Server
```bash
npm run frontend
```
✅ Frontend runs on: **http://localhost:5173**

Then open your browser to: **http://localhost:5173**

## Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend connects to the Express backend at `http://localhost:3000` with the following endpoints:

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID

### Calls
- `POST /api/call` - Initiate outbound call
  ```json
  {
    "agent_id": "string",
    "to_number": "string"
  }
  ```

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation with transcript

## Design System

### Colors
- **Primary Blues**: `#3b82f6`, `#2563eb`
- **Secondary Purples**: `#9333ea`, `#7c3aed`
- **Glassmorphism**: `backdrop-filter: blur(20px)` with `bg-white/5`

### Typography
- **Font Family**: Inter (loaded from Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Spacing
- **Grid System**: 8px base unit
- **Container**: `max-w-7xl` with responsive padding

### Animations
- **Duration**: 300ms for micro-interactions, 500ms for page transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Spring**: Framer Motion spring animations for elastic feel

## Component Guidelines

### Button Variants
- `primary` - Gradient blue to purple, used for main actions
- `secondary` - Glassmorphic with border, used for secondary actions
- `ghost` - Transparent, used for tertiary actions

### Badge Variants
- `success` - Emerald for active/completed states
- `warning` - Amber for in-progress/pending states
- `danger` - Red for error/failed states
- `info` - Blue for informational states

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## License

ISC

## Author

Built with Claude Code
