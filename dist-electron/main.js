import { app as l, BrowserWindow as g, ipcMain as s, dialog as v, Menu as w } from "electron";
import { fileURLToPath as x } from "url";
import { dirname as C, join as n } from "path";
import { existsSync as i, readFileSync as M, writeFileSync as A } from "fs";
process.env.VITE_DEV_SERVER_URL && (process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true");
const E = x(import.meta.url), u = C(E);
let d = "0.0.1", m = "Coca Tet", p = `${m} v${d}`;
try {
  const o = n(u, "../package.json");
  i(o) && (d = JSON.parse(M(o, "utf-8")).version || "0.0.1", p = `${m} v${d}`);
} catch (o) {
  console.warn("Failed to read package.json version:", o.message);
}
let a;
function h() {
  const o = l.isPackaged ? n(process.resourcesPath, "build", "icon.ico") : n(u, "../build/icon.ico"), r = i(o) ? o : i(o.replace(".ico", ".png")) ? o.replace(".ico", ".png") : n(u, "../public/logo.png"), e = !!process.env.VITE_DEV_SERVER_URL;
  a = new g({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: n(u, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0,
      // Trong dev mode, cần tắt webSecurity để Vite HMR hoạt động
      // Trong production, webSecurity sẽ được bật (mặc định true)
      webSecurity: !e,
      allowRunningInsecureContent: !1,
      experimentalFeatures: !1,
      sandbox: !1
      // Cần false để preload script hoạt động
    },
    title: p,
    icon: r,
    autoHideMenuBar: l.isPackaged
  }), l.isPackaged && w.setApplicationMenu(null), (() => {
    if (process.env.VITE_DEV_SERVER_URL)
      console.log("Loading from dev server:", process.env.VITE_DEV_SERVER_URL), a.loadURL(process.env.VITE_DEV_SERVER_URL).catch((c) => {
        console.error("Failed to load dev server:", c), setTimeout(() => {
          a.loadURL(process.env.VITE_DEV_SERVER_URL).catch((f) => {
            console.error("Retry failed:", f);
            const y = n(u, "../dist/index.html");
            i(y) && (console.log("Falling back to production build"), a.loadFile(y));
          });
        }, 2e3);
      }), a.webContents.openDevTools();
    else {
      const c = n(u, "../dist/index.html");
      i(c) ? a.loadFile(c) : console.error("No production build found and no dev server URL");
    }
  })(), a.once("ready-to-show", () => {
    a.setTitle(p);
  }), a.on("closed", () => {
    a = null;
  });
}
function P() {
  s.handle("convert:spc", async (o, r, e) => {
    try {
      const { convertSPC: t } = await import("./spcConverter-BNtYN1C5.js");
      return { success: !0, data: await t(r, e) };
    } catch (t) {
      return console.error("Convert SPC error:", t), { success: !1, error: t.message };
    }
  }), s.handle("file:save", async (o, r, e) => {
    try {
      const { filePath: t } = await v.showSaveDialog(a, {
        defaultPath: e || "output.txt",
        filters: [
          { name: "Text Files", extensions: ["txt"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      return t ? (A(t, r, "utf-8"), { success: !0, path: t }) : { success: !1, cancelled: !0 };
    } catch (t) {
      return console.error("Save file error:", t), { success: !1, error: t.message };
    }
  }), s.handle("proxies:getAll", async (o, r, e) => {
    try {
      const { ProxyModel: t } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: t.getAll(r, e) };
    } catch (t) {
      return console.error("Get proxies error:", t), { success: !1, error: t.message };
    }
  }), s.handle("proxies:getById", async (o, r) => {
    try {
      const { ProxyModel: e } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get proxy error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxies:create", async (o, r) => {
    try {
      const { ProxyModel: e } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create proxy error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxies:update", async (o, r, e) => {
    try {
      const { ProxyModel: t } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update proxy error:", t), { success: !1, error: t.message };
    }
  }), s.handle("proxies:delete", async (o, r) => {
    try {
      const { ProxyModel: e } = await import("./proxy-BhrvRrVC.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete proxy error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxies:deleteAll", async (o) => {
    try {
      const { ProxyModel: r } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: r.deleteAll() };
    } catch (r) {
      return console.error("Delete all proxies error:", r), { success: !1, error: r.message };
    }
  }), s.handle("proxies:bulkCreate", async (o, r, e) => {
    try {
      const { ProxyModel: t } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: t.bulkCreate(r, e) };
    } catch (t) {
      return console.error("Bulk create proxies error:", t), { success: !1, error: t.message };
    }
  }), s.handle("proxies:parseString", async (o, r) => {
    try {
      const { ProxyModel: e } = await import("./proxy-BhrvRrVC.js");
      return { success: !0, data: e.parseProxyString(r) };
    } catch (e) {
      return console.error("Parse proxy string error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxies:validate", async (o, r) => {
    try {
      if (!r.host || !r.port)
        return { success: !1, error: "Host and port are required" };
      const e = parseInt(r.port, 10);
      return isNaN(e) || e < 1 || e > 65535 ? { success: !1, error: "Invalid port number" } : { success: !0 };
    } catch (e) {
      return console.error("Validate proxy error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxyCollections:getAll", async (o) => {
    try {
      const { ProxyCollectionModel: r } = await import("./proxyCollection-CJs8ZUAO.js");
      return { success: !0, data: r.getAll() };
    } catch (r) {
      return console.error("Get proxy collections error:", r), { success: !1, error: r.message };
    }
  }), s.handle("proxyCollections:getById", async (o, r) => {
    try {
      const { ProxyCollectionModel: e } = await import("./proxyCollection-CJs8ZUAO.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get proxy collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxyCollections:create", async (o, r) => {
    try {
      const { ProxyCollectionModel: e } = await import("./proxyCollection-CJs8ZUAO.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create proxy collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("proxyCollections:update", async (o, r, e) => {
    try {
      const { ProxyCollectionModel: t } = await import("./proxyCollection-CJs8ZUAO.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update proxy collection error:", t), { success: !1, error: t.message };
    }
  }), s.handle("proxyCollections:delete", async (o, r) => {
    try {
      const { ProxyCollectionModel: e } = await import("./proxyCollection-CJs8ZUAO.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete proxy collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accountCollections:getAll", async (o) => {
    try {
      const { AccountCollectionModel: r } = await import("./accountCollection-Cek0Zzf-.js");
      return { success: !0, data: r.getAll() };
    } catch (r) {
      return console.error("Get account collections error:", r), { success: !1, error: r.message };
    }
  }), s.handle("accountCollections:getById", async (o, r) => {
    try {
      const { AccountCollectionModel: e } = await import("./accountCollection-Cek0Zzf-.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get account collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accountCollections:create", async (o, r) => {
    try {
      const { AccountCollectionModel: e } = await import("./accountCollection-Cek0Zzf-.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create account collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accountCollections:update", async (o, r, e) => {
    try {
      const { AccountCollectionModel: t } = await import("./accountCollection-Cek0Zzf-.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update account collection error:", t), { success: !1, error: t.message };
    }
  }), s.handle("accountCollections:delete", async (o, r) => {
    try {
      const { AccountCollectionModel: e } = await import("./accountCollection-Cek0Zzf-.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete account collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accounts:getAll", async (o, r, e) => {
    try {
      const { AccountModel: t } = await import("./account-CE_Y73EV.js");
      return { success: !0, data: t.getAll(r, e) };
    } catch (t) {
      return console.error("Get accounts error:", t), { success: !1, error: t.message };
    }
  }), s.handle("accounts:getById", async (o, r) => {
    try {
      const { AccountModel: e } = await import("./account-CE_Y73EV.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get account error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accounts:create", async (o, r) => {
    try {
      const { AccountModel: e } = await import("./account-CE_Y73EV.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create account error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accounts:update", async (o, r, e) => {
    try {
      const { AccountModel: t } = await import("./account-CE_Y73EV.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update account error:", t), { success: !1, error: t.message };
    }
  }), s.handle("accounts:delete", async (o, r) => {
    try {
      const { AccountModel: e } = await import("./account-CE_Y73EV.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete account error:", e), { success: !1, error: e.message };
    }
  }), s.handle("accounts:bulkCreate", async (o, r, e) => {
    try {
      const { AccountModel: t } = await import("./account-CE_Y73EV.js");
      return { success: !0, data: t.bulkCreate(r, e) };
    } catch (t) {
      return console.error("Bulk create accounts error:", t), { success: !1, error: t.message };
    }
  }), s.handle("codeCollections:getAll", async (o) => {
    try {
      const { CodeCollectionModel: r } = await import("./codeCollection-D_mt76Fv.js");
      return { success: !0, data: r.getAll() };
    } catch (r) {
      return console.error("Get code collections error:", r), { success: !1, error: r.message };
    }
  }), s.handle("codeCollections:getById", async (o, r) => {
    try {
      const { CodeCollectionModel: e } = await import("./codeCollection-D_mt76Fv.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get code collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codeCollections:create", async (o, r) => {
    try {
      const { CodeCollectionModel: e } = await import("./codeCollection-D_mt76Fv.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create code collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codeCollections:update", async (o, r, e) => {
    try {
      const { CodeCollectionModel: t } = await import("./codeCollection-D_mt76Fv.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update code collection error:", t), { success: !1, error: t.message };
    }
  }), s.handle("codeCollections:delete", async (o, r) => {
    try {
      const { CodeCollectionModel: e } = await import("./codeCollection-D_mt76Fv.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete code collection error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codes:getAll", async (o, r, e) => {
    try {
      const { CodeModel: t } = await import("./code-CBAFmCXE.js");
      return { success: !0, data: t.getAll(r, e) };
    } catch (t) {
      return console.error("Get codes error:", t), { success: !1, error: t.message };
    }
  }), s.handle("codes:getById", async (o, r) => {
    try {
      const { CodeModel: e } = await import("./code-CBAFmCXE.js");
      return { success: !0, data: e.getById(r) };
    } catch (e) {
      return console.error("Get code error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codes:create", async (o, r) => {
    try {
      const { CodeModel: e } = await import("./code-CBAFmCXE.js");
      return { success: !0, data: e.create(r) };
    } catch (e) {
      return console.error("Create code error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codes:update", async (o, r, e) => {
    try {
      const { CodeModel: t } = await import("./code-CBAFmCXE.js");
      return { success: !0, data: t.update(r, e) };
    } catch (t) {
      return console.error("Update code error:", t), { success: !1, error: t.message };
    }
  }), s.handle("codes:delete", async (o, r) => {
    try {
      const { CodeModel: e } = await import("./code-CBAFmCXE.js");
      return e.delete(r), { success: !0 };
    } catch (e) {
      return console.error("Delete code error:", e), { success: !1, error: e.message };
    }
  }), s.handle("codes:bulkCreate", async (o, r, e) => {
    try {
      const { CodeModel: t } = await import("./code-CBAFmCXE.js");
      return { success: !0, data: t.bulkCreate(r, e) };
    } catch (t) {
      return console.error("Bulk create codes error:", t), { success: !1, error: t.message };
    }
  }), s.handle("exchangeGift:start", async (o, r) => {
    try {
      const { startExchangeGift: e } = await import("./exchangeGiftService-DiRt1g25.js");
      return await e(r);
    } catch (e) {
      return console.error("Start exchange gift error:", e), { success: !1, error: e.message };
    }
  }), s.handle("exchangeGift:stop", async (o) => {
    try {
      const { stopExchangeGift: r } = await import("./exchangeGiftService-DiRt1g25.js");
      return r();
    } catch (r) {
      return console.error("Stop exchange gift error:", r), { success: !1, error: r.message };
    }
  }), s.handle("exchangeGift:getProgress", async (o) => {
    try {
      const { getExchangeGiftProgress: r } = await import("./exchangeGiftService-DiRt1g25.js");
      return r();
    } catch (r) {
      return console.error("Get exchange gift progress error:", r), { success: !1, error: r.message };
    }
  }), s.handle("exchangeGift:getLogs", async (o) => {
    try {
      const { getExchangeGiftLogs: r } = await import("./exchangeGiftService-DiRt1g25.js");
      return r();
    } catch (r) {
      return console.error("Get exchange gift logs error:", r), { success: !1, error: r.message };
    }
  });
}
l.whenReady().then(async () => {
  try {
    const { initDatabase: o } = await import("./index-ThqdRj4W.js").then((r) => r.i);
    o(), console.log("✅ Database initialized");
  } catch (o) {
    console.error("❌ Database initialization failed:", o);
  }
  P(), h(), l.on("activate", () => {
    g.getAllWindows().length === 0 && h();
  });
});
l.on("window-all-closed", () => {
  process.platform !== "darwin" && l.quit();
});
