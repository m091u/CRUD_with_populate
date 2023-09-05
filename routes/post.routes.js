const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

// ****************************************************************************************
// GET route to display the form to create a new post
// ****************************************************************************************

// localhost:3000/post-create
router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) =>
      console.log(`Err while displaying post input page: ${err}`)
    );
});

// ****************************************************************************************
// POST route to submit the form to create a post
// ****************************************************************************************

// <form action="/post-create" method="POST">

router.post("/post-create", (req, res, next) => {
  const { title, content, author } = req.body;

  Post.create({ title, content, author })
    .then((dbPost) => {
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect("/posts"))
    .catch((err) => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

// ****************************************************************************************
// GET route to display all the posts
// ****************************************************************************************

router.get("/posts", (req, res, next) => {
  Post.find()
    .populate("author") // --> we are saying: give me whole user object with this ID (author represents an ID in our case)
    .then((dbPosts) => {
      console.log("Posts from the DB: ", dbPosts);
      res.render("posts/list", { posts: dbPosts });
    })
    .catch((err) => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

// ****************************************************************************************
// GET route for displaying the post details page
// shows how to deep populate (populate the populated field)
// ****************************************************************************************

// router.get("/posts/:postId", (req, res, next) => {
//   const { postId } = req.params;

//   Post.findById(postId)
//     .populate("author")
//     .then((foundPost) => res.render("posts/details", foundPost))
//     .catch((err) => {
//       console.log(`Err while getting a single post from the  DB: ${err}`);
//       next(err);
//     });
// });

router.get('/posts/:postId', (req, res, next) => {
  const { postId } = req.params;
 
  Post.findById(postId)
    .populate('author comments') // <-- the same as .populate('author).populate('comments')
    .populate({
      // we are populating author in the previously populated comments
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User'
      }
    })
    .then(foundPost => res.render('posts/details', foundPost))
    .catch(err => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

module.exports = router;
