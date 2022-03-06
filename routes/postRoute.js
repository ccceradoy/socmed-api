const route = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/postController');

// Create new post
route.post('/', auth, controller.createPost);

// Edit a post based on the postID params
route.put('/:postID', auth, controller.updatePost);

// Delete a post based on the postID params
route.delete('/:postID', auth, controller.deletePost);

// Display all posts of the user and the user's friends
route.get('/', auth, controller.viewPosts);

module.exports = route;