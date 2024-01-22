import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import {PROVIDERS, provider, bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'

const ABI_ERC20 = [
    'function balanceOf(address account) view returns (uint256)'
]
const ABI_COLLECTOR_V3 = [
    'function buyAndBurnDeri(uint256 bTokenAmount, uint256 minDeriAmount)'
]

const ABI_BSC_COLLECTOR = [
    'function swapBnbBusdToArbitrumUsdce(uint256 amountLD, uint256 minAmountLD)',
    'function admin() view returns (address)'
]

const COLLECTORS = [
    {
        version: 'V3',
        network: 'Bsc',
        bTokenSymbol: 'BUSD',
        aCollector: '0xF5A17a5035F54EE3442F6911bDf031a61cf0094C',
        aBToken: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        aBurningDestination: '0xa544e477866a29685E4155E27f9bD886C63880a0'
    }
]

const BurnDeriCollectorsRow = ({version, network, bTokenSymbol, aBToken, aCollector, aBurningDestination}) => {
    const [state, setState] = useState({bTokenAmount: '', minDeriAmount: ''})

    const update = useCallback(async () => {
        const bToken = new ethers.Contract(aBToken, ABI_ERC20, PROVIDERS[network])
        const collector = new ethers.Contract(aCollector, ABI_BSC_COLLECTOR, PROVIDERS[network])
        const balance = nn(await bToken.balanceOf(aCollector))
        const admin = await collector.admin()
        setState({...state, balance, admin})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onBuyAndBurn = async () => {
        const collector = new ethers.Contract(aCollector, ABI_BSC_COLLECTOR, provider.getSigner())
        const tx = await executeTx(collector.swapBnbBusdToArbitrumUsdce, [bb(state.bTokenAmount), bb(state.minbTokenAmount)])
        if (tx) await update()
    }

    return (
        <tr>
            <td>{version}</td>
            <td>{network}</td>
            <td><Address address={aCollector}/></td>
            <td>{bTokenSymbol}</td>
            <td>{state.balance}</td>
            <td>Arbitrum</td>
            <td><Address address={aBurningDestination}/></td>
            <td><Address address={state.admin}/></td>
            <td>
                <div className="input-group">
                    <Form.Control value={state.bTokenAmount} onChange={(e) => {setState({...state, bTokenAmount: e.target.value})}}/>
                    <div className="input-group-append">
                        <span className="input-group-text">{bTokenSymbol}</span>
                    </div>
                </div>
            </td>
            <td>
                <div className="input-group">
                    <Form.Control value={state.minbTokenAmount} onChange={(e) => { setState({ ...state, minbTokenAmount: e.target.value})}}/>
                    <div className="input-group-append">
                        <span className="input-group-text">USDC</span>
                    </div>
                </div>
            </td>
            <td><CButton network={network} text='Bridge' onClick={onBuyAndBurn}/></td>
        </tr>
    )
}

export const BurnDeriCollectors = () => {
    return (
        <div>
            <div> BSC Collector: [TODO]change arbitrum destination address to 0x9518dC115Bf7AbD278434bf1b55B6EB9C2ba7D61 </div>
        <table>
        <tbody>
            <tr>
                <td>Version</td>
                <td>Network</td>
                <td>Collector</td>
                <td>BToken</td>
                <td>BTokenBalance</td>
                <td>DestinationNetwork</td>
                <td>DestinationAddress</td>
                <td>Signer</td>
                <td>Amount</td>
                <td>MinAmount</td>
                <td></td>
            </tr>
            {COLLECTORS.map((row, idx) => (
                <BurnDeriCollectorsRow key={idx} {...row}/>
            ))}
        </tbody>
        </table>
        </div>
    )
}
