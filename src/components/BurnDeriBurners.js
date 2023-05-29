import {useState, useEffect, useCallback} from 'react'
import {ethers} from 'ethers'
import {ZERO_ADDRESS, PROVIDERS, provider, nn, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'

const ABI_ERC20 = [
    'function balanceOf(address account) view returns (uint256)'
]
const ABI_DATABASE = [
    'function signature(address account) view returns (tuple(uint256 amount, uint256 fromChainId, address fromWormhole, uint256 toChainId, address toWormhole, uint256 nonce, uint256 timestamp, uint8 v, bytes32 r, bytes32 s, bool valid))'
]
const ABI_BURNER = [
    'function bridgeDeriToEthereumBurner()',
    'function claimAndBurnDeri(uint256 amount, uint256 fromChainId, address fromWormhole, uint256 fromNone, uint8 v, bytes32 r, bytes32 s)'
]

const BURNERS = [
    {
        network: 'Bsc',
        aSigner: '0x8Cb48d1f02A0BB928B45c92f26905173C9118d48',
        aDeri: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
        aBurner: '0x2e225Dacc4c2b843BB8a6b2215b9008f922D06bd'
    },
    {
        network: 'Ethereum',
        aSigner: '0x0000000000000000000000000000000000000000',
        aDeri: '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9',
        aBurner: '0x2e225Dacc4c2b843BB8a6b2215b9008f922D06bd'
    },
]
const A_DATABASE = '0xd8137F05c1F432A80525053c473d0e286c4F46f0'

const BurnDeriBurnersRow = ({network, aSigner, aDeri, aBurner}) => {
    const [state, setState] = useState({balance: '', signature: Object})

    const udpateEthereumBurner = async () => {
        const deri = new ethers.Contract(aDeri, ABI_ERC20, PROVIDERS[network])
        const database = new ethers.Contract(A_DATABASE, ABI_DATABASE, PROVIDERS['BscTestnet'])
        const balance = nn(await deri.balanceOf(aBurner))
        const signature = await database.signature(aBurner)
        return {balance, signature}
    }

    const udpateOtherBurner = async () => {
        const deri = new ethers.Contract(aDeri, ABI_ERC20, PROVIDERS[network])
        const balance = nn(await deri.balanceOf(aBurner))
        return {balance}
    }

    const updateBurner = network === 'Ethereum' ? udpateEthereumBurner : udpateOtherBurner

    const update = useCallback(async () => {
        const updates = await updateBurner()
        setState({...state, ...updates})
    }, [])

    useEffect(() => {
        update()
    }, [update])

    const onBridgeDeriToEthereumBurner = async () => {
        const burner = new ethers.Contract(aBurner, ABI_BURNER, provider.getSigner())
        const tx = await executeTx(burner.bridgeDeriToEthereumBurner)
        if (tx) await update()
    }

    const onClaimAndBurnDeri = async () => {
        const burner = new ethers.Contract(aBurner, ABI_BURNER, provider.getSigner())
        const tx = await executeTx(burner.claimAndBurnDeri, [
            state.signature.amount,
            state.signature.fromChainId,
            state.signature.fromWormhole,
            state.signature.nonce,
            state.signature.v,
            state.signature.r,
            state.signature.s
        ])
        if (tx) await update()
    }

    return (
        <tr>
            <td>{network}</td>
            <td><Address address={aBurner}/></td>
            <td><Address address={aDeri}/></td>
            <td>{state.balance}<span style={{color:'blue'}}>{network === 'Ethereum' && ` (Claimable: ${state.signature.valid ? nn(state.signature.amount) : 0})`}</span></td>
            <td><Address address={aSigner}/></td>
            <td>{
                network === 'Ethereum' ?
                <CButton network={network} text='ClaimAndBurnDeri' onClick={onClaimAndBurnDeri}/> :
                <CButton network={network} text='BridgeDeriToEthereumBurner' onClick={onBridgeDeriToEthereumBurner}/>
            }</td>
        </tr>
    )
}

export const BurnDeriBurners = () => {
    return (
        <div>
            <table>
            <tbody>
                <tr>
                    <td>Network</td>
                    <td>Burner</td>
                    <td>Deri</td>
                    <td>DeriBalance</td>
                    <td>Signer</td>
                    <td></td>
                </tr>
                {BURNERS.map((row, idx) => (
                    <BurnDeriBurnersRow key={idx} {...row}/>
                ))}
            </tbody>
            </table>
        </div>
    )
}
