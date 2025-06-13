require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/error.middleware');
const passport = require('./utils/passport.config');
const authRoutes = require('./routes/auth.routes');
const petRoutes = require('./routes/pet.routes');
const businessRoutes = require('./routes/business.routes');
const vaccineRoutes = require('./routes/vaccine.routes');
const documentRoutes = require('./routes/document.routes');
const timelineRoutes = require('./routes/timeline.routes');
const teamRoutes = require('./routes/team.routes');
const messageRoutes = require('./routes/message.routes');
const profileRoutes = require('./routes/profile.routes');
const { connectDB } = require('./config/db.config');

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.JWT_PRIVATE_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(rateLimit);

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));