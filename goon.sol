pragma solidity ^0.8.3;

contract GOONCoin {
    
    mapping(address => uint) public balances;
    uint public totalSupply = 42000 * 10 ** 18;
    string public symbol = "GOON";
    string public name = "GOON Coin";
    uint public decimals = 18;
    
    constructor() {
        balances[msg.sender] = totalSupply;
    }
    
    function balanceOf(address owner) public view returns(uint) {
        return balances[owner];
    }
    
}