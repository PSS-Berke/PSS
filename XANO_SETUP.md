# Xano Setup Guide

This template has been converted to use Xano as the backend instead of Stack Auth. Follow these steps to set up your Xano backend.

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Xano Configuration
NEXT_PUBLIC_XANO_BASE_URL=https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf
NEXT_PUBLIC_XANO_API_KEY=your_api_key_here
```

## 2. Required Xano Tables

You'll need to create the following tables in your Xano workspace:

### Users Table
- `id` (int, primary key)
- `email` (text, unique)
- `password` (text, hashed)
- `first_name` (text, optional)
- `last_name` (text, optional)
- `avatar_url` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Teams Table
- `id` (int, primary key)
- `name` (text)
- `slug` (text, unique)
- `description` (text, optional)
- `owner_id` (int, foreign key to users)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Team Members Table
- `id` (int, primary key)
- `team_id` (int, foreign key to teams)
- `user_id` (int, foreign key to users)
- `role` (text: 'owner', 'admin', 'member')
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 3. Required API Endpoints

Create the following API endpoints in your Xano workspace:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### User Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/update` - Update user profile

### Team Endpoints
- `GET /teams` - Get user's teams
- `GET /teams/:id` - Get specific team
- `POST /teams/create` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `GET /teams/:id/members` - Get team members
- `POST /teams/:id/join` - Join team
- `POST /teams/:id/leave` - Leave team

## 4. API Response Format

All API responses should follow this format:

```json
{
  "data": { /* actual data */ },
  "success": true,
  "message": "Optional message"
}
```

For authentication endpoints, return:

```json
{
  "user": { /* user object */ },
  "token": "jwt_token_here",
  "refresh_token": "refresh_token_here" // optional
}
```

## 5. Security Considerations

- Hash passwords using bcrypt or similar
- Use JWT tokens for authentication
- Implement proper CORS settings
- Add rate limiting to auth endpoints
- Validate all input data

## 6. Testing

After setting up your Xano backend:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try signing up and creating teams
4. Test team switching functionality

## 7. Customization

The Xano service layer is located in `lib/xano/` and can be easily customized:

- `types.ts` - TypeScript interfaces
- `config.ts` - API configuration
- `api.ts` - API client functions
- `auth-context.tsx` - React context and hooks

You can modify these files to match your specific Xano setup and requirements.
