const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Post = require('../models/postModel');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Check for missing info
    if (!name || !email || !password) res.json({ message: 'Incomplete queries' });

    // Check if already in the DB thru email because an email should be unique
    const validateUser = await User.findOne({ email });
    if (validateUser) res.json({ message: 'User already exists' });

    // Hash the password first
    const hashedPW = await bcrypt.hash(password, 10);
    // Instantiate a new user with the hashed password then save to the DB
    const newUser = new User({ name, email, password: hashedPW });
    await newUser.save();

    // Just a prompt so that the req-res cycle won't end
    res.json({ message: 'Created new user', newUser });
  } catch(err) {
    console.log(err);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Check for existence in the DB
    const user = await User.findOne({ email });
    if (!user) res.json({ message: 'User does not exists' });
  
    // Matching the hashed password
    const validatePW = await bcrypt.compare(password, user.password)
    if (!validatePW) res.json({ message: 'Incorrect password' });
    
    // Generate token. Payload = { id: user._id }
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET);
    // Send a cookie to the client (The cookie is the generated token)
    res.cookie('access-token', accessToken, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
    res.json({ message: `Welcome! ${user.name}`, accessToken });
 
  } catch (err) {
    console.log(err);
  }
}

// Store the user._id as "id" for later use in the auth.js where req.user = User.findById(id);
function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.SECRET);
}


async function displayProfile(req, res) {
  try {
    // Find the user in the DB and all its friends
    const { name, email, friends } = await User.findById(req.user.id);

    // Find all the posts that refers to the user as its 'user'
    const posts = await Post.find({ user: req.user.id });

    res.json({ name, email, posts, friends });

  } catch(err) {
    console.log(err);
  }
}


async function addFriend(req, res) {
  try {
    // Get the friend-user in the DB using the id passed in the URI's parameter
    const { friendID } = req.params;
    const friend = await User.findById(friendID);

    // Get the logged in user that is basically the req.user declared after the authentication
    const you = req.user;

    // Check first if already friends or already added;
    if (you.added.includes(friend._id) || you.friends.includes(friend._id)) {
      res.json({ message: 'Already added/friends' });
    } else {

      // Update the added array for the user
      await you.updateOne({ $push: { added: friend._id } });
      // Update the addedBy array for the friend
      await friend.updateOne({ $push: { addedBy: you._id } });
  
      res.json({ message: `${you.name} added ${friend.name}` });
    }
    
  } catch(err) {
    console.log(err);
  }
}


async function acceptFriend(req, res) {
  try {
    const { friendID } = req.params;
    const friend = await User.findById(friendID);
    const you = req.user;

    // Check first if added
    if (!you.addedBy.includes(friend._id)) {
      res.json({ message: `${friend.name} did not add you!` });
    } else {

      // Update the addedBy and added array by the two entity
      await you.updateOne({ $pull: { addedBy: friend._id } });
      await friend.updateOne({ $pull: { added: you._id } });
    
      // Update the friends array of the two entity
      await you.updateOne({ $push: { friends: friend } });
      await friend.updateOne({ $push: { friends: you } });
  
      res.json({ message: `${you.name} accepted ${friend.name}'s friend request` });
    }
  } catch(err) {
    console.log(err);
  }
}

async function deleteFriend(req, res) {
  try {
    const { friendID } = req.params;
    const friend = await User.findById(friendID);
    const you = req.user;

    // Check if the user is friend with the friend-to-be-deleted
    if (!you.friends.includes(friend._id)) {
      res.json({ message: `${you.name} are not friends with ${friend.name}` });
    } else {

      await you.updateOne({ $pull: { friends: friend._id } });
      await friend.updateOne({ $pull: { friends: you._id } });

      res.json({ message: `${you.name} delete ${friend.name} on its friends list` });
    }
  } catch(err) {
    console.log(err);
  }
}

module.exports = { register, login, displayProfile, addFriend, acceptFriend, deleteFriend };