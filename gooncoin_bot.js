// Imports
const Discord = require('discord.js');
const mongoose = require('mongoose');
var Web3 = require('web3');
const abi = require('./abi.json');

// Variables/constants
const address = '0xFA6adB9276bD42653f4A3AE445BDdB8Dc50Af18a';
const bot_address = '0x59fd0131484833435939CFA678A70A018eD03a23';
const client = new Discord.Client();
mongoose.connect('mongodb://localhost/GoonCoin', {useNewUrlParser: true, useUnifiedTopology: true}); // Connect DB
const db = mongoose.connection;
var web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
var contract = new web3.eth.Contract(abi, address);




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
client.on('message', async (msg) => {
  if (msg.content === '*balance') {

    // Find sender address
    var _user = await User.findOne({ Discord_ID: msg.author.id});
    console.log(`Address: ${_user.Address}`);

    // Retrieve balance of address
    var _balanceOfWallet;
      try {
        _balanceOfWallet = await contract.methods.balanceOf(_user.Address).call()
        _balanceOfWallet = Web3.utils.fromWei(_balanceOfWallet ,'ether')
      } catch (err) {
        console.log(err)
        _balanceOfWallet = 0
      }
        
    // fetch 
    msg.reply(`your balance is ${_balanceOfWallet} GOON`);
  }
});

// Find user address
async function findUserAddress(id) {
  var foundUser = await User.findOne({ Discord_ID: id})
  console.log(foundUser)
  return foundUser.address
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