const { network } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("----------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");
  const fundMe = await deploy("FundMe", {
    from: deployer, //who is deploying it
    args: [ethUsdPriceFeedAddress], // pass arguments to pass parameters to the constructor
    log: true, //custom logging
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`FundMe deployed at ${fundMe.address}`);
  if (
    developmentChains &&
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }

  log("__________________________________________");
};

module.exports.tags = ["all", "fundme"];

// const { network } = require("hardhat");
// const {
//   networkConfig,
//   developmentChains,
// } = require("../helper-hardhat-config");
// const { verify } = require("../utils/verify");
// require("dotenv").config();

// module.exports = async ({ getNamedAccounts, deployments }) => {
//   const { deploy, log } = deployments;
//   const { deployer } = await getNamedAccounts();
//   const chainId = network.config.chainId;

//   let ethUsdPriceFeedAddress;
//   if (chainId == 31337) {
//     const ethUsdAggregator = await deployments.get("MockV3Aggregator");
//     ethUsdPriceFeedAddress = ethUsdAggregator.address;
//   } else {
//     ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
//   }
//   log("----------------------------------------------------");
//   log("Deploying FundMe and waiting for confirmations...");
//   const fundMe = await deploy("FundMe", {
//     from: deployer,
//     args: [ethUsdPriceFeedAddress],
//     log: true,
//     // we need to wait if on a live network so we can verify properly
//     waitConfirmations: network.config.blockConfirmations || 1,
//   });
//   log(`FundMe deployed at ${fundMe.address}`);

// if (
//   !developmentChains.includes(network.name) &&
//   process.env.ETHERSCAN_API_KEY
// ) {
//   await verify(fundMe.address, [ethUsdPriceFeedAddress]);
// }
//   if (
//     developmentChains &&
//     !developmentChains.includes(network.name) &&
//     process.env.ETHERSCAN_API_KEY
//   ) {
//     await verify(fundMe.address, [ethUsdPriceFeedAddress]);
//   }
// };

// module.exports.tags = ["all", "fundme"];
