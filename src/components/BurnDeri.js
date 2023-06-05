import {BurnDeriPools} from './BurnDeriPools'
import {BurnDeriCollectors} from './BurnDeriCollectors'
import {BurnDeriBurners} from './BurnDeriBurners'

export const BurnDeri = () => {
    return (
        <div>
            <h5>Burn Deri</h5>
            <BurnDeriPools/>
            <BurnDeriCollectors/>
            <BurnDeriBurners/>
        </div>
    )
}
