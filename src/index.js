const Cryptocurrency = require('./cryptocurrency');
const TokenSwap = require('./tokenSwap');

// Initialize two cryptocurrencies
const ontiquaX = new Cryptocurrency('OntiquaX', 'ONTX', 1000000);
const anotherToken = new Cryptocurrency('AnotherToken', 'ANT', 500000);

// Create wallets
ontiquaX.createWallet('user1');
anotherToken.createWallet('user2');

// Mint initial balances
ontiquaX.mint('user1', 1000);
anotherToken.mint('user2', 500);

// Initialize token swap with a rate of 1 ONTX = 2 ANT
const tokenSwap = new TokenSwap(ontiquaX, anotherToken, 2);

// Perform a token swap
try {
    tokenSwap.swap(ontiquaX, anotherToken, 'user1', 'user2', 100);
    console.log('Swap successful!');
    console.log('User1 ONTX balance:', ontiquaX.getBalance('user1'));
    console.log('User2 ANT balance:', anotherToken.getBalance('user2'));
} catch (error) {
    console.error('Swap failed:', error.message);
}
