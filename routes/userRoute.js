const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Register
router.post('/', controller.register);

// Login
router.post('/login', controller.login);

// Display (Name, email, posts, friends)
router.get('/me', auth, controller.displayProfile);

// Add friend (can only be added once)
router.post('/add/:friendID', auth, controller.addFriend);

// Accept friend, edit the DB for both the users
router.put('/accept/:friendID', auth, controller.acceptFriend);

// Delete a friend from the friends list
router.delete('/delete/:friendID', auth, controller.deleteFriend);

module.exports = router;