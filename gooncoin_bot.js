// Imports
const Discord = require('discord.js');
const mongoose = require('mongoose');
var Web3 = require('web3');

// Variables/constants
const client = new Discord.Client();
mongoose.connect('mongodb://localhost/GoonCoin', {useNewUrlParser: true, useUnifiedTopology: true}); // Connect DB
const db = mongoose.connection;
var web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');


// DB Setup
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB Connected!')
});

const userSchema = new mongoose.Schema({
	Discord_ID: String,
	Name: String,
	Username: String,
	Avatar: String,
	Address: String,
	Key: String
});

const User = mongoose.model('User', userSchema);

// When logged in
client.on('ready', () => {
  // Load accounts into wallet from DB
  console.log(`Logged in as ${client.user.tag}!`);
});

// GET BALANCE
client.on('message', msg => {
  if (msg.content === '*balance') {
    // Look up msg author id in DB to find GOON wallet address
    var _user = findUser(msg.author.id);
        
    // fetch 
    msg.reply('user');
  }
});

async function findUser(id) {
  var foundUser = await User.findOne({ Discord_ID: id})
  console.log(foundUser)
  return foundUser
}

// SEND GOON COIN
// Params:
// <recipient>: String
// <amount>: Int
//
// client.on('message', msg => {
//   if (msg.content === '*balance') {
//     // check who sent the request
//     const _author = msg.author
//     console.log("author: ",_author)
//     // fetch 
//     msg.reply('Pong!');
//   }
// });

client.login('ODM4OTUwMDYxMjQ5Mzk2NzY3.YJCjIQ.kdn829zRQRpwVvjJT_nbgTWqHkI');