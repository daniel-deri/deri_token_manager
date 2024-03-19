import { useState, useEffect, useCallback, useRef } from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import { PROVIDERS, CHAINID_NETWORK, provider,  bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'
import { useContext } from 'react';
import { SuggestedSendAmountContext } from './Context';


const POOLS = [
    {
        network: 'Arbitrum',
        poolName: 'Main',
        gatewayAddress: '0x7C4a640461427C310a710D367C2Ba8C535A7Ef81',
        rewardVaultAddress: '0x261d0219c017fFc3D4C48B6d8773D95F592ac27b',
        deriAddress: '0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
    {
        network: 'Zksync',
        poolName: 'Main',
        gatewayAddress: '0x34FD72D2053339EA4EB1a8836CF50Ebce91962D0',
        rewardVaultAddress: '0x2E46b7e73fdb603A821a3F8a0eCaB077ebF81014',
        deriAddress: '0x140D5bc5b62d6cB492B1A475127F50d531023803',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
    {
        network: 'Linea',
        poolName: 'Main',
        gatewayAddress: '0xe840Bb03fE58540841e6eBee94264d5317B88866',
        rewardVaultAddress: '0x1640beAd2163Cf8D7cc52662768992A1fEBDbF2F',
        deriAddress: '0x4aCde18aCDE7F195E6Fb928E15Dc8D83D67c1f3A',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        ltokenAddress: '0xC79102C36BBbA246B8Bb6aE81B50ba8544e45174',
    },
    {
        network: 'Scroll',
        poolName: 'Main',
        gatewayAddress: '0x7B56Af65Da221A40B48bEDcCb67410D6C0bE771D',
        rewardVaultAddress: '0x2C139f40E03b585Be0A9503Ad32e0b80745211b9',
        deriAddress: '0xa3c5293892f112C834ADa46219973C5e4Ac23bA0',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
    {
        network: 'PolygonzkEVM',
        poolName: 'Main',
        gatewayAddress: '0xC7E484c20D5dc5d33299AfB430BFb5d17085eE98',
        rewardVaultAddress: '0x7B8bCf00DEf58b50620b2C253f3A97EE51F44683',
        deriAddress: '0x360CE6EeCDF98e3851531051907e6a809BF6e236',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
    {
        network: 'Manta',
        poolName: 'Main',
        gatewayAddress: '0xc8fa78f6B68ab22239222b4249b1fF968D154aE9',
        rewardVaultAddress: '0x2ae67d0107d75B2a38890d83822d7673213aD276',
        deriAddress: '0xd212377f71F15A1b962c9265Dc44FBcEAf0Bc46D',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
    {
        network: 'Bsc',
        poolName: 'Main',
        gatewayAddress: '0x2c2E1eE20C633EAe18239c0BF59cEf1FC44939aC',
        rewardVaultAddress: '0x6395e2125728613c814d198e3D6f79eE699f1953',
        deriAddress: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
        multicallAddress: '0x',
        ltokenAddress: '0x',
    },
]


const GATEWAY_ABI = [
    'function getGatewayState() view returns (int256 cumulativePnlOnGateway, uint256 liquidityTime, uint256 totalLiquidity, int256  cumulativeTimePerLiquidity, uint256 gatewayRequestId)',
]

const ENGINE_ABI = [
    "function getEngineState() view returns (address symbolManager, address oracle, address iChainEventSigner, int256  initialMarginMultiplier, int256  protocolFeeCollectRatio, int256 totalLiquidity, int256 lpsPnl, int256 cumulativePnlPerLiquidity, int256 protocolFee)",
]

const ERC20_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount)'
]


const MULTICALL_ABI = [
    'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
    'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
    'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
    'function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
    'function getBasefee() view returns (uint256 basefee)',
    'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
    'function getBlockNumber() view returns (uint256 blockNumber)',
    'function getChainId() view returns (uint256 chainid)',
    'function getCurrentBlockCoinbase() view returns (address coinbase)',
    'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
    'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
    'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
    'function getEthBalance(address addr) view returns (uint256 balance)',
    'function getLastBlockHash() view returns (bytes32 blockHash)',
    'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
    'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
];

const REWARD_VAULT_ABI = [
    'function rewardPerSeconds(address _gateway) view returns (uint256 rewardPerSecond)',
    'function setRewardPerSecond(address _gateway, uint256 newRewardPerSecond)',
    'function totalUnclaimed(address _gateway) view returns (uint256 totalAmount)',
    'function getUserInfo(address _gateway,uint256 lTokenId) external view returns(tuple(uint256, uint256)[])',
    'function pending(address _gateway, uint256 lTokenId) view returns (uint256 rewardAmount)',
]

const PTOKEN_ABI = [
    'function totalMinted() view returns (uint160)',
    'function BASE_TOKENID() view returns (uint256)'

]

const ENGINEADDRESS = "0x0D769EA82904e5758dCdc03e049179E0926456CD" 

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
// async function pendingAmount(network, ptoken_address, multicall_address, reward_address, gateway_address) {
//     const ptoken = new ethers.Contract(ptoken_address, PTOKEN_ABI, PROVIDERS[network]);
//     const totalMinted = await ptoken.totalMinted();
//     const baseTokenId = await ptoken.BASE_TOKENID();
//     console.log("linea", totalMinted, baseTokenId)
//     const tokenIdArray = [];
//     for (let i = 0; i < totalMinted; i++) {
//         tokenIdArray.push(baseTokenId.add(i));
//     }
//     const tokenIdChunks = chunkArray(tokenIdArray, 20);
//     const multicall = new ethers.Contract(multicall_address, MULTICALL_ABI, PROVIDERS[network]);
//     const rewardInterface = new ethers.utils.Interface(REWARD_VAULT_ABI);

//     // Process each chunk in parallel
//     const chunkPromises = tokenIdChunks.map(async (chunk) => {
//         const pendingCalls = chunk.map((user) => ({
//             target: reward_address,
//             allowFailure: true,
//             callData: rewardInterface.encodeFunctionData('pending', [gateway_address, user]),
//         }));

//         const pendingResult = await multicall.callStatic.aggregate3(pendingCalls);
//         return pendingResult.map(({ success, returnData }, i) => {
//             if (!success) throw new Error(`Failed to get resolver for ${chunk[i]}`);
//             return rewardInterface.decodeFunctionResult('pending', returnData)[0];
//         });
//     });

//     // Wait for all chunk promises to resolve
//     const allChunkResults = await Promise.all(chunkPromises);

//     // Sum the pending amounts from all chunks
//     let totalPendingAmount = ethers.BigNumber.from(0);
//     allChunkResults.forEach(chunkPendingAmount => {
//         const sumOfChunk = chunkPendingAmount.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));
//         totalPendingAmount = totalPendingAmount.add(sumOfChunk);
//     });

//     console.log("totalPendingAmount", nn(totalPendingAmount));
//     return totalPendingAmount;
// }

async function pendingAmount(network, ptoken_address, multicall_address, reward_address, gateway_address) {
    const ptoken = new ethers.Contract(ptoken_address, PTOKEN_ABI, PROVIDERS[network]);
    const totalMinted = await ptoken.totalMinted();
    const baseTokenId = await ptoken.BASE_TOKENID();
    console.log("line", totalMinted, baseTokenId);
    const tokenIdArray = [];
    for (let i = 0; i < totalMinted; i++) {
        tokenIdArray.push(baseTokenId.add(i));
    }
    const tokenIdChunks = chunkArray(tokenIdArray, 100); // 将tokenId分成每组20个的小数组
    const multicall = new ethers.Contract(multicall_address, MULTICALL_ABI, PROVIDERS[network]);
    const rewardInterface = new ethers.utils.Interface(REWARD_VAULT_ABI);

    let totalPendingAmount = ethers.BigNumber.from(0);

    // 分批处理每个chunk，每批处理200个tokenId
    for (let i = 0; i < tokenIdChunks.length; i += 10) { // 每次处理10个chunks，即200个tokenId
        const currentChunks = tokenIdChunks.slice(i, i + 10);
        const chunkPromises = currentChunks.map(async (chunk) => {
            const pendingCalls = chunk.map((tokenId) => ({
                target: reward_address,
                allowFailure: true,
                callData: rewardInterface.encodeFunctionData('pending', [gateway_address, tokenId]),
            }));

            const pendingResult = await multicall.callStatic.aggregate3(pendingCalls);
            return pendingResult.map(({ success, returnData }, index) => {
                if (!success) throw new Error(`Failed to get resolver for ${chunk[index]}`);
                return rewardInterface.decodeFunctionResult('pending', returnData)[0];
            });
        });

        // 等待当前批次的所有Promise完成
        const allChunkResults = await Promise.all(chunkPromises);
        allChunkResults.forEach(chunkPendingAmount => {
            const sumOfChunk = chunkPendingAmount.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));
            totalPendingAmount = totalPendingAmount.add(sumOfChunk);
        });

        // 如果不是最后一批chunk，等待1秒
        if (i + 10 < tokenIdChunks.length) {
            console.log("linea chunk waiting", i)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log("totalPendingAmount", totalPendingAmount.toString());
    return totalPendingAmount;
}

// async function pendingAmount(network, ptoken_address, multicall_address, reward_address, gateway_address) {

//     const ptoken = new ethers.Contract(ptoken_address, PTOKEN_ABI, PROVIDERS[network]);
//     const totalMinted = await ptoken.totalMinted();
//     const baseTokenId = await ptoken.BASE_TOKENID();
//     const tokenIdArray = [];
//     for (let i = 0; i < totalMinted; i++) {
//         tokenIdArray.push(baseTokenId.add(i));
//     }
//     const tokenIdChunks = chunkArray(tokenIdArray, 200);
//     const multicall = new ethers.Contract(multicall_address, MULTICALL_ABI, PROVIDERS[network]);
//     const rewardInterface = new ethers.utils.Interface(REWARD_VAULT_ABI);
//     let totalPendingAmount = ethers.BigNumber.from(0);
//     for (const chunk of tokenIdChunks) {
//         const pendingCalls = chunk.map((user) => ({
//             target: reward_address,
//             allowFailure: true,
//             callData: rewardInterface.encodeFunctionData('pending', [gateway_address, user]),
//         }));

//         const pendingResult = await multicall.callStatic.aggregate3(pendingCalls);
//         const chunkPendingAmount = pendingResult.map(({ success, returnData }, i) => {
//             if (!success) throw new Error(`Failed to get resolver for ${chunk[i]}`);
//             return rewardInterface.decodeFunctionResult('pending', returnData)[0];
//         });

//         // Sum the pending amounts of the current chunk
//         const sumOfChunk = chunkPendingAmount.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));
//         totalPendingAmount = totalPendingAmount.add(sumOfChunk);
//     }

//     console.log("totalPendingAmount", nn(totalPendingAmount))
//     return totalPendingAmount
// }

async function executeGraphQLQuery(query, variables = {}) {
    const graphqlEndpoint = 'https://v4dh.deri.io/graphql'; // 替换为你的 GraphQL 端点 URL

    try {
        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }

        const jsonResponse = await response.json();
        return jsonResponse; // 包含查询结果的 JSON 对象
    } catch (error) {
        console.error('Error during GraphQL query:', error);
        throw error;
    }
}



const SetRewardVaultSpeed2Row = ({ network, poolName, gatewayAddress, rewardVaultAddress, deriAddress, multicallAddress, ltokenAddress, combine}) => {
    // console.log(network, 'SetRewardVaultSpeed2Row', poolName, gatewayAddress, rewardVaultAddress, deriAddress)
    const [state, setState] = useState({curRewardPerSecond: '', newRewardPerSecond: '', totalUnclaimed: '', gatewayLiquidity: '', totalLiquidity: ''})
    // const { setAmount ,suggestedSendAmount} = useContext(SuggestedSendAmountContext);
    const [suggestedAmount, setSuggestedAmount] = useState();

    const liquidityQuery = `
        query MyQuery {
            iChainLiquidity {
                chainId
                liquidity
            }
        }
    `;
    
    // const iChainLiquidity = response.data.iChainLiquidity;

    const update = useCallback(async () => {
        try {
            const response = await executeGraphQLQuery(liquidityQuery);
            const iChainLiquidity = response.data.iChainLiquidity;

            // 找到与当前网络匹配的链的流动性
            const networkLiquidity = iChainLiquidity.find(chain => CHAINID_NETWORK[chain.chainId] === network);
            const vault = new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, PROVIDERS[network])
            const curRewardPerSecond = nn(await vault.rewardPerSeconds(gatewayAddress))
            console.log(network, 'curRewardPerSecond', curRewardPerSecond)
            let totalUnclaimed;
            if (network == 'Linea') {
                totalUnclaimed = Math.ceil(nn(await pendingAmount(network, ltokenAddress, multicallAddress, rewardVaultAddress, gatewayAddress)));
            } else {
                totalUnclaimed = Math.ceil(nn(await vault.totalUnclaimed(gatewayAddress)));
            }
            console.log(network, 'totalUnclaimed', totalUnclaimed);

            const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, PROVIDERS[network])
            const gatewayLiquidity = networkLiquidity.liquidity
            
            const deri = new ethers.Contract(deriAddress, ERC20_ABI, PROVIDERS[network])
            const vaultBalance = Math.ceil(nn(await deri.balanceOf(rewardVaultAddress)))

            const engine = new ethers.Contract(ENGINEADDRESS, ENGINE_ABI, PROVIDERS['Dchain'])
            const totalLiquidity = nn((await engine.getEngineState()).totalLiquidity)

            const rewardPerWeek = Math.ceil(gatewayLiquidity * curRewardPerSecond * 86400 * 7 / totalLiquidity)
            console.log(Number(totalUnclaimed)+ Number(rewardPerWeek), Number(vaultBalance))
            // const _suggestedSendAmount = Math.max(Number(totalUnclaimed) + Number(rewardPerWeek) - Number(vaultBalance), 0)
            const _suggestedSendAmount = Math.max(Math.ceil(totalUnclaimed - vaultBalance + rewardPerWeek), 0)
            setSuggestedAmount(_suggestedSendAmount)
            combine({[network]: _suggestedSendAmount })
            setState({ ...state, curRewardPerSecond, totalUnclaimed, gatewayLiquidity, vaultBalance, totalLiquidity, rewardPerWeek})
        } catch (error) {
            console.error("An error occurred: ", error);
        }
        
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onSet = async () => {
        const vault = new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, provider.getSigner())
        const tx = await executeTx(vault.setRewardPerSecond, [gatewayAddress, bb(state.newRewardPerSecond)])
        if (tx) await update()
    }

    
    
    return (
        <tr>
            <td>{network}</td>
            <td><Address address={rewardVaultAddress}/></td>
            <td>{poolName}</td>
            <td><Address address={gatewayAddress}/></td>
            <td>{state.gatewayLiquidity}</td>
            <td>{state.curRewardPerSecond}</td>
            <td>{state.totalUnclaimed}</td>
            <td>{state.rewardPerWeek}</td>
            {/* <td>{Math.ceil(state.curRewardPerSecond * 86400 * 7 / 1000) * 1000}</td> */}
            <td>{state.vaultBalance}</td>
            <td>{suggestedAmount}</td>
            {/* <td><Form.Control value={state.newRewardPerSecond} onChange={(e) => setState({...state, newRewardPerSecond: e.target.value})}/></td>
            <td><CButton network={network} text='Set' onClick={onSet}/></td> */}
        </tr>
    )
}

export const SetRewardVaultSpeed2 = () => {
    const {setSuggestedSendAmount} = useContext(SuggestedSendAmountContext)
    const suggestedSendAmount = useRef({})


    const combine = useCallback((value) => {
        suggestedSendAmount.current = { ...suggestedSendAmount.current, ...value }
        setSuggestedSendAmount(suggestedSendAmount.current)
    }, [])

    return (
        <div>
            <h5>Set RewardPerSecond V2</h5>
            <table>
            <tbody>
                <tr>
                    <td>Network</td>
                    <td>RewardVault</td>
                    <td>Pool</td>
                    <td>gatewayAddress</td>
                    <td>gateLiquidity</td>
                    <td>RewardPerSecond</td>
                    <td>UnclaimedReward</td>
                    <td>RewardPerWeek(Est.)</td>
                    <td>RewardVaultBalance</td>
                    <td>SuggestedSendAmount</td>
                    <td></td>
                </tr>
                {POOLS.slice(0, POOLS.length).map((row, idx) => (
                    <SetRewardVaultSpeed2Row key={idx} {...row} combine={combine}/>
                ))}
                <tr>
                    <td>Arbitrum</td>
                    <td><Address address='0x175Fe9E3415D91F00E6882bA052e9c3E2c2A355a'/></td>
                    <td>Uniswap LP Staker</td>
                    <td>---</td>
                    <td>---</td>
                    <td>---</td>
                    <td>---</td>
                    <td>20000</td>
                    <td>---</td>
                    <td>20000</td>
                </tr>
            </tbody>
            </table>
        </div>
    )
}
