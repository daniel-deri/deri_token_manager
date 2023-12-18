import { ethers } from 'ethers'

export const ONE = ethers.utils.parseEther('1')
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MAX = ethers.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')

export const CHAINID_NETWORK = {
    1: 'Ethereum',
    56: 'Bsc',
    137: 'Polygon',
    42161: 'Arbitrum',
    324: 'Zksync',
    5: 'Goerli',
    97: 'BscTestnet',
    421613: 'ArbitrumTestnet',
    59144: 'Linea',
    20231119:'Dchain',
    534352: 'Scroll',

}

export const PROVIDERS = {
    Ethereum: new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
    Bsc: new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org/'),
    Arbitrum: new ethers.providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
    Zksync: new ethers.providers.JsonRpcProvider('https://mainnet.era.zksync.io'),
    Polygon: new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/'),
    Goerli: new ethers.providers.JsonRpcProvider('https://dry-solemn-lambo.ethereum-goerli.quiknode.pro/5143675172d55e2d8866d16c6f177a6adb4d8466/'),
    BscTestnet: new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s2.binance.org:8545'),
    ArbitrumTestnet: new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc'),
    Linea: new ethers.providers.JsonRpcBatchProvider('https://linea-mainnet.infura.io/v3/7969d99b41d84a06a6809668daaa4a46'),
    Dchain: new ethers.providers.JsonRpcBatchProvider('https://rpc-dchain.deri.io'),
    Scroll: new ethers.providers.JsonRpcBatchProvider('https://rpc.ankr.com/scroll')
    // Localhost: new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'),
}


export const bb = (value, decimals = 18) => {
    return value && ethers.utils.parseUnits(value.toString(), decimals)
}

export const nn = (value, decimals = 18) => {
    return value && ethers.utils.formatUnits(value, decimals)
}

export const provider = new ethers.providers.Web3Provider(window.ethereum)

export const connectMetaMask = async () => {
    await provider.send('eth_requestAccounts', [])
}

export const executeTx = async (func, args = []) => {
    try {
        return await func(...args)
    } catch (error) {
        const message = `Transaction will fail with reason:\n${error?.reason || error?.message || error}\n\nWould you like to send the transaction anyway?`
        if (window.confirm(message)) {
            return await func(...args, { gasLimit: 1000000 })
        }
    }
}

window.ethereum.on('chainChanged', (chainId) => {
    window.location.reload()
})

window.ethereum.on('accountsChanged', (accounts) => {
    window.location.reload()
})
