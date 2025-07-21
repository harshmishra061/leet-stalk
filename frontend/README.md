# LeetStalk Frontend

A modern React frontend for tracking LeetCode profiles and managing friends.

## Features

- **User Authentication**: Login and registration with JWT
- **Dashboard**: Overview of LeetCode progress and friend activity
- **LeetCode Integration**: View and refresh LeetCode profile data
- **Friend System**: Add friends and manage connections
- **Leaderboards**: Compare progress with friends
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with Tailwind CSS and Lucide icons

## Tech Stack

- **React 19** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for forms
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Vite** for build tooling

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd leet-stalk/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication forms
│   ├── dashboard/       # Dashboard components
│   └── layout/          # Navigation and layout
├── contexts/            # React contexts
│   └── AuthContext.jsx # Authentication state
├── hooks/               # Custom hooks
│   └── useAuth.js       # Authentication hook
├── utils/               # Utility functions
│   └── api.js           # API service layer
├── App.jsx              # Main app component
├── main.jsx             # App entry point
└── index.css            # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes

### Dashboard
- Personal LeetCode statistics
- Quick action cards
- Friends leaderboard preview
- Profile setup guidance

### Navigation
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- Active page highlighting
- User profile display

### Forms
- Real-time validation
- Password visibility toggle
- Loading states
- Error handling

## API Integration

The frontend communicates with the backend API through:

- **Authentication endpoints**: Login, register, logout
- **User management**: Profile updates, search
- **LeetCode data**: Fetch and display statistics
- **Friends system**: Manage connections

## Styling

Built with Tailwind CSS featuring:

- Custom color palette
- Responsive design patterns
- Component-based utility classes
- Dark mode ready (future feature)
- Smooth animations and transitions

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000/api)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
