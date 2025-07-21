# LeetStalk Backend API

A Node.js/Express backend for tracking LeetCode profiles and managing friends.

## Features

- **User Authentication**: JWT-based registration, login, and session management
- **LeetCode Integration**: Fetch and store LeetCode profile data using GraphQL API
- **Friend System**: Send/accept friend requests, manage friend connections
- **Profile Comparison**: Compare LeetCode stats between friends
- **Leaderboards**: View rankings among friends
- **Privacy Controls**: Configure profile visibility settings

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **axios** for LeetCode API calls
- **express-validator** for input validation

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user info
- `POST /logout` - User logout
- `POST /change-password` - Change password

### Users (`/api/users`)
- `GET /search` - Search users
- `GET /:userId` - Get user profile
- `PUT /profile` - Update profile
- `PUT /settings` - Update settings
- `GET /leaderboard` - Get friends leaderboard

### LeetCode (`/api/leetcode`)
- `POST /fetch/:username` - Fetch LeetCode data
- `GET /profile/:username?` - Get LeetCode profile
- `GET /compare/:username1/:username2` - Compare profiles
- `DELETE /profile` - Delete LeetCode profile
- `GET /stats/global` - Global statistics

### Friends (`/api/friends`)
- `POST /request/:userId` - Send friend request
- `POST /accept/:userId` - Accept friend request
- `POST /reject/:userId` - Reject friend request
- `DELETE /:userId` - Remove friend
- `GET /` - Get friends list
- `GET /requests` - Get friend requests
- `DELETE /request/:userId` - Cancel friend request

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd leet-stalk/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/leetstalk
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

### Testing the API

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "LeetStalk API is running!",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "leetcodeUsername": "john_leetcode"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Fetch LeetCode profile (requires auth token)
```bash
curl -X POST http://localhost:5000/api/leetcode/fetch/john_leetcode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Models

### User Schema
- Basic profile information
- Authentication credentials
- Friend connections
- Privacy settings

### LeetCode Profile Schema
- Problem solving statistics
- Contest performance data
- Recent submissions
- Badges and achievements
- Streak information

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 