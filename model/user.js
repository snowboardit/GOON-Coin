// Import required packages
const mongoose = require("mongoose");

// Define DB schemas
const userSchema = new mongoose.Schema({
  Discord_ID: String,
  Name: String,
  Username: String,
  Discriminator: String,
  Avatar: String,
  Address: String,
  Key: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
