const { utils } = require("web3");

/** 
 * @description Convert simple amount to 18 decimal string
 * @param {String} amount
 * @returns {String} amount in ether
 */
exports.toWeiFromEther = (amountInEther) => {
  return utils.toWei(amountInEther, "ether");
};

/** 
 * @description Convert simple amount to 18 decimal string
 * @param {String} amount
 * @returns {String} amount in ether
 */
exports.toEtherFromWei = (amountInWei) => {
  return utils.fromWei(amountInWei, "ether");
};