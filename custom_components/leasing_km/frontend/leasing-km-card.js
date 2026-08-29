const L = globalThis, F = L.ShadowRoot && (L.ShadyCSS === void 0 || L.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, W = /* @__PURE__ */ Symbol(), X = /* @__PURE__ */ new WeakMap();
let gt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== W) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (F && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = X.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && X.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const kt = (n) => new gt(typeof n == "string" ? n : n + "", void 0, W), St = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new gt(e, n, W);
}, Tt = (n, t) => {
  if (F) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = L.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, tt = F ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return kt(e);
})(n) : n;
const { is: Pt, defineProperty: Ot, getOwnPropertyDescriptor: Rt, getOwnPropertyNames: Ut, getOwnPropertySymbols: Mt, getPrototypeOf: Lt } = Object, H = globalThis, et = H.trustedTypes, Dt = et ? et.emptyScript : "", Nt = H.reactiveElementPolyfillSupport, k = (n, t) => n, D = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Dt : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, V = (n, t) => !Pt(n, t), st = { attribute: !0, type: String, converter: D, reflect: !1, useDefault: !1, hasChanged: V };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), H.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let x = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = st) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Ot(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = Rt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: i, set(o) {
      const l = i?.call(this);
      r?.call(this, o), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(k("elementProperties"))) return;
    const t = Lt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(k("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(k("properties"))) {
      const e = this.properties, s = [...Ut(e), ...Mt(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(tt(i));
    } else t !== void 0 && e.push(tt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Tt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : D).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : D;
      this._$Em = i;
      const l = o.fromAttribute(e, r.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? V)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: o } = r, l = this[i];
        o !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, r, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[k("elementProperties")] = /* @__PURE__ */ new Map(), x[k("finalized")] = /* @__PURE__ */ new Map(), Nt?.({ ReactiveElement: x }), (H.reactiveElementVersions ??= []).push("2.1.2");
const G = globalThis, it = (n) => n, N = G.trustedTypes, nt = N ? N.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ft = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, vt = "?" + f, Ht = `<${vt}>`, b = document, T = () => b.createComment(""), P = (n) => n === null || typeof n != "object" && typeof n != "function", K = Array.isArray, jt = (n) => K(n) || typeof n?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, rt = /-->/g, ot = />/g, v = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, ct = /"/g, $t = /^(?:script|style|textarea|title)$/i, yt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), p = yt(1), qt = yt(2), w = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), lt = /* @__PURE__ */ new WeakMap(), y = b.createTreeWalker(b, 129);
function bt(n, t) {
  if (!K(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return nt !== void 0 ? nt.createHTML(t) : t;
}
const zt = (n, t) => {
  const e = n.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = C;
  for (let l = 0; l < e; l++) {
    const a = n[l];
    let u, _, h = -1, m = 0;
    for (; m < a.length && (o.lastIndex = m, _ = o.exec(a), _ !== null); ) m = o.lastIndex, o === C ? _[1] === "!--" ? o = rt : _[1] !== void 0 ? o = ot : _[2] !== void 0 ? ($t.test(_[2]) && (i = RegExp("</" + _[2], "g")), o = v) : _[3] !== void 0 && (o = v) : o === v ? _[0] === ">" ? (o = i ?? C, h = -1) : _[1] === void 0 ? h = -2 : (h = o.lastIndex - _[2].length, u = _[1], o = _[3] === void 0 ? v : _[3] === '"' ? ct : at) : o === ct || o === at ? o = v : o === rt || o === ot ? o = C : (o = v, i = void 0);
    const g = o === v && n[l + 1].startsWith("/>") ? " " : "";
    r += o === C ? a + Ht : h >= 0 ? (s.push(u), a.slice(0, h) + ft + a.slice(h) + f + g) : a + f + (h === -2 ? l : g);
  }
  return [bt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class O {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const l = t.length - 1, a = this.parts, [u, _] = zt(t, e);
    if (this.el = O.createElement(u, s), y.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = y.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(ft)) {
          const m = _[o++], g = i.getAttribute(h).split(f), U = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: r, name: U[2], strings: g, ctor: U[1] === "." ? Yt : U[1] === "?" ? Bt : U[1] === "@" ? Ft : j }), i.removeAttribute(h);
        } else h.startsWith(f) && (a.push({ type: 6, index: r }), i.removeAttribute(h));
        if ($t.test(i.tagName)) {
          const h = i.textContent.split(f), m = h.length - 1;
          if (m > 0) {
            i.textContent = N ? N.emptyScript : "";
            for (let g = 0; g < m; g++) i.append(h[g], T()), y.nextNode(), a.push({ type: 2, index: ++r });
            i.append(h[m], T());
          }
        }
      } else if (i.nodeType === 8) if (i.data === vt) a.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(f, h + 1)) !== -1; ) a.push({ type: 7, index: r }), h += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = b.createElement("template");
    return s.innerHTML = t, s;
  }
}
function E(n, t, e = n, s) {
  if (t === w) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = P(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = E(n, i._$AS(n, t.values), i, s)), t;
}
class It {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? b).importNode(e, !0);
    y.currentNode = i;
    let r = y.nextNode(), o = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let u;
        a.type === 2 ? u = new R(r, r.nextSibling, this, t) : a.type === 1 ? u = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (u = new Wt(r, this, t)), this._$AV.push(u), a = s[++l];
      }
      o !== a?.index && (r = y.nextNode(), o++);
    }
    return y.currentNode = b, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = E(this, t, e), P(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== w && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : jt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && P(this._$AH) ? this._$AA.nextSibling.data = t : this.T(b.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = O.createElement(bt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new It(i, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = lt.get(t.strings);
    return e === void 0 && lt.set(t.strings, e = new O(t)), e;
  }
  k(t) {
    K(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new R(this.O(T()), this.O(T()), this, this.options)) : s = e[i], s._$AI(r), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = it(t).nextSibling;
      it(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class j {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(t, e = this, s, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = E(this, t, e, 0), o = !P(t) || t !== this._$AH && t !== w, o && (this._$AH = t);
    else {
      const l = t;
      let a, u;
      for (t = r[0], a = 0; a < r.length - 1; a++) u = E(this, l[s + a], e, a), u === w && (u = this._$AH[a]), o ||= !P(u) || u !== this._$AH[a], u === d ? t = d : t !== d && (t += (u ?? "") + r[a + 1]), this._$AH[a] = u;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Yt extends j {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class Bt extends j {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Ft extends j {
  constructor(t, e, s, i, r) {
    super(t, e, s, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = E(this, t, e, 0) ?? d) === w) return;
    const s = this._$AH, i = t === d && s !== d || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== d && (s === d || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Wt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const Vt = G.litHtmlPolyfillSupport;
Vt?.(O, R), (G.litHtmlVersions ??= []).push("3.3.3");
const Gt = (n, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new R(t.insertBefore(T(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
const Z = globalThis;
class A extends x {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Gt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
A._$litElement$ = !0, A.finalized = !0, Z.litElementHydrateSupport?.({ LitElement: A });
const Kt = Z.litElementPolyfillSupport;
Kt?.({ LitElement: A });
(Z.litElementVersions ??= []).push("4.2.2");
const Zt = { attribute: !0, type: String, converter: D, reflect: !1, hasChanged: V }, Jt = (n = Zt, t, e) => {
  const { kind: s, metadata: i } = e;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), s === "accessor") {
    const { name: o } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, a, n, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, n, l), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = e;
    return function(l) {
      const a = this[o];
      t.call(this, l), this.requestUpdate(o, a, n, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function Qt(n) {
  return (t, e) => typeof e == "object" ? Jt(n, t, e) : ((s, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(n, t, e);
}
function J(n) {
  return Qt({ ...n, state: !0, attribute: !1 });
}
const xt = "leasing_km", At = [
  "km_driven",
  "daily_actual",
  "daily_target",
  "daily_actual_30d",
  "daily_actual_90d",
  "target_today",
  "deviation_today",
  "target_month_end",
  "deviation_month_end",
  "contract_year_driven",
  "contract_year_deviation",
  "contract_year_allowance",
  "annual_allowance",
  "remaining_contract_year",
  "remaining_calendar_year",
  "remaining_contract_end",
  "remaining_total",
  "forecast_contract_year_end",
  "forecast_calendar_year_end",
  "forecast_contract_end",
  "forecast_deviation_contract_end",
  "mileage_used",
  "contract_elapsed",
  "contract_end_date",
  "cost_forecast_contract_end",
  "cost_at_target_pace",
  "km_to_excess_tolerance",
  "days_remaining",
  "above_target",
  "annual_forecast_exceeded",
  "contract_forecast_exceeded",
  "excess_tolerance_exceeded"
], Xt = [...At].sort((n, t) => t.length - n.length);
function te(n, t) {
  return t && At.includes(t) ? t : Xt.find((e) => n.endsWith(`_${e}`));
}
function ee(n, t) {
  const e = n.devices?.[t];
  return e?.name_by_user || e?.name || t;
}
function Y(n) {
  const t = /* @__PURE__ */ new Map();
  for (const e of Object.values(n.entities ?? {})) {
    if (e.platform !== xt || !e.device_id) continue;
    const s = te(e.entity_id, e.translation_key);
    if (!s) continue;
    let i = t.get(e.device_id);
    i || (i = {
      deviceId: e.device_id,
      label: ee(n, e.device_id),
      entities: {}
    }, t.set(e.device_id, i)), i.entities[s] = e.entity_id;
  }
  return [...t.values()].sort((e, s) => e.label.localeCompare(s.label));
}
function dt(n, t) {
  const e = Y(n);
  if (t.device_id)
    return e.find((s) => s.deviceId === t.device_id);
  if (t.entity_prefix) {
    const s = `sensor.${t.entity_prefix}_`;
    return e.find(
      (i) => Object.values(i.entities).some((r) => r.startsWith(s))
    );
  }
  return e[0];
}
const se = "No leasing contract found", ie = "Set up the Leasing KM Calculator integration first.", ne = "This contract no longer exists. Please pick it again.", re = "Loading…", oe = "–", ae = "Contract end {date}", ce = "on track", le = "above target", de = "limit at risk", he = "target {p} %", ue = "Mileage used", _e = "{a} / {b} days", pe = "Target vs. actual", me = "Contract year {n}", ge = "Forecast", fe = "Remaining on target basis", ve = "Deviation today", $e = "Deviation at month end", ye = "Actual per day", be = "Mileage left", xe = "Driven", Ae = "Deviation", we = "Allowance", Ee = "Contract year end", Ce = "Contract end", ke = "Expected difference", Se = "Until contract year end", Te = "Until contract end", Pe = "target {v}", Oe = "until contract end", Re = "whole contract average", Ue = "last 30 days", Me = "last 90 days", Le = "over limit", De = "within limit", Ne = "above daily target", He = "below daily target", je = "annual mileage at risk", qe = "annual mileage safe", ze = "limit will be exceeded", Ie = "limit kept", Ye = "Leasing contract", Be = "Title", Fe = "Cap the percentage at 100 %", We = "Show the contract year", Ve = "Show the forecast", Ge = "Settlement", Ke = "Forecast at contract end", Ze = "At target pace", Je = "Until the tolerance", Qe = "payment expected", Xe = "refund expected", ts = "nothing to settle", es = "tolerance kept", ss = "tolerance exceeded", is = "Show the settlement", ns = {
  noInstanceTitle: se,
  noInstanceBody: ie,
  missing: ne,
  loading: re,
  unknown: oe,
  contractEnd: ae,
  badgeOk: ce,
  badgeOver: le,
  badgeRisk: de,
  gaugeSub: he,
  progressLabel: ue,
  progressDays: _e,
  sectionTargetActual: pe,
  sectionContractYear: me,
  sectionForecast: ge,
  sectionRemaining: fe,
  mDeviationToday: ve,
  mDeviationMonth: $e,
  mDailyActual: ye,
  mRemainingTotal: be,
  mContractYearDriven: xe,
  mContractYearDeviation: Ae,
  mContractYearAllowance: we,
  mForecastContractYear: Ee,
  mForecastContractEnd: Ce,
  mForecastDeviation: ke,
  mRemainingContractYear: Se,
  mRemainingContractEnd: Te,
  subTarget: Pe,
  subUntilContractEnd: Oe,
  subBasisTotal: Re,
  subBasis30: Ue,
  subBasis90: Me,
  overLimit: Le,
  withinLimit: De,
  pillOverDaily: Ne,
  pillUnderDaily: He,
  pillYearRisk: je,
  pillYearSafe: qe,
  pillLimitExceeded: ze,
  pillLimitOk: Ie,
  editorDevice: Ye,
  editorTitle: Be,
  editorClamp: Fe,
  editorContractYear: We,
  editorForecast: Ve,
  sectionCosts: Ge,
  mCostForecast: Ke,
  mCostAtTarget: Ze,
  mKmToTolerance: Je,
  costPay: Qe,
  costRefund: Xe,
  costNone: ts,
  pillToleranceOk: es,
  pillToleranceExceeded: ss,
  editorCosts: is
}, B = /* @__PURE__ */ Object.assign({
  "./translations/cs.json": () => import("./cs.js"),
  "./translations/da.json": () => import("./da.js"),
  "./translations/de.json": () => import("./de.js"),
  "./translations/es.json": () => import("./es.js"),
  "./translations/fr.json": () => import("./fr.js"),
  "./translations/it.json": () => import("./it.js"),
  "./translations/nl.json": () => import("./nl.js"),
  "./translations/pl.json": () => import("./pl.js"),
  "./translations/pt.json": () => import("./pt.js"),
  "./translations/sv.json": () => import("./sv.js")
}), S = { en: ns }, ht = (n) => `./translations/${n}.json`, rs = [
  "en",
  ...Object.keys(B).map(
    (n) => n.slice(15, -5)
  )
].sort();
function $(n) {
  const e = (n?.locale?.language || n?.language || "en").toLowerCase().split("-")[0];
  return rs.includes(e) ? e : "en";
}
async function wt(n) {
  if (S[n] || !B[ht(n)]) return !1;
  try {
    return S[n] = (await B[ht(n)]()).default, !0;
  } catch {
    return !1;
  }
}
function c(n, t, e) {
  let i = (S[n] ?? S.en)[t] ?? S.en[t] ?? t;
  if (e)
    for (const [r, o] of Object.entries(e))
      i = i.split(`{${r}}`).join(String(o));
  return i;
}
function z(n) {
  return n?.locale?.language || n?.language || "en";
}
const os = St`
  :host {
    display: block;
    --lkm-ok: var(--success-color, #4caf50);
    --lkm-bad: var(--error-color, #f44336);
    --lkm-warn: var(--warning-color, #ff9800);
    --lkm-muted: var(--secondary-text-color);
    --lkm-line: var(--divider-color);
    --lkm-tile: var(--secondary-background-color);
  }

  ha-card {
    overflow: hidden;
    padding-bottom: 8px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--lkm-line);
  }
  .header ha-icon {
    color: var(--primary-color);
    flex: none;
  }
  .titles {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: 1.05rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 0.8rem;
    color: var(--lkm-muted);
  }
  .badge {
    flex: none;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid currentColor;
  }

  .gauge {
    display: block;
    width: 100%;
    max-width: 320px;
    margin: 8px auto 0;
  }
  .gauge-track {
    fill: none;
    stroke: var(--lkm-line);
    stroke-width: 14;
    stroke-linecap: round;
  }
  .gauge-fill {
    fill: none;
    stroke-width: 14;
    stroke-linecap: round;
  }
  .gauge-marker {
    stroke: var(--primary-text-color);
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.55;
  }
  .gauge-value {
    fill: var(--primary-text-color);
    font-size: 26px;
    font-weight: 600;
    text-anchor: middle;
  }
  .gauge-sub,
  .gauge-scale {
    fill: var(--lkm-muted);
    font-size: 11px;
    text-anchor: middle;
  }

  .bar-wrap {
    position: relative;
    height: 8px;
    margin: 4px 16px 0;
    border-radius: 4px;
    background: var(--lkm-line);
    overflow: hidden;
  }
  .bar {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 4px;
  }
  .bar.target {
    background: var(--lkm-muted);
    opacity: 0.45;
  }
  .bar-legend {
    display: flex;
    justify-content: space-between;
    margin: 6px 16px 0;
    font-size: 0.75rem;
    color: var(--lkm-muted);
  }

  .section {
    margin: 14px 16px 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--lkm-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    margin: 8px 16px 0;
  }
  .tile {
    background: var(--lkm-tile);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 10px 12px;
  }
  .tile .label {
    font-size: 0.75rem;
    color: var(--lkm-muted);
  }
  .tile .value {
    font-size: 1.15rem;
    font-weight: 500;
    margin-top: 2px;
  }
  .tile .hint {
    font-size: 0.72rem;
    color: var(--lkm-muted);
    margin-top: 2px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 14px 16px 4px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--lkm-tile);
    color: var(--lkm-muted);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }

  .good {
    color: var(--lkm-ok);
  }
  .bad {
    color: var(--lkm-bad);
  }
  .warn {
    color: var(--lkm-warn);
  }

  .message {
    padding: 24px 16px;
    text-align: center;
    color: var(--lkm-muted);
  }
`;
var as = Object.defineProperty, cs = (n, t, e, s) => {
  for (var i = void 0, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (i = o(t, e, i) || i);
  return i && as(t, e, i), i;
};
const ls = [
  {
    name: "device_id",
    required: !0,
    selector: { device: { integration: xt } }
  },
  { name: "title", selector: { text: {} } },
  { name: "clamp_percent", selector: { boolean: {} } },
  { name: "show_contract_year", selector: { boolean: {} } },
  { name: "show_forecast", selector: { boolean: {} } },
  { name: "show_costs", selector: { boolean: {} } }
], ds = {
  device_id: "editorDevice",
  title: "editorTitle",
  clamp_percent: "editorClamp",
  show_contract_year: "editorContractYear",
  show_forecast: "editorForecast",
  show_costs: "editorCosts"
};
class Et extends A {
  constructor() {
    super(...arguments), this._label = (t) => c($(this.hass), ds[t.name] ?? t.name);
  }
  set hass(t) {
    this._hass = t, wt($(t)).then(
      (e) => e && this.requestUpdate()
    );
  }
  get hass() {
    return this._hass;
  }
  setConfig(t) {
    this._config = t;
  }
  _changed(t) {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config, ...t.detail.value } },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return !this.hass || !this._config ? d : p`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${ls}
        .computeLabel=${this._label}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}
cs([
  J()
], Et.prototype, "_config");
customElements.get("leasing-km-card-editor") || customElements.define("leasing-km-card-editor", Et);
var hs = Object.defineProperty, Ct = (n, t, e, s) => {
  for (var i = void 0, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (i = o(t, e, i) || i);
  return i && hs(t, e, i), i;
};
const us = "2.1.1", M = 180, ut = 180, _t = ["unknown", "unavailable", ""];
function pt(n, t, e, s, i) {
  const r = (o) => {
    const l = o * Math.PI / 180;
    return `${n + e * Math.cos(l)} ${t + e * Math.sin(l)}`;
  };
  return `M ${r(s)} A ${e} ${e} 0 ${i - s > 180 ? 1 : 0} 1 ${r(i)}`;
}
const I = (n, t, e) => Math.min(Math.max(n, t), e);
class Q extends A {
  static {
    this.styles = os;
  }
  static getConfigElement() {
    return document.createElement("leasing-km-card-editor");
  }
  static getStubConfig(t) {
    const [e] = t ? Y(t) : [];
    return { device_id: e?.deviceId };
  }
  set hass(t) {
    const e = this._hass;
    this._hass = t, this._instance = dt(t, this._config ?? {}), this._loadCatalog($(t)), (!e || this._watchedChanged(e, t)) && this.requestUpdate();
  }
  /** Fetch the catalog for the UI language and repaint once it is there. */
  _loadCatalog(t) {
    t !== this._catalog && (this._catalog = t, wt(t).then((e) => e && this.requestUpdate()));
  }
  get hass() {
    return this._hass;
  }
  setConfig(t) {
    this._config = { ...t }, this._hass && (this._instance = dt(this._hass, this._config));
  }
  getCardSize() {
    return 10;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 10, min_rows: 6 };
  }
  /**
   * Home Assistant hands the card a new `hass` object on every state change in
   * the system. Re-rendering only when one of the entities actually shown has
   * changed keeps a busy instance from repainting the card constantly.
   */
  _watchedChanged(t, e) {
    if (!this._instance) return !0;
    for (const s of Object.values(this._instance.entities))
      if (t.states[s] !== e.states[s]) return !0;
    return !1;
  }
  /** Contract metadata carried on the "contract elapsed" sensor. */
  _meta(t) {
    return this._entity("contract_elapsed")?.attributes[t];
  }
  _entity(t) {
    const e = this._instance?.entities[t];
    return e ? this._hass?.states[e] : void 0;
  }
  _value(t) {
    const e = this._entity(t);
    if (!e || _t.includes(e.state)) return null;
    const s = Number(e.state);
    return Number.isFinite(s) ? s : null;
  }
  _flag(t) {
    const e = this._entity(t);
    return !e || _t.includes(e.state) ? null : e.state === "on";
  }
  _unit(t) {
    return this._entity(t)?.attributes.unit_of_measurement ?? "";
  }
  _number(t, e = 0) {
    return t === null ? c($(this._hass), "unknown") : t.toLocaleString(z(this._hass), {
      minimumFractionDigits: e,
      maximumFractionDigits: e
    });
  }
  /** Format a settlement value in the currency the sensor reports. */
  _money(t) {
    const e = this._value(t);
    if (e === null) return c($(this._hass), "unknown");
    const s = this._unit(t);
    try {
      return e.toLocaleString(z(this._hass), {
        style: "currency",
        currency: s
      });
    } catch {
      return `${this._number(e, 2)} ${s}`.trim();
    }
  }
  /** Format a value with the unit of the entity it came from. */
  _quantity(t, e = 0, s = !1) {
    const i = this._value(t);
    return i === null ? c($(this._hass), "unknown") : `${s && i > 0 ? "+" : ""}${this._number(i, e)} ${this._unit(t)}`.trim();
  }
  render() {
    const t = this._hass, e = $(t);
    if (!t || !this._config)
      return p`<ha-card
        ><div class="message">${c(e, "loading")}</div></ha-card
      >`;
    if (!this._instance) {
      const l = Y(t).length > 0;
      return p`<ha-card>
        <div class="message">
          ${l ? c(e, "missing") : p`${c(e, "noInstanceTitle")}<br />${c(
        e,
        "noInstanceBody"
      )}`}
        </div>
      </ha-card>`;
    }
    const s = this._value("mileage_used"), i = this._value("contract_elapsed"), r = this._flag("above_target") ?? !1, o = this._flag("contract_forecast_exceeded") ?? !1;
    return p`
      <ha-card>
        ${this._renderHeader(e, r, o)}
        ${this._renderGauge(e, s, i, r)}
        ${this._renderTargetActual(e, r)}
        ${this._config.show_contract_year === !1 ? d : this._renderContractYear(e)}
        ${this._config.show_forecast === !1 ? d : this._renderForecast(e, o)}
        ${this._renderRemaining(e)}
        ${this._config.show_costs === !1 ? d : this._renderCosts(e)}
        ${this._renderPills(e, r, o)}
      </ha-card>
    `;
  }
  _renderHeader(t, e, s) {
    const i = this._meta("contract_end"), r = i ? new Date(i).toLocaleDateString(z(this._hass)) : c(t, "unknown"), o = s ? { text: c(t, "badgeRisk"), cls: "bad" } : e ? { text: c(t, "badgeOver"), cls: "warn" } : { text: c(t, "badgeOk"), cls: "good" };
    return p`
      <div class="header">
        <ha-icon icon="mdi:car-clock"></ha-icon>
        <div class="titles">
          <div class="title">${this._config.title || this._instance.label}</div>
          <div class="subtitle">
            ${c(t, "contractEnd", { date: r })}
          </div>
        </div>
        <span class="badge ${o.cls}">${o.text}</span>
      </div>
    `;
  }
  _renderGauge(t, e, s, i) {
    const r = e === null ? 0 : this._config.clamp_percent ? I(e, 0, 100) : e, o = I(e ?? 0, 0, 100), l = I(s ?? 0, 0, 100), a = (M + l / 100 * ut) * Math.PI / 180, u = i ? "var(--lkm-bad)" : "var(--lkm-ok)";
    return p`
      <svg class="gauge" viewBox="0 8 220 128" role="img">
        ${qt`
          <path class="gauge-track" d="${pt(110, 110, 88, M, 360)}" />
          <path
            class="gauge-fill"
            style="stroke: ${u}"
            d="${pt(110, 110, 88, M, M + o / 100 * ut)}"
          />
          <line
            class="gauge-marker"
            x1="${110 + 78 * Math.cos(a)}"
            y1="${110 + 78 * Math.sin(a)}"
            x2="${110 + 98 * Math.cos(a)}"
            y2="${110 + 98 * Math.sin(a)}"
          />
          <text class="gauge-value" x="110" y="100">${this._number(r, 1)} %</text>
          <text class="gauge-sub" x="110" y="120">
            ${c(t, "gaugeSub", { p: this._number(s, 1) })}
          </text>
          <text class="gauge-scale" x="22" y="128">0 %</text>
          <text class="gauge-scale" x="198" y="128">100 %</text>
        `}
      </svg>

      <div class="bar-wrap">
        <div class="bar target" style="width: ${l}%"></div>
        <div
          class="bar"
          style="width: ${o}%; background: ${u}"
        ></div>
      </div>
      <div class="bar-legend">
        <span>${c(t, "progressLabel")}</span>
        <span>${this._days(t)}</span>
      </div>
    `;
  }
  _days(t) {
    const e = this._meta("elapsed_days"), s = this._meta("total_days");
    return e === void 0 || s === void 0 ? "" : c(t, "progressDays", {
      a: this._number(e),
      b: this._number(s)
    });
  }
  _renderTargetActual(t, e) {
    const s = (this._value("deviation_month_end") ?? 0) > 0, i = this._value("remaining_total");
    return p`
      <div class="section">${c(t, "sectionTargetActual")}</div>
      <div class="grid">
        ${this._tile(
      c(t, "mDeviationToday"),
      this._quantity("deviation_today", 0, !0),
      c(t, "subTarget", { v: this._quantity("target_today") }),
      e ? "bad" : "good"
    )}
        ${this._tile(
      c(t, "mDeviationMonth"),
      this._quantity("deviation_month_end", 0, !0),
      c(t, "subTarget", { v: this._quantity("target_month_end") }),
      s ? "bad" : "good"
    )}
        ${this._tile(
      c(t, "mDailyActual"),
      this._quantity("daily_actual", 1),
      c(t, "subTarget", { v: this._quantity("daily_target", 1) })
    )}
        ${this._tile(
      c(t, "mRemainingTotal"),
      this._quantity("remaining_total"),
      c(t, "subUntilContractEnd"),
      i !== null && i < 0 ? "bad" : void 0
    )}
      </div>
    `;
  }
  _renderContractYear(t) {
    if (this._value("contract_year_driven") === null) return d;
    const s = this._value("contract_year_deviation");
    return p`
      <div class="section">
        ${c(t, "sectionContractYear", { n: this._contractYear() })}
      </div>
      <div class="grid">
        ${this._tile(
      c(t, "mContractYearDriven"),
      this._quantity("contract_year_driven")
    )}
        ${this._tile(
      c(t, "mContractYearDeviation"),
      this._quantity("contract_year_deviation", 0, !0),
      void 0,
      (s ?? 0) > 0 ? "bad" : "good"
    )}
      </div>
    `;
  }
  _contractYear() {
    return String(this._meta("contract_year") ?? "");
  }
  _renderForecast(t, e) {
    const s = this._flag("annual_forecast_exceeded") ?? !1, i = this._value("forecast_deviation_contract_end");
    return p`
      <div class="section">${c(t, "sectionForecast")}</div>
      <div class="grid">
        ${this._tile(
      c(t, "mForecastContractYear"),
      this._quantity("forecast_contract_year_end"),
      c(t, s ? "overLimit" : "withinLimit"),
      s ? "bad" : "good"
    )}
        ${this._tile(
      c(t, "mForecastContractEnd"),
      this._quantity("forecast_contract_end"),
      c(t, e ? "overLimit" : "withinLimit"),
      e ? "bad" : "good"
    )}
        ${this._tile(
      c(t, "mForecastDeviation"),
      this._quantity("forecast_deviation_contract_end", 0, !0),
      void 0,
      (i ?? 0) > 0 ? "bad" : "good"
    )}
      </div>
    `;
  }
  _renderRemaining(t) {
    return p`
      <div class="section">${c(t, "sectionRemaining")}</div>
      <div class="grid">
        ${this._tile(
      c(t, "mRemainingContractYear"),
      this._quantity("remaining_contract_year")
    )}
        ${this._tile(
      c(t, "mRemainingContractEnd"),
      this._quantity("remaining_contract_end")
    )}
      </div>
    `;
  }
  _renderCosts(t) {
    const e = this._value("cost_forecast_contract_end");
    if (e === null) return d;
    const s = e > 0 ? "costPay" : e < 0 ? "costRefund" : "costNone", i = this._value("cost_at_target_pace");
    return p`
      <div class="section">${c(t, "sectionCosts")}</div>
      <div class="grid">
        ${this._tile(
      c(t, "mCostForecast"),
      this._money("cost_forecast_contract_end"),
      c(t, s),
      e > 0 ? "bad" : e < 0 ? "good" : void 0
    )}
        ${this._tile(
      c(t, "mCostAtTarget"),
      this._money("cost_at_target_pace"),
      void 0,
      (i ?? 0) > 0 ? "bad" : (i ?? 0) < 0 ? "good" : void 0
    )}
        ${this._tile(
      c(t, "mKmToTolerance"),
      this._quantity("km_to_excess_tolerance")
    )}
      </div>
    `;
  }
  _renderPills(t, e, s) {
    const i = this._flag("annual_forecast_exceeded") ?? !1, r = (l, a, u) => p`
      <span class="pill">
        <span class="dot ${l ? "bad" : "good"}"></span>
        ${c(t, l ? a : u)}
      </span>
    `, o = this._flag("excess_tolerance_exceeded");
    return p`
      <div class="pills">
        ${r(e, "pillOverDaily", "pillUnderDaily")}
        ${r(i, "pillYearRisk", "pillYearSafe")}
        ${r(s, "pillLimitExceeded", "pillLimitOk")}
        ${o === null ? d : r(o, "pillToleranceExceeded", "pillToleranceOk")}
      </div>
    `;
  }
  _tile(t, e, s, i) {
    return p`
      <div class="tile">
        <div class="label">${t}</div>
        <div class="value ${i ?? ""}">${e}</div>
        ${s ? p`<div class="hint">${s}</div>` : d}
      </div>
    `;
  }
}
Ct([
  J()
], Q.prototype, "_config");
Ct([
  J()
], Q.prototype, "_instance");
customElements.get("leasing-km-card") || customElements.define("leasing-km-card", Q);
const mt = window.customCards ??= [];
mt.some((n) => n.type === "leasing-km-card") || mt.push({
  type: "leasing-km-card",
  name: "Leasing KM Card",
  description: "Leasing mileage at a glance: gauge, target versus actual and forecast.",
  preview: !0,
  documentationURL: "https://github.com/sphings79/leasing-km-home-assistant"
});
console.info(
  `%c LEASING-KM-CARD %c v${us} `,
  "background:#03a9f4;color:#fff;font-weight:600;padding:2px 6px;border-radius:3px 0 0 3px",
  "background:#333;color:#03a9f4;font-weight:600;padding:2px 6px;border-radius:0 3px 3px 0"
);
export {
  Q as LeasingKmCard
};
