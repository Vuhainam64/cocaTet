import { a as ae } from "./_commonjsHelpers-DQNKXVTB.js";
import A from "fs";
import O from "path";
import se from "util";
import { app as X } from "electron";
var N = { exports: {} };
function ne(o) {
  throw new Error('Could not dynamically require "' + o + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var R = {}, B;
function _() {
  return B || (B = 1, R.getBooleanOption = (o, r) => {
    let s = !1;
    if (r in o && typeof (s = o[r]) != "boolean")
      throw new TypeError(`Expected the "${r}" option to be a boolean`);
    return s;
  }, R.cppdb = /* @__PURE__ */ Symbol(), R.inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")), R;
}
var v, k;
function oe() {
  if (k) return v;
  k = 1;
  const o = { value: "SqliteError", writable: !0, enumerable: !1, configurable: !0 };
  function r(s, E) {
    if (new.target !== r)
      return new r(s, E);
    if (typeof E != "string")
      throw new TypeError("Expected second argument to be a string");
    Error.call(this, s), o.value = "" + s, Object.defineProperty(this, "message", o), Error.captureStackTrace(this, r), this.code = E;
  }
  return Object.setPrototypeOf(r, Error), Object.setPrototypeOf(r.prototype, Error.prototype), Object.defineProperty(r.prototype, "name", o), v = r, v;
}
var x = { exports: {} }, D, V;
function ce() {
  if (V) return D;
  V = 1;
  var o = O.sep || "/";
  D = r;
  function r(s) {
    if (typeof s != "string" || s.length <= 7 || s.substring(0, 7) != "file://")
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    var E = decodeURI(s.substring(7)), i = E.indexOf("/"), e = E.substring(0, i), n = E.substring(i + 1);
    return e == "localhost" && (e = ""), e && (e = o + o + e), n = n.replace(/^(.+)\|/, "$1:"), o == "\\" && (n = n.replace(/\//g, "\\")), /^.+\:/.test(n) || (n = o + n), e + n;
  }
  return D;
}
var z;
function ue() {
  return z || (z = 1, (function(o, r) {
    var s = A, E = O, i = ce(), e = E.join, n = E.dirname, c = s.accessSync && function(f) {
      try {
        s.accessSync(f);
      } catch {
        return !1;
      }
      return !0;
    } || s.existsSync || E.existsSync, p = {
      arrow: process.env.NODE_BINDINGS_ARROW || " → ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function b(f) {
      typeof f == "string" ? f = { bindings: f } : f || (f = {}), Object.keys(p).map(function(g) {
        g in f || (f[g] = p[g]);
      }), f.module_root || (f.module_root = r.getRoot(r.getFileName())), E.extname(f.bindings) != ".node" && (f.bindings += ".node");
      for (var h = typeof __webpack_require__ == "function" ? __non_webpack_require__ : ne, a = [], u = 0, t = f.try.length, d, T, l; u < t; u++) {
        d = e.apply(
          null,
          f.try[u].map(function(g) {
            return f[g] || g;
          })
        ), a.push(d);
        try {
          return T = f.path ? h.resolve(d) : h(d), f.path || (T.path = d), T;
        } catch (g) {
          if (g.code !== "MODULE_NOT_FOUND" && g.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(g.message))
            throw g;
        }
      }
      throw l = new Error(
        `Could not locate the bindings file. Tried:
` + a.map(function(g) {
          return f.arrow + g;
        }).join(`
`)
      ), l.tries = a, l;
    }
    o.exports = r = b, r.getFileName = function(h) {
      var a = Error.prepareStackTrace, u = Error.stackTraceLimit, t = {}, d;
      Error.stackTraceLimit = 10, Error.prepareStackTrace = function(l, g) {
        for (var w = 0, $ = g.length; w < $; w++)
          if (d = g[w].getFileName(), d !== __filename)
            if (h) {
              if (d !== h)
                return;
            } else
              return;
      }, Error.captureStackTrace(t), t.stack, Error.prepareStackTrace = a, Error.stackTraceLimit = u;
      var T = "file://";
      return d.indexOf(T) === 0 && (d = i(d)), d;
    }, r.getRoot = function(h) {
      for (var a = n(h), u; ; ) {
        if (a === "." && (a = process.cwd()), c(e(a, "package.json")) || c(e(a, "node_modules")))
          return a;
        if (u === a)
          throw new Error(
            'Could not find module root given file: "' + h + '". Do you have a `package.json` file? '
          );
        u = a, a = e(a, "..");
      }
    };
  })(x, x.exports)), x.exports;
}
var I = {}, G;
function le() {
  if (G) return I;
  G = 1;
  const { cppdb: o } = _();
  return I.prepare = function(s) {
    return this[o].prepare(s, this, !1);
  }, I.exec = function(s) {
    return this[o].exec(s), this;
  }, I.close = function() {
    return this[o].close(), this;
  }, I.loadExtension = function(...s) {
    return this[o].loadExtension(...s), this;
  }, I.defaultSafeIntegers = function(...s) {
    return this[o].defaultSafeIntegers(...s), this;
  }, I.unsafeMode = function(...s) {
    return this[o].unsafeMode(...s), this;
  }, I.getters = {
    name: {
      get: function() {
        return this[o].name;
      },
      enumerable: !0
    },
    open: {
      get: function() {
        return this[o].open;
      },
      enumerable: !0
    },
    inTransaction: {
      get: function() {
        return this[o].inTransaction;
      },
      enumerable: !0
    },
    readonly: {
      get: function() {
        return this[o].readonly;
      },
      enumerable: !0
    },
    memory: {
      get: function() {
        return this[o].memory;
      },
      enumerable: !0
    }
  }, I;
}
var S, Y;
function fe() {
  if (Y) return S;
  Y = 1;
  const { cppdb: o } = _(), r = /* @__PURE__ */ new WeakMap();
  S = function(e) {
    if (typeof e != "function") throw new TypeError("Expected first argument to be a function");
    const n = this[o], c = s(n, this), { apply: p } = Function.prototype, b = {
      default: { value: E(p, e, n, c.default) },
      deferred: { value: E(p, e, n, c.deferred) },
      immediate: { value: E(p, e, n, c.immediate) },
      exclusive: { value: E(p, e, n, c.exclusive) },
      database: { value: this, enumerable: !0 }
    };
    return Object.defineProperties(b.default.value, b), Object.defineProperties(b.deferred.value, b), Object.defineProperties(b.immediate.value, b), Object.defineProperties(b.exclusive.value, b), b.default.value;
  };
  const s = (i, e) => {
    let n = r.get(i);
    if (!n) {
      const c = {
        commit: i.prepare("COMMIT", e, !1),
        rollback: i.prepare("ROLLBACK", e, !1),
        savepoint: i.prepare("SAVEPOINT `	_bs3.	`", e, !1),
        release: i.prepare("RELEASE `	_bs3.	`", e, !1),
        rollbackTo: i.prepare("ROLLBACK TO `	_bs3.	`", e, !1)
      };
      r.set(i, n = {
        default: Object.assign({ begin: i.prepare("BEGIN", e, !1) }, c),
        deferred: Object.assign({ begin: i.prepare("BEGIN DEFERRED", e, !1) }, c),
        immediate: Object.assign({ begin: i.prepare("BEGIN IMMEDIATE", e, !1) }, c),
        exclusive: Object.assign({ begin: i.prepare("BEGIN EXCLUSIVE", e, !1) }, c)
      });
    }
    return n;
  }, E = (i, e, n, { begin: c, commit: p, rollback: b, savepoint: f, release: h, rollbackTo: a }) => function() {
    let t, d, T;
    n.inTransaction ? (t = f, d = h, T = a) : (t = c, d = p, T = b), t.run();
    try {
      const l = i.call(e, this, arguments);
      if (l && typeof l.then == "function")
        throw new TypeError("Transaction function cannot return a promise");
      return d.run(), l;
    } catch (l) {
      throw n.inTransaction && (T.run(), T !== b && d.run()), l;
    }
  };
  return S;
}
var M, K;
function de() {
  if (K) return M;
  K = 1;
  const { getBooleanOption: o, cppdb: r } = _();
  return M = function(E, i) {
    if (i == null && (i = {}), typeof E != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof i != "object") throw new TypeError("Expected second argument to be an options object");
    const e = o(i, "simple"), n = this[r].prepare(`PRAGMA ${E}`, this, !0);
    return e ? n.pluck().get() : n.all();
  }, M;
}
var L, W;
function pe() {
  if (W) return L;
  W = 1;
  const o = A, r = O, { promisify: s } = se, { cppdb: E } = _(), i = s(o.access);
  L = async function(c, p) {
    if (p == null && (p = {}), typeof c != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof p != "object") throw new TypeError("Expected second argument to be an options object");
    c = c.trim();
    const b = "attached" in p ? p.attached : "main", f = "progress" in p ? p.progress : null;
    if (!c) throw new TypeError("Backup filename cannot be an empty string");
    if (c === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof b != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!b) throw new TypeError('The "attached" option cannot be an empty string');
    if (f != null && typeof f != "function") throw new TypeError('Expected the "progress" option to be a function');
    await i(r.dirname(c)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const h = await i(c).then(() => !1, () => !0);
    return e(this[E].backup(this, b, c, h), f || null);
  };
  const e = (n, c) => {
    let p = 0, b = !0;
    return new Promise((f, h) => {
      setImmediate(function a() {
        try {
          const u = n.transfer(p);
          if (!u.remainingPages) {
            n.close(), f(u);
            return;
          }
          if (b && (b = !1, p = 100), c) {
            const t = c(u);
            if (t !== void 0)
              if (typeof t == "number" && t === t) p = Math.max(0, Math.min(2147483647, Math.round(t)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
          }
          setImmediate(a);
        } catch (u) {
          n.close(), h(u);
        }
      });
    });
  };
  return L;
}
var U, H;
function Ee() {
  if (H) return U;
  H = 1;
  const { cppdb: o } = _();
  return U = function(s) {
    if (s == null && (s = {}), typeof s != "object") throw new TypeError("Expected first argument to be an options object");
    const E = "attached" in s ? s.attached : "main";
    if (typeof E != "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!E) throw new TypeError('The "attached" option cannot be an empty string');
    return this[o].serialize(E);
  }, U;
}
var C, Q;
function Te() {
  if (Q) return C;
  Q = 1;
  const { getBooleanOption: o, cppdb: r } = _();
  return C = function(E, i, e) {
    if (i == null && (i = {}), typeof i == "function" && (e = i, i = {}), typeof E != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof e != "function") throw new TypeError("Expected last argument to be a function");
    if (typeof i != "object") throw new TypeError("Expected second argument to be an options object");
    if (!E) throw new TypeError("User-defined function name cannot be an empty string");
    const n = "safeIntegers" in i ? +o(i, "safeIntegers") : 2, c = o(i, "deterministic"), p = o(i, "directOnly"), b = o(i, "varargs");
    let f = -1;
    if (!b) {
      if (f = e.length, !Number.isInteger(f) || f < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (f > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    return this[r].function(e, E, f, n, c, p), this;
  }, C;
}
var F, J;
function ge() {
  if (J) return F;
  J = 1;
  const { getBooleanOption: o, cppdb: r } = _();
  F = function(e, n) {
    if (typeof e != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof n != "object" || n === null) throw new TypeError("Expected second argument to be an options object");
    if (!e) throw new TypeError("User-defined function name cannot be an empty string");
    const c = "start" in n ? n.start : null, p = s(n, "step", !0), b = s(n, "inverse", !1), f = s(n, "result", !1), h = "safeIntegers" in n ? +o(n, "safeIntegers") : 2, a = o(n, "deterministic"), u = o(n, "directOnly"), t = o(n, "varargs");
    let d = -1;
    if (!t && (d = Math.max(E(p), b ? E(b) : 0), d > 0 && (d -= 1), d > 100))
      throw new RangeError("User-defined functions cannot have more than 100 arguments");
    return this[r].aggregate(c, p, b, f, e, d, h, a, u), this;
  };
  const s = (i, e, n) => {
    const c = e in i ? i[e] : null;
    if (typeof c == "function") return c;
    if (c != null) throw new TypeError(`Expected the "${e}" option to be a function`);
    if (n) throw new TypeError(`Missing required option "${e}"`);
    return null;
  }, E = ({ length: i }) => {
    if (Number.isInteger(i) && i >= 0) return i;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return F;
}
var P, Z;
function be() {
  if (Z) return P;
  Z = 1;
  const { cppdb: o } = _();
  P = function(u, t) {
    if (typeof u != "string") throw new TypeError("Expected first argument to be a string");
    if (!u) throw new TypeError("Virtual table module name cannot be an empty string");
    let d = !1;
    if (typeof t == "object" && t !== null)
      d = !0, t = h(s(t, "used", u));
    else {
      if (typeof t != "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      t = r(t);
    }
    return this[o].table(t, u, d), this;
  };
  function r(a) {
    return function(t, d, T, ...l) {
      const g = {
        module: t,
        database: d,
        table: T
      }, w = p.call(a, g, l);
      if (typeof w != "object" || w === null)
        throw new TypeError(`Virtual table module "${t}" did not return a table definition object`);
      return s(w, "returned", t);
    };
  }
  function s(a, u, t) {
    if (!c.call(a, "rows"))
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition without a "rows" property`);
    if (!c.call(a, "columns"))
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition without a "columns" property`);
    const d = a.rows;
    if (typeof d != "function" || Object.getPrototypeOf(d) !== b)
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition with an invalid "rows" property (should be a generator function)`);
    let T = a.columns;
    if (!Array.isArray(T) || !(T = [...T]).every((y) => typeof y == "string"))
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition with an invalid "columns" property (should be an array of strings)`);
    if (T.length !== new Set(T).size)
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition with duplicate column names`);
    if (!T.length)
      throw new RangeError(`Virtual table module "${t}" ${u} a table definition with zero columns`);
    let l;
    if (c.call(a, "parameters")) {
      if (l = a.parameters, !Array.isArray(l) || !(l = [...l]).every((y) => typeof y == "string"))
        throw new TypeError(`Virtual table module "${t}" ${u} a table definition with an invalid "parameters" property (should be an array of strings)`);
    } else
      l = n(d);
    if (l.length !== new Set(l).size)
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition with duplicate parameter names`);
    if (l.length > 32)
      throw new RangeError(`Virtual table module "${t}" ${u} a table definition with more than the maximum number of 32 parameters`);
    for (const y of l)
      if (T.includes(y))
        throw new TypeError(`Virtual table module "${t}" ${u} a table definition with column "${y}" which was ambiguously defined as both a column and parameter`);
    let g = 2;
    if (c.call(a, "safeIntegers")) {
      const y = a.safeIntegers;
      if (typeof y != "boolean")
        throw new TypeError(`Virtual table module "${t}" ${u} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      g = +y;
    }
    let w = !1;
    if (c.call(a, "directOnly") && (w = a.directOnly, typeof w != "boolean"))
      throw new TypeError(`Virtual table module "${t}" ${u} a table definition with an invalid "directOnly" property (should be a boolean)`);
    return [
      `CREATE TABLE x(${[
        ...l.map(f).map((y) => `${y} HIDDEN`),
        ...T.map(f)
      ].join(", ")});`,
      E(d, new Map(T.map((y, ie) => [y, l.length + ie])), t),
      l,
      g,
      w
    ];
  }
  function E(a, u, t) {
    return function* (...T) {
      const l = T.map((g) => Buffer.isBuffer(g) ? Buffer.from(g) : g);
      for (let g = 0; g < u.size; ++g)
        l.push(null);
      for (const g of a(...T))
        if (Array.isArray(g))
          i(g, l, u.size, t), yield l;
        else if (typeof g == "object" && g !== null)
          e(g, l, u, t), yield l;
        else
          throw new TypeError(`Virtual table module "${t}" yielded something that isn't a valid row object`);
    };
  }
  function i(a, u, t, d) {
    if (a.length !== t)
      throw new TypeError(`Virtual table module "${d}" yielded a row with an incorrect number of columns`);
    const T = u.length - t;
    for (let l = 0; l < t; ++l)
      u[l + T] = a[l];
  }
  function e(a, u, t, d) {
    let T = 0;
    for (const l of Object.keys(a)) {
      const g = t.get(l);
      if (g === void 0)
        throw new TypeError(`Virtual table module "${d}" yielded a row with an undeclared column "${l}"`);
      u[g] = a[l], T += 1;
    }
    if (T !== t.size)
      throw new TypeError(`Virtual table module "${d}" yielded a row with missing columns`);
  }
  function n({ length: a }) {
    if (!Number.isInteger(a) || a < 0)
      throw new TypeError("Expected function.length to be a positive integer");
    const u = [];
    for (let t = 0; t < a; ++t)
      u.push(`$${t + 1}`);
    return u;
  }
  const { hasOwnProperty: c } = Object.prototype, { apply: p } = Function.prototype, b = Object.getPrototypeOf(function* () {
  }), f = (a) => `"${a.replace(/"/g, '""')}"`, h = (a) => () => a;
  return P;
}
var q, ee;
function he() {
  if (ee) return q;
  ee = 1;
  const o = function() {
  };
  return q = function(s, E) {
    return Object.assign(new o(), this);
  }, q;
}
var j, te;
function me() {
  if (te) return j;
  te = 1;
  const o = A, r = O, s = _(), E = oe();
  let i;
  function e(c, p) {
    if (new.target == null)
      return new e(c, p);
    let b;
    if (Buffer.isBuffer(c) && (b = c, c = ":memory:"), c == null && (c = ""), p == null && (p = {}), typeof c != "string") throw new TypeError("Expected first argument to be a string");
    if (typeof p != "object") throw new TypeError("Expected second argument to be an options object");
    if ("readOnly" in p) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
    if ("memory" in p) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
    const f = c.trim(), h = f === "" || f === ":memory:", a = s.getBooleanOption(p, "readonly"), u = s.getBooleanOption(p, "fileMustExist"), t = "timeout" in p ? p.timeout : 5e3, d = "verbose" in p ? p.verbose : null, T = "nativeBinding" in p ? p.nativeBinding : null;
    if (a && h && !b) throw new TypeError("In-memory/temporary databases cannot be readonly");
    if (!Number.isInteger(t) || t < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
    if (t > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
    if (d != null && typeof d != "function") throw new TypeError('Expected the "verbose" option to be a function');
    if (T != null && typeof T != "string" && typeof T != "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
    let l;
    if (T == null ? l = i || (i = ue()("better_sqlite3.node")) : typeof T == "string" ? l = (typeof __non_webpack_require__ == "function" ? __non_webpack_require__ : ne)(r.resolve(T).replace(/(\.node)?$/, ".node")) : l = T, l.isInitialized || (l.setErrorConstructor(E), l.isInitialized = !0), !h && !f.startsWith("file:") && !o.existsSync(r.dirname(f)))
      throw new TypeError("Cannot open database because the directory does not exist");
    Object.defineProperties(this, {
      [s.cppdb]: { value: new l.Database(f, c, h, a, u, t, d || null, b || null) },
      ...n.getters
    });
  }
  const n = le();
  return e.prototype.prepare = n.prepare, e.prototype.transaction = fe(), e.prototype.pragma = de(), e.prototype.backup = pe(), e.prototype.serialize = Ee(), e.prototype.function = Te(), e.prototype.aggregate = ge(), e.prototype.table = be(), e.prototype.loadExtension = n.loadExtension, e.prototype.exec = n.exec, e.prototype.close = n.close, e.prototype.defaultSafeIntegers = n.defaultSafeIntegers, e.prototype.unsafeMode = n.unsafeMode, e.prototype[s.inspect] = he(), j = e, j;
}
var re;
function ye() {
  return re || (re = 1, N.exports = me(), N.exports.SqliteError = oe()), N.exports;
}
var we = ye();
const Ie = /* @__PURE__ */ ae(we);
let m = null;
function _e() {
  X.isPackaged;
  const o = X.getPath("userData"), r = O.join(o, "data.db");
  return A.existsSync(o) || A.mkdirSync(o, { recursive: !0 }), console.log(`📂 Database path: ${r}`), m = new Ie(r), m.pragma("journal_mode = WAL"), m.pragma("foreign_keys = ON"), Ae(), m;
}
function Re() {
  if (!m)
    throw new Error("Database not initialized. Call initDatabase() first.");
  return m;
}
function Ae() {
  console.log("🔄 Running database migrations..."), m.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const o = [
    {
      name: "001-proxies-and-collections",
      up: () => {
        m.exec(`
          CREATE TABLE IF NOT EXISTS proxies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            username TEXT,
            password TEXT,
            type TEXT DEFAULT 'socks5',
            status TEXT DEFAULT 'active',
            last_used DATETIME,
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_proxies_status ON proxies(status);
          CREATE INDEX IF NOT EXISTS idx_proxies_collection_id ON proxies(collection_id);
        `), m.exec(`
          CREATE TABLE IF NOT EXISTS proxy_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_proxy_collections_created_at ON proxy_collections(created_at);
        `), console.log("  ✅ Created proxies and proxy_collections tables");
      }
    },
    {
      name: "002-account-collections",
      up: () => {
        m.exec(`
          CREATE TABLE IF NOT EXISTS account_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_account_collections_created_at ON account_collections(created_at);
        `), console.log("  ✅ Created account_collections table");
      }
    },
    {
      name: "003-accounts",
      up: () => {
        m.exec(`
          CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            token TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_accounts_collection_id ON accounts(collection_id);
          CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
        `), console.log("  ✅ Created accounts table");
      }
    },
    {
      name: "004-accounts-add-name-token",
      up: () => {
        if (m.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='accounts'
        `).get()) {
          const E = m.prepare("PRAGMA table_info(accounts)").all().map((i) => i.name);
          E.includes("name") || (m.exec("ALTER TABLE accounts ADD COLUMN name TEXT DEFAULT ''"), m.exec("UPDATE accounts SET name = 'Account ' || id WHERE name IS NULL OR name = ''"), console.log("  ✅ Added name column to accounts")), E.includes("token") || (m.exec("ALTER TABLE accounts ADD COLUMN token TEXT DEFAULT ''"), console.log("  ✅ Added token column to accounts")), E.includes("updated_at") || (m.exec("ALTER TABLE accounts ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"), console.log("  ✅ Added updated_at column to accounts"));
        }
      }
    },
    {
      name: "005-code-collections",
      up: () => {
        m.exec(`
          CREATE TABLE IF NOT EXISTS code_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_code_collections_created_at ON code_collections(created_at);
        `), console.log("  ✅ Created code_collections table");
      }
    },
    {
      name: "006-codes",
      up: () => {
        m.exec(`
          CREATE TABLE IF NOT EXISTS codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_codes_collection_id ON codes(collection_id);
          CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);
        `), console.log("  ✅ Created codes table");
      }
    }
  ];
  for (const r of o)
    m.prepare("SELECT * FROM migrations WHERE name = ?").get(r.name) || (console.log(`  ✅ Executing migration: ${r.name}`), r.up(), m.prepare("INSERT INTO migrations (name) VALUES (?)").run(r.name));
  console.log("✅ Migrations completed");
}
const Se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getDatabase: Re,
  initDatabase: _e
}, Symbol.toStringTag, { value: "Module" }));
export {
  ne as c,
  Re as g,
  Se as i
};
