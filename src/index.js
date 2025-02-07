import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer } from "https";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User } from "./User.js";
import { readFileSync } from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "SecretPassword@123";

const app = express();
const server = createServer(
  {
    cert: readFileSync("./localhost.pem"),
    key: readFileSync("./localhost-key.pem"),
  },
  app
);

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
    JWT_SECRET,
    { expiresIn: "30s" }
  );

  res.cookie("token", token).send({ message: "Login successful!" });
});

// Implement auth middleware
app.use(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({
      message: "Login required!",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.userId = payload.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send({
        message: "Token expired!",
      });
    } else {
      return res.status(401).send({
        message: "Invalid token!",
      });
    }
  }
});

app.get("/api/me", async (req, res) => {
  const userId = req.userId;

  const currentUser = await User.findOne(
    { _id: userId },
    {
      password: false,
    }
  );

  res.send(currentUser);
});

mongoose
  .connect("mongodb://127.0.0.1:27017/auth-sample?directConnection=true")
  .then(() => {
    console.log("Database connected!");

    server.listen(5000, () => {
      console.log("Server started at 5000!");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to databse", error);
  });
