//import
//mainfunction
//calling of main function

// function deployFunc(hre) {
//    console.log("Hello world")
// }

// module.exports.default = deployFunc

// hre.getNamedAccounts && hre.deployments
// const {getNamedAccounts, deployments} = hre

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
   const { deploy, log } = deployments
   const { deployer } = await getNamedAccounts()
   const chainId = network.config.chainId

   // if chain id is X use address Y

   // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
   let ethUsdPriceFeedAddress
   if (developmentChains.includes(network.name)) {
      const ethUsdAggregator = await deployments.get("MockV3Aggregator")
      ethUsdPriceFeedAddress = ethUsdAggregator.address
   } else {
      ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
   }

   // if the contract doesn't exist, we deploy a minimal version of it
   // for our local testing

   // what happens when we want to change chains?
   // when going for localhost or hardhat network we want to use mock
   const args = [ethUsdPriceFeedAddress]

   const fundMe = await deploy("FundMe", {
      from: deployer,
      args: args, // put pricefeed address
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
   })

   if (
      !developmentChains.includes(network.name) &&
      process.env.ETHERSCAN_API_KEY
   ) {
      await verify(fundMe.address, args)
   }
   log("---------------------------------------------------------------")
}

module.exports.tags = ["all", "FundMe"]
