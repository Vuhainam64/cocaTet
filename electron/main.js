import { app, BrowserWindow, Menu, ipcMain, dialog } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync, writeFileSync } from "fs";

// Suppress security warnings trong dev mode (chúng sẽ không xuất hiện trong production)
if (process.env.VITE_DEV_SERVER_URL) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get app version from package.json
let appVersion = "0.0.1";
let appName = "Coca Tet";
let appTitle = `${appName} v${appVersion}`;

try {
  const packageJsonPath = join(__dirname, "../package.json");
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    appVersion = packageJson.version || "0.0.1";
    appTitle = `${appName} v${appVersion}`;
  }
} catch (error) {
  console.warn("Failed to read package.json version:", error.message);
}

let mainWindow;

function createWindow() {
  // Determine icon path (works for both dev and production)
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, "build", "icon.ico")
    : join(__dirname, "../build/icon.ico");

  // Fallback to PNG if ICO doesn't exist
  const icon = existsSync(iconPath)
    ? iconPath
    : existsSync(iconPath.replace(".ico", ".png"))
    ? iconPath.replace(".ico", ".png")
    : join(__dirname, "../public/logo.png");

  const isDev = !!process.env.VITE_DEV_SERVER_URL;
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      // Trong dev mode, cần tắt webSecurity để Vite HMR hoạt động
      // Trong production, webSecurity sẽ được bật (mặc định true)
      webSecurity: !isDev,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      sandbox: false, // Cần false để preload script hoạt động
    },
    title: appTitle,
    icon: icon,
    autoHideMenuBar: app.isPackaged,
  });


  // Remove menu bar completely only in production
  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  // Load the app
  const loadApp = () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      console.log("Loading from dev server:", process.env.VITE_DEV_SERVER_URL);
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch((error) => {
        console.error("Failed to load dev server:", error);
        // Retry after a short delay
        setTimeout(() => {
          mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch((err) => {
            console.error("Retry failed:", err);
            // Fallback to production build if available
            const prodPath = join(__dirname, "../dist/index.html");
            if (existsSync(prodPath)) {
              console.log("Falling back to production build");
              mainWindow.loadFile(prodPath);
            }
          });
        }, 2000);
      });
      mainWindow.webContents.openDevTools();
    } else {
      const prodPath = join(__dirname, "../dist/index.html");
      if (existsSync(prodPath)) {
        mainWindow.loadFile(prodPath);
      } else {
        console.error("No production build found and no dev server URL");
      }
    }
  };

  loadApp();

  // Set title after window is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.setTitle(appTitle);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC Handlers
function setupIpcHandlers() {
  // Convert SPC_F to SPC_ST
  ipcMain.handle('convert:spc', async (event, entries, proxyId) => {
    try {
      const { convertSPC } = await import('./utils/spcConverter.js');
      const result = await convertSPC(entries, proxyId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Convert SPC error:', error);
      return { success: false, error: error.message };
    }
  });

  // Save file
  ipcMain.handle('file:save', async (event, content, defaultFilename) => {
    try {
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultFilename || 'output.txt',
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (filePath) {
        writeFileSync(filePath, content, 'utf-8');
        return { success: true, path: filePath };
      }
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Save file error:', error);
      return { success: false, error: error.message };
    }
  });

  // Proxies
  ipcMain.handle('proxies:getAll', async (event, collectionId, status) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const data = ProxyModel.getAll(collectionId, status);
      return { success: true, data };
    } catch (error) {
      console.error('Get proxies error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:getById', async (event, id) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const data = ProxyModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get proxy error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:create', async (event, data) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const result = ProxyModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create proxy error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:update', async (event, id, data) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const result = ProxyModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update proxy error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:delete', async (event, id) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      ProxyModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete proxy error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:deleteAll', async (event) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const result = ProxyModel.deleteAll();
      return { success: true, data: result };
    } catch (error) {
      console.error('Delete all proxies error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:bulkCreate', async (event, proxies, collectionId) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const result = ProxyModel.bulkCreate(proxies, collectionId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Bulk create proxies error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:parseString', async (event, proxyString) => {
    try {
      const { ProxyModel } = await import('./database/models/proxy.js');
      const result = ProxyModel.parseProxyString(proxyString);
      return { success: true, data: result };
    } catch (error) {
      console.error('Parse proxy string error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxies:validate', async (event, proxyData) => {
    try {
      if (!proxyData.host || !proxyData.port) {
        return { success: false, error: 'Host and port are required' };
      }
      const port = parseInt(proxyData.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { success: false, error: 'Invalid port number' };
      }
      return { success: true };
    } catch (error) {
      console.error('Validate proxy error:', error);
      return { success: false, error: error.message };
    }
  });

  // Proxy Collections
  ipcMain.handle('proxyCollections:getAll', async (event) => {
    try {
      const { ProxyCollectionModel } = await import('./database/models/proxyCollection.js');
      const data = ProxyCollectionModel.getAll();
      return { success: true, data };
    } catch (error) {
      console.error('Get proxy collections error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxyCollections:getById', async (event, id) => {
    try {
      const { ProxyCollectionModel } = await import('./database/models/proxyCollection.js');
      const data = ProxyCollectionModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get proxy collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxyCollections:create', async (event, data) => {
    try {
      const { ProxyCollectionModel } = await import('./database/models/proxyCollection.js');
      const result = ProxyCollectionModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create proxy collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxyCollections:update', async (event, id, data) => {
    try {
      const { ProxyCollectionModel } = await import('./database/models/proxyCollection.js');
      const result = ProxyCollectionModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update proxy collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxyCollections:delete', async (event, id) => {
    try {
      const { ProxyCollectionModel } = await import('./database/models/proxyCollection.js');
      ProxyCollectionModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete proxy collection error:', error);
      return { success: false, error: error.message };
    }
  });

  // Account Collections
  ipcMain.handle('accountCollections:getAll', async (event) => {
    try {
      const { AccountCollectionModel } = await import('./database/models/accountCollection.js');
      const data = AccountCollectionModel.getAll();
      return { success: true, data };
    } catch (error) {
      console.error('Get account collections error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accountCollections:getById', async (event, id) => {
    try {
      const { AccountCollectionModel } = await import('./database/models/accountCollection.js');
      const data = AccountCollectionModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get account collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accountCollections:create', async (event, data) => {
    try {
      const { AccountCollectionModel } = await import('./database/models/accountCollection.js');
      const result = AccountCollectionModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create account collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accountCollections:update', async (event, id, data) => {
    try {
      const { AccountCollectionModel } = await import('./database/models/accountCollection.js');
      const result = AccountCollectionModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update account collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accountCollections:delete', async (event, id) => {
    try {
      const { AccountCollectionModel } = await import('./database/models/accountCollection.js');
      AccountCollectionModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete account collection error:', error);
      return { success: false, error: error.message };
    }
  });

  // Accounts
  ipcMain.handle('accounts:getAll', async (event, collectionId, status) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      const data = AccountModel.getAll(collectionId, status);
      return { success: true, data };
    } catch (error) {
      console.error('Get accounts error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:getById', async (event, id) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      const data = AccountModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get account error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:create', async (event, data) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      const result = AccountModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create account error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:update', async (event, id, data) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      const result = AccountModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update account error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:delete', async (event, id) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      AccountModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:bulkCreate', async (event, accounts, collectionId) => {
    try {
      const { AccountModel } = await import('./database/models/account.js');
      const result = AccountModel.bulkCreate(accounts, collectionId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Bulk create accounts error:', error);
      return { success: false, error: error.message };
    }
  });

  // Code Collections
  ipcMain.handle('codeCollections:getAll', async (event) => {
    try {
      const { CodeCollectionModel } = await import('./database/models/codeCollection.js');
      const data = CodeCollectionModel.getAll();
      return { success: true, data };
    } catch (error) {
      console.error('Get code collections error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codeCollections:getById', async (event, id) => {
    try {
      const { CodeCollectionModel } = await import('./database/models/codeCollection.js');
      const data = CodeCollectionModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get code collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codeCollections:create', async (event, data) => {
    try {
      const { CodeCollectionModel } = await import('./database/models/codeCollection.js');
      const result = CodeCollectionModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create code collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codeCollections:update', async (event, id, data) => {
    try {
      const { CodeCollectionModel } = await import('./database/models/codeCollection.js');
      const result = CodeCollectionModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update code collection error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codeCollections:delete', async (event, id) => {
    try {
      const { CodeCollectionModel } = await import('./database/models/codeCollection.js');
      CodeCollectionModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete code collection error:', error);
      return { success: false, error: error.message };
    }
  });

  // Codes
  ipcMain.handle('codes:getAll', async (event, collectionId, status) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      const data = CodeModel.getAll(collectionId, status);
      return { success: true, data };
    } catch (error) {
      console.error('Get codes error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codes:getById', async (event, id) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      const data = CodeModel.getById(id);
      return { success: true, data };
    } catch (error) {
      console.error('Get code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codes:create', async (event, data) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      const result = CodeModel.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Create code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codes:update', async (event, id, data) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      const result = CodeModel.update(id, data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Update code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codes:delete', async (event, id) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      CodeModel.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('codes:bulkCreate', async (event, codes, collectionId) => {
    try {
      const { CodeModel } = await import('./database/models/code.js');
      const result = CodeModel.bulkCreate(codes, collectionId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Bulk create codes error:', error);
      return { success: false, error: error.message };
    }
  });

  // Exchange Gift Task
  ipcMain.handle('exchangeGift:start', async (event, config) => {
    try {
      const { startExchangeGift } = await import('./services/exchangeGiftService.js');
      const result = await startExchangeGift(config);
      return result;
    } catch (error) {
      console.error('Start exchange gift error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('exchangeGift:stop', async (event) => {
    try {
      const { stopExchangeGift } = await import('./services/exchangeGiftService.js');
      return stopExchangeGift();
    } catch (error) {
      console.error('Stop exchange gift error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('exchangeGift:getProgress', async (event) => {
    try {
      const { getExchangeGiftProgress } = await import('./services/exchangeGiftService.js');
      return getExchangeGiftProgress();
    } catch (error) {
      console.error('Get exchange gift progress error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('exchangeGift:getLogs', async (event) => {
    try {
      const { getExchangeGiftLogs } = await import('./services/exchangeGiftService.js');
      return getExchangeGiftLogs();
    } catch (error) {
      console.error('Get exchange gift logs error:', error);
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(async () => {
  // Initialize database
  try {
    const { initDatabase } = await import("./database/index.js");
    initDatabase();
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }

  setupIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
