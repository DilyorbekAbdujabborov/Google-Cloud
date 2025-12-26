require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
);

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

// Static UI
app.get('/file', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Default route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Redirecting...</title>
        <script>
          setTimeout(() => {
            window.location.href = '/auth/google';
          }, 5000);
        </script>
      </head>
      <body>
        Google Drive CRUD service working. You will be redirected in 5 seconds...
      </body>
    </html>
  `);
});

// Run server
app.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);
