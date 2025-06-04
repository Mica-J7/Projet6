const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };
    next();
  } catch(error) {
      res.status(401).json({ error });
  }
};

// middleware qui permet d'extraire les infos contenues dans le token pour vérifier si 
// le token est valide et les transmettre aux autres middleware ou au gestionnaire de route

// middleware qui va authentifier nos requetes et transmettres nos infos au middleware suivant, ici le gestionnaire de routes dans books.js
