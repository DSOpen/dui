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
                            return this; // throw new Error('HTML string boş veya geçersiz');
                        }

                        for (let i = 0; i < nodes.length; i++) {
                            this.elements[i] = nodes[i];
                        }

                        this.length = nodes.length;
                    } else {
                        const nodes = document.querySelectorAll(selector);

                        if (!nodes.length) {
                            return this; //throw new Error(`Seçici "${selector}" ile eşleşen eleman bulunamadı`);
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

        //#region Event Handling - Olay Yönetimi
        bse(eventType, fn) {
            const prms = Array.prototype.slice.call(arguments, 2);
            return bindSmartEvent(this.elements, eventType, fn, prms);
        },
        bindSmartEvent(eventType, fn) {
            const prms = Array.prototype.slice.call(arguments, 2);
            return bindSmartEvent(this.elements, eventType, fn, prms);
        },
        bseFromString(eventType, funcStr, values, isparam, root) {
            return bindSmartEventFromString(this.elements, eventType, funcStr, values, isparam, root);
        },
        bindSmartEventFromString(eventType, funcStr, values, isparam, root) {
            return bindSmartEventFromString(this.elements, eventType, funcStr, values, isparam, root);
        },
        off(types, fn) {
            off(this.elements, types, fn);
            return this;
        },
        //#endregion Event Handling - Olay Yönetimi

        //#region Iteration
        forEach(callback) {
            if (typeof callback !== "function") {
                throw new TypeError("callback bir fonksiyon olmalıdır.");
            }

            const items = this.elements;
            for (let i = 0; i < items.length; i++) {
                const el = items[i];
                const result = callback.call(i, el, el);
                if (result === false) break;
            }

            return this;
        },
        //#endregion Iteration

        //#region DOM Traversal - DOM İçinde Gezinme
        eq(index) {
            return index >= 0
                ? dui.select(this.elements[index] || [])
                : dui.select(this.elements[this.elements.length + index] || []);
        },
        find(selector) {
            return find(this.elements, selector);
        },
        parent() {
            return parent(this.elements);
        },
        children() {
            return children(this.elements);
        },
        first() {
            return first(this.elements);
        },
        last() {
            return last(this.elements);
        },
        next() {
            return next(this.elements);
        },
        prev() {
            return prev(this.elements);
        },
        //#endregion DOM Traversal - DOM İçinde Gezinme

        //#region Class and Style Utilities - Sınıf ve Görünürlük Yardımcıları
        toggleClass(className) {
            toggleClass(this.elements, className);
            return this;
        },
        hasClass(className) {
            hasClass(this.elements, className);
            return this;
        },
        hasClassAll(className) {
            hasClassAll(this.elements, className);
            return this;
        },
        addClass(className) {
            addClass(this.elements, className);
            return this;
        },
        removeClass(className) {
            removeClass(this.elements, className);
            return this;
        },
        //#endregion Class and Style Utilities - Sınıf ve Görünürlük Yardımcıları

        ajaxSubmit(options = {}) {
            return ajaxSubmit(this.elements, options);
        },
        //#region DOM Manipulation - DOM Üzerinde Değişiklik Yapma
        append(content) {
            append(this.elements, content);

            return this;
        },
        before(content) {
            before(this.elements, content);

            return this;
        },
        after(content) {
            after(this.elements, content);

            return this;
        },
        clone() {
            return clone(this.elements);
        },
        attr(name, value) {
            let result = attr(this.elements, name, value);
            if (isArrayLike(result)) return result;

            return this;
        },
        removeAttr(name) {
            removeAttr(this.elements, name);
            return this;
        },
        css(property, value) {
            let result = css(this.elements, property, value);
            if (isArrayLike(result)) return result;

            return this;
        },
        val(value) {
            let result = val(this.elements, value);
            if (isArrayLike(result)) return result;

            return this;
        },
        html(value) {
            let result = html(this.elements, value);
            if (isArrayLike(result)) return result;

            return this;
        },
        text(value) {
            let result = text(this.elements, value);
            if (isArrayLike(result)) return result;

            return this;
        },
        //#endregion DOM Manipulation - DOM Üzerinde Değişiklik Yapma

        //#region Animation and Effects
        animate(properties, duration = 400, easing = 'linear', useTransition = false) {
            return animate(this.elements, properties, duration, easing, useTransition);
        },
        keyframe(keyframes, options = {}) {
            keyframe(this.elements, keyframes, options);
            return this;
        },
        fadeIn(duration = 400, displayType = 'block') {
            return fadeIn(this.elements, duration, displayType);
        }
        ,
        fadeOut(duration = 400) {
            return fadeOut(this.elements, duration);
        },
        stopAnimations() {
            stopAnimations(this.elements);
            return this;
        },
        slideUp(duration = 400, easing = 'easeInQuad') {
            return slideUp(this.elements, duration, easing);
        },
        slideDown(duration = 400, easing = 'easeOutQuad', displayType = 'block') {
            return slideDown(this.elements, duration, easing, displayType);
        },
        slideToggle(duration = 400, easing = 'easeOutQuad', easingHide = 'easeInQuad', displayType = 'block') {
            slideToggle(this.elements, duration, easing, easingHide, displayType);
            return this;
        },
        colorTo(property, value, duration = 400, easing = 'linear') {
            return colorTo(this.elements, property, value, duration, easing);
        },
        bgColorTo(value, duration = 400, easing = 'linear') {
            return bgColorTo(this.elements, value, duration, easing);
        },
        textColorTo(value, duration = 400, easing = 'linear') {
            return textColorTo(this.elements, value, duration, easing);
        },
        staggerAnimate(properties, options = {}) {
            return staggerAnimate(this.elements, properties, options);
        },
        //#endregion Animation and Effects
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

    //#region DOM Traversal - DOM İçinde Gezinme
    function checkElementToArray(selector) {
        const elements = [];

        if (isArrayLike(selector)) {
            return selector;
        }

        if (selector === window || selector === document || isDomElement(selector)) {
            if (selector instanceof NodeList || selector instanceof HTMLCollection) {
                for (let i = 0; i < selector.length; i++) {
                    elements[i] = selector[i];
                }

                return elements;
            }

            elements[0] = selector;
            return elements;
        }
    }

    dui.find = find;
    function find(elements, selector) {
        const results = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => results.push(...el.querySelectorAll(selector)));
        return dui.select(results);
    }

    dui.parent = parent;
    function parent(elements) {
        const parents = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            if (el.parentElement && !parents.includes(el.parentElement)) {
                parents.push(el.parentElement);
            }
        });

        return dui.select(parents);
    }

    dui.children = children;
    function children(elements) {
        const children = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => children.push(...el.children));

        return dui.select(children);
    }

    dui.first = first;
    function first(elements) {
        elements = checkElementToArray(elements);

        return elements.length > 0 ? dui.select(elements[0]) : dui.select([]);
    }

    dui.last = last;
    function last(elements) {
        elements = checkElementToArray(elements);

        return elements.length > 0 ? dui.select(elements[elements.length - 1]) : dui.select([]);
    }

    dui.next = next;
    function next(elements) {
        const nextElements = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.nextElementSibling && nextElements.push(el.nextElementSibling));
        return dui.select(nextElements);
    }

    dui.prev = prev;
    function prev(elements) {
        const prevElements = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.previousElementSibling && prevElements.push(el.previousElementSibling));
        return dui.select(prevElements);
    }
    //#endregion DOM Traversal - DOM İçinde Gezinme

    //#region Class and Style Utilities - Sınıf ve Görünürlük Yardımcıları
    dui.toggleClass = toggleClass;
    function toggleClass(elements, className) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.classList.toggle(className));
    }

    dui.hasClass = hasClass;
    function hasClass(elements, className) {
        elements = checkElementToArray(elements);

        return elements[0] ? elements[0].classList.contains(className) : false;
    }

    dui.hasClassAll = hasClassAll;
    function hasClassAll(elements, className) {
        elements = checkElementToArray(elements);

        for (let i = 0; i < elements.length; i++) {
            if (!elements[i].classList.contains(className)) {
                return false;
            }
        }

        return true;
    }

    dui.addClass = addClass;
    function addClass(elements, className) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.classList.add(className));
    }

    dui.removeClass = removeClass;
    function removeClass(elements, className) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.classList.remove(className));
    }
    //#endregion Class and Style Utilities - Sınıf ve Görünürlük Yardımcıları

    //#region DOM Manipulation - DOM Üzerinde Değişiklik Yapma
    dui.append = append;
    function append(elements, content) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            if (typeof content === 'string') {
                el.insertAdjacentHTML('beforeend', content);
            } else if (content instanceof Element) {
                el.appendChild(content);
            } else if (content instanceof dui) {
                content.elements.forEach((child, ci) => el.appendChild(child));
            }
        });
    }

    dui.before = before;
    function before(elements, content) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            const parent = el.parentNode;
            if (!parent) return;

            if (typeof content === 'string') {
                el.insertAdjacentHTML('beforebegin', content);
            } else if (content instanceof Element) {
                parent.insertBefore(content, el);
            } else if (content instanceof dui) {
                content.elements.forEach((child, ci) => {
                    parent.insertBefore(child, el);
                });
            }
        });
    }

    dui.after = after;
    function after(elements, content) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            const parent = el.parentNode;
            if (!parent) return;

            if (typeof content === 'string') {
                el.insertAdjacentHTML('afterend', content);
            } else if (content instanceof Element) {
                parent.insertBefore(content, el.nextSibling);
            } else if (content instanceof dui) {
                content.elements.forEach((child, ci) => {
                    parent.insertBefore(child, el.nextSibling);
                });
            }
        });
    }

    dui.clone = clone;
    function clone(elements) {
        const clones = [];
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            clones.push(el.cloneNode(true));
        });

        return dui.select(clones);
    }

    dui.attr = attr;
    function attr(elements, name, value) {
        elements = checkElementToArray(elements);

        if (value === undefined) {
            const attributes = [];
            elements.forEach((el, i) => {
                if (el.hasAttribute(name)) {
                    attributes.push(el.getAttribute(name));
                }
            });

            return attributes;
        }

        elements.forEach((el, i) => el.setAttribute(name, value));
    }

    dui.removeAttr = removeAttr;
    function removeAttr(elements, name) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => el.removeAttribute(name));
    }

    dui.css = css;
    function css(elements, property, value) {
        elements = checkElementToArray(elements);

        if (value === undefined && typeof property === 'string') {
            const styless = [];
            elements.forEach((el, i) => {
                styless.push(getComputedStyle(el)[property]);
            });

            return styless;
        }

        elements.forEach((el, i) => {
            if (typeof property === 'object') {
                for (let key in property) {
                    el.style[key] = property[key];
                }
            } else {
                el.style[property] = value;
            }
        });
    }

    dui.val = val;
    function val(elements, value) {
        elements = checkElementToArray(elements);

        if (value === undefined) {
            const values = [];
            elements.forEach((el, i) => {
                values.push(el.value);
            });

            return values;
        }

        elements.forEach((el, i) => el.value = value);
    }

    dui.html = html;
    function html(elements, value) {
        elements = checkElementToArray(elements);

        if (value === undefined) {
            const values = [];
            elements.forEach((el, i) => {
                values.push(el.innerHTML);
            });

            return values;
        }

        elements.forEach((el, i) => el.innerHTML = value);
    }

    dui.text = text;
    function text(elements, value) {
        elements = checkElementToArray(elements);

        if (value === undefined) {
            const values = [];
            elements.forEach((el, i) => {
                values.push(el.textContent);
            });

            return values;
        }

        elements.forEach((el, i) => el.textContent = value);
    }
    //#endregion DOM Manipulation - DOM Üzerinde Değişiklik Yapma

    //#region Animation and Style Utilities - Animasyon ve Stil Yardımcıları
    const animationRegistry = new WeakMap();
    const gpuAcceleratedProps = ['transform', 'opacity', 'filter'];
    const animations = new Set();
    let rafID = null;

    const Easings = Object.freeze({
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInOutExpo: t => t === 0 || t === 1 ? t : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
    });

    // Tek bir global RAF loop
    function _runAnimations() {
        const toRun = Array.from(animations);
        animations.clear();

        for (let i = 0; i < toRun.length; i++) {
            try {
                toRun[i]();
            } catch (e) {
                // İstersen burada global error handler kullanabilirsin
                console.error('Animation frame error:', e);
            }
        }

        if (animations.size > 0) {
            rafID = requestAnimationFrame(_runAnimations);
        } else {
            rafID = null;
        }
    }

    function _getStyleValues(el, props) {
        const gpuProps = Object.keys(props).filter(p =>
            gpuAcceleratedProps.includes(p)
        );

        if (gpuProps.length > 0) {
            el.style.willChange = gpuProps.join(', ');
        }

        const computed = getComputedStyle(el);

        return {
            values: Object.fromEntries(
                Object.entries(props).map(([prop, targetValue]) => {
                    const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                    const current = computed.getPropertyValue(cssProp) || '0';
                    const numericValue = parseFloat(current) || 0;
                    const unitMatch = current.match(/[a-z%]+$/i);
                    let unit = unitMatch ? unitMatch[0] : '';

                    if (!unit && prop !== 'opacity') {
                        unit = 'px';
                    }

                    const targetNumeric = parseFloat(targetValue) || 0;

                    return [prop, {
                        start: numericValue,
                        unit: unit,
                        end: targetNumeric
                    }];
                })
            ),
            cleanup: () => {
                if (gpuProps.length > 0) {
                    el.style.willChange = '';
                }
            }
        };
    }
    //#endregion Animation and Style Utilities - Animasyon ve Stil Yardımcıları

    //#region Animation and Effects
    dui.animate = animate;
    /**
          * properties: { opacity: 1, transform: ..., ... }
          * return: Promise<Array<{ completed: boolean, cancelled: boolean }>>
          */
    function animate(elements, properties, duration = 400, easing = 'linear', useTransition = false) {
        elements = checkElementToArray(elements);

        const promises = [];
        const isTransform = prop => prop.toLowerCase() === 'transform';

        const registerAnimation = (fn) => {
            animations.add(fn);
            if (!rafID) {
                rafID = requestAnimationFrame(_runAnimations);
            }
        };

        elements.forEach((el, i) => {
            const { values: styleValues, cleanup: baseCleanup } = _getStyleValues(el, properties);
            const animationId = Symbol('animation');

            const p = new Promise((resolve) => {
                let finished = false;
                let isCancelled = false;
                let update = null;
                let onTransitionEnd = null;
                const originalTransition = el.style.transition;

                const cleanup = () => {
                    if (typeof baseCleanup === 'function') {
                        baseCleanup();
                    }
                    el.style.transition = originalTransition;
                };

                const removeFromRegistry = () => {
                    const list = animationRegistry.get(el) || [];
                    const filtered = list.filter(a => a.id !== animationId);
                    if (filtered.length) {
                        animationRegistry.set(el, filtered);
                    } else {
                        animationRegistry.delete(el);
                    }
                };

                /**
                 * status: { completed: boolean, cancelled: boolean }
                 */
                const finish = (status) => {
                    if (finished) return;
                    finished = true;

                    cleanup();
                    removeFromRegistry();

                    resolve(status);
                };

                const cancel = () => {
                    if (finished) return;
                    isCancelled = true;

                    if (onTransitionEnd) {
                        el.removeEventListener('transitionend', onTransitionEnd);
                    }

                    if (update && animations.has(update)) {
                        animations.delete(update);
                    }

                    finish({ completed: false, cancelled: true });
                };

                // ---- CSS Transition branch ----
                if (useTransition) {
                    const transitionProps = Object.keys(properties)
                        .map(p => isTransform(p) ? 'transform' : p)
                        .map(p => `${p} ${duration}ms ${easing}`)
                        .filter((v, i, a) => a.indexOf(v) === i);

                    el.style.transition = transitionProps.join(', ');

                    // force reflow
                    void el.offsetHeight;

                    Object.entries(properties).forEach(([prop, value]) => {
                        el.style[prop] = value;
                    });

                    onTransitionEnd = (e) => {
                        if (e.target !== el || finished) return;
                        finish({ completed: true, cancelled: false });
                    };

                    el.addEventListener('transitionend', onTransitionEnd, { once: true });
                }
                // ---- requestAnimationFrame branch ----
                else {
                    const startTime = performance.now();
                    const easeFn = Easings[easing] || Easings.linear;

                    update = () => {
                        if (isCancelled || finished) return;

                        const elapsed = performance.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const t = easeFn(progress);

                        let transformValue = '';

                        Object.entries(styleValues).forEach(([prop, data]) => {
                            const value = data.start + (data.end - data.start) * t;

                            if (isTransform(prop)) {
                                transformValue += `${prop}(${value}${data.unit}) `;
                            } else {
                                el.style[prop] = `${value}${data.unit}`;
                            }
                        });

                        if (transformValue) {
                            el.style.transform = transformValue.trim();
                        }

                        if (progress < 1) {
                            registerAnimation(update);
                        } else {
                            finish({ completed: true, cancelled: false });
                        }
                    };

                    registerAnimation(update);
                }

                // Registry'e ekle
                const list = animationRegistry.get(el) || [];
                animationRegistry.set(el, [
                    ...list,
                    { id: animationId, cancel }
                ]);
            });

            promises.push(p);
        });

        // Promise<Array<Status>>
        return Promise.all(promises);
    }

    dui.stopAnimations = stopAnimations;
    function stopAnimations(elements) {
        elements = checkElementToArray(elements);

        elements.forEach((el, i) => {
            const list = animationRegistry.get(el) || [];

            // Bizim animasyonlarımız
            list.forEach(({ cancel }) => {
                try {
                    cancel();
                } catch (e) {
                    console.error('Error cancelling animation:', e);
                }
            });

            animationRegistry.delete(el);

            // Native / CSS animasyonları
            if (el.getAnimations) {
                el.getAnimations().forEach(anim => {
                    try {
                        anim.cancel();
                    } catch (e) {
                        console.error('Error cancelling native animation:', e);
                    }
                });
            }
        });
    }

    dui.keyframe = keyframe;
    function keyframe(elements, keyframes, options = {}) {
        elements = checkElementToArray(elements);

        const {
            duration = 1000,
            easing = 'ease',
            iterations = 1,
            direction = 'normal'
        } = options;

        elements.forEach((el, i) => {
            const style = document.createElement('style');

            const keyframeRules = Object.entries(keyframes)
                .map(([offset, styles]) => {
                    const cssStyles = Object.entries(styles)
                        .map(([prop, value]) => `${prop}: ${value};`)
                        .join('');
                    return `${offset} { ${cssStyles} }`;
                })
                .join('');

            const animationName = simpleStringHash(keyframeRules);

            style.textContent = `
                @keyframes ${animationName} {
                    ${keyframeRules}
                }
            `;

            document.head.appendChild(style);

            el.style.animation = `
                ${animationName}
                ${duration}ms
                ${easing}
                ${iterations}
                ${direction}
            `;

            let removed = false;
            const removeStyle = () => {
                if (removed) return;
                removed = true;

                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
                el.style.animation = '';
            };

            el.addEventListener('animationend', removeStyle, { once: true });
            el.addEventListener('animationcancel', removeStyle, { once: true });
        });
    }

    dui.fadeIn = fadeIn;
    function fadeIn(elements, duration = 400, displayType = 'block') {
        elements = checkElementToArray(elements);

        // başlangıç state
        elements.forEach((el, i) => {
            const computedDisplay = getComputedStyle(el).display;

            let targetDisplay;
            if (el.style.display === 'none' || computedDisplay === 'none') {
                targetDisplay = displayType;
            } else {
                targetDisplay = computedDisplay || displayType;
            }

            el.style.display = targetDisplay;
            el.style.opacity = '0';
        });

        // status array döner: [{completed, cancelled}, ...]
        return animate(elements, { opacity: 1 }, duration, 'easeOutQuad');
    }

    dui.fadeOut = fadeOut;
    function fadeOut(elements, duration = 400) {
        elements = checkElementToArray(elements);

        return animate(elements, { opacity: 0 }, duration, 'easeInQuad')
            .then(statuses => {
                // Tüm elementlerde animasyon başarıyla tamamlandıysa display:none yap
                const allCompleted = statuses.every(
                    s => s && s.completed && !s.cancelled
                );

                if (allCompleted) {
                    elements.forEach((el, i) => {
                        el.style.display = 'none';
                    });
                }

                // dışarıya da status array'i forward edelim
                return statuses;
            });
    }

    dui.slideDown = slideDown;
    /**
 * slideDown: height: 0 -> natural height
 * duration, easing, displayType: 'block' | 'flex' | 'inline-block' vs.
 */
    function slideDown(elements, duration = 400, easing = 'easeOutQuad', displayType = 'block') {
        elements = checkElementToArray(elements);

        const promises = [];

        elements.forEach((el, i) => {
            const computed = getComputedStyle(el);

            // Zaten görünür ve yüksekliği > 0 ise skip
            const currentDisplay = computed.display;
            const currentHeight = parseFloat(computed.height) || 0;

            if (currentDisplay !== 'none' && currentHeight > 0) {
                // Skip edilenler için tamamlanmış status dönelim
                promises.push(Promise.resolve({ completed: true, cancelled: false, skipped: true }));
                return;
            }

            promises.push(new Promise(resolve => {
                // Başlangıç ayarları
                const prevDisplay = currentDisplay === 'none' ? displayType : currentDisplay;
                const prevOverflow = el.style.overflow;

                el.style.display = prevDisplay;
                el.style.overflow = 'hidden';

                // Tam yüksekliği ölç
                el.style.height = 'auto';
                const targetHeight = el.scrollHeight; // px cinsinden

                // Animasyon başlangıcı
                el.style.height = '0px';

                animate(el, { height: targetHeight }, duration, easing)
                    .then(statuses => {
                        const st = statuses[0] || { completed: true, cancelled: false };

                        // Inline height'i temizleyip natural flow'a bırak
                        el.style.height = '';
                        el.style.overflow = prevOverflow;

                        resolve(st);
                    });
            }));
        });

        return Promise.all(promises);
    }

    dui.slideUp = slideUp;
    /**
 * slideUp: natural height -> 0, sonra display:none
 */
    function slideUp(elements, duration = 400, easing = 'easeInQuad') {
        elements = checkElementToArray(elements);
        const promises = [];

        elements.forEach((el, i) => {
            const computed = getComputedStyle(el);
            const currentDisplay = computed.display;

            if (currentDisplay === 'none') {
                promises.push(Promise.resolve({ completed: true, cancelled: false, skipped: true }));
                return;
            }

            const currentHeight = parseFloat(computed.height) || 0;

            if (currentHeight <= 0) {
                // Zaten 0 gibi, direkt display:none
                el.style.display = 'none';
                promises.push(Promise.resolve({ completed: true, cancelled: false }));
                return;
            }

            promises.push(new Promise(resolve => {
                const prevOverflow = el.style.overflow;
                el.style.overflow = 'hidden';

                animate(el, { height: 0 }, duration, easing)
                    .then(statuses => {
                        const st = statuses[0] || { completed: true, cancelled: false };

                        if (st.completed && !st.cancelled) {
                            el.style.display = 'none';
                        }

                        // height'i temizle, overflow'u geri al
                        el.style.height = '';
                        el.style.overflow = prevOverflow;

                        resolve(st);
                    });
            }));
        });

        return Promise.all(promises);
    }

    dui.slideToggle = slideToggle;
    /**
 * slideToggle: display durumuna göre slideDown/slideUp seçer
 */
    function slideToggle(elements, duration = 400, easingShow = 'easeOutQuad', easingHide = 'easeInQuad', displayType = 'block') {
        elements = checkElementToArray(elements);
        if (!elements.length) return Promise.resolve([]);

        const first = elements[0];
        const computed = getComputedStyle(first);

        if (computed.display === 'none') {
            return slideDown(elements, duration, easingShow, displayType);
        } else {
            return slideUp(elements, duration, easingHide);
        }
    }

    dui.colorTo = colorTo;
    /**
 * Renk animasyonu: color / backgroundColor / borderColor gibi
 * Burada useTransition = true kullanıyoruz ki tarayıcı renk animasyonunu kendi yapsın.
 */
    function colorTo(elements, property, value, duration = 400, easing = 'linear') {
        elements = checkElementToArray(elements);
        const props = {};
        props[property] = value;
        return animate(elements, props, duration, easing, true);
    }

    dui.bgColorTo = bgColorTo;
    function bgColorTo(elements, value, duration = 400, easing = 'linear') {
        return colorTo(elements, 'background-color', value, duration, easing);
    }

    dui.textColorTo = textColorTo;
    function textColorTo(elements, value, duration = 400, easing = 'linear') {
        return colorTo(elements, 'color', value, duration, easing);
    }

    dui.staggerAnimate = staggerAnimate;
    /**
 * staggerAnimate:
 * elementler üzerinde index * delay gecikmeyle aynı animasyonu uygular
 *
 * options: {
 *   duration: 400,
 *   easing: 'linear',
 *   useTransition: false,
 *   delay: 50 // ms
 * }
 */
    function staggerAnimate(elements, properties, options = {}) {
        elements = checkElementToArray(elements);

        const {
            duration = 400,
            easing = 'linear',
            useTransition = false,
            delay = 50
        } = options;
        const allPromises = [];

        elements.forEach((el, i) => {
            const p = new Promise(resolve => {
                const startDelay = i * delay;

                setTimeout(() => {
                    animate(el, properties, duration, easing, useTransition)
                        .then(statuses => {
                            // Tek element için animate, statuses[0] yeterli
                            resolve(statuses[0] || { completed: true, cancelled: false });
                        });
                }, startDelay);
            });

            allPromises.push(p);
        });

        // Promise<Array<Status>>
        return Promise.all(allPromises);
    }
    //#endregion Animation and Effects

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

    function GetElementByFirstLevelAttribute(elm, attr) {
        let nodes = [];
        let children;

        if (elm.tagName == "TEMPLATE") {
            children = elm.content.children;
        } else {
            children = elm.children
        }

        for (let i = 0; i < children.length; i++) {
            if (children[i].hasAttribute(attr)) {
                nodes.push(children[i]);
            }
        }

        return nodes;
    }
    //#endregion ------------- Common Tool --------------------------------

    //#region ---------------- Ajax Tool ----------------------------------
    dui.ajax = ajax;
    function ajax(options) {
        const {
            url,
            method = 'GET',
            data = null,
            headers = {},
            responseType = 'json',
            timeout = 0,
            beforeSend,
            success,
            error,
            complete,
            progress,
            abort
        } = options;

        const xhr = new XMLHttpRequest();

        const chain = {
            successCallbacks: success ? [success] : [],
            errorCallbacks: error ? [error] : [],
            completeCallbacks: complete ? [complete] : [],
            progressCallbacks: progress ? [progress] : [],
            abortCallbacks: abort ? [abort] : [],

            success(fn) { this.successCallbacks.push(fn); return this; },
            error(fn) { this.errorCallbacks.push(fn); return this; },
            complete(fn) { this.completeCallbacks.push(fn); return this; },
            progress(fn) { this.progressCallbacks.push(fn); return this; },
            abort(fn) { this.abortCallbacks.push(fn); return this; }
        };

        xhr.open(method, url, true);
        xhr.timeout = timeout;

        for (const key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        if (beforeSend && beforeSend(xhr) === false) {
            const errObj = { message: 'Request cancelled by beforeSend', status: null };
            chain.errorCallbacks.forEach(cb => cb(errObj));
            chain.completeCallbacks.forEach(cb => cb());
            return chain;
        }

        xhr.responseType = responseType === 'json' ? 'text' : responseType;

        xhr.onload = function () {
            let response = xhr.responseText;
            if (responseType === 'json') {
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    chain.errorCallbacks.forEach(cb => cb({ message: 'Invalid JSON response', status: xhr.status }));
                    chain.completeCallbacks.forEach(cb => cb(xhr));
                    return;
                }
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                chain.successCallbacks.forEach(cb => cb(response, xhr));
            } else {
                chain.errorCallbacks.forEach(cb => cb({ message: `HTTP ${xhr.status}`, status: xhr.status, response }));
            }
            chain.completeCallbacks.forEach(cb => cb(xhr));
        };

        xhr.onerror = function () {
            chain.errorCallbacks.forEach(cb => cb({ message: 'Network error', status: xhr.status || null }));
            chain.completeCallbacks.forEach(cb => cb(xhr));
        };

        xhr.ontimeout = function () {
            chain.errorCallbacks.forEach(cb => cb({ message: 'Request timed out', status: 408 }));
            chain.completeCallbacks.forEach(cb => cb(xhr));
        };

        xhr.onabort = function () {
            chain.abortCallbacks.forEach(cb => cb());
            chain.errorCallbacks.forEach(cb => cb({ message: 'Request aborted', status: null }));
            chain.completeCallbacks.forEach(cb => cb(xhr));
        };

        if (xhr.upload && chain.progressCallbacks.length > 0) {
            xhr.upload.onprogress = function (event) {
                chain.progressCallbacks.forEach(cb => cb(event));
            };
        }

        if (data) {
            const payload = typeof data === 'string' ? data : JSON.stringify(data);
            if (typeof data !== 'string') {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
            xhr.send(payload);
        } else {
            xhr.send();
        }

        return chain;
    }

    dui.ajaxFetch = ajaxFetch;
    function ajaxFetch(options) {
        const {
            url,
            method = 'GET',
            data = null,
            headers = {},
            responseType = 'json',
            timeout = 0,
            beforeSend,
            success,
            error,
            complete,
            progress,
            abort
        } = options;

        const chain = {
            successCallbacks: success ? [success] : [],
            errorCallbacks: error ? [error] : [],
            completeCallbacks: complete ? [complete] : [],
            progressCallbacks: progress ? [progress] : [],
            abortCallbacks: abort ? [abort] : [],
            success(fn) { this.successCallbacks.push(fn); return this; },
            error(fn) { this.errorCallbacks.push(fn); return this; },
            complete(fn) { this.completeCallbacks.push(fn); return this; },
            progress(fn) { this.progressCallbacks.push(fn); return this; },
            abort(fn) { this.abortCallbacks.push(fn); return this; },
            abortRequest() { controller.abort(); return this; }
        };

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            signal
        };

        if (data) {
            fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
        }

        if (beforeSend && beforeSend(fetchOptions) === false) {
            const errObj = { message: 'Request cancelled by beforeSend', status: null };
            chain.errorCallbacks.forEach(cb => cb(errObj));
            chain.completeCallbacks.forEach(cb => cb());
            return chain;
        }

        if (timeout > 0) {
            setTimeout(() => controller.abort(), timeout);
        }

        fetch(url, fetchOptions)
            .then(async res => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw { message: `HTTP ${res.status}`, status: res.status, response: errText };
                }

                if (responseType === 'stream') {
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let result = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        result += chunk;
                        chain.progressCallbacks.forEach(cb => cb(chunk));
                    }
                    chain.successCallbacks.forEach(cb => cb(result, res));
                    chain.completeCallbacks.forEach(cb => cb(res));
                } else if (responseType === 'text') {
                    const text = await res.text();
                    chain.successCallbacks.forEach(cb => cb(text, res));
                    chain.completeCallbacks.forEach(cb => cb(res));
                } else if (responseType === 'blob') {
                    const blob = await res.blob();
                    chain.successCallbacks.forEach(cb => cb(blob, res));
                    chain.completeCallbacks.forEach(cb => cb(res));
                } else {
                    try {
                        const json = await res.json();
                        chain.successCallbacks.forEach(cb => cb(json, res));
                    } catch (e) {
                        chain.errorCallbacks.forEach(cb => cb({ message: 'Invalid JSON', status: res.status }));
                    }
                    chain.completeCallbacks.forEach(cb => cb(res));
                }
            })
            .catch(err => {
                if (signal.aborted) {
                    chain.abortCallbacks.forEach(cb => cb());
                    chain.errorCallbacks.forEach(cb => cb({ message: 'Request aborted', status: null }));
                } else if (err && typeof err === 'object' && err.error) {
                    chain.errorCallbacks.forEach(cb => cb(err));
                } else {
                    chain.errorCallbacks.forEach(cb => cb({ message: err.message || err, status: null }));
                }
                chain.completeCallbacks.forEach(cb => cb());
            });

        return chain;
    }

    dui.ajaxSubmit = ajaxSubmit;
    function ajaxSubmit(elements, options = {}) {
        return elements.forEach((el, i) => {
            const form = el;

            if (form.nodeName !== "FORM") return;

            const formData = new FormData(form);

            const defaultOptions = {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
                responseType: 'json',
            };

            const finalOptions = { ...defaultOptions, ...options };

            fetch(finalOptions.url || form.action, finalOptions)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (options.success) options.success(data);
                })
                .catch(error => {
                    if (options.error) options.error(error);
                });
        });
    }
    //#endregion ------------- Ajax Tool ----------------------------------

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

    dui.simpleStringHash = simpleStringHash;
    function simpleStringHash(str) {
        const MODULO = 2147483647;
        let hash = 5381;
        for (let i = 0; i < str.length; i++)
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        return hash % MODULO;
    }

    dui.numberHash = numberHash;
    function numberHash(num) {
        if (Number.isInteger(num)) return num;
        return simpleStringHash(num.toString());
    }

    dui.parseObjectSafe = parseObjectSafe;
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

    dui.parseArraySafe = parseArraySafe;
    function parseArraySafe(str) {
        const arr = [];

        // sadece [ ... ] içini yakala
        const inner = str.trim().replace(/^\[/, "").replace(/\]$/, "");

        // virgüllere göre böl (ama boş stringleri at)
        const parts = inner.split(/\s*,\s*/).filter(p => p.length > 0);

        for (let part of parts) {
            // baştaki/sondaki tırnakları temizle
            if ((part.startsWith('"') && part.endsWith('"')) ||
                (part.startsWith("'") && part.endsWith("'"))) {
                part = part.slice(1, -1);
                arr.push(part);
                continue;
            }

            // özel değerler
            if (part === "true") arr.push(true);
            else if (part === "false") arr.push(false);
            else if (part === "null") arr.push(null);
            else if (!isNaN(Number(part))) arr.push(Number(part));
            else arr.push(part);
        }

        return arr;
    }

    dui.parseObjectKeyValue = parseObjectKeyValue;
    function parseObjectKeyValue(str) {
        const result = [];
        let items = [];
        let part = '';
        let inQuotes = false, quoteChar = '', bracketLevel = 0, esc = false;
        // İlk olarak split işlemi (virgülleri tırnak/parantez dışında yakalıyoruz)
        for (let i = 0; i < str.length; i++) {
            let c = str[i];
            if (esc) { part += c; esc = false; continue; }
            if (c === '\\') { part += c; esc = true; continue; }
            if ((c === "'" || c === '"')) {
                if (!inQuotes) { inQuotes = true; quoteChar = c; part += c; continue; }
                else if (c === quoteChar) { inQuotes = false; part += c; continue; }
            }
            if (!inQuotes && (c === '[' || c === '{')) { bracketLevel++; part += c; continue; }
            if (!inQuotes && (c === ']' || c === '}')) { bracketLevel--; part += c; continue; }
            if (!inQuotes && bracketLevel === 0 && c === ',') {
                items.push(part.trim());
                part = '';
                continue;
            }
            part += c;
        }
        if (part) items.push(part.trim());

        // Şimdi her parçayı key:value olarak ayıralım
        for (const item of items) {
            // Sadece ilk : ile böl, yoksa value var key yok
            let idx = -1, inQuotes = false, quoteChar = '', bracketLevel = 0, esc = false;
            for (let i = 0; i < item.length; i++) {
                let c = item[i];
                if (esc) { esc = false; continue; }
                if (c === '\\') { esc = true; continue; }
                if ((c === "'" || c === '"')) {
                    if (!inQuotes) { inQuotes = true; quoteChar = c; continue; }
                    else if (c === quoteChar) { inQuotes = false; continue; }
                }
                if (!inQuotes && c === '[' || c === '{') { bracketLevel++; continue; }
                if (!inQuotes && c === ']' || c === '}') { bracketLevel--; continue; }
                if (!inQuotes && bracketLevel === 0 && c === ':') {
                    idx = i; break;
                }
            }
            if (idx === -1) {
                // Hiç : yoksa, key yok, value var
                result.push(["", item.trim()]);
            } else {
                let key = item.slice(0, idx).trim();
                let value = item.slice(idx + 1).trim();
                result.push([key, value]);
            }
        }
        return result;
    }

    dui.isPlainObject = isPlainObject;
    function isPlainObject(obj) {
        return (
            obj !== null &&
            typeof obj === 'object' &&
            Object.getPrototypeOf(obj) === Object.prototype
        );
    }

    dui.isDomElement = isDomElement;
    function isDomElement(obj) {
        return (
            obj instanceof Element ||
            obj instanceof Node ||
            obj instanceof NodeList ||
            obj instanceof HTMLCollection
        );
    }

    dui.isEmpty = isEmpty;
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
    dui.isArrayLike = isArrayLike;
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

    dui.getValue = getValue;
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

    dui.setValue = setValue;
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

    dui.IsSettableValue = IsSettableValue;
    function IsSettableValue(el, path) {
        const defaultSettableProperty = getDefaultSettableProperty(el);

        if (Array.isArray(path) || Array.isArray(path[0])) {
            const attr = path[0];
            const realPath = path[1];

            if (attr) {
                if (attr == defaultSettableProperty) {
                    return true;
                }

                return false;
            }
        }

        return true;
    }

    dui.pathIsEvent = pathIsEvent;
    function pathIsEvent(path) {
        if (!Array.isArray(path)) return false;

        if (path[0].startsWith("event") || path[0].startsWith("eventprop") || path[0].startsWith("func") || path[0].startsWith("funcdata")) return true;

        return false;
    }

    function parseAttributeBinding(binding) {
        const attrEnd = binding.indexOf("{:");
        return [
            binding.substring(0, attrEnd),
            binding.substring(attrEnd + 2, binding.length - 1).trim(),
        ];
    }

    dui.getDefaultEventHandlerType = getDefaultEventHandlerType;
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

    /***** Ortak yardımcılar *****/
    const EVENT_PARAM_SET = new Set(['e', 'ev', 'evt', 'event']);

    // 1) Parametre adlarını çıkar (yorumları, default değerleri, rest/destructuring’i temizler)
    dui.getParamNames = getParamNames;
    function getParamNames(fn) {
        var src = Function.prototype.toString.call(fn);
        var m = src.match(/^[\s\S]*?\(([\s\S]*?)\)/);
        if (!m) return [];
        var inside = m[1]
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');
        if (!inside.trim()) return [];
        return inside.split(',').map(function (s) {
            s = s.trim().replace(/^\.\.\./, '');
            if (s[0] === '{' || s[0] === '[') return '';
            s = s.split('=')[0].trim();
            return s;
        }).filter(Boolean);
    }

    // 2) Event’i doğru yere yerleştir, diğer parametreleri sırayla doldur
    dui.buildArgsFor = buildArgsFor;
    function buildArgsFor(fn, e, extra) {
        var names = getParamNames(fn);
        if (names.length === 0) return extra.slice(); // parametresiz ise sadece extra
        var eventSlots = [];
        for (var i = 0; i < names.length; i++) {
            var nm = String(names[i] || '');//.toLowerCase();
            if (EVENT_PARAM_SET.has(nm)) eventSlots.push(i);
        }
        if (eventSlots.length === 0) return extra.slice(); // imzada event adı yoksa event geçmeyiz

        var out = [];
        var queue = extra.slice();
        for (var p = 0; p < names.length; p++) {
            if (eventSlots.indexOf(p) !== -1) out.push(e);
            else out.push(queue.length ? queue.shift() : undefined);
        }
        while (queue.length) out.push(queue.shift());
        return out;
    }

    /***** 3) İnce adapter: string -> (fn, extra) -> bindSmartEvent *****/
    dui.parseCallSpec = parseCallSpec;
    function parseCallSpec(spec) {
        if (spec.indexOf("'") == 0) {
            spec = spec.slice(1);
        }

        if (spec.lastIndexOf("'") == spec.length - 1) {
            spec = spec.slice(0, spec.length - 1);
        }
        var m = String(spec).trim().match(/^([$\w.]+)\s*\(([^)]*)\)\s*$/);
        if (!m) throw new Error('Geçersiz çağrı ifadesi: ' + spec);
        var argStr = m[2].trim();
        // Argümanları ayır, yorumları temizle ve boşları filtrele
        var args = !argStr ? [] : argStr.split(',').map(function (x) {
            return x.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '').trim();
        }).filter(Boolean);
        return { path: m[1], args: args };
    }

    dui.resolveFunction = resolveFunction;
    function resolveFunction(path, root) {
        var ctx = root || (typeof window !== 'undefined' ? window : globalThis);
        var parts = path.split('.');
        for (var i = 0; i < parts.length; i++) {
            if (ctx == null) return null;
            ctx = ctx[parts[i]];
        }
        return (typeof ctx === 'function') ? ctx : null;
    }

    dui.bindSmartEventFromString = bindSmartEventFromString;
    /**
     * String çağrıyı çözüp bindSmartEvent’e yönlendirir.
     * @param targets  Element / NodeList / Array
     * @param types    "click mouseenter" veya ["click","mouseenter"]
     * @param callSpec "MyNS.Do(e,id,mode)" gibi
     * @param values   { id: 42, mode: "edit" } gibi eşleştirme (placeholder -> değer)
     * @param root     opsiyonel kök nesne (varsayılan window/globalThis)
     */
    function bindSmartEventFromString(targets, types, callSpec, values, isparam, root) {
        values = values || {};
        if (!isparam) {
            isparam = false;
        }
        var spec = parseCallSpec(callSpec);
        var fn = resolveFunction(spec.path, root);
        if (!fn) throw new Error('Fonksiyon bulunamadı: ' + spec.path);

        var argNames = spec.args;

        // Hedefleri normalize et
        var els = (NodeList.prototype.isPrototypeOf(targets) || Array.isArray(targets))
            ? Array.from(targets) : [targets];

        // Event tiplerini normalize et
        var typeList = Array.isArray(types)
            ? types : String(types).split(/\s+/).filter(Boolean);

        var handlers = [];

        els.forEach(function (el) {
            typeList.forEach(function (type) {
                var handler = function (e) {
                    // Argümanları oluştur: event parametreleri için e, diğerleri için values'tan al
                    if (isparam) {
                        var args = buildArgsFor(fn, e, values);
                        return fn.apply(el, args);
                    }

                    var finalArgs = argNames.map(function (argName) {
                        // argName = argName.toLowerCase();
                        if (EVENT_PARAM_SET.has(argName)) {
                            return e;
                        } else {
                            if (argName.indexOf("'") == 0 || Number.parseInt(argName)) {
                                return argName.replaceAll("'", "");
                            }

                            return getValue(values, argName); //values[argName];
                        }
                    });
                    return fn.apply(el, finalArgs);
                };

                // el.removeEventListener(type, handler,true);
                el.addEventListener(type, handler);
                handlers.push({ el: el, type: type, handler: handler });
            });
        });

        // off() fonksiyonunu döndür
        return function off() {
            handlers.forEach(function (h) {
                h.el.removeEventListener(h.type, h.handler);
            });
        };
    }

    dui.bindSmartEvent = bindSmartEvent;
    // 3) Akıllı bind: çoklu element ve çoklu event tipi, off() döndürür
    function bindSmartEvent(targets, types, fn) {
        var extra = Array.prototype.slice.call(arguments, 3);

        var els = (NodeList.prototype.isPrototypeOf(targets) || Array.isArray(targets))
            ? Array.from(targets) : [targets];

        var typeList = Array.isArray(types)
            ? types : String(types).split(/\s+/).filter(Boolean);

        var handlers = [];

        els.forEach(function (el) {
            typeList.forEach(function (type) {
                var handler = function (e) {
                    var args = buildArgsFor(fn, e, extra);
                    return fn.apply(el, args);
                };
                el.addEventListener(type, handler);
                handlers.push({ el: el, type: type, handler: handler });
            });
        });

        return function off() {
            handlers.forEach(function (h) {
                h.el.removeEventListener(h.type, h.handler);
            });
        };
    }

    dui.off = off;
    function off(targets, types, fn) {
        targets.forEach(el => {
            el.removeEventListener(types, fn);
        });
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
    function createSignalScope(dataSignalStoreKey = null, bypass = false) {
        if (!dataSignalStoreKey) {
            dataSignalStoreKey = uuidv4();
        }
        if (bypass) {
            dui.signalScopes.set(dataSignalStoreKey, createSignalStore());
        } else {
            if (!dui.signalScopes.has(dataSignalStoreKey)) {
                dui.signalScopes.set(dataSignalStoreKey, createSignalStore());
            }
        }

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

        return getSignalStore(dataSignalStoreKey);
    }

    function onDemandSignal(dataSignalStoreKey, path, data, isRecursive = 0) {
        if (isArrayLike(data)) {
            makeReactiveArray(dataSignalStoreKey, data, null, null);
            return;
        }

        const bindings = parseObjectKeyValue(path).reduce((acc, pair) => {
            if (pathIsEvent(pair)) {
                return acc;
            }

            acc.push(pair[1]); // 1. grup (special)

            return acc;
        }, []);

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
                                reactiveSignalObject(item, dataSignalStoreKey);
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

        if (internal == undefined) return;

        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() {
                // console.log("defineProperty get => dataSignalStoreKey:" + dataSignalStoreKey + " - key:" + key);
                const dataSignalStore = getSignalStore(dataSignalStoreKey);
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
                const dataSignalStore = getSignalStore(dataSignalStoreKey);
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

    dui.toRaw = toRaw;
    function toRaw(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    // function toSignalRaw(obj, dataSignalStore) {
    //     if (obj === null || typeof obj !== "object") return obj;

    //     const raw = Array.isArray(obj) ? [] : {};
    //     const signals = dataSignalStore.signalStore.get(obj);

    //     if (!signals) return obj; // Reaktif olmayan nesne

    //     for (const [key, signal] of signals.entries()) {
    //         const val = signal.get();
    //         raw[key] = toSignalRaw(dataSignalStore, val);
    //     }

    //     return raw;
    // }

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
    function elementSetAttrFormat(elm, setAttrFormat, path, val) {
        if (!elm || !setAttrFormat || setAttrFormat.trim() == "" || !path) return;
        let attrFormatArry = setAttrFormat.split("=");
        let attr = attrFormatArry[0];
        let attrFormat = attrFormatArry[1];

        path = path.split(".");
        path = path[path.length - 1];

        attrFormat = attrFormat.replace("{key}", path);
        attrFormat = attrFormat.replace("{value}", val);

        elm.setAttribute(attr, attrFormat);
    }

    function updateElement(elm, path, data) {
        let realPath = path;

        if (Array.isArray(path)) {
            if (pathIsEvent(path)) return;
            const attr = path[0];
            realPath = path[1];

            if (attr) {
                let attrVal = "";

                if (realPath.indexOf("'") == 0 || realPath.indexOf('"') == realPath.length - 1) {
                    attrVal = realPath.replaceAll(/['"]/g, "");
                } else {
                    attrVal = getValue(data, realPath);
                }

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

                return;
            }
        }

        const raw = getValue(data, realPath);

        if (elm.type === 'checkbox') {
            if (elm.checked !== raw) elm.checked = !!raw;
        } else if ('value' in elm) {
            if (document.activeElement !== elm && elm.value !== raw) elm.value = raw ?? '';
        } else {
            if (elm.textContent !== raw) elm.textContent = raw ?? '';
        }

        // elm.removeAttribute("data-binding")
    }

    function bindElement(el, path, data, mode, dataSignalStoreKey) {
        let realPath = path;

        let customEventHandlerType = null;
        let customEventFunc = null;
        let customEventFuncData = null;

        if (Array.isArray(path[0]) && path.every(x => pathIsEvent(x))) {
            const eventArry = path.find(x => x[0] == "event" || /event\d+/.test(x[0]));
            const eventpropArry = path.find(x => x[0].startsWith("eventprop"));
            const funcArry = path.find(x => x[0] == "func" || /func\d+/.test(x[0]));
            const funcdataArry = path.find(x => x[0].startsWith("funcdata"));

            if (!eventArry || !eventpropArry && !funcArry) return;

            if (eventArry) {
                if (eventArry[1].indexOf("'") != -1 || eventArry[1].indexOf('"') != -1) {
                    customEventHandlerType = eventArry[1];
                } else {
                    customEventHandlerType = getValue(data, eventArry[1]);
                }

                customEventHandlerType = customEventHandlerType.replaceAll("'", "");
            }

            if (eventpropArry) {
                realPath = eventpropArry[1];
            }

            if (funcArry) {
                if (funcArry[1].indexOf("'") != -1 || funcArry[1].indexOf('"') != -1) {
                    customEventFunc = funcArry[1];
                } else {
                    customEventFunc = getValue(data, funcArry[1]);
                }

                if (funcdataArry) {
                    if (funcdataArry[1].indexOf("[") != -1) {
                        customEventFuncData = parseArraySafe(funcdataArry[1]);
                    } else if (funcdataArry[1].indexOf("{") != -1) {
                        customEventFuncData = parseObjectSafe(funcdataArry[1]);
                    }
                    else {
                        customEventFuncData = getValue(data, funcdataArry[1]);
                    }
                    var aa = bindSmartEventFromString(el, customEventHandlerType, customEventFunc, customEventFuncData, true);
                } else {
                    var aa = bindSmartEventFromString(el, customEventHandlerType, customEventFunc, data);
                }

                return;
            }
        }

        //One-Way
        if (mode === 'One-Way') {
            updateElement(el, realPath, data);
            return;
        }

        // Data → Element: Two-Way veya herhangi bir DataToElement modu
        if (mode === 'Two-Way' || mode.endsWith('DataToElement')) {
            createEffect(() => updateElement(el, realPath, data), el, dataSignalStoreKey);
        }
        // Element → Data: Two-Way veya ElementToData
        if (mode === 'Two-Way' || mode.endsWith('ElementToData')) {
            // if (customEventHandlerType == null) {
            updateElement(el, realPath, data);
            // }

            if (!IsSettableValue(el, realPath)) {
                return;
            }

            if (customEventHandlerType == null) {
                customEventHandlerType = getDefaultEventHandlerType(el);
            }

            el.addEventListener(customEventHandlerType, e => {
                const val = el.type === 'checkbox' ? el.checked : e.target.value;
                if (el.type === 'number') val = Number(val);
                if (el.type === 'date') val = new Date(val);

                if (Array.isArray(realPath)) {
                    let pth = realPath[1];
                    setValue(data, pth, val);
                } else {
                    setValue(data, realPath, val);
                }
            });
        }

    }

    function applyBindingToElement(el, path, data, mode, isTemplate, dataSignalStoreKey) {
        const bindings = parseObjectKeyValue(path); //path.split(/,(?![^{]*})/).map((b) => b.trim());

        let [events, others] = bindings.reduce((acc, pair) => {
            // özel key seti
            if (pathIsEvent(pair)) {
                let num = Number.parseInt(pair[0][pair[0].length - 1])

                if (!num) {
                    num = 0;
                }

                if (!acc[0].has(num)) {
                    acc[0].set(num, []);
                }

                acc[0].get(num).push(pair);
            } else {
                if (pair[0] == "SubData") return acc;

                acc[1].push(pair); // 2. grup (others)
            }

            return acc;
        },
            [new Map(), []] // başlangıç: iki boş array
        );

        events = Array.from(events.values());
        others = Array.from(others.values());


        events.forEach((binding) => {
            bindElement(el, binding, data, mode, dataSignalStoreKey);
        });

        others.forEach((binding) => {
            bindElement(el, binding, data, mode, dataSignalStoreKey);
        });

        if (isTemplate) {
            el.removeAttribute("data-binding");
        }
    }

    function dataBindingToElement(dataSignalStoreKey, element, data, bindingType, renderEvent, isTemplate, index = null) {
        if (!element) return null;

        if (bindingType == undefined || bindingType.trim() == "") {
            bindingType = 'One-Way';
        }

        // Template/fragment branch:
        if (element instanceof HTMLTemplateElement || element instanceof DocumentFragment) {
            const nodes = element instanceof HTMLTemplateElement
                ? element.content.querySelectorAll('[data-binding]')
                : element.querySelectorAll('[data-binding]');

            // const nodes =GetElementByFirstLevelAttribute(element,'data-binding');

            nodes.forEach(el => {
                dataBindingToElement(dataSignalStoreKey, el, data, bindingType, renderEvent, isTemplate, index);

                if (isTemplate) {
                    el.removeAttribute("data-binding");
                }
            });

            return;
        }

        if (index !== null && Array.isArray(data)) {
            const inpath = element.getAttribute && element.getAttribute('data-binding');
            // const bindings = inpath.split(/,(?![^{]*})/).map((b) => b.trim());
            //Burası değiştirildi.
            // const bindings = inpath.split(/,(?=(?:[^']*'[^']*')*[^']*$)(?=(?:[^\[\]]*\[[^\[\]]*\])*[^\[\]]*$)/).map((b) => b.trim());
            const bindings = parseObjectKeyValue(inpath);

            if (bindingType == 'One-Way') {
                bindings.forEach((binding) => {
                    let dt = data[index];
                    if (renderEvent && renderEvent.beforeRender) {
                        const br = resolveFunction(renderEvent.beforeRender);
                        br(element, binding, dt);
                    }

                    updateElement(element, binding, dt);

                    if (renderEvent && renderEvent.afterRender) {
                        const ar = resolveFunction(renderEvent.afterRender);
                        ar(element, binding, dt);
                    }
                });

                return;
            }

            const dataSignalStore = dui.getSignalStore(dataSignalStoreKey);
            const signals = getSignalsMap(dataSignalStore, data);
            const sig = signals.get(index);

            if (!sig) {
                console.warn("sig yok");
            }

            createEffect(() => {
                bindings.forEach((binding) => {
                    let dt = sig.get();

                    if (renderEvent && renderEvent.beforeRender) {
                        const br = resolveFunction(renderEvent.beforeRender);
                        br(element, binding, dt);
                    }

                    updateElement(element, binding, dt);

                    if (renderEvent && renderEvent.afterRender) {
                        const ar = resolveFunction(renderEvent.afterRender);
                        ar(element, binding, dt);
                    }
                });
            }, element, dataSignalStoreKey);
            return;
        }

        // Standart DOM elementte: alt binding noktalarını bul
        const nodes = element.querySelectorAll('[data-binding]');
        if (nodes.length) {
            const inpath = element.getAttribute && element.getAttribute('data-binding');
            let inData = null, isDataArry = false;

            if (inpath) {
                const aryd = parseObjectKeyValue(inpath);
                const adstr = aryd.find(x => x[0] == "SubData");
                if (adstr) {
                    inData = getValue(data, adstr[1]);
                    isDataArry = isArrayLike(inData);
                }
            }

            nodes.forEach((el, i) => {
                if (inData) {
                    if (isDataArry) {
                        dataBindingToElement(dataSignalStoreKey, el, inData[i], bindingType, renderEvent, isTemplate, index);
                        return;
                    }

                    dataBindingToElement(dataSignalStoreKey, el, inData, bindingType, renderEvent, isTemplate, index);
                    return;
                }

                dataBindingToElement(dataSignalStoreKey, el, data, bindingType, renderEvent, isTemplate, index);
            });

            if (!inpath) return;

            const inmode = element.getAttribute('data-binding-way') || bindingType;
            if (renderEvent && renderEvent.beforeRender) {
                const br = resolveFunction(renderEvent.beforeRender);
                br(element, inpath, data);
            }

            applyBindingToElement(element, inpath, data, inmode, isTemplate, dataSignalStoreKey);

            if (renderEvent && renderEvent.afterRender) {
                const ar = resolveFunction(renderEvent.afterRender);
                ar(element, inpath, data);
            }

            if (isTemplate) {
                element.removeAttribute("data-binding");
            }
            // element.removeAttribute("data-binding");
            return;
        }

        // Kendi üstünde data-binding varsa
        const path = element.getAttribute && element.getAttribute('data-binding');
        if (!path) return;

        const mode = element.getAttribute('data-binding-way') || bindingType;

        if (mode != 'One-Way') {
            onDemandSignal(dataSignalStoreKey, path, data, false);
        }

        if (renderEvent && renderEvent.beforeRender) {
            const br = resolveFunction(renderEvent.beforeRender);
            br(element, path, data);
        }

        applyBindingToElement(element, path, data, mode, isTemplate, dataSignalStoreKey);

        if (renderEvent && renderEvent.afterRender) {
            const ar = resolveFunction(renderEvent.afterRender);
            ar(element, path, data);
        }
    }

    //#endregion ---------------- UI Data Binding -----------------------

    //#region ------------------- UI Template ---------------------------
    function uiRender({ data, bindingType = 'One-Way', beforeRender, afterRender }, options = null, dataSignalStoreKey = null) {
        let _dataSignalStoreKey = null;

        if (dataSignalStoreKey) {
            _dataSignalStoreKey = dataSignalStoreKey
        }

        if (!_dataSignalStoreKey && data) {
            _dataSignalStoreKey = addOjectHash(data);
            createSignalScope(_dataSignalStoreKey);
        }

        let renderEvent;

        if (beforeRender || afterRender) {
            renderEvent = {};
            if (beforeRender) {
                renderEvent.beforeRender = beforeRender;
            }
            if (afterRender) {
                renderEvent.afterRender = afterRender;
            }
        }

        for (const element of this.elements) {
            dataBindingToElement(_dataSignalStoreKey, element, data, bindingType, renderEvent, false);
        }

        if (options && typeof options == "object") {
            if (dataSignalStoreKey && !options.dataSignalStoreKey) {
                options.dataSignalStoreKey = dataSignalStoreKey;
            }

            if (options.bindingType == null) {
                options.bindingType = bindingType;
            }

            if (options.additionType == null) {
                options.additionType = "append";
            }
            ////Burası Eklendi
            renderTemplate(this, options);
        }

        return this;
    }

    function getTemplateFromTemplates(templateName, options) {
        let inTemplate = options.template, inData = options.data, inBindingType = options.bindingType, inAdditionType = options.additionType
            , inTemplateFromInput = options.templateFromInput, beforeRender = options.beforeRender, afterRender = options.afterRender;
        let inMainTemplate = options.templates[templateName];

        if (!inMainTemplate) {
            return {
                inTemplate,
                inData,
                inBindingType,
                inAdditionType,
                inTemplateFromInput,
                beforeRender,
                afterRender
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

        if (inMainTemplate.beforeRender) {
            beforeRender = inMainTemplate.beforeRender;
        }

        if (inMainTemplate.afterRender) {
            afterRender = inMainTemplate.afterRender;
        }

        return {
            inTemplate,
            inData,
            inBindingType,
            inAdditionType,
            inTemplateFromInput,
            beforeRender,
            afterRender
        };
    }

    function renderTemplate(t, options) {
        if (options == null || typeof options != "object" || (!options.template && !options.templates)) {
            return;
        }

        let inTemplate = options.template, inData = options.data, inBindingType = options.bindingType, inAdditionType = options.additionType
            , inTemplateFromInput = options.templateFromInput, renderEvent;

        if (options.beforeRender || options.afterRender) {
            renderEvent = {};
            if (options.beforeRender) {
                renderEvent.beforeRender = options.beforeRender;
            }
            if (options.afterRender) {
                renderEvent.afterRender = options.afterRender;
            }
        }

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

            if (inMainTemplate.beforeRender || inMainTemplate.afterRender) {
                if (!renderEvent) renderEvent = {};

                if (inMainTemplate.beforeRender) {
                    renderEvent.beforeRender = inMainTemplate.beforeRender;
                }
                if (inMainTemplate.afterRender) {
                    renderEvent.afterRender = inMainTemplate.afterRender;
                }
            }
        }

        let mTemplate = processTemplate(inTemplate, inData, inBindingType, inAdditionType, inTemplateFromInput, renderEvent, options);

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
                } else if (inAdditionType == "outerHTML") {
                    element.outerHTML = mTemplate.content;
                } else if (inAdditionType == "textContent") {
                    element.textContent = mTemplate.content.textContent;
                }
            }
        }
    }

    function processTemplate(template, data, bindingType, additionType, templateFromInput, renderEvent, options) {
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

        dataBindingToTemplate(dataSignalStoreKey, mTemplate, data, bindingType, additionType, templateFromInput, renderEvent, options);

        return mTemplate;
    }

    function parseTemplate(template, templateFromInput) {
        if (template == undefined || template == null || (typeof template == "string" && template.trim() == "")) {
            return null;
        }

        const tmplelm = getElementByTemplate(template, templateFromInput);

        return tmplelm;
    }

    function dataBindingToTemplate(dataSignalStoreKey, template, data, bindingType, additionType, templateFromInput, renderEvent, options) {
        ////Burası Eklendi.20251020-1407
        //if (data == null || !template.content.querySelector('[data-binding]')) {
        if (data == null) {
            parseNestedTemplate(template, data, bindingType, additionType, templateFromInput, renderEvent, options);
            return;
        }

        if (isArrayLike(data)) {
            // addOjectHash(data);
            ////Burası kapatıldı.
            // makeReactiveArray(dataSignalStoreKey, data, null, null);
            const df = document.createDocumentFragment();
            var templateClone = template.cloneNode(true);
            for (let i = 0; i < data.length; i++) {
                const tmp = templateClone.cloneNode(true);
                ////Burası Eklendi.20251020-1407
                if (template.content.querySelector('[data-binding]')) {
                    if (bindingType != 'One-Way') {
                        ////false yapıldı.
                        reactiveSignalProperty(dataSignalStoreKey, data, i, false);
                    }
                    // Eğer context PRIMITIVE ise index ile signal bağla
                    if (typeof data[i] !== "object" || data[i] === null) {
                        dataBindingToElement(dataSignalStoreKey, tmp, data, bindingType, renderEvent, true, i); // primitive branch
                    } else {
                        // Eğer context OBJECT ise, doğrudan context olarak geçir (eski yol)
                        dataBindingToElement(dataSignalStoreKey, tmp, data[i], bindingType, renderEvent, true); // object branch
                    }
                }
                parseNestedTemplate(tmp, data[i], bindingType, additionType, templateFromInput, renderEvent, options)

                if (additionType == "prepend") {
                    df.prepend(tmp.content);
                } else if (additionType == "append") {
                    df.append(tmp.content);
                } else if (additionType == "appendChild") {
                    df.appendChild(tmp.content);
                } else {
                    df.appendChild(tmp.content);
                }
                ////Burası Eklendi.
                tmp.removeAttribute("data-binding");
            }

            template.innerHTML = "";
            template.content.appendChild(df);
            return;
        }

        ////Burası Eklendi.20251020-1407
        if (!template.content.querySelector('[data-binding]')) {
            parseNestedTemplate(template, data, bindingType, additionType, templateFromInput, renderEvent, options);
            return;
        }

        dataBindingToElement(dataSignalStoreKey, template, data, bindingType, renderEvent, true);
        parseNestedTemplate(template, data, bindingType, additionType, templateFromInput, renderEvent, options)
    }

    function parseNestedTemplate(template, templateData, bindingType, additionType, templateFromInput, renderEvent, options) {
        if (template.content.querySelector('[data-template]')) {
            const nodes = template.content.querySelectorAll('[data-template]');

            for (let i = 0; i < nodes.length; i++) {
                const tmp_string = nodes[i].getAttribute('data-template');
                const bindings = parseObjectKeyValue(tmp_string);

                let dt_str = null, opt_str = null, pt_str = null, ts_str = null, beforeRender_str = null, afterRender_str = null, inTemplate = options.template
                    , inData = templateData, inBindingType = bindingType, inAdditionType = additionType, inTemplateFromInput = templateFromInput, inRenderEvent;

                if (renderEvent && (renderEvent.beforeRender || renderEvent.afterRender)) {
                    inRenderEvent = {};
                    if (renderEvent.beforeRender) {
                        inRenderEvent.beforeRender = renderEvent.beforeRender;
                    }
                    if (renderEvent.afterRender) {
                        inRenderEvent.afterRender = renderEvent.afterRender;
                    }
                }

                bindings.forEach(itm => {
                    if (itm[0] == "") {
                        if (itm[1].startsWith("#") || itm[1].startsWith(".")) {
                            pt_str = itm[1];
                            return;
                        }
                        ts_str = itm[1]
                    } else if (itm[0] == "data") {
                        dt_str = itm[1];
                    } else if (itm[0] == "options") {
                        opt_str = itm[1];
                    } else if (itm[0] == "beforeRender") {
                        beforeRender_str = itm[1];
                    } else if (itm[0] == "afterRender") {
                        afterRender_str = itm[1];
                    }
                });

                if (ts_str && options.templates && isPlainObject(options.templates) && options.templates[ts_str]) {
                    let inMainTemplate = getTemplateFromTemplates(ts_str, options);

                    inTemplate = inMainTemplate.inTemplate;
                    inData = inMainTemplate.inData;
                    inBindingType = inMainTemplate.inBindingType;
                    inAdditionType = inMainTemplate.inAdditionType;
                    inTemplateFromInput = inMainTemplate.inTemplateFromInput;

                    if (inMainTemplate.beforeRender || inMainTemplate.afterRender) {
                        if (!inRenderEvent) inRenderEvent = {};
                        if (inMainTemplate.beforeRender) {
                            inRenderEvent.beforeRender = inMainTemplate.beforeRender;
                        }

                        if (inMainTemplate.afterRender) {
                            inRenderEvent.afterRender = inMainTemplate.afterRender;
                        }
                    }
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

                    if (toptions.beforeRender || toptions.afterRender) {
                        if (!inRenderEvent) inRenderEvent = {};
                        if (toptions.beforeRender) {
                            inRenderEvent.beforeRender = toptions.beforeRender;
                        }

                        if (toptions.afterRender) {
                            inRenderEvent.afterRender = toptions.afterRender;
                        }
                    }
                }

                if (pt_str) {
                    inTemplate = pt_str;
                }

                if (dt_str) {
                    inData = getValue(inData, dt_str);
                }

                if (beforeRender_str || afterRender_str) {
                    if (!inRenderEvent) inRenderEvent = {};

                    if (beforeRender_str) {
                        inRenderEvent.beforeRender = beforeRender_str;
                    }

                    if (afterRender_str) {
                        inRenderEvent.afterRender = afterRender_str;
                    }
                }

                let nestedtemplate = processTemplate(inTemplate, inData, inBindingType, inAdditionType, templateFromInput, inRenderEvent, options);

                if (inAdditionType == "prepend") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.prepend(nestedtemplate.content);
                    } else {
                        nodes[i].prepend(nestedtemplate.content);
                    }
                } else if (inAdditionType == "append") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.append(nestedtemplate.content);
                    } else {
                        nodes[i].append(nestedtemplate.content);
                    }
                } else if (inAdditionType == "before") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.before(nestedtemplate.content);
                    } else {
                        nodes[i].before(nestedtemplate.content);
                    }
                } else if (inAdditionType == "after") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.after(nestedtemplate.content);
                    } else {
                        nodes[i].after(nestedtemplate.content);
                    }
                } else if (inAdditionType == "appendChild") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.appendChild(nestedtemplate.content);
                    } else {
                        nodes[i].appendChild(nestedtemplate.content);
                    }
                } else if (inAdditionType == "innerHTML") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].innerHTML = "";
                        nodes[i].content.append(nestedtemplate.content);
                    } else {
                        nodes[i].innerHTML = "";
                        nodes[i].append(nestedtemplate.content);
                    }
                } else if (inAdditionType == "outerHTML") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].outerHTML = nestedtemplate.innerHTML;
                    } else {
                        nodes[i].outerHTML = nestedtemplate.innerHTML;
                    }
                } else if (inAdditionType == "textContent") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].content.textContent = nestedtemplate.content.textContent;
                    } else {
                        nodes[i].textContent = nestedtemplate.content.textContent;
                    }
                } else if (inAdditionType == "replaceWith") {
                    if (nodes[i].tagName == "TEMPLATE") {
                        nodes[i].replaceWith(nestedtemplate);
                    } else {
                        nodes[i].replaceWith(nestedtemplate.content);
                    }
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