import mongoose from "mongoose";

mongoose
  .connect("mongodb://127.0.0.1:27017/auth-sample?directConnection=true")
  .then(() => {
    console.log("Database connected!");
  })
  .catch((error) => {
    console.error("Failed to connect to databse", error);
  });
