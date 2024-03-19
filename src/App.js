import { MintDeri } from './components/MintDeri'
import { SendDeri } from './components/SendDeri'
import { MintAndSendAll } from './components/MintAndSendAll'
// import {SwitchOracle} from './components/SwitchOracle'
import { SetRewardVaultSpeed2 } from './components/SetRewardVaultSpeed2'
import { BurnDeri } from './components/BurnDeri'
import { BurnDeriArbitrum } from './components/BurnDeriArbitrum'
import { ArbitrumProtocolFeeManager, OtherProtocolFeeManager } from './components/ProtocolFeeManager'
import { SuggestedSendAmountProvider } from './components/Context'
import React, { createContext, useState, useContext } from 'react';


function App() {
    return (
        <SuggestedSendAmountProvider>
            <div className="App">
                <h3>Deri V4 Auxiliary (20240319)</h3>
                <MintAndSendAll />
                <SetRewardVaultSpeed2 />
                <BurnDeri />
                <ArbitrumProtocolFeeManager />
                <OtherProtocolFeeManager />
                {/* <BurnDeriArbitrum /> */}
            </div>
        </SuggestedSendAmountProvider>
    )
}

export default App
