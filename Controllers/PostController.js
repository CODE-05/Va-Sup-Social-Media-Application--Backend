import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";

// Create new Post
export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    await newPost.save();
    res.status(200).json("Post Created");
  } catch (e) {
    res.status(500).json(e);
  }
};

//Get a Post
export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (e) {
    res.status(500).send(e);
  }
};

//Update a Post
export const updatePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Action Forbidden");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//Delete a Post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await PostModel.findByIdAndDelete(id);
      res.status(200).json("Post Deleted");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

//Like/Dislike a Post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post Liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.statusgt(200).json("Post Unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//Get Timeline Posts
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await PostModel.find({ userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);
    res
      .status(200)
      .json(currentUserPosts.concat(...followingPosts[0].followingPosts))
      .sort((a, b) => {
        // Ensures that latest posts always show up at the top.
        return b.createdAt - a.createdAt;
      });
  } catch (e) {
    res.status(500).send(e);
  }
};
