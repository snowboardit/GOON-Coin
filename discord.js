const fetch = require("node-fetch");

/**
 * Get Discord User Data using https://discord.com/api/users/@me
 * @param  {String} bearer_token Discord bearer token to obtain user data
 * @returns {Promise<JSON>} Discord user data in JSON
 */
exports.getDiscordUserData = async (bearer_token) => {
  const data = await fetch(`https://discord.com/api/users/@me`, {
    headers: { Authorization: `Bearer ${bearer_token}` },
  }); // Fetching user data
  console.log("json: \n", json);
  return await data.json();
};
