const mongoose = require('mongoose');


async function connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connecté');

    } catch (error) {
      console.error('Erreur de connexion à MongoDB :', error);
    }
  }
  

async function disconnectFromDatabase() {
    try {
      await mongoose.disconnect();
      console.log('Déconnexion de MongoDB réussie');
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion de MongoDB :', error);
    }
  }

const userSchema = new mongoose.Schema({
  User: String,
  Password: String,
  Email: String
});

const User = mongoose.model('user', userSchema, 'users');

module.exports = { connectToDatabase, disconnectFromDatabase, User };
