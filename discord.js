const FormData = require("form-data");
const fetch = require("node-fetch");
const User = require("./model/user.js");

/**
 * @description Determine if user exists in the DB
 * @param {String} userId Discord ID of user
 * @returns {Promise<Boolean>} True/false if user exists in database
 */
exports.userExists = async (userId) => {
  return await User.exists({ Discord_ID: userId });
};

/**
 * @description Find user in DB by Discord ID and return user data
 * @param {String} userId Discord ID of user
 * @returns {Promise<JSON>} Discord user data in JSON
 */
exports.getUserById = async (userId) => {
  return await User.findOne({ Discord_ID: userId });
};

/**
 * @description Get Discord User Data using https://discord.com/api/users/@me and a bearer token
 * @param  {String} bearer_token Discord bearer token to obtain user data
 * @returns {Promise<JSON>} Discord user data in JSON
 */
exports.getUserDiscordData = async (bearer_token) => {
  const data = await fetch(`https://discord.com/api/users/@me`, {
    headers: { Authorization: `Bearer ${bearer_token}` }
  }); // Fetching user data

  return await data.json();
};

/**
 * @description Gets a list of all registered users
 * @returns {Promise<Array>} Array of all registered users
 */
exports.getAllUsers = async () => {
  return await User.find({});
};

/**
 * @description Gets a Discord bearer token, given an access code, and OAuth2 client ID/secret
 * @param {Object} config
 * @param {String} accessCode
 */
exports.getBearerToken = async (config, accessCode) => {

  // Construct request body
  const data = new FormData();
  data.append("client_id", config.oauth2.client_id);
  data.append("client_secret", config.oauth2.secret);
  data.append("grant_type", "authorization_code");
  data.append("redirect_uri", config.oauth2.redirect_uri);
  data.append("scope", "identify");
  data.append("code", accessCode);

  // Making request to oauth2/token to get the Bearer token
  const json = await (
    await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: data,
    })
  ).json();

  return json;

};