import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json()); // Parse body from JSON payload
app.use(cookieParser()); // Parse cookies as object from header

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
