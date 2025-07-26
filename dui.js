!(function (global, factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document
            ? factory(global, true)
            : function (w) {
                if (!w.document) throw new Error("dui requires a document");
                return factory(w);
            };
    } else if (typeof define === 'function' && define.amd) {
        // AMD desteği
        define(function () {
            return factory(global, true);
        });
    } else {
        // Global tarayıcı ortamı
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    "use strict";

    var dui = function dui() { };

    dui.select = function (selector) {
        if (selector instanceof dui) {
            return selector;
        }

        return new dui.mt.init(selector);
    };

    dui.mt = dui.prototype = {
        constructor: dui,
        length: 0,
        init: function (selector) {
            this.length = 0;
            this.elements = [];

            if (!selector) return this;

            if (typeof selector === 'function') {
                dui.ready(selector);
                return this;
            }

            if (selector === window || selector === document || isDomElement(selector)) {
                if (selector instanceof NodeList || selector instanceof HTMLCollection) {
                    for (let i = 0; i < selector.length; i++) {
                        this.elements[i] = selector[i];
                    }

                    this.length = selector.length;
                    return this;
                }

                this.elements[0] = selector;
                this.length = 1;
                return this;
            }

            if (typeof selector === 'string') {
                try {
                    selector = selector.trim();

                    if (selector[0] === "<" || selector[selector.length - 1] === ">") {
                        const tmp = document.createElement("template");
                        tmp.innerHTML = selector;
                        const nodes = tmp.content.children;

                        if (!nodes.length) {
                            throw new Error('HTML string boş veya geçersiz');
                        }

                        for (let i = 0; i < nodes.length; i++) {
                            this.elements[i] = nodes[i];
                        }

                        this.length = nodes.length;
                    } else {
                        const nodes = document.querySelectorAll(selector);

                        if (!nodes.length) {
                            throw new Error(`Seçici "${selector}" ile eşleşen eleman bulunamadı`);
                        }

                        Array.from(nodes).forEach((node, i) => this.elements[i] = node);
                        this.length = nodes.length;
                    }
                } catch (e) {
                    console.error(`Geçersiz seçici: ${selector}. Hata: ${e.message}`);
                }
                return this;
            }

            if (isArrayLike(selector)) {
                Array.from(selector).forEach((node, i) => this.elements[i] = node);
                this.length = selector.length;
                return this;
            }

            return this;
        },
        //#region ------------------- SignalBasedReactiveDataLink -----------
        uiRender: uiRender,
        //#endregion ---------------- SignalBasedReactiveDataLink -----------
    };

    dui.mt.init.prototype = dui.mt;

    dui.extend = function (nameOrObject, fn) {
        if (typeof nameOrObject === 'object') {
            Object.keys(nameOrObject).forEach(key => {
                if (key !== 'constructor' && key !== '__proto__') {
                    dui.mt[key] = nameOrObject[key];
                }
            });
        } else if (typeof nameOrObject === 'string' && typeof fn === 'function') {
            if (nameOrObject !== 'constructor' && nameOrObject !== '__proto__') {
                dui.mt[nameOrObject] = fn;
            }
        }
    };

    dui.extendStatic = function (obj) {
        Object.keys(obj).forEach(key => {
            if (key !== 'constructor' && key !== '__proto__') {
                dui[key] = obj[key];
            }
        });
    };

    dui.commonDataSignalStoreKey = null;
    //#region ---------------- Common Tool ------------------------------
    dui.addOjectHash = addOjectHash;
    function addOjectHash(obj) {
        if (typeof obj === "object" && !obj["_ojectHash"]) {
            Object.defineProperty(obj, "_ojectHash", {
                value: universalHash(obj, { keysOnly: true }),
                enumerable: false,
                writable: true,
                configurable: true
            });
        }

        return obj._ojectHash;
    }

    function isFirstLetter(str) {
        if (str.length && str[0]) {
            return str[0] && str[0].toLocaleUpperCase() !== str[0].toLocaleLowerCase();
        }
        return false;
    }
    dui.newGuid = uuidv4;
    function uuidv4() {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    //#endregion ------------- Common Tool --------------------------------

    //#region ------------------- SignalBasedReactiveDataLink -----------
    //#region ------------------- Data And UI Tool ----------------------
    dui.universalHash = universalHash;
    function universalHash(obj, options = {}) {
        const MODULO = 2147483647; // 2^31-1 (büyük asal sayı)
        const { includeFunctions = false, exclude = [], keysOnly = false, visited = new Set() } = options;
        // Null veya undefined için sıfır dön
        if (obj === null || obj === undefined) return 0;

        // Circular referans önleme
        if (typeof obj === 'object' || typeof obj === 'function') {
            if (visited.has(obj)) return 0;
            visited.add(obj);
        }

        let hash = 17;

        // Tip adını hash'e dahil et
        let typeName = typeof obj === 'object' && obj.constructor && obj.constructor.name
            ? obj.constructor.name
            : typeof obj;
        hash = (hash * 31 + simpleStringHash(typeName)) % MODULO;

        // Number
        if (typeof obj === 'number') {
            if (!keysOnly) hash = (hash * 31 + numberHash(obj)) % MODULO;
            return (hash < 0 ? -hash : hash);
        }

        // Boolean
        if (typeof obj === 'boolean') {
            if (!keysOnly) hash = (hash * 31 + (obj ? 123 : 456)) % MODULO;
            return (hash < 0 ? -hash : hash);
        }

        // String
        if (typeof obj === 'string') {
            if (!keysOnly) hash = (hash * 31 + simpleStringHash(obj)) % MODULO;
            return (hash < 0 ? -hash : hash);
        }

        if (Array.isArray(obj)) {
            if (keysOnly) {
                hash = (hash * 31 + simpleStringHash('Array')) % MODULO;
                // Dizilerde, sadece uzunluğu hash'e katabiliriz veya index isimleri (ör: '0', '1' ...)
                for (let i = 0; i < obj.length; i++)
                    hash = (hash * 31 + simpleStringHash(i.toString())) % MODULO;
            } else {
                for (let item of obj)
                    hash = (hash * 31 + universalHash(item, { ...options, visited })) % MODULO;
            }
            return (hash < 0 ? -hash : hash);
        }

        if (obj instanceof Date) {
            if (!keysOnly) hash = (hash * 31 + numberHash(obj.getTime())) % MODULO;
            return (hash < 0 ? -hash : hash);
        }

        // Object (sadece data, opsiyonel function dahil)
        if (typeof obj === 'object') {
            let keys = Object.keys(obj).sort();
            for (let key of keys) {
                // Exclude listesine bak
                if (exclude.includes(key)) {
                    continue;
                }
                // Property descriptor ile get/set kontrolü
                let desc = Object.getOwnPropertyDescriptor(obj, key);
                if (desc && !desc.get && desc.set) {
                    continue; // Accessor ise atla
                }

                let value;
                if (desc && typeof desc.get === 'function') {
                    try { value = obj[key]; }
                    catch { continue; } // Getter hata verirse atla
                } else {
                    value = obj[key];
                }

                // Function'ları parametreye göre dahil et veya etme
                if (typeof value === 'function' && !includeFunctions) continue;
                // Key ve value'yu hash'e ekle
                hash = (hash * 31 + simpleStringHash(key)) % MODULO;
                if (!keysOnly) {
                    hash = (hash * 31 + universalHash(value, { ...options, visited })) % MODULO;
                }
            }
            return (hash < 0 ? -hash : hash);
        }

        // Fonksiyonların kendisi (objenin kendisi function ise) asla hash'lenmez, 0 döner
        return (hash < 0 ? -hash : hash);
    }

    function simpleStringHash(str) {
        const MODULO = 2147483647;
        let hash = 5381;
        for (let i = 0; i < str.length; i++)
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        return hash % MODULO;
    }

    function numberHash(num) {
        if (Number.isInteger(num)) return num;
        return simpleStringHash(num.toString());
    }

    function parseObjectSafe(str) {
        const obj = {};
        const regex = /["']?([\w$şŞıİçÇüÜöÖğĞ]+)["']?\s*:\s*(?:"([^"]*)"|'([^']*)'|([^,'"{}\s]+))(?=\s*,|\s*})/g;

        str.replace(regex, (_, key, dQuotedVal, sQuotedVal, unquotedVal) => {
            let value = dQuotedVal ?? sQuotedVal ?? unquotedVal;

            if (value === 'true') obj[key] = true;
            else if (value === 'false') obj[key] = false;
            else if (value === 'null') obj[key] = null;
            else if (!isNaN(Number(value))) obj[key] = Number(value);
            else obj[key] = value;

            return '';
        });
        return obj;
    }

    function isPlainObject(obj) {
        return (
            obj !== null &&
            typeof obj === 'object' &&
            Object.getPrototypeOf(obj) === Object.prototype
        );
    }
    function isDomElement(obj) {
        return (
            obj instanceof Element ||
            obj instanceof Node ||
            obj instanceof NodeList ||
            obj instanceof HTMLCollection
        );
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
    function isArrayLike(obj) {
        if (obj == null || typeof obj === "string" || typeof obj === "function") return false;

        if (Array.isArray(obj)) return true;

        if (Number.isInteger(obj.length)
            && (obj instanceof NodeList || obj instanceof HTMLCollection)) return true;

        return false;
    }
    function getElementByDecomposition(elms, templateFromInput) {
        if (elms instanceof Element || elms instanceof Node) {
            if (elms.tagName == "TEMPLATE" || elms.tagName == "SCRIPT") {
                return elms.innerHTML;
            } else if (templateFromInput && (elms.tagName == "INPUT" || elms.tagName == "TEXTAREA")) {
                return getElementByTemplate(elms.value, templateFromInput).innerHTML;
            }
            return elms.outerHTML;
        } else if (elms instanceof NodeList || elms instanceof HTMLCollection) {
            const tmpl = document.createElement("template");

            for (let te of elms) {
                if (te.tagName == "TEMPLATE") {
                    for (let elm of te.content.children) {
                        tmpl.content.appendChild(elm.cloneNode(true));
                    }

                    continue;
                } else if (te.tagName == "SCRIPT") {
                    const tmp = document.createElement("template");
                    tmp.innerHTML = te.innerHTML;

                    for (let te of tmp.content.children) {
                        tmpl.content.appendChild(te);
                    }

                    continue;
                }

                tmpl.content.appendChild(te.cloneNode(true));
            }

            return tmpl.innerHTML;
        }

        return "";
    }

    function getElementByTemplate(selector, templateFromInput) {
        let type = typeof selector;

        const tmpl = document.createElement("template");

        if (type === "string") {
            selector = selector.trim();

            if (selector.startsWith("#")) {
                let elm = document.getElementById(selector.substring(1));
                if (elm) {
                    tmpl.innerHTML = getElementByDecomposition(elm, templateFromInput);
                }
                return tmpl;
            } else if (selector.startsWith(".")) {
                let elmcoli = document.getElementsByClassName(selector.substring(1));
                if (elmcoli) {
                    tmpl.innerHTML = getElementByDecomposition(elmcoli, templateFromInput);
                }
                return tmpl;
            } else if (selector.startsWith("<script") && selector.includes('type="text/x-uirender"')) {
                const tmp = document.createElement("template");
                tmp.innerHTML = selector;
                tmpl.innerHTML = getElementByDecomposition(tmp.content.children);

                return tmpl;
            } else if (selector.startsWith("<template")) {
                const tmp = document.createElement("template");
                tmp.innerHTML = selector;
                tmpl.innerHTML = getElementByDecomposition(tmp.content.children);

                return tmpl;
            } else if (selector[0] === "<" && selector[selector.length - 1] === ">") {
                tmpl.innerHTML = selector;

                return tmpl;
            }

            const tmpo = document.createElement("template");
            tmpo.innerHTML = selector;
            tmpl.innerHTML = getElementByDecomposition(tmpo.content.childNodes);

            return tmpl;
        } else if (isDomElement(selector)) {
            if (selector instanceof Element || selector instanceof Node) {
                tmpl.innerHTML = getElementByDecomposition(selector, templateFromInput);
            } else if (selector instanceof NodeList || selector instanceof HTMLCollection) {

                tmpl.innerHTML = getElementByDecomposition(selector, templateFromInput);
            }

            return tmpl;
        } else if (isPlainObject(selector)) {
            //burada script kontrolü yapıp template çevirilip öyle geridönüş yapılacak. 
            return selector;
        }

        return null;
    }

    dui.deepClone = deepClone;
    function deepClone(value, omitPaths = null, useStructuredClone = true) {
        const omitPathArr = Array.isArray(omitPaths)
            ? omitPaths
            : (omitPaths && typeof omitPaths === "object" ? Object.keys(omitPaths) : []);

        // Omit kontrol fonksiyonu - Daha verimli versiyon
        const isOmitted = (() => {
            if (!omitPathArr.length) return () => false;
            const omitSet = new Set(omitPathArr);
            return (pathArr) => omitSet.has(pathArr.join('.'));
        })();

        function _deepClone(obj, weakMap, path = []) {
            if (obj === null || typeof obj !== "object") return obj;
            if (weakMap.has(obj)) return weakMap.get(obj);

            // Hızlı tip kontrolü ve klonlama
            switch (true) {
                case (typeof Node !== "undefined" && obj instanceof Node):
                    return obj;
                case (obj instanceof Date):
                    return new Date(obj.getTime());
                case (obj instanceof RegExp):
                    return new RegExp(obj.source, obj.flags);
                case (obj instanceof Map):
                    return cloneMap(obj, weakMap, path);
                case (obj instanceof Set):
                    return cloneSet(obj, weakMap, path);
                case (Array.isArray(obj)):
                    return cloneArray(obj, weakMap, path);
                case (obj instanceof Error):
                    return cloneError(obj);
                case (typeof Buffer !== "undefined" && Buffer.isBuffer(obj)):
                    return Buffer.from(obj);
                default:
                    return cloneObject(obj, weakMap, path);
            }
        }

        // Yardımcı fonksiyonlar
        function cloneMap(map, weakMap, path) {
            const result = new Map();
            weakMap.set(map, result);
            map.forEach((v, k) => {
                result.set(
                    _deepClone(k, weakMap, path),
                    _deepClone(v, weakMap, path)
                );
            });
            return result;
        }

        function cloneSet(set, weakMap, path) {
            const result = new Set();
            weakMap.set(set, result);
            set.forEach(v => {
                result.add(_deepClone(v, weakMap, path));
            });
            return result;
        }

        function cloneArray(arr, weakMap, path) {
            const result = [];
            weakMap.set(arr, result);
            for (let i = 0; i < arr.length; i++) {
                const childPath = path.concat(String(i));
                if (!isOmitted(childPath)) {
                    result.push(_deepClone(arr[i], weakMap, childPath));
                }
            }
            return result;
        }

        function cloneError(error) {
            const err = new error.constructor(error.message);
            if (error.stack) err.stack = error.stack;
            if (error.cause) err.cause = error.cause;
            return err;
        }

        function cloneObject(obj, weakMap, path) {
            const clone = Object.create(Object.getPrototypeOf(obj));
            weakMap.set(obj, clone);

            const keys = Reflect.ownKeys(obj);
            for (const key of keys) {
                const keyStr = typeof key === "symbol"
                    ? `[${key.description ?? key.toString()}]`
                    : key;
                const childPath = path.concat(keyStr);
                if (isOmitted(childPath)) continue;

                const desc = Object.getOwnPropertyDescriptor(obj, key);
                if (desc.get || desc.set) {
                    Object.defineProperty(clone, key, desc);
                } else {
                    clone[key] = _deepClone(obj[key], weakMap, childPath);
                }
            }
            return clone;
        }

        // structuredClone kullanımı
        if (useStructuredClone && typeof structuredClone === "function" && !omitPathArr.length) {
            try {
                return structuredClone(value);
            } catch (e) {
                // Fallback to manual cloning
            }
        }

        return _deepClone(value, new WeakMap());
    }

    dui.deepEqual = deepEqual;
    function deepEqual(a, b, visited = new WeakMap()) {
        if (a === b) return true;

        // Tip kontrolü
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
            return a === b;
        }

        // Circular reference kontrolü
        if (visited.has(a)) return visited.get(a) === b;
        visited.set(a, b);

        // Prototip zinciri kontrolü
        if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
            return false;
        }

        // Özel nesne tipleri
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }

        if (a instanceof RegExp && b instanceof RegExp) {
            return a.source === b.source && a.flags === b.flags;
        }

        if (typeof a === 'function' && typeof b === 'function') {
            return a === b;
        }

        // Node.js Buffer desteği
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
            if (a.length !== b.length) return false;
            return a.equals(b);
        }

        // Map karşılaştırması (güncellendi)
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) return false;

            for (let [key, val] of a) {
                // Klonlanmış anahtarı bul
                let found = false;
                for (let [bKey, bVal] of b) {
                    if (deepEqual(key, bKey, visited) && deepEqual(val, bVal, visited)) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        }

        // Set karşılaştırması
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) return false;
            for (let value of a) {
                let found = false;
                for (let bValue of b) {
                    if (deepEqual(value, bValue, visited)) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        }

        // Dizi karşılaştırması
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!deepEqual(a[i], b[i], visited)) return false;
            }
            return true;
        }

        // Obje özellikleri
        const keysA = Reflect.ownKeys(a);
        const keysB = Reflect.ownKeys(b);

        if (keysA.length !== keysB.length) return false;

        for (let key of keysA) {
            if (!Reflect.has(b, key)) return false;
            if (!deepEqual(a[key], b[key], visited)) return false;
        }

        return true;
    }

    function getDefaultSettableProperty(element) {
        if (!element || !(element instanceof HTMLElement)) return null;

        const tag = element.tagName.toLowerCase();

        switch (tag) {
            case 'input':
            case 'textarea':
            case 'select':
                return 'value';
            case 'img':
                return 'src';
            case 'a':
                return 'href';
            case 'option':
                return 'textContent';
            case 'button':
                return 'value';
            case 'label':
                return 'textContent';
            case 'iframe':
                return 'src';
            case 'video':
            case 'audio':
                return 'src';
            case 'source':
                return 'src';
            case 'link':
                return 'href';
            case 'meta':
                return 'content';
            case 'div':
            case 'span':
            case 'p':
            case 'li':
            case 'td':
            case 'th':
            case 'caption':
            case 'strong':
            case 'em':
            case 'b':
            case 'i':
            case 'u':
            case 'small':
            case 'big':
            case 'pre':
            case 'code':
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return 'innerHTML'; // veya innerText istersen burayı değiştirebilirsin
            default:
                return null;
        }
    }

    function getValue(obj, path) {
        try {
            // Fonksiyon veya expression ise evaluate et
            if (path.includes('(') || path.includes('?')) {
                return Function('data', `with(data){ return ${path}; }`)(obj);
            }
        } catch (e) {
            return undefined;
        }

        if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
            // Eğer path yoksa veya "", doğrudan kendisini döndür
            if (!path || path === "" || path === "innerHTML" || path === "textContent")
                return obj;
            // Eğer bir index belirtilmişse:
            if (/^\d+$/.test(path)) {
                return obj;
            }
        }
        if (typeof obj == "string") {
            return obj;
        }

        const parts = [];
        path.split('.').forEach(p => {
            const re = /([^\[\]]+)|\[(\d+)\]/g;
            let m;
            while ((m = re.exec(p))) {
                if (m[1]) {
                    parts.push(m[1]);
                } else if (m[2]) {
                    parts.push(Number(m[2]));
                }
            }
        });
        return parts.reduce((o, k) => o?.[k], obj);
        //return path.split('.').reduce((o, p) => o?.[p], obj);
    }

    function setValue(obj, path, value) {
        // Eğer path array index içeriyorsa, yeni path parser’ı kullan
        const parts = [];
        path.split('.').forEach(p => {
            const re = /([^\[\]]+)|\[(\d+)\]/g;
            let m;
            while ((m = re.exec(p))) {
                if (m[1]) {
                    parts.push(m[1]);
                } else if (m[2]) {
                    parts.push(Number(m[2]));
                }
            }
        });

        const last = parts.pop();
        let target = obj;
        for (const p of parts) {
            if (target[p] === undefined) return; // path yoksa atlama
            target = target[p];
        }

        // Eğer array ise index'e doğrudan atama
        if (Array.isArray(target) && typeof last === "number") {
            target[last] = value;
            return;
        }

        // Eğer obje ise property'ye atama
        if (target && last !== undefined) {
            target[last] = value;
        }
    }

    function IsSettableValue(el, path) {
        const defaultSettableProperty = getDefaultSettableProperty(el);

        if (path.includes("{:") && path.endsWith("}")) {
            const [attr, realPath] = parseAttributeBinding(path);
            if (attr) {
                if (attr == defaultSettableProperty) {
                    return true;
                }

                return false;
            }

            return true;
        }

        if (defaultSettableProperty in el) {
            return true;
        }

        return false;
    }

    function updateElement(elm, path, data) {
        const leftMatch = path.match(/{(\w*):/);

        if (leftMatch && path.endsWith("}")) {
            const [attr, realPath] = parseAttributeBinding(path);

            if (attr) {
                const attrVal = getValue(data, realPath);

                if (attr == 'disabled' || attr == 'selected') {
                    if (attrVal) {
                        elm.setAttribute(attr, "");
                    }
                    else {
                        elm.removeAttribute(attr);
                    }
                } else if (attr == 'innerHTML') {
                    elm.innerHTML = attrVal;
                } else if (attr == 'innerText') {
                    elm.innerText = attrVal;
                } else if (attr == 'textContent') {
                    elm.textContent = attrVal;
                }
                else {
                    elm.setAttribute(attr, attrVal);
                }

            } else {
                updateElement(elm, realPath, data);
            }

            return;
        }

        const raw = getValue(data, path);
        if (elm.type === 'checkbox') {
            if (elm.checked !== raw) elm.checked = !!raw;
        } else if ('value' in elm) {
            if (document.activeElement !== elm && elm.value !== raw) elm.value = raw ?? '';
        } else {
            if (elm.textContent !== raw) elm.textContent = raw ?? '';
        }
    }

    function parseAttributeBinding(binding) {
        const attrEnd = binding.indexOf("{:");
        return [
            binding.substring(0, attrEnd),
            binding.substring(attrEnd + 2, binding.length - 1).trim(),
        ];
    }

    function getDefaultEventHandlerType(el) {
        const elType = el.type;
        if (elType == "text") {
            return "input";
        } else if (elType == "checkbox" || elType == "radio") {
            return "change";
        } else if (el.tagName.toLowerCase() == "select") {
            return "change";
        }

        return "input";
    }

    let globalErrorHandler = null;

    function onError(handler) {
        globalErrorHandler = handler;
    }
    function callWithErrorHandling(fn, context) {
        try {
            return fn();
        } catch (err) {
            if (globalErrorHandler) {
                globalErrorHandler(err, context);
            } else {
                console.error("Unhandled effect error:", err, "in", context);
            }
        }
    }
    //#endregion ---------------- Data And UI Tool ----------------------
    //#region ------------------- SignalBasedReactivity -----------------
    dui.signalScopes = new Map();
    dui.saveSignalStore = saveSignalStore;
    function saveSignalStore(dataOrSignalStoreKey, val) {
        if (dataOrSignalStoreKey == null) return null;
        if (typeof dataOrSignalStoreKey == "object") {
            dataOrSignalStoreKey = dataOrSignalStoreKey["_ojectHash"];
        }

        dui.signalScopes.set(dataOrSignalStoreKey, val);
        return dui.signalScopes.get(dataOrSignalStoreKey);
    }

    dui.getSignalStore = getSignalStore;
    function getSignalStore(dataOrSignalStoreKey) {
        if (dataOrSignalStoreKey == null) return null;

        if (typeof dataOrSignalStoreKey == "object") {
            if (!dataOrSignalStoreKey["_ojectHash"]) {
                return null;
            }

            dataOrSignalStoreKey = dataOrSignalStoreKey["_ojectHash"];
        }

        if (!dui.signalScopes.has(dataOrSignalStoreKey)) {
            return null;
        }

        return dui.signalScopes.get(dataOrSignalStoreKey);
    }

    dui.createSignalScope = createSignalScope;
    function createSignalScope(dataSignalStoreKey = null) {
        if (!dataSignalStoreKey) {
            dataSignalStoreKey = uuidv4();
        }

        dui.signalScopes.set(dataSignalStoreKey, createSignalStore());

        return dataSignalStoreKey;
    }

    // dui.createSignalStore = createSignalStore;
    function createSignalStore() {
        return {
            signalStore: new WeakMap(),
            currentEffect: null
        };
    }

    function getSignalsMap(dataSignalStore, target) {
        if (dataSignalStore == null || target == null) return target;

        if (!dataSignalStore.signalStore.has(target)) {
            dataSignalStore.signalStore.set(target, new Map());
        }
        return dataSignalStore.signalStore.get(target);
    }

    // === Tek bir prototip nesnesi:
    const ReactiveProto = {
        dataSignalStore: null,
        addProp(propname, propval) {
            this[propname] = propval;
            walk(this.dataSignalStore, this, null, null);
        },
        deleteProp(propname) {
            function cleanupSignalsRecursive(dataSignalStore, obj) {
                if (obj && typeof obj === "object") {
                    // 1. Bu objenin signalStore Map'ini bul
                    const signals = dataSignalStore.signalStore.get(obj);
                    if (signals) {
                        // 2. Tüm property key'lerini gez
                        for (const key of signals.keys()) {
                            const val = obj[key];
                            // 3. Eğer property'nin değeri bir nesne ise, recursive cleanup yap
                            if (val && typeof val === "object") {
                                cleanupSignalsRecursive(dataSignalStore, val);
                            }
                        }
                        // 4. Objeye ait tüm signalStore kaydını sil
                        dataSignalStore.signalStore.delete(obj);
                    }
                }
            }

            const signals = getSignalsMap(this.dataSignalStore, this);
            const signal = signals.get(propname);

            // 1. Alt kırılım varsa, tüm child objeleri recursive olarak temizle
            const val = this[propname];
            if (val && typeof val === "object") {
                cleanupSignalsRecursive(this.dataSignalStore, val);
            }

            // 2. Sinyal tetikle (undefined)
            if (signal) {
                signal.set(undefined);
                signals.delete(propname);
            }
            // 3. Property'yi sil
            delete this[propname];
        }
    };

    function createSignal(dataSignalStore, initial) {
        let value = initial;
        const subs = new Set();
        const signal = {
            get() {
                if (dataSignalStore && dataSignalStore.currentEffect) {
                    dataSignalStore.currentEffect.isPrimitive = false;
                    if (!dataSignalStore.currentEffect.tmpsignals) {
                        dataSignalStore.currentEffect.tmpsignals = [];
                    }

                    if (!(typeof value === 'object' && value !== null)) {
                        dataSignalStore.currentEffect.isPrimitive = true;
                        if (!subs.has(dataSignalStore.currentEffect)) {
                            subs.add(dataSignalStore.currentEffect);
                        }
                        if (!dataSignalStore.currentEffect.deps.has(signal)) {
                            dataSignalStore.currentEffect.deps.add(signal);
                        }
                    } else {
                        if (!dataSignalStore.currentEffect.tmpsignals.includes(signal)) {
                            dataSignalStore.currentEffect.tmpsignals.push(signal);
                        }
                    }
                }
                return value;
            },
            set(newVal) {
                if (Object.is(newVal, value)) return;
                value = newVal;
                for (const effect of subs) {
                    // console.log("tetiklenen effect", effect);
                    effect();
                }
            },
            subs
        };
        return signal;
    }

    function createEffect(fn, el, dataSignalStoreKey) {
        if (fn.constructor.name === "AsyncFunction") {
            throw new Error("effect does not support async functions.");
        }
        function wrapped() {
            if (wrapped._executing) return;

            const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);

            wrapped._executing = true;
            const oldDeps = wrapped.deps;
            wrapped.deps = new Set(); // Yeni bağımlılıklar için temiz bir set oluştur
            const prev = dataSignalStore.currentEffect;
            dataSignalStore.currentEffect = wrapped;
            wrapped.str = fn.toString();
            wrapped.tmpel = el;

            try {
                callWithErrorHandling(fn, wrapped);

                if (dataSignalStore.currentEffect.tmpsignals) {
                    if (dataSignalStore.currentEffect.isPrimitive == false) {
                        for (const signal of dataSignalStore.currentEffect.tmpsignals) {
                            if (!signal.subs.has(dataSignalStore.currentEffect)) {
                                signal.subs.add(dataSignalStore.currentEffect);
                                wrapped.deps.add(signal);
                            }
                        }
                    }
                    dataSignalStore.currentEffect.tmpsignals = [];
                }
            } finally {
                // DÜZELTME: Sadece yeni turda kullanılmayan eski bağımlılıkları temizle
                for (const sig of oldDeps) {
                    if (!wrapped.deps.has(sig)) { // Eğer sinyal yeni bağımlılıklar arasında yoksa
                        sig.subs.delete(wrapped);   // Abonelikten çık
                    }
                }
                dataSignalStore.currentEffect = prev;
                wrapped._executing = false;
            }
        }
        wrapped.deps = new Set();
        wrapped();
        return wrapped;
    }

    function walk(dataSignalStoreKey, target, parent, parentKey) {
        if (target && typeof target === "object" && !Object.getPrototypeOf(target).addProp) {
            ReactiveProto.dataSignalStore = dui.getSignalStore(dataSignalStoreKey);;
            Object.setPrototypeOf(target, ReactiveProto);
        }

        if (Array.isArray(target)) {
            makeReactiveArray(dataSignalStoreKey, target, parent, parentKey);
        }

        for (const rawKey of Object.keys(target)) {
            const key = Array.isArray(target) && /^\d+$/.test(rawKey) ? Number(rawKey) : rawKey;
            reactiveSignalProperty(dataSignalStoreKey, target, key); // sadece lazy getter/setter kur
            // Child nesneyi recursive signalify etme -- sadece erişilirse yapılacak!
        }

        return target;
    }

    dui.reactiveSignal = reactiveSignalObject;
    function reactiveSignalObject(obj, dataSignalStoreKey) {
        walk(dataSignalStoreKey, obj, null, null);

        return dui.getSignalStore(dataSignalStoreKey);
    }

    function onDemandSignal(dataSignalStoreKey, path, data, isRecursive = 0) {
        if (isArrayLike(data)) {
            makeReactiveArray(dataSignalStoreKey, data, null, null);
            return;
        }

        const bindings = path.split(/,(?![^{]*})/).map((b) => {
            let binding = b.trim(), result = [];
            const eventMatch = binding.match(/{\:([\w.]+),(\w+):([\w.]+)\}/);

            if (eventMatch) {
                if (eventMatch[2] == "event") {
                    result.push(eventMatch[1]);
                    result.push(eventMatch[3]);

                    return result;
                }
            }
            const leftMatch = binding.match(/{(\w*):/);
            if (leftMatch && binding.endsWith("}")) {
                const [attr, realPath] = parseAttributeBinding(binding);
                result.push(realPath);
            } else {
                result.push(binding);
            }

            return result;
        }).flat();

        let current = data;
        let parent = null, parentKey = null;

        for (let i = 0; i < bindings.length; i++) {
            const p = bindings[i];

            const parts = p.split('.').map(p => {
                const re = /([^\[\]]+)|\[(\d+)\]/g;
                let m, result = [];
                while ((m = re.exec(p))) {
                    if (m[1]) result.push(m[1]);
                    else if (m[2]) result.push(Number(m[2]));
                }
                return result;
            }).flat();

            let current = data;
            let parent = null, parentKey = null;
            for (let i = 0; i < parts.length; i++) {
                const key = parts[i];
                if (current && typeof current === 'object') {
                    reactiveSignalProperty(dataSignalStoreKey, current, key, false);
                    parent = current;
                    parentKey = key;
                    current = current[key];
                }
            }
        }
    }

    function makeReactiveArray(dataSignalStoreKey, arr, parent, key) {
        const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
        const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);
        // Array'in kendisi için bir sinyal tutalım (önceki gibi)
        const arraySelfSignal = createSignal(dataSignalStore, arr);

        methods.forEach(method => {
            const originalMethod = Array.prototype[method];//arr[method]; // Orijinal metodu kaydediyoruz

            // Array metotlarını Object.defineProperty ile override ediyoruz
            Object.defineProperty(arr, method, {
                configurable: true,
                enumerable: false, // Normalde sayılmaz
                writable: true,    // Yeniden atanabilir olmalı
                value: function (...args) {
                    const signals = getSignalsMap(dataSignalStore, this);
                    const oldArrlen = this.length;
                    const result = originalMethod.apply(this, args); // Orijinal metodu çağır

                    // Ortak reaktivite tetikleyici
                    arraySelfSignal.set(this); // Array'in kendisi değiştiğinde dinleyicileri tetikle
                    if (parent && key) { // Eğer parent'a bağlıysa, parent'ın ilgili sinyalini de tetikle
                        const parentSignals = getSignalsMap(dataSignalStore, parent);
                        const parentSig = parentSignals.get(key);
                        if (parentSig) parentSig.set(arr);
                    }

                    if (method === 'push') {
                        const start = oldArrlen;
                        args.forEach((item, i) => {
                            if (item && typeof item === 'object') {
                                reactiveSignalObject(item);
                            }

                            reactiveSignalProperty(dataSignalStoreKey, this, start + i);
                        });
                    } else if (method === 'pop') {
                        const idx = oldArrlen - 1;
                        signals.delete(idx);
                    } else if (method === 'shift') {
                        for (let i = 0; i < this.length; i++) {
                            reactiveSignalProperty(dataSignalStoreKey, this, i);
                        }
                        signals.delete(this.length); // son index silindi
                    } else if (method === 'splice') {
                        // args: start, deleteCount, ...items
                        const start = args[0];
                        const deleteCount = args[1];
                        for (let i = start; i < start + deleteCount; i++) {
                            signals.delete(i);
                        }
                        for (let i = 0; i < this.length; i++) {
                            reactiveSignalProperty(dataSignalStoreKey, this, i);
                        }
                    }

                    for (let i = 0; i < this.length; i++) {
                        reactiveSignalProperty(dataSignalStoreKey, this, i); // Her indeks için bir sinyal ve getter/setter tanımla
                    }

                    return result;
                }
            });
        });
    }

    function reactiveSignalProperty(dataSignalStoreKey, target, key, isRecursive = false) {
        let initialized = false;
        let internal = target[key]; // Özelliğin anlık değeri

        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() {
                // console.log("defineProperty get => dataSignalStoreKey:" + dataSignalStoreKey + " - key:" + key);
                const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);
                if (!initialized) {
                    // Signal’ı oluştur, property’ye kalıcı getter/setter ata
                    const signals = getSignalsMap(dataSignalStore, target);
                    if (!signals.has(key)) {
                        signals.set(key, createSignal(dataSignalStore, internal));
                    }

                    // Değer bir nesne/dizi ise recursive walk
                    if (isRecursive && internal && typeof internal === "object") {
                        walk(dataSignalStoreKey, internal, target, key);
                    }

                    // Asıl getter/setter’ı tanımla
                    Object.defineProperty(target, key, {
                        configurable: true,
                        enumerable: true,
                        get() {
                            return signals.get(key).get();
                        },
                        set(newVal) {
                            if (newVal && typeof newVal === "object" && newVal !== signals.get(key).get()) {
                                walk(dataSignalStoreKey, newVal, target, key);
                            }
                            signals.get(key).set(newVal);
                            internal = newVal;
                        },
                    });

                    initialized = true;
                }
                // İlk seferde, henüz signal yoksa normal değer dön
                const signals = getSignalsMap(dataSignalStore, target);
                return signals.has(key) ? signals.get(key).get() : internal;
            },
            set(newVal) {
                // console.log("defineProperty set => dataSignalStoreKey:" + dataSignalStoreKey + " - key:" + key);
                const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);
                // Setter çağrıldıysa, aynı şekilde “tam” getter/setter kur
                if (!initialized) {
                    const signals = getSignalsMap(dataSignalStore, target);
                    if (!signals.has(key)) {
                        signals.set(key, createSignal(dataSignalStore, internal));
                    }
                    if (newVal && typeof newVal === "object") {
                        walk(dataSignalStoreKey, newVal, target, key);
                    }
                    Object.defineProperty(target, key, {
                        configurable: true,
                        enumerable: true,
                        get() {
                            // console.log("defineProperty set get => dataSignalStoreKey:" + dataSignalStoreKey + " - key:" + key);
                            return signals.get(key).get();
                        },
                        set(val) {
                            // console.log("defineProperty set set => dataSignalStoreKey:" + dataSignalStoreKey + " - key:" + key);
                            if (val && typeof val === "object" && val !== signals.get(key).get()) {
                                walk(dataSignalStoreKey, val, target, key);
                            }
                            signals.get(key).set(val);
                            internal = val;
                        },
                    });
                    initialized = true;
                }
                const signals = getSignalsMap(dataSignalStore, target);
                if (signals.has(key)) {
                    signals.get(key).set(newVal);
                }
                internal = newVal;
            },
        });
    }

    dui.toSignalRaw = toSignalRaw;
    function toSignalRaw(obj, dataSignalStore) {
        if (obj === null || typeof obj !== "object") return obj;

        const raw = Array.isArray(obj) ? [] : {};
        const signals = dataSignalStore.signalStore.get(obj);

        if (!signals) return obj; // Reaktif olmayan nesne

        for (const [key, signal] of signals.entries()) {
            const val = signal.get();
            raw[key] = toSignalRaw(dataSignalStore, val);
        }

        return raw;
    }

    dui.ref = ref;
    function ref(initialValue) {
        if (!dui.commonDataSignalStoreKey) {
            dui.commonDataSignalStoreKey = createSignalScope();
        }

        const ss = getSignalStore(dui.commonDataSignalStoreKey);
        const sig = createSignal(ss, initialValue);

        const read = () => {
            return sig.get();
        };
        const write = (v) => {
            sig.set(v);
            return v; // opsiyonel
        }

        const s = (...args) => args.length ? write(args[0]) : read();
        s.sig = sig;
        return s;
    }

    dui.readonlyRef = readonlyRef;
    function readonlyRef(initialValue) {
        return () => ref(initialValue)();
    }

    dui.computed = computed;
    function computed(fn, dataSignalStoreKey = null) {
        if (!dui.commonDataSignalStoreKey) {
            dui.commonDataSignalStoreKey = createSignalScope();
        }

        if (!dataSignalStoreKey) {
            dataSignalStoreKey = dui.commonDataSignalStoreKey;
        }

        const ss = getSignalStore(dataSignalStoreKey);
        const sig = createSignal(ss, initialValue); // kendine ait bir signal oluştur

        createEffect(() => {
            sig.set(callWithErrorHandling(fn, fn)); // fn içindeki ref'leri bağla, sonucu set et
        }, null, dataSignalStoreKey);

        const s = () => sig.get(); // böylece dışarıdan erişimde currentEffect bağlanır
        s.sig = sig;
        return s;
    }

    dui.watch = watch;
    function watch(source, callback, options = {}, dataSignalStoreKey = null) {
        let oldValue = source();
        let cleanupFn;

        const onCleanup = (fn) => {
            cleanupFn = fn;
        };

        if (options.immediate) {
            callback(oldValue, undefined, onCleanup);
        }

        const job = () => {
            const newValue = source();
            if (!Object.is(newValue, oldValue)) {
                if (cleanupFn) cleanupFn();
                callback(newValue, oldValue, onCleanup);
                oldValue = newValue;
            }
        };

        if (!dui.commonDataSignalStoreKey) {
            dui.commonDataSignalStoreKey = createSignalScope();
        }

        if (!dataSignalStoreKey) {
            dataSignalStoreKey = dui.commonDataSignalStoreKey;
        }

        if (options.flush === "post") {
            createEffect(() => {
                source(); // Track dependency
                Promise.resolve().then(job);
            }, null, dataSignalStoreKey);
        } else {
            createEffect(job);
        }
    }

    dui.watchEffect = watchEffect;
    function watchEffect(fn, dataSignalStoreKey = null) {
        if (!dui.commonDataSignalStoreKey) {
            dui.commonDataSignalStoreKey = uuidv4();
        }

        if (!dataSignalStoreKey) {
            dataSignalStoreKey = dui.commonDataSignalStoreKey;
        }

        return createEffect(fn, null, dataSignalStoreKey); // aynısı
    }

    dui.createMemo = createMemo;
    function createMemo(fn, dataSignalStoreKey = null) {
        if (!dui.commonDataSignalStoreKey) {
            dui.commonDataSignalStoreKey = createSignalScope();
        }

        if (!dataSignalStoreKey) {
            dataSignalStoreKey = dui.commonDataSignalStoreKey;
        }

        const ss = getSignalStore(dataSignalStoreKey);

        let cached;
        const sig = createSignal(ss);

        const runner = createEffect(() => {
            const result = callWithErrorHandling(fn, fn);
            if (!Object.is(result, cached)) {
                cached = result;
                sig.set(cached);
            }
        });

        const m = () => sig.get();
        m.sig = sig;
        return m;
    }
    //#endregion ---------------- SignalBasedReactivity -----------------
    //#region ------------------- UI Data Binding -----------------------

    function bindElement(el, path, data, mode, dataSignalStoreKey) {
        let customEventHandlerType = null;
        const leftMatch = path.match(/{\:([\w.]+),(\w+):([\w.]+)\}/);
        if (leftMatch) {
            if (leftMatch[2] == "event") {
                customEventHandlerType = getValue(data, leftMatch[3]);
                if (customEventHandlerType == null) {

                    return;
                }
                path = leftMatch[1];
            }
        }
        //One-Way
        if (mode === 'One-Way') {
            updateElement(el, path, data);
            return;
        }

        // Data → Element: Two-Way veya herhangi bir DataToElement modu
        if (mode === 'Two-Way' || mode.endsWith('DataToElement')) {
            createEffect(() => updateElement(el, path, data), el, dataSignalStoreKey);
        }
        // Element → Data: Two-Way veya ElementToData
        if (mode === 'Two-Way' || mode.endsWith('ElementToData')) {
            // if (customEventHandlerType == null) {
            updateElement(el, path, data);
            // }

            if (!IsSettableValue(el, path)) {
                return;
            }

            if (customEventHandlerType == null) {
                customEventHandlerType = getDefaultEventHandlerType(el);
            }

            el.addEventListener(customEventHandlerType, e => {
                const val = el.type === 'checkbox' ? el.checked : e.target.value;
                if (el.type === 'number') val = Number(val);
                if (el.type === 'date') val = new Date(val);
                if (path.includes("{:") && path.endsWith("}")) {
                    const [attr, realPath] = parseAttributeBinding(path);
                    path = realPath;
                }
                setValue(data, path, val);
            });
        }
    }
    function applyBindingToElement(el, path, data, mode, dataSignalStoreKey) {
        const bindings = path.split(/,(?![^{]*})/).map((b) => b.trim());

        bindings.forEach((binding) => {
            bindElement(el, binding, data, mode, dataSignalStoreKey);
        });
    }

    function dataBindingToElement(dataSignalStoreKey, element, data, bindingType, index = null) {
        if (!element) return null;

        if (bindingType == undefined || bindingType.trim() == "") {
            bindingType = 'One-Way';
        }

        // Template/fragment branch:
        if (element instanceof HTMLTemplateElement || element instanceof DocumentFragment) {
            const nodes = element instanceof HTMLTemplateElement
                ? element.content.querySelectorAll('[data-binding]')
                : element.querySelectorAll('[data-binding]');
            nodes.forEach(el => dataBindingToElement(dataSignalStoreKey, el, data, bindingType, index));
            return;
        }

        if (index !== null && Array.isArray(data)) {
            const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);
            const signals = getSignalsMap(dataSignalStore, data);
            const sig = signals.get(index);

            if (!sig) {
                console.warn("sig yok");
            }

            createEffect(() => {
                updateElement(element, "", sig.get());
            }, element, dataSignalStoreKey);
            return;
        }

        // Standart DOM elementte: alt binding noktalarını bul
        const nodes = element.querySelectorAll('[data-binding]');
        if (nodes.length) {
            nodes.forEach(el => dataBindingToElement(dataSignalStoreKey, el, data, bindingType, index));
            return;
        }

        // Kendi üstünde data-binding varsa
        const path = element.getAttribute && element.getAttribute('data-binding');
        if (!path) return;

        onDemandSignal(dataSignalStoreKey, path, data, false);

        const mode = element.getAttribute('data-binding-way') || bindingType;
        applyBindingToElement(element, path, data, mode, dataSignalStoreKey);
    }
    //#endregion ---------------- UI Data Binding -----------------------
    //#region ------------------- UI Template ---------------------------
    function uiRender({ data, bindingType = 'One-Way' }, options = null, dataSignalStoreKey = null) {
        let _dataSignalStoreKey = null;

        if (dataSignalStoreKey) {
            _dataSignalStoreKey = dataSignalStoreKey
        }

        if (options && typeof options == "object") {
            if (options.data == null) {
                options.data = data;
            }

            if (!_dataSignalStoreKey) {
                if (options.data) {
                    _dataSignalStoreKey = addOjectHash(options.data);
                    createSignalScope(_dataSignalStoreKey);
                }
            } else {
                options.dataSignalStoreKey = _dataSignalStoreKey;
            }

            if (options.bindingType == null) {
                options.bindingType = bindingType;
            }

            if (options.additionType == null) {
                options.additionType = "append";
            }

            renderTemplate(this, options);
            return this;
        }

        if (!_dataSignalStoreKey && data) {
            _dataSignalStoreKey = addOjectHash(data);
            createSignalScope(_dataSignalStoreKey);
        }

        for (const element of this.elements) {
            dataBindingToElement(_dataSignalStoreKey, element, data, bindingType);
        }

        return this;
    }

    function getTemplateFromTemplates(templateName, options) {
        let inTemplate = options.template, inData = options.data, inBindingType = options.bindingType, inAdditionType = options.additionType, inTemplateFromInput = options.templateFromInput;
        let inMainTemplate = options.templates[templateName];

        if (!inMainTemplate) {
            return {
                inTemplate,
                inData,
                inBindingType,
                inAdditionType,
                inTemplateFromInput
            };
        }

        if (inMainTemplate.template) {
            inTemplate = inMainTemplate.template;
        }

        if (inMainTemplate.data) {
            inData = inMainTemplate.data;
        }

        if (inMainTemplate.bindingType) {
            inBindingType = inMainTemplate.bindingType;
        }

        if (inMainTemplate.additionType) {
            inAdditionType = inMainTemplate.additionType;
        }

        if (inMainTemplate.templateFromInput) {
            inTemplateFromInput = inMainTemplate.templateFromInput;
        }

        return {
            inTemplate,
            inData,
            inBindingType,
            inAdditionType,
            inTemplateFromInput
        };
    }

    function renderTemplate(t, options) {
        if (options == null || typeof options != "object" || (!options.template && !options.templates)) {
            return;
        }

        let inTemplate = options.template, inData = options.data, inBindingType = options.bindingType, inAdditionType = options.additionType, inTemplateFromInput = options.templateFromInput;

        if (typeof options.templates == "object" && isPlainObject(options.templates)) {

            if (!options.mainTemplate) {
                options.mainTemplate = Object.keys(options.templates)[0];
            }

            let inMainTemplate = getTemplateFromTemplates(options.mainTemplate, options);

            inTemplate = inMainTemplate.inTemplate;
            inData = inMainTemplate.inData;
            inBindingType = inMainTemplate.inBindingType;
            inAdditionType = inMainTemplate.inAdditionType;
            inTemplateFromInput = inMainTemplate.inTemplateFromInput;
        }

        let mTemplate = processTemplate(inTemplate, inData, inBindingType, inAdditionType, inTemplateFromInput, options);

        if (mTemplate) {
            for (const element of t.elements) {
                if (inAdditionType == "prepend") {
                    element.prepend(mTemplate.content);
                } else if (inAdditionType == "append") {
                    element.append(mTemplate.content);
                } else if (inAdditionType == "appendChild") {
                    element.appendChild(mTemplate.content);
                } else if (inAdditionType == "innerHTML") {
                    element.innerHTML = "";
                    element.append(mTemplate.content);
                } else if (inAdditionType == "textContent") {
                    element.textContent = mTemplate.content.textContent;
                }
            }
        }
    }

    function processTemplate(template, data, bindingType, additionType, templateFromInput, options) {
        let mTemplate = parseTemplate(template, templateFromInput);

        if (!mTemplate) {
            return;
        }

        let dataSignalStoreKey = null;
        if (!options.dataSignalStoreKey) {
            if (data) {
                dataSignalStoreKey = addOjectHash(data);
                createSignalScope(dataSignalStoreKey);
            }
        } else {
            dataSignalStoreKey = options.dataSignalStoreKey;
        }

        dataBindingToTemplate(dataSignalStoreKey, mTemplate, data, bindingType, additionType, templateFromInput, options);

        return mTemplate;
    }

    function parseTemplate(template, templateFromInput) {
        if (template == undefined || template == null || (typeof template == "string" && template.trim() == "")) {
            return null;
        }

        const tmplelm = getElementByTemplate(template, templateFromInput);

        return tmplelm;
    }

    function dataBindingToTemplate(dataSignalStoreKey, template, data, bindingType, additionType, templateFromInput, options) {
        if (data == null || !template.content.querySelector('[data-binding]')) {
            parseNestedTemplate(template, data, bindingType, additionType, templateFromInput, options);
            return;
        }

        if (isArrayLike(data)) {
            addOjectHash(data);
            const df = document.createDocumentFragment();
            var templateClone = template.cloneNode(true);
            for (let i = 0; i < data.length; i++) {
                const tmp = templateClone.cloneNode(true);

                reactiveSignalProperty(dataSignalStoreKey, data, i, false);
                // Eğer context PRIMITIVE ise index ile signal bağla
                if (typeof data[i] !== "object" || data[i] === null) {
                    dataBindingToElement(dataSignalStoreKey, tmp, data, bindingType, i); // primitive branch
                } else {
                    // Eğer context OBJECT ise, doğrudan context olarak geçir (eski yol)
                    dataBindingToElement(dataSignalStoreKey, tmp, data[i], bindingType); // object branch
                }

                parseNestedTemplate(tmp, data[i], bindingType, additionType, templateFromInput, options)

                if (additionType == "prepend") {
                    df.prepend(tmp.content);
                } else if (additionType == "append") {
                    df.append(tmp.content);
                } else if (additionType == "appendChild") {
                    df.appendChild(tmp.content);
                } else {
                    df.appendChild(tmp.content);
                }
            }

            template.innerHTML = "";
            template.content.appendChild(df);
            return;
        }

        dataBindingToElement(dataSignalStoreKey, template, data, bindingType);
        parseNestedTemplate(template, data, bindingType, additionType, templateFromInput, options)
    }

    function parseNestedTemplate(template, templateData, bindingType, additionType, templateFromInput, options) {
        if (template.content.querySelector('[data-template]')) {
            const nodes = template.content.querySelectorAll('[data-template]');

            for (let i = 0; i < nodes.length; i++) {
                const tmp_string = nodes[i].getAttribute('data-template');
                const bindings = tmp_string.split(/,(?![^{]*})/).map((b) => b.trim());

                let dt_str = null, opt_str = null, pt_str = null, ts_str = null, inTemplate = options.template
                    , inData = templateData, inBindingType = bindingType, inAdditionType = additionType, inTemplateFromInput = templateFromInput;

                for (let itm of bindings) {
                    if (itm.startsWith("data")) {
                        dt_str = itm;
                        continue;
                    } else if (itm.startsWith("options")) {
                        opt_str = itm;
                        continue;
                    } else if (itm.startsWith("#") || itm.startsWith(".")) {
                        pt_str = itm;
                        continue;
                    }

                    ts_str = itm;
                }

                if (ts_str && options.templates && isPlainObject(options.templates) && options.templates[ts_str]) {
                    let inMainTemplate = getTemplateFromTemplates(ts_str, options);

                    inTemplate = inMainTemplate.inTemplate;
                    inData = inMainTemplate.inData;
                    inBindingType = inMainTemplate.inBindingType;
                    inAdditionType = inMainTemplate.inAdditionType;
                    inTemplateFromInput = inMainTemplate.inTemplateFromInput;
                }


                if (opt_str) {
                    let toptions = parseObjectSafe(opt_str);

                    if (toptions.bindingType) {
                        inBindingType = toptions.bindingType;
                    }

                    if (toptions.additionType) {
                        inAdditionType = toptions.additionType;
                    }

                    if (toptions.templateFromInput) {
                        inTemplateFromInput = toptions.templateFromInput;
                    }
                }

                if (pt_str) {
                    inTemplate = pt_str;
                }

                if (dt_str) {
                    let [dt_attr, dt_path] = parseAttributeBinding(dt_str);

                    if (dt_path) {
                        inData = getValue(inData, dt_path);
                    }
                }

                let nestedtemplate = processTemplate(inTemplate, inData, inBindingType, inAdditionType, templateFromInput, options);

                if (inAdditionType == "prepend") {
                    nodes[i].prepend(nestedtemplate.content);
                } else if (inAdditionType == "append") {
                    nodes[i].append(nestedtemplate.content);
                } else if (inAdditionType == "appendChild") {
                    nodes[i].appendChild(nestedtemplate.content);
                } else if (inAdditionType == "innerHTML") {
                    nodes[i].innerHTML = "";
                    nodes[i].append(nestedtemplate.content);
                } else if (inAdditionType == "textContent") {
                    nodes[i].textContent = nestedtemplate.content.textContent;
                }

            };
        }
    }
    //#endregion ---------------- UI Template ---------------------------
    //#endregion ---------------- SignalBasedReactiveDataLink -----------

    //#region ------------------- Static SBRDL --------------------------

    //#endregion ---------------- Static SBRDL --------------------------
    //#region ---------------- readyCallback --------------------------
    const readyCallbackList = [];
    let isReady = false;

    function runReadyCallbacks() {
        if (isReady) return;
        isReady = true;

        try {
            while (readyCallbackList.length) {
                const cb = readyCallbackList.shift();
                if (typeof cb === "function") cb();
            }
        } catch (error) {
            console.error("Ready callback error:", error);
        }
    }

    dui.ready = function (callback) {
        if (typeof callback !== "function") return;

        if (document.readyState === "complete"
            || document.readyState === "interactive"
            || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
            window.setTimeout(callback, 0);
        } else {
            readyCallbackList.push(callback);
        }
    };

    if (document.readyState === "complete" ||
        (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        setTimeout(runReadyCallbacks, 0);
    } else {
        window.addEventListener("load", runReadyCallbacks);
    }
    //#endregion ------------- readyCallback --------------------------
    //alt
    if (!noGlobal) {
        window.dui = dui;
    }

    return dui;
});