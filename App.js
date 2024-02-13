require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const { connectToDatabase, disconnectFromDatabase, User } = require('./db.js');
const {createUser, loginUser, logout, isLogged, edit} = require('./Auth.js');
const PORT = process.env.PORT || 3000;
connectToDatabase();


const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

store.on('error', function (error) {
  console.error('Erreur de session MongoDB :', error);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOW_URL,
  methods: 'POST',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: false
  }
}));



app.post('/Api/Login', loginUser);
app.post('/Api/CreateUser', createUser);
app.post('/Api/Logout', logout);
app.post('/Api/check-auth', isLogged);
app.post('/Api/edit', edit);
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

app.listen(PORT, () => {
  print(process.env.ALLOW_URL)
  console.log(`Le serveur Express écoute sur le port ${PORT}`);
});
