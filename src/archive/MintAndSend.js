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
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "NewAdmin",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveGateway",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveGatewayRouter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveWormholeEthereum",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveZkBridge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "isArbitrum",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_token",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_maxGas",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_gasPriceBid",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_data",
                        "type": "bytes"
                    },
                    {
                        "internalType": "address",
                        "name": "_l2Receiver",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_l1Token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_l2TxGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_l2TxGasPerPubdataByte",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_refundRecipient",
                        "type": "address"
                    }
                ],
                "internalType": "struct DeriTokenManager.CrossChainDetails[]",
                "name": "details",
                "type": "tuple[]"
            }
        ],
        "name": "bridgeAll",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_gasPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_gasLimit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_l2GasPerPubdataByteLimit",
                "type": "uint256"
            }
        ],
        "name": "callZksyncL2TransactionBaseCost",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "v",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "r",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "s",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct DeriTokenManager.Signature",
                "name": "signature",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "isArbitrum",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "poolId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_token",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_maxGas",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_gasPriceBid",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "_data",
                        "type": "bytes"
                    },
                    {
                        "internalType": "address",
                        "name": "_l2Receiver",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_l1Token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_l2TxGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_l2TxGasPerPubdataByte",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "_refundRecipient",
                        "type": "address"
                    }
                ],
                "internalType": "struct DeriTokenManager.CrossChainDetails[]",
                "name": "details",
                "type": "tuple[]"
            }
        ],
        "name": "mintAndBridgeAll",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "rewardPerWeeks",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "setAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "rewardPerWeek",
                "type": "uint256[]"
            }
        ],
        "name": "setRewardPerSecond",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "poolId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "rewardPerWeek",
                "type": "uint256"
            }
        ],
        "name": "setRewardPerSecond",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const DeriTokenManagerBNB_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "NewAdmin",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fromChainId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "fromWormhole",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "fromNonce",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "claimAndSendBnb",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardVaultBnb",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "setAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_rewardVaultBnb",
                "type": "address"
            }
        ],
        "name": "setRewardVaultBnb",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
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

const MINTER_ADDRESS = '0x919735d147185788D8A29942baC49A5164A1Bfd6'
const DERI_ADDRESS = '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9'
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
    deriZksync: '0x140D5bc5b62d6cB492B1A475127F50d531023803',
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

    deriTokenManager: "0xa21C2eAefb8EbA16DB6Ed8393593A843A4E071fe",
    arbitrumGatewayRouter: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',
    arbitrumGateway: '0xa3A7B6F88361F48403514059F1F16C8E78d60EeC',
    zksyncL1Bridge: '0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063',
    zksyncDiamondProxy: "0x32400084c286cf3e17e7b677ea9583e60a000324"
}

const ApproveBridges = () => {
    const signer = provider.getSigner()

    const onApproveZksyncBridge = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        tx = await executeTx(deriTokenManagerContract.approveZkBridge, [])
    }

    const onApproveArbitrumBridge = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        tx = await executeTx(deriTokenManagerContract.approveGateway, [])
    }

    const onApproveWormhole = async () => {
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
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

    const getSignature = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(ADDRESSES.deriTokenManager)
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 1,
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
            account: ADDRESSES.deriTokenManager,
            amount: bb(state.amount),
            nonce: nonce,
            deadline: deadline
        }
        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        return {
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
    }


    const onBridge = async () => {
        const signatureData = await getSignature()
        const signer = provider.getSigner()
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        try {
            tx = await executeTx(deriTokenManagerContract.mintAndBridgeToBnb, [
                bb(state.amount),
                signatureData.deadline,
                signatureData.v,
                signatureData.r,
                signatureData.s
            ])
        } catch (error) {
            const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
            alert(message)
        }
    }

    const onClaim = async () => {
        const signer = provider.getSigner()
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        try {
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

        } catch (error) {
            const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
            alert(message)
        }
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
            <td><CButton network='Bsc' text='Claim' onClick={onClaim} /></td>
            <td></td>
        </tr>
    )
}

const SendDeriRowEthereumToArbitrum = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [amount, setAmount] = useState('')

    const getSignature = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(ADDRESSES.deriTokenManager)
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 1,
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
            account: ADDRESSES.deriTokenManager,
            amount: bb(amount),
            nonce: nonce,
            deadline: deadline
        }
        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        return {
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
    }

    const parseOutboundTransferData = (data) => {
        const signer = provider.getSigner()
        const abiCoder = ethers.utils.defaultAbiCoder;
        const l1GatewayRouterContract = new ethers.Contract(
            ADDRESSES.arbitrumGatewayRouter, // 替换为你的 L1GatewayRouter 合约地址
            L1GatewayRouter_ABI,
            signer
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
        const signatureData = await getSignature()
        const signer = provider.getSigner()
        const l2Network = await getL2Network(PROVIDERS.Arbitrum)
        const erc20Bridger = new Erc20Bridger(l2Network)

        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );

        let tx
        try {
            const depositRequest = await erc20Bridger.getDepositRequest({
                l1Provider: signer.provider,
                l2Provider: PROVIDERS.Arbitrum,
                amount: bb(amount),
                erc20L1Address: ADDRESSES.deriEthereum,
                from: await signer.getAddress(),
                destinationAddress: destinationAddress
            });
            const parsedData = parseOutboundTransferData(depositRequest.txRequest.data);
            console.log(parsedData);

            tx = await executeTx(deriTokenManagerContract.mintAndBridgeToArbitrum, [
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

        } catch (error) {
            const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
            alert(message)
        }
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

const SendDeriRowEthereumToZksync = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [amount, setAmount] = useState('')

    const getSignature = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(ADDRESSES.deriTokenManager)
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 1,
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
            account: ADDRESSES.deriTokenManager,
            amount: bb(amount),
            nonce: nonce,
            deadline: deadline
        }
        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        return {
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
    }

    const onBridge = async () => {
        const signatureData = await getSignature()
        const signer = provider.getSigner()
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );
        const gasPrice = await provider.getGasPrice()
        const gasLimit = 782563 // actual value 742563
        console.log("gasPrice", gasPrice)

        let tx
        try {
            const L2TransactionBaseCost = await deriTokenManagerContract.callZksyncL2TransactionBaseCost(
                ADDRESSES.zksyncDiamondProxy,
                gasPrice,
                gasLimit,
                800)

            console.log("L2TransactionBaseCost", L2TransactionBaseCost)

            tx = await executeTx(deriTokenManagerContract.mintAndBridgeToZksync, [
                signatureData.deadline,
                signatureData.v,
                signatureData.r,
                signatureData.s,
                destinationAddress,
                ADDRESSES.deriEthereum,
                bb(amount),
                gasLimit,
                800,
                { value: L2TransactionBaseCost }
            ])


        } catch (error) {
            const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
            alert(message)
        }
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

const SendDeriRowEthereumToAll = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const [state, setState] = useState({ amount: '', signature: Object })

    const updateSignature = useCallback(async () => {
        const database = new ethers.Contract(ADDRESSES.database, DATABASE_ABI, PROVIDERS.BscTestnet)
        const signature = await database.signature(ADDRESSES.deriTokenManager)
        // const signature = await database.signature("0x4EbFF3c3656F70E51c213Cc78248A84C1488d6C7")
        setState({ ...state, signature })
    }, [])

    useEffect(() => {
        updateSignature()
    }, [updateSignature])


    const getSignature = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(ADDRESSES.deriTokenManager)
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 1,
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
            account: ADDRESSES.deriTokenManager,
            amount: bb(state.amount),
            nonce: nonce,
            deadline: deadline
        }
        const sig = ethers.utils.splitSignature(
            await signer._signTypedData(domain, types, value)
        )
        return {
            deadline: deadline,
            v: sig.v,
            r: sig.r,
            s: sig.s
        }
    }

    const parseOutboundTransferData = (data) => {
        const signer = provider.getSigner()
        const abiCoder = ethers.utils.defaultAbiCoder;
        const l1GatewayRouterContract = new ethers.Contract(
            ADDRESSES.arbitrumGatewayRouter,
            L1GatewayRouter_ABI,
            signer
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

    const onClaim = async () => {
        const signer = provider.getSigner()
        const deriTokenManagerBNBContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManagerBNB_ABI,
            signer
        );

        console.log("signature", state.signature)

        let tx
        // try {
        tx = await executeTx(deriTokenManagerBNBContract.claimAndSendBnb, [
            state.signature.amount,
            state.signature.fromChainId,
            state.signature.fromWormhole,
            state.signature.nonce,
            state.signature.v,
            state.signature.r,
            state.signature.s,
        ])

        // } catch (error) {
        //     const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
        //     alert(message)
        // }
    }


    const onBridge = async () => {
        const signatureData = await getSignature()
        const signer = provider.getSigner()
        const deriTokenManagerContract = new ethers.Contract(
            ADDRESSES.deriTokenManager,
            DeriTokenManager_ABI,
            signer
        );
        const l2Network = await getL2Network(PROVIDERS.Arbitrum)
        const erc20Bridger = new Erc20Bridger(l2Network)

        let origGasPrice = await provider.getGasPrice()
        let gasPrice = origGasPrice.mul(11).div(10)
        const gasLimit = 782563
        console.log("gasPrice", origGasPrice.toString(), gasPrice.toString())

        let tx
        // try {
        //arbitrum
        const depositRequest = await erc20Bridger.getDepositRequest({
            l1Provider: signer.provider,
            l2Provider: PROVIDERS.Arbitrum,
            amount: bb(1),
            erc20L1Address: ADDRESSES.deriEthereum,
            from: await signer.getAddress(),
            destinationAddress: ADDRESSES.rewardVaultV2Arbitrum
        });
        const parsedData = parseOutboundTransferData(depositRequest.txRequest.data);

        const depositRequest2 = await erc20Bridger.getDepositRequest({
            l1Provider: signer.provider,
            l2Provider: PROVIDERS.Arbitrum,
            amount: bb(2),
            erc20L1Address: ADDRESSES.deriEthereum,
            from: await signer.getAddress(),
            destinationAddress: ADDRESSES.uniswapLpStakerArbitrum
        });
        const parsedData2 = parseOutboundTransferData(depositRequest2.txRequest.data);

        const L2TransactionBaseCost = await deriTokenManagerContract.callZksyncL2TransactionBaseCost(
            ADDRESSES.zksyncDiamondProxy,
            gasPrice,
            gasLimit,
            800)


        const signature = {
            amount: bb(state.amount),
            deadline: signatureData.deadline,
            v: signatureData.v,
            r: signatureData.r,
            s: signatureData.s
        }

        const arbitrumRewardVaultV2Details = {
            isArbitrum: true,
            poolId: 0,
            _token: parsedData.token,
            _to: ADDRESSES.rewardVaultV2Arbitrum,
            _maxGas: parsedData.maxGas,
            _gasPriceBid: parsedData.gasPriceBid,
            _value: depositRequest.txRequest.value,
            _data: parsedData.innerData,
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000"
        }

        const arbitrumUniswapDetails = {
            isArbitrum: true,
            poolId: 1,
            _token: parsedData2.token,
            _to: ADDRESSES.uniswapLpStakerArbitrum,
            _maxGas: parsedData2.maxGas,
            _gasPriceBid: parsedData2.gasPriceBid,
            _value: depositRequest2.txRequest.value,
            _data: parsedData2.innerData,
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000"
        }


        const zksyncRewardVaultDetails = {
            isArbitrum: false,
            poolId: 2,
            _token: "0x0000000000000000000000000000000000000000",
            _to: "0x0000000000000000000000000000000000000000",
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: L2TransactionBaseCost,
            _data: "0x",
            _l2Receiver: ADDRESSES.rewardVaultV2Zksync,
            _l1Token: ADDRESSES.deriEthereum,
            _l2TxGasLimit: gasLimit,
            _l2TxGasPerPubdataByte: 800,
            _refundRecipient: "0x0000000000000000000000000000000000000000"
        }

        // struct CrossChainDetails {
        //     uint256 poolId;
        //     address _token;
        //     address _to;
        //     uint256 _maxGas;
        //     uint256 _gasPriceBid;
        //     uint256 _value;
        //     bytes _data;
        //     address _l2Receiver;
        //     address _l1Token;
        //     uint256 _l2TxGasLimit;
        //     uint256 _l2TxGasPerPubdataByte;
        //     address _refundRecipient;
        //         }

        console.log("mint all param signature", signature)
        console.log("mint all param detail", [arbitrumRewardVaultV2Details, arbitrumUniswapDetails, zksyncRewardVaultDetails])
        const msg_value = arbitrumRewardVaultV2Details._value.add(arbitrumUniswapDetails._value).add(zksyncRewardVaultDetails._value)
        // const msg_value = arbitrumRewardVaultV2Details._value + arbitrumUniswapDetails._value + zksyncRewardVaultDetails._value
        console.log("mint all param msg.value", msg_value.toString())

        const details = [arbitrumRewardVaultV2Details, arbitrumUniswapDetails, zksyncRewardVaultDetails]
        // tx = await executeTx(deriTokenManagerContract.mintAndBridgeAll, [
        //     signature,
        //     details,
        //     { value: msg_value }
        // ])

        tx = await executeTx(deriTokenManagerContract.bridgeAll, [
            details,
            { value: msg_value }
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
            <td><CButton network='Ethereum' text='Mint&BridgeAll' onClick={onBridge} /></td>
            <td><CButton network='Ethereum' text='Claim' onClick={onClaim} /></td>
            <td></td>
        </tr>
    )
}

export const MintAndSend = () => {
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
            getBalance(ADDRESSES.rewardVaultV2Zksync, 'Zksync'),
        ])
        const results = [
            'senderEthereum',
            'senderBsc',
            'miningVaultEthereum',
            'rewardVaultV2Bsc',
            'rewardVaultV2Arbitrum',
            'uniswapLpStakerArbitrum',
            'rewardVaultV2Zksync',
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
                        toBalance={balances.rewardVaultV2Zksync}
                    />
                    <SendDeriRowEthereumToAll
                        destinationName='RewardVault V2 (Zksync)'
                        destinationAddress={ADDRESSES.rewardVaultV2Zksync}
                        fromBalance={balances.senderEthereum}
                        toBalance={balances.rewardVaultV2Zksync}
                    />
                </tbody>
            </table>
        </div>
    )
}
