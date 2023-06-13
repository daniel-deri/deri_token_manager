import { MintDeri } from './components/MintDeri'
import { SendDeri } from './components/SendDeri'
import { MintAndSendAll } from './components/MintAndSendAll'
// import {SwitchOracle} from './components/SwitchOracle'
import { SetRewardVaultSpeed2 } from './components/SetRewardVaultSpeed2'
import { BurnDeri } from './components/BurnDeri'
import { BurnDeriArbitrum } from './components/BurnDeriArbitrum'

function App() {
    return (
        <div className="App">
            <h3>Deri Auxiliary (20230613)</h3>
            <MintAndSendAll />
            {/* <MintDeri/> */}
            {/* <SendDeri/> */}
            <SetRewardVaultSpeed2 />
            <BurnDeri />
            <BurnDeriArbitrum />
        </div>
    )
}

export default App
