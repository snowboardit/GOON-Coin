// Imports
const config = require('./config.json');
var FormData = require('form-data');
var fetch = require('node-fetch');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Web3 = require('web3');
const mongoose = require('mongoose');


// Variables
var app = express();
var web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545'); // Web3.givenProvider || binance smart chain testnet url
mongoose.connect('mongodb://localhost/GoonCoin', {useNewUrlParser: true, useUnifiedTopology: true}); // Connect DB
const abi = require('./abi.json')
const address = '0xFA6adB9276bD42653f4A3AE445BDdB8Dc50Af18a'
const bot_address = '0x59fd0131484833435939CFA678A70A018eD03a23'
var wallet = web3.eth.accounts.wallet.create();
var contract = new web3.eth.Contract(abi, address);

// Load wallet with bot account at index 0
wallet.add('0x6e2677c0453e9eb9bde57420dba54fa8228b220bb74a3fb3b386b3cd8cbb37ef')
// TODO: LOAD OTHER ACCOUNTS INTO LOCAL WALLET FROM DB FOR EACH USER ACCOUNT

// DB Setup
const db = mongoose.connection;
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares...
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')(config.session))

//*************//
//   ROUTES    //
//*************//

// GET: Index
app.get('/', async (req, res) => {
    
    // Check for auth token:
    // if no token send to login page, otherwise continue
    console.log("token: ",req.session.bearer_token);
    if(!req.session.bearer_token)
        return res.redirect('/login') // Redirect to login page

    // Get discord data
    const data = await fetch(`https://discord.com/api/users/@me`, {headers: { Authorization: `Bearer ${req.session.bearer_token}` } }); // Fetching user data
    const json = await data.json();
    console.log('json: ',json)
	
    // Check for new user in DB
    // if id is new, render the new wallet page
    // if id isn't new, render the home page
    try {
      _found_user = await User.exists({ Discord_ID: json.id })
      console.log("FOUND USER: ",_found_user)
      if (_found_user) { 
				// -- USER IN DB, GET BALANCE, RENDER HOME --
        const _user = await User.findOne({ Discord_ID: json.id });
        console.log('ADDRESS: ',_user.Address)
        var _balanceOfWallet;
        try {
          _balanceOfWallet = await contract.methods.balanceOf(_user.Address).call()
          _balance = _balanceOfWallet
        } catch (err) {
          console.log(err)
          _balanceOfWallet = 0
        }
        // IF existing user, render the home page
        res.render('index', {
          'json': json,
          'balanceOfWallet': _balanceOfWallet
        });	
  
      } else { 
				// -- USER NOT IN DB, LOG USER IN DB, RENDER NEW WALLET --
        console.log('user not in DB')

        // Create new account - public/private key pair
        var new_account = web3.eth.accounts.create();
        console.log("new account", new_account)

				// load account into wallet
				wallet.add(new_account);
				console.log('new account added: ', new_account)
				
				// Give new account 100? GOON from dev wallet
        var gas_est;
        var receipt = await contract.methods.transfer('0x1b76e0568DF572b74530b8805C2033c301e91F45', '100000000000000000000')
            .send({from: '0x59fd0131484833435939CFA678A70A018eD03a23', gas: 1000000 }); 
        console.log('receipt!: ', receipt);

				// try {
        //   const gas_est = await contract.methods.transfer(new_account.address, '100000000000000000000').estimateGas()
				// 	contract.methods.transfer(new_account.address, '100000000000000000000').send( {from: bot_address, gas: gas_est})
        //     .on('receipt', function(receipt) {
        //       console.log('receipt!: ', receipt)
        //     })
        
				// } catch (err) {
				// 	console.log('transaction err: ', err)
				// }
					// from: wallet[0],
					// to: '0x59fd0131484833435939CFA678A70A018eD03a23',
					// value: '1000000000000000',
					// gas: 30000


        // Prep to save info to DB
        const new_user = new User({
          Discord_ID: json.id,
          Username: json.username,
          Discriminator: json.discriminator,
          Avatar: json.avatar,
					Address: new_account.address,
					Key: new_account.privateKey
        })

        // Save new user to DB
        new_user.save(function (err) {
          if (err) return console.error(err)
          else console.log('Saved new user to DB')
        });

        // Render new wallet page
        res.render('new_wallet', {'json': json})
      }
    } catch (err) {
      console.log(err);
    }

    if (!json.username) { // This can happen if the Bearer token has expired or user has not given permission "indentity"
      return res.redirect('/login') // Redirect to login page
    }
    
    
})

// GET: Callback
app.get('/login/callback', async (req, res) => {
    console.log('Callback')
    const accessCode = req.query.code;
    if (!accessCode) // If something went wrong and access code wasn't given
        return res.send('No access code specified');

    // Creating form to make request
    const data = new FormData();
    data.append('client_id', config.oauth2.client_id);
    data.append('client_secret', config.oauth2.secret);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', config.oauth2.redirect_uri);
    data.append('scope', 'identify');
    data.append('code', accessCode);

    // Making request to oauth2/token to get the Bearer token
    const json = await (await fetch('https://discord.com/api/oauth2/token', {method: 'POST', body: data})).json();
    req.session.bearer_token = json.access_token;

    res.redirect('/'); // Redirecting to main page
});

// GET: Login
app.get('/login', (req, res) => {
    // Redirecting to login url
    console.log('Login\n',config.oauth2.client_id, config.oauth2.secret, config.oauth2.redirect_uri, config.oauth2.scopes.join(" "))
    res.redirect(`https://discord.com/api/oauth2/authorize` +
                 `?client_id=${config.oauth2.client_id}` +
                 `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
                 `&response_type=code&scope=${encodeURIComponent(config.oauth2.scopes.join(" "))}`)
})

// ERROR HANDLING
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Server 
app.listen(3000, () => {
  console.log('Express started on port 3000');
});
