import {Button} from 'react-bootstrap'

export const CButton = ({network, text, onClick}) => {
    const color = (() => {
        switch (network) {
            case 'Ethereum':
                return '#3390FF'
            case 'Bsc':
                return '#FF9C33'
            case 'Arbitrum':
                return '#0A7643'
            case 'zkSync':
                return '#00008B'
            case 'Polygon':
                return '#6C7C75'
            default:
                return '#8E2E5A'
        }
    })()
    return (
        <Button onClick={onClick} style={{backgroundColor: color}}>{text}</Button>
    )
}
