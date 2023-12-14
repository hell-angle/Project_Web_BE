const Users = require("../../model/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const loginAuth = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (user.isAdmin) {
      const passwordCheck = await bcrypt.compare(password, user.password);

      if (passwordCheck) {
        const token = createToken(user._id);
        return res.json({
          adminToken: token,
        });
      } else {
        return res.status(400).json({
          message: "Wrong Password",
        });
      }
    } else {
      // Regular user authentication
      const passwordCheck = await bcrypt.compare(password, user.password);

      if (passwordCheck) {
        const token = createToken(user._id);
        return res.json({
          userToken: token,
        });
      } else {
        return res.status(400).json({
          message: "Wrong Password",
        });
      }
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = loginAuth;
