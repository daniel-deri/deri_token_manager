import { useState, useEffect, useCallback } from 'react'
import { ethers} from 'ethers'
import { BigNumber } from 'ethers';
import { Form } from 'react-bootstrap'
import { provider, PROVIDERS, bb, nn, executeTx, connectMetaMask } from './Chain'
import { Address } from './Address'
import { CButton } from './CButton'
import { getL2Network, Erc20Bridger } from '@arbitrum/sdk'
import { useContext } from 'react';
import { SuggestedSendAmountContext } from './Context';

const L1GatewayRouter_ABI = [
    'function outboundTransfer(address _token, address _to, uint256 _amount, uint256 _maxGas, uint256 _gasPriceBid, bytes calldata _data)'
]

const DeriTokenManager_ABI = [
    {
        "inputs": [],
        "name": "OnlyAdmin",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Reentry",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "NewAdmin",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            }
        ],
        "name": "NewImplementation",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
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
                "internalType": "address",
                "name": "newBridge",
                "type": "address"
            }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "poolChain",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
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
                    },
                    {
                        "internalType": "address",
                        "name": "_l2Token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint32",
                        "name": "_minGasLimit",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct DeriTokenManagerImplementation.CrossChainDetails[]",
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
        "inputs": [],
        "name": "implementation",
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
                "internalType": "struct DeriTokenManagerImplementation.Signature",
                "name": "signature",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "poolChain",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_amount",
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
                    },
                    {
                        "internalType": "address",
                        "name": "_l2Token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint32",
                        "name": "_minGasLimit",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct DeriTokenManagerImplementation.CrossChainDetails[]",
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
                "name": "newImplementation",
                "type": "address"
            }
        ],
        "name": "setImplementation",
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
    },
    {
        "inputs": [],
        "name": "withdrawETH",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
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

const MINTER_ADDRESS = '0xc820b7b32A2df674E4e4957576d543E57c3d3C66'
const DERI_ADDRESS = '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9'
const DERI_ABI = [
    'function nonces(address account) view returns (uint256)',
    'function mint(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
    'function mint(address account, uint256 amount)'
]

const ADDRESSES = {
    sender: '0xc820b7b32A2df674E4e4957576d543E57c3d3C66',
    deriEthereum: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
    deriBsc: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
    deriArbitrum: '0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12',
    deriZksync: '0x140D5bc5b62d6cB492B1A475127F50d531023803',
    deriLinea: '0x4aCde18aCDE7F195E6Fb928E15Dc8D83D67c1f3A',
    deriPolygonzkEVM: "0x360CE6EeCDF98e3851531051907e6a809BF6e236",
    deriManta: "0xd212377f71F15A1b962c9265Dc44FBcEAf0Bc46D",

    rewardVaultArbitrum: '0x261d0219c017fFc3D4C48B6d8773D95F592ac27b',
    rewardVaultZksync: '0x2E46b7e73fdb603A821a3F8a0eCaB077ebF81014',
    rewardVaultLinea: '0x1640beAd2163Cf8D7cc52662768992A1fEBDbF2F',
    rewardVaultScroll: '0x2C139f40E03b585Be0A9503Ad32e0b80745211b9',
    rewardVaultPolygonzkEVM: "0x7B8bCf00DEf58b50620b2C253f3A97EE51F44683",
    rewardVaultManta: "0x2ae67d0107d75B2a38890d83822d7673213aD276",
    rewardVaultBsc: "0x6395e2125728613c814d198e3D6f79eE699f1953",
    uniswapLpStakerArbitrum: '0x261d0219c017fFc3D4C48B6d8773D95F592ac27b',

    wormholeEthereum: '0x6874640cC849153Cb3402D193C33c416972159Ce',
    wormholeBsc: '0x15a5969060228031266c64274a54e02Fbd924AbF',
    database: '0xd8137F05c1F432A80525053c473d0e286c4F46f0',

    deriTokenManager: "0x9c3001141437cbA96840c81d519BFF7C694328CE",
    arbitrumGatewayRouter: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',
    arbitrumGateway: '0xa3A7B6F88361F48403514059F1F16C8E78d60EeC',
    zksyncL1Bridge: '0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063',
    zksyncDiamondProxy: "0x32400084c286cf3e17e7b677ea9583e60a000324",

    lineaBridge: "0x051F1D88f0aF5763fB888eC4378b4D8B29ea3319",
    scrollGateway: "0xF8B1378579659D8F7EE5f3C929c2f3E332E41Fd6",
    polygonzkEVMBridge: "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
    mantaBridge: "0x3B95bC951EE0f553ba487327278cAc44f29715E5",
}

const ApproveBridges = () => {
    const signer = provider.getSigner()
    const deriTokenManagerContract = new ethers.Contract(
        ADDRESSES.deriTokenManager,
        DeriTokenManager_ABI,
        signer
    );

    const onApproveZksyncBridge = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.zksyncL1Bridge])
    }

    const onApproveArbitrumBridge = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.arbitrumGateway])
    }

    const onApproveWormhole = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.wormholeEthereum])
    }

    const onApproveLinea = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.lineaBridge])
    }

    const onApproveScroll = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.scrollGateway])
    }

    const onApprovePolygonzkEVM = async () => {
        await executeTx(deriTokenManagerContract.approve, [ADDRESSES.polygonzkEVMBridge])
    }


    return (
        <tbody>
            <tr>
                <td>Approve Bridges</td>
                <td><CButton network='Ethereum' text='Connect' onClick={connectMetaMask} /></td>
                {/* <td><CButton network='Ethereum' text='Approve Wormhole Bridge' onClick={onApproveWormhole} /></td> */}
                <td><CButton network='Ethereum' text='Approve Arbitrum Bridge' onClick={onApproveArbitrumBridge} /></td>
                <td><CButton network='Ethereum' text='Approve zkSync Bridge' onClick={onApproveZksyncBridge} /></td>
                <td><CButton network='Ethereum' text='Approve Linea Bridge' onClick={onApproveLinea} /></td>
                <td><CButton network='Ethereum' text='Approve Scroll Bridge' onClick={onApproveScroll} /></td>
                <td><CButton network='Ethereum' text='Approve Polygon zkEVM Bridge' onClick={onApprovePolygonzkEVM} /></td>
            </tr>
        </tbody>
    )
}


const SetRewardPerWeek = () => {
    const { suggestedSendAmount, setSuggestedSendAmount } = useContext(SuggestedSendAmountContext);

    const vaults = [
        { id: 0, network: 'Arbitrum', name: 'arbitrumRewardVault', title: 'RewardVault (Arbitrum)' },
        { id: 1, network: 'Zksync', name: 'zksyncRewardVault', title: 'RewardVault (Zksync)' },
        { id: 2, network: 'Linea', name: 'lineaRewardVault', title: 'RewardVault (Linea)' },
        { id: 3, network: 'Scroll', name: 'scrollRewardVault', title: 'RewardVault (Scroll)' },
        { id: 4, network: 'PolygonzkEVM', name: 'polygonzkevmRewardVault', title: 'RewardVault (PolygozkEVM)' },
        { id: 5, network: 'Manta', name: 'mantaRewardVault', title: 'RewardVault (Manta)' },
        { id: 6, network: 'Bsc', name: 'bscRewardVault', title: 'RewardVault (Bsc)' }
    ];

    return (
        <tbody>
            <tr>
                <td>Pool</td>
                <td>SuggestedSendAmount</td>
                <td>SetReward</td>
            </tr>
            {vaults.map((vault) => (
                <tr key={vault.id}>
                    <td>{vault.title}</td>
                    <td>{suggestedSendAmount[vault.network]}</td>
                    <td><Form.Control
                        type="text"
                        onChange={event => {
                            setSuggestedSendAmount(prevState => ({
                                ...prevState,
                                [vault.network]: event.target.value,
                            }));
                        }}
                    /></td>
                </tr>
            ))}
            <tr>
                <td>Uniswap (Arbitrum)</td>
                <td>20000</td>
            </tr>
        </tbody>
    )
}


const SendDeriRowEthereumToAll = ({ destinationName, destinationAddress, fromBalance, toBalance }) => {
    const {suggestedSendAmount, setSuggestedSendAmount } = useContext(SuggestedSendAmountContext);
    const [state, setState] = useState({ amount: '', signature: Object })
    const [totalReward, setTotalReward] = useState(0);

    const updateSignature = useCallback(async () => {
        const database = new ethers.Contract(ADDRESSES.database, DATABASE_ABI, PROVIDERS.BscTestnet)
        const signature = await database.signature(ADDRESSES.deriTokenManager)
        setState({ ...state, signature })
    }, [])

    const updateRewardPerWeek = useCallback(async () => {
        const amount = Object.values(suggestedSendAmount).reduce((accumulator, currentValue) => {
            // Parse the current value as a number, and if it's a valid number, add it to the accumulator
            // const numericValue = (currentValue);
            return Number(accumulator) + Number(currentValue)
        }, 0);
        console.log('amount', amount)
        const totalAmount = amount
        setTotalReward(bb(totalAmount));
        console.log("totalReward", totalAmount)
    }, [suggestedSendAmount]);

    useEffect(() => {
        updateSignature()
        updateRewardPerWeek()
    }, [updateSignature, updateRewardPerWeek, suggestedSendAmount])



    const getSignature = async () => {
        console.log("state", state)
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(ADDRESSES.deriTokenManager)
        // const deadline = parseInt(Date.now() / 86400000 ) * 86400 + 300
        const deadline = Math.floor(Date.now() / 1000) + 300;
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
            amount: totalReward,
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
        // const abiCoder = ethers.utils.defaultAbiCoder;
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
        try {
            tx = await executeTx(deriTokenManagerBNBContract.claimAndSendBnb, [
                state.signature.amount,
                state.signature.fromChainId,
                state.signature.fromWormhole,
                state.signature.nonce,
                state.signature.v,
                state.signature.r,
                state.signature.s,
            ])

        } catch (error) {
            const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
            alert(message)
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
        const l2Network = await getL2Network(PROVIDERS.Arbitrum)
        const erc20Bridger = new Erc20Bridger(l2Network)

        const origGasPrice = await provider.getGasPrice()
        const gasPrice = origGasPrice.mul(11).div(10)
        const gasLimit = 782563
        console.log("gasPrice", origGasPrice.toString(), gasPrice.toString())

        let tx
        // try {
        //arbitrum
        console.log('signer address', await signer.getAddress())
        const depositRequest = await erc20Bridger.getDepositRequest({
            l1Provider: signer.provider,
            l2Provider: PROVIDERS.Arbitrum,
            amount: bb(1),
            erc20L1Address: ADDRESSES.deriEthereum,
            from: await signer.getAddress(),
            destinationAddress: ADDRESSES.rewardVaultArbitrum,
            retryableGasOverrides: {
                gasLimit: {
                    percentIncrease: BigNumber.from('20')
                },
            }
        });
        const parsedData = parseOutboundTransferData(depositRequest.txRequest.data);
        console.log('parsedData', parsedData)

        const depositRequest2 = await erc20Bridger.getDepositRequest({
            l1Provider: signer.provider,
            l2Provider: PROVIDERS.Arbitrum,
            amount: bb(1),
            erc20L1Address: ADDRESSES.deriEthereum,
            from: await signer.getAddress(),
            destinationAddress: ADDRESSES.uniswapLpStakerArbitrum,
            retryableGasOverrides: {
                gasLimit: {
                    percentIncrease: BigNumber.from('20')
                },
            }
        });
        const parsedData2 = parseOutboundTransferData(depositRequest2.txRequest.data);
        console.log('parsedData2', parsedData2)

        const L2TransactionBaseCost = await deriTokenManagerContract.callZksyncL2TransactionBaseCost(
            ADDRESSES.zksyncDiamondProxy,
            gasPrice,
            gasLimit,
            800)


        const lineaGasUsage = 731989
        const lineGasPrice = await PROVIDERS.Linea.getGasPrice();
        const lineaValue = lineaGasUsage * lineGasPrice
        console.log('linea', lineGasPrice, lineGasPrice, lineaValue)

        const signature = {
            amount: totalReward,
            deadline: signatureData.deadline,
            v: signatureData.v,
            r: signatureData.r,
            s: signatureData.s
        }

        const arbitrumRewardVaultDetails = {
            poolChain: 0,
            _amount: bb(suggestedSendAmount.Arbitrum),
            _token: parsedData.token,
            _to: ADDRESSES.rewardVaultArbitrum,
            _maxGas: parsedData.maxGas,
            _gasPriceBid: parsedData.gasPriceBid,
            _value: depositRequest.txRequest.value,
            _data: parsedData.innerData,
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }

        const arbitrumUniswapDetails = {
            poolChain: 0,
            _amount: bb(20000),
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
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }


        const zksyncRewardVaultDetails = {
            poolChain: 1,
            _amount: bb(suggestedSendAmount.Zksync),
            _token: "0x0000000000000000000000000000000000000000",
            _to: "0x0000000000000000000000000000000000000000",
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: L2TransactionBaseCost,
            _data: "0x",
            _l2Receiver: ADDRESSES.rewardVaultZksync,
            _l1Token: ADDRESSES.deriEthereum,
            _l2TxGasLimit: gasLimit,
            _l2TxGasPerPubdataByte: 800,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }

        const lineaRewardVaultDetails = {
            poolChain: 2,
            _amount: bb(suggestedSendAmount.Linea),
            _token: ADDRESSES.deriEthereum,
            _to: ADDRESSES.rewardVaultLinea,
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: lineaValue,
            _data: "0x",
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }

        const scrollRewardVaultDetails = {
            poolChain: 3,
            _amount: bb(suggestedSendAmount.Scroll),
            _token: ADDRESSES.deriEthereum,
            _to: ADDRESSES.rewardVaultScroll,
            _maxGas: 1000000,
            _gasPriceBid: 0,
            _value: bb(0.001),
            _data: "0x",
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }

        const polygonzkevmRewardVaultDetails = {
            poolChain: 4,
            _amount: bb(suggestedSendAmount.PolygonzkEVM),
            _token: ADDRESSES.deriEthereum,
            _to: ADDRESSES.rewardVaultPolygonzkEVM,
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: 0,
            _data: "0x",
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 0
        }

        const mantaRewardVaultDetails = {
            poolChain: 5,
            _amount: bb(suggestedSendAmount.Manta),
            _token: ADDRESSES.deriEthereum,
            _to: ADDRESSES.rewardVaultManta,
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: 0,
            _data: "0x",
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0xd212377f71F15A1b962c9265Dc44FBcEAf0Bc46D",
            _minGasLimit: 200000
        }

        const bscRewardVaultDetails = {
            poolChain: 5,
            _amount: bb(suggestedSendAmount.Bsc),
            _token: ADDRESSES.deriEthereum,
            _to: ADDRESSES.rewardVaultBsc,
            _maxGas: 0,
            _gasPriceBid: 0,
            _value: 0,
            _data: "0x",
            _l2Receiver: "0x0000000000000000000000000000000000000000",
            _l1Token: "0x0000000000000000000000000000000000000000",
            _l2TxGasLimit: 0,
            _l2TxGasPerPubdataByte: 0,
            _refundRecipient: "0x0000000000000000000000000000000000000000",
            _l2Token: "0x0000000000000000000000000000000000000000",
            _minGasLimit: 200000
        }

        console.log("mint all param signature", signature)
        
        // const msg_value = arbitrumRewardVaultDetails._value.add(arbitrumUniswapDetails._value).add(zksyncRewardVaultDetails._value).add(lineaRewardVaultDetails._value)
            
        const details = [arbitrumRewardVaultDetails, zksyncRewardVaultDetails, lineaRewardVaultDetails, scrollRewardVaultDetails, polygonzkevmRewardVaultDetails, mantaRewardVaultDetails, bscRewardVaultDetails]
            .filter(detail => detail._amount > 0);

        // 计算 msg_value
        const msg_value = details.reduce((acc, detail) => acc.add(detail._value), BigNumber.from(0));

        console.log("mint all param detail", details, msg_value)

        await executeTx(deriTokenManagerContract.mintAndBridgeAll, [
            signature,
            details,
            { value: msg_value }
        ])
        // tx = await executeTx(deriTokenManagerContract.bridgeAll, [
        //     details,
        //     { value: msg_value }
        // ])

        // } catch (error) {
        //     const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}`
        //     alert(message)
        // }
    }

    return (
        <tr>
            <td>Mint Amount</td>
            <td>{nn(totalReward)}</td>
            <td>DeriTokenManager</td>
            <td><Address address={ADDRESSES.deriTokenManager} /></td>
            {/* <td><span style={{ color: 'blue' }}>{` BNB Claimable: ${state.signature.valid ? nn(state.signature.amount) : 0}`}</span></td> */}
            <td><CButton network='Ethereum' text='Mint&BridgeAll' onClick={onBridge} /></td>
            <td><CButton network='Bsc' text='Claim&Send' onClick={onClaim} /></td>
        </tr>
    )
}

export const MintAndSendAll = () => {
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
                </tbody>
                <tbody>
                    <SetRewardPerWeek />
                </tbody>
            </table>
            <table>
                <tbody>
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
