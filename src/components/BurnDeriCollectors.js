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

const COLLECTORS = [
    {
        version: 'V3',
        network: 'Bsc',
        bTokenSymbol: 'BUSD',
        aSigner: '0x6E72d826fDA933FAb33C10D2E91716216Ddeb13B',
        aCollector: '0xF5A17a5035F54EE3442F6911bDf031a61cf0094C',
        aBToken: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        aBurningDestination: '0x2e225Dacc4c2b843BB8a6b2215b9008f922D06bd'
    }
]

const BurnDeriCollectorsRow = ({version, network, bTokenSymbol, aSigner, aBToken, aCollector, aBurningDestination}) => {
    const [state, setState] = useState({bTokenAmount: '', minDeriAmount: ''})

    const update = useCallback(async () => {
        const bToken = new ethers.Contract(aBToken, ABI_ERC20, PROVIDERS[network])
        const balance = nn(await bToken.balanceOf(aCollector))
        setState({...state, balance})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onBuyAndBurn = async () => {
        const collector = new ethers.Contract(aCollector, ABI_COLLECTOR_V3, provider.getSigner())
        const tx = await executeTx(collector.buyAndBurnDeri, [bb(state.bTokenAmount), bb(state.minDeriAmount)])
        if (tx) await update()
    }

    return (
        <tr>
            <td>{version}</td>
            <td>{network}</td>
            <td><Address address={aCollector}/></td>
            <td>{bTokenSymbol}</td>
            <td>{state.balance}</td>
            <td><Address address={aBurningDestination}/></td>
            <td><Address address={aSigner}/></td>
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
                    <Form.Control value={state.minDeriAmount} onChange={(e) => {setState({...state, minDeriAmount: e.target.value})}}/>
                    <div className="input-group-append">
                        <span className="input-group-text">DERI</span>
                    </div>
                </div>
            </td>
            <td><CButton network={network} text='Burn' onClick={onBuyAndBurn}/></td>
        </tr>
    )
}

export const BurnDeriCollectors = () => {
    return (
        <table>
        <tbody>
            <tr>
                <td>Version</td>
                <td>Network</td>
                <td>Collector</td>
                <td>BToken</td>
                <td>BTokenBalance</td>
                <td>BurningDestination</td>
                <td>Signer</td>
                <td>BTokenAmount</td>
                <td>MinDeriAmount</td>
                <td></td>
            </tr>
            {COLLECTORS.map((row, idx) => (
                <BurnDeriCollectorsRow key={idx} {...row}/>
            ))}
        </tbody>
        </table>
    )
}
