const validator = require('validator');
const {connectToDatabase, disconnectFromDatabase, User } = require('./db.js');
const jwt = require('jsonwebtoken');



const createUser = async (req, res) => {
    const { email, username, password } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        if ((!email || /\s/.test(email)) ||(!username || /\s/.test(username)) ||(!password || /\s/.test(password))){
            return res.status(400).json({ success: false, message: 'Please fill in all fields correctly.' });

        }else if(!validator.isEmail(email)){
            return res.status(400).json({ success: false , message:'This e-mail does not comply.'});

        }else if(password.length < 8 || /\s/.test(password)){
            return res.status(400).json({ success: false , message:'Password must be at least 8 characters long.'});
        }
        const emailExists = await User.exists({ email: email });
        const usernameExists = await User.exists({ username: username });
        if (emailExists){
            return res.status(409).json({ success: false , message:'This email is already in use.'});

        }else if(usernameExists){
            return res.status(409).json({ success: false , message:'This username is already used.'});
        }
        const newUser = new User({
            User: username,
            Password: password,
            Email: email            
        })
        await newUser.save();
        return res.status(200).json({ success: true, message:'Account created successfullyd.'});

    } catch(err) {
        console.log(err)
        return res.status(500).json({ success: false, message: err});
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ Email: email });

        if (user && password === user.Password) {
            authToken = await user.CreateToken();
            return res.status(200).json({success: true, Token: authToken });
        }

        return res.status(401).json({ success: false, message: 'Your login credentials are incorrect.' });

    } catch (err) {
        console.error("Error during query execution:", err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


const isLogged = async (req, res) => {

    const authToken = req.header('Authorization').replace('Bearer ', '').trim();        
    const decodedToken = jwt.verify(authToken, process.env.SECRET);
    const user = await User.findOne({ _id: decodedToken._id, 'AuthTokens.authToken': authToken})

    if(!user){
        return res.status(401).send('Not Authorization')
    }
    req.authToken = authToken
    req.user = user;
    return res.status(200).json({success: true, info: user});
};
  
const logout = async (req, res) => {
    try {
        const authToken = req.header('Authorization').replace('Bearer ', '').trim();        
        const decodedToken = jwt.verify(authToken, process.env.SECRET);

        // Supprimer le token de la liste des tokens d'authentification de l'utilisateur
        const updateResult = await User.updateOne(
            { _id: decodedToken._id },
            { $pull: { AuthTokens: { authToken: authToken } } }
        );

        if (updateResult.nModified > 0) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: 'Token introuvable ou déjà expiré' });
        }
  
    } catch(err) {
        console.error('Erreur lors de la déconnexion :', err);
        return res.status(500).json({ success: false, message: 'La déconnexion a échoué' });
    }
}



const edit = async(req, res) => {
    return res.status(200).json({ success: true, message: "ok." });

}

module.exports = {createUser, loginUser, isLogged, logout, edit};