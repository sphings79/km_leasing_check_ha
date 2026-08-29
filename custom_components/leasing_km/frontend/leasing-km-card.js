const O = globalThis, j = O.ShadowRoot && (O.ShadyCSS === void 0 || O.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, F = /* @__PURE__ */ Symbol(), Z = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== F) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (j && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Z.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Z.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const wt = (n) => new _t(typeof n == "string" ? n : n + "", void 0, F), Ct = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new _t(e, n, F);
}, Et = (n, t) => {
  if (j) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = O.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, Q = j ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return wt(e);
})(n) : n;
const { is: kt, defineProperty: St, getOwnPropertyDescriptor: Tt, getOwnPropertyNames: Dt, getOwnPropertySymbols: Lt, getPrototypeOf: Rt } = Object, z = globalThis, X = z.trustedTypes, Ot = X ? X.emptyScript : "", Pt = z.reactiveElementPolyfillSupport, E = (n, t) => n, U = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Ot : null;
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
} }, q = (n, t) => !kt(n, t), tt = { attribute: !0, type: String, converter: U, reflect: !1, useDefault: !1, hasChanged: q };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), z.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let b = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = tt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && St(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = Tt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: s, set(a) {
      const c = s?.call(this);
      r?.call(this, a), this.requestUpdate(t, c, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? tt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(E("elementProperties"))) return;
    const t = Rt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(E("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(E("properties"))) {
      const e = this.properties, i = [...Dt(e), ...Lt(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(Q(s));
    } else t !== void 0 && e.push(Q(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Et(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : U).toAttribute(e, i.type);
      this._$Em = t, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const r = i.getPropertyOptions(s), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : U;
      this._$Em = s;
      const c = a.fromAttribute(e, r.type);
      this[s] = c ?? this._$Ej?.get(s) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (s === !1 && (r = this[t]), i ??= a.getPropertyOptions(t), !((i.hasChanged ?? q)(r, e) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: r }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [s, r] of this._$Ep) this[s] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, r] of i) {
        const { wrapped: a } = r, c = this[s];
        a !== !0 || this._$AL.has(s) || c === void 0 || this.C(s, void 0, r, c);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
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
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[E("elementProperties")] = /* @__PURE__ */ new Map(), b[E("finalized")] = /* @__PURE__ */ new Map(), Pt?.({ ReactiveElement: b }), (z.reactiveElementVersions ??= []).push("2.1.2");
const V = globalThis, et = (n) => n, N = V.trustedTypes, it = N ? N.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, gt = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, mt = "?" + f, Mt = `<${mt}>`, y = document, k = () => y.createComment(""), S = (n) => n === null || typeof n != "object" && typeof n != "function", W = Array.isArray, Ut = (n) => W(n) || typeof n?.[Symbol.iterator] == "function", H = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, st = /-->/g, nt = />/g, $ = RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), rt = /'/g, at = /"/g, ft = /^(?:script|style|textarea|title)$/i, $t = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), _ = $t(1), Nt = $t(2), x = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), ot = /* @__PURE__ */ new WeakMap(), v = y.createTreeWalker(y, 129);
function vt(n, t) {
  if (!W(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return it !== void 0 ? it.createHTML(t) : t;
}
const zt = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = C;
  for (let c = 0; c < e; c++) {
    const o = n[c];
    let u, p, d = -1, g = 0;
    for (; g < o.length && (a.lastIndex = g, p = a.exec(o), p !== null); ) g = a.lastIndex, a === C ? p[1] === "!--" ? a = st : p[1] !== void 0 ? a = nt : p[2] !== void 0 ? (ft.test(p[2]) && (s = RegExp("</" + p[2], "g")), a = $) : p[3] !== void 0 && (a = $) : a === $ ? p[0] === ">" ? (a = s ?? C, d = -1) : p[1] === void 0 ? d = -2 : (d = a.lastIndex - p[2].length, u = p[1], a = p[3] === void 0 ? $ : p[3] === '"' ? at : rt) : a === at || a === rt ? a = $ : a === st || a === nt ? a = C : (a = $, s = void 0);
    const m = a === $ && n[c + 1].startsWith("/>") ? " " : "";
    r += a === C ? o + Mt : d >= 0 ? (i.push(u), o.slice(0, d) + gt + o.slice(d) + f + m) : o + f + (d === -2 ? c : m);
  }
  return [vt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class T {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, a = 0;
    const c = t.length - 1, o = this.parts, [u, p] = zt(t, e);
    if (this.el = T.createElement(u, i), v.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (s = v.nextNode()) !== null && o.length < c; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const d of s.getAttributeNames()) if (d.endsWith(gt)) {
          const g = p[a++], m = s.getAttribute(d).split(f), L = /([.?@])?(.*)/.exec(g);
          o.push({ type: 1, index: r, name: L[2], strings: m, ctor: L[1] === "." ? Ht : L[1] === "?" ? It : L[1] === "@" ? Bt : Y }), s.removeAttribute(d);
        } else d.startsWith(f) && (o.push({ type: 6, index: r }), s.removeAttribute(d));
        if (ft.test(s.tagName)) {
          const d = s.textContent.split(f), g = d.length - 1;
          if (g > 0) {
            s.textContent = N ? N.emptyScript : "";
            for (let m = 0; m < g; m++) s.append(d[m], k()), v.nextNode(), o.push({ type: 2, index: ++r });
            s.append(d[g], k());
          }
        }
      } else if (s.nodeType === 8) if (s.data === mt) o.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = s.data.indexOf(f, d + 1)) !== -1; ) o.push({ type: 7, index: r }), d += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = y.createElement("template");
    return i.innerHTML = t, i;
  }
}
function w(n, t, e = n, i) {
  if (t === x) return t;
  let s = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const r = S(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = s : e._$Cl = s), s !== void 0 && (t = w(n, s._$AS(n, t.values), s, i)), t;
}
class Yt {
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
    const { el: { content: e }, parts: i } = this._$AD, s = (t?.creationScope ?? y).importNode(e, !0);
    v.currentNode = s;
    let r = v.nextNode(), a = 0, c = 0, o = i[0];
    for (; o !== void 0; ) {
      if (a === o.index) {
        let u;
        o.type === 2 ? u = new D(r, r.nextSibling, this, t) : o.type === 1 ? u = new o.ctor(r, o.name, o.strings, this, t) : o.type === 6 && (u = new jt(r, this, t)), this._$AV.push(u), o = i[++c];
      }
      a !== o?.index && (r = v.nextNode(), a++);
    }
    return v.currentNode = y, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class D {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = w(this, t, e), S(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== x && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ut(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && S(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = T.createElement(vt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const r = new Yt(s, this), a = r.u(this.options);
      r.p(e), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = ot.get(t.strings);
    return e === void 0 && ot.set(t.strings, e = new T(t)), e;
  }
  k(t) {
    W(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new D(this.O(k()), this.O(k()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = et(t).nextSibling;
      et(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Y {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = w(this, t, e, 0), a = !S(t) || t !== this._$AH && t !== x, a && (this._$AH = t);
    else {
      const c = t;
      let o, u;
      for (t = r[0], o = 0; o < r.length - 1; o++) u = w(this, c[i + o], e, o), u === x && (u = this._$AH[o]), a ||= !S(u) || u !== this._$AH[o], u === h ? t = h : t !== h && (t += (u ?? "") + r[o + 1]), this._$AH[o] = u;
    }
    a && !s && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ht extends Y {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class It extends Y {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Bt extends Y {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = w(this, t, e, 0) ?? h) === x) return;
    const i = this._$AH, s = t === h && i !== h || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== h && (i === h || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class jt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    w(this, t);
  }
}
const Ft = V.litHtmlPolyfillSupport;
Ft?.(T, D), (V.litHtmlVersions ??= []).push("3.3.3");
const qt = (n, t, e) => {
  const i = e?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = e?.renderBefore ?? null;
    i._$litPart$ = s = new D(t.insertBefore(k(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
const K = globalThis;
class A extends b {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = qt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return x;
  }
}
A._$litElement$ = !0, A.finalized = !0, K.litElementHydrateSupport?.({ LitElement: A });
const Vt = K.litElementPolyfillSupport;
Vt?.({ LitElement: A });
(K.litElementVersions ??= []).push("4.2.2");
const Wt = { attribute: !0, type: String, converter: U, reflect: !1, hasChanged: q }, Kt = (n = Wt, t, e) => {
  const { kind: i, metadata: s } = e;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), i === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), i === "accessor") {
    const { name: a } = e;
    return { set(c) {
      const o = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(a, o, n, !0, c);
    }, init(c) {
      return c !== void 0 && this.C(a, void 0, n, c), c;
    } };
  }
  if (i === "setter") {
    const { name: a } = e;
    return function(c) {
      const o = this[a];
      t.call(this, c), this.requestUpdate(a, o, n, !0, c);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function Gt(n) {
  return (t, e) => typeof e == "object" ? Kt(n, t, e) : ((i, s, r) => {
    const a = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, i), a ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(n, t, e);
}
function G(n) {
  return Gt({ ...n, state: !0, attribute: !1 });
}
const yt = "leasing_km", bt = [
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
], Jt = [...bt].sort((n, t) => t.length - n.length);
function Zt(n, t) {
  return t && bt.includes(t) ? t : Jt.find((e) => n.endsWith(`_${e}`));
}
function Qt(n, t) {
  const e = n.devices?.[t];
  return e?.name_by_user || e?.name || t;
}
function B(n) {
  const t = /* @__PURE__ */ new Map();
  for (const e of Object.values(n.entities ?? {})) {
    if (e.platform !== yt || !e.device_id) continue;
    const i = Zt(e.entity_id, e.translation_key);
    if (!i) continue;
    let s = t.get(e.device_id);
    s || (s = {
      deviceId: e.device_id,
      label: Qt(n, e.device_id),
      entities: {}
    }, t.set(e.device_id, s)), s.entities[i] = e.entity_id;
  }
  return [...t.values()].sort((e, i) => e.label.localeCompare(i.label));
}
function ct(n, t) {
  const e = B(n);
  if (t.device_id)
    return e.find((i) => i.deviceId === t.device_id);
  if (t.entity_prefix) {
    const i = `sensor.${t.entity_prefix}_`;
    return e.find(
      (s) => Object.values(s.entities).some((r) => r.startsWith(i))
    );
  }
  return e[0];
}
const Xt = "Kein Leasingvertrag gefunden", te = "Richte zuerst die Integration Leasing KM-Rechner ein.", ee = "Dieser Vertrag existiert nicht mehr. Bitte neu auswählen.", ie = "Wird geladen…", se = "–", ne = "Vertragsende {date}", re = "im Plan", ae = "über Soll", oe = "Limit gefährdet", ce = "Soll {p} %", le = "KM absolviert", de = "{a} / {b} Tage", he = "Soll und Ist", ue = "Vertragsjahr {n}", pe = "Prognose", _e = "Verbleibend auf Sollbasis", ge = "Differenz heute", me = "Differenz Monatsende", fe = "Tagesleistung Ist", $e = "Noch erlaubt", ve = "Gefahren", ye = "Differenz", be = "Budget", Ae = "Vertragsjahresende", xe = "Laufzeitende", we = "Erwartete Abweichung", Ce = "Bis Vertragsjahresende", Ee = "Bis Laufzeitende", ke = "Soll {v}", Se = "bis Laufzeitende", Te = "Durchschnitt gesamte Laufzeit", De = "letzte 30 Tage", Le = "letzte 90 Tage", Re = "über Limit", Oe = "im Limit", Pe = "über Tagessoll", Me = "unter Tagessoll", Ue = "Jahres-KM gefährdet", Ne = "Jahres-KM sicher", ze = "Limit wird überschritten", Ye = "Limit wird gehalten", He = "Leasingvertrag", Ie = "Titel", Be = "Prozentwert bei 100 % kappen", je = "Vertragsjahr anzeigen", Fe = "Prognose anzeigen", qe = {
  noInstanceTitle: Xt,
  noInstanceBody: te,
  missing: ee,
  loading: ie,
  unknown: se,
  contractEnd: ne,
  badgeOk: re,
  badgeOver: ae,
  badgeRisk: oe,
  gaugeSub: ce,
  progressLabel: le,
  progressDays: de,
  sectionTargetActual: he,
  sectionContractYear: ue,
  sectionForecast: pe,
  sectionRemaining: _e,
  mDeviationToday: ge,
  mDeviationMonth: me,
  mDailyActual: fe,
  mRemainingTotal: $e,
  mContractYearDriven: ve,
  mContractYearDeviation: ye,
  mContractYearAllowance: be,
  mForecastContractYear: Ae,
  mForecastContractEnd: xe,
  mForecastDeviation: we,
  mRemainingContractYear: Ce,
  mRemainingContractEnd: Ee,
  subTarget: ke,
  subUntilContractEnd: Se,
  subBasisTotal: Te,
  subBasis30: De,
  subBasis90: Le,
  overLimit: Re,
  withinLimit: Oe,
  pillOverDaily: Pe,
  pillUnderDaily: Me,
  pillYearRisk: Ue,
  pillYearSafe: Ne,
  pillLimitExceeded: ze,
  pillLimitOk: Ye,
  editorDevice: He,
  editorTitle: Ie,
  editorClamp: Be,
  editorContractYear: je,
  editorForecast: Fe
}, Ve = "No leasing contract found", We = "Set up the Leasing KM Calculator integration first.", Ke = "This contract no longer exists. Please pick it again.", Ge = "Loading…", Je = "–", Ze = "Contract end {date}", Qe = "on track", Xe = "above target", ti = "limit at risk", ei = "target {p} %", ii = "Mileage used", si = "{a} / {b} days", ni = "Target vs. actual", ri = "Contract year {n}", ai = "Forecast", oi = "Remaining on target basis", ci = "Deviation today", li = "Deviation at month end", di = "Actual per day", hi = "Mileage left", ui = "Driven", pi = "Deviation", _i = "Allowance", gi = "Contract year end", mi = "Contract end", fi = "Expected difference", $i = "Until contract year end", vi = "Until contract end", yi = "target {v}", bi = "until contract end", Ai = "whole contract average", xi = "last 30 days", wi = "last 90 days", Ci = "over limit", Ei = "within limit", ki = "above daily target", Si = "below daily target", Ti = "annual mileage at risk", Di = "annual mileage safe", Li = "limit will be exceeded", Ri = "limit kept", Oi = "Leasing contract", Pi = "Title", Mi = "Cap the percentage at 100 %", Ui = "Show the contract year", Ni = "Show the forecast", zi = {
  noInstanceTitle: Ve,
  noInstanceBody: We,
  missing: Ke,
  loading: Ge,
  unknown: Je,
  contractEnd: Ze,
  badgeOk: Qe,
  badgeOver: Xe,
  badgeRisk: ti,
  gaugeSub: ei,
  progressLabel: ii,
  progressDays: si,
  sectionTargetActual: ni,
  sectionContractYear: ri,
  sectionForecast: ai,
  sectionRemaining: oi,
  mDeviationToday: ci,
  mDeviationMonth: li,
  mDailyActual: di,
  mRemainingTotal: hi,
  mContractYearDriven: ui,
  mContractYearDeviation: pi,
  mContractYearAllowance: _i,
  mForecastContractYear: gi,
  mForecastContractEnd: mi,
  mForecastDeviation: fi,
  mRemainingContractYear: $i,
  mRemainingContractEnd: vi,
  subTarget: yi,
  subUntilContractEnd: bi,
  subBasisTotal: Ai,
  subBasis30: xi,
  subBasis90: wi,
  overLimit: Ci,
  withinLimit: Ei,
  pillOverDaily: ki,
  pillUnderDaily: Si,
  pillYearRisk: Ti,
  pillYearSafe: Di,
  pillLimitExceeded: Li,
  pillLimitOk: Ri,
  editorDevice: Oi,
  editorTitle: Pi,
  editorClamp: Mi,
  editorContractYear: Ui,
  editorForecast: Ni
}, P = { en: zi, de: qe };
function M(n) {
  const e = (n?.locale?.language || n?.language || "en").toLowerCase().split("-")[0];
  return e in P ? e : "en";
}
function l(n, t, e) {
  let s = (P[n] ?? P.en)[t] ?? P.en[t] ?? t;
  if (e)
    for (const [r, a] of Object.entries(e))
      s = s.split(`{${r}}`).join(String(a));
  return s;
}
function lt(n) {
  return n?.locale?.language || n?.language || "en";
}
const Yi = Ct`
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
var Hi = Object.defineProperty, Ii = (n, t, e, i) => {
  for (var s = void 0, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (s = a(t, e, s) || s);
  return s && Hi(t, e, s), s;
};
const Bi = [
  {
    name: "device_id",
    required: !0,
    selector: { device: { integration: yt } }
  },
  { name: "title", selector: { text: {} } },
  { name: "clamp_percent", selector: { boolean: {} } },
  { name: "show_contract_year", selector: { boolean: {} } },
  { name: "show_forecast", selector: { boolean: {} } }
], ji = {
  device_id: "editorDevice",
  title: "editorTitle",
  clamp_percent: "editorClamp",
  show_contract_year: "editorContractYear",
  show_forecast: "editorForecast"
};
class At extends A {
  constructor() {
    super(...arguments), this._label = (t) => l(M(this.hass), ji[t.name] ?? t.name);
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
        .schema=${Bi}
        .computeLabel=${this._label}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}
Ii([
  G()
], At.prototype, "_config");
customElements.get("leasing-km-card-editor") || customElements.define("leasing-km-card-editor", At);
var Fi = Object.defineProperty, xt = (n, t, e, i) => {
  for (var s = void 0, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (s = a(t, e, s) || s);
  return s && Fi(t, e, s), s;
};
const qi = "2.0.0", R = 180, dt = 180, ht = ["unknown", "unavailable", ""];
function ut(n, t, e, i, s) {
  const r = (a) => {
    const c = a * Math.PI / 180;
    return `${n + e * Math.cos(c)} ${t + e * Math.sin(c)}`;
  };
  return `M ${r(i)} A ${e} ${e} 0 ${s - i > 180 ? 1 : 0} 1 ${r(s)}`;
}
const I = (n, t, e) => Math.min(Math.max(n, t), e);
class J extends A {
  static {
    this.styles = Yi;
  }
  static getConfigElement() {
    return document.createElement("leasing-km-card-editor");
  }
  static getStubConfig(t) {
    const [e] = t ? B(t) : [];
    return { device_id: e?.deviceId };
  }
  set hass(t) {
    const e = this._hass;
    this._hass = t, this._instance = ct(t, this._config ?? {}), (!e || this._watchedChanged(e, t)) && this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  setConfig(t) {
    this._config = { ...t }, this._hass && (this._instance = ct(this._hass, this._config));
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
    for (const i of Object.values(this._instance.entities))
      if (t.states[i] !== e.states[i]) return !0;
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
    if (!e || ht.includes(e.state)) return null;
    const i = Number(e.state);
    return Number.isFinite(i) ? i : null;
  }
  _flag(t) {
    const e = this._entity(t);
    return !e || ht.includes(e.state) ? null : e.state === "on";
  }
  _unit(t) {
    return this._entity(t)?.attributes.unit_of_measurement ?? "";
  }
  _number(t, e = 0) {
    return t === null ? l(M(this._hass), "unknown") : t.toLocaleString(lt(this._hass), {
      minimumFractionDigits: e,
      maximumFractionDigits: e
    });
  }
  /** Format a value with the unit of the entity it came from. */
  _quantity(t, e = 0, i = !1) {
    const s = this._value(t);
    return s === null ? l(M(this._hass), "unknown") : `${i && s > 0 ? "+" : ""}${this._number(s, e)} ${this._unit(t)}`.trim();
  }
  render() {
    const t = this._hass, e = M(t);
    if (!t || !this._config)
      return _`<ha-card
        ><div class="message">${l(e, "loading")}</div></ha-card
      >`;
    if (!this._instance) {
      const c = B(t).length > 0;
      return _`<ha-card>
        <div class="message">
          ${c ? l(e, "missing") : _`${l(e, "noInstanceTitle")}<br />${l(
        e,
        "noInstanceBody"
      )}`}
        </div>
      </ha-card>`;
    }
    const i = this._value("mileage_used"), s = this._value("contract_elapsed"), r = this._flag("above_target") ?? !1, a = this._flag("contract_forecast_exceeded") ?? !1;
    return _`
      <ha-card>
        ${this._renderHeader(e, r, a)}
        ${this._renderGauge(e, i, s, r)}
        ${this._renderTargetActual(e, r)}
        ${this._config.show_contract_year === !1 ? h : this._renderContractYear(e)}
        ${this._config.show_forecast === !1 ? h : this._renderForecast(e, a)}
        ${this._renderRemaining(e)}
        ${this._renderPills(e, r, a)}
      </ha-card>
    `;
  }
  _renderHeader(t, e, i) {
    const s = this._meta("contract_end"), r = s ? new Date(s).toLocaleDateString(lt(this._hass)) : l(t, "unknown"), a = i ? { text: l(t, "badgeRisk"), cls: "bad" } : e ? { text: l(t, "badgeOver"), cls: "warn" } : { text: l(t, "badgeOk"), cls: "good" };
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
  _renderGauge(t, e, i, s) {
    const r = e === null ? 0 : this._config.clamp_percent ? I(e, 0, 100) : e, a = I(e ?? 0, 0, 100), c = I(i ?? 0, 0, 100), o = (R + c / 100 * dt) * Math.PI / 180, u = s ? "var(--lkm-bad)" : "var(--lkm-ok)";
    return _`
      <svg class="gauge" viewBox="0 8 220 128" role="img">
        ${Nt`
          <path class="gauge-track" d="${ut(110, 110, 88, R, 360)}" />
          <path
            class="gauge-fill"
            style="stroke: ${u}"
            d="${ut(110, 110, 88, R, R + a / 100 * dt)}"
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
            ${l(t, "gaugeSub", { p: this._number(i, 1) })}
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
    const e = this._meta("elapsed_days"), i = this._meta("total_days");
    return e === void 0 || i === void 0 ? "" : l(t, "progressDays", {
      a: this._number(e),
      b: this._number(i)
    });
  }
  _renderTargetActual(t, e) {
    const i = (this._value("deviation_month_end") ?? 0) > 0, s = this._value("remaining_total");
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
      i ? "bad" : "good"
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
      s !== null && s < 0 ? "bad" : void 0
    )}
      </div>
    `;
  }
  _renderContractYear(t) {
    if (this._value("contract_year_driven") === null) return h;
    const i = this._value("contract_year_deviation");
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
      (i ?? 0) > 0 ? "bad" : "good"
    )}
      </div>
    `;
  }
  _contractYear() {
    return String(this._meta("contract_year") ?? "");
  }
  _renderForecast(t, e) {
    const i = this._flag("annual_forecast_exceeded") ?? !1, s = this._value("forecast_deviation_contract_end");
    return _`
      <div class="section">${l(t, "sectionForecast")}</div>
      <div class="grid">
        ${this._tile(
      l(t, "mForecastContractYear"),
      this._quantity("forecast_contract_year_end"),
      l(t, i ? "overLimit" : "withinLimit"),
      i ? "bad" : "good"
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
      (s ?? 0) > 0 ? "bad" : "good"
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
  _renderPills(t, e, i) {
    const s = this._flag("annual_forecast_exceeded") ?? !1, r = (a, c, o) => _`
      <span class="pill">
        <span class="dot ${a ? "bad" : "good"}"></span>
        ${l(t, a ? c : o)}
      </span>
    `;
    return _`
      <div class="pills">
        ${r(e, "pillOverDaily", "pillUnderDaily")}
        ${r(s, "pillYearRisk", "pillYearSafe")}
        ${r(i, "pillLimitExceeded", "pillLimitOk")}
      </div>
    `;
  }
  _tile(t, e, i, s) {
    return _`
      <div class="tile">
        <div class="label">${t}</div>
        <div class="value ${s ?? ""}">${e}</div>
        ${i ? _`<div class="hint">${i}</div>` : h}
      </div>
    `;
  }
}
xt([
  G()
], J.prototype, "_config");
xt([
  G()
], J.prototype, "_instance");
customElements.get("leasing-km-card") || customElements.define("leasing-km-card", J);
const pt = window.customCards ??= [];
pt.some((n) => n.type === "leasing-km-card") || pt.push({
  type: "leasing-km-card",
  name: "Leasing KM Card",
  description: "Leasing mileage at a glance: gauge, target versus actual and forecast.",
  preview: !0,
  documentationURL: "https://github.com/sphings79/leasing-km-home-assistant"
});
console.info(
  `%c LEASING-KM-CARD %c v${qi} `,
  "background:#03a9f4;color:#fff;font-weight:600;padding:2px 6px;border-radius:3px 0 0 3px",
  "background:#333;color:#03a9f4;font-weight:600;padding:2px 6px;border-radius:0 3px 3px 0"
);
export {
  J as LeasingKmCard
};
