require('dotenv').config()
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose")
const cookieparser = require("cookie-parser");
const Blog = require("./models/blog")


app.use(express.json()); // To parse JSON bodies



const userRoutes = require("./Routers/user");
const blogRoutes = require("./Routers/blog");
const {checkForAuthentication} = require("./middlewares/authentication");
const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL).then(()=>{  //mongodb://localhost:27017/Akashbani
    console.log("MONGODB Connected")
})

app.set("view engine", "ejs");
app.set("views", path.resolve("./Views"));

app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies
app.use(cookieparser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.resolve("./public")));


app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home",{
    user : req.user || null,
    blogs: allBlogs,
  });
});
app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.listen(PORT, () => {
  console.log(`APP connected at ${PORT}`);
});
