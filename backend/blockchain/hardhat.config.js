require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const networks = {
  localhost: {
    url: "http://127.0.0.1:8545"
  }
};

if (process.env.SEPOLIA_RPC_URL && process.env.PRIVATE_KEY) {
  networks.sepolia = {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    gas: 2000000,
    gasPrice: 1000000000 // 1 gwei
  };
}

module.exports = {
  solidity: "0.8.20",
  networks
};
