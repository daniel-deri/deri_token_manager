import {useState} from 'react'
import {ethers} from 'ethers'
import {Button, Form} from 'react-bootstrap'
import {provider, bb, executeTx} from './Chain'
import {Address} from './Address'
import {CButton} from './CButton'

const MINTER_ADDRESS = '0x919735d147185788D8A29942baC49A5164A1Bfd6'
const DERI_ADDRESS = '0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9'
const DERI_ABI = [
    'function nonces(address account) view returns (uint256)',
    'function mint(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)'
]

export const MintDeri = () => {
    const [amount, setAmount] = useState('')

    const onMint = async () => {
        const signer = provider.getSigner()
        const deri = new ethers.Contract(DERI_ADDRESS, DERI_ABI, signer)
        const nonce = await deri.nonces(MINTER_ADDRESS)
        const deadline = parseInt(Date.now() / 86400000 + 1) * 86400
        const domain = {
            name: 'Deri',
            chainId: 1,
            verifyingContract: DERI_ADDRESS
        }
        const types = {
            Mint: [
                {name: 'account', type: 'address'},
                {name: 'amount', type: 'uint256'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'}
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
        await executeTx(deri.mint, [MINTER_ADDRESS, bb(amount), deadline, sig.v, sig.r, sig.s])
    }

    return (
        <div>
            <h5>Mint Deri</h5>
            <table>
            <tbody>
                <tr>
                    <td>Network</td>
                    <td>Deri</td>
                    <td>Signer</td>
                    <td>Amount</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Ethereum</td>
                    <td><Address address={DERI_ADDRESS}/></td>
                    <td><Address address={MINTER_ADDRESS}/></td>
                    <td><Form.Control value={amount} onChange={(e) => {setAmount(e.target.value)}}/></td>
                    <td><CButton network='Ethereum' text='Mint' onClick={onMint}/></td>
                </tr>
            </tbody>
            </table>
        </div>
    )
}
