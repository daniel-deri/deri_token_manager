const { NodeInterface__factory } = require("@arbitrum/sdk/dist/lib/abi/factories/NodeInterface__factory");
const { NODE_INTERFACE_ADDRESS } = require("@arbitrum/sdk/dist/lib/dataEntities/constants");
const { utils, providers } = require("ethers");
// Assuming baseL2Provider is already defined and connected

const baseL2Provider = new providers.StaticJsonRpcProvider("https://arbitrum.llamarpc.com");

// Instantiation of the NodeInterface object
const nodeInterface = NodeInterface__factory.connect(
    NODE_INTERFACE_ADDRESS,
    baseL2Provider
);

// Define destinationAddress and txData
const destinationAddress = "0x1234567890123456789012345678901234567890"; // Replace with a valid address
const txData = "0x8f111f3c00000000000000000000000000000000000000000000000000000000000001c800000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f710000000000000000000000000000000000000000000000000000000000000f730000000000000000000000000000000000000000000000000000000000000200001bc9037066801d1a46180760b3230b256a8baa084f620e58134bf497fb8387ec6f6217cd2b8092e00447238fc84484f8522f8d51781440807ec2fd89488188104b1ca6754c3c55424c3c83547301229ae9a9f8b0dcfead10ec362eb9a369b773221f330a2ba414d13201d1db0071900648803580ac010c701f2018021c90045058013021c1d5cec5ab1a80ff3fe42fcd52fe3218aa860370e164c518ecbe2f17d7e7b07ef8352f4af01b031377dbc78a50d8a9dc8f2ced4f36152155c86f85676aaaef984936ca0a540dbbaf152687defe6f11d9d678891dc356684401b03e648ac32e7c153f79562dd21167f058f4e1b4c3760fb640ce770a7ce12f17eb3b58873a625c4bef12472a396780fb41cefc2d85fd153c3ee7ed9e49dc385dddd172ab78353cc121338d5063c9f64e2c8df46202736d31f365f7f6b3466ab7521b5e002f6da232c84ed04ffa6be2d176f6286573f705b6d9a77201e168f2b8ebdcf56fdf8aebcccaa5f75f2d3e72d6599d1660008a3197ce1114f3059c87e470994ef7905293faaff57d4ee48198e97b8b012049a591d85be67c6c5fd9f70657252e9f247dc5e8647bc521f3d7bbf424df15dd8b34c72a944d359dee67626ab6dfeb92db4969b2e3fd53fbb13c6326c844860d8b59473b8bf37d747cdb338a544344c6a65fa45a8dda5baaf17ac896f6c6f7edf385d6abc3d15b97235b5324ff1b"; // Assuming no data for simplicity

async function getGasEstimates() {
    // Getting the gas prices from ArbGasInfo.getPricesInWei()
    // const gasComponents = await arbGasInfo.callStatic.getPricesInWei();

    // And the estimations from NodeInterface.GasEstimateComponents()
    const gasEstimateComponents = await nodeInterface.callStatic.gasEstimateComponents(
        destinationAddress,
        false,
        txData,
        {
            blockTag: 'latest',
        }
    );

    // console.log("Gas Components:", gasComponents);
    // console.log("Gas Estimate Components:", gasEstimateComponents);

    console.log("Gas Estimate Components:");
    console.log("----------------------------");
    console.log(`Full gas estimate: ${gasEstimateComponents.gasEstimate.toString()}`);
    console.log(`Gas estimate for L1: ${gasEstimateComponents.gasEstimateForL1.toString()}`);
    console.log(`Base fee: ${gasEstimateComponents.baseFee.toString()}`);
    console.log(`L1 base fee estimate: ${gasEstimateComponents.l1BaseFeeEstimate.toString()}`);

    // Getting useful values for calculating the formula
    const l1GasEstimated = gasEstimateComponents.gasEstimateForL1;
    const l2GasUsed = gasEstimateComponents.gasEstimate.sub(gasEstimateComponents.gasEstimateForL1);
    const l2EstimatedPrice = gasEstimateComponents.baseFee;
    const l1EstimatedPrice = gasEstimateComponents.l1BaseFeeEstimate.mul(16);

    const l1Cost = l1GasEstimated.mul(l2EstimatedPrice);
    // NOTE: This is similar to 140 + utils.hexDataLength(txData);
    const l1Size = l1Cost.div(l1EstimatedPrice);

    // Setting the basic variables of the formula
    const P = l2EstimatedPrice;
    const L2G = l2GasUsed;
    const L1P = l1EstimatedPrice;
    const L1S = l1Size;
    const L1C = L1P.mul(L1S);

    console.log(`l1Cost ${l1Cost}`)
    console.log(`l1Size ${l1Size}`)

    console.log(`P ${P} L2G ${L2G} L1P ${L1P} L1S ${L1S} L1C ${L1C}`)

}

// Call the function to test
getGasEstimates().catch(console.error);
