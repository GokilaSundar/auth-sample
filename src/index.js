import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User } from "./User.js";

const app = express();

app.use(express.json()); // Parse body from JSON payload
app.use(cookieParser()); // Parse cookies as object from header

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      message: "Invalid payload! Missing information!",
    });
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).send({
      message: "Email already exists!",
    });
  }

  await User.create({
    name,
    email,
    password: encryptedPassword,
  });

  return res.send({
    message: "Register successful!",
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: "Invalid payload! Missing information!",
    });
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(400).send({
      message: "Email not found!",
    });
  }

  const isPasswordMatching = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordMatching) {
    return res.status(400).send({
      message: "Password mismatch!",
    });
  }

  const token = await jwt.sign(
    {
      userId: existingUser._id,
    },
    process.env.JWT_SECRET || "SecretPassword@123",
    { expiresIn: "30s" }
  );

  res.cookie("token", token).send({ message: "Login successful!" });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/auth-sample?directConnection=true")
  .then(() => {
    console.log("Database connected!");

    app.listen(5000, () => {
      console.log("Server started at 5000!");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to databse", error);
  });
