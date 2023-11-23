import { useState, useEffect, useCallback, useRef } from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import {PROVIDERS, provider,  bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'
import { useContext } from 'react';
import { SuggestedSendAmountContext } from './Context';


const POOLS = [
    {
        network: 'Arbitrum',
        poolName: 'Main',
        gatewayAddress: '0xCcAcF05a3cb1770f9A5B5A8AA219af1aC0C5E26b',
        rewardVaultAddress: '0x0a79e067cec0Da906D01463e9cC6D0f96E5Cfc08',
        deriAddress: '0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12'
    },
    {
        network: 'Zksync',
        poolName: 'Main',
        gatewayAddress: '0x34FD72D2053339EA4EB1a8836CF50Ebce91962D0',
        rewardVaultAddress: '0x2E46b7e73fdb603A821a3F8a0eCaB077ebF81014',
        deriAddress: '0x140D5bc5b62d6cB492B1A475127F50d531023803'
    },
    {
        network: 'Linea',
        poolName: 'Main',
        gatewayAddress: '0xe840Bb03fE58540841e6eBee94264d5317B88866',
        rewardVaultAddress: '0x1640beAd2163Cf8D7cc52662768992A1fEBDbF2F',
        deriAddress: '0x4aCde18aCDE7F195E6Fb928E15Dc8D83D67c1f3A'
    },
]

const REWARD_VAULT_ABI = [
    'function rewardPerSeconds(address _gateway) view returns (uint256 rewardPerSecond)',
    'function setRewardPerSecond(address _gateway, uint256 newRewardPerSecond)',
    'function totalUnclaimed(address _gateway) view returns (uint256 totalAmount)'
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

const ENGINEADDRESS = "0x0D769EA82904e5758dCdc03e049179E0926456CD" 


const SetRewardVaultSpeed2Row = ({ network, poolName, gatewayAddress, rewardVaultAddress, deriAddress, combine}) => {
    // console.log(network, 'SetRewardVaultSpeed2Row', poolName, gatewayAddress, rewardVaultAddress, deriAddress)
    const [state, setState] = useState({curRewardPerSecond: '', newRewardPerSecond: '', totalUnclaimed: '', gatewayLiquidity: '', totalLiquidity: ''})
    // const { setAmount ,suggestedSendAmount} = useContext(SuggestedSendAmountContext);
    const [suggestedAmount, setSuggestedAmount] = useState();

    const update = useCallback(async () => {
        const vault = new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, PROVIDERS[network])
        const curRewardPerSecond = nn(await vault.rewardPerSeconds(gatewayAddress))
        console.log(network, 'curRewardPerSecond', curRewardPerSecond)
        const totalUnclaimed = Math.ceil(nn(await vault.totalUnclaimed(gatewayAddress)))
        console.log(network, 'totalUnclaimed', totalUnclaimed)
        
        const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, PROVIDERS[network])
        const gatewayLiquidity = nn((await gateway.getGatewayState()).totalLiquidity)
        
        const deri = new ethers.Contract(deriAddress, ERC20_ABI, PROVIDERS[network])
        const vaultBalance = Math.ceil(nn(await deri.balanceOf(rewardVaultAddress)))

        const engine = new ethers.Contract(ENGINEADDRESS, ENGINE_ABI, PROVIDERS['Dchain'])
        const totalLiquidity = nn((await engine.getEngineState()).totalLiquidity)

        const rewardPerWeek = Math.ceil(gatewayLiquidity * curRewardPerSecond * 86400 * 7 / totalLiquidity)
        console.log(Number(totalUnclaimed)+ Number(rewardPerWeek), Number(vaultBalance))
        // const _suggestedSendAmount = Math.max(Number(totalUnclaimed) + Number(rewardPerWeek) - Number(vaultBalance), 0)
        const _suggestedSendAmount = Math.max(Math.ceil(totalUnclaimed - vaultBalance), 0)
        setSuggestedAmount(_suggestedSendAmount)
        combine({[network]: _suggestedSendAmount })
        setState({ ...state, curRewardPerSecond, totalUnclaimed, gatewayLiquidity, vaultBalance, totalLiquidity, rewardPerWeek})
        
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
