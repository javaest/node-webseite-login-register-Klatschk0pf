const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

let users = [
  { id: 1, name: 'Alice', password: 'test' },
  { id: 2, name: 'admin', password: 'password' }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mein-geheimer-schluessel',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Registrierung
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.some(user => user.name === username)) {
    return res.status(400).send('Benutzername existiert bereits');
  }
  users.push({ id: users.length + 1, name: username, password });
  res.redirect('/login');
});

// Login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.name === username && u.password === password);
  if (user) {
    req.session.user = username;
    return res.redirect('/content');
  }
  return res.status(401).send('Benutzername oder Passwort falsch');
});

// Benutzername abrufen
app.get('/get-username', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.status(401).json({ error: 'Nicht angemeldet' });
  }
});

// Content-Seite
app.get('/content', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Zugriff verweigert. Bitte anmelden.');
  }
  res.sendFile(path.join(__dirname, 'views', 'content.html'));
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Fehler beim Abmelden');
    }
    res.redirect('/');
  });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
