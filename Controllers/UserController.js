import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

//Get user from database
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

//Update a user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(user);
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("Access Denied!");
  }
};

//Delete a User
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  console.log(currentUserId);
  if (id === currentUserId || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json({
        message: "User Deleted Successfully",
      });
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status().json("Access Denied");
  }
};

//Follow a user
export const followUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;
  if (currentUserId === id) {
    // No user can follow themselves
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        // checking if the current user has already followed this user or not
        await followUser.updateOne({ $push: { followers: currentUserId } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User Followed!");
      } else {
        res.status(403).json("User is already followed by you");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }
};

//Unfollow a User
export const unFollowUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;
  if (currentUserId === id) {
    // No user can follow themselves
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        // checking if the current user has already followed this user or not
        await followUser.updateOne({ $pull: { followers: currentUserId } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User unfollowed!");
      } else {
        res.status(403).json("User is not followed by you");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }
};
