const utils = require("./utils.js")
const { getUserById } = require("./discord.js");

/**
 * @description Get a user's gooncoin balance given their Discord ID
 * @param {String} userId Discord ID of user
 * @returns {String} User Balance in Ether
 */
exports.getBalanceOfAddress = async (userId, contract) => {

    const user = await getUserById(userId);

    try {
        const balanceInWei = await contract.methods.balanceOf(user.Address).call();
        return utils.toEtherFromWei(balanceInWei);
    } catch (err) {
        console.log(err);
        return 0;
    }
};


/**
 * @description Sends gooncoin to specified address from GoonCoin wallet
 * @param  {Address} toAddress Address to send gooncoin to
 * @param  {String} amount Amount of gooncoin to send in ether
 * @param  {Address} fromWallet Address of goon wallet
 */
exports.sendGoonCoin = async (toAddress, amount, fromWallet) => {
    return await contract.methods
        .transfer(toAddress, utils.toWeiFromEther(amount))
        .send({ from: fromWallet, gas: 1000000 });
}

