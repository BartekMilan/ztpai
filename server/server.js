const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Konfiguracja środowiska - załaduj .env z folderu server
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routerów
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 5000;

// Szczegółowa konfiguracja CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Podstawowa ścieżka API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API działa poprawnie' });
});

// Rejestracja routerów
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Obsługa błędów 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Nie znaleziono endpointu API' });
});

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ztpai-app')
  .then(() => console.log('Połączono z bazą danych MongoDB'))
  .catch(err => console.error('Błąd połączenia z MongoDB:', err));

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer BFF działa na porcie ${PORT}`);
});