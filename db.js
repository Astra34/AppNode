const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


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
  User: {type: String, required: true, unique: true},

  Password: {type: String, required: true},

  Email: {type: String, required: true, unique: true, lowercase: true},

  AuthTokens: [{
    authToken : {
      type: String,
      required: true
    }
  }]
});


userSchema.methods.CreateToken = async function() {
  const authToken = jwt.sign({ _id: this._id.toString()}, process.env.SECRET)
  this.AuthTokens.push({ authToken });
  await this.save();
  return authToken
}

const User = mongoose.model('user', userSchema, 'users');

module.exports = { connectToDatabase, disconnectFromDatabase, User };
