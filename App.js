require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const { connectToDatabase } = require('./db.js');
const {createUser, loginUser, logout, isLogged, edit} = require('./Auth.js');
const PORT = process.env.PORT || 3000;
connectToDatabase();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOW_URL,
  methods: 'POST',
  credentials: true
}));


app.post('/Api/Login', loginUser);
app.post('/Api/CreateUser', createUser);
app.post('/Api/Logout', logout);
app.post('/Api/check-auth', isLogged);
app.post('/Api/edit', edit);


app.listen(PORT, () => {
  console.log(process.env.ALLOW_URL)
  console.log(`Le serveur Express écoute sur le port ${PORT}`);
});
