// Imports
const Discord = require("discord.js");
const mongoose = require("mongoose");
var Web3 = require("web3");
const abi = require("./abi.json");

// Variables/constants
const address = "0xFA6adB9276bD42653f4A3AE445BDdB8Dc50Af18a";
const bot_address = "0x59fd0131484833435939CFA678A70A018eD03a23";
const client = new Discord.Client();
mongoose.connect("mongodb://localhost/GoonCoin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // Connect DB
const db = mongoose.connection;
var web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");
var contract = new web3.eth.Contract(abi, address);
var recipient_cache;

// DB Setup
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB Connected!");
});

const userSchema = new mongoose.Schema({
  Discord_ID: String,
  Name: String,
  Username: String,
  Avatar: String,
  Address: String,
  Key: String,
});

const User = mongoose.model("User", userSchema);

// When logged in
client.on("ready", () => {
  // Load accounts into wallet from DB
  console.log(`Logged in as ${client.user.tag}!`);
});

// GET BALANCE
client.on("message", async (msg) => {
  if (msg.content === "*balance") {
    // Let the user know we are working on their request
    msg.channel.send("Fetching your balance... Hold a moment, pleb.");

    // Find sender address
    var _user = await User.findOne({ Discord_ID: msg.author.id });
    console.log(`Address: ${_user.Address}`);

    // Retrieve balance of wallet address
    var _balanceOfWallet;
    try {
      _balanceOfWallet = await contract.methods.balanceOf(_user.Address).call();
      _balanceOfWallet = Web3.utils.fromWei(_balanceOfWallet, "ether");
    } catch (err) {
      console.log(err);
      _balanceOfWallet = 0;
    }

    // Reply to the user with their current balance
    msg.reply(`your balance is ${_balanceOfWallet} GOON`);
  }
});

// LIST RECIPIENTS
client.on("message", async (msg) => {
  if (msg.content === "*list") {
    var _reply_begin = "who would you like to send to?";
    var _reply_end= "**Sending Format:** *send <username> <amount w/out decimals>";
    var _reply_temp = [];
    var _reply_users = "";
    var index = 1;
    var recipients = await User.find({}, "Username");
    console.log(`Recipients len: ${recipients.length}`);

    recipients.forEach(function (r) {
      console.log(`${index}. ${r.Username}`);
      _reply_temp.push(`${index}. ${r.Username}`);
      if (index == recipients.length) {
        // if on the last recipient,
        console.log(`final index: ${index}`);
        _reply_users = _reply_temp.join("\n");
        recipient_cache = _reply_users;
      }
      index++;
    });

    // Reply to the user with a list of current users
    msg.reply(`${_reply_begin}\n\n${_reply_users}\n\n${_reply_end}`);

  }
});

// SEND GOON COIN
// Params:
// <recipient>: String
// <amount>: Int
client.on("message", async (msg) => {
  if (msg.content.startsWith("*send")) {
    // Break message content into an array
    _message_params = msg.content.split(" ");
    console.log(_message_params);

    // Find sender and recipient addresses
    var sending_user = await User.findOne({ Discord_ID: msg.author.id });
    console.log(`Address: ${sending_user.Address}`);

    // Reply to the user
    msg.reply("Pong!");
  }
});

// Log in to Discord
client.login("ODM4OTUwMDYxMjQ5Mzk2NzY3.YJCjIQ.kdn829zRQRpwVvjJT_nbgTWqHkI");
