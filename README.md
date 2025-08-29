# Assessment Tool

A modern React-based assessment tool with Supabase PostgreSQL database integration. Create profiles, manage question packets, build quizzes, and track attempts with a beautiful Material-UI interface.

## Features

- **Profile Management**: Create and manage user profiles (Student, CEO, Manager, etc.)
- **Packet Management**: Organize questions into packets with MCQ and True/False support
- **Quiz Builder**: Drag-and-drop interface to build quizzes from packets
- **Excel Integration**: Upload Excel files to bulk import data
- **Quiz Attempts**: Public quiz attempt pages with scoring
- **Database Persistence**: All data stored in Supabase PostgreSQL
- **Modern UI**: Material-UI with light/dark mode support
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, Vite, Material-UI
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks with custom database hook
- **Routing**: React Router v6
- **File Processing**: XLSX library for Excel import/export

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd assessment-tool
npm install
```

### 2. Set Up Supabase

#### Option A: Use Setup Script (Recommended)
```bash
npm run setup
```
Follow the prompts to enter your Supabase project URL and anon key.

#### Option B: Manual Setup
1. Create a `.env` file in the project root
2. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `database_schema.sql`

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to use the application.

## Database Schema

The application uses the following tables:

- **profiles**: User profiles (Student, CEO, etc.)
- **packets**: Question groups
- **questions**: Individual questions with MCQ/True-False support
- **quizzes**: Quiz definitions
- **quiz_packets**: Many-to-many relationship between quizzes and packets
- **quiz_assignments**: Many-to-many relationship between quizzes and profiles
- **quiz_attempts**: Track quiz attempts and scores

## Usage

### Creating Profiles
1. Go to the "Profiles" tab
2. Click "Add Profile"
3. Enter name and type (e.g., "Student", "student")

### Managing Packets
1. Go to the "Packets" tab
2. Create packets and add questions
3. Support for MCQ and True/False questions

### Building Quizzes
1. Go to the "Quiz Builder" tab
2. Select a profile
3. Drag and drop packets to create quizzes
4. Preview and save quizzes

### Excel Import
1. Prepare an Excel file with sheets: Profiles, Packets, Questions, Quizzes
2. Use the "Upload Excel" button in the top bar
3. Data will be automatically imported and quizzes assigned

### Quiz Attempts
1. Assign quizzes to profiles
2. Share the quiz link: `/attempt/{quizId}`
3. Users can attempt quizzes and get scored results

## File Structure

```
src/
├── components/          # React components
│   ├── ProfileManager.jsx
│   ├── PacketManager.jsx
│   ├── QuizBuilder.jsx
│   └── QuizAttempt.jsx
├── hooks/              # Custom React hooks
│   └── useDatabase.js
├── services/           # Database services
│   └── database.js
├── supabase.js         # Supabase client configuration
└── App.jsx             # Main application component
```

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Vercel/Netlify
1. Set environment variables in your deployment platform
2. Build and deploy: `npm run build`

### Docker
```bash
docker build -t assessment-tool .
docker run -p 3000:3000 assessment-tool
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For detailed setup instructions, see `SUPABASE_SETUP.md`.

For issues and questions:
- Check the browser console for errors
- Verify your Supabase configuration
- Ensure the database schema is properly set up
