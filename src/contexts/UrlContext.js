import React, { createContext, useContext } from 'react';

const UrlContext = createContext();

export const UrlProvider = ({ children }) => {
    const url = '13.235.62.21:7001';
    return (
        <UrlContext.Provider value={url}>
            {children}
        </UrlContext.Provider>
    );
};

export const useUrl = () => {
    return useContext(UrlContext);
};
