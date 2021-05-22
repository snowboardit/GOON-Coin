const config = require('./config.json');
var FormData = require('form-data');
var fetch = require('node-fetch');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Web3 = require('web3');

var app = express();
var web3 = new Web3(Web3.givenProvider || 'https://data-seed-prebsc-1-s1.binance.org:8545');

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
    console.log(req.session.bearer_token);
    if(!req.session.bearer_token)
        return res.redirect('/login') // Redirect to login page
    
    const data = await fetch(`https://discord.com/api/users/@me`, {headers: { Authorization: `Bearer ${req.session.bearer_token}` } }); // Fetching user data
    const json = await data.json();
    

    if(!json.username) // This can happen if the Bearer token has expired or user has not given permission "indentity"
        return res.redirect('/login') // Redirect to login page

    res.send(`<h1>Hello, ${json.username}#${json.discriminator}!</h1>` +
              `<img src="https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=512">` + // Show user's nametag and avatar
              `Smart Chain data: `)
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
