
export const Address = ({address}) => {
    return (
        <div onClick={() => navigator.clipboard.writeText(address)} style={{cursor: 'pointer'}}>
            <code>
                {address && address.slice(0, 6) + '...' + address.slice(38)}
            </code>
        </div>
    )
}
