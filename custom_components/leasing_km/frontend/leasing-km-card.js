const L = globalThis, B = L.ShadowRoot && (L.ShadyCSS === void 0 || L.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, F = /* @__PURE__ */ Symbol(), Q = /* @__PURE__ */ new WeakMap();
let mt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== F) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (B && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Q.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Q.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const kt = (n) => new mt(typeof n == "string" ? n : n + "", void 0, F), St = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new mt(e, n, F);
}, Pt = (n, t) => {
  if (B) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = L.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, X = B ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return kt(e);
})(n) : n;
const { is: Ot, defineProperty: Tt, getOwnPropertyDescriptor: Mt, getOwnPropertyNames: Rt, getOwnPropertySymbols: Ut, getPrototypeOf: Lt } = Object, H = globalThis, tt = H.trustedTypes, Dt = tt ? tt.emptyScript : "", Nt = H.reactiveElementPolyfillSupport, k = (n, t) => n, D = { toAttribute(n, t) {
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
} }, W = (n, t) => !Ot(n, t), et = { attribute: !0, type: String, converter: D, reflect: !1, useDefault: !1, hasChanged: W };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), H.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let b = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = et) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Tt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = Mt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: i, set(a) {
      const c = i?.call(this);
      r?.call(this, a), this.requestUpdate(t, c, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? et;
  }
  static _$Ei() {
    if (this.hasOwnProperty(k("elementProperties"))) return;
    const t = Lt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(k("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(k("properties"))) {
      const e = this.properties, s = [...Rt(e), ...Ut(e)];
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
      for (const i of s) e.unshift(X(i));
    } else t !== void 0 && e.push(X(t));
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
    return Pt(t, this.constructor.elementStyles), t;
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
      const r = s.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : D;
      this._$Em = i;
      const c = a.fromAttribute(e, r.type);
      this[i] = c ?? this._$Ej?.get(i) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[t]), s ??= a.getPropertyOptions(t), !((s.hasChanged ?? W)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: r }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        const { wrapped: a } = r, c = this[i];
        a !== !0 || this._$AL.has(i) || c === void 0 || this.C(i, void 0, r, c);
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
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[k("elementProperties")] = /* @__PURE__ */ new Map(), b[k("finalized")] = /* @__PURE__ */ new Map(), Nt?.({ ReactiveElement: b }), (H.reactiveElementVersions ??= []).push("2.1.2");
const V = globalThis, st = (n) => n, N = V.trustedTypes, it = N ? N.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ft = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, vt = "?" + f, Ht = `<${vt}>`, y = document, P = () => y.createComment(""), O = (n) => n === null || typeof n != "object" && typeof n != "function", G = Array.isArray, jt = (n) => G(n) || typeof n?.[Symbol.iterator] == "function", z = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nt = /-->/g, rt = />/g, v = RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, ot = /"/g, $t = /^(?:script|style|textarea|title)$/i, yt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), _ = yt(1), zt = yt(2), w = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), ct = /* @__PURE__ */ new WeakMap(), $ = y.createTreeWalker(y, 129);
function bt(n, t) {
  if (!G(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return it !== void 0 ? it.createHTML(t) : t;
}
const It = (n, t) => {
  const e = n.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = C;
  for (let c = 0; c < e; c++) {
    const o = n[c];
    let u, p, d = -1, g = 0;
    for (; g < o.length && (a.lastIndex = g, p = a.exec(o), p !== null); ) g = a.lastIndex, a === C ? p[1] === "!--" ? a = nt : p[1] !== void 0 ? a = rt : p[2] !== void 0 ? ($t.test(p[2]) && (i = RegExp("</" + p[2], "g")), a = v) : p[3] !== void 0 && (a = v) : a === v ? p[0] === ">" ? (a = i ?? C, d = -1) : p[1] === void 0 ? d = -2 : (d = a.lastIndex - p[2].length, u = p[1], a = p[3] === void 0 ? v : p[3] === '"' ? ot : at) : a === ot || a === at ? a = v : a === nt || a === rt ? a = C : (a = v, i = void 0);
    const m = a === v && n[c + 1].startsWith("/>") ? " " : "";
    r += a === C ? o + Ht : d >= 0 ? (s.push(u), o.slice(0, d) + ft + o.slice(d) + f + m) : o + f + (d === -2 ? c : m);
  }
  return [bt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class T {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const c = t.length - 1, o = this.parts, [u, p] = It(t, e);
    if (this.el = T.createElement(u, s), $.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = $.nextNode()) !== null && o.length < c; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(ft)) {
          const g = p[a++], m = i.getAttribute(d).split(f), R = /([.?@])?(.*)/.exec(g);
          o.push({ type: 1, index: r, name: R[2], strings: m, ctor: R[1] === "." ? Yt : R[1] === "?" ? Bt : R[1] === "@" ? Ft : j }), i.removeAttribute(d);
        } else d.startsWith(f) && (o.push({ type: 6, index: r }), i.removeAttribute(d));
        if ($t.test(i.tagName)) {
          const d = i.textContent.split(f), g = d.length - 1;
          if (g > 0) {
            i.textContent = N ? N.emptyScript : "";
            for (let m = 0; m < g; m++) i.append(d[m], P()), $.nextNode(), o.push({ type: 2, index: ++r });
            i.append(d[g], P());
          }
        }
      } else if (i.nodeType === 8) if (i.data === vt) o.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(f, d + 1)) !== -1; ) o.push({ type: 7, index: r }), d += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = y.createElement("template");
    return s.innerHTML = t, s;
  }
}
function E(n, t, e = n, s) {
  if (t === w) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = O(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = E(n, i._$AS(n, t.values), i, s)), t;
}
class qt {
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
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? y).importNode(e, !0);
    $.currentNode = i;
    let r = $.nextNode(), a = 0, c = 0, o = s[0];
    for (; o !== void 0; ) {
      if (a === o.index) {
        let u;
        o.type === 2 ? u = new M(r, r.nextSibling, this, t) : o.type === 1 ? u = new o.ctor(r, o.name, o.strings, this, t) : o.type === 6 && (u = new Wt(r, this, t)), this._$AV.push(u), o = s[++c];
      }
      a !== o?.index && (r = $.nextNode(), a++);
    }
    return $.currentNode = y, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class M {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    t = E(this, t, e), O(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== w && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : jt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && O(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = T.createElement(bt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new qt(i, this), a = r.u(this.options);
      r.p(e), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = ct.get(t.strings);
    return e === void 0 && ct.set(t.strings, e = new T(t)), e;
  }
  k(t) {
    G(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new M(this.O(P()), this.O(P()), this, this.options)) : s = e[i], s._$AI(r), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = st(t).nextSibling;
      st(t).remove(), t = s;
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
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, i) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = E(this, t, e, 0), a = !O(t) || t !== this._$AH && t !== w, a && (this._$AH = t);
    else {
      const c = t;
      let o, u;
      for (t = r[0], o = 0; o < r.length - 1; o++) u = E(this, c[s + o], e, o), u === w && (u = this._$AH[o]), a ||= !O(u) || u !== this._$AH[o], u === h ? t = h : t !== h && (t += (u ?? "") + r[o + 1]), this._$AH[o] = u;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Yt extends j {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Bt extends j {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Ft extends j {
  constructor(t, e, s, i, r) {
    super(t, e, s, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = E(this, t, e, 0) ?? h) === w) return;
    const s = this._$AH, i = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== h && (s === h || i);
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
const Vt = V.litHtmlPolyfillSupport;
Vt?.(T, M), (V.litHtmlVersions ??= []).push("3.3.3");
const Gt = (n, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new M(t.insertBefore(P(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
const K = globalThis;
class x extends b {
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
x._$litElement$ = !0, x.finalized = !0, K.litElementHydrateSupport?.({ LitElement: x });
const Kt = K.litElementPolyfillSupport;
Kt?.({ LitElement: x });
(K.litElementVersions ??= []).push("4.2.2");
const Zt = { attribute: !0, type: String, converter: D, reflect: !1, hasChanged: W }, Jt = (n = Zt, t, e) => {
  const { kind: s, metadata: i } = e;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), s === "accessor") {
    const { name: a } = e;
    return { set(c) {
      const o = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(a, o, n, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, n, c), c;
    } };
  }
  if (s === "setter") {
    const { name: a } = e;
    return function(c) {
      const o = this[a];
      t.call(this, c), this.requestUpdate(a, o, n, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function Qt(n) {
  return (t, e) => typeof e == "object" ? Jt(n, t, e) : ((s, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(n, t, e);
}
function Z(n) {
  return Qt({ ...n, state: !0, attribute: !1 });
}
const At = "leasing_km", xt = [
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
  "days_remaining",
  "above_target",
  "annual_forecast_exceeded",
  "contract_forecast_exceeded"
], Xt = [...xt].sort((n, t) => t.length - n.length);
function te(n, t) {
  return t && xt.includes(t) ? t : Xt.find((e) => n.endsWith(`_${e}`));
}
function ee(n, t) {
  const e = n.devices?.[t];
  return e?.name_by_user || e?.name || t;
}
function q(n) {
  const t = /* @__PURE__ */ new Map();
  for (const e of Object.values(n.entities ?? {})) {
    if (e.platform !== At || !e.device_id) continue;
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
function lt(n, t) {
  const e = q(n);
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
const se = "No leasing contract found", ie = "Set up the Leasing KM Calculator integration first.", ne = "This contract no longer exists. Please pick it again.", re = "Loading…", ae = "–", oe = "Contract end {date}", ce = "on track", le = "above target", de = "limit at risk", he = "target {p} %", ue = "Mileage used", pe = "{a} / {b} days", _e = "Target vs. actual", ge = "Contract year {n}", me = "Forecast", fe = "Remaining on target basis", ve = "Deviation today", $e = "Deviation at month end", ye = "Actual per day", be = "Mileage left", Ae = "Driven", xe = "Deviation", we = "Allowance", Ee = "Contract year end", Ce = "Contract end", ke = "Expected difference", Se = "Until contract year end", Pe = "Until contract end", Oe = "target {v}", Te = "until contract end", Me = "whole contract average", Re = "last 30 days", Ue = "last 90 days", Le = "over limit", De = "within limit", Ne = "above daily target", He = "below daily target", je = "annual mileage at risk", ze = "annual mileage safe", Ie = "limit will be exceeded", qe = "limit kept", Ye = "Leasing contract", Be = "Title", Fe = "Cap the percentage at 100 %", We = "Show the contract year", Ve = "Show the forecast", Ge = {
  noInstanceTitle: se,
  noInstanceBody: ie,
  missing: ne,
  loading: re,
  unknown: ae,
  contractEnd: oe,
  badgeOk: ce,
  badgeOver: le,
  badgeRisk: de,
  gaugeSub: he,
  progressLabel: ue,
  progressDays: pe,
  sectionTargetActual: _e,
  sectionContractYear: ge,
  sectionForecast: me,
  sectionRemaining: fe,
  mDeviationToday: ve,
  mDeviationMonth: $e,
  mDailyActual: ye,
  mRemainingTotal: be,
  mContractYearDriven: Ae,
  mContractYearDeviation: xe,
  mContractYearAllowance: we,
  mForecastContractYear: Ee,
  mForecastContractEnd: Ce,
  mForecastDeviation: ke,
  mRemainingContractYear: Se,
  mRemainingContractEnd: Pe,
  subTarget: Oe,
  subUntilContractEnd: Te,
  subBasisTotal: Me,
  subBasis30: Re,
  subBasis90: Ue,
  overLimit: Le,
  withinLimit: De,
  pillOverDaily: Ne,
  pillUnderDaily: He,
  pillYearRisk: je,
  pillYearSafe: ze,
  pillLimitExceeded: Ie,
  pillLimitOk: qe,
  editorDevice: Ye,
  editorTitle: Be,
  editorClamp: Fe,
  editorContractYear: We,
  editorForecast: Ve
}, Y = /* @__PURE__ */ Object.assign({
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
}), S = { en: Ge }, dt = (n) => `./translations/${n}.json`, Ke = [
  "en",
  ...Object.keys(Y).map(
    (n) => n.slice(15, -5)
  )
].sort();
function A(n) {
  const e = (n?.locale?.language || n?.language || "en").toLowerCase().split("-")[0];
  return Ke.includes(e) ? e : "en";
}
async function wt(n) {
  if (S[n] || !Y[dt(n)]) return !1;
  try {
    return S[n] = (await Y[dt(n)]()).default, !0;
  } catch {
    return !1;
  }
}
function l(n, t, e) {
  let i = (S[n] ?? S.en)[t] ?? S.en[t] ?? t;
  if (e)
    for (const [r, a] of Object.entries(e))
      i = i.split(`{${r}}`).join(String(a));
  return i;
}
function ht(n) {
  return n?.locale?.language || n?.language || "en";
}
const Ze = St`
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
var Je = Object.defineProperty, Qe = (n, t, e, s) => {
  for (var i = void 0, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (i = a(t, e, i) || i);
  return i && Je(t, e, i), i;
};
const Xe = [
  {
    name: "device_id",
    required: !0,
    selector: { device: { integration: At } }
  },
  { name: "title", selector: { text: {} } },
  { name: "clamp_percent", selector: { boolean: {} } },
  { name: "show_contract_year", selector: { boolean: {} } },
  { name: "show_forecast", selector: { boolean: {} } }
], ts = {
  device_id: "editorDevice",
  title: "editorTitle",
  clamp_percent: "editorClamp",
  show_contract_year: "editorContractYear",
  show_forecast: "editorForecast"
};
class Et extends x {
  constructor() {
    super(...arguments), this._label = (t) => l(A(this.hass), ts[t.name] ?? t.name);
  }
  set hass(t) {
    this._hass = t, wt(A(t)).then(
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
    return !this.hass || !this._config ? h : _`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Xe}
        .computeLabel=${this._label}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}
Qe([
  Z()
], Et.prototype, "_config");
customElements.get("leasing-km-card-editor") || customElements.define("leasing-km-card-editor", Et);
var es = Object.defineProperty, Ct = (n, t, e, s) => {
  for (var i = void 0, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (i = a(t, e, i) || i);
  return i && es(t, e, i), i;
};
const ss = "2.0.0", U = 180, ut = 180, pt = ["unknown", "unavailable", ""];
function _t(n, t, e, s, i) {
  const r = (a) => {
    const c = a * Math.PI / 180;
    return `${n + e * Math.cos(c)} ${t + e * Math.sin(c)}`;
  };
  return `M ${r(s)} A ${e} ${e} 0 ${i - s > 180 ? 1 : 0} 1 ${r(i)}`;
}
const I = (n, t, e) => Math.min(Math.max(n, t), e);
class J extends x {
  static {
    this.styles = Ze;
  }
  static getConfigElement() {
    return document.createElement("leasing-km-card-editor");
  }
  static getStubConfig(t) {
    const [e] = t ? q(t) : [];
    return { device_id: e?.deviceId };
  }
  set hass(t) {
    const e = this._hass;
    this._hass = t, this._instance = lt(t, this._config ?? {}), this._loadCatalog(A(t)), (!e || this._watchedChanged(e, t)) && this.requestUpdate();
  }
  /** Fetch the catalog for the UI language and repaint once it is there. */
  _loadCatalog(t) {
    t !== this._catalog && (this._catalog = t, wt(t).then((e) => e && this.requestUpdate()));
  }
  get hass() {
    return this._hass;
  }
  setConfig(t) {
    this._config = { ...t }, this._hass && (this._instance = lt(this._hass, this._config));
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
    if (!e || pt.includes(e.state)) return null;
    const s = Number(e.state);
    return Number.isFinite(s) ? s : null;
  }
  _flag(t) {
    const e = this._entity(t);
    return !e || pt.includes(e.state) ? null : e.state === "on";
  }
  _unit(t) {
    return this._entity(t)?.attributes.unit_of_measurement ?? "";
  }
  _number(t, e = 0) {
    return t === null ? l(A(this._hass), "unknown") : t.toLocaleString(ht(this._hass), {
      minimumFractionDigits: e,
      maximumFractionDigits: e
    });
  }
  /** Format a value with the unit of the entity it came from. */
  _quantity(t, e = 0, s = !1) {
    const i = this._value(t);
    return i === null ? l(A(this._hass), "unknown") : `${s && i > 0 ? "+" : ""}${this._number(i, e)} ${this._unit(t)}`.trim();
  }
  render() {
    const t = this._hass, e = A(t);
    if (!t || !this._config)
      return _`<ha-card
        ><div class="message">${l(e, "loading")}</div></ha-card
      >`;
    if (!this._instance) {
      const c = q(t).length > 0;
      return _`<ha-card>
        <div class="message">
          ${c ? l(e, "missing") : _`${l(e, "noInstanceTitle")}<br />${l(
        e,
        "noInstanceBody"
      )}`}
        </div>
      </ha-card>`;
    }
    const s = this._value("mileage_used"), i = this._value("contract_elapsed"), r = this._flag("above_target") ?? !1, a = this._flag("contract_forecast_exceeded") ?? !1;
    return _`
      <ha-card>
        ${this._renderHeader(e, r, a)}
        ${this._renderGauge(e, s, i, r)}
        ${this._renderTargetActual(e, r)}
        ${this._config.show_contract_year === !1 ? h : this._renderContractYear(e)}
        ${this._config.show_forecast === !1 ? h : this._renderForecast(e, a)}
        ${this._renderRemaining(e)}
        ${this._renderPills(e, r, a)}
      </ha-card>
    `;
  }
  _renderHeader(t, e, s) {
    const i = this._meta("contract_end"), r = i ? new Date(i).toLocaleDateString(ht(this._hass)) : l(t, "unknown"), a = s ? { text: l(t, "badgeRisk"), cls: "bad" } : e ? { text: l(t, "badgeOver"), cls: "warn" } : { text: l(t, "badgeOk"), cls: "good" };
    return _`
      <div class="header">
        <ha-icon icon="mdi:car-clock"></ha-icon>
        <div class="titles">
          <div class="title">${this._config.title || this._instance.label}</div>
          <div class="subtitle">
            ${l(t, "contractEnd", { date: r })}
          </div>
        </div>
        <span class="badge ${a.cls}">${a.text}</span>
      </div>
    `;
  }
  _renderGauge(t, e, s, i) {
    const r = e === null ? 0 : this._config.clamp_percent ? I(e, 0, 100) : e, a = I(e ?? 0, 0, 100), c = I(s ?? 0, 0, 100), o = (U + c / 100 * ut) * Math.PI / 180, u = i ? "var(--lkm-bad)" : "var(--lkm-ok)";
    return _`
      <svg class="gauge" viewBox="0 8 220 128" role="img">
        ${zt`
          <path class="gauge-track" d="${_t(110, 110, 88, U, 360)}" />
          <path
            class="gauge-fill"
            style="stroke: ${u}"
            d="${_t(110, 110, 88, U, U + a / 100 * ut)}"
          />
          <line
            class="gauge-marker"
            x1="${110 + 78 * Math.cos(o)}"
            y1="${110 + 78 * Math.sin(o)}"
            x2="${110 + 98 * Math.cos(o)}"
            y2="${110 + 98 * Math.sin(o)}"
          />
          <text class="gauge-value" x="110" y="100">${this._number(r, 1)} %</text>
          <text class="gauge-sub" x="110" y="120">
            ${l(t, "gaugeSub", { p: this._number(s, 1) })}
          </text>
          <text class="gauge-scale" x="22" y="128">0 %</text>
          <text class="gauge-scale" x="198" y="128">100 %</text>
        `}
      </svg>

      <div class="bar-wrap">
        <div class="bar target" style="width: ${c}%"></div>
        <div
          class="bar"
          style="width: ${a}%; background: ${u}"
        ></div>
      </div>
      <div class="bar-legend">
        <span>${l(t, "progressLabel")}</span>
        <span>${this._days(t)}</span>
      </div>
    `;
  }
  _days(t) {
    const e = this._meta("elapsed_days"), s = this._meta("total_days");
    return e === void 0 || s === void 0 ? "" : l(t, "progressDays", {
      a: this._number(e),
      b: this._number(s)
    });
  }
  _renderTargetActual(t, e) {
    const s = (this._value("deviation_month_end") ?? 0) > 0, i = this._value("remaining_total");
    return _`
      <div class="section">${l(t, "sectionTargetActual")}</div>
      <div class="grid">
        ${this._tile(
      l(t, "mDeviationToday"),
      this._quantity("deviation_today", 0, !0),
      l(t, "subTarget", { v: this._quantity("target_today") }),
      e ? "bad" : "good"
    )}
        ${this._tile(
      l(t, "mDeviationMonth"),
      this._quantity("deviation_month_end", 0, !0),
      l(t, "subTarget", { v: this._quantity("target_month_end") }),
      s ? "bad" : "good"
    )}
        ${this._tile(
      l(t, "mDailyActual"),
      this._quantity("daily_actual", 1),
      l(t, "subTarget", { v: this._quantity("daily_target", 1) })
    )}
        ${this._tile(
      l(t, "mRemainingTotal"),
      this._quantity("remaining_total"),
      l(t, "subUntilContractEnd"),
      i !== null && i < 0 ? "bad" : void 0
    )}
      </div>
    `;
  }
  _renderContractYear(t) {
    if (this._value("contract_year_driven") === null) return h;
    const s = this._value("contract_year_deviation");
    return _`
      <div class="section">
        ${l(t, "sectionContractYear", { n: this._contractYear() })}
      </div>
      <div class="grid">
        ${this._tile(
      l(t, "mContractYearDriven"),
      this._quantity("contract_year_driven")
    )}
        ${this._tile(
      l(t, "mContractYearDeviation"),
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
    return _`
      <div class="section">${l(t, "sectionForecast")}</div>
      <div class="grid">
        ${this._tile(
      l(t, "mForecastContractYear"),
      this._quantity("forecast_contract_year_end"),
      l(t, s ? "overLimit" : "withinLimit"),
      s ? "bad" : "good"
    )}
        ${this._tile(
      l(t, "mForecastContractEnd"),
      this._quantity("forecast_contract_end"),
      l(t, e ? "overLimit" : "withinLimit"),
      e ? "bad" : "good"
    )}
        ${this._tile(
      l(t, "mForecastDeviation"),
      this._quantity("forecast_deviation_contract_end", 0, !0),
      void 0,
      (i ?? 0) > 0 ? "bad" : "good"
    )}
      </div>
    `;
  }
  _renderRemaining(t) {
    return _`
      <div class="section">${l(t, "sectionRemaining")}</div>
      <div class="grid">
        ${this._tile(
      l(t, "mRemainingContractYear"),
      this._quantity("remaining_contract_year")
    )}
        ${this._tile(
      l(t, "mRemainingContractEnd"),
      this._quantity("remaining_contract_end")
    )}
      </div>
    `;
  }
  _renderPills(t, e, s) {
    const i = this._flag("annual_forecast_exceeded") ?? !1, r = (a, c, o) => _`
      <span class="pill">
        <span class="dot ${a ? "bad" : "good"}"></span>
        ${l(t, a ? c : o)}
      </span>
    `;
    return _`
      <div class="pills">
        ${r(e, "pillOverDaily", "pillUnderDaily")}
        ${r(i, "pillYearRisk", "pillYearSafe")}
        ${r(s, "pillLimitExceeded", "pillLimitOk")}
      </div>
    `;
  }
  _tile(t, e, s, i) {
    return _`
      <div class="tile">
        <div class="label">${t}</div>
        <div class="value ${i ?? ""}">${e}</div>
        ${s ? _`<div class="hint">${s}</div>` : h}
      </div>
    `;
  }
}
Ct([
  Z()
], J.prototype, "_config");
Ct([
  Z()
], J.prototype, "_instance");
customElements.get("leasing-km-card") || customElements.define("leasing-km-card", J);
const gt = window.customCards ??= [];
gt.some((n) => n.type === "leasing-km-card") || gt.push({
  type: "leasing-km-card",
  name: "Leasing KM Card",
  description: "Leasing mileage at a glance: gauge, target versus actual and forecast.",
  preview: !0,
  documentationURL: "https://github.com/sphings79/leasing-km-home-assistant"
});
console.info(
  `%c LEASING-KM-CARD %c v${ss} `,
  "background:#03a9f4;color:#fff;font-weight:600;padding:2px 6px;border-radius:3px 0 0 3px",
  "background:#333;color:#03a9f4;font-weight:600;padding:2px 6px;border-radius:0 3px 3px 0"
);
export {
  J as LeasingKmCard
};
