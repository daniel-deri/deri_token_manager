import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers';
import { Form } from 'react-bootstrap'
import { provider, PROVIDERS, bb, nn, executeTx, connectMetaMask } from './Chain'
import { Address } from './Address'
import { CButton } from './CButton'
import { getL2Network, Erc20Bridger } from '@arbitrum/sdk'

const L1GatewayRouter_ABI = [
    'function outboundTransfer(address _token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes calldata _data)'
]

const DeriTokenManager_ABI = [
    'function mintAndBridgeToArbitrum(uint256 deadline,uint8 v,bytes32 r,bytes32 s,address _token,address _to,uint256 _amount,uint256 _maxGas,uint256 _gasPriceBid,bytes calldata _data) payable external',
    'function mintAndBridgeToZksync(uint256 deadline,uint8 v,bytes32 r,bytes32 s,address _l2Receiver,address _l1Token,uint256 _amount,uint256 _l2TxGasLimit,uint256 _l2TxGasPerPubdataByte) payable external',
    // 'function mintAndBridgeToZksync(uint256 deadline,uint8 v,bytes32 r,bytes32 s,address _l2Receiver,address _l1Token,uint256 _amount,uint256 _l2TxGasLimit,uint256 _l2TxGasPerPubdataByte,address _refundRecipient) payable external',
    'function mintAndBridgeToBnb(uint256 amount,uint256 deadline,uint8 v,bytes32 r,bytes32 s)',
    'function claimAndSendBnb(uint256 amount,uint256 fromChainId,address fromWormhole,uint256 fromNonce,uint8 v,bytes32 r,bytes32 s,address to)',
    'function callZksyncL2TransactionBaseCost(address contractAddress,uint256 _gasPrice,uint256 _gasLimit,uint256 _l2GasPerPubdataByteLimit) view returns (uint256)',
    "function approveGateway()",
    "function approveZkBridge()",
    "function approveWormholeEthereum()"
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

const MINTER_ADDRESS = '0x1a0b5F2EAde71626D051C29Ef425d9c49dc87Aea'
const DERI_ADDRESS = '0x80b2d47CeD4353A164fCbBc5BAB3b6115dF4BFD7'
const DERI_ABI = [
    'function nonces(address account) view returns (uint256)',
    'function mint(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
    'function mint(address account, uint256 amount)'
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
    rewardVaultV2Zksync: '0x77a7f94b3469E814AD092B1c3f1Fa623B2e4DE3d',
    uniswapLpStakerArbitrum: '0x175Fe9E3415D91F00E6882bA052e9c3E2c2A355a',
    wormholeEthereum: '0x6874640cC849153Cb3402D193C33c416972159Ce',
    wormholeBsc: '0x15a5969060228031266c64274a54e02Fbd924AbF',
    database: '0xd8137F05c1F432A80525053c473d0e286c4F46f0',


    deriEthereumTestnet: '0x80b2d47CeD4353A164fCbBc5BAB3b6115dF4BFD7',
    deriArbitrumTestnet: '0xee83355762254e641a0BBF844Cf3d3D65C43cEA4',
    deriTokenManagerTestnet: "0xB45361830AC95cF787f7773E9A38471204B6b044",
    zksyncDiamondProxyTestnet: "0x1908e2BF4a88F91E4eF0DC72f02b8Ea36BEa2319"
}

const ApproveBridges = () => {
    const signer = provider.getSigner()

    const onApproveZksyncBridge = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        tx = await executeTx(deriTokenManagerContract.approveZkBridge, [])
    }

    const onApproveArbitrumBridge = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        tx = await executeTx(deriTokenManagerContract.approveGateway, [])
    }

    const onApproveWormhole = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        tx = await executeTx(deriTokenManagerContract.approveWormholeEthereum, [])
    }


    return (
        <tr>
            <td>Approve Bridges</td>
            <td><CButton network='Ethereum' text='Connect' onClick={connectMetaMask} /></td>
            <td><CButton network='Ethereum' text='Approve Wormhole Bridge' onClick={onApproveWormhole} /></td>
            <td><CButton network='Ethereum' text='Approve Arbitrum Bridge' onClick={onApproveArbitrumBridge} /></td>
            <td><CButton network='Ethereum' text='Approve zkSync Bridge' onClick={onApproveZksyncBridge} /></td>
            <td></td>
        </tr>
    )
}

const SendDeriRowEthereumToBNB = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [state, setState] = useState({ amount: '', signature: Object })

    const updateSignature = useCallback(async () => {
        const database = new ethers.Contract(ADDRESSES.database, DATABASE_ABI, PROVIDERS.BscTestnet)
        const signature = await database.signature(ADDRESSES.sender)
        setState({ ...state, signature })
    }, [])

    useEffect(() => {
        updateSignature()
    }, [updateSignature])

    const onMint = async () => {
        const signer = provider.getSigner()
        console.log("signer address", await signer.getAddress())
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        // const nonce = await deri.nonces(MINTER_ADDRESS)
        const nonce = 1
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 5,
            verifyingContract: DERI_ADDRESS
        }
        const types = {
            Mint: [
                { name: 'account', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        }
        const value = {
            account: MINTER_ADDRESS,
            amount: bb(state.amount),
            nonce: nonce,
            deadline: deadline
        }
        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        console.log("signature", sig)
        return {
            from: MINTER_ADDRESS,
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
        // await executeTx(deri.mint, [MINTER_ADDRESS, bb(amount), deadline, sig.v, sig.r, sig.s])
    }


    const onBridge = async () => {
        const signatureData = await onMint()
        const signer = provider.getSigner()


        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet, // 替换为你的 L1GatewayRouter 合约地址
            DeriTokenManager_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        let tx
        // try {    
        tx = await executeTx(deriTokenManagerContract.mintAndBridgeToBnb, [
            bb(state.amount),
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s
        ])


        // } catch (error) {
        //     const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
        //     alert(message)
        // }
    }

    const onClaim = async () => {

        const signer = provider.getSigner()

        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet, // 替换为你的 L1GatewayRouter 合约地址
            DeriTokenManager_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        let tx
        // try {    
        tx = await executeTx(deriTokenManagerContract.claimAndSendBnb, [
            state.signature.amount,
            state.signature.fromChainId,
            state.signature.fromWormhole,
            state.signature.nonce,
            state.signature.v,
            state.signature.r,
            state.signature.s,
            destinationAddress
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
            <td><Form.Control value={state.amount} onChange={(e) => setState({ ...state, amount: e.target.value })} /></td>
            <td><CButton network='Ethereum' text='Mint&Bridge' onClick={onBridge} /></td>
            <td><CButton network='Ethereum' text='Claim' onClick={onClaim} /></td>
            <td></td>
        </tr>
    )
}

const SendDeriRowEthereumToArbitrum = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [amount, setAmount] = useState('')

    const onMint = async () => {
        const signer = provider.getSigner()
        console.log("signer address", await signer.getAddress())
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        // const nonce = await deri.nonces(MINTER_ADDRESS)
        const nonce = 1
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 5,
            verifyingContract: DERI_ADDRESS
        }
        const types = {
            Mint: [
                { name: 'account', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        }
        const value = {
            account: MINTER_ADDRESS,
            amount: bb(amount),
            nonce: nonce,
            deadline: deadline
        }


        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        console.log("signature", sig)
        return {
            from: MINTER_ADDRESS,
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
        // await executeTx(deri.mint, [MINTER_ADDRESS, bb(amount), deadline, sig.v, sig.r, sig.s])
    }


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
        const signatureData = await onMint()

        const signer = provider.getSigner()
        console.log('signer address', await signer.getAddress())
        const l2Network = await getL2Network(PROVIDERS.ArbitrumTestnet)
        const erc20Bridger = new Erc20Bridger(l2Network)

        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet, // 替换为你的 L1GatewayRouter 合约地址
            DeriTokenManager_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        let tx
        // try {
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



        tx = await executeTx(deriTokenManagerContract.mintAndBridgeToArbitrum, [
            signatureData.from,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
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
            <td><CButton network='Ethereum' text='Mint&Bridge' onClick={onMint} /></td>
            <td></td>
        </tr>
    )
}

const SendDeriRowEthereumToZksync = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [amount, setAmount] = useState('')

    const onMint = async () => {
        const signer = provider.getSigner()
        console.log("signer address", await signer.getAddress())
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        // const nonce = await deri.nonces(MINTER_ADDRESS)
        const nonce = 1
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 5,
            verifyingContract: DERI_ADDRESS
        }
        const types = {
            Mint: [
                { name: 'account', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ]
        }
        const value = {
            account: MINTER_ADDRESS,
            amount: bb(amount),
            nonce: nonce,
            deadline: deadline
        }


        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        console.log("signature", sig)
        return {
            from: MINTER_ADDRESS,
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
        // await executeTx(deri.mint, [MINTER_ADDRESS, bb(amount), deadline, sig.v, sig.r, sig.s])
    }


    const onBridge = async () => {
        const signatureData = await onMint()

        const signer = provider.getSigner()
        console.log('signer address', await signer.getAddress())
        const l2Network = await getL2Network(PROVIDERS.ArbitrumTestnet)
        const erc20Bridger = new Erc20Bridger(l2Network)

        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManagerTestnet, // 替换为你的 L1GatewayRouter 合约地址
            DeriTokenManager_ABI,
            signer // 替换为你的以太坊提供者对象
        );

        const gasPrice = await provider.getGasPrice()
        const gasLimit = 1139783
        console.log("gasPrice", gasPrice)

        let tx
        // try {

        const L2TransactionBaseCost = await deriTokenManagerContract.callZksyncL2TransactionBaseCost(
            ADDRESSES.zksyncDiamondProxyTestnet,
            gasPrice,
            gasLimit,
            800)

        console.log("L2TransactionBaseCost", L2TransactionBaseCost)

        tx = await executeTx(deriTokenManagerContract.mintAndBridgeToZksync, [
            signatureData.from,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            destinationAddress,
            ADDRESSES.deriEthereumTestnet,
            bb(amount),
            gasLimit,
            800,
            { value: L2TransactionBaseCost }
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
            <td><CButton network='Ethereum' text='Mint&Bridge' onClick={onBridge} /></td>
            <td></td>
        </tr>
    )
}

export const MintAndSendTestnet = () => {
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
            <h5>Mint&Send Deri</h5>
            <table>
                <tbody>
                    <ApproveBridges />
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
                    <SendDeriRowEthereumToBNB
                        destinationName='RewardVault V2 (BNB)'
                        destinationAddress={ADDRESSES.rewardVaultV2Bsc}
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.rewardVaultV2Bsc}
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
                    <SendDeriRowEthereumToZksync
                        destinationName='RewardVault V2 (Zksync)'
                        destinationAddress={ADDRESSES.rewardVaultV2Zksync}
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.uniswapLpStakerArbitrum}
                    />
                </tbody>
            </table>
        </div>
    )
}
