import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {Form} from 'react-bootstrap'
import {provider, PROVIDERS, bb, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'
import { L2TransactionReceipt, L2ToL1MessageStatus } from '@arbitrum/sdk'

const ERC20_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount)'
]

const BURNER_ABI = [
    'function buyDeriForBurn(uint256 usdcAmount, uint256 minDeriAmount)',
    'function burn()'
]

const ADDRESSES = {
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    deri: '0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12',
    burner: '0xa544e477866a29685E4155E27f9bD886C63880a0',
    signer: '0xD7790449c2c649E84d9e2814494d60256F842Deb',
}

export const BurnDeriArbitrum = () => {
    const [state, setState] = useState({})

    const updateBalances = useCallback(async () => {
        const usdc = new ethers.Contract(ADDRESSES.usdc, ERC20_ABI, PROVIDERS.Arbitrum)
        const deri = new ethers.Contract(ADDRESSES.deri, ERC20_ABI, PROVIDERS.Arbitrum)
        const usdcBalance = nn(await usdc.balanceOf(ADDRESSES.burner), 6)
        const deriBalance = nn(await deri.balanceOf(ADDRESSES.burner))
        setState({...state, usdcBalance, deriBalance})
    }, [])

    useEffect(() => {
        updateBalances()
    }, [updateBalances])

    const onBuyDeriForBurn = async () => {
        const burner = new ethers.Contract(ADDRESSES.burner, BURNER_ABI, provider.getSigner())
        const tx = await executeTx(burner.buyDeriForBurn, [bb(state.usdcAmount || 0, 6), bb(state.deriAmount || 0)])
        if (tx) await updateBalances()
    }

    const onInitializeBurn = async () => {
        const burner = new ethers.Contract(ADDRESSES.burner, BURNER_ABI, provider.getSigner())
        const tx = await executeTx(burner.burn)
        if (tx) await updateBalances()
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
        <div>
            <h5>Arbitrum Deri Burner</h5>
            <table>
            <tbody>
            <tr>
                <td>Burner</td>
                <td>USDC Balance</td>
                <td>DERI Balance</td>
                <td>Signer</td>
            </tr>
            <tr>
                <td><Address address={ADDRESSES.burner}/></td>
                <td>{state.usdcBalance}</td>
                <td>{state.deriBalance}</td>
                <td><Address address={ADDRESSES.signer}/></td>
            </tr>
            <tr>
                <td></td>
                <td>Swap USDC Amount</td>
                <td>Swap DERI Amount (Min)</td>
                <td></td>
                <td></td>
                <td>Initialize TxHash</td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td><Form.Control value={state.usdcAmount || ''} onChange={(e) => {setState({...state, usdcAmount: e.target.value})}}/></td>
                <td><Form.Control value={state.deriAmount || ''} onChange={(e) => {setState({...state, deriAmount: e.target.value})}}/></td>
                <td><CButton network='Arbitrum' text='Burn' onClick={onBuyDeriForBurn}/></td>
                <td><CButton network='Arbitrum' text='BridgeDeritoEthereum' onClick={onInitializeBurn}/></td>
                <td><Form.Control value={state.txhash || ''} onChange={(e) => {setState({...state, txhash: e.target.value})}}/></td>
                <td><CButton network='Ethereum' text='FinalizeBurn' onClick={onFinalizeBurn}/></td>
            </tr>
            </tbody>
            </table>
        </div>
    )
}
