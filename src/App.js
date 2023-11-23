import { MintDeri } from './components/MintDeri'
import { SendDeri } from './components/SendDeri'
import { MintAndSendAll } from './components/MintAndSendAll'
// import {SwitchOracle} from './components/SwitchOracle'
import { SetRewardVaultSpeed2 } from './components/SetRewardVaultSpeed2'
import { BurnDeri } from './components/BurnDeri'
import { BurnDeriArbitrum } from './components/BurnDeriArbitrum'
import { SuggestedSendAmountProvider } from './components/Context'
import React, { createContext, useState, useContext } from 'react';


function App() {
    return (
        <SuggestedSendAmountProvider>
            <div className="App">
                <h3>Deri V4 Auxiliary (20231123)</h3>
                <MintAndSendAll />
                {/* <MintDeri/> */}
                {/* <SendDeri/> */}
                <SetRewardVaultSpeed2 />
                <BurnDeri />
                <BurnDeriArbitrum />
            </div>
        </SuggestedSendAmountProvider>
    )
}

export default App
