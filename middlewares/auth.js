const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


// Used anywhere where a restriction is needed. I.E. CRUD posts
async function auth(req, res, next) {
  // req.cookies is parsed by the middleware cookie-parser
  // Contains the token sent by the server upon login
  const token = req.cookies['access-token'];

  // Not logged in
  if (!token) res.json({ message: 'Login first' });

  try {
    // Returns the decoded token. 
    // This is an object that contains the { id: user._id }
    const validToken = jwt.verify(token, process.env.SECRET);

    if (validToken) {
      // Make a new atrribute in the req object. 
      // Assign it as a reference to a user in the DB with the id in the token
      req.user = await User.findById(validToken.id);
      next();
    }
  } catch(err) {
    res.json({ message: 'User not authorized' });
  }
}

module.exports = auth;