import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Convert SPC_F to SPC_ST
    convertSPC: (entries, proxyId) => ipcRenderer.invoke('convert:spc', entries, proxyId),
    
    // Save file
    saveFile: (content, defaultFilename) => ipcRenderer.invoke('file:save', content, defaultFilename),
    
    // Proxies
    getProxies: (collectionId, status) => ipcRenderer.invoke('proxies:getAll', collectionId, status),
    getProxy: (id) => ipcRenderer.invoke('proxies:getById', id),
    createProxy: (data) => ipcRenderer.invoke('proxies:create', data),
    updateProxy: (id, data) => ipcRenderer.invoke('proxies:update', id, data),
    deleteProxy: (id) => ipcRenderer.invoke('proxies:delete', id),
    deleteAllProxies: (collectionId) => ipcRenderer.invoke('proxies:deleteAll', collectionId),
    deleteAllProxies: (collectionId) => ipcRenderer.invoke('proxies:deleteAll', collectionId),
    bulkCreateProxies: (proxies, collectionId) => ipcRenderer.invoke('proxies:bulkCreate', proxies, collectionId),
    parseProxyString: (proxyString) => ipcRenderer.invoke('proxies:parseString', proxyString),
    validateProxy: (proxyData) => ipcRenderer.invoke('proxies:validate', proxyData),
    
    // Proxy Collections
    getProxyCollections: () => ipcRenderer.invoke('proxyCollections:getAll'),
    getProxyCollection: (id) => ipcRenderer.invoke('proxyCollections:getById', id),
    createProxyCollection: (data) => ipcRenderer.invoke('proxyCollections:create', data),
    updateProxyCollection: (id, data) => ipcRenderer.invoke('proxyCollections:update', id, data),
    deleteProxyCollection: (id) => ipcRenderer.invoke('proxyCollections:delete', id),
    
    // Account Collections
    getAccountCollections: () => ipcRenderer.invoke('accountCollections:getAll'),
    getAccountCollection: (id) => ipcRenderer.invoke('accountCollections:getById', id),
    createAccountCollection: (data) => ipcRenderer.invoke('accountCollections:create', data),
    updateAccountCollection: (id, data) => ipcRenderer.invoke('accountCollections:update', id, data),
    deleteAccountCollection: (id) => ipcRenderer.invoke('accountCollections:delete', id),
    
    // Accounts
    getAccounts: (collectionId, status) => ipcRenderer.invoke('accounts:getAll', collectionId, status),
    getAccount: (id) => ipcRenderer.invoke('accounts:getById', id),
    createAccount: (data) => ipcRenderer.invoke('accounts:create', data),
    updateAccount: (id, data) => ipcRenderer.invoke('accounts:update', id, data),
    deleteAccount: (id) => ipcRenderer.invoke('accounts:delete', id),
    deleteAllAccounts: (collectionId) => ipcRenderer.invoke('accounts:deleteAll', collectionId),
    bulkCreateAccounts: (accounts, collectionId) => ipcRenderer.invoke('accounts:bulkCreate', accounts, collectionId),
    
    // Code Collections
    getCodeCollections: () => ipcRenderer.invoke('codeCollections:getAll'),
    getCodeCollection: (id) => ipcRenderer.invoke('codeCollections:getById', id),
    createCodeCollection: (data) => ipcRenderer.invoke('codeCollections:create', data),
    updateCodeCollection: (id, data) => ipcRenderer.invoke('codeCollections:update', id, data),
    deleteCodeCollection: (id) => ipcRenderer.invoke('codeCollections:delete', id),
    
    // Codes
    getCodes: (collectionId, status) => ipcRenderer.invoke('codes:getAll', collectionId, status),
    getCode: (id) => ipcRenderer.invoke('codes:getById', id),
    createCode: (data) => ipcRenderer.invoke('codes:create', data),
    updateCode: (id, data) => ipcRenderer.invoke('codes:update', id, data),
    deleteCode: (id) => ipcRenderer.invoke('codes:delete', id),
    deleteAllCodes: (collectionId) => ipcRenderer.invoke('codes:deleteAll', collectionId),
    bulkCreateCodes: (codes, collectionId) => ipcRenderer.invoke('codes:bulkCreate', codes, collectionId),
    
    // Exchange Gift Task
    startExchangeGift: (config) => ipcRenderer.invoke('exchangeGift:start', config),
    stopExchangeGift: () => ipcRenderer.invoke('exchangeGift:stop'),
    getExchangeGiftProgress: () => ipcRenderer.invoke('exchangeGift:getProgress'),
    getExchangeGiftLogs: () => ipcRenderer.invoke('exchangeGift:getLogs'),
    getExchangeGiftPrizes: () => ipcRenderer.invoke('exchangeGift:getPrizes'),
    
    // Gift APIs
    getMyGifts: (accountId, limit, page, proxy) => ipcRenderer.invoke('gift:getMyGifts', accountId, limit, page, proxy),
    getGiftUserLuckyDraws: (campaignId, giftId, limit, page) => ipcRenderer.invoke('gift:getGiftUserLuckyDraws', campaignId, giftId, limit, page),
    getListGifts: (campaignId, limit, page) => ipcRenderer.invoke('gift:getListGifts', campaignId, limit, page),
    
    // Account Token Check
    checkAllAccountsToken: (accountCollectionId) => ipcRenderer.invoke('accounts:checkAllTokens', accountCollectionId),
    
    // Proxy Status Check
    checkAllProxiesStatus: (proxyCollectionId) => ipcRenderer.invoke('proxies:checkAllStatus', proxyCollectionId),
});
