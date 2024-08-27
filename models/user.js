const { createHmac, randomBytes } = require("node:crypto");
const { name } = require("ejs");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true, // Corrected 'require' to 'required'
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/public/Blogging website.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next(); // Ensure early return if the password is not modified

  const salt = randomBytes(16).toString("hex"); // Added 'hex' encoding to generate the salt
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.salt = salt; // Save the salt
  user.password = hashedPassword; // Save the hashed password

  next(); // Continue with the save operation
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User Not found!!!");

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");

 const token = createTokenForUser(user);
 return token;
  
});

const User = model("user", userSchema); // Ensure correct usage of 'userSchema'
module.exports = User;
