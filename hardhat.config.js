// https://hardhat.org/config/
// https://hardhat.org/guides/create-task.html
// https://docs.polygon.technology/docs/develop/getting-started

require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("solidity-coverage");

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: "0.8.4",
};
