
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Cloud.svelte generated by Svelte v3.21.0 */

    const file = "src/Cloud.svelte";

    function create_fragment(ctx) {
    	let div10;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div8;
    	let t8;
    	let div9;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div8 = element("div");
    			t8 = space();
    			div9 = element("div");
    			attr_dev(div0, "class", "cloud foreground svelte-y0ou9h");
    			add_location(div0, file, 262, 2, 8676);
    			attr_dev(div1, "class", "cloud background svelte-y0ou9h");
    			add_location(div1, file, 263, 2, 8711);
    			attr_dev(div2, "class", "cloud foreground svelte-y0ou9h");
    			add_location(div2, file, 264, 2, 8746);
    			attr_dev(div3, "class", "cloud background svelte-y0ou9h");
    			add_location(div3, file, 265, 2, 8781);
    			attr_dev(div4, "class", "cloud foreground svelte-y0ou9h");
    			add_location(div4, file, 266, 2, 8816);
    			attr_dev(div5, "class", "cloud background svelte-y0ou9h");
    			add_location(div5, file, 267, 2, 8851);
    			attr_dev(div6, "class", "cloud background svelte-y0ou9h");
    			add_location(div6, file, 268, 2, 8886);
    			attr_dev(div7, "class", "cloud foreground svelte-y0ou9h");
    			add_location(div7, file, 269, 2, 8921);
    			attr_dev(div8, "class", "cloud background svelte-y0ou9h");
    			add_location(div8, file, 270, 2, 8956);
    			attr_dev(div9, "class", "cloud background svelte-y0ou9h");
    			add_location(div9, file, 271, 2, 8991);
    			attr_dev(div10, "id", "clouds");
    			attr_dev(div10, "class", "svelte-y0ou9h");
    			add_location(div10, file, 261, 0, 8656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div0);
    			append_dev(div10, t0);
    			append_dev(div10, div1);
    			append_dev(div10, t1);
    			append_dev(div10, div2);
    			append_dev(div10, t2);
    			append_dev(div10, div3);
    			append_dev(div10, t3);
    			append_dev(div10, div4);
    			append_dev(div10, t4);
    			append_dev(div10, div5);
    			append_dev(div10, t5);
    			append_dev(div10, div6);
    			append_dev(div10, t6);
    			append_dev(div10, div7);
    			append_dev(div10, t7);
    			append_dev(div10, div8);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cloud> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cloud", $$slots, []);
    	return [];
    }

    class Cloud extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cloud",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var e=function(t,n){return (e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);})(t,n)};function t(t,n){function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}var n=function(){return (n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function r(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);}return n}function o(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{u(r.next(e));}catch(e){i(e);}}function c(e){try{u(r.throw(e));}catch(e){i(e);}}function u(e){e.done?o(e.value):new n((function(t){t(e.value);})).then(a,c);}u((r=r.apply(e,t||[])).next());}))}function i(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,c])}}}var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function c(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function u(e,t){return e(t={exports:{}},t.exports),t.exports}var s=function(e){return e&&e.Math==Math&&e},l=s("object"==typeof globalThis&&globalThis)||s("object"==typeof window&&window)||s("object"==typeof self&&self)||s("object"==typeof a&&a)||Function("return this")(),f=function(e){try{return !!e()}catch(e){return !0}},d=!f((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),p={}.propertyIsEnumerable,h=Object.getOwnPropertyDescriptor,y={f:h&&!p.call({1:2},1)?function(e){var t=h(this,e);return !!t&&t.enumerable}:p},v=function(e,t){return {enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},m={}.toString,b=function(e){return m.call(e).slice(8,-1)},g="".split,w=f((function(){return !Object("z").propertyIsEnumerable(0)}))?function(e){return "String"==b(e)?g.call(e,""):Object(e)}:Object,S=function(e){if(null==e)throw TypeError("Can't call method on "+e);return e},_=function(e){return w(S(e))},k=function(e){return "object"==typeof e?null!==e:"function"==typeof e},T=function(e,t){if(!k(e))return e;var n,r;if(t&&"function"==typeof(n=e.toString)&&!k(r=n.call(e)))return r;if("function"==typeof(n=e.valueOf)&&!k(r=n.call(e)))return r;if(!t&&"function"==typeof(n=e.toString)&&!k(r=n.call(e)))return r;throw TypeError("Can't convert object to primitive value")},I={}.hasOwnProperty,O=function(e,t){return I.call(e,t)},x=l.document,j=k(x)&&k(x.createElement),E=function(e){return j?x.createElement(e):{}},L=!d&&!f((function(){return 7!=Object.defineProperty(E("div"),"a",{get:function(){return 7}}).a})),W=Object.getOwnPropertyDescriptor,A={f:d?W:function(e,t){if(e=_(e),t=T(t,!0),L)try{return W(e,t)}catch(e){}if(O(e,t))return v(!y.f.call(e,t),e[t])}},Z=function(e){if(!k(e))throw TypeError(String(e)+" is not an object");return e},R=Object.defineProperty,K={f:d?R:function(e,t,n){if(Z(e),t=T(t,!0),Z(n),L)try{return R(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return "value"in n&&(e[t]=n.value),e}},U=d?function(e,t,n){return K.f(e,t,v(1,n))}:function(e,t,n){return e[t]=n,e},C=function(e,t){try{U(l,e,t);}catch(n){l[e]=t;}return t},G=l["__core-js_shared__"]||C("__core-js_shared__",{}),P=Function.toString;"function"!=typeof G.inspectSource&&(G.inspectSource=function(e){return P.call(e)});var X,V,F,z=G.inspectSource,Y=l.WeakMap,J="function"==typeof Y&&/native code/.test(z(Y)),N=u((function(e){(e.exports=function(e,t){return G[e]||(G[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.6.4",mode:"global",copyright:"© 2020 Denis Pushkarev (zloirock.ru)"});})),D=0,M=Math.random(),B=function(e){return "Symbol("+String(void 0===e?"":e)+")_"+(++D+M).toString(36)},q=N("keys"),H=function(e){return q[e]||(q[e]=B(e))},Q={},$=l.WeakMap;if(J){var ee=new $,te=ee.get,ne=ee.has,re=ee.set;X=function(e,t){return re.call(ee,e,t),t},V=function(e){return te.call(ee,e)||{}},F=function(e){return ne.call(ee,e)};}else {var oe=H("state");Q[oe]=!0,X=function(e,t){return U(e,oe,t),t},V=function(e){return O(e,oe)?e[oe]:{}},F=function(e){return O(e,oe)};}var ie,ae={set:X,get:V,has:F,enforce:function(e){return F(e)?V(e):X(e,{})},getterFor:function(e){return function(t){var n;if(!k(t)||(n=V(t)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return n}}},ce=u((function(e){var t=ae.get,n=ae.enforce,r=String(String).split("String");(e.exports=function(e,t,o,i){var a=!!i&&!!i.unsafe,c=!!i&&!!i.enumerable,u=!!i&&!!i.noTargetGet;"function"==typeof o&&("string"!=typeof t||O(o,"name")||U(o,"name",t),n(o).source=r.join("string"==typeof t?t:"")),e!==l?(a?!u&&e[t]&&(c=!0):delete e[t],c?e[t]=o:U(e,t,o)):c?e[t]=o:C(t,o);})(Function.prototype,"toString",(function(){return "function"==typeof this&&t(this).source||z(this)}));})),ue=l,se=function(e){return "function"==typeof e?e:void 0},le=function(e,t){return arguments.length<2?se(ue[e])||se(l[e]):ue[e]&&ue[e][t]||l[e]&&l[e][t]},fe=Math.ceil,de=Math.floor,pe=function(e){return isNaN(e=+e)?0:(e>0?de:fe)(e)},he=Math.min,ye=function(e){return e>0?he(pe(e),9007199254740991):0},ve=Math.max,me=Math.min,be=function(e){return function(t,n,r){var o,i=_(t),a=ye(i.length),c=function(e,t){var n=pe(e);return n<0?ve(n+t,0):me(n,t)}(r,a);if(e&&n!=n){for(;a>c;)if((o=i[c++])!=o)return !0}else for(;a>c;c++)if((e||c in i)&&i[c]===n)return e||c||0;return !e&&-1}},ge={includes:be(!0),indexOf:be(!1)},we=ge.indexOf,Se=function(e,t){var n,r=_(e),o=0,i=[];for(n in r)!O(Q,n)&&O(r,n)&&i.push(n);for(;t.length>o;)O(r,n=t[o++])&&(~we(i,n)||i.push(n));return i},_e=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],ke=_e.concat("length","prototype"),Te={f:Object.getOwnPropertyNames||function(e){return Se(e,ke)}},Ie={f:Object.getOwnPropertySymbols},Oe=le("Reflect","ownKeys")||function(e){var t=Te.f(Z(e)),n=Ie.f;return n?t.concat(n(e)):t},xe=function(e,t){for(var n=Oe(t),r=K.f,o=A.f,i=0;i<n.length;i++){var a=n[i];O(e,a)||r(e,a,o(t,a));}},je=/#|\.prototype\./,Ee=function(e,t){var n=We[Le(e)];return n==Ze||n!=Ae&&("function"==typeof t?f(t):!!t)},Le=Ee.normalize=function(e){return String(e).replace(je,".").toLowerCase()},We=Ee.data={},Ae=Ee.NATIVE="N",Ze=Ee.POLYFILL="P",Re=Ee,Ke=A.f,Ue=function(e,t){var n,r,o,i,a,c=e.target,u=e.global,s=e.stat;if(n=u?l:s?l[c]||C(c,{}):(l[c]||{}).prototype)for(r in t){if(i=t[r],o=e.noTargetGet?(a=Ke(n,r))&&a.value:n[r],!Re(u?r:c+(s?".":"#")+r,e.forced)&&void 0!==o){if(typeof i==typeof o)continue;xe(i,o);}(e.sham||o&&o.sham)&&U(i,"sham",!0),ce(n,r,i,e);}},Ce=!!Object.getOwnPropertySymbols&&!f((function(){return !String(Symbol())})),Ge=Ce&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,Pe=N("wks"),Xe=l.Symbol,Ve=Ge?Xe:Xe&&Xe.withoutSetter||B,Fe=function(e){return O(Pe,e)||(Ce&&O(Xe,e)?Pe[e]=Xe[e]:Pe[e]=Ve("Symbol."+e)),Pe[e]},ze=Fe("match"),Ye=function(e){if(function(e){var t;return k(e)&&(void 0!==(t=e[ze])?!!t:"RegExp"==b(e))}(e))throw TypeError("The method doesn't accept regular expressions");return e},Je=Fe("match"),Ne=function(e){var t=/./;try{"/./"[e](t);}catch(n){try{return t[Je]=!1,"/./"[e](t)}catch(e){}}return !1},De=A.f,Me="".startsWith,Be=Math.min,qe=Ne("startsWith"),He=!(qe||(ie=De(String.prototype,"startsWith"),!ie||ie.writable));Ue({target:"String",proto:!0,forced:!He&&!qe},{startsWith:function(e){var t=String(S(this));Ye(e);var n=ye(Be(arguments.length>1?arguments[1]:void 0,t.length)),r=String(e);return Me?Me.call(t,r,n):t.slice(n,n+r.length)===r}});var Qe,$e,et,tt=function(e){if("function"!=typeof e)throw TypeError(String(e)+" is not a function");return e},nt=function(e,t,n){if(tt(e),void 0===t)return e;switch(n){case 0:return function(){return e.call(t)};case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}},rt=Function.call,ot=function(e,t,n){return nt(rt,l[e].prototype[t],n)},it=(ot("String","startsWith"),function(e){return function(t,n){var r,o,i=String(S(t)),a=pe(n),c=i.length;return a<0||a>=c?e?"":void 0:(r=i.charCodeAt(a))<55296||r>56319||a+1===c||(o=i.charCodeAt(a+1))<56320||o>57343?e?i.charAt(a):r:e?i.slice(a,a+2):o-56320+(r-55296<<10)+65536}}),at={codeAt:it(!1),charAt:it(!0)},ct=function(e){return Object(S(e))},ut=!f((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),st=H("IE_PROTO"),lt=Object.prototype,ft=ut?Object.getPrototypeOf:function(e){return e=ct(e),O(e,st)?e[st]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?lt:null},dt=Fe("iterator"),pt=!1;[].keys&&("next"in(et=[].keys())?($e=ft(ft(et)))!==Object.prototype&&(Qe=$e):pt=!0),null==Qe&&(Qe={}),O(Qe,dt)||U(Qe,dt,(function(){return this}));var ht,yt={IteratorPrototype:Qe,BUGGY_SAFARI_ITERATORS:pt},vt=Object.keys||function(e){return Se(e,_e)},mt=d?Object.defineProperties:function(e,t){Z(e);for(var n,r=vt(t),o=r.length,i=0;o>i;)K.f(e,n=r[i++],t[n]);return e},bt=le("document","documentElement"),gt=H("IE_PROTO"),wt=function(){},St=function(e){return "<script>"+e+"<\/script>"},_t=function(){try{ht=document.domain&&new ActiveXObject("htmlfile");}catch(e){}var e,t;_t=ht?function(e){e.write(St("")),e.close();var t=e.parentWindow.Object;return e=null,t}(ht):((t=E("iframe")).style.display="none",bt.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(St("document.F=Object")),e.close(),e.F);for(var n=_e.length;n--;)delete _t.prototype[_e[n]];return _t()};Q[gt]=!0;var kt=Object.create||function(e,t){var n;return null!==e?(wt.prototype=Z(e),n=new wt,wt.prototype=null,n[gt]=e):n=_t(),void 0===t?n:mt(n,t)},Tt=K.f,It=Fe("toStringTag"),Ot=function(e,t,n){e&&!O(e=n?e:e.prototype,It)&&Tt(e,It,{configurable:!0,value:t});},xt={},jt=yt.IteratorPrototype,Et=function(){return this},Lt=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),t=n instanceof Array;}catch(e){}return function(n,r){return Z(n),function(e){if(!k(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(r),t?e.call(n,r):n.__proto__=r,n}}():void 0),Wt=yt.IteratorPrototype,At=yt.BUGGY_SAFARI_ITERATORS,Zt=Fe("iterator"),Rt=function(){return this},Kt=function(e,t,n,r,o,i,a){!function(e,t,n){var r=t+" Iterator";e.prototype=kt(jt,{next:v(1,n)}),Ot(e,r,!1),xt[r]=Et;}(n,t,r);var c,u,s,l=function(e){if(e===o&&y)return y;if(!At&&e in p)return p[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},f=t+" Iterator",d=!1,p=e.prototype,h=p[Zt]||p["@@iterator"]||o&&p[o],y=!At&&h||l(o),m="Array"==t&&p.entries||h;if(m&&(c=ft(m.call(new e)),Wt!==Object.prototype&&c.next&&(ft(c)!==Wt&&(Lt?Lt(c,Wt):"function"!=typeof c[Zt]&&U(c,Zt,Rt)),Ot(c,f,!0))),"values"==o&&h&&"values"!==h.name&&(d=!0,y=function(){return h.call(this)}),p[Zt]!==y&&U(p,Zt,y),xt[t]=y,o)if(u={values:l("values"),keys:i?y:l("keys"),entries:l("entries")},a)for(s in u)(At||d||!(s in p))&&ce(p,s,u[s]);else Ue({target:t,proto:!0,forced:At||d},u);return u},Ut=at.charAt,Ct=ae.set,Gt=ae.getterFor("String Iterator");Kt(String,"String",(function(e){Ct(this,{type:"String Iterator",string:String(e),index:0});}),(function(){var e,t=Gt(this),n=t.string,r=t.index;return r>=n.length?{value:void 0,done:!0}:(e=Ut(n,r),t.index+=e.length,{value:e,done:!1})}));var Pt=function(e,t,n,r){try{return r?t(Z(n)[0],n[1]):t(n)}catch(t){var o=e.return;throw void 0!==o&&Z(o.call(e)),t}},Xt=Fe("iterator"),Vt=Array.prototype,Ft=function(e){return void 0!==e&&(xt.Array===e||Vt[Xt]===e)},zt=function(e,t,n){var r=T(t);r in e?K.f(e,r,v(0,n)):e[r]=n;},Yt={};Yt[Fe("toStringTag")]="z";var Jt="[object z]"===String(Yt),Nt=Fe("toStringTag"),Dt="Arguments"==b(function(){return arguments}()),Mt=Jt?b:function(e){var t,n,r;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=Object(e),Nt))?n:Dt?b(t):"Object"==(r=b(t))&&"function"==typeof t.callee?"Arguments":r},Bt=Fe("iterator"),qt=function(e){if(null!=e)return e[Bt]||e["@@iterator"]||xt[Mt(e)]},Ht=Fe("iterator"),Qt=!1;try{var $t=0,en={next:function(){return {done:!!$t++}},return:function(){Qt=!0;}};en[Ht]=function(){return this},Array.from(en,(function(){throw 2}));}catch(e){}var tn=function(e,t){if(!t&&!Qt)return !1;var n=!1;try{var r={};r[Ht]=function(){return {next:function(){return {done:n=!0}}}},e(r);}catch(e){}return n},nn=!tn((function(e){Array.from(e);}));Ue({target:"Array",stat:!0,forced:nn},{from:function(e){var t,n,r,o,i,a,c=ct(e),u="function"==typeof this?this:Array,s=arguments.length,l=s>1?arguments[1]:void 0,f=void 0!==l,d=qt(c),p=0;if(f&&(l=nt(l,s>2?arguments[2]:void 0,2)),null==d||u==Array&&Ft(d))for(n=new u(t=ye(c.length));t>p;p++)a=f?l(c[p],p):c[p],zt(n,p,a);else for(i=(o=d.call(c)).next,n=new u;!(r=i.call(o)).done;p++)a=f?Pt(o,l,[r.value,p],!0):r.value,zt(n,p,a);return n.length=p,n}});ue.Array.from;var rn,on="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView,an=K.f,cn=l.Int8Array,un=cn&&cn.prototype,sn=l.Uint8ClampedArray,ln=sn&&sn.prototype,fn=cn&&ft(cn),dn=un&&ft(un),pn=Object.prototype,hn=pn.isPrototypeOf,yn=Fe("toStringTag"),vn=B("TYPED_ARRAY_TAG"),mn=on&&!!Lt&&"Opera"!==Mt(l.opera),bn={Int8Array:1,Uint8Array:1,Uint8ClampedArray:1,Int16Array:2,Uint16Array:2,Int32Array:4,Uint32Array:4,Float32Array:4,Float64Array:8},gn=function(e){return k(e)&&O(bn,Mt(e))};for(rn in bn)l[rn]||(mn=!1);if((!mn||"function"!=typeof fn||fn===Function.prototype)&&(fn=function(){throw TypeError("Incorrect invocation")},mn))for(rn in bn)l[rn]&&Lt(l[rn],fn);if((!mn||!dn||dn===pn)&&(dn=fn.prototype,mn))for(rn in bn)l[rn]&&Lt(l[rn].prototype,dn);if(mn&&ft(ln)!==dn&&Lt(ln,dn),d&&!O(dn,yn))for(rn in an(dn,yn,{get:function(){return k(this)?this[vn]:void 0}}),bn)l[rn]&&U(l[rn],vn,rn);var wn=function(e){if(gn(e))return e;throw TypeError("Target is not a typed array")},Sn=function(e){if(Lt){if(hn.call(fn,e))return e}else for(var t in bn)if(O(bn,rn)){var n=l[t];if(n&&(e===n||hn.call(n,e)))return e}throw TypeError("Target is not a typed array constructor")},_n=function(e,t,n){if(d){if(n)for(var r in bn){var o=l[r];o&&O(o.prototype,e)&&delete o.prototype[e];}dn[e]&&!n||ce(dn,e,n?t:mn&&un[e]||t);}},kn=Fe("species"),Tn=wn,In=Sn,On=[].slice;_n("slice",(function(e,t){for(var n=On.call(Tn(this),e,t),r=function(e,t){var n,r=Z(e).constructor;return void 0===r||null==(n=Z(r)[kn])?t:tt(n)}(this,this.constructor),o=0,i=n.length,a=new(In(r))(i);i>o;)a[o]=n[o++];return a}),f((function(){new Int8Array(1).slice();})));var xn=Fe("unscopables"),jn=Array.prototype;null==jn[xn]&&K.f(jn,xn,{configurable:!0,value:kt(null)});var En=function(e){jn[xn][e]=!0;},Ln=Object.defineProperty,Wn={},An=function(e){throw e},Zn=ge.includes,Rn=function(e,t){if(O(Wn,e))return Wn[e];t||(t={});var n=[][e],r=!!O(t,"ACCESSORS")&&t.ACCESSORS,o=O(t,0)?t[0]:An,i=O(t,1)?t[1]:void 0;return Wn[e]=!!n&&!f((function(){if(r&&!d)return !0;var e={length:-1};r?Ln(e,1,{enumerable:!0,get:An}):e[1]=1,n.call(e,o,i);}))}("indexOf",{ACCESSORS:!0,1:0});Ue({target:"Array",proto:!0,forced:!Rn},{includes:function(e){return Zn(this,e,arguments.length>1?arguments[1]:void 0)}}),En("includes");ot("Array","includes");Ue({target:"String",proto:!0,forced:!Ne("includes")},{includes:function(e){return !!~String(S(this)).indexOf(Ye(e),arguments.length>1?arguments[1]:void 0)}});ot("String","includes");var Kn=!f((function(){return Object.isExtensible(Object.preventExtensions({}))})),Un=u((function(e){var t=K.f,n=B("meta"),r=0,o=Object.isExtensible||function(){return !0},i=function(e){t(e,n,{value:{objectID:"O"+ ++r,weakData:{}}});},a=e.exports={REQUIRED:!1,fastKey:function(e,t){if(!k(e))return "symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!O(e,n)){if(!o(e))return "F";if(!t)return "E";i(e);}return e[n].objectID},getWeakData:function(e,t){if(!O(e,n)){if(!o(e))return !0;if(!t)return !1;i(e);}return e[n].weakData},onFreeze:function(e){return Kn&&a.REQUIRED&&o(e)&&!O(e,n)&&i(e),e}};Q[n]=!0;})),Cn=(Un.REQUIRED,Un.fastKey,Un.getWeakData,Un.onFreeze,u((function(e){var t=function(e,t){this.stopped=e,this.result=t;};(e.exports=function(e,n,r,o,i){var a,c,u,s,l,f,d,p=nt(n,r,o?2:1);if(i)a=e;else {if("function"!=typeof(c=qt(e)))throw TypeError("Target is not iterable");if(Ft(c)){for(u=0,s=ye(e.length);s>u;u++)if((l=o?p(Z(d=e[u])[0],d[1]):p(e[u]))&&l instanceof t)return l;return new t(!1)}a=c.call(e);}for(f=a.next;!(d=f.call(a)).done;)if("object"==typeof(l=Pt(a,p,d.value,o))&&l&&l instanceof t)return l;return new t(!1)}).stop=function(e){return new t(!0,e)};}))),Gn=function(e,t,n){if(!(e instanceof t))throw TypeError("Incorrect "+(n?n+" ":"")+"invocation");return e},Pn=function(e,t,n){for(var r in t)ce(e,r,t[r],n);return e},Xn=Fe("species"),Vn=K.f,Fn=Un.fastKey,zn=ae.set,Yn=ae.getterFor,Jn=(function(e,t,n){var r=-1!==e.indexOf("Map"),o=-1!==e.indexOf("Weak"),i=r?"set":"add",a=l[e],c=a&&a.prototype,u=a,s={},d=function(e){var t=c[e];ce(c,e,"add"==e?function(e){return t.call(this,0===e?0:e),this}:"delete"==e?function(e){return !(o&&!k(e))&&t.call(this,0===e?0:e)}:"get"==e?function(e){return o&&!k(e)?void 0:t.call(this,0===e?0:e)}:"has"==e?function(e){return !(o&&!k(e))&&t.call(this,0===e?0:e)}:function(e,n){return t.call(this,0===e?0:e,n),this});};if(Re(e,"function"!=typeof a||!(o||c.forEach&&!f((function(){(new a).entries().next();})))))u=n.getConstructor(t,e,r,i),Un.REQUIRED=!0;else if(Re(e,!0)){var p=new u,h=p[i](o?{}:-0,1)!=p,y=f((function(){p.has(1);})),v=tn((function(e){new a(e);})),m=!o&&f((function(){for(var e=new a,t=5;t--;)e[i](t,t);return !e.has(-0)}));v||((u=t((function(t,n){Gn(t,u,e);var o=function(e,t,n){var r,o;return Lt&&"function"==typeof(r=t.constructor)&&r!==n&&k(o=r.prototype)&&o!==n.prototype&&Lt(e,o),e}(new a,t,u);return null!=n&&Cn(n,o[i],o,r),o}))).prototype=c,c.constructor=u),(y||m)&&(d("delete"),d("has"),r&&d("get")),(m||h)&&d(i),o&&c.clear&&delete c.clear;}s[e]=u,Ue({global:!0,forced:u!=a},s),Ot(u,e),o||n.setStrong(u,e,r);}("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),{getConstructor:function(e,t,n,r){var o=e((function(e,i){Gn(e,o,t),zn(e,{type:t,index:kt(null),first:void 0,last:void 0,size:0}),d||(e.size=0),null!=i&&Cn(i,e[r],e,n);})),i=Yn(t),a=function(e,t,n){var r,o,a=i(e),u=c(e,t);return u?u.value=n:(a.last=u={index:o=Fn(t,!0),key:t,value:n,previous:r=a.last,next:void 0,removed:!1},a.first||(a.first=u),r&&(r.next=u),d?a.size++:e.size++,"F"!==o&&(a.index[o]=u)),e},c=function(e,t){var n,r=i(e),o=Fn(t);if("F"!==o)return r.index[o];for(n=r.first;n;n=n.next)if(n.key==t)return n};return Pn(o.prototype,{clear:function(){for(var e=i(this),t=e.index,n=e.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete t[n.index],n=n.next;e.first=e.last=void 0,d?e.size=0:this.size=0;},delete:function(e){var t=i(this),n=c(this,e);if(n){var r=n.next,o=n.previous;delete t.index[n.index],n.removed=!0,o&&(o.next=r),r&&(r.previous=o),t.first==n&&(t.first=r),t.last==n&&(t.last=o),d?t.size--:this.size--;}return !!n},forEach:function(e){for(var t,n=i(this),r=nt(e,arguments.length>1?arguments[1]:void 0,3);t=t?t.next:n.first;)for(r(t.value,t.key,this);t&&t.removed;)t=t.previous;},has:function(e){return !!c(this,e)}}),Pn(o.prototype,n?{get:function(e){var t=c(this,e);return t&&t.value},set:function(e,t){return a(this,0===e?0:e,t)}}:{add:function(e){return a(this,e=0===e?0:e,e)}}),d&&Vn(o.prototype,"size",{get:function(){return i(this).size}}),o},setStrong:function(e,t,n){var r=t+" Iterator",o=Yn(t),i=Yn(r);Kt(e,t,(function(e,t){zn(this,{type:r,target:e,state:o(e),kind:t,last:void 0});}),(function(){for(var e=i(this),t=e.kind,n=e.last;n&&n.removed;)n=n.previous;return e.target&&(e.last=n=n?n.next:e.state.first)?"keys"==t?{value:n.key,done:!1}:"values"==t?{value:n.value,done:!1}:{value:[n.key,n.value],done:!1}:(e.target=void 0,{value:void 0,done:!0})}),n?"entries":"values",!n,!0),function(e){var t=le(e),n=K.f;d&&t&&!t[Xn]&&n(t,Xn,{configurable:!0,get:function(){return this}});}(t);}}),Jt?{}.toString:function(){return "[object "+Mt(this)+"]"});Jt||ce(Object.prototype,"toString",Jn,{unsafe:!0});var Nn={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},Dn=ae.set,Mn=ae.getterFor("Array Iterator"),Bn=Kt(Array,"Array",(function(e,t){Dn(this,{type:"Array Iterator",target:_(e),index:0,kind:t});}),(function(){var e=Mn(this),t=e.target,n=e.kind,r=e.index++;return !t||r>=t.length?(e.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:r,done:!1}:"values"==n?{value:t[r],done:!1}:{value:[r,t[r]],done:!1}}),"values");xt.Arguments=xt.Array,En("keys"),En("values"),En("entries");var qn=Fe("iterator"),Hn=Fe("toStringTag"),Qn=Bn.values;for(var $n in Nn){var er=l[$n],tr=er&&er.prototype;if(tr){if(tr[qn]!==Qn)try{U(tr,qn,Qn);}catch(e){tr[qn]=Qn;}if(tr[Hn]||U(tr,Hn,$n),Nn[$n])for(var nr in Bn)if(tr[nr]!==Bn[nr])try{U(tr,nr,Bn[nr]);}catch(e){tr[nr]=Bn[nr];}}}ue.Set;function rr(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}var or=setTimeout;function ir(e){return Boolean(e&&void 0!==e.length)}function ar(){}function cr(e){if(!(this instanceof cr))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],pr(e,this);}function ur(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,cr._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value);}catch(e){return void lr(t.promise,e)}sr(t.promise,r);}else (1===e._state?sr:lr)(t.promise,e._value);}))):e._deferreds.push(t);}function sr(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof cr)return e._state=3,e._value=t,void fr(e);if("function"==typeof n)return void pr((r=n,o=t,function(){r.apply(o,arguments);}),e)}e._state=1,e._value=t,fr(e);}catch(t){lr(e,t);}var r,o;}function lr(e,t){e._state=2,e._value=t,fr(e);}function fr(e){2===e._state&&0===e._deferreds.length&&cr._immediateFn((function(){e._handled||cr._unhandledRejectionFn(e._value);}));for(var t=0,n=e._deferreds.length;t<n;t++)ur(e,e._deferreds[t]);e._deferreds=null;}function dr(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n;}function pr(e,t){var n=!1;try{e((function(e){n||(n=!0,sr(t,e));}),(function(e){n||(n=!0,lr(t,e));}));}catch(e){if(n)return;n=!0,lr(t,e);}}cr.prototype.catch=function(e){return this.then(null,e)},cr.prototype.then=function(e,t){var n=new this.constructor(ar);return ur(this,new dr(e,t,n)),n},cr.prototype.finally=rr,cr.all=function(e){return new cr((function(t,n){if(!ir(e))return n(new TypeError("Promise.all accepts an array"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void c.call(a,(function(t){i(e,t);}),n)}r[e]=a,0==--o&&t(r);}catch(e){n(e);}}for(var a=0;a<r.length;a++)i(a,r[a]);}))},cr.resolve=function(e){return e&&"object"==typeof e&&e.constructor===cr?e:new cr((function(t){t(e);}))},cr.reject=function(e){return new cr((function(t,n){n(e);}))},cr.race=function(e){return new cr((function(t,n){if(!ir(e))return n(new TypeError("Promise.race accepts an array"));for(var r=0,o=e.length;r<o;r++)cr.resolve(e[r]).then(t,n);}))},cr._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e);}||function(e){or(e,0);},cr._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e);};var hr=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"Promise"in hr?hr.Promise.prototype.finally||(hr.Promise.prototype.finally=rr):hr.Promise=cr,function(e){function t(){}function n(e,t){if(e=void 0===e?"utf-8":e,t=void 0===t?{fatal:!1}:t,-1==r.indexOf(e.toLowerCase()))throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('"+e+"') is invalid.");if(t.fatal)throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.")}if(e.TextEncoder&&e.TextDecoder)return !1;var r=["utf-8","utf8","unicode-1-1-utf-8"];Object.defineProperty(t.prototype,"encoding",{value:"utf-8"}),t.prototype.encode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to encode: the 'stream' option is unsupported.");t=0;for(var n=e.length,r=0,o=Math.max(32,n+(n>>1)+7),i=new Uint8Array(o>>3<<3);t<n;){var a=e.charCodeAt(t++);if(55296<=a&&56319>=a){if(t<n){var c=e.charCodeAt(t);56320==(64512&c)&&(++t,a=((1023&a)<<10)+(1023&c)+65536);}if(55296<=a&&56319>=a)continue}if(r+4>i.length&&(o+=8,o=(o*=1+t/e.length*2)>>3<<3,(c=new Uint8Array(o)).set(i),i=c),0==(4294967168&a))i[r++]=a;else {if(0==(4294965248&a))i[r++]=a>>6&31|192;else if(0==(4294901760&a))i[r++]=a>>12&15|224,i[r++]=a>>6&63|128;else {if(0!=(4292870144&a))continue;i[r++]=a>>18&7|240,i[r++]=a>>12&63|128,i[r++]=a>>6&63|128;}i[r++]=63&a|128;}}return i.slice?i.slice(0,r):i.subarray(0,r)},Object.defineProperty(n.prototype,"encoding",{value:"utf-8"}),Object.defineProperty(n.prototype,"fatal",{value:!1}),Object.defineProperty(n.prototype,"ignoreBOM",{value:!1}),n.prototype.decode=function(e,t){if((t=void 0===t?{stream:!1}:t).stream)throw Error("Failed to decode: the 'stream' option is unsupported.");e.buffer instanceof ArrayBuffer&&(e=e.buffer),e=new Uint8Array(e),t=0;for(var n=[],r=[];;){var o=t<e.length;if(!o||65536&t){if(r.push(String.fromCharCode.apply(null,n)),!o)return r.join("");n=[],e=e.subarray(t),t=0;}if(0===(o=e[t++]))n.push(0);else if(0==(128&o))n.push(o);else if(192==(224&o)){var i=63&e[t++];n.push((31&o)<<6|i);}else if(224==(240&o)){i=63&e[t++];var a=63&e[t++];n.push((31&o)<<12|i<<6|a);}else if(240==(248&o)){65535<(o=(7&o)<<18|(i=63&e[t++])<<12|(a=63&e[t++])<<6|63&e[t++])&&(o-=65536,n.push(o>>>10&1023|55296),o=56320|1023&o),n.push(o);}}},e.TextEncoder=t,e.TextDecoder=n;}("undefined"!=typeof window?window:a),function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function r(e){return (r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function o(e,t){return (o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function i(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function c(e,t,n){return (c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var o=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=r(e)););return e}(e,t);if(o){var i=Object.getOwnPropertyDescriptor(o,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}var u=function(){function t(){e(this,t),Object.defineProperty(this,"listeners",{value:{},writable:!0,configurable:!0});}return n(t,[{key:"addEventListener",value:function(e,t){e in this.listeners||(this.listeners[e]=[]),this.listeners[e].push(t);}},{key:"removeEventListener",value:function(e,t){if(e in this.listeners)for(var n=this.listeners[e],r=0,o=n.length;r<o;r++)if(n[r]===t)return void n.splice(r,1)}},{key:"dispatchEvent",value:function(e){var t=this;if(e.type in this.listeners){for(var n=function(n){setTimeout((function(){return n.call(t,e)}));},r=this.listeners[e.type],o=0,i=r.length;o<i;o++)n(r[o]);return !e.defaultPrevented}}}]),t}(),s=function(t){function a(){var t;return e(this,a),(t=function(e,t){return !t||"object"!=typeof t&&"function"!=typeof t?i(e):t}(this,r(a).call(this))).listeners||u.call(i(t)),Object.defineProperty(i(t),"aborted",{value:!1,writable:!0,configurable:!0}),Object.defineProperty(i(t),"onabort",{value:null,writable:!0,configurable:!0}),t}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t);}(a,t),n(a,[{key:"toString",value:function(){return "[object AbortSignal]"}},{key:"dispatchEvent",value:function(e){"abort"===e.type&&(this.aborted=!0,"function"==typeof this.onabort&&this.onabort.call(this,e)),c(r(a.prototype),"dispatchEvent",this).call(this,e);}}]),a}(u),l=function(){function t(){e(this,t),Object.defineProperty(this,"signal",{value:new s,writable:!0,configurable:!0});}return n(t,[{key:"abort",value:function(){var e;try{e=new Event("abort");}catch(t){"undefined"!=typeof document?document.createEvent?(e=document.createEvent("Event")).initEvent("abort",!1,!1):(e=document.createEventObject()).type="abort":e={type:"abort",bubbles:!1,cancelable:!1};}this.signal.dispatchEvent(e);}},{key:"toString",value:function(){return "[object AbortController]"}}]),t}();"undefined"!=typeof Symbol&&Symbol.toStringTag&&(l.prototype[Symbol.toStringTag]="AbortController",s.prototype[Symbol.toStringTag]="AbortSignal"),function(e){(function(e){return e.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL?(console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill"),!0):"function"==typeof e.Request&&!e.Request.prototype.hasOwnProperty("signal")||!e.AbortController})(e)&&(e.AbortController=l,e.AbortSignal=s);}("undefined"!=typeof self?self:a);}();var yr=u((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var r=e.locked.get(t);void 0===r?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(r.unshift(n),e.locked.set(t,r));},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,r){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n());}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var r=n.pop();e.locked.set(t,n),void 0!==r&&setTimeout(r,0);}else e.locked.delete(t);};}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return n.getInstance()};}));c(yr);var vr=c(u((function(e,t){var n=a&&a.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{u(r.next(e));}catch(e){i(e);}}function c(e){try{u(r.throw(e));}catch(e){i(e);}}function u(e){e.done?o(e.value):new n((function(t){t(e.value);})).then(a,c);}u((r=r.apply(e,t||[])).next());}))},r=a&&a.__generator||function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,c])}}};Object.defineProperty(t,"__esModule",{value:!0});function o(e){return new Promise((function(t){return setTimeout(t,e)}))}function i(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",r=0;r<e;r++){n+=t[Math.floor(Math.random()*t.length)];}return n}var c=function(){function e(){this.acquiredIatSet=new Set,this.id=Date.now().toString()+i(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),void 0===e.waiters&&(e.waiters=[]);}return e.prototype.acquireLock=function(t,a){return void 0===a&&(a=5e3),n(this,void 0,void 0,(function(){var n,c,u,s,l,f;return r(this,(function(r){switch(r.label){case 0:n=Date.now()+i(4),c=Date.now()+a,u="browser-tabs-lock-key-"+t,s=window.localStorage,r.label=1;case 1:return Date.now()<c?[4,o(30)]:[3,8];case 2:return r.sent(),null!==s.getItem(u)?[3,5]:(l=this.id+"-"+t+"-"+n,[4,o(Math.floor(25*Math.random()))]);case 3:return r.sent(),s.setItem(u,JSON.stringify({id:this.id,iat:n,timeoutKey:l,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,o(30)];case 4:return r.sent(),null!==(f=s.getItem(u))&&(f=JSON.parse(f)).id===this.id&&f.iat===n?(this.acquiredIatSet.add(n),this.refreshLockWhileAcquired(u,n),[2,!0]):[3,7];case 5:return e.lockCorrector(),[4,this.waitForSomethingToChange(c)];case 6:r.sent(),r.label=7;case 7:return n=Date.now()+i(4),[3,1];case 8:return [2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return n(this,void 0,void 0,(function(){var o=this;return r(this,(function(i){return setTimeout((function(){return n(o,void 0,void 0,(function(){var n,o;return r(this,(function(r){switch(r.label){case 0:return [4,yr.default().lock(t)];case 1:return r.sent(),this.acquiredIatSet.has(t)?(n=window.localStorage,null===(o=n.getItem(e))?(yr.default().unlock(t),[2]):((o=JSON.parse(o)).timeRefreshed=Date.now(),n.setItem(e,JSON.stringify(o)),yr.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(yr.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return n(this,void 0,void 0,(function(){return r(this,(function(n){switch(n.label){case 0:return [4,new Promise((function(n){var r=!1,o=Date.now(),i=!1;function a(){if(i||(window.removeEventListener("storage",a),e.removeFromWaiting(a),clearTimeout(c),i=!0),!r){r=!0;var t=50-(Date.now()-o);t>0?setTimeout(n,t):n();}}window.addEventListener("storage",a),e.addToWaiting(a);var c=setTimeout(a,Math.max(0,t-Date.now()));}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t);},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})));},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}));},e.prototype.releaseLock=function(e){return n(this,void 0,void 0,(function(){return r(this,(function(t){switch(t.label){case 0:return [4,this.releaseLock__private__(e)];case 1:return [2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return n(this,void 0,void 0,(function(){var n,o,i;return r(this,(function(r){switch(r.label){case 0:return n=window.localStorage,o="browser-tabs-lock-key-"+t,null===(i=n.getItem(o))?[2]:(i=JSON.parse(i)).id!==this.id?[3,2]:[4,yr.default().lock(i.iat)];case 1:r.sent(),this.acquiredIatSet.delete(i.iat),n.removeItem(o),yr.default().unlock(i.iat),e.notifyWaiters(),r.label=2;case 2:return [2]}}))}))},e.lockCorrector=function(){for(var t=Date.now()-5e3,n=window.localStorage,r=Object.keys(n),o=!1,i=0;i<r.length;i++){var a=r[i];if(a.includes("browser-tabs-lock-key")){var c=n.getItem(a);null!==c&&(void 0===(c=JSON.parse(c)).timeRefreshed&&c.timeAcquired<t||void 0!==c.timeRefreshed&&c.timeRefreshed<t)&&(n.removeItem(a),o=!0);}}o&&e.notifyWaiters();},e.waiters=void 0,e}();t.default=c;})));var mr={timeoutInSeconds:60},br={error:"timeout",error_description:"Timeout"},gr=function(e,t){var r,o,i,a=t.popup;if(a?a.location.href=e:(r=e,o=window.screenX+(window.innerWidth-400)/2,i=window.screenY+(window.innerHeight-600)/2,a=window.open(r,"auth0:authorize:popup","left="+o+",top="+i+",width=400,height=600,resizable,scrollbars=yes,status=1")),!a)throw new Error("Could not open popup");return new Promise((function(e,r){var o=setTimeout((function(){r(n(n({},br),{popup:a}));}),1e3*(t.timeoutInSeconds||60));window.addEventListener("message",(function(t){if(t.data&&"authorization_response"===t.data.type){if(clearTimeout(o),a.close(),t.data.response.error)return r(t.data.response);e(t.data.response);}}));}))},wr=function(){var e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.",t="";return Array.from(Lr().getRandomValues(new Uint8Array(43))).forEach((function(n){return t+=e[n%e.length]})),t},Sr=function(e){return btoa(e)},_r=function(e){return Object.keys(e).filter((function(t){return void 0!==e[t]})).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")},kr=function(e){return o(void 0,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return t=Wr().digest({name:"SHA-256"},(new TextEncoder).encode(e)),window.msCrypto?[2,new Promise((function(e,n){t.oncomplete=function(t){e(t.target.result);},t.onerror=function(e){n(e.error);},t.onabort=function(){n("The digest operation was aborted");};}))]:[4,t];case 1:return [2,n.sent()]}}))}))},Tr=function(e){return function(e){return decodeURIComponent(atob(e).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}(e.replace(/_/g,"/").replace(/-/g,"+"))},Ir=function(e){var t=new Uint8Array(e);return function(e){var t={"+":"-","/":"_","=":""};return e.replace(/[\+\/=]/g,(function(e){return t[e]}))}(window.btoa(String.fromCharCode.apply(String,Array.from(t))))},Or=function(e,t,r,a){return o(void 0,void 0,void 0,(function(){var o,c;return i(this,(function(i){switch(i.label){case 0:return a?(delete t.signal,[2,(l=n({url:e,timeout:r},t),f=a,new Promise((function(e,t){var n=new MessageChannel;n.port1.onmessage=function(n){n.data.error?t(new Error(n.data.error)):e(n.data);},f.postMessage(l,[n.port2]);})))]):[3,1];case 1:return [4,(u=e,s=t,s=s||{},new Promise((function(e,t){var n=new XMLHttpRequest,r=[],o=[],i={},a=function(){return {ok:2==(n.status/100|0),statusText:n.statusText,status:n.status,url:n.responseURL,text:function(){return Promise.resolve(n.responseText)},json:function(){return Promise.resolve(JSON.parse(n.responseText))},blob:function(){return Promise.resolve(new Blob([n.response]))},clone:a,headers:{keys:function(){return r},entries:function(){return o},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var c in n.open(s.method||"get",u,!0),n.onload=function(){n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,t,n){r.push(t=t.toLowerCase()),o.push([t,n]),i[t]=i[t]?i[t]+","+n:n;})),e(a());},n.onerror=t,n.withCredentials="include"==s.credentials,s.headers)n.setRequestHeader(c,s.headers[c]);n.send(s.body||null);})))];case 2:return o=i.sent(),c={ok:o.ok},[4,o.json()];case 3:return [2,(c.json=i.sent(),c)]}var u,s,l,f;}))}))},xr=function(e,t,r,o){void 0===o&&(o=1e4);var i=new AbortController,a=i.signal,c=n(n({},t),{signal:a});return Promise.race([Or(e,c,o,r),new Promise((function(e,t){setTimeout((function(){i.abort(),t(new Error("Timeout when executing 'fetch'"));}),o);}))])},jr=function(e,t,n,a){return o(void 0,void 0,void 0,(function(){var o,c,u,s,l,f,d,p,h,y;return i(this,(function(i){switch(i.label){case 0:u=0,i.label=1;case 1:if(!(u<3))return [3,6];i.label=2;case 2:return i.trys.push([2,4,,5]),[4,xr(e,n,a,t)];case 3:return c=i.sent(),o=null,[3,6];case 4:return s=i.sent(),o=s,[3,5];case 5:return u++,[3,1];case 6:if(o)throw o;if(l=c.json,f=l.error,d=l.error_description,p=r(l,["error","error_description"]),!c.ok)throw h=d||"HTTP error. Unable to fetch "+e,(y=new Error(h)).error=f||"request_error",y.error_description=h,y;return [2,p]}}))}))},Er=function(e,t){return o(void 0,void 0,void 0,(function(){var o=e.baseUrl,a=e.timeout,c=r(e,["baseUrl","timeout"]);return i(this,(function(e){switch(e.label){case 0:return [4,jr(o+"/oauth/token",a,{method:"POST",body:JSON.stringify(n({redirect_uri:window.location.origin},c)),headers:{"Content-type":"application/json"}},t)];case 1:return [2,e.sent()]}}))}))},Lr=function(){return window.crypto||window.msCrypto},Wr=function(){var e=Lr();return e.subtle||e.webkitSubtle},Ar=function(e){return Array.from(new Set(e))},Zr=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return Ar(e.join(" ").trim().split(/\s+/)).join(" ")},Rr=function(e){return "@@auth0spajs@@::"+e.client_id+"::"+e.audience+"::"+e.scope},Kr=function(e){var t=Math.floor(Date.now()/1e3)+e.expires_in;return {body:e,expiresAt:Math.min(t,e.decodedToken.claims.exp)-60}},Ur=function(){function e(){}return e.prototype.save=function(e){var t=Rr(e),n=Kr(e);window.localStorage.setItem(t,JSON.stringify(n));},e.prototype.get=function(e){var t=Rr(e),n=this.readJson(t),r=Math.floor(Date.now()/1e3);if(n){if(!(n.expiresAt<r))return n.body;if(n.body.refresh_token){var o=this.stripData(n);return this.writeJson(t,o),o.body}localStorage.removeItem(t);}},e.prototype.clear=function(){for(var e=localStorage.length-1;e>=0;e--)localStorage.key(e).startsWith("@@auth0spajs@@")&&localStorage.removeItem(localStorage.key(e));},e.prototype.readJson=function(e){var t,n=window.localStorage.getItem(e);if(n&&(t=JSON.parse(n)))return t},e.prototype.writeJson=function(e,t){localStorage.setItem(e,JSON.stringify(t));},e.prototype.stripData=function(e){return {body:{refresh_token:e.body.refresh_token},expiresAt:e.expiresAt}},e}(),Cr=function(){this.enclosedCache=function(){var e={body:{},expiresAt:0};return {save:function(t){var n=Rr(t),r=Kr(t);e[n]=r;},get:function(t){var n=Rr(t),r=e[n],o=Math.floor(Date.now()/1e3);if(r)return r.expiresAt<o?r.body.refresh_token?(r.body={refresh_token:r.body.refresh_token},r.body):void delete e[n]:r.body},clear:function(){e={body:{},expiresAt:0};}}}();},Gr=u((function(e,t){var n=a&&a.__assign||function(){return (n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function r(e,t){if(!t)return "";var n="; "+e;return !0===t?n:n+"="+t}function o(e,t,n){return encodeURIComponent(e).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/\(/g,"%28").replace(/\)/g,"%29")+"="+encodeURIComponent(t).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent)+function(e){if("number"==typeof e.expires){var t=new Date;t.setMilliseconds(t.getMilliseconds()+864e5*e.expires),e.expires=t;}return r("Expires",e.expires?e.expires.toUTCString():"")+r("Domain",e.domain)+r("Path",e.path)+r("Secure",e.secure)+r("SameSite",e.sameSite)}(n)}function i(e){for(var t={},n=e?e.split("; "):[],r=/(%[\dA-F]{2})+/gi,o=0;o<n.length;o++){var i=n[o].split("="),a=i.slice(1).join("=");'"'===a.charAt(0)&&(a=a.slice(1,-1));try{t[i[0].replace(r,decodeURIComponent)]=a.replace(r,decodeURIComponent);}catch(e){}}return t}function c(){return i(document.cookie)}function u(e,t,r){document.cookie=o(e,t,n({path:"/"},r));}t.__esModule=!0,t.encode=o,t.parse=i,t.getAll=c,t.get=function(e){return c()[e]},t.set=u,t.remove=function(e,t){u(e,"",n(n({},t),{expires:-1}));};}));c(Gr);Gr.encode,Gr.parse;var Pr=Gr.getAll,Xr=Gr.get,Vr=Gr.set,Fr=Gr.remove,zr=function(e){var t=Xr(e);if(void 0!==t)return JSON.parse(t)},Yr=function(e,t,n){Vr(e,JSON.stringify(t),{expires:n.daysUntilExpire});},Jr=function(e){Fr(e);},Nr=function(e){return "a0.spajs.txs."+e},Dr=function(){function e(){var e=this;this.transactions={},Object.keys(Pr()||{}).filter((function(e){return e.startsWith("a0.spajs.txs.")})).forEach((function(t){var n=t.replace("a0.spajs.txs.","");e.transactions[n]=zr(t);}));}return e.prototype.create=function(e,t){this.transactions[e]=t,Yr(Nr(e),t,{daysUntilExpire:1});},e.prototype.get=function(e){return this.transactions[e]},e.prototype.remove=function(e){delete this.transactions[e],Jr(Nr(e));},e}(),Mr=function(e){return "number"==typeof e},Br=["iss","aud","exp","nbf","iat","jti","azp","nonce","auth_time","at_hash","c_hash","acr","amr","sub_jwk","cnf","sip_from_tag","sip_date","sip_callid","sip_cseq_num","sip_via_branch","orig","dest","mky","events","toe","txn","rph","sid","vot","vtm"],qr=function(e){if(!e.id_token)throw new Error("ID token is required but missing");var t=function(e){var t=e.split("."),n=t[0],r=t[1],o=t[2];if(3!==t.length||!n||!r||!o)throw new Error("ID token could not be decoded");var i=JSON.parse(Tr(r)),a={__raw:e},c={};return Object.keys(i).forEach((function(e){a[e]=i[e],Br.includes(e)||(c[e]=i[e]);})),{encoded:{header:n,payload:r,signature:o},header:JSON.parse(Tr(n)),claims:a,user:c}}(e.id_token);if(!t.claims.iss)throw new Error("Issuer (iss) claim must be a string present in the ID token");if(t.claims.iss!==e.iss)throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'+e.iss+'", found "'+t.claims.iss+'"');if(!t.user.sub)throw new Error("Subject (sub) claim must be a string present in the ID token");if("RS256"!==t.header.alg)throw new Error('Signature algorithm of "'+t.header.alg+'" is not supported. Expected the ID token to be signed with "RS256".');if(!t.claims.aud||"string"!=typeof t.claims.aud&&!Array.isArray(t.claims.aud))throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");if(Array.isArray(t.claims.aud)){if(!t.claims.aud.includes(e.aud))throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but was not one of "'+t.claims.aud.join(", ")+'"');if(t.claims.aud.length>1){if(!t.claims.azp)throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");if(t.claims.azp!==e.aud)throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'+e.aud+'", found "'+t.claims.azp+'"')}}else if(t.claims.aud!==e.aud)throw new Error('Audience (aud) claim mismatch in the ID token; expected "'+e.aud+'" but found "'+t.claims.aud+'"');if(e.nonce){if(!t.claims.nonce)throw new Error("Nonce (nonce) claim must be a string present in the ID token");if(t.claims.nonce!==e.nonce)throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'+e.nonce+'", found "'+t.claims.nonce+'"')}if(e.max_age&&!Mr(t.claims.auth_time))throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");if(!Mr(t.claims.exp))throw new Error("Expiration Time (exp) claim must be a number present in the ID token");if(!Mr(t.claims.iat))throw new Error("Issued At (iat) claim must be a number present in the ID token");var n=e.leeway||60,r=new Date,o=new Date(0),i=new Date(0),a=new Date(0);if(a.setUTCSeconds((parseInt(t.claims.auth_time)+e.max_age)/1e3+n),o.setUTCSeconds(t.claims.exp+n),i.setUTCSeconds(t.claims.nbf-n),r>o)throw new Error("Expiration Time (exp) claim error in the ID token; current time ("+r+") is after expiration time ("+o+")");if(Mr(t.claims.nbf)&&r<i)throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Currrent time ("+r+") is before "+i);if(Mr(t.claims.auth_time)&&r>a)throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time ("+r+") is after last auth at "+a);return t},Hr=function(e){function n(t,r,o,i){void 0===i&&(i=null);var a=e.call(this,t,r)||this;return a.state=o,a.appState=i,Object.setPrototypeOf(a,n.prototype),a}return t(n,e),n}(function(e){function n(t,r){var o=e.call(this,r)||this;return o.error=t,o.error_description=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n}(Error)),Qr="undefined"!=typeof module&&"function"==typeof module.require&&module.require||"function"==typeof __non_webpack_require__&&__non_webpack_require__||"function"==typeof require&&require||null,$r=null;if(Qr)try{$r=Qr("worker_threads").Worker;}catch(e){}function eo(e,t,n){var r=void 0===t?null:t,o=function(e,t){return Buffer.from(e,"base64").toString(t?"utf16":"utf8")}(e,void 0!==n&&n),i=o.indexOf("\n",10)+1,a=o.substring(i)+(r?"//# sourceMappingURL="+r:"");return function(e){return new $r(a,Object.assign({},e,{eval:!0}))}}function to(e,t,n){var r=void 0===t?null:t,o=function(e,t){var n=atob(e);if(t){for(var r=new Uint8Array(n.length),o=0,i=n.length;o<i;++o)r[o]=n.charCodeAt(o);return String.fromCharCode.apply(null,new Uint16Array(r.buffer))}return n}(e,void 0!==n&&n),i=o.indexOf("\n",10)+1,a=o.substring(i)+(r?"//# sourceMappingURL="+r:""),c=new Blob([a],{type:"application/javascript"}),u=URL.createObjectURL(c);return function(e){return new Worker(u,e)}}var no="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0);var ro,oo,io,ao=(ro="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwovKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioKQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuCkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSAiTGljZW5zZSIpOyB5b3UgbWF5IG5vdCB1c2UKdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUKTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAKClRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkKS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRApXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLApNRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULgoKU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zCmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS4KKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi8KdmFyIGU9ZnVuY3Rpb24oKXtyZXR1cm4oZT1PYmplY3QuYXNzaWdufHxmdW5jdGlvbihlKXtmb3IodmFyIHIsdD0xLG49YXJndW1lbnRzLmxlbmd0aDt0PG47dCsrKWZvcih2YXIgbyBpbiByPWFyZ3VtZW50c1t0XSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocixvKSYmKGVbb109cltvXSk7cmV0dXJuIGV9KS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIHIoZSxyKXt2YXIgdCxuLG8scyxhPXtsYWJlbDowLHNlbnQ6ZnVuY3Rpb24oKXtpZigxJm9bMF0pdGhyb3cgb1sxXTtyZXR1cm4gb1sxXX0sdHJ5czpbXSxvcHM6W119O3JldHVybiBzPXtuZXh0OmkoMCksdGhyb3c6aSgxKSxyZXR1cm46aSgyKX0sImZ1bmN0aW9uIj09dHlwZW9mIFN5bWJvbCYmKHNbU3ltYm9sLml0ZXJhdG9yXT1mdW5jdGlvbigpe3JldHVybiB0aGlzfSkscztmdW5jdGlvbiBpKHMpe3JldHVybiBmdW5jdGlvbihpKXtyZXR1cm4gZnVuY3Rpb24ocyl7aWYodCl0aHJvdyBuZXcgVHlwZUVycm9yKCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuIik7Zm9yKDthOyl0cnl7aWYodD0xLG4mJihvPTImc1swXT9uLnJldHVybjpzWzBdP24udGhyb3d8fCgobz1uLnJldHVybikmJm8uY2FsbChuKSwwKTpuLm5leHQpJiYhKG89by5jYWxsKG4sc1sxXSkpLmRvbmUpcmV0dXJuIG87c3dpdGNoKG49MCxvJiYocz1bMiZzWzBdLG8udmFsdWVdKSxzWzBdKXtjYXNlIDA6Y2FzZSAxOm89czticmVhaztjYXNlIDQ6cmV0dXJuIGEubGFiZWwrKyx7dmFsdWU6c1sxXSxkb25lOiExfTtjYXNlIDU6YS5sYWJlbCsrLG49c1sxXSxzPVswXTtjb250aW51ZTtjYXNlIDc6cz1hLm9wcy5wb3AoKSxhLnRyeXMucG9wKCk7Y29udGludWU7ZGVmYXVsdDppZighKG89YS50cnlzLChvPW8ubGVuZ3RoPjAmJm9bby5sZW5ndGgtMV0pfHw2IT09c1swXSYmMiE9PXNbMF0pKXthPTA7Y29udGludWV9aWYoMz09PXNbMF0mJighb3x8c1sxXT5vWzBdJiZzWzFdPG9bM10pKXthLmxhYmVsPXNbMV07YnJlYWt9aWYoNj09PXNbMF0mJmEubGFiZWw8b1sxXSl7YS5sYWJlbD1vWzFdLG89czticmVha31pZihvJiZhLmxhYmVsPG9bMl0pe2EubGFiZWw9b1syXSxhLm9wcy5wdXNoKHMpO2JyZWFrfW9bMl0mJmEub3BzLnBvcCgpLGEudHJ5cy5wb3AoKTtjb250aW51ZX1zPXIuY2FsbChlLGEpfWNhdGNoKGUpe3M9WzYsZV0sbj0wfWZpbmFsbHl7dD1vPTB9aWYoNSZzWzBdKXRocm93IHNbMV07cmV0dXJue3ZhbHVlOnNbMF0/c1sxXTp2b2lkIDAsZG9uZTohMH19KFtzLGldKX19fXZhciB0O2FkZEV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLChmdW5jdGlvbihuKXt2YXIgbyxzLGEsaSx1LGwsYyxmLHA7cmV0dXJuIGw9dm9pZCAwLGM9dm9pZCAwLHA9ZnVuY3Rpb24oKXt2YXIgbCxjLGYscCxoLHksYjtyZXR1cm4gcih0aGlzLChmdW5jdGlvbihyKXtzd2l0Y2goci5sYWJlbCl7Y2FzZSAwOm89bi5kYXRhLHM9by51cmwsYT1vLnRpbWVvdXQsaT1mdW5jdGlvbihlLHIpe3ZhciB0PXt9O2Zvcih2YXIgbiBpbiBlKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG4pJiZyLmluZGV4T2Yobik8MCYmKHRbbl09ZVtuXSk7aWYobnVsbCE9ZSYmImZ1bmN0aW9uIj09dHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpe3ZhciBvPTA7Zm9yKG49T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTtvPG4ubGVuZ3RoO28rKylyLmluZGV4T2YobltvXSk8MCYmT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsbltvXSkmJih0W25bb11dPWVbbltvXV0pfXJldHVybiB0fShvLFsidXJsIiwidGltZW91dCJdKSx1PW4ucG9ydHNbMF0sci5sYWJlbD0xO2Nhc2UgMTppZihyLnRyeXMucHVzaChbMSw3LCw4XSksIShjPUpTT04ucGFyc2UoaS5ib2R5KSkucmVmcmVzaF90b2tlbiYmInJlZnJlc2hfdG9rZW4iPT09Yy5ncmFudF90eXBlKXtpZighdCl0aHJvdyBuZXcgRXJyb3IoIlRoZSB3ZWIgd29ya2VyIGlzIG1pc3NpbmcgdGhlIHJlZnJlc2ggdG9rZW4iKTtpLmJvZHk9SlNPTi5zdHJpbmdpZnkoZShlKHt9LGMpLHtyZWZyZXNoX3Rva2VuOnR9KSl9Zj1uZXcgQWJvcnRDb250cm9sbGVyLHA9Zi5zaWduYWwsaD12b2lkIDAsci5sYWJlbD0yO2Nhc2UgMjpyZXR1cm4gci50cnlzLnB1c2goWzIsNCwsNV0pLFs0LFByb21pc2UucmFjZShbKHY9YSxuZXcgUHJvbWlzZSgoZnVuY3Rpb24oZSl7cmV0dXJuIHNldFRpbWVvdXQoZSx2KX0pKSksZmV0Y2gocyxlKGUoe30saSkse3NpZ25hbDpwfSkpXSldO2Nhc2UgMzpyZXR1cm4gaD1yLnNlbnQoKSxbMyw1XTtjYXNlIDQ6cmV0dXJuIHk9ci5zZW50KCksdS5wb3N0TWVzc2FnZSh7ZXJyb3I6eS5tZXNzYWdlfSksWzJdO2Nhc2UgNTpyZXR1cm4gaD9bNCxoLmpzb24oKV06KGYuYWJvcnQoKSxbMl0pO2Nhc2UgNjpyZXR1cm4obD1yLnNlbnQoKSkucmVmcmVzaF90b2tlbj8odD1sLnJlZnJlc2hfdG9rZW4sZGVsZXRlIGwucmVmcmVzaF90b2tlbik6dD1udWxsLHUucG9zdE1lc3NhZ2Uoe29rOmgub2ssanNvbjpsfSksWzMsOF07Y2FzZSA3OnJldHVybiBiPXIuc2VudCgpLHUucG9zdE1lc3NhZ2Uoe29rOiExLGpzb246e2Vycm9yX2Rlc2NyaXB0aW9uOmIubWVzc2FnZX19KSxbMyw4XTtjYXNlIDg6cmV0dXJuWzJdfXZhciB2fSkpfSxuZXcoKGY9dm9pZCAwKXx8KGY9UHJvbWlzZSkpKChmdW5jdGlvbihlLHIpe2Z1bmN0aW9uIHQoZSl7dHJ5e28ocC5uZXh0KGUpKX1jYXRjaChlKXtyKGUpfX1mdW5jdGlvbiBuKGUpe3RyeXtvKHAudGhyb3coZSkpfWNhdGNoKGUpe3IoZSl9fWZ1bmN0aW9uIG8ocil7ci5kb25lP2Uoci52YWx1ZSk6bmV3IGYoKGZ1bmN0aW9uKGUpe2Uoci52YWx1ZSl9KSkudGhlbih0LG4pfW8oKHA9cC5hcHBseShsLGN8fFtdKSkubmV4dCgpKX0pKX0pKTsKCg==",oo=null,io=!1,no?eo(ro,oo,io):to(ro,oo,io)),co=new vr,uo={memory:function(){return (new Cr).enclosedCache},localstorage:function(){return new Ur}},so=function(e){return uo[e]},lo=function(){function e(e){var t,n;if(this.options=e,function(){if(!Lr())throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");if(void 0===Wr())throw new Error("\n      auth0-spa-js must run on a secure origin.\n      See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin \n      for more information.\n    ")}(),this.cacheLocation=e.cacheLocation||"memory",!so(this.cacheLocation))throw new Error('Invalid cache location "'+this.cacheLocation+'"');this.cache=so(this.cacheLocation)(),this.scope=this.options.scope,this.transactionManager=new Dr,this.domainUrl="https://"+this.options.domain,this.tokenIssuer=this.options.issuer?"https://"+this.options.issuer+"/":this.domainUrl+"/",this.defaultScope=Zr("openid",void 0!==(null===(n=null===(t=this.options)||void 0===t?void 0:t.advancedOptions)||void 0===n?void 0:n.defaultScope)?this.options.advancedOptions.defaultScope:"openid profile email"),this.options.useRefreshTokens&&(this.scope=Zr(this.scope,"offline_access")),window.Worker&&this.options.useRefreshTokens&&"memory"===this.cacheLocation&&!/Trident.*rv:11\.0/.test(navigator.userAgent)&&(this.worker=new ao);}return e.prototype._url=function(e){var t=encodeURIComponent(btoa(JSON.stringify({name:"auth0-spa-js",version:"1.8.0"})));return ""+this.domainUrl+e+"&auth0Client="+t},e.prototype._getParams=function(e,t,o,i,a){var c=this.options,u=(c.domain,c.leeway,c.useRefreshTokens,c.cacheLocation,c.advancedOptions,r(c,["domain","leeway","useRefreshTokens","cacheLocation","advancedOptions"]));return n(n(n({},u),e),{scope:Zr(this.defaultScope,this.scope,e.scope),response_type:"code",response_mode:"query",state:t,nonce:o,redirect_uri:a||this.options.redirect_uri,code_challenge:i,code_challenge_method:"S256"})},e.prototype._authorizeUrl=function(e){return this._url("/authorize?"+_r(e))},e.prototype._verifyIdToken=function(e,t){return qr({iss:this.tokenIssuer,aud:this.options.client_id,id_token:e,nonce:t,leeway:this.options.leeway,max_age:this._parseNumber(this.options.max_age)})},e.prototype._parseNumber=function(e){return "string"!=typeof e?e:parseInt(e,10)||void 0},e.prototype.buildAuthorizeUrl=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,o,a,c,u,s,l,f,d,p;return i(this,(function(i){switch(i.label){case 0:return t=e.redirect_uri,n=e.appState,o=r(e,["redirect_uri","appState"]),a=Sr(wr()),c=Sr(wr()),u=wr(),[4,kr(u)];case 1:return s=i.sent(),l=Ir(s),f=e.fragment?"#"+e.fragment:"",d=this._getParams(o,a,c,l,t),p=this._authorizeUrl(d),this.transactionManager.create(a,{nonce:c,code_verifier:u,appState:n,scope:d.scope,audience:d.audience||"default",redirect_uri:d.redirect_uri}),[2,p+f]}}))}))},e.prototype.loginWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),o(this,void 0,void 0,(function(){var o,a,c,u,s,l,f,d,p,h,y,v;return i(this,(function(i){switch(i.label){case 0:return o=r(e,[]),a=Sr(wr()),c=Sr(wr()),u=wr(),[4,kr(u)];case 1:return s=i.sent(),l=Ir(s),f=this._getParams(o,a,c,l,this.options.redirect_uri||window.location.origin),d=this._authorizeUrl(n(n({},f),{response_mode:"web_message"})),[4,gr(d,n(n({},t),{timeoutInSeconds:t.timeoutInSeconds||this.options.authorizeTimeoutInSeconds||60}))];case 2:if(p=i.sent(),a!==p.state)throw new Error("Invalid state");return [4,Er({baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:u,code:p.code,grant_type:"authorization_code",redirect_uri:f.redirect_uri},this.worker)];case 3:return h=i.sent(),y=this._verifyIdToken(h.id_token,c),v=n(n({},h),{decodedToken:y,scope:f.scope,audience:f.audience||"default",client_id:this.options.client_id}),this.cache.save(v),Yr("auth0.is.authenticated",!0,{daysUntilExpire:1}),[2]}}))}))},e.prototype.getUser=function(e){return void 0===e&&(e={audience:this.options.audience||"default",scope:this.scope||this.defaultScope}),o(this,void 0,void 0,(function(){var t;return i(this,(function(r){return e.scope=Zr(this.defaultScope,e.scope),[2,(t=this.cache.get(n({client_id:this.options.client_id},e)))&&t.decodedToken&&t.decodedToken.user]}))}))},e.prototype.getIdTokenClaims=function(e){return void 0===e&&(e={audience:this.options.audience||"default",scope:this.scope||this.defaultScope}),o(this,void 0,void 0,(function(){var t;return i(this,(function(r){return e.scope=Zr(this.defaultScope,this.scope,e.scope),[2,(t=this.cache.get(n({client_id:this.options.client_id},e)))&&t.decodedToken&&t.decodedToken.claims]}))}))},e.prototype.loginWithRedirect=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return [4,this.buildAuthorizeUrl(e)];case 1:return t=n.sent(),window.location.assign(t),[2]}}))}))},e.prototype.handleRedirectCallback=function(e){return void 0===e&&(e=window.location.href),o(this,void 0,void 0,(function(){var t,r,o,a,c,u,s,l,f,d,p;return i(this,(function(i){switch(i.label){case 0:if(0===(t=e.split("?").slice(1)).length)throw new Error("There are no query params available for parsing.");if(r=function(e){e.indexOf("#")>-1&&(e=e.substr(0,e.indexOf("#")));var t=e.split("&"),r={};return t.forEach((function(e){var t=e.split("="),n=t[0],o=t[1];r[n]=decodeURIComponent(o);})),n(n({},r),{expires_in:parseInt(r.expires_in)})}(t.join("")),o=r.state,a=r.code,c=r.error,u=r.error_description,!(s=this.transactionManager.get(o)))throw new Error("Invalid state");if(c)throw this.transactionManager.remove(o),new Hr(c,u,o,s.appState);return this.transactionManager.remove(o),l={baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:s.code_verifier,grant_type:"authorization_code",code:a},void 0!==s.redirect_uri&&(l.redirect_uri=s.redirect_uri),[4,Er(l,this.worker)];case 1:return f=i.sent(),d=this._verifyIdToken(f.id_token,s.nonce),p=n(n({},f),{decodedToken:d,audience:s.audience,scope:s.scope,client_id:this.options.client_id}),this.cache.save(p),Yr("auth0.is.authenticated",!0,{daysUntilExpire:1}),[2,{appState:s.appState}]}}))}))},e.prototype.getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,a,c,u,s;return i(this,(function(i){switch(i.label){case 0:t=n({audience:this.options.audience,scope:Zr(this.defaultScope,this.scope,e.scope),ignoreCache:!1},e),o=t.ignoreCache,a=r(t,["ignoreCache"]),i.label=1;case 1:return i.trys.push([1,7,8,10]),!o&&(c=this.cache.get({scope:a.scope,audience:a.audience||"default",client_id:this.options.client_id}))&&c.access_token?[2,c.access_token]:[4,co.acquireLock("auth0.lock.getTokenSilently",5e3)];case 2:return i.sent(),!this.options.useRefreshTokens||e.audience?[3,4]:[4,this._getTokenUsingRefreshToken(a)];case 3:return s=i.sent(),[3,6];case 4:return [4,this._getTokenFromIFrame(a)];case 5:s=i.sent(),i.label=6;case 6:return u=s,this.cache.save(n({client_id:this.options.client_id},u)),Yr("auth0.is.authenticated",!0,{daysUntilExpire:1}),[2,u.access_token];case 7:throw i.sent();case 8:return [4,co.releaseLock("auth0.lock.getTokenSilently")];case 9:return i.sent(),[7];case 10:return [2]}}))}))},e.prototype.getTokenWithPopup=function(e,t){return void 0===e&&(e={audience:this.options.audience,scope:this.scope||this.defaultScope}),void 0===t&&(t=mr),o(this,void 0,void 0,(function(){return i(this,(function(n){switch(n.label){case 0:return e.scope=Zr(this.defaultScope,this.scope,e.scope),[4,this.loginWithPopup(e,t)];case 1:return n.sent(),[2,this.cache.get({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}).access_token]}}))}))},e.prototype.isAuthenticated=function(){return o(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,this.getUser()];case 1:return [2,!!e.sent()]}}))}))},e.prototype.logout=function(e){void 0===e&&(e={}),null!==e.client_id?e.client_id=e.client_id||this.options.client_id:delete e.client_id;var t=e.federated,n=e.localOnly,o=r(e,["federated","localOnly"]);if(n&&t)throw new Error("It is invalid to set both the `federated` and `localOnly` options to `true`");if(this.cache.clear(),Jr("auth0.is.authenticated"),!n){var i=t?"&federated":"",a=this._url("/v2/logout?"+_r(o));window.location.assign(""+a+i);}},e.prototype._getTokenFromIFrame=function(e){return o(this,void 0,void 0,(function(){var t,r,o,a,c,u,s,l,f,d,p;return i(this,(function(i){switch(i.label){case 0:return t=Sr(wr()),r=Sr(wr()),o=wr(),[4,kr(o)];case 1:return a=i.sent(),c=Ir(a),u=this._getParams(e,t,r,c,e.redirect_uri||this.options.redirect_uri||window.location.origin),s=this._authorizeUrl(n(n({},u),{prompt:"none",response_mode:"web_message"})),l=e.timeoutInSeconds||this.options.authorizeTimeoutInSeconds,[4,(h=s,y=this.domainUrl,v=l,void 0===v&&(v=60),new Promise((function(e,t){var n=window.document.createElement("iframe");n.setAttribute("width","0"),n.setAttribute("height","0"),n.style.display="none";var r=function(){window.document.body.contains(n)&&window.document.body.removeChild(n);},o=setTimeout((function(){t(br),r();}),1e3*v),i=function(n){if(n.origin==y&&n.data&&"authorization_response"===n.data.type){var a=n.source;a&&a.close(),n.data.response.error?t(n.data.response):e(n.data.response),clearTimeout(o),window.removeEventListener("message",i,!1),setTimeout(r,2e3);}};window.addEventListener("message",i,!1),window.document.body.appendChild(n),n.setAttribute("src",h);})))];case 2:if(f=i.sent(),t!==f.state)throw new Error("Invalid state");return [4,Er({baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:o,code:f.code,grant_type:"authorization_code",redirect_uri:u.redirect_uri},this.worker)];case 3:return d=i.sent(),p=this._verifyIdToken(d.id_token,r),[2,n(n({},d),{decodedToken:p,scope:u.scope,audience:u.audience||"default"})]}var h,y,v;}))}))},e.prototype._getTokenUsingRefreshToken=function(e){return o(this,void 0,void 0,(function(){var t,r,o,a,c;return i(this,(function(i){switch(i.label){case 0:return e.scope=Zr(this.defaultScope,this.scope,e.scope),(t=this.cache.get({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}))&&t.refresh_token||this.worker?[3,2]:[4,this._getTokenFromIFrame(e)];case 1:return [2,i.sent()];case 2:r=e.redirect_uri||this.options.redirect_uri||window.location.origin,i.label=3;case 3:return i.trys.push([3,5,,8]),[4,Er({baseUrl:this.domainUrl,client_id:this.options.client_id,grant_type:"refresh_token",refresh_token:t&&t.refresh_token,redirect_uri:r},this.worker)];case 4:return o=i.sent(),[3,8];case 5:return "The web worker is missing the refresh token"!==(a=i.sent()).message?[3,7]:[4,this._getTokenFromIFrame(e)];case 6:return [2,i.sent()];case 7:throw a;case 8:return c=this._verifyIdToken(o.id_token),[2,n(n({},o),{decodedToken:c,scope:e.scope,audience:e.audience||"default"})]}}))}))},e}();function createAuth0Client(e){return o(this,void 0,void 0,(function(){var t,n;return i(this,(function(r){switch(r.label){case 0:if("memory"===(t=new lo(e)).cacheLocation&&!zr("auth0.is.authenticated"))return [2,t];r.label=1;case 1:return r.trys.push([1,3,,4]),[4,t.getTokenSilently()];case 2:return r.sent(),[3,4];case 3:if("login_required"!==(n=r.sent()).error)throw n;return [3,4];case 4:return [2,t]}}))}))}

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const isLoading = writable(true);
    const isAuthenticated = writable(false);
    const authToken = writable("");
    const userInfo = writable({});
    const authError = writable(null);
    const AUTH_KEY = {};

    // Default Auth0 expiration time is 10 hours or something like that.
    // If you want to get fancy you can parse the JWT token and get
    // token's actual expiration time.
    const refreshRate = 10 * 60 * 60 * 1000;

    function createAuth(config) {
    	let auth0 = null;
    	let intervalId = undefined;

    	onMount(async () => {
    		auth0 = await createAuth0Client(config);

    		// Not all browsers support this, please program defensively!
    		const params = new URLSearchParams(window.location.search);

    		// Check if something went wrong during login redirect
    		// and extract the error message
    		if (params.has("error")) {
    			authError.set(new Error(params.get("error_description")));
    		}

    		// if code then login success
    		if (params.has("code")) {
    			// Let the Auth0 SDK do it's stuff - save some state, etc.
    			await auth0.handleRedirectCallback();
    			// Can be smart here and redirect to original path instead of root
    			window.history.replaceState({}, document.title, "/");
    			authError.set(null);
    		}

    		const _isAuthenticated = await auth0.isAuthenticated();
    		isAuthenticated.set(_isAuthenticated);

    		if (_isAuthenticated) {
    			// while on it, fetch the user info
    			userInfo.set(await auth0.getUser());

    			// Get the access token. Make sure to supply audience property
    			// in Auth0 config, otherwise you will soon start throwing stuff!
    			const token = await auth0.getTokenSilently();
    			authToken.set(token);

    			// refresh token after specific period or things will stop
    			// working. Useful for long-lived apps like dashboards.
    			intervalId = setInterval(async () => {
    				authToken.set(await auth0.getTokenSilently());
    			}, refreshRate);
    		}
    		isLoading.set(false);

    		// clear token refresh interval on component unmount
    		return () => {
    			intervalId && clearInterval(intervalId);
    		};
    	});

    	const login = async (redirectPage) => {
    		await auth0.loginWithRedirect({
    			redirect_uri: redirectPage || window.location.origin,
    			prompt: "login", // Force login prompt. No silence auth for you!
    		});
    	};

    	const logout = () => {
    		auth0.logout({
    			returnTo: window.location.origin,
    		});
    	};

    	const auth = {
    		isLoading,
    		isAuthenticated,
    		authToken,
    		authError,
    		login,
    		logout,
    		userInfo,
    	};

    	// Put everything in context so that child
    	// components can access the state
    	setContext(AUTH_KEY, auth);

    	return auth;
    }

    /* src/Header.svelte generated by Svelte v3.21.0 */
    const file$1 = "src/Header.svelte";

    // (196:6) {:else}
    function create_else_block(ctx) {
    	let li;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(button, "class", "svelte-i6znzk");
    			add_location(button, file$1, 197, 10, 3693);
    			attr_dev(li, "class", "svelte-i6znzk");
    			add_location(li, file$1, 196, 8, 3678);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", prevent_default(/*click_handler_1*/ ctx[11]), false, true, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(196:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (182:6) {#if $isAuthenticated}
    function create_if_block(ctx) {
    	let li;
    	let menu;
    	let span;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let t1_value = /*$userInfo*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let i;
    	let t3;
    	let menu_content;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			menu = element("menu");
    			span = element("span");
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			i = element("i");
    			t3 = space();
    			menu_content = element("menu-content");
    			button = element("button");
    			button.textContent = "Logout";
    			if (img.src !== (img_src_value = /*$userInfo*/ ctx[2].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$userInfo*/ ctx[2].name);
    			attr_dev(img, "class", "svelte-i6znzk");
    			add_location(img, file$1, 185, 14, 3332);
    			attr_dev(i, "class", "icon solid fa-angle-down");
    			add_location(i, file$1, 187, 14, 3430);
    			add_location(span, file$1, 184, 12, 3311);
    			attr_dev(button, "class", "svelte-i6znzk");
    			add_location(button, file$1, 190, 14, 3530);
    			set_custom_element_data(menu_content, "class", "svelte-i6znzk");
    			add_location(menu_content, file$1, 189, 12, 3501);
    			attr_dev(menu, "class", "svelte-i6znzk");
    			add_location(menu, file$1, 183, 10, 3292);
    			attr_dev(li, "class", "svelte-i6znzk");
    			add_location(li, file$1, 182, 8, 3277);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, menu);
    			append_dev(menu, span);
    			append_dev(span, img);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, i);
    			append_dev(menu, t3);
    			append_dev(menu, menu_content);
    			append_dev(menu_content, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[10]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$userInfo*/ 4 && img.src !== (img_src_value = /*$userInfo*/ ctx[2].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$userInfo*/ 4 && img_alt_value !== (img_alt_value = /*$userInfo*/ ctx[2].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$userInfo*/ 4 && t1_value !== (t1_value = /*$userInfo*/ ctx[2].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(182:6) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let header;
    	let h1;
    	let a;
    	let t1;
    	let nav;
    	let ul;
    	let t2;
    	let br;
    	let t3;
    	let div;
    	let t4_value = JSON.stringify(/*state*/ ctx[0], null, 2) + "";
    	let t4;

    	function select_block_type(ctx, dirty) {
    		if (/*$isAuthenticated*/ ctx[1]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			a = element("a");
    			a.textContent = "Curtme";
    			t1 = space();
    			nav = element("nav");
    			ul = element("ul");
    			if_block.c();
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			div = element("div");
    			t4 = text(t4_value);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-i6znzk");
    			add_location(a, file$1, 177, 4, 3192);
    			attr_dev(h1, "class", "svelte-i6znzk");
    			add_location(h1, file$1, 176, 2, 3183);
    			attr_dev(ul, "class", "svelte-i6znzk");
    			add_location(ul, file$1, 180, 4, 3235);
    			attr_dev(nav, "class", "svelte-i6znzk");
    			add_location(nav, file$1, 179, 2, 3225);
    			add_location(br, file$1, 203, 2, 3804);
    			add_location(div, file$1, 204, 2, 3813);
    			attr_dev(header, "class", "svelte-i6znzk");
    			add_location(header, file$1, 175, 0, 3172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, a);
    			append_dev(header, t1);
    			append_dev(header, nav);
    			append_dev(nav, ul);
    			if_block.m(ul, null);
    			append_dev(header, t2);
    			append_dev(header, br);
    			append_dev(header, t3);
    			append_dev(header, div);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(ul, null);
    				}
    			}

    			if (dirty & /*state*/ 1 && t4_value !== (t4_value = JSON.stringify(/*state*/ ctx[0], null, 2) + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	let $userInfo;
    	let $authToken;

    	const config = {
    		domain: "dev-6r8s11fz.eu.auth0.com",
    		client_id: "2l41JB9wG62TaX0BmIfILNq6GiTbt92b",
    		redirect_uri: window.location.origin,
    		useRefreshTokens: true
    	};

    	const { isAuthenticated, login, logout, authToken, userInfo } = createAuth(config);
    	validate_store(isAuthenticated, "isAuthenticated");
    	component_subscribe($$self, isAuthenticated, value => $$invalidate(1, $isAuthenticated = value));
    	validate_store(authToken, "authToken");
    	component_subscribe($$self, authToken, value => $$invalidate(8, $authToken = value));
    	validate_store(userInfo, "userInfo");
    	component_subscribe($$self, userInfo, value => $$invalidate(2, $userInfo = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	const click_handler = () => logout();
    	const click_handler_1 = () => login();

    	$$self.$capture_state = () => ({
    		createAuth,
    		config,
    		isAuthenticated,
    		login,
    		logout,
    		authToken,
    		userInfo,
    		state,
    		$isAuthenticated,
    		$userInfo,
    		$authToken
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	let state;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isAuthenticated, $userInfo, $authToken*/ 262) {
    			 $$invalidate(0, state = {
    				isAuthenticated: $isAuthenticated,
    				userInfo: $userInfo,
    				authToken: $authToken
    			});
    		}
    	};

    	return [
    		state,
    		$isAuthenticated,
    		$userInfo,
    		isAuthenticated,
    		login,
    		logout,
    		authToken,
    		userInfo,
    		$authToken,
    		config,
    		click_handler,
    		click_handler_1
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function validURL(url) {
    	var pattern = new RegExp(
    		"^(https?:\\/\\/)?" + // protocol
    		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    		"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    		"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    		"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    			"(\\#[-a-z\\d_]*)?$",
    		"i"
    	);

    	return !!pattern.test(url);
    }

    const BASE_URL = "https://curtme.org/";
    const VISIT_LINK = (shortURL) => `${BASE_URL}${shortURL}`;
    const GET_STAT = (shortURL) => `https://curtme.org/${shortURL}/stats`;

    const INTERNET_CONNECTION = "Please check your internet connection.";
    const URL_INVALID = "The url is not valid.";
    const URL_MANDATORY = "Please enter the url.";

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/Error.svelte generated by Svelte v3.21.0 */

    const { Error: Error_1 } = globals;
    const file$2 = "src/Error.svelte";

    // (20:2) {#if error}
    function create_if_block$1(ctx) {
    	let span;
    	let t;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*error*/ ctx[0]);
    			add_location(span, file$2, 20, 4, 237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*error*/ 1) set_data_dev(t, /*error*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:2) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let if_block = /*error*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "svelte-1891lz2");
    			add_location(div, file$2, 18, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*error*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*error*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { error } = $$props;
    	const writable_props = ["error"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Error", $$slots, []);

    	$$self.$set = $$props => {
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({ fade, error });

    	$$self.$inject_state = $$props => {
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error*/ 1) {
    			 if (error) {
    				setTimeout(
    					() => {
    						$$invalidate(0, error = null);
    					},
    					1500
    				);
    			}
    		}
    	};

    	return [error];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { error: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*error*/ ctx[0] === undefined && !("error" in props)) {
    			console.warn("<Error> was created without expected prop 'error'");
    		}
    	}

    	get error() {
    		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Link.svelte generated by Svelte v3.21.0 */
    const file$3 = "src/Link.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div2;
    	let p0;
    	let t1;
    	let p1;
    	let t2_value = /*link*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let p2;
    	let a0;
    	let t4_value = /*link*/ ctx[0].longURL + "";
    	let t4;
    	let a0_href_value;
    	let t5;
    	let div1;
    	let p3;
    	let a1;
    	let t6_value = VISIT_LINK(/*link*/ ctx[0].shortURL) + "";
    	let t6;
    	let a1_href_value;
    	let t7;
    	let button;
    	let t8;
    	let div0;
    	let span;
    	let t9_value = /*link*/ ctx[0].visited + "";
    	let t9;
    	let t10;
    	let t11_value = (/*link*/ ctx[0].visited === 1 ? "Click" : "Clicks") + "";
    	let t11;
    	let section_intro;
    	let section_outro;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*getDateParsed*/ ctx[2]()}`;
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			a0 = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			p3 = element("p");
    			a1 = element("a");
    			t6 = text(t6_value);
    			t7 = space();
    			button = element("button");
    			t8 = space();
    			div0 = element("div");
    			span = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			t11 = text(t11_value);
    			attr_dev(p0, "class", "date-link svelte-m2s409");
    			add_location(p0, file$3, 107, 4, 2309);
    			attr_dev(p1, "class", "title-link svelte-m2s409");
    			add_location(p1, file$3, 108, 4, 2356);
    			attr_dev(a0, "href", a0_href_value = /*link*/ ctx[0].longURL);
    			attr_dev(a0, "target", "blank");
    			add_location(a0, file$3, 110, 6, 2427);
    			attr_dev(p2, "class", "long-link svelte-m2s409");
    			add_location(p2, file$3, 109, 4, 2399);
    			attr_dev(a1, "href", a1_href_value = VISIT_LINK(/*link*/ ctx[0].shortURL));
    			attr_dev(a1, "class", "short_url");
    			attr_dev(a1, "target", "blank");
    			add_location(a1, file$3, 114, 8, 2552);
    			attr_dev(p3, "class", "short-link svelte-m2s409");
    			add_location(p3, file$3, 113, 6, 2521);
    			attr_dev(button, "class", "icon regular fa-copy svelte-m2s409");
    			add_location(button, file$3, 118, 6, 2690);
    			add_location(span, file$3, 120, 8, 2796);
    			attr_dev(div0, "class", "visited-link svelte-m2s409");
    			add_location(div0, file$3, 119, 6, 2761);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$3, 112, 4, 2497);
    			attr_dev(div2, "class", "result svelte-m2s409");
    			add_location(div2, file$3, 106, 2, 2284);
    			attr_dev(section, "class", "col-12 col-12-mobilep container medium svelte-m2s409");
    			add_location(section, file$3, 102, 0, 2174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t1);
    			append_dev(div2, p1);
    			append_dev(p1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, p2);
    			append_dev(p2, a0);
    			append_dev(a0, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p3);
    			append_dev(p3, a1);
    			append_dev(a1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, button);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t9);
    			append_dev(span, t10);
    			append_dev(span, t11);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*copyClipboard*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*link*/ 1) && t2_value !== (t2_value = /*link*/ ctx[0].title + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*link*/ 1) && t4_value !== (t4_value = /*link*/ ctx[0].longURL + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*link*/ 1 && a0_href_value !== (a0_href_value = /*link*/ ctx[0].longURL)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*link*/ 1) && t6_value !== (t6_value = VISIT_LINK(/*link*/ ctx[0].shortURL) + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*link*/ 1 && a1_href_value !== (a1_href_value = VISIT_LINK(/*link*/ ctx[0].shortURL))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if ((!current || dirty & /*link*/ 1) && t9_value !== (t9_value = /*link*/ ctx[0].visited + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*link*/ 1) && t11_value !== (t11_value = (/*link*/ ctx[0].visited === 1 ? "Click" : "Clicks") + "")) set_data_dev(t11, t11_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (section_outro) section_outro.end(1);
    				if (!section_intro) section_intro = create_in_transition(section, fly, { y: 200, duration: 2000 });
    				section_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (section_intro) section_intro.invalidate();
    			section_outro = create_out_transition(section, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (detaching && section_outro) section_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { link } = $$props;

    	function copyClipboard() {
    		if (navigator.clipboard) {
    			return navigator.clipboard.writeText(endpoint + link.shortURL).catch(function (err) {
    				throw err !== undefined
    				? err
    				: new DOMException("The request is not allowed", "NotAllowedError");
    			});
    		}
    	}

    	function getDateParsed() {
    		const date = new Date(link.date);
    		return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    	}

    	const writable_props = ["link"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, []);

    	$$self.$set = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		VISIT_LINK,
    		link,
    		copyClipboard,
    		getDateParsed
    	});

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, copyClipboard, getDateParsed];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { link: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !("link" in props)) {
    			console.warn("<Link> was created without expected prop 'link'");
    		}
    	}

    	get link() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/LinkShorter.svelte generated by Svelte v3.21.0 */

    const { Error: Error_1$1 } = globals;
    const file$4 = "src/LinkShorter.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (194:0) {#each links as link}
    function create_each_block(ctx) {
    	let current;

    	const link = new Link({
    			props: { link: /*link*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*links*/ 4) link_changes.link = /*link*/ ctx[8];
    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(194:0) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let div0;
    	let input;
    	let t4;
    	let updating_error;
    	let t5;
    	let div3;
    	let div2;
    	let button;
    	let t7;
    	let each_1_anchor;
    	let current;
    	let dispose;

    	function error_error_binding(value) {
    		/*error_error_binding*/ ctx[7].call(null, value);
    	}

    	let error_props = {};

    	if (/*errorMessage*/ ctx[1] !== void 0) {
    		error_props.error = /*errorMessage*/ ctx[1];
    	}

    	const error = new Error$1({ props: error_props, $$inline: true });
    	binding_callbacks.push(() => bind(error, "error", error_error_binding));
    	let each_value = /*links*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Curtme.org";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Free open source and unlimited link shorter";
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t4 = space();
    			create_component(error.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Short";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h2, "class", "svelte-1w05hy8");
    			add_location(h2, file$4, 172, 2, 3260);
    			attr_dev(p, "class", "svelte-1w05hy8");
    			add_location(p, file$4, 173, 2, 3282);
    			attr_dev(input, "id", "longURL");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "autocomplete", "false");
    			attr_dev(input, "placeholder", "Paste long url and shorten it");
    			attr_dev(input, "class", "svelte-1w05hy8");
    			add_location(input, file$4, 176, 6, 3399);
    			attr_dev(div0, "class", "col-12 col-12-mobilep svelte-1w05hy8");
    			add_location(div0, file$4, 175, 4, 3357);
    			attr_dev(div1, "class", "row svelte-1w05hy8");
    			add_location(div1, file$4, 174, 2, 3335);
    			attr_dev(button, "class", "svelte-1w05hy8");
    			add_location(button, file$4, 188, 6, 3758);
    			attr_dev(div2, "class", "col-12 col-12-mobilep svelte-1w05hy8");
    			add_location(div2, file$4, 187, 4, 3716);
    			attr_dev(div3, "class", "row svelte-1w05hy8");
    			add_location(div3, file$4, 186, 2, 3694);
    			attr_dev(section, "class", "container medium svelte-1w05hy8");
    			add_location(section, file$4, 171, 0, 3223);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, p);
    			append_dev(section, t3);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*longURL*/ ctx[0]);
    			append_dev(div1, t4);
    			mount_component(error, div1, null);
    			append_dev(section, t5);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			insert_dev(target, t7, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    				listen_dev(input, "keydown", /*keydown_handler*/ ctx[6], false, false, false),
    				listen_dev(button, "click", /*createShortURL*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*longURL*/ 1 && input.value !== /*longURL*/ ctx[0]) {
    				set_input_value(input, /*longURL*/ ctx[0]);
    			}

    			const error_changes = {};

    			if (!updating_error && dirty & /*errorMessage*/ 2) {
    				updating_error = true;
    				error_changes.error = /*errorMessage*/ ctx[1];
    				add_flush_callback(() => updating_error = false);
    			}

    			error.$set(error_changes);

    			if (dirty & /*links*/ 4) {
    				each_value = /*links*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(error);
    			if (detaching) detach_dev(t7);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const STORAGE_KEY = "links";
    const LONG_URL_INPUT_ID = "longURL";

    function instance$4($$self, $$props, $$invalidate) {
    	let longURL = null;
    	let errorMessage = null;
    	let links = [];

    	onMount(async () => {
    		document.getElementById(LONG_URL_INPUT_ID).focus();
    		const linksStored = localStorage.getItem(STORAGE_KEY);

    		if (linksStored) {
    			const linkStoredParsed = JSON.parse(linksStored);

    			for (let index = 0; index < linkStoredParsed.length; index++) {
    				let link = linkStoredParsed[index];

    				try {
    					const response = await fetch(GET_STAT(link.shortURL), {
    						method: "GET",
    						headers: { "Content-Type": "application/json" }
    					});

    					if (response.ok) {
    						link = await response.json();
    					}

    					$$invalidate(2, links = [...links, link]);
    				} catch(exception) {
    					continue;
    				}
    			}

    			localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    		}
    	});

    	function addNewLink(link) {
    		$$invalidate(2, links = [link, ...links]);
    		localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    	}

    	async function createShortURL() {
    		if (!longURL) {
    			$$invalidate(1, errorMessage = URL_MANDATORY);
    			return;
    		}

    		if (!validURL(longURL)) {
    			$$invalidate(1, errorMessage = URL_INVALID);
    			return;
    		}

    		const data = { url: longURL };

    		try {
    			const response = await fetch(BASE_URL, {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(data)
    			});

    			if (response.ok) {
    				const link = await response.json();
    				$$invalidate(0, longURL = null);
    				addNewLink(link);
    			} else {
    				$$invalidate(1, errorMessage = URL_INVALID);
    			}
    		} catch(exception) {
    			$$invalidate(1, errorMessage = INTERNET_CONNECTION);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LinkShorter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LinkShorter", $$slots, []);

    	function input_input_handler() {
    		longURL = this.value;
    		$$invalidate(0, longURL);
    	}

    	const keydown_handler = event => event.key === "Enter" && createShortURL();

    	function error_error_binding(value) {
    		errorMessage = value;
    		$$invalidate(1, errorMessage);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		validURL,
    		BASE_URL,
    		GET_STAT,
    		INTERNET_CONNECTION,
    		URL_INVALID,
    		URL_MANDATORY,
    		Error: Error$1,
    		Link,
    		STORAGE_KEY,
    		LONG_URL_INPUT_ID,
    		longURL,
    		errorMessage,
    		links,
    		addNewLink,
    		createShortURL
    	});

    	$$self.$inject_state = $$props => {
    		if ("longURL" in $$props) $$invalidate(0, longURL = $$props.longURL);
    		if ("errorMessage" in $$props) $$invalidate(1, errorMessage = $$props.errorMessage);
    		if ("links" in $$props) $$invalidate(2, links = $$props.links);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		longURL,
    		errorMessage,
    		links,
    		createShortURL,
    		addNewLink,
    		input_input_handler,
    		keydown_handler,
    		error_error_binding
    	];
    }

    class LinkShorter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LinkShorter",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.21.0 */

    const file$5 = "src/Footer.svelte";

    function create_fragment$5(ctx) {
    	let footer;
    	let ul0;
    	let li0;
    	let a0;
    	let span0;
    	let t1;
    	let li1;
    	let a1;
    	let span1;
    	let t3;
    	let li2;
    	let a2;
    	let span2;
    	let t5;
    	let li3;
    	let a3;
    	let span3;
    	let t7;
    	let ul1;
    	let li4;
    	let t9;
    	let li5;
    	let t11;
    	let li6;
    	let a4;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			span0 = element("span");
    			span0.textContent = "Github";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			span1 = element("span");
    			span1.textContent = "Swagger";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			span2 = element("span");
    			span2.textContent = "Bug";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			span3 = element("span");
    			span3.textContent = "Buy me a Coffee";
    			t7 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			li4.textContent = "© Curtme.org";
    			t9 = space();
    			li5 = element("li");
    			li5.textContent = "|";
    			t11 = space();
    			li6 = element("li");
    			a4 = element("a");
    			a4.textContent = "Damián Pumar";
    			attr_dev(span0, "class", "label");
    			add_location(span0, file$5, 66, 8, 1165);
    			attr_dev(a0, "href", "https://github.com/damianpumar/Curtme");
    			attr_dev(a0, "title", "Repository open source");
    			attr_dev(a0, "class", "icon brands fa-github svelte-h6ctw3");
    			add_location(a0, file$5, 62, 6, 1023);
    			attr_dev(li0, "class", "svelte-h6ctw3");
    			add_location(li0, file$5, 61, 4, 1012);
    			attr_dev(span1, "class", "label");
    			add_location(span1, file$5, 75, 8, 1393);
    			attr_dev(a1, "href", "https://curtme.org/developer/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "title", "Developer site");
    			attr_dev(a1, "class", "icon brands fa-connectdevelop svelte-h6ctw3");
    			add_location(a1, file$5, 70, 6, 1235);
    			attr_dev(li1, "class", "svelte-h6ctw3");
    			add_location(li1, file$5, 69, 4, 1224);
    			attr_dev(span2, "class", "label");
    			add_location(span2, file$5, 84, 8, 1635);
    			attr_dev(a2, "href", "https://github.com/damianpumar/Curtme/issues/new/");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "title", "you found an error?");
    			attr_dev(a2, "class", "icon solid fa-bug svelte-h6ctw3");
    			add_location(a2, file$5, 79, 6, 1464);
    			attr_dev(li2, "class", "svelte-h6ctw3");
    			add_location(li2, file$5, 78, 4, 1453);
    			attr_dev(span3, "class", "label");
    			add_location(span3, file$5, 93, 8, 1850);
    			attr_dev(a3, "href", "https://ko-fi.com/D1D11NVC3");
    			attr_dev(a3, "title", "Buy me a coffee");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "icon solid fa-coffee svelte-h6ctw3");
    			add_location(a3, file$5, 88, 6, 1702);
    			attr_dev(li3, "class", "svelte-h6ctw3");
    			add_location(li3, file$5, 87, 4, 1691);
    			attr_dev(ul0, "class", "icons svelte-h6ctw3");
    			add_location(ul0, file$5, 60, 2, 989);
    			attr_dev(li4, "class", "svelte-h6ctw3");
    			add_location(li4, file$5, 98, 4, 1951);
    			attr_dev(li5, "class", "svelte-h6ctw3");
    			add_location(li5, file$5, 99, 4, 1982);
    			attr_dev(a4, "href", "https://damianpumar.com");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-h6ctw3");
    			add_location(a4, file$5, 101, 6, 2008);
    			attr_dev(li6, "class", "svelte-h6ctw3");
    			add_location(li6, file$5, 100, 4, 1997);
    			attr_dev(ul1, "class", "copyright svelte-h6ctw3");
    			add_location(ul1, file$5, 97, 2, 1924);
    			attr_dev(footer, "class", "svelte-h6ctw3");
    			add_location(footer, file$5, 59, 0, 978);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, span0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(a1, span1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, span2);
    			append_dev(ul0, t5);
    			append_dev(ul0, li3);
    			append_dev(li3, a3);
    			append_dev(a3, span3);
    			append_dev(footer, t7);
    			append_dev(footer, ul1);
    			append_dev(ul1, li4);
    			append_dev(ul1, t9);
    			append_dev(ul1, li5);
    			append_dev(ul1, t11);
    			append_dev(ul1, li6);
    			append_dev(li6, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */
    const file$6 = "src/App.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const cloud = new Cloud({ $$inline: true });
    	const header = new Header({ $$inline: true });
    	const linkshorter = new LinkShorter({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(cloud.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(linkshorter.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "class", "svelte-1uv6kw4");
    			add_location(div, file$6, 24, 0, 663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(cloud, div, null);
    			append_dev(div, t0);
    			mount_component(header, div, null);
    			append_dev(div, t1);
    			mount_component(linkshorter, div, null);
    			append_dev(div, t2);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cloud.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(linkshorter.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cloud.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(linkshorter.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(cloud);
    			destroy_component(header);
    			destroy_component(linkshorter);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Cloud, Header, LinkShorter, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
