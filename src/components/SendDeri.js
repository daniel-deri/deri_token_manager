import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers';
import { Form } from 'react-bootstrap'
import { provider, PROVIDERS, bb, nn, executeTx } from './Chain'
import { Address } from './Address'
import { CButton } from './CButton'
import { getL2Network, Erc20Bridger } from '@arbitrum/sdk'

const L1GatewayRouter_ABI = [
    'function outboundTransfer(address _token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes calldata _data)'
]

const DeriTokenManager_ABI = [
    'function explicitCallOutBoundTransfer(address _token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes calldata _data) payable external'
]

const ERC20_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount)'
]
const WORMHOLE_ABI = [
    'function freeze(uint256 amount, uint256 chainId, address toWormhole)',
    'function claim(uint256 amount, uint256 fromChainId, address fromWormhole, uint256 fromNone, uint8 v, bytes32 r, bytes32 s)'
]
const DATABASE_ABI = [
    'function signature(address account) view returns (tuple(uint256 amount, uint256 fromChainId, address fromWormhole, uint256 toChainId, address toWormhole, uint256 nonce, uint256 timestamp, uint8 v, bytes32 r, bytes32 s, bool valid))'
]


const ADDRESSES = {
    sender: '0x919735d147185788D8A29942baC49A5164A1Bfd6',
    deriEthereum: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
    deriBsc: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
    deriArbitrum: '0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12',
    miningVaultEthereum: '0x7826Ef8Da65494EA21D64D8E6A76AB1BED042FD8',
    miningVaultBsc: '0x6C8d3F31b2ad1AE997Afa20EAd88cb67E93C6E17',
    rewardVaultBscMain: '0x34Aa81135b1673Daaf7A0B71867c0e1b3D40941c',
    rewardVaultBscInno: '0x78b84262e7E4f61e08970E48cf3Ba4b0d8377336',
    rewardVaultArbitrumMain: '0x95dCE894446580Ef72Dd1d3016097cBf0D01ad91',
    rewardVaultV2Bsc: '0x57b2cfAC46F0521957929a70ae6faDCEf2297740',
    rewardVaultV2Arbitrum: '0xae77aA30a077bEa1E62616E70c60C56C04DFF4E7',
    uniswapLpStakerArbitrum: '0x175Fe9E3415D91F00E6882bA052e9c3E2c2A355a',
    wormholeEthereum: '0x6874640cC849153Cb3402D193C33c416972159Ce',
    wormholeBsc: '0x15a5969060228031266c64274a54e02Fbd924AbF',
    database: '0xd8137F05c1F432A80525053c473d0e286c4F46f0',

    deriEthereumTestnet: '0x80b2d47CeD4353A164fCbBc5BAB3b6115dF4BFD7',
    deriArbitrumTestnet: '0xee83355762254e641a0BBF844Cf3d3D65C43cEA4',
    deriTokenManagerTestnet: "0xb64AdbcA08567bE43931B7FF018a117b5d5f0089"
}

const SendDeriRow = ({ network, fromName, fromAddress, fromBalance, toName, toAddress, toBalance, callback }) => {
    const [amount, setAmount] = useState('')

    const onSend = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(ADDRESSES[`deri${network}`], ERC20_ABI, signer)
        const tx = await executeTx(deri.transfer, [toAddress, bb(amount)])
        if (tx && callback) await callback()
    }

    return (
        <tr>
            <td>{fromName}</td>
            <td><Address address={fromAddress} /></td>
            <td>{fromBalance}</td>
            <td>{toName}</td>
            <td><Address address={toAddress} /></td>
            <td>{toBalance}</td>
            <td><Form.Control value={amount} onChange={(e) => setAmount(e.target.value)} /></td>
            <td><CButton network={network} text='Send' onClick={onSend} /></td>
            <td></td>
        </tr>
    )
}

const SendDeriRowEthereumToBsc = ({ fromBalance, toBalance, callback }) => {
    const [state, setState] = useState({ amount: '', signature: Object })

    const updateSignature = useCallback(async () => {
        const database = new ethers.Contract(ADDRESSES.database, DATABASE_ABI, PROVIDERS.BscTestnet)
        const signature = await database.signature(ADDRESSES.sender)
        setState({ ...state, signature })
    }, [])

    useEffect(() => {
        updateSignature()
    }, [updateSignature])

    const onBridge = async () => {
        const signer = provider.getSigner()
        const wormhole = new ethers.Contract(ADDRESSES.wormholeEthereum, WORMHOLE_ABI, signer)
        await executeTx(wormhole.freeze, [bb(state.amount), 56, ADDRESSES.wormholeBsc])
    }

    const onClaim = async () => {
        const signer = provider.getSigner()
        const wormhole = new ethers.Contract(ADDRESSES.wormholeBsc, WORMHOLE_ABI, signer)
        const tx = await executeTx(wormhole.claim, [
            state.signature.amount,
            state.signature.fromChainId,
            state.signature.fromWormhole,
            state.signature.nonce,
            state.signature.v,
            state.signature.r,
            state.signature.s
        ])
        if (tx && callback) await callback()
    }

    return (
        <tr>
            <td>Account (Ethereum)</td>
            <td><Address address={ADDRESSES.sender} /></td>
            <td>{fromBalance}</td>
            <td>Account (Bsc)</td>
            <td><Address address={ADDRESSES.sender} /></td>
            <td>{toBalance}<span style={{ color: 'blue' }}>{` (Claimable: ${state.signature.valid ? nn(state.signature.amount) : 0})`}</span></td>
            <td><Form.Control value={state.amount} onChange={(e) => setState({ ...state, amount: e.target.value })} /></td>
            <td><CButton network='Ethereum' text='Bridge' onClick={onBridge} /></td>
            <td><CButton network='Bsc' text='Claim' onClick={onClaim} /></td>
        </tr>
    )
}

const SendDeriRowEthereumToArbitrum = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [amount, setAmount] = useState('')


    const parseOutboundTransferData = (data) => {
        const signer = provider.getSigner()
        const abiCoder = ethers.utils.defaultAbiCoder;
        const l1GatewayRouterContract = new ethers.Contract(
            '0x4c7708168395aEa569453Fc36862D2ffcDaC588c', // 替换为你的 L1GatewayRouter 合约地址
            L1GatewayRouter_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        const parsedData = l1GatewayRouterContract.interface.decodeFunctionData('outboundTransfer', data);
        const token = parsedData._token;
        const to = parsedData._to;
        const amount = parsedData._amount;
        const maxGas = parsedData._maxGas;
        const gasPriceBid = parsedData._gasPriceBid;
        const innerData = parsedData._data;

        return {
            token,
            to,
            amount,
            maxGas,
            gasPriceBid,
            innerData
        };
    }


    const onBridge = async () => {
        const signer = provider.getSigner()
        const l2Network = await getL2Network(PROVIDERS.ArbitrumTestnet)
        const erc20Bridger = new Erc20Bridger(l2Network)

        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet, // 替换为你的 L1GatewayRouter 合约地址
            DeriTokenManager_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        let tx

        // const estimate_gas = await erc20Bridger.depositEstimateGas({
        //     l1Signer: signer,
        //     l2Provider: PROVIDERS.Arbitrum,
        //     amount: bb(amount),
        //     erc20L1Address: ADDRESSES.deriEthereum,
        //     destinationAddress: destinationAddress
        // })

        // try {
        // const estimate_gas = await erc20Bridger.depositEstimateGas({
        //     l1Signer: signer,
        //     l2Provider: PROVIDERS.Arbitrum,
        //     amount: bb(amount),
        //     erc20L1Address: ADDRESSES.deriEthereum,
        //     destinationAddress: destinationAddress
        // })
        // console.log("estimate gas", estimate_gas)
        // console.log("start send to arbitrum")
        // tx = await erc20Bridger.deposit({
        //     l1Signer: signer,
        //     l2Provider: PROVIDERS.ArbitrumTestnet,
        //     amount: bb(amount),
        //     erc20L1Address: ADDRESSES.deriEthereumTestnet,
        //     destinationAddress: destinationAddress
        // })
        const depositRequest = await erc20Bridger.getDepositRequest({
            l1Provider: signer.provider,
            l2Provider: PROVIDERS.ArbitrumTestnet,
            amount: bb(amount),
            erc20L1Address: ADDRESSES.deriEthereumTestnet,
            from: await signer.getAddress(),
            destinationAddress: destinationAddress
        });
        console.log("depositRequest", depositRequest)
        const parsedData = parseOutboundTransferData(depositRequest.txRequest.data);
        // console.log(parsedData);

        console.log(parsedData.token,
            parsedData.to,
            parsedData.amount.toString(),
            parsedData.maxGas.toString(),
            parsedData.gasPriceBid.toString(),
            parsedData.innerData)
        tx = await executeTx(deriTokenManagerContract.explicitCallOutBoundTransfer, [
            parsedData.token,
            parsedData.to,
            parsedData.amount,
            parsedData.maxGas,
            parsedData.gasPriceBid,
            parsedData.innerData,
            { value: depositRequest.txRequest.value }
        ])



        // } catch (error) {
        //     const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
        //     alert(message)
        // }
    }

    return (
        <tr>
            <td>Account (Ethereum)</td>
            <td><Address address={ADDRESSES.sender} /></td>
            <td>{fromBalance}</td>
            <td>{destinationName}</td>
            <td><Address address={destinationAddress} /></td>
            <td>{toBalance}</td>
            <td><Form.Control value={amount} onChange={(e) => setAmount(e.target.value)} /></td>
            <td><CButton network='Ethereum' text='Bridge' onClick={onBridge} /></td>
            <td></td>
        </tr>
    )
}

export const SendDeri = () => {
    const [balances, setBalances] = useState({})

    const getBalance = useCallback(async (accountAddress, network) => {
        const deri = new ethers.Contract(ADDRESSES[`deri${network}`], ERC20_ABI, PROVIDERS[network])
        const balance = nn(await deri.balanceOf(accountAddress))
        return balance
    }, [])

    const updateBalances = useCallback(async () => {
        const values = await Promise.all([
            getBalance(ADDRESSES.sender, 'Ethereum'),
            getBalance(ADDRESSES.sender, 'Bsc'),
            getBalance(ADDRESSES.miningVaultEthereum, 'Ethereum'),
            getBalance(ADDRESSES.rewardVaultV2Bsc, 'Bsc'),
            getBalance(ADDRESSES.rewardVaultV2Arbitrum, 'Arbitrum'),
            getBalance(ADDRESSES.uniswapLpStakerArbitrum, 'Arbitrum'),
        ])
        const results = [
            'senderEthereum',
            'senderBsc',
            'miningVaultEthereum',
            'rewardVaultV2Bsc',
            'rewardVaultV2Arbitrum',
            'uniswapLpStakerArbitrum',
        ].reduce((accumulator, key, idx) => ({ ...accumulator, [key]: values[idx] }), {})
        setBalances(results)
    }, [])

    useEffect(() => {
        updateBalances()
    }, [updateBalances])

    return (
        <div>
            <h5>Send Deri</h5>
            <table>
                <tbody>
                    <tr>
                        <td>From</td>
                        <td></td>
                        <td></td>
                        <td>To</td>
                        <td></td>
                        <td></td>
                        <td>Amount</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <SendDeriRow
                        network='Ethereum'
                        fromName='Account (Ethereum)'
                        fromAddress={ADDRESSES.sender}
                        fromBalance={balances.senderEthereum}
                        toName='MiningVault (Ethereum)'
                        toAddress={ADDRESSES.miningVaultEthereum}
                        toBalance={balances.miningVaultEthereum}
                        callback={updateBalances}
                    />
                    <SendDeriRowEthereumToBsc
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.senderBsc}
                        callback={updateBalances}
                    />
                    <SendDeriRow
                        network='Bsc'
                        fromName='Account (Bsc)'
                        fromAddress={ADDRESSES.sender}
                        fromBalance={balances.senderBsc}
                        toName='RewardVault V2 (Bsc)'
                        toAddress={ADDRESSES.rewardVaultV2Bsc}
                        toBalance={balances.rewardVaultV2Bsc}
                        callback={updateBalances}
                    />
                    <SendDeriRowEthereumToArbitrum
                        destinationName='RewardVault V2 (Arbitrum)'
                        destinationAddress={ADDRESSES.rewardVaultV2Arbitrum}
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.rewardVaultV2Arbitrum}
                    />
                    <SendDeriRowEthereumToArbitrum
                        destinationName='Uniswap LP Staker (Arbitrum)'
                        destinationAddress={ADDRESSES.uniswapLpStakerArbitrum}
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.uniswapLpStakerArbitrum}
                    />
                </tbody>
            </table>
        </div>
    )
}
