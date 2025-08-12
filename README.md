# XX-Commerce

A minimalistic, real-time e-commerce web application built with React, TypeScript, and Node.js.

## Features

- 🛍️ **Product Browsing**: Browse and search products with real-time filtering
- 🛒 **Real-time Cart**: Live cart updates with WebSocket integration
- 🔐 **Authentication**: JWT-based auth with email/password and OAuth
- 📱 **Mobile-First**: Responsive design optimized for all devices
- ⚡ **Fast Performance**: Optimized for sub-1.5s load times
- 🆓 **Free APIs**: Uses DummyJSON and Unsplash for data and images

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management

### Backend
- Node.js with Express
- TypeScript
- SQLite database
- WebSocket for real-time features
- JWT authentication

### APIs
- DummyJSON for product data
- Unsplash for product images

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Project Structure

```
XX-Commerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand store
│   │   └── types/         # TypeScript types
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   └── routes/        # API routes
└── shared/                # Shared types and utilities
```

## Environment Variables

Create `.env` files in both `client/` and `server/` directories:

### Server (.env)
```
PORT=3001
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build frontend for production
- `npm run start` - Start production server
- `npm run install-all` - Install all dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 