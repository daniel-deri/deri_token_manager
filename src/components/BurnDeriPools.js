import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {ZERO_ADDRESS, PROVIDERS, provider, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'

const ABI_POOL_V3 = [
    'function protocolFeeCollector() view returns (address)',
    'function protocolFeeAccrued() view returns (int256)',
]
const ABI_POOL = [
    'function collectProtocolFee()',
]

const POOLS = [
    {
        version: 'V3 Main',
        network: 'Bsc',
        bTokenSymbol: 'BUSD',
        aSigner: '0x0000000000000000000000000000000000000000',
        aPool: '0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E',
    },
    {
        version: 'V3 Inno',
        network: 'Bsc',
        bTokenSymbol: 'BUSD',
        aSigner: '0x0000000000000000000000000000000000000000',
        aPool: '0xD2D950e338478eF7FeB092F840920B3482FcaC40',
    },
    {
        version: 'V3 Lite',
        network: 'Bsc',
        bTokenSymbol: 'DERI',
        aSigner: '0x6E72d826fDA933FAb33C10D2E91716216Ddeb13B',
        aPool: '0x1eF92eDA3CFeefb8Dae0DB4507f860d3b73f29BA',
    },
    {
        version: 'V3 Main',
        network: 'Arbitrum',
        bTokenSymbol: 'USDC',
        aSigner: '0x0000000000000000000000000000000000000000',
        aPool: '0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8',
    },
    {
        version: 'V3 Lite',
        network: 'Zksync',
        bTokenSymbol: 'USDC',
        aSigner: '',
        aPool: '0x9F63A5f24625d8be7a34e15477a7d6d66e99582e',
    },
    {
        version: 'V3 Duet',
        network: 'Arbitrum',
        bTokenSymbol: 'USDC',
        aSigner: '0x0000000000000000000000000000000000000000',
        aPool: '0xdE57c591de8B3675C43fB955725b62e742b1c0B4',
    }
]

const BurnDeriPoolsRow = ({version, network, bTokenSymbol, aSigner, aPool}) => {
    const [state, setState] = useState({})

    const getCollectInfo = async () => {
        const pool = new ethers.Contract(aPool, ABI_POOL_V3, PROVIDERS[network])
        const [collector, protocolFeeAccrued] = await Promise.all([
            pool.protocolFeeCollector(),
            pool.protocolFeeAccrued()
        ])
        return [collector, nn(protocolFeeAccrued)]
    }

    const update = useCallback(async () => {
        const [collector, protocolFeeAccrued] = await getCollectInfo()
        setState({...state, collector, protocolFeeAccrued})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onCollect = async () => {
        const pool = new ethers.Contract(aPool, ABI_POOL, provider.getSigner())
        const tx = await executeTx(pool.collectProtocolFee)
        if (tx) await update()
    }

    return (
        <tr>
            <td>{version}</td>
            <td>{network}</td>
            <td><Address address={aPool}/></td>
            <td>{bTokenSymbol}</td>
            <td>{state.protocolFeeAccrued}</td>
            <td><Address address={state.collector}/></td>
            <td><Address address={aSigner}/></td>
            <td><CButton network={network} text='Collect' onClick={onCollect}/></td>
        </tr>
    )
}

export const BurnDeriPools = ({}) => {
    return (
        <table>
        <tbody>
            <tr>
                <td>Version</td>
                <td>Network</td>
                <td>Pool</td>
                <td>BToken</td>
                <td>ProtocolFeeAccrued</td>
                <td>Collector</td>
                <td>Signer</td>
                <td></td>
            </tr>
            {POOLS.map((row, idx) => <BurnDeriPoolsRow key={idx} {...row}/>)}
        </tbody>
        </table>
    )
}
