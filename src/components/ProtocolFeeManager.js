import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import {PROVIDERS, provider, bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'
import { L2TransactionReceipt, L2ToL1MessageStatus } from '@arbitrum/sdk'

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

const ABI_ARBITRUM_PROTOCOL_FEE_MANAGER = [
    'function buyDeriForBurn(address asset, uint256 amount, uint256 minDeriAmount)',
    'function burn()',
    'function admin() view returns (address)'
]

const ABI_ZKSYNC_PROTOCOL_FEE_MANAGER = [
    'function bridgeToArbitrum(uint256 amount)',
    'function arbitrumProtocolFeeManager() view returns (address)',
    'function admin() view returns (address)'
]

const ABI_PROTOCOL_FEE_MANAGER = [
    'function arbitrumProtocolFeeManager() view returns (address)',
    'function admin() view returns (address)'
]

const ARBITRUM_COLLECTORS = [
    {
        version: 'V4',
        network: 'Arbitrum',
        bTokenSymbol: 'USDC',
        aCollector: '0x9518dC115Bf7AbD278434bf1b55B6EB9C2ba7D61',
        aBToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B',
        asset: 'USDC'
    },
    {
        version: 'V4',
        network: 'Arbitrum',
        bTokenSymbol: 'USDC.E',
        aCollector: '0x9518dC115Bf7AbD278434bf1b55B6EB9C2ba7D61',
        aBToken: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B',
        asset: 'USDC.E'

    }

]

const COLLECTORS = [
    {
        version: 'V4',
        network: 'Zksync',
        bTokenSymbol: 'USDC',
        aCollector: '0xDECA7b795ae7f7c3Cd41e3bC790949e3a53ED308',
        aBToken: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    },
    {
        version: 'V4',
        network: 'Linea',
        bTokenSymbol: 'USDC',
        aCollector: '0xB22C5A9e69B3e46978cecaA70c54f0063B90D2f6',
        aBToken: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    },
    {
        version: 'V4',
        network: 'Scroll',
        bTokenSymbol: 'USDC',
        aCollector: '0x5Fe2C482D03c1ECfAd01446817a154BFBCC56C33',
        aBToken: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    },
    {
        version: 'V4',
        network: 'PolygonzkEVM',
        bTokenSymbol: 'USDC',
        aCollector: '0x48F37Dc441f6571B926ECBdABF56Eb8bAe5E3330',
        aBToken: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    },
    {
        version: 'V4',
        network: 'Manta',
        bTokenSymbol: 'USDC',
        aCollector: '0xcBCA586bf9706706398164bb5EB8E48f220Fe408',
        aBToken: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    },
    {
        version: 'V4',
        network: 'Bsc',
        bTokenSymbol: 'USDC',
        aCollector: '0x8bc90ab99e0c5E7434047B6A3766C781F212796E',
        aBToken: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        operator: '0xc58a5266aFd35bCf0c5AEeFDe99853D1E76e811B'
    }

    
]

const DERI_ADDRESS = "0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12"

const ArbitrumProtocolFeeManagerRow = ({ version, network, bTokenSymbol, aCollector, aBToken, asset, operator}) => {
    const [state, setState] = useState({ selectedToken: '', bTokenAmount: '', minDeriAmount: ''})

    const update = useCallback(async () => {
        const bToken = new ethers.Contract(aBToken, ABI_ERC20, PROVIDERS[network])
        const collector = new ethers.Contract(aCollector, ABI_ARBITRUM_PROTOCOL_FEE_MANAGER, PROVIDERS[network])
        const balance = nn(await bToken.balanceOf(aCollector), 6)
        const admin = await collector.admin()

        const deri = new ethers.Contract(DERI_ADDRESS, ABI_ERC20, PROVIDERS[network])
        const deri_balance = nn(await deri.balanceOf(aCollector))
        setState({ ...state, balance, admin, deri_balance})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onBuyForBurn = async () => {
        const collector = new ethers.Contract(aCollector, ABI_ARBITRUM_PROTOCOL_FEE_MANAGER, provider.getSigner())
        const tx = await executeTx(collector.buyDeriForBurn, [aBToken, bb(state.bTokenAmount, 6), bb(state.minDeriAmount)])
        if (tx) await update()
    }

    const onBurn = async () => {
        const collector = new ethers.Contract(aCollector, ABI_ARBITRUM_PROTOCOL_FEE_MANAGER, provider.getSigner())
        const tx = await executeTx(collector.burn, [])
        if (tx) await update()
    }

    const onFinalizeBurn = async () => {
        const l1Wallet = provider.getSigner()
        if (l1Wallet.provider.provider.chainId != '0x1') {
            window.confirm('Must switch to Ethereum Mainnet to finalize burn!')
            return
        }
        const l2Provider = PROVIDERS.Arbitrum

        const receipt = await l2Provider.getTransactionReceipt(state.txhash)
        const block = await l2Provider.getBlock(receipt.blockNumber)
        const timeleft = 86400 * 8 - (parseInt(Date.now() / 1000) - block.timestamp)
        if (timeleft > 0) {
            window.confirm(`Please wait another ${parseInt(timeleft / 86400)} days and ${parseInt((timeleft % 86400) / 3600) + 1} hours to execute the message`)
            return
        }

        const l2Receipt = new L2TransactionReceipt(receipt)
        const messages = await l2Receipt.getL2ToL1Messages(l1Wallet, l2Provider)
        const l2ToL1Msg = messages[0]

        if ((await l2ToL1Msg.status(l2Provider)) == L2ToL1MessageStatus.EXECUTED) {
            window.confirm('Message already executed! Nothing else to do here')
            return
        }

        const res = await l2ToL1Msg.execute(l2Provider)
        console.log('Done')
    }

    return (
        <tr>
            <td>{version}</td>
            <td>{network}</td>
            <td><Address address={aCollector}/></td>
            <td>{state.balance}</td>
            <td><Address address={operator} /></td>
            <td> {asset} </td>
            <td>
                <div className="input-group">
                    <Form.Control value={state.bTokenAmount} onChange={(e) => {setState({...state, bTokenAmount: e.target.value})}}/>
                    <div className="input-group-append">
                        <span className="input-group-text">{asset}</span>
                    </div>
                </div>
            </td>
            <td>
                <div className="input-group">
                    <Form.Control value={state.minDeriAmount} onChange={(e) => { setState({ ...state, minDeriAmount: e.target.value})}}/>
                    <div className="input-group-append">
                        <span className="input-group-text">DERI</span>
                    </div>
                </div>
            </td>
            <td><CButton network={network} text='BuyForBurn' onClick={onBuyForBurn}/></td>
            <td>{state.deri_balance}</td>
            <td><CButton network={network} text='Burn' onClick={onBurn} /></td>
            <td><Form.Control value={state.txhash || ''} onChange={(e) => { setState({ ...state, txhash: e.target.value }) }} /></td>
            <td><CButton network='Ethereum' text='FinalizeBurn' onClick={onFinalizeBurn} /></td>
        </tr>
    )
}

export const ArbitrumProtocolFeeManager = () => {
    return (
        <div>
            <div> Arbitrum Protocol Fee Manager </div>
        <table>
        <tbody>
            <tr>
                <td>Version</td>
                <td>Network</td>
                <td>Manager</td>
                <td>USDC Balance</td>
                <td>Operator</td>
                <td>Asset</td>
                <td>Amount</td>
                <td>minDeriAmount</td>
                <td></td>
                <td>Deri Amount</td>
                <td></td>
                <td>Txhash</td>
                <td></td>
            </tr>
            {ARBITRUM_COLLECTORS.map((row, idx) => (
                <ArbitrumProtocolFeeManagerRow key={idx} {...row}/>
            ))}
        </tbody>
        </table>
        </div>
    )
}

const OtherProtocolFeeManagerRow = ({ version, network, bTokenSymbol, aCollector, aBToken, operator }) => {
    const [state, setState] = useState({ bTokenAmount: '', minDeriAmount: '' })

    const update = useCallback(async () => {
        const bToken = new ethers.Contract(aBToken, ABI_ERC20, PROVIDERS[network])
        const collector = new ethers.Contract(aCollector, ABI_ZKSYNC_PROTOCOL_FEE_MANAGER, PROVIDERS[network])
        const balance = nn(await bToken.balanceOf(aCollector), 6)
        const admin = await collector.admin()
        setState({ ...state, balance, admin })
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onBridge = async () => {
        const collector = new ethers.Contract(aCollector, ABI_ZKSYNC_PROTOCOL_FEE_MANAGER, provider.getSigner())
        const tx = await executeTx(collector.bridgeToArbitrum, [bb(state.bTokenAmount, 6)])
        if (tx) await update()
    }

   
    return (
        <tr>
            <td>{version}</td>
            <td>{network}</td>
            <td><Address address={aCollector} /></td>
            <td>{state.balance}</td>
            <td><Address address={operator} /></td>
            <td>
                <div className="input-group">
                    <Form.Control value={state.bTokenAmount} onChange={(e) => { setState({ ...state, bTokenAmount: e.target.value }) }} />
                    <div className="input-group-append">
                        <span className="input-group-text">{bTokenSymbol}</span>
                    </div>
                </div>
            </td>
            {network === 'Zksync' && (
                <td>
                    <CButton network={network} text='BridgeToArbitrum' onClick={onBridge} />
                </td>
            )}
        </tr>
    )
}

export const OtherProtocolFeeManager = () => {
    return (
        <div>
            <div> Other Protocol Fee Manager </div>
            <table>
                <tbody>
                    <tr>
                        <td>Version</td>
                        <td>Network</td>
                        <td>Manager</td>
                        <td>USDC Balance</td>
                        <td>Operator</td>
                        <td>Amount</td>
                        <td></td>
                    </tr>
                    {COLLECTORS.map((row, idx) => (
                        <OtherProtocolFeeManagerRow key={idx} {...row} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}