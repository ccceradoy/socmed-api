const Post = require('../models/postModel');
const User = require('../models/userModel');

async function createPost(req, res) {
  try {
    const { content } = req.body;
    const newPost = new Post({ content, user: req.user });
    await newPost.save();
    const user = await User.findById(req.user);

    res.json({ message: `${user.name} has new post` });
  } catch(err) {
    console.log(err);
  }
}

async function updatePost(req, res) {
  try {
    const { postID } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postID);

    // Authorization
    // Check first if user id is the same before editing
    // Convert first to string so it can be compared with the same type
    if (req.user._id.toString() !== post.user._id.toString()) {
      res.json({ message: 'You cant edit this post' });
    } else {
      await post.updateOne({ content });
      res.json({ message: `Post ${post._id} has been updated` });
    }

  } catch(err) {
    console.log(err);
  }
}

async function deletePost(req, res) {
  try {
    const { postID } = req.params;
    const post = await Post.findById(postID);

    // Authorization
    // Check first if user id is the same before editing
    if (req.user._id.toString() !== post.user._id.toString()) {
      res.json({ message: 'You cant delete this post' });
    } else {
      await Post.deleteOne(post);
      res.json({ message: `Post  ${post._id} has been deleted` });
    }

  } catch(err) {
    console.log(err);
  }
}

// View all your posts and your friend's posts
async function viewPosts(req, res) {
  try {
    const user = req.user;
    
    // All the users post
    // Use spread operator because Post.find returns an array
    const allVisiblePosts = [...(await Post.find({ user: user._id })), ];

    // Traverse thru the user's friends list
    for (let friend of user.friends) {
      // Find all posts in the DB where the user's id is the same as the friend's id
      // This returns an array
      const post = await Post.find({ user: friend });
      // Spread the post array then push all its elements in the allVisiblePosts array
      allVisiblePosts.push(...post);
    }

    res.json({ allVisiblePosts });
  } catch(err) {
    console.log(err);
  }
} 

module.exports = { createPost, updatePost, deletePost, viewPosts };