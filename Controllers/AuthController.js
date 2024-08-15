import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

// Register User
export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    password: hashedPass,
    firstname,
    lastname,
  });

  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

//Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (user) {
      // validate the password now with the password stored in the database
      const validity = await bcrypt.compare(password, user.password);
      if (validity) res.status(200).json(user);
      else res.status(400).json("Wrong Username or Password");
    } else {
      res.status(400).json("Wrong Username or Password");
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
