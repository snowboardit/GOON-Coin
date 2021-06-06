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

// 
client.on('message', msg => {
  if (msg.content === '*balance') {
    // check who sent the request

    // fetch 
    msg.reply('Pong!');
  }
});

client.login('ODM4OTUwMDYxMjQ5Mzk2NzY3.YJCjIQ.kdn829zRQRpwVvjJT_nbgTWqHkI');