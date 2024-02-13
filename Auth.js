const validator = require('validator');
const {connectToDatabase, disconnectFromDatabase, User } = require('./db.js');


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
            req.session.user = { id: user._id, email: user.Email, username: user.User };
            return res.status(200).json({ success: true, info: req.session.user });
        }

        return res.status(401).json({ success: false, message: 'Your login credentials are incorrect.' });

    } catch (err) {
        console.error("Error during query execution:", err);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


const isLogged = async (req, res) => {
    try {
        if (req.session.user) {
            return res.status(200).json({ success: true, info: req.session.user });  
        }

        return res.status(511).json({ success: false, message: 'Session does not exist' });

    } catch (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
const logout = async (req, res) => {
    try{
        req.session.destroy(err => {
            if (err) {
                console.error("Erreur lors de la destruction de la session : ", err);
                return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion." });
            }
            return res.status(200).json({ success: true, message: "Déconnexion réussie." });
        });

    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message: err});
    }
}

const edit = async(req, res) => {
    return res.status(200).json({ success: true, message: "ok." });

}

module.exports = {createUser, loginUser, isLogged, logout, edit};