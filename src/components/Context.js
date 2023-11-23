import React, { createContext, useState, useCallback, useContext } from 'react';

// 创建Context
export const SuggestedSendAmountContext = createContext();

// 创建一个Provider组件
export const SuggestedSendAmountProvider = ({ children }) => {
    const [suggestedSendAmount, setSuggestedSendAmount] = useState({Arbitrum: 0, Zksync: 0, Linea: 0});

    console.log(suggestedSendAmount)
    return (
        <SuggestedSendAmountContext.Provider value={{ suggestedSendAmount, setSuggestedSendAmount }}>
            {children}
        </SuggestedSendAmountContext.Provider>
    );
};
