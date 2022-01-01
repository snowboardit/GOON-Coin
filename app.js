// Imports
const config = require("./config.json"); // Set config version: dev/production for proper redirects
const abi = require("./abi.json");
const { amountToEther } = require("./utils.js");
const { getBalanceOfAddress, sendGoonCoin } = require("./gooncoin.js");
const { User } = require("./model/user.js");
const {
  getUserDiscordData,
  userExists,
  getUserById,
  getAllUsers,
  getBearerToken
} = require("./discord.js");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const engine = require("ejs-mate");
const logger = require("morgan");
const helmet = require("helmet");
const Web3 = require("web3");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");

// Variables/constants
var app = express();
var web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545"); // Web3.givenProvider || binance smart chain testnet url
mongoose.connect("mongodb://localhost/GoonCoin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // Connect DB //
const contract_address = "0xFA6adB9276bD42653f4A3AE445BDdB8Dc50Af18a";
const bot_address = "0x59fd0131484833435939CFA678A70A018eD03a23";
var wallet = web3.eth.accounts.wallet.create();
var contract = new web3.eth.Contract(abi, contract_address);
const server_options = {
  key: fs.readFileSync(__dirname + "/certificate/gooncoin.maxlareau.com.key"),
  ca: fs.readFileSync(
    __dirname + "/certificate/gooncoin_maxlareau_com.ca-bundle"
  ),
  cert: fs.readFileSync(__dirname + "/certificate/gooncoin_maxlareau_com.crt"),
};
var server = https.createServer(server_options, app);

// Load wallet with bot account at index 0
wallet.add(
  "0x6e2677c0453e9eb9bde57420dba54fa8228b220bb74a3fb3b386b3cd8cbb37ef"
);

// DB Setup
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB Connected!");
});

// view engine setup
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares...
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": [
        "'self'",
        "gooncoin.maxlareau.com",
        "*.discord.com",
        "cdn.discordapp.com",
        "*.binance.org",
      ],
      "img-src": ["'self'", "*.discord.com", "cdn.discordapp.com"],
    },
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(require("express-session")(config.session));
app.use((req, res, next) => {
  if (req.protocol === "http") {
    res.redirect(301, `https://${req.headers.host}${req.url}`); // Redirect to HTTPS
  }
  next();
});

//*************//
//   ROUTES    //
//*************//

// GET: Landing - Login with Discord or Wallet Address/Private key
app.get("/landing", async (req, res) => {
  res.render("landing");
});


/** 
 * Show the home page/send interface
 * @route GET /
 */
app.get("/", async (req, res) => {
  // Check for auth token:
  // if no token send to login page, otherwise continue
  console.log("token: ", req.session.bearer_token);
  if (!req.session.bearer_token) return res.render("landing"); // Redirect to login page

  // Get discord data
  const json = await getUserDiscordData(req.session.bearer_token);

  // Check for new user in DB
  // if id is new, render the new wallet page
  // if id isn't new, render the home page
  try {
    let found_user = userExists(json.id);

    if (found_user) {

      /**
       * - Get current user info from DB
       * - Get all users from DB
       * - Get current user's balance
       * - Render home page with provided data
       */
      const user = await getUserById(json.id);
      const user_list = await getAllUsers();
      const balanceOfWallet = getBalanceOfAddress(json.id, contract);

      balanceOfWallet.then(balance => {
        res.render("index", {
          json: json,
          balanceOfWallet: balance,
          address: user.Address,
          user_list: user_list,
          contract_address: contract_address,
        })
      }).catch(err => {
        console.log(err);
      });

    } else {
      // -- USER NOT IN DB, LOG USER IN DB, GIVE 100 GOON, RENDER NEW WALLET PAGE --
      console.log("user not in DB");

      // Create new account - public/private key pair
      let new_account = web3.eth.accounts.create();
      console.log("new account", new_account);

      // load account into wallet
      wallet.add(new_account);
      console.log("new account added: ", new_account);

      // Give new account 100 GOON from dev wallet
      // TODO: This may have issues - need to test
      const receipt = await sendGoonCoin(new_account.address, "100", bot_address);

      // var receipt = await contract.methods
      //   .transfer(new_account.address, "100000000000000000000")
      //   .send({ from: bot_address, gas: 1000000 });
      // receipt = JSON.stringify(receipt) // Turn into JSON string

      console.log("receipt!: ", receipt);

      // Prep to save info to DB
      const new_user = new User({
        Discord_ID: json.id,
        Username: json.username,
        Discriminator: json.discriminator,
        Avatar: json.avatar,
        Address: new_account.address,
        Key: new_account.privateKey,
      });

      // Save new user to DB
      new_user.save(function (err) {
        if (err) return console.error(err);
        else console.log("Saved new user to DB");
      });

      // Render new wallet page
      res.render("new_wallet", {
        json: json,
        receipt: receipt,
      });
    }
  } catch (err) {
    console.log(err);
  }

  // Redirect to login page
  // This can happen if the Bearer token has expired or user has not given permission "indentity"
  if (!json.username) {
    return res.redirect("/landing");
  }
});


app.get("/wallet", async (req, res) => {

  // TODO: REFACTOR THIS ROUTE NEXT

  // Get discord data
  const data = await getUserDiscordData(req.session.bearer_token);

  // Check for new user in DB
  // if id is new, render the new wallet page
  // if id isn't new, render the home page
  try {

    let found_user = getUserById(data.id);

    if (found_user) {
      // -- USER IN DB, GET BALANCE, RENDER HOME -- //

      const user = await getUserById(data.id)
      const balanceOfWallet = await getBalanceOfAddress(data.id, contract);

      // IF existing user, render the home page
      res.render("wallet", {
        json: data,
        balanceOfWallet: balanceOfWallet,
        user: user,
        contract_address: contract_address,
      });
    }
  } catch (err) {
    console.log(`Error - /wallet: ${err}`);
    res.redirect("/");
  }
});

// GET: Send
app.post("/send", async (req, res) => {
  // req.body - fetch query parameters from submitted form: address, amount, and sending_user (hidden)
  console.log(req.body);

  // Assign vars
  var _sending_user = new User();
  var _receiving_user = new User();
  var _recipient = req.body.user;
  var _sending_user = req.body.sending_user;
  var _amount = req.body.amount;

  console.log(
    `recip: ${_recipient}\nsending user: ${_sending_user}\namount: ${_amount}`
  );

  // Find sending_user in db from id and fetch address and private key
  try {
    _sending_user = await User.findOne({ Discord_ID: _sending_user });
    _receiving_user = await User.findOne({ Discord_ID: _recipient });
    console.log("FOUND USERS: ", _sending_user, _receiving_user);
  } catch (err) {
    console.log(`ERR finding user: ${err}`);
  }

  // Add account to wallet
  var new_account = await web3.eth.accounts.privateKeyToAccount(
    _sending_user.Key
  );
  wallet.add(new_account);
  console.log(`new account created: ${new_account}`);

  // Trigger transfer function
  var receipt = await contract.methods
    .transfer(_receiving_user.Address, amountToEther(_amount))
    .send({ from: _sending_user.Address, gas: 1000000 });

  console.log(receipt);

  // If successful, redirect to success page with receipt summarized receipt params
  // Otherwise, redirect to home and log error (later: show error banner)
  res.redirect("/");
});

// GET: Callback
app.get("/login/callback", async (req, res) => {

  // Get acces code from query params
  const accessCode = req.query.code;

  // Check if something went wrong and access code wasn't given
  if (!accessCode)
    return res.send("No access code specified");

  const json = await getBearerToken(config, accessCode);
  req.session.bearer_token = json.access_token;

  res.redirect("/"); // Redirecting to main page
});

// GET: Login
app.get("/login", (req, res) => {
  // Redirecting to login url
  console.log(
    "Login\n",
    config.oauth2.client_id,
    config.oauth2.secret,
    config.oauth2.redirect_uri,
    config.oauth2.scopes.join(" ")
  );
  res.redirect(
    `https://discord.com/api/oauth2/authorize` +
    `?client_id=${config.oauth2.client_id}` +
    `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
    `&response_type=code&scope=${encodeURIComponent(
      config.oauth2.scopes.join(" ")
    )}`
  );
});

// GET: Logout
app.get("/logout", (req, res) => {
  // Set token to nothing
  req.session.bearer_token = "";

  // Redirect to login url
  console.log("logged out successfully");
  res.redirect("/");
});

// SERVER
server.listen(process.env.PORT, () => {
  console.log(`Express started on port ${process.env.PORT}`);
});
