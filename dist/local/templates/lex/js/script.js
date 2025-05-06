(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.IMask = {}));
  })(this, (function (exports) { 'use strict';
  
    /** Checks if value is string */
    function isString(str) {
      return typeof str === 'string' || str instanceof String;
    }
  
    /** Checks if value is object */
    function isObject(obj) {
      var _obj$constructor;
      return typeof obj === 'object' && obj != null && (obj == null || (_obj$constructor = obj.constructor) == null ? void 0 : _obj$constructor.name) === 'Object';
    }
    function pick(obj, keys) {
      if (Array.isArray(keys)) return pick(obj, (_, k) => keys.includes(k));
      return Object.entries(obj).reduce((acc, _ref) => {
        let [k, v] = _ref;
        if (keys(v, k)) acc[k] = v;
        return acc;
      }, {});
    }
  
    /** Direction */
    const DIRECTION = {
      NONE: 'NONE',
      LEFT: 'LEFT',
      FORCE_LEFT: 'FORCE_LEFT',
      RIGHT: 'RIGHT',
      FORCE_RIGHT: 'FORCE_RIGHT'
    };
  
    /** Direction */
  
    function forceDirection(direction) {
      switch (direction) {
        case DIRECTION.LEFT:
          return DIRECTION.FORCE_LEFT;
        case DIRECTION.RIGHT:
          return DIRECTION.FORCE_RIGHT;
        default:
          return direction;
      }
    }
  
    /** Escapes regular expression control chars */
    function escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
    }
  
    // cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
    function objectIncludes(b, a) {
      if (a === b) return true;
      const arrA = Array.isArray(a),
        arrB = Array.isArray(b);
      let i;
      if (arrA && arrB) {
        if (a.length != b.length) return false;
        for (i = 0; i < a.length; i++) if (!objectIncludes(a[i], b[i])) return false;
        return true;
      }
      if (arrA != arrB) return false;
      if (a && b && typeof a === 'object' && typeof b === 'object') {
        const dateA = a instanceof Date,
          dateB = b instanceof Date;
        if (dateA && dateB) return a.getTime() == b.getTime();
        if (dateA != dateB) return false;
        const regexpA = a instanceof RegExp,
          regexpB = b instanceof RegExp;
        if (regexpA && regexpB) return a.toString() == b.toString();
        if (regexpA != regexpB) return false;
        const keys = Object.keys(a);
        // if (keys.length !== Object.keys(b).length) return false;
  
        for (i = 0; i < keys.length; i++) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = 0; i < keys.length; i++) if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
        return true;
      } else if (a && b && typeof a === 'function' && typeof b === 'function') {
        return a.toString() === b.toString();
      }
      return false;
    }
  
    /** Selection range */
  
    /** Provides details of changing input */
    class ActionDetails {
      /** Current input value */
  
      /** Current cursor position */
  
      /** Old input value */
  
      /** Old selection */
  
      constructor(opts) {
        Object.assign(this, opts);
  
        // double check if left part was changed (autofilling, other non-standard input triggers)
        while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
          --this.oldSelection.start;
        }
        if (this.insertedCount) {
          // double check right part
          while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) {
            if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end;else ++this.cursorPos;
          }
        }
      }
  
      /** Start changing position */
      get startChangePos() {
        return Math.min(this.cursorPos, this.oldSelection.start);
      }
  
      /** Inserted symbols count */
      get insertedCount() {
        return this.cursorPos - this.startChangePos;
      }
  
      /** Inserted symbols */
      get inserted() {
        return this.value.substr(this.startChangePos, this.insertedCount);
      }
  
      /** Removed symbols count */
      get removedCount() {
        // Math.max for opposite operation
        return Math.max(this.oldSelection.end - this.startChangePos ||
        // for Delete
        this.oldValue.length - this.value.length, 0);
      }
  
      /** Removed symbols */
      get removed() {
        return this.oldValue.substr(this.startChangePos, this.removedCount);
      }
  
      /** Unchanged head symbols */
      get head() {
        return this.value.substring(0, this.startChangePos);
      }
  
      /** Unchanged tail symbols */
      get tail() {
        return this.value.substring(this.startChangePos + this.insertedCount);
      }
  
      /** Remove direction */
      get removeDirection() {
        if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;
  
        // align right if delete at right
        return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) &&
        // if not range removed (event with backspace)
        this.oldSelection.end === this.oldSelection.start ? DIRECTION.RIGHT : DIRECTION.LEFT;
      }
    }
  
    /** Applies mask on element */
    function IMask(el, opts) {
      // currently available only for input-like elements
      return new IMask.InputMask(el, opts);
    }
  
    // TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
    // export function maskedClass(mask: string): typeof MaskedPattern;
    // export function maskedClass(mask: DateConstructor): typeof MaskedDate;
    // export function maskedClass(mask: NumberConstructor): typeof MaskedNumber;
    // export function maskedClass(mask: Array<any> | ArrayConstructor): typeof MaskedDynamic;
    // export function maskedClass(mask: MaskedDate): typeof MaskedDate;
    // export function maskedClass(mask: MaskedNumber): typeof MaskedNumber;
    // export function maskedClass(mask: MaskedEnum): typeof MaskedEnum;
    // export function maskedClass(mask: MaskedRange): typeof MaskedRange;
    // export function maskedClass(mask: MaskedRegExp): typeof MaskedRegExp;
    // export function maskedClass(mask: MaskedFunction): typeof MaskedFunction;
    // export function maskedClass(mask: MaskedPattern): typeof MaskedPattern;
    // export function maskedClass(mask: MaskedDynamic): typeof MaskedDynamic;
    // export function maskedClass(mask: Masked): typeof Masked;
    // export function maskedClass(mask: typeof Masked): typeof Masked;
    // export function maskedClass(mask: typeof MaskedDate): typeof MaskedDate;
    // export function maskedClass(mask: typeof MaskedNumber): typeof MaskedNumber;
    // export function maskedClass(mask: typeof MaskedEnum): typeof MaskedEnum;
    // export function maskedClass(mask: typeof MaskedRange): typeof MaskedRange;
    // export function maskedClass(mask: typeof MaskedRegExp): typeof MaskedRegExp;
    // export function maskedClass(mask: typeof MaskedFunction): typeof MaskedFunction;
    // export function maskedClass(mask: typeof MaskedPattern): typeof MaskedPattern;
    // export function maskedClass(mask: typeof MaskedDynamic): typeof MaskedDynamic;
    // export function maskedClass<Mask extends typeof Masked> (mask: Mask): Mask;
    // export function maskedClass(mask: RegExp): typeof MaskedRegExp;
    // export function maskedClass(mask: (value: string, ...args: any[]) => boolean): typeof MaskedFunction;
  
    /** Get Masked class by mask type */
    function maskedClass(mask) /* TODO */{
      if (mask == null) throw new Error('mask property should be defined');
      if (mask instanceof RegExp) return IMask.MaskedRegExp;
      if (isString(mask)) return IMask.MaskedPattern;
      if (mask === Date) return IMask.MaskedDate;
      if (mask === Number) return IMask.MaskedNumber;
      if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
      if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask;
      if (IMask.Masked && mask instanceof IMask.Masked) return mask.constructor;
      if (mask instanceof Function) return IMask.MaskedFunction;
      console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
      return IMask.Masked;
    }
    function normalizeOpts(opts) {
      if (!opts) throw new Error('Options in not defined');
      if (IMask.Masked) {
        if (opts.prototype instanceof IMask.Masked) return {
          mask: opts
        };
  
        /*
          handle cases like:
          1) opts = Masked
          2) opts = { mask: Masked, ...instanceOpts }
        */
        const {
          mask = undefined,
          ...instanceOpts
        } = opts instanceof IMask.Masked ? {
          mask: opts
        } : isObject(opts) && opts.mask instanceof IMask.Masked ? opts : {};
        if (mask) {
          const _mask = mask.mask;
          return {
            ...pick(mask, (_, k) => !k.startsWith('_')),
            mask: mask.constructor,
            _mask,
            ...instanceOpts
          };
        }
      }
      if (!isObject(opts)) return {
        mask: opts
      };
      return {
        ...opts
      };
    }
  
    // TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
  
    // From masked
    // export default function createMask<Opts extends Masked, ReturnMasked=Opts> (opts: Opts): ReturnMasked;
    // // From masked class
    // export default function createMask<Opts extends MaskedOptions<typeof Masked>, ReturnMasked extends Masked=InstanceType<Opts['mask']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedDate>, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedNumber>, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedEnum>, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedRange>, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedRegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedFunction>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedPattern>, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<typeof MaskedDynamic>, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
    // // From mask opts
    // export default function createMask<Opts extends MaskedOptions<Masked>, ReturnMasked=Opts extends MaskedOptions<infer M> ? M : never> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedNumberOptions, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedDateFactoryOptions, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedEnumOptions, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedRangeOptions, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedPatternOptions, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedDynamicOptions, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<RegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
    // export default function createMask<Opts extends MaskedOptions<Function>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
  
    /** Creates new {@link Masked} depending on mask type */
    function createMask(opts) {
      if (IMask.Masked && opts instanceof IMask.Masked) return opts;
      const nOpts = normalizeOpts(opts);
      const MaskedClass = maskedClass(nOpts.mask);
      if (!MaskedClass) throw new Error("Masked class is not found for provided mask " + nOpts.mask + ", appropriate module needs to be imported manually before creating mask.");
      if (nOpts.mask === MaskedClass) delete nOpts.mask;
      if (nOpts._mask) {
        nOpts.mask = nOpts._mask;
        delete nOpts._mask;
      }
      return new MaskedClass(nOpts);
    }
    IMask.createMask = createMask;
  
    /**  Generic element API to use with mask */
    class MaskElement {
      /** */
  
      /** */
  
      /** */
  
      /** Safely returns selection start */
      get selectionStart() {
        let start;
        try {
          start = this._unsafeSelectionStart;
        } catch {}
        return start != null ? start : this.value.length;
      }
  
      /** Safely returns selection end */
      get selectionEnd() {
        let end;
        try {
          end = this._unsafeSelectionEnd;
        } catch {}
        return end != null ? end : this.value.length;
      }
  
      /** Safely sets element selection */
      select(start, end) {
        if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;
        try {
          this._unsafeSelect(start, end);
        } catch {}
      }
  
      /** */
      get isActive() {
        return false;
      }
      /** */
  
      /** */
  
      /** */
    }
    IMask.MaskElement = MaskElement;
  
    const KEY_Z = 90;
    const KEY_Y = 89;
  
    /** Bridge between HTMLElement and {@link Masked} */
    class HTMLMaskElement extends MaskElement {
      /** HTMLElement to use mask on */
  
      constructor(input) {
        super();
        this.input = input;
        this._onKeydown = this._onKeydown.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onBeforeinput = this._onBeforeinput.bind(this);
        this._onCompositionEnd = this._onCompositionEnd.bind(this);
      }
      get rootElement() {
        var _this$input$getRootNo, _this$input$getRootNo2, _this$input;
        return (_this$input$getRootNo = (_this$input$getRootNo2 = (_this$input = this.input).getRootNode) == null ? void 0 : _this$input$getRootNo2.call(_this$input)) != null ? _this$input$getRootNo : document;
      }
  
      /** Is element in focus */
      get isActive() {
        return this.input === this.rootElement.activeElement;
      }
  
      /** Binds HTMLElement events to mask internal events */
      bindEvents(handlers) {
        this.input.addEventListener('keydown', this._onKeydown);
        this.input.addEventListener('input', this._onInput);
        this.input.addEventListener('beforeinput', this._onBeforeinput);
        this.input.addEventListener('compositionend', this._onCompositionEnd);
        this.input.addEventListener('drop', handlers.drop);
        this.input.addEventListener('click', handlers.click);
        this.input.addEventListener('focus', handlers.focus);
        this.input.addEventListener('blur', handlers.commit);
        this._handlers = handlers;
      }
      _onKeydown(e) {
        if (this._handlers.redo && (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey) || e.keyCode === KEY_Y && e.ctrlKey)) {
          e.preventDefault();
          return this._handlers.redo(e);
        }
        if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          return this._handlers.undo(e);
        }
        if (!e.isComposing) this._handlers.selectionChange(e);
      }
      _onBeforeinput(e) {
        if (e.inputType === 'historyUndo' && this._handlers.undo) {
          e.preventDefault();
          return this._handlers.undo(e);
        }
        if (e.inputType === 'historyRedo' && this._handlers.redo) {
          e.preventDefault();
          return this._handlers.redo(e);
        }
      }
      _onCompositionEnd(e) {
        this._handlers.input(e);
      }
      _onInput(e) {
        if (!e.isComposing) this._handlers.input(e);
      }
  
      /** Unbinds HTMLElement events to mask internal events */
      unbindEvents() {
        this.input.removeEventListener('keydown', this._onKeydown);
        this.input.removeEventListener('input', this._onInput);
        this.input.removeEventListener('beforeinput', this._onBeforeinput);
        this.input.removeEventListener('compositionend', this._onCompositionEnd);
        this.input.removeEventListener('drop', this._handlers.drop);
        this.input.removeEventListener('click', this._handlers.click);
        this.input.removeEventListener('focus', this._handlers.focus);
        this.input.removeEventListener('blur', this._handlers.commit);
        this._handlers = {};
      }
    }
    IMask.HTMLMaskElement = HTMLMaskElement;
  
    /** Bridge between InputElement and {@link Masked} */
    class HTMLInputMaskElement extends HTMLMaskElement {
      /** InputElement to use mask on */
  
      constructor(input) {
        super(input);
        this.input = input;
      }
  
      /** Returns InputElement selection start */
      get _unsafeSelectionStart() {
        return this.input.selectionStart != null ? this.input.selectionStart : this.value.length;
      }
  
      /** Returns InputElement selection end */
      get _unsafeSelectionEnd() {
        return this.input.selectionEnd;
      }
  
      /** Sets InputElement selection */
      _unsafeSelect(start, end) {
        this.input.setSelectionRange(start, end);
      }
      get value() {
        return this.input.value;
      }
      set value(value) {
        this.input.value = value;
      }
    }
    IMask.HTMLMaskElement = HTMLMaskElement;
  
    class HTMLContenteditableMaskElement extends HTMLMaskElement {
      /** Returns HTMLElement selection start */
      get _unsafeSelectionStart() {
        const root = this.rootElement;
        const selection = root.getSelection && root.getSelection();
        const anchorOffset = selection && selection.anchorOffset;
        const focusOffset = selection && selection.focusOffset;
        if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) {
          return anchorOffset;
        }
        return focusOffset;
      }
  
      /** Returns HTMLElement selection end */
      get _unsafeSelectionEnd() {
        const root = this.rootElement;
        const selection = root.getSelection && root.getSelection();
        const anchorOffset = selection && selection.anchorOffset;
        const focusOffset = selection && selection.focusOffset;
        if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) {
          return anchorOffset;
        }
        return focusOffset;
      }
  
      /** Sets HTMLElement selection */
      _unsafeSelect(start, end) {
        if (!this.rootElement.createRange) return;
        const range = this.rootElement.createRange();
        range.setStart(this.input.firstChild || this.input, start);
        range.setEnd(this.input.lastChild || this.input, end);
        const root = this.rootElement;
        const selection = root.getSelection && root.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
  
      /** HTMLElement value */
      get value() {
        return this.input.textContent || '';
      }
      set value(value) {
        this.input.textContent = value;
      }
    }
    IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
  
    class InputHistory {
      constructor() {
        this.states = [];
        this.currentIndex = 0;
      }
      get currentState() {
        return this.states[this.currentIndex];
      }
      get isEmpty() {
        return this.states.length === 0;
      }
      push(state) {
        // if current index points before the last element then remove the future
        if (this.currentIndex < this.states.length - 1) this.states.length = this.currentIndex + 1;
        this.states.push(state);
        if (this.states.length > InputHistory.MAX_LENGTH) this.states.shift();
        this.currentIndex = this.states.length - 1;
      }
      go(steps) {
        this.currentIndex = Math.min(Math.max(this.currentIndex + steps, 0), this.states.length - 1);
        return this.currentState;
      }
      undo() {
        return this.go(-1);
      }
      redo() {
        return this.go(+1);
      }
      clear() {
        this.states.length = 0;
        this.currentIndex = 0;
      }
    }
    InputHistory.MAX_LENGTH = 100;
  
    /** Listens to element events and controls changes between element and {@link Masked} */
    class InputMask {
      /**
        View element
      */
  
      /** Internal {@link Masked} model */
  
      constructor(el, opts) {
        this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLInputMaskElement(el);
        this.masked = createMask(opts);
        this._listeners = {};
        this._value = '';
        this._unmaskedValue = '';
        this._rawInputValue = '';
        this.history = new InputHistory();
        this._saveSelection = this._saveSelection.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onDrop = this._onDrop.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onUndo = this._onUndo.bind(this);
        this._onRedo = this._onRedo.bind(this);
        this.alignCursor = this.alignCursor.bind(this);
        this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
        this._bindEvents();
  
        // refresh
        this.updateValue();
        this._onChange();
      }
      maskEquals(mask) {
        var _this$masked;
        return mask == null || ((_this$masked = this.masked) == null ? void 0 : _this$masked.maskEquals(mask));
      }
  
      /** Masked */
      get mask() {
        return this.masked.mask;
      }
      set mask(mask) {
        if (this.maskEquals(mask)) return;
        if (!(mask instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
          // TODO "any" no idea
          this.masked.updateOptions({
            mask
          });
          return;
        }
        const masked = mask instanceof IMask.Masked ? mask : createMask({
          mask
        });
        masked.unmaskedValue = this.masked.unmaskedValue;
        this.masked = masked;
      }
  
      /** Raw value */
      get value() {
        return this._value;
      }
      set value(str) {
        if (this.value === str) return;
        this.masked.value = str;
        this.updateControl('auto');
      }
  
      /** Unmasked value */
      get unmaskedValue() {
        return this._unmaskedValue;
      }
      set unmaskedValue(str) {
        if (this.unmaskedValue === str) return;
        this.masked.unmaskedValue = str;
        this.updateControl('auto');
      }
  
      /** Raw input value */
      get rawInputValue() {
        return this._rawInputValue;
      }
      set rawInputValue(str) {
        if (this.rawInputValue === str) return;
        this.masked.rawInputValue = str;
        this.updateControl();
        this.alignCursor();
      }
  
      /** Typed unmasked value */
      get typedValue() {
        return this.masked.typedValue;
      }
      set typedValue(val) {
        if (this.masked.typedValueEquals(val)) return;
        this.masked.typedValue = val;
        this.updateControl('auto');
      }
  
      /** Display value */
      get displayValue() {
        return this.masked.displayValue;
      }
  
      /** Starts listening to element events */
      _bindEvents() {
        this.el.bindEvents({
          selectionChange: this._saveSelection,
          input: this._onInput,
          drop: this._onDrop,
          click: this._onClick,
          focus: this._onFocus,
          commit: this._onChange,
          undo: this._onUndo,
          redo: this._onRedo
        });
      }
  
      /** Stops listening to element events */
      _unbindEvents() {
        if (this.el) this.el.unbindEvents();
      }
  
      /** Fires custom event */
      _fireEvent(ev, e) {
        const listeners = this._listeners[ev];
        if (!listeners) return;
        listeners.forEach(l => l(e));
      }
  
      /** Current selection start */
      get selectionStart() {
        return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
      }
  
      /** Current cursor position */
      get cursorPos() {
        return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
      }
      set cursorPos(pos) {
        if (!this.el || !this.el.isActive) return;
        this.el.select(pos, pos);
        this._saveSelection();
      }
  
      /** Stores current selection */
      _saveSelection( /* ev */
      ) {
        if (this.displayValue !== this.el.value) {
          console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
        }
        this._selection = {
          start: this.selectionStart,
          end: this.cursorPos
        };
      }
  
      /** Syncronizes model value from view */
      updateValue() {
        this.masked.value = this.el.value;
        this._value = this.masked.value;
        this._unmaskedValue = this.masked.unmaskedValue;
        this._rawInputValue = this.masked.rawInputValue;
      }
  
      /** Syncronizes view from model value, fires change events */
      updateControl(cursorPos) {
        const newUnmaskedValue = this.masked.unmaskedValue;
        const newValue = this.masked.value;
        const newRawInputValue = this.masked.rawInputValue;
        const newDisplayValue = this.displayValue;
        const isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue || this._rawInputValue !== newRawInputValue;
        this._unmaskedValue = newUnmaskedValue;
        this._value = newValue;
        this._rawInputValue = newRawInputValue;
        if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
        if (cursorPos === 'auto') this.alignCursor();else if (cursorPos != null) this.cursorPos = cursorPos;
        if (isChanged) this._fireChangeEvents();
        if (!this._historyChanging && (isChanged || this.history.isEmpty)) this.history.push({
          unmaskedValue: newUnmaskedValue,
          selection: {
            start: this.selectionStart,
            end: this.cursorPos
          }
        });
      }
  
      /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
      updateOptions(opts) {
        const {
          mask,
          ...restOpts
        } = opts; // TODO types, yes, mask is optional
  
        const updateMask = !this.maskEquals(mask);
        const updateOpts = this.masked.optionsIsChanged(restOpts);
        if (updateMask) this.mask = mask;
        if (updateOpts) this.masked.updateOptions(restOpts); // TODO
  
        if (updateMask || updateOpts) this.updateControl();
      }
  
      /** Updates cursor */
      updateCursor(cursorPos) {
        if (cursorPos == null) return;
        this.cursorPos = cursorPos;
  
        // also queue change cursor for mobile browsers
        this._delayUpdateCursor(cursorPos);
      }
  
      /** Delays cursor update to support mobile browsers */
      _delayUpdateCursor(cursorPos) {
        this._abortUpdateCursor();
        this._changingCursorPos = cursorPos;
        this._cursorChanging = setTimeout(() => {
          if (!this.el) return; // if was destroyed
          this.cursorPos = this._changingCursorPos;
          this._abortUpdateCursor();
        }, 10);
      }
  
      /** Fires custom events */
      _fireChangeEvents() {
        this._fireEvent('accept', this._inputEvent);
        if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
      }
  
      /** Aborts delayed cursor update */
      _abortUpdateCursor() {
        if (this._cursorChanging) {
          clearTimeout(this._cursorChanging);
          delete this._cursorChanging;
        }
      }
  
      /** Aligns cursor to nearest available position */
      alignCursor() {
        this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
      }
  
      /** Aligns cursor only if selection is empty */
      alignCursorFriendly() {
        if (this.selectionStart !== this.cursorPos) return; // skip if range is selected
        this.alignCursor();
      }
  
      /** Adds listener on custom event */
      on(ev, handler) {
        if (!this._listeners[ev]) this._listeners[ev] = [];
        this._listeners[ev].push(handler);
        return this;
      }
  
      /** Removes custom event listener */
      off(ev, handler) {
        if (!this._listeners[ev]) return this;
        if (!handler) {
          delete this._listeners[ev];
          return this;
        }
        const hIndex = this._listeners[ev].indexOf(handler);
        if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
        return this;
      }
  
      /** Handles view input event */
      _onInput(e) {
        this._inputEvent = e;
        this._abortUpdateCursor();
        const details = new ActionDetails({
          // new state
          value: this.el.value,
          cursorPos: this.cursorPos,
          // old state
          oldValue: this.displayValue,
          oldSelection: this._selection
        });
        const oldRawValue = this.masked.rawInputValue;
        const offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection, {
          input: true,
          raw: true
        }).offset;
  
        // force align in remove direction only if no input chars were removed
        // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
        const removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
        let cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
        if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);
        this.updateControl(cursorPos);
        delete this._inputEvent;
      }
  
      /** Handles view change event and commits model value */
      _onChange() {
        if (this.displayValue !== this.el.value) this.updateValue();
        this.masked.doCommit();
        this.updateControl();
        this._saveSelection();
      }
  
      /** Handles view drop event, prevents by default */
      _onDrop(ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
  
      /** Restore last selection on focus */
      _onFocus(ev) {
        this.alignCursorFriendly();
      }
  
      /** Restore last selection on focus */
      _onClick(ev) {
        this.alignCursorFriendly();
      }
      _onUndo() {
        this._applyHistoryState(this.history.undo());
      }
      _onRedo() {
        this._applyHistoryState(this.history.redo());
      }
      _applyHistoryState(state) {
        if (!state) return;
        this._historyChanging = true;
        this.unmaskedValue = state.unmaskedValue;
        this.el.select(state.selection.start, state.selection.end);
        this._saveSelection();
        this._historyChanging = false;
      }
  
      /** Unbind view events and removes element reference */
      destroy() {
        this._unbindEvents();
        this._listeners.length = 0;
        delete this.el;
      }
    }
    IMask.InputMask = InputMask;
  
    /** Provides details of changing model value */
    class ChangeDetails {
      /** Inserted symbols */
  
      /** Additional offset if any changes occurred before tail */
  
      /** Raw inserted is used by dynamic mask */
  
      /** Can skip chars */
  
      static normalize(prep) {
        return Array.isArray(prep) ? prep : [prep, new ChangeDetails()];
      }
      constructor(details) {
        Object.assign(this, {
          inserted: '',
          rawInserted: '',
          tailShift: 0,
          skip: false
        }, details);
      }
  
      /** Aggregate changes */
      aggregate(details) {
        this.inserted += details.inserted;
        this.rawInserted += details.rawInserted;
        this.tailShift += details.tailShift;
        this.skip = this.skip || details.skip;
        return this;
      }
  
      /** Total offset considering all changes */
      get offset() {
        return this.tailShift + this.inserted.length;
      }
      get consumed() {
        return Boolean(this.rawInserted) || this.skip;
      }
      equals(details) {
        return this.inserted === details.inserted && this.tailShift === details.tailShift && this.rawInserted === details.rawInserted && this.skip === details.skip;
      }
    }
    IMask.ChangeDetails = ChangeDetails;
  
    /** Provides details of continuous extracted tail */
    class ContinuousTailDetails {
      /** Tail value as string */
  
      /** Tail start position */
  
      /** Start position */
  
      constructor(value, from, stop) {
        if (value === void 0) {
          value = '';
        }
        if (from === void 0) {
          from = 0;
        }
        this.value = value;
        this.from = from;
        this.stop = stop;
      }
      toString() {
        return this.value;
      }
      extend(tail) {
        this.value += String(tail);
      }
      appendTo(masked) {
        return masked.append(this.toString(), {
          tail: true
        }).aggregate(masked._appendPlaceholder());
      }
      get state() {
        return {
          value: this.value,
          from: this.from,
          stop: this.stop
        };
      }
      set state(state) {
        Object.assign(this, state);
      }
      unshift(beforePos) {
        if (!this.value.length || beforePos != null && this.from >= beforePos) return '';
        const shiftChar = this.value[0];
        this.value = this.value.slice(1);
        return shiftChar;
      }
      shift() {
        if (!this.value.length) return '';
        const shiftChar = this.value[this.value.length - 1];
        this.value = this.value.slice(0, -1);
        return shiftChar;
      }
    }
  
    /** Append flags */
  
    /** Extract flags */
  
    // see https://github.com/microsoft/TypeScript/issues/6223
  
    /** Provides common masking stuff */
    class Masked {
      /** */
  
      /** */
  
      /** Transforms value before mask processing */
  
      /** Transforms each char before mask processing */
  
      /** Validates if value is acceptable */
  
      /** Does additional processing at the end of editing */
  
      /** Format typed value to string */
  
      /** Parse string to get typed value */
  
      /** Enable characters overwriting */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      constructor(opts) {
        this._value = '';
        this._update({
          ...Masked.DEFAULTS,
          ...opts
        });
        this._initialized = true;
      }
  
      /** Sets and applies new options */
      updateOptions(opts) {
        if (!this.optionsIsChanged(opts)) return;
        this.withValueRefresh(this._update.bind(this, opts));
      }
  
      /** Sets new options */
      _update(opts) {
        Object.assign(this, opts);
      }
  
      /** Mask state */
      get state() {
        return {
          _value: this.value,
          _rawInputValue: this.rawInputValue
        };
      }
      set state(state) {
        this._value = state._value;
      }
  
      /** Resets value */
      reset() {
        this._value = '';
      }
      get value() {
        return this._value;
      }
      set value(value) {
        this.resolve(value, {
          input: true
        });
      }
  
      /** Resolve new value */
      resolve(value, flags) {
        if (flags === void 0) {
          flags = {
            input: true
          };
        }
        this.reset();
        this.append(value, flags, '');
        this.doCommit();
      }
      get unmaskedValue() {
        return this.value;
      }
      set unmaskedValue(value) {
        this.resolve(value, {});
      }
      get typedValue() {
        return this.parse ? this.parse(this.value, this) : this.unmaskedValue;
      }
      set typedValue(value) {
        if (this.format) {
          this.value = this.format(value, this);
        } else {
          this.unmaskedValue = String(value);
        }
      }
  
      /** Value that includes raw user input */
      get rawInputValue() {
        return this.extractInput(0, this.displayValue.length, {
          raw: true
        });
      }
      set rawInputValue(value) {
        this.resolve(value, {
          raw: true
        });
      }
      get displayValue() {
        return this.value;
      }
      get isComplete() {
        return true;
      }
      get isFilled() {
        return this.isComplete;
      }
  
      /** Finds nearest input position in direction */
      nearestInputPos(cursorPos, direction) {
        return cursorPos;
      }
      totalInputPositions(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        return Math.min(this.displayValue.length, toPos - fromPos);
      }
  
      /** Extracts value in range considering flags */
      extractInput(fromPos, toPos, flags) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        return this.displayValue.slice(fromPos, toPos);
      }
  
      /** Extracts tail in range */
      extractTail(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
      }
  
      /** Appends tail */
      appendTail(tail) {
        if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
        return tail.appendTo(this);
      }
  
      /** Appends char */
      _appendCharRaw(ch, flags) {
        if (!ch) return new ChangeDetails();
        this._value += ch;
        return new ChangeDetails({
          inserted: ch,
          rawInserted: ch
        });
      }
  
      /** Appends char */
      _appendChar(ch, flags, checkTail) {
        if (flags === void 0) {
          flags = {};
        }
        const consistentState = this.state;
        let details;
        [ch, details] = this.doPrepareChar(ch, flags);
        if (ch) {
          details = details.aggregate(this._appendCharRaw(ch, flags));
  
          // TODO handle `skip`?
  
          // try `autofix` lookahead
          if (!details.rawInserted && this.autofix === 'pad') {
            const noFixState = this.state;
            this.state = consistentState;
            let fixDetails = this.pad(flags);
            const chDetails = this._appendCharRaw(ch, flags);
            fixDetails = fixDetails.aggregate(chDetails);
  
            // if fix was applied or
            // if details are equal use skip restoring state optimization
            if (chDetails.rawInserted || fixDetails.equals(details)) {
              details = fixDetails;
            } else {
              this.state = noFixState;
            }
          }
        }
        if (details.inserted) {
          let consistentTail;
          let appended = this.doValidate(flags) !== false;
          if (appended && checkTail != null) {
            // validation ok, check tail
            const beforeTailState = this.state;
            if (this.overwrite === true) {
              consistentTail = checkTail.state;
              for (let i = 0; i < details.rawInserted.length; ++i) {
                checkTail.unshift(this.displayValue.length - details.tailShift);
              }
            }
            let tailDetails = this.appendTail(checkTail);
            appended = tailDetails.rawInserted.length === checkTail.toString().length;
  
            // not ok, try shift
            if (!(appended && tailDetails.inserted) && this.overwrite === 'shift') {
              this.state = beforeTailState;
              consistentTail = checkTail.state;
              for (let i = 0; i < details.rawInserted.length; ++i) {
                checkTail.shift();
              }
              tailDetails = this.appendTail(checkTail);
              appended = tailDetails.rawInserted.length === checkTail.toString().length;
            }
  
            // if ok, rollback state after tail
            if (appended && tailDetails.inserted) this.state = beforeTailState;
          }
  
          // revert all if something went wrong
          if (!appended) {
            details = new ChangeDetails();
            this.state = consistentState;
            if (checkTail && consistentTail) checkTail.state = consistentTail;
          }
        }
        return details;
      }
  
      /** Appends optional placeholder at the end */
      _appendPlaceholder() {
        return new ChangeDetails();
      }
  
      /** Appends optional eager placeholder at the end */
      _appendEager() {
        return new ChangeDetails();
      }
  
      /** Appends symbols considering flags */
      append(str, flags, tail) {
        if (!isString(str)) throw new Error('value should be string');
        const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
        if (flags != null && flags.tail) flags._beforeTailState = this.state;
        let details;
        [str, details] = this.doPrepare(str, flags);
        for (let ci = 0; ci < str.length; ++ci) {
          const d = this._appendChar(str[ci], flags, checkTail);
          if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
          details.aggregate(d);
        }
        if ((this.eager === true || this.eager === 'append') && flags != null && flags.input && str) {
          details.aggregate(this._appendEager());
        }
  
        // append tail but aggregate only tailShift
        if (checkTail != null) {
          details.tailShift += this.appendTail(checkTail).tailShift;
          // TODO it's a good idea to clear state after appending ends
          // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
          // this._resetBeforeTailState();
        }
        return details;
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        this._value = this.displayValue.slice(0, fromPos) + this.displayValue.slice(toPos);
        return new ChangeDetails();
      }
  
      /** Calls function and reapplies current value */
      withValueRefresh(fn) {
        if (this._refreshing || !this._initialized) return fn();
        this._refreshing = true;
        const rawInput = this.rawInputValue;
        const value = this.value;
        const ret = fn();
        this.rawInputValue = rawInput;
        // append lost trailing chars at the end
        if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
          this.append(value.slice(this.displayValue.length), {}, '');
          this.doCommit();
        }
        delete this._refreshing;
        return ret;
      }
      runIsolated(fn) {
        if (this._isolated || !this._initialized) return fn(this);
        this._isolated = true;
        const state = this.state;
        const ret = fn(this);
        this.state = state;
        delete this._isolated;
        return ret;
      }
      doSkipInvalid(ch, flags, checkTail) {
        return Boolean(this.skipInvalid);
      }
  
      /** Prepares string before mask processing */
      doPrepare(str, flags) {
        if (flags === void 0) {
          flags = {};
        }
        return ChangeDetails.normalize(this.prepare ? this.prepare(str, this, flags) : str);
      }
  
      /** Prepares each char before mask processing */
      doPrepareChar(str, flags) {
        if (flags === void 0) {
          flags = {};
        }
        return ChangeDetails.normalize(this.prepareChar ? this.prepareChar(str, this, flags) : str);
      }
  
      /** Validates if value is acceptable */
      doValidate(flags) {
        return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
      }
  
      /** Does additional processing at the end of editing */
      doCommit() {
        if (this.commit) this.commit(this.value, this);
      }
      splice(start, deleteCount, inserted, removeDirection, flags) {
        if (inserted === void 0) {
          inserted = '';
        }
        if (removeDirection === void 0) {
          removeDirection = DIRECTION.NONE;
        }
        if (flags === void 0) {
          flags = {
            input: true
          };
        }
        const tailPos = start + deleteCount;
        const tail = this.extractTail(tailPos);
        const eagerRemove = this.eager === true || this.eager === 'remove';
        let oldRawValue;
        if (eagerRemove) {
          removeDirection = forceDirection(removeDirection);
          oldRawValue = this.extractInput(0, tailPos, {
            raw: true
          });
        }
        let startChangePos = start;
        const details = new ChangeDetails();
  
        // if it is just deletion without insertion
        if (removeDirection !== DIRECTION.NONE) {
          startChangePos = this.nearestInputPos(start, deleteCount > 1 && start !== 0 && !eagerRemove ? DIRECTION.NONE : removeDirection);
  
          // adjust tailShift if start was aligned
          details.tailShift = startChangePos - start;
        }
        details.aggregate(this.remove(startChangePos));
        if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) {
          if (removeDirection === DIRECTION.FORCE_LEFT) {
            let valLength;
            while (oldRawValue === this.rawInputValue && (valLength = this.displayValue.length)) {
              details.aggregate(new ChangeDetails({
                tailShift: -1
              })).aggregate(this.remove(valLength - 1));
            }
          } else if (removeDirection === DIRECTION.FORCE_RIGHT) {
            tail.unshift();
          }
        }
        return details.aggregate(this.append(inserted, flags, tail));
      }
      maskEquals(mask) {
        return this.mask === mask;
      }
      optionsIsChanged(opts) {
        return !objectIncludes(this, opts);
      }
      typedValueEquals(value) {
        const tval = this.typedValue;
        return value === tval || Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) || (this.format ? this.format(value, this) === this.format(this.typedValue, this) : false);
      }
      pad(flags) {
        return new ChangeDetails();
      }
    }
    Masked.DEFAULTS = {
      skipInvalid: true
    };
    Masked.EMPTY_VALUES = [undefined, null, ''];
    IMask.Masked = Masked;
  
    class ChunksTailDetails {
      /** */
  
      constructor(chunks, from) {
        if (chunks === void 0) {
          chunks = [];
        }
        if (from === void 0) {
          from = 0;
        }
        this.chunks = chunks;
        this.from = from;
      }
      toString() {
        return this.chunks.map(String).join('');
      }
      extend(tailChunk) {
        if (!String(tailChunk)) return;
        tailChunk = isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk;
        const lastChunk = this.chunks[this.chunks.length - 1];
        const extendLast = lastChunk && (
        // if stops are same or tail has no stop
        lastChunk.stop === tailChunk.stop || tailChunk.stop == null) &&
        // if tail chunk goes just after last chunk
        tailChunk.from === lastChunk.from + lastChunk.toString().length;
        if (tailChunk instanceof ContinuousTailDetails) {
          // check the ability to extend previous chunk
          if (extendLast) {
            // extend previous chunk
            lastChunk.extend(tailChunk.toString());
          } else {
            // append new chunk
            this.chunks.push(tailChunk);
          }
        } else if (tailChunk instanceof ChunksTailDetails) {
          if (tailChunk.stop == null) {
            // unwrap floating chunks to parent, keeping `from` pos
            let firstTailChunk;
            while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
              firstTailChunk = tailChunk.chunks.shift(); // not possible to be `undefined` because length was checked above
              firstTailChunk.from += tailChunk.from;
              this.extend(firstTailChunk);
            }
          }
  
          // if tail chunk still has value
          if (tailChunk.toString()) {
            // if chunks contains stops, then popup stop to container
            tailChunk.stop = tailChunk.blockIndex;
            this.chunks.push(tailChunk);
          }
        }
      }
      appendTo(masked) {
        if (!(masked instanceof IMask.MaskedPattern)) {
          const tail = new ContinuousTailDetails(this.toString());
          return tail.appendTo(masked);
        }
        const details = new ChangeDetails();
        for (let ci = 0; ci < this.chunks.length; ++ci) {
          const chunk = this.chunks[ci];
          const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
          const stop = chunk.stop;
          let chunkBlock;
          if (stop != null && (
          // if block not found or stop is behind lastBlock
          !lastBlockIter || lastBlockIter.index <= stop)) {
            if (chunk instanceof ChunksTailDetails ||
            // for continuous block also check if stop is exist
            masked._stops.indexOf(stop) >= 0) {
              details.aggregate(masked._appendPlaceholder(stop));
            }
            chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
          }
          if (chunkBlock) {
            const tailDetails = chunkBlock.appendTail(chunk);
            details.aggregate(tailDetails);
  
            // get not inserted chars
            const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
            if (remainChars) details.aggregate(masked.append(remainChars, {
              tail: true
            }));
          } else {
            details.aggregate(masked.append(chunk.toString(), {
              tail: true
            }));
          }
        }
        return details;
      }
      get state() {
        return {
          chunks: this.chunks.map(c => c.state),
          from: this.from,
          stop: this.stop,
          blockIndex: this.blockIndex
        };
      }
      set state(state) {
        const {
          chunks,
          ...props
        } = state;
        Object.assign(this, props);
        this.chunks = chunks.map(cstate => {
          const chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails();
          chunk.state = cstate;
          return chunk;
        });
      }
      unshift(beforePos) {
        if (!this.chunks.length || beforePos != null && this.from >= beforePos) return '';
        const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
        let ci = 0;
        while (ci < this.chunks.length) {
          const chunk = this.chunks[ci];
          const shiftChar = chunk.unshift(chunkShiftPos);
          if (chunk.toString()) {
            // chunk still contains value
            // but not shifted - means no more available chars to shift
            if (!shiftChar) break;
            ++ci;
          } else {
            // clean if chunk has no value
            this.chunks.splice(ci, 1);
          }
          if (shiftChar) return shiftChar;
        }
        return '';
      }
      shift() {
        if (!this.chunks.length) return '';
        let ci = this.chunks.length - 1;
        while (0 <= ci) {
          const chunk = this.chunks[ci];
          const shiftChar = chunk.shift();
          if (chunk.toString()) {
            // chunk still contains value
            // but not shifted - means no more available chars to shift
            if (!shiftChar) break;
            --ci;
          } else {
            // clean if chunk has no value
            this.chunks.splice(ci, 1);
          }
          if (shiftChar) return shiftChar;
        }
        return '';
      }
    }
  
    class PatternCursor {
      constructor(masked, pos) {
        this.masked = masked;
        this._log = [];
        const {
          offset,
          index
        } = masked._mapPosToBlock(pos) || (pos < 0 ?
        // first
        {
          index: 0,
          offset: 0
        } :
        // last
        {
          index: this.masked._blocks.length,
          offset: 0
        });
        this.offset = offset;
        this.index = index;
        this.ok = false;
      }
      get block() {
        return this.masked._blocks[this.index];
      }
      get pos() {
        return this.masked._blockStartPos(this.index) + this.offset;
      }
      get state() {
        return {
          index: this.index,
          offset: this.offset,
          ok: this.ok
        };
      }
      set state(s) {
        Object.assign(this, s);
      }
      pushState() {
        this._log.push(this.state);
      }
      popState() {
        const s = this._log.pop();
        if (s) this.state = s;
        return s;
      }
      bindBlock() {
        if (this.block) return;
        if (this.index < 0) {
          this.index = 0;
          this.offset = 0;
        }
        if (this.index >= this.masked._blocks.length) {
          this.index = this.masked._blocks.length - 1;
          this.offset = this.block.displayValue.length; // TODO this is stupid type error, `block` depends on index that was changed above
        }
      }
      _pushLeft(fn) {
        this.pushState();
        for (this.bindBlock(); 0 <= this.index; --this.index, this.offset = ((_this$block = this.block) == null ? void 0 : _this$block.displayValue.length) || 0) {
          var _this$block;
          if (fn()) return this.ok = true;
        }
        return this.ok = false;
      }
      _pushRight(fn) {
        this.pushState();
        for (this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) {
          if (fn()) return this.ok = true;
        }
        return this.ok = false;
      }
      pushLeftBeforeFilled() {
        return this._pushLeft(() => {
          if (this.block.isFixed || !this.block.value) return;
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
          if (this.offset !== 0) return true;
        });
      }
      pushLeftBeforeInput() {
        // cases:
        // filled input: 00|
        // optional empty input: 00[]|
        // nested block: XX<[]>|
        return this._pushLeft(() => {
          if (this.block.isFixed) return;
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
          return true;
        });
      }
      pushLeftBeforeRequired() {
        return this._pushLeft(() => {
          if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
          return true;
        });
      }
      pushRightBeforeFilled() {
        return this._pushRight(() => {
          if (this.block.isFixed || !this.block.value) return;
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
          if (this.offset !== this.block.value.length) return true;
        });
      }
      pushRightBeforeInput() {
        return this._pushRight(() => {
          if (this.block.isFixed) return;
  
          // const o = this.offset;
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
          // HACK cases like (STILL DOES NOT WORK FOR NESTED)
          // aa|X
          // aa<X|[]>X_    - this will not work
          // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
          return true;
        });
      }
      pushRightBeforeRequired() {
        return this._pushRight(() => {
          if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
  
          // TODO check |[*]XX_
          this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
          return true;
        });
      }
    }
  
    class PatternFixedDefinition {
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      constructor(opts) {
        Object.assign(this, opts);
        this._value = '';
        this.isFixed = true;
      }
      get value() {
        return this._value;
      }
      get unmaskedValue() {
        return this.isUnmasking ? this.value : '';
      }
      get rawInputValue() {
        return this._isRawInput ? this.value : '';
      }
      get displayValue() {
        return this.value;
      }
      reset() {
        this._isRawInput = false;
        this._value = '';
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this._value.length;
        }
        this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
        if (!this._value) this._isRawInput = false;
        return new ChangeDetails();
      }
      nearestInputPos(cursorPos, direction) {
        if (direction === void 0) {
          direction = DIRECTION.NONE;
        }
        const minPos = 0;
        const maxPos = this._value.length;
        switch (direction) {
          case DIRECTION.LEFT:
          case DIRECTION.FORCE_LEFT:
            return minPos;
          case DIRECTION.NONE:
          case DIRECTION.RIGHT:
          case DIRECTION.FORCE_RIGHT:
          default:
            return maxPos;
        }
      }
      totalInputPositions(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this._value.length;
        }
        return this._isRawInput ? toPos - fromPos : 0;
      }
      extractInput(fromPos, toPos, flags) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this._value.length;
        }
        if (flags === void 0) {
          flags = {};
        }
        return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
      }
      get isComplete() {
        return true;
      }
      get isFilled() {
        return Boolean(this._value);
      }
      _appendChar(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        if (this.isFilled) return new ChangeDetails();
        const appendEager = this.eager === true || this.eager === 'append';
        const appended = this.char === ch;
        const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && (!flags.raw || !appendEager) && !flags.tail;
        const details = new ChangeDetails({
          inserted: this.char,
          rawInserted: isResolved ? this.char : ''
        });
        this._value = this.char;
        this._isRawInput = isResolved && (flags.raw || flags.input);
        return details;
      }
      _appendEager() {
        return this._appendChar(this.char, {
          tail: true
        });
      }
      _appendPlaceholder() {
        const details = new ChangeDetails();
        if (this.isFilled) return details;
        this._value = details.inserted = this.char;
        return details;
      }
      extractTail() {
        return new ContinuousTailDetails('');
      }
      appendTail(tail) {
        if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
        return tail.appendTo(this);
      }
      append(str, flags, tail) {
        const details = this._appendChar(str[0], flags);
        if (tail != null) {
          details.tailShift += this.appendTail(tail).tailShift;
        }
        return details;
      }
      doCommit() {}
      get state() {
        return {
          _value: this._value,
          _rawInputValue: this.rawInputValue
        };
      }
      set state(state) {
        this._value = state._value;
        this._isRawInput = Boolean(state._rawInputValue);
      }
      pad(flags) {
        return this._appendPlaceholder();
      }
    }
  
    class PatternInputDefinition {
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      /** */
  
      constructor(opts) {
        const {
          parent,
          isOptional,
          placeholderChar,
          displayChar,
          lazy,
          eager,
          ...maskOpts
        } = opts;
        this.masked = createMask(maskOpts);
        Object.assign(this, {
          parent,
          isOptional,
          placeholderChar,
          displayChar,
          lazy,
          eager
        });
      }
      reset() {
        this.isFilled = false;
        this.masked.reset();
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.value.length;
        }
        if (fromPos === 0 && toPos >= 1) {
          this.isFilled = false;
          return this.masked.remove(fromPos, toPos);
        }
        return new ChangeDetails();
      }
      get value() {
        return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : '');
      }
      get unmaskedValue() {
        return this.masked.unmaskedValue;
      }
      get rawInputValue() {
        return this.masked.rawInputValue;
      }
      get displayValue() {
        return this.masked.value && this.displayChar || this.value;
      }
      get isComplete() {
        return Boolean(this.masked.value) || this.isOptional;
      }
      _appendChar(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        if (this.isFilled) return new ChangeDetails();
        const state = this.masked.state;
        // simulate input
        let details = this.masked._appendChar(ch, this.currentMaskFlags(flags));
        if (details.inserted && this.doValidate(flags) === false) {
          details = new ChangeDetails();
          this.masked.state = state;
        }
        if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
          details.inserted = this.placeholderChar;
        }
        details.skip = !details.inserted && !this.isOptional;
        this.isFilled = Boolean(details.inserted);
        return details;
      }
      append(str, flags, tail) {
        // TODO probably should be done via _appendChar
        return this.masked.append(str, this.currentMaskFlags(flags), tail);
      }
      _appendPlaceholder() {
        if (this.isFilled || this.isOptional) return new ChangeDetails();
        this.isFilled = true;
        return new ChangeDetails({
          inserted: this.placeholderChar
        });
      }
      _appendEager() {
        return new ChangeDetails();
      }
      extractTail(fromPos, toPos) {
        return this.masked.extractTail(fromPos, toPos);
      }
      appendTail(tail) {
        return this.masked.appendTail(tail);
      }
      extractInput(fromPos, toPos, flags) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.value.length;
        }
        return this.masked.extractInput(fromPos, toPos, flags);
      }
      nearestInputPos(cursorPos, direction) {
        if (direction === void 0) {
          direction = DIRECTION.NONE;
        }
        const minPos = 0;
        const maxPos = this.value.length;
        const boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);
        switch (direction) {
          case DIRECTION.LEFT:
          case DIRECTION.FORCE_LEFT:
            return this.isComplete ? boundPos : minPos;
          case DIRECTION.RIGHT:
          case DIRECTION.FORCE_RIGHT:
            return this.isComplete ? boundPos : maxPos;
          case DIRECTION.NONE:
          default:
            return boundPos;
        }
      }
      totalInputPositions(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.value.length;
        }
        return this.value.slice(fromPos, toPos).length;
      }
      doValidate(flags) {
        return this.masked.doValidate(this.currentMaskFlags(flags)) && (!this.parent || this.parent.doValidate(this.currentMaskFlags(flags)));
      }
      doCommit() {
        this.masked.doCommit();
      }
      get state() {
        return {
          _value: this.value,
          _rawInputValue: this.rawInputValue,
          masked: this.masked.state,
          isFilled: this.isFilled
        };
      }
      set state(state) {
        this.masked.state = state.masked;
        this.isFilled = state.isFilled;
      }
      currentMaskFlags(flags) {
        var _flags$_beforeTailSta;
        return {
          ...flags,
          _beforeTailState: (flags == null || (_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.masked) || (flags == null ? void 0 : flags._beforeTailState)
        };
      }
      pad(flags) {
        return new ChangeDetails();
      }
    }
    PatternInputDefinition.DEFAULT_DEFINITIONS = {
      '0': /\d/,
      'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      // http://stackoverflow.com/a/22075070
      '*': /./
    };
  
    /** Masking by RegExp */
    class MaskedRegExp extends Masked {
      /** */
  
      /** Enable characters overwriting */
  
      /** */
  
      /** */
  
      /** */
  
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        const mask = opts.mask;
        if (mask) opts.validate = value => value.search(mask) >= 0;
        super._update(opts);
      }
    }
    IMask.MaskedRegExp = MaskedRegExp;
  
    /** Pattern mask */
    class MaskedPattern extends Masked {
      /** */
  
      /** */
  
      /** Single char for empty input */
  
      /** Single char for filled input */
  
      /** Show placeholder only when needed */
  
      /** Enable characters overwriting */
  
      /** */
  
      /** */
  
      /** */
  
      constructor(opts) {
        super({
          ...MaskedPattern.DEFAULTS,
          ...opts,
          definitions: Object.assign({}, PatternInputDefinition.DEFAULT_DEFINITIONS, opts == null ? void 0 : opts.definitions)
        });
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        opts.definitions = Object.assign({}, this.definitions, opts.definitions);
        super._update(opts);
        this._rebuildMask();
      }
      _rebuildMask() {
        const defs = this.definitions;
        this._blocks = [];
        this.exposeBlock = undefined;
        this._stops = [];
        this._maskedBlocks = {};
        const pattern = this.mask;
        if (!pattern || !defs) return;
        let unmaskingBlock = false;
        let optionalBlock = false;
        for (let i = 0; i < pattern.length; ++i) {
          if (this.blocks) {
            const p = pattern.slice(i);
            const bNames = Object.keys(this.blocks).filter(bName => p.indexOf(bName) === 0);
            // order by key length
            bNames.sort((a, b) => b.length - a.length);
            // use block name with max length
            const bName = bNames[0];
            if (bName) {
              const {
                expose,
                repeat,
                ...bOpts
              } = normalizeOpts(this.blocks[bName]); // TODO type Opts<Arg & Extra>
              const blockOpts = {
                lazy: this.lazy,
                eager: this.eager,
                placeholderChar: this.placeholderChar,
                displayChar: this.displayChar,
                overwrite: this.overwrite,
                autofix: this.autofix,
                ...bOpts,
                repeat,
                parent: this
              };
              const maskedBlock = repeat != null ? new IMask.RepeatBlock(blockOpts /* TODO */) : createMask(blockOpts);
              if (maskedBlock) {
                this._blocks.push(maskedBlock);
                if (expose) this.exposeBlock = maskedBlock;
  
                // store block index
                if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
                this._maskedBlocks[bName].push(this._blocks.length - 1);
              }
              i += bName.length - 1;
              continue;
            }
          }
          let char = pattern[i];
          let isInput = (char in defs);
          if (char === MaskedPattern.STOP_CHAR) {
            this._stops.push(this._blocks.length);
            continue;
          }
          if (char === '{' || char === '}') {
            unmaskingBlock = !unmaskingBlock;
            continue;
          }
          if (char === '[' || char === ']') {
            optionalBlock = !optionalBlock;
            continue;
          }
          if (char === MaskedPattern.ESCAPE_CHAR) {
            ++i;
            char = pattern[i];
            if (!char) break;
            isInput = false;
          }
          const def = isInput ? new PatternInputDefinition({
            isOptional: optionalBlock,
            lazy: this.lazy,
            eager: this.eager,
            placeholderChar: this.placeholderChar,
            displayChar: this.displayChar,
            ...normalizeOpts(defs[char]),
            parent: this
          }) : new PatternFixedDefinition({
            char,
            eager: this.eager,
            isUnmasking: unmaskingBlock
          });
          this._blocks.push(def);
        }
      }
      get state() {
        return {
          ...super.state,
          _blocks: this._blocks.map(b => b.state)
        };
      }
      set state(state) {
        if (!state) {
          this.reset();
          return;
        }
        const {
          _blocks,
          ...maskedState
        } = state;
        this._blocks.forEach((b, bi) => b.state = _blocks[bi]);
        super.state = maskedState;
      }
      reset() {
        super.reset();
        this._blocks.forEach(b => b.reset());
      }
      get isComplete() {
        return this.exposeBlock ? this.exposeBlock.isComplete : this._blocks.every(b => b.isComplete);
      }
      get isFilled() {
        return this._blocks.every(b => b.isFilled);
      }
      get isFixed() {
        return this._blocks.every(b => b.isFixed);
      }
      get isOptional() {
        return this._blocks.every(b => b.isOptional);
      }
      doCommit() {
        this._blocks.forEach(b => b.doCommit());
        super.doCommit();
      }
      get unmaskedValue() {
        return this.exposeBlock ? this.exposeBlock.unmaskedValue : this._blocks.reduce((str, b) => str += b.unmaskedValue, '');
      }
      set unmaskedValue(unmaskedValue) {
        if (this.exposeBlock) {
          const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
          this.exposeBlock.unmaskedValue = unmaskedValue;
          this.appendTail(tail);
          this.doCommit();
        } else super.unmaskedValue = unmaskedValue;
      }
      get value() {
        return this.exposeBlock ? this.exposeBlock.value :
        // TODO return _value when not in change?
        this._blocks.reduce((str, b) => str += b.value, '');
      }
      set value(value) {
        if (this.exposeBlock) {
          const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
          this.exposeBlock.value = value;
          this.appendTail(tail);
          this.doCommit();
        } else super.value = value;
      }
      get typedValue() {
        return this.exposeBlock ? this.exposeBlock.typedValue : super.typedValue;
      }
      set typedValue(value) {
        if (this.exposeBlock) {
          const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
          this.exposeBlock.typedValue = value;
          this.appendTail(tail);
          this.doCommit();
        } else super.typedValue = value;
      }
      get displayValue() {
        return this._blocks.reduce((str, b) => str += b.displayValue, '');
      }
      appendTail(tail) {
        return super.appendTail(tail).aggregate(this._appendPlaceholder());
      }
      _appendEager() {
        var _this$_mapPosToBlock;
        const details = new ChangeDetails();
        let startBlockIndex = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index;
        if (startBlockIndex == null) return details;
  
        // TODO test if it works for nested pattern masks
        if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;
        for (let bi = startBlockIndex; bi < this._blocks.length; ++bi) {
          const d = this._blocks[bi]._appendEager();
          if (!d.inserted) break;
          details.aggregate(d);
        }
        return details;
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const blockIter = this._mapPosToBlock(this.displayValue.length);
        const details = new ChangeDetails();
        if (!blockIter) return details;
        for (let bi = blockIter.index, block; block = this._blocks[bi]; ++bi) {
          var _flags$_beforeTailSta;
          const blockDetails = block._appendChar(ch, {
            ...flags,
            _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
          });
          details.aggregate(blockDetails);
          if (blockDetails.consumed) break; // go next char
        }
        return details;
      }
      extractTail(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        const chunkTail = new ChunksTailDetails();
        if (fromPos === toPos) return chunkTail;
        this._forEachBlocksInRange(fromPos, toPos, (b, bi, bFromPos, bToPos) => {
          const blockChunk = b.extractTail(bFromPos, bToPos);
          blockChunk.stop = this._findStopBefore(bi);
          blockChunk.from = this._blockStartPos(bi);
          if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
          chunkTail.extend(blockChunk);
        });
        return chunkTail;
      }
      extractInput(fromPos, toPos, flags) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        if (flags === void 0) {
          flags = {};
        }
        if (fromPos === toPos) return '';
        let input = '';
        this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
          input += b.extractInput(fromPos, toPos, flags);
        });
        return input;
      }
      _findStopBefore(blockIndex) {
        let stopBefore;
        for (let si = 0; si < this._stops.length; ++si) {
          const stop = this._stops[si];
          if (stop <= blockIndex) stopBefore = stop;else break;
        }
        return stopBefore;
      }
  
      /** Appends placeholder depending on laziness */
      _appendPlaceholder(toBlockIndex) {
        const details = new ChangeDetails();
        if (this.lazy && toBlockIndex == null) return details;
        const startBlockIter = this._mapPosToBlock(this.displayValue.length);
        if (!startBlockIter) return details;
        const startBlockIndex = startBlockIter.index;
        const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;
        this._blocks.slice(startBlockIndex, endBlockIndex).forEach(b => {
          if (!b.lazy || toBlockIndex != null) {
            var _blocks2;
            details.aggregate(b._appendPlaceholder((_blocks2 = b._blocks) == null ? void 0 : _blocks2.length));
          }
        });
        return details;
      }
  
      /** Finds block in pos */
      _mapPosToBlock(pos) {
        let accVal = '';
        for (let bi = 0; bi < this._blocks.length; ++bi) {
          const block = this._blocks[bi];
          const blockStartPos = accVal.length;
          accVal += block.displayValue;
          if (pos <= accVal.length) {
            return {
              index: bi,
              offset: pos - blockStartPos
            };
          }
        }
      }
      _blockStartPos(blockIndex) {
        return this._blocks.slice(0, blockIndex).reduce((pos, b) => pos += b.displayValue.length, 0);
      }
      _forEachBlocksInRange(fromPos, toPos, fn) {
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        const fromBlockIter = this._mapPosToBlock(fromPos);
        if (fromBlockIter) {
          const toBlockIter = this._mapPosToBlock(toPos);
          // process first block
          const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
          const fromBlockStartPos = fromBlockIter.offset;
          const fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].displayValue.length;
          fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);
          if (toBlockIter && !isSameBlock) {
            // process intermediate blocks
            for (let bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
              fn(this._blocks[bi], bi, 0, this._blocks[bi].displayValue.length);
            }
  
            // process last block
            fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
          }
        }
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        const removeDetails = super.remove(fromPos, toPos);
        this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
          removeDetails.aggregate(b.remove(bFromPos, bToPos));
        });
        return removeDetails;
      }
      nearestInputPos(cursorPos, direction) {
        if (direction === void 0) {
          direction = DIRECTION.NONE;
        }
        if (!this._blocks.length) return 0;
        const cursor = new PatternCursor(this, cursorPos);
        if (direction === DIRECTION.NONE) {
          // -------------------------------------------------
          // NONE should only go out from fixed to the right!
          // -------------------------------------------------
          if (cursor.pushRightBeforeInput()) return cursor.pos;
          cursor.popState();
          if (cursor.pushLeftBeforeInput()) return cursor.pos;
          return this.displayValue.length;
        }
  
        // FORCE is only about a|* otherwise is 0
        if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
          // try to break fast when *|a
          if (direction === DIRECTION.LEFT) {
            cursor.pushRightBeforeFilled();
            if (cursor.ok && cursor.pos === cursorPos) return cursorPos;
            cursor.popState();
          }
  
          // forward flow
          cursor.pushLeftBeforeInput();
          cursor.pushLeftBeforeRequired();
          cursor.pushLeftBeforeFilled();
  
          // backward flow
          if (direction === DIRECTION.LEFT) {
            cursor.pushRightBeforeInput();
            cursor.pushRightBeforeRequired();
            if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
            cursor.popState();
            if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
            cursor.popState();
          }
          if (cursor.ok) return cursor.pos;
          if (direction === DIRECTION.FORCE_LEFT) return 0;
          cursor.popState();
          if (cursor.ok) return cursor.pos;
          cursor.popState();
          if (cursor.ok) return cursor.pos;
          return 0;
        }
        if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
          // forward flow
          cursor.pushRightBeforeInput();
          cursor.pushRightBeforeRequired();
          if (cursor.pushRightBeforeFilled()) return cursor.pos;
          if (direction === DIRECTION.FORCE_RIGHT) return this.displayValue.length;
  
          // backward flow
          cursor.popState();
          if (cursor.ok) return cursor.pos;
          cursor.popState();
          if (cursor.ok) return cursor.pos;
          return this.nearestInputPos(cursorPos, DIRECTION.LEFT);
        }
        return cursorPos;
      }
      totalInputPositions(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        let total = 0;
        this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
          total += b.totalInputPositions(bFromPos, bToPos);
        });
        return total;
      }
  
      /** Get block by name */
      maskedBlock(name) {
        return this.maskedBlocks(name)[0];
      }
  
      /** Get all blocks by name */
      maskedBlocks(name) {
        const indices = this._maskedBlocks[name];
        if (!indices) return [];
        return indices.map(gi => this._blocks[gi]);
      }
      pad(flags) {
        const details = new ChangeDetails();
        this._forEachBlocksInRange(0, this.displayValue.length, b => details.aggregate(b.pad(flags)));
        return details;
      }
    }
    MaskedPattern.DEFAULTS = {
      ...Masked.DEFAULTS,
      lazy: true,
      placeholderChar: '_'
    };
    MaskedPattern.STOP_CHAR = '`';
    MaskedPattern.ESCAPE_CHAR = '\\';
    MaskedPattern.InputDefinition = PatternInputDefinition;
    MaskedPattern.FixedDefinition = PatternFixedDefinition;
    IMask.MaskedPattern = MaskedPattern;
  
    /** Pattern which accepts ranges */
    class MaskedRange extends MaskedPattern {
      /**
        Optionally sets max length of pattern.
        Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
      */
  
      /** Min bound */
  
      /** Max bound */
  
      get _matchFrom() {
        return this.maxLength - String(this.from).length;
      }
      constructor(opts) {
        super(opts); // mask will be created in _update
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        const {
          to = this.to || 0,
          from = this.from || 0,
          maxLength = this.maxLength || 0,
          autofix = this.autofix,
          ...patternOpts
        } = opts;
        this.to = to;
        this.from = from;
        this.maxLength = Math.max(String(to).length, maxLength);
        this.autofix = autofix;
        const fromStr = String(this.from).padStart(this.maxLength, '0');
        const toStr = String(this.to).padStart(this.maxLength, '0');
        let sameCharsCount = 0;
        while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
        patternOpts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(this.maxLength - sameCharsCount);
        super._update(patternOpts);
      }
      get isComplete() {
        return super.isComplete && Boolean(this.value);
      }
      boundaries(str) {
        let minstr = '';
        let maxstr = '';
        const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
        if (num) {
          minstr = '0'.repeat(placeholder.length) + num;
          maxstr = '9'.repeat(placeholder.length) + num;
        }
        minstr = minstr.padEnd(this.maxLength, '0');
        maxstr = maxstr.padEnd(this.maxLength, '9');
        return [minstr, maxstr];
      }
      doPrepareChar(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        let details;
        [ch, details] = super.doPrepareChar(ch.replace(/\D/g, ''), flags);
        if (!ch) details.skip = !this.isComplete;
        return [ch, details];
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        if (!this.autofix || this.value.length + 1 > this.maxLength) return super._appendCharRaw(ch, flags);
        const fromStr = String(this.from).padStart(this.maxLength, '0');
        const toStr = String(this.to).padStart(this.maxLength, '0');
        const [minstr, maxstr] = this.boundaries(this.value + ch);
        if (Number(maxstr) < this.from) return super._appendCharRaw(fromStr[this.value.length], flags);
        if (Number(minstr) > this.to) {
          if (!flags.tail && this.autofix === 'pad' && this.value.length + 1 < this.maxLength) {
            return super._appendCharRaw(fromStr[this.value.length], flags).aggregate(this._appendCharRaw(ch, flags));
          }
          return super._appendCharRaw(toStr[this.value.length], flags);
        }
        return super._appendCharRaw(ch, flags);
      }
      doValidate(flags) {
        const str = this.value;
        const firstNonZero = str.search(/[^0]/);
        if (firstNonZero === -1 && str.length <= this._matchFrom) return true;
        const [minstr, maxstr] = this.boundaries(str);
        return this.from <= Number(maxstr) && Number(minstr) <= this.to && super.doValidate(flags);
      }
      pad(flags) {
        const details = new ChangeDetails();
        if (this.value.length === this.maxLength) return details;
        const value = this.value;
        const padLength = this.maxLength - this.value.length;
        if (padLength) {
          this.reset();
          for (let i = 0; i < padLength; ++i) {
            details.aggregate(super._appendCharRaw('0', flags));
          }
  
          // append tail
          value.split('').forEach(ch => this._appendCharRaw(ch));
        }
        return details;
      }
    }
    IMask.MaskedRange = MaskedRange;
  
    const DefaultPattern = 'd{.}`m{.}`Y';
  
    // Make format and parse required when pattern is provided
  
    /** Date mask */
    class MaskedDate extends MaskedPattern {
      static extractPatternOptions(opts) {
        const {
          mask,
          pattern,
          ...patternOpts
        } = opts;
        return {
          ...patternOpts,
          mask: isString(mask) ? mask : pattern
        };
      }
  
      /** Pattern mask for date according to {@link MaskedDate#format} */
  
      /** Start date */
  
      /** End date */
  
      /** Format typed value to string */
  
      /** Parse string to get typed value */
  
      constructor(opts) {
        super(MaskedDate.extractPatternOptions({
          ...MaskedDate.DEFAULTS,
          ...opts
        }));
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        const {
          mask,
          pattern,
          blocks,
          ...patternOpts
        } = {
          ...MaskedDate.DEFAULTS,
          ...opts
        };
        const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
        // adjust year block
        if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
        if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
        if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to) {
          patternBlocks.m.from = opts.min.getMonth() + 1;
          patternBlocks.m.to = opts.max.getMonth() + 1;
          if (patternBlocks.m.from === patternBlocks.m.to) {
            patternBlocks.d.from = opts.min.getDate();
            patternBlocks.d.to = opts.max.getDate();
          }
        }
        Object.assign(patternBlocks, this.blocks, blocks);
        super._update({
          ...patternOpts,
          mask: isString(mask) ? mask : pattern,
          blocks: patternBlocks
        });
      }
      doValidate(flags) {
        const date = this.date;
        return super.doValidate(flags) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
      }
  
      /** Checks if date is exists */
      isDateExist(str) {
        return this.format(this.parse(str, this), this).indexOf(str) >= 0;
      }
  
      /** Parsed Date */
      get date() {
        return this.typedValue;
      }
      set date(date) {
        this.typedValue = date;
      }
      get typedValue() {
        return this.isComplete ? super.typedValue : null;
      }
      set typedValue(value) {
        super.typedValue = value;
      }
      maskEquals(mask) {
        return mask === Date || super.maskEquals(mask);
      }
      optionsIsChanged(opts) {
        return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
      }
    }
    MaskedDate.GET_DEFAULT_BLOCKS = () => ({
      d: {
        mask: MaskedRange,
        from: 1,
        to: 31,
        maxLength: 2
      },
      m: {
        mask: MaskedRange,
        from: 1,
        to: 12,
        maxLength: 2
      },
      Y: {
        mask: MaskedRange,
        from: 1900,
        to: 9999
      }
    });
    MaskedDate.DEFAULTS = {
      ...MaskedPattern.DEFAULTS,
      mask: Date,
      pattern: DefaultPattern,
      format: (date, masked) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return [day, month, year].join('.');
      },
      parse: (str, masked) => {
        const [day, month, year] = str.split('.').map(Number);
        return new Date(year, month - 1, day);
      }
    };
    IMask.MaskedDate = MaskedDate;
  
    /** Dynamic mask for choosing appropriate mask in run-time */
    class MaskedDynamic extends Masked {
      constructor(opts) {
        super({
          ...MaskedDynamic.DEFAULTS,
          ...opts
        });
        this.currentMask = undefined;
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        super._update(opts);
        if ('mask' in opts) {
          this.exposeMask = undefined;
          // mask could be totally dynamic with only `dispatch` option
          this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(m => {
            const {
              expose,
              ...maskOpts
            } = normalizeOpts(m);
            const masked = createMask({
              overwrite: this._overwrite,
              eager: this._eager,
              skipInvalid: this._skipInvalid,
              ...maskOpts
            });
            if (expose) this.exposeMask = masked;
            return masked;
          }) : [];
  
          // this.currentMask = this.doDispatch(''); // probably not needed but lets see
        }
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const details = this._applyDispatch(ch, flags);
        if (this.currentMask) {
          details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
        }
        return details;
      }
      _applyDispatch(appended, flags, tail) {
        if (appended === void 0) {
          appended = '';
        }
        if (flags === void 0) {
          flags = {};
        }
        if (tail === void 0) {
          tail = '';
        }
        const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
        const inputValue = this.rawInputValue;
        const insertValue = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._rawInputValue : inputValue;
        const tailValue = inputValue.slice(insertValue.length);
        const prevMask = this.currentMask;
        const details = new ChangeDetails();
        const prevMaskState = prevMask == null ? void 0 : prevMask.state;
  
        // clone flags to prevent overwriting `_beforeTailState`
        this.currentMask = this.doDispatch(appended, {
          ...flags
        }, tail);
  
        // restore state after dispatch
        if (this.currentMask) {
          if (this.currentMask !== prevMask) {
            // if mask changed reapply input
            this.currentMask.reset();
            if (insertValue) {
              this.currentMask.append(insertValue, {
                raw: true
              });
              details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
            }
            if (tailValue) {
              details.tailShift += this.currentMask.append(tailValue, {
                raw: true,
                tail: true
              }).tailShift;
            }
          } else if (prevMaskState) {
            // Dispatch can do something bad with state, so
            // restore prev mask state
            this.currentMask.state = prevMaskState;
          }
        }
        return details;
      }
      _appendPlaceholder() {
        const details = this._applyDispatch();
        if (this.currentMask) {
          details.aggregate(this.currentMask._appendPlaceholder());
        }
        return details;
      }
      _appendEager() {
        const details = this._applyDispatch();
        if (this.currentMask) {
          details.aggregate(this.currentMask._appendEager());
        }
        return details;
      }
      appendTail(tail) {
        const details = new ChangeDetails();
        if (tail) details.aggregate(this._applyDispatch('', {}, tail));
        return details.aggregate(this.currentMask ? this.currentMask.appendTail(tail) : super.appendTail(tail));
      }
      currentMaskFlags(flags) {
        var _flags$_beforeTailSta, _flags$_beforeTailSta2;
        return {
          ...flags,
          _beforeTailState: ((_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.currentMaskRef) === this.currentMask && ((_flags$_beforeTailSta2 = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta2.currentMask) || flags._beforeTailState
        };
      }
      doDispatch(appended, flags, tail) {
        if (flags === void 0) {
          flags = {};
        }
        if (tail === void 0) {
          tail = '';
        }
        return this.dispatch(appended, this, flags, tail);
      }
      doValidate(flags) {
        return super.doValidate(flags) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags)));
      }
      doPrepare(str, flags) {
        if (flags === void 0) {
          flags = {};
        }
        let [s, details] = super.doPrepare(str, flags);
        if (this.currentMask) {
          let currentDetails;
          [s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags));
          details = details.aggregate(currentDetails);
        }
        return [s, details];
      }
      doPrepareChar(str, flags) {
        if (flags === void 0) {
          flags = {};
        }
        let [s, details] = super.doPrepareChar(str, flags);
        if (this.currentMask) {
          let currentDetails;
          [s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags));
          details = details.aggregate(currentDetails);
        }
        return [s, details];
      }
      reset() {
        var _this$currentMask;
        (_this$currentMask = this.currentMask) == null || _this$currentMask.reset();
        this.compiledMasks.forEach(m => m.reset());
      }
      get value() {
        return this.exposeMask ? this.exposeMask.value : this.currentMask ? this.currentMask.value : '';
      }
      set value(value) {
        if (this.exposeMask) {
          this.exposeMask.value = value;
          this.currentMask = this.exposeMask;
          this._applyDispatch();
        } else super.value = value;
      }
      get unmaskedValue() {
        return this.exposeMask ? this.exposeMask.unmaskedValue : this.currentMask ? this.currentMask.unmaskedValue : '';
      }
      set unmaskedValue(unmaskedValue) {
        if (this.exposeMask) {
          this.exposeMask.unmaskedValue = unmaskedValue;
          this.currentMask = this.exposeMask;
          this._applyDispatch();
        } else super.unmaskedValue = unmaskedValue;
      }
      get typedValue() {
        return this.exposeMask ? this.exposeMask.typedValue : this.currentMask ? this.currentMask.typedValue : '';
      }
      set typedValue(typedValue) {
        if (this.exposeMask) {
          this.exposeMask.typedValue = typedValue;
          this.currentMask = this.exposeMask;
          this._applyDispatch();
          return;
        }
        let unmaskedValue = String(typedValue);
  
        // double check it
        if (this.currentMask) {
          this.currentMask.typedValue = typedValue;
          unmaskedValue = this.currentMask.unmaskedValue;
        }
        this.unmaskedValue = unmaskedValue;
      }
      get displayValue() {
        return this.currentMask ? this.currentMask.displayValue : '';
      }
      get isComplete() {
        var _this$currentMask2;
        return Boolean((_this$currentMask2 = this.currentMask) == null ? void 0 : _this$currentMask2.isComplete);
      }
      get isFilled() {
        var _this$currentMask3;
        return Boolean((_this$currentMask3 = this.currentMask) == null ? void 0 : _this$currentMask3.isFilled);
      }
      remove(fromPos, toPos) {
        const details = new ChangeDetails();
        if (this.currentMask) {
          details.aggregate(this.currentMask.remove(fromPos, toPos))
          // update with dispatch
          .aggregate(this._applyDispatch());
        }
        return details;
      }
      get state() {
        var _this$currentMask4;
        return {
          ...super.state,
          _rawInputValue: this.rawInputValue,
          compiledMasks: this.compiledMasks.map(m => m.state),
          currentMaskRef: this.currentMask,
          currentMask: (_this$currentMask4 = this.currentMask) == null ? void 0 : _this$currentMask4.state
        };
      }
      set state(state) {
        const {
          compiledMasks,
          currentMaskRef,
          currentMask,
          ...maskedState
        } = state;
        if (compiledMasks) this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
        if (currentMaskRef != null) {
          this.currentMask = currentMaskRef;
          this.currentMask.state = currentMask;
        }
        super.state = maskedState;
      }
      extractInput(fromPos, toPos, flags) {
        return this.currentMask ? this.currentMask.extractInput(fromPos, toPos, flags) : '';
      }
      extractTail(fromPos, toPos) {
        return this.currentMask ? this.currentMask.extractTail(fromPos, toPos) : super.extractTail(fromPos, toPos);
      }
      doCommit() {
        if (this.currentMask) this.currentMask.doCommit();
        super.doCommit();
      }
      nearestInputPos(cursorPos, direction) {
        return this.currentMask ? this.currentMask.nearestInputPos(cursorPos, direction) : super.nearestInputPos(cursorPos, direction);
      }
      get overwrite() {
        return this.currentMask ? this.currentMask.overwrite : this._overwrite;
      }
      set overwrite(overwrite) {
        this._overwrite = overwrite;
      }
      get eager() {
        return this.currentMask ? this.currentMask.eager : this._eager;
      }
      set eager(eager) {
        this._eager = eager;
      }
      get skipInvalid() {
        return this.currentMask ? this.currentMask.skipInvalid : this._skipInvalid;
      }
      set skipInvalid(skipInvalid) {
        this._skipInvalid = skipInvalid;
      }
      get autofix() {
        return this.currentMask ? this.currentMask.autofix : this._autofix;
      }
      set autofix(autofix) {
        this._autofix = autofix;
      }
      maskEquals(mask) {
        return Array.isArray(mask) ? this.compiledMasks.every((m, mi) => {
          if (!mask[mi]) return;
          const {
            mask: oldMask,
            ...restOpts
          } = mask[mi];
          return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
        }) : super.maskEquals(mask);
      }
      typedValueEquals(value) {
        var _this$currentMask5;
        return Boolean((_this$currentMask5 = this.currentMask) == null ? void 0 : _this$currentMask5.typedValueEquals(value));
      }
    }
    /** Currently chosen mask */
    /** Currently chosen mask */
    /** Compliled {@link Masked} options */
    /** Chooses {@link Masked} depending on input value */
    MaskedDynamic.DEFAULTS = {
      ...Masked.DEFAULTS,
      dispatch: (appended, masked, flags, tail) => {
        if (!masked.compiledMasks.length) return;
        const inputValue = masked.rawInputValue;
  
        // simulate input
        const inputs = masked.compiledMasks.map((m, index) => {
          const isCurrent = masked.currentMask === m;
          const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);
          if (m.rawInputValue !== inputValue) {
            m.reset();
            m.append(inputValue, {
              raw: true
            });
          } else if (!isCurrent) {
            m.remove(startInputPos);
          }
          m.append(appended, masked.currentMaskFlags(flags));
          m.appendTail(tail);
          return {
            index,
            weight: m.rawInputValue.length,
            totalInputPositions: m.totalInputPositions(0, Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)))
          };
        });
  
        // pop masks with longer values first
        inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);
        return masked.compiledMasks[inputs[0].index];
      }
    };
    IMask.MaskedDynamic = MaskedDynamic;
  
    /** Pattern which validates enum values */
    class MaskedEnum extends MaskedPattern {
      constructor(opts) {
        super({
          ...MaskedEnum.DEFAULTS,
          ...opts
        }); // mask will be created in _update
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        const {
          enum: enum_,
          ...eopts
        } = opts;
        if (enum_) {
          const lengths = enum_.map(e => e.length);
          const requiredLength = Math.min(...lengths);
          const optionalLength = Math.max(...lengths) - requiredLength;
          eopts.mask = '*'.repeat(requiredLength);
          if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';
          this.enum = enum_;
        }
        super._update(eopts);
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
        const matches = this.enum.filter(e => this.matchValue(e, this.unmaskedValue + ch, matchFrom));
        if (matches.length) {
          if (matches.length === 1) {
            this._forEachBlocksInRange(0, this.value.length, (b, bi) => {
              const mch = matches[0][bi];
              if (bi >= this.value.length || mch === b.value) return;
              b.reset();
              b._appendChar(mch, flags);
            });
          }
          const d = super._appendCharRaw(matches[0][this.value.length], flags);
          if (matches.length === 1) {
            matches[0].slice(this.unmaskedValue.length).split('').forEach(mch => d.aggregate(super._appendCharRaw(mch)));
          }
          return d;
        }
        return new ChangeDetails({
          skip: !this.isComplete
        });
      }
      extractTail(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        // just drop tail
        return new ContinuousTailDetails('', fromPos);
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        if (fromPos === toPos) return new ChangeDetails();
        const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
        let pos;
        for (pos = fromPos; pos >= 0; --pos) {
          const matches = this.enum.filter(e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom));
          if (matches.length > 1) break;
        }
        const details = super.remove(pos, toPos);
        details.tailShift += pos - fromPos;
        return details;
      }
      get isComplete() {
        return this.enum.indexOf(this.value) >= 0;
      }
    }
    /** Match enum value */
    MaskedEnum.DEFAULTS = {
      ...MaskedPattern.DEFAULTS,
      matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom
    };
    IMask.MaskedEnum = MaskedEnum;
  
    /** Masking by custom Function */
    class MaskedFunction extends Masked {
      /** */
  
      /** Enable characters overwriting */
  
      /** */
  
      /** */
  
      /** */
  
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        super._update({
          ...opts,
          validate: opts.mask
        });
      }
    }
    IMask.MaskedFunction = MaskedFunction;
  
    var _MaskedNumber;
    /** Number mask */
    class MaskedNumber extends Masked {
      /** Single char */
  
      /** Single char */
  
      /** Array of single chars */
  
      /** */
  
      /** */
  
      /** Digits after point */
  
      /** Flag to remove leading and trailing zeros in the end of editing */
  
      /** Flag to pad trailing zeros after point in the end of editing */
  
      /** Enable characters overwriting */
  
      /** */
  
      /** */
  
      /** */
  
      /** Format typed value to string */
  
      /** Parse string to get typed value */
  
      constructor(opts) {
        super({
          ...MaskedNumber.DEFAULTS,
          ...opts
        });
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        super._update(opts);
        this._updateRegExps();
      }
      _updateRegExps() {
        const start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
        const mid = '\\d*';
        const end = (this.scale ? "(" + escapeRegExp(this.radix) + "\\d{0," + this.scale + "})?" : '') + '$';
        this._numberRegExp = new RegExp(start + mid + end);
        this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(escapeRegExp).join('') + "]", 'g');
        this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
      }
      _removeThousandsSeparators(value) {
        return value.replace(this._thousandsSeparatorRegExp, '');
      }
      _insertThousandsSeparators(value) {
        // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
        const parts = value.split(this.radix);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
        return parts.join(this.radix);
      }
      doPrepareChar(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(this.scale && this.mapToRadix.length && (
        /*
          radix should be mapped when
          1) input is done from keyboard = flags.input && flags.raw
          2) unmasked value is set = !flags.input && !flags.raw
          and should not be mapped when
          1) value is set = flags.input && !flags.raw
          2) raw value is set = !flags.input && flags.raw
        */
        flags.input && flags.raw || !flags.input && !flags.raw) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch), flags);
        if (ch && !prepCh) details.skip = true;
        if (prepCh && !this.allowPositive && !this.value && prepCh !== '-') details.aggregate(this._appendChar('-'));
        return [prepCh, details];
      }
      _separatorsCount(to, extendOnSeparators) {
        if (extendOnSeparators === void 0) {
          extendOnSeparators = false;
        }
        let count = 0;
        for (let pos = 0; pos < to; ++pos) {
          if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
            ++count;
            if (extendOnSeparators) to += this.thousandsSeparator.length;
          }
        }
        return count;
      }
      _separatorsCountFromSlice(slice) {
        if (slice === void 0) {
          slice = this._value;
        }
        return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
      }
      extractInput(fromPos, toPos, flags) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
        return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
        const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
        this._value = this._removeThousandsSeparators(this.value);
        const oldValue = this._value;
        this._value += ch;
        const num = this.number;
        let accepted = !isNaN(num);
        let skip = false;
        if (accepted) {
          let fixedNum;
          if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
          if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;
          if (fixedNum != null) {
            if (this.autofix) {
              this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
              skip || (skip = oldValue === this._value && !flags.tail); // if not changed on tail it's still ok to proceed
            } else {
              accepted = false;
            }
          }
          accepted && (accepted = Boolean(this._value.match(this._numberRegExp)));
        }
        let appendDetails;
        if (!accepted) {
          this._value = oldValue;
          appendDetails = new ChangeDetails();
        } else {
          appendDetails = new ChangeDetails({
            inserted: this._value.slice(oldValue.length),
            rawInserted: skip ? '' : ch,
            skip
          });
        }
        this._value = this._insertThousandsSeparators(this._value);
        const beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
        const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);
        appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
        return appendDetails;
      }
      _findSeparatorAround(pos) {
        if (this.thousandsSeparator) {
          const searchFrom = pos - this.thousandsSeparator.length + 1;
          const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
          if (separatorPos <= pos) return separatorPos;
        }
        return -1;
      }
      _adjustRangeWithSeparators(from, to) {
        const separatorAroundFromPos = this._findSeparatorAround(from);
        if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;
        const separatorAroundToPos = this._findSeparatorAround(to);
        if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
        return [from, to];
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
        const valueBeforePos = this.value.slice(0, fromPos);
        const valueAfterPos = this.value.slice(toPos);
        const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
        this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
        const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);
        return new ChangeDetails({
          tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
        });
      }
      nearestInputPos(cursorPos, direction) {
        if (!this.thousandsSeparator) return cursorPos;
        switch (direction) {
          case DIRECTION.NONE:
          case DIRECTION.LEFT:
          case DIRECTION.FORCE_LEFT:
            {
              const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
              if (separatorAtLeftPos >= 0) {
                const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
                if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
                  return separatorAtLeftPos;
                }
              }
              break;
            }
          case DIRECTION.RIGHT:
          case DIRECTION.FORCE_RIGHT:
            {
              const separatorAtRightPos = this._findSeparatorAround(cursorPos);
              if (separatorAtRightPos >= 0) {
                return separatorAtRightPos + this.thousandsSeparator.length;
              }
            }
        }
        return cursorPos;
      }
      doCommit() {
        if (this.value) {
          const number = this.number;
          let validnum = number;
  
          // check bounds
          if (this.min != null) validnum = Math.max(validnum, this.min);
          if (this.max != null) validnum = Math.min(validnum, this.max);
          if (validnum !== number) this.unmaskedValue = this.format(validnum, this);
          let formatted = this.value;
          if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
          if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);
          this._value = formatted;
        }
        super.doCommit();
      }
      _normalizeZeros(value) {
        const parts = this._removeThousandsSeparators(value).split(this.radix);
  
        // remove leading zeros
        parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, (match, sign, zeros, num) => sign + num);
        // add leading zero
        if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';
        if (parts.length > 1) {
          parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros
          if (!parts[1].length) parts.length = 1; // remove fractional
        }
        return this._insertThousandsSeparators(parts.join(this.radix));
      }
      _padFractionalZeros(value) {
        if (!value) return value;
        const parts = value.split(this.radix);
        if (parts.length < 2) parts.push('');
        parts[1] = parts[1].padEnd(this.scale, '0');
        return parts.join(this.radix);
      }
      doSkipInvalid(ch, flags, checkTail) {
        if (flags === void 0) {
          flags = {};
        }
        const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (ch === this.radix || ch === MaskedNumber.UNMASKED_RADIX || this.mapToRadix.includes(ch));
        return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
      }
      get unmaskedValue() {
        return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, MaskedNumber.UNMASKED_RADIX);
      }
      set unmaskedValue(unmaskedValue) {
        super.unmaskedValue = unmaskedValue;
      }
      get typedValue() {
        return this.parse(this.unmaskedValue, this);
      }
      set typedValue(n) {
        this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
      }
  
      /** Parsed Number */
      get number() {
        return this.typedValue;
      }
      set number(number) {
        this.typedValue = number;
      }
      get allowNegative() {
        return this.min != null && this.min < 0 || this.max != null && this.max < 0;
      }
      get allowPositive() {
        return this.min != null && this.min > 0 || this.max != null && this.max > 0;
      }
      typedValueEquals(value) {
        // handle  0 -> '' case (typed = 0 even if value = '')
        // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
        return (super.typedValueEquals(value) || MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)) && !(value === 0 && this.value === '');
      }
    }
    _MaskedNumber = MaskedNumber;
    MaskedNumber.UNMASKED_RADIX = '.';
    MaskedNumber.EMPTY_VALUES = [...Masked.EMPTY_VALUES, 0];
    MaskedNumber.DEFAULTS = {
      ...Masked.DEFAULTS,
      mask: Number,
      radix: ',',
      thousandsSeparator: '',
      mapToRadix: [_MaskedNumber.UNMASKED_RADIX],
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      scale: 2,
      normalizeZeros: true,
      padFractionalZeros: false,
      parse: Number,
      format: n => n.toLocaleString('en-US', {
        useGrouping: false,
        maximumFractionDigits: 20
      })
    };
    IMask.MaskedNumber = MaskedNumber;
  
    /** Mask pipe source and destination types */
    const PIPE_TYPE = {
      MASKED: 'value',
      UNMASKED: 'unmaskedValue',
      TYPED: 'typedValue'
    };
    /** Creates new pipe function depending on mask type, source and destination options */
    function createPipe(arg, from, to) {
      if (from === void 0) {
        from = PIPE_TYPE.MASKED;
      }
      if (to === void 0) {
        to = PIPE_TYPE.MASKED;
      }
      const masked = createMask(arg);
      return value => masked.runIsolated(m => {
        m[from] = value;
        return m[to];
      });
    }
  
    /** Pipes value through mask depending on mask type, source and destination options */
    function pipe(value, mask, from, to) {
      return createPipe(mask, from, to)(value);
    }
    IMask.PIPE_TYPE = PIPE_TYPE;
    IMask.createPipe = createPipe;
    IMask.pipe = pipe;
  
    /** Pattern mask */
    class RepeatBlock extends MaskedPattern {
      get repeatFrom() {
        var _ref;
        return (_ref = Array.isArray(this.repeat) ? this.repeat[0] : this.repeat === Infinity ? 0 : this.repeat) != null ? _ref : 0;
      }
      get repeatTo() {
        var _ref2;
        return (_ref2 = Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) != null ? _ref2 : Infinity;
      }
      constructor(opts) {
        super(opts);
      }
      updateOptions(opts) {
        super.updateOptions(opts);
      }
      _update(opts) {
        var _ref3, _ref4, _this$_blocks;
        const {
          repeat,
          ...blockOpts
        } = normalizeOpts(opts); // TODO type
        this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
        const block = createMask(this._blockOpts);
        this.repeat = (_ref3 = (_ref4 = repeat != null ? repeat : block.repeat) != null ? _ref4 : this.repeat) != null ? _ref3 : Infinity; // TODO type
  
        super._update({
          mask: 'm'.repeat(Math.max(this.repeatTo === Infinity && ((_this$_blocks = this._blocks) == null ? void 0 : _this$_blocks.length) || 0, this.repeatFrom)),
          blocks: {
            m: block
          },
          eager: block.eager,
          overwrite: block.overwrite,
          skipInvalid: block.skipInvalid,
          lazy: block.lazy,
          placeholderChar: block.placeholderChar,
          displayChar: block.displayChar
        });
      }
      _allocateBlock(bi) {
        if (bi < this._blocks.length) return this._blocks[bi];
        if (this.repeatTo === Infinity || this._blocks.length < this.repeatTo) {
          this._blocks.push(createMask(this._blockOpts));
          this.mask += 'm';
          return this._blocks[this._blocks.length - 1];
        }
      }
      _appendCharRaw(ch, flags) {
        if (flags === void 0) {
          flags = {};
        }
        const details = new ChangeDetails();
        for (let bi = (_this$_mapPosToBlock$ = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index) != null ? _this$_mapPosToBlock$ : Math.max(this._blocks.length - 1, 0), block, allocated;
        // try to get a block or
        // try to allocate a new block if not allocated already
        block = (_this$_blocks$bi = this._blocks[bi]) != null ? _this$_blocks$bi : allocated = !allocated && this._allocateBlock(bi); ++bi) {
          var _this$_mapPosToBlock$, _this$_mapPosToBlock, _this$_blocks$bi, _flags$_beforeTailSta;
          const blockDetails = block._appendChar(ch, {
            ...flags,
            _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
          });
          if (blockDetails.skip && allocated) {
            // remove the last allocated block and break
            this._blocks.pop();
            this.mask = this.mask.slice(1);
            break;
          }
          details.aggregate(blockDetails);
          if (blockDetails.consumed) break; // go next char
        }
        return details;
      }
      _trimEmptyTail(fromPos, toPos) {
        var _this$_mapPosToBlock2, _this$_mapPosToBlock3;
        if (fromPos === void 0) {
          fromPos = 0;
        }
        const firstBlockIndex = Math.max(((_this$_mapPosToBlock2 = this._mapPosToBlock(fromPos)) == null ? void 0 : _this$_mapPosToBlock2.index) || 0, this.repeatFrom, 0);
        let lastBlockIndex;
        if (toPos != null) lastBlockIndex = (_this$_mapPosToBlock3 = this._mapPosToBlock(toPos)) == null ? void 0 : _this$_mapPosToBlock3.index;
        if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;
        let removeCount = 0;
        for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, ++removeCount) {
          if (this._blocks[blockIndex].unmaskedValue) break;
        }
        if (removeCount) {
          this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
          this.mask = this.mask.slice(removeCount);
        }
      }
      reset() {
        super.reset();
        this._trimEmptyTail();
      }
      remove(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos === void 0) {
          toPos = this.displayValue.length;
        }
        const removeDetails = super.remove(fromPos, toPos);
        this._trimEmptyTail(fromPos, toPos);
        return removeDetails;
      }
      totalInputPositions(fromPos, toPos) {
        if (fromPos === void 0) {
          fromPos = 0;
        }
        if (toPos == null && this.repeatTo === Infinity) return Infinity;
        return super.totalInputPositions(fromPos, toPos);
      }
      get state() {
        return super.state;
      }
      set state(state) {
        this._blocks.length = state._blocks.length;
        this.mask = this.mask.slice(0, this._blocks.length);
        super.state = state;
      }
    }
    IMask.RepeatBlock = RepeatBlock;
  
    try {
      globalThis.IMask = IMask;
    } catch {}
  
    exports.ChangeDetails = ChangeDetails;
    exports.ChunksTailDetails = ChunksTailDetails;
    exports.DIRECTION = DIRECTION;
    exports.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;
    exports.HTMLInputMaskElement = HTMLInputMaskElement;
    exports.HTMLMaskElement = HTMLMaskElement;
    exports.InputMask = InputMask;
    exports.MaskElement = MaskElement;
    exports.Masked = Masked;
    exports.MaskedDate = MaskedDate;
    exports.MaskedDynamic = MaskedDynamic;
    exports.MaskedEnum = MaskedEnum;
    exports.MaskedFunction = MaskedFunction;
    exports.MaskedNumber = MaskedNumber;
    exports.MaskedPattern = MaskedPattern;
    exports.MaskedRange = MaskedRange;
    exports.MaskedRegExp = MaskedRegExp;
    exports.PIPE_TYPE = PIPE_TYPE;
    exports.PatternFixedDefinition = PatternFixedDefinition;
    exports.PatternInputDefinition = PatternInputDefinition;
    exports.RepeatBlock = RepeatBlock;
    exports.createMask = createMask;
    exports.createPipe = createPipe;
    exports.default = IMask;
    exports.forceDirection = forceDirection;
    exports.normalizeOpts = normalizeOpts;
    exports.pipe = pipe;
  
    Object.defineProperty(exports, '__esModule', { value: true });
  
  }));
  //# sourceMappingURL=imask.js.map;
/**
 * Swiper 11.2.4
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * https://swiperjs.com
 *
 * Copyright 2014-2025 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: February 14, 2025
 */

var Swiper=function(){"use strict";function e(e){return null!==e&&"object"==typeof e&&"constructor"in e&&e.constructor===Object}function t(s,a){void 0===s&&(s={}),void 0===a&&(a={});const i=["__proto__","constructor","prototype"];Object.keys(a).filter((e=>i.indexOf(e)<0)).forEach((i=>{void 0===s[i]?s[i]=a[i]:e(a[i])&&e(s[i])&&Object.keys(a[i]).length>0&&t(s[i],a[i])}))}const s={body:{},addEventListener(){},removeEventListener(){},activeElement:{blur(){},nodeName:""},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,createEvent:()=>({initEvent(){}}),createElement:()=>({children:[],childNodes:[],style:{},setAttribute(){},getElementsByTagName:()=>[]}),createElementNS:()=>({}),importNode:()=>null,location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""}};function a(){const e="undefined"!=typeof document?document:{};return t(e,s),e}const i={document:s,navigator:{userAgent:""},location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""},history:{replaceState(){},pushState(){},go(){},back(){}},CustomEvent:function(){return this},addEventListener(){},removeEventListener(){},getComputedStyle:()=>({getPropertyValue:()=>""}),Image(){},Date(){},screen:{},setTimeout(){},clearTimeout(){},matchMedia:()=>({}),requestAnimationFrame:e=>"undefined"==typeof setTimeout?(e(),null):setTimeout(e,0),cancelAnimationFrame(e){"undefined"!=typeof setTimeout&&clearTimeout(e)}};function r(){const e="undefined"!=typeof window?window:{};return t(e,i),e}function n(e){return void 0===e&&(e=""),e.trim().split(" ").filter((e=>!!e.trim()))}function l(e,t){return void 0===t&&(t=0),setTimeout(e,t)}function o(){return Date.now()}function d(e,t){void 0===t&&(t="x");const s=r();let a,i,n;const l=function(e){const t=r();let s;return t.getComputedStyle&&(s=t.getComputedStyle(e,null)),!s&&e.currentStyle&&(s=e.currentStyle),s||(s=e.style),s}(e);return s.WebKitCSSMatrix?(i=l.transform||l.webkitTransform,i.split(",").length>6&&(i=i.split(", ").map((e=>e.replace(",","."))).join(", ")),n=new s.WebKitCSSMatrix("none"===i?"":i)):(n=l.MozTransform||l.OTransform||l.MsTransform||l.msTransform||l.transform||l.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),a=n.toString().split(",")),"x"===t&&(i=s.WebKitCSSMatrix?n.m41:16===a.length?parseFloat(a[12]):parseFloat(a[4])),"y"===t&&(i=s.WebKitCSSMatrix?n.m42:16===a.length?parseFloat(a[13]):parseFloat(a[5])),i||0}function c(e){return"object"==typeof e&&null!==e&&e.constructor&&"Object"===Object.prototype.toString.call(e).slice(8,-1)}function p(){const e=Object(arguments.length<=0?void 0:arguments[0]),t=["__proto__","constructor","prototype"];for(let a=1;a<arguments.length;a+=1){const i=a<0||arguments.length<=a?void 0:arguments[a];if(null!=i&&(s=i,!("undefined"!=typeof window&&void 0!==window.HTMLElement?s instanceof HTMLElement:s&&(1===s.nodeType||11===s.nodeType)))){const s=Object.keys(Object(i)).filter((e=>t.indexOf(e)<0));for(let t=0,a=s.length;t<a;t+=1){const a=s[t],r=Object.getOwnPropertyDescriptor(i,a);void 0!==r&&r.enumerable&&(c(e[a])&&c(i[a])?i[a].__swiper__?e[a]=i[a]:p(e[a],i[a]):!c(e[a])&&c(i[a])?(e[a]={},i[a].__swiper__?e[a]=i[a]:p(e[a],i[a])):e[a]=i[a])}}}var s;return e}function u(e,t,s){e.style.setProperty(t,s)}function m(e){let{swiper:t,targetPosition:s,side:a}=e;const i=r(),n=-t.translate;let l,o=null;const d=t.params.speed;t.wrapperEl.style.scrollSnapType="none",i.cancelAnimationFrame(t.cssModeFrameID);const c=s>n?"next":"prev",p=(e,t)=>"next"===c&&e>=t||"prev"===c&&e<=t,u=()=>{l=(new Date).getTime(),null===o&&(o=l);const e=Math.max(Math.min((l-o)/d,1),0),r=.5-Math.cos(e*Math.PI)/2;let c=n+r*(s-n);if(p(c,s)&&(c=s),t.wrapperEl.scrollTo({[a]:c}),p(c,s))return t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.scrollSnapType="",setTimeout((()=>{t.wrapperEl.style.overflow="",t.wrapperEl.scrollTo({[a]:c})})),void i.cancelAnimationFrame(t.cssModeFrameID);t.cssModeFrameID=i.requestAnimationFrame(u)};u()}function h(e){return e.querySelector(".swiper-slide-transform")||e.shadowRoot&&e.shadowRoot.querySelector(".swiper-slide-transform")||e}function f(e,t){void 0===t&&(t="");const s=r(),a=[...e.children];return s.HTMLSlotElement&&e instanceof HTMLSlotElement&&a.push(...e.assignedElements()),t?a.filter((e=>e.matches(t))):a}function g(e){try{return void console.warn(e)}catch(e){}}function v(e,t){void 0===t&&(t=[]);const s=document.createElement(e);return s.classList.add(...Array.isArray(t)?t:n(t)),s}function w(e){const t=r(),s=a(),i=e.getBoundingClientRect(),n=s.body,l=e.clientTop||n.clientTop||0,o=e.clientLeft||n.clientLeft||0,d=e===t?t.scrollY:e.scrollTop,c=e===t?t.scrollX:e.scrollLeft;return{top:i.top+d-l,left:i.left+c-o}}function b(e,t){return r().getComputedStyle(e,null).getPropertyValue(t)}function y(e){let t,s=e;if(s){for(t=0;null!==(s=s.previousSibling);)1===s.nodeType&&(t+=1);return t}}function E(e,t){const s=[];let a=e.parentElement;for(;a;)t?a.matches(t)&&s.push(a):s.push(a),a=a.parentElement;return s}function x(e,t){t&&e.addEventListener("transitionend",(function s(a){a.target===e&&(t.call(e,a),e.removeEventListener("transitionend",s))}))}function S(e,t,s){const a=r();return s?e["width"===t?"offsetWidth":"offsetHeight"]+parseFloat(a.getComputedStyle(e,null).getPropertyValue("width"===t?"margin-right":"margin-top"))+parseFloat(a.getComputedStyle(e,null).getPropertyValue("width"===t?"margin-left":"margin-bottom")):e.offsetWidth}function T(e){return(Array.isArray(e)?e:[e]).filter((e=>!!e))}function M(e){return t=>Math.abs(t)>0&&e.browser&&e.browser.need3dFix&&Math.abs(t)%90==0?t+.001:t}let C,P,L;function I(){return C||(C=function(){const e=r(),t=a();return{smoothScroll:t.documentElement&&t.documentElement.style&&"scrollBehavior"in t.documentElement.style,touch:!!("ontouchstart"in e||e.DocumentTouch&&t instanceof e.DocumentTouch)}}()),C}function z(e){return void 0===e&&(e={}),P||(P=function(e){let{userAgent:t}=void 0===e?{}:e;const s=I(),a=r(),i=a.navigator.platform,n=t||a.navigator.userAgent,l={ios:!1,android:!1},o=a.screen.width,d=a.screen.height,c=n.match(/(Android);?[\s\/]+([\d.]+)?/);let p=n.match(/(iPad).*OS\s([\d_]+)/);const u=n.match(/(iPod)(.*OS\s([\d_]+))?/),m=!p&&n.match(/(iPhone\sOS|iOS)\s([\d_]+)/),h="Win32"===i;let f="MacIntel"===i;return!p&&f&&s.touch&&["1024x1366","1366x1024","834x1194","1194x834","834x1112","1112x834","768x1024","1024x768","820x1180","1180x820","810x1080","1080x810"].indexOf(`${o}x${d}`)>=0&&(p=n.match(/(Version)\/([\d.]+)/),p||(p=[0,1,"13_0_0"]),f=!1),c&&!h&&(l.os="android",l.android=!0),(p||m||u)&&(l.os="ios",l.ios=!0),l}(e)),P}function A(){return L||(L=function(){const e=r(),t=z();let s=!1;function a(){const t=e.navigator.userAgent.toLowerCase();return t.indexOf("safari")>=0&&t.indexOf("chrome")<0&&t.indexOf("android")<0}if(a()){const t=String(e.navigator.userAgent);if(t.includes("Version/")){const[e,a]=t.split("Version/")[1].split(" ")[0].split(".").map((e=>Number(e)));s=e<16||16===e&&a<2}}const i=/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent),n=a();return{isSafari:s||n,needPerspectiveFix:s,need3dFix:n||i&&t.ios,isWebView:i}}()),L}var $={on(e,t,s){const a=this;if(!a.eventsListeners||a.destroyed)return a;if("function"!=typeof t)return a;const i=s?"unshift":"push";return e.split(" ").forEach((e=>{a.eventsListeners[e]||(a.eventsListeners[e]=[]),a.eventsListeners[e][i](t)})),a},once(e,t,s){const a=this;if(!a.eventsListeners||a.destroyed)return a;if("function"!=typeof t)return a;function i(){a.off(e,i),i.__emitterProxy&&delete i.__emitterProxy;for(var s=arguments.length,r=new Array(s),n=0;n<s;n++)r[n]=arguments[n];t.apply(a,r)}return i.__emitterProxy=t,a.on(e,i,s)},onAny(e,t){const s=this;if(!s.eventsListeners||s.destroyed)return s;if("function"!=typeof e)return s;const a=t?"unshift":"push";return s.eventsAnyListeners.indexOf(e)<0&&s.eventsAnyListeners[a](e),s},offAny(e){const t=this;if(!t.eventsListeners||t.destroyed)return t;if(!t.eventsAnyListeners)return t;const s=t.eventsAnyListeners.indexOf(e);return s>=0&&t.eventsAnyListeners.splice(s,1),t},off(e,t){const s=this;return!s.eventsListeners||s.destroyed?s:s.eventsListeners?(e.split(" ").forEach((e=>{void 0===t?s.eventsListeners[e]=[]:s.eventsListeners[e]&&s.eventsListeners[e].forEach(((a,i)=>{(a===t||a.__emitterProxy&&a.__emitterProxy===t)&&s.eventsListeners[e].splice(i,1)}))})),s):s},emit(){const e=this;if(!e.eventsListeners||e.destroyed)return e;if(!e.eventsListeners)return e;let t,s,a;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];"string"==typeof r[0]||Array.isArray(r[0])?(t=r[0],s=r.slice(1,r.length),a=e):(t=r[0].events,s=r[0].data,a=r[0].context||e),s.unshift(a);return(Array.isArray(t)?t:t.split(" ")).forEach((t=>{e.eventsAnyListeners&&e.eventsAnyListeners.length&&e.eventsAnyListeners.forEach((e=>{e.apply(a,[t,...s])})),e.eventsListeners&&e.eventsListeners[t]&&e.eventsListeners[t].forEach((e=>{e.apply(a,s)}))})),e}};const k=(e,t,s)=>{t&&!e.classList.contains(s)?e.classList.add(s):!t&&e.classList.contains(s)&&e.classList.remove(s)};const O=(e,t,s)=>{t&&!e.classList.contains(s)?e.classList.add(s):!t&&e.classList.contains(s)&&e.classList.remove(s)};const D=(e,t)=>{if(!e||e.destroyed||!e.params)return;const s=t.closest(e.isElement?"swiper-slide":`.${e.params.slideClass}`);if(s){let t=s.querySelector(`.${e.params.lazyPreloaderClass}`);!t&&e.isElement&&(s.shadowRoot?t=s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`):requestAnimationFrame((()=>{s.shadowRoot&&(t=s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`),t&&t.remove())}))),t&&t.remove()}},G=(e,t)=>{if(!e.slides[t])return;const s=e.slides[t].querySelector('[loading="lazy"]');s&&s.removeAttribute("loading")},H=e=>{if(!e||e.destroyed||!e.params)return;let t=e.params.lazyPreloadPrevNext;const s=e.slides.length;if(!s||!t||t<0)return;t=Math.min(t,s);const a="auto"===e.params.slidesPerView?e.slidesPerViewDynamic():Math.ceil(e.params.slidesPerView),i=e.activeIndex;if(e.params.grid&&e.params.grid.rows>1){const s=i,r=[s-t];return r.push(...Array.from({length:t}).map(((e,t)=>s+a+t))),void e.slides.forEach(((t,s)=>{r.includes(t.column)&&G(e,s)}))}const r=i+a-1;if(e.params.rewind||e.params.loop)for(let a=i-t;a<=r+t;a+=1){const t=(a%s+s)%s;(t<i||t>r)&&G(e,t)}else for(let a=Math.max(i-t,0);a<=Math.min(r+t,s-1);a+=1)a!==i&&(a>r||a<i)&&G(e,a)};var X={updateSize:function(){const e=this;let t,s;const a=e.el;t=void 0!==e.params.width&&null!==e.params.width?e.params.width:a.clientWidth,s=void 0!==e.params.height&&null!==e.params.height?e.params.height:a.clientHeight,0===t&&e.isHorizontal()||0===s&&e.isVertical()||(t=t-parseInt(b(a,"padding-left")||0,10)-parseInt(b(a,"padding-right")||0,10),s=s-parseInt(b(a,"padding-top")||0,10)-parseInt(b(a,"padding-bottom")||0,10),Number.isNaN(t)&&(t=0),Number.isNaN(s)&&(s=0),Object.assign(e,{width:t,height:s,size:e.isHorizontal()?t:s}))},updateSlides:function(){const e=this;function t(t,s){return parseFloat(t.getPropertyValue(e.getDirectionLabel(s))||0)}const s=e.params,{wrapperEl:a,slidesEl:i,size:r,rtlTranslate:n,wrongRTL:l}=e,o=e.virtual&&s.virtual.enabled,d=o?e.virtual.slides.length:e.slides.length,c=f(i,`.${e.params.slideClass}, swiper-slide`),p=o?e.virtual.slides.length:c.length;let m=[];const h=[],g=[];let v=s.slidesOffsetBefore;"function"==typeof v&&(v=s.slidesOffsetBefore.call(e));let w=s.slidesOffsetAfter;"function"==typeof w&&(w=s.slidesOffsetAfter.call(e));const y=e.snapGrid.length,E=e.slidesGrid.length;let x=s.spaceBetween,T=-v,M=0,C=0;if(void 0===r)return;"string"==typeof x&&x.indexOf("%")>=0?x=parseFloat(x.replace("%",""))/100*r:"string"==typeof x&&(x=parseFloat(x)),e.virtualSize=-x,c.forEach((e=>{n?e.style.marginLeft="":e.style.marginRight="",e.style.marginBottom="",e.style.marginTop=""})),s.centeredSlides&&s.cssMode&&(u(a,"--swiper-centered-offset-before",""),u(a,"--swiper-centered-offset-after",""));const P=s.grid&&s.grid.rows>1&&e.grid;let L;P?e.grid.initSlides(c):e.grid&&e.grid.unsetSlides();const I="auto"===s.slidesPerView&&s.breakpoints&&Object.keys(s.breakpoints).filter((e=>void 0!==s.breakpoints[e].slidesPerView)).length>0;for(let a=0;a<p;a+=1){let i;if(L=0,c[a]&&(i=c[a]),P&&e.grid.updateSlide(a,i,c),!c[a]||"none"!==b(i,"display")){if("auto"===s.slidesPerView){I&&(c[a].style[e.getDirectionLabel("width")]="");const r=getComputedStyle(i),n=i.style.transform,l=i.style.webkitTransform;if(n&&(i.style.transform="none"),l&&(i.style.webkitTransform="none"),s.roundLengths)L=e.isHorizontal()?S(i,"width",!0):S(i,"height",!0);else{const e=t(r,"width"),s=t(r,"padding-left"),a=t(r,"padding-right"),n=t(r,"margin-left"),l=t(r,"margin-right"),o=r.getPropertyValue("box-sizing");if(o&&"border-box"===o)L=e+n+l;else{const{clientWidth:t,offsetWidth:r}=i;L=e+s+a+n+l+(r-t)}}n&&(i.style.transform=n),l&&(i.style.webkitTransform=l),s.roundLengths&&(L=Math.floor(L))}else L=(r-(s.slidesPerView-1)*x)/s.slidesPerView,s.roundLengths&&(L=Math.floor(L)),c[a]&&(c[a].style[e.getDirectionLabel("width")]=`${L}px`);c[a]&&(c[a].swiperSlideSize=L),g.push(L),s.centeredSlides?(T=T+L/2+M/2+x,0===M&&0!==a&&(T=T-r/2-x),0===a&&(T=T-r/2-x),Math.abs(T)<.001&&(T=0),s.roundLengths&&(T=Math.floor(T)),C%s.slidesPerGroup==0&&m.push(T),h.push(T)):(s.roundLengths&&(T=Math.floor(T)),(C-Math.min(e.params.slidesPerGroupSkip,C))%e.params.slidesPerGroup==0&&m.push(T),h.push(T),T=T+L+x),e.virtualSize+=L+x,M=L,C+=1}}if(e.virtualSize=Math.max(e.virtualSize,r)+w,n&&l&&("slide"===s.effect||"coverflow"===s.effect)&&(a.style.width=`${e.virtualSize+x}px`),s.setWrapperSize&&(a.style[e.getDirectionLabel("width")]=`${e.virtualSize+x}px`),P&&e.grid.updateWrapperSize(L,m),!s.centeredSlides){const t=[];for(let a=0;a<m.length;a+=1){let i=m[a];s.roundLengths&&(i=Math.floor(i)),m[a]<=e.virtualSize-r&&t.push(i)}m=t,Math.floor(e.virtualSize-r)-Math.floor(m[m.length-1])>1&&m.push(e.virtualSize-r)}if(o&&s.loop){const t=g[0]+x;if(s.slidesPerGroup>1){const a=Math.ceil((e.virtual.slidesBefore+e.virtual.slidesAfter)/s.slidesPerGroup),i=t*s.slidesPerGroup;for(let e=0;e<a;e+=1)m.push(m[m.length-1]+i)}for(let a=0;a<e.virtual.slidesBefore+e.virtual.slidesAfter;a+=1)1===s.slidesPerGroup&&m.push(m[m.length-1]+t),h.push(h[h.length-1]+t),e.virtualSize+=t}if(0===m.length&&(m=[0]),0!==x){const t=e.isHorizontal()&&n?"marginLeft":e.getDirectionLabel("marginRight");c.filter(((e,t)=>!(s.cssMode&&!s.loop)||t!==c.length-1)).forEach((e=>{e.style[t]=`${x}px`}))}if(s.centeredSlides&&s.centeredSlidesBounds){let e=0;g.forEach((t=>{e+=t+(x||0)})),e-=x;const t=e>r?e-r:0;m=m.map((e=>e<=0?-v:e>t?t+w:e))}if(s.centerInsufficientSlides){let e=0;g.forEach((t=>{e+=t+(x||0)})),e-=x;const t=(s.slidesOffsetBefore||0)+(s.slidesOffsetAfter||0);if(e+t<r){const s=(r-e-t)/2;m.forEach(((e,t)=>{m[t]=e-s})),h.forEach(((e,t)=>{h[t]=e+s}))}}if(Object.assign(e,{slides:c,snapGrid:m,slidesGrid:h,slidesSizesGrid:g}),s.centeredSlides&&s.cssMode&&!s.centeredSlidesBounds){u(a,"--swiper-centered-offset-before",-m[0]+"px"),u(a,"--swiper-centered-offset-after",e.size/2-g[g.length-1]/2+"px");const t=-e.snapGrid[0],s=-e.slidesGrid[0];e.snapGrid=e.snapGrid.map((e=>e+t)),e.slidesGrid=e.slidesGrid.map((e=>e+s))}if(p!==d&&e.emit("slidesLengthChange"),m.length!==y&&(e.params.watchOverflow&&e.checkOverflow(),e.emit("snapGridLengthChange")),h.length!==E&&e.emit("slidesGridLengthChange"),s.watchSlidesProgress&&e.updateSlidesOffset(),e.emit("slidesUpdated"),!(o||s.cssMode||"slide"!==s.effect&&"fade"!==s.effect)){const t=`${s.containerModifierClass}backface-hidden`,a=e.el.classList.contains(t);p<=s.maxBackfaceHiddenSlides?a||e.el.classList.add(t):a&&e.el.classList.remove(t)}},updateAutoHeight:function(e){const t=this,s=[],a=t.virtual&&t.params.virtual.enabled;let i,r=0;"number"==typeof e?t.setTransition(e):!0===e&&t.setTransition(t.params.speed);const n=e=>a?t.slides[t.getSlideIndexByData(e)]:t.slides[e];if("auto"!==t.params.slidesPerView&&t.params.slidesPerView>1)if(t.params.centeredSlides)(t.visibleSlides||[]).forEach((e=>{s.push(e)}));else for(i=0;i<Math.ceil(t.params.slidesPerView);i+=1){const e=t.activeIndex+i;if(e>t.slides.length&&!a)break;s.push(n(e))}else s.push(n(t.activeIndex));for(i=0;i<s.length;i+=1)if(void 0!==s[i]){const e=s[i].offsetHeight;r=e>r?e:r}(r||0===r)&&(t.wrapperEl.style.height=`${r}px`)},updateSlidesOffset:function(){const e=this,t=e.slides,s=e.isElement?e.isHorizontal()?e.wrapperEl.offsetLeft:e.wrapperEl.offsetTop:0;for(let a=0;a<t.length;a+=1)t[a].swiperSlideOffset=(e.isHorizontal()?t[a].offsetLeft:t[a].offsetTop)-s-e.cssOverflowAdjustment()},updateSlidesProgress:function(e){void 0===e&&(e=this&&this.translate||0);const t=this,s=t.params,{slides:a,rtlTranslate:i,snapGrid:r}=t;if(0===a.length)return;void 0===a[0].swiperSlideOffset&&t.updateSlidesOffset();let n=-e;i&&(n=e),t.visibleSlidesIndexes=[],t.visibleSlides=[];let l=s.spaceBetween;"string"==typeof l&&l.indexOf("%")>=0?l=parseFloat(l.replace("%",""))/100*t.size:"string"==typeof l&&(l=parseFloat(l));for(let e=0;e<a.length;e+=1){const o=a[e];let d=o.swiperSlideOffset;s.cssMode&&s.centeredSlides&&(d-=a[0].swiperSlideOffset);const c=(n+(s.centeredSlides?t.minTranslate():0)-d)/(o.swiperSlideSize+l),p=(n-r[0]+(s.centeredSlides?t.minTranslate():0)-d)/(o.swiperSlideSize+l),u=-(n-d),m=u+t.slidesSizesGrid[e],h=u>=0&&u<=t.size-t.slidesSizesGrid[e],f=u>=0&&u<t.size-1||m>1&&m<=t.size||u<=0&&m>=t.size;f&&(t.visibleSlides.push(o),t.visibleSlidesIndexes.push(e)),k(o,f,s.slideVisibleClass),k(o,h,s.slideFullyVisibleClass),o.progress=i?-c:c,o.originalProgress=i?-p:p}},updateProgress:function(e){const t=this;if(void 0===e){const s=t.rtlTranslate?-1:1;e=t&&t.translate&&t.translate*s||0}const s=t.params,a=t.maxTranslate()-t.minTranslate();let{progress:i,isBeginning:r,isEnd:n,progressLoop:l}=t;const o=r,d=n;if(0===a)i=0,r=!0,n=!0;else{i=(e-t.minTranslate())/a;const s=Math.abs(e-t.minTranslate())<1,l=Math.abs(e-t.maxTranslate())<1;r=s||i<=0,n=l||i>=1,s&&(i=0),l&&(i=1)}if(s.loop){const s=t.getSlideIndexByData(0),a=t.getSlideIndexByData(t.slides.length-1),i=t.slidesGrid[s],r=t.slidesGrid[a],n=t.slidesGrid[t.slidesGrid.length-1],o=Math.abs(e);l=o>=i?(o-i)/n:(o+n-r)/n,l>1&&(l-=1)}Object.assign(t,{progress:i,progressLoop:l,isBeginning:r,isEnd:n}),(s.watchSlidesProgress||s.centeredSlides&&s.autoHeight)&&t.updateSlidesProgress(e),r&&!o&&t.emit("reachBeginning toEdge"),n&&!d&&t.emit("reachEnd toEdge"),(o&&!r||d&&!n)&&t.emit("fromEdge"),t.emit("progress",i)},updateSlidesClasses:function(){const e=this,{slides:t,params:s,slidesEl:a,activeIndex:i}=e,r=e.virtual&&s.virtual.enabled,n=e.grid&&s.grid&&s.grid.rows>1,l=e=>f(a,`.${s.slideClass}${e}, swiper-slide${e}`)[0];let o,d,c;if(r)if(s.loop){let t=i-e.virtual.slidesBefore;t<0&&(t=e.virtual.slides.length+t),t>=e.virtual.slides.length&&(t-=e.virtual.slides.length),o=l(`[data-swiper-slide-index="${t}"]`)}else o=l(`[data-swiper-slide-index="${i}"]`);else n?(o=t.find((e=>e.column===i)),c=t.find((e=>e.column===i+1)),d=t.find((e=>e.column===i-1))):o=t[i];o&&(n||(c=function(e,t){const s=[];for(;e.nextElementSibling;){const a=e.nextElementSibling;t?a.matches(t)&&s.push(a):s.push(a),e=a}return s}(o,`.${s.slideClass}, swiper-slide`)[0],s.loop&&!c&&(c=t[0]),d=function(e,t){const s=[];for(;e.previousElementSibling;){const a=e.previousElementSibling;t?a.matches(t)&&s.push(a):s.push(a),e=a}return s}(o,`.${s.slideClass}, swiper-slide`)[0],s.loop&&0===!d&&(d=t[t.length-1]))),t.forEach((e=>{O(e,e===o,s.slideActiveClass),O(e,e===c,s.slideNextClass),O(e,e===d,s.slidePrevClass)})),e.emitSlidesClasses()},updateActiveIndex:function(e){const t=this,s=t.rtlTranslate?t.translate:-t.translate,{snapGrid:a,params:i,activeIndex:r,realIndex:n,snapIndex:l}=t;let o,d=e;const c=e=>{let s=e-t.virtual.slidesBefore;return s<0&&(s=t.virtual.slides.length+s),s>=t.virtual.slides.length&&(s-=t.virtual.slides.length),s};if(void 0===d&&(d=function(e){const{slidesGrid:t,params:s}=e,a=e.rtlTranslate?e.translate:-e.translate;let i;for(let e=0;e<t.length;e+=1)void 0!==t[e+1]?a>=t[e]&&a<t[e+1]-(t[e+1]-t[e])/2?i=e:a>=t[e]&&a<t[e+1]&&(i=e+1):a>=t[e]&&(i=e);return s.normalizeSlideIndex&&(i<0||void 0===i)&&(i=0),i}(t)),a.indexOf(s)>=0)o=a.indexOf(s);else{const e=Math.min(i.slidesPerGroupSkip,d);o=e+Math.floor((d-e)/i.slidesPerGroup)}if(o>=a.length&&(o=a.length-1),d===r&&!t.params.loop)return void(o!==l&&(t.snapIndex=o,t.emit("snapIndexChange")));if(d===r&&t.params.loop&&t.virtual&&t.params.virtual.enabled)return void(t.realIndex=c(d));const p=t.grid&&i.grid&&i.grid.rows>1;let u;if(t.virtual&&i.virtual.enabled&&i.loop)u=c(d);else if(p){const e=t.slides.find((e=>e.column===d));let s=parseInt(e.getAttribute("data-swiper-slide-index"),10);Number.isNaN(s)&&(s=Math.max(t.slides.indexOf(e),0)),u=Math.floor(s/i.grid.rows)}else if(t.slides[d]){const e=t.slides[d].getAttribute("data-swiper-slide-index");u=e?parseInt(e,10):d}else u=d;Object.assign(t,{previousSnapIndex:l,snapIndex:o,previousRealIndex:n,realIndex:u,previousIndex:r,activeIndex:d}),t.initialized&&H(t),t.emit("activeIndexChange"),t.emit("snapIndexChange"),(t.initialized||t.params.runCallbacksOnInit)&&(n!==u&&t.emit("realIndexChange"),t.emit("slideChange"))},updateClickedSlide:function(e,t){const s=this,a=s.params;let i=e.closest(`.${a.slideClass}, swiper-slide`);!i&&s.isElement&&t&&t.length>1&&t.includes(e)&&[...t.slice(t.indexOf(e)+1,t.length)].forEach((e=>{!i&&e.matches&&e.matches(`.${a.slideClass}, swiper-slide`)&&(i=e)}));let r,n=!1;if(i)for(let e=0;e<s.slides.length;e+=1)if(s.slides[e]===i){n=!0,r=e;break}if(!i||!n)return s.clickedSlide=void 0,void(s.clickedIndex=void 0);s.clickedSlide=i,s.virtual&&s.params.virtual.enabled?s.clickedIndex=parseInt(i.getAttribute("data-swiper-slide-index"),10):s.clickedIndex=r,a.slideToClickedSlide&&void 0!==s.clickedIndex&&s.clickedIndex!==s.activeIndex&&s.slideToClickedSlide()}};var B={getTranslate:function(e){void 0===e&&(e=this.isHorizontal()?"x":"y");const{params:t,rtlTranslate:s,translate:a,wrapperEl:i}=this;if(t.virtualTranslate)return s?-a:a;if(t.cssMode)return a;let r=d(i,e);return r+=this.cssOverflowAdjustment(),s&&(r=-r),r||0},setTranslate:function(e,t){const s=this,{rtlTranslate:a,params:i,wrapperEl:r,progress:n}=s;let l,o=0,d=0;s.isHorizontal()?o=a?-e:e:d=e,i.roundLengths&&(o=Math.floor(o),d=Math.floor(d)),s.previousTranslate=s.translate,s.translate=s.isHorizontal()?o:d,i.cssMode?r[s.isHorizontal()?"scrollLeft":"scrollTop"]=s.isHorizontal()?-o:-d:i.virtualTranslate||(s.isHorizontal()?o-=s.cssOverflowAdjustment():d-=s.cssOverflowAdjustment(),r.style.transform=`translate3d(${o}px, ${d}px, 0px)`);const c=s.maxTranslate()-s.minTranslate();l=0===c?0:(e-s.minTranslate())/c,l!==n&&s.updateProgress(e),s.emit("setTranslate",s.translate,t)},minTranslate:function(){return-this.snapGrid[0]},maxTranslate:function(){return-this.snapGrid[this.snapGrid.length-1]},translateTo:function(e,t,s,a,i){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===s&&(s=!0),void 0===a&&(a=!0);const r=this,{params:n,wrapperEl:l}=r;if(r.animating&&n.preventInteractionOnTransition)return!1;const o=r.minTranslate(),d=r.maxTranslate();let c;if(c=a&&e>o?o:a&&e<d?d:e,r.updateProgress(c),n.cssMode){const e=r.isHorizontal();if(0===t)l[e?"scrollLeft":"scrollTop"]=-c;else{if(!r.support.smoothScroll)return m({swiper:r,targetPosition:-c,side:e?"left":"top"}),!0;l.scrollTo({[e?"left":"top"]:-c,behavior:"smooth"})}return!0}return 0===t?(r.setTransition(0),r.setTranslate(c),s&&(r.emit("beforeTransitionStart",t,i),r.emit("transitionEnd"))):(r.setTransition(t),r.setTranslate(c),s&&(r.emit("beforeTransitionStart",t,i),r.emit("transitionStart")),r.animating||(r.animating=!0,r.onTranslateToWrapperTransitionEnd||(r.onTranslateToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.wrapperEl.removeEventListener("transitionend",r.onTranslateToWrapperTransitionEnd),r.onTranslateToWrapperTransitionEnd=null,delete r.onTranslateToWrapperTransitionEnd,r.animating=!1,s&&r.emit("transitionEnd"))}),r.wrapperEl.addEventListener("transitionend",r.onTranslateToWrapperTransitionEnd))),!0}};function Y(e){let{swiper:t,runCallbacks:s,direction:a,step:i}=e;const{activeIndex:r,previousIndex:n}=t;let l=a;if(l||(l=r>n?"next":r<n?"prev":"reset"),t.emit(`transition${i}`),s&&r!==n){if("reset"===l)return void t.emit(`slideResetTransition${i}`);t.emit(`slideChangeTransition${i}`),"next"===l?t.emit(`slideNextTransition${i}`):t.emit(`slidePrevTransition${i}`)}}var N={slideTo:function(e,t,s,a,i){void 0===e&&(e=0),void 0===s&&(s=!0),"string"==typeof e&&(e=parseInt(e,10));const r=this;let n=e;n<0&&(n=0);const{params:l,snapGrid:o,slidesGrid:d,previousIndex:c,activeIndex:p,rtlTranslate:u,wrapperEl:h,enabled:f}=r;if(!f&&!a&&!i||r.destroyed||r.animating&&l.preventInteractionOnTransition)return!1;void 0===t&&(t=r.params.speed);const g=Math.min(r.params.slidesPerGroupSkip,n);let v=g+Math.floor((n-g)/r.params.slidesPerGroup);v>=o.length&&(v=o.length-1);const w=-o[v];if(l.normalizeSlideIndex)for(let e=0;e<d.length;e+=1){const t=-Math.floor(100*w),s=Math.floor(100*d[e]),a=Math.floor(100*d[e+1]);void 0!==d[e+1]?t>=s&&t<a-(a-s)/2?n=e:t>=s&&t<a&&(n=e+1):t>=s&&(n=e)}if(r.initialized&&n!==p){if(!r.allowSlideNext&&(u?w>r.translate&&w>r.minTranslate():w<r.translate&&w<r.minTranslate()))return!1;if(!r.allowSlidePrev&&w>r.translate&&w>r.maxTranslate()&&(p||0)!==n)return!1}let b;n!==(c||0)&&s&&r.emit("beforeSlideChangeStart"),r.updateProgress(w),b=n>p?"next":n<p?"prev":"reset";const y=r.virtual&&r.params.virtual.enabled;if(!(y&&i)&&(u&&-w===r.translate||!u&&w===r.translate))return r.updateActiveIndex(n),l.autoHeight&&r.updateAutoHeight(),r.updateSlidesClasses(),"slide"!==l.effect&&r.setTranslate(w),"reset"!==b&&(r.transitionStart(s,b),r.transitionEnd(s,b)),!1;if(l.cssMode){const e=r.isHorizontal(),s=u?w:-w;if(0===t)y&&(r.wrapperEl.style.scrollSnapType="none",r._immediateVirtual=!0),y&&!r._cssModeVirtualInitialSet&&r.params.initialSlide>0?(r._cssModeVirtualInitialSet=!0,requestAnimationFrame((()=>{h[e?"scrollLeft":"scrollTop"]=s}))):h[e?"scrollLeft":"scrollTop"]=s,y&&requestAnimationFrame((()=>{r.wrapperEl.style.scrollSnapType="",r._immediateVirtual=!1}));else{if(!r.support.smoothScroll)return m({swiper:r,targetPosition:s,side:e?"left":"top"}),!0;h.scrollTo({[e?"left":"top"]:s,behavior:"smooth"})}return!0}const E=A().isSafari;return y&&!i&&E&&r.isElement&&r.virtual.update(!1,!1,n),r.setTransition(t),r.setTranslate(w),r.updateActiveIndex(n),r.updateSlidesClasses(),r.emit("beforeTransitionStart",t,a),r.transitionStart(s,b),0===t?r.transitionEnd(s,b):r.animating||(r.animating=!0,r.onSlideToWrapperTransitionEnd||(r.onSlideToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.wrapperEl.removeEventListener("transitionend",r.onSlideToWrapperTransitionEnd),r.onSlideToWrapperTransitionEnd=null,delete r.onSlideToWrapperTransitionEnd,r.transitionEnd(s,b))}),r.wrapperEl.addEventListener("transitionend",r.onSlideToWrapperTransitionEnd)),!0},slideToLoop:function(e,t,s,a){if(void 0===e&&(e=0),void 0===s&&(s=!0),"string"==typeof e){e=parseInt(e,10)}const i=this;if(i.destroyed)return;void 0===t&&(t=i.params.speed);const r=i.grid&&i.params.grid&&i.params.grid.rows>1;let n=e;if(i.params.loop)if(i.virtual&&i.params.virtual.enabled)n+=i.virtual.slidesBefore;else{let e;if(r){const t=n*i.params.grid.rows;e=i.slides.find((e=>1*e.getAttribute("data-swiper-slide-index")===t)).column}else e=i.getSlideIndexByData(n);const t=r?Math.ceil(i.slides.length/i.params.grid.rows):i.slides.length,{centeredSlides:s}=i.params;let l=i.params.slidesPerView;"auto"===l?l=i.slidesPerViewDynamic():(l=Math.ceil(parseFloat(i.params.slidesPerView,10)),s&&l%2==0&&(l+=1));let o=t-e<l;if(s&&(o=o||e<Math.ceil(l/2)),a&&s&&"auto"!==i.params.slidesPerView&&!r&&(o=!1),o){const a=s?e<i.activeIndex?"prev":"next":e-i.activeIndex-1<i.params.slidesPerView?"next":"prev";i.loopFix({direction:a,slideTo:!0,activeSlideIndex:"next"===a?e+1:e-t+1,slideRealIndex:"next"===a?i.realIndex:void 0})}if(r){const e=n*i.params.grid.rows;n=i.slides.find((t=>1*t.getAttribute("data-swiper-slide-index")===e)).column}else n=i.getSlideIndexByData(n)}return requestAnimationFrame((()=>{i.slideTo(n,t,s,a)})),i},slideNext:function(e,t,s){void 0===t&&(t=!0);const a=this,{enabled:i,params:r,animating:n}=a;if(!i||a.destroyed)return a;void 0===e&&(e=a.params.speed);let l=r.slidesPerGroup;"auto"===r.slidesPerView&&1===r.slidesPerGroup&&r.slidesPerGroupAuto&&(l=Math.max(a.slidesPerViewDynamic("current",!0),1));const o=a.activeIndex<r.slidesPerGroupSkip?1:l,d=a.virtual&&r.virtual.enabled;if(r.loop){if(n&&!d&&r.loopPreventsSliding)return!1;if(a.loopFix({direction:"next"}),a._clientLeft=a.wrapperEl.clientLeft,a.activeIndex===a.slides.length-1&&r.cssMode)return requestAnimationFrame((()=>{a.slideTo(a.activeIndex+o,e,t,s)})),!0}return r.rewind&&a.isEnd?a.slideTo(0,e,t,s):a.slideTo(a.activeIndex+o,e,t,s)},slidePrev:function(e,t,s){void 0===t&&(t=!0);const a=this,{params:i,snapGrid:r,slidesGrid:n,rtlTranslate:l,enabled:o,animating:d}=a;if(!o||a.destroyed)return a;void 0===e&&(e=a.params.speed);const c=a.virtual&&i.virtual.enabled;if(i.loop){if(d&&!c&&i.loopPreventsSliding)return!1;a.loopFix({direction:"prev"}),a._clientLeft=a.wrapperEl.clientLeft}function p(e){return e<0?-Math.floor(Math.abs(e)):Math.floor(e)}const u=p(l?a.translate:-a.translate),m=r.map((e=>p(e))),h=i.freeMode&&i.freeMode.enabled;let f=r[m.indexOf(u)-1];if(void 0===f&&(i.cssMode||h)){let e;r.forEach(((t,s)=>{u>=t&&(e=s)})),void 0!==e&&(f=h?r[e]:r[e>0?e-1:e])}let g=0;if(void 0!==f&&(g=n.indexOf(f),g<0&&(g=a.activeIndex-1),"auto"===i.slidesPerView&&1===i.slidesPerGroup&&i.slidesPerGroupAuto&&(g=g-a.slidesPerViewDynamic("previous",!0)+1,g=Math.max(g,0))),i.rewind&&a.isBeginning){const i=a.params.virtual&&a.params.virtual.enabled&&a.virtual?a.virtual.slides.length-1:a.slides.length-1;return a.slideTo(i,e,t,s)}return i.loop&&0===a.activeIndex&&i.cssMode?(requestAnimationFrame((()=>{a.slideTo(g,e,t,s)})),!0):a.slideTo(g,e,t,s)},slideReset:function(e,t,s){void 0===t&&(t=!0);const a=this;if(!a.destroyed)return void 0===e&&(e=a.params.speed),a.slideTo(a.activeIndex,e,t,s)},slideToClosest:function(e,t,s,a){void 0===t&&(t=!0),void 0===a&&(a=.5);const i=this;if(i.destroyed)return;void 0===e&&(e=i.params.speed);let r=i.activeIndex;const n=Math.min(i.params.slidesPerGroupSkip,r),l=n+Math.floor((r-n)/i.params.slidesPerGroup),o=i.rtlTranslate?i.translate:-i.translate;if(o>=i.snapGrid[l]){const e=i.snapGrid[l];o-e>(i.snapGrid[l+1]-e)*a&&(r+=i.params.slidesPerGroup)}else{const e=i.snapGrid[l-1];o-e<=(i.snapGrid[l]-e)*a&&(r-=i.params.slidesPerGroup)}return r=Math.max(r,0),r=Math.min(r,i.slidesGrid.length-1),i.slideTo(r,e,t,s)},slideToClickedSlide:function(){const e=this;if(e.destroyed)return;const{params:t,slidesEl:s}=e,a="auto"===t.slidesPerView?e.slidesPerViewDynamic():t.slidesPerView;let i,r=e.clickedIndex;const n=e.isElement?"swiper-slide":`.${t.slideClass}`;if(t.loop){if(e.animating)return;i=parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"),10),t.centeredSlides?r<e.loopedSlides-a/2||r>e.slides.length-e.loopedSlides+a/2?(e.loopFix(),r=e.getSlideIndex(f(s,`${n}[data-swiper-slide-index="${i}"]`)[0]),l((()=>{e.slideTo(r)}))):e.slideTo(r):r>e.slides.length-a?(e.loopFix(),r=e.getSlideIndex(f(s,`${n}[data-swiper-slide-index="${i}"]`)[0]),l((()=>{e.slideTo(r)}))):e.slideTo(r)}else e.slideTo(r)}};var R={loopCreate:function(e){const t=this,{params:s,slidesEl:a}=t;if(!s.loop||t.virtual&&t.params.virtual.enabled)return;const i=()=>{f(a,`.${s.slideClass}, swiper-slide`).forEach(((e,t)=>{e.setAttribute("data-swiper-slide-index",t)}))},r=t.grid&&s.grid&&s.grid.rows>1,n=s.slidesPerGroup*(r?s.grid.rows:1),l=t.slides.length%n!=0,o=r&&t.slides.length%s.grid.rows!=0,d=e=>{for(let a=0;a<e;a+=1){const e=t.isElement?v("swiper-slide",[s.slideBlankClass]):v("div",[s.slideClass,s.slideBlankClass]);t.slidesEl.append(e)}};if(l){if(s.loopAddBlankSlides){d(n-t.slides.length%n),t.recalcSlides(),t.updateSlides()}else g("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");i()}else if(o){if(s.loopAddBlankSlides){d(s.grid.rows-t.slides.length%s.grid.rows),t.recalcSlides(),t.updateSlides()}else g("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");i()}else i();t.loopFix({slideRealIndex:e,direction:s.centeredSlides?void 0:"next"})},loopFix:function(e){let{slideRealIndex:t,slideTo:s=!0,direction:a,setTranslate:i,activeSlideIndex:r,byController:n,byMousewheel:l}=void 0===e?{}:e;const o=this;if(!o.params.loop)return;o.emit("beforeLoopFix");const{slides:d,allowSlidePrev:c,allowSlideNext:p,slidesEl:u,params:m}=o,{centeredSlides:h}=m;if(o.allowSlidePrev=!0,o.allowSlideNext=!0,o.virtual&&m.virtual.enabled)return s&&(m.centeredSlides||0!==o.snapIndex?m.centeredSlides&&o.snapIndex<m.slidesPerView?o.slideTo(o.virtual.slides.length+o.snapIndex,0,!1,!0):o.snapIndex===o.snapGrid.length-1&&o.slideTo(o.virtual.slidesBefore,0,!1,!0):o.slideTo(o.virtual.slides.length,0,!1,!0)),o.allowSlidePrev=c,o.allowSlideNext=p,void o.emit("loopFix");let f=m.slidesPerView;"auto"===f?f=o.slidesPerViewDynamic():(f=Math.ceil(parseFloat(m.slidesPerView,10)),h&&f%2==0&&(f+=1));const v=m.slidesPerGroupAuto?f:m.slidesPerGroup;let w=v;w%v!=0&&(w+=v-w%v),w+=m.loopAdditionalSlides,o.loopedSlides=w;const b=o.grid&&m.grid&&m.grid.rows>1;d.length<f+w?g("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"):b&&"row"===m.grid.fill&&g("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");const y=[],E=[];let x=o.activeIndex;void 0===r?r=o.getSlideIndex(d.find((e=>e.classList.contains(m.slideActiveClass)))):x=r;const S="next"===a||!a,T="prev"===a||!a;let M=0,C=0;const P=b?Math.ceil(d.length/m.grid.rows):d.length,L=(b?d[r].column:r)+(h&&void 0===i?-f/2+.5:0);if(L<w){M=Math.max(w-L,v);for(let e=0;e<w-L;e+=1){const t=e-Math.floor(e/P)*P;if(b){const e=P-t-1;for(let t=d.length-1;t>=0;t-=1)d[t].column===e&&y.push(t)}else y.push(P-t-1)}}else if(L+f>P-w){C=Math.max(L-(P-2*w),v);for(let e=0;e<C;e+=1){const t=e-Math.floor(e/P)*P;b?d.forEach(((e,s)=>{e.column===t&&E.push(s)})):E.push(t)}}if(o.__preventObserver__=!0,requestAnimationFrame((()=>{o.__preventObserver__=!1})),T&&y.forEach((e=>{d[e].swiperLoopMoveDOM=!0,u.prepend(d[e]),d[e].swiperLoopMoveDOM=!1})),S&&E.forEach((e=>{d[e].swiperLoopMoveDOM=!0,u.append(d[e]),d[e].swiperLoopMoveDOM=!1})),o.recalcSlides(),"auto"===m.slidesPerView?o.updateSlides():b&&(y.length>0&&T||E.length>0&&S)&&o.slides.forEach(((e,t)=>{o.grid.updateSlide(t,e,o.slides)})),m.watchSlidesProgress&&o.updateSlidesOffset(),s)if(y.length>0&&T){if(void 0===t){const e=o.slidesGrid[x],t=o.slidesGrid[x+M]-e;l?o.setTranslate(o.translate-t):(o.slideTo(x+Math.ceil(M),0,!1,!0),i&&(o.touchEventsData.startTranslate=o.touchEventsData.startTranslate-t,o.touchEventsData.currentTranslate=o.touchEventsData.currentTranslate-t))}else if(i){const e=b?y.length/m.grid.rows:y.length;o.slideTo(o.activeIndex+e,0,!1,!0),o.touchEventsData.currentTranslate=o.translate}}else if(E.length>0&&S)if(void 0===t){const e=o.slidesGrid[x],t=o.slidesGrid[x-C]-e;l?o.setTranslate(o.translate-t):(o.slideTo(x-C,0,!1,!0),i&&(o.touchEventsData.startTranslate=o.touchEventsData.startTranslate-t,o.touchEventsData.currentTranslate=o.touchEventsData.currentTranslate-t))}else{const e=b?E.length/m.grid.rows:E.length;o.slideTo(o.activeIndex-e,0,!1,!0)}if(o.allowSlidePrev=c,o.allowSlideNext=p,o.controller&&o.controller.control&&!n){const e={slideRealIndex:t,direction:a,setTranslate:i,activeSlideIndex:r,byController:!0};Array.isArray(o.controller.control)?o.controller.control.forEach((t=>{!t.destroyed&&t.params.loop&&t.loopFix({...e,slideTo:t.params.slidesPerView===m.slidesPerView&&s})})):o.controller.control instanceof o.constructor&&o.controller.control.params.loop&&o.controller.control.loopFix({...e,slideTo:o.controller.control.params.slidesPerView===m.slidesPerView&&s})}o.emit("loopFix")},loopDestroy:function(){const e=this,{params:t,slidesEl:s}=e;if(!t.loop||e.virtual&&e.params.virtual.enabled)return;e.recalcSlides();const a=[];e.slides.forEach((e=>{const t=void 0===e.swiperSlideIndex?1*e.getAttribute("data-swiper-slide-index"):e.swiperSlideIndex;a[t]=e})),e.slides.forEach((e=>{e.removeAttribute("data-swiper-slide-index")})),a.forEach((e=>{s.append(e)})),e.recalcSlides(),e.slideTo(e.realIndex,0)}};function q(e,t,s){const a=r(),{params:i}=e,n=i.edgeSwipeDetection,l=i.edgeSwipeThreshold;return!n||!(s<=l||s>=a.innerWidth-l)||"prevent"===n&&(t.preventDefault(),!0)}function _(e){const t=this,s=a();let i=e;i.originalEvent&&(i=i.originalEvent);const n=t.touchEventsData;if("pointerdown"===i.type){if(null!==n.pointerId&&n.pointerId!==i.pointerId)return;n.pointerId=i.pointerId}else"touchstart"===i.type&&1===i.targetTouches.length&&(n.touchId=i.targetTouches[0].identifier);if("touchstart"===i.type)return void q(t,i,i.targetTouches[0].pageX);const{params:l,touches:d,enabled:c}=t;if(!c)return;if(!l.simulateTouch&&"mouse"===i.pointerType)return;if(t.animating&&l.preventInteractionOnTransition)return;!t.animating&&l.cssMode&&l.loop&&t.loopFix();let p=i.target;if("wrapper"===l.touchEventsTarget&&!function(e,t){const s=r();let a=t.contains(e);!a&&s.HTMLSlotElement&&t instanceof HTMLSlotElement&&(a=[...t.assignedElements()].includes(e),a||(a=function(e,t){const s=[t];for(;s.length>0;){const t=s.shift();if(e===t)return!0;s.push(...t.children,...t.shadowRoot?t.shadowRoot.children:[],...t.assignedElements?t.assignedElements():[])}}(e,t)));return a}(p,t.wrapperEl))return;if("which"in i&&3===i.which)return;if("button"in i&&i.button>0)return;if(n.isTouched&&n.isMoved)return;const u=!!l.noSwipingClass&&""!==l.noSwipingClass,m=i.composedPath?i.composedPath():i.path;u&&i.target&&i.target.shadowRoot&&m&&(p=m[0]);const h=l.noSwipingSelector?l.noSwipingSelector:`.${l.noSwipingClass}`,f=!(!i.target||!i.target.shadowRoot);if(l.noSwiping&&(f?function(e,t){return void 0===t&&(t=this),function t(s){if(!s||s===a()||s===r())return null;s.assignedSlot&&(s=s.assignedSlot);const i=s.closest(e);return i||s.getRootNode?i||t(s.getRootNode().host):null}(t)}(h,p):p.closest(h)))return void(t.allowClick=!0);if(l.swipeHandler&&!p.closest(l.swipeHandler))return;d.currentX=i.pageX,d.currentY=i.pageY;const g=d.currentX,v=d.currentY;if(!q(t,i,g))return;Object.assign(n,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),d.startX=g,d.startY=v,n.touchStartTime=o(),t.allowClick=!0,t.updateSize(),t.swipeDirection=void 0,l.threshold>0&&(n.allowThresholdMove=!1);let w=!0;p.matches(n.focusableElements)&&(w=!1,"SELECT"===p.nodeName&&(n.isTouched=!1)),s.activeElement&&s.activeElement.matches(n.focusableElements)&&s.activeElement!==p&&("mouse"===i.pointerType||"mouse"!==i.pointerType&&!p.matches(n.focusableElements))&&s.activeElement.blur();const b=w&&t.allowTouchMove&&l.touchStartPreventDefault;!l.touchStartForcePreventDefault&&!b||p.isContentEditable||i.preventDefault(),l.freeMode&&l.freeMode.enabled&&t.freeMode&&t.animating&&!l.cssMode&&t.freeMode.onTouchStart(),t.emit("touchStart",i)}function F(e){const t=a(),s=this,i=s.touchEventsData,{params:r,touches:n,rtlTranslate:l,enabled:d}=s;if(!d)return;if(!r.simulateTouch&&"mouse"===e.pointerType)return;let c,p=e;if(p.originalEvent&&(p=p.originalEvent),"pointermove"===p.type){if(null!==i.touchId)return;if(p.pointerId!==i.pointerId)return}if("touchmove"===p.type){if(c=[...p.changedTouches].find((e=>e.identifier===i.touchId)),!c||c.identifier!==i.touchId)return}else c=p;if(!i.isTouched)return void(i.startMoving&&i.isScrolling&&s.emit("touchMoveOpposite",p));const u=c.pageX,m=c.pageY;if(p.preventedByNestedSwiper)return n.startX=u,void(n.startY=m);if(!s.allowTouchMove)return p.target.matches(i.focusableElements)||(s.allowClick=!1),void(i.isTouched&&(Object.assign(n,{startX:u,startY:m,currentX:u,currentY:m}),i.touchStartTime=o()));if(r.touchReleaseOnEdges&&!r.loop)if(s.isVertical()){if(m<n.startY&&s.translate<=s.maxTranslate()||m>n.startY&&s.translate>=s.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(u<n.startX&&s.translate<=s.maxTranslate()||u>n.startX&&s.translate>=s.minTranslate())return;if(t.activeElement&&t.activeElement.matches(i.focusableElements)&&t.activeElement!==p.target&&"mouse"!==p.pointerType&&t.activeElement.blur(),t.activeElement&&p.target===t.activeElement&&p.target.matches(i.focusableElements))return i.isMoved=!0,void(s.allowClick=!1);i.allowTouchCallbacks&&s.emit("touchMove",p),n.previousX=n.currentX,n.previousY=n.currentY,n.currentX=u,n.currentY=m;const h=n.currentX-n.startX,f=n.currentY-n.startY;if(s.params.threshold&&Math.sqrt(h**2+f**2)<s.params.threshold)return;if(void 0===i.isScrolling){let e;s.isHorizontal()&&n.currentY===n.startY||s.isVertical()&&n.currentX===n.startX?i.isScrolling=!1:h*h+f*f>=25&&(e=180*Math.atan2(Math.abs(f),Math.abs(h))/Math.PI,i.isScrolling=s.isHorizontal()?e>r.touchAngle:90-e>r.touchAngle)}if(i.isScrolling&&s.emit("touchMoveOpposite",p),void 0===i.startMoving&&(n.currentX===n.startX&&n.currentY===n.startY||(i.startMoving=!0)),i.isScrolling||"touchmove"===p.type&&i.preventTouchMoveFromPointerMove)return void(i.isTouched=!1);if(!i.startMoving)return;s.allowClick=!1,!r.cssMode&&p.cancelable&&p.preventDefault(),r.touchMoveStopPropagation&&!r.nested&&p.stopPropagation();let g=s.isHorizontal()?h:f,v=s.isHorizontal()?n.currentX-n.previousX:n.currentY-n.previousY;r.oneWayMovement&&(g=Math.abs(g)*(l?1:-1),v=Math.abs(v)*(l?1:-1)),n.diff=g,g*=r.touchRatio,l&&(g=-g,v=-v);const w=s.touchesDirection;s.swipeDirection=g>0?"prev":"next",s.touchesDirection=v>0?"prev":"next";const b=s.params.loop&&!r.cssMode,y="next"===s.touchesDirection&&s.allowSlideNext||"prev"===s.touchesDirection&&s.allowSlidePrev;if(!i.isMoved){if(b&&y&&s.loopFix({direction:s.swipeDirection}),i.startTranslate=s.getTranslate(),s.setTransition(0),s.animating){const e=new window.CustomEvent("transitionend",{bubbles:!0,cancelable:!0,detail:{bySwiperTouchMove:!0}});s.wrapperEl.dispatchEvent(e)}i.allowMomentumBounce=!1,!r.grabCursor||!0!==s.allowSlideNext&&!0!==s.allowSlidePrev||s.setGrabCursor(!0),s.emit("sliderFirstMove",p)}if((new Date).getTime(),!1!==r._loopSwapReset&&i.isMoved&&i.allowThresholdMove&&w!==s.touchesDirection&&b&&y&&Math.abs(g)>=1)return Object.assign(n,{startX:u,startY:m,currentX:u,currentY:m,startTranslate:i.currentTranslate}),i.loopSwapReset=!0,void(i.startTranslate=i.currentTranslate);s.emit("sliderMove",p),i.isMoved=!0,i.currentTranslate=g+i.startTranslate;let E=!0,x=r.resistanceRatio;if(r.touchReleaseOnEdges&&(x=0),g>0?(b&&y&&i.allowThresholdMove&&i.currentTranslate>(r.centeredSlides?s.minTranslate()-s.slidesSizesGrid[s.activeIndex+1]-("auto"!==r.slidesPerView&&s.slides.length-r.slidesPerView>=2?s.slidesSizesGrid[s.activeIndex+1]+s.params.spaceBetween:0)-s.params.spaceBetween:s.minTranslate())&&s.loopFix({direction:"prev",setTranslate:!0,activeSlideIndex:0}),i.currentTranslate>s.minTranslate()&&(E=!1,r.resistance&&(i.currentTranslate=s.minTranslate()-1+(-s.minTranslate()+i.startTranslate+g)**x))):g<0&&(b&&y&&i.allowThresholdMove&&i.currentTranslate<(r.centeredSlides?s.maxTranslate()+s.slidesSizesGrid[s.slidesSizesGrid.length-1]+s.params.spaceBetween+("auto"!==r.slidesPerView&&s.slides.length-r.slidesPerView>=2?s.slidesSizesGrid[s.slidesSizesGrid.length-1]+s.params.spaceBetween:0):s.maxTranslate())&&s.loopFix({direction:"next",setTranslate:!0,activeSlideIndex:s.slides.length-("auto"===r.slidesPerView?s.slidesPerViewDynamic():Math.ceil(parseFloat(r.slidesPerView,10)))}),i.currentTranslate<s.maxTranslate()&&(E=!1,r.resistance&&(i.currentTranslate=s.maxTranslate()+1-(s.maxTranslate()-i.startTranslate-g)**x))),E&&(p.preventedByNestedSwiper=!0),!s.allowSlideNext&&"next"===s.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!s.allowSlidePrev&&"prev"===s.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),s.allowSlidePrev||s.allowSlideNext||(i.currentTranslate=i.startTranslate),r.threshold>0){if(!(Math.abs(g)>r.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,n.startX=n.currentX,n.startY=n.currentY,i.currentTranslate=i.startTranslate,void(n.diff=s.isHorizontal()?n.currentX-n.startX:n.currentY-n.startY)}r.followFinger&&!r.cssMode&&((r.freeMode&&r.freeMode.enabled&&s.freeMode||r.watchSlidesProgress)&&(s.updateActiveIndex(),s.updateSlidesClasses()),r.freeMode&&r.freeMode.enabled&&s.freeMode&&s.freeMode.onTouchMove(),s.updateProgress(i.currentTranslate),s.setTranslate(i.currentTranslate))}function V(e){const t=this,s=t.touchEventsData;let a,i=e;i.originalEvent&&(i=i.originalEvent);if("touchend"===i.type||"touchcancel"===i.type){if(a=[...i.changedTouches].find((e=>e.identifier===s.touchId)),!a||a.identifier!==s.touchId)return}else{if(null!==s.touchId)return;if(i.pointerId!==s.pointerId)return;a=i}if(["pointercancel","pointerout","pointerleave","contextmenu"].includes(i.type)){if(!(["pointercancel","contextmenu"].includes(i.type)&&(t.browser.isSafari||t.browser.isWebView)))return}s.pointerId=null,s.touchId=null;const{params:r,touches:n,rtlTranslate:d,slidesGrid:c,enabled:p}=t;if(!p)return;if(!r.simulateTouch&&"mouse"===i.pointerType)return;if(s.allowTouchCallbacks&&t.emit("touchEnd",i),s.allowTouchCallbacks=!1,!s.isTouched)return s.isMoved&&r.grabCursor&&t.setGrabCursor(!1),s.isMoved=!1,void(s.startMoving=!1);r.grabCursor&&s.isMoved&&s.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);const u=o(),m=u-s.touchStartTime;if(t.allowClick){const e=i.path||i.composedPath&&i.composedPath();t.updateClickedSlide(e&&e[0]||i.target,e),t.emit("tap click",i),m<300&&u-s.lastClickTime<300&&t.emit("doubleTap doubleClick",i)}if(s.lastClickTime=o(),l((()=>{t.destroyed||(t.allowClick=!0)})),!s.isTouched||!s.isMoved||!t.swipeDirection||0===n.diff&&!s.loopSwapReset||s.currentTranslate===s.startTranslate&&!s.loopSwapReset)return s.isTouched=!1,s.isMoved=!1,void(s.startMoving=!1);let h;if(s.isTouched=!1,s.isMoved=!1,s.startMoving=!1,h=r.followFinger?d?t.translate:-t.translate:-s.currentTranslate,r.cssMode)return;if(r.freeMode&&r.freeMode.enabled)return void t.freeMode.onTouchEnd({currentPos:h});const f=h>=-t.maxTranslate()&&!t.params.loop;let g=0,v=t.slidesSizesGrid[0];for(let e=0;e<c.length;e+=e<r.slidesPerGroupSkip?1:r.slidesPerGroup){const t=e<r.slidesPerGroupSkip-1?1:r.slidesPerGroup;void 0!==c[e+t]?(f||h>=c[e]&&h<c[e+t])&&(g=e,v=c[e+t]-c[e]):(f||h>=c[e])&&(g=e,v=c[c.length-1]-c[c.length-2])}let w=null,b=null;r.rewind&&(t.isBeginning?b=r.virtual&&r.virtual.enabled&&t.virtual?t.virtual.slides.length-1:t.slides.length-1:t.isEnd&&(w=0));const y=(h-c[g])/v,E=g<r.slidesPerGroupSkip-1?1:r.slidesPerGroup;if(m>r.longSwipesMs){if(!r.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(y>=r.longSwipesRatio?t.slideTo(r.rewind&&t.isEnd?w:g+E):t.slideTo(g)),"prev"===t.swipeDirection&&(y>1-r.longSwipesRatio?t.slideTo(g+E):null!==b&&y<0&&Math.abs(y)>r.longSwipesRatio?t.slideTo(b):t.slideTo(g))}else{if(!r.shortSwipes)return void t.slideTo(t.activeIndex);t.navigation&&(i.target===t.navigation.nextEl||i.target===t.navigation.prevEl)?i.target===t.navigation.nextEl?t.slideTo(g+E):t.slideTo(g):("next"===t.swipeDirection&&t.slideTo(null!==w?w:g+E),"prev"===t.swipeDirection&&t.slideTo(null!==b?b:g))}}function W(){const e=this,{params:t,el:s}=e;if(s&&0===s.offsetWidth)return;t.breakpoints&&e.setBreakpoint();const{allowSlideNext:a,allowSlidePrev:i,snapGrid:r}=e,n=e.virtual&&e.params.virtual.enabled;e.allowSlideNext=!0,e.allowSlidePrev=!0,e.updateSize(),e.updateSlides(),e.updateSlidesClasses();const l=n&&t.loop;!("auto"===t.slidesPerView||t.slidesPerView>1)||!e.isEnd||e.isBeginning||e.params.centeredSlides||l?e.params.loop&&!n?e.slideToLoop(e.realIndex,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0):e.slideTo(e.slides.length-1,0,!1,!0),e.autoplay&&e.autoplay.running&&e.autoplay.paused&&(clearTimeout(e.autoplay.resizeTimeout),e.autoplay.resizeTimeout=setTimeout((()=>{e.autoplay&&e.autoplay.running&&e.autoplay.paused&&e.autoplay.resume()}),500)),e.allowSlidePrev=i,e.allowSlideNext=a,e.params.watchOverflow&&r!==e.snapGrid&&e.checkOverflow()}function j(e){const t=this;t.enabled&&(t.allowClick||(t.params.preventClicks&&e.preventDefault(),t.params.preventClicksPropagation&&t.animating&&(e.stopPropagation(),e.stopImmediatePropagation())))}function U(){const e=this,{wrapperEl:t,rtlTranslate:s,enabled:a}=e;if(!a)return;let i;e.previousTranslate=e.translate,e.isHorizontal()?e.translate=-t.scrollLeft:e.translate=-t.scrollTop,0===e.translate&&(e.translate=0),e.updateActiveIndex(),e.updateSlidesClasses();const r=e.maxTranslate()-e.minTranslate();i=0===r?0:(e.translate-e.minTranslate())/r,i!==e.progress&&e.updateProgress(s?-e.translate:e.translate),e.emit("setTranslate",e.translate,!1)}function K(e){const t=this;D(t,e.target),t.params.cssMode||"auto"!==t.params.slidesPerView&&!t.params.autoHeight||t.update()}function Z(){const e=this;e.documentTouchHandlerProceeded||(e.documentTouchHandlerProceeded=!0,e.params.touchReleaseOnEdges&&(e.el.style.touchAction="auto"))}const Q=(e,t)=>{const s=a(),{params:i,el:r,wrapperEl:n,device:l}=e,o=!!i.nested,d="on"===t?"addEventListener":"removeEventListener",c=t;r&&"string"!=typeof r&&(s[d]("touchstart",e.onDocumentTouchStart,{passive:!1,capture:o}),r[d]("touchstart",e.onTouchStart,{passive:!1}),r[d]("pointerdown",e.onTouchStart,{passive:!1}),s[d]("touchmove",e.onTouchMove,{passive:!1,capture:o}),s[d]("pointermove",e.onTouchMove,{passive:!1,capture:o}),s[d]("touchend",e.onTouchEnd,{passive:!0}),s[d]("pointerup",e.onTouchEnd,{passive:!0}),s[d]("pointercancel",e.onTouchEnd,{passive:!0}),s[d]("touchcancel",e.onTouchEnd,{passive:!0}),s[d]("pointerout",e.onTouchEnd,{passive:!0}),s[d]("pointerleave",e.onTouchEnd,{passive:!0}),s[d]("contextmenu",e.onTouchEnd,{passive:!0}),(i.preventClicks||i.preventClicksPropagation)&&r[d]("click",e.onClick,!0),i.cssMode&&n[d]("scroll",e.onScroll),i.updateOnWindowResize?e[c](l.ios||l.android?"resize orientationchange observerUpdate":"resize observerUpdate",W,!0):e[c]("observerUpdate",W,!0),r[d]("load",e.onLoad,{capture:!0}))};const J=(e,t)=>e.grid&&t.grid&&t.grid.rows>1;var ee={init:!0,direction:"horizontal",oneWayMovement:!1,swiperElementNodeName:"SWIPER-CONTAINER",touchEventsTarget:"wrapper",initialSlide:0,speed:300,cssMode:!1,updateOnWindowResize:!0,resizeObserver:!0,nested:!1,createElements:!1,eventsPrefix:"swiper",enabled:!0,focusableElements:"input, select, option, textarea, button, video, label",width:null,height:null,preventInteractionOnTransition:!1,userAgent:null,url:null,edgeSwipeDetection:!1,edgeSwipeThreshold:20,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,breakpointsBase:"window",spaceBetween:0,slidesPerView:1,slidesPerGroup:1,slidesPerGroupSkip:0,slidesPerGroupAuto:!1,centeredSlides:!1,centeredSlidesBounds:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,centerInsufficientSlides:!1,watchOverflow:!0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:5,touchMoveStopPropagation:!1,touchStartPreventDefault:!0,touchStartForcePreventDefault:!1,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,loop:!1,loopAddBlankSlides:!0,loopAdditionalSlides:0,loopPreventsSliding:!0,rewind:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,maxBackfaceHiddenSlides:10,containerModifierClass:"swiper-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-blank",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideFullyVisibleClass:"swiper-slide-fully-visible",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",lazyPreloaderClass:"swiper-lazy-preloader",lazyPreloadPrevNext:0,runCallbacksOnInit:!0,_emitClasses:!1};function te(e,t){return function(s){void 0===s&&(s={});const a=Object.keys(s)[0],i=s[a];"object"==typeof i&&null!==i?(!0===e[a]&&(e[a]={enabled:!0}),"navigation"===a&&e[a]&&e[a].enabled&&!e[a].prevEl&&!e[a].nextEl&&(e[a].auto=!0),["pagination","scrollbar"].indexOf(a)>=0&&e[a]&&e[a].enabled&&!e[a].el&&(e[a].auto=!0),a in e&&"enabled"in i?("object"!=typeof e[a]||"enabled"in e[a]||(e[a].enabled=!0),e[a]||(e[a]={enabled:!1}),p(t,s)):p(t,s)):p(t,s)}}const se={eventsEmitter:$,update:X,translate:B,transition:{setTransition:function(e,t){const s=this;s.params.cssMode||(s.wrapperEl.style.transitionDuration=`${e}ms`,s.wrapperEl.style.transitionDelay=0===e?"0ms":""),s.emit("setTransition",e,t)},transitionStart:function(e,t){void 0===e&&(e=!0);const s=this,{params:a}=s;a.cssMode||(a.autoHeight&&s.updateAutoHeight(),Y({swiper:s,runCallbacks:e,direction:t,step:"Start"}))},transitionEnd:function(e,t){void 0===e&&(e=!0);const s=this,{params:a}=s;s.animating=!1,a.cssMode||(s.setTransition(0),Y({swiper:s,runCallbacks:e,direction:t,step:"End"}))}},slide:N,loop:R,grabCursor:{setGrabCursor:function(e){const t=this;if(!t.params.simulateTouch||t.params.watchOverflow&&t.isLocked||t.params.cssMode)return;const s="container"===t.params.touchEventsTarget?t.el:t.wrapperEl;t.isElement&&(t.__preventObserver__=!0),s.style.cursor="move",s.style.cursor=e?"grabbing":"grab",t.isElement&&requestAnimationFrame((()=>{t.__preventObserver__=!1}))},unsetGrabCursor:function(){const e=this;e.params.watchOverflow&&e.isLocked||e.params.cssMode||(e.isElement&&(e.__preventObserver__=!0),e["container"===e.params.touchEventsTarget?"el":"wrapperEl"].style.cursor="",e.isElement&&requestAnimationFrame((()=>{e.__preventObserver__=!1})))}},events:{attachEvents:function(){const e=this,{params:t}=e;e.onTouchStart=_.bind(e),e.onTouchMove=F.bind(e),e.onTouchEnd=V.bind(e),e.onDocumentTouchStart=Z.bind(e),t.cssMode&&(e.onScroll=U.bind(e)),e.onClick=j.bind(e),e.onLoad=K.bind(e),Q(e,"on")},detachEvents:function(){Q(this,"off")}},breakpoints:{setBreakpoint:function(){const e=this,{realIndex:t,initialized:s,params:i,el:r}=e,n=i.breakpoints;if(!n||n&&0===Object.keys(n).length)return;const l=a(),o="window"!==i.breakpointsBase&&i.breakpointsBase?"container":i.breakpointsBase,d=["window","container"].includes(i.breakpointsBase)||!i.breakpointsBase?e.el:l.querySelector(i.breakpointsBase),c=e.getBreakpoint(n,o,d);if(!c||e.currentBreakpoint===c)return;const u=(c in n?n[c]:void 0)||e.originalParams,m=J(e,i),h=J(e,u),f=e.params.grabCursor,g=u.grabCursor,v=i.enabled;m&&!h?(r.classList.remove(`${i.containerModifierClass}grid`,`${i.containerModifierClass}grid-column`),e.emitContainerClasses()):!m&&h&&(r.classList.add(`${i.containerModifierClass}grid`),(u.grid.fill&&"column"===u.grid.fill||!u.grid.fill&&"column"===i.grid.fill)&&r.classList.add(`${i.containerModifierClass}grid-column`),e.emitContainerClasses()),f&&!g?e.unsetGrabCursor():!f&&g&&e.setGrabCursor(),["navigation","pagination","scrollbar"].forEach((t=>{if(void 0===u[t])return;const s=i[t]&&i[t].enabled,a=u[t]&&u[t].enabled;s&&!a&&e[t].disable(),!s&&a&&e[t].enable()}));const w=u.direction&&u.direction!==i.direction,b=i.loop&&(u.slidesPerView!==i.slidesPerView||w),y=i.loop;w&&s&&e.changeDirection(),p(e.params,u);const E=e.params.enabled,x=e.params.loop;Object.assign(e,{allowTouchMove:e.params.allowTouchMove,allowSlideNext:e.params.allowSlideNext,allowSlidePrev:e.params.allowSlidePrev}),v&&!E?e.disable():!v&&E&&e.enable(),e.currentBreakpoint=c,e.emit("_beforeBreakpoint",u),s&&(b?(e.loopDestroy(),e.loopCreate(t),e.updateSlides()):!y&&x?(e.loopCreate(t),e.updateSlides()):y&&!x&&e.loopDestroy()),e.emit("breakpoint",u)},getBreakpoint:function(e,t,s){if(void 0===t&&(t="window"),!e||"container"===t&&!s)return;let a=!1;const i=r(),n="window"===t?i.innerHeight:s.clientHeight,l=Object.keys(e).map((e=>{if("string"==typeof e&&0===e.indexOf("@")){const t=parseFloat(e.substr(1));return{value:n*t,point:e}}return{value:e,point:e}}));l.sort(((e,t)=>parseInt(e.value,10)-parseInt(t.value,10)));for(let e=0;e<l.length;e+=1){const{point:r,value:n}=l[e];"window"===t?i.matchMedia(`(min-width: ${n}px)`).matches&&(a=r):n<=s.clientWidth&&(a=r)}return a||"max"}},checkOverflow:{checkOverflow:function(){const e=this,{isLocked:t,params:s}=e,{slidesOffsetBefore:a}=s;if(a){const t=e.slides.length-1,s=e.slidesGrid[t]+e.slidesSizesGrid[t]+2*a;e.isLocked=e.size>s}else e.isLocked=1===e.snapGrid.length;!0===s.allowSlideNext&&(e.allowSlideNext=!e.isLocked),!0===s.allowSlidePrev&&(e.allowSlidePrev=!e.isLocked),t&&t!==e.isLocked&&(e.isEnd=!1),t!==e.isLocked&&e.emit(e.isLocked?"lock":"unlock")}},classes:{addClasses:function(){const e=this,{classNames:t,params:s,rtl:a,el:i,device:r}=e,n=function(e,t){const s=[];return e.forEach((e=>{"object"==typeof e?Object.keys(e).forEach((a=>{e[a]&&s.push(t+a)})):"string"==typeof e&&s.push(t+e)})),s}(["initialized",s.direction,{"free-mode":e.params.freeMode&&s.freeMode.enabled},{autoheight:s.autoHeight},{rtl:a},{grid:s.grid&&s.grid.rows>1},{"grid-column":s.grid&&s.grid.rows>1&&"column"===s.grid.fill},{android:r.android},{ios:r.ios},{"css-mode":s.cssMode},{centered:s.cssMode&&s.centeredSlides},{"watch-progress":s.watchSlidesProgress}],s.containerModifierClass);t.push(...n),i.classList.add(...t),e.emitContainerClasses()},removeClasses:function(){const{el:e,classNames:t}=this;e&&"string"!=typeof e&&(e.classList.remove(...t),this.emitContainerClasses())}}},ae={};class ie{constructor(){let e,t;for(var s=arguments.length,i=new Array(s),r=0;r<s;r++)i[r]=arguments[r];1===i.length&&i[0].constructor&&"Object"===Object.prototype.toString.call(i[0]).slice(8,-1)?t=i[0]:[e,t]=i,t||(t={}),t=p({},t),e&&!t.el&&(t.el=e);const n=a();if(t.el&&"string"==typeof t.el&&n.querySelectorAll(t.el).length>1){const e=[];return n.querySelectorAll(t.el).forEach((s=>{const a=p({},t,{el:s});e.push(new ie(a))})),e}const l=this;l.__swiper__=!0,l.support=I(),l.device=z({userAgent:t.userAgent}),l.browser=A(),l.eventsListeners={},l.eventsAnyListeners=[],l.modules=[...l.__modules__],t.modules&&Array.isArray(t.modules)&&l.modules.push(...t.modules);const o={};l.modules.forEach((e=>{e({params:t,swiper:l,extendParams:te(t,o),on:l.on.bind(l),once:l.once.bind(l),off:l.off.bind(l),emit:l.emit.bind(l)})}));const d=p({},ee,o);return l.params=p({},d,ae,t),l.originalParams=p({},l.params),l.passedParams=p({},t),l.params&&l.params.on&&Object.keys(l.params.on).forEach((e=>{l.on(e,l.params.on[e])})),l.params&&l.params.onAny&&l.onAny(l.params.onAny),Object.assign(l,{enabled:l.params.enabled,el:e,classNames:[],slides:[],slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:()=>"horizontal"===l.params.direction,isVertical:()=>"vertical"===l.params.direction,activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,previousTranslate:0,progress:0,velocity:0,animating:!1,cssOverflowAdjustment(){return Math.trunc(this.translate/2**23)*2**23},allowSlideNext:l.params.allowSlideNext,allowSlidePrev:l.params.allowSlidePrev,touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,focusableElements:l.params.focusableElements,lastClickTime:0,clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,startMoving:void 0,pointerId:null,touchId:null},allowClick:!0,allowTouchMove:l.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),l.emit("_swiper"),l.params.init&&l.init(),l}getDirectionLabel(e){return this.isHorizontal()?e:{width:"height","margin-top":"margin-left","margin-bottom ":"margin-right","margin-left":"margin-top","margin-right":"margin-bottom","padding-left":"padding-top","padding-right":"padding-bottom",marginRight:"marginBottom"}[e]}getSlideIndex(e){const{slidesEl:t,params:s}=this,a=y(f(t,`.${s.slideClass}, swiper-slide`)[0]);return y(e)-a}getSlideIndexByData(e){return this.getSlideIndex(this.slides.find((t=>1*t.getAttribute("data-swiper-slide-index")===e)))}recalcSlides(){const{slidesEl:e,params:t}=this;this.slides=f(e,`.${t.slideClass}, swiper-slide`)}enable(){const e=this;e.enabled||(e.enabled=!0,e.params.grabCursor&&e.setGrabCursor(),e.emit("enable"))}disable(){const e=this;e.enabled&&(e.enabled=!1,e.params.grabCursor&&e.unsetGrabCursor(),e.emit("disable"))}setProgress(e,t){const s=this;e=Math.min(Math.max(e,0),1);const a=s.minTranslate(),i=(s.maxTranslate()-a)*e+a;s.translateTo(i,void 0===t?0:t),s.updateActiveIndex(),s.updateSlidesClasses()}emitContainerClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=e.el.className.split(" ").filter((t=>0===t.indexOf("swiper")||0===t.indexOf(e.params.containerModifierClass)));e.emit("_containerClasses",t.join(" "))}getSlideClasses(e){const t=this;return t.destroyed?"":e.className.split(" ").filter((e=>0===e.indexOf("swiper-slide")||0===e.indexOf(t.params.slideClass))).join(" ")}emitSlidesClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=[];e.slides.forEach((s=>{const a=e.getSlideClasses(s);t.push({slideEl:s,classNames:a}),e.emit("_slideClass",s,a)})),e.emit("_slideClasses",t)}slidesPerViewDynamic(e,t){void 0===e&&(e="current"),void 0===t&&(t=!1);const{params:s,slides:a,slidesGrid:i,slidesSizesGrid:r,size:n,activeIndex:l}=this;let o=1;if("number"==typeof s.slidesPerView)return s.slidesPerView;if(s.centeredSlides){let e,t=a[l]?Math.ceil(a[l].swiperSlideSize):0;for(let s=l+1;s<a.length;s+=1)a[s]&&!e&&(t+=Math.ceil(a[s].swiperSlideSize),o+=1,t>n&&(e=!0));for(let s=l-1;s>=0;s-=1)a[s]&&!e&&(t+=a[s].swiperSlideSize,o+=1,t>n&&(e=!0))}else if("current"===e)for(let e=l+1;e<a.length;e+=1){(t?i[e]+r[e]-i[l]<n:i[e]-i[l]<n)&&(o+=1)}else for(let e=l-1;e>=0;e-=1){i[l]-i[e]<n&&(o+=1)}return o}update(){const e=this;if(!e||e.destroyed)return;const{snapGrid:t,params:s}=e;function a(){const t=e.rtlTranslate?-1*e.translate:e.translate,s=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(s),e.updateActiveIndex(),e.updateSlidesClasses()}let i;if(s.breakpoints&&e.setBreakpoint(),[...e.el.querySelectorAll('[loading="lazy"]')].forEach((t=>{t.complete&&D(e,t)})),e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),s.freeMode&&s.freeMode.enabled&&!s.cssMode)a(),s.autoHeight&&e.updateAutoHeight();else{if(("auto"===s.slidesPerView||s.slidesPerView>1)&&e.isEnd&&!s.centeredSlides){const t=e.virtual&&s.virtual.enabled?e.virtual.slides:e.slides;i=e.slideTo(t.length-1,0,!1,!0)}else i=e.slideTo(e.activeIndex,0,!1,!0);i||a()}s.watchOverflow&&t!==e.snapGrid&&e.checkOverflow(),e.emit("update")}changeDirection(e,t){void 0===t&&(t=!0);const s=this,a=s.params.direction;return e||(e="horizontal"===a?"vertical":"horizontal"),e===a||"horizontal"!==e&&"vertical"!==e||(s.el.classList.remove(`${s.params.containerModifierClass}${a}`),s.el.classList.add(`${s.params.containerModifierClass}${e}`),s.emitContainerClasses(),s.params.direction=e,s.slides.forEach((t=>{"vertical"===e?t.style.width="":t.style.height=""})),s.emit("changeDirection"),t&&s.update()),s}changeLanguageDirection(e){const t=this;t.rtl&&"rtl"===e||!t.rtl&&"ltr"===e||(t.rtl="rtl"===e,t.rtlTranslate="horizontal"===t.params.direction&&t.rtl,t.rtl?(t.el.classList.add(`${t.params.containerModifierClass}rtl`),t.el.dir="rtl"):(t.el.classList.remove(`${t.params.containerModifierClass}rtl`),t.el.dir="ltr"),t.update())}mount(e){const t=this;if(t.mounted)return!0;let s=e||t.params.el;if("string"==typeof s&&(s=document.querySelector(s)),!s)return!1;s.swiper=t,s.parentNode&&s.parentNode.host&&s.parentNode.host.nodeName===t.params.swiperElementNodeName.toUpperCase()&&(t.isElement=!0);const a=()=>`.${(t.params.wrapperClass||"").trim().split(" ").join(".")}`;let i=(()=>{if(s&&s.shadowRoot&&s.shadowRoot.querySelector){return s.shadowRoot.querySelector(a())}return f(s,a())[0]})();return!i&&t.params.createElements&&(i=v("div",t.params.wrapperClass),s.append(i),f(s,`.${t.params.slideClass}`).forEach((e=>{i.append(e)}))),Object.assign(t,{el:s,wrapperEl:i,slidesEl:t.isElement&&!s.parentNode.host.slideSlots?s.parentNode.host:i,hostEl:t.isElement?s.parentNode.host:s,mounted:!0,rtl:"rtl"===s.dir.toLowerCase()||"rtl"===b(s,"direction"),rtlTranslate:"horizontal"===t.params.direction&&("rtl"===s.dir.toLowerCase()||"rtl"===b(s,"direction")),wrongRTL:"-webkit-box"===b(i,"display")}),!0}init(e){const t=this;if(t.initialized)return t;if(!1===t.mount(e))return t;t.emit("beforeInit"),t.params.breakpoints&&t.setBreakpoint(),t.addClasses(),t.updateSize(),t.updateSlides(),t.params.watchOverflow&&t.checkOverflow(),t.params.grabCursor&&t.enabled&&t.setGrabCursor(),t.params.loop&&t.virtual&&t.params.virtual.enabled?t.slideTo(t.params.initialSlide+t.virtual.slidesBefore,0,t.params.runCallbacksOnInit,!1,!0):t.slideTo(t.params.initialSlide,0,t.params.runCallbacksOnInit,!1,!0),t.params.loop&&t.loopCreate(),t.attachEvents();const s=[...t.el.querySelectorAll('[loading="lazy"]')];return t.isElement&&s.push(...t.hostEl.querySelectorAll('[loading="lazy"]')),s.forEach((e=>{e.complete?D(t,e):e.addEventListener("load",(e=>{D(t,e.target)}))})),H(t),t.initialized=!0,H(t),t.emit("init"),t.emit("afterInit"),t}destroy(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);const s=this,{params:a,el:i,wrapperEl:r,slides:n}=s;return void 0===s.params||s.destroyed||(s.emit("beforeDestroy"),s.initialized=!1,s.detachEvents(),a.loop&&s.loopDestroy(),t&&(s.removeClasses(),i&&"string"!=typeof i&&i.removeAttribute("style"),r&&r.removeAttribute("style"),n&&n.length&&n.forEach((e=>{e.classList.remove(a.slideVisibleClass,a.slideFullyVisibleClass,a.slideActiveClass,a.slideNextClass,a.slidePrevClass),e.removeAttribute("style"),e.removeAttribute("data-swiper-slide-index")}))),s.emit("destroy"),Object.keys(s.eventsListeners).forEach((e=>{s.off(e)})),!1!==e&&(s.el&&"string"!=typeof s.el&&(s.el.swiper=null),function(e){const t=e;Object.keys(t).forEach((e=>{try{t[e]=null}catch(e){}try{delete t[e]}catch(e){}}))}(s)),s.destroyed=!0),null}static extendDefaults(e){p(ae,e)}static get extendedDefaults(){return ae}static get defaults(){return ee}static installModule(e){ie.prototype.__modules__||(ie.prototype.__modules__=[]);const t=ie.prototype.__modules__;"function"==typeof e&&t.indexOf(e)<0&&t.push(e)}static use(e){return Array.isArray(e)?(e.forEach((e=>ie.installModule(e))),ie):(ie.installModule(e),ie)}}function re(e,t,s,a){return e.params.createElements&&Object.keys(a).forEach((i=>{if(!s[i]&&!0===s.auto){let r=f(e.el,`.${a[i]}`)[0];r||(r=v("div",a[i]),r.className=a[i],e.el.append(r)),s[i]=r,t[i]=r}})),s}function ne(e){return void 0===e&&(e=""),`.${e.trim().replace(/([\.:!+\/])/g,"\\$1").replace(/ /g,".")}`}function le(e){const t=this,{params:s,slidesEl:a}=t;s.loop&&t.loopDestroy();const i=e=>{if("string"==typeof e){const t=document.createElement("div");t.innerHTML=e,a.append(t.children[0]),t.innerHTML=""}else a.append(e)};if("object"==typeof e&&"length"in e)for(let t=0;t<e.length;t+=1)e[t]&&i(e[t]);else i(e);t.recalcSlides(),s.loop&&t.loopCreate(),s.observer&&!t.isElement||t.update()}function oe(e){const t=this,{params:s,activeIndex:a,slidesEl:i}=t;s.loop&&t.loopDestroy();let r=a+1;const n=e=>{if("string"==typeof e){const t=document.createElement("div");t.innerHTML=e,i.prepend(t.children[0]),t.innerHTML=""}else i.prepend(e)};if("object"==typeof e&&"length"in e){for(let t=0;t<e.length;t+=1)e[t]&&n(e[t]);r=a+e.length}else n(e);t.recalcSlides(),s.loop&&t.loopCreate(),s.observer&&!t.isElement||t.update(),t.slideTo(r,0,!1)}function de(e,t){const s=this,{params:a,activeIndex:i,slidesEl:r}=s;let n=i;a.loop&&(n-=s.loopedSlides,s.loopDestroy(),s.recalcSlides());const l=s.slides.length;if(e<=0)return void s.prependSlide(t);if(e>=l)return void s.appendSlide(t);let o=n>e?n+1:n;const d=[];for(let t=l-1;t>=e;t-=1){const e=s.slides[t];e.remove(),d.unshift(e)}if("object"==typeof t&&"length"in t){for(let e=0;e<t.length;e+=1)t[e]&&r.append(t[e]);o=n>e?n+t.length:n}else r.append(t);for(let e=0;e<d.length;e+=1)r.append(d[e]);s.recalcSlides(),a.loop&&s.loopCreate(),a.observer&&!s.isElement||s.update(),a.loop?s.slideTo(o+s.loopedSlides,0,!1):s.slideTo(o,0,!1)}function ce(e){const t=this,{params:s,activeIndex:a}=t;let i=a;s.loop&&(i-=t.loopedSlides,t.loopDestroy());let r,n=i;if("object"==typeof e&&"length"in e){for(let s=0;s<e.length;s+=1)r=e[s],t.slides[r]&&t.slides[r].remove(),r<n&&(n-=1);n=Math.max(n,0)}else r=e,t.slides[r]&&t.slides[r].remove(),r<n&&(n-=1),n=Math.max(n,0);t.recalcSlides(),s.loop&&t.loopCreate(),s.observer&&!t.isElement||t.update(),s.loop?t.slideTo(n+t.loopedSlides,0,!1):t.slideTo(n,0,!1)}function pe(){const e=this,t=[];for(let s=0;s<e.slides.length;s+=1)t.push(s);e.removeSlide(t)}function ue(e){const{effect:t,swiper:s,on:a,setTranslate:i,setTransition:r,overwriteParams:n,perspective:l,recreateShadows:o,getEffectParams:d}=e;let c;a("beforeInit",(()=>{if(s.params.effect!==t)return;s.classNames.push(`${s.params.containerModifierClass}${t}`),l&&l()&&s.classNames.push(`${s.params.containerModifierClass}3d`);const e=n?n():{};Object.assign(s.params,e),Object.assign(s.originalParams,e)})),a("setTranslate",(()=>{s.params.effect===t&&i()})),a("setTransition",((e,a)=>{s.params.effect===t&&r(a)})),a("transitionEnd",(()=>{if(s.params.effect===t&&o){if(!d||!d().slideShadows)return;s.slides.forEach((e=>{e.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((e=>e.remove()))})),o()}})),a("virtualUpdate",(()=>{s.params.effect===t&&(s.slides.length||(c=!0),requestAnimationFrame((()=>{c&&s.slides&&s.slides.length&&(i(),c=!1)})))}))}function me(e,t){const s=h(t);return s!==t&&(s.style.backfaceVisibility="hidden",s.style["-webkit-backface-visibility"]="hidden"),s}function he(e){let{swiper:t,duration:s,transformElements:a,allSlides:i}=e;const{activeIndex:r}=t;if(t.params.virtualTranslate&&0!==s){let e,s=!1;e=i?a:a.filter((e=>{const s=e.classList.contains("swiper-slide-transform")?(e=>{if(!e.parentElement)return t.slides.find((t=>t.shadowRoot&&t.shadowRoot===e.parentNode));return e.parentElement})(e):e;return t.getSlideIndex(s)===r})),e.forEach((e=>{x(e,(()=>{if(s)return;if(!t||t.destroyed)return;s=!0,t.animating=!1;const e=new window.CustomEvent("transitionend",{bubbles:!0,cancelable:!0});t.wrapperEl.dispatchEvent(e)}))}))}}function fe(e,t,s){const a=`swiper-slide-shadow${s?`-${s}`:""}${e?` swiper-slide-shadow-${e}`:""}`,i=h(t);let r=i.querySelector(`.${a.split(" ").join(".")}`);return r||(r=v("div",a.split(" ")),i.append(r)),r}Object.keys(se).forEach((e=>{Object.keys(se[e]).forEach((t=>{ie.prototype[t]=se[e][t]}))})),ie.use([function(e){let{swiper:t,on:s,emit:a}=e;const i=r();let n=null,l=null;const o=()=>{t&&!t.destroyed&&t.initialized&&(a("beforeResize"),a("resize"))},d=()=>{t&&!t.destroyed&&t.initialized&&a("orientationchange")};s("init",(()=>{t.params.resizeObserver&&void 0!==i.ResizeObserver?t&&!t.destroyed&&t.initialized&&(n=new ResizeObserver((e=>{l=i.requestAnimationFrame((()=>{const{width:s,height:a}=t;let i=s,r=a;e.forEach((e=>{let{contentBoxSize:s,contentRect:a,target:n}=e;n&&n!==t.el||(i=a?a.width:(s[0]||s).inlineSize,r=a?a.height:(s[0]||s).blockSize)})),i===s&&r===a||o()}))})),n.observe(t.el)):(i.addEventListener("resize",o),i.addEventListener("orientationchange",d))})),s("destroy",(()=>{l&&i.cancelAnimationFrame(l),n&&n.unobserve&&t.el&&(n.unobserve(t.el),n=null),i.removeEventListener("resize",o),i.removeEventListener("orientationchange",d)}))},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=[],l=r(),o=function(e,s){void 0===s&&(s={});const a=new(l.MutationObserver||l.WebkitMutationObserver)((e=>{if(t.__preventObserver__)return;if(1===e.length)return void i("observerUpdate",e[0]);const s=function(){i("observerUpdate",e[0])};l.requestAnimationFrame?l.requestAnimationFrame(s):l.setTimeout(s,0)}));a.observe(e,{attributes:void 0===s.attributes||s.attributes,childList:t.isElement||(void 0===s.childList||s).childList,characterData:void 0===s.characterData||s.characterData}),n.push(a)};s({observer:!1,observeParents:!1,observeSlideChildren:!1}),a("init",(()=>{if(t.params.observer){if(t.params.observeParents){const e=E(t.hostEl);for(let t=0;t<e.length;t+=1)o(e[t])}o(t.hostEl,{childList:t.params.observeSlideChildren}),o(t.wrapperEl,{attributes:!1})}})),a("destroy",(()=>{n.forEach((e=>{e.disconnect()})),n.splice(0,n.length)}))}]);const ge=[function(e){let t,{swiper:s,extendParams:i,on:r,emit:n}=e;i({virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null,renderExternalUpdate:!0,addSlidesBefore:0,addSlidesAfter:0}});const l=a();s.virtual={cache:{},from:void 0,to:void 0,slides:[],offset:0,slidesGrid:[]};const o=l.createElement("div");function d(e,t){const a=s.params.virtual;if(a.cache&&s.virtual.cache[t])return s.virtual.cache[t];let i;return a.renderSlide?(i=a.renderSlide.call(s,e,t),"string"==typeof i&&(o.innerHTML=i,i=o.children[0])):i=s.isElement?v("swiper-slide"):v("div",s.params.slideClass),i.setAttribute("data-swiper-slide-index",t),a.renderSlide||(i.innerHTML=e),a.cache&&(s.virtual.cache[t]=i),i}function c(e,t,a){const{slidesPerView:i,slidesPerGroup:r,centeredSlides:l,loop:o,initialSlide:c}=s.params;if(t&&!o&&c>0)return;const{addSlidesBefore:p,addSlidesAfter:u}=s.params.virtual,{from:m,to:h,slides:g,slidesGrid:v,offset:w}=s.virtual;s.params.cssMode||s.updateActiveIndex();const b=void 0===a?s.activeIndex||0:a;let y,E,x;y=s.rtlTranslate?"right":s.isHorizontal()?"left":"top",l?(E=Math.floor(i/2)+r+u,x=Math.floor(i/2)+r+p):(E=i+(r-1)+u,x=(o?i:r)+p);let S=b-x,T=b+E;o||(S=Math.max(S,0),T=Math.min(T,g.length-1));let M=(s.slidesGrid[S]||0)-(s.slidesGrid[0]||0);function C(){s.updateSlides(),s.updateProgress(),s.updateSlidesClasses(),n("virtualUpdate")}if(o&&b>=x?(S-=x,l||(M+=s.slidesGrid[0])):o&&b<x&&(S=-x,l&&(M+=s.slidesGrid[0])),Object.assign(s.virtual,{from:S,to:T,offset:M,slidesGrid:s.slidesGrid,slidesBefore:x,slidesAfter:E}),m===S&&h===T&&!e)return s.slidesGrid!==v&&M!==w&&s.slides.forEach((e=>{e.style[y]=M-Math.abs(s.cssOverflowAdjustment())+"px"})),s.updateProgress(),void n("virtualUpdate");if(s.params.virtual.renderExternal)return s.params.virtual.renderExternal.call(s,{offset:M,from:S,to:T,slides:function(){const e=[];for(let t=S;t<=T;t+=1)e.push(g[t]);return e}()}),void(s.params.virtual.renderExternalUpdate?C():n("virtualUpdate"));const P=[],L=[],I=e=>{let t=e;return e<0?t=g.length+e:t>=g.length&&(t-=g.length),t};if(e)s.slides.filter((e=>e.matches(`.${s.params.slideClass}, swiper-slide`))).forEach((e=>{e.remove()}));else for(let e=m;e<=h;e+=1)if(e<S||e>T){const t=I(e);s.slides.filter((e=>e.matches(`.${s.params.slideClass}[data-swiper-slide-index="${t}"], swiper-slide[data-swiper-slide-index="${t}"]`))).forEach((e=>{e.remove()}))}const z=o?-g.length:0,A=o?2*g.length:g.length;for(let t=z;t<A;t+=1)if(t>=S&&t<=T){const s=I(t);void 0===h||e?L.push(s):(t>h&&L.push(s),t<m&&P.push(s))}if(L.forEach((e=>{s.slidesEl.append(d(g[e],e))})),o)for(let e=P.length-1;e>=0;e-=1){const t=P[e];s.slidesEl.prepend(d(g[t],t))}else P.sort(((e,t)=>t-e)),P.forEach((e=>{s.slidesEl.prepend(d(g[e],e))}));f(s.slidesEl,".swiper-slide, swiper-slide").forEach((e=>{e.style[y]=M-Math.abs(s.cssOverflowAdjustment())+"px"})),C()}r("beforeInit",(()=>{if(!s.params.virtual.enabled)return;let e;if(void 0===s.passedParams.virtual.slides){const t=[...s.slidesEl.children].filter((e=>e.matches(`.${s.params.slideClass}, swiper-slide`)));t&&t.length&&(s.virtual.slides=[...t],e=!0,t.forEach(((e,t)=>{e.setAttribute("data-swiper-slide-index",t),s.virtual.cache[t]=e,e.remove()})))}e||(s.virtual.slides=s.params.virtual.slides),s.classNames.push(`${s.params.containerModifierClass}virtual`),s.params.watchSlidesProgress=!0,s.originalParams.watchSlidesProgress=!0,c(!1,!0)})),r("setTranslate",(()=>{s.params.virtual.enabled&&(s.params.cssMode&&!s._immediateVirtual?(clearTimeout(t),t=setTimeout((()=>{c()}),100)):c())})),r("init update resize",(()=>{s.params.virtual.enabled&&s.params.cssMode&&u(s.wrapperEl,"--swiper-virtual-size",`${s.virtualSize}px`)})),Object.assign(s.virtual,{appendSlide:function(e){if("object"==typeof e&&"length"in e)for(let t=0;t<e.length;t+=1)e[t]&&s.virtual.slides.push(e[t]);else s.virtual.slides.push(e);c(!0)},prependSlide:function(e){const t=s.activeIndex;let a=t+1,i=1;if(Array.isArray(e)){for(let t=0;t<e.length;t+=1)e[t]&&s.virtual.slides.unshift(e[t]);a=t+e.length,i=e.length}else s.virtual.slides.unshift(e);if(s.params.virtual.cache){const e=s.virtual.cache,t={};Object.keys(e).forEach((s=>{const a=e[s],r=a.getAttribute("data-swiper-slide-index");r&&a.setAttribute("data-swiper-slide-index",parseInt(r,10)+i),t[parseInt(s,10)+i]=a})),s.virtual.cache=t}c(!0),s.slideTo(a,0)},removeSlide:function(e){if(null==e)return;let t=s.activeIndex;if(Array.isArray(e))for(let a=e.length-1;a>=0;a-=1)s.params.virtual.cache&&(delete s.virtual.cache[e[a]],Object.keys(s.virtual.cache).forEach((t=>{t>e&&(s.virtual.cache[t-1]=s.virtual.cache[t],s.virtual.cache[t-1].setAttribute("data-swiper-slide-index",t-1),delete s.virtual.cache[t])}))),s.virtual.slides.splice(e[a],1),e[a]<t&&(t-=1),t=Math.max(t,0);else s.params.virtual.cache&&(delete s.virtual.cache[e],Object.keys(s.virtual.cache).forEach((t=>{t>e&&(s.virtual.cache[t-1]=s.virtual.cache[t],s.virtual.cache[t-1].setAttribute("data-swiper-slide-index",t-1),delete s.virtual.cache[t])}))),s.virtual.slides.splice(e,1),e<t&&(t-=1),t=Math.max(t,0);c(!0),s.slideTo(t,0)},removeAllSlides:function(){s.virtual.slides=[],s.params.virtual.cache&&(s.virtual.cache={}),c(!0),s.slideTo(0,0)},update:c})},function(e){let{swiper:t,extendParams:s,on:i,emit:n}=e;const l=a(),o=r();function d(e){if(!t.enabled)return;const{rtlTranslate:s}=t;let a=e;a.originalEvent&&(a=a.originalEvent);const i=a.keyCode||a.charCode,r=t.params.keyboard.pageUpDown,d=r&&33===i,c=r&&34===i,p=37===i,u=39===i,m=38===i,h=40===i;if(!t.allowSlideNext&&(t.isHorizontal()&&u||t.isVertical()&&h||c))return!1;if(!t.allowSlidePrev&&(t.isHorizontal()&&p||t.isVertical()&&m||d))return!1;if(!(a.shiftKey||a.altKey||a.ctrlKey||a.metaKey||l.activeElement&&l.activeElement.nodeName&&("input"===l.activeElement.nodeName.toLowerCase()||"textarea"===l.activeElement.nodeName.toLowerCase()))){if(t.params.keyboard.onlyInViewport&&(d||c||p||u||m||h)){let e=!1;if(E(t.el,`.${t.params.slideClass}, swiper-slide`).length>0&&0===E(t.el,`.${t.params.slideActiveClass}`).length)return;const a=t.el,i=a.clientWidth,r=a.clientHeight,n=o.innerWidth,l=o.innerHeight,d=w(a);s&&(d.left-=a.scrollLeft);const c=[[d.left,d.top],[d.left+i,d.top],[d.left,d.top+r],[d.left+i,d.top+r]];for(let t=0;t<c.length;t+=1){const s=c[t];if(s[0]>=0&&s[0]<=n&&s[1]>=0&&s[1]<=l){if(0===s[0]&&0===s[1])continue;e=!0}}if(!e)return}t.isHorizontal()?((d||c||p||u)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),((c||u)&&!s||(d||p)&&s)&&t.slideNext(),((d||p)&&!s||(c||u)&&s)&&t.slidePrev()):((d||c||m||h)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),(c||h)&&t.slideNext(),(d||m)&&t.slidePrev()),n("keyPress",i)}}function c(){t.keyboard.enabled||(l.addEventListener("keydown",d),t.keyboard.enabled=!0)}function p(){t.keyboard.enabled&&(l.removeEventListener("keydown",d),t.keyboard.enabled=!1)}t.keyboard={enabled:!1},s({keyboard:{enabled:!1,onlyInViewport:!0,pageUpDown:!0}}),i("init",(()=>{t.params.keyboard.enabled&&c()})),i("destroy",(()=>{t.keyboard.enabled&&p()})),Object.assign(t.keyboard,{enable:c,disable:p})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=r();let d;s({mousewheel:{enabled:!1,releaseOnEdges:!1,invert:!1,forceToAxis:!1,sensitivity:1,eventsTarget:"container",thresholdDelta:null,thresholdTime:null,noMousewheelClass:"swiper-no-mousewheel"}}),t.mousewheel={enabled:!1};let c,p=o();const u=[];function m(){t.enabled&&(t.mouseEntered=!0)}function h(){t.enabled&&(t.mouseEntered=!1)}function f(e){return!(t.params.mousewheel.thresholdDelta&&e.delta<t.params.mousewheel.thresholdDelta)&&(!(t.params.mousewheel.thresholdTime&&o()-p<t.params.mousewheel.thresholdTime)&&(e.delta>=6&&o()-p<60||(e.direction<0?t.isEnd&&!t.params.loop||t.animating||(t.slideNext(),i("scroll",e.raw)):t.isBeginning&&!t.params.loop||t.animating||(t.slidePrev(),i("scroll",e.raw)),p=(new n.Date).getTime(),!1)))}function g(e){let s=e,a=!0;if(!t.enabled)return;if(e.target.closest(`.${t.params.mousewheel.noMousewheelClass}`))return;const r=t.params.mousewheel;t.params.cssMode&&s.preventDefault();let n=t.el;"container"!==t.params.mousewheel.eventsTarget&&(n=document.querySelector(t.params.mousewheel.eventsTarget));const p=n&&n.contains(s.target);if(!t.mouseEntered&&!p&&!r.releaseOnEdges)return!0;s.originalEvent&&(s=s.originalEvent);let m=0;const h=t.rtlTranslate?-1:1,g=function(e){let t=0,s=0,a=0,i=0;return"detail"in e&&(s=e.detail),"wheelDelta"in e&&(s=-e.wheelDelta/120),"wheelDeltaY"in e&&(s=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(t=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(t=s,s=0),a=10*t,i=10*s,"deltaY"in e&&(i=e.deltaY),"deltaX"in e&&(a=e.deltaX),e.shiftKey&&!a&&(a=i,i=0),(a||i)&&e.deltaMode&&(1===e.deltaMode?(a*=40,i*=40):(a*=800,i*=800)),a&&!t&&(t=a<1?-1:1),i&&!s&&(s=i<1?-1:1),{spinX:t,spinY:s,pixelX:a,pixelY:i}}(s);if(r.forceToAxis)if(t.isHorizontal()){if(!(Math.abs(g.pixelX)>Math.abs(g.pixelY)))return!0;m=-g.pixelX*h}else{if(!(Math.abs(g.pixelY)>Math.abs(g.pixelX)))return!0;m=-g.pixelY}else m=Math.abs(g.pixelX)>Math.abs(g.pixelY)?-g.pixelX*h:-g.pixelY;if(0===m)return!0;r.invert&&(m=-m);let v=t.getTranslate()+m*r.sensitivity;if(v>=t.minTranslate()&&(v=t.minTranslate()),v<=t.maxTranslate()&&(v=t.maxTranslate()),a=!!t.params.loop||!(v===t.minTranslate()||v===t.maxTranslate()),a&&t.params.nested&&s.stopPropagation(),t.params.freeMode&&t.params.freeMode.enabled){const e={time:o(),delta:Math.abs(m),direction:Math.sign(m)},a=c&&e.time<c.time+500&&e.delta<=c.delta&&e.direction===c.direction;if(!a){c=void 0;let n=t.getTranslate()+m*r.sensitivity;const o=t.isBeginning,p=t.isEnd;if(n>=t.minTranslate()&&(n=t.minTranslate()),n<=t.maxTranslate()&&(n=t.maxTranslate()),t.setTransition(0),t.setTranslate(n),t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses(),(!o&&t.isBeginning||!p&&t.isEnd)&&t.updateSlidesClasses(),t.params.loop&&t.loopFix({direction:e.direction<0?"next":"prev",byMousewheel:!0}),t.params.freeMode.sticky){clearTimeout(d),d=void 0,u.length>=15&&u.shift();const s=u.length?u[u.length-1]:void 0,a=u[0];if(u.push(e),s&&(e.delta>s.delta||e.direction!==s.direction))u.splice(0);else if(u.length>=15&&e.time-a.time<500&&a.delta-e.delta>=1&&e.delta<=6){const s=m>0?.8:.2;c=e,u.splice(0),d=l((()=>{!t.destroyed&&t.params&&t.slideToClosest(t.params.speed,!0,void 0,s)}),0)}d||(d=l((()=>{if(t.destroyed||!t.params)return;c=e,u.splice(0),t.slideToClosest(t.params.speed,!0,void 0,.5)}),500))}if(a||i("scroll",s),t.params.autoplay&&t.params.autoplay.disableOnInteraction&&t.autoplay.stop(),r.releaseOnEdges&&(n===t.minTranslate()||n===t.maxTranslate()))return!0}}else{const s={time:o(),delta:Math.abs(m),direction:Math.sign(m),raw:e};u.length>=2&&u.shift();const a=u.length?u[u.length-1]:void 0;if(u.push(s),a?(s.direction!==a.direction||s.delta>a.delta||s.time>a.time+150)&&f(s):f(s),function(e){const s=t.params.mousewheel;if(e.direction<0){if(t.isEnd&&!t.params.loop&&s.releaseOnEdges)return!0}else if(t.isBeginning&&!t.params.loop&&s.releaseOnEdges)return!0;return!1}(s))return!0}return s.preventDefault?s.preventDefault():s.returnValue=!1,!1}function v(e){let s=t.el;"container"!==t.params.mousewheel.eventsTarget&&(s=document.querySelector(t.params.mousewheel.eventsTarget)),s[e]("mouseenter",m),s[e]("mouseleave",h),s[e]("wheel",g)}function w(){return t.params.cssMode?(t.wrapperEl.removeEventListener("wheel",g),!0):!t.mousewheel.enabled&&(v("addEventListener"),t.mousewheel.enabled=!0,!0)}function b(){return t.params.cssMode?(t.wrapperEl.addEventListener(event,g),!0):!!t.mousewheel.enabled&&(v("removeEventListener"),t.mousewheel.enabled=!1,!0)}a("init",(()=>{!t.params.mousewheel.enabled&&t.params.cssMode&&b(),t.params.mousewheel.enabled&&w()})),a("destroy",(()=>{t.params.cssMode&&w(),t.mousewheel.enabled&&b()})),Object.assign(t.mousewheel,{enable:w,disable:b})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;function r(e){let s;return e&&"string"==typeof e&&t.isElement&&(s=t.el.querySelector(e)||t.hostEl.querySelector(e),s)?s:(e&&("string"==typeof e&&(s=[...document.querySelectorAll(e)]),t.params.uniqueNavElements&&"string"==typeof e&&s&&s.length>1&&1===t.el.querySelectorAll(e).length?s=t.el.querySelector(e):s&&1===s.length&&(s=s[0])),e&&!s?e:s)}function n(e,s){const a=t.params.navigation;(e=T(e)).forEach((e=>{e&&(e.classList[s?"add":"remove"](...a.disabledClass.split(" ")),"BUTTON"===e.tagName&&(e.disabled=s),t.params.watchOverflow&&t.enabled&&e.classList[t.isLocked?"add":"remove"](a.lockClass))}))}function l(){const{nextEl:e,prevEl:s}=t.navigation;if(t.params.loop)return n(s,!1),void n(e,!1);n(s,t.isBeginning&&!t.params.rewind),n(e,t.isEnd&&!t.params.rewind)}function o(e){e.preventDefault(),(!t.isBeginning||t.params.loop||t.params.rewind)&&(t.slidePrev(),i("navigationPrev"))}function d(e){e.preventDefault(),(!t.isEnd||t.params.loop||t.params.rewind)&&(t.slideNext(),i("navigationNext"))}function c(){const e=t.params.navigation;if(t.params.navigation=re(t,t.originalParams.navigation,t.params.navigation,{nextEl:"swiper-button-next",prevEl:"swiper-button-prev"}),!e.nextEl&&!e.prevEl)return;let s=r(e.nextEl),a=r(e.prevEl);Object.assign(t.navigation,{nextEl:s,prevEl:a}),s=T(s),a=T(a);const i=(s,a)=>{s&&s.addEventListener("click","next"===a?d:o),!t.enabled&&s&&s.classList.add(...e.lockClass.split(" "))};s.forEach((e=>i(e,"next"))),a.forEach((e=>i(e,"prev")))}function p(){let{nextEl:e,prevEl:s}=t.navigation;e=T(e),s=T(s);const a=(e,s)=>{e.removeEventListener("click","next"===s?d:o),e.classList.remove(...t.params.navigation.disabledClass.split(" "))};e.forEach((e=>a(e,"next"))),s.forEach((e=>a(e,"prev")))}s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock",navigationDisabledClass:"swiper-navigation-disabled"}}),t.navigation={nextEl:null,prevEl:null},a("init",(()=>{!1===t.params.navigation.enabled?u():(c(),l())})),a("toEdge fromEdge lock unlock",(()=>{l()})),a("destroy",(()=>{p()})),a("enable disable",(()=>{let{nextEl:e,prevEl:s}=t.navigation;e=T(e),s=T(s),t.enabled?l():[...e,...s].filter((e=>!!e)).forEach((e=>e.classList.add(t.params.navigation.lockClass)))})),a("click",((e,s)=>{let{nextEl:a,prevEl:r}=t.navigation;a=T(a),r=T(r);const n=s.target;let l=r.includes(n)||a.includes(n);if(t.isElement&&!l){const e=s.path||s.composedPath&&s.composedPath();e&&(l=e.find((e=>a.includes(e)||r.includes(e))))}if(t.params.navigation.hideOnClick&&!l){if(t.pagination&&t.params.pagination&&t.params.pagination.clickable&&(t.pagination.el===n||t.pagination.el.contains(n)))return;let e;a.length?e=a[0].classList.contains(t.params.navigation.hiddenClass):r.length&&(e=r[0].classList.contains(t.params.navigation.hiddenClass)),i(!0===e?"navigationShow":"navigationHide"),[...a,...r].filter((e=>!!e)).forEach((e=>e.classList.toggle(t.params.navigation.hiddenClass)))}}));const u=()=>{t.el.classList.add(...t.params.navigation.navigationDisabledClass.split(" ")),p()};Object.assign(t.navigation,{enable:()=>{t.el.classList.remove(...t.params.navigation.navigationDisabledClass.split(" ")),c(),l()},disable:u,update:l,init:c,destroy:p})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const r="swiper-pagination";let n;s({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,progressbarOpposite:!1,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,formatFractionCurrent:e=>e,formatFractionTotal:e=>e,bulletClass:`${r}-bullet`,bulletActiveClass:`${r}-bullet-active`,modifierClass:`${r}-`,currentClass:`${r}-current`,totalClass:`${r}-total`,hiddenClass:`${r}-hidden`,progressbarFillClass:`${r}-progressbar-fill`,progressbarOppositeClass:`${r}-progressbar-opposite`,clickableClass:`${r}-clickable`,lockClass:`${r}-lock`,horizontalClass:`${r}-horizontal`,verticalClass:`${r}-vertical`,paginationDisabledClass:`${r}-disabled`}}),t.pagination={el:null,bullets:[]};let l=0;function o(){return!t.params.pagination.el||!t.pagination.el||Array.isArray(t.pagination.el)&&0===t.pagination.el.length}function d(e,s){const{bulletActiveClass:a}=t.params.pagination;e&&(e=e[("prev"===s?"previous":"next")+"ElementSibling"])&&(e.classList.add(`${a}-${s}`),(e=e[("prev"===s?"previous":"next")+"ElementSibling"])&&e.classList.add(`${a}-${s}-${s}`))}function c(e){const s=e.target.closest(ne(t.params.pagination.bulletClass));if(!s)return;e.preventDefault();const a=y(s)*t.params.slidesPerGroup;if(t.params.loop){if(t.realIndex===a)return;const e=(i=t.realIndex,r=a,n=t.slides.length,(r%=n)==1+(i%=n)?"next":r===i-1?"previous":void 0);"next"===e?t.slideNext():"previous"===e?t.slidePrev():t.slideToLoop(a)}else t.slideTo(a);var i,r,n}function p(){const e=t.rtl,s=t.params.pagination;if(o())return;let a,r,c=t.pagination.el;c=T(c);const p=t.virtual&&t.params.virtual.enabled?t.virtual.slides.length:t.slides.length,u=t.params.loop?Math.ceil(p/t.params.slidesPerGroup):t.snapGrid.length;if(t.params.loop?(r=t.previousRealIndex||0,a=t.params.slidesPerGroup>1?Math.floor(t.realIndex/t.params.slidesPerGroup):t.realIndex):void 0!==t.snapIndex?(a=t.snapIndex,r=t.previousSnapIndex):(r=t.previousIndex||0,a=t.activeIndex||0),"bullets"===s.type&&t.pagination.bullets&&t.pagination.bullets.length>0){const i=t.pagination.bullets;let o,p,u;if(s.dynamicBullets&&(n=S(i[0],t.isHorizontal()?"width":"height",!0),c.forEach((e=>{e.style[t.isHorizontal()?"width":"height"]=n*(s.dynamicMainBullets+4)+"px"})),s.dynamicMainBullets>1&&void 0!==r&&(l+=a-(r||0),l>s.dynamicMainBullets-1?l=s.dynamicMainBullets-1:l<0&&(l=0)),o=Math.max(a-l,0),p=o+(Math.min(i.length,s.dynamicMainBullets)-1),u=(p+o)/2),i.forEach((e=>{const t=[...["","-next","-next-next","-prev","-prev-prev","-main"].map((e=>`${s.bulletActiveClass}${e}`))].map((e=>"string"==typeof e&&e.includes(" ")?e.split(" "):e)).flat();e.classList.remove(...t)})),c.length>1)i.forEach((e=>{const i=y(e);i===a?e.classList.add(...s.bulletActiveClass.split(" ")):t.isElement&&e.setAttribute("part","bullet"),s.dynamicBullets&&(i>=o&&i<=p&&e.classList.add(...`${s.bulletActiveClass}-main`.split(" ")),i===o&&d(e,"prev"),i===p&&d(e,"next"))}));else{const e=i[a];if(e&&e.classList.add(...s.bulletActiveClass.split(" ")),t.isElement&&i.forEach(((e,t)=>{e.setAttribute("part",t===a?"bullet-active":"bullet")})),s.dynamicBullets){const e=i[o],t=i[p];for(let e=o;e<=p;e+=1)i[e]&&i[e].classList.add(...`${s.bulletActiveClass}-main`.split(" "));d(e,"prev"),d(t,"next")}}if(s.dynamicBullets){const a=Math.min(i.length,s.dynamicMainBullets+4),r=(n*a-n)/2-u*n,l=e?"right":"left";i.forEach((e=>{e.style[t.isHorizontal()?l:"top"]=`${r}px`}))}}c.forEach(((e,r)=>{if("fraction"===s.type&&(e.querySelectorAll(ne(s.currentClass)).forEach((e=>{e.textContent=s.formatFractionCurrent(a+1)})),e.querySelectorAll(ne(s.totalClass)).forEach((e=>{e.textContent=s.formatFractionTotal(u)}))),"progressbar"===s.type){let i;i=s.progressbarOpposite?t.isHorizontal()?"vertical":"horizontal":t.isHorizontal()?"horizontal":"vertical";const r=(a+1)/u;let n=1,l=1;"horizontal"===i?n=r:l=r,e.querySelectorAll(ne(s.progressbarFillClass)).forEach((e=>{e.style.transform=`translate3d(0,0,0) scaleX(${n}) scaleY(${l})`,e.style.transitionDuration=`${t.params.speed}ms`}))}"custom"===s.type&&s.renderCustom?(e.innerHTML=s.renderCustom(t,a+1,u),0===r&&i("paginationRender",e)):(0===r&&i("paginationRender",e),i("paginationUpdate",e)),t.params.watchOverflow&&t.enabled&&e.classList[t.isLocked?"add":"remove"](s.lockClass)}))}function u(){const e=t.params.pagination;if(o())return;const s=t.virtual&&t.params.virtual.enabled?t.virtual.slides.length:t.grid&&t.params.grid.rows>1?t.slides.length/Math.ceil(t.params.grid.rows):t.slides.length;let a=t.pagination.el;a=T(a);let r="";if("bullets"===e.type){let a=t.params.loop?Math.ceil(s/t.params.slidesPerGroup):t.snapGrid.length;t.params.freeMode&&t.params.freeMode.enabled&&a>s&&(a=s);for(let s=0;s<a;s+=1)e.renderBullet?r+=e.renderBullet.call(t,s,e.bulletClass):r+=`<${e.bulletElement} ${t.isElement?'part="bullet"':""} class="${e.bulletClass}"></${e.bulletElement}>`}"fraction"===e.type&&(r=e.renderFraction?e.renderFraction.call(t,e.currentClass,e.totalClass):`<span class="${e.currentClass}"></span> / <span class="${e.totalClass}"></span>`),"progressbar"===e.type&&(r=e.renderProgressbar?e.renderProgressbar.call(t,e.progressbarFillClass):`<span class="${e.progressbarFillClass}"></span>`),t.pagination.bullets=[],a.forEach((s=>{"custom"!==e.type&&(s.innerHTML=r||""),"bullets"===e.type&&t.pagination.bullets.push(...s.querySelectorAll(ne(e.bulletClass)))})),"custom"!==e.type&&i("paginationRender",a[0])}function m(){t.params.pagination=re(t,t.originalParams.pagination,t.params.pagination,{el:"swiper-pagination"});const e=t.params.pagination;if(!e.el)return;let s;"string"==typeof e.el&&t.isElement&&(s=t.el.querySelector(e.el)),s||"string"!=typeof e.el||(s=[...document.querySelectorAll(e.el)]),s||(s=e.el),s&&0!==s.length&&(t.params.uniqueNavElements&&"string"==typeof e.el&&Array.isArray(s)&&s.length>1&&(s=[...t.el.querySelectorAll(e.el)],s.length>1&&(s=s.find((e=>E(e,".swiper")[0]===t.el)))),Array.isArray(s)&&1===s.length&&(s=s[0]),Object.assign(t.pagination,{el:s}),s=T(s),s.forEach((s=>{"bullets"===e.type&&e.clickable&&s.classList.add(...(e.clickableClass||"").split(" ")),s.classList.add(e.modifierClass+e.type),s.classList.add(t.isHorizontal()?e.horizontalClass:e.verticalClass),"bullets"===e.type&&e.dynamicBullets&&(s.classList.add(`${e.modifierClass}${e.type}-dynamic`),l=0,e.dynamicMainBullets<1&&(e.dynamicMainBullets=1)),"progressbar"===e.type&&e.progressbarOpposite&&s.classList.add(e.progressbarOppositeClass),e.clickable&&s.addEventListener("click",c),t.enabled||s.classList.add(e.lockClass)})))}function h(){const e=t.params.pagination;if(o())return;let s=t.pagination.el;s&&(s=T(s),s.forEach((s=>{s.classList.remove(e.hiddenClass),s.classList.remove(e.modifierClass+e.type),s.classList.remove(t.isHorizontal()?e.horizontalClass:e.verticalClass),e.clickable&&(s.classList.remove(...(e.clickableClass||"").split(" ")),s.removeEventListener("click",c))}))),t.pagination.bullets&&t.pagination.bullets.forEach((t=>t.classList.remove(...e.bulletActiveClass.split(" "))))}a("changeDirection",(()=>{if(!t.pagination||!t.pagination.el)return;const e=t.params.pagination;let{el:s}=t.pagination;s=T(s),s.forEach((s=>{s.classList.remove(e.horizontalClass,e.verticalClass),s.classList.add(t.isHorizontal()?e.horizontalClass:e.verticalClass)}))})),a("init",(()=>{!1===t.params.pagination.enabled?f():(m(),u(),p())})),a("activeIndexChange",(()=>{void 0===t.snapIndex&&p()})),a("snapIndexChange",(()=>{p()})),a("snapGridLengthChange",(()=>{u(),p()})),a("destroy",(()=>{h()})),a("enable disable",(()=>{let{el:e}=t.pagination;e&&(e=T(e),e.forEach((e=>e.classList[t.enabled?"remove":"add"](t.params.pagination.lockClass))))})),a("lock unlock",(()=>{p()})),a("click",((e,s)=>{const a=s.target,r=T(t.pagination.el);if(t.params.pagination.el&&t.params.pagination.hideOnClick&&r&&r.length>0&&!a.classList.contains(t.params.pagination.bulletClass)){if(t.navigation&&(t.navigation.nextEl&&a===t.navigation.nextEl||t.navigation.prevEl&&a===t.navigation.prevEl))return;const e=r[0].classList.contains(t.params.pagination.hiddenClass);i(!0===e?"paginationShow":"paginationHide"),r.forEach((e=>e.classList.toggle(t.params.pagination.hiddenClass)))}}));const f=()=>{t.el.classList.add(t.params.pagination.paginationDisabledClass);let{el:e}=t.pagination;e&&(e=T(e),e.forEach((e=>e.classList.add(t.params.pagination.paginationDisabledClass)))),h()};Object.assign(t.pagination,{enable:()=>{t.el.classList.remove(t.params.pagination.paginationDisabledClass);let{el:e}=t.pagination;e&&(e=T(e),e.forEach((e=>e.classList.remove(t.params.pagination.paginationDisabledClass)))),m(),u(),p()},disable:f,render:u,update:p,init:m,destroy:h})},function(e){let{swiper:t,extendParams:s,on:i,emit:r}=e;const o=a();let d,c,p,u,m=!1,h=null,f=null;function g(){if(!t.params.scrollbar.el||!t.scrollbar.el)return;const{scrollbar:e,rtlTranslate:s}=t,{dragEl:a,el:i}=e,r=t.params.scrollbar,n=t.params.loop?t.progressLoop:t.progress;let l=c,o=(p-c)*n;s?(o=-o,o>0?(l=c-o,o=0):-o+c>p&&(l=p+o)):o<0?(l=c+o,o=0):o+c>p&&(l=p-o),t.isHorizontal()?(a.style.transform=`translate3d(${o}px, 0, 0)`,a.style.width=`${l}px`):(a.style.transform=`translate3d(0px, ${o}px, 0)`,a.style.height=`${l}px`),r.hide&&(clearTimeout(h),i.style.opacity=1,h=setTimeout((()=>{i.style.opacity=0,i.style.transitionDuration="400ms"}),1e3))}function b(){if(!t.params.scrollbar.el||!t.scrollbar.el)return;const{scrollbar:e}=t,{dragEl:s,el:a}=e;s.style.width="",s.style.height="",p=t.isHorizontal()?a.offsetWidth:a.offsetHeight,u=t.size/(t.virtualSize+t.params.slidesOffsetBefore-(t.params.centeredSlides?t.snapGrid[0]:0)),c="auto"===t.params.scrollbar.dragSize?p*u:parseInt(t.params.scrollbar.dragSize,10),t.isHorizontal()?s.style.width=`${c}px`:s.style.height=`${c}px`,a.style.display=u>=1?"none":"",t.params.scrollbar.hide&&(a.style.opacity=0),t.params.watchOverflow&&t.enabled&&e.el.classList[t.isLocked?"add":"remove"](t.params.scrollbar.lockClass)}function y(e){return t.isHorizontal()?e.clientX:e.clientY}function E(e){const{scrollbar:s,rtlTranslate:a}=t,{el:i}=s;let r;r=(y(e)-w(i)[t.isHorizontal()?"left":"top"]-(null!==d?d:c/2))/(p-c),r=Math.max(Math.min(r,1),0),a&&(r=1-r);const n=t.minTranslate()+(t.maxTranslate()-t.minTranslate())*r;t.updateProgress(n),t.setTranslate(n),t.updateActiveIndex(),t.updateSlidesClasses()}function x(e){const s=t.params.scrollbar,{scrollbar:a,wrapperEl:i}=t,{el:n,dragEl:l}=a;m=!0,d=e.target===l?y(e)-e.target.getBoundingClientRect()[t.isHorizontal()?"left":"top"]:null,e.preventDefault(),e.stopPropagation(),i.style.transitionDuration="100ms",l.style.transitionDuration="100ms",E(e),clearTimeout(f),n.style.transitionDuration="0ms",s.hide&&(n.style.opacity=1),t.params.cssMode&&(t.wrapperEl.style["scroll-snap-type"]="none"),r("scrollbarDragStart",e)}function S(e){const{scrollbar:s,wrapperEl:a}=t,{el:i,dragEl:n}=s;m&&(e.preventDefault&&e.cancelable?e.preventDefault():e.returnValue=!1,E(e),a.style.transitionDuration="0ms",i.style.transitionDuration="0ms",n.style.transitionDuration="0ms",r("scrollbarDragMove",e))}function M(e){const s=t.params.scrollbar,{scrollbar:a,wrapperEl:i}=t,{el:n}=a;m&&(m=!1,t.params.cssMode&&(t.wrapperEl.style["scroll-snap-type"]="",i.style.transitionDuration=""),s.hide&&(clearTimeout(f),f=l((()=>{n.style.opacity=0,n.style.transitionDuration="400ms"}),1e3)),r("scrollbarDragEnd",e),s.snapOnRelease&&t.slideToClosest())}function C(e){const{scrollbar:s,params:a}=t,i=s.el;if(!i)return;const r=i,n=!!a.passiveListeners&&{passive:!1,capture:!1},l=!!a.passiveListeners&&{passive:!0,capture:!1};if(!r)return;const d="on"===e?"addEventListener":"removeEventListener";r[d]("pointerdown",x,n),o[d]("pointermove",S,n),o[d]("pointerup",M,l)}function P(){const{scrollbar:e,el:s}=t;t.params.scrollbar=re(t,t.originalParams.scrollbar,t.params.scrollbar,{el:"swiper-scrollbar"});const a=t.params.scrollbar;if(!a.el)return;let i,r;if("string"==typeof a.el&&t.isElement&&(i=t.el.querySelector(a.el)),i||"string"!=typeof a.el)i||(i=a.el);else if(i=o.querySelectorAll(a.el),!i.length)return;t.params.uniqueNavElements&&"string"==typeof a.el&&i.length>1&&1===s.querySelectorAll(a.el).length&&(i=s.querySelector(a.el)),i.length>0&&(i=i[0]),i.classList.add(t.isHorizontal()?a.horizontalClass:a.verticalClass),i&&(r=i.querySelector(ne(t.params.scrollbar.dragClass)),r||(r=v("div",t.params.scrollbar.dragClass),i.append(r))),Object.assign(e,{el:i,dragEl:r}),a.draggable&&t.params.scrollbar.el&&t.scrollbar.el&&C("on"),i&&i.classList[t.enabled?"remove":"add"](...n(t.params.scrollbar.lockClass))}function L(){const e=t.params.scrollbar,s=t.scrollbar.el;s&&s.classList.remove(...n(t.isHorizontal()?e.horizontalClass:e.verticalClass)),t.params.scrollbar.el&&t.scrollbar.el&&C("off")}s({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollbar-lock",dragClass:"swiper-scrollbar-drag",scrollbarDisabledClass:"swiper-scrollbar-disabled",horizontalClass:"swiper-scrollbar-horizontal",verticalClass:"swiper-scrollbar-vertical"}}),t.scrollbar={el:null,dragEl:null},i("changeDirection",(()=>{if(!t.scrollbar||!t.scrollbar.el)return;const e=t.params.scrollbar;let{el:s}=t.scrollbar;s=T(s),s.forEach((s=>{s.classList.remove(e.horizontalClass,e.verticalClass),s.classList.add(t.isHorizontal()?e.horizontalClass:e.verticalClass)}))})),i("init",(()=>{!1===t.params.scrollbar.enabled?I():(P(),b(),g())})),i("update resize observerUpdate lock unlock changeDirection",(()=>{b()})),i("setTranslate",(()=>{g()})),i("setTransition",((e,s)=>{!function(e){t.params.scrollbar.el&&t.scrollbar.el&&(t.scrollbar.dragEl.style.transitionDuration=`${e}ms`)}(s)})),i("enable disable",(()=>{const{el:e}=t.scrollbar;e&&e.classList[t.enabled?"remove":"add"](...n(t.params.scrollbar.lockClass))})),i("destroy",(()=>{L()}));const I=()=>{t.el.classList.add(...n(t.params.scrollbar.scrollbarDisabledClass)),t.scrollbar.el&&t.scrollbar.el.classList.add(...n(t.params.scrollbar.scrollbarDisabledClass)),L()};Object.assign(t.scrollbar,{enable:()=>{t.el.classList.remove(...n(t.params.scrollbar.scrollbarDisabledClass)),t.scrollbar.el&&t.scrollbar.el.classList.remove(...n(t.params.scrollbar.scrollbarDisabledClass)),P(),b(),g()},disable:I,updateSize:b,setTranslate:g,init:P,destroy:L})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({parallax:{enabled:!1}});const i="[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]",r=(e,s)=>{const{rtl:a}=t,i=a?-1:1,r=e.getAttribute("data-swiper-parallax")||"0";let n=e.getAttribute("data-swiper-parallax-x"),l=e.getAttribute("data-swiper-parallax-y");const o=e.getAttribute("data-swiper-parallax-scale"),d=e.getAttribute("data-swiper-parallax-opacity"),c=e.getAttribute("data-swiper-parallax-rotate");if(n||l?(n=n||"0",l=l||"0"):t.isHorizontal()?(n=r,l="0"):(l=r,n="0"),n=n.indexOf("%")>=0?parseInt(n,10)*s*i+"%":n*s*i+"px",l=l.indexOf("%")>=0?parseInt(l,10)*s+"%":l*s+"px",null!=d){const t=d-(d-1)*(1-Math.abs(s));e.style.opacity=t}let p=`translate3d(${n}, ${l}, 0px)`;if(null!=o){p+=` scale(${o-(o-1)*(1-Math.abs(s))})`}if(c&&null!=c){p+=` rotate(${c*s*-1}deg)`}e.style.transform=p},n=()=>{const{el:e,slides:s,progress:a,snapGrid:n,isElement:l}=t,o=f(e,i);t.isElement&&o.push(...f(t.hostEl,i)),o.forEach((e=>{r(e,a)})),s.forEach(((e,s)=>{let l=e.progress;t.params.slidesPerGroup>1&&"auto"!==t.params.slidesPerView&&(l+=Math.ceil(s/2)-a*(n.length-1)),l=Math.min(Math.max(l,-1),1),e.querySelectorAll(`${i}, [data-swiper-parallax-rotate]`).forEach((e=>{r(e,l)}))}))};a("beforeInit",(()=>{t.params.parallax.enabled&&(t.params.watchSlidesProgress=!0,t.originalParams.watchSlidesProgress=!0)})),a("init",(()=>{t.params.parallax.enabled&&n()})),a("setTranslate",(()=>{t.params.parallax.enabled&&n()})),a("setTransition",((e,s)=>{t.params.parallax.enabled&&function(e){void 0===e&&(e=t.params.speed);const{el:s,hostEl:a}=t,r=[...s.querySelectorAll(i)];t.isElement&&r.push(...a.querySelectorAll(i)),r.forEach((t=>{let s=parseInt(t.getAttribute("data-swiper-parallax-duration"),10)||e;0===e&&(s=0),t.style.transitionDuration=`${s}ms`}))}(s)}))},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=r();s({zoom:{enabled:!1,limitToOriginalSize:!1,maxRatio:3,minRatio:1,panOnMouseMove:!1,toggle:!0,containerClass:"swiper-zoom-container",zoomedSlideClass:"swiper-slide-zoomed"}}),t.zoom={enabled:!1};let l=1,o=!1,c=!1,p={x:0,y:0};const u=-3;let m,h;const g=[],v={originX:0,originY:0,slideEl:void 0,slideWidth:void 0,slideHeight:void 0,imageEl:void 0,imageWrapEl:void 0,maxRatio:3},b={isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},y={x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0};let x,S=1;function T(){if(g.length<2)return 1;const e=g[0].pageX,t=g[0].pageY,s=g[1].pageX,a=g[1].pageY;return Math.sqrt((s-e)**2+(a-t)**2)}function M(){const e=t.params.zoom,s=v.imageWrapEl.getAttribute("data-swiper-zoom")||e.maxRatio;if(e.limitToOriginalSize&&v.imageEl&&v.imageEl.naturalWidth){const e=v.imageEl.naturalWidth/v.imageEl.offsetWidth;return Math.min(e,s)}return s}function C(e){const s=t.isElement?"swiper-slide":`.${t.params.slideClass}`;return!!e.target.matches(s)||t.slides.filter((t=>t.contains(e.target))).length>0}function P(e){const s=`.${t.params.zoom.containerClass}`;return!!e.target.matches(s)||[...t.hostEl.querySelectorAll(s)].filter((t=>t.contains(e.target))).length>0}function L(e){if("mouse"===e.pointerType&&g.splice(0,g.length),!C(e))return;const s=t.params.zoom;if(m=!1,h=!1,g.push(e),!(g.length<2)){if(m=!0,v.scaleStart=T(),!v.slideEl){v.slideEl=e.target.closest(`.${t.params.slideClass}, swiper-slide`),v.slideEl||(v.slideEl=t.slides[t.activeIndex]);let a=v.slideEl.querySelector(`.${s.containerClass}`);if(a&&(a=a.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),v.imageEl=a,v.imageWrapEl=a?E(v.imageEl,`.${s.containerClass}`)[0]:void 0,!v.imageWrapEl)return void(v.imageEl=void 0);v.maxRatio=M()}if(v.imageEl){const[e,t]=function(){if(g.length<2)return{x:null,y:null};const e=v.imageEl.getBoundingClientRect();return[(g[0].pageX+(g[1].pageX-g[0].pageX)/2-e.x-n.scrollX)/l,(g[0].pageY+(g[1].pageY-g[0].pageY)/2-e.y-n.scrollY)/l]}();v.originX=e,v.originY=t,v.imageEl.style.transitionDuration="0ms"}o=!0}}function I(e){if(!C(e))return;const s=t.params.zoom,a=t.zoom,i=g.findIndex((t=>t.pointerId===e.pointerId));i>=0&&(g[i]=e),g.length<2||(h=!0,v.scaleMove=T(),v.imageEl&&(a.scale=v.scaleMove/v.scaleStart*l,a.scale>v.maxRatio&&(a.scale=v.maxRatio-1+(a.scale-v.maxRatio+1)**.5),a.scale<s.minRatio&&(a.scale=s.minRatio+1-(s.minRatio-a.scale+1)**.5),v.imageEl.style.transform=`translate3d(0,0,0) scale(${a.scale})`))}function z(e){if(!C(e))return;if("mouse"===e.pointerType&&"pointerout"===e.type)return;const s=t.params.zoom,a=t.zoom,i=g.findIndex((t=>t.pointerId===e.pointerId));i>=0&&g.splice(i,1),m&&h&&(m=!1,h=!1,v.imageEl&&(a.scale=Math.max(Math.min(a.scale,v.maxRatio),s.minRatio),v.imageEl.style.transitionDuration=`${t.params.speed}ms`,v.imageEl.style.transform=`translate3d(0,0,0) scale(${a.scale})`,l=a.scale,o=!1,a.scale>1&&v.slideEl?v.slideEl.classList.add(`${s.zoomedSlideClass}`):a.scale<=1&&v.slideEl&&v.slideEl.classList.remove(`${s.zoomedSlideClass}`),1===a.scale&&(v.originX=0,v.originY=0,v.slideEl=void 0)))}function A(){t.touchEventsData.preventTouchMoveFromPointerMove=!1}function $(e){const s="mouse"===e.pointerType&&t.params.zoom.panOnMouseMove;if(!C(e)||!P(e))return;const a=t.zoom;if(!v.imageEl)return;if(!b.isTouched||!v.slideEl)return void(s&&O(e));if(s)return void O(e);b.isMoved||(b.width=v.imageEl.offsetWidth||v.imageEl.clientWidth,b.height=v.imageEl.offsetHeight||v.imageEl.clientHeight,b.startX=d(v.imageWrapEl,"x")||0,b.startY=d(v.imageWrapEl,"y")||0,v.slideWidth=v.slideEl.offsetWidth,v.slideHeight=v.slideEl.offsetHeight,v.imageWrapEl.style.transitionDuration="0ms");const i=b.width*a.scale,r=b.height*a.scale;b.minX=Math.min(v.slideWidth/2-i/2,0),b.maxX=-b.minX,b.minY=Math.min(v.slideHeight/2-r/2,0),b.maxY=-b.minY,b.touchesCurrent.x=g.length>0?g[0].pageX:e.pageX,b.touchesCurrent.y=g.length>0?g[0].pageY:e.pageY;if(Math.max(Math.abs(b.touchesCurrent.x-b.touchesStart.x),Math.abs(b.touchesCurrent.y-b.touchesStart.y))>5&&(t.allowClick=!1),!b.isMoved&&!o){if(t.isHorizontal()&&(Math.floor(b.minX)===Math.floor(b.startX)&&b.touchesCurrent.x<b.touchesStart.x||Math.floor(b.maxX)===Math.floor(b.startX)&&b.touchesCurrent.x>b.touchesStart.x))return b.isTouched=!1,void A();if(!t.isHorizontal()&&(Math.floor(b.minY)===Math.floor(b.startY)&&b.touchesCurrent.y<b.touchesStart.y||Math.floor(b.maxY)===Math.floor(b.startY)&&b.touchesCurrent.y>b.touchesStart.y))return b.isTouched=!1,void A()}e.cancelable&&e.preventDefault(),e.stopPropagation(),clearTimeout(x),t.touchEventsData.preventTouchMoveFromPointerMove=!0,x=setTimeout((()=>{t.destroyed||A()})),b.isMoved=!0;const n=(a.scale-l)/(v.maxRatio-t.params.zoom.minRatio),{originX:c,originY:p}=v;b.currentX=b.touchesCurrent.x-b.touchesStart.x+b.startX+n*(b.width-2*c),b.currentY=b.touchesCurrent.y-b.touchesStart.y+b.startY+n*(b.height-2*p),b.currentX<b.minX&&(b.currentX=b.minX+1-(b.minX-b.currentX+1)**.8),b.currentX>b.maxX&&(b.currentX=b.maxX-1+(b.currentX-b.maxX+1)**.8),b.currentY<b.minY&&(b.currentY=b.minY+1-(b.minY-b.currentY+1)**.8),b.currentY>b.maxY&&(b.currentY=b.maxY-1+(b.currentY-b.maxY+1)**.8),y.prevPositionX||(y.prevPositionX=b.touchesCurrent.x),y.prevPositionY||(y.prevPositionY=b.touchesCurrent.y),y.prevTime||(y.prevTime=Date.now()),y.x=(b.touchesCurrent.x-y.prevPositionX)/(Date.now()-y.prevTime)/2,y.y=(b.touchesCurrent.y-y.prevPositionY)/(Date.now()-y.prevTime)/2,Math.abs(b.touchesCurrent.x-y.prevPositionX)<2&&(y.x=0),Math.abs(b.touchesCurrent.y-y.prevPositionY)<2&&(y.y=0),y.prevPositionX=b.touchesCurrent.x,y.prevPositionY=b.touchesCurrent.y,y.prevTime=Date.now(),v.imageWrapEl.style.transform=`translate3d(${b.currentX}px, ${b.currentY}px,0)`}function k(){const e=t.zoom;v.slideEl&&t.activeIndex!==t.slides.indexOf(v.slideEl)&&(v.imageEl&&(v.imageEl.style.transform="translate3d(0,0,0) scale(1)"),v.imageWrapEl&&(v.imageWrapEl.style.transform="translate3d(0,0,0)"),v.slideEl.classList.remove(`${t.params.zoom.zoomedSlideClass}`),e.scale=1,l=1,v.slideEl=void 0,v.imageEl=void 0,v.imageWrapEl=void 0,v.originX=0,v.originY=0)}function O(e){if(l<=1||!v.imageWrapEl)return;if(!C(e)||!P(e))return;const t=n.getComputedStyle(v.imageWrapEl).transform,s=new n.DOMMatrix(t);if(!c)return c=!0,p.x=e.clientX,p.y=e.clientY,b.startX=s.e,b.startY=s.f,b.width=v.imageEl.offsetWidth||v.imageEl.clientWidth,b.height=v.imageEl.offsetHeight||v.imageEl.clientHeight,v.slideWidth=v.slideEl.offsetWidth,void(v.slideHeight=v.slideEl.offsetHeight);const a=(e.clientX-p.x)*u,i=(e.clientY-p.y)*u,r=b.width*l,o=b.height*l,d=v.slideWidth,m=v.slideHeight,h=Math.min(d/2-r/2,0),f=-h,g=Math.min(m/2-o/2,0),w=-g,y=Math.max(Math.min(b.startX+a,f),h),E=Math.max(Math.min(b.startY+i,w),g);v.imageWrapEl.style.transitionDuration="0ms",v.imageWrapEl.style.transform=`translate3d(${y}px, ${E}px, 0)`,p.x=e.clientX,p.y=e.clientY,b.startX=y,b.startY=E}function D(e){const s=t.zoom,a=t.params.zoom;if(!v.slideEl){e&&e.target&&(v.slideEl=e.target.closest(`.${t.params.slideClass}, swiper-slide`)),v.slideEl||(t.params.virtual&&t.params.virtual.enabled&&t.virtual?v.slideEl=f(t.slidesEl,`.${t.params.slideActiveClass}`)[0]:v.slideEl=t.slides[t.activeIndex]);let s=v.slideEl.querySelector(`.${a.containerClass}`);s&&(s=s.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),v.imageEl=s,v.imageWrapEl=s?E(v.imageEl,`.${a.containerClass}`)[0]:void 0}if(!v.imageEl||!v.imageWrapEl)return;let i,r,o,d,c,p,u,m,h,g,y,x,S,T,C,P,L,I;t.params.cssMode&&(t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.touchAction="none"),v.slideEl.classList.add(`${a.zoomedSlideClass}`),void 0===b.touchesStart.x&&e?(i=e.pageX,r=e.pageY):(i=b.touchesStart.x,r=b.touchesStart.y);const z="number"==typeof e?e:null;1===l&&z&&(i=void 0,r=void 0,b.touchesStart.x=void 0,b.touchesStart.y=void 0);const A=M();s.scale=z||A,l=z||A,!e||1===l&&z?(u=0,m=0):(L=v.slideEl.offsetWidth,I=v.slideEl.offsetHeight,o=w(v.slideEl).left+n.scrollX,d=w(v.slideEl).top+n.scrollY,c=o+L/2-i,p=d+I/2-r,h=v.imageEl.offsetWidth||v.imageEl.clientWidth,g=v.imageEl.offsetHeight||v.imageEl.clientHeight,y=h*s.scale,x=g*s.scale,S=Math.min(L/2-y/2,0),T=Math.min(I/2-x/2,0),C=-S,P=-T,u=c*s.scale,m=p*s.scale,u<S&&(u=S),u>C&&(u=C),m<T&&(m=T),m>P&&(m=P)),z&&1===s.scale&&(v.originX=0,v.originY=0),v.imageWrapEl.style.transitionDuration="300ms",v.imageWrapEl.style.transform=`translate3d(${u}px, ${m}px,0)`,v.imageEl.style.transitionDuration="300ms",v.imageEl.style.transform=`translate3d(0,0,0) scale(${s.scale})`}function G(){const e=t.zoom,s=t.params.zoom;if(!v.slideEl){t.params.virtual&&t.params.virtual.enabled&&t.virtual?v.slideEl=f(t.slidesEl,`.${t.params.slideActiveClass}`)[0]:v.slideEl=t.slides[t.activeIndex];let e=v.slideEl.querySelector(`.${s.containerClass}`);e&&(e=e.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),v.imageEl=e,v.imageWrapEl=e?E(v.imageEl,`.${s.containerClass}`)[0]:void 0}v.imageEl&&v.imageWrapEl&&(t.params.cssMode&&(t.wrapperEl.style.overflow="",t.wrapperEl.style.touchAction=""),e.scale=1,l=1,b.touchesStart.x=void 0,b.touchesStart.y=void 0,v.imageWrapEl.style.transitionDuration="300ms",v.imageWrapEl.style.transform="translate3d(0,0,0)",v.imageEl.style.transitionDuration="300ms",v.imageEl.style.transform="translate3d(0,0,0) scale(1)",v.slideEl.classList.remove(`${s.zoomedSlideClass}`),v.slideEl=void 0,v.originX=0,v.originY=0,t.params.zoom.panOnMouseMove&&(p={x:0,y:0},c&&(c=!1,b.startX=0,b.startY=0)))}function H(e){const s=t.zoom;s.scale&&1!==s.scale?G():D(e)}function X(){return{passiveListener:!!t.params.passiveListeners&&{passive:!0,capture:!1},activeListenerWithCapture:!t.params.passiveListeners||{passive:!1,capture:!0}}}function B(){const e=t.zoom;if(e.enabled)return;e.enabled=!0;const{passiveListener:s,activeListenerWithCapture:a}=X();t.wrapperEl.addEventListener("pointerdown",L,s),t.wrapperEl.addEventListener("pointermove",I,a),["pointerup","pointercancel","pointerout"].forEach((e=>{t.wrapperEl.addEventListener(e,z,s)})),t.wrapperEl.addEventListener("pointermove",$,a)}function Y(){const e=t.zoom;if(!e.enabled)return;e.enabled=!1;const{passiveListener:s,activeListenerWithCapture:a}=X();t.wrapperEl.removeEventListener("pointerdown",L,s),t.wrapperEl.removeEventListener("pointermove",I,a),["pointerup","pointercancel","pointerout"].forEach((e=>{t.wrapperEl.removeEventListener(e,z,s)})),t.wrapperEl.removeEventListener("pointermove",$,a)}Object.defineProperty(t.zoom,"scale",{get:()=>S,set(e){if(S!==e){const t=v.imageEl,s=v.slideEl;i("zoomChange",e,t,s)}S=e}}),a("init",(()=>{t.params.zoom.enabled&&B()})),a("destroy",(()=>{Y()})),a("touchStart",((e,s)=>{t.zoom.enabled&&function(e){const s=t.device;if(!v.imageEl)return;if(b.isTouched)return;s.android&&e.cancelable&&e.preventDefault(),b.isTouched=!0;const a=g.length>0?g[0]:e;b.touchesStart.x=a.pageX,b.touchesStart.y=a.pageY}(s)})),a("touchEnd",((e,s)=>{t.zoom.enabled&&function(){const e=t.zoom;if(g.length=0,!v.imageEl)return;if(!b.isTouched||!b.isMoved)return b.isTouched=!1,void(b.isMoved=!1);b.isTouched=!1,b.isMoved=!1;let s=300,a=300;const i=y.x*s,r=b.currentX+i,n=y.y*a,l=b.currentY+n;0!==y.x&&(s=Math.abs((r-b.currentX)/y.x)),0!==y.y&&(a=Math.abs((l-b.currentY)/y.y));const o=Math.max(s,a);b.currentX=r,b.currentY=l;const d=b.width*e.scale,c=b.height*e.scale;b.minX=Math.min(v.slideWidth/2-d/2,0),b.maxX=-b.minX,b.minY=Math.min(v.slideHeight/2-c/2,0),b.maxY=-b.minY,b.currentX=Math.max(Math.min(b.currentX,b.maxX),b.minX),b.currentY=Math.max(Math.min(b.currentY,b.maxY),b.minY),v.imageWrapEl.style.transitionDuration=`${o}ms`,v.imageWrapEl.style.transform=`translate3d(${b.currentX}px, ${b.currentY}px,0)`}()})),a("doubleTap",((e,s)=>{!t.animating&&t.params.zoom.enabled&&t.zoom.enabled&&t.params.zoom.toggle&&H(s)})),a("transitionEnd",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&k()})),a("slideChange",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&t.params.cssMode&&k()})),Object.assign(t.zoom,{enable:B,disable:Y,in:D,out:G,toggle:H})},function(e){let{swiper:t,extendParams:s,on:a}=e;function i(e,t){const s=function(){let e,t,s;return(a,i)=>{for(t=-1,e=a.length;e-t>1;)s=e+t>>1,a[s]<=i?t=s:e=s;return e}}();let a,i;return this.x=e,this.y=t,this.lastIndex=e.length-1,this.interpolate=function(e){return e?(i=s(this.x,e),a=i-1,(e-this.x[a])*(this.y[i]-this.y[a])/(this.x[i]-this.x[a])+this.y[a]):0},this}function r(){t.controller.control&&t.controller.spline&&(t.controller.spline=void 0,delete t.controller.spline)}s({controller:{control:void 0,inverse:!1,by:"slide"}}),t.controller={control:void 0},a("beforeInit",(()=>{if("undefined"!=typeof window&&("string"==typeof t.params.controller.control||t.params.controller.control instanceof HTMLElement)){("string"==typeof t.params.controller.control?[...document.querySelectorAll(t.params.controller.control)]:[t.params.controller.control]).forEach((e=>{if(t.controller.control||(t.controller.control=[]),e&&e.swiper)t.controller.control.push(e.swiper);else if(e){const s=`${t.params.eventsPrefix}init`,a=i=>{t.controller.control.push(i.detail[0]),t.update(),e.removeEventListener(s,a)};e.addEventListener(s,a)}}))}else t.controller.control=t.params.controller.control})),a("update",(()=>{r()})),a("resize",(()=>{r()})),a("observerUpdate",(()=>{r()})),a("setTranslate",((e,s,a)=>{t.controller.control&&!t.controller.control.destroyed&&t.controller.setTranslate(s,a)})),a("setTransition",((e,s,a)=>{t.controller.control&&!t.controller.control.destroyed&&t.controller.setTransition(s,a)})),Object.assign(t.controller,{setTranslate:function(e,s){const a=t.controller.control;let r,n;const l=t.constructor;function o(e){if(e.destroyed)return;const s=t.rtlTranslate?-t.translate:t.translate;"slide"===t.params.controller.by&&(!function(e){t.controller.spline=t.params.loop?new i(t.slidesGrid,e.slidesGrid):new i(t.snapGrid,e.snapGrid)}(e),n=-t.controller.spline.interpolate(-s)),n&&"container"!==t.params.controller.by||(r=(e.maxTranslate()-e.minTranslate())/(t.maxTranslate()-t.minTranslate()),!Number.isNaN(r)&&Number.isFinite(r)||(r=1),n=(s-t.minTranslate())*r+e.minTranslate()),t.params.controller.inverse&&(n=e.maxTranslate()-n),e.updateProgress(n),e.setTranslate(n,t),e.updateActiveIndex(),e.updateSlidesClasses()}if(Array.isArray(a))for(let e=0;e<a.length;e+=1)a[e]!==s&&a[e]instanceof l&&o(a[e]);else a instanceof l&&s!==a&&o(a)},setTransition:function(e,s){const a=t.constructor,i=t.controller.control;let r;function n(s){s.destroyed||(s.setTransition(e,t),0!==e&&(s.transitionStart(),s.params.autoHeight&&l((()=>{s.updateAutoHeight()})),x(s.wrapperEl,(()=>{i&&s.transitionEnd()}))))}if(Array.isArray(i))for(r=0;r<i.length;r+=1)i[r]!==s&&i[r]instanceof a&&n(i[r]);else i instanceof a&&s!==i&&n(i)}})},function(e){let{swiper:t,extendParams:s,on:i}=e;s({a11y:{enabled:!0,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",slideLabelMessage:"{{index}} / {{slidesLength}}",containerMessage:null,containerRoleDescriptionMessage:null,containerRole:null,itemRoleDescriptionMessage:null,slideRole:"group",id:null,scrollOnFocus:!0}}),t.a11y={clicked:!1};let r,n,l=null,o=(new Date).getTime();function d(e){const t=l;0!==t.length&&(t.innerHTML="",t.innerHTML=e)}function c(e){(e=T(e)).forEach((e=>{e.setAttribute("tabIndex","0")}))}function p(e){(e=T(e)).forEach((e=>{e.setAttribute("tabIndex","-1")}))}function u(e,t){(e=T(e)).forEach((e=>{e.setAttribute("role",t)}))}function m(e,t){(e=T(e)).forEach((e=>{e.setAttribute("aria-roledescription",t)}))}function h(e,t){(e=T(e)).forEach((e=>{e.setAttribute("aria-label",t)}))}function f(e){(e=T(e)).forEach((e=>{e.setAttribute("aria-disabled",!0)}))}function g(e){(e=T(e)).forEach((e=>{e.setAttribute("aria-disabled",!1)}))}function w(e){if(13!==e.keyCode&&32!==e.keyCode)return;const s=t.params.a11y,a=e.target;if(!t.pagination||!t.pagination.el||a!==t.pagination.el&&!t.pagination.el.contains(e.target)||e.target.matches(ne(t.params.pagination.bulletClass))){if(t.navigation&&t.navigation.prevEl&&t.navigation.nextEl){const e=T(t.navigation.prevEl);T(t.navigation.nextEl).includes(a)&&(t.isEnd&&!t.params.loop||t.slideNext(),t.isEnd?d(s.lastSlideMessage):d(s.nextSlideMessage)),e.includes(a)&&(t.isBeginning&&!t.params.loop||t.slidePrev(),t.isBeginning?d(s.firstSlideMessage):d(s.prevSlideMessage))}t.pagination&&a.matches(ne(t.params.pagination.bulletClass))&&a.click()}}function b(){return t.pagination&&t.pagination.bullets&&t.pagination.bullets.length}function E(){return b()&&t.params.pagination.clickable}const x=(e,t,s)=>{c(e),"BUTTON"!==e.tagName&&(u(e,"button"),e.addEventListener("keydown",w)),h(e,s),function(e,t){(e=T(e)).forEach((e=>{e.setAttribute("aria-controls",t)}))}(e,t)},S=e=>{n&&n!==e.target&&!n.contains(e.target)&&(r=!0),t.a11y.clicked=!0},M=()=>{r=!1,requestAnimationFrame((()=>{requestAnimationFrame((()=>{t.destroyed||(t.a11y.clicked=!1)}))}))},C=e=>{o=(new Date).getTime()},P=e=>{if(t.a11y.clicked||!t.params.a11y.scrollOnFocus)return;if((new Date).getTime()-o<100)return;const s=e.target.closest(`.${t.params.slideClass}, swiper-slide`);if(!s||!t.slides.includes(s))return;n=s;const a=t.slides.indexOf(s)===t.activeIndex,i=t.params.watchSlidesProgress&&t.visibleSlides&&t.visibleSlides.includes(s);a||i||e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents||(t.isHorizontal()?t.el.scrollLeft=0:t.el.scrollTop=0,requestAnimationFrame((()=>{r||(t.params.loop?t.slideToLoop(parseInt(s.getAttribute("data-swiper-slide-index")),0):t.slideTo(t.slides.indexOf(s),0),r=!1)})))},L=()=>{const e=t.params.a11y;e.itemRoleDescriptionMessage&&m(t.slides,e.itemRoleDescriptionMessage),e.slideRole&&u(t.slides,e.slideRole);const s=t.slides.length;e.slideLabelMessage&&t.slides.forEach(((a,i)=>{const r=t.params.loop?parseInt(a.getAttribute("data-swiper-slide-index"),10):i;h(a,e.slideLabelMessage.replace(/\{\{index\}\}/,r+1).replace(/\{\{slidesLength\}\}/,s))}))},I=()=>{const e=t.params.a11y;t.el.append(l);const s=t.el;e.containerRoleDescriptionMessage&&m(s,e.containerRoleDescriptionMessage),e.containerMessage&&h(s,e.containerMessage),e.containerRole&&u(s,e.containerRole);const i=t.wrapperEl,r=e.id||i.getAttribute("id")||`swiper-wrapper-${n=16,void 0===n&&(n=16),"x".repeat(n).replace(/x/g,(()=>Math.round(16*Math.random()).toString(16)))}`;var n;const o=t.params.autoplay&&t.params.autoplay.enabled?"off":"polite";var d;d=r,T(i).forEach((e=>{e.setAttribute("id",d)})),function(e,t){(e=T(e)).forEach((e=>{e.setAttribute("aria-live",t)}))}(i,o),L();let{nextEl:c,prevEl:p}=t.navigation?t.navigation:{};if(c=T(c),p=T(p),c&&c.forEach((t=>x(t,r,e.nextSlideMessage))),p&&p.forEach((t=>x(t,r,e.prevSlideMessage))),E()){T(t.pagination.el).forEach((e=>{e.addEventListener("keydown",w)}))}a().addEventListener("visibilitychange",C),t.el.addEventListener("focus",P,!0),t.el.addEventListener("focus",P,!0),t.el.addEventListener("pointerdown",S,!0),t.el.addEventListener("pointerup",M,!0)};i("beforeInit",(()=>{l=v("span",t.params.a11y.notificationClass),l.setAttribute("aria-live","assertive"),l.setAttribute("aria-atomic","true")})),i("afterInit",(()=>{t.params.a11y.enabled&&I()})),i("slidesLengthChange snapGridLengthChange slidesGridLengthChange",(()=>{t.params.a11y.enabled&&L()})),i("fromEdge toEdge afterInit lock unlock",(()=>{t.params.a11y.enabled&&function(){if(t.params.loop||t.params.rewind||!t.navigation)return;const{nextEl:e,prevEl:s}=t.navigation;s&&(t.isBeginning?(f(s),p(s)):(g(s),c(s))),e&&(t.isEnd?(f(e),p(e)):(g(e),c(e)))}()})),i("paginationUpdate",(()=>{t.params.a11y.enabled&&function(){const e=t.params.a11y;b()&&t.pagination.bullets.forEach((s=>{t.params.pagination.clickable&&(c(s),t.params.pagination.renderBullet||(u(s,"button"),h(s,e.paginationBulletMessage.replace(/\{\{index\}\}/,y(s)+1)))),s.matches(ne(t.params.pagination.bulletActiveClass))?s.setAttribute("aria-current","true"):s.removeAttribute("aria-current")}))}()})),i("destroy",(()=>{t.params.a11y.enabled&&function(){l&&l.remove();let{nextEl:e,prevEl:s}=t.navigation?t.navigation:{};e=T(e),s=T(s),e&&e.forEach((e=>e.removeEventListener("keydown",w))),s&&s.forEach((e=>e.removeEventListener("keydown",w))),E()&&T(t.pagination.el).forEach((e=>{e.removeEventListener("keydown",w)}));a().removeEventListener("visibilitychange",C),t.el&&"string"!=typeof t.el&&(t.el.removeEventListener("focus",P,!0),t.el.removeEventListener("pointerdown",S,!0),t.el.removeEventListener("pointerup",M,!0))}()}))},function(e){let{swiper:t,extendParams:s,on:a}=e;s({history:{enabled:!1,root:"",replaceState:!1,key:"slides",keepQuery:!1}});let i=!1,n={};const l=e=>e.toString().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,""),o=e=>{const t=r();let s;s=e?new URL(e):t.location;const a=s.pathname.slice(1).split("/").filter((e=>""!==e)),i=a.length;return{key:a[i-2],value:a[i-1]}},d=(e,s)=>{const a=r();if(!i||!t.params.history.enabled)return;let n;n=t.params.url?new URL(t.params.url):a.location;const o=t.virtual&&t.params.virtual.enabled?t.slidesEl.querySelector(`[data-swiper-slide-index="${s}"]`):t.slides[s];let d=l(o.getAttribute("data-history"));if(t.params.history.root.length>0){let s=t.params.history.root;"/"===s[s.length-1]&&(s=s.slice(0,s.length-1)),d=`${s}/${e?`${e}/`:""}${d}`}else n.pathname.includes(e)||(d=`${e?`${e}/`:""}${d}`);t.params.history.keepQuery&&(d+=n.search);const c=a.history.state;c&&c.value===d||(t.params.history.replaceState?a.history.replaceState({value:d},null,d):a.history.pushState({value:d},null,d))},c=(e,s,a)=>{if(s)for(let i=0,r=t.slides.length;i<r;i+=1){const r=t.slides[i];if(l(r.getAttribute("data-history"))===s){const s=t.getSlideIndex(r);t.slideTo(s,e,a)}}else t.slideTo(0,e,a)},p=()=>{n=o(t.params.url),c(t.params.speed,n.value,!1)};a("init",(()=>{t.params.history.enabled&&(()=>{const e=r();if(t.params.history){if(!e.history||!e.history.pushState)return t.params.history.enabled=!1,void(t.params.hashNavigation.enabled=!0);i=!0,n=o(t.params.url),n.key||n.value?(c(0,n.value,t.params.runCallbacksOnInit),t.params.history.replaceState||e.addEventListener("popstate",p)):t.params.history.replaceState||e.addEventListener("popstate",p)}})()})),a("destroy",(()=>{t.params.history.enabled&&(()=>{const e=r();t.params.history.replaceState||e.removeEventListener("popstate",p)})()})),a("transitionEnd _freeModeNoMomentumRelease",(()=>{i&&d(t.params.history.key,t.activeIndex)})),a("slideChange",(()=>{i&&t.params.cssMode&&d(t.params.history.key,t.activeIndex)}))},function(e){let{swiper:t,extendParams:s,emit:i,on:n}=e,l=!1;const o=a(),d=r();s({hashNavigation:{enabled:!1,replaceState:!1,watchState:!1,getSlideIndex(e,s){if(t.virtual&&t.params.virtual.enabled){const e=t.slides.find((e=>e.getAttribute("data-hash")===s));if(!e)return 0;return parseInt(e.getAttribute("data-swiper-slide-index"),10)}return t.getSlideIndex(f(t.slidesEl,`.${t.params.slideClass}[data-hash="${s}"], swiper-slide[data-hash="${s}"]`)[0])}}});const c=()=>{i("hashChange");const e=o.location.hash.replace("#",""),s=t.virtual&&t.params.virtual.enabled?t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`):t.slides[t.activeIndex];if(e!==(s?s.getAttribute("data-hash"):"")){const s=t.params.hashNavigation.getSlideIndex(t,e);if(void 0===s||Number.isNaN(s))return;t.slideTo(s)}},p=()=>{if(!l||!t.params.hashNavigation.enabled)return;const e=t.virtual&&t.params.virtual.enabled?t.slidesEl.querySelector(`[data-swiper-slide-index="${t.activeIndex}"]`):t.slides[t.activeIndex],s=e?e.getAttribute("data-hash")||e.getAttribute("data-history"):"";t.params.hashNavigation.replaceState&&d.history&&d.history.replaceState?(d.history.replaceState(null,null,`#${s}`||""),i("hashSet")):(o.location.hash=s||"",i("hashSet"))};n("init",(()=>{t.params.hashNavigation.enabled&&(()=>{if(!t.params.hashNavigation.enabled||t.params.history&&t.params.history.enabled)return;l=!0;const e=o.location.hash.replace("#","");if(e){const s=0,a=t.params.hashNavigation.getSlideIndex(t,e);t.slideTo(a||0,s,t.params.runCallbacksOnInit,!0)}t.params.hashNavigation.watchState&&d.addEventListener("hashchange",c)})()})),n("destroy",(()=>{t.params.hashNavigation.enabled&&t.params.hashNavigation.watchState&&d.removeEventListener("hashchange",c)})),n("transitionEnd _freeModeNoMomentumRelease",(()=>{l&&p()})),n("slideChange",(()=>{l&&t.params.cssMode&&p()}))},function(e){let t,s,{swiper:i,extendParams:r,on:n,emit:l,params:o}=e;i.autoplay={running:!1,paused:!1,timeLeft:0},r({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!1,stopOnLastSlide:!1,reverseDirection:!1,pauseOnMouseEnter:!1}});let d,c,p,u,m,h,f,g,v=o&&o.autoplay?o.autoplay.delay:3e3,w=o&&o.autoplay?o.autoplay.delay:3e3,b=(new Date).getTime();function y(e){i&&!i.destroyed&&i.wrapperEl&&e.target===i.wrapperEl&&(i.wrapperEl.removeEventListener("transitionend",y),g||e.detail&&e.detail.bySwiperTouchMove||C())}const E=()=>{if(i.destroyed||!i.autoplay.running)return;i.autoplay.paused?c=!0:c&&(w=d,c=!1);const e=i.autoplay.paused?d:b+w-(new Date).getTime();i.autoplay.timeLeft=e,l("autoplayTimeLeft",e,e/v),s=requestAnimationFrame((()=>{E()}))},x=e=>{if(i.destroyed||!i.autoplay.running)return;cancelAnimationFrame(s),E();let a=void 0===e?i.params.autoplay.delay:e;v=i.params.autoplay.delay,w=i.params.autoplay.delay;const r=(()=>{let e;if(e=i.virtual&&i.params.virtual.enabled?i.slides.find((e=>e.classList.contains("swiper-slide-active"))):i.slides[i.activeIndex],!e)return;return parseInt(e.getAttribute("data-swiper-autoplay"),10)})();!Number.isNaN(r)&&r>0&&void 0===e&&(a=r,v=r,w=r),d=a;const n=i.params.speed,o=()=>{i&&!i.destroyed&&(i.params.autoplay.reverseDirection?!i.isBeginning||i.params.loop||i.params.rewind?(i.slidePrev(n,!0,!0),l("autoplay")):i.params.autoplay.stopOnLastSlide||(i.slideTo(i.slides.length-1,n,!0,!0),l("autoplay")):!i.isEnd||i.params.loop||i.params.rewind?(i.slideNext(n,!0,!0),l("autoplay")):i.params.autoplay.stopOnLastSlide||(i.slideTo(0,n,!0,!0),l("autoplay")),i.params.cssMode&&(b=(new Date).getTime(),requestAnimationFrame((()=>{x()}))))};return a>0?(clearTimeout(t),t=setTimeout((()=>{o()}),a)):requestAnimationFrame((()=>{o()})),a},S=()=>{b=(new Date).getTime(),i.autoplay.running=!0,x(),l("autoplayStart")},T=()=>{i.autoplay.running=!1,clearTimeout(t),cancelAnimationFrame(s),l("autoplayStop")},M=(e,s)=>{if(i.destroyed||!i.autoplay.running)return;clearTimeout(t),e||(f=!0);const a=()=>{l("autoplayPause"),i.params.autoplay.waitForTransition?i.wrapperEl.addEventListener("transitionend",y):C()};if(i.autoplay.paused=!0,s)return h&&(d=i.params.autoplay.delay),h=!1,void a();const r=d||i.params.autoplay.delay;d=r-((new Date).getTime()-b),i.isEnd&&d<0&&!i.params.loop||(d<0&&(d=0),a())},C=()=>{i.isEnd&&d<0&&!i.params.loop||i.destroyed||!i.autoplay.running||(b=(new Date).getTime(),f?(f=!1,x(d)):x(),i.autoplay.paused=!1,l("autoplayResume"))},P=()=>{if(i.destroyed||!i.autoplay.running)return;const e=a();"hidden"===e.visibilityState&&(f=!0,M(!0)),"visible"===e.visibilityState&&C()},L=e=>{"mouse"===e.pointerType&&(f=!0,g=!0,i.animating||i.autoplay.paused||M(!0))},I=e=>{"mouse"===e.pointerType&&(g=!1,i.autoplay.paused&&C())};n("init",(()=>{i.params.autoplay.enabled&&(i.params.autoplay.pauseOnMouseEnter&&(i.el.addEventListener("pointerenter",L),i.el.addEventListener("pointerleave",I)),a().addEventListener("visibilitychange",P),S())})),n("destroy",(()=>{i.el&&"string"!=typeof i.el&&(i.el.removeEventListener("pointerenter",L),i.el.removeEventListener("pointerleave",I)),a().removeEventListener("visibilitychange",P),i.autoplay.running&&T()})),n("_freeModeStaticRelease",(()=>{(u||f)&&C()})),n("_freeModeNoMomentumRelease",(()=>{i.params.autoplay.disableOnInteraction?T():M(!0,!0)})),n("beforeTransitionStart",((e,t,s)=>{!i.destroyed&&i.autoplay.running&&(s||!i.params.autoplay.disableOnInteraction?M(!0,!0):T())})),n("sliderFirstMove",(()=>{!i.destroyed&&i.autoplay.running&&(i.params.autoplay.disableOnInteraction?T():(p=!0,u=!1,f=!1,m=setTimeout((()=>{f=!0,u=!0,M(!0)}),200)))})),n("touchEnd",(()=>{if(!i.destroyed&&i.autoplay.running&&p){if(clearTimeout(m),clearTimeout(t),i.params.autoplay.disableOnInteraction)return u=!1,void(p=!1);u&&i.params.cssMode&&C(),u=!1,p=!1}})),n("slideChange",(()=>{!i.destroyed&&i.autoplay.running&&(h=!0)})),Object.assign(i.autoplay,{start:S,stop:T,pause:M,resume:C})},function(e){let{swiper:t,extendParams:s,on:i}=e;s({thumbs:{swiper:null,multipleActiveThumbs:!0,autoScrollOffset:0,slideThumbActiveClass:"swiper-slide-thumb-active",thumbsContainerClass:"swiper-thumbs"}});let r=!1,n=!1;function l(){const e=t.thumbs.swiper;if(!e||e.destroyed)return;const s=e.clickedIndex,a=e.clickedSlide;if(a&&a.classList.contains(t.params.thumbs.slideThumbActiveClass))return;if(null==s)return;let i;i=e.params.loop?parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"),10):s,t.params.loop?t.slideToLoop(i):t.slideTo(i)}function o(){const{thumbs:e}=t.params;if(r)return!1;r=!0;const s=t.constructor;if(e.swiper instanceof s)t.thumbs.swiper=e.swiper,Object.assign(t.thumbs.swiper.originalParams,{watchSlidesProgress:!0,slideToClickedSlide:!1}),Object.assign(t.thumbs.swiper.params,{watchSlidesProgress:!0,slideToClickedSlide:!1}),t.thumbs.swiper.update();else if(c(e.swiper)){const a=Object.assign({},e.swiper);Object.assign(a,{watchSlidesProgress:!0,slideToClickedSlide:!1}),t.thumbs.swiper=new s(a),n=!0}return t.thumbs.swiper.el.classList.add(t.params.thumbs.thumbsContainerClass),t.thumbs.swiper.on("tap",l),!0}function d(e){const s=t.thumbs.swiper;if(!s||s.destroyed)return;const a="auto"===s.params.slidesPerView?s.slidesPerViewDynamic():s.params.slidesPerView;let i=1;const r=t.params.thumbs.slideThumbActiveClass;if(t.params.slidesPerView>1&&!t.params.centeredSlides&&(i=t.params.slidesPerView),t.params.thumbs.multipleActiveThumbs||(i=1),i=Math.floor(i),s.slides.forEach((e=>e.classList.remove(r))),s.params.loop||s.params.virtual&&s.params.virtual.enabled)for(let e=0;e<i;e+=1)f(s.slidesEl,`[data-swiper-slide-index="${t.realIndex+e}"]`).forEach((e=>{e.classList.add(r)}));else for(let e=0;e<i;e+=1)s.slides[t.realIndex+e]&&s.slides[t.realIndex+e].classList.add(r);const n=t.params.thumbs.autoScrollOffset,l=n&&!s.params.loop;if(t.realIndex!==s.realIndex||l){const i=s.activeIndex;let r,o;if(s.params.loop){const e=s.slides.find((e=>e.getAttribute("data-swiper-slide-index")===`${t.realIndex}`));r=s.slides.indexOf(e),o=t.activeIndex>t.previousIndex?"next":"prev"}else r=t.realIndex,o=r>t.previousIndex?"next":"prev";l&&(r+="next"===o?n:-1*n),s.visibleSlidesIndexes&&s.visibleSlidesIndexes.indexOf(r)<0&&(s.params.centeredSlides?r=r>i?r-Math.floor(a/2)+1:r+Math.floor(a/2)-1:r>i&&s.params.slidesPerGroup,s.slideTo(r,e?0:void 0))}}t.thumbs={swiper:null},i("beforeInit",(()=>{const{thumbs:e}=t.params;if(e&&e.swiper)if("string"==typeof e.swiper||e.swiper instanceof HTMLElement){const s=a(),i=()=>{const a="string"==typeof e.swiper?s.querySelector(e.swiper):e.swiper;if(a&&a.swiper)e.swiper=a.swiper,o(),d(!0);else if(a){const s=`${t.params.eventsPrefix}init`,i=r=>{e.swiper=r.detail[0],a.removeEventListener(s,i),o(),d(!0),e.swiper.update(),t.update()};a.addEventListener(s,i)}return a},r=()=>{if(t.destroyed)return;i()||requestAnimationFrame(r)};requestAnimationFrame(r)}else o(),d(!0)})),i("slideChange update resize observerUpdate",(()=>{d()})),i("setTransition",((e,s)=>{const a=t.thumbs.swiper;a&&!a.destroyed&&a.setTransition(s)})),i("beforeDestroy",(()=>{const e=t.thumbs.swiper;e&&!e.destroyed&&n&&e.destroy()})),Object.assign(t.thumbs,{init:o,update:d})},function(e){let{swiper:t,extendParams:s,emit:a,once:i}=e;s({freeMode:{enabled:!1,momentum:!0,momentumRatio:1,momentumBounce:!0,momentumBounceRatio:1,momentumVelocityRatio:1,sticky:!1,minimumVelocity:.02}}),Object.assign(t,{freeMode:{onTouchStart:function(){if(t.params.cssMode)return;const e=t.getTranslate();t.setTranslate(e),t.setTransition(0),t.touchEventsData.velocities.length=0,t.freeMode.onTouchEnd({currentPos:t.rtl?t.translate:-t.translate})},onTouchMove:function(){if(t.params.cssMode)return;const{touchEventsData:e,touches:s}=t;0===e.velocities.length&&e.velocities.push({position:s[t.isHorizontal()?"startX":"startY"],time:e.touchStartTime}),e.velocities.push({position:s[t.isHorizontal()?"currentX":"currentY"],time:o()})},onTouchEnd:function(e){let{currentPos:s}=e;if(t.params.cssMode)return;const{params:r,wrapperEl:n,rtlTranslate:l,snapGrid:d,touchEventsData:c}=t,p=o()-c.touchStartTime;if(s<-t.minTranslate())t.slideTo(t.activeIndex);else if(s>-t.maxTranslate())t.slides.length<d.length?t.slideTo(d.length-1):t.slideTo(t.slides.length-1);else{if(r.freeMode.momentum){if(c.velocities.length>1){const e=c.velocities.pop(),s=c.velocities.pop(),a=e.position-s.position,i=e.time-s.time;t.velocity=a/i,t.velocity/=2,Math.abs(t.velocity)<r.freeMode.minimumVelocity&&(t.velocity=0),(i>150||o()-e.time>300)&&(t.velocity=0)}else t.velocity=0;t.velocity*=r.freeMode.momentumVelocityRatio,c.velocities.length=0;let e=1e3*r.freeMode.momentumRatio;const s=t.velocity*e;let p=t.translate+s;l&&(p=-p);let u,m=!1;const h=20*Math.abs(t.velocity)*r.freeMode.momentumBounceRatio;let f;if(p<t.maxTranslate())r.freeMode.momentumBounce?(p+t.maxTranslate()<-h&&(p=t.maxTranslate()-h),u=t.maxTranslate(),m=!0,c.allowMomentumBounce=!0):p=t.maxTranslate(),r.loop&&r.centeredSlides&&(f=!0);else if(p>t.minTranslate())r.freeMode.momentumBounce?(p-t.minTranslate()>h&&(p=t.minTranslate()+h),u=t.minTranslate(),m=!0,c.allowMomentumBounce=!0):p=t.minTranslate(),r.loop&&r.centeredSlides&&(f=!0);else if(r.freeMode.sticky){let e;for(let t=0;t<d.length;t+=1)if(d[t]>-p){e=t;break}p=Math.abs(d[e]-p)<Math.abs(d[e-1]-p)||"next"===t.swipeDirection?d[e]:d[e-1],p=-p}if(f&&i("transitionEnd",(()=>{t.loopFix()})),0!==t.velocity){if(e=l?Math.abs((-p-t.translate)/t.velocity):Math.abs((p-t.translate)/t.velocity),r.freeMode.sticky){const s=Math.abs((l?-p:p)-t.translate),a=t.slidesSizesGrid[t.activeIndex];e=s<a?r.speed:s<2*a?1.5*r.speed:2.5*r.speed}}else if(r.freeMode.sticky)return void t.slideToClosest();r.freeMode.momentumBounce&&m?(t.updateProgress(u),t.setTransition(e),t.setTranslate(p),t.transitionStart(!0,t.swipeDirection),t.animating=!0,x(n,(()=>{t&&!t.destroyed&&c.allowMomentumBounce&&(a("momentumBounce"),t.setTransition(r.speed),setTimeout((()=>{t.setTranslate(u),x(n,(()=>{t&&!t.destroyed&&t.transitionEnd()}))}),0))}))):t.velocity?(a("_freeModeNoMomentumRelease"),t.updateProgress(p),t.setTransition(e),t.setTranslate(p),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,x(n,(()=>{t&&!t.destroyed&&t.transitionEnd()})))):t.updateProgress(p),t.updateActiveIndex(),t.updateSlidesClasses()}else{if(r.freeMode.sticky)return void t.slideToClosest();r.freeMode&&a("_freeModeNoMomentumRelease")}(!r.freeMode.momentum||p>=r.longSwipesMs)&&(a("_freeModeStaticRelease"),t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses())}}}})},function(e){let t,s,a,i,{swiper:r,extendParams:n,on:l}=e;n({grid:{rows:1,fill:"column"}});const o=()=>{let e=r.params.spaceBetween;return"string"==typeof e&&e.indexOf("%")>=0?e=parseFloat(e.replace("%",""))/100*r.size:"string"==typeof e&&(e=parseFloat(e)),e};l("init",(()=>{i=r.params.grid&&r.params.grid.rows>1})),l("update",(()=>{const{params:e,el:t}=r,s=e.grid&&e.grid.rows>1;i&&!s?(t.classList.remove(`${e.containerModifierClass}grid`,`${e.containerModifierClass}grid-column`),a=1,r.emitContainerClasses()):!i&&s&&(t.classList.add(`${e.containerModifierClass}grid`),"column"===e.grid.fill&&t.classList.add(`${e.containerModifierClass}grid-column`),r.emitContainerClasses()),i=s})),r.grid={initSlides:e=>{const{slidesPerView:i}=r.params,{rows:n,fill:l}=r.params.grid,o=r.virtual&&r.params.virtual.enabled?r.virtual.slides.length:e.length;a=Math.floor(o/n),t=Math.floor(o/n)===o/n?o:Math.ceil(o/n)*n,"auto"!==i&&"row"===l&&(t=Math.max(t,i*n)),s=t/n},unsetSlides:()=>{r.slides&&r.slides.forEach((e=>{e.swiperSlideGridSet&&(e.style.height="",e.style[r.getDirectionLabel("margin-top")]="")}))},updateSlide:(e,i,n)=>{const{slidesPerGroup:l}=r.params,d=o(),{rows:c,fill:p}=r.params.grid,u=r.virtual&&r.params.virtual.enabled?r.virtual.slides.length:n.length;let m,h,f;if("row"===p&&l>1){const s=Math.floor(e/(l*c)),a=e-c*l*s,r=0===s?l:Math.min(Math.ceil((u-s*c*l)/c),l);f=Math.floor(a/r),h=a-f*r+s*l,m=h+f*t/c,i.style.order=m}else"column"===p?(h=Math.floor(e/c),f=e-h*c,(h>a||h===a&&f===c-1)&&(f+=1,f>=c&&(f=0,h+=1))):(f=Math.floor(e/s),h=e-f*s);i.row=f,i.column=h,i.style.height=`calc((100% - ${(c-1)*d}px) / ${c})`,i.style[r.getDirectionLabel("margin-top")]=0!==f?d&&`${d}px`:"",i.swiperSlideGridSet=!0},updateWrapperSize:(e,s)=>{const{centeredSlides:a,roundLengths:i}=r.params,n=o(),{rows:l}=r.params.grid;if(r.virtualSize=(e+n)*t,r.virtualSize=Math.ceil(r.virtualSize/l)-n,r.params.cssMode||(r.wrapperEl.style[r.getDirectionLabel("width")]=`${r.virtualSize+n}px`),a){const e=[];for(let t=0;t<s.length;t+=1){let a=s[t];i&&(a=Math.floor(a)),s[t]<r.virtualSize+s[0]&&e.push(a)}s.splice(0,s.length),s.push(...e)}}}},function(e){let{swiper:t}=e;Object.assign(t,{appendSlide:le.bind(t),prependSlide:oe.bind(t),addSlide:de.bind(t),removeSlide:ce.bind(t),removeAllSlides:pe.bind(t)})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({fadeEffect:{crossFade:!1}}),ue({effect:"fade",swiper:t,on:a,setTranslate:()=>{const{slides:e}=t;t.params.fadeEffect;for(let s=0;s<e.length;s+=1){const e=t.slides[s];let a=-e.swiperSlideOffset;t.params.virtualTranslate||(a-=t.translate);let i=0;t.isHorizontal()||(i=a,a=0);const r=t.params.fadeEffect.crossFade?Math.max(1-Math.abs(e.progress),0):1+Math.min(Math.max(e.progress,-1),0),n=me(0,e);n.style.opacity=r,n.style.transform=`translate3d(${a}px, ${i}px, 0px)`}},setTransition:e=>{const s=t.slides.map((e=>h(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`})),he({swiper:t,duration:e,transformElements:s,allSlides:!0})},overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({cubeEffect:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94}});const i=(e,t,s)=>{let a=s?e.querySelector(".swiper-slide-shadow-left"):e.querySelector(".swiper-slide-shadow-top"),i=s?e.querySelector(".swiper-slide-shadow-right"):e.querySelector(".swiper-slide-shadow-bottom");a||(a=v("div",("swiper-slide-shadow-cube swiper-slide-shadow-"+(s?"left":"top")).split(" ")),e.append(a)),i||(i=v("div",("swiper-slide-shadow-cube swiper-slide-shadow-"+(s?"right":"bottom")).split(" ")),e.append(i)),a&&(a.style.opacity=Math.max(-t,0)),i&&(i.style.opacity=Math.max(t,0))};ue({effect:"cube",swiper:t,on:a,setTranslate:()=>{const{el:e,wrapperEl:s,slides:a,width:r,height:n,rtlTranslate:l,size:o,browser:d}=t,c=M(t),p=t.params.cubeEffect,u=t.isHorizontal(),m=t.virtual&&t.params.virtual.enabled;let h,f=0;p.shadow&&(u?(h=t.wrapperEl.querySelector(".swiper-cube-shadow"),h||(h=v("div","swiper-cube-shadow"),t.wrapperEl.append(h)),h.style.height=`${r}px`):(h=e.querySelector(".swiper-cube-shadow"),h||(h=v("div","swiper-cube-shadow"),e.append(h))));for(let e=0;e<a.length;e+=1){const t=a[e];let s=e;m&&(s=parseInt(t.getAttribute("data-swiper-slide-index"),10));let r=90*s,n=Math.floor(r/360);l&&(r=-r,n=Math.floor(-r/360));const d=Math.max(Math.min(t.progress,1),-1);let h=0,g=0,v=0;s%4==0?(h=4*-n*o,v=0):(s-1)%4==0?(h=0,v=4*-n*o):(s-2)%4==0?(h=o+4*n*o,v=o):(s-3)%4==0&&(h=-o,v=3*o+4*o*n),l&&(h=-h),u||(g=h,h=0);const w=`rotateX(${c(u?0:-r)}deg) rotateY(${c(u?r:0)}deg) translate3d(${h}px, ${g}px, ${v}px)`;d<=1&&d>-1&&(f=90*s+90*d,l&&(f=90*-s-90*d)),t.style.transform=w,p.slideShadows&&i(t,d,u)}if(s.style.transformOrigin=`50% 50% -${o/2}px`,s.style["-webkit-transform-origin"]=`50% 50% -${o/2}px`,p.shadow)if(u)h.style.transform=`translate3d(0px, ${r/2+p.shadowOffset}px, ${-r/2}px) rotateX(89.99deg) rotateZ(0deg) scale(${p.shadowScale})`;else{const e=Math.abs(f)-90*Math.floor(Math.abs(f)/90),t=1.5-(Math.sin(2*e*Math.PI/360)/2+Math.cos(2*e*Math.PI/360)/2),s=p.shadowScale,a=p.shadowScale/t,i=p.shadowOffset;h.style.transform=`scale3d(${s}, 1, ${a}) translate3d(0px, ${n/2+i}px, ${-n/2/a}px) rotateX(-89.99deg)`}const g=(d.isSafari||d.isWebView)&&d.needPerspectiveFix?-o/2:0;s.style.transform=`translate3d(0px,0,${g}px) rotateX(${c(t.isHorizontal()?0:f)}deg) rotateY(${c(t.isHorizontal()?-f:0)}deg)`,s.style.setProperty("--swiper-cube-translate-z",`${g}px`)},setTransition:e=>{const{el:s,slides:a}=t;if(a.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`}))})),t.params.cubeEffect.shadow&&!t.isHorizontal()){const t=s.querySelector(".swiper-cube-shadow");t&&(t.style.transitionDuration=`${e}ms`)}},recreateShadows:()=>{const e=t.isHorizontal();t.slides.forEach((t=>{const s=Math.max(Math.min(t.progress,1),-1);i(t,s,e)}))},getEffectParams:()=>t.params.cubeEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,resistanceRatio:0,spaceBetween:0,centeredSlides:!1,virtualTranslate:!0})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({flipEffect:{slideShadows:!0,limitRotation:!0}});const i=(e,s)=>{let a=t.isHorizontal()?e.querySelector(".swiper-slide-shadow-left"):e.querySelector(".swiper-slide-shadow-top"),i=t.isHorizontal()?e.querySelector(".swiper-slide-shadow-right"):e.querySelector(".swiper-slide-shadow-bottom");a||(a=fe("flip",e,t.isHorizontal()?"left":"top")),i||(i=fe("flip",e,t.isHorizontal()?"right":"bottom")),a&&(a.style.opacity=Math.max(-s,0)),i&&(i.style.opacity=Math.max(s,0))};ue({effect:"flip",swiper:t,on:a,setTranslate:()=>{const{slides:e,rtlTranslate:s}=t,a=t.params.flipEffect,r=M(t);for(let n=0;n<e.length;n+=1){const l=e[n];let o=l.progress;t.params.flipEffect.limitRotation&&(o=Math.max(Math.min(l.progress,1),-1));const d=l.swiperSlideOffset;let c=-180*o,p=0,u=t.params.cssMode?-d-t.translate:-d,m=0;t.isHorizontal()?s&&(c=-c):(m=u,u=0,p=-c,c=0),l.style.zIndex=-Math.abs(Math.round(o))+e.length,a.slideShadows&&i(l,o);const h=`translate3d(${u}px, ${m}px, 0px) rotateX(${r(p)}deg) rotateY(${r(c)}deg)`;me(0,l).style.transform=h}},setTransition:e=>{const s=t.slides.map((e=>h(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`}))})),he({swiper:t,duration:e,transformElements:s})},recreateShadows:()=>{t.params.flipEffect,t.slides.forEach((e=>{let s=e.progress;t.params.flipEffect.limitRotation&&(s=Math.max(Math.min(e.progress,1),-1)),i(e,s)}))},getEffectParams:()=>t.params.flipEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0}}),ue({effect:"coverflow",swiper:t,on:a,setTranslate:()=>{const{width:e,height:s,slides:a,slidesSizesGrid:i}=t,r=t.params.coverflowEffect,n=t.isHorizontal(),l=t.translate,o=n?e/2-l:s/2-l,d=n?r.rotate:-r.rotate,c=r.depth,p=M(t);for(let e=0,t=a.length;e<t;e+=1){const t=a[e],s=i[e],l=(o-t.swiperSlideOffset-s/2)/s,u="function"==typeof r.modifier?r.modifier(l):l*r.modifier;let m=n?d*u:0,h=n?0:d*u,f=-c*Math.abs(u),g=r.stretch;"string"==typeof g&&-1!==g.indexOf("%")&&(g=parseFloat(r.stretch)/100*s);let v=n?0:g*u,w=n?g*u:0,b=1-(1-r.scale)*Math.abs(u);Math.abs(w)<.001&&(w=0),Math.abs(v)<.001&&(v=0),Math.abs(f)<.001&&(f=0),Math.abs(m)<.001&&(m=0),Math.abs(h)<.001&&(h=0),Math.abs(b)<.001&&(b=0);const y=`translate3d(${w}px,${v}px,${f}px)  rotateX(${p(h)}deg) rotateY(${p(m)}deg) scale(${b})`;if(me(0,t).style.transform=y,t.style.zIndex=1-Math.abs(Math.round(u)),r.slideShadows){let e=n?t.querySelector(".swiper-slide-shadow-left"):t.querySelector(".swiper-slide-shadow-top"),s=n?t.querySelector(".swiper-slide-shadow-right"):t.querySelector(".swiper-slide-shadow-bottom");e||(e=fe("coverflow",t,n?"left":"top")),s||(s=fe("coverflow",t,n?"right":"bottom")),e&&(e.style.opacity=u>0?u:0),s&&(s.style.opacity=-u>0?-u:0)}}},setTransition:e=>{t.slides.map((e=>h(e))).forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`}))}))},perspective:()=>!0,overwriteParams:()=>({watchSlidesProgress:!0})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({creativeEffect:{limitProgress:1,shadowPerProgress:!1,progressMultiplier:1,perspective:!0,prev:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1},next:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1}}});const i=e=>"string"==typeof e?e:`${e}px`;ue({effect:"creative",swiper:t,on:a,setTranslate:()=>{const{slides:e,wrapperEl:s,slidesSizesGrid:a}=t,r=t.params.creativeEffect,{progressMultiplier:n}=r,l=t.params.centeredSlides,o=M(t);if(l){const e=a[0]/2-t.params.slidesOffsetBefore||0;s.style.transform=`translateX(calc(50% - ${e}px))`}for(let s=0;s<e.length;s+=1){const a=e[s],d=a.progress,c=Math.min(Math.max(a.progress,-r.limitProgress),r.limitProgress);let p=c;l||(p=Math.min(Math.max(a.originalProgress,-r.limitProgress),r.limitProgress));const u=a.swiperSlideOffset,m=[t.params.cssMode?-u-t.translate:-u,0,0],h=[0,0,0];let f=!1;t.isHorizontal()||(m[1]=m[0],m[0]=0);let g={translate:[0,0,0],rotate:[0,0,0],scale:1,opacity:1};c<0?(g=r.next,f=!0):c>0&&(g=r.prev,f=!0),m.forEach(((e,t)=>{m[t]=`calc(${e}px + (${i(g.translate[t])} * ${Math.abs(c*n)}))`})),h.forEach(((e,t)=>{let s=g.rotate[t]*Math.abs(c*n);h[t]=s})),a.style.zIndex=-Math.abs(Math.round(d))+e.length;const v=m.join(", "),w=`rotateX(${o(h[0])}deg) rotateY(${o(h[1])}deg) rotateZ(${o(h[2])}deg)`,b=p<0?`scale(${1+(1-g.scale)*p*n})`:`scale(${1-(1-g.scale)*p*n})`,y=p<0?1+(1-g.opacity)*p*n:1-(1-g.opacity)*p*n,E=`translate3d(${v}) ${w} ${b}`;if(f&&g.shadow||!f){let e=a.querySelector(".swiper-slide-shadow");if(!e&&g.shadow&&(e=fe("creative",a)),e){const t=r.shadowPerProgress?c*(1/r.limitProgress):c;e.style.opacity=Math.min(Math.max(Math.abs(t),0),1)}}const x=me(0,a);x.style.transform=E,x.style.opacity=y,g.origin&&(x.style.transformOrigin=g.origin)}},setTransition:e=>{const s=t.slides.map((e=>h(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow").forEach((t=>{t.style.transitionDuration=`${e}ms`}))})),he({swiper:t,duration:e,transformElements:s,allSlides:!0})},perspective:()=>t.params.creativeEffect.perspective,overwriteParams:()=>({watchSlidesProgress:!0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({cardsEffect:{slideShadows:!0,rotate:!0,perSlideRotate:2,perSlideOffset:8}}),ue({effect:"cards",swiper:t,on:a,setTranslate:()=>{const{slides:e,activeIndex:s,rtlTranslate:a}=t,i=t.params.cardsEffect,{startTranslate:r,isTouched:n}=t.touchEventsData,l=a?-t.translate:t.translate;for(let o=0;o<e.length;o+=1){const d=e[o],c=d.progress,p=Math.min(Math.max(c,-4),4);let u=d.swiperSlideOffset;t.params.centeredSlides&&!t.params.cssMode&&(t.wrapperEl.style.transform=`translateX(${t.minTranslate()}px)`),t.params.centeredSlides&&t.params.cssMode&&(u-=e[0].swiperSlideOffset);let m=t.params.cssMode?-u-t.translate:-u,h=0;const f=-100*Math.abs(p);let g=1,v=-i.perSlideRotate*p,w=i.perSlideOffset-.75*Math.abs(p);const b=t.virtual&&t.params.virtual.enabled?t.virtual.from+o:o,y=(b===s||b===s-1)&&p>0&&p<1&&(n||t.params.cssMode)&&l<r,E=(b===s||b===s+1)&&p<0&&p>-1&&(n||t.params.cssMode)&&l>r;if(y||E){const e=(1-Math.abs((Math.abs(p)-.5)/.5))**.5;v+=-28*p*e,g+=-.5*e,w+=96*e,h=-25*e*Math.abs(p)+"%"}if(m=p<0?`calc(${m}px ${a?"-":"+"} (${w*Math.abs(p)}%))`:p>0?`calc(${m}px ${a?"-":"+"} (-${w*Math.abs(p)}%))`:`${m}px`,!t.isHorizontal()){const e=h;h=m,m=e}const x=p<0?""+(1+(1-g)*p):""+(1-(1-g)*p),S=`\n        translate3d(${m}, ${h}, ${f}px)\n        rotateZ(${i.rotate?a?-v:v:0}deg)\n        scale(${x})\n      `;if(i.slideShadows){let e=d.querySelector(".swiper-slide-shadow");e||(e=fe("cards",d)),e&&(e.style.opacity=Math.min(Math.max((Math.abs(p)-.5)/.5,0),1))}d.style.zIndex=-Math.abs(Math.round(c))+e.length;me(0,d).style.transform=S}},setTransition:e=>{const s=t.slides.map((e=>h(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow").forEach((t=>{t.style.transitionDuration=`${e}ms`}))})),he({swiper:t,duration:e,transformElements:s})},perspective:()=>!0,overwriteParams:()=>({_loopSwapReset:!1,watchSlidesProgress:!0,loopAdditionalSlides:3,centeredSlides:!0,virtualTranslate:!t.params.cssMode})})}];return ie.use(ge),ie}();
//# sourceMappingURL=swiper-bundle.min.js.map;
/**!
 * lightgallery.js | 1.4.1-beta.0 | October 29th 2020
 * http://sachinchoolur.github.io/lightgallery.js/
 * Copyright (c) 2016 Sachin N; 
 * @license GPLv3 
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.Lightgallery=e()}}(function(){var e,t,s;return function(){function e(t,s,l){function i(r,a){if(!s[r]){if(!t[r]){var d="function"==typeof require&&require;if(!a&&d)return d(r,!0);if(o)return o(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var u=s[r]={exports:{}};t[r][0].call(u.exports,function(e){return i(t[r][1][e]||e)},u,u.exports,e,t,s,l)}return s[r].exports}for(var o="function"==typeof require&&require,r=0;r<l.length;r++)i(l[r]);return i}return e}()({1:[function(t,s,l){!function(t,s){if("function"==typeof e&&e.amd)e(["exports"],s);else if(void 0!==l)s(l);else{var i={exports:{}};s(i.exports),t.lgUtils=i.exports}}(this,function(e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var t={getAttribute:function e(t,s){return t[s]},setAttribute:function e(t,s,l){t[s]=l},wrap:function e(t,s){if(t){var l=document.createElement("div");l.className=s,t.parentNode.insertBefore(l,t),t.parentNode.removeChild(t),l.appendChild(t)}},addClass:function e(t,s){t&&(t.classList?t.classList.add(s):t.className+=" "+s)},removeClass:function e(t,s){t&&(t.classList?t.classList.remove(s):t.className=t.className.replace(new RegExp("(^|\\b)"+s.split(" ").join("|")+"(\\b|$)","gi")," "))},hasClass:function e(t,s){return t.classList?t.classList.contains(s):new RegExp("(^| )"+s+"( |$)","gi").test(t.className)},setVendor:function e(t,s,l){t&&(t.style[s.charAt(0).toLowerCase()+s.slice(1)]=l,t.style["webkit"+s]=l,t.style["moz"+s]=l,t.style["ms"+s]=l,t.style["o"+s]=l)},trigger:function e(t,s){var l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(t){var i=new CustomEvent(s,{detail:l});t.dispatchEvent(i)}},Listener:{uid:0},on:function e(s,l,i){var o=this;s&&l.split(" ").forEach(function(e){var l=o.getAttribute(s,"lg-event-uid")||"";t.Listener.uid++,l+="&"+t.Listener.uid,o.setAttribute(s,"lg-event-uid",l),t.Listener[e+t.Listener.uid]=i,s.addEventListener(e.split(".")[0],i,!1)})},off:function e(s,l){if(s){var i=this.getAttribute(s,"lg-event-uid");if(i){i=i.split("&");for(var o=0;o<i.length;o++)if(i[o]){var r=l+i[o];if("."===r.substring(0,1))for(var a in t.Listener)t.Listener.hasOwnProperty(a)&&a.split(".").indexOf(r.split(".")[1])>-1&&(s.removeEventListener(a.split(".")[0],t.Listener[a]),this.setAttribute(s,"lg-event-uid",this.getAttribute(s,"lg-event-uid").replace("&"+i[o],"")),delete t.Listener[a]);else s.removeEventListener(r.split(".")[0],t.Listener[r]),this.setAttribute(s,"lg-event-uid",this.getAttribute(s,"lg-event-uid").replace("&"+i[o],"")),delete t.Listener[r]}}}},param:function e(t){return Object.keys(t).map(function(e){return encodeURIComponent(e)+"="+encodeURIComponent(t[e])}).join("&")}};e.default=t})},{}],2:[function(t,s,l){!function(s,i){if("function"==typeof e&&e.amd)e(["./lg-utils"],i);else if(void 0!==l)i(t("./lg-utils"));else{var o={exports:{}};i(s.lgUtils),s.lightgallery=o.exports}}(this,function(e){"use strict";function t(e){return e&&e.__esModule?e:{default:e}}function s(e,t){if(this.el=e,this.s=i({},o,t),this.s.dynamic&&"undefined"!==this.s.dynamicEl&&this.s.dynamicEl.constructor===Array&&!this.s.dynamicEl.length)throw"When using dynamic mode, you must also define dynamicEl as an Array.";return this.modules={},this.lGalleryOn=!1,this.lgBusy=!1,this.hideBartimeout=!1,this.isTouch="ontouchstart"in document.documentElement,this.s.slideEndAnimatoin&&(this.s.hideControlOnEnd=!1),this.items=[],this.s.dynamic?this.items=this.s.dynamicEl:"this"===this.s.selector?this.items.push(this.el):""!==this.s.selector?this.s.selectWithin?this.items=document.querySelector(this.s.selectWithin).querySelectorAll(this.s.selector):this.items=this.el.querySelectorAll(this.s.selector):this.items=this.el.children,this.___slide="",this.outer="",this.init(),this}var l=t(e),i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var l in s)Object.prototype.hasOwnProperty.call(s,l)&&(e[l]=s[l])}return e};!function(){function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var s=document.createEvent("CustomEvent");return s.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),s}if("function"==typeof window.CustomEvent)return!1;e.prototype=window.Event.prototype,window.CustomEvent=e}(),window.utils=l.default,window.lgData={uid:0},window.lgModules={};var o={mode:"lg-slide",cssEasing:"ease",easing:"linear",speed:600,height:"100%",width:"100%",addClass:"",startClass:"lg-start-zoom",backdropDuration:150,hideBarsDelay:6e3,useLeft:!1,ariaLabelledby:"",ariaDescribedby:"",closable:!0,loop:!0,escKey:!0,keyPress:!0,controls:!0,slideEndAnimatoin:!0,hideControlOnEnd:!1,mousewheel:!1,getCaptionFromTitleOrAlt:!0,appendSubHtmlTo:".lg-sub-html",subHtmlSelectorRelative:!1,preload:1,showAfterLoad:!0,selector:"",selectWithin:"",nextHtml:"",prevHtml:"",index:!1,iframeMaxWidth:"100%",download:!0,counter:!0,appendCounterTo:".lg-toolbar",swipeThreshold:50,enableSwipe:!0,enableDrag:!0,dynamic:!1,dynamicEl:[],galleryId:1,supportLegacyBrowser:!0};s.prototype.init=function(){var e=this;e.s.preload>e.items.length&&(e.s.preload=e.items.length);var t=window.location.hash;if(t.indexOf("lg="+this.s.galleryId)>0&&(e.index=parseInt(t.split("&slide=")[1],10),l.default.addClass(document.body,"lg-from-hash"),l.default.hasClass(document.body,"lg-on")||(l.default.addClass(document.body,"lg-on"),setTimeout(function(){e.build(e.index)}))),e.s.dynamic)l.default.trigger(this.el,"onBeforeOpen"),e.index=e.s.index||0,l.default.hasClass(document.body,"lg-on")||(l.default.addClass(document.body,"lg-on"),setTimeout(function(){e.build(e.index)}));else for(var s=0;s<e.items.length;s++)!function(t){l.default.on(e.items[t],"click.lgcustom",function(s){s.preventDefault(),l.default.trigger(e.el,"onBeforeOpen"),e.index=e.s.index||t,l.default.hasClass(document.body,"lg-on")||(e.build(e.index),l.default.addClass(document.body,"lg-on"))})}(s)},s.prototype.build=function(e){var t=this;t.structure();for(var s in window.lgModules)t.modules[s]=new window.lgModules[s](t.el);if(t.slide(e,!1,!1),t.s.keyPress&&t.keyPress(),t.items.length>1&&(t.arrow(),setTimeout(function(){t.enableDrag(),t.enableSwipe()},50),t.s.mousewheel&&t.mousewheel()),t.counter(),t.closeGallery(),l.default.trigger(t.el,"onAfterOpen"),t.s.hideBarsDelay>0){var i=setTimeout(function(){l.default.addClass(t.outer,"lg-hide-items")},t.s.hideBarsDelay);l.default.on(t.outer,"mousemove.lg click.lg touchstart.lg",function(){clearTimeout(i),l.default.removeClass(t.outer,"lg-hide-items"),clearTimeout(t.hideBartimeout),t.hideBartimeout=setTimeout(function(){l.default.addClass(t.outer,"lg-hide-items")},t.s.hideBarsDelay)})}},s.prototype.structure=function(){var e="",t="",s=0,i="",o,r=this;for(document.body.insertAdjacentHTML("beforeend",'<div class="lg-backdrop"></div>'),l.default.setVendor(document.querySelector(".lg-backdrop"),"TransitionDuration",this.s.backdropDuration+"ms"),s=0;s<this.items.length;s++)e+='<div class="lg-item"></div>';if(this.s.controls&&this.items.length>1&&(t='<div class="lg-actions"><button type="button" aria-label="Previous slide" class="lg-prev lg-icon">'+this.s.prevHtml+'</button><button type="button" aria-label="Next slide" class="lg-next lg-icon">'+this.s.nextHtml+"</button></div>"),".lg-sub-html"===this.s.appendSubHtmlTo&&(i='<div role="status" aria-live="polite" class="lg-sub-html"></div>'),o='<div tabindex="-1" aria-modal="true" '+(this.s.ariaLabelledby?'aria-labelledby="'+this.s.ariaLabelledby+'"':"")+" "+(this.s.ariaDescribedby?'aria-describedby="'+this.s.ariaDescribedby+'"':"")+' role="dialog" class="lg-outer '+this.s.addClass+" "+this.s.startClass+'"><div class="lg" style="width:'+this.s.width+"; height:"+this.s.height+'"><div class="lg-inner">'+e+'</div><div class="lg-toolbar lg-group"><button type="button" aria-label="Close gallery" class="lg-close lg-icon"></button></div>'+t+i+"</div></div>",document.body.insertAdjacentHTML("beforeend",o),this.outer=document.querySelector(".lg-outer"),this.outer.focus(),this.___slide=this.outer.querySelectorAll(".lg-item"),this.s.useLeft?(l.default.addClass(this.outer,"lg-use-left"),this.s.mode="lg-slide"):l.default.addClass(this.outer,"lg-use-css3"),r.setTop(),l.default.on(window,"resize.lg orientationchange.lg",function(){setTimeout(function(){r.setTop()},100)}),l.default.addClass(this.___slide[this.index],"lg-current"),this.doCss()?l.default.addClass(this.outer,"lg-css3"):(l.default.addClass(this.outer,"lg-css"),this.s.speed=0),l.default.addClass(this.outer,this.s.mode),this.s.enableDrag&&this.items.length>1&&l.default.addClass(this.outer,"lg-grab"),this.s.showAfterLoad&&l.default.addClass(this.outer,"lg-show-after-load"),this.doCss()){var a=this.outer.querySelector(".lg-inner");l.default.setVendor(a,"TransitionTimingFunction",this.s.cssEasing),l.default.setVendor(a,"TransitionDuration",this.s.speed+"ms")}setTimeout(function(){l.default.addClass(document.querySelector(".lg-backdrop"),"in")}),setTimeout(function(){l.default.addClass(r.outer,"lg-visible")},this.s.backdropDuration),this.s.download&&this.outer.querySelector(".lg-toolbar").insertAdjacentHTML("beforeend",'<a id="lg-download" aria-label="Download" target="_blank" download class="lg-download lg-icon"></a>'),this.prevScrollTop=document.documentElement.scrollTop||document.body.scrollTop},s.prototype.setTop=function(){if("100%"!==this.s.height){var e=window.innerHeight,t=(e-parseInt(this.s.height,10))/2,s=this.outer.querySelector(".lg");e>=parseInt(this.s.height,10)?s.style.top=t+"px":s.style.top="0px"}},s.prototype.doCss=function(){return!!function e(){var t=["transition","MozTransition","WebkitTransition","OTransition","msTransition","KhtmlTransition"],s=document.documentElement,l=0;for(l=0;l<t.length;l++)if(t[l]in s.style)return!0}()},s.prototype.isVideo=function(e,t){var s;if(s=this.s.dynamic?this.s.dynamicEl[t].html:this.items[t].getAttribute("data-html"),!e&&s)return{html5:!0};var l=e.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com|be-nocookie\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)/i),i=e.match(/\/\/(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?([0-9a-z\-_]+)/i),o=e.match(/\/\/(?:www\.)?dai.ly\/([0-9a-z\-_]+)/i),r=e.match(/\/\/(?:www\.)?(?:vk\.com|vkontakte\.ru)\/(?:video_ext\.php\?)(.*)/i);return l?{youtube:l}:i?{vimeo:i}:o?{dailymotion:o}:r?{vk:r}:void 0},s.prototype.counter=function(){this.s.counter&&this.outer.querySelector(this.s.appendCounterTo).insertAdjacentHTML("beforeend",'<div id="lg-counter" role="status" aria-live="polite"><span id="lg-counter-current">'+(parseInt(this.index,10)+1)+'</span> / <span id="lg-counter-all">'+this.items.length+"</span></div>")},s.prototype.addHtml=function(e){var t=null,s;if(this.s.dynamic?t=this.s.dynamicEl[e].subHtml:(s=this.items[e],t=s.getAttribute("data-sub-html"),this.s.getCaptionFromTitleOrAlt&&!t&&(t=s.getAttribute("title"))&&s.querySelector("img")&&(t=s.querySelector("img").getAttribute("alt"))),void 0!==t&&null!==t){var i=t.substring(0,1);"."!==i&&"#"!==i||(t=this.s.subHtmlSelectorRelative&&!this.s.dynamic?s.querySelector(t).innerHTML:document.querySelector(t).innerHTML)}else t="";".lg-sub-html"===this.s.appendSubHtmlTo?this.outer.querySelector(this.s.appendSubHtmlTo).innerHTML=t:this.___slide[e].insertAdjacentHTML("beforeend",t),void 0!==t&&null!==t&&(""===t?l.default.addClass(this.outer.querySelector(this.s.appendSubHtmlTo),"lg-empty-html"):l.default.removeClass(this.outer.querySelector(this.s.appendSubHtmlTo),"lg-empty-html")),l.default.trigger(this.el,"onAfterAppendSubHtml",{index:e})},s.prototype.preload=function(e){var t=1,s=1;for(t=1;t<=this.s.preload&&!(t>=this.items.length-e);t++)this.loadContent(e+t,!1,0);for(s=1;s<=this.s.preload&&!(e-s<0);s++)this.loadContent(e-s,!1,0)},s.prototype.loadContent=function(e,t,s){var i=this,o=!1,r,a,d,n,u,c,g,f=function e(t){for(var s=[],l=[],i=0;i<t.length;i++){var o=t[i].split(" ");""===o[0]&&o.splice(0,1),l.push(o[0]),s.push(o[1])}for(var r=window.innerWidth,d=0;d<s.length;d++)if(parseInt(s[d],10)>r){a=l[d];break}};if(i.s.dynamic){if(i.s.dynamicEl[e].poster&&(o=!0,d=i.s.dynamicEl[e].poster),c=i.s.dynamicEl[e].html,a=i.s.dynamicEl[e].src,g=i.s.dynamicEl[e].alt,i.s.dynamicEl[e].responsive){f(i.s.dynamicEl[e].responsive.split(","))}n=i.s.dynamicEl[e].srcset,u=i.s.dynamicEl[e].sizes}else{if(i.items[e].getAttribute("data-poster")&&(o=!0,d=i.items[e].getAttribute("data-poster")),c=i.items[e].getAttribute("data-html"),a=i.items[e].getAttribute("href")||i.items[e].getAttribute("data-src"),g=i.items[e].getAttribute("title"),i.items[e].querySelector("img")&&(g=g||i.items[e].querySelector("img").getAttribute("alt")),i.items[e].getAttribute("data-responsive")){f(i.items[e].getAttribute("data-responsive").split(","))}n=i.items[e].getAttribute("data-srcset"),u=i.items[e].getAttribute("data-sizes")}var h=!1;i.s.dynamic?i.s.dynamicEl[e].iframe&&(h=!0):"true"===i.items[e].getAttribute("data-iframe")&&(h=!0);var m=i.isVideo(a,e);if(!l.default.hasClass(i.___slide[e],"lg-loaded")){if(h)i.___slide[e].insertAdjacentHTML("afterbegin",'<div class="lg-video-cont" style="max-width:'+i.s.iframeMaxWidth+'"><div class="lg-video"><iframe class="lg-object" frameborder="0" src="'+a+'"  allowfullscreen="true"></iframe></div></div>');else if(o){var p="";p=m&&m.youtube?"lg-has-youtube":m&&m.vimeo?"lg-has-vimeo":"lg-has-html5",i.___slide[e].insertAdjacentHTML("beforeend",'<div class="lg-video-cont '+p+' "><div class="lg-video"><span class="lg-video-play"></span><img class="lg-object lg-has-poster" src="'+d+'" /></div></div>')}else m?(i.___slide[e].insertAdjacentHTML("beforeend",'<div class="lg-video-cont "><div class="lg-video"></div></div>'),l.default.trigger(i.el,"hasVideo",{index:e,src:a,html:c})):(g=g?'alt="'+g+'"':"",i.___slide[e].insertAdjacentHTML("beforeend",'<div class="lg-img-wrap"><img class="lg-object lg-image" '+g+' src="'+a+'" /></div>'));if(l.default.trigger(i.el,"onAferAppendSlide",{index:e}),r=i.___slide[e].querySelector(".lg-object"),u&&r.setAttribute("sizes",u),n&&(r.setAttribute("srcset",n),this.s.supportLegacyBrowser))try{picturefill({elements:[r[0]]})}catch(e){console.warn("If you want srcset to be supported for older browsers, please include picturefil javascript library in your document.")}".lg-sub-html"!==this.s.appendSubHtmlTo&&i.addHtml(e),l.default.addClass(i.___slide[e],"lg-loaded")}l.default.on(i.___slide[e].querySelector(".lg-object"),"load.lg error.lg",function(){var t=0;s&&!l.default.hasClass(document.body,"lg-from-hash")&&(t=s),setTimeout(function(){l.default.addClass(i.___slide[e],"lg-complete"),l.default.trigger(i.el,"onSlideItemLoad",{index:e,delay:s||0})},t)}),m&&m.html5&&!o&&l.default.addClass(i.___slide[e],"lg-complete"),!0===t&&(l.default.hasClass(i.___slide[e],"lg-complete")?i.preload(e):l.default.on(i.___slide[e].querySelector(".lg-object"),"load.lg error.lg",function(){i.preload(e)}))},s.prototype.slide=function(e,t,s){for(var i=0,o=0;o<this.___slide.length;o++)if(l.default.hasClass(this.___slide[o],"lg-current")){i=o;break}var r=this;if(!r.lGalleryOn||i!==e){var a=this.___slide.length,d=r.lGalleryOn?this.s.speed:0,n=!1,u=!1;if(!r.lgBusy){if(this.s.download){var c;c=r.s.dynamic?!1!==r.s.dynamicEl[e].downloadUrl&&(r.s.dynamicEl[e].downloadUrl||r.s.dynamicEl[e].src):"false"!==r.items[e].getAttribute("data-download-url")&&(r.items[e].getAttribute("data-download-url")||r.items[e].getAttribute("href")||r.items[e].getAttribute("data-src")),c?(document.getElementById("lg-download").setAttribute("href",c),l.default.removeClass(r.outer,"lg-hide-download")):l.default.addClass(r.outer,"lg-hide-download")}if(l.default.trigger(r.el,"onBeforeSlide",{prevIndex:i,index:e,fromTouch:t,fromThumb:s}),r.lgBusy=!0,clearTimeout(r.hideBartimeout),".lg-sub-html"===this.s.appendSubHtmlTo&&setTimeout(function(){r.addHtml(e)},d),this.arrowDisable(e),t){var g=e-1,f=e+1;0===e&&i===a-1?(f=0,g=a-1):e===a-1&&0===i&&(f=0,g=a-1),l.default.removeClass(r.outer.querySelector(".lg-prev-slide"),"lg-prev-slide"),l.default.removeClass(r.outer.querySelector(".lg-current"),"lg-current"),l.default.removeClass(r.outer.querySelector(".lg-next-slide"),"lg-next-slide"),l.default.addClass(r.___slide[g],"lg-prev-slide"),l.default.addClass(r.___slide[f],"lg-next-slide"),l.default.addClass(r.___slide[e],"lg-current")}else{l.default.addClass(r.outer,"lg-no-trans");for(var h=0;h<this.___slide.length;h++)l.default.removeClass(this.___slide[h],"lg-prev-slide"),l.default.removeClass(this.___slide[h],"lg-next-slide");e<i?(u=!0,0!==e||i!==a-1||s||(u=!1,n=!0)):e>i&&(n=!0,e!==a-1||0!==i||s||(u=!0,n=!1)),u?(l.default.addClass(this.___slide[e],"lg-prev-slide"),l.default.addClass(this.___slide[i],"lg-next-slide")):n&&(l.default.addClass(this.___slide[e],"lg-next-slide"),l.default.addClass(this.___slide[i],"lg-prev-slide")),setTimeout(function(){l.default.removeClass(r.outer.querySelector(".lg-current"),"lg-current"),l.default.addClass(r.___slide[e],"lg-current"),l.default.removeClass(r.outer,"lg-no-trans")},50)}r.lGalleryOn?(setTimeout(function(){r.loadContent(e,!0,0)},this.s.speed+50),setTimeout(function(){r.lgBusy=!1,l.default.trigger(r.el,"onAfterSlide",{prevIndex:i,index:e,fromTouch:t,fromThumb:s})},this.s.speed)):(r.loadContent(e,!0,r.s.backdropDuration),r.lgBusy=!1,l.default.trigger(r.el,"onAfterSlide",{prevIndex:i,index:e,fromTouch:t,fromThumb:s})),r.lGalleryOn=!0,this.s.counter&&document.getElementById("lg-counter-current")&&(document.getElementById("lg-counter-current").innerHTML=e+1)}}},s.prototype.goToNextSlide=function(e){var t=this;t.lgBusy||(t.index+1<t.___slide.length?(t.index++,l.default.trigger(t.el,"onBeforeNextSlide",{index:t.index}),t.slide(t.index,e,!1)):t.s.loop?(t.index=0,l.default.trigger(t.el,"onBeforeNextSlide",{index:t.index}),t.slide(t.index,e,!1)):t.s.slideEndAnimatoin&&(l.default.addClass(t.outer,"lg-right-end"),setTimeout(function(){l.default.removeClass(t.outer,"lg-right-end")},400)))},s.prototype.goToPrevSlide=function(e){var t=this;t.lgBusy||(t.index>0?(t.index--,l.default.trigger(t.el,"onBeforePrevSlide",{index:t.index,fromTouch:e}),t.slide(t.index,e,!1)):t.s.loop?(t.index=t.items.length-1,l.default.trigger(t.el,"onBeforePrevSlide",{index:t.index,fromTouch:e}),t.slide(t.index,e,!1)):t.s.slideEndAnimatoin&&(l.default.addClass(t.outer,"lg-left-end"),setTimeout(function(){l.default.removeClass(t.outer,"lg-left-end")},400)))},s.prototype.keyPress=function(){var e=this;this.items.length>1&&l.default.on(window,"keyup.lg",function(t){e.items.length>1&&(37===t.keyCode&&(t.preventDefault(),e.goToPrevSlide()),39===t.keyCode&&(t.preventDefault(),e.goToNextSlide()))}),l.default.on(window,"keydown.lg",function(t){!0===e.s.escKey&&27===t.keyCode&&(t.preventDefault(),l.default.hasClass(e.outer,"lg-thumb-open")?l.default.removeClass(e.outer,"lg-thumb-open"):e.destroy())})},s.prototype.arrow=function(){var e=this;l.default.on(this.outer.querySelector(".lg-prev"),"click.lg",function(){e.goToPrevSlide()}),l.default.on(this.outer.querySelector(".lg-next"),"click.lg",function(){e.goToNextSlide()})},s.prototype.arrowDisable=function(e){if(!this.s.loop&&this.s.hideControlOnEnd){var t=this.outer.querySelector(".lg-next"),s=this.outer.querySelector(".lg-prev");e+1<this.___slide.length?(t.removeAttribute("disabled"),l.default.removeClass(t,"disabled")):(t.setAttribute("disabled","disabled"),l.default.addClass(t,"disabled")),e>0?(s.removeAttribute("disabled"),l.default.removeClass(s,"disabled")):(s.setAttribute("disabled","disabled"),l.default.addClass(s,"disabled"))}},s.prototype.setTranslate=function(e,t,s){this.s.useLeft?e.style.left=t:l.default.setVendor(e,"Transform","translate3d("+t+"px, "+s+"px, 0px)")},s.prototype.touchMove=function(e,t){var s=t-e;Math.abs(s)>15&&(l.default.addClass(this.outer,"lg-dragging"),this.setTranslate(this.___slide[this.index],s,0),this.setTranslate(document.querySelector(".lg-prev-slide"),-this.___slide[this.index].clientWidth+s,0),this.setTranslate(document.querySelector(".lg-next-slide"),this.___slide[this.index].clientWidth+s,0))},s.prototype.touchEnd=function(e){var t=this;"lg-slide"!==t.s.mode&&l.default.addClass(t.outer,"lg-slide");for(var s=0;s<this.___slide.length;s++)l.default.hasClass(this.___slide[s],"lg-current")||l.default.hasClass(this.___slide[s],"lg-prev-slide")||l.default.hasClass(this.___slide[s],"lg-next-slide")||(this.___slide[s].style.opacity="0");setTimeout(function(){l.default.removeClass(t.outer,"lg-dragging"),e<0&&Math.abs(e)>t.s.swipeThreshold?t.goToNextSlide(!0):e>0&&Math.abs(e)>t.s.swipeThreshold?t.goToPrevSlide(!0):Math.abs(e)<5&&l.default.trigger(t.el,"onSlideClick");for(var s=0;s<t.___slide.length;s++)t.___slide[s].removeAttribute("style")}),setTimeout(function(){l.default.hasClass(t.outer,"lg-dragging")||"lg-slide"===t.s.mode||l.default.removeClass(t.outer,"lg-slide")},t.s.speed+100)},s.prototype.enableSwipe=function(){var e=this,t=0,s=0,i=!1;if(e.s.enableSwipe&&e.isTouch&&e.doCss()){for(var o=0;o<e.___slide.length;o++)l.default.on(e.___slide[o],"touchstart.lg",function(s){l.default.hasClass(e.outer,"lg-zoomed")||e.lgBusy||(s.preventDefault(),e.manageSwipeClass(),t=s.targetTouches[0].pageX)});for(var r=0;r<e.___slide.length;r++)l.default.on(e.___slide[r],"touchmove.lg",function(o){l.default.hasClass(e.outer,"lg-zoomed")||(o.preventDefault(),s=o.targetTouches[0].pageX,e.touchMove(t,s),i=!0)});for(var a=0;a<e.___slide.length;a++)l.default.on(e.___slide[a],"touchend.lg",function(){l.default.hasClass(e.outer,"lg-zoomed")||(i?(i=!1,e.touchEnd(s-t)):l.default.trigger(e.el,"onSlideClick"))})}},s.prototype.enableDrag=function(){var e=this,t=0,s=0,i=!1,o=!1;if(e.s.enableDrag&&!e.isTouch&&e.doCss()){for(var r=0;r<e.___slide.length;r++)l.default.on(e.___slide[r],"mousedown.lg",function(s){l.default.hasClass(e.outer,"lg-zoomed")||(l.default.hasClass(s.target,"lg-object")||l.default.hasClass(s.target,"lg-video-play"))&&(s.preventDefault(),e.lgBusy||(e.manageSwipeClass(),t=s.pageX,i=!0,e.outer.scrollLeft+=1,e.outer.scrollLeft-=1,l.default.removeClass(e.outer,"lg-grab"),l.default.addClass(e.outer,"lg-grabbing"),l.default.trigger(e.el,"onDragstart")))});l.default.on(window,"mousemove.lg",function(r){i&&(o=!0,s=r.pageX,e.touchMove(t,s),l.default.trigger(e.el,"onDragmove"))}),l.default.on(window,"mouseup.lg",function(r){o?(o=!1,e.touchEnd(s-t),l.default.trigger(e.el,"onDragend")):(l.default.hasClass(r.target,"lg-object")||l.default.hasClass(r.target,"lg-video-play"))&&l.default.trigger(e.el,"onSlideClick"),i&&(i=!1,l.default.removeClass(e.outer,"lg-grabbing"),l.default.addClass(e.outer,"lg-grab"))})}},s.prototype.manageSwipeClass=function(){var e=this.index+1,t=this.index-1,s=this.___slide.length;this.s.loop&&(0===this.index?t=s-1:this.index===s-1&&(e=0));for(var i=0;i<this.___slide.length;i++)l.default.removeClass(this.___slide[i],"lg-next-slide"),l.default.removeClass(this.___slide[i],"lg-prev-slide");t>-1&&l.default.addClass(this.___slide[t],"lg-prev-slide"),l.default.addClass(this.___slide[e],"lg-next-slide")},s.prototype.mousewheel=function(){var e=this;l.default.on(e.outer,"mousewheel.lg",function(t){t.deltaY&&(t.deltaY>0?e.goToPrevSlide():e.goToNextSlide(),t.preventDefault())})},s.prototype.closeGallery=function(){var e=this,t=!1;l.default.on(this.outer.querySelector(".lg-close"),"click.lg",function(){e.destroy()}),e.s.closable&&(l.default.on(e.outer,"mousedown.lg",function(e){t=!!(l.default.hasClass(e.target,"lg-outer")||l.default.hasClass(e.target,"lg-item")||l.default.hasClass(e.target,"lg-img-wrap"))}),l.default.on(e.outer,"mouseup.lg",function(s){(l.default.hasClass(s.target,"lg-outer")||l.default.hasClass(s.target,"lg-item")||l.default.hasClass(s.target,"lg-img-wrap")&&t)&&(l.default.hasClass(e.outer,"lg-dragging")||e.destroy())}))},s.prototype.destroy=function(e){var t=this;if(e||l.default.trigger(t.el,"onBeforeClose"),document.body.scrollTop=t.prevScrollTop,document.documentElement.scrollTop=t.prevScrollTop,e){if(!t.s.dynamic)for(var s=0;s<this.items.length;s++)l.default.off(this.items[s],".lg"),l.default.off(this.items[s],".lgcustom");var i=t.el.getAttribute("lg-uid");delete window.lgData[i],t.el.removeAttribute("lg-uid")}l.default.off(this.el,".lgtm");for(var o in window.lgModules)t.modules[o]&&t.modules[o].destroy(e);this.lGalleryOn=!1,clearTimeout(t.hideBartimeout),this.hideBartimeout=!1,l.default.off(window,".lg"),l.default.removeClass(document.body,"lg-on"),l.default.removeClass(document.body,"lg-from-hash"),t.outer&&l.default.removeClass(t.outer,"lg-visible"),l.default.removeClass(document.querySelector(".lg-backdrop"),"in"),setTimeout(function(){try{t.outer&&t.outer.parentNode.removeChild(t.outer),document.querySelector(".lg-backdrop")&&document.querySelector(".lg-backdrop").parentNode.removeChild(document.querySelector(".lg-backdrop")),e||l.default.trigger(t.el,"onCloseAfter"),t.el.focus()}catch(e){}},t.s.backdropDuration+50)},window.lightGallery=function(e,t){if(e)try{if(e.getAttribute("lg-uid"))window.lgData[e.getAttribute("lg-uid")].init();else{var l="lg"+window.lgData.uid++;window.lgData[l]=new s(e,t),e.setAttribute("lg-uid",l)}}catch(e){console.error("lightGallery has not initiated properly",e)}}})},{"./lg-utils":1}]},{},[2])(2)});;
/*
 Copyright (C) Federico Zivolo 2020
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */(function(e,t){'object'==typeof exports&&'undefined'!=typeof module?module.exports=t():'function'==typeof define&&define.amd?define(t):e.Popper=t()})(this,function(){'use strict';function e(e){return e&&'[object Function]'==={}.toString.call(e)}function t(e,t){if(1!==e.nodeType)return[];var o=e.ownerDocument.defaultView,n=o.getComputedStyle(e,null);return t?n[t]:n}function o(e){return'HTML'===e.nodeName?e:e.parentNode||e.host}function n(e){if(!e)return document.body;switch(e.nodeName){case'HTML':case'BODY':return e.ownerDocument.body;case'#document':return e.body;}var i=t(e),r=i.overflow,p=i.overflowX,s=i.overflowY;return /(auto|scroll|overlay)/.test(r+s+p)?e:n(o(e))}function i(e){return e&&e.referenceNode?e.referenceNode:e}function r(e){return 11===e?re:10===e?pe:re||pe}function p(e){if(!e)return document.documentElement;for(var o=r(10)?document.body:null,n=e.offsetParent||null;n===o&&e.nextElementSibling;)n=(e=e.nextElementSibling).offsetParent;var i=n&&n.nodeName;return i&&'BODY'!==i&&'HTML'!==i?-1!==['TH','TD','TABLE'].indexOf(n.nodeName)&&'static'===t(n,'position')?p(n):n:e?e.ownerDocument.documentElement:document.documentElement}function s(e){var t=e.nodeName;return'BODY'!==t&&('HTML'===t||p(e.firstElementChild)===e)}function d(e){return null===e.parentNode?e:d(e.parentNode)}function a(e,t){if(!e||!e.nodeType||!t||!t.nodeType)return document.documentElement;var o=e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING,n=o?e:t,i=o?t:e,r=document.createRange();r.setStart(n,0),r.setEnd(i,0);var l=r.commonAncestorContainer;if(e!==l&&t!==l||n.contains(i))return s(l)?l:p(l);var f=d(e);return f.host?a(f.host,t):a(e,d(t).host)}function l(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:'top',o='top'===t?'scrollTop':'scrollLeft',n=e.nodeName;if('BODY'===n||'HTML'===n){var i=e.ownerDocument.documentElement,r=e.ownerDocument.scrollingElement||i;return r[o]}return e[o]}function f(e,t){var o=2<arguments.length&&void 0!==arguments[2]&&arguments[2],n=l(t,'top'),i=l(t,'left'),r=o?-1:1;return e.top+=n*r,e.bottom+=n*r,e.left+=i*r,e.right+=i*r,e}function m(e,t){var o='x'===t?'Left':'Top',n='Left'==o?'Right':'Bottom';return parseFloat(e['border'+o+'Width'])+parseFloat(e['border'+n+'Width'])}function h(e,t,o,n){return ee(t['offset'+e],t['scroll'+e],o['client'+e],o['offset'+e],o['scroll'+e],r(10)?parseInt(o['offset'+e])+parseInt(n['margin'+('Height'===e?'Top':'Left')])+parseInt(n['margin'+('Height'===e?'Bottom':'Right')]):0)}function c(e){var t=e.body,o=e.documentElement,n=r(10)&&getComputedStyle(o);return{height:h('Height',t,o,n),width:h('Width',t,o,n)}}function g(e){return le({},e,{right:e.left+e.width,bottom:e.top+e.height})}function u(e){var o={};try{if(r(10)){o=e.getBoundingClientRect();var n=l(e,'top'),i=l(e,'left');o.top+=n,o.left+=i,o.bottom+=n,o.right+=i}else o=e.getBoundingClientRect()}catch(t){}var p={left:o.left,top:o.top,width:o.right-o.left,height:o.bottom-o.top},s='HTML'===e.nodeName?c(e.ownerDocument):{},d=s.width||e.clientWidth||p.width,a=s.height||e.clientHeight||p.height,f=e.offsetWidth-d,h=e.offsetHeight-a;if(f||h){var u=t(e);f-=m(u,'x'),h-=m(u,'y'),p.width-=f,p.height-=h}return g(p)}function b(e,o){var i=2<arguments.length&&void 0!==arguments[2]&&arguments[2],p=r(10),s='HTML'===o.nodeName,d=u(e),a=u(o),l=n(e),m=t(o),h=parseFloat(m.borderTopWidth),c=parseFloat(m.borderLeftWidth);i&&s&&(a.top=ee(a.top,0),a.left=ee(a.left,0));var b=g({top:d.top-a.top-h,left:d.left-a.left-c,width:d.width,height:d.height});if(b.marginTop=0,b.marginLeft=0,!p&&s){var w=parseFloat(m.marginTop),y=parseFloat(m.marginLeft);b.top-=h-w,b.bottom-=h-w,b.left-=c-y,b.right-=c-y,b.marginTop=w,b.marginLeft=y}return(p&&!i?o.contains(l):o===l&&'BODY'!==l.nodeName)&&(b=f(b,o)),b}function w(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=e.ownerDocument.documentElement,n=b(e,o),i=ee(o.clientWidth,window.innerWidth||0),r=ee(o.clientHeight,window.innerHeight||0),p=t?0:l(o),s=t?0:l(o,'left'),d={top:p-n.top+n.marginTop,left:s-n.left+n.marginLeft,width:i,height:r};return g(d)}function y(e){var n=e.nodeName;if('BODY'===n||'HTML'===n)return!1;if('fixed'===t(e,'position'))return!0;var i=o(e);return!!i&&y(i)}function E(e){if(!e||!e.parentElement||r())return document.documentElement;for(var o=e.parentElement;o&&'none'===t(o,'transform');)o=o.parentElement;return o||document.documentElement}function v(e,t,r,p){var s=4<arguments.length&&void 0!==arguments[4]&&arguments[4],d={top:0,left:0},l=s?E(e):a(e,i(t));if('viewport'===p)d=w(l,s);else{var f;'scrollParent'===p?(f=n(o(t)),'BODY'===f.nodeName&&(f=e.ownerDocument.documentElement)):'window'===p?f=e.ownerDocument.documentElement:f=p;var m=b(f,l,s);if('HTML'===f.nodeName&&!y(l)){var h=c(e.ownerDocument),g=h.height,u=h.width;d.top+=m.top-m.marginTop,d.bottom=g+m.top,d.left+=m.left-m.marginLeft,d.right=u+m.left}else d=m}r=r||0;var v='number'==typeof r;return d.left+=v?r:r.left||0,d.top+=v?r:r.top||0,d.right-=v?r:r.right||0,d.bottom-=v?r:r.bottom||0,d}function x(e){var t=e.width,o=e.height;return t*o}function O(e,t,o,n,i){var r=5<arguments.length&&void 0!==arguments[5]?arguments[5]:0;if(-1===e.indexOf('auto'))return e;var p=v(o,n,r,i),s={top:{width:p.width,height:t.top-p.top},right:{width:p.right-t.right,height:p.height},bottom:{width:p.width,height:p.bottom-t.bottom},left:{width:t.left-p.left,height:p.height}},d=Object.keys(s).map(function(e){return le({key:e},s[e],{area:x(s[e])})}).sort(function(e,t){return t.area-e.area}),a=d.filter(function(e){var t=e.width,n=e.height;return t>=o.clientWidth&&n>=o.clientHeight}),l=0<a.length?a[0].key:d[0].key,f=e.split('-')[1];return l+(f?'-'+f:'')}function L(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,r=n?E(t):a(t,i(o));return b(o,r,n)}function S(e){var t=e.ownerDocument.defaultView,o=t.getComputedStyle(e),n=parseFloat(o.marginTop||0)+parseFloat(o.marginBottom||0),i=parseFloat(o.marginLeft||0)+parseFloat(o.marginRight||0),r={width:e.offsetWidth+i,height:e.offsetHeight+n};return r}function T(e){var t={left:'right',right:'left',bottom:'top',top:'bottom'};return e.replace(/left|right|bottom|top/g,function(e){return t[e]})}function C(e,t,o){o=o.split('-')[0];var n=S(e),i={width:n.width,height:n.height},r=-1!==['right','left'].indexOf(o),p=r?'top':'left',s=r?'left':'top',d=r?'height':'width',a=r?'width':'height';return i[p]=t[p]+t[d]/2-n[d]/2,i[s]=o===s?t[s]-n[a]:t[T(s)],i}function D(e,t){return Array.prototype.find?e.find(t):e.filter(t)[0]}function N(e,t,o){if(Array.prototype.findIndex)return e.findIndex(function(e){return e[t]===o});var n=D(e,function(e){return e[t]===o});return e.indexOf(n)}function P(t,o,n){var i=void 0===n?t:t.slice(0,N(t,'name',n));return i.forEach(function(t){t['function']&&console.warn('`modifier.function` is deprecated, use `modifier.fn`!');var n=t['function']||t.fn;t.enabled&&e(n)&&(o.offsets.popper=g(o.offsets.popper),o.offsets.reference=g(o.offsets.reference),o=n(o,t))}),o}function k(){if(!this.state.isDestroyed){var e={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};e.offsets.reference=L(this.state,this.popper,this.reference,this.options.positionFixed),e.placement=O(this.options.placement,e.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),e.originalPlacement=e.placement,e.positionFixed=this.options.positionFixed,e.offsets.popper=C(this.popper,e.offsets.reference,e.placement),e.offsets.popper.position=this.options.positionFixed?'fixed':'absolute',e=P(this.modifiers,e),this.state.isCreated?this.options.onUpdate(e):(this.state.isCreated=!0,this.options.onCreate(e))}}function W(e,t){return e.some(function(e){var o=e.name,n=e.enabled;return n&&o===t})}function B(e){for(var t=[!1,'ms','Webkit','Moz','O'],o=e.charAt(0).toUpperCase()+e.slice(1),n=0;n<t.length;n++){var i=t[n],r=i?''+i+o:e;if('undefined'!=typeof document.body.style[r])return r}return null}function H(){return this.state.isDestroyed=!0,W(this.modifiers,'applyStyle')&&(this.popper.removeAttribute('x-placement'),this.popper.style.position='',this.popper.style.top='',this.popper.style.left='',this.popper.style.right='',this.popper.style.bottom='',this.popper.style.willChange='',this.popper.style[B('transform')]=''),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function A(e){var t=e.ownerDocument;return t?t.defaultView:window}function M(e,t,o,i){var r='BODY'===e.nodeName,p=r?e.ownerDocument.defaultView:e;p.addEventListener(t,o,{passive:!0}),r||M(n(p.parentNode),t,o,i),i.push(p)}function F(e,t,o,i){o.updateBound=i,A(e).addEventListener('resize',o.updateBound,{passive:!0});var r=n(e);return M(r,'scroll',o.updateBound,o.scrollParents),o.scrollElement=r,o.eventsEnabled=!0,o}function I(){this.state.eventsEnabled||(this.state=F(this.reference,this.options,this.state,this.scheduleUpdate))}function R(e,t){return A(e).removeEventListener('resize',t.updateBound),t.scrollParents.forEach(function(e){e.removeEventListener('scroll',t.updateBound)}),t.updateBound=null,t.scrollParents=[],t.scrollElement=null,t.eventsEnabled=!1,t}function U(){this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=R(this.reference,this.state))}function Y(e){return''!==e&&!isNaN(parseFloat(e))&&isFinite(e)}function V(e,t){Object.keys(t).forEach(function(o){var n='';-1!==['width','height','top','right','bottom','left'].indexOf(o)&&Y(t[o])&&(n='px'),e.style[o]=t[o]+n})}function j(e,t){Object.keys(t).forEach(function(o){var n=t[o];!1===n?e.removeAttribute(o):e.setAttribute(o,t[o])})}function q(e,t){var o=e.offsets,n=o.popper,i=o.reference,r=$,p=function(e){return e},s=r(i.width),d=r(n.width),a=-1!==['left','right'].indexOf(e.placement),l=-1!==e.placement.indexOf('-'),f=t?a||l||s%2==d%2?r:Z:p,m=t?r:p;return{left:f(1==s%2&&1==d%2&&!l&&t?n.left-1:n.left),top:m(n.top),bottom:m(n.bottom),right:f(n.right)}}function K(e,t,o){var n=D(e,function(e){var o=e.name;return o===t}),i=!!n&&e.some(function(e){return e.name===o&&e.enabled&&e.order<n.order});if(!i){var r='`'+t+'`';console.warn('`'+o+'`'+' modifier is required by '+r+' modifier in order to work, be sure to include it before '+r+'!')}return i}function z(e){return'end'===e?'start':'start'===e?'end':e}function G(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=he.indexOf(e),n=he.slice(o+1).concat(he.slice(0,o));return t?n.reverse():n}function _(e,t,o,n){var i=e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),r=+i[1],p=i[2];if(!r)return e;if(0===p.indexOf('%')){var s;switch(p){case'%p':s=o;break;case'%':case'%r':default:s=n;}var d=g(s);return d[t]/100*r}if('vh'===p||'vw'===p){var a;return a='vh'===p?ee(document.documentElement.clientHeight,window.innerHeight||0):ee(document.documentElement.clientWidth,window.innerWidth||0),a/100*r}return r}function X(e,t,o,n){var i=[0,0],r=-1!==['right','left'].indexOf(n),p=e.split(/(\+|\-)/).map(function(e){return e.trim()}),s=p.indexOf(D(p,function(e){return-1!==e.search(/,|\s/)}));p[s]&&-1===p[s].indexOf(',')&&console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');var d=/\s*,\s*|\s+/,a=-1===s?[p]:[p.slice(0,s).concat([p[s].split(d)[0]]),[p[s].split(d)[1]].concat(p.slice(s+1))];return a=a.map(function(e,n){var i=(1===n?!r:r)?'height':'width',p=!1;return e.reduce(function(e,t){return''===e[e.length-1]&&-1!==['+','-'].indexOf(t)?(e[e.length-1]=t,p=!0,e):p?(e[e.length-1]+=t,p=!1,e):e.concat(t)},[]).map(function(e){return _(e,i,t,o)})}),a.forEach(function(e,t){e.forEach(function(o,n){Y(o)&&(i[t]+=o*('-'===e[n-1]?-1:1))})}),i}function J(e,t){var o,n=t.offset,i=e.placement,r=e.offsets,p=r.popper,s=r.reference,d=i.split('-')[0];return o=Y(+n)?[+n,0]:X(n,p,s,d),'left'===d?(p.top+=o[0],p.left-=o[1]):'right'===d?(p.top+=o[0],p.left+=o[1]):'top'===d?(p.left+=o[0],p.top-=o[1]):'bottom'===d&&(p.left+=o[0],p.top+=o[1]),e.popper=p,e}var Q=Math.min,Z=Math.floor,$=Math.round,ee=Math.max,te='undefined'!=typeof window&&'undefined'!=typeof document&&'undefined'!=typeof navigator,oe=function(){for(var e=['Edge','Trident','Firefox'],t=0;t<e.length;t+=1)if(te&&0<=navigator.userAgent.indexOf(e[t]))return 1;return 0}(),ne=te&&window.Promise,ie=ne?function(e){var t=!1;return function(){t||(t=!0,window.Promise.resolve().then(function(){t=!1,e()}))}}:function(e){var t=!1;return function(){t||(t=!0,setTimeout(function(){t=!1,e()},oe))}},re=te&&!!(window.MSInputMethodContext&&document.documentMode),pe=te&&/MSIE 10/.test(navigator.userAgent),se=function(e,t){if(!(e instanceof t))throw new TypeError('Cannot call a class as a function')},de=function(){function e(e,t){for(var o,n=0;n<t.length;n++)o=t[n],o.enumerable=o.enumerable||!1,o.configurable=!0,'value'in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),ae=function(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e},le=Object.assign||function(e){for(var t,o=1;o<arguments.length;o++)for(var n in t=arguments[o],t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e},fe=te&&/Firefox/i.test(navigator.userAgent),me=['auto-start','auto','auto-end','top-start','top','top-end','right-start','right','right-end','bottom-end','bottom','bottom-start','left-end','left','left-start'],he=me.slice(3),ce={FLIP:'flip',CLOCKWISE:'clockwise',COUNTERCLOCKWISE:'counterclockwise'},ge=function(){function t(o,n){var i=this,r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};se(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(i.update)},this.update=ie(this.update.bind(this)),this.options=le({},t.Defaults,r),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=o&&o.jquery?o[0]:o,this.popper=n&&n.jquery?n[0]:n,this.options.modifiers={},Object.keys(le({},t.Defaults.modifiers,r.modifiers)).forEach(function(e){i.options.modifiers[e]=le({},t.Defaults.modifiers[e]||{},r.modifiers?r.modifiers[e]:{})}),this.modifiers=Object.keys(this.options.modifiers).map(function(e){return le({name:e},i.options.modifiers[e])}).sort(function(e,t){return e.order-t.order}),this.modifiers.forEach(function(t){t.enabled&&e(t.onLoad)&&t.onLoad(i.reference,i.popper,i.options,t,i.state)}),this.update();var p=this.options.eventsEnabled;p&&this.enableEventListeners(),this.state.eventsEnabled=p}return de(t,[{key:'update',value:function(){return k.call(this)}},{key:'destroy',value:function(){return H.call(this)}},{key:'enableEventListeners',value:function(){return I.call(this)}},{key:'disableEventListeners',value:function(){return U.call(this)}}]),t}();return ge.Utils=('undefined'==typeof window?global:window).PopperUtils,ge.placements=me,ge.Defaults={placement:'bottom',positionFixed:!1,eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:{shift:{order:100,enabled:!0,fn:function(e){var t=e.placement,o=t.split('-')[0],n=t.split('-')[1];if(n){var i=e.offsets,r=i.reference,p=i.popper,s=-1!==['bottom','top'].indexOf(o),d=s?'left':'top',a=s?'width':'height',l={start:ae({},d,r[d]),end:ae({},d,r[d]+r[a]-p[a])};e.offsets.popper=le({},p,l[n])}return e}},offset:{order:200,enabled:!0,fn:J,offset:0},preventOverflow:{order:300,enabled:!0,fn:function(e,t){var o=t.boundariesElement||p(e.instance.popper);e.instance.reference===o&&(o=p(o));var n=B('transform'),i=e.instance.popper.style,r=i.top,s=i.left,d=i[n];i.top='',i.left='',i[n]='';var a=v(e.instance.popper,e.instance.reference,t.padding,o,e.positionFixed);i.top=r,i.left=s,i[n]=d,t.boundaries=a;var l=t.priority,f=e.offsets.popper,m={primary:function(e){var o=f[e];return f[e]<a[e]&&!t.escapeWithReference&&(o=ee(f[e],a[e])),ae({},e,o)},secondary:function(e){var o='right'===e?'left':'top',n=f[o];return f[e]>a[e]&&!t.escapeWithReference&&(n=Q(f[o],a[e]-('right'===e?f.width:f.height))),ae({},o,n)}};return l.forEach(function(e){var t=-1===['left','top'].indexOf(e)?'secondary':'primary';f=le({},f,m[t](e))}),e.offsets.popper=f,e},priority:['left','right','top','bottom'],padding:5,boundariesElement:'scrollParent'},keepTogether:{order:400,enabled:!0,fn:function(e){var t=e.offsets,o=t.popper,n=t.reference,i=e.placement.split('-')[0],r=Z,p=-1!==['top','bottom'].indexOf(i),s=p?'right':'bottom',d=p?'left':'top',a=p?'width':'height';return o[s]<r(n[d])&&(e.offsets.popper[d]=r(n[d])-o[a]),o[d]>r(n[s])&&(e.offsets.popper[d]=r(n[s])),e}},arrow:{order:500,enabled:!0,fn:function(e,o){var n;if(!K(e.instance.modifiers,'arrow','keepTogether'))return e;var i=o.element;if('string'==typeof i){if(i=e.instance.popper.querySelector(i),!i)return e;}else if(!e.instance.popper.contains(i))return console.warn('WARNING: `arrow.element` must be child of its popper element!'),e;var r=e.placement.split('-')[0],p=e.offsets,s=p.popper,d=p.reference,a=-1!==['left','right'].indexOf(r),l=a?'height':'width',f=a?'Top':'Left',m=f.toLowerCase(),h=a?'left':'top',c=a?'bottom':'right',u=S(i)[l];d[c]-u<s[m]&&(e.offsets.popper[m]-=s[m]-(d[c]-u)),d[m]+u>s[c]&&(e.offsets.popper[m]+=d[m]+u-s[c]),e.offsets.popper=g(e.offsets.popper);var b=d[m]+d[l]/2-u/2,w=t(e.instance.popper),y=parseFloat(w['margin'+f]),E=parseFloat(w['border'+f+'Width']),v=b-e.offsets.popper[m]-y-E;return v=ee(Q(s[l]-u,v),0),e.arrowElement=i,e.offsets.arrow=(n={},ae(n,m,$(v)),ae(n,h,''),n),e},element:'[x-arrow]'},flip:{order:600,enabled:!0,fn:function(e,t){if(W(e.instance.modifiers,'inner'))return e;if(e.flipped&&e.placement===e.originalPlacement)return e;var o=v(e.instance.popper,e.instance.reference,t.padding,t.boundariesElement,e.positionFixed),n=e.placement.split('-')[0],i=T(n),r=e.placement.split('-')[1]||'',p=[];switch(t.behavior){case ce.FLIP:p=[n,i];break;case ce.CLOCKWISE:p=G(n);break;case ce.COUNTERCLOCKWISE:p=G(n,!0);break;default:p=t.behavior;}return p.forEach(function(s,d){if(n!==s||p.length===d+1)return e;n=e.placement.split('-')[0],i=T(n);var a=e.offsets.popper,l=e.offsets.reference,f=Z,m='left'===n&&f(a.right)>f(l.left)||'right'===n&&f(a.left)<f(l.right)||'top'===n&&f(a.bottom)>f(l.top)||'bottom'===n&&f(a.top)<f(l.bottom),h=f(a.left)<f(o.left),c=f(a.right)>f(o.right),g=f(a.top)<f(o.top),u=f(a.bottom)>f(o.bottom),b='left'===n&&h||'right'===n&&c||'top'===n&&g||'bottom'===n&&u,w=-1!==['top','bottom'].indexOf(n),y=!!t.flipVariations&&(w&&'start'===r&&h||w&&'end'===r&&c||!w&&'start'===r&&g||!w&&'end'===r&&u),E=!!t.flipVariationsByContent&&(w&&'start'===r&&c||w&&'end'===r&&h||!w&&'start'===r&&u||!w&&'end'===r&&g),v=y||E;(m||b||v)&&(e.flipped=!0,(m||b)&&(n=p[d+1]),v&&(r=z(r)),e.placement=n+(r?'-'+r:''),e.offsets.popper=le({},e.offsets.popper,C(e.instance.popper,e.offsets.reference,e.placement)),e=P(e.instance.modifiers,e,'flip'))}),e},behavior:'flip',padding:5,boundariesElement:'viewport',flipVariations:!1,flipVariationsByContent:!1},inner:{order:700,enabled:!1,fn:function(e){var t=e.placement,o=t.split('-')[0],n=e.offsets,i=n.popper,r=n.reference,p=-1!==['left','right'].indexOf(o),s=-1===['top','left'].indexOf(o);return i[p?'left':'top']=r[o]-(s?i[p?'width':'height']:0),e.placement=T(t),e.offsets.popper=g(i),e}},hide:{order:800,enabled:!0,fn:function(e){if(!K(e.instance.modifiers,'hide','preventOverflow'))return e;var t=e.offsets.reference,o=D(e.instance.modifiers,function(e){return'preventOverflow'===e.name}).boundaries;if(t.bottom<o.top||t.left>o.right||t.top>o.bottom||t.right<o.left){if(!0===e.hide)return e;e.hide=!0,e.attributes['x-out-of-boundaries']=''}else{if(!1===e.hide)return e;e.hide=!1,e.attributes['x-out-of-boundaries']=!1}return e}},computeStyle:{order:850,enabled:!0,fn:function(e,t){var o=t.x,n=t.y,i=e.offsets.popper,r=D(e.instance.modifiers,function(e){return'applyStyle'===e.name}).gpuAcceleration;void 0!==r&&console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');var s,d,a=void 0===r?t.gpuAcceleration:r,l=p(e.instance.popper),f=u(l),m={position:i.position},h=q(e,2>window.devicePixelRatio||!fe),c='bottom'===o?'top':'bottom',g='right'===n?'left':'right',b=B('transform');if(d='bottom'==c?'HTML'===l.nodeName?-l.clientHeight+h.bottom:-f.height+h.bottom:h.top,s='right'==g?'HTML'===l.nodeName?-l.clientWidth+h.right:-f.width+h.right:h.left,a&&b)m[b]='translate3d('+s+'px, '+d+'px, 0)',m[c]=0,m[g]=0,m.willChange='transform';else{var w='bottom'==c?-1:1,y='right'==g?-1:1;m[c]=d*w,m[g]=s*y,m.willChange=c+', '+g}var E={"x-placement":e.placement};return e.attributes=le({},E,e.attributes),e.styles=le({},m,e.styles),e.arrowStyles=le({},e.offsets.arrow,e.arrowStyles),e},gpuAcceleration:!0,x:'bottom',y:'right'},applyStyle:{order:900,enabled:!0,fn:function(e){return V(e.instance.popper,e.styles),j(e.instance.popper,e.attributes),e.arrowElement&&Object.keys(e.arrowStyles).length&&V(e.arrowElement,e.arrowStyles),e},onLoad:function(e,t,o,n,i){var r=L(i,t,e,o.positionFixed),p=O(o.placement,r,t,e,o.modifiers.flip.boundariesElement,o.modifiers.flip.padding);return t.setAttribute('x-placement',p),V(t,{position:o.positionFixed?'fixed':'absolute'}),o},gpuAcceleration:void 0}}},ge});
//# sourceMappingURL=popper.min.js.map;
var tippy=function(t){"use strict";t=t&&t.hasOwnProperty("default")?t.default:t;function e(){return(e=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t}).apply(this,arguments)}var n={passive:!0};function r(t,e){t.innerHTML=e}function i(t){return!(!t||!t._tippy||t._tippy.reference!==t)}function o(t,e){return{}.hasOwnProperty.call(t,e)}function a(t){return c(t)?[t]:function(t){return s(t,"NodeList")}(t)?y(t):Array.isArray(t)?t:y(document.querySelectorAll(t))}function p(t,e,n){if(Array.isArray(t)){var r=t[e];return null==r?Array.isArray(n)?n[e]:n:r}return t}function u(t,e){return t&&t.modifiers&&t.modifiers[e]}function s(t,e){var n={}.toString.call(t);return 0===n.indexOf("[object")&&n.indexOf(e+"]")>-1}function c(t){return s(t,"Element")}function l(t){return s(t,"MouseEvent")}function f(t,e){return"function"==typeof t?t.apply(void 0,e):t}function d(t,e,n,r){t.filter((function(t){return t.name===e}))[0][n]=r}function v(){return document.createElement("div")}function m(t,e){t.forEach((function(t){t&&(t.style.transitionDuration=e+"ms")}))}function g(t,e){t.forEach((function(t){t&&t.setAttribute("data-state",e)}))}function h(t,e){return 0===e?t:function(r){clearTimeout(n),n=setTimeout((function(){t(r)}),e)};var n}function b(t,e,n){t&&t!==e&&t.apply(void 0,n)}function y(t){return[].slice.call(t)}function w(t,e){for(;t;){if(e(t))return t;t=t.parentElement}return null}function E(t,e){return t.indexOf(e)>-1}function A(t){return t.split(/\s+/).filter(Boolean)}function T(t,e){return void 0!==t?t:e}function x(t){return[].concat(t)}function C(t){var e=x(t)[0];return e&&e.ownerDocument||document}function I(t,e){-1===t.indexOf(e)&&t.push(e)}function O(t){return"number"==typeof t?t:parseFloat(t)}function D(t,e,n){void 0===e&&(e=5);var r={top:0,right:0,bottom:0,left:0};return Object.keys(r).reduce((function(r,i){return r[i]="number"==typeof e?e:e[i],t===i&&(r[i]="number"==typeof e?e+n:e[t]+n),r}),r)}var L={isTouch:!1},k=0;function M(){L.isTouch||(L.isTouch=!0,window.performance&&document.addEventListener("mousemove",S))}function S(){var t=performance.now();t-k<20&&(L.isTouch=!1,document.removeEventListener("mousemove",S)),k=t}function P(){var t=document.activeElement;if(i(t)){var e=t._tippy;t.blur&&!e.state.isVisible&&t.blur()}}var V="undefined"!=typeof window&&"undefined"!=typeof document,B=V?navigator.userAgent:"",H=/MSIE |Trident\//.test(B),U=V&&/iPhone|iPad|iPod/.test(navigator.platform);function N(t){var e=t&&U&&L.isTouch;document.body.classList[e?"add":"remove"]("tippy-iOS")}var z=e({allowHTML:!0,animation:"fade",appendTo:function(){return document.body},aria:"describedby",arrow:!0,boundary:"scrollParent",content:"",delay:0,distance:10,duration:[300,250],flip:!0,flipBehavior:"flip",flipOnUpdate:!1,hideOnClick:!0,ignoreAttributes:!1,inertia:!1,interactive:!1,interactiveBorder:2,interactiveDebounce:0,lazy:!0,maxWidth:350,multiple:!1,offset:0,onAfterUpdate:function(){},onBeforeUpdate:function(){},onCreate:function(){},onDestroy:function(){},onHidden:function(){},onHide:function(){},onMount:function(){},onShow:function(){},onShown:function(){},onTrigger:function(){},onUntrigger:function(){},placement:"top",plugins:[],popperOptions:{},role:"tooltip",showOnCreate:!1,theme:"",touch:!0,trigger:"mouseenter focus",triggerTarget:null,updateDuration:0,zIndex:9999},{animateFill:!1,followCursor:!1,inlinePositioning:!1,sticky:!1}),R=Object.keys(z),q=["arrow","boundary","distance","flip","flipBehavior","flipOnUpdate","offset","placement","popperOptions"];function F(t){var n=(t.plugins||[]).reduce((function(e,n){var r=n.name,i=n.defaultValue;return r&&(e[r]=void 0!==t[r]?t[r]:i),e}),{});return e({},t,{},n)}function j(t,n){var r=e({},n,{content:f(n.content,[t])},n.ignoreAttributes?{}:function(t,n){return(n?Object.keys(F(e({},z,{plugins:n}))):R).reduce((function(e,n){var r=(t.getAttribute("data-tippy-"+n)||"").trim();if(!r)return e;if("content"===n)e[n]=r;else try{e[n]=JSON.parse(r)}catch(t){e[n]=r}return e}),{})}(t,n.plugins));return r.interactive&&(r.aria=null),r}function _(t){return t.split("-")[0]}function W(t){t.setAttribute("data-inertia","")}function X(t){t.setAttribute("data-interactive","")}function Y(t,e){if(c(e.content))r(t,""),t.appendChild(e.content);else if("function"!=typeof e.content){t[e.allowHTML?"innerHTML":"textContent"]=e.content}}function J(t){return{tooltip:t.querySelector(".tippy-tooltip"),content:t.querySelector(".tippy-content"),arrow:t.querySelector(".tippy-arrow")||t.querySelector(".tippy-svg-arrow")}}function G(t){var e=v();return!0===t?e.className="tippy-arrow":(e.className="tippy-svg-arrow",c(t)?e.appendChild(t):r(e,t)),e}function K(t,e){var n=v();n.className="tippy-popper",n.style.position="absolute",n.style.top="0",n.style.left="0";var r=v();r.className="tippy-tooltip",r.id="tippy-"+t,r.setAttribute("data-state","hidden"),r.setAttribute("tabindex","-1"),$(r,"add",e.theme);var i=v();return i.className="tippy-content",i.setAttribute("data-state","hidden"),e.interactive&&X(r),e.arrow&&(r.setAttribute("data-arrow",""),r.appendChild(G(e.arrow))),e.inertia&&W(r),Y(i,e),r.appendChild(i),n.appendChild(r),Q(n,e,e),n}function Q(t,e,n){var r,i=J(t),o=i.tooltip,a=i.content,p=i.arrow;t.style.zIndex=""+n.zIndex,o.setAttribute("data-animation",n.animation),o.style.maxWidth="number"==typeof(r=n.maxWidth)?r+"px":r,n.role?o.setAttribute("role",n.role):o.removeAttribute("role"),e.content!==n.content&&Y(a,n),!e.arrow&&n.arrow?(o.appendChild(G(n.arrow)),o.setAttribute("data-arrow","")):e.arrow&&!n.arrow?(o.removeChild(p),o.removeAttribute("data-arrow")):e.arrow!==n.arrow&&(o.removeChild(p),o.appendChild(G(n.arrow))),!e.interactive&&n.interactive?X(o):e.interactive&&!n.interactive&&function(t){t.removeAttribute("data-interactive")}(o),!e.inertia&&n.inertia?W(o):e.inertia&&!n.inertia&&function(t){t.removeAttribute("data-inertia")}(o),e.theme!==n.theme&&($(o,"remove",e.theme),$(o,"add",n.theme))}function Z(t,e,n){["transitionend","webkitTransitionEnd"].forEach((function(r){t[e+"EventListener"](r,n)}))}function $(t,e,n){A(n).forEach((function(n){t.classList[e](n+"-theme")}))}var tt=1,et=[],nt=[];function rt(r,i){var a,s,c,v=j(r,e({},z,{},F(i)));if(!v.multiple&&r._tippy)return null;var k,M,S,P,V,B=!1,U=!1,R=!1,W=0,X=[],Y=h(Dt,v.interactiveDebounce),G=C(v.triggerTarget||r),$=tt++,rt=K($,v),it=J(rt),ot=(V=v.plugins).filter((function(t,e){return V.indexOf(t)===e})),at=it.tooltip,pt=it.content,ut=[at,pt],st={id:$,reference:r,popper:rt,popperChildren:it,popperInstance:null,props:v,state:{currentPlacement:null,isEnabled:!0,isVisible:!1,isDestroyed:!1,isMounted:!1,isShown:!1},plugins:ot,clearDelayTimeouts:function(){clearTimeout(a),clearTimeout(s),cancelAnimationFrame(c)},setProps:function(t){if(st.state.isDestroyed)return;gt("onBeforeUpdate",[st,t]),It();var n=st.props,i=j(r,e({},st.props,{},t,{ignoreAttributes:!0}));i.ignoreAttributes=T(t.ignoreAttributes,n.ignoreAttributes),st.props=i,Ct(),n.interactiveDebounce!==i.interactiveDebounce&&(yt(),Y=h(Dt,i.interactiveDebounce));Q(rt,n,i),st.popperChildren=J(rt),n.triggerTarget&&!i.triggerTarget?x(n.triggerTarget).forEach((function(t){t.removeAttribute("aria-expanded")})):i.triggerTarget&&r.removeAttribute("aria-expanded");if(bt(),st.popperInstance)if(q.some((function(e){return o(t,e)&&t[e]!==n[e]}))){var a=st.popperInstance.reference;st.popperInstance.destroy(),St(),st.popperInstance.reference=a,st.state.isVisible&&st.popperInstance.enableEventListeners()}else st.popperInstance.update();gt("onAfterUpdate",[st,t])},setContent:function(t){st.setProps({content:t})},show:function(t){void 0===t&&(t=p(st.props.duration,0,z.duration));var e=st.state.isVisible,n=st.state.isDestroyed,r=!st.state.isEnabled,i=L.isTouch&&!st.props.touch;if(e||n||r||i)return;if(vt().hasAttribute("disabled"))return;st.popperInstance||St();if(gt("onShow",[st],!1),!1===st.props.onShow(st))return;Et(),rt.style.visibility="visible",st.state.isVisible=!0,st.state.isMounted||m(ut.concat(rt),0);M=function(){st.state.isVisible&&(m([rt],st.props.updateDuration),m(ut,t),g(ut,"visible"),ht(),bt(),I(nt,st),N(!0),st.state.isMounted=!0,gt("onMount",[st]),function(t,e){Tt(t,e)}(t,(function(){st.state.isShown=!0,gt("onShown",[st])})))},function(){W=0;var t,e=st.props.appendTo,n=vt();t=st.props.interactive&&e===z.appendTo||"parent"===e?n.parentNode:f(e,[n]);t.contains(rt)||t.appendChild(rt);d(st.popperInstance.modifiers,"flip","enabled",st.props.flip),st.popperInstance.enableEventListeners(),st.popperInstance.update()}()},hide:function(t){void 0===t&&(t=p(st.props.duration,1,z.duration));var e=!st.state.isVisible&&!B,n=st.state.isDestroyed,r=!st.state.isEnabled&&!B;if(e||n||r)return;if(gt("onHide",[st],!1),!1===st.props.onHide(st)&&!B)return;At(),rt.style.visibility="hidden",st.state.isVisible=!1,st.state.isShown=!1,m(ut,t),g(ut,"hidden"),ht(),bt(),function(t,e){Tt(t,(function(){!st.state.isVisible&&rt.parentNode&&rt.parentNode.contains(rt)&&e()}))}(t,(function(){st.popperInstance.disableEventListeners(),st.popperInstance.options.placement=st.props.placement,rt.parentNode.removeChild(rt),0===(nt=nt.filter((function(t){return t!==st}))).length&&N(!1),st.state.isMounted=!1,gt("onHidden",[st])}))},enable:function(){st.state.isEnabled=!0},disable:function(){st.hide(),st.state.isEnabled=!1},destroy:function(){if(st.state.isDestroyed)return;B=!0,st.clearDelayTimeouts(),st.hide(0),It(),delete r._tippy,st.popperInstance&&st.popperInstance.destroy();B=!1,st.state.isDestroyed=!0,gt("onDestroy",[st])}};r._tippy=st,rt._tippy=st;var ct=ot.map((function(t){return t.fn(st)})),lt=r.hasAttribute("aria-expanded");return Ct(),bt(),v.lazy||St(),gt("onCreate",[st]),v.showOnCreate&&Vt(),rt.addEventListener("mouseenter",(function(){st.props.interactive&&st.state.isVisible&&st.clearDelayTimeouts()})),rt.addEventListener("mouseleave",(function(t){st.props.interactive&&E(st.props.trigger,"mouseenter")&&(Y(t),G.addEventListener("mousemove",Y))})),st;function ft(){var t=st.props.touch;return Array.isArray(t)?t:[t,0]}function dt(){return"hold"===ft()[0]}function vt(){return P||r}function mt(t){return st.state.isMounted&&!st.state.isVisible||L.isTouch||k&&"focus"===k.type?0:p(st.props.delay,t?0:1,z.delay)}function gt(t,e,n){var r;(void 0===n&&(n=!0),ct.forEach((function(n){o(n,t)&&n[t].apply(n,e)})),n)&&(r=st.props)[t].apply(r,e)}function ht(){var t=st.props.aria;if(t){var e="aria-"+t,n=at.id;x(st.props.triggerTarget||r).forEach((function(t){var r=t.getAttribute(e);if(st.state.isVisible)t.setAttribute(e,r?r+" "+n:n);else{var i=r&&r.replace(n,"").trim();i?t.setAttribute(e,i):t.removeAttribute(e)}}))}}function bt(){lt||x(st.props.triggerTarget||r).forEach((function(t){st.props.interactive?t.setAttribute("aria-expanded",st.state.isVisible&&t===vt()?"true":"false"):t.removeAttribute("aria-expanded")}))}function yt(){G.body.removeEventListener("mouseleave",Bt),G.removeEventListener("mousemove",Y),et=et.filter((function(t){return t!==Y}))}function wt(t){if(!st.props.interactive||!rt.contains(t.target)){if(vt().contains(t.target)){if(L.isTouch)return;if(st.state.isVisible&&E(st.props.trigger,"click"))return}!0===st.props.hideOnClick&&(U=!1,st.clearDelayTimeouts(),st.hide(),R=!0,setTimeout((function(){R=!1})),st.state.isMounted||At())}}function Et(){G.addEventListener("mousedown",wt,!0)}function At(){G.removeEventListener("mousedown",wt,!0)}function Tt(t,e){function n(t){t.target===at&&(Z(at,"remove",n),e())}if(0===t)return e();Z(at,"remove",S),Z(at,"add",n),S=n}function xt(t,e,n){void 0===n&&(n=!1),x(st.props.triggerTarget||r).forEach((function(r){r.addEventListener(t,e,n),X.push({node:r,eventType:t,handler:e,options:n})}))}function Ct(){dt()&&(xt("touchstart",Ot,n),xt("touchend",Lt,n)),A(st.props.trigger).forEach((function(t){if("manual"!==t)switch(xt(t,Ot),t){case"mouseenter":xt("mouseleave",Lt);break;case"focus":xt(H?"focusout":"blur",kt);break;case"focusin":xt("focusout",kt)}}))}function It(){X.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,i=t.options;e.removeEventListener(n,r,i)})),X=[]}function Ot(t){var e=!1;if(st.state.isEnabled&&!Mt(t)&&!R){if(k=t,P=t.currentTarget,bt(),!st.state.isVisible&&l(t)&&et.forEach((function(e){return e(t)})),"click"!==t.type||E(st.props.trigger,"mouseenter")&&!U||!1===st.props.hideOnClick||!st.state.isVisible){var n=ft(),r=n[0],i=n[1];L.isTouch&&"hold"===r&&i?a=setTimeout((function(){Vt(t)}),i):Vt(t)}else e=!0;"click"===t.type&&(U=!e),e&&Bt(t)}}function Dt(t){var e=w(t.target,(function(t){return t===r||t===rt}));"mousemove"===t.type&&e||function(t,e){var n=e.clientX,r=e.clientY;return t.every((function(t){var e=t.popperRect,i=t.tooltipRect,o=t.interactiveBorder,a=Math.min(e.top,i.top),p=Math.max(e.right,i.right),u=Math.max(e.bottom,i.bottom),s=Math.min(e.left,i.left);return a-r>o||r-u>o||s-n>o||n-p>o}))}(y(rt.querySelectorAll(".tippy-popper")).concat(rt).map((function(t){var e=t._tippy,n=e.popperChildren.tooltip,r=e.props.interactiveBorder;return{popperRect:t.getBoundingClientRect(),tooltipRect:n.getBoundingClientRect(),interactiveBorder:r}})),t)&&(yt(),Bt(t))}function Lt(t){if(!(Mt(t)||E(st.props.trigger,"click")&&U))return st.props.interactive?(G.body.addEventListener("mouseleave",Bt),G.addEventListener("mousemove",Y),I(et,Y),void Y(t)):void Bt(t)}function kt(t){(E(st.props.trigger,"focusin")||t.target===vt())&&(st.props.interactive&&t.relatedTarget&&rt.contains(t.relatedTarget)||Bt(t))}function Mt(t){var e="ontouchstart"in window,n=E(t.type,"touch"),r=dt();return e&&L.isTouch&&r&&!n||L.isTouch&&!r&&n}function St(){var n,i=st.props.popperOptions,o=st.popperChildren.arrow,a=u(i,"flip"),p=u(i,"preventOverflow");function s(t){var e=st.state.currentPlacement;st.state.currentPlacement=t.placement,st.props.flip&&!st.props.flipOnUpdate&&(t.flipped&&(st.popperInstance.options.placement=t.placement),d(st.popperInstance.modifiers,"flip","enabled",!1)),at.setAttribute("data-placement",t.placement),!1!==t.attributes["x-out-of-boundaries"]?at.setAttribute("data-out-of-boundaries",""):at.removeAttribute("data-out-of-boundaries");var r=_(t.placement),i=E(["top","bottom"],r),o=E(["bottom","right"],r);at.style.top="0",at.style.left="0",at.style[i?"top":"left"]=(o?1:-1)*n+"px",e&&e!==t.placement&&st.popperInstance.update()}var c=e({eventsEnabled:!1,placement:st.props.placement},i,{modifiers:e({},i&&i.modifiers,{tippyDistance:{enabled:!0,order:0,fn:function(t){n=function(t,e){var n="string"==typeof e&&E(e,"rem"),r=t.documentElement;return r&&n?parseFloat(getComputedStyle(r).fontSize||String(16))*O(e):O(e)}(G,st.props.distance);var e=_(t.placement),r=D(e,p&&p.padding,n),i=D(e,a&&a.padding,n),o=st.popperInstance.modifiers;return d(o,"preventOverflow","padding",r),d(o,"flip","padding",i),t}},preventOverflow:e({boundariesElement:st.props.boundary},p),flip:e({enabled:st.props.flip,behavior:st.props.flipBehavior},a),arrow:e({element:o,enabled:!!o},u(i,"arrow")),offset:e({offset:st.props.offset},u(i,"offset"))}),onCreate:function(t){s(t),b(i&&i.onCreate,c.onCreate,[t]),Pt()},onUpdate:function(t){s(t),b(i&&i.onUpdate,c.onUpdate,[t]),Pt()}});st.popperInstance=new t(r,rt,c)}function Pt(){0===W?(W++,st.popperInstance.update()):M&&1===W&&(W++,rt.offsetHeight,M())}function Vt(t){st.clearDelayTimeouts(),st.popperInstance||St(),t&&gt("onTrigger",[st,t]),Et();var e=mt(!0);e?a=setTimeout((function(){st.show()}),e):st.show()}function Bt(t){if(st.clearDelayTimeouts(),gt("onUntrigger",[st,t]),st.state.isVisible){if(!(E(st.props.trigger,"mouseenter")&&E(st.props.trigger,"click")&&E(["mouseleave","mousemove"],t.type)&&U)){var e=mt(!1);e?s=setTimeout((function(){st.state.isVisible&&st.hide()}),e):c=requestAnimationFrame((function(){st.hide()}))}}else At()}}function it(t,r,i){void 0===r&&(r={}),void 0===i&&(i=[]),i=z.plugins.concat(r.plugins||i),document.addEventListener("touchstart",M,e({},n,{capture:!0})),window.addEventListener("blur",P);var o=e({},r,{plugins:i}),p=a(t).reduce((function(t,e){var n=e&&rt(e,o);return n&&t.push(n),t}),[]);return c(t)?p[0]:p}it.version="5.2.1",it.defaultProps=z,it.setDefaultProps=function(t){Object.keys(t).forEach((function(e){z[e]=t[e]}))},it.currentInput=L;var ot={mouseover:"mouseenter",focusin:"focus",click:"click"};var at={name:"animateFill",defaultValue:!1,fn:function(t){var e=t.popperChildren,n=e.tooltip,r=e.content,i=t.props.animateFill?function(){var t=v();return t.className="tippy-backdrop",g([t],"hidden"),t}():null;function o(){t.popperChildren.backdrop=i}return{onCreate:function(){i&&(o(),n.insertBefore(i,n.firstElementChild),n.setAttribute("data-animatefill",""),n.style.overflow="hidden",t.setProps({animation:"shift-away",arrow:!1}))},onMount:function(){if(i){var t=n.style.transitionDuration,e=Number(t.replace("ms",""));r.style.transitionDelay=Math.round(e/10)+"ms",i.style.transitionDuration=t,g([i],"visible")}},onShow:function(){i&&(i.style.transitionDuration="0ms")},onHide:function(){i&&g([i],"hidden")},onAfterUpdate:function(){o()}}}};var pt={name:"followCursor",defaultValue:!1,fn:function(t){var e,n=t.reference,r=t.popper,i=null,o=C(t.props.triggerTarget||n),a=null,p=!1,u=t.props;function s(){return"manual"===t.props.trigger.trim()}function c(){var e=!!s()||null!==a&&!(0===a.clientX&&0===a.clientY);return t.props.followCursor&&e}function f(){return L.isTouch||"initial"===t.props.followCursor&&t.state.isVisible}function d(){t.popperInstance&&i&&(t.popperInstance.reference=i)}function v(){if(c()||t.props.placement!==u.placement){var e=u.placement,n=e.split("-")[1];p=!0,t.setProps({placement:c()&&n?e.replace(n,"start"===n?"end":"start"):e}),p=!1}}function m(){t.popperInstance&&c()&&f()&&t.popperInstance.disableEventListeners()}function g(){c()?o.addEventListener("mousemove",y):d()}function h(){c()&&y(e)}function b(){o.removeEventListener("mousemove",y)}function y(o){var a=e=o,p=a.clientX,u=a.clientY;if(t.popperInstance&&t.state.currentPlacement){var s=w(o.target,(function(t){return t===n})),c=t.props.followCursor,l="horizontal"===c,d="vertical"===c,v=E(["top","bottom"],_(t.state.currentPlacement)),m=function(t,e){var n=e?t.offsetWidth:t.offsetHeight;return{size:n,x:e?n:0,y:e?0:n}}(r,v),g=m.size,h=m.x,y=m.y;!s&&t.props.interactive||(null===i&&(i=t.popperInstance.reference),t.popperInstance.reference={referenceNode:n,clientWidth:0,clientHeight:0,getBoundingClientRect:function(){var t=n.getBoundingClientRect();return{width:v?g:0,height:v?0:g,top:(l?t.top:u)-y,bottom:(l?t.bottom:u)+y,left:(d?t.left:p)-h,right:(d?t.right:p)+h}}},t.popperInstance.update()),f()&&b()}}return{onAfterUpdate:function(t,e){var n;p||(n=e,Object.keys(n).forEach((function(t){u[t]=T(n[t],u[t])})),e.placement&&v()),e.placement&&m(),requestAnimationFrame(h)},onMount:function(){h(),m()},onShow:function(){s()&&(e=a={clientX:0,clientY:0},v(),g())},onTrigger:function(t,n){a||(l(n)&&(a={clientX:n.clientX,clientY:n.clientY},e=n),v(),g())},onUntrigger:function(){t.state.isVisible||(b(),a=null)},onHidden:function(){b(),d(),a=null}}}};var ut={name:"inlinePositioning",defaultValue:!1,fn:function(t){var e=t.reference;function n(){return!!t.props.inlinePositioning}return{onHidden:function(){n()&&(t.popperInstance.reference=e)},onShow:function(){n()&&(t.popperInstance.reference={referenceNode:e,clientWidth:0,clientHeight:0,getBoundingClientRect:function(){return function(t,e,n){if(n.length<2||null===t)return e;switch(t){case"top":case"bottom":var r=n[0],i=n[n.length-1],o="top"===t,a=r.top,p=i.bottom,u=o?r.left:i.left,s=o?r.right:i.right;return{top:a,bottom:p,left:u,right:s,width:s-u,height:p-a};case"left":case"right":var c=Math.min.apply(Math,n.map((function(t){return t.left}))),l=Math.max.apply(Math,n.map((function(t){return t.right}))),f=n.filter((function(e){return"left"===t?e.left===c:e.right===l})),d=f[0].top,v=f[f.length-1].bottom;return{top:d,bottom:v,left:c,right:l,width:l-c,height:v-d};default:return e}}(t.state.currentPlacement&&_(t.state.currentPlacement),e.getBoundingClientRect(),y(e.getClientRects()))}})}}}};var st={name:"sticky",defaultValue:!1,fn:function(t){var e=t.reference,n=t.popper;function r(e){return!0===t.props.sticky||t.props.sticky===e}var i=null,o=null;function a(){var p=r("reference")?(t.popperInstance?t.popperInstance.reference:e).getBoundingClientRect():null,u=r("popper")?n.getBoundingClientRect():null;(p&&ct(i,p)||u&&ct(o,u))&&t.popperInstance.update(),i=p,o=u,t.state.isMounted&&requestAnimationFrame(a)}return{onMount:function(){t.props.sticky&&a()}}}};function ct(t,e){return!t||!e||(t.top!==e.top||t.right!==e.right||t.bottom!==e.bottom||t.left!==e.left)}return V&&function(t){var e=document.createElement("style");e.textContent=t,e.setAttribute("data-tippy-stylesheet","");var n=document.head,r=document.querySelector("head>style,head>link");r?n.insertBefore(e,r):n.appendChild(e)}(".tippy-tooltip[data-animation=fade][data-state=hidden]{opacity:0}.tippy-iOS{cursor:pointer!important;-webkit-tap-highlight-color:transparent}.tippy-popper{pointer-events:none;max-width:calc(100vw - 10px);transition-timing-function:cubic-bezier(.165,.84,.44,1);transition-property:transform}.tippy-tooltip{position:relative;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;background-color:#333;transition-property:visibility,opacity,transform;outline:0}.tippy-tooltip[data-placement^=top]>.tippy-arrow{border-width:8px 8px 0;border-top-color:#333;margin:0 3px;transform-origin:50% 0;bottom:-7px}.tippy-tooltip[data-placement^=bottom]>.tippy-arrow{border-width:0 8px 8px;border-bottom-color:#333;margin:0 3px;transform-origin:50% 7px;top:-7px}.tippy-tooltip[data-placement^=left]>.tippy-arrow{border-width:8px 0 8px 8px;border-left-color:#333;margin:3px 0;transform-origin:0 50%;right:-7px}.tippy-tooltip[data-placement^=right]>.tippy-arrow{border-width:8px 8px 8px 0;border-right-color:#333;margin:3px 0;transform-origin:7px 50%;left:-7px}.tippy-tooltip[data-interactive][data-state=visible]{pointer-events:auto}.tippy-tooltip[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{position:absolute;border-color:transparent;border-style:solid}.tippy-content{padding:5px 9px}"),it.setDefaultProps({plugins:[at,pt,ut,st]}),it.createSingleton=function(t,n,r){void 0===n&&(n={}),void 0===r&&(r=[]),r=n.plugins||r,t.forEach((function(t){t.disable()}));var i,o,a=e({},z,{},n).aria,p=!1,u=t.map((function(t){return t.reference})),s={fn:function(e){function n(t){if(i){var n="aria-"+i;t&&!e.props.interactive?o.setAttribute(n,e.popperChildren.tooltip.id):o.removeAttribute(n)}}return{onAfterUpdate:function(t,n){var r=n.aria;void 0!==r&&r!==a&&(p?(p=!0,e.setProps({aria:null}),p=!1):a=r)},onDestroy:function(){t.forEach((function(t){t.enable()}))},onMount:function(){n(!0)},onUntrigger:function(){n(!1)},onTrigger:function(r,p){var s=p.currentTarget,c=u.indexOf(s);s!==o&&(o=s,i=a,e.state.isVisible&&n(!0),e.popperInstance.reference=s,e.setContent(t[c].props.content))}}}};return it(v(),e({},n,{plugins:[s].concat(r),aria:null,triggerTarget:u}))},it.delegate=function(t,n,r){void 0===r&&(r=[]),r=n.plugins||r;var i,o,a=[],p=[],u=n.target,s=(i=["target"],o=e({},n),i.forEach((function(t){delete o[t]})),o),c=e({},s,{plugins:r,trigger:"manual"}),l=e({},s,{plugins:r,showOnCreate:!0}),f=it(t,c);function d(t){if(t.target){var e=t.target.closest(u);if(e)if(E(e.getAttribute("data-tippy-trigger")||n.trigger||z.trigger,ot[t.type])){var r=it(e,l);r&&(p=p.concat(r))}}}function v(t,e,n,r){void 0===r&&(r=!1),t.addEventListener(e,n,r),a.push({node:t,eventType:e,handler:n,options:r})}return x(f).forEach((function(t){var e=t.destroy;t.destroy=function(t){void 0===t&&(t=!0),t&&p.forEach((function(t){t.destroy()})),p=[],a.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,i=t.options;e.removeEventListener(n,r,i)})),a=[],e()},function(t){var e=t.reference;v(e,"mouseover",d),v(e,"focusin",d),v(e,"click",d)}(t)})),f},it.hideAll=function(t){var e=void 0===t?{}:t,n=e.exclude,r=e.duration;nt.forEach((function(t){var e=!1;n&&(e=i(n)?t.reference===n:t.popper===n.popper),e||t.hide(r)}))},it.roundArrow='<svg viewBox="0 0 18 7" xmlns="http://www.w3.org/2000/svg"><path d="M0 7s2.021-.015 5.253-4.218C6.584 1.051 7.797.007 9 0c1.203-.007 2.416 1.035 3.761 2.782C16.012 7.005 18 7 18 7H0z"/></svg>',it}(Popper);
//# sourceMappingURL=tippy-bundle.iife.min.js.map;


document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('#header');
    const headerHeight = header.offsetHeight * 2;
    const nlMainMenuParentItemArrowBtn = document.querySelectorAll('.main-menu-item__arrow');
    const nlMainMenuParentElements = document.querySelectorAll('.main-menu-item--parent');

    function closeAllChildrenMenu(){
        if(nlMainMenuParentElements.length > 0){
            nlMainMenuParentElements.forEach(item => {
                item.classList.remove('open-children-menu');
            })
        }
    }   

    if(nlMainMenuParentItemArrowBtn.length > 0){
        nlMainMenuParentItemArrowBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                let mmi = btn.closest('.main-menu-item');
                if(mmi.classList.contains('open-children-menu')){
                    mmi.classList.remove('open-children-menu')
                    header.classList.remove('open-menu');
                    closeAllChildrenMenu();
                }else{
                    closeAllChildrenMenu();
                    mmi.classList.add('open-children-menu');
                    header.classList.add('open-menu');
                }
            })
        })
    }
    // клики вне элемента
    document.body.addEventListener('click', (e) => { 

        // клики вне дочернего меню
        if(!(e.target.closest('.children-menu-wr') || e.target.classList.contains('main-menu-item__arrow'))){ 
            if(header.classList.contains('open-menu')){
                header.classList.remove('open-menu');
                closeAllChildrenMenu()
            }
        }
    });

    function mainMenuSrollController(){
        if(window.pageYOffset > headerHeight){ 
            if(!header.classList.contains('header--scroll')){ 
                header.classList.add('header--scroll');
                setTimeout(() => {
                    header.classList.add('header--scroll-show');
                }, 100)
            } 
        }else{
            header.classList.remove('header--scroll');
            header.classList.remove('header--scroll-show');
        } 
    }
    
    mainMenuSrollController()

    window.addEventListener('scroll', function(e){ 
        mainMenuSrollController()  
    })

    const burgerBtn = document.querySelector('.burger-btn');
    if(burgerBtn){
        burgerBtn.addEventListener('click', function(){
            header.classList.toggle('show-menu');
        })
    }

})
 
;
document.addEventListener('DOMContentLoaded', () => {

    const greatShadow = document.querySelector('.great-shadow');
    const nlModalOpenBtn = document.querySelectorAll('[data-modal-id]');
    const nlModals = document.querySelectorAll('.modal'); 

    function openModal(modalID){ 
        if(!greatShadow) return;
        let modal = document.querySelector('#'+modalID); 
        if(modalID){
            greatShadow.classList.add('open');
            setTimeout(function(){
                modal.classList.add('open');
            }, 200);
        }
    }

    function closeAllModal(){
        nlModals.forEach(modal => {
            console.log(modal)
            modal.classList.remove('open');
        });
        setTimeout(function(){
            greatShadow.classList.remove('open');
        }, 200)
    }

    if(nlModalOpenBtn.length > 0){
        nlModalOpenBtn.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); 
                openModal(item.getAttribute('data-modal-id'));
            });
        });
    }

    greatShadow.addEventListener('click', function(e){
        if(e.target.classList.contains('great-shadow')){
            closeAllModal();
        } 
    })


    // работа таба в модалке регистрации
    const nlmodalMab = document.querySelectorAll('.modal-tab');

    if(nlmodalMab.length > 0){
      nlmodalMab.forEach(mt => {
        let nlTabBtn = mt.querySelectorAll('.modal-tab-control__btn');
        let nlDisplay = mt.querySelectorAll('.modal-tab-display');
        
        if(nlTabBtn.length > 0){

          nlTabBtn.forEach((btn, index) => { 
            btn.addEventListener('click', (e)=>{
              e.preventDefault();
              nlTabBtn.forEach(item => {
                item.classList.remove('active');
              });
              btn.classList.add('active');

              nlDisplay.forEach(display => {
                display.classList.remove('active');
              });
              nlDisplay[index].classList.add('active'); 
            });
          })
        }
        
      });
    }

   
    
    if(nlModals.length > 0){
        nlModals.forEach(modal => {
            // Переключение шагов модалки 
            const nlModalStepBtn = modal.querySelectorAll('[data-modal-step-id]');
            const nlModalSteps = modal.querySelectorAll('.modal-step');
            if(nlModalStepBtn.length > 0){
                nlModalStepBtn.forEach(mStepBtn => {
                    mStepBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log(mStepBtn.getAttribute('data-modal-step-id'))
                        let curretnModalStep = modal.querySelector('#'+ mStepBtn.getAttribute('data-modal-step-id'));
                        console.log(curretnModalStep)
                        if(!curretnModalStep) return;
                        nlModalSteps.forEach(ms => {
                            ms.classList.remove('active');
                        });
                        curretnModalStep.classList.add('active');
                    });
                });
            } 
        });
    }


    
     // активация кнопок в форме в случае заполнения всех обяхательных полей
     const nlModalForm = document.querySelectorAll('.modal-form');
     if(nlModalForm.length > 0){
        nlModalForm.forEach( mf => {
            // disabled="disabled"
            let submitBtn = mf.querySelector('.btn[type="submit"]');
            // required="required"
            let nlReauiredField = mf.querySelectorAll('input[required="required"]');
            console.log(submitBtn)
            if(nlReauiredField.length > 0){
                nlReauiredField.forEach(inp => { 
                    let fullnessFlag; //флаг заполненности полей
                    inp.addEventListener('input', (e) => { 
                        fullnessFlag = true; 
                        nlReauiredField.forEach(item => { 
                            if(!item.value || item.value.length < 3) {
                                fullnessFlag = false; 
                            } 
                        });  
                        if(fullnessFlag){  
                            submitBtn.removeAttribute('disabled')
                        }else{
                            submitBtn.setAttribute('disabled', 'disabled')
                        } 
                    });
                });
            }
        });
     }
     
});;
document.addEventListener('DOMContentLoaded', () => {
    const nlTrustTab = document.querySelectorAll('.trust-tab');

    if (nlTrustTab.length > 0) {

        nlTrustTab.forEach(trustTub => {
            const nlTabBtn = trustTub.querySelectorAll('.trust-tab-controller .trust-tab-btn');
            const nlTabControlBody = trustTub.querySelectorAll('.trust-section__sl-control-box .trust-tab-body');
            const nlTabBody = trustTub.querySelectorAll('.trust-section__slider-box .trust-tab-body');
            const nlTabBodyBoxInner = trustTub.querySelectorAll('.trust-tab__body-box .trust-tab-body');


            if (nlTabBtn) {
                nlTabBtn.forEach((btn, index) => {
                    btn.addEventListener('click', () => {

                        nlTabBtn.forEach(item => {
                            item.classList.remove('active');
                        });
                        nlTabBtn[index].classList.add('active');

                        if (nlTabControlBody.length > 0) {
                            nlTabControlBody.forEach(item => {
                                item.classList.remove('active');
                            });

                            nlTabControlBody[index].classList.add('active');
                        }

                        if (nlTabBody.length > 0) {
                            nlTabBody.forEach(item => {
                                item.classList.remove('active');
                            });
                            nlTabBody[index].classList.add('active');
                        }

                        if (nlTabBodyBoxInner.length > 0) {
                            nlTabBodyBoxInner.forEach(item => {
                                item.classList.remove('active');
                            });
                            nlTabBodyBoxInner[index].classList.add('active');
                        }

                    });
                });
            }
        });
    }
});;


document.addEventListener('DOMContentLoaded', function () {

  // подключаю маску
  const maskTel = document.querySelectorAll('.mask-tel');
  if (maskTel.length > 0) {
    maskTel.forEach(mt => {
      let tMask = IMask(mt, {
        mask: '+{7}(000)000-00-00'
      });
    });
  }


  // Код ниже следит за отсутпами предпоследнего блока с классом penultimate-section и  блока с формой заявки на консультацию
  const consultationRequest = document.querySelector('.consultation-request');
  const penultimateSection = document.querySelector('.penultimate-section');
  const consultationRequestSection = document.querySelector('.consultation-request-section');
  function penultimateSectionSizeController() {
    if (consultationRequest && penultimateSection && consultationRequestSection) {
      let currentSize = consultationRequest.offsetHeight / 2;
      consultationRequestSection.style.height = currentSize + 'px';
      penultimateSection.style.paddingBottom = currentSize + 'px';
    }
  }
  penultimateSectionSizeController();
  window.addEventListener('resize', () => {
    penultimateSectionSizeController();
  });

  // подключаю слайдеры
  // our-team
  const ourTeamSlider = document.querySelector('.our-team-slider')
  var swipeOourTeamSlider = new Swiper(ourTeamSlider, {
    slidesPerView: 5,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '.our-team-slider-btn-box .arrow-btn--right',
      prevEl: '.our-team-slider-btn-box .arrow-btn--left',
    },
    breakpoints: {
      // when window width is >= 320px
      300: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      570: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      840: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      1135: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
      5000: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    }
  });

  const ourArticlesSlider = document.querySelector('.news-slider')
  var swipeourArticlesSlider = new Swiper(ourArticlesSlider, {
    slidesPerView: 5,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '.news-slider-controller .arrow-btn--right',
      prevEl: '.news-slider-controller .arrow-btn--left',
    },
    breakpoints: {
      // when window width is >= 320px
      200: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      600: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      940: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      999: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
      1150: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
      5000: {
        slidesPerView: 5,
        spaceBetween: 20,
      },
    }
  });

  const nlFeedbackSlider = document.querySelectorAll('.feedback-slider');
  if(nlFeedbackSlider.length > 0){
    nlFeedbackSlider.forEach(item => {
      var swipeFeedbackSlider = new Swiper(item, {
        slidesPerView: 3,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.feedback-slider-controller .arrow-btn--right',
          prevEl: '.feedback-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1100: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }
      });
    })
  }
  
  const nlFCasesSlider = document.querySelectorAll('.cases-slider');
  if(nlFCasesSlider.length > 0){
    nlFCasesSlider.forEach(item => {
      var swipeFeedbackSlider = new Swiper(item, {
        slidesPerView: 2,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.cases-slider-controller .arrow-btn--right',
          prevEl: '.cases-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          700: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
        }
      });
    })
  }


  const nlFeedbackSocSlider = document.querySelectorAll('.social-feedback-slider');
  if(nlFeedbackSocSlider.length > 0){
    nlFeedbackSocSlider.forEach(item => {
      var swipefeedbackSocSlider = new Swiper(item, {
        slidesPerView: 6,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.soc-feedback-slider-controller .arrow-btn--right',
          prevEl: '.soc-feedback-slider-controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          400: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          600: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          750: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
          999: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }
      });
    });
  }


  const nlGalleryrSlider = document.querySelectorAll('.gallery-slider');
 
  if (nlGalleryrSlider.length > 0) {
    nlGalleryrSlider.forEach(item => {
      var swiperGalleryrSlider = new Swiper(item, {
        // slidesPerView: 5,
        // spaceBetween: 20,
        // slidesPerView: "auto",
        centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.gallery-slider-controller .arrow-btn--right',
          prevEl: '.gallery-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 20,
            centeredSlides: true, 
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
            centeredSlides: true, 
          }, 
          1470: {
            slidesPerView: 4,
            spaceBetween: 20, 
          }, 
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }

  const nlCertificatesSlider = document.querySelectorAll('.certificates-slider');
 
  if (nlCertificatesSlider.length > 0) {
    nlCertificatesSlider.forEach(item => {
      var swiperCertificatesSlider = new Swiper(item, {
        // slidesPerView: 5,
        // spaceBetween: 20,
        // slidesPerView: "auto",
        centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.certificates-slider-controller .arrow-btn--right',
          prevEl: '.certificates-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 10,
            centeredSlides: true, 
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 20,
            centeredSlides: true, 
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
            centeredSlides: true, 
          }, 
          1470: {
            slidesPerView: 4,
            spaceBetween: 20, 
          }, 
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }


  const nlPublicationSlider = document.querySelectorAll('.publications-slider');
 
  if (nlPublicationSlider.length > 0) {
    nlPublicationSlider.forEach(item => {
      var swiperPublicationSlider = new Swiper(item, {
        slidesPerView: 5,
        spaceBetween: 20,
        // slidesPerView: "auto",
        // centeredSlides: true, 
        loop: true,
        // roundLengths: true,
        navigation: {
          nextEl: '.publications-slider-controller .arrow-btn--right',
          prevEl: '.publications-slider-controller .arrow-btn--left',
        },
        breakpoints: { 
          300: {
            slidesPerView: 2,
            spaceBetween: 10, 
          },
          580: {
            slidesPerView: 2,
            spaceBetween: 20, 
          },
          780: {
            slidesPerView: 3,
            spaceBetween: 20, 
          },
          1100: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },  
          5000: {
            slidesPerView: 4,
            spaceBetween: 20, 
          },
        }
      });
    });
  }


  const nlFeedbackLetterSlider = document.querySelectorAll('.feedback-letter-slider')
  if (nlFeedbackLetterSlider.length > 0) {
    nlFeedbackLetterSlider.forEach(item => {
      var swipefeedbackSocSlider = new Swiper(item, {
        slidesPerView: 5,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.feedback-letter-slider--controller .arrow-btn--right',
          prevEl: '.feedback-letter-slider--controller .arrow-btn--left',
        },
        breakpoints: {
          // when window width is >= 320px 
          300: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          650: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          999: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1350: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          5000: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }
      });
    });
  }


  const muvieSliderUp = document.querySelector('.swiper-muvie--up');
 
  if (muvieSliderUp) {
    var swipermuvieSliderUp = new Swiper(muvieSliderUp, {  
      loop: true,
      // roundLengths: true, 
      slidesPerView: 3,
      spaceBetween: 0,
      speed: 30000,
      loop: true, 
      direction: 'vertical',
      autoplay: {
        reverseDirection: true,
        delay: 0,
        //disableOnInteraction: true // или сделать так, чтобы восстанавливался autoplay после взаимодействия
      }
    });
  }

  const muvieSliderDown = document.querySelector('.swiper-muvie--down');
 
  if (muvieSliderDown) {
    var swipermuvieSliderDown = new Swiper(muvieSliderDown, {  
      loop: true,
      // roundLengths: true, 
      slidesPerView: 3,
      spaceBetween: 0,
      speed: 30000,
      loop: true, 
      direction: 'vertical',
      autoplay: { 
        delay: 0,
        //disableOnInteraction: true // или сделать так, чтобы восстанавливался autoplay после взаимодействия
      }
    });
  }

  // lightgallery

  const nlLightgallery = document.querySelectorAll('.v-lightgallery');

  if (nlLightgallery.length > 0) {
    nlLightgallery.forEach(item => {
      lightGallery(item);
    })

  }

  // спойдеры
  // spoiler
    const nlSpoilerHead = document.querySelectorAll('.spoiler__head');
    if(nlSpoilerHead.length > 0){
      nlSpoilerHead.forEach(sph => {
        sph.addEventListener('click', () => {
          sph.parentElement.classList.toggle('active');
        })
      })
    }

    // работа якорных ссылок
    const nlAnchorLink = document.querySelectorAll('.anchor-link');

    if(nlAnchorLink.length > 0){
      nlAnchorLink.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          let anchorTarget = document.querySelector(anchor.getAttribute('href')); 
          anchorTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        })
      })
    }

    // показать или скрыть пароль
    const nlEyeBtn = document.querySelectorAll('.eye-btn');
    
    if(nlEyeBtn.length > 0){
      nlEyeBtn.forEach(eye => {
        eye.addEventListener('click', (e) => {
          const passInput = eye.previousElementSibling; 
          if(eye.classList.contains('open')){
            eye.classList.remove('open');
            passInput.setAttribute('type', 'password');
          }else{
            eye.classList.add('open');
            passInput.setAttribute('type', 'text');
          }
        })
      })
    } 


    const nlTooltips = document.querySelectorAll('.tooltip'); 
    if(nlTooltips.length > 0){
      nlTooltips.forEach(tooltip => { 
        let tooltipTemplate = tooltip.querySelector('.tooltip-template'); 
        tippy(tooltip, {
          content: tooltipTemplate,
          // trigger: 'click',
          placement: "bottom", 
          flipOnUpdate: true
        }
        );
      })
      }

      // ячейки копирования в буфер обмена 
      
      const nlCopyredCell = document.querySelectorAll('.copyred-cell');
      if(nlCopyredCell.length > 0){
        nlCopyredCell.forEach(ccItem => {
          let copyTarget = ccItem.querySelector('.copyred-cell__target');
          let copyBtn = ccItem.querySelector('.copy-it-btn');
          if(copyBtn && copyTarget){
            copyBtn.addEventListener('click', (e) => {
              e.preventDefault(); 
              navigator.clipboard.writeText(copyTarget.innerHTML)
                .then(() => {
                  console.log('Скопировано')
                  ccItem.classList.add('copyred-cell--success');
                  setTimeout(()=>{
                    ccItem.classList.remove('copyred-cell--success');
                  }, 1200);
                })
                .catch(error => {
                    console.error(`Текст не скопирован ${error}`)
              })
            })
          }
          
        });
      }

      // работа таба в тарифе
      let nlRateStack = document.querySelectorAll('.rate-stack');
      if(nlRateStack.length > 0){
        nlRateStack.forEach(rs => {
          const nlRateNavBtn = rs.querySelectorAll('.rate-nav-btn');
          const nlRate = rs.querySelectorAll('.rate'); 
          if(nlRateNavBtn.length > 0){
            nlRateNavBtn.forEach(rBtn => {
              rBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                if(nlRate[rBtn.dataset.rateNumer - 1]){
                  nlRate.forEach(r => {
                    r.classList.remove('active');
                  });
                  nlRate[rBtn.dataset.rateNumer - 1].classList.add('active');
                }
              });
            });
          }
        });
      }



});