const { utils } = require("web3");
const { User } = require("./model/user.js");

/** Convert simple amount to 18 decimal string
 * @param {String} amount
 * @returns {String} amount in ether
 */
exports.amountToEther = (amount) => {
  return utils.toWei(amount, "ether");
};

/**
 * @param {String} userId Discord ID of user
 * @returns {Promise<Boolean>} True/false if user exists in database
 */
exports.discordIdExists = async (userId) => {
  return await User.exists({ Discord_ID: userId });
};

/**
 * @param {String} userId Discord ID of user
 * @returns {Promise<String>} User Balance in Ether
 */
exports.getBalanceOfAddress = async (userId) => {
  const user = await User.findOne({ Discord_ID: userId });

  try {
    balanceOfWallet = await contract.methods.balanceOf(user.Address).call();
    return utils.fromWei(balanceOfWallet, "ether");
  } catch (err) {
    console.log(err);
    return 0;
  }
};
