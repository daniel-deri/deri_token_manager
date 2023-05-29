import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import {PROVIDERS, provider,  bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'

const POOLS = [
    {
        network: 'Bsc',
        poolName: 'Main',
        poolAddress: '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E',
        rewardVaultAddress: '0x57b2cfAC46F0521957929a70ae6faDCEf2297740',
        signerAddress: '0x6E72d826fDA933FAb33C10D2E91716216Ddeb13B'
    },
    {
        network: 'Bsc',
        poolName: 'Inno',
        poolAddress: '0xD2D950e338478eF7FeB092F840920B3482FcaC40',
        rewardVaultAddress: '0x57b2cfAC46F0521957929a70ae6faDCEf2297740',
        signerAddress: '0x6E72d826fDA933FAb33C10D2E91716216Ddeb13B'
    },
    {
        network: 'Bsc',
        poolName: 'Lite',
        poolAddress: '0x1eF92eDA3CFeefb8Dae0DB4507f860d3b73f29BA',
        rewardVaultAddress: '0x57b2cfAC46F0521957929a70ae6faDCEf2297740',
        signerAddress: '0x6E72d826fDA933FAb33C10D2E91716216Ddeb13B'
    },
    {
        network: 'Arbitrum',
        poolName: 'Main',
        poolAddress: '0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8',
        rewardVaultAddress: '0xae77aA30a077bEa1E62616E70c60C56C04DFF4E7',
        signerAddress: '0xD7790449c2c649E84d9e2814494d60256F842Deb'
    }
]
const REWARD_VAULT_ABI = [
    'function vaultInfo(address _pool) view returns (uint256 rewardPerSecond, uint256 lastRewardTimestamp, uint256 accRewardPerB0Liquidity, uint256 accRewardPerBXLiquidity, uint256 totalLiquidityB0)',
    'function setRewardPerSecond(address _pool, uint256 _rewardPerSecond)'
]

const SetRewardVaultSpeed2Row = ({network, poolName, poolAddress, rewardVaultAddress, signerAddress}) => {
    const [state, setState] = useState({curRewardPerSecond: '', newRewardPerSecond: ''})

    const update = useCallback(async () => {
        const vault = new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, PROVIDERS[network])
        const curRewardPerSecond = nn((await vault.vaultInfo(poolAddress)).rewardPerSecond)
        setState({...state, curRewardPerSecond})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onSet = async () => {
        const vault = new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, provider.getSigner())
        const tx = await executeTx(vault.setRewardPerSecond, [poolAddress, bb(state.newRewardPerSecond)])
        if (tx) await update()
    }

    return (
        <tr>
            <td>{network}</td>
            <td><Address address={rewardVaultAddress}/></td>
            <td>{poolName}</td>
            <td><Address address={poolAddress}/></td>
            <td>{state.curRewardPerSecond}</td>
            <td>{Math.ceil(state.curRewardPerSecond * 86400 * 7 / 1000) * 1000}</td>
            <td><Address address={signerAddress}/></td>
            <td><Form.Control value={state.newRewardPerSecond} onChange={(e) => setState({...state, newRewardPerSecond: e.target.value})}/></td>
            <td><CButton network={network} text='Set' onClick={onSet}/></td>
        </tr>
    )
}

export const SetRewardVaultSpeed2 = () => {
    return (
        <div>
            <h5>Set RewardPerSecond V2</h5>
            <table>
            <tbody>
                <tr>
                    <td>Network</td>
                    <td>RewardVault</td>
                    <td>Pool</td>
                    <td>PoolAddress</td>
                    <td>RewardPerSecond</td>
                    <td>RewardPerWeek</td>
                    <td>Signer</td>
                    <td>NewRewardPerSecond</td>
                    <td></td>
                </tr>
                {POOLS.map((row, idx) => (
                    <SetRewardVaultSpeed2Row key={idx} {...row}/>
                ))}
            </tbody>
            </table>
        </div>
    )
}
