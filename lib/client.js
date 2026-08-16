window.__ModuleLoader__.load({
  id: "dsh-workspace-files",
  factory: (require) => {
    var cache = {};
    var factories = [
  (function (module, exports, require) {
  /* eslint-disable no-multi-assign */
  function deepFreeze(obj) {
      if (obj instanceof Map) {
          obj.clear =
              obj.delete =
                  obj.set =
                      function () {
                          throw new Error('map is read-only');
                      };
      }
      else if (obj instanceof Set) {
          obj.add =
              obj.clear =
                  obj.delete =
                      function () {
                          throw new Error('set is read-only');
                      };
      }
      // Freeze self
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((name) => {
          const prop = obj[name];
          const type = typeof prop;
          // Freeze prop if it is an object or function and also not already frozen
          if ((type === 'object' || type === 'function') && !Object.isFrozen(prop)) {
              deepFreeze(prop);
          }
      });
      return obj;
  }
  /** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
  /** @typedef {import('highlight.js').CompiledMode} CompiledMode */
  /** @implements CallbackResponse */
  class Response {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
          // eslint-disable-next-line no-undefined
          if (mode.data === undefined)
              mode.data = {};
          this.data = mode.data;
          this.isMatchIgnored = false;
      }
      ignoreMatch() {
          this.isMatchIgnored = true;
      }
  }
  /**
   * @param {string} value
   * @returns {string}
   */
  function escapeHTML(value) {
      return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
  }
  /**
   * performs a shallow merge of multiple objects into one
   *
   * @template T
   * @param {T} original
   * @param {Record<string,any>[]} objects
   * @returns {T} a single new object
   */
  function inherit$1(original, ...objects) {
      /** @type Record<string,any> */
      const result = Object.create(null);
      for (const key in original) {
          result[key] = original[key];
      }
      objects.forEach(function (obj) {
          for (const key in obj) {
              result[key] = obj[key];
          }
      });
      return /** @type {T} */ (result);
  }
  /**
   * @typedef {object} Renderer
   * @property {(text: string) => void} addText
   * @property {(node: Node) => void} openNode
   * @property {(node: Node) => void} closeNode
   * @property {() => string} value
   */
  /** @typedef {{scope?: string, language?: string, sublanguage?: boolean}} Node */
  /** @typedef {{walk: (r: Renderer) => void}} Tree */
  /** */
  const SPAN_CLOSE = '</span>';
  /**
   * Determines if a node needs to be wrapped in <span>
   *
   * @param {Node} node */
  const emitsWrappingTags = (node) => {
      // rarely we can have a sublanguage where language is undefined
      // TODO: track down why
      return !!node.scope;
  };
  /**
   *
   * @param {string} name
   * @param {{prefix:string}} options
   */
  const scopeToCSSClass = (name, { prefix }) => {
      // sub-language
      if (name.startsWith("language:")) {
          return name.replace("language:", "language-");
      }
      // tiered scope: comment.line
      if (name.includes(".")) {
          const pieces = name.split(".");
          return [
              `${prefix}${pieces.shift()}`,
              ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
          ].join(" ");
      }
      // simple scope
      return `${prefix}${name}`;
  };
  /** @type {Renderer} */
  class HTMLRenderer {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
          this.buffer = "";
          this.classPrefix = options.classPrefix;
          parseTree.walk(this);
      }
      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
          this.buffer += escapeHTML(text);
      }
      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
          if (!emitsWrappingTags(node))
              return;
          const className = scopeToCSSClass(node.scope, { prefix: this.classPrefix });
          this.span(className);
      }
      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
          if (!emitsWrappingTags(node))
              return;
          this.buffer += SPAN_CLOSE;
      }
      /**
       * returns the accumulated buffer
      */
      value() {
          return this.buffer;
      }
      // helpers
      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
          this.buffer += `<span class="${className}">`;
      }
  }
  /** @typedef {{scope?: string, language?: string, children: Node[]} | string} Node */
  /** @typedef {{scope?: string, language?: string, children: Node[]} } DataNode */
  /** @typedef {import('highlight.js').Emitter} Emitter */
  /**  */
  /** @returns {DataNode} */
  const newNode = (opts = {}) => {
      /** @type DataNode */
      const result = { children: [] };
      Object.assign(result, opts);
      return result;
  };
  class TokenTree {
      constructor() {
          /** @type DataNode */
          this.rootNode = newNode();
          this.stack = [this.rootNode];
      }
      get top() {
          return this.stack[this.stack.length - 1];
      }
      get root() { return this.rootNode; }
      /** @param {Node} node */
      add(node) {
          this.top.children.push(node);
      }
      /** @param {string} scope */
      openNode(scope) {
          /** @type Node */
          const node = newNode({ scope });
          this.add(node);
          this.stack.push(node);
      }
      closeNode() {
          if (this.stack.length > 1) {
              return this.stack.pop();
          }
          // eslint-disable-next-line no-undefined
          return undefined;
      }
      closeAllNodes() {
          while (this.closeNode())
              ;
      }
      toJSON() {
          return JSON.stringify(this.rootNode, null, 4);
      }
      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
          // this does not
          return this.constructor._walk(builder, this.rootNode);
          // this works
          // return TokenTree._walk(builder, this.rootNode);
      }
      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
          if (typeof node === "string") {
              builder.addText(node);
          }
          else if (node.children) {
              builder.openNode(node);
              node.children.forEach((child) => this._walk(builder, child));
              builder.closeNode(node);
          }
          return builder;
      }
      /**
       * @param {Node} node
       */
      static _collapse(node) {
          if (typeof node === "string")
              return;
          if (!node.children)
              return;
          if (node.children.every(el => typeof el === "string")) {
              // node.text = node.children.join("");
              // delete node.children;
              node.children = [node.children.join("")];
          }
          else {
              node.children.forEach((child) => {
                  TokenTree._collapse(child);
              });
          }
      }
  }
  /**
    Currently this is all private API, but this is the minimal API necessary
    that an Emitter must implement to fully support the parser.

    Minimal interface:

    - addText(text)
    - __addSublanguage(emitter, subLanguageName)
    - startScope(scope)
    - endScope()
    - finalize()
    - toHTML()

  */
  /**
   * @implements {Emitter}
   */
  class TokenTreeEmitter extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
          super();
          this.options = options;
      }
      /**
       * @param {string} text
       */
      addText(text) {
          if (text === "") {
              return;
          }
          this.add(text);
      }
      /** @param {string} scope */
      startScope(scope) {
          this.openNode(scope);
      }
      endScope() {
          this.closeNode();
      }
      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      __addSublanguage(emitter, name) {
          /** @type DataNode */
          const node = emitter.root;
          if (name)
              node.scope = `language:${name}`;
          this.add(node);
      }
      toHTML() {
          const renderer = new HTMLRenderer(this, this.options);
          return renderer.value();
      }
      finalize() {
          this.closeAllNodes();
          return true;
      }
  }
  /**
   * @param {string} value
   * @returns {RegExp}
   * */
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
      if (!re)
          return null;
      if (typeof re === "string")
          return re;
      return re.source;
  }
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function lookahead(re) {
      return concat('(?=', re, ')');
  }
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function anyNumberOfTimes(re) {
      return concat('(?:', re, ')*');
  }
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function optional(re) {
      return concat('(?:', re, ')?');
  }
  /**
   * @param {...(RegExp | string) } args
   * @returns {string}
   */
  function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
  }
  /**
   * @param { Array<string | RegExp | Object> } args
   * @returns {object}
   */
  function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];
      if (typeof opts === 'object' && opts.constructor === Object) {
          args.splice(args.length - 1, 1);
          return opts;
      }
      else {
          return {};
      }
  }
  /** @typedef { {capture?: boolean} } RegexEitherOptions */
  /**
   * Any of the passed expresssions may match
   *
   * Creates a huge this | this | that | that match
   * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
   * @returns {string}
   */
  function either(...args) {
      /** @type { object & {capture?: boolean} }  */
      const opts = stripOptionsFromArgs(args);
      const joined = '('
          + (opts.capture ? "" : "?:")
          + args.map((x) => source(x)).join("|") + ")";
      return joined;
  }
  /**
   * @param {RegExp | string} re
   * @returns {number}
   */
  function countMatchGroups(re) {
      return (new RegExp(re.toString() + '|')).exec('').length - 1;
  }
  /**
   * Does lexeme start with a regular expression match at the beginning
   * @param {RegExp} re
   * @param {string} lexeme
   */
  function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
  }
  // BACKREF_RE matches an open parenthesis or backreference. To avoid an
  // incorrect parse, it also matches the constructs where the meaning of
  // parentheses, escapes, or capture counting changes.
  const BACKREF_RE = new RegExp(either(/\[(?:[^\\\]]|\\.)*\]/, // a character class, inside which ( and \ lose their meaning
  /\(\?<(?![=!])[^>]+>/, // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
  /\(\?'[^']+'/, // a named capture group `(?'name'`
  /\(\??/, // an opening parenthesis, capturing or non-capturing / lookahead
  /\\([1-9][0-9]*)/, // a backreference like `\1`
  /\\./ // any other escape sequence
  ));
  // **INTERNAL** Not intended for outside usage
  // join logically computes regexps.join(separator), but fixes the
  // backreferences so they continue to match.
  // it also places each individual regular expression into it's own
  // match group, keeping track of the sequencing of those match groups
  // is currently an exercise for the caller. :-)
  /**
   * @param {(string | RegExp)[]} regexps
   * @param {{joinWith: string}} opts
   * @returns {string}
   */
  function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;
      return regexps.map((regex) => {
          numCaptures += 1;
          const offset = numCaptures;
          let re = source(regex);
          let out = '';
          while (re.length > 0) {
              const match = BACKREF_RE.exec(re);
              if (!match) {
                  out += re;
                  break;
              }
              out += re.substring(0, match.index);
              re = re.substring(match.index + match[0].length);
              if (match[0][0] === '\\' && match[1]) {
                  // Adjust the backreference.
                  out += '\\' + String(Number(match[1]) + offset);
              }
              else {
                  out += match[0];
                  if (match[0] === '(' || /^\(\?[<']/.test(match[0])) {
                      numCaptures++;
                  }
              }
          }
          return out;
      }).map(re => `(${re})`).join(joinWith);
  }
  /** @typedef {import('highlight.js').Mode} Mode */
  /** @typedef {import('highlight.js').ModeCallback} ModeCallback */
  // Common regexps
  const MATCH_NOTHING_RE = /\b\B/;
  const IDENT_RE = '[a-zA-Z]\\w*';
  const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
  const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';
  /**
  * @param { Partial<Mode> & {binary?: string | RegExp} } opts
  */
  const SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
          opts.begin = concat(beginShebang, /.*\b/, opts.binary, /\b.*/);
      }
      return inherit$1({
          scope: 'meta',
          begin: beginShebang,
          end: /$/,
          relevance: 0,
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
              if (m.index !== 0)
                  resp.ignoreMatch();
          }
      }, opts);
  };
  // Common modes
  const BACKSLASH_ESCAPE = {
      begin: '\\\\[\\s\\S]', relevance: 0
  };
  const APOS_STRING_MODE = {
      scope: 'string',
      begin: '\'',
      end: '\'',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
  };
  const QUOTE_STRING_MODE = {
      scope: 'string',
      begin: '"',
      end: '"',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
  };
  const PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  };
  /**
   * Creates a comment mode
   *
   * @param {string | RegExp} begin
   * @param {string | RegExp} end
   * @param {Mode | {}} [modeOptions]
   * @returns {Partial<Mode>}
   */
  const COMMENT = function (begin, end, modeOptions = {}) {
      const mode = inherit$1({
          scope: 'comment',
          begin,
          end,
          contains: []
      }, modeOptions);
      mode.contains.push({
          scope: 'doctag',
          // hack to avoid the space from being included. the space is necessary to
          // match here to prevent the plain text rule below from gobbling up doctags
          begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
          end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
          excludeBegin: true,
          relevance: 0
      });
      const ENGLISH_WORD = either(
      // list of common 1 and 2 letter words in English
      "I", "a", "is", "so", "us", "to", "at", "if", "in", "it", "on", 
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
      );
      // looking like plain text, more likely to be a comment
      mode.contains.push({
          // TODO: how to include ", (, ) without breaking grammars that use these for
          // comment delimiters?
          // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
          // ---
          // this tries to find sequences of 3 english words in a row (without any
          // "programming" type syntax) this gives us a strong signal that we've
          // TRULY found a comment - vs perhaps scanning with the wrong language.
          // It's possible to find something that LOOKS like the start of the
          // comment - but then if there is no readable text - good chance it is a
          // false match and not a comment.
          //
          // for a visual example please see:
          // https://github.com/highlightjs/highlight.js/issues/2827
          begin: concat(/[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          '(', ENGLISH_WORD, /[.]?[:]?([.][ ]|[ ])/, '){3}') // look for 3 words in a row
      });
      return mode;
  };
  const C_LINE_COMMENT_MODE = COMMENT('//', '$');
  const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
  const HASH_COMMENT_MODE = COMMENT('#', '$');
  const NUMBER_MODE = {
      scope: 'number',
      begin: NUMBER_RE,
      relevance: 0
  };
  const C_NUMBER_MODE = {
      scope: 'number',
      begin: C_NUMBER_RE,
      relevance: 0
  };
  const BINARY_NUMBER_MODE = {
      scope: 'number',
      begin: BINARY_NUMBER_RE,
      relevance: 0
  };
  const REGEXP_MODE = {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [
          BACKSLASH_ESCAPE,
          {
              begin: /\[/,
              end: /\]/,
              relevance: 0,
              contains: [BACKSLASH_ESCAPE]
          }
      ]
  };
  const TITLE_MODE = {
      scope: 'title',
      begin: IDENT_RE,
      relevance: 0
  };
  const UNDERSCORE_TITLE_MODE = {
      scope: 'title',
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
  };
  const METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
      relevance: 0
  };
  /**
   * Adds end same as begin mechanics to a mode
   *
   * Your mode must include at least a single () match group as that first match
   * group is what is used for comparison
   * @param {Partial<Mode>} mode
   */
  const END_SAME_AS_BEGIN = function (mode) {
      return Object.assign(mode, {
          /** @type {ModeCallback} */
          'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
          /** @type {ModeCallback} */
          'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1])
              resp.ignoreMatch(); }
      });
  };
  var MODES = /*#__PURE__*/ Object.freeze({
      __proto__: null,
      APOS_STRING_MODE: APOS_STRING_MODE,
      BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
      BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
      BINARY_NUMBER_RE: BINARY_NUMBER_RE,
      COMMENT: COMMENT,
      C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
      C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
      C_NUMBER_MODE: C_NUMBER_MODE,
      C_NUMBER_RE: C_NUMBER_RE,
      END_SAME_AS_BEGIN: END_SAME_AS_BEGIN,
      HASH_COMMENT_MODE: HASH_COMMENT_MODE,
      IDENT_RE: IDENT_RE,
      MATCH_NOTHING_RE: MATCH_NOTHING_RE,
      METHOD_GUARD: METHOD_GUARD,
      NUMBER_MODE: NUMBER_MODE,
      NUMBER_RE: NUMBER_RE,
      PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
      QUOTE_STRING_MODE: QUOTE_STRING_MODE,
      REGEXP_MODE: REGEXP_MODE,
      RE_STARTERS_RE: RE_STARTERS_RE,
      SHEBANG: SHEBANG,
      TITLE_MODE: TITLE_MODE,
      UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
      UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE
  });
  /**
  @typedef {import('highlight.js').CallbackResponse} CallbackResponse
  @typedef {import('highlight.js').CompilerExt} CompilerExt
  */
  // Grammar extensions / plugins
  // See: https://github.com/highlightjs/highlight.js/issues/2833
  // Grammar extensions allow "syntactic sugar" to be added to the grammar modes
  // without requiring any underlying changes to the compiler internals.
  // `compileMatch` being the perfect small example of now allowing a grammar
  // author to write `match` when they desire to match a single expression rather
  // than being forced to use `begin`.  The extension then just moves `match` into
  // `begin` when it runs.  Ie, no features have been added, but we've just made
  // the experience of writing (and reading grammars) a little bit nicer.
  // ------
  // TODO: We need negative look-behind support to do this properly
  /**
   * Skip a match if it has a preceding dot
   *
   * This is used for `beginKeywords` to prevent matching expressions such as
   * `bob.keyword.do()`. The mode compiler automatically wires this up as a
   * special _internal_ 'on:begin' callback for modes with `beginKeywords`
   * @param {RegExpMatchArray} match
   * @param {CallbackResponse} response
   */
  function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
          response.ignoreMatch();
      }
  }
  /**
   *
   * @type {CompilerExt}
   */
  function scopeClassName(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.className !== undefined) {
          mode.scope = mode.className;
          delete mode.className;
      }
  }
  /**
   * `beginKeywords` syntactic sugar
   * @type {CompilerExt}
   */
  function beginKeywords(mode, parent) {
      if (!parent)
          return;
      if (!mode.beginKeywords)
          return;
      // for languages with keywords that include non-word characters checking for
      // a word boundary is not sufficient, so instead we check for a word boundary
      // or whitespace - this does no harm in any case since our keyword engine
      // doesn't allow spaces in keywords anyways and we still check for the boundary
      // first
      mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;
      // prevents double relevance, the keywords themselves provide
      // relevance, the mode doesn't need to double it
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined)
          mode.relevance = 0;
  }
  /**
   * Allow `illegal` to contain an array of illegal values
   * @type {CompilerExt}
   */
  function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal))
          return;
      mode.illegal = either(...mode.illegal);
  }
  /**
   * `match` to match a single expression for readability
   * @type {CompilerExt}
   */
  function compileMatch(mode, _parent) {
      if (!mode.match)
          return;
      if (mode.begin || mode.end)
          throw new Error("begin & end are not supported with match");
      mode.begin = mode.match;
      delete mode.match;
  }
  /**
   * provides the default 1 relevance to all modes
   * @type {CompilerExt}
   */
  function compileRelevance(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined)
          mode.relevance = 1;
  }
  // allow beforeMatch to act as a "qualifier" for the match
  // the full match begin must be [beforeMatch][begin]
  const beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch)
          return;
      // starts conflicts with endsParent which we need to make sure the child
      // rule is not matched multiple times
      if (mode.starts)
          throw new Error("beforeMatch cannot be used with starts");
      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => { delete mode[key]; });
      mode.keywords = originalMode.keywords;
      mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
      mode.starts = {
          relevance: 0,
          contains: [
              Object.assign(originalMode, { endsParent: true })
          ]
      };
      mode.relevance = 0;
      delete originalMode.beforeMatch;
  };
  // keywords that should have no default relevance value
  const COMMON_KEYWORDS = [
      'of',
      'and',
      'for',
      'in',
      'not',
      'or',
      'if',
      'then',
      'parent', // common variable name
      'list', // common variable name
      'value' // common variable name
  ];
  const DEFAULT_KEYWORD_SCOPE = "keyword";
  /**
   * Given raw keywords from a language definition, compile them.
   *
   * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
   * @param {boolean} caseInsensitive
   */
  function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      /** @type {import("highlight.js/private").KeywordDict} */
      const compiledKeywords = Object.create(null);
      // input can be a string of keywords, an array of keywords, or a object with
      // named keys representing scopeName (which can then point to a string or array)
      if (typeof rawKeywords === 'string') {
          compileList(scopeName, rawKeywords.split(" "));
      }
      else if (Array.isArray(rawKeywords)) {
          compileList(scopeName, rawKeywords);
      }
      else {
          Object.keys(rawKeywords).forEach(function (scopeName) {
              // collapse all our objects back into the parent object
              Object.assign(compiledKeywords, compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName));
          });
      }
      return compiledKeywords;
      // ---
      /**
       * Compiles an individual list of keywords
       *
       * Ex: "for if when while|5"
       *
       * @param {string} scopeName
       * @param {Array<string>} keywordList
       */
      function compileList(scopeName, keywordList) {
          if (caseInsensitive) {
              keywordList = keywordList.map(x => x.toLowerCase());
          }
          keywordList.forEach(function (keyword) {
              const pair = keyword.split('|');
              compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
          });
      }
  }
  /**
   * Returns the proper score for a given keyword
   *
   * Also takes into account comment keywords, which will be scored 0 UNLESS
   * another score has been manually assigned.
   * @param {string} keyword
   * @param {string} [providedScore]
   */
  function scoreForKeyword(keyword, providedScore) {
      // manual scores always win over common keywords
      // so you can force a score of 1 if you really insist
      if (providedScore) {
          return Number(providedScore);
      }
      return commonKeyword(keyword) ? 0 : 1;
  }
  /**
   * Determines if a given keyword is common or not
   *
   * @param {string} keyword */
  function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
  }
  /*

  For the reasoning behind this please see:
  https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

  */
  /**
   * @type {Record<string, boolean>}
   */
  const seenDeprecations = {};
  /**
   * @param {string} message
   */
  const error = (message) => {
      console.error(message);
  };
  /**
   * @param {string} message
   * @param {any} args
   */
  const warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
  };
  /**
   * @param {string} version
   * @param {string} message
   */
  const deprecated = (version, message) => {
      if (seenDeprecations[`${version}/${message}`])
          return;
      console.log(`Deprecated as of ${version}. ${message}`);
      seenDeprecations[`${version}/${message}`] = true;
  };
  /* eslint-disable no-throw-literal */
  /**
  @typedef {import('highlight.js').CompiledMode} CompiledMode
  */
  const MultiClassError = new Error();
  /**
   * Renumbers labeled scope names to account for additional inner match
   * groups that otherwise would break everything.
   *
   * Lets say we 3 match scopes:
   *
   *   { 1 => ..., 2 => ..., 3 => ... }
   *
   * So what we need is a clean match like this:
   *
   *   (a)(b)(c) => [ "a", "b", "c" ]
   *
   * But this falls apart with inner match groups:
   *
   * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
   *
   * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
   * What needs to happen is the numbers are remapped:
   *
   *   { 1 => ..., 2 => ..., 5 => ... }
   *
   * We also need to know that the ONLY groups that should be output
   * are 1, 2, and 5.  This function handles this behavior.
   *
   * @param {CompiledMode} mode
   * @param {Array<RegExp | string>} regexes
   * @param {{key: "beginScope"|"endScope"}} opts
   */
  function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      /** @type Record<number,boolean> */
      const emit = {};
      /** @type Record<number,string> */
      const positions = {};
      for (let i = 1; i <= regexes.length; i++) {
          positions[i + offset] = scopeNames[i];
          emit[i + offset] = true;
          offset += countMatchGroups(regexes[i - 1]);
      }
      // we use _emit to keep track of which match groups are "top-level" to avoid double
      // output from inside match groups
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
  }
  /**
   * @param {CompiledMode} mode
   */
  function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin))
          return;
      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
          error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
          throw MultiClassError;
      }
      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
          error("beginScope must be object");
          throw MultiClassError;
      }
      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
  }
  /**
   * @param {CompiledMode} mode
   */
  function endMultiClass(mode) {
      if (!Array.isArray(mode.end))
          return;
      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
          error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
          throw MultiClassError;
      }
      if (typeof mode.endScope !== "object" || mode.endScope === null) {
          error("endScope must be object");
          throw MultiClassError;
      }
      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
  }
  /**
   * this exists only to allow `scope: {}` to be used beside `match:`
   * Otherwise `beginScope` would necessary and that would look weird

    {
      match: [ /def/, /\w+/ ]
      scope: { 1: "keyword" , 2: "title" }
    }

   * @param {CompiledMode} mode
   */
  function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
          mode.beginScope = mode.scope;
          delete mode.scope;
      }
  }
  /**
   * @param {CompiledMode} mode
   */
  function MultiClass(mode) {
      scopeSugar(mode);
      if (typeof mode.beginScope === "string") {
          mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
          mode.endScope = { _wrap: mode.endScope };
      }
      beginMultiClass(mode);
      endMultiClass(mode);
  }
  /**
  @typedef {import('highlight.js').Mode} Mode
  @typedef {import('highlight.js').CompiledMode} CompiledMode
  @typedef {import('highlight.js').Language} Language
  @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
  @typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
  */
  // compilation
  /**
   * Compiles a language definition result
   *
   * Given the raw result of a language definition (Language), compiles this so
   * that it is ready for highlighting code.
   * @param {Language} language
   * @returns {CompiledLanguage}
   */
  function compileLanguage(language) {
      /**
       * Builds a regex with the case sensitivity of the current language
       *
       * @param {RegExp | string} value
       * @param {boolean} [global]
       */
      function langRe(value, global) {
          return new RegExp(source(value), 'm'
              + (language.case_insensitive ? 'i' : '')
              + (language.unicodeRegex ? 'u' : '')
              + (global ? 'g' : ''));
      }
      /**
        Stores multiple regular expressions and allows you to quickly search for
        them all in a string simultaneously - returning the first match.  It does
        this by creating a huge (a|b|c) regex - each individual item wrapped with ()
        and joined by `|` - using match groups to track position.  When a match is
        found checking which position in the array has content allows us to figure
        out which of the original regexes / match groups triggered the match.
    
        The match object itself (the result of `Regex.exec`) is returned but also
        enhanced by merging in any meta-data that was registered with the regex.
        This is how we keep track of which mode matched, and what type of rule
        (`illegal`, `begin`, end, etc).
      */
      class MultiRegex {
          constructor() {
              this.matchIndexes = {};
              // @ts-ignore
              this.regexes = [];
              this.matchAt = 1;
              this.position = 0;
          }
          // @ts-ignore
          addRule(re, opts) {
              opts.position = this.position++;
              // @ts-ignore
              this.matchIndexes[this.matchAt] = opts;
              this.regexes.push([opts, re]);
              this.matchAt += countMatchGroups(re) + 1;
          }
          compile() {
              if (this.regexes.length === 0) {
                  // avoids the need to check length every time exec is called
                  // @ts-ignore
                  this.exec = () => null;
              }
              const terminators = this.regexes.map(el => el[1]);
              this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
              this.lastIndex = 0;
          }
          /** @param {string} s */
          exec(s) {
              this.matcherRe.lastIndex = this.lastIndex;
              const match = this.matcherRe.exec(s);
              if (!match) {
                  return null;
              }
              // eslint-disable-next-line no-undefined
              const i = match.findIndex((el, i) => i > 0 && el !== undefined);
              // @ts-ignore
              const matchData = this.matchIndexes[i];
              // trim off any earlier non-relevant match groups (ie, the other regex
              // match groups that make up the multi-matcher)
              match.splice(0, i);
              return Object.assign(match, matchData);
          }
      }
      /*
        Created to solve the key deficiently with MultiRegex - there is no way to
        test for multiple matches at a single location.  Why would we need to do
        that?  In the future a more dynamic engine will allow certain matches to be
        ignored.  An example: if we matched say the 3rd regex in a large group but
        decided to ignore it - we'd need to started testing again at the 4th
        regex... but MultiRegex itself gives us no real way to do that.
    
        So what this class creates MultiRegexs on the fly for whatever search
        position they are needed.
    
        NOTE: These additional MultiRegex objects are created dynamically.  For most
        grammars most of the time we will never actually need anything more than the
        first MultiRegex - so this shouldn't have too much overhead.
    
        Say this is our search group, and we match regex3, but wish to ignore it.
    
          regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0
    
        What we need is a new MultiRegex that only includes the remaining
        possibilities:
    
          regex4 | regex5                               ' ie, startAt = 3
    
        This class wraps all that complexity up in a simple API... `startAt` decides
        where in the array of expressions to start doing the matching. It
        auto-increments, so if a match is found at position 2, then startAt will be
        set to 3.  If the end is reached startAt will return to 0.
    
        MOST of the time the parser will be setting startAt manually to 0.
      */
      class ResumableMultiRegex {
          constructor() {
              // @ts-ignore
              this.rules = [];
              // @ts-ignore
              this.multiRegexes = [];
              this.count = 0;
              this.lastIndex = 0;
              this.regexIndex = 0;
          }
          // @ts-ignore
          getMatcher(index) {
              if (this.multiRegexes[index])
                  return this.multiRegexes[index];
              const matcher = new MultiRegex();
              this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
              matcher.compile();
              this.multiRegexes[index] = matcher;
              return matcher;
          }
          resumingScanAtSamePosition() {
              return this.regexIndex !== 0;
          }
          considerAll() {
              this.regexIndex = 0;
          }
          // @ts-ignore
          addRule(re, opts) {
              this.rules.push([re, opts]);
              if (opts.type === "begin")
                  this.count++;
          }
          /** @param {string} s */
          exec(s) {
              const m = this.getMatcher(this.regexIndex);
              m.lastIndex = this.lastIndex;
              let result = m.exec(s);
              // The following is because we have no easy way to say "resume scanning at the
              // existing position but also skip the current rule ONLY". What happens is
              // all prior rules are also skipped which can result in matching the wrong
              // thing. Example of matching "booger":
              // our matcher is [string, "booger", number]
              //
              // ....booger....
              // if "booger" is ignored then we'd really need a regex to scan from the
              // SAME position for only: [string, number] but ignoring "booger" (if it
              // was the first match), a simple resume would scan ahead who knows how
              // far looking only for "number", ignoring potential string matches (or
              // future "booger" matches that might be valid.)
              // So what we do: We execute two matchers, one resuming at the same
              // position, but the second full matcher starting at the position after:
              //     /--- resume first regex match here (for [number])
              //     |/---- full match here for [string, "booger", number]
              //     vv
              // ....booger....
              // Which ever results in a match first is then used. So this 3-4 step
              // process essentially allows us to say "match at this position, excluding
              // a prior rule that was ignored".
              //
              // 1. Match "booger" first, ignore. Also proves that [string] does non match.
              // 2. Resume matching for [number]
              // 3. Match at index + 1 for [string, "booger", number]
              // 4. If #2 and #3 result in matches, which came first?
              if (this.resumingScanAtSamePosition()) {
                  if (result && result.index === this.lastIndex)
                      ;
                  else { // use the second matcher result
                      const m2 = this.getMatcher(0);
                      m2.lastIndex = this.lastIndex + 1;
                      result = m2.exec(s);
                  }
              }
              if (result) {
                  this.regexIndex += result.position + 1;
                  if (this.regexIndex === this.count) {
                      // wrap-around to considering all matches again
                      this.considerAll();
                  }
              }
              return result;
          }
      }
      /**
       * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
       * the content and find matches.
       *
       * @param {CompiledMode} mode
       * @returns {ResumableMultiRegex}
       */
      function buildModeRegex(mode) {
          const mm = new ResumableMultiRegex();
          mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));
          if (mode.terminatorEnd) {
              mm.addRule(mode.terminatorEnd, { type: "end" });
          }
          if (mode.illegal) {
              mm.addRule(mode.illegal, { type: "illegal" });
          }
          return mm;
      }
      /** skip vs abort vs ignore
       *
       * @skip   - The mode is still entered and exited normally (and contains rules apply),
       *           but all content is held and added to the parent buffer rather than being
       *           output when the mode ends.  Mostly used with `sublanguage` to build up
       *           a single large buffer than can be parsed by sublanguage.
       *
       *             - The mode begin ands ends normally.
       *             - Content matched is added to the parent mode buffer.
       *             - The parser cursor is moved forward normally.
       *
       * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
       *           never matched) but DOES NOT continue to match subsequent `contains`
       *           modes.  Abort is bad/suboptimal because it can result in modes
       *           farther down not getting applied because an earlier rule eats the
       *           content but then aborts.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is added to the mode buffer.
       *             - The parser cursor is moved forward accordingly.
       *
       * @ignore - Ignores the mode (as if it never matched) and continues to match any
       *           subsequent `contains` modes.  Ignore isn't technically possible with
       *           the current parser implementation.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is ignored.
       *             - The parser cursor is not moved forward.
       */
      /**
       * Compiles an individual mode
       *
       * This can raise an error if the mode contains certain detectable known logic
       * issues.
       * @param {Mode} mode
       * @param {CompiledMode | null} [parent]
       * @returns {CompiledMode | never}
       */
      function compileMode(mode, parent) {
          const cmode = /** @type CompiledMode */ (mode);
          if (mode.isCompiled)
              return cmode;
          [
              scopeClassName,
              // do this early so compiler extensions generally don't have to worry about
              // the distinction between match/begin
              compileMatch,
              MultiClass,
              beforeMatchExt
          ].forEach(ext => ext(mode, parent));
          language.compilerExtensions.forEach(ext => ext(mode, parent));
          // __beforeBegin is considered private API, internal use only
          mode.__beforeBegin = null;
          [
              beginKeywords,
              // do this later so compiler extensions that come earlier have access to the
              // raw array if they wanted to perhaps manipulate it, etc.
              compileIllegal,
              // default to 1 relevance if not specified
              compileRelevance
          ].forEach(ext => ext(mode, parent));
          mode.isCompiled = true;
          let keywordPattern = null;
          if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
              // we need a copy because keywords might be compiled multiple times
              // so we can't go deleting $pattern from the original on the first
              // pass
              mode.keywords = Object.assign({}, mode.keywords);
              keywordPattern = mode.keywords.$pattern;
              delete mode.keywords.$pattern;
          }
          keywordPattern = keywordPattern || /\w+/;
          if (mode.keywords) {
              mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
          }
          cmode.keywordPatternRe = langRe(keywordPattern, true);
          if (parent) {
              if (!mode.begin)
                  mode.begin = /\B|\b/;
              cmode.beginRe = langRe(cmode.begin);
              if (!mode.end && !mode.endsWithParent)
                  mode.end = /\B|\b/;
              if (mode.end)
                  cmode.endRe = langRe(cmode.end);
              cmode.terminatorEnd = source(cmode.end) || '';
              if (mode.endsWithParent && parent.terminatorEnd) {
                  cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
              }
          }
          if (mode.illegal)
              cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
          if (!mode.contains)
              mode.contains = [];
          mode.contains = [].concat(...mode.contains.map(function (c) {
              return expandOrCloneMode(c === 'self' ? mode : c);
          }));
          mode.contains.forEach(function (c) { compileMode(/** @type Mode */ (c), cmode); });
          if (mode.starts) {
              compileMode(mode.starts, parent);
          }
          cmode.matcher = buildModeRegex(cmode);
          return cmode;
      }
      if (!language.compilerExtensions)
          language.compilerExtensions = [];
      // self is not valid at the top-level
      if (language.contains && language.contains.includes('self')) {
          throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }
      // we need a null object, which inherit will guarantee
      language.classNameAliases = inherit$1(language.classNameAliases || {});
      return compileMode(/** @type Mode */ (language));
  }
  /**
   * Determines if a mode has a dependency on it's parent or not
   *
   * If a mode does have a parent dependency then often we need to clone it if
   * it's used in multiple places so that each copy points to the correct parent,
   * where-as modes without a parent can often safely be re-used at the bottom of
   * a mode chain.
   *
   * @param {Mode | null} mode
   * @returns {boolean} - is there a dependency on the parent?
   * */
  function dependencyOnParent(mode) {
      if (!mode)
          return false;
      return mode.endsWithParent || dependencyOnParent(mode.starts);
  }
  /**
   * Expands a mode or clones it if necessary
   *
   * This is necessary for modes with parental dependenceis (see notes on
   * `dependencyOnParent`) and for nodes that have `variants` - which must then be
   * exploded into their own individual modes at compile time.
   *
   * @param {Mode} mode
   * @returns {Mode | Mode[]}
   * */
  function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
          mode.cachedVariants = mode.variants.map(function (variant) {
              return inherit$1(mode, { variants: null }, variant);
          });
      }
      // EXPAND
      // if we have variants then essentially "replace" the mode with the variants
      // this happens in compileMode, where this function is called from
      if (mode.cachedVariants) {
          return mode.cachedVariants;
      }
      // CLONE
      // if we have dependencies on parents then we need a unique
      // instance of ourselves, so we can be reused with many
      // different parents without issue
      if (dependencyOnParent(mode)) {
          return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }
      if (Object.isFrozen(mode)) {
          return inherit$1(mode);
      }
      // no special dependency issues, just return ourselves
      return mode;
  }
  var version = "11.12.0";
  class HTMLInjectionError extends Error {
      constructor(reason, html) {
          super(reason);
          this.name = "HTMLInjectionError";
          this.html = html;
      }
  }
  /*
  Syntax highlighting with language autodetection.
  https://highlightjs.org/
  */
  /**
  @typedef {import('highlight.js').Mode} Mode
  @typedef {import('highlight.js').CompiledMode} CompiledMode
  @typedef {import('highlight.js').CompiledScope} CompiledScope
  @typedef {import('highlight.js').Language} Language
  @typedef {import('highlight.js').HLJSApi} HLJSApi
  @typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
  @typedef {import('highlight.js').PluginEvent} PluginEvent
  @typedef {import('highlight.js').HLJSOptions} HLJSOptions
  @typedef {import('highlight.js').LanguageFn} LanguageFn
  @typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
  @typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
  @typedef {import('highlight.js/private').MatchType} MatchType
  @typedef {import('highlight.js/private').KeywordData} KeywordData
  @typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
  @typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
  @typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
  @typedef {import('highlight.js').HighlightOptions} HighlightOptions
  @typedef {import('highlight.js').HighlightResult} HighlightResult
  */
  const escape = escapeHTML;
  const inherit = inherit$1;
  const NO_MATCH = Symbol("nomatch");
  const MAX_KEYWORD_HITS = 7;
  /**
   * @param {any} hljs - object that is extended (legacy)
   * @returns {HLJSApi}
   */
  const HLJS = function (hljs) {
      // Global internal variables used within the highlight.js library.
      /** @type {Record<string, Language>} */
      const languages = Object.create(null);
      /** @type {Record<string, string>} */
      const aliases = Object.create(null);
      /** @type {HLJSPlugin[]} */
      const plugins = [];
      // safe/production mode - swallows more errors, tries to keep running
      // even if a single syntax or parse hits a fatal error
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      /** @type {Language} */
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };
      // Global options used when within external APIs. This is modified when
      // calling the `hljs.configure` function.
      /** @type HLJSOptions */
      let options = {
          ignoreUnescapedHTML: false,
          throwUnescapedHTML: false,
          noHighlightRe: /^(no-?highlight)$/i,
          languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
          classPrefix: 'hljs-',
          cssSelector: 'pre code',
          languages: null,
          // beta configuration options, subject to change, welcome to discuss
          // https://github.com/highlightjs/highlight.js/issues/1086
          __emitter: TokenTreeEmitter
      };
      /* Utility functions */
      /**
       * Tests a language name to see if highlighting should be skipped
       * @param {string} languageName
       */
      function shouldNotHighlight(languageName) {
          return options.noHighlightRe.test(languageName);
      }
      /**
       * @param {HighlightedHTMLElement} block - the HTML element to determine language for
       */
      function blockLanguage(block) {
          let classes = block.className + ' ';
          classes += block.parentNode ? block.parentNode.className : '';
          // language-* takes precedence over non-prefixed class names.
          const match = options.languageDetectRe.exec(classes);
          if (match) {
              const language = getLanguage(match[1]);
              if (!language) {
                  warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
                  warn("Falling back to no-highlight mode for this block.", block);
              }
              return language ? match[1] : 'no-highlight';
          }
          return classes
              .split(/\s+/)
              .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }
      /**
       * Core highlighting function.
       *
       * OLD API
       * highlight(lang, code, ignoreIllegals, continuation)
       *
       * NEW API
       * highlight(code, {lang, ignoreIllegals})
       *
       * @param {string} codeOrLanguageName - the language to use for highlighting
       * @param {string | HighlightOptions} optionsOrCode - the code to highlight
       * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       *
       * @returns {HighlightResult} Result - an object that represents the result
       * @property {string} language - the language name
       * @property {number} relevance - the relevance score
       * @property {string} value - the highlighted HTML code
       * @property {string} code - the original raw code
       * @property {CompiledMode} top - top of the current mode stack
       * @property {boolean} illegal - indicates whether any illegal matches were found
      */
      function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
          let code = "";
          let languageName = "";
          if (typeof optionsOrCode === "object") {
              code = codeOrLanguageName;
              ignoreIllegals = optionsOrCode.ignoreIllegals;
              languageName = optionsOrCode.language;
          }
          else {
              // old API
              deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
              deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
              languageName = codeOrLanguageName;
              code = optionsOrCode;
          }
          // https://github.com/highlightjs/highlight.js/issues/3149
          // eslint-disable-next-line no-undefined
          if (ignoreIllegals === undefined) {
              ignoreIllegals = true;
          }
          /** @type {BeforeHighlightContext} */
          const context = {
              code,
              language: languageName
          };
          // the plugin can change the desired language or the code to be highlighted
          // just be changing the object it was passed
          fire("before:highlight", context);
          // a before plugin can usurp the result completely by providing it's own
          // in which case we don't even need to call highlight
          const result = context.result
              ? context.result
              : _highlight(context.language, context.code, ignoreIllegals);
          result.code = context.code;
          // the plugin can change anything in result to suite it
          fire("after:highlight", result);
          return result;
      }
      /**
       * private highlight that's used internally and does not fire callbacks
       *
       * @param {string} languageName - the language to use for highlighting
       * @param {string} codeToHighlight - the code to highlight
       * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode?} [continuation] - current continuation mode, if any
       * @returns {HighlightResult} - result of the highlight operation
      */
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
          const keywordHits = Object.create(null);
          /**
           * Return keyword data if a match is a keyword
           * @param {CompiledMode} mode - current mode
           * @param {string} matchText - the textual match
           * @returns {KeywordData | false}
           */
          function keywordData(mode, matchText) {
              return mode.keywords[matchText];
          }
          function processKeywords() {
              if (!top.keywords) {
                  emitter.addText(modeBuffer);
                  return;
              }
              let lastIndex = 0;
              top.keywordPatternRe.lastIndex = 0;
              let match = top.keywordPatternRe.exec(modeBuffer);
              let buf = "";
              while (match) {
                  buf += modeBuffer.substring(lastIndex, match.index);
                  const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
                  const data = keywordData(top, word);
                  if (data) {
                      const [kind, keywordRelevance] = data;
                      emitter.addText(buf);
                      buf = "";
                      keywordHits[word] = (keywordHits[word] || 0) + 1;
                      if (keywordHits[word] <= MAX_KEYWORD_HITS)
                          relevance += keywordRelevance;
                      if (kind.startsWith("_")) {
                          // _ implied for relevance only, do not highlight
                          // by applying a class name
                          buf += match[0];
                      }
                      else {
                          const cssClass = language.classNameAliases[kind] || kind;
                          emitKeyword(match[0], cssClass);
                      }
                  }
                  else {
                      buf += match[0];
                  }
                  lastIndex = top.keywordPatternRe.lastIndex;
                  match = top.keywordPatternRe.exec(modeBuffer);
              }
              buf += modeBuffer.substring(lastIndex);
              emitter.addText(buf);
          }
          function processSubLanguage() {
              if (modeBuffer === "")
                  return;
              /** @type HighlightResult */
              let result = null;
              if (typeof top.subLanguage === 'string') {
                  if (!languages[top.subLanguage]) {
                      emitter.addText(modeBuffer);
                      return;
                  }
                  result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
                  continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
              }
              else {
                  result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
              }
              // Counting embedded language score towards the host language may be disabled
              // with zeroing the containing mode relevance. Use case in point is Markdown that
              // allows XML everywhere and makes every XML snippet to have a much larger Markdown
              // score.
              if (top.relevance > 0) {
                  relevance += result.relevance;
              }
              emitter.__addSublanguage(result._emitter, result.language);
          }
          function processBuffer() {
              if (top.subLanguage != null) {
                  processSubLanguage();
              }
              else {
                  processKeywords();
              }
              modeBuffer = '';
          }
          /**
           * @param {string} text
           * @param {string} scope
           */
          function emitKeyword(keyword, scope) {
              if (keyword === "")
                  return;
              emitter.startScope(scope);
              emitter.addText(keyword);
              emitter.endScope();
          }
          /**
           * @param {CompiledScope} scope
           * @param {RegExpMatchArray} match
           */
          function emitMultiClass(scope, match) {
              let i = 1;
              const max = match.length - 1;
              while (i <= max) {
                  if (!scope._emit[i]) {
                      i++;
                      continue;
                  }
                  const klass = language.classNameAliases[scope[i]] || scope[i];
                  const text = match[i];
                  if (klass) {
                      emitKeyword(text, klass);
                  }
                  else {
                      modeBuffer = text;
                      processKeywords();
                      modeBuffer = "";
                  }
                  i++;
              }
          }
          /**
           * @param {CompiledMode} mode - new mode to start
           * @param {RegExpMatchArray} match
           */
          function startNewMode(mode, match) {
              if (mode.scope && typeof mode.scope === "string") {
                  emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
              }
              if (mode.beginScope) {
                  // beginScope just wraps the begin match itself in a scope
                  if (mode.beginScope._wrap) {
                      emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
                      modeBuffer = "";
                  }
                  else if (mode.beginScope._multi) {
                      // at this point modeBuffer should just be the match
                      emitMultiClass(mode.beginScope, match);
                      modeBuffer = "";
                  }
              }
              top = Object.create(mode, { parent: { value: top } });
              return top;
          }
          /**
           * @param {CompiledMode } mode - the mode to potentially end
           * @param {RegExpMatchArray} match - the latest match
           * @param {string} matchPlusRemainder - match plus remainder of content
           * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
           */
          function endOfMode(mode, match, matchPlusRemainder) {
              let matched = startsWith(mode.endRe, matchPlusRemainder);
              if (matched) {
                  if (mode["on:end"]) {
                      const resp = new Response(mode);
                      mode["on:end"](match, resp);
                      if (resp.isMatchIgnored)
                          matched = false;
                  }
                  if (matched) {
                      while (mode.endsParent && mode.parent) {
                          mode = mode.parent;
                      }
                      return mode;
                  }
              }
              // even if on:end fires an `ignore` it's still possible
              // that we might trigger the end node because of a parent mode
              if (mode.endsWithParent) {
                  return endOfMode(mode.parent, match, matchPlusRemainder);
              }
          }
          /**
           * Handle matching but then ignoring a sequence of text
           *
           * @param {string} lexeme - string containing full match text
           */
          function doIgnore(lexeme) {
              if (top.matcher.regexIndex === 0) {
                  // no more regexes to potentially match here, so we move the cursor forward one
                  // space
                  modeBuffer += lexeme[0];
                  return 1;
              }
              else {
                  // no need to move the cursor, we still have additional regexes to try and
                  // match at this very spot
                  resumeScanAtSamePosition = true;
                  return 0;
              }
          }
          /**
           * Handle the start of a new potential mode match
           *
           * @param {EnhancedMatch} match - the current match
           * @returns {number} how far to advance the parse cursor
           */
          function doBeginMatch(match) {
              const lexeme = match[0];
              const newMode = match.rule;
              const resp = new Response(newMode);
              // first internal before callbacks, then the public ones
              const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
              for (const cb of beforeCallbacks) {
                  if (!cb)
                      continue;
                  cb(match, resp);
                  if (resp.isMatchIgnored)
                      return doIgnore(lexeme);
              }
              if (newMode.skip) {
                  modeBuffer += lexeme;
              }
              else {
                  if (newMode.excludeBegin) {
                      modeBuffer += lexeme;
                  }
                  processBuffer();
                  if (!newMode.returnBegin && !newMode.excludeBegin) {
                      modeBuffer = lexeme;
                  }
              }
              startNewMode(newMode, match);
              return newMode.returnBegin ? 0 : lexeme.length;
          }
          /**
           * Handle the potential end of mode
           *
           * @param {RegExpMatchArray} match - the current match
           */
          function doEndMatch(match) {
              const lexeme = match[0];
              const matchPlusRemainder = codeToHighlight.substring(match.index);
              const endMode = endOfMode(top, match, matchPlusRemainder);
              if (!endMode) {
                  return NO_MATCH;
              }
              const origin = top;
              if (top.endScope && top.endScope._wrap) {
                  processBuffer();
                  emitKeyword(lexeme, top.endScope._wrap);
              }
              else if (top.endScope && top.endScope._multi) {
                  processBuffer();
                  emitMultiClass(top.endScope, match);
              }
              else if (origin.skip) {
                  modeBuffer += lexeme;
              }
              else {
                  if (!(origin.returnEnd || origin.excludeEnd)) {
                      modeBuffer += lexeme;
                  }
                  processBuffer();
                  if (origin.excludeEnd) {
                      modeBuffer = lexeme;
                  }
              }
              do {
                  if (top.scope) {
                      emitter.closeNode();
                  }
                  if (!top.skip && !top.subLanguage) {
                      relevance += top.relevance;
                  }
                  top = top.parent;
              } while (top !== endMode.parent);
              if (endMode.starts) {
                  startNewMode(endMode.starts, match);
              }
              return origin.returnEnd ? 0 : lexeme.length;
          }
          function processContinuations() {
              const list = [];
              for (let current = top; current !== language; current = current.parent) {
                  if (current.scope) {
                      list.unshift(current.scope);
                  }
              }
              list.forEach(item => emitter.openNode(item));
          }
          /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
          let lastMatch = {};
          /**
           *  Process an individual match
           *
           * @param {string} textBeforeMatch - text preceding the match (since the last match)
           * @param {EnhancedMatch} [match] - the match itself
           */
          function processLexeme(textBeforeMatch, match) {
              const lexeme = match && match[0];
              // add non-matched text to the current mode buffer
              modeBuffer += textBeforeMatch;
              if (lexeme == null) {
                  processBuffer();
                  return 0;
              }
              // we've found a 0 width match and we're stuck, so we need to advance
              // this happens when we have badly behaved rules that have optional matchers to the degree that
              // sometimes they can end up matching nothing at all
              // Ref: https://github.com/highlightjs/highlight.js/issues/2140
              if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
                  // spit the "skipped" character that our regex choked on back into the output sequence
                  modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
                  if (!SAFE_MODE) {
                      /** @type {AnnotatedError} */
                      const err = new Error(`0 width match regex (${languageName})`);
                      err.languageName = languageName;
                      err.badRule = lastMatch.rule;
                      throw err;
                  }
                  return 1;
              }
              lastMatch = match;
              if (match.type === "begin") {
                  return doBeginMatch(match);
              }
              else if (match.type === "illegal" && !ignoreIllegals) {
                  // illegal match, we do not continue processing
                  /** @type {AnnotatedError} */
                  const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
                  err.mode = top;
                  throw err;
              }
              else if (match.type === "end") {
                  const processed = doEndMatch(match);
                  if (processed !== NO_MATCH) {
                      return processed;
                  }
              }
              // edge case for when illegal matches $ (end of line/text) which is technically
              // a 0 width match but not a begin/end match so it's not caught by the
              // first handler (when `ignoreIllegals` is true)
              if (match.type === "illegal" && lexeme === "") {
                  if (match.index === codeToHighlight.length)
                      ;
                  else {
                      // matched literal `\n` (with `$`) so we must manually add the newline
                      // itself to the modeBuffer so it is not lost when we advance the cursor
                      modeBuffer += "\n";
                  }
                  return 1;
              }
              // infinite loops are BAD, this is a last ditch catch all. if we have a
              // decent number of iterations yet our index (cursor position in our
              // parsing) still 3x behind our index then something is very wrong
              // so we bail
              if (iterations > 100000 && iterations > match.index * 3) {
                  const err = new Error('potential infinite loop, way more iterations than matches');
                  throw err;
              }
              /*
              Why might be find ourselves here?  An potential end match that was
              triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
              (this could be because a callback requests the match be ignored, etc)
        
              This causes no real harm other than stopping a few times too many.
              */
              modeBuffer += lexeme;
              return lexeme.length;
          }
          const language = getLanguage(languageName);
          if (!language) {
              error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
              throw new Error('Unknown language: "' + languageName + '"');
          }
          const md = compileLanguage(language);
          let result = '';
          /** @type {CompiledMode} */
          let top = continuation || md;
          /** @type Record<string,CompiledMode> */
          const continuations = {}; // keep continuations for sub-languages
          const emitter = new options.__emitter(options);
          processContinuations();
          let modeBuffer = '';
          let relevance = 0;
          let index = 0;
          let iterations = 0;
          let resumeScanAtSamePosition = false;
          try {
              if (!language.__emitTokens) {
                  top.matcher.considerAll();
                  for (;;) {
                      iterations++;
                      if (resumeScanAtSamePosition) {
                          // only regexes not matched previously will now be
                          // considered for a potential match
                          resumeScanAtSamePosition = false;
                      }
                      else {
                          top.matcher.considerAll();
                      }
                      top.matcher.lastIndex = index;
                      const match = top.matcher.exec(codeToHighlight);
                      // console.log("match", match[0], match.rule && match.rule.begin)
                      if (!match)
                          break;
                      const beforeMatch = codeToHighlight.substring(index, match.index);
                      const processedCount = processLexeme(beforeMatch, match);
                      index = match.index + processedCount;
                  }
                  processLexeme(codeToHighlight.substring(index));
              }
              else {
                  language.__emitTokens(codeToHighlight, emitter);
              }
              emitter.finalize();
              result = emitter.toHTML();
              return {
                  language: languageName,
                  value: result,
                  relevance,
                  illegal: false,
                  _emitter: emitter,
                  _top: top
              };
          }
          catch (err) {
              if (err.message && err.message.includes('Illegal')) {
                  return {
                      language: languageName,
                      value: escape(codeToHighlight),
                      illegal: true,
                      relevance: 0,
                      _illegalBy: {
                          message: err.message,
                          index,
                          context: codeToHighlight.slice(index - 100, index + 100),
                          mode: err.mode,
                          resultSoFar: result
                      },
                      _emitter: emitter
                  };
              }
              else if (SAFE_MODE) {
                  return {
                      language: languageName,
                      value: escape(codeToHighlight),
                      illegal: false,
                      relevance: 0,
                      errorRaised: err,
                      _emitter: emitter,
                      _top: top
                  };
              }
              else {
                  throw err;
              }
          }
      }
      /**
       * returns a valid highlight result, without actually doing any actual work,
       * auto highlight starts with this and it's possible for small snippets that
       * auto-detection may not find a better match
       * @param {string} code
       * @returns {HighlightResult}
       */
      function justTextHighlightResult(code) {
          const result = {
              value: escape(code),
              illegal: false,
              relevance: 0,
              _top: PLAINTEXT_LANGUAGE,
              _emitter: new options.__emitter(options)
          };
          result._emitter.addText(code);
          return result;
      }
      /**
      Highlighting with language detection. Accepts a string with the code to
      highlight. Returns an object with the following properties:
    
      - language (detected language)
      - relevance (int)
      - value (an HTML string with highlighting markup)
      - secondBest (object with the same structure for second-best heuristically
        detected language, may be absent)
    
        @param {string} code
        @param {Array<string>} [languageSubset]
        @returns {AutoHighlightResult}
      */
      function highlightAuto(code, languageSubset) {
          languageSubset = languageSubset || options.languages || Object.keys(languages);
          const plaintext = justTextHighlightResult(code);
          const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name => _highlight(name, code, false));
          results.unshift(plaintext); // plaintext is always an option
          const sorted = results.sort((a, b) => {
              // sort base on relevance
              if (a.relevance !== b.relevance)
                  return b.relevance - a.relevance;
              // always award the tie to the base language
              // ie if C++ and Arduino are tied, it's more likely to be C++
              if (a.language && b.language) {
                  if (getLanguage(a.language).supersetOf === b.language) {
                      return 1;
                  }
                  else if (getLanguage(b.language).supersetOf === a.language) {
                      return -1;
                  }
              }
              // otherwise say they are equal, which has the effect of sorting on
              // relevance while preserving the original ordering - which is how ties
              // have historically been settled, ie the language that comes first always
              // wins in the case of a tie
              return 0;
          });
          const [best, secondBest] = sorted;
          /** @type {AutoHighlightResult} */
          const result = best;
          result.secondBest = secondBest;
          return result;
      }
      /**
       * Builds new class name for block given the language name
       *
       * @param {HTMLElement} element
       * @param {string} [currentLang]
       * @param {string} [resultLang]
       */
      function updateClassName(element, currentLang, resultLang) {
          const language = (currentLang && aliases[currentLang]) || resultLang;
          element.classList.add("hljs");
          element.classList.add(`language-${language}`);
      }
      /**
       * Applies highlighting to a DOM node containing code.
       *
       * @param {HighlightedHTMLElement} element - the HTML element to highlight
      */
      function highlightElement(element) {
          /** @type HTMLElement */
          let node = null;
          const language = blockLanguage(element);
          if (shouldNotHighlight(language))
              return;
          fire("before:highlightElement", { el: element, language });
          if (element.dataset.highlighted) {
              console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
              return;
          }
          // we should be all text, no child nodes (unescaped HTML) - this is possibly
          // an HTML injection attack - it's likely too late if this is already in
          // production (the code has likely already done its damage by the time
          // we're seeing it)... but we yell loudly about this so that hopefully it's
          // more likely to be caught in development before making it to production
          if (element.children.length > 0) {
              if (!options.ignoreUnescapedHTML) {
                  console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
                  console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
                  console.warn("The element with unescaped HTML:");
                  console.warn(element);
              }
              if (options.throwUnescapedHTML) {
                  const err = new HTMLInjectionError("One of your code blocks includes unescaped HTML.", element.innerHTML);
                  throw err;
              }
          }
          node = element;
          const text = node.textContent;
          const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);
          element.innerHTML = result.value;
          element.dataset.highlighted = "yes";
          updateClassName(element, language, result.language);
          element.result = {
              language: result.language,
              // TODO: remove with version 11.0
              re: result.relevance,
              relevance: result.relevance
          };
          if (result.secondBest) {
              element.secondBest = {
                  language: result.secondBest.language,
                  relevance: result.secondBest.relevance
              };
          }
          fire("after:highlightElement", { el: element, result, text });
      }
      /**
       * Updates highlight.js global options with the passed options
       *
       * @param {Partial<HLJSOptions>} userOptions
       */
      function configure(userOptions) {
          options = inherit(options, userOptions);
      }
      // TODO: remove v12, deprecated
      const initHighlighting = () => {
          highlightAll();
          deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };
      // TODO: remove v12, deprecated
      function initHighlightingOnLoad() {
          highlightAll();
          deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }
      let wantsHighlight = false;
      /**
       * auto-highlights all pre>code elements on the page
       */
      function highlightAll() {
          function boot() {
              // if a highlight was requested before DOM was loaded, do now
              highlightAll();
          }
          // if we are called too early in the loading process
          if (document.readyState === "loading") {
              // make sure the event listener is only added once
              if (!wantsHighlight) {
                  window.addEventListener('DOMContentLoaded', boot, false);
              }
              wantsHighlight = true;
              return;
          }
          const blocks = document.querySelectorAll(options.cssSelector);
          blocks.forEach(highlightElement);
      }
      /**
       * Register a language grammar module
       *
       * @param {string} languageName
       * @param {LanguageFn} languageDefinition
       */
      function registerLanguage(languageName, languageDefinition) {
          let lang = null;
          try {
              lang = languageDefinition(hljs);
          }
          catch (error$1) {
              error("Language definition for '{}' could not be registered.".replace("{}", languageName));
              // hard or soft error
              if (!SAFE_MODE) {
                  throw error$1;
              }
              else {
                  error(error$1);
              }
              // languages that have serious errors are replaced with essentially a
              // "plaintext" stand-in so that the code blocks will still get normal
              // css classes applied to them - and one bad language won't break the
              // entire highlighter
              lang = PLAINTEXT_LANGUAGE;
          }
          // give it a temporary name if it doesn't have one in the meta-data
          if (!lang.name)
              lang.name = languageName;
          languages[languageName] = lang;
          lang.rawDefinition = languageDefinition.bind(null, hljs);
          if (lang.aliases) {
              registerAliases(lang.aliases, { languageName });
          }
      }
      /**
       * Remove a language grammar module
       *
       * @param {string} languageName
       */
      function unregisterLanguage(languageName) {
          delete languages[languageName];
          for (const alias of Object.keys(aliases)) {
              if (aliases[alias] === languageName) {
                  delete aliases[alias];
              }
          }
      }
      /**
       * @returns {string[]} List of language internal names
       */
      function listLanguages() {
          return Object.keys(languages);
      }
      /**
       * @param {string} name - name of the language to retrieve
       * @returns {Language | undefined}
       */
      function getLanguage(name) {
          name = (name || '').toLowerCase();
          return languages[name] || languages[aliases[name]];
      }
      /**
       *
       * @param {string|string[]} aliasList - single alias or list of aliases
       * @param {{languageName: string}} opts
       */
      function registerAliases(aliasList, { languageName }) {
          if (typeof aliasList === 'string') {
              aliasList = [aliasList];
          }
          aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
      }
      /**
       * Determines if a given language has auto-detection enabled
       * @param {string} name - name of the language
       */
      function autoDetection(name) {
          const lang = getLanguage(name);
          return lang && !lang.disableAutodetect;
      }
      /**
       * Upgrades the old highlightBlock plugins to the new
       * highlightElement API
       * @param {HLJSPlugin} plugin
       */
      function upgradePluginAPI(plugin) {
          // TODO: remove with v12
          if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
              plugin["before:highlightElement"] = (data) => {
                  plugin["before:highlightBlock"](Object.assign({ block: data.el }, data));
              };
          }
          if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
              plugin["after:highlightElement"] = (data) => {
                  plugin["after:highlightBlock"](Object.assign({ block: data.el }, data));
              };
          }
      }
      /**
       * @param {HLJSPlugin} plugin
       */
      function addPlugin(plugin) {
          upgradePluginAPI(plugin);
          plugins.push(plugin);
      }
      /**
       * @param {HLJSPlugin} plugin
       */
      function removePlugin(plugin) {
          const index = plugins.indexOf(plugin);
          if (index !== -1) {
              plugins.splice(index, 1);
          }
      }
      /**
       *
       * @param {PluginEvent} event
       * @param {any} args
       */
      function fire(event, args) {
          const cb = event;
          plugins.forEach(function (plugin) {
              if (plugin[cb]) {
                  plugin[cb](args);
              }
          });
      }
      /**
       * DEPRECATED
       * @param {HighlightedHTMLElement} el
       */
      function deprecateHighlightBlock(el) {
          deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
          deprecated("10.7.0", "Please use highlightElement now.");
          return highlightElement(el);
      }
      /* Interface definition */
      Object.assign(hljs, {
          highlight,
          highlightAuto,
          highlightAll,
          highlightElement,
          // TODO: Remove with v12 API
          highlightBlock: deprecateHighlightBlock,
          configure,
          initHighlighting,
          initHighlightingOnLoad,
          registerLanguage,
          unregisterLanguage,
          listLanguages,
          getLanguage,
          registerAliases,
          autoDetection,
          inherit,
          addPlugin,
          removePlugin
      });
      hljs.debugMode = function () { SAFE_MODE = false; };
      hljs.safeMode = function () { SAFE_MODE = true; };
      hljs.versionString = version;
      hljs.regex = {
          concat: concat,
          lookahead: lookahead,
          either: either,
          optional: optional,
          anyNumberOfTimes: anyNumberOfTimes
      };
      for (const key in MODES) {
          // @ts-ignore
          if (typeof MODES[key] === "object") {
              // @ts-ignore
              deepFreeze(MODES[key]);
          }
      }
      // merge all the modes/regexes into our main object
      Object.assign(hljs, MODES);
      return hljs;
  };
  // Other names for the variable may break build script
  const highlight = HLJS({});
  // returns a new instance of the highlighter to be used for extensions
  // check https://github.com/wooorm/lowlight/issues/47
  highlight.newInstance = () => HLJS({});
  module.exports = highlight;
  highlight.HighlightJS = highlight;
  highlight.default = highlight;

  }),
  (function (module, exports, require) {
  /*
  Language: Bash
  Author: vah <vahtenberg@gmail.com>
  Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
  Website: https://www.gnu.org/software/bash/
  Category: common, scripting
  */
  /** @type LanguageFn */
  function bash(hljs) {
      const regex = hljs.regex;
      const VAR = {};
      const BRACED_VAR = {
          begin: /\$\{/,
          end: /\}/,
          contains: [
              "self",
              {
                  begin: /:-/,
                  contains: [VAR]
              } // default values
          ]
      };
      Object.assign(VAR, {
          className: 'variable',
          variants: [
              { begin: regex.concat(/\$[\w\d#@][\w\d_]*/, 
                  // negative look-ahead tries to avoid matching patterns that are not
                  // Perl at all like $ident$, @ident@, etc.
                  `(?![\\w\\d])(?![$])`) },
              BRACED_VAR
          ]
      });
      const SUBST = {
          className: 'subst',
          begin: /\$\(/,
          end: /\)/,
          contains: [hljs.BACKSLASH_ESCAPE]
      };
      const COMMENT = hljs.inherit(hljs.COMMENT(), {
          match: [
              /(^|\s)/,
              /#.*$/
          ],
          scope: {
              2: 'comment'
          }
      });
      const HERE_DOC = {
          begin: /<<-?\s*(?=\w+)/,
          starts: { contains: [
                  hljs.END_SAME_AS_BEGIN({
                      begin: /(\w+)/,
                      end: /(\w+)/,
                      className: 'string'
                  })
              ] }
      };
      const QUOTE_STRING = {
          className: 'string',
          begin: /"/,
          end: /"/,
          contains: [
              hljs.BACKSLASH_ESCAPE,
              VAR,
              SUBST
          ]
      };
      SUBST.contains.push(QUOTE_STRING);
      const ESCAPED_QUOTE = {
          match: /\\"/
      };
      const APOS_STRING = {
          className: 'string',
          begin: /'/,
          end: /'/
      };
      const ESCAPED_APOS = {
          match: /\\'/
      };
      const ARITHMETIC = {
          begin: /\$?\(\(/,
          end: /\)\)/,
          contains: [
              {
                  begin: /\d+#[0-9a-f]+/,
                  className: "number"
              },
              hljs.NUMBER_MODE,
              VAR
          ]
      };
      const SH_LIKE_SHELLS = [
          "fish",
          "bash",
          "zsh",
          "sh",
          "csh",
          "ksh",
          "tcsh",
          "dash",
          "scsh",
      ];
      const KNOWN_SHEBANG = hljs.SHEBANG({
          binary: `(${SH_LIKE_SHELLS.join("|")})`,
          relevance: 10
      });
      const FUNCTION = {
          className: 'function',
          begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
          returnBegin: true,
          contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
          relevance: 0
      };
      const KEYWORDS = [
          "if",
          "then",
          "else",
          "elif",
          "fi",
          "time",
          "for",
          "while",
          "until",
          "in",
          "do",
          "done",
          "case",
          "esac",
          "coproc",
          "function",
          "select"
      ];
      const LITERALS = [
          "true",
          "false"
      ];
      // to consume paths to prevent keyword matches inside them
      const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
      // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
      const SHELL_BUILT_INS = [
          "break",
          "cd",
          "continue",
          "eval",
          "exec",
          "exit",
          "export",
          "getopts",
          "hash",
          "pwd",
          "readonly",
          "return",
          "shift",
          "test",
          "times",
          "trap",
          "umask",
          "unset"
      ];
      const BASH_BUILT_INS = [
          "alias",
          "bind",
          "builtin",
          "caller",
          "command",
          "declare",
          "echo",
          "enable",
          "help",
          "let",
          "local",
          "logout",
          "mapfile",
          "printf",
          "read",
          "readarray",
          "source",
          "sudo",
          "type",
          "typeset",
          "ulimit",
          "unalias"
      ];
      const ZSH_BUILT_INS = [
          "autoload",
          "bg",
          "bindkey",
          "bye",
          "cap",
          "chdir",
          "clone",
          "comparguments",
          "compcall",
          "compctl",
          "compdescribe",
          "compfiles",
          "compgroups",
          "compquote",
          "comptags",
          "comptry",
          "compvalues",
          "dirs",
          "disable",
          "disown",
          "echotc",
          "echoti",
          "emulate",
          "fc",
          "fg",
          "float",
          "functions",
          "getcap",
          "getln",
          "history",
          "integer",
          "jobs",
          "kill",
          "limit",
          "log",
          "noglob",
          "popd",
          "print",
          "pushd",
          "pushln",
          "rehash",
          "sched",
          "setcap",
          "setopt",
          "stat",
          "suspend",
          "ttyctl",
          "unfunction",
          "unhash",
          "unlimit",
          "unsetopt",
          "vared",
          "wait",
          "whence",
          "where",
          "which",
          "zcompile",
          "zformat",
          "zftp",
          "zle",
          "zmodload",
          "zparseopts",
          "zprof",
          "zpty",
          "zregexparse",
          "zsocket",
          "zstyle",
          "ztcp"
      ];
      const GNU_CORE_UTILS = [
          "chcon",
          "chgrp",
          "chown",
          "chmod",
          "cp",
          "dd",
          "df",
          "dir",
          "dircolors",
          "ln",
          "ls",
          "mkdir",
          "mkfifo",
          "mknod",
          "mktemp",
          "mv",
          "realpath",
          "rm",
          "rmdir",
          "shred",
          "sync",
          "touch",
          "truncate",
          "vdir",
          "b2sum",
          "base32",
          "base64",
          "cat",
          "cksum",
          "comm",
          "csplit",
          "cut",
          "expand",
          "fmt",
          "fold",
          "head",
          "join",
          "md5sum",
          "nl",
          "numfmt",
          "od",
          "paste",
          "ptx",
          "pr",
          "sha1sum",
          "sha224sum",
          "sha256sum",
          "sha384sum",
          "sha512sum",
          "shuf",
          "sort",
          "split",
          "sum",
          "tac",
          "tail",
          "tr",
          "tsort",
          "unexpand",
          "uniq",
          "wc",
          "arch",
          "basename",
          "chroot",
          "date",
          "dirname",
          "du",
          "echo",
          "env",
          "expr",
          "factor",
          // "false", // keyword literal already
          "groups",
          "hostid",
          "id",
          "link",
          "logname",
          "nice",
          "nohup",
          "nproc",
          "pathchk",
          "pinky",
          "printenv",
          "printf",
          "pwd",
          "readlink",
          "runcon",
          "seq",
          "sleep",
          "stat",
          "stdbuf",
          "stty",
          "tee",
          "test",
          "timeout",
          // "true", // keyword literal already
          "tty",
          "uname",
          "unlink",
          "uptime",
          "users",
          "who",
          "whoami",
          "yes"
      ];
      return {
          name: 'Bash',
          aliases: [
              'sh',
              'zsh'
          ],
          keywords: {
              $pattern: /\b[a-z][a-z0-9._-]+\b/,
              keyword: KEYWORDS,
              literal: LITERALS,
              built_in: [
                  ...SHELL_BUILT_INS,
                  ...BASH_BUILT_INS,
                  // Shell modifiers
                  "set",
                  "shopt",
                  ...ZSH_BUILT_INS,
                  ...GNU_CORE_UTILS
              ]
          },
          contains: [
              KNOWN_SHEBANG, // to catch known shells and boost relevancy
              hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
              FUNCTION,
              ARITHMETIC,
              COMMENT,
              HERE_DOC,
              PATH_MODE,
              QUOTE_STRING,
              ESCAPED_QUOTE,
              APOS_STRING,
              ESCAPED_APOS,
              VAR
          ]
      };
  }
  module.exports = bash;

  }),
  (function (module, exports, require) {
  /*
  Language: C
  Category: common, system
  Website: https://en.wikipedia.org/wiki/C_(programming_language)
  */
  /** @type LanguageFn */
  function c(hljs) {
      const regex = hljs.regex;
      // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
      // not include such support nor can we be sure all the grammars depending
      // on it would desire this behavior
      const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [{ begin: /\\\n/ }] });
      const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
      const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
      const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
      const FUNCTION_TYPE_RE = '('
          + DECLTYPE_AUTO_RE + '|'
          + regex.optional(NAMESPACE_RE)
          + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
          + ')';
      // C11 <stdatomic.h> atomic type names. This is an explicit whitelist so that
      // C11 atomic *functions* (atomic_init, atomic_store, atomic_load,
      // atomic_fetch_add, ...) are not mistakenly highlighted as types. See #3837.
      const ATOMIC_TYPES = regex.concat(/\batomic_/, regex.either('bool', 'char', 'schar', 'uchar', 'short', 'ushort', 'int', 'uint', 'long', 'ulong', 'llong', 'ullong', 'char16_t', 'char32_t', 'wchar_t', 'int_least8_t', 'uint_least8_t', 'int_least16_t', 'uint_least16_t', 'int_least32_t', 'uint_least32_t', 'int_least64_t', 'uint_least64_t', 'int_fast8_t', 'uint_fast8_t', 'int_fast16_t', 'uint_fast16_t', 'int_fast32_t', 'uint_fast32_t', 'int_fast64_t', 'uint_fast64_t', 'intptr_t', 'uintptr_t', 'size_t', 'ptrdiff_t', 'intmax_t', 'uintmax_t'), /\b/);
      const TYPES = {
          className: 'type',
          variants: [
              { begin: '\\b[a-z\\d_]*_t\\b' },
              { match: ATOMIC_TYPES }
          ]
      };
      // https://en.cppreference.com/w/cpp/language/escape
      // \\ \x \xFF \u2837 \u00323747 \374
      const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
      const STRINGS = {
          className: 'string',
          variants: [
              {
                  begin: '(u8?|U|L)?"',
                  end: '"',
                  illegal: '\\n',
                  contains: [hljs.BACKSLASH_ESCAPE]
              },
              {
                  begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + "|.)",
                  end: '\'',
                  illegal: '.'
              },
              // https://en.cppreference.com/w/cpp/language/string_literal
              // a d-char-sequence never contains parentheses, backslashes or whitespace;
              // quotes are excluded as well so the closing delimiter cannot swallow the
              // quote that actually terminates the literal
              hljs.END_SAME_AS_BEGIN({
                  begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
                  end: /\)([^()\\\s"]{0,16})"/
              })
          ]
      };
      const NUMBERS = {
          className: 'number',
          variants: [
              { match: /\b(0b[01']+)/ },
              { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
              { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
              { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
          ],
          relevance: 0
      };
      // `#include` is the only preprocessor directive that takes an angle-bracket
      // quoted header (`#include <header>`). Scoping that rule to `#include` keeps
      // the greedy `<...>` match from eating a `>` that belongs to the body of
      // another directive (e.g. `#define what do { cout << ">"; } while (0)`),
      // which would otherwise leave an unbalanced `"` and break highlighting for
      // the rest of the file. See issue #3505.
      const PREPROCESSOR_INCLUDE = {
          scope: 'meta',
          begin: /#\s*include\b/,
          end: /$/,
          keywords: { keyword: 'include' },
          contains: [
              {
                  // the `\` at the end of a line signaling continuation
                  begin: /\\\n/,
              },
              STRINGS,
              {
                  scope: 'string',
                  begin: /<.*?>/
              },
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
          ]
      };
      const PREPROCESSOR = {
          className: 'meta',
          begin: /#\s*[a-z]+\b/,
          end: /$/,
          keywords: { keyword: 'if else elif endif define undef warning error line '
                  + 'pragma _Pragma ifdef ifndef elifdef elifndef include' },
          contains: [
              {
                  begin: /\\\n/,
                  relevance: 0
              },
              hljs.inherit(STRINGS, { className: 'string' }),
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
          ]
      };
      const PREPROCESSORS = [
          PREPROCESSOR_INCLUDE,
          PREPROCESSOR
      ];
      const TITLE_MODE = {
          className: 'title',
          begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
          relevance: 0
      };
      const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';
      // Bounded on purpose: an unbounded quantifier here consumes an arbitrarily
      // long run of words, and when no function title follows it the engine retries
      // the title at every token boundary of that run - quadratic in the size of
      // the document.  See #4362.
      const MAX_FUNCTION_TYPE_TOKENS = 12;
      const C_KEYWORDS = [
          "asm",
          "auto",
          "break",
          "case",
          "continue",
          "default",
          "do",
          "else",
          "enum",
          "extern",
          "for",
          "fortran",
          "goto",
          "if",
          "inline",
          "register",
          "restrict",
          "return",
          "sizeof",
          "typeof",
          "typeof_unqual",
          "struct",
          "switch",
          "typedef",
          "union",
          "volatile",
          "while",
          "_Alignas",
          "_Alignof",
          "_Atomic",
          "_Generic",
          "_Noreturn",
          "_Static_assert",
          "_Thread_local",
          // aliases
          "alignas",
          "alignof",
          "noreturn",
          "static_assert",
          "thread_local",
          // not a C keyword but is, for all intents and purposes, treated exactly like one.
          "_Pragma"
      ];
      const C_TYPES = [
          "float",
          "double",
          "signed",
          "unsigned",
          "int",
          "short",
          "long",
          "char",
          "void",
          "_Bool",
          "_BitInt",
          "_Complex",
          "_Imaginary",
          "_Decimal32",
          "_Decimal64",
          "_Decimal96",
          "_Decimal128",
          "_Decimal64x",
          "_Decimal128x",
          "_Float16",
          "_Float32",
          "_Float64",
          "_Float128",
          "_Float32x",
          "_Float64x",
          "_Float128x",
          // modifiers
          "const",
          "static",
          "constexpr",
          // aliases
          "complex",
          "bool",
          "imaginary"
      ];
      const KEYWORDS = {
          keyword: C_KEYWORDS,
          type: C_TYPES,
          literal: 'true false NULL',
          // TODO: apply hinting work similar to what was done in cpp.js
          built_in: 'std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream '
              + 'auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set '
              + 'unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos '
              + 'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp '
              + 'fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper '
              + 'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow '
              + 'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp '
              + 'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan '
              + 'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
      };
      const EXPRESSION_CONTAINS = [
          ...PREPROCESSORS,
          TYPES,
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS
      ];
      const EXPRESSION_CONTEXT = {
          // This mode covers expression context where we can't expect a function
          // definition and shouldn't highlight anything that looks like one:
          // `return some()`, `else if()`, `(x*sum(1, 2))`
          variants: [
              {
                  begin: /=/,
                  end: /;/
              },
              {
                  begin: /\(/,
                  end: /\)/
              },
              {
                  beginKeywords: 'new throw return else',
                  end: /;/
              }
          ],
          keywords: KEYWORDS,
          contains: EXPRESSION_CONTAINS.concat([
              {
                  begin: /\(/,
                  end: /\)/,
                  keywords: KEYWORDS,
                  contains: EXPRESSION_CONTAINS.concat(['self']),
                  relevance: 0
              }
          ]),
          relevance: 0
      };
      const FUNCTION_DECLARATION = {
          begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+){1,' + MAX_FUNCTION_TYPE_TOKENS + '}' + FUNCTION_TITLE,
          returnBegin: true,
          end: /[{;=]/,
          excludeEnd: true,
          keywords: KEYWORDS,
          illegal: /[^\w\s\*&:<>.]/,
          contains: [
              {
                  begin: DECLTYPE_AUTO_RE,
                  keywords: KEYWORDS,
                  relevance: 0
              },
              {
                  begin: FUNCTION_TITLE,
                  returnBegin: true,
                  contains: [hljs.inherit(TITLE_MODE, { className: "title.function" })],
                  relevance: 0
              },
              // allow for multiple declarations, e.g.:
              // extern void f(int), g(char);
              {
                  relevance: 0,
                  match: /,/
              },
              {
                  className: 'params',
                  begin: /\(/,
                  end: /\)/,
                  keywords: KEYWORDS,
                  relevance: 0,
                  contains: [
                      C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE,
                      STRINGS,
                      NUMBERS,
                      TYPES,
                      // Count matching parentheses.
                      {
                          begin: /\(/,
                          end: /\)/,
                          keywords: KEYWORDS,
                          relevance: 0,
                          contains: [
                              'self',
                              C_LINE_COMMENT_MODE,
                              hljs.C_BLOCK_COMMENT_MODE,
                              STRINGS,
                              NUMBERS,
                              TYPES
                          ]
                      }
                  ]
              },
              TYPES,
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              ...PREPROCESSORS
          ]
      };
      return {
          name: "C",
          aliases: ['h'],
          keywords: KEYWORDS,
          // Until differentiations are added between `c` and `cpp`, `c` will
          // not be auto-detected to avoid auto-detect conflicts between C and C++
          disableAutodetect: true,
          illegal: '</',
          contains: [].concat(EXPRESSION_CONTEXT, FUNCTION_DECLARATION, EXPRESSION_CONTAINS, [
              ...PREPROCESSORS,
              {
                  begin: hljs.IDENT_RE + '::',
                  keywords: KEYWORDS
              },
              {
                  className: 'class',
                  beginKeywords: 'enum class struct union',
                  end: /[{;:<>=]/,
                  contains: [
                      { beginKeywords: "final class struct" },
                      hljs.TITLE_MODE
                  ]
              }
          ]),
          exports: {
              preprocessor: PREPROCESSOR,
              strings: STRINGS,
              keywords: KEYWORDS
          }
      };
  }
  module.exports = c;

  }),
  (function (module, exports, require) {
  /*
  Language: C++
  Category: common, system
  Website: https://isocpp.org
  */
  /** @type LanguageFn */
  function cpp(hljs) {
      const regex = hljs.regex;
      // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
      // not include such support nor can we be sure all the grammars depending
      // on it would desire this behavior
      const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [{ begin: /\\\n/ }] });
      const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
      const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
      const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
      const FUNCTION_TYPE_RE = '(?!struct)('
          + DECLTYPE_AUTO_RE + '|'
          + regex.optional(NAMESPACE_RE)
          + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
          + ')';
      const CPP_PRIMITIVE_TYPES = {
          className: 'type',
          begin: '\\b[a-z\\d_]*_t\\b'
      };
      // https://en.cppreference.com/w/cpp/language/escape
      // \\ \x \xFF \u2837 \u00323747 \374
      const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
      const STRINGS = {
          className: 'string',
          variants: [
              {
                  begin: '(u8?|U|L)?"',
                  end: '"',
                  illegal: '\\n',
                  contains: [hljs.BACKSLASH_ESCAPE]
              },
              {
                  begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + '|.)',
                  end: '\'',
                  illegal: '.'
              },
              // https://en.cppreference.com/w/cpp/language/string_literal
              // a d-char-sequence never contains parentheses, backslashes or whitespace;
              // quotes are excluded as well so the closing delimiter cannot swallow the
              // quote that actually terminates the literal
              hljs.END_SAME_AS_BEGIN({
                  begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
                  end: /\)([^()\\\s"]{0,16})"/
              })
          ]
      };
      const NUMBERS = {
          className: 'number',
          variants: [
              // Floating-point literal.
              { begin: "[+-]?(?:" // Leading sign.
                      // Decimal.
                      + "(?:"
                      + "\\b[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?"
                      + "|\\.[0-9](?:'?[0-9])*"
                      + ")(?:[Ee][+-]?[0-9](?:'?[0-9])*)?"
                      + "|\\b[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*"
                      // Hexadecimal.
                      + "|\\b0[Xx](?:"
                      + "[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?"
                      + "|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*"
                      + ")[Pp][+-]?[0-9](?:'?[0-9])*"
                      + ")(?:" // Literal suffixes.
                      + "[Ff](?:16|32|64|128)?"
                      + "|(BF|bf)16"
                      + "|[Ll]"
                      + "|" // Literal suffix is optional.
                      + ")"
              },
              // Integer literal.
              { begin: "[+-]?\\b(?:" // Leading sign.
                      + "0[Bb][01](?:'?[01])*" // Binary.
                      + "|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*" // Hexadecimal.
                      + "|0(?:'?[0-7])*" // Octal or just a lone zero.
                      + "|[1-9](?:'?[0-9])*" // Decimal.
                      + ")(?:" // Literal suffixes.
                      + "[Uu](?:LL?|ll?)"
                      + "|[Uu][Zz]?"
                      + "|(?:LL?|ll?)[Uu]?"
                      + "|[Zz][Uu]"
                      + "|" // Literal suffix is optional.
                      + ")"
                  // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
                  // literal highlight actually makes it stand out more.
              }
          ],
          relevance: 0
      };
      // `#include` is the only preprocessor directive that takes an angle-bracket
      // quoted header (`#include <header>`). Scoping that rule to `#include` keeps
      // the greedy `<...>` match from eating a `>` that belongs to the body of
      // another directive (e.g. `#define what do { cout << ">"; } while (0)`),
      // which would otherwise leave an unbalanced `"` and break highlighting for
      // the rest of the file. See issue #3505.
      const PREPROCESSOR_INCLUDE = {
          scope: 'meta',
          begin: /#\s*include\b/,
          end: /$/,
          keywords: { keyword: 'include' },
          contains: [
              {
                  // the `\` at the end of a line signaling continuation
                  begin: /\\\n/,
              },
              STRINGS,
              {
                  scope: 'string',
                  begin: /<.*?>/
              },
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
          ]
      };
      const PREPROCESSOR = {
          className: 'meta',
          begin: /#\s*[a-z]+\b/,
          end: /$/,
          keywords: { keyword: 'if else elif endif define undef warning error line '
                  + 'pragma _Pragma ifdef ifndef include' },
          contains: [
              {
                  begin: /\\\n/,
                  relevance: 0
              },
              hljs.inherit(STRINGS, { className: 'string' }),
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
          ]
      };
      const PREPROCESSORS = [
          PREPROCESSOR_INCLUDE,
          PREPROCESSOR
      ];
      const TITLE_MODE = {
          className: 'title',
          begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
          relevance: 0
      };
      const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';
      // Bounded on purpose: an unbounded quantifier here consumes an arbitrarily
      // long run of words, and when no function title follows it the engine retries
      // the title at every token boundary of that run - quadratic in the size of
      // the document.  See #4362.
      const MAX_FUNCTION_TYPE_TOKENS = 12;
      // https://en.cppreference.com/w/cpp/keyword
      const RESERVED_KEYWORDS = [
          'alignas',
          'alignof',
          'and',
          'and_eq',
          'asm',
          'atomic_cancel',
          'atomic_commit',
          'atomic_noexcept',
          'auto',
          'bitand',
          'bitor',
          'break',
          'case',
          'catch',
          'class',
          'co_await',
          'co_return',
          'co_yield',
          'compl',
          'concept',
          'const_cast|10',
          'consteval',
          'constexpr',
          'constinit',
          'continue',
          'decltype',
          'default',
          'delete',
          'do',
          'dynamic_cast|10',
          'else',
          'enum',
          'explicit',
          'export',
          'extern',
          'false',
          'final',
          'for',
          'friend',
          'goto',
          'if',
          'import',
          'inline',
          'module',
          'mutable',
          'namespace',
          'new',
          'noexcept',
          'not',
          'not_eq',
          'nullptr',
          'operator',
          'or',
          'or_eq',
          'override',
          'private',
          'protected',
          'public',
          'reflexpr',
          'register',
          'reinterpret_cast|10',
          'requires',
          'return',
          'sizeof',
          'static_assert',
          'static_cast|10',
          'struct',
          'switch',
          'synchronized',
          'template',
          'this',
          'thread_local',
          'throw',
          'transaction_safe',
          'transaction_safe_dynamic',
          'true',
          'try',
          'typedef',
          'typeid',
          'typename',
          'union',
          'using',
          'virtual',
          'volatile',
          'while',
          'xor',
          'xor_eq'
      ];
      // https://en.cppreference.com/w/cpp/keyword
      const RESERVED_TYPES = [
          'bool',
          'char',
          'char16_t',
          'char32_t',
          'char8_t',
          'double',
          'float',
          'int',
          'long',
          'short',
          'void',
          'wchar_t',
          'unsigned',
          'signed',
          'const',
          'static'
      ];
      const TYPE_HINTS = [
          'any',
          'auto_ptr',
          'barrier',
          'binary_semaphore',
          'bitset',
          'complex',
          'condition_variable',
          'condition_variable_any',
          'counting_semaphore',
          'deque',
          'false_type',
          'flat_map',
          'flat_set',
          'future',
          'imaginary',
          'initializer_list',
          'istringstream',
          'jthread',
          'latch',
          'lock_guard',
          'multimap',
          'multiset',
          'mutex',
          'optional',
          'ostringstream',
          'packaged_task',
          'pair',
          'promise',
          'priority_queue',
          'queue',
          'recursive_mutex',
          'recursive_timed_mutex',
          'scoped_lock',
          'set',
          'shared_future',
          'shared_lock',
          'shared_mutex',
          'shared_timed_mutex',
          'shared_ptr',
          'stack',
          'string_view',
          'stringstream',
          'timed_mutex',
          'thread',
          'true_type',
          'tuple',
          'unique_lock',
          'unique_ptr',
          'unordered_map',
          'unordered_multimap',
          'unordered_multiset',
          'unordered_set',
          'variant',
          'vector',
          'weak_ptr',
          'wstring',
          'wstring_view'
      ];
      const FUNCTION_HINTS = [
          'abort',
          'abs',
          'acos',
          'apply',
          'as_const',
          'asin',
          'atan',
          'atan2',
          'calloc',
          'ceil',
          'cerr',
          'cin',
          'clog',
          'cos',
          'cosh',
          'cout',
          'declval',
          'endl',
          'exchange',
          'exit',
          'exp',
          'fabs',
          'floor',
          'fmod',
          'forward',
          'fprintf',
          'fputs',
          'free',
          'frexp',
          'fscanf',
          'future',
          'invoke',
          'isalnum',
          'isalpha',
          'iscntrl',
          'isdigit',
          'isgraph',
          'islower',
          'isprint',
          'ispunct',
          'isspace',
          'isupper',
          'isxdigit',
          'labs',
          'launder',
          'ldexp',
          'log',
          'log10',
          'make_pair',
          'make_shared',
          'make_shared_for_overwrite',
          'make_tuple',
          'make_unique',
          'malloc',
          'memchr',
          'memcmp',
          'memcpy',
          'memset',
          'modf',
          'move',
          'pow',
          'printf',
          'putchar',
          'puts',
          'realloc',
          'scanf',
          'sin',
          'sinh',
          'snprintf',
          'sprintf',
          'sqrt',
          'sscanf',
          'std',
          'stderr',
          'stdin',
          'stdout',
          'strcat',
          'strchr',
          'strcmp',
          'strcpy',
          'strcspn',
          'strlen',
          'strncat',
          'strncmp',
          'strncpy',
          'strpbrk',
          'strrchr',
          'strspn',
          'strstr',
          'swap',
          'tan',
          'tanh',
          'terminate',
          'to_underlying',
          'tolower',
          'toupper',
          'vfprintf',
          'visit',
          'vprintf',
          'vsprintf'
      ];
      const LITERALS = [
          'NULL',
          'false',
          'nullopt',
          'nullptr',
          'true'
      ];
      // https://en.cppreference.com/w/cpp/keyword
      const BUILT_IN = ['_Pragma'];
      const CPP_KEYWORDS = {
          type: RESERVED_TYPES,
          keyword: RESERVED_KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_IN,
          _type_hints: TYPE_HINTS
      };
      const FUNCTION_DISPATCH = {
          className: 'function.dispatch',
          relevance: 0,
          keywords: {
              // Only for relevance, not highlighting.
              _hint: FUNCTION_HINTS
          },
          begin: regex.concat(/\b/, `(?!${RESERVED_KEYWORDS.join('|')})`, hljs.IDENT_RE, regex.lookahead(/(<[^<>]+>|)\s*\(/))
      };
      const EXPRESSION_CONTAINS = [
          FUNCTION_DISPATCH,
          ...PREPROCESSORS,
          CPP_PRIMITIVE_TYPES,
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS
      ];
      const EXPRESSION_CONTEXT = {
          // This mode covers expression context where we can't expect a function
          // definition and shouldn't highlight anything that looks like one:
          // `return some()`, `else if()`, `(x*sum(1, 2))`
          variants: [
              {
                  begin: /=/,
                  end: /;/
              },
              {
                  begin: /\(/,
                  end: /\)/
              },
              {
                  beginKeywords: 'new throw return else',
                  end: /;/
              }
          ],
          keywords: CPP_KEYWORDS,
          contains: EXPRESSION_CONTAINS.concat([
              {
                  begin: /\(/,
                  end: /\)/,
                  keywords: CPP_KEYWORDS,
                  contains: EXPRESSION_CONTAINS.concat(['self']),
                  relevance: 0
              }
          ]),
          relevance: 0
      };
      const FUNCTION_DECLARATION = {
          className: 'function',
          begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+){1,' + MAX_FUNCTION_TYPE_TOKENS + '}' + FUNCTION_TITLE,
          returnBegin: true,
          end: /[{;=]/,
          excludeEnd: true,
          keywords: CPP_KEYWORDS,
          illegal: /[^\w\s\*&:<>.]/,
          contains: [
              {
                  begin: DECLTYPE_AUTO_RE,
                  keywords: CPP_KEYWORDS,
                  relevance: 0
              },
              {
                  begin: FUNCTION_TITLE,
                  returnBegin: true,
                  contains: [TITLE_MODE],
                  relevance: 0
              },
              // needed because we do not have look-behind on the below rule
              // to prevent it from grabbing the final : in a :: pair
              {
                  begin: /::/,
                  relevance: 0
              },
              // initializers
              {
                  begin: /:/,
                  endsWithParent: true,
                  contains: [
                      STRINGS,
                      NUMBERS
                  ]
              },
              // allow for multiple declarations, e.g.:
              // extern void f(int), g(char);
              {
                  relevance: 0,
                  match: /,/
              },
              {
                  className: 'params',
                  begin: /\(/,
                  end: /\)/,
                  keywords: CPP_KEYWORDS,
                  relevance: 0,
                  contains: [
                      C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE,
                      STRINGS,
                      NUMBERS,
                      CPP_PRIMITIVE_TYPES,
                      // Count matching parentheses.
                      {
                          begin: /\(/,
                          end: /\)/,
                          keywords: CPP_KEYWORDS,
                          relevance: 0,
                          contains: [
                              'self',
                              C_LINE_COMMENT_MODE,
                              hljs.C_BLOCK_COMMENT_MODE,
                              STRINGS,
                              NUMBERS,
                              CPP_PRIMITIVE_TYPES
                          ]
                      }
                  ]
              },
              CPP_PRIMITIVE_TYPES,
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              ...PREPROCESSORS
          ]
      };
      return {
          name: 'C++',
          aliases: [
              'cc',
              'c++',
              'h++',
              'hpp',
              'hh',
              'hxx',
              'cxx'
          ],
          keywords: CPP_KEYWORDS,
          illegal: '</',
          classNameAliases: { 'function.dispatch': 'built_in' },
          contains: [].concat(EXPRESSION_CONTEXT, FUNCTION_DECLARATION, FUNCTION_DISPATCH, EXPRESSION_CONTAINS, [
              ...PREPROCESSORS,
              {
                  begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)',
                  end: '>',
                  keywords: CPP_KEYWORDS,
                  contains: [
                      'self',
                      CPP_PRIMITIVE_TYPES
                  ]
              },
              {
                  begin: hljs.IDENT_RE + '::',
                  keywords: CPP_KEYWORDS
              },
              {
                  match: [
                      // extra complexity to deal with `enum class` and `enum struct`
                      /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
                      /\s+/,
                      /\w+/
                  ],
                  className: {
                      1: 'keyword',
                      3: 'title.class'
                  }
              }
          ])
      };
  }
  module.exports = cpp;

  }),
  (function (module, exports, require) {
  /*
  Language: C#
  Author: Jason Diamond <jason@diamond.name>
  Contributor: Nicolas LLOBERA <nllobera@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>, David Pine <david.pine@microsoft.com>
  Website: https://docs.microsoft.com/dotnet/csharp/
  Category: common
  */
  /** @type LanguageFn */
  function csharp(hljs) {
      const BUILT_IN_KEYWORDS = [
          'bool',
          'byte',
          'char',
          'decimal',
          'delegate',
          'double',
          'dynamic',
          'enum',
          'float',
          'int',
          'long',
          'nint',
          'nuint',
          'object',
          'sbyte',
          'short',
          'string',
          'ulong',
          'uint',
          'ushort'
      ];
      const FUNCTION_MODIFIERS = [
          'public',
          'private',
          'protected',
          'static',
          'internal',
          'protected',
          'abstract',
          'async',
          'extern',
          'override',
          'unsafe',
          'virtual',
          'new',
          'sealed',
          'partial'
      ];
      const LITERAL_KEYWORDS = [
          'default',
          'false',
          'null',
          'true'
      ];
      const NORMAL_KEYWORDS = [
          'abstract',
          'as',
          'base',
          'break',
          'case',
          'catch',
          'class',
          'const',
          'continue',
          'do',
          'else',
          'event',
          'explicit',
          'extern',
          'finally',
          'fixed',
          'for',
          'foreach',
          'goto',
          'if',
          'implicit',
          'in',
          'interface',
          'internal',
          'is',
          'lock',
          'namespace',
          'new',
          'operator',
          'out',
          'override',
          'params',
          'private',
          'protected',
          'public',
          'readonly',
          'record',
          'ref',
          'return',
          'scoped',
          'sealed',
          'sizeof',
          'stackalloc',
          'static',
          'struct',
          'switch',
          'this',
          'throw',
          'try',
          'typeof',
          'unchecked',
          'unsafe',
          'using',
          'virtual',
          'void',
          'volatile',
          'while'
      ];
      const CONTEXTUAL_KEYWORDS = [
          'add',
          'alias',
          'and',
          'ascending',
          'args',
          'async',
          'await',
          'by',
          'descending',
          'dynamic',
          'equals',
          'file',
          'from',
          'get',
          'global',
          'group',
          'init',
          'into',
          'join',
          'let',
          'nameof',
          'not',
          'notnull',
          'on',
          'or',
          'orderby',
          'partial',
          'record',
          'remove',
          'required',
          'scoped',
          'select',
          'set',
          'unmanaged',
          'value|0',
          'var',
          'when',
          'where',
          'with',
          'yield'
      ];
      const KEYWORDS = {
          keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
          built_in: BUILT_IN_KEYWORDS,
          literal: LITERAL_KEYWORDS
      };
      const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' });
      // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types
      // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types
      // `_` separators sit between digits, and may also follow the `0x`/`0b` prefix
      const DIGITS = '\\d(_*\\d)*';
      const INTEGER_SUFFIX = '([uU][lL]?|[lL][uU]?)?';
      const REAL_SUFFIX = '([fFdDmM]|[uU][lL]?|[lL][uU]?)?';
      const NUMBERS = {
          className: 'number',
          variants: [
              { begin: '\\b0[bB]_*[01](_*[01])*' + INTEGER_SUFFIX },
              { begin: '(-?)\\b0[xX]_*[a-fA-F0-9](_*[a-fA-F0-9])*' + INTEGER_SUFFIX },
              { begin: '(-?)(\\b' + DIGITS + '(\\.(' + DIGITS + ')?)?|\\.' + DIGITS + ')([eE][-+]?' + DIGITS + ')?' + REAL_SUFFIX }
          ],
          relevance: 0
      };
      const RAW_STRING = {
          className: 'string',
          begin: /"""("*)(?!")(.|\n)*?"""\1/,
          relevance: 1
      };
      const VERBATIM_STRING = {
          className: 'string',
          begin: '@"',
          end: '"',
          contains: [{ begin: '""' }]
      };
      const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
      const SUBST = {
          className: 'subst',
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS
      };
      const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
      const INTERPOLATED_STRING = {
          className: 'string',
          begin: /\$"/,
          end: '"',
          illegal: /\n/,
          contains: [
              { begin: /\{\{/ },
              { begin: /\}\}/ },
              hljs.BACKSLASH_ESCAPE,
              SUBST_NO_LF
          ]
      };
      const INTERPOLATED_VERBATIM_STRING = {
          className: 'string',
          begin: /\$@"/,
          end: '"',
          contains: [
              { begin: /\{\{/ },
              { begin: /\}\}/ },
              { begin: '""' },
              SUBST
          ]
      };
      const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
          illegal: /\n/,
          contains: [
              { begin: /\{\{/ },
              { begin: /\}\}/ },
              { begin: '""' },
              SUBST_NO_LF
          ]
      });
      SUBST.contains = [
          INTERPOLATED_VERBATIM_STRING,
          INTERPOLATED_STRING,
          VERBATIM_STRING,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          NUMBERS,
          hljs.C_BLOCK_COMMENT_MODE
      ];
      SUBST_NO_LF.contains = [
          INTERPOLATED_VERBATIM_STRING_NO_LF,
          INTERPOLATED_STRING,
          VERBATIM_STRING_NO_LF,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          NUMBERS,
          hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
      ];
      const STRING = { variants: [
              RAW_STRING,
              INTERPOLATED_VERBATIM_STRING,
              INTERPOLATED_STRING,
              VERBATIM_STRING,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE
          ] };
      const GENERIC_MODIFIER = {
          begin: "<",
          end: ">",
          contains: [
              { beginKeywords: "in out" },
              TITLE_MODE
          ]
      };
      const TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
      const AT_IDENTIFIER = {
          // prevents expressions like `@class` from incorrect flagging
          // `class` as a keyword
          begin: "@" + hljs.IDENT_RE,
          relevance: 0
      };
      return {
          name: 'C#',
          aliases: [
              'cs',
              'c#'
          ],
          keywords: KEYWORDS,
          illegal: /::/,
          contains: [
              hljs.COMMENT('///', '$', {
                  returnBegin: true,
                  contains: [
                      {
                          className: 'doctag',
                          variants: [
                              {
                                  begin: '///',
                                  relevance: 0
                              },
                              { begin: '<!--|-->' },
                              {
                                  begin: '</?',
                                  end: '>'
                              }
                          ]
                      }
                  ]
              }),
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              {
                  className: 'meta',
                  begin: '#',
                  end: '$',
                  keywords: { keyword: 'if else elif endif define undef warning error line region endregion pragma checksum' }
              },
              STRING,
              NUMBERS,
              {
                  beginKeywords: 'class interface',
                  relevance: 0,
                  end: /[{;=]/,
                  illegal: /[^\s:,]/,
                  contains: [
                      { beginKeywords: "where class" },
                      TITLE_MODE,
                      GENERIC_MODIFIER,
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              {
                  beginKeywords: 'namespace',
                  relevance: 0,
                  end: /[{;=]/,
                  illegal: /[^\s:]/,
                  contains: [
                      TITLE_MODE,
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              {
                  beginKeywords: 'record',
                  relevance: 0,
                  end: /[{;=]/,
                  illegal: /[^\s:]/,
                  contains: [
                      TITLE_MODE,
                      GENERIC_MODIFIER,
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              {
                  // [Attributes("")]
                  className: 'meta',
                  begin: '^\\s*\\[(?=[\\w])',
                  excludeBegin: true,
                  end: '\\]',
                  excludeEnd: true,
                  contains: [
                      {
                          className: 'string',
                          begin: /"/,
                          end: /"/
                      }
                  ]
              },
              {
                  // Expression keywords prevent 'keyword Name(...)' from being
                  // recognized as a function definition
                  beginKeywords: 'new return throw await else',
                  relevance: 0
              },
              {
                  className: 'function',
                  begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
                  returnBegin: true,
                  end: /\s*[{;=]/,
                  excludeEnd: true,
                  keywords: KEYWORDS,
                  contains: [
                      // prevents these from being highlighted `title`
                      {
                          beginKeywords: FUNCTION_MODIFIERS.join(" "),
                          relevance: 0
                      },
                      {
                          begin: hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
                          returnBegin: true,
                          contains: [
                              hljs.TITLE_MODE,
                              GENERIC_MODIFIER
                          ],
                          relevance: 0
                      },
                      { match: /\(\)/ },
                      {
                          className: 'params',
                          begin: /\(/,
                          end: /\)/,
                          excludeBegin: true,
                          excludeEnd: true,
                          keywords: KEYWORDS,
                          relevance: 0,
                          contains: [
                              STRING,
                              NUMBERS,
                              hljs.C_BLOCK_COMMENT_MODE
                          ]
                      },
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              AT_IDENTIFIER
          ]
      };
  }
  module.exports = csharp;

  }),
  (function (module, exports, require) {
  const MODES = (hljs) => {
      return {
          IMPORTANT: {
              scope: 'meta',
              begin: '!important'
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
              scope: 'number',
              begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          UNICODE_RANGE: {
              scope: 'number',
              begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
          },
          FUNCTION_DISPATCH: {
              className: "built_in",
              begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
              scope: 'selector-attr',
              begin: /\[/,
              end: /\]/,
              illegal: '$',
              contains: [
                  hljs.APOS_STRING_MODE,
                  hljs.QUOTE_STRING_MODE
              ]
          },
          CSS_NUMBER_MODE: {
              scope: 'number',
              begin: hljs.NUMBER_RE + '(' +
                  '%|em|ex|ch|rem' +
                  '|vw|vh|vmin|vmax' +
                  '|cm|mm|in|pt|pc|px' +
                  '|deg|grad|rad|turn' +
                  '|s|ms' +
                  '|Hz|kHz' +
                  '|dpi|dpcm|dppx' +
                  ')?',
              relevance: 0
          },
          CSS_VARIABLE: {
              className: "attr",
              begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
      };
  };
  const HTML_TAGS = [
      'a',
      'abbr',
      'address',
      'article',
      'aside',
      'audio',
      'b',
      'blockquote',
      'body',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'dd',
      'del',
      'details',
      'dfn',
      'div',
      'dl',
      'dt',
      'em',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hgroup',
      'html',
      'i',
      'iframe',
      'img',
      'input',
      'ins',
      'kbd',
      'label',
      'legend',
      'li',
      'main',
      'mark',
      'menu',
      'nav',
      'object',
      'ol',
      'optgroup',
      'option',
      'p',
      'picture',
      'q',
      'quote',
      'samp',
      'section',
      'select',
      'source',
      'span',
      'strong',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'time',
      'tr',
      'ul',
      'var',
      'video'
  ];
  const SVG_TAGS = [
      'defs',
      'g',
      'marker',
      'mask',
      'pattern',
      'svg',
      'switch',
      'symbol',
      'feBlend',
      'feColorMatrix',
      'feComponentTransfer',
      'feComposite',
      'feConvolveMatrix',
      'feDiffuseLighting',
      'feDisplacementMap',
      'feFlood',
      'feGaussianBlur',
      'feImage',
      'feMerge',
      'feMorphology',
      'feOffset',
      'feSpecularLighting',
      'feTile',
      'feTurbulence',
      'linearGradient',
      'radialGradient',
      'stop',
      'circle',
      'ellipse',
      'image',
      'line',
      'path',
      'polygon',
      'polyline',
      'rect',
      'text',
      'use',
      'textPath',
      'tspan',
      'foreignObject',
      'clipPath'
  ];
  const TAGS = [
      ...HTML_TAGS,
      ...SVG_TAGS,
  ];
  // Sorting, then reversing makes sure longer attributes/elements like
  // `font-weight` are matched fully instead of getting false positives on say `font`
  const MEDIA_FEATURES = [
      'any-hover',
      'any-pointer',
      'aspect-ratio',
      'color',
      'color-gamut',
      'color-index',
      'device-aspect-ratio',
      'device-height',
      'device-width',
      'display-mode',
      'forced-colors',
      'grid',
      'height',
      'hover',
      'inverted-colors',
      'monochrome',
      'orientation',
      'overflow-block',
      'overflow-inline',
      'pointer',
      'prefers-color-scheme',
      'prefers-contrast',
      'prefers-reduced-motion',
      'prefers-reduced-transparency',
      'resolution',
      'scan',
      'scripting',
      'update',
      'width',
      // TODO: find a better solution?
      'min-width',
      'max-width',
      'min-height',
      'max-height'
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
  const PSEUDO_CLASSES = [
      'active',
      'any-link',
      'blank',
      'checked',
      'current',
      'default',
      'defined',
      'dir', // dir()
      'disabled',
      'drop',
      'empty',
      'enabled',
      'first',
      'first-child',
      'first-of-type',
      'fullscreen',
      'future',
      'focus',
      'focus-visible',
      'focus-within',
      'has', // has()
      'host', // host or host()
      'host-context', // host-context()
      'hover',
      'indeterminate',
      'in-range',
      'invalid',
      'is', // is()
      'lang', // lang()
      'last-child',
      'last-of-type',
      'left',
      'link',
      'local-link',
      'not', // not()
      'nth-child', // nth-child()
      'nth-col', // nth-col()
      'nth-last-child', // nth-last-child()
      'nth-last-col', // nth-last-col()
      'nth-last-of-type', //nth-last-of-type()
      'nth-of-type', //nth-of-type()
      'only-child',
      'only-of-type',
      'optional',
      'out-of-range',
      'past',
      'placeholder-shown',
      'read-only',
      'read-write',
      'required',
      'right',
      'root',
      'scope',
      'target',
      'target-within',
      'user-invalid',
      'valid',
      'visited',
      'where' // where()
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
  const PSEUDO_ELEMENTS = [
      'after',
      'backdrop',
      'before',
      'cue',
      'cue-region',
      'first-letter',
      'first-line',
      'grammar-error',
      'marker',
      'part',
      'placeholder',
      'selection',
      'slotted',
      'spelling-error'
  ].sort().reverse();
  const ATTRIBUTES = [
      'accent-color',
      'align-content',
      'align-items',
      'align-self',
      'alignment-baseline',
      'all',
      'anchor-name',
      'animation',
      'animation-composition',
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-name',
      'animation-play-state',
      'animation-range',
      'animation-range-end',
      'animation-range-start',
      'animation-timeline',
      'animation-timing-function',
      'appearance',
      'aspect-ratio',
      'backdrop-filter',
      'backface-visibility',
      'background',
      'background-attachment',
      'background-blend-mode',
      'background-clip',
      'background-color',
      'background-image',
      'background-origin',
      'background-position',
      'background-position-x',
      'background-position-y',
      'background-repeat',
      'background-size',
      'baseline-shift',
      'block-size',
      'border',
      'border-block',
      'border-block-color',
      'border-block-end',
      'border-block-end-color',
      'border-block-end-style',
      'border-block-end-width',
      'border-block-start',
      'border-block-start-color',
      'border-block-start-style',
      'border-block-start-width',
      'border-block-style',
      'border-block-width',
      'border-bottom',
      'border-bottom-color',
      'border-bottom-left-radius',
      'border-bottom-right-radius',
      'border-bottom-style',
      'border-bottom-width',
      'border-collapse',
      'border-color',
      'border-end-end-radius',
      'border-end-start-radius',
      'border-image',
      'border-image-outset',
      'border-image-repeat',
      'border-image-slice',
      'border-image-source',
      'border-image-width',
      'border-inline',
      'border-inline-color',
      'border-inline-end',
      'border-inline-end-color',
      'border-inline-end-style',
      'border-inline-end-width',
      'border-inline-start',
      'border-inline-start-color',
      'border-inline-start-style',
      'border-inline-start-width',
      'border-inline-style',
      'border-inline-width',
      'border-left',
      'border-left-color',
      'border-left-style',
      'border-left-width',
      'border-radius',
      'border-right',
      'border-right-color',
      'border-right-style',
      'border-right-width',
      'border-spacing',
      'border-start-end-radius',
      'border-start-start-radius',
      'border-style',
      'border-top',
      'border-top-color',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-top-style',
      'border-top-width',
      'border-width',
      'bottom',
      'box-align',
      'box-decoration-break',
      'box-direction',
      'box-flex',
      'box-flex-group',
      'box-lines',
      'box-ordinal-group',
      'box-orient',
      'box-pack',
      'box-shadow',
      'box-sizing',
      'break-after',
      'break-before',
      'break-inside',
      'caption-side',
      'caret-color',
      'clear',
      'clip',
      'clip-path',
      'clip-rule',
      'color',
      'color-interpolation',
      'color-interpolation-filters',
      'color-profile',
      'color-rendering',
      'color-scheme',
      'column-count',
      'column-fill',
      'column-gap',
      'column-rule',
      'column-rule-color',
      'column-rule-style',
      'column-rule-width',
      'column-span',
      'column-width',
      'columns',
      'contain',
      'contain-intrinsic-block-size',
      'contain-intrinsic-height',
      'contain-intrinsic-inline-size',
      'contain-intrinsic-size',
      'contain-intrinsic-width',
      'container',
      'container-name',
      'container-type',
      'content',
      'content-visibility',
      'corner-bottom-left-shape',
      'corner-bottom-right-shape',
      'corner-shape',
      'corner-top-left-shape',
      'corner-top-right-shape',
      'counter-increment',
      'counter-reset',
      'counter-set',
      'cue',
      'cue-after',
      'cue-before',
      'cursor',
      'cx',
      'cy',
      'direction',
      'display',
      'dominant-baseline',
      'empty-cells',
      'enable-background',
      'field-sizing',
      'fill',
      'fill-opacity',
      'fill-rule',
      'filter',
      'flex',
      'flex-basis',
      'flex-direction',
      'flex-flow',
      'flex-grow',
      'flex-shrink',
      'flex-wrap',
      'float',
      'flood-color',
      'flood-opacity',
      'flow',
      'font',
      'font-display',
      'font-family',
      'font-feature-settings',
      'font-kerning',
      'font-language-override',
      'font-optical-sizing',
      'font-palette',
      'font-size',
      'font-size-adjust',
      'font-smooth',
      'font-smoothing',
      'font-stretch',
      'font-style',
      'font-synthesis',
      'font-synthesis-position',
      'font-synthesis-small-caps',
      'font-synthesis-style',
      'font-synthesis-weight',
      'font-variant',
      'font-variant-alternates',
      'font-variant-caps',
      'font-variant-east-asian',
      'font-variant-emoji',
      'font-variant-ligatures',
      'font-variant-numeric',
      'font-variant-position',
      'font-variation-settings',
      'font-weight',
      'forced-color-adjust',
      'gap',
      'glyph-orientation-horizontal',
      'glyph-orientation-vertical',
      'grid',
      'grid-area',
      'grid-auto-columns',
      'grid-auto-flow',
      'grid-auto-rows',
      'grid-column',
      'grid-column-end',
      'grid-column-start',
      'grid-gap',
      'grid-row',
      'grid-row-end',
      'grid-row-start',
      'grid-template',
      'grid-template-areas',
      'grid-template-columns',
      'grid-template-rows',
      'hanging-punctuation',
      'height',
      'hyphenate-character',
      'hyphenate-limit-chars',
      'hyphens',
      'icon',
      'image-orientation',
      'image-rendering',
      'image-resolution',
      'ime-mode',
      'initial-letter',
      'initial-letter-align',
      'inline-size',
      'inset',
      'inset-area',
      'inset-block',
      'inset-block-end',
      'inset-block-start',
      'inset-inline',
      'inset-inline-end',
      'inset-inline-start',
      'isolation',
      'justify-content',
      'justify-items',
      'justify-self',
      'kerning',
      'left',
      'letter-spacing',
      'lighting-color',
      'line-break',
      'line-height',
      'line-height-step',
      'list-style',
      'list-style-image',
      'list-style-position',
      'list-style-type',
      'margin',
      'margin-block',
      'margin-block-end',
      'margin-block-start',
      'margin-bottom',
      'margin-inline',
      'margin-inline-end',
      'margin-inline-start',
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-trim',
      'marker',
      'marker-end',
      'marker-mid',
      'marker-start',
      'marks',
      'mask',
      'mask-border',
      'mask-border-mode',
      'mask-border-outset',
      'mask-border-repeat',
      'mask-border-slice',
      'mask-border-source',
      'mask-border-width',
      'mask-clip',
      'mask-composite',
      'mask-image',
      'mask-mode',
      'mask-origin',
      'mask-position',
      'mask-repeat',
      'mask-size',
      'mask-type',
      'masonry-auto-flow',
      'math-depth',
      'math-shift',
      'math-style',
      'max-block-size',
      'max-height',
      'max-inline-size',
      'max-width',
      'min-block-size',
      'min-height',
      'min-inline-size',
      'min-width',
      'mix-blend-mode',
      'nav-down',
      'nav-index',
      'nav-left',
      'nav-right',
      'nav-up',
      'none',
      'normal',
      'object-fit',
      'object-position',
      'offset',
      'offset-anchor',
      'offset-distance',
      'offset-path',
      'offset-position',
      'offset-rotate',
      'opacity',
      'order',
      'orphans',
      'outline',
      'outline-color',
      'outline-offset',
      'outline-style',
      'outline-width',
      'overflow',
      'overflow-anchor',
      'overflow-block',
      'overflow-clip-margin',
      'overflow-inline',
      'overflow-wrap',
      'overflow-x',
      'overflow-y',
      'overlay',
      'overscroll-behavior',
      'overscroll-behavior-block',
      'overscroll-behavior-inline',
      'overscroll-behavior-x',
      'overscroll-behavior-y',
      'padding',
      'padding-block',
      'padding-block-end',
      'padding-block-start',
      'padding-bottom',
      'padding-inline',
      'padding-inline-end',
      'padding-inline-start',
      'padding-left',
      'padding-right',
      'padding-top',
      'page',
      'page-break-after',
      'page-break-before',
      'page-break-inside',
      'paint-order',
      'pause',
      'pause-after',
      'pause-before',
      'perspective',
      'perspective-origin',
      'place-content',
      'place-items',
      'place-self',
      'pointer-events',
      'position',
      'position-anchor',
      'position-visibility',
      'print-color-adjust',
      'quotes',
      'r',
      'resize',
      'rest',
      'rest-after',
      'rest-before',
      'right',
      'rotate',
      'row-gap',
      'ruby-align',
      'ruby-position',
      'scale',
      'scroll-behavior',
      'scroll-margin',
      'scroll-margin-block',
      'scroll-margin-block-end',
      'scroll-margin-block-start',
      'scroll-margin-bottom',
      'scroll-margin-inline',
      'scroll-margin-inline-end',
      'scroll-margin-inline-start',
      'scroll-margin-left',
      'scroll-margin-right',
      'scroll-margin-top',
      'scroll-padding',
      'scroll-padding-block',
      'scroll-padding-block-end',
      'scroll-padding-block-start',
      'scroll-padding-bottom',
      'scroll-padding-inline',
      'scroll-padding-inline-end',
      'scroll-padding-inline-start',
      'scroll-padding-left',
      'scroll-padding-right',
      'scroll-padding-top',
      'scroll-snap-align',
      'scroll-snap-stop',
      'scroll-snap-type',
      'scroll-timeline',
      'scroll-timeline-axis',
      'scroll-timeline-name',
      'scrollbar-color',
      'scrollbar-gutter',
      'scrollbar-width',
      'shape-image-threshold',
      'shape-margin',
      'shape-outside',
      'shape-rendering',
      'speak',
      'speak-as',
      'src', // @font-face
      'stop-color',
      'stop-opacity',
      'stroke',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'stroke-opacity',
      'stroke-width',
      'tab-size',
      'table-layout',
      'text-align',
      'text-align-all',
      'text-align-last',
      'text-anchor',
      'text-combine-upright',
      'text-decoration',
      'text-decoration-color',
      'text-decoration-line',
      'text-decoration-skip',
      'text-decoration-skip-ink',
      'text-decoration-style',
      'text-decoration-thickness',
      'text-emphasis',
      'text-emphasis-color',
      'text-emphasis-position',
      'text-emphasis-style',
      'text-indent',
      'text-justify',
      'text-orientation',
      'text-overflow',
      'text-rendering',
      'text-shadow',
      'text-size-adjust',
      'text-transform',
      'text-underline-offset',
      'text-underline-position',
      'text-wrap',
      'text-wrap-mode',
      'text-wrap-style',
      'timeline-scope',
      'top',
      'touch-action',
      'transform',
      'transform-box',
      'transform-origin',
      'transform-style',
      'transition',
      'transition-behavior',
      'transition-delay',
      'transition-duration',
      'transition-property',
      'transition-timing-function',
      'translate',
      'unicode-bidi',
      'unicode-range',
      'user-modify',
      'user-select',
      'vector-effect',
      'vertical-align',
      'view-timeline',
      'view-timeline-axis',
      'view-timeline-inset',
      'view-timeline-name',
      'view-transition-name',
      'visibility',
      'voice-balance',
      'voice-duration',
      'voice-family',
      'voice-pitch',
      'voice-range',
      'voice-rate',
      'voice-stress',
      'voice-volume',
      'white-space',
      'white-space-collapse',
      'widows',
      'width',
      'will-change',
      'word-break',
      'word-spacing',
      'word-wrap',
      'writing-mode',
      'x',
      'y',
      'z-index',
      'zoom'
  ].sort().reverse();
  /*
  Language: CSS
  Category: common, css, web
  Website: https://developer.mozilla.org/en-US/docs/Web/CSS
  */
  /** @type LanguageFn */
  function css(hljs) {
      const regex = hljs.regex;
      const modes = MODES(hljs);
      const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
      const AT_MODIFIERS = "and or not only";
      const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/; // @-webkit-keyframes
      const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
      const STRINGS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE
      ];
      return {
          name: 'CSS',
          case_insensitive: true,
          illegal: /[=|'\$]/,
          keywords: { keyframePosition: "from to" },
          classNameAliases: {
              // for visual continuity with `tag {}` and because we
              // don't have a great class for this?
              keyframePosition: "selector-tag"
          },
          contains: [
              modes.BLOCK_COMMENT,
              VENDOR_PREFIX,
              // to recognize keyframe 40% etc which are outside the scope of our
              // attribute value mode
              modes.CSS_NUMBER_MODE,
              {
                  className: 'selector-id',
                  begin: /#[A-Za-z0-9_-]+/,
                  relevance: 0
              },
              {
                  className: 'selector-class',
                  begin: '\\.' + IDENT_RE,
                  relevance: 0
              },
              modes.ATTRIBUTE_SELECTOR_MODE,
              {
                  className: 'selector-pseudo',
                  variants: [
                      { begin: ':(' + PSEUDO_CLASSES.join('|') + ')' },
                      { begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')' }
                  ]
              },
              // we may actually need this (12/2020)
              // { // pseudo-selector params
              //   begin: /\(/,
              //   end: /\)/,
              //   contains: [ hljs.CSS_NUMBER_MODE ]
              // },
              modes.CSS_VARIABLE,
              {
                  className: 'attribute',
                  begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
              },
              // attribute values
              {
                  begin: /:/,
                  end: /[;}{]/,
                  contains: [
                      modes.BLOCK_COMMENT,
                      modes.HEXCOLOR,
                      modes.IMPORTANT,
                      modes.CSS_NUMBER_MODE,
                      modes.UNICODE_RANGE,
                      ...STRINGS,
                      // needed to highlight these as strings and to avoid issues with
                      // illegal characters that might be inside urls that would trigger the
                      // languages illegal stack
                      {
                          begin: /(url|data-uri)\(/,
                          end: /\)/,
                          relevance: 0, // from keywords
                          keywords: { built_in: "url data-uri" },
                          contains: [
                              ...STRINGS,
                              {
                                  className: "string",
                                  // any character other than `)` as in `url()` will be the start
                                  // of a string, which ends with `)` (from the parent mode)
                                  begin: /[^)]/,
                                  endsWithParent: true,
                                  excludeEnd: true
                              }
                          ]
                      },
                      modes.FUNCTION_DISPATCH
                  ]
              },
              {
                  begin: regex.lookahead(/@/),
                  end: '[{;]',
                  relevance: 0,
                  illegal: /:/, // break on Less variables @var: ...
                  contains: [
                      {
                          className: 'keyword',
                          begin: AT_PROPERTY_RE
                      },
                      {
                          begin: /\s/,
                          endsWithParent: true,
                          excludeEnd: true,
                          relevance: 0,
                          keywords: {
                              $pattern: /[a-z-]+/,
                              keyword: AT_MODIFIERS,
                              attribute: MEDIA_FEATURES.join(" ")
                          },
                          contains: [
                              {
                                  begin: /[a-z-]+(?=:)/,
                                  className: "attribute"
                              },
                              ...STRINGS,
                              modes.CSS_NUMBER_MODE
                          ]
                      }
                  ]
              },
              {
                  className: 'selector-tag',
                  begin: '\\b(' + TAGS.join('|') + ')\\b'
              }
          ]
      };
  }
  module.exports = css;

  }),
  (function (module, exports, require) {
  /*
  Language: Go
  Author: Stephan Kountso aka StepLg <steplg@gmail.com>
  Contributors: Evgeny Stepanischev <imbolk@gmail.com>
  Description: Google go language (golang). For info about language
  Website: http://golang.org/
  Category: common, system
  */
  function go(hljs) {
      const LITERALS = [
          "true",
          "false",
          "iota",
          "nil"
      ];
      const BUILT_INS = [
          "append",
          "cap",
          "close",
          "complex",
          "copy",
          "imag",
          "len",
          "make",
          "new",
          "panic",
          "print",
          "println",
          "real",
          "recover",
          "delete"
      ];
      const TYPES = [
          "bool",
          "byte",
          "complex64",
          "complex128",
          "error",
          "float32",
          "float64",
          "int8",
          "int16",
          "int32",
          "int64",
          "string",
          "uint8",
          "uint16",
          "uint32",
          "uint64",
          "int",
          "uint",
          "uintptr",
          "rune"
      ];
      const KWS = [
          "break",
          "case",
          "chan",
          "const",
          "continue",
          "default",
          "defer",
          "else",
          "fallthrough",
          "for",
          "func",
          "go",
          "goto",
          "if",
          "import",
          "interface",
          "map",
          "package",
          "range",
          "return",
          "select",
          "struct",
          "switch",
          "type",
          "var",
      ];
      const KEYWORDS = {
          keyword: KWS,
          type: TYPES,
          literal: LITERALS,
          built_in: BUILT_INS
      };
      return {
          name: 'Go',
          aliases: ['golang'],
          keywords: KEYWORDS,
          illegal: '</',
          contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              {
                  className: 'string',
                  variants: [
                      hljs.QUOTE_STRING_MODE,
                      hljs.APOS_STRING_MODE,
                      {
                          begin: '`',
                          end: '`'
                      }
                  ]
              },
              {
                  className: 'number',
                  variants: [
                      {
                          match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/, // hex without a present digit before . (making a digit afterwards required)
                          relevance: 0
                      },
                      {
                          match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/, // hex with a present digit before . (making a digit afterwards optional)
                          relevance: 0
                      },
                      {
                          match: /-?\b0[oO](_?[0-7])*i?/, // leading 0o octal
                          relevance: 0
                      },
                      {
                          match: /-?\b0[bB](_?[01])*i?/, // leading 0b binary
                          relevance: 0
                      },
                      {
                          match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/, // decimal without a present digit before . (making a digit afterwards required)
                          relevance: 0
                      },
                      {
                          match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/, // decimal with a present digit before . (making a digit afterwards optional)
                          relevance: 0
                      }
                  ]
              },
              { begin: /:=/ // relevance booster
              },
              {
                  className: 'function',
                  beginKeywords: 'func',
                  end: '\\s*(\\{|$)',
                  excludeEnd: true,
                  contains: [
                      hljs.TITLE_MODE,
                      {
                          className: 'params',
                          begin: /\(/,
                          end: /\)/,
                          endsParent: true,
                          keywords: KEYWORDS,
                          illegal: /["']/
                      }
                  ]
              }
          ]
      };
  }
  module.exports = go;

  }),
  (function (module, exports, require) {
  /*
  Language: TOML, also INI
  Description: TOML aims to be a minimal configuration file format that's easy to read due to obvious semantics.
  Contributors: Guillaume Gomez <guillaume1.gomez@gmail.com>
  Category: common, config
  Website: https://github.com/toml-lang/toml
  */
  function ini(hljs) {
      const regex = hljs.regex;
      const NUMBERS = {
          className: 'number',
          relevance: 0,
          variants: [
              { begin: /([+-]+)?[\d]+_[\d_]+/ },
              { begin: hljs.NUMBER_RE }
          ]
      };
      const COMMENTS = hljs.COMMENT();
      COMMENTS.variants = [
          {
              begin: /;/,
              end: /$/
          },
          {
              begin: /#/,
              end: /$/
          }
      ];
      const VARIABLES = {
          className: 'variable',
          variants: [
              { begin: /\$[\w\d"][\w\d_]*/ },
              { begin: /\$\{(.*?)\}/ }
          ]
      };
      const LITERALS = {
          className: 'literal',
          begin: /\bon|off|true|false|yes|no\b/
      };
      const STRINGS = {
          className: "string",
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
              {
                  begin: "'''",
                  end: "'''",
                  relevance: 10
              },
              {
                  begin: '"""',
                  end: '"""',
                  relevance: 10
              },
              {
                  begin: '"',
                  end: '"'
              },
              {
                  begin: "'",
                  end: "'"
              }
          ]
      };
      const ARRAY = {
          begin: /\[/,
          end: /\]/,
          contains: [
              COMMENTS,
              LITERALS,
              VARIABLES,
              STRINGS,
              NUMBERS,
              'self'
          ],
          relevance: 0
      };
      const BARE_KEY = /[A-Za-z0-9_-]+/;
      const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
      const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
      const ANY_KEY = regex.either(BARE_KEY, QUOTED_KEY_DOUBLE_QUOTE, QUOTED_KEY_SINGLE_QUOTE);
      const DOTTED_KEY = regex.concat(ANY_KEY, '(\\s*\\.\\s*', ANY_KEY, ')*', regex.lookahead(/\s*=\s*[^#\s]/));
      return {
          name: 'TOML, also INI',
          aliases: ['toml'],
          case_insensitive: true,
          illegal: /\S/,
          contains: [
              COMMENTS,
              {
                  className: 'section',
                  begin: /\[+/,
                  end: /\]+/
              },
              {
                  begin: DOTTED_KEY,
                  className: 'attr',
                  starts: {
                      end: /$/,
                      contains: [
                          COMMENTS,
                          ARRAY,
                          LITERALS,
                          VARIABLES,
                          STRINGS,
                          NUMBERS
                      ]
                  }
              }
          ]
      };
  }
  module.exports = ini;

  }),
  (function (module, exports, require) {
  // https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
  var decimalDigits = '[0-9](_*[0-9])*';
  var frac = `\\.(${decimalDigits})`;
  var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
  var NUMERIC = {
      className: 'number',
      variants: [
          // DecimalFloatingPointLiteral
          // including ExponentPart
          { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
                  `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
          // excluding ExponentPart
          { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${frac})[fFdD]?\\b` },
          { begin: `\\b(${decimalDigits})[fFdD]\\b` },
          // HexadecimalFloatingPointLiteral
          { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
                  `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
          // DecimalIntegerLiteral
          { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },
          // HexIntegerLiteral
          { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
          // OctalIntegerLiteral
          { begin: '\\b0(_*[0-7])*[lL]?\\b' },
          // BinaryIntegerLiteral
          { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
      ],
      relevance: 0
  };
  /*
  Language: Java
  Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
  Category: common, enterprise
  Website: https://www.java.com/
  */
  /**
   * Allows recursive regex expressions to a given depth
   *
   * ie: recurRegex("(abc~~~)", /~~~/g, 2) becomes:
   * (abc(abc(abc)))
   *
   * @param {string} re
   * @param {RegExp} substitution (should be a g mode regex)
   * @param {number} depth
   * @returns {string}``
   */
  function recurRegex(re, substitution, depth) {
      if (depth === -1)
          return "";
      return re.replace(substitution, _ => {
          return recurRegex(re, substitution, depth - 1);
      });
  }
  /** @type LanguageFn */
  function java(hljs) {
      const regex = hljs.regex;
      // A Java identifier consisting of letters, digits, underscore or dollar sign, not beginning with a digit
      const JAVA_IDENT_RE = '[\u00C0-\u02B8a-zA-Z_$][\u00C0-\u02B8a-zA-Z_$0-9]*';
      // Optional 1..n pairs of square brackets identifying an array type
      const ARRAY_BRACKETS_OPTIONAL_RE = '(?:(?:\\s*\\[\\s*])+)?';
      // A simple Java type: a type name, optionally followed by type arguments and/or array brackets
      // '<@@@>' is replaced with the pattern for optional type arguments by recurRegex below.
      const SIMPLE_TYPE_RE = JAVA_IDENT_RE + '<@@@>' + ARRAY_BRACKETS_OPTIONAL_RE;
      // A bounded (? extends Number) or unbounded (?) wildcard type
      const WILDCARD_TYPE_RE = '\\?(?:\\s+(?:extends|super)\\s+' + SIMPLE_TYPE_RE + ')?';
      // A Java type argument, consisting of a wildcard or simple type
      const TYPE_ARG_RE = '(?:' + WILDCARD_TYPE_RE + '|' + SIMPLE_TYPE_RE + ')';
      // Pattern for optional generic type arguments in angle brackets with up to 2 levels of nested type arguments
      const TYPE_ARGS_OPTIONAL_RE = recurRegex('(?:\\s*<\\s*' + TYPE_ARG_RE + '(?:\\s*,\\s*' + TYPE_ARG_RE + ')*\\s*>)?', /<@@@>/g, 2);
      const MAIN_KEYWORDS = [
          'synchronized',
          'abstract',
          'private',
          'var',
          'static',
          'if',
          'const ',
          'for',
          'while',
          'strictfp',
          'finally',
          'protected',
          'import',
          'native',
          'final',
          'void',
          'enum',
          'else',
          'break',
          'transient',
          'catch',
          'instanceof',
          'volatile',
          'case',
          'assert',
          'package',
          'default',
          'public',
          'try',
          'switch',
          'continue',
          'throws',
          'protected',
          'public',
          'private',
          'module',
          'requires',
          'exports',
          'do',
          'sealed',
          'yield',
          'permits',
          'goto',
          'when'
      ];
      const BUILT_INS = [
          'super',
          'this'
      ];
      const LITERALS = [
          'false',
          'true',
          'null'
      ];
      const TYPES = [
          'char',
          'boolean',
          'long',
          'float',
          'int',
          'byte',
          'short',
          'double'
      ];
      const KEYWORDS = {
          keyword: MAIN_KEYWORDS,
          literal: LITERALS,
          type: TYPES,
          built_in: BUILT_INS
      };
      const ANNOTATION = {
          className: 'meta',
          begin: '@' + JAVA_IDENT_RE,
          contains: [
              {
                  begin: /\(/,
                  end: /\)/,
                  contains: ["self"] // allow nested () inside our annotation
              }
          ]
      };
      const PARAMS = {
          className: 'params',
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS,
          relevance: 0,
          contains: [hljs.C_BLOCK_COMMENT_MODE],
          endsParent: true
      };
      return {
          name: 'Java',
          aliases: ['jsp'],
          keywords: KEYWORDS,
          illegal: /<\/|#/,
          contains: [
              hljs.COMMENT('/\\*\\*', '\\*/', {
                  relevance: 0,
                  contains: [
                      {
                          // eat up @'s in emails to prevent them to be recognized as doctags
                          begin: /\w+@/,
                          relevance: 0
                      },
                      {
                          className: 'doctag',
                          begin: '@[A-Za-z]+'
                      }
                  ]
              }),
              // relevance boost
              {
                  begin: /import java\.[a-z]+\./,
                  keywords: "import",
                  relevance: 2
              },
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              {
                  begin: /"""/,
                  end: /"""/,
                  className: "string",
                  contains: [hljs.BACKSLASH_ESCAPE]
              },
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              {
                  match: [
                      /\b(?:class|interface|enum|extends|implements|new)/,
                      /\s+/,
                      JAVA_IDENT_RE
                  ],
                  className: {
                      1: "keyword",
                      3: "title.class"
                  }
              },
              {
                  // Exceptions for hyphenated keywords
                  match: /non-sealed/,
                  scope: "keyword"
              },
              {
                  // Expression keywords prevent keyword-led expressions from being
                  // recognized as variable or method declarations.
                  beginKeywords: 'new throw return else yield assert',
                  relevance: 0
              },
              {
                  begin: [
                      JAVA_IDENT_RE,
                      regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
                      JAVA_IDENT_RE,
                      ARRAY_BRACKETS_OPTIONAL_RE,
                      /\s*/,
                      /=(?!=)/
                  ],
                  className: {
                      1: "type",
                      3: "variable",
                      6: "operator"
                  }
              },
              {
                  begin: [
                      /record/,
                      /\s+/,
                      JAVA_IDENT_RE
                  ],
                  className: {
                      1: "keyword",
                      3: "title.class"
                  },
                  contains: [
                      PARAMS,
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              {
                  begin: [
                      JAVA_IDENT_RE,
                      regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
                      JAVA_IDENT_RE,
                      /\s*(?=\()/
                  ],
                  className: {
                      1: "type",
                      3: "title.function"
                  },
                  keywords: KEYWORDS,
                  contains: [
                      {
                          className: 'params',
                          begin: /\(/,
                          end: /\)/,
                          keywords: KEYWORDS,
                          relevance: 0,
                          contains: [
                              ANNOTATION,
                              hljs.APOS_STRING_MODE,
                              hljs.QUOTE_STRING_MODE,
                              NUMERIC,
                              hljs.C_BLOCK_COMMENT_MODE
                          ]
                      },
                      hljs.C_LINE_COMMENT_MODE,
                      hljs.C_BLOCK_COMMENT_MODE
                  ]
              },
              NUMERIC,
              ANNOTATION
          ]
      };
  }
  module.exports = java;

  }),
  (function (module, exports, require) {
  const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  const KEYWORDS = [
      "as", // for exports
      "in",
      "of",
      "if",
      "for",
      "while",
      "finally",
      "var",
      "new",
      "function",
      "do",
      "return",
      "void",
      "else",
      "break",
      "catch",
      "instanceof",
      "with",
      "throw",
      "case",
      "default",
      "try",
      "switch",
      "continue",
      "typeof",
      "delete",
      "let",
      "yield",
      "const",
      "class",
      // JS handles these with a special rule
      // "get",
      // "set",
      "debugger",
      "async",
      "await",
      "static",
      "import",
      "from",
      "export",
      "extends",
      // It's reached stage 3, which is "recommended for implementation":
      "using"
  ];
  const LITERALS = [
      "true",
      "false",
      "null",
      "undefined",
      "NaN",
      "Infinity"
  ];
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
  const TYPES = [
      // Fundamental objects
      "Object",
      "Function",
      "Boolean",
      "Symbol",
      // numbers and dates
      "Math",
      "Date",
      "Number",
      "BigInt",
      // text
      "String",
      "RegExp",
      // Indexed collections
      "Array",
      "Float32Array",
      "Float64Array",
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Int32Array",
      "Uint16Array",
      "Uint32Array",
      "BigInt64Array",
      "BigUint64Array",
      // Keyed collections
      "Set",
      "Map",
      "WeakSet",
      "WeakMap",
      // Structured data
      "ArrayBuffer",
      "SharedArrayBuffer",
      "Atomics",
      "DataView",
      "JSON",
      // Control abstraction objects
      "Promise",
      "Generator",
      "GeneratorFunction",
      "AsyncFunction",
      // Reflection
      "Reflect",
      "Proxy",
      // Internationalization
      "Intl",
      // WebAssembly
      "WebAssembly"
  ];
  const ERROR_TYPES = [
      "Error",
      "EvalError",
      "InternalError",
      "RangeError",
      "ReferenceError",
      "SyntaxError",
      "TypeError",
      "URIError"
  ];
  const BUILT_IN_GLOBALS = [
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",
      "require",
      "exports",
      "eval",
      "isFinite",
      "isNaN",
      "parseFloat",
      "parseInt",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "escape",
      "unescape"
  ];
  const BUILT_IN_VARIABLES = [
      "arguments",
      "this",
      "super",
      "console",
      "window",
      "document",
      "localStorage",
      "sessionStorage",
      "module",
      "self",
      "global" // Node.js
  ];
  const BUILT_INS = [].concat(BUILT_IN_GLOBALS, TYPES, ERROR_TYPES);
  /*
  Language: JavaScript
  Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
  Category: common, scripting, web
  Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
  */
  /** @type LanguageFn */
  function javascript(hljs) {
      const regex = hljs.regex;
      /**
       * Takes a string like "<Booger" and checks to see
       * if we can find a matching "</Booger" later in the
       * content.
       * @param {RegExpMatchArray} match
       * @param {{after:number}} param1
       */
      const hasClosingTag = (match, { after }) => {
          const tag = "</" + match[0].slice(1);
          const pos = match.input.indexOf(tag, after);
          return pos !== -1;
      };
      const IDENT_RE$1 = IDENT_RE;
      const FRAGMENT = {
          begin: '<>',
          end: '</>'
      };
      // to avoid some special cases inside isTrulyOpeningTag
      const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
      const XML_TAG = {
          begin: /<[A-Za-z0-9\\._:-]+/,
          end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
          /**
           * @param {RegExpMatchArray} match
           * @param {CallbackResponse} response
           */
          isTrulyOpeningTag: (match, response) => {
              const afterMatchIndex = match[0].length + match.index;
              const nextChar = match.input[afterMatchIndex];
              if (
              // HTML should not include another raw `<` inside a tag
              // nested type?
              // `<Array<Array<number>>`, etc.
              nextChar === "<" ||
                  // the , gives away that this is not HTML
                  // `<T, A extends keyof T, V>`
                  nextChar === ",") {
                  response.ignoreMatch();
                  return;
              }
              // `<something>`
              // Quite possibly a tag, lets look for a matching closing tag...
              if (nextChar === ">") {
                  // if we cannot find a matching closing tag, then we
                  // will ignore it
                  if (!hasClosingTag(match, { after: afterMatchIndex })) {
                      response.ignoreMatch();
                  }
              }
              // `<blah />` (self-closing)
              // handled by simpleSelfClosing rule
              let m;
              const afterMatch = match.input.substring(afterMatchIndex);
              // some more template typing stuff
              //  <T = any>(key?: string) => Modify<
              if ((m = afterMatch.match(/^\s*=/))) {
                  response.ignoreMatch();
                  return;
              }
              // `<From extends string>`
              // technically this could be HTML, but it smells like a type
              // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
              if ((m = afterMatch.match(/^\s+extends\s+/))) {
                  if (m.index === 0) {
                      response.ignoreMatch();
                      // eslint-disable-next-line no-useless-return
                      return;
                  }
              }
          }
      };
      const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_INS,
          "variable.language": BUILT_IN_VARIABLES
      };
      // https://tc39.es/ecma262/#sec-literals-numeric-literals
      const decimalDigits = '[0-9](_?[0-9])*';
      const frac = `\\.(${decimalDigits})`;
      // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
      const NUMBER = {
          className: 'number',
          variants: [
              // DecimalLiteral
              { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
                      `[eE][+-]?(${decimalDigits})\\b` },
              { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
              // DecimalBigIntegerLiteral
              { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
              // NonDecimalIntegerLiteral
              { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
              { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
              { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
              // LegacyOctalIntegerLiteral (does not include underscore separators)
              // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
              { begin: "\\b0[0-7]+n?\\b" },
          ],
          relevance: 0
      };
      const SUBST = {
          className: 'subst',
          begin: '\\$\\{',
          end: '\\}',
          keywords: KEYWORDS$1,
          contains: [] // defined later
      };
      const HTML_TEMPLATE = {
          begin: '\.?html`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'xml'
          }
      };
      const CSS_TEMPLATE = {
          begin: '\.?css`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'css'
          }
      };
      const GRAPHQL_TEMPLATE = {
          begin: '\.?gql`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'graphql'
          }
      };
      const TEMPLATE_STRING = {
          className: 'string',
          begin: '`',
          end: '`',
          contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
          ]
      };
      const JSDOC_COMMENT = hljs.COMMENT(/\/\*\*(?!\/)/, '\\*/', {
          relevance: 0,
          contains: [
              {
                  begin: '(?=@[A-Za-z]+)',
                  relevance: 0,
                  contains: [
                      {
                          className: 'doctag',
                          begin: '@[A-Za-z]+'
                      },
                      {
                          className: 'type',
                          begin: '\\{',
                          end: '\\}',
                          excludeEnd: true,
                          excludeBegin: true,
                          relevance: 0
                      },
                      {
                          className: 'variable',
                          begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
                          endsParent: true,
                          relevance: 0
                      },
                      // eat spaces (not newlines) so we can find
                      // types or variables
                      {
                          begin: /(?=[^\n])\s/,
                          relevance: 0
                      }
                  ]
              }
          ]
      });
      const COMMENT = {
          className: "comment",
          variants: [
              JSDOC_COMMENT,
              hljs.C_BLOCK_COMMENT_MODE,
              hljs.C_LINE_COMMENT_MODE
          ]
      };
      const SUBST_INTERNALS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          GRAPHQL_TEMPLATE,
          TEMPLATE_STRING,
          // Skip numbers when they are part of a variable name
          { match: /\$\d+/ },
          NUMBER,
          // This is intentional:
          // See https://github.com/highlightjs/highlight.js/issues/3288
          // hljs.REGEXP_MODE
      ];
      SUBST.contains = SUBST_INTERNALS
          .concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
              "self"
          ].concat(SUBST_INTERNALS)
      });
      const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
      const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
          // eat recursive parens in sub expressions
          {
              begin: /(\s*)\(/,
              end: /\)/,
              keywords: KEYWORDS$1,
              contains: ["self"].concat(SUBST_AND_COMMENTS)
          }
      ]);
      const PARAMS = {
          className: 'params',
          // convert this to negative lookbehind in v12
          begin: /(\s*)\(/, // to match the parms with
          end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS$1,
          contains: PARAMS_CONTAINS
      };
      // ES6 classes
      const CLASS_OR_EXTENDS = {
          variants: [
              // class Car extends vehicle
              {
                  match: [
                      /class/,
                      /\s+/,
                      IDENT_RE$1,
                      /\s+/,
                      /extends/,
                      /\s+/,
                      regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class",
                      5: "keyword",
                      7: "title.class.inherited"
                  }
              },
              // class Car
              {
                  match: [
                      /class/,
                      /\s+/,
                      IDENT_RE$1
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class"
                  }
              },
          ]
      };
      const CLASS_REFERENCE = {
          relevance: 0,
          match: regex.either(
          // Hard coded exceptions
          /\bJSON/, 
          // Float32Array, OutT
          /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/, 
          // CSSFactory, CSSFactoryT
          /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/, 
          // FPs, FPsT
          /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),
          className: "title.class",
          keywords: {
              _: [
                  // se we still get relevance credit for JS library classes
                  ...TYPES,
                  ...ERROR_TYPES
              ]
          }
      };
      const USE_STRICT = {
          label: "use_strict",
          className: 'meta',
          relevance: 10,
          begin: /^\s*['"]use (strict|asm)['"]/
      };
      const FUNCTION_DEFINITION = {
          variants: [
              {
                  match: [
                      /function/,
                      /\s+/,
                      IDENT_RE$1,
                      /(?=\s*\()/
                  ]
              },
              // anonymous function
              {
                  match: [
                      /function/,
                      /\s*(?=\()/
                  ]
              }
          ],
          className: {
              1: "keyword",
              3: "title.function"
          },
          label: "func.def",
          contains: [PARAMS],
          illegal: /%/
      };
      const UPPER_CASE_CONSTANT = {
          relevance: 0,
          match: /\b[A-Z][A-Z_0-9]+\b/,
          className: "variable.constant"
      };
      function noneOf(list) {
          return regex.concat("(?!", list.join("|"), ")");
      }
      const FUNCTION_CALL = {
          match: regex.concat(/\b/, noneOf([
              ...BUILT_IN_GLOBALS,
              "super",
              "import",
              "await",
          ].map(x => `${x}\\s*\\(`)), IDENT_RE$1, regex.lookahead(/\s*\(/)),
          className: "title.function",
          relevance: 0
      };
      const PROPERTY_ACCESS = {
          begin: regex.concat(/\./, regex.lookahead(regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/))),
          end: IDENT_RE$1,
          excludeBegin: true,
          keywords: "prototype",
          className: "property",
          relevance: 0
      };
      const GETTER_OR_SETTER = {
          match: [
              /get|set/,
              /\s+/,
              IDENT_RE$1,
              /(?=\()/
          ],
          className: {
              1: "keyword",
              3: "title.function"
          },
          contains: [
              {
                  begin: /\(\)/
              },
              PARAMS
          ]
      };
      const FUNC_LEAD_IN_RE = '(\\(' +
          '[^()]*(\\(' +
          '[^()]*(\\(' +
          '[^()]*' +
          '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';
      const FUNCTION_VARIABLE = {
          match: [
              /const|var|let/, /\s+/,
              IDENT_RE$1, /\s*/,
              /=\s*/,
              /(async\s*)?/, // async is optional
              regex.lookahead(FUNC_LEAD_IN_RE)
          ],
          keywords: "async",
          className: {
              1: "keyword",
              3: "title.function"
          },
          contains: [
              PARAMS
          ]
      };
      return {
          name: 'JavaScript',
          aliases: ['js', 'jsx', 'mjs', 'cjs'],
          keywords: KEYWORDS$1,
          // this will be extended by TypeScript
          exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
          illegal: /#(?![$_A-Za-z])/,
          contains: [
              hljs.SHEBANG({
                  label: "shebang",
                  binary: "node",
                  relevance: 5
              }),
              USE_STRICT,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              HTML_TEMPLATE,
              CSS_TEMPLATE,
              GRAPHQL_TEMPLATE,
              TEMPLATE_STRING,
              COMMENT,
              // Skip numbers when they are part of a variable name
              { match: /\$\d+/ },
              NUMBER,
              CLASS_REFERENCE,
              {
                  scope: 'attr',
                  match: IDENT_RE$1 + regex.lookahead(':'),
                  relevance: 0
              },
              FUNCTION_VARIABLE,
              {
                  begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
                  keywords: 'return throw case',
                  relevance: 0,
                  contains: [
                      COMMENT,
                      hljs.REGEXP_MODE,
                      {
                          className: 'function',
                          // we have to count the parens to make sure we actually have the
                          // correct bounding ( ) before the =>.  There could be any number of
                          // sub-expressions inside also surrounded by parens.
                          begin: FUNC_LEAD_IN_RE,
                          returnBegin: true,
                          end: '\\s*=>',
                          contains: [
                              {
                                  className: 'params',
                                  variants: [
                                      {
                                          begin: hljs.UNDERSCORE_IDENT_RE,
                                          relevance: 0
                                      },
                                      {
                                          className: null,
                                          begin: /\(\s*\)/,
                                          skip: true
                                      },
                                      {
                                          begin: /(\s*)\(/,
                                          end: /\)/,
                                          excludeBegin: true,
                                          excludeEnd: true,
                                          keywords: KEYWORDS$1,
                                          contains: PARAMS_CONTAINS
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          begin: /,/,
                          relevance: 0
                      },
                      {
                          match: /\s+/,
                          relevance: 0
                      },
                      {
                          variants: [
                              { begin: FRAGMENT.begin, end: FRAGMENT.end },
                              { match: XML_SELF_CLOSING },
                              {
                                  begin: XML_TAG.begin,
                                  // we carefully check the opening tag to see if it truly
                                  // is a tag and not a false positive
                                  'on:begin': XML_TAG.isTrulyOpeningTag,
                                  end: XML_TAG.end
                              }
                          ],
                          subLanguage: 'xml',
                          contains: [
                              {
                                  begin: XML_TAG.begin,
                                  end: XML_TAG.end,
                                  skip: true,
                                  contains: ['self']
                              }
                          ]
                      }
                  ],
              },
              FUNCTION_DEFINITION,
              {
                  // prevent this from getting swallowed up by function
                  // since they appear "function like"
                  beginKeywords: "while if switch catch for"
              },
              {
                  // we have to count the parens to make sure we actually have the correct
                  // bounding ( ).  There could be any number of sub-expressions inside
                  // also surrounded by parens.
                  begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
                      '\\(' + // first parens
                      '[^()]*(\\(' +
                      '[^()]*(\\(' +
                      '[^()]*' +
                      '\\)[^()]*)*' +
                      '\\)[^()]*)*' +
                      '\\)\\s*\\{', // end parens
                  returnBegin: true,
                  label: "func.def",
                  contains: [
                      PARAMS,
                      hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
                  ]
              },
              // catch ... so it won't trigger the property rule below
              {
                  match: /\.\.\./,
                  relevance: 0
              },
              PROPERTY_ACCESS,
              // hack: prevents detection of keywords in some circumstances
              // .keyword()
              // $keyword = x
              {
                  match: '\\$' + IDENT_RE$1,
                  relevance: 0
              },
              {
                  match: [/\bconstructor(?=\s*\()/],
                  className: { 1: "title.function" },
                  contains: [PARAMS]
              },
              FUNCTION_CALL,
              UPPER_CASE_CONSTANT,
              CLASS_OR_EXTENDS,
              GETTER_OR_SETTER,
              {
                  match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
              }
          ]
      };
  }
  module.exports = javascript;

  }),
  (function (module, exports, require) {
  const EXTENDED_NUMBER_RE = '([-+]?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)|NaN|[-+]?Infinity'; // 0x..., 0..., decimal, float
  const EXTENDED_NUMBER_MODE = {
      scope: 'number',
      match: EXTENDED_NUMBER_RE,
      relevance: 0
  };
  /*
  Language: JSON
  Description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
  Websites: http://www.json.org, https://www.json5.org
  Category: common, protocols, web
  */
  function json(hljs) {
      const ATTRIBUTE = {
          className: 'attr',
          begin: /(("(\\.|[^\\"\r\n])*")|('(\\.|[^\\'\r\n])*'))(?=\s*:)/,
          relevance: 1.01
      };
      const PUNCTUATION = {
          match: /[{}[\],:]/,
          className: "punctuation",
          relevance: 0
      };
      const LITERALS = [
          "true",
          "false",
          "null"
      ];
      // NOTE: normally we would rely on `keywords` for this but using a mode here allows us
      // - to use the very tight `illegal: \S` rule later to flag any other character
      // - as illegal indicating that despite looking like JSON we do not truly have
      // - JSON and thus improve false-positively greatly since JSON will try and claim
      // - all sorts of JSON looking stuff
      const LITERALS_MODE = {
          scope: "literal",
          beginKeywords: LITERALS.join(" "),
      };
      return {
          name: 'JSON',
          aliases: ['jsonc', 'json5'],
          keywords: {
              literal: LITERALS,
          },
          contains: [
              ATTRIBUTE,
              PUNCTUATION,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              LITERALS_MODE,
              EXTENDED_NUMBER_MODE,
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
          ],
          illegal: '\\S'
      };
  }
  module.exports = json;

  }),
  (function (module, exports, require) {
  // https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
  var decimalDigits = '[0-9](_*[0-9])*';
  var frac = `\\.(${decimalDigits})`;
  var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
  var NUMERIC = {
      className: 'number',
      variants: [
          // DecimalFloatingPointLiteral
          // including ExponentPart
          { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
                  `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
          // excluding ExponentPart
          { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${frac})[fFdD]?\\b` },
          { begin: `\\b(${decimalDigits})[fFdD]\\b` },
          // HexadecimalFloatingPointLiteral
          { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
                  `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
          // DecimalIntegerLiteral
          { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },
          // HexIntegerLiteral
          { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
          // OctalIntegerLiteral
          { begin: '\\b0(_*[0-7])*[lL]?\\b' },
          // BinaryIntegerLiteral
          { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
      ],
      relevance: 0
  };
  /*
   Language: Kotlin
   Description: Kotlin is an OSS statically typed programming language that targets the JVM, Android, JavaScript and Native.
   Author: Sergey Mashkov <cy6erGn0m@gmail.com>
   Website: https://kotlinlang.org
   Category: common
   */
  function kotlin(hljs) {
      const KEYWORDS = {
          keyword: 'abstract as val var vararg get set class object open private protected public noinline '
              + 'crossinline dynamic final enum if else do while for when throw try catch finally '
              + 'import package is in fun override companion reified inline lateinit init '
              + 'interface annotation data sealed internal infix operator out by constructor super '
              + 'tailrec where const inner suspend typealias external expect actual',
          built_in: 'Byte Short Char Int Long Boolean Float Double Void Unit Nothing',
          literal: 'true false null'
      };
      const KEYWORDS_WITH_LABEL = {
          className: 'keyword',
          begin: /\b(break|continue|return|this)\b/,
          starts: { contains: [
                  {
                      className: 'symbol',
                      begin: /@\w+/
                  }
              ] }
      };
      const LABEL = {
          className: 'symbol',
          begin: hljs.UNDERSCORE_IDENT_RE + '@'
      };
      // for string templates
      const SUBST = {
          className: 'subst',
          begin: /\$\{/,
          end: /\}/,
          contains: [hljs.C_NUMBER_MODE]
      };
      const VARIABLE = {
          className: 'variable',
          begin: '\\$' + hljs.UNDERSCORE_IDENT_RE
      };
      const STRING = {
          className: 'string',
          variants: [
              {
                  begin: '"""',
                  end: '"""(?=[^"])',
                  contains: [
                      VARIABLE,
                      SUBST
                  ]
              },
              // Can't use built-in modes easily, as we want to use STRING in the meta
              // context as 'meta-string' and there's no syntax to remove explicitly set
              // classNames in built-in modes.
              {
                  begin: '\'',
                  end: '\'',
                  illegal: /\n/,
                  contains: [hljs.BACKSLASH_ESCAPE]
              },
              {
                  begin: '"',
                  end: '"',
                  illegal: /\n/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      VARIABLE,
                      SUBST
                  ]
              }
          ]
      };
      SUBST.contains.push(STRING);
      const ANNOTATION_USE_SITE = {
          className: 'meta',
          begin: '@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*' + hljs.UNDERSCORE_IDENT_RE + ')?'
      };
      const ANNOTATION = {
          className: 'meta',
          begin: '@' + hljs.UNDERSCORE_IDENT_RE,
          contains: [
              {
                  begin: /\(/,
                  end: /\)/,
                  contains: [
                      hljs.inherit(STRING, { className: 'string' }),
                      "self"
                  ]
              }
          ]
      };
      // https://kotlinlang.org/docs/reference/whatsnew11.html#underscores-in-numeric-literals
      // According to the doc above, the number mode of kotlin is the same as java 8,
      // so the code below is copied from java.js
      const KOTLIN_NUMBER_MODE = NUMERIC;
      const KOTLIN_NESTED_COMMENT = hljs.COMMENT('/\\*', '\\*/', { contains: [hljs.C_BLOCK_COMMENT_MODE] });
      const KOTLIN_PAREN_TYPE = { variants: [
              {
                  className: 'type',
                  begin: hljs.UNDERSCORE_IDENT_RE
              },
              {
                  begin: /\(/,
                  end: /\)/,
                  contains: [] // defined later
              }
          ] };
      const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
      KOTLIN_PAREN_TYPE2.variants[1].contains = [KOTLIN_PAREN_TYPE];
      KOTLIN_PAREN_TYPE.variants[1].contains = [KOTLIN_PAREN_TYPE2];
      return {
          name: 'Kotlin',
          aliases: [
              'kt',
              'kts',
              'ktm',
              'ktx'
          ],
          keywords: KEYWORDS,
          contains: [
              hljs.COMMENT('/\\*\\*', '\\*/', {
                  relevance: 0,
                  contains: [
                      {
                          className: 'doctag',
                          begin: '@[A-Za-z]+'
                      }
                  ]
              }),
              hljs.C_LINE_COMMENT_MODE,
              KOTLIN_NESTED_COMMENT,
              KEYWORDS_WITH_LABEL,
              LABEL,
              ANNOTATION_USE_SITE,
              ANNOTATION,
              {
                  className: 'function',
                  beginKeywords: 'fun',
                  end: '[(]|$',
                  returnBegin: true,
                  excludeEnd: true,
                  keywords: KEYWORDS,
                  relevance: 5,
                  contains: [
                      {
                          begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(',
                          returnBegin: true,
                          relevance: 0,
                          contains: [hljs.UNDERSCORE_TITLE_MODE]
                      },
                      {
                          className: 'type',
                          begin: /</,
                          end: />/,
                          keywords: 'reified',
                          relevance: 0
                      },
                      {
                          className: 'params',
                          begin: /\(/,
                          end: /\)/,
                          endsParent: true,
                          keywords: KEYWORDS,
                          relevance: 0,
                          contains: [
                              {
                                  begin: /:/,
                                  end: /[=,\/]/,
                                  endsWithParent: true,
                                  contains: [
                                      KOTLIN_PAREN_TYPE,
                                      hljs.C_LINE_COMMENT_MODE,
                                      KOTLIN_NESTED_COMMENT
                                  ],
                                  relevance: 0
                              },
                              hljs.C_LINE_COMMENT_MODE,
                              KOTLIN_NESTED_COMMENT,
                              ANNOTATION_USE_SITE,
                              ANNOTATION,
                              STRING,
                              hljs.C_NUMBER_MODE
                          ]
                      },
                      KOTLIN_NESTED_COMMENT
                  ]
              },
              {
                  begin: [
                      /class|interface|trait/,
                      /\s+/,
                      hljs.UNDERSCORE_IDENT_RE
                  ],
                  beginScope: {
                      3: "title.class"
                  },
                  keywords: 'class interface trait',
                  end: /[:\{(]|$/,
                  excludeEnd: true,
                  illegal: 'extends implements',
                  contains: [
                      { beginKeywords: 'public protected internal private constructor' },
                      hljs.UNDERSCORE_TITLE_MODE,
                      {
                          className: 'type',
                          begin: /</,
                          end: />/,
                          excludeBegin: true,
                          excludeEnd: true,
                          relevance: 0
                      },
                      {
                          className: 'type',
                          begin: /[,:]\s*/,
                          end: /[<\(,){\s]|$/,
                          excludeBegin: true,
                          returnEnd: true
                      },
                      ANNOTATION_USE_SITE,
                      ANNOTATION
                  ]
              },
              STRING,
              {
                  className: 'meta',
                  begin: "^#!/usr/bin/env",
                  end: '$',
                  illegal: '\n'
              },
              KOTLIN_NUMBER_MODE
          ]
      };
  }
  module.exports = kotlin;

  }),
  (function (module, exports, require) {
  const MODES = (hljs) => {
      return {
          IMPORTANT: {
              scope: 'meta',
              begin: '!important'
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
              scope: 'number',
              begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          UNICODE_RANGE: {
              scope: 'number',
              begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
          },
          FUNCTION_DISPATCH: {
              className: "built_in",
              begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
              scope: 'selector-attr',
              begin: /\[/,
              end: /\]/,
              illegal: '$',
              contains: [
                  hljs.APOS_STRING_MODE,
                  hljs.QUOTE_STRING_MODE
              ]
          },
          CSS_NUMBER_MODE: {
              scope: 'number',
              begin: hljs.NUMBER_RE + '(' +
                  '%|em|ex|ch|rem' +
                  '|vw|vh|vmin|vmax' +
                  '|cm|mm|in|pt|pc|px' +
                  '|deg|grad|rad|turn' +
                  '|s|ms' +
                  '|Hz|kHz' +
                  '|dpi|dpcm|dppx' +
                  ')?',
              relevance: 0
          },
          CSS_VARIABLE: {
              className: "attr",
              begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
      };
  };
  const HTML_TAGS = [
      'a',
      'abbr',
      'address',
      'article',
      'aside',
      'audio',
      'b',
      'blockquote',
      'body',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'dd',
      'del',
      'details',
      'dfn',
      'div',
      'dl',
      'dt',
      'em',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hgroup',
      'html',
      'i',
      'iframe',
      'img',
      'input',
      'ins',
      'kbd',
      'label',
      'legend',
      'li',
      'main',
      'mark',
      'menu',
      'nav',
      'object',
      'ol',
      'optgroup',
      'option',
      'p',
      'picture',
      'q',
      'quote',
      'samp',
      'section',
      'select',
      'source',
      'span',
      'strong',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'time',
      'tr',
      'ul',
      'var',
      'video'
  ];
  const SVG_TAGS = [
      'defs',
      'g',
      'marker',
      'mask',
      'pattern',
      'svg',
      'switch',
      'symbol',
      'feBlend',
      'feColorMatrix',
      'feComponentTransfer',
      'feComposite',
      'feConvolveMatrix',
      'feDiffuseLighting',
      'feDisplacementMap',
      'feFlood',
      'feGaussianBlur',
      'feImage',
      'feMerge',
      'feMorphology',
      'feOffset',
      'feSpecularLighting',
      'feTile',
      'feTurbulence',
      'linearGradient',
      'radialGradient',
      'stop',
      'circle',
      'ellipse',
      'image',
      'line',
      'path',
      'polygon',
      'polyline',
      'rect',
      'text',
      'use',
      'textPath',
      'tspan',
      'foreignObject',
      'clipPath'
  ];
  const TAGS = [
      ...HTML_TAGS,
      ...SVG_TAGS,
  ];
  // Sorting, then reversing makes sure longer attributes/elements like
  // `font-weight` are matched fully instead of getting false positives on say `font`
  const MEDIA_FEATURES = [
      'any-hover',
      'any-pointer',
      'aspect-ratio',
      'color',
      'color-gamut',
      'color-index',
      'device-aspect-ratio',
      'device-height',
      'device-width',
      'display-mode',
      'forced-colors',
      'grid',
      'height',
      'hover',
      'inverted-colors',
      'monochrome',
      'orientation',
      'overflow-block',
      'overflow-inline',
      'pointer',
      'prefers-color-scheme',
      'prefers-contrast',
      'prefers-reduced-motion',
      'prefers-reduced-transparency',
      'resolution',
      'scan',
      'scripting',
      'update',
      'width',
      // TODO: find a better solution?
      'min-width',
      'max-width',
      'min-height',
      'max-height'
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
  const PSEUDO_CLASSES = [
      'active',
      'any-link',
      'blank',
      'checked',
      'current',
      'default',
      'defined',
      'dir', // dir()
      'disabled',
      'drop',
      'empty',
      'enabled',
      'first',
      'first-child',
      'first-of-type',
      'fullscreen',
      'future',
      'focus',
      'focus-visible',
      'focus-within',
      'has', // has()
      'host', // host or host()
      'host-context', // host-context()
      'hover',
      'indeterminate',
      'in-range',
      'invalid',
      'is', // is()
      'lang', // lang()
      'last-child',
      'last-of-type',
      'left',
      'link',
      'local-link',
      'not', // not()
      'nth-child', // nth-child()
      'nth-col', // nth-col()
      'nth-last-child', // nth-last-child()
      'nth-last-col', // nth-last-col()
      'nth-last-of-type', //nth-last-of-type()
      'nth-of-type', //nth-of-type()
      'only-child',
      'only-of-type',
      'optional',
      'out-of-range',
      'past',
      'placeholder-shown',
      'read-only',
      'read-write',
      'required',
      'right',
      'root',
      'scope',
      'target',
      'target-within',
      'user-invalid',
      'valid',
      'visited',
      'where' // where()
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
  const PSEUDO_ELEMENTS = [
      'after',
      'backdrop',
      'before',
      'cue',
      'cue-region',
      'first-letter',
      'first-line',
      'grammar-error',
      'marker',
      'part',
      'placeholder',
      'selection',
      'slotted',
      'spelling-error'
  ].sort().reverse();
  const ATTRIBUTES = [
      'accent-color',
      'align-content',
      'align-items',
      'align-self',
      'alignment-baseline',
      'all',
      'anchor-name',
      'animation',
      'animation-composition',
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-name',
      'animation-play-state',
      'animation-range',
      'animation-range-end',
      'animation-range-start',
      'animation-timeline',
      'animation-timing-function',
      'appearance',
      'aspect-ratio',
      'backdrop-filter',
      'backface-visibility',
      'background',
      'background-attachment',
      'background-blend-mode',
      'background-clip',
      'background-color',
      'background-image',
      'background-origin',
      'background-position',
      'background-position-x',
      'background-position-y',
      'background-repeat',
      'background-size',
      'baseline-shift',
      'block-size',
      'border',
      'border-block',
      'border-block-color',
      'border-block-end',
      'border-block-end-color',
      'border-block-end-style',
      'border-block-end-width',
      'border-block-start',
      'border-block-start-color',
      'border-block-start-style',
      'border-block-start-width',
      'border-block-style',
      'border-block-width',
      'border-bottom',
      'border-bottom-color',
      'border-bottom-left-radius',
      'border-bottom-right-radius',
      'border-bottom-style',
      'border-bottom-width',
      'border-collapse',
      'border-color',
      'border-end-end-radius',
      'border-end-start-radius',
      'border-image',
      'border-image-outset',
      'border-image-repeat',
      'border-image-slice',
      'border-image-source',
      'border-image-width',
      'border-inline',
      'border-inline-color',
      'border-inline-end',
      'border-inline-end-color',
      'border-inline-end-style',
      'border-inline-end-width',
      'border-inline-start',
      'border-inline-start-color',
      'border-inline-start-style',
      'border-inline-start-width',
      'border-inline-style',
      'border-inline-width',
      'border-left',
      'border-left-color',
      'border-left-style',
      'border-left-width',
      'border-radius',
      'border-right',
      'border-right-color',
      'border-right-style',
      'border-right-width',
      'border-spacing',
      'border-start-end-radius',
      'border-start-start-radius',
      'border-style',
      'border-top',
      'border-top-color',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-top-style',
      'border-top-width',
      'border-width',
      'bottom',
      'box-align',
      'box-decoration-break',
      'box-direction',
      'box-flex',
      'box-flex-group',
      'box-lines',
      'box-ordinal-group',
      'box-orient',
      'box-pack',
      'box-shadow',
      'box-sizing',
      'break-after',
      'break-before',
      'break-inside',
      'caption-side',
      'caret-color',
      'clear',
      'clip',
      'clip-path',
      'clip-rule',
      'color',
      'color-interpolation',
      'color-interpolation-filters',
      'color-profile',
      'color-rendering',
      'color-scheme',
      'column-count',
      'column-fill',
      'column-gap',
      'column-rule',
      'column-rule-color',
      'column-rule-style',
      'column-rule-width',
      'column-span',
      'column-width',
      'columns',
      'contain',
      'contain-intrinsic-block-size',
      'contain-intrinsic-height',
      'contain-intrinsic-inline-size',
      'contain-intrinsic-size',
      'contain-intrinsic-width',
      'container',
      'container-name',
      'container-type',
      'content',
      'content-visibility',
      'corner-bottom-left-shape',
      'corner-bottom-right-shape',
      'corner-shape',
      'corner-top-left-shape',
      'corner-top-right-shape',
      'counter-increment',
      'counter-reset',
      'counter-set',
      'cue',
      'cue-after',
      'cue-before',
      'cursor',
      'cx',
      'cy',
      'direction',
      'display',
      'dominant-baseline',
      'empty-cells',
      'enable-background',
      'field-sizing',
      'fill',
      'fill-opacity',
      'fill-rule',
      'filter',
      'flex',
      'flex-basis',
      'flex-direction',
      'flex-flow',
      'flex-grow',
      'flex-shrink',
      'flex-wrap',
      'float',
      'flood-color',
      'flood-opacity',
      'flow',
      'font',
      'font-display',
      'font-family',
      'font-feature-settings',
      'font-kerning',
      'font-language-override',
      'font-optical-sizing',
      'font-palette',
      'font-size',
      'font-size-adjust',
      'font-smooth',
      'font-smoothing',
      'font-stretch',
      'font-style',
      'font-synthesis',
      'font-synthesis-position',
      'font-synthesis-small-caps',
      'font-synthesis-style',
      'font-synthesis-weight',
      'font-variant',
      'font-variant-alternates',
      'font-variant-caps',
      'font-variant-east-asian',
      'font-variant-emoji',
      'font-variant-ligatures',
      'font-variant-numeric',
      'font-variant-position',
      'font-variation-settings',
      'font-weight',
      'forced-color-adjust',
      'gap',
      'glyph-orientation-horizontal',
      'glyph-orientation-vertical',
      'grid',
      'grid-area',
      'grid-auto-columns',
      'grid-auto-flow',
      'grid-auto-rows',
      'grid-column',
      'grid-column-end',
      'grid-column-start',
      'grid-gap',
      'grid-row',
      'grid-row-end',
      'grid-row-start',
      'grid-template',
      'grid-template-areas',
      'grid-template-columns',
      'grid-template-rows',
      'hanging-punctuation',
      'height',
      'hyphenate-character',
      'hyphenate-limit-chars',
      'hyphens',
      'icon',
      'image-orientation',
      'image-rendering',
      'image-resolution',
      'ime-mode',
      'initial-letter',
      'initial-letter-align',
      'inline-size',
      'inset',
      'inset-area',
      'inset-block',
      'inset-block-end',
      'inset-block-start',
      'inset-inline',
      'inset-inline-end',
      'inset-inline-start',
      'isolation',
      'justify-content',
      'justify-items',
      'justify-self',
      'kerning',
      'left',
      'letter-spacing',
      'lighting-color',
      'line-break',
      'line-height',
      'line-height-step',
      'list-style',
      'list-style-image',
      'list-style-position',
      'list-style-type',
      'margin',
      'margin-block',
      'margin-block-end',
      'margin-block-start',
      'margin-bottom',
      'margin-inline',
      'margin-inline-end',
      'margin-inline-start',
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-trim',
      'marker',
      'marker-end',
      'marker-mid',
      'marker-start',
      'marks',
      'mask',
      'mask-border',
      'mask-border-mode',
      'mask-border-outset',
      'mask-border-repeat',
      'mask-border-slice',
      'mask-border-source',
      'mask-border-width',
      'mask-clip',
      'mask-composite',
      'mask-image',
      'mask-mode',
      'mask-origin',
      'mask-position',
      'mask-repeat',
      'mask-size',
      'mask-type',
      'masonry-auto-flow',
      'math-depth',
      'math-shift',
      'math-style',
      'max-block-size',
      'max-height',
      'max-inline-size',
      'max-width',
      'min-block-size',
      'min-height',
      'min-inline-size',
      'min-width',
      'mix-blend-mode',
      'nav-down',
      'nav-index',
      'nav-left',
      'nav-right',
      'nav-up',
      'none',
      'normal',
      'object-fit',
      'object-position',
      'offset',
      'offset-anchor',
      'offset-distance',
      'offset-path',
      'offset-position',
      'offset-rotate',
      'opacity',
      'order',
      'orphans',
      'outline',
      'outline-color',
      'outline-offset',
      'outline-style',
      'outline-width',
      'overflow',
      'overflow-anchor',
      'overflow-block',
      'overflow-clip-margin',
      'overflow-inline',
      'overflow-wrap',
      'overflow-x',
      'overflow-y',
      'overlay',
      'overscroll-behavior',
      'overscroll-behavior-block',
      'overscroll-behavior-inline',
      'overscroll-behavior-x',
      'overscroll-behavior-y',
      'padding',
      'padding-block',
      'padding-block-end',
      'padding-block-start',
      'padding-bottom',
      'padding-inline',
      'padding-inline-end',
      'padding-inline-start',
      'padding-left',
      'padding-right',
      'padding-top',
      'page',
      'page-break-after',
      'page-break-before',
      'page-break-inside',
      'paint-order',
      'pause',
      'pause-after',
      'pause-before',
      'perspective',
      'perspective-origin',
      'place-content',
      'place-items',
      'place-self',
      'pointer-events',
      'position',
      'position-anchor',
      'position-visibility',
      'print-color-adjust',
      'quotes',
      'r',
      'resize',
      'rest',
      'rest-after',
      'rest-before',
      'right',
      'rotate',
      'row-gap',
      'ruby-align',
      'ruby-position',
      'scale',
      'scroll-behavior',
      'scroll-margin',
      'scroll-margin-block',
      'scroll-margin-block-end',
      'scroll-margin-block-start',
      'scroll-margin-bottom',
      'scroll-margin-inline',
      'scroll-margin-inline-end',
      'scroll-margin-inline-start',
      'scroll-margin-left',
      'scroll-margin-right',
      'scroll-margin-top',
      'scroll-padding',
      'scroll-padding-block',
      'scroll-padding-block-end',
      'scroll-padding-block-start',
      'scroll-padding-bottom',
      'scroll-padding-inline',
      'scroll-padding-inline-end',
      'scroll-padding-inline-start',
      'scroll-padding-left',
      'scroll-padding-right',
      'scroll-padding-top',
      'scroll-snap-align',
      'scroll-snap-stop',
      'scroll-snap-type',
      'scroll-timeline',
      'scroll-timeline-axis',
      'scroll-timeline-name',
      'scrollbar-color',
      'scrollbar-gutter',
      'scrollbar-width',
      'shape-image-threshold',
      'shape-margin',
      'shape-outside',
      'shape-rendering',
      'speak',
      'speak-as',
      'src', // @font-face
      'stop-color',
      'stop-opacity',
      'stroke',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'stroke-opacity',
      'stroke-width',
      'tab-size',
      'table-layout',
      'text-align',
      'text-align-all',
      'text-align-last',
      'text-anchor',
      'text-combine-upright',
      'text-decoration',
      'text-decoration-color',
      'text-decoration-line',
      'text-decoration-skip',
      'text-decoration-skip-ink',
      'text-decoration-style',
      'text-decoration-thickness',
      'text-emphasis',
      'text-emphasis-color',
      'text-emphasis-position',
      'text-emphasis-style',
      'text-indent',
      'text-justify',
      'text-orientation',
      'text-overflow',
      'text-rendering',
      'text-shadow',
      'text-size-adjust',
      'text-transform',
      'text-underline-offset',
      'text-underline-position',
      'text-wrap',
      'text-wrap-mode',
      'text-wrap-style',
      'timeline-scope',
      'top',
      'touch-action',
      'transform',
      'transform-box',
      'transform-origin',
      'transform-style',
      'transition',
      'transition-behavior',
      'transition-delay',
      'transition-duration',
      'transition-property',
      'transition-timing-function',
      'translate',
      'unicode-bidi',
      'unicode-range',
      'user-modify',
      'user-select',
      'vector-effect',
      'vertical-align',
      'view-timeline',
      'view-timeline-axis',
      'view-timeline-inset',
      'view-timeline-name',
      'view-transition-name',
      'visibility',
      'voice-balance',
      'voice-duration',
      'voice-family',
      'voice-pitch',
      'voice-range',
      'voice-rate',
      'voice-stress',
      'voice-volume',
      'white-space',
      'white-space-collapse',
      'widows',
      'width',
      'will-change',
      'word-break',
      'word-spacing',
      'word-wrap',
      'writing-mode',
      'x',
      'y',
      'z-index',
      'zoom'
  ].sort().reverse();
  // some grammars use them all as a single group
  const PSEUDO_SELECTORS = PSEUDO_CLASSES.concat(PSEUDO_ELEMENTS).sort().reverse();
  /*
  Language: Less
  Description: It's CSS, with just a little more.
  Author:   Max Mikhailov <seven.phases.max@gmail.com>
  Website: http://lesscss.org
  Category: common, css, web
  */
  /** @type LanguageFn */
  function less(hljs) {
      const modes = MODES(hljs);
      const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;
      const AT_MODIFIERS = "and or not only";
      const IDENT_RE = '[\\w-]+'; // yes, Less identifiers may begin with a digit
      const INTERP_IDENT_RE = '(' + IDENT_RE + '|@\\{' + IDENT_RE + '\\})';
      /* Generic Modes */
      const RULES = [];
      const VALUE_MODES = []; // forward def. for recursive modes
      const STRING_MODE = function (c) {
          return {
              // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
              className: 'string',
              begin: '~?' + c + '.*?' + c
          };
      };
      const IDENT_MODE = function (name, begin, relevance) {
          return {
              className: name,
              begin: begin,
              relevance: relevance
          };
      };
      const AT_KEYWORDS = {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES.join(" ")
      };
      const PARENS_MODE = {
          // used only to properly balance nested parens inside mixin call, def. arg list
          begin: '\\(',
          end: '\\)',
          contains: VALUE_MODES,
          keywords: AT_KEYWORDS,
          relevance: 0
      };
      // generic Less highlighter (used almost everywhere except selectors):
      VALUE_MODES.push(hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, STRING_MODE("'"), STRING_MODE('"'), modes.CSS_NUMBER_MODE, // fixme: it does not include dot for numbers like .5em :(
      {
          begin: '(url|data-uri)\\(',
          starts: {
              className: 'string',
              end: '[\\)\\n]',
              excludeEnd: true
          }
      }, modes.UNICODE_RANGE, modes.HEXCOLOR, PARENS_MODE, IDENT_MODE('variable', '@@?' + IDENT_RE, 10), IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'), IDENT_MODE('built_in', '~?`[^`]*?`'), // inline javascript (or whatever host language) *multiline* string
      {
          className: 'attribute',
          begin: IDENT_RE + '\\s*:',
          end: ':',
          returnBegin: true,
          excludeEnd: true
      }, modes.IMPORTANT, { beginKeywords: 'and not' }, modes.FUNCTION_DISPATCH);
      const VALUE_WITH_RULESETS = VALUE_MODES.concat({
          begin: /\{/,
          end: /\}/,
          contains: RULES
      });
      const MIXIN_GUARD_MODE = {
          beginKeywords: 'when',
          endsWithParent: true,
          contains: [{ beginKeywords: 'and not' }].concat(VALUE_MODES) // using this form to override VALUE’s 'function' match
      };
      /* Rule-Level Modes */
      const RULE_MODE = {
          begin: INTERP_IDENT_RE + '\\s*:',
          returnBegin: true,
          end: /[;}]/,
          relevance: 0,
          contains: [
              { begin: /-(webkit|moz|ms|o)-/ },
              modes.CSS_VARIABLE,
              {
                  className: 'attribute',
                  begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b',
                  end: /(?=:)/,
                  starts: {
                      endsWithParent: true,
                      illegal: '[<=$]',
                      relevance: 0,
                      contains: VALUE_MODES
                  }
              }
          ]
      };
      const AT_RULE_MODE = {
          className: 'keyword',
          begin: '@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b',
          starts: {
              end: '[;{}]',
              keywords: AT_KEYWORDS,
              returnEnd: true,
              contains: VALUE_MODES,
              relevance: 0
          }
      };
      // variable definitions and calls
      const VAR_RULE_MODE = {
          className: 'variable',
          variants: [
              // using more strict pattern for higher relevance to increase chances of Less detection.
              // this is *the only* Less specific statement used in most of the sources, so...
              // (we’ll still often loose to the css-parser unless there's '//' comment,
              // simply because 1 variable just can't beat 99 properties :)
              {
                  begin: '@' + IDENT_RE + '\\s*:',
                  relevance: 15
              },
              { begin: '@' + IDENT_RE }
          ],
          starts: {
              end: '[;}]',
              returnEnd: true,
              contains: VALUE_WITH_RULESETS
          }
      };
      const SELECTOR_MODE = {
          // first parse unambiguous selectors (i.e. those not starting with tag)
          // then fall into the scary lookahead-discriminator variant.
          // this mode also handles mixin definitions and calls
          variants: [
              {
                  begin: '[\\.#:&\\[>]',
                  end: '[;{}]' // mixin calls end with ';'
              },
              {
                  begin: INTERP_IDENT_RE,
                  end: /\{/
              }
          ],
          returnBegin: true,
          returnEnd: true,
          illegal: '[<=\'$"]',
          relevance: 0,
          contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              MIXIN_GUARD_MODE,
              IDENT_MODE('keyword', 'all\\b'),
              IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'), // otherwise it’s identified as tag
              {
                  begin: '\\b(' + TAGS.join('|') + ')\\b',
                  className: 'selector-tag'
              },
              modes.CSS_NUMBER_MODE,
              IDENT_MODE('selector-tag', INTERP_IDENT_RE, 0),
              IDENT_MODE('selector-id', '#' + INTERP_IDENT_RE),
              IDENT_MODE('selector-class', '\\.' + INTERP_IDENT_RE, 0),
              IDENT_MODE('selector-tag', '&', 0),
              modes.ATTRIBUTE_SELECTOR_MODE,
              {
                  className: 'selector-pseudo',
                  begin: ':(' + PSEUDO_CLASSES.join('|') + ')'
              },
              {
                  className: 'selector-pseudo',
                  begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')'
              },
              {
                  begin: /\(/,
                  end: /\)/,
                  relevance: 0,
                  contains: VALUE_WITH_RULESETS
              }, // argument list of parametric mixins
              { begin: '!important' }, // eat !important after mixin call or it will be colored as tag
              modes.FUNCTION_DISPATCH
          ]
      };
      const PSEUDO_SELECTOR_MODE = {
          begin: IDENT_RE + ':(:)?' + `(${PSEUDO_SELECTORS$1.join('|')})`,
          returnBegin: true,
          contains: [SELECTOR_MODE]
      };
      RULES.push(hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, AT_RULE_MODE, VAR_RULE_MODE, PSEUDO_SELECTOR_MODE, RULE_MODE, SELECTOR_MODE, MIXIN_GUARD_MODE, modes.FUNCTION_DISPATCH);
      return {
          name: 'Less',
          case_insensitive: true,
          illegal: '[=>\'/<($"]',
          contains: RULES
      };
  }
  module.exports = less;

  }),
  (function (module, exports, require) {
  /*
  Language: Markdown
  Requires: xml.js
  Author: John Crepezzi <john.crepezzi@gmail.com>
  Website: https://daringfireball.net/projects/markdown/
  Category: common, markup
  */
  function markdown(hljs) {
      const regex = hljs.regex;
      const INLINE_HTML = {
          begin: /<\/?[A-Za-z_]/,
          end: '>',
          subLanguage: 'xml',
          relevance: 0
      };
      // https://spec.commonmark.org/0.31.2/#thematic-breaks
      // three or more `-`, `*` or `_`, all the same character, optionally
      // separated and followed by spaces or tabs, and nothing else on the line
      const HORIZONTAL_RULE = { match: /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/ };
      const CODE = {
          className: 'code',
          variants: [
              // TODO: fix to allow these to work with sublanguage also
              { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
              { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
              // needed to allow markdown as a sublanguage to work
              {
                  begin: '```',
                  end: '```+[ ]*$'
              },
              {
                  begin: '~~~',
                  end: '~~~+[ ]*$'
              },
              { begin: '`.+?`' },
              {
                  begin: '(?=^( {4}|\\t))',
                  // use contains to gobble up multiple lines to allow the block to be whatever size
                  // but only have a single open/close tag vs one per line
                  contains: [
                      {
                          begin: '^( {4}|\\t)',
                          end: '(\\n)$'
                      }
                  ],
                  relevance: 0
              }
          ]
      };
      const LIST = {
          className: 'bullet',
          begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
          end: '\\s+',
          excludeEnd: true
      };
      const LINK_REFERENCE = {
          begin: /^\[[^\n]+\]:/,
          returnBegin: true,
          contains: [
              {
                  className: 'symbol',
                  begin: /\[/,
                  end: /\]/,
                  excludeBegin: true,
                  excludeEnd: true
              },
              {
                  className: 'link',
                  begin: /:\s*/,
                  end: /$/,
                  excludeBegin: true
              }
          ]
      };
      const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
      const LINK = {
          variants: [
              // too much like nested array access in so many languages
              // to have any real relevance
              {
                  begin: /\[.+?\]\[.*?\]/,
                  relevance: 0
              },
              // popular internet URLs
              {
                  begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
                  relevance: 2
              },
              {
                  begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
                  relevance: 2
              },
              // relative urls
              {
                  begin: /\[.+?\]\([./?&#].*?\)/,
                  relevance: 1
              },
              // whatever else, lower relevance (might not be a link at all)
              {
                  begin: /\[.*?\]\(.*?\)/,
                  relevance: 0
              }
          ],
          returnBegin: true,
          contains: [
              {
                  // empty strings for alt or link text
                  match: /\[(?=\])/
              },
              {
                  className: 'string',
                  relevance: 0,
                  begin: '\\[',
                  end: '\\]',
                  excludeBegin: true,
                  returnEnd: true
              },
              {
                  className: 'link',
                  relevance: 0,
                  begin: '\\]\\(',
                  end: '\\)',
                  excludeBegin: true,
                  excludeEnd: true
              },
              {
                  className: 'symbol',
                  relevance: 0,
                  begin: '\\]\\[',
                  end: '\\]',
                  excludeBegin: true,
                  excludeEnd: true
              }
          ]
      };
      const BOLD = {
          className: 'strong',
          contains: [], // defined later
          variants: [
              {
                  begin: /_{2}(?!\s)/,
                  end: /_{2}/
              },
              {
                  begin: /\*{2}(?!\s)/,
                  end: /\*{2}/
              }
          ]
      };
      const ITALIC = {
          className: 'emphasis',
          contains: [], // defined later
          variants: [
              {
                  begin: /\*(?![*\s])/,
                  end: /\*/
              },
              {
                  begin: /_(?![_\s])/,
                  end: /_/,
                  relevance: 0
              }
          ]
      };
      // 3 level deep nesting is not allowed because it would create confusion
      // in cases like `***testing***` because where we don't know if the last
      // `***` is starting a new bold/italic or finishing the last one
      const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
      const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
      BOLD.contains.push(ITALIC_WITHOUT_BOLD);
      ITALIC.contains.push(BOLD_WITHOUT_ITALIC);
      let CONTAINABLE = [
          INLINE_HTML,
          LINK
      ];
      [
          BOLD,
          ITALIC,
          BOLD_WITHOUT_ITALIC,
          ITALIC_WITHOUT_BOLD
      ].forEach(m => {
          m.contains = m.contains.concat(CONTAINABLE);
      });
      CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);
      const HEADER = {
          className: 'section',
          variants: [
              {
                  begin: '^#{1,6}',
                  end: '$',
                  contains: CONTAINABLE
              },
              {
                  begin: '(?=^.+?\\n[=-]{2,}$)',
                  contains: [
                      { begin: '^[=-]*$' },
                      {
                          begin: '^',
                          end: "\\n",
                          contains: CONTAINABLE
                      }
                  ]
              }
          ]
      };
      const BLOCKQUOTE = {
          className: 'quote',
          begin: '^>\\s+',
          contains: CONTAINABLE,
          end: '$'
      };
      const ENTITY = {
          //https://spec.commonmark.org/0.31.2/#entity-references
          scope: 'literal',
          match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
      };
      return {
          name: 'Markdown',
          aliases: [
              'md',
              'mkdown',
              'mkd'
          ],
          contains: [
              HEADER,
              INLINE_HTML,
              LIST,
              // must come before BOLD/ITALIC so that a `***` or `___` thematic break
              // isn't mistaken for the start of bold text
              HORIZONTAL_RULE,
              BOLD,
              ITALIC,
              BLOCKQUOTE,
              CODE,
              LINK,
              LINK_REFERENCE,
              ENTITY
          ]
      };
  }
  module.exports = markdown;

  }),
  (function (module, exports, require) {
  /*
  Language: Plain text
  Author: Egor Rogov (e.rogov@postgrespro.ru)
  Description: Plain text without any highlighting.
  Category: common
  */
  function plaintext(hljs) {
      return {
          name: 'Plain text',
          aliases: [
              'text',
              'txt'
          ],
          disableAutodetect: true
      };
  }
  module.exports = plaintext;

  }),
  (function (module, exports, require) {
  /*
  Language: Python
  Description: Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.
  Website: https://www.python.org
  Category: common
  */
  function python(hljs) {
      const regex = hljs.regex;
      const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;
      const RESERVED_WORDS = [
          'and',
          'as',
          'assert',
          'async',
          'await',
          'break',
          'case',
          'class',
          'continue',
          'def',
          'del',
          'elif',
          'else',
          'except',
          'finally',
          'for',
          'from',
          'global',
          'if',
          'import',
          'in',
          'is',
          'lambda',
          'lazy',
          'match',
          'nonlocal|10',
          'not',
          'or',
          'pass',
          'raise',
          'return',
          'try',
          'while',
          'with',
          'yield'
      ];
      const BUILT_INS = [
          '__import__',
          'abs',
          'aiter',
          'all',
          'anext',
          'any',
          'ascii',
          'bin',
          'bool',
          'breakpoint',
          'bytearray',
          'bytes',
          'callable',
          'chr',
          'classmethod',
          'compile',
          'complex',
          'delattr',
          'dict',
          'dir',
          'divmod',
          'enumerate',
          'eval',
          'exec',
          'filter',
          'float',
          'format',
          'frozendict',
          'frozenset',
          'getattr',
          'globals',
          'hasattr',
          'hash',
          'help',
          'hex',
          'id',
          'input',
          'int',
          'isinstance',
          'issubclass',
          'iter',
          'len',
          'list',
          'locals',
          'map',
          'max',
          'memoryview',
          'min',
          'next',
          'object',
          'oct',
          'open',
          'ord',
          'pow',
          'print',
          'property',
          'range',
          'repr',
          'reversed',
          'round',
          'sentinel',
          'set',
          'setattr',
          'slice',
          'sorted',
          'staticmethod',
          'str',
          'sum',
          'super',
          'tuple',
          'type',
          'vars',
          'zip'
      ];
      const LITERALS = [
          '__debug__',
          'Ellipsis',
          'False',
          'None',
          'NotImplemented',
          'True'
      ];
      // https://docs.python.org/3/library/typing.html
      // TODO: Could these be supplemented by a CamelCase matcher in certain
      // contexts, leaving these remaining only for relevance hinting?
      const TYPES = [
          "Any",
          "Callable",
          "Coroutine",
          "Dict",
          "List",
          "Literal",
          "Generic",
          "Optional",
          "Sequence",
          "Set",
          "Tuple",
          "Type",
          "Union"
      ];
      const KEYWORDS = {
          $pattern: /[A-Za-z]\w+|__\w+__/,
          keyword: RESERVED_WORDS,
          built_in: BUILT_INS,
          literal: LITERALS,
          type: TYPES
      };
      const PROMPT = {
          className: 'meta',
          begin: /^(>>>|\.\.\.) /
      };
      const SUBST = {
          className: 'subst',
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS,
          illegal: /#/
      };
      const LITERAL_BRACKET = {
          begin: /\{\{/,
          relevance: 0
      };
      const STRING = {
          className: 'string',
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
              {
                  begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
                  end: /'''/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      PROMPT
                  ],
                  relevance: 10
              },
              {
                  begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
                  end: /"""/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      PROMPT
                  ],
                  relevance: 10
              },
              {
                  begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'''/,
                  end: /'''/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      PROMPT,
                      LITERAL_BRACKET,
                      SUBST
                  ]
              },
              {
                  begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"""/,
                  end: /"""/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      PROMPT,
                      LITERAL_BRACKET,
                      SUBST
                  ]
              },
              {
                  begin: /([uU]|[rR])'/,
                  end: /'/,
                  relevance: 10
              },
              {
                  begin: /([uU]|[rR])"/,
                  end: /"/,
                  relevance: 10
              },
              {
                  begin: /([bB]|[bB][rR]|[rR][bB])'/,
                  end: /'/
              },
              {
                  begin: /([bB]|[bB][rR]|[rR][bB])"/,
                  end: /"/
              },
              {
                  begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'/,
                  end: /'/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      LITERAL_BRACKET,
                      SUBST
                  ]
              },
              {
                  begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"/,
                  end: /"/,
                  contains: [
                      hljs.BACKSLASH_ESCAPE,
                      LITERAL_BRACKET,
                      SUBST
                  ]
              },
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE
          ]
      };
      // https://docs.python.org/3.9/reference/lexical_analysis.html#numeric-literals
      const digitpart = '[0-9](_?[0-9])*';
      const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
      // Whitespace after a number (or any lexical token) is needed only if its absence
      // would change the tokenization
      // https://docs.python.org/3.9/reference/lexical_analysis.html#whitespace-between-tokens
      // We deviate slightly, requiring a word boundary or a keyword
      // to avoid accidentally recognizing *prefixes* (e.g., `0` in `0x41` or `08` or `0__1`)
      const lookahead = `\\b|${RESERVED_WORDS.join('|')}`;
      const NUMBER = {
          className: 'number',
          relevance: 0,
          variants: [
              // exponentfloat, pointfloat
              // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
              // optionally imaginary
              // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
              // Note: no leading \b because floats can start with a decimal point
              // and we don't want to mishandle e.g. `fn(.5)`,
              // no trailing \b for pointfloat because it can end with a decimal point
              // and we don't want to mishandle e.g. `0..hex()`; this should be safe
              // because both MUST contain a decimal point and so cannot be confused with
              // the interior part of an identifier
              {
                  begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
              },
              {
                  begin: `(${pointfloat})[jJ]?`
              },
              // decinteger, bininteger, octinteger, hexinteger
              // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
              // optionally "long" in Python 2
              // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
              // decinteger is optionally imaginary
              // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
              {
                  begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
              },
              {
                  begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
              },
              {
                  begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
              },
              {
                  begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
              },
              // imagnumber (digitpart-based)
              // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
              {
                  begin: `\\b(${digitpart})[jJ](?=${lookahead})`
              }
          ]
      };
      const COMMENT_TYPE = {
          className: "comment",
          begin: regex.lookahead(/# type:/),
          end: /$/,
          keywords: KEYWORDS,
          contains: [
              {
                  begin: /# type:/
              },
              // comment within a datatype comment includes no keywords
              {
                  begin: /#/,
                  end: /\b\B/,
                  endsWithParent: true
              }
          ]
      };
      const PARAMS = {
          className: 'params',
          variants: [
              // Exclude params in functions without params
              {
                  className: "",
                  begin: /\(\s*\)/,
                  skip: true
              },
              {
                  begin: /\(/,
                  end: /\)/,
                  excludeBegin: true,
                  excludeEnd: true,
                  keywords: KEYWORDS,
                  contains: [
                      'self',
                      PROMPT,
                      NUMBER,
                      STRING,
                      hljs.HASH_COMMENT_MODE
                  ]
              }
          ]
      };
      SUBST.contains = [
          STRING,
          NUMBER,
          PROMPT
      ];
      return {
          name: 'Python',
          aliases: [
              'py',
              'gyp',
              'ipython'
          ],
          unicodeRegex: true,
          keywords: KEYWORDS,
          illegal: /(<\/|\?)|=>/,
          contains: [
              PROMPT,
              NUMBER,
              {
                  // very common convention
                  scope: 'variable.language',
                  match: /\bself\b/
              },
              {
                  // eat "if" prior to string so that it won't accidentally be
                  // labeled as an f-string
                  beginKeywords: "if",
                  relevance: 0
              },
              { match: /\bor\b/, scope: "keyword" },
              STRING,
              COMMENT_TYPE,
              hljs.HASH_COMMENT_MODE,
              {
                  match: [
                      /\bdef/, /\s+/,
                      IDENT_RE,
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.function"
                  },
                  contains: [PARAMS]
              },
              {
                  variants: [
                      {
                          match: [
                              /\bclass/, /\s+/,
                              IDENT_RE, /\s*/,
                              /\(\s*/, IDENT_RE, /\s*\)/
                          ],
                      },
                      {
                          match: [
                              /\bclass/, /\s+/,
                              IDENT_RE
                          ],
                      }
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class",
                      6: "title.class.inherited",
                  }
              },
              {
                  className: 'meta',
                  begin: /^[\t ]*@/,
                  end: /(?=#)|$/,
                  contains: [
                      NUMBER,
                      PARAMS,
                      STRING
                  ]
              }
          ]
      };
  }
  module.exports = python;

  }),
  (function (module, exports, require) {
  /*
  Language: Rust
  Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
  Contributors: Roman Shmatov <romanshmatov@gmail.com>, Kasper Andersen <kma_untrusted@protonmail.com>
  Website: https://www.rust-lang.org
  Category: common, system
  */
  /** @type LanguageFn */
  function rust(hljs) {
      const regex = hljs.regex;
      // ============================================
      // Added to support the r# keyword, which is a raw identifier in Rust.
      const RAW_IDENTIFIER = /(r#)?/;
      const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
      const IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
      // ============================================
      const FUNCTION_INVOKE = {
          scope: "title.function.invoke",
          relevance: 0,
          begin: regex.concat(/\b/, /(?!(?:let|for|while|if|else|match)\b)/, IDENT_RE, regex.lookahead(/\s*\(/))
      };
      const NUMBER_SUFFIX = '([ui](8|16|32|64|128|size)|f(16|32|64|128))\?';
      const KEYWORDS = [
          "abstract",
          "as",
          "async",
          "await",
          "become",
          "box",
          "break",
          "const",
          "continue",
          "crate",
          "do",
          "dyn",
          "else",
          "enum",
          "extern",
          "false",
          "final",
          "fn",
          "for",
          "if",
          "impl",
          "in",
          "let",
          "loop",
          "macro",
          "match",
          "mod",
          "move",
          "mut",
          "override",
          "priv",
          "pub",
          "raw",
          "ref",
          "return",
          "self",
          "Self",
          "static",
          "struct",
          "super",
          "trait",
          "true",
          "try",
          "type",
          "typeof",
          "union",
          "unsafe",
          "unsized",
          "use",
          "virtual",
          "where",
          "while",
          "yield"
      ];
      const LITERALS = [
          "true",
          "false",
          "Some",
          "None",
          "Ok",
          "Err"
      ];
      const BUILTINS = [
          // functions
          'drop ',
          // traits
          "Copy",
          "Send",
          "Sized",
          "Sync",
          "Drop",
          "Fn",
          "FnMut",
          "FnOnce",
          "ToOwned",
          "Clone",
          "Debug",
          "PartialEq",
          "PartialOrd",
          "Eq",
          "Ord",
          "AsRef",
          "AsMut",
          "Into",
          "From",
          "Default",
          "Iterator",
          "Extend",
          "IntoIterator",
          "DoubleEndedIterator",
          "ExactSizeIterator",
          "SliceConcatExt",
          "ToString",
          // macros
          "assert!",
          "assert_eq!",
          "bitflags!",
          "bytes!",
          "cfg!",
          "col!",
          "concat!",
          "concat_idents!",
          "debug_assert!",
          "debug_assert_eq!",
          "env!",
          "eprintln!",
          "panic!",
          "file!",
          "format!",
          "format_args!",
          "include_bytes!",
          "include_str!",
          "line!",
          "local_data_key!",
          "module_path!",
          "option_env!",
          "print!",
          "println!",
          "select!",
          "stringify!",
          "try!",
          "unimplemented!",
          "unreachable!",
          "vec!",
          "write!",
          "writeln!",
          "macro_rules!",
          "assert_ne!",
          "debug_assert_ne!"
      ];
      const TYPES = [
          "i8",
          "i16",
          "i32",
          "i64",
          "i128",
          "isize",
          "u8",
          "u16",
          "u32",
          "u64",
          "u128",
          "usize",
          "f16",
          "f32",
          "f64",
          "f128",
          "str",
          "char",
          "bool",
          "Box",
          "Option",
          "Result",
          "String",
          "Vec"
      ];
      return {
          name: 'Rust',
          aliases: ['rs'],
          keywords: {
              $pattern: hljs.IDENT_RE + '!?',
              type: TYPES,
              keyword: KEYWORDS,
              literal: LITERALS,
              built_in: BUILTINS
          },
          illegal: '</',
          contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.COMMENT('/\\*', '\\*/', { contains: ['self'] }),
              hljs.inherit(hljs.QUOTE_STRING_MODE, {
                  begin: /b?"/,
                  illegal: null
              }),
              {
                  scope: 'symbol',
                  // negative lookahead to avoid matching `'`
                  begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
              },
              {
                  scope: 'string',
                  variants: [
                      { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
                      {
                          begin: /b?'/,
                          end: /'/,
                          contains: [
                              {
                                  scope: "char.escape",
                                  match: /\\('|"|\\|\w|x\w{2}|u\w{4}|U\w{8})/
                              }
                          ]
                      }
                  ]
              },
              {
                  scope: 'number',
                  variants: [
                      { begin: '\\b0b([01_]+)' + NUMBER_SUFFIX },
                      { begin: '\\b0o([0-7_]+)' + NUMBER_SUFFIX },
                      { begin: '\\b0x([A-Fa-f0-9_]+)' + NUMBER_SUFFIX },
                      { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)'
                              + NUMBER_SUFFIX }
                  ],
                  relevance: 0
              },
              {
                  begin: [
                      /\bsafe/,
                      /\s+/,
                      /extern/,
                  ],
                  scope: {
                      1: "keyword",
                      3: "keyword",
                  }
              },
              {
                  begin: [
                      /fn/,
                      /\s+/,
                      UNDERSCORE_IDENT_RE
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.function"
                  }
              },
              {
                  scope: 'meta',
                  begin: '#!?\\[',
                  end: '\\]',
                  contains: [
                      {
                          scope: 'string',
                          begin: /"/,
                          end: /"/,
                          contains: [
                              hljs.BACKSLASH_ESCAPE
                          ]
                      }
                  ]
              },
              {
                  begin: [
                      /let/,
                      /\s+/,
                      /(?:mut\s+)?/,
                      UNDERSCORE_IDENT_RE
                  ],
                  scope: {
                      1: "keyword",
                      3: "keyword",
                      4: "variable"
                  }
              },
              // must come before impl/for rule later
              {
                  begin: [
                      /for/,
                      /\s+/,
                      UNDERSCORE_IDENT_RE,
                      /\s+/,
                      /in/
                  ],
                  scope: {
                      1: "keyword",
                      3: "variable",
                      5: "keyword"
                  }
              },
              {
                  begin: [
                      /type/,
                      /\s+/,
                      UNDERSCORE_IDENT_RE
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class"
                  }
              },
              {
                  begin: [
                      /(?:trait|enum|struct|union|impl|for)/,
                      /\s+/,
                      UNDERSCORE_IDENT_RE
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class"
                  }
              },
              {
                  begin: hljs.IDENT_RE + '::',
                  keywords: {
                      keyword: "Self",
                      built_in: BUILTINS,
                      type: TYPES
                  }
              },
              {
                  scope: "punctuation",
                  begin: '->'
              },
              FUNCTION_INVOKE
          ]
      };
  }
  module.exports = rust;

  }),
  (function (module, exports, require) {
  const MODES = (hljs) => {
      return {
          IMPORTANT: {
              scope: 'meta',
              begin: '!important'
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
              scope: 'number',
              begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          UNICODE_RANGE: {
              scope: 'number',
              begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
          },
          FUNCTION_DISPATCH: {
              className: "built_in",
              begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
              scope: 'selector-attr',
              begin: /\[/,
              end: /\]/,
              illegal: '$',
              contains: [
                  hljs.APOS_STRING_MODE,
                  hljs.QUOTE_STRING_MODE
              ]
          },
          CSS_NUMBER_MODE: {
              scope: 'number',
              begin: hljs.NUMBER_RE + '(' +
                  '%|em|ex|ch|rem' +
                  '|vw|vh|vmin|vmax' +
                  '|cm|mm|in|pt|pc|px' +
                  '|deg|grad|rad|turn' +
                  '|s|ms' +
                  '|Hz|kHz' +
                  '|dpi|dpcm|dppx' +
                  ')?',
              relevance: 0
          },
          CSS_VARIABLE: {
              className: "attr",
              begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
      };
  };
  const HTML_TAGS = [
      'a',
      'abbr',
      'address',
      'article',
      'aside',
      'audio',
      'b',
      'blockquote',
      'body',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'dd',
      'del',
      'details',
      'dfn',
      'div',
      'dl',
      'dt',
      'em',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hgroup',
      'html',
      'i',
      'iframe',
      'img',
      'input',
      'ins',
      'kbd',
      'label',
      'legend',
      'li',
      'main',
      'mark',
      'menu',
      'nav',
      'object',
      'ol',
      'optgroup',
      'option',
      'p',
      'picture',
      'q',
      'quote',
      'samp',
      'section',
      'select',
      'source',
      'span',
      'strong',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'time',
      'tr',
      'ul',
      'var',
      'video'
  ];
  const SVG_TAGS = [
      'defs',
      'g',
      'marker',
      'mask',
      'pattern',
      'svg',
      'switch',
      'symbol',
      'feBlend',
      'feColorMatrix',
      'feComponentTransfer',
      'feComposite',
      'feConvolveMatrix',
      'feDiffuseLighting',
      'feDisplacementMap',
      'feFlood',
      'feGaussianBlur',
      'feImage',
      'feMerge',
      'feMorphology',
      'feOffset',
      'feSpecularLighting',
      'feTile',
      'feTurbulence',
      'linearGradient',
      'radialGradient',
      'stop',
      'circle',
      'ellipse',
      'image',
      'line',
      'path',
      'polygon',
      'polyline',
      'rect',
      'text',
      'use',
      'textPath',
      'tspan',
      'foreignObject',
      'clipPath'
  ];
  const TAGS = [
      ...HTML_TAGS,
      ...SVG_TAGS,
  ];
  // Sorting, then reversing makes sure longer attributes/elements like
  // `font-weight` are matched fully instead of getting false positives on say `font`
  const MEDIA_FEATURES = [
      'any-hover',
      'any-pointer',
      'aspect-ratio',
      'color',
      'color-gamut',
      'color-index',
      'device-aspect-ratio',
      'device-height',
      'device-width',
      'display-mode',
      'forced-colors',
      'grid',
      'height',
      'hover',
      'inverted-colors',
      'monochrome',
      'orientation',
      'overflow-block',
      'overflow-inline',
      'pointer',
      'prefers-color-scheme',
      'prefers-contrast',
      'prefers-reduced-motion',
      'prefers-reduced-transparency',
      'resolution',
      'scan',
      'scripting',
      'update',
      'width',
      // TODO: find a better solution?
      'min-width',
      'max-width',
      'min-height',
      'max-height'
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
  const PSEUDO_CLASSES = [
      'active',
      'any-link',
      'blank',
      'checked',
      'current',
      'default',
      'defined',
      'dir', // dir()
      'disabled',
      'drop',
      'empty',
      'enabled',
      'first',
      'first-child',
      'first-of-type',
      'fullscreen',
      'future',
      'focus',
      'focus-visible',
      'focus-within',
      'has', // has()
      'host', // host or host()
      'host-context', // host-context()
      'hover',
      'indeterminate',
      'in-range',
      'invalid',
      'is', // is()
      'lang', // lang()
      'last-child',
      'last-of-type',
      'left',
      'link',
      'local-link',
      'not', // not()
      'nth-child', // nth-child()
      'nth-col', // nth-col()
      'nth-last-child', // nth-last-child()
      'nth-last-col', // nth-last-col()
      'nth-last-of-type', //nth-last-of-type()
      'nth-of-type', //nth-of-type()
      'only-child',
      'only-of-type',
      'optional',
      'out-of-range',
      'past',
      'placeholder-shown',
      'read-only',
      'read-write',
      'required',
      'right',
      'root',
      'scope',
      'target',
      'target-within',
      'user-invalid',
      'valid',
      'visited',
      'where' // where()
  ].sort().reverse();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
  const PSEUDO_ELEMENTS = [
      'after',
      'backdrop',
      'before',
      'cue',
      'cue-region',
      'first-letter',
      'first-line',
      'grammar-error',
      'marker',
      'part',
      'placeholder',
      'selection',
      'slotted',
      'spelling-error'
  ].sort().reverse();
  const ATTRIBUTES = [
      'accent-color',
      'align-content',
      'align-items',
      'align-self',
      'alignment-baseline',
      'all',
      'anchor-name',
      'animation',
      'animation-composition',
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-name',
      'animation-play-state',
      'animation-range',
      'animation-range-end',
      'animation-range-start',
      'animation-timeline',
      'animation-timing-function',
      'appearance',
      'aspect-ratio',
      'backdrop-filter',
      'backface-visibility',
      'background',
      'background-attachment',
      'background-blend-mode',
      'background-clip',
      'background-color',
      'background-image',
      'background-origin',
      'background-position',
      'background-position-x',
      'background-position-y',
      'background-repeat',
      'background-size',
      'baseline-shift',
      'block-size',
      'border',
      'border-block',
      'border-block-color',
      'border-block-end',
      'border-block-end-color',
      'border-block-end-style',
      'border-block-end-width',
      'border-block-start',
      'border-block-start-color',
      'border-block-start-style',
      'border-block-start-width',
      'border-block-style',
      'border-block-width',
      'border-bottom',
      'border-bottom-color',
      'border-bottom-left-radius',
      'border-bottom-right-radius',
      'border-bottom-style',
      'border-bottom-width',
      'border-collapse',
      'border-color',
      'border-end-end-radius',
      'border-end-start-radius',
      'border-image',
      'border-image-outset',
      'border-image-repeat',
      'border-image-slice',
      'border-image-source',
      'border-image-width',
      'border-inline',
      'border-inline-color',
      'border-inline-end',
      'border-inline-end-color',
      'border-inline-end-style',
      'border-inline-end-width',
      'border-inline-start',
      'border-inline-start-color',
      'border-inline-start-style',
      'border-inline-start-width',
      'border-inline-style',
      'border-inline-width',
      'border-left',
      'border-left-color',
      'border-left-style',
      'border-left-width',
      'border-radius',
      'border-right',
      'border-right-color',
      'border-right-style',
      'border-right-width',
      'border-spacing',
      'border-start-end-radius',
      'border-start-start-radius',
      'border-style',
      'border-top',
      'border-top-color',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-top-style',
      'border-top-width',
      'border-width',
      'bottom',
      'box-align',
      'box-decoration-break',
      'box-direction',
      'box-flex',
      'box-flex-group',
      'box-lines',
      'box-ordinal-group',
      'box-orient',
      'box-pack',
      'box-shadow',
      'box-sizing',
      'break-after',
      'break-before',
      'break-inside',
      'caption-side',
      'caret-color',
      'clear',
      'clip',
      'clip-path',
      'clip-rule',
      'color',
      'color-interpolation',
      'color-interpolation-filters',
      'color-profile',
      'color-rendering',
      'color-scheme',
      'column-count',
      'column-fill',
      'column-gap',
      'column-rule',
      'column-rule-color',
      'column-rule-style',
      'column-rule-width',
      'column-span',
      'column-width',
      'columns',
      'contain',
      'contain-intrinsic-block-size',
      'contain-intrinsic-height',
      'contain-intrinsic-inline-size',
      'contain-intrinsic-size',
      'contain-intrinsic-width',
      'container',
      'container-name',
      'container-type',
      'content',
      'content-visibility',
      'corner-bottom-left-shape',
      'corner-bottom-right-shape',
      'corner-shape',
      'corner-top-left-shape',
      'corner-top-right-shape',
      'counter-increment',
      'counter-reset',
      'counter-set',
      'cue',
      'cue-after',
      'cue-before',
      'cursor',
      'cx',
      'cy',
      'direction',
      'display',
      'dominant-baseline',
      'empty-cells',
      'enable-background',
      'field-sizing',
      'fill',
      'fill-opacity',
      'fill-rule',
      'filter',
      'flex',
      'flex-basis',
      'flex-direction',
      'flex-flow',
      'flex-grow',
      'flex-shrink',
      'flex-wrap',
      'float',
      'flood-color',
      'flood-opacity',
      'flow',
      'font',
      'font-display',
      'font-family',
      'font-feature-settings',
      'font-kerning',
      'font-language-override',
      'font-optical-sizing',
      'font-palette',
      'font-size',
      'font-size-adjust',
      'font-smooth',
      'font-smoothing',
      'font-stretch',
      'font-style',
      'font-synthesis',
      'font-synthesis-position',
      'font-synthesis-small-caps',
      'font-synthesis-style',
      'font-synthesis-weight',
      'font-variant',
      'font-variant-alternates',
      'font-variant-caps',
      'font-variant-east-asian',
      'font-variant-emoji',
      'font-variant-ligatures',
      'font-variant-numeric',
      'font-variant-position',
      'font-variation-settings',
      'font-weight',
      'forced-color-adjust',
      'gap',
      'glyph-orientation-horizontal',
      'glyph-orientation-vertical',
      'grid',
      'grid-area',
      'grid-auto-columns',
      'grid-auto-flow',
      'grid-auto-rows',
      'grid-column',
      'grid-column-end',
      'grid-column-start',
      'grid-gap',
      'grid-row',
      'grid-row-end',
      'grid-row-start',
      'grid-template',
      'grid-template-areas',
      'grid-template-columns',
      'grid-template-rows',
      'hanging-punctuation',
      'height',
      'hyphenate-character',
      'hyphenate-limit-chars',
      'hyphens',
      'icon',
      'image-orientation',
      'image-rendering',
      'image-resolution',
      'ime-mode',
      'initial-letter',
      'initial-letter-align',
      'inline-size',
      'inset',
      'inset-area',
      'inset-block',
      'inset-block-end',
      'inset-block-start',
      'inset-inline',
      'inset-inline-end',
      'inset-inline-start',
      'isolation',
      'justify-content',
      'justify-items',
      'justify-self',
      'kerning',
      'left',
      'letter-spacing',
      'lighting-color',
      'line-break',
      'line-height',
      'line-height-step',
      'list-style',
      'list-style-image',
      'list-style-position',
      'list-style-type',
      'margin',
      'margin-block',
      'margin-block-end',
      'margin-block-start',
      'margin-bottom',
      'margin-inline',
      'margin-inline-end',
      'margin-inline-start',
      'margin-left',
      'margin-right',
      'margin-top',
      'margin-trim',
      'marker',
      'marker-end',
      'marker-mid',
      'marker-start',
      'marks',
      'mask',
      'mask-border',
      'mask-border-mode',
      'mask-border-outset',
      'mask-border-repeat',
      'mask-border-slice',
      'mask-border-source',
      'mask-border-width',
      'mask-clip',
      'mask-composite',
      'mask-image',
      'mask-mode',
      'mask-origin',
      'mask-position',
      'mask-repeat',
      'mask-size',
      'mask-type',
      'masonry-auto-flow',
      'math-depth',
      'math-shift',
      'math-style',
      'max-block-size',
      'max-height',
      'max-inline-size',
      'max-width',
      'min-block-size',
      'min-height',
      'min-inline-size',
      'min-width',
      'mix-blend-mode',
      'nav-down',
      'nav-index',
      'nav-left',
      'nav-right',
      'nav-up',
      'none',
      'normal',
      'object-fit',
      'object-position',
      'offset',
      'offset-anchor',
      'offset-distance',
      'offset-path',
      'offset-position',
      'offset-rotate',
      'opacity',
      'order',
      'orphans',
      'outline',
      'outline-color',
      'outline-offset',
      'outline-style',
      'outline-width',
      'overflow',
      'overflow-anchor',
      'overflow-block',
      'overflow-clip-margin',
      'overflow-inline',
      'overflow-wrap',
      'overflow-x',
      'overflow-y',
      'overlay',
      'overscroll-behavior',
      'overscroll-behavior-block',
      'overscroll-behavior-inline',
      'overscroll-behavior-x',
      'overscroll-behavior-y',
      'padding',
      'padding-block',
      'padding-block-end',
      'padding-block-start',
      'padding-bottom',
      'padding-inline',
      'padding-inline-end',
      'padding-inline-start',
      'padding-left',
      'padding-right',
      'padding-top',
      'page',
      'page-break-after',
      'page-break-before',
      'page-break-inside',
      'paint-order',
      'pause',
      'pause-after',
      'pause-before',
      'perspective',
      'perspective-origin',
      'place-content',
      'place-items',
      'place-self',
      'pointer-events',
      'position',
      'position-anchor',
      'position-visibility',
      'print-color-adjust',
      'quotes',
      'r',
      'resize',
      'rest',
      'rest-after',
      'rest-before',
      'right',
      'rotate',
      'row-gap',
      'ruby-align',
      'ruby-position',
      'scale',
      'scroll-behavior',
      'scroll-margin',
      'scroll-margin-block',
      'scroll-margin-block-end',
      'scroll-margin-block-start',
      'scroll-margin-bottom',
      'scroll-margin-inline',
      'scroll-margin-inline-end',
      'scroll-margin-inline-start',
      'scroll-margin-left',
      'scroll-margin-right',
      'scroll-margin-top',
      'scroll-padding',
      'scroll-padding-block',
      'scroll-padding-block-end',
      'scroll-padding-block-start',
      'scroll-padding-bottom',
      'scroll-padding-inline',
      'scroll-padding-inline-end',
      'scroll-padding-inline-start',
      'scroll-padding-left',
      'scroll-padding-right',
      'scroll-padding-top',
      'scroll-snap-align',
      'scroll-snap-stop',
      'scroll-snap-type',
      'scroll-timeline',
      'scroll-timeline-axis',
      'scroll-timeline-name',
      'scrollbar-color',
      'scrollbar-gutter',
      'scrollbar-width',
      'shape-image-threshold',
      'shape-margin',
      'shape-outside',
      'shape-rendering',
      'speak',
      'speak-as',
      'src', // @font-face
      'stop-color',
      'stop-opacity',
      'stroke',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'stroke-opacity',
      'stroke-width',
      'tab-size',
      'table-layout',
      'text-align',
      'text-align-all',
      'text-align-last',
      'text-anchor',
      'text-combine-upright',
      'text-decoration',
      'text-decoration-color',
      'text-decoration-line',
      'text-decoration-skip',
      'text-decoration-skip-ink',
      'text-decoration-style',
      'text-decoration-thickness',
      'text-emphasis',
      'text-emphasis-color',
      'text-emphasis-position',
      'text-emphasis-style',
      'text-indent',
      'text-justify',
      'text-orientation',
      'text-overflow',
      'text-rendering',
      'text-shadow',
      'text-size-adjust',
      'text-transform',
      'text-underline-offset',
      'text-underline-position',
      'text-wrap',
      'text-wrap-mode',
      'text-wrap-style',
      'timeline-scope',
      'top',
      'touch-action',
      'transform',
      'transform-box',
      'transform-origin',
      'transform-style',
      'transition',
      'transition-behavior',
      'transition-delay',
      'transition-duration',
      'transition-property',
      'transition-timing-function',
      'translate',
      'unicode-bidi',
      'unicode-range',
      'user-modify',
      'user-select',
      'vector-effect',
      'vertical-align',
      'view-timeline',
      'view-timeline-axis',
      'view-timeline-inset',
      'view-timeline-name',
      'view-transition-name',
      'visibility',
      'voice-balance',
      'voice-duration',
      'voice-family',
      'voice-pitch',
      'voice-range',
      'voice-rate',
      'voice-stress',
      'voice-volume',
      'white-space',
      'white-space-collapse',
      'widows',
      'width',
      'will-change',
      'word-break',
      'word-spacing',
      'word-wrap',
      'writing-mode',
      'x',
      'y',
      'z-index',
      'zoom'
  ].sort().reverse();
  /*
  Language: SCSS
  Description: Scss is an extension of the syntax of CSS.
  Author: Kurt Emch <kurt@kurtemch.com>
  Website: https://sass-lang.com
  Category: common, css, web
  */
  /** @type LanguageFn */
  function scss(hljs) {
      const modes = MODES(hljs);
      const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS;
      const PSEUDO_CLASSES$1 = PSEUDO_CLASSES;
      const AT_IDENTIFIER = '@[a-z-]+'; // @font-face
      const AT_MODIFIERS = "and or not only";
      const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
      const VARIABLE = {
          className: 'variable',
          begin: '(\\$' + IDENT_RE + ')\\b',
          relevance: 0
      };
      return {
          name: 'SCSS',
          case_insensitive: true,
          illegal: '[=/|\']',
          contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              // to recognize keyframe 40% etc which are outside the scope of our
              // attribute value mode
              modes.CSS_NUMBER_MODE,
              {
                  className: 'selector-id',
                  begin: '#[A-Za-z0-9_-]+',
                  relevance: 0
              },
              {
                  className: 'selector-class',
                  begin: '\\.[A-Za-z0-9_-]+',
                  relevance: 0
              },
              modes.ATTRIBUTE_SELECTOR_MODE,
              {
                  className: 'selector-tag',
                  begin: '\\b(' + TAGS.join('|') + ')\\b',
                  // was there, before, but why?
                  relevance: 0
              },
              {
                  className: 'selector-pseudo',
                  begin: ':(' + PSEUDO_CLASSES$1.join('|') + ')'
              },
              {
                  className: 'selector-pseudo',
                  begin: ':(:)?(' + PSEUDO_ELEMENTS$1.join('|') + ')'
              },
              VARIABLE,
              {
                  begin: /\(/,
                  end: /\)/,
                  contains: [modes.CSS_NUMBER_MODE]
              },
              modes.CSS_VARIABLE,
              {
                  className: 'attribute',
                  begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
              },
              { begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b' },
              {
                  begin: /:/,
                  end: /[;}{]/,
                  relevance: 0,
                  contains: [
                      modes.BLOCK_COMMENT,
                      VARIABLE,
                      modes.HEXCOLOR,
                      modes.CSS_NUMBER_MODE,
                      modes.UNICODE_RANGE,
                      hljs.QUOTE_STRING_MODE,
                      hljs.APOS_STRING_MODE,
                      modes.IMPORTANT,
                      modes.FUNCTION_DISPATCH
                  ]
              },
              // matching these here allows us to treat them more like regular CSS
              // rules so everything between the {} gets regular rule highlighting,
              // which is what we want for page and font-face
              {
                  begin: '@(page|font-face)',
                  keywords: {
                      $pattern: AT_IDENTIFIER,
                      keyword: '@page @font-face'
                  }
              },
              {
                  begin: '@',
                  end: '[{;]',
                  returnBegin: true,
                  keywords: {
                      $pattern: /[a-z-]+/,
                      keyword: AT_MODIFIERS,
                      attribute: MEDIA_FEATURES.join(" ")
                  },
                  contains: [
                      {
                          begin: AT_IDENTIFIER,
                          className: "keyword"
                      },
                      {
                          begin: /[a-z-]+(?=:)/,
                          className: "attribute"
                      },
                      VARIABLE,
                      hljs.QUOTE_STRING_MODE,
                      hljs.APOS_STRING_MODE,
                      modes.HEXCOLOR,
                      modes.CSS_NUMBER_MODE
                  ]
              },
              modes.FUNCTION_DISPATCH
          ]
      };
  }
  module.exports = scss;

  }),
  (function (module, exports, require) {
  /*
   Language: SQL
   Website: https://en.wikipedia.org/wiki/SQL
   Category: common, database
   */
  /*

  Goals:

  SQL is intended to highlight basic/common SQL keywords and expressions

  - If pretty much every single SQL server includes supports, then it's a canidate.
  - It is NOT intended to include tons of vendor specific keywords (Oracle, MySQL,
    PostgreSQL) although the list of data types is purposely a bit more expansive.
  - For more specific SQL grammars please see:
    - PostgreSQL and PL/pgSQL - core
    - T-SQL - https://github.com/highlightjs/highlightjs-tsql
    - sql_more (core)

   */
  function sql(hljs) {
      const regex = hljs.regex;
      const COMMENT_MODE = hljs.COMMENT('--', '$');
      const STRING = {
          scope: 'string',
          variants: [
              {
                  begin: /'/,
                  end: /'/,
                  contains: [{ match: /''/ }]
              }
          ]
      };
      const QUOTED_IDENTIFIER = {
          begin: /"/,
          end: /"/,
          contains: [{ match: /""/ }]
      };
      const LITERALS = [
          "true",
          "false",
          // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
          // "null",
          "unknown"
      ];
      const MULTI_WORD_TYPES = [
          "double precision",
          "large object",
          "with timezone",
          "without timezone"
      ];
      const TYPES = [
          'bigint',
          'binary',
          'blob',
          'boolean',
          'char',
          'character',
          'clob',
          'date',
          'dec',
          'decfloat',
          'decimal',
          'float',
          'int',
          'integer',
          'interval',
          'nchar',
          'nclob',
          'national',
          'numeric',
          'real',
          'row',
          'smallint',
          'time',
          'timestamp',
          'varchar',
          'varying', // modifier (character varying)
          'varbinary'
      ];
      const NON_RESERVED_WORDS = [
          "add",
          "asc",
          "collation",
          "desc",
          "final",
          "first",
          "last",
          "view"
      ];
      // https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#reserved-word
      const RESERVED_WORDS = [
          "abs",
          "acos",
          "all",
          "allocate",
          "alter",
          "and",
          "any",
          "are",
          "array",
          "array_agg",
          "array_max_cardinality",
          "as",
          "asensitive",
          "asin",
          "asymmetric",
          "at",
          "atan",
          "atomic",
          "authorization",
          "avg",
          "begin",
          "begin_frame",
          "begin_partition",
          "between",
          "bigint",
          "binary",
          "blob",
          "boolean",
          "both",
          "by",
          "call",
          "called",
          "cardinality",
          "cascaded",
          "case",
          "cast",
          "ceil",
          "ceiling",
          "char",
          "char_length",
          "character",
          "character_length",
          "check",
          "classifier",
          "clob",
          "close",
          "coalesce",
          "collate",
          "collect",
          "column",
          "commit",
          "condition",
          "connect",
          "constraint",
          "contains",
          "convert",
          "copy",
          "corr",
          "corresponding",
          "cos",
          "cosh",
          "count",
          "covar_pop",
          "covar_samp",
          "create",
          "cross",
          "cube",
          "cume_dist",
          "current",
          "current_catalog",
          "current_date",
          "current_default_transform_group",
          "current_path",
          "current_role",
          "current_row",
          "current_schema",
          "current_time",
          "current_timestamp",
          "current_path",
          "current_role",
          "current_transform_group_for_type",
          "current_user",
          "cursor",
          "cycle",
          "date",
          "day",
          "deallocate",
          "dec",
          "decimal",
          "decfloat",
          "declare",
          "default",
          "define",
          "delete",
          "dense_rank",
          "deref",
          "describe",
          "deterministic",
          "disconnect",
          "distinct",
          "double",
          "drop",
          "dynamic",
          "each",
          "element",
          "else",
          "empty",
          "end",
          "end_frame",
          "end_partition",
          "end-exec",
          "equals",
          "escape",
          "every",
          "except",
          "exec",
          "execute",
          "exists",
          "exp",
          "external",
          "extract",
          "false",
          "fetch",
          "filter",
          "first_value",
          "float",
          "floor",
          "for",
          "foreign",
          "frame_row",
          "free",
          "from",
          "full",
          "function",
          "fusion",
          "get",
          "global",
          "grant",
          "group",
          "grouping",
          "groups",
          "having",
          "hold",
          "hour",
          "identity",
          "in",
          "indicator",
          "initial",
          "inner",
          "inout",
          "insensitive",
          "insert",
          "int",
          "integer",
          "intersect",
          "intersection",
          "interval",
          "into",
          "is",
          "join",
          "json_array",
          "json_arrayagg",
          "json_exists",
          "json_object",
          "json_objectagg",
          "json_query",
          "json_table",
          "json_table_primitive",
          "json_value",
          "lag",
          "language",
          "large",
          "last_value",
          "lateral",
          "lead",
          "leading",
          "left",
          "like",
          "like_regex",
          "listagg",
          "ln",
          "local",
          "localtime",
          "localtimestamp",
          "log",
          "log10",
          "lower",
          "match",
          "match_number",
          "match_recognize",
          "matches",
          "max",
          "member",
          "merge",
          "method",
          "min",
          "minute",
          "mod",
          "modifies",
          "module",
          "month",
          "multiset",
          "national",
          "natural",
          "nchar",
          "nclob",
          "new",
          "no",
          "none",
          "normalize",
          "not",
          "nth_value",
          "ntile",
          "null",
          "nullif",
          "numeric",
          "octet_length",
          "occurrences_regex",
          "of",
          "offset",
          "old",
          "omit",
          "on",
          "one",
          "only",
          "open",
          "or",
          "order",
          "out",
          "outer",
          "over",
          "overlaps",
          "overlay",
          "parameter",
          "partition",
          "pattern",
          "per",
          "percent",
          "percent_rank",
          "percentile_cont",
          "percentile_disc",
          "period",
          "portion",
          "position",
          "position_regex",
          "power",
          "precedes",
          "precision",
          "prepare",
          "primary",
          "procedure",
          "ptf",
          "range",
          "rank",
          "reads",
          "real",
          "recursive",
          "ref",
          "references",
          "referencing",
          "regr_avgx",
          "regr_avgy",
          "regr_count",
          "regr_intercept",
          "regr_r2",
          "regr_slope",
          "regr_sxx",
          "regr_sxy",
          "regr_syy",
          "release",
          "result",
          "return",
          "returns",
          "revoke",
          "right",
          "rollback",
          "rollup",
          "row",
          "row_number",
          "rows",
          "running",
          "savepoint",
          "scope",
          "scroll",
          "search",
          "second",
          "seek",
          "select",
          "sensitive",
          "session_user",
          "set",
          "show",
          "similar",
          "sin",
          "sinh",
          "skip",
          "smallint",
          "some",
          "specific",
          "specifictype",
          "sql",
          "sqlexception",
          "sqlstate",
          "sqlwarning",
          "sqrt",
          "start",
          "static",
          "stddev_pop",
          "stddev_samp",
          "submultiset",
          "subset",
          "substring",
          "substring_regex",
          "succeeds",
          "sum",
          "symmetric",
          "system",
          "system_time",
          "system_user",
          "table",
          "tablesample",
          "tan",
          "tanh",
          "then",
          "time",
          "timestamp",
          "timezone_hour",
          "timezone_minute",
          "to",
          "trailing",
          "translate",
          "translate_regex",
          "translation",
          "treat",
          "trigger",
          "trim",
          "trim_array",
          "true",
          "truncate",
          "uescape",
          "union",
          "unique",
          "unknown",
          "unnest",
          "update",
          "upper",
          "user",
          "using",
          "value",
          "values",
          "value_of",
          "var_pop",
          "var_samp",
          "varbinary",
          "varchar",
          "varying",
          "versioning",
          "when",
          "whenever",
          "where",
          "width_bucket",
          "window",
          "with",
          "within",
          "without",
          "year",
      ];
      // these are reserved words we have identified to be functions
      // and should only be highlighted in a dispatch-like context
      // ie, array_agg(...), etc.
      const RESERVED_FUNCTIONS = [
          "abs",
          "acos",
          "array_agg",
          "asin",
          "atan",
          "avg",
          "cast",
          "ceil",
          "ceiling",
          "coalesce",
          "corr",
          "cos",
          "cosh",
          "count",
          "covar_pop",
          "covar_samp",
          "cume_dist",
          "dense_rank",
          "deref",
          "element",
          "exp",
          "extract",
          "first_value",
          "floor",
          "json_array",
          "json_arrayagg",
          "json_exists",
          "json_object",
          "json_objectagg",
          "json_query",
          "json_table",
          "json_table_primitive",
          "json_value",
          "lag",
          "last_value",
          "lead",
          "listagg",
          "ln",
          "log",
          "log10",
          "lower",
          "max",
          "min",
          "mod",
          "nth_value",
          "ntile",
          "nullif",
          "percent_rank",
          "percentile_cont",
          "percentile_disc",
          "position",
          "position_regex",
          "power",
          "rank",
          "regr_avgx",
          "regr_avgy",
          "regr_count",
          "regr_intercept",
          "regr_r2",
          "regr_slope",
          "regr_sxx",
          "regr_sxy",
          "regr_syy",
          "row_number",
          "sin",
          "sinh",
          "sqrt",
          "stddev_pop",
          "stddev_samp",
          "substring",
          "substring_regex",
          "sum",
          "tan",
          "tanh",
          "translate",
          "translate_regex",
          "treat",
          "trim",
          "trim_array",
          "unnest",
          "upper",
          "value_of",
          "var_pop",
          "var_samp",
          "width_bucket",
      ];
      // these functions can
      const POSSIBLE_WITHOUT_PARENS = [
          "current_catalog",
          "current_date",
          "current_default_transform_group",
          "current_path",
          "current_role",
          "current_schema",
          "current_transform_group_for_type",
          "current_user",
          "session_user",
          "system_time",
          "system_user",
          "current_time",
          "localtime",
          "current_timestamp",
          "localtimestamp"
      ];
      // those exist to boost relevance making these very
      // "SQL like" keyword combos worth +1 extra relevance
      const COMBOS = [
          "create table",
          "insert into",
          "primary key",
          "foreign key",
          "not null",
          "alter table",
          "add constraint",
          "grouping sets",
          "on overflow",
          "character set",
          "respect nulls",
          "ignore nulls",
          "nulls first",
          "nulls last",
          "depth first",
          "breadth first"
      ];
      const FUNCTIONS = RESERVED_FUNCTIONS;
      const KEYWORDS = [
          ...RESERVED_WORDS,
          ...NON_RESERVED_WORDS
      ].filter((keyword) => {
          return !RESERVED_FUNCTIONS.includes(keyword);
      });
      const VARIABLE = {
          scope: "variable",
          match: /@[a-z0-9][a-z0-9_]*/,
      };
      const OPERATOR = {
          scope: "operator",
          match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
          relevance: 0,
      };
      const FUNCTION_CALL = {
          match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
          relevance: 0,
          keywords: { built_in: FUNCTIONS }
      };
      // turns a multi-word keyword combo into a regex that doesn't
      // care about extra whitespace etc.
      // input: "START QUERY"
      // output: /\bSTART\s+QUERY\b/
      function kws_to_regex(list) {
          return regex.concat(/\b/, regex.either(...list.map((kw) => {
              return kw.replace(/\s+/, "\\s+");
          })), /\b/);
      }
      const MULTI_WORD_KEYWORDS = {
          scope: "keyword",
          match: kws_to_regex(COMBOS),
          relevance: 0,
      };
      // keywords with less than 3 letters are reduced in relevancy
      function reduceRelevancy(list, { exceptions, when } = {}) {
          const qualifyFn = when;
          exceptions = exceptions || [];
          return list.map((item) => {
              if (item.match(/\|\d+$/) || exceptions.includes(item)) {
                  return item;
              }
              else if (qualifyFn(item)) {
                  return `${item}|0`;
              }
              else {
                  return item;
              }
          });
      }
      return {
          name: 'SQL',
          case_insensitive: true,
          // does not include {} or HTML tags `</`
          illegal: /[{}]|<\//,
          keywords: {
              $pattern: /\b[\w\.]+/,
              keyword: reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
              literal: LITERALS,
              type: TYPES,
              built_in: POSSIBLE_WITHOUT_PARENS
          },
          contains: [
              {
                  scope: "type",
                  match: kws_to_regex(MULTI_WORD_TYPES)
              },
              MULTI_WORD_KEYWORDS,
              FUNCTION_CALL,
              VARIABLE,
              STRING,
              QUOTED_IDENTIFIER,
              hljs.C_NUMBER_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              COMMENT_MODE,
              OPERATOR
          ]
      };
  }
  module.exports = sql;

  }),
  (function (module, exports, require) {
  /**
   * @param {string} value
   * @returns {RegExp}
   * */
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function source(re) {
      if (!re)
          return null;
      if (typeof re === "string")
          return re;
      return re.source;
  }
  /**
   * @param {RegExp | string } re
   * @returns {string}
   */
  function lookahead(re) {
      return concat('(?=', re, ')');
  }
  /**
   * @param {...(RegExp | string) } args
   * @returns {string}
   */
  function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
  }
  /**
   * @param { Array<string | RegExp | Object> } args
   * @returns {object}
   */
  function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];
      if (typeof opts === 'object' && opts.constructor === Object) {
          args.splice(args.length - 1, 1);
          return opts;
      }
      else {
          return {};
      }
  }
  /** @typedef { {capture?: boolean} } RegexEitherOptions */
  /**
   * Any of the passed expresssions may match
   *
   * Creates a huge this | this | that | that match
   * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
   * @returns {string}
   */
  function either(...args) {
      /** @type { object & {capture?: boolean} }  */
      const opts = stripOptionsFromArgs(args);
      const joined = '('
          + (opts.capture ? "" : "?:")
          + args.map((x) => source(x)).join("|") + ")";
      return joined;
  }
  // BACKREF_RE matches an open parenthesis or backreference. To avoid an
  // incorrect parse, it also matches the constructs where the meaning of
  // parentheses, escapes, or capture counting changes.
  new RegExp(either(/\[(?:[^\\\]]|\\.)*\]/, // a character class, inside which ( and \ lose their meaning
  /\(\?<(?![=!])[^>]+>/, // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
  /\(\?'[^']+'/, // a named capture group `(?'name'`
  /\(\??/, // an opening parenthesis, capturing or non-capturing / lookahead
  /\\([1-9][0-9]*)/, // a backreference like `\1`
  /\\./ // any other escape sequence
  ));
  const keywordWrapper = keyword => concat(/\b/, keyword, /\w$/.test(keyword) ? /\b/ : /\B/);
  // Keywords that require a leading dot.
  const dotKeywords = [
      'Protocol', // contextual
      'Type' // contextual
  ].map(keywordWrapper);
  // Keywords that may have a leading dot.
  const optionalDotKeywords = [
      'init',
      'self'
  ].map(keywordWrapper);
  // should register as keyword, not type
  const keywordTypes = [
      'Any',
      'Self'
  ];
  // Regular keywords and literals.
  const keywords = [
      // strings below will be fed into the regular `keywords` engine while regex
      // will result in additional modes being created to scan for those keywords to
      // avoid conflicts with other rules
      'actor',
      'any', // contextual
      'associatedtype',
      'async',
      'await',
      /as\?/, // operator
      /as!/, // operator
      'as', // operator
      'borrowing', // contextual
      'break',
      'case',
      'catch',
      'class',
      'consume', // contextual
      'consuming', // contextual
      'continue',
      'convenience', // contextual
      'copy', // contextual
      'default',
      'defer',
      'deinit',
      'didSet', // contextual
      'distributed',
      'do',
      'dynamic', // contextual
      'each',
      'else',
      'enum',
      'extension',
      'fallthrough',
      /fileprivate\(set\)/,
      'fileprivate',
      'final', // contextual
      'for',
      'func',
      'get', // contextual
      'guard',
      'if',
      'import',
      'indirect', // contextual
      'infix', // contextual
      /init\?/,
      /init!/,
      'inout',
      /internal\(set\)/,
      'internal',
      'in',
      'is', // operator
      'isolated', // contextual
      'nonisolated', // contextual
      'lazy', // contextual
      'let',
      'macro',
      'mutating', // contextual
      'nonmutating', // contextual
      /open\(set\)/, // contextual
      'open', // contextual
      'operator',
      'optional', // contextual
      'override', // contextual
      'package',
      'postfix', // contextual
      'precedencegroup',
      'prefix', // contextual
      /private\(set\)/,
      'private',
      'protocol',
      /public\(set\)/,
      'public',
      'repeat',
      'required', // contextual
      'rethrows',
      'return',
      'set', // contextual
      'some', // contextual
      'static',
      'struct',
      'subscript',
      'super',
      'switch',
      'throws',
      'throw',
      /try\?/, // operator
      /try!/, // operator
      'try', // operator
      'typealias',
      /unowned\(safe\)/, // contextual
      /unowned\(unsafe\)/, // contextual
      'unowned', // contextual
      'var',
      'weak', // contextual
      'where',
      'while',
      'willSet' // contextual
  ];
  // NOTE: Contextual keywords are reserved only in specific contexts.
  // Ideally, these should be matched using modes to avoid false positives.
  // Literals.
  const literals = [
      'false',
      'nil',
      'true'
  ];
  // Keywords used in precedence groups.
  const precedencegroupKeywords = [
      'assignment',
      'associativity',
      'higherThan',
      'left',
      'lowerThan',
      'none',
      'right'
  ];
  // Keywords that start with a number sign (#).
  // #(un)available is handled separately.
  const numberSignKeywords = [
      '#colorLiteral',
      '#column',
      '#dsohandle',
      '#else',
      '#elseif',
      '#endif',
      '#error',
      '#file',
      '#fileID',
      '#fileLiteral',
      '#filePath',
      '#function',
      '#if',
      '#imageLiteral',
      '#keyPath',
      '#line',
      '#selector',
      '#sourceLocation',
      '#warning'
  ];
  // Global functions in the Standard Library.
  const builtIns = [
      'abs',
      'all',
      'any',
      'assert',
      'assertionFailure',
      'debugPrint',
      'dump',
      'fatalError',
      'getVaList',
      'isKnownUniquelyReferenced',
      'max',
      'min',
      'numericCast',
      'pointwiseMax',
      'pointwiseMin',
      'precondition',
      'preconditionFailure',
      'print',
      'readLine',
      'repeatElement',
      'sequence',
      'stride',
      'swap',
      'swift_unboxFromSwiftValueWithType',
      'transcode',
      'type',
      'unsafeBitCast',
      'unsafeDowncast',
      'withExtendedLifetime',
      'withUnsafeMutablePointer',
      'withUnsafePointer',
      'withVaList',
      'withoutActuallyEscaping',
      'zip'
  ];
  // Valid first characters for operators.
  const operatorHead = either(/[/=\-+!*%<>&|^~?]/, /[\u00A1-\u00A7]/, /[\u00A9\u00AB]/, /[\u00AC\u00AE]/, /[\u00B0\u00B1]/, /[\u00B6\u00BB\u00BF\u00D7\u00F7]/, /[\u2016-\u2017]/, /[\u2020-\u2027]/, /[\u2030-\u203E]/, /[\u2041-\u2053]/, /[\u2055-\u205E]/, /[\u2190-\u23FF]/, /[\u2500-\u2775]/, /[\u2794-\u2BFF]/, /[\u2E00-\u2E7F]/, /[\u3001-\u3003]/, /[\u3008-\u3020]/, /[\u3030]/);
  // Valid characters for operators.
  const operatorCharacter = either(operatorHead, /[\u0300-\u036F]/, /[\u1DC0-\u1DFF]/, /[\u20D0-\u20FF]/, /[\uFE00-\uFE0F]/, /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
  );
  // Valid operator.
  const operator = concat(operatorHead, operatorCharacter, '*');
  // Valid first characters for identifiers.
  const identifierHead = either(/[a-zA-Z_]/, /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/, /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/, /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/, /[\u1E00-\u1FFF]/, /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/, /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/, /[\u2C00-\u2DFF\u2E80-\u2FFF]/, /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/, /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/, /[\uFE47-\uFEFE\uFF00-\uFFFD]/ // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
  );
  // Valid characters for identifiers.
  const identifierCharacter = either(identifierHead, /\d/, /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/);
  // Valid identifier.
  const identifier = concat(identifierHead, identifierCharacter, '*');
  // Valid type identifier.
  const typeIdentifier = concat(/[A-Z]/, identifierCharacter, '*');
  // Built-in attributes, which are highlighted as keywords.
  // @available is handled separately.
  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/attributes
  const keywordAttributes = [
      'attached',
      'autoclosure',
      concat(/convention\(/, either('swift', 'block', 'c'), /\)/),
      'discardableResult',
      'dynamicCallable',
      'dynamicMemberLookup',
      'escaping',
      'freestanding',
      'frozen',
      'GKInspectable',
      'IBAction',
      'IBDesignable',
      'IBInspectable',
      'IBOutlet',
      'IBSegueAction',
      'inlinable',
      'main',
      'nonobjc',
      'NSApplicationMain',
      'NSCopying',
      'NSManaged',
      concat(/objc\(/, identifier, /\)/),
      'objc',
      'objcMembers',
      'propertyWrapper',
      'requires_stored_property_inits',
      'resultBuilder',
      'Sendable',
      'testable',
      'UIApplicationMain',
      'unchecked',
      'unknown',
      'usableFromInline',
      'warn_unqualified_access'
  ];
  // Contextual keywords used in @available and #(un)available.
  const availabilityKeywords = [
      'iOS',
      'iOSApplicationExtension',
      'macOS',
      'macOSApplicationExtension',
      'macCatalyst',
      'macCatalystApplicationExtension',
      'watchOS',
      'watchOSApplicationExtension',
      'tvOS',
      'tvOSApplicationExtension',
      'swift'
  ];
  /*
  Language: Swift
  Description: Swift is a general-purpose programming language built using a modern approach to safety, performance, and software design patterns.
  Author: Steven Van Impe <steven.vanimpe@icloud.com>
  Contributors: Chris Eidhof <chris@eidhof.nl>, Nate Cook <natecook@gmail.com>, Alexander Lichter <manniL@gmx.net>, Richard Gibson <gibson042@github>
  Website: https://swift.org
  Category: common, system
  */
  /** @type LanguageFn */
  function swift(hljs) {
      const WHITESPACE = {
          match: /\s+/,
          relevance: 0
      };
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID411
      const BLOCK_COMMENT = hljs.COMMENT('/\\*', '\\*/', { contains: ['self'] });
      const COMMENTS = [
          hljs.C_LINE_COMMENT_MODE,
          BLOCK_COMMENT
      ];
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID413
      // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html
      const DOT_KEYWORD = {
          match: [
              /\./,
              either(...dotKeywords, ...optionalDotKeywords)
          ],
          className: { 2: "keyword" }
      };
      const KEYWORD_GUARD = {
          // Consume .keyword to prevent highlighting properties and methods as keywords.
          match: concat(/\./, either(...keywords)),
          relevance: 0
      };
      const PLAIN_KEYWORDS = keywords
          .filter(kw => typeof kw === 'string')
          .concat(["_|0"]); // seems common, so 0 relevance
      const REGEX_KEYWORDS = keywords
          .filter(kw => typeof kw !== 'string') // find regex
          .concat(keywordTypes)
          .map(keywordWrapper);
      const KEYWORD = { variants: [
              {
                  className: 'keyword',
                  match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
              }
          ] };
      // find all the regular keywords
      const KEYWORDS = {
          $pattern: either(/\b\w+/, // regular keywords
          /#\w+/ // number keywords
          ),
          keyword: PLAIN_KEYWORDS
              .concat(numberSignKeywords),
          literal: literals
      };
      const KEYWORD_MODES = [
          DOT_KEYWORD,
          KEYWORD_GUARD,
          KEYWORD
      ];
      // https://github.com/apple/swift/tree/main/stdlib/public/core
      const BUILT_IN_GUARD = {
          // Consume .built_in to prevent highlighting properties and methods.
          match: concat(/\./, either(...builtIns)),
          relevance: 0
      };
      const BUILT_IN = {
          className: 'built_in',
          match: concat(/\b/, either(...builtIns), /(?=\()/)
      };
      const BUILT_INS = [
          BUILT_IN_GUARD,
          BUILT_IN
      ];
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID418
      const OPERATOR_GUARD = {
          // Prevent -> from being highlighting as an operator.
          match: /->/,
          relevance: 0
      };
      const OPERATOR = {
          className: 'operator',
          relevance: 0,
          variants: [
              { match: operator },
              {
                  // dot-operator: only operators that start with a dot are allowed to use dots as
                  // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
                  // characters that may also include dots.
                  match: `\\.(\\.|${operatorCharacter})+`
              }
          ]
      };
      const OPERATORS = [
          OPERATOR_GUARD,
          OPERATOR
      ];
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_numeric-literal
      // TODO: Update for leading `-` after lookbehind is supported everywhere
      const decimalDigits = '([0-9]_*)+';
      const hexDigits = '([0-9a-fA-F]_*)+';
      const NUMBER = {
          className: 'number',
          relevance: 0,
          variants: [
              // decimal floating-point-literal (subsumes decimal-literal)
              { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?` + `([eE][+-]?(${decimalDigits}))?\\b` },
              // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
              { match: `\\b0x(${hexDigits})(\\.(${hexDigits}))?` + `([pP][+-]?(${decimalDigits}))?\\b` },
              // octal-literal
              { match: /\b0o([0-7]_*)+\b/ },
              // binary-literal
              { match: /\b0b([01]_*)+\b/ }
          ]
      };
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_string-literal
      const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
          className: 'subst',
          variants: [
              { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
              { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
          ]
      });
      const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
          className: 'subst',
          match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
      });
      const INTERPOLATION = (rawDelimiter = "") => ({
          className: 'subst',
          label: "interpol",
          begin: concat(/\\/, rawDelimiter, /\(/),
          end: /\)/
      });
      const MULTILINE_STRING = (rawDelimiter = "") => ({
          begin: concat(rawDelimiter, /"""/),
          end: concat(/"""/, rawDelimiter),
          contains: [
              ESCAPED_CHARACTER(rawDelimiter),
              ESCAPED_NEWLINE(rawDelimiter),
              INTERPOLATION(rawDelimiter)
          ]
      });
      const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
          begin: concat(rawDelimiter, /"/),
          end: concat(/"/, rawDelimiter),
          contains: [
              ESCAPED_CHARACTER(rawDelimiter),
              INTERPOLATION(rawDelimiter)
          ]
      });
      const STRING = {
          className: 'string',
          variants: [
              MULTILINE_STRING(),
              MULTILINE_STRING("#"),
              MULTILINE_STRING("##"),
              MULTILINE_STRING("###"),
              SINGLE_LINE_STRING(),
              SINGLE_LINE_STRING("#"),
              SINGLE_LINE_STRING("##"),
              SINGLE_LINE_STRING("###")
          ]
      };
      const REGEXP_CONTENTS = [
          hljs.BACKSLASH_ESCAPE,
          {
              begin: /\[/,
              end: /\]/,
              relevance: 0,
              contains: [hljs.BACKSLASH_ESCAPE]
          }
      ];
      const BARE_REGEXP_LITERAL = {
          begin: /\/[^\s](?=[^/\n]*\/)/,
          end: /\//,
          contains: REGEXP_CONTENTS
      };
      const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
          const begin = concat(rawDelimiter, /\//);
          const end = concat(/\//, rawDelimiter);
          return {
              begin,
              end,
              contains: [
                  ...REGEXP_CONTENTS,
                  {
                      scope: "comment",
                      begin: `#(?!.*${end})`,
                      end: /$/,
                  },
              ],
          };
      };
      // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/#Regular-Expression-Literals
      const REGEXP = {
          scope: "regexp",
          variants: [
              EXTENDED_REGEXP_LITERAL('###'),
              EXTENDED_REGEXP_LITERAL('##'),
              EXTENDED_REGEXP_LITERAL('#'),
              BARE_REGEXP_LITERAL
          ]
      };
      // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID412
      const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
      const IMPLICIT_PARAMETER = {
          className: 'variable',
          match: /\$\d+/
      };
      const PROPERTY_WRAPPER_PROJECTION = {
          className: 'variable',
          match: `\\$${identifierCharacter}+`
      };
      const IDENTIFIERS = [
          QUOTED_IDENTIFIER,
          IMPLICIT_PARAMETER,
          PROPERTY_WRAPPER_PROJECTION
      ];
      // https://docs.swift.org/swift-book/ReferenceManual/Attributes.html
      const AVAILABLE_ATTRIBUTE = {
          match: /(@|#(un)?)available/,
          scope: 'keyword',
          starts: { contains: [
                  {
                      begin: /\(/,
                      end: /\)/,
                      keywords: availabilityKeywords,
                      contains: [
                          ...OPERATORS,
                          NUMBER,
                          STRING
                      ]
                  }
              ] }
      };
      const KEYWORD_ATTRIBUTE = {
          scope: 'keyword',
          match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/))),
      };
      const USER_DEFINED_ATTRIBUTE = {
          scope: 'meta',
          match: concat(/@/, identifier)
      };
      const ATTRIBUTES = [
          AVAILABLE_ATTRIBUTE,
          KEYWORD_ATTRIBUTE,
          USER_DEFINED_ATTRIBUTE
      ];
      // https://docs.swift.org/swift-book/ReferenceManual/Types.html
      const TYPE = {
          match: lookahead(/\b[A-Z]/),
          relevance: 0,
          contains: [
              {
                  className: 'type',
                  match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, '+')
              },
              {
                  className: 'type',
                  match: typeIdentifier,
                  relevance: 0
              },
              {
                  match: /[?!]+/,
                  relevance: 0
              },
              {
                  match: /\.\.\./,
                  relevance: 0
              },
              {
                  match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
                  relevance: 0
              }
          ]
      };
      const GENERIC_ARGUMENTS = {
          begin: /</,
          end: />/,
          keywords: KEYWORDS,
          contains: [
              ...COMMENTS,
              ...KEYWORD_MODES,
              ...ATTRIBUTES,
              OPERATOR_GUARD,
              TYPE
          ]
      };
      TYPE.contains.push(GENERIC_ARGUMENTS);
      // https://docs.swift.org/swift-book/ReferenceManual/Expressions.html#ID552
      // Prevents element names from being highlighted as keywords.
      const TUPLE_ELEMENT_NAME = {
          match: concat(identifier, /\s*:/),
          keywords: "_|0",
          relevance: 0
      };
      // Matches tuples as well as the parameter list of a function type.
      const TUPLE = {
          begin: /\(/,
          end: /\)/,
          relevance: 0,
          keywords: KEYWORDS,
          contains: [
              'self',
              TUPLE_ELEMENT_NAME,
              ...COMMENTS,
              REGEXP,
              ...KEYWORD_MODES,
              ...BUILT_INS,
              ...OPERATORS,
              NUMBER,
              STRING,
              ...IDENTIFIERS,
              ...ATTRIBUTES,
              TYPE
          ]
      };
      const GENERIC_PARAMETERS = {
          begin: /</,
          end: />/,
          keywords: 'repeat each',
          contains: [
              ...COMMENTS,
              TYPE
          ]
      };
      const FUNCTION_PARAMETER_NAME = {
          begin: either(lookahead(concat(identifier, /\s*:/)), lookahead(concat(identifier, /\s+/, identifier, /\s*:/))),
          end: /:/,
          relevance: 0,
          contains: [
              {
                  className: 'keyword',
                  match: /\b_\b/
              },
              {
                  className: 'params',
                  match: identifier
              }
          ]
      };
      const FUNCTION_PARAMETERS = {
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS,
          contains: [
              FUNCTION_PARAMETER_NAME,
              ...COMMENTS,
              ...KEYWORD_MODES,
              ...OPERATORS,
              NUMBER,
              STRING,
              ...ATTRIBUTES,
              TYPE,
              TUPLE
          ],
          endsParent: true,
          illegal: /["']/
      };
      // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID362
      // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/declarations/#Macro-Declaration
      const FUNCTION_OR_MACRO = {
          match: [
              /(func|macro)/,
              /\s+/,
              either(QUOTED_IDENTIFIER.match, identifier, operator)
          ],
          className: {
              1: "keyword",
              3: "title.function"
          },
          contains: [
              GENERIC_PARAMETERS,
              FUNCTION_PARAMETERS,
              WHITESPACE
          ],
          illegal: [
              /\[/,
              /%/
          ]
      };
      // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID375
      // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID379
      const INIT_SUBSCRIPT = {
          match: [
              /\b(?:subscript|init[?!]?)/,
              /\s*(?=[<(])/,
          ],
          className: { 1: "keyword" },
          contains: [
              GENERIC_PARAMETERS,
              FUNCTION_PARAMETERS,
              WHITESPACE
          ],
          illegal: /\[|%/
      };
      // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID380
      const OPERATOR_DECLARATION = {
          match: [
              /operator/,
              /\s+/,
              operator
          ],
          className: {
              1: "keyword",
              3: "title"
          }
      };
      // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID550
      const PRECEDENCEGROUP = {
          begin: [
              /precedencegroup/,
              /\s+/,
              typeIdentifier
          ],
          className: {
              1: "keyword",
              3: "title"
          },
          contains: [TYPE],
          keywords: [
              ...precedencegroupKeywords,
              ...literals
          ],
          end: /}/
      };
      const CLASS_FUNC_DECLARATION = {
          match: [
              /class\b/,
              /\s+/,
              /func\b/,
              /\s+/,
              /\b[A-Za-z_][A-Za-z0-9_]*\b/
          ],
          scope: {
              1: "keyword",
              3: "keyword",
              5: "title.function"
          }
      };
      const CLASS_VAR_DECLARATION = {
          match: [
              /class\b/,
              /\s+/,
              /var\b/,
          ],
          scope: {
              1: "keyword",
              3: "keyword"
          }
      };
      const TYPE_DECLARATION = {
          begin: [
              /(struct|protocol|class|extension|enum|actor)/,
              /\s+/,
              identifier,
              /\s*/,
          ],
          beginScope: {
              1: "keyword",
              3: "title.class"
          },
          keywords: KEYWORDS,
          contains: [
              GENERIC_PARAMETERS,
              ...KEYWORD_MODES,
              {
                  begin: /:/,
                  end: /\{/,
                  keywords: KEYWORDS,
                  contains: [
                      {
                          scope: "title.class.inherited",
                          match: typeIdentifier,
                      },
                      ...KEYWORD_MODES,
                  ],
                  relevance: 0,
              },
          ]
      };
      // Add supported submodes to string interpolation.
      for (const variant of STRING.variants) {
          const interpolation = variant.contains.find(mode => mode.label === "interpol");
          // TODO: Interpolation can contain any expression, so there's room for improvement here.
          interpolation.keywords = KEYWORDS;
          const submodes = [
              ...KEYWORD_MODES,
              ...BUILT_INS,
              ...OPERATORS,
              NUMBER,
              STRING,
              ...IDENTIFIERS
          ];
          interpolation.contains = [
              ...submodes,
              {
                  begin: /\(/,
                  end: /\)/,
                  contains: [
                      'self',
                      ...submodes
                  ]
              }
          ];
      }
      return {
          name: 'Swift',
          keywords: KEYWORDS,
          contains: [
              ...COMMENTS,
              FUNCTION_OR_MACRO,
              INIT_SUBSCRIPT,
              CLASS_FUNC_DECLARATION,
              CLASS_VAR_DECLARATION,
              TYPE_DECLARATION,
              OPERATOR_DECLARATION,
              PRECEDENCEGROUP,
              {
                  beginKeywords: 'import',
                  end: /$/,
                  contains: [...COMMENTS],
                  relevance: 0
              },
              REGEXP,
              ...KEYWORD_MODES,
              ...BUILT_INS,
              ...OPERATORS,
              NUMBER,
              STRING,
              ...IDENTIFIERS,
              ...ATTRIBUTES,
              TYPE,
              TUPLE
          ]
      };
  }
  module.exports = swift;

  }),
  (function (module, exports, require) {
  const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  const KEYWORDS = [
      "as", // for exports
      "in",
      "of",
      "if",
      "for",
      "while",
      "finally",
      "var",
      "new",
      "function",
      "do",
      "return",
      "void",
      "else",
      "break",
      "catch",
      "instanceof",
      "with",
      "throw",
      "case",
      "default",
      "try",
      "switch",
      "continue",
      "typeof",
      "delete",
      "let",
      "yield",
      "const",
      "class",
      // JS handles these with a special rule
      // "get",
      // "set",
      "debugger",
      "async",
      "await",
      "static",
      "import",
      "from",
      "export",
      "extends",
      // It's reached stage 3, which is "recommended for implementation":
      "using"
  ];
  const LITERALS = [
      "true",
      "false",
      "null",
      "undefined",
      "NaN",
      "Infinity"
  ];
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
  const TYPES = [
      // Fundamental objects
      "Object",
      "Function",
      "Boolean",
      "Symbol",
      // numbers and dates
      "Math",
      "Date",
      "Number",
      "BigInt",
      // text
      "String",
      "RegExp",
      // Indexed collections
      "Array",
      "Float32Array",
      "Float64Array",
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Int32Array",
      "Uint16Array",
      "Uint32Array",
      "BigInt64Array",
      "BigUint64Array",
      // Keyed collections
      "Set",
      "Map",
      "WeakSet",
      "WeakMap",
      // Structured data
      "ArrayBuffer",
      "SharedArrayBuffer",
      "Atomics",
      "DataView",
      "JSON",
      // Control abstraction objects
      "Promise",
      "Generator",
      "GeneratorFunction",
      "AsyncFunction",
      // Reflection
      "Reflect",
      "Proxy",
      // Internationalization
      "Intl",
      // WebAssembly
      "WebAssembly"
  ];
  const ERROR_TYPES = [
      "Error",
      "EvalError",
      "InternalError",
      "RangeError",
      "ReferenceError",
      "SyntaxError",
      "TypeError",
      "URIError"
  ];
  const BUILT_IN_GLOBALS = [
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",
      "require",
      "exports",
      "eval",
      "isFinite",
      "isNaN",
      "parseFloat",
      "parseInt",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "escape",
      "unescape"
  ];
  const BUILT_IN_VARIABLES = [
      "arguments",
      "this",
      "super",
      "console",
      "window",
      "document",
      "localStorage",
      "sessionStorage",
      "module",
      "self",
      "global" // Node.js
  ];
  const BUILT_INS = [].concat(BUILT_IN_GLOBALS, TYPES, ERROR_TYPES);
  /*
  Language: JavaScript
  Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
  Category: common, scripting, web
  Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
  */
  /** @type LanguageFn */
  function javascript(hljs) {
      const regex = hljs.regex;
      /**
       * Takes a string like "<Booger" and checks to see
       * if we can find a matching "</Booger" later in the
       * content.
       * @param {RegExpMatchArray} match
       * @param {{after:number}} param1
       */
      const hasClosingTag = (match, { after }) => {
          const tag = "</" + match[0].slice(1);
          const pos = match.input.indexOf(tag, after);
          return pos !== -1;
      };
      const IDENT_RE$1 = IDENT_RE;
      const FRAGMENT = {
          begin: '<>',
          end: '</>'
      };
      // to avoid some special cases inside isTrulyOpeningTag
      const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
      const XML_TAG = {
          begin: /<[A-Za-z0-9\\._:-]+/,
          end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
          /**
           * @param {RegExpMatchArray} match
           * @param {CallbackResponse} response
           */
          isTrulyOpeningTag: (match, response) => {
              const afterMatchIndex = match[0].length + match.index;
              const nextChar = match.input[afterMatchIndex];
              if (
              // HTML should not include another raw `<` inside a tag
              // nested type?
              // `<Array<Array<number>>`, etc.
              nextChar === "<" ||
                  // the , gives away that this is not HTML
                  // `<T, A extends keyof T, V>`
                  nextChar === ",") {
                  response.ignoreMatch();
                  return;
              }
              // `<something>`
              // Quite possibly a tag, lets look for a matching closing tag...
              if (nextChar === ">") {
                  // if we cannot find a matching closing tag, then we
                  // will ignore it
                  if (!hasClosingTag(match, { after: afterMatchIndex })) {
                      response.ignoreMatch();
                  }
              }
              // `<blah />` (self-closing)
              // handled by simpleSelfClosing rule
              let m;
              const afterMatch = match.input.substring(afterMatchIndex);
              // some more template typing stuff
              //  <T = any>(key?: string) => Modify<
              if ((m = afterMatch.match(/^\s*=/))) {
                  response.ignoreMatch();
                  return;
              }
              // `<From extends string>`
              // technically this could be HTML, but it smells like a type
              // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
              if ((m = afterMatch.match(/^\s+extends\s+/))) {
                  if (m.index === 0) {
                      response.ignoreMatch();
                      // eslint-disable-next-line no-useless-return
                      return;
                  }
              }
          }
      };
      const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_INS,
          "variable.language": BUILT_IN_VARIABLES
      };
      // https://tc39.es/ecma262/#sec-literals-numeric-literals
      const decimalDigits = '[0-9](_?[0-9])*';
      const frac = `\\.(${decimalDigits})`;
      // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
      const NUMBER = {
          className: 'number',
          variants: [
              // DecimalLiteral
              { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
                      `[eE][+-]?(${decimalDigits})\\b` },
              { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
              // DecimalBigIntegerLiteral
              { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
              // NonDecimalIntegerLiteral
              { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
              { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
              { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
              // LegacyOctalIntegerLiteral (does not include underscore separators)
              // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
              { begin: "\\b0[0-7]+n?\\b" },
          ],
          relevance: 0
      };
      const SUBST = {
          className: 'subst',
          begin: '\\$\\{',
          end: '\\}',
          keywords: KEYWORDS$1,
          contains: [] // defined later
      };
      const HTML_TEMPLATE = {
          begin: '\.?html`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'xml'
          }
      };
      const CSS_TEMPLATE = {
          begin: '\.?css`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'css'
          }
      };
      const GRAPHQL_TEMPLATE = {
          begin: '\.?gql`',
          end: '',
          starts: {
              end: '`',
              returnEnd: false,
              contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
              ],
              subLanguage: 'graphql'
          }
      };
      const TEMPLATE_STRING = {
          className: 'string',
          begin: '`',
          end: '`',
          contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
          ]
      };
      const JSDOC_COMMENT = hljs.COMMENT(/\/\*\*(?!\/)/, '\\*/', {
          relevance: 0,
          contains: [
              {
                  begin: '(?=@[A-Za-z]+)',
                  relevance: 0,
                  contains: [
                      {
                          className: 'doctag',
                          begin: '@[A-Za-z]+'
                      },
                      {
                          className: 'type',
                          begin: '\\{',
                          end: '\\}',
                          excludeEnd: true,
                          excludeBegin: true,
                          relevance: 0
                      },
                      {
                          className: 'variable',
                          begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
                          endsParent: true,
                          relevance: 0
                      },
                      // eat spaces (not newlines) so we can find
                      // types or variables
                      {
                          begin: /(?=[^\n])\s/,
                          relevance: 0
                      }
                  ]
              }
          ]
      });
      const COMMENT = {
          className: "comment",
          variants: [
              JSDOC_COMMENT,
              hljs.C_BLOCK_COMMENT_MODE,
              hljs.C_LINE_COMMENT_MODE
          ]
      };
      const SUBST_INTERNALS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          GRAPHQL_TEMPLATE,
          TEMPLATE_STRING,
          // Skip numbers when they are part of a variable name
          { match: /\$\d+/ },
          NUMBER,
          // This is intentional:
          // See https://github.com/highlightjs/highlight.js/issues/3288
          // hljs.REGEXP_MODE
      ];
      SUBST.contains = SUBST_INTERNALS
          .concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
              "self"
          ].concat(SUBST_INTERNALS)
      });
      const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
      const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
          // eat recursive parens in sub expressions
          {
              begin: /(\s*)\(/,
              end: /\)/,
              keywords: KEYWORDS$1,
              contains: ["self"].concat(SUBST_AND_COMMENTS)
          }
      ]);
      const PARAMS = {
          className: 'params',
          // convert this to negative lookbehind in v12
          begin: /(\s*)\(/, // to match the parms with
          end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS$1,
          contains: PARAMS_CONTAINS
      };
      // ES6 classes
      const CLASS_OR_EXTENDS = {
          variants: [
              // class Car extends vehicle
              {
                  match: [
                      /class/,
                      /\s+/,
                      IDENT_RE$1,
                      /\s+/,
                      /extends/,
                      /\s+/,
                      regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class",
                      5: "keyword",
                      7: "title.class.inherited"
                  }
              },
              // class Car
              {
                  match: [
                      /class/,
                      /\s+/,
                      IDENT_RE$1
                  ],
                  scope: {
                      1: "keyword",
                      3: "title.class"
                  }
              },
          ]
      };
      const CLASS_REFERENCE = {
          relevance: 0,
          match: regex.either(
          // Hard coded exceptions
          /\bJSON/, 
          // Float32Array, OutT
          /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/, 
          // CSSFactory, CSSFactoryT
          /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/, 
          // FPs, FPsT
          /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),
          className: "title.class",
          keywords: {
              _: [
                  // se we still get relevance credit for JS library classes
                  ...TYPES,
                  ...ERROR_TYPES
              ]
          }
      };
      const USE_STRICT = {
          label: "use_strict",
          className: 'meta',
          relevance: 10,
          begin: /^\s*['"]use (strict|asm)['"]/
      };
      const FUNCTION_DEFINITION = {
          variants: [
              {
                  match: [
                      /function/,
                      /\s+/,
                      IDENT_RE$1,
                      /(?=\s*\()/
                  ]
              },
              // anonymous function
              {
                  match: [
                      /function/,
                      /\s*(?=\()/
                  ]
              }
          ],
          className: {
              1: "keyword",
              3: "title.function"
          },
          label: "func.def",
          contains: [PARAMS],
          illegal: /%/
      };
      const UPPER_CASE_CONSTANT = {
          relevance: 0,
          match: /\b[A-Z][A-Z_0-9]+\b/,
          className: "variable.constant"
      };
      function noneOf(list) {
          return regex.concat("(?!", list.join("|"), ")");
      }
      const FUNCTION_CALL = {
          match: regex.concat(/\b/, noneOf([
              ...BUILT_IN_GLOBALS,
              "super",
              "import",
              "await",
          ].map(x => `${x}\\s*\\(`)), IDENT_RE$1, regex.lookahead(/\s*\(/)),
          className: "title.function",
          relevance: 0
      };
      const PROPERTY_ACCESS = {
          begin: regex.concat(/\./, regex.lookahead(regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/))),
          end: IDENT_RE$1,
          excludeBegin: true,
          keywords: "prototype",
          className: "property",
          relevance: 0
      };
      const GETTER_OR_SETTER = {
          match: [
              /get|set/,
              /\s+/,
              IDENT_RE$1,
              /(?=\()/
          ],
          className: {
              1: "keyword",
              3: "title.function"
          },
          contains: [
              {
                  begin: /\(\)/
              },
              PARAMS
          ]
      };
      const FUNC_LEAD_IN_RE = '(\\(' +
          '[^()]*(\\(' +
          '[^()]*(\\(' +
          '[^()]*' +
          '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';
      const FUNCTION_VARIABLE = {
          match: [
              /const|var|let/, /\s+/,
              IDENT_RE$1, /\s*/,
              /=\s*/,
              /(async\s*)?/, // async is optional
              regex.lookahead(FUNC_LEAD_IN_RE)
          ],
          keywords: "async",
          className: {
              1: "keyword",
              3: "title.function"
          },
          contains: [
              PARAMS
          ]
      };
      return {
          name: 'JavaScript',
          aliases: ['js', 'jsx', 'mjs', 'cjs'],
          keywords: KEYWORDS$1,
          // this will be extended by TypeScript
          exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
          illegal: /#(?![$_A-Za-z])/,
          contains: [
              hljs.SHEBANG({
                  label: "shebang",
                  binary: "node",
                  relevance: 5
              }),
              USE_STRICT,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              HTML_TEMPLATE,
              CSS_TEMPLATE,
              GRAPHQL_TEMPLATE,
              TEMPLATE_STRING,
              COMMENT,
              // Skip numbers when they are part of a variable name
              { match: /\$\d+/ },
              NUMBER,
              CLASS_REFERENCE,
              {
                  scope: 'attr',
                  match: IDENT_RE$1 + regex.lookahead(':'),
                  relevance: 0
              },
              FUNCTION_VARIABLE,
              {
                  begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
                  keywords: 'return throw case',
                  relevance: 0,
                  contains: [
                      COMMENT,
                      hljs.REGEXP_MODE,
                      {
                          className: 'function',
                          // we have to count the parens to make sure we actually have the
                          // correct bounding ( ) before the =>.  There could be any number of
                          // sub-expressions inside also surrounded by parens.
                          begin: FUNC_LEAD_IN_RE,
                          returnBegin: true,
                          end: '\\s*=>',
                          contains: [
                              {
                                  className: 'params',
                                  variants: [
                                      {
                                          begin: hljs.UNDERSCORE_IDENT_RE,
                                          relevance: 0
                                      },
                                      {
                                          className: null,
                                          begin: /\(\s*\)/,
                                          skip: true
                                      },
                                      {
                                          begin: /(\s*)\(/,
                                          end: /\)/,
                                          excludeBegin: true,
                                          excludeEnd: true,
                                          keywords: KEYWORDS$1,
                                          contains: PARAMS_CONTAINS
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          begin: /,/,
                          relevance: 0
                      },
                      {
                          match: /\s+/,
                          relevance: 0
                      },
                      {
                          variants: [
                              { begin: FRAGMENT.begin, end: FRAGMENT.end },
                              { match: XML_SELF_CLOSING },
                              {
                                  begin: XML_TAG.begin,
                                  // we carefully check the opening tag to see if it truly
                                  // is a tag and not a false positive
                                  'on:begin': XML_TAG.isTrulyOpeningTag,
                                  end: XML_TAG.end
                              }
                          ],
                          subLanguage: 'xml',
                          contains: [
                              {
                                  begin: XML_TAG.begin,
                                  end: XML_TAG.end,
                                  skip: true,
                                  contains: ['self']
                              }
                          ]
                      }
                  ],
              },
              FUNCTION_DEFINITION,
              {
                  // prevent this from getting swallowed up by function
                  // since they appear "function like"
                  beginKeywords: "while if switch catch for"
              },
              {
                  // we have to count the parens to make sure we actually have the correct
                  // bounding ( ).  There could be any number of sub-expressions inside
                  // also surrounded by parens.
                  begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
                      '\\(' + // first parens
                      '[^()]*(\\(' +
                      '[^()]*(\\(' +
                      '[^()]*' +
                      '\\)[^()]*)*' +
                      '\\)[^()]*)*' +
                      '\\)\\s*\\{', // end parens
                  returnBegin: true,
                  label: "func.def",
                  contains: [
                      PARAMS,
                      hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
                  ]
              },
              // catch ... so it won't trigger the property rule below
              {
                  match: /\.\.\./,
                  relevance: 0
              },
              PROPERTY_ACCESS,
              // hack: prevents detection of keywords in some circumstances
              // .keyword()
              // $keyword = x
              {
                  match: '\\$' + IDENT_RE$1,
                  relevance: 0
              },
              {
                  match: [/\bconstructor(?=\s*\()/],
                  className: { 1: "title.function" },
                  contains: [PARAMS]
              },
              FUNCTION_CALL,
              UPPER_CASE_CONSTANT,
              CLASS_OR_EXTENDS,
              GETTER_OR_SETTER,
              {
                  match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
              }
          ]
      };
  }
  /*
  Language: TypeScript
  Author: Panu Horsmalahti <panu.horsmalahti@iki.fi>
  Contributors: Ike Ku <dempfi@yahoo.com>
  Description: TypeScript is a strict superset of JavaScript
  Website: https://www.typescriptlang.org
  Category: common, scripting
  */
  /** @type LanguageFn */
  function typescript(hljs) {
      const regex = hljs.regex;
      const tsLanguage = javascript(hljs);
      const IDENT_RE$1 = IDENT_RE;
      const TYPES = [
          "any",
          "void",
          "number",
          "boolean",
          "string",
          "object",
          "never",
          "symbol",
          "bigint",
          "unknown"
      ];
      const NAMESPACE = {
          begin: [
              /namespace/,
              /\s+/,
              hljs.IDENT_RE
          ],
          beginScope: {
              1: "keyword",
              3: "title.class"
          }
      };
      const INTERFACE = {
          beginKeywords: 'interface',
          end: /\{/,
          excludeEnd: true,
          keywords: {
              keyword: 'interface extends',
              built_in: TYPES
          },
          contains: [tsLanguage.exports.CLASS_REFERENCE]
      };
      const USE_STRICT = {
          className: 'meta',
          relevance: 10,
          begin: /^\s*['"]use strict['"]/
      };
      const TS_SPECIFIC_KEYWORDS = [
          "type",
          // "namespace",
          "interface",
          "public",
          "private",
          "protected",
          "implements",
          "declare",
          "abstract",
          "readonly",
          "enum",
          "override",
          "satisfies"
      ];
      /*
        namespace is a TS keyword but it's fine to use it as a variable name too.
        const message = 'foo';
        const namespace = 'bar';
      */
      const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
          literal: LITERALS,
          built_in: BUILT_INS.concat(TYPES),
          "variable.language": BUILT_IN_VARIABLES
      };
      const DECORATOR = {
          className: 'meta',
          begin: '@' + IDENT_RE$1,
      };
      const swapMode = (mode, label, replacement) => {
          const indx = mode.contains.findIndex(m => m.label === label);
          if (indx === -1) {
              throw new Error("can not find mode to replace");
          }
          mode.contains.splice(indx, 1, replacement);
      };
      // this should update anywhere keywords is used since
      // it will be the same actual JS object
      Object.assign(tsLanguage.keywords, KEYWORDS$1);
      tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
      // highlight the function params
      const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find(c => c.scope === "attr");
      // take default attr rule and extend it to support optionals
      const OPTIONAL_KEY_OR_ARGUMENT = Object.assign({}, ATTRIBUTE_HIGHLIGHT, { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) });
      tsLanguage.exports.PARAMS_CONTAINS.push([
          tsLanguage.exports.CLASS_REFERENCE, // class reference for highlighting the params types
          ATTRIBUTE_HIGHLIGHT, // highlight the params key
          OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
      ]);
      // Add the optional property assignment highlighting for objects or classes
      tsLanguage.contains = tsLanguage.contains.concat([
          DECORATOR,
          NAMESPACE,
          INTERFACE,
          OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
      ]);
      // TS gets a simpler shebang rule than JS
      swapMode(tsLanguage, "shebang", hljs.SHEBANG());
      // JS use strict rule purposely excludes `asm` which makes no sense
      swapMode(tsLanguage, "use_strict", USE_STRICT);
      const functionDeclaration = tsLanguage.contains.find(m => m.label === "func.def");
      functionDeclaration.relevance = 0; // () => {} is more typical in TypeScript
      Object.assign(tsLanguage, {
          name: 'TypeScript',
          aliases: [
              'ts',
              'tsx',
              'mts',
              'cts'
          ]
      });
      return tsLanguage;
  }
  module.exports = typescript;

  }),
  (function (module, exports, require) {
  /*
  Language: HTML, XML
  Website: https://www.w3.org/XML/
  Category: common, web
  Audit: 2020
  */
  /** @type LanguageFn */
  function xml(hljs) {
      const regex = hljs.regex;
      // XML names can have the following additional letters: https://www.w3.org/TR/xml/#NT-NameChar
      // OTHER_NAME_CHARS = /[:\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
      // Element names start with NAME_START_CHAR followed by optional other Unicode letters, ASCII digits, hyphens, underscores, and periods
      // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);;
      // const XML_IDENT_RE = /[A-Z_a-z:\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]+/;
      // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);
      // however, to cater for performance and more Unicode support rely simply on the Unicode letter class
      const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
      const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
      const XML_ENTITIES = {
          className: 'symbol',
          begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
      };
      const XML_META_KEYWORDS = {
          begin: /\s/,
          contains: [
              {
                  className: 'keyword',
                  begin: /#?[a-z_][a-z1-9_-]+/,
                  illegal: /\n/
              }
          ]
      };
      const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
          begin: /\(/,
          end: /\)/
      });
      const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: 'string' });
      const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' });
      const TAG_INTERNALS = {
          endsWithParent: true,
          illegal: /</,
          relevance: 0,
          contains: [
              {
                  className: 'attr',
                  begin: XML_IDENT_RE,
                  relevance: 0
              },
              {
                  begin: /=\s*/,
                  relevance: 0,
                  contains: [
                      {
                          className: 'string',
                          endsParent: true,
                          variants: [
                              {
                                  begin: /"/,
                                  end: /"/,
                                  contains: [XML_ENTITIES]
                              },
                              {
                                  begin: /'/,
                                  end: /'/,
                                  contains: [XML_ENTITIES]
                              },
                              { begin: /[^\s"'=<>`]+/ }
                          ]
                      }
                  ]
              }
          ]
      };
      return {
          name: 'HTML, XML',
          aliases: [
              'html',
              'xhtml',
              'rss',
              'atom',
              'xjb',
              'xsd',
              'xsl',
              'plist',
              'wsf',
              'svg'
          ],
          case_insensitive: true,
          unicodeRegex: true,
          contains: [
              {
                  className: 'meta',
                  begin: /<![a-z]/,
                  end: />/,
                  relevance: 10,
                  contains: [
                      XML_META_KEYWORDS,
                      QUOTE_META_STRING_MODE,
                      APOS_META_STRING_MODE,
                      XML_META_PAR_KEYWORDS,
                      {
                          begin: /\[/,
                          end: /\]/,
                          contains: [
                              {
                                  className: 'meta',
                                  begin: /<![a-z]/,
                                  end: />/,
                                  contains: [
                                      XML_META_KEYWORDS,
                                      XML_META_PAR_KEYWORDS,
                                      QUOTE_META_STRING_MODE,
                                      APOS_META_STRING_MODE
                                  ]
                              }
                          ]
                      }
                  ]
              },
              hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
              {
                  begin: /<!\[CDATA\[/,
                  end: /\]\]>/,
                  relevance: 10
              },
              XML_ENTITIES,
              // xml processing instructions
              {
                  className: 'meta',
                  end: /\?>/,
                  variants: [
                      {
                          begin: /<\?xml/,
                          relevance: 10,
                          contains: [
                              QUOTE_META_STRING_MODE
                          ]
                      },
                      {
                          begin: /<\?[a-z][a-z0-9]+/,
                      }
                  ]
              },
              {
                  className: 'tag',
                  /*
                  The lookahead pattern (?=...) ensures that 'begin' only matches
                  '<style' as a single word, followed by a whitespace or an
                  ending bracket.
                  */
                  begin: /<style(?=\s|>)/,
                  end: />/,
                  keywords: { name: 'style' },
                  contains: [TAG_INTERNALS],
                  starts: {
                      end: /<\/style>/,
                      returnEnd: true,
                      subLanguage: 'css'
                  }
              },
              {
                  className: 'tag',
                  // See the comment in the <style tag about the lookahead pattern
                  begin: /<script(?=\s|>)/,
                  end: />/,
                  keywords: { name: 'script' },
                  contains: [TAG_INTERNALS],
                  starts: {
                      end: /<\/script>/,
                      returnEnd: true,
                      subLanguage: 'javascript'
                  }
              },
              // we need this for now for jSX
              {
                  className: 'tag',
                  begin: /<>|<\/>/
              },
              // open tag
              {
                  className: 'tag',
                  begin: regex.concat(/</, regex.lookahead(regex.concat(TAG_NAME_RE, 
                  // <tag/>
                  // <tag>
                  // <tag ...
                  regex.either(/\/>/, />/, /\s/)))),
                  end: /\/?>/,
                  contains: [
                      {
                          className: 'name',
                          begin: TAG_NAME_RE,
                          relevance: 0,
                          starts: TAG_INTERNALS
                      }
                  ]
              },
              // close tag
              {
                  className: 'tag',
                  begin: regex.concat(/<\//, regex.lookahead(regex.concat(TAG_NAME_RE, />/))),
                  contains: [
                      {
                          className: 'name',
                          begin: TAG_NAME_RE,
                          relevance: 0
                      },
                      {
                          begin: />/,
                          relevance: 0,
                          endsParent: true
                      }
                  ]
              }
          ]
      };
  }
  module.exports = xml;

  }),
  (function (module, exports, require) {
  /*
  Language: YAML
  Description: Yet Another Markdown Language
  Author: Stefan Wienert <stwienert@gmail.com>
  Contributors: Carl Baxter <carl@cbax.tech>
  Requires: ruby.js
  Website: https://yaml.org
  Category: common, config
  */
  function yaml(hljs) {
      const LITERALS = 'true false yes no null';
      // YAML spec allows non-reserved URI characters in tags.
      const URI_CHARACTERS = '[\\w#;/?:@&=+$,.~*\'()[\\]]+';
      // Define keys as starting with a word character
      // ...containing word chars, spaces, colons, forward-slashes, hyphens and periods
      // ...and ending with a colon followed immediately by a space, tab or newline.
      // The YAML spec allows for much more than this, but this covers most use-cases.
      const KEY = {
          className: 'attr',
          variants: [
              // added brackets support and special char support
              { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
              {
                  begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
              },
              {
                  begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
              },
          ]
      };
      const TEMPLATE_VARIABLES = {
          className: 'template-variable',
          variants: [
              {
                  begin: /\{\{/,
                  end: /\}\}/
              },
              {
                  begin: /%\{/,
                  end: /\}/
              }
          ]
      };
      const SINGLE_QUOTE_STRING = {
          className: 'string',
          relevance: 0,
          begin: /'/,
          end: /'/,
          contains: [
              {
                  match: /''/,
                  scope: 'char.escape',
                  relevance: 0
              }
          ]
      };
      const STRING = {
          className: 'string',
          relevance: 0,
          variants: [
              {
                  begin: /"/,
                  end: /"/
              },
              { begin: /\S+/ }
          ],
          contains: [
              hljs.BACKSLASH_ESCAPE,
              TEMPLATE_VARIABLES
          ]
      };
      // Strings inside of value containers (objects) can't contain braces,
      // brackets, or commas
      const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
              {
                  begin: /'/,
                  end: /'/,
                  contains: [
                      {
                          begin: /''/,
                          relevance: 0
                      }
                  ]
              },
              {
                  begin: /"/,
                  end: /"/
              },
              { begin: /[^\s,{}[\]]+/ }
          ] });
      const DATE_RE = '[0-9]{4}(-[0-9][0-9]){0,2}';
      const TIME_RE = '([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?';
      const FRACTION_RE = '(\\.[0-9]*)?';
      const ZONE_RE = '([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?';
      const TIMESTAMP = {
          className: 'number',
          begin: '\\b' + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + '\\b'
      };
      const VALUE_CONTAINER = {
          end: ',',
          endsWithParent: true,
          excludeEnd: true,
          keywords: LITERALS,
          relevance: 0
      };
      const OBJECT = {
          begin: /\{/,
          end: /\}/,
          contains: [VALUE_CONTAINER],
          illegal: '\\n',
          relevance: 0
      };
      const ARRAY = {
          begin: '\\[',
          end: '\\]',
          contains: [VALUE_CONTAINER],
          illegal: '\\n',
          relevance: 0
      };
      const MODES = [
          KEY,
          {
              className: 'meta',
              begin: '^---\\s*$',
              relevance: 10
          },
          {
              // Blocks start with a | or > followed by a newline
              //
              // Indentation of subsequent lines must be the same to
              // be considered part of the block
              className: 'string',
              begin: '[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*'
          },
          {
              begin: '<%[%=-]?',
              end: '[%-]?%>',
              subLanguage: 'ruby',
              excludeBegin: true,
              excludeEnd: true,
              relevance: 0
          },
          {
              className: 'type',
              begin: '!\\w+!' + URI_CHARACTERS
          },
          // https://yaml.org/spec/1.2/spec.html#id2784064
          {
              className: 'type',
              begin: '!<' + URI_CHARACTERS + ">"
          },
          {
              className: 'type',
              begin: '!' + URI_CHARACTERS
          },
          {
              className: 'type',
              begin: '!!' + URI_CHARACTERS
          },
          {
              className: 'meta',
              begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$'
          },
          {
              className: 'meta',
              begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
          },
          {
              className: 'bullet',
              // TODO: remove |$ hack when we have proper look-ahead support
              begin: '-(?=[ ]|$)',
              relevance: 0
          },
          hljs.HASH_COMMENT_MODE,
          {
              beginKeywords: LITERALS,
              keywords: { literal: LITERALS }
          },
          TIMESTAMP,
          // numbers are any valid C-style number that
          // sit isolated from other words
          {
              className: 'number',
              begin: hljs.C_NUMBER_RE + '\\b',
              relevance: 0
          },
          OBJECT,
          ARRAY,
          SINGLE_QUOTE_STRING,
          STRING
      ];
      const VALUE_MODES = [...MODES];
      VALUE_MODES.pop();
      VALUE_MODES.push(CONTAINER_STRING);
      VALUE_CONTAINER.contains = VALUE_MODES;
      return {
          name: 'YAML',
          case_insensitive: true,
          aliases: ['yml'],
          contains: MODES
      };
  }
  module.exports = yaml;

  }),
  (function (module, exports, require) {
  "use strict";
  var __importDefault = (this && this.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.highlightCode = highlightCode;
  exports.detectLang = detectLang;
  exports.isMarkdown = isMarkdown;
  /**
   * 语法高亮：基于 highlight.js（内联 core + 按需注册语言），
   * 输出 HTML token 串，由 styles.ts 中的 hljs-* 主题类着色。
   */
  const core_1 = __importDefault(require(0));
  const bash_1 = __importDefault(require(1));
  const c_1 = __importDefault(require(2));
  const cpp_1 = __importDefault(require(3));
  const csharp_1 = __importDefault(require(4));
  const css_1 = __importDefault(require(5));
  const go_1 = __importDefault(require(6));
  const ini_1 = __importDefault(require(7));
  const java_1 = __importDefault(require(8));
  const javascript_1 = __importDefault(require(9));
  const json_1 = __importDefault(require(10));
  const kotlin_1 = __importDefault(require(11));
  const less_1 = __importDefault(require(12));
  const markdown_1 = __importDefault(require(13));
  const plaintext_1 = __importDefault(require(14));
  const python_1 = __importDefault(require(15));
  const rust_1 = __importDefault(require(16));
  const scss_1 = __importDefault(require(17));
  const sql_1 = __importDefault(require(18));
  const swift_1 = __importDefault(require(19));
  const typescript_1 = __importDefault(require(20));
  const xml_1 = __importDefault(require(21));
  const yaml_1 = __importDefault(require(22));
  core_1.default.registerLanguage('bash', bash_1.default);
  core_1.default.registerLanguage('c', c_1.default);
  core_1.default.registerLanguage('cpp', cpp_1.default);
  core_1.default.registerLanguage('csharp', csharp_1.default);
  core_1.default.registerLanguage('css', css_1.default);
  core_1.default.registerLanguage('go', go_1.default);
  core_1.default.registerLanguage('ini', ini_1.default);
  core_1.default.registerLanguage('java', java_1.default);
  core_1.default.registerLanguage('javascript', javascript_1.default);
  core_1.default.registerLanguage('json', json_1.default);
  core_1.default.registerLanguage('kotlin', kotlin_1.default);
  core_1.default.registerLanguage('less', less_1.default);
  core_1.default.registerLanguage('markdown', markdown_1.default);
  core_1.default.registerLanguage('plaintext', plaintext_1.default);
  core_1.default.registerLanguage('python', python_1.default);
  core_1.default.registerLanguage('rust', rust_1.default);
  core_1.default.registerLanguage('scss', scss_1.default);
  core_1.default.registerLanguage('sql', sql_1.default);
  core_1.default.registerLanguage('swift', swift_1.default);
  core_1.default.registerLanguage('typescript', typescript_1.default);
  core_1.default.registerLanguage('xml', xml_1.default);
  core_1.default.registerLanguage('yaml', yaml_1.default);
  /** 高亮整段代码并返回 HTML（未注册的语言回退 plaintext）。 */
  function highlightCode(code, lang) {
      const target = core_1.default.getLanguage(lang) !== undefined ? lang : 'plaintext';
      return core_1.default.highlight(code, { language: target }).value;
  }
  /**
   * 扩展名 → highlight.js 语言键。
   * 注意 markdown 在预览中走渲染视图（见 markdown.ts），源码视图仍用本映射。
   */
  function detectLang(name) {
      const dot = name.lastIndexOf('.');
      const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
      if (['js', 'mjs', 'cjs', 'jsx'].includes(ext))
          return 'javascript';
      if (['ts', 'tsx'].includes(ext))
          return 'typescript';
      if (ext === 'py')
          return 'python';
      if (ext === 'go')
          return 'go';
      if (ext === 'rs')
          return 'rust';
      if (ext === 'c' || ext === 'h')
          return 'c';
      if (['cpp', 'cc', 'cxx', 'hpp', 'hh'].includes(ext))
          return 'cpp';
      if (ext === 'cs')
          return 'csharp';
      if (ext === 'java')
          return 'java';
      if (ext === 'kt' || ext === 'kts')
          return 'kotlin';
      if (ext === 'swift')
          return 'swift';
      if (ext === 'css')
          return 'css';
      if (['scss', 'sass'].includes(ext))
          return 'scss';
      if (ext === 'less')
          return 'less';
      if (['html', 'htm', 'vue', 'svelte'].includes(ext))
          return 'xml';
      if (['json', 'jsonc'].includes(ext))
          return 'json';
      if (['yaml', 'yml', 'toml'].includes(ext))
          return 'yaml';
      if (['sh', 'bash', 'zsh', 'fish'].includes(ext))
          return 'bash';
      if (ext === 'sql')
          return 'sql';
      if (['md', 'markdown', 'mdown'].includes(ext))
          return 'markdown';
      if (['xml', 'plist', 'svg'].includes(ext))
          return 'xml';
      if (['ini', 'cfg', 'conf', 'env', 'properties'].includes(ext))
          return 'ini';
      return 'plaintext';
  }
  /** 判断文件是否为 Markdown（预览走渲染视图）。 */
  function isMarkdown(name) {
      return detectLang(name) === 'markdown';
  }

  }),
  (function (module, exports, require) {
  "use strict";
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || (function () {
      var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function (o) {
              var ar = [];
              for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
              return ar;
          };
          return ownKeys(o);
      };
      return function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          __setModuleDefault(result, mod);
          return result;
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.folderSvg = folderSvg;
  exports.fileGlyph = fileGlyph;
  exports.fileIcon = fileIcon;
  /**
   * 文件类型图标：文件夹 + “文件页轮廓 + 彩色类型缩写”的 VS Code 风格图标。
   */
  const React = __importStar(require("react"));
  function folderSvg(className) {
      return React.createElement('svg', { className, width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true }, React.createElement('path', {
          d: 'M1.5 3.5A1.5 1.5 0 0 1 3 2h3.2c.4 0 .78.16 1.06.44L8.5 3.7h4.5A1.5 1.5 0 0 1 14.5 5.2v7.3a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5z',
          fill: 'currentColor',
      }));
  }
  function glyph(label, color) {
      return { label, color };
  }
  /** 按扩展名（或特殊文件名）映射类型缩写与主题色。 */
  function fileGlyph(name) {
      const dot = name.lastIndexOf('.');
      const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext))
          return glyph('IMG', '#4fc1e9');
      if (['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'tgz'].includes(ext))
          return glyph('ZIP', '#d39a62');
      if (['json', 'jsonl', 'jsonc'].includes(ext))
          return glyph('{}', '#cbcb41');
      if (['yaml', 'yml', 'toml'].includes(ext))
          return glyph('YM', '#a181f7');
      if (['xml', 'plist'].includes(ext))
          return glyph('XM', '#e8995e');
      if (['md', 'markdown', 'mdown'].includes(ext))
          return glyph('MD', '#519aba');
      if (['txt', 'text', 'log'].includes(ext))
          return glyph('TX', '#8b9bb4');
      if (['js', 'mjs', 'cjs'].includes(ext))
          return glyph('JS', '#f7df1e');
      if (ext === 'jsx')
          return glyph('JX', '#f7df1e');
      if (ext === 'ts')
          return glyph('TS', '#3178c6');
      if (ext === 'tsx')
          return glyph('T+', '#3178c6');
      if (ext === 'py')
          return glyph('PY', '#3776ab');
      if (ext === 'go')
          return glyph('GO', '#00add8');
      if (ext === 'rs')
          return glyph('RS', '#dea584');
      if (ext === 'java')
          return glyph('JA', '#b07219');
      if (ext === 'kt' || ext === 'kts')
          return glyph('KT', '#7f52ff');
      if (ext === 'c' || ext === 'h')
          return glyph('C', '#a8b9cc');
      if (['cpp', 'cc', 'cxx', 'hpp', 'hh'].includes(ext))
          return glyph('C+', '#a8b9cc');
      if (ext === 'cs')
          return glyph('C#', '#68217a');
      if (ext === 'rb')
          return glyph('RB', '#cc342d');
      if (ext === 'php')
          return glyph('PH', '#777bb4');
      if (ext === 'swift')
          return glyph('SW', '#ff7f50');
      if (['sh', 'bash', 'zsh', 'fish'].includes(ext))
          return glyph('SH', '#89e051');
      if (ext === 'sql')
          return glyph('SQ', '#e38c00');
      if (ext === 'vue')
          return glyph('VU', '#42b883');
      if (ext === 'svelte')
          return glyph('SV', '#ff3e00');
      if (ext === 'css')
          return glyph('CS', '#42a5f5');
      if (['scss', 'sass', 'less'].includes(ext))
          return glyph('SC', '#c6538c');
      if (ext === 'html' || ext === 'htm')
          return glyph('HT', '#e44d26');
      if (['ini', 'cfg', 'conf', 'env', 'properties'].includes(ext))
          return glyph('CF', '#a181f7');
      if (ext === 'lock')
          return glyph('LK', '#8b8b8b');
      if (ext === 'pdf')
          return glyph('PD', '#d53f3f');
      if (['doc', 'docx'].includes(ext))
          return glyph('DO', '#2b579a');
      if (['xls', 'xlsx', 'csv'].includes(ext))
          return glyph('XL', '#217346');
      if (['ppt', 'pptx'].includes(ext))
          return glyph('PP', '#d24726');
      if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext))
          return glyph('AU', '#a56cc1');
      if (['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext))
          return glyph('VI', '#7b52ab');
      if (name === 'Dockerfile')
          return glyph('DK', '#2496ed');
      if (name === 'LICENSE' || name === 'LICENSE.md')
          return glyph('LI', '#8b9bb4');
      return glyph('', '#8b9bb4');
  }
  function fileIcon(name) {
      const g = fileGlyph(name);
      return React.createElement('svg', { className: 'dshfm-icon', width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true }, React.createElement('path', {
          d: 'M4.5 1.5h4.4l3.6 3.6v8.9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z',
          fill: 'none', stroke: 'currentColor', strokeWidth: 1.2,
      }), g.label === '' ? null : React.createElement('text', {
          x: 8, y: 11.6, textAnchor: 'middle', fontSize: 5.4, fontWeight: 700, fill: g.color,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }, g.label));
  }

  }),
  (function (module, exports, require) {
  /*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
  'use strict';
  function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++)
          n[e] = r[e];
      return n;
  }
  function _arrayWithHoles(r) {
      if (Array.isArray(r))
          return r;
  }
  function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
          var e, n, i, u, a = [], f = true, o = false;
          try {
              if (i = (t = t.call(r)).next, 0 === l)
                  ;
              else
                  for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0)
                      ;
          }
          catch (r) {
              o = true, n = r;
          }
          finally {
              try {
                  if (!f && null != t.return && (u = t.return(), Object(u) !== u))
                      return;
              }
              finally {
                  if (o)
                      throw n;
              }
          }
          return a;
      }
  }
  function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
      return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
      if (r) {
          if ("string" == typeof r)
              return _arrayLikeToArray(r, a);
          var t = {}.toString.call(r).slice(8, -1);
          return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
  }
  const entries = Object.entries, setPrototypeOf = Object.setPrototypeOf, isFrozen = Object.isFrozen, getPrototypeOf = Object.getPrototypeOf, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  let freeze = Object.freeze, seal = Object.seal, create = Object.create; // eslint-disable-line import/no-mutable-exports
  let _ref = typeof Reflect !== 'undefined' && Reflect, apply = _ref.apply, construct = _ref.construct;
  if (!freeze) {
      freeze = function freeze(x) {
          return x;
      };
  }
  if (!seal) {
      seal = function seal(x) {
          return x;
      };
  }
  if (!apply) {
      apply = function apply(func, thisArg) {
          for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
          }
          return func.apply(thisArg, args);
      };
  }
  if (!construct) {
      construct = function construct(Func) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
          }
          return new Func(...args);
      };
  }
  const arrayForEach = unapply(Array.prototype.forEach);
  const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
  const arrayPop = unapply(Array.prototype.pop);
  const arrayPush = unapply(Array.prototype.push);
  const arraySplice = unapply(Array.prototype.splice);
  const arrayIsArray = Array.isArray;
  const stringToLowerCase = unapply(String.prototype.toLowerCase);
  const stringToString = unapply(String.prototype.toString);
  const stringMatch = unapply(String.prototype.match);
  const stringReplace = unapply(String.prototype.replace);
  const stringIndexOf = unapply(String.prototype.indexOf);
  const stringTrim = unapply(String.prototype.trim);
  const numberToString = unapply(Number.prototype.toString);
  const booleanToString = unapply(Boolean.prototype.toString);
  const bigintToString = typeof BigInt === 'undefined' ? null : unapply(BigInt.prototype.toString);
  const symbolToString = typeof Symbol === 'undefined' ? null : unapply(Symbol.prototype.toString);
  const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
  const objectToString = unapply(Object.prototype.toString);
  const regExpTest = unapply(RegExp.prototype.test);
  const typeErrorCreate = unconstruct(TypeError);
  /**
   * Creates a new function that calls the given function with a specified thisArg and arguments.
   *
   * @param func - The function to be wrapped and called.
   * @returns A new function that calls the given function with a specified thisArg and arguments.
   */
  function unapply(func) {
      return function (thisArg) {
          if (thisArg instanceof RegExp) {
              thisArg.lastIndex = 0;
          }
          for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
          }
          return apply(func, thisArg, args);
      };
  }
  /**
   * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
   *
   * @param func - The constructor function to be wrapped and called.
   * @returns A new function that constructs an instance of the given constructor function with the provided arguments.
   */
  function unconstruct(Func) {
      return function () {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
          }
          return construct(Func, args);
      };
  }
  /**
   * Add properties to a lookup table
   *
   * @param set - The set to which elements will be added.
   * @param array - The array containing elements to be added to the set.
   * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
   * @returns The modified set with added elements.
   */
  function addToSet(set, array) {
      let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
      if (setPrototypeOf) {
          // Make 'in' and truthy checks like Boolean(set.constructor)
          // independent of any properties defined on Object.prototype.
          // Prevent prototype setters from intercepting set as a this value.
          setPrototypeOf(set, null);
      }
      if (!arrayIsArray(array)) {
          return set;
      }
      let l = array.length;
      while (l--) {
          let element = array[l];
          if (typeof element === 'string') {
              const lcElement = transformCaseFunc(element);
              if (lcElement !== element) {
                  // Config presets (e.g. tags.js, attrs.js) are immutable.
                  if (!isFrozen(array)) {
                      array[l] = lcElement;
                  }
                  element = lcElement;
              }
          }
          set[element] = true;
      }
      return set;
  }
  /**
   * Clean up an array to harden against CSPP
   *
   * @param array - The array to be cleaned.
   * @returns The cleaned version of the array
   */
  function cleanArray(array) {
      for (let index = 0; index < array.length; index++) {
          const isPropertyExist = objectHasOwnProperty(array, index);
          if (!isPropertyExist) {
              array[index] = null;
          }
      }
      return array;
  }
  /**
   * Shallow clone an object
   *
   * @param object - The object to be cloned.
   * @returns A new object that copies the original.
   */
  function clone(object) {
      const newObject = create(null);
      for (const _ref2 of entries(object)) {
          var _ref3 = _slicedToArray(_ref2, 2);
          const property = _ref3[0];
          const value = _ref3[1];
          const isPropertyExist = objectHasOwnProperty(object, property);
          if (isPropertyExist) {
              if (arrayIsArray(value)) {
                  newObject[property] = cleanArray(value);
              }
              else if (value && typeof value === 'object' && value.constructor === Object) {
                  newObject[property] = clone(value);
              }
              else {
                  newObject[property] = value;
              }
          }
      }
      return newObject;
  }
  /**
   * Convert non-node values into strings without depending on direct property access.
   *
   * @param value - The value to stringify.
   * @returns A string representation of the provided value.
   */
  function stringifyValue(value) {
      switch (typeof value) {
          case 'string':
              {
                  return value;
              }
          case 'number':
              {
                  return numberToString(value);
              }
          case 'boolean':
              {
                  return booleanToString(value);
              }
          case 'bigint':
              {
                  return bigintToString ? bigintToString(value) : '0';
              }
          case 'symbol':
              {
                  return symbolToString ? symbolToString(value) : 'Symbol()';
              }
          case 'undefined':
              {
                  return objectToString(value);
              }
          case 'function':
          case 'object':
              {
                  if (value === null) {
                      return objectToString(value);
                  }
                  const valueAsRecord = value;
                  const valueToString = lookupGetter(valueAsRecord, 'toString');
                  if (typeof valueToString === 'function') {
                      const stringified = valueToString(valueAsRecord);
                      return typeof stringified === 'string' ? stringified : objectToString(stringified);
                  }
                  return objectToString(value);
              }
          default:
              {
                  return objectToString(value);
              }
      }
  }
  /**
   * This method automatically checks if the prop is function or getter and behaves accordingly.
   *
   * @param object - The object to look up the getter function in its prototype chain.
   * @param prop - The property name for which to find the getter function.
   * @returns The getter function found in the prototype chain or a fallback function.
   */
  function lookupGetter(object, prop) {
      while (object !== null) {
          const desc = getOwnPropertyDescriptor(object, prop);
          if (desc) {
              if (desc.get) {
                  return unapply(desc.get);
              }
              if (typeof desc.value === 'function') {
                  return unapply(desc.value);
              }
          }
          object = getPrototypeOf(object);
      }
      function fallbackValue() {
          return null;
      }
      return fallbackValue;
  }
  function isRegex(value) {
      try {
          regExpTest(value, '');
          return true;
      }
      catch (_unused) {
          return false;
      }
  }
  const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'search', 'section', 'select', 'shadow', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
  const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'enterkeyhint', 'exportparts', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'inputmode', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'part', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
  const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);
  // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.
  const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
  const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);
  // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.
  const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
  const text = freeze(['#text']);
  const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'command', 'commandfor', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'exportparts', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inert', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'part', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'slot', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns']);
  const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dominant-baseline', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'mask-type', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-orientation', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
  const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnalign', 'columnlines', 'columnspacing', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lquote', 'lspace', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
  const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);
  const MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
  const ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
  const TMPLIT_EXPR = seal(/\${[\w\W]*/g);
  const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
  const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );
  const DOCTYPE_NAME = seal(/^html$/i);
  const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
  // Markup-significant character probes used by _sanitizeElements.
  // Shared module-level instances are safe despite the sticky /g flags:
  // unapply() resets lastIndex for RegExp receivers before every call.
  const ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
  const COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
  const FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
  const SELF_CLOSING_TAG = seal(/\/>/i);
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  const NODE_TYPE = {
      element: 1,
      attribute: 2,
      text: 3,
      cdataSection: 4,
      entityReference: 5,
      // Deprecated
      entityNode: 6,
      // Deprecated
      processingInstruction: 7,
      comment: 8,
      document: 9,
      documentType: 10,
      documentFragment: 11,
      notation: 12 // Deprecated
  };
  const getGlobal = function getGlobal() {
      return typeof window === 'undefined' ? null : window;
  };
  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param trustedTypes The policy factory.
   * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
   * @return The policy created (or null, if Trusted Types
   * are not supported or creating the policy failed).
   */
  const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
      if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
          return null;
      }
      // Allow the callers to control the unique policy name
      // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
      // Policy creation with duplicate names throws in Trusted Types.
      let suffix = null;
      const ATTR_NAME = 'data-tt-policy-suffix';
      if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
          suffix = purifyHostElement.getAttribute(ATTR_NAME);
      }
      const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
      try {
          return trustedTypes.createPolicy(policyName, {
              createHTML(html) {
                  return html;
              },
              createScriptURL(scriptUrl) {
                  return scriptUrl;
              }
          });
      }
      catch (_) {
          // Policy creation failed (most likely another DOMPurify script has
          // already run). Skip creating the policy, as this will only cause errors
          // if TT are enforced.
          console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
          return null;
      }
  };
  const _createHooksMap = function _createHooksMap() {
      return {
          afterSanitizeAttributes: [],
          afterSanitizeElements: [],
          afterSanitizeShadowDOM: [],
          beforeSanitizeAttributes: [],
          beforeSanitizeElements: [],
          beforeSanitizeShadowDOM: [],
          uponSanitizeAttribute: [],
          uponSanitizeElement: [],
          uponSanitizeShadowNode: []
      };
  };
  /**
   * Resolve a set-valued configuration option: a fresh set built from
   * cfg[key] when it is an own array property (seeded with a clone of
   * options.base when given, case-normalized via options.transform),
   * the fallback set otherwise.
   *
   * @param cfg the cloned, prototype-free configuration object
   * @param key the configuration property to read
   * @param fallback the set to use when the option is absent or not an array
   * @param options transform and optional base set to merge into
   * @returns the resolved set
   */
  const _resolveSetOption = function _resolveSetOption(cfg, key, fallback, options) {
      return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
  };
  function createDOMPurify() {
      let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
      const DOMPurify = root => createDOMPurify(root);
      DOMPurify.version = '3.4.13';
      DOMPurify.removed = [];
      if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document || !window.Element) {
          // Not running in a browser, provide a factory function
          // so that you can pass your own Window
          DOMPurify.isSupported = false;
          return DOMPurify;
      }
      let document = window.document;
      const originalDocument = document;
      const currentScript = originalDocument.currentScript;
      window.DocumentFragment;
      const HTMLTemplateElement = window.HTMLTemplateElement, Node = window.Node, Element = window.Element, NodeFilter = window.NodeFilter, _window$NamedNodeMap = window.NamedNodeMap;
      _window$NamedNodeMap === void 0 ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap;
      window.HTMLFormElement;
      const DOMParser = window.DOMParser, trustedTypes = window.trustedTypes;
      const ElementPrototype = Element.prototype;
      const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
      const remove = lookupGetter(ElementPrototype, 'remove');
      const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
      const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
      const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
      const getShadowRoot = lookupGetter(ElementPrototype, 'shadowRoot');
      const getAttributes = lookupGetter(ElementPrototype, 'attributes');
      const getNodeType = Node && Node.prototype ? lookupGetter(Node.prototype, 'nodeType') : null;
      const getNodeName = Node && Node.prototype ? lookupGetter(Node.prototype, 'nodeName') : null;
      const getOwnerDocument = Node && Node.prototype ? lookupGetter(Node.prototype, 'ownerDocument') : null;
      // As per issue #47, the web-components registry is inherited by a
      // new document created via createHTMLDocument. As per the spec
      // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
      // a new empty registry is used when creating a template contents owner
      // document, so we use that as our parent document to ensure nothing
      // is inherited.
      if (typeof HTMLTemplateElement === 'function') {
          const template = document.createElement('template');
          if (template.content && template.content.ownerDocument) {
              document = template.content.ownerDocument;
          }
      }
      let trustedTypesPolicy;
      let emptyHTML = '';
      // The instance's own internal Trusted Types policy. Unlike a caller-supplied
      // `TRUSTED_TYPES_POLICY`, this is created at most once — Trusted Types throws
      // on duplicate policy names — and is the only policy allowed to persist
      // across configurations and survive `clearConfig()`.
      let defaultTrustedTypesPolicy;
      let defaultTrustedTypesPolicyResolved = false;
      // Tracks whether we are already inside a call to the configured Trusted Types
      // policy (`createHTML` or `createScriptURL`). If a supplied policy callback
      // itself calls `DOMPurify.sanitize` (the cause of #1422), `sanitize` would
      // re-enter the policy and recurse until the stack overflows. We detect that
      // re-entry and throw a clear, actionable error instead. The guard is shared
      // across both callbacks, because either one re-entering `sanitize` triggers
      // the same unbounded recursion.
      let IN_TRUSTED_TYPES_POLICY = 0;
      const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy() {
          if (IN_TRUSTED_TYPES_POLICY > 0) {
              throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or ' + 'createScriptURL) must not call DOMPurify.sanitize, as that causes ' + 'infinite recursion. Do not pass a policy whose callbacks wrap ' + 'DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted ' + 'Types" section of the README.');
          }
      };
      const _createTrustedHTML = function _createTrustedHTML(html) {
          _assertNotInTrustedTypesPolicy();
          IN_TRUSTED_TYPES_POLICY++;
          try {
              return trustedTypesPolicy.createHTML(html);
          }
          finally {
              IN_TRUSTED_TYPES_POLICY--;
          }
      };
      const _createTrustedScriptURL = function _createTrustedScriptURL(scriptUrl) {
          _assertNotInTrustedTypesPolicy();
          IN_TRUSTED_TYPES_POLICY++;
          try {
              return trustedTypesPolicy.createScriptURL(scriptUrl);
          }
          finally {
              IN_TRUSTED_TYPES_POLICY--;
          }
      };
      // Lazily resolve (and cache) the instance's internal default policy.
      // Resolution is attempted at most once: a successful `createPolicy` cannot be
      // repeated (Trusted Types throws on duplicate names), and a failed or
      // unsupported attempt must not be retried on every parse.
      const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy() {
          if (!defaultTrustedTypesPolicyResolved) {
              defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
              defaultTrustedTypesPolicyResolved = true;
          }
          return defaultTrustedTypesPolicy;
      };
      const _document = document, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
      const importNode = originalDocument.importNode;
      let hooks = _createHooksMap();
      /**
       * Expose whether this browser supports running the full DOMPurify.
       */
      DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
      const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
      let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
      /**
       * We consider the elements and attributes below to be safe. Ideally
       * don't add any new ones but feel free to remove unwanted ones.
       */
      /* allowed element names */
      let ALLOWED_TAGS = null;
      const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
      /* Allowed attribute names */
      let ALLOWED_ATTR = null;
      const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
      /*
       * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
       * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
       * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
       * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
       */
      let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
          tagNameCheck: {
              writable: true,
              configurable: false,
              enumerable: true,
              value: null
          },
          attributeNameCheck: {
              writable: true,
              configurable: false,
              enumerable: true,
              value: null
          },
          allowCustomizedBuiltInElements: {
              writable: true,
              configurable: false,
              enumerable: true,
              value: false
          }
      }));
      /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
      let FORBID_TAGS = null;
      /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
      let FORBID_ATTR = null;
      /* Config object to store ADD_TAGS/ADD_ATTR functions (when used as functions) */
      const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
          tagCheck: {
              writable: true,
              configurable: false,
              enumerable: true,
              value: null
          },
          attributeCheck: {
              writable: true,
              configurable: false,
              enumerable: true,
              value: null
          }
      }));
      /* Decide if ARIA attributes are okay */
      let ALLOW_ARIA_ATTR = true;
      /* Decide if custom data attributes are okay */
      let ALLOW_DATA_ATTR = true;
      /* Decide if unknown protocols are okay */
      let ALLOW_UNKNOWN_PROTOCOLS = false;
      /* Decide if self-closing tags in attributes are allowed.
       * Usually removed due to a mXSS issue in jQuery 3.0 */
      let ALLOW_SELF_CLOSE_IN_ATTR = true;
      /* Output should be safe for common template engines.
       * This means, DOMPurify removes data attributes, mustaches and ERB
       */
      let SAFE_FOR_TEMPLATES = false;
      /* Output should be safe even for XML used within HTML and alike.
       * This means, DOMPurify removes comments when containing risky content.
       */
      let SAFE_FOR_XML = true;
      /* Decide if document with <html>... should be returned */
      let WHOLE_DOCUMENT = false;
      /* Track whether config is already set on this instance of DOMPurify. */
      let SET_CONFIG = false;
      /* Pristine allowlist bindings captured at setConfig() time. On the
       * persistent-config path sanitize() restores the sets from these before
       * the per-walk hook clone-guard, so a hook's in-call widening cannot
       * carry across calls. Null until setConfig() is called; reset by
       * clearConfig(). */
      let SET_CONFIG_ALLOWED_TAGS = null;
      let SET_CONFIG_ALLOWED_ATTR = null;
      /* Decide if all elements (e.g. style, script) must be children of
       * document.body. By default, browsers might move them to document.head */
      let FORCE_BODY = false;
      /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
       * string (or a TrustedHTML object if Trusted Types are supported).
       * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
       */
      let RETURN_DOM = false;
      /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
       * string  (or a TrustedHTML object if Trusted Types are supported) */
      let RETURN_DOM_FRAGMENT = false;
      /* Try to return a Trusted Type object instead of a string, return a string in
       * case Trusted Types are not supported  */
      let RETURN_TRUSTED_TYPE = false;
      /* Output should be free from DOM clobbering attacks?
       * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
       */
      let SANITIZE_DOM = true;
      /* Achieve full DOM Clobbering protection by isolating the namespace of named
       * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
       *
       * HTML/DOM spec rules that enable DOM Clobbering:
       *   - Named Access on Window (§7.3.3)
       *   - DOM Tree Accessors (§3.1.5)
       *   - Form Element Parent-Child Relations (§4.10.3)
       *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
       *   - HTMLCollection (§4.2.10.2)
       *
       * Namespace isolation is implemented by prefixing `id` and `name` attributes
       * with a constant string, i.e., `user-content-`
       */
      let SANITIZE_NAMED_PROPS = false;
      const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
      /* Keep element content when removing element? */
      let KEEP_CONTENT = true;
      /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
       * of importing it into a new Document and returning a sanitized copy */
      let IN_PLACE = false;
      /* Allow usage of profiles like html, svg and mathMl */
      let USE_PROFILES = {};
      /* Tags to ignore content of when KEEP_CONTENT is true */
      let FORBID_CONTENTS = null;
      const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script',
          // <selectedcontent> mirrors the selected <option>'s subtree, cloned by
          // the UA (customizable <select>) — including any on* handlers — and the
          // engine re-mirrors synchronously whenever a removal changes which
          // option/selectedcontent is current, even inside DOMPurify's inert
          // DOMParser document. Hoisting its children on removal re-inserts a fresh
          // mirror target ahead of the walk, which the engine refills, looping
          // forever (DoS) and amplifying output. Dropping its content on removal
          // (rather than hoisting) breaks that cascade; the content is a duplicate
          // of the option, which is sanitized on its own. See campaign-3 F1/F6.
          'selectedcontent', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
      /* Tags that are safe for data: URIs */
      let DATA_URI_TAGS = null;
      const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
      /* Attributes safe for values like "javascript:" */
      let URI_SAFE_ATTRIBUTES = null;
      const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
      const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
      const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
      const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
      /* Document namespace */
      let NAMESPACE = HTML_NAMESPACE;
      let IS_EMPTY_INPUT = false;
      /* Allowed XHTML+XML namespaces */
      let ALLOWED_NAMESPACES = null;
      const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
      const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze(['mi', 'mo', 'mn', 'ms', 'mtext']);
      let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
      const DEFAULT_HTML_INTEGRATION_POINTS = freeze(['annotation-xml']);
      let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
      // Certain elements are allowed in both SVG and HTML
      // namespace. We need to specify them explicitly
      // so that they don't get erroneously deleted from
      // HTML namespace.
      const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
      /* Parsing of strict XHTML documents */
      let PARSER_MEDIA_TYPE = null;
      const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
      const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
      let transformCaseFunc = null;
      /* Keep a reference to config to pass to hooks */
      let CONFIG = null;
      /* Ideally, do not touch anything below this line */
      /* ______________________________________________ */
      const formElement = document.createElement('form');
      const isRegexOrFunction = function isRegexOrFunction(testValue) {
          return testValue instanceof RegExp || testValue instanceof Function;
      };
      /**
       * _parseConfig
       *
       * @param cfg optional config literal
       */
      // eslint-disable-next-line complexity
      const _parseConfig = function _parseConfig() {
          let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          if (CONFIG && CONFIG === cfg) {
              return;
          }
          /* Shield configuration object from tampering */
          if (!cfg || typeof cfg !== 'object') {
              cfg = {};
          }
          /* Shield configuration object from prototype pollution */
          cfg = clone(cfg);
          PARSER_MEDIA_TYPE =
              // eslint-disable-next-line unicorn/prefer-includes
              SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
          // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
          transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
          /* Set configuration parameters */
          ALLOWED_TAGS = _resolveSetOption(cfg, 'ALLOWED_TAGS', DEFAULT_ALLOWED_TAGS, {
              transform: transformCaseFunc
          });
          ALLOWED_ATTR = _resolveSetOption(cfg, 'ALLOWED_ATTR', DEFAULT_ALLOWED_ATTR, {
              transform: transformCaseFunc
          });
          ALLOWED_NAMESPACES = _resolveSetOption(cfg, 'ALLOWED_NAMESPACES', DEFAULT_ALLOWED_NAMESPACES, {
              transform: stringToString
          });
          URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, 'ADD_URI_SAFE_ATTR', DEFAULT_URI_SAFE_ATTRIBUTES, {
              transform: transformCaseFunc,
              base: DEFAULT_URI_SAFE_ATTRIBUTES
          });
          DATA_URI_TAGS = _resolveSetOption(cfg, 'ADD_DATA_URI_TAGS', DEFAULT_DATA_URI_TAGS, {
              transform: transformCaseFunc,
              base: DEFAULT_DATA_URI_TAGS
          });
          FORBID_CONTENTS = _resolveSetOption(cfg, 'FORBID_CONTENTS', DEFAULT_FORBID_CONTENTS, {
              transform: transformCaseFunc
          });
          FORBID_TAGS = _resolveSetOption(cfg, 'FORBID_TAGS', clone({}), {
              transform: transformCaseFunc
          });
          FORBID_ATTR = _resolveSetOption(cfg, 'FORBID_ATTR', clone({}), {
              transform: transformCaseFunc
          });
          USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === 'object' ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
          ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
          ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
          ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
          ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
          SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
          SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
          WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
          RETURN_DOM = cfg.RETURN_DOM || false; // Default false
          RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
          RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
          FORCE_BODY = cfg.FORCE_BODY || false; // Default false
          SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
          SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
          KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
          IN_PLACE = cfg.IN_PLACE || false; // Default false
          IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI; // Default regexp
          NAMESPACE = typeof cfg.NAMESPACE === 'string' ? cfg.NAMESPACE : HTML_NAMESPACE; // Default HTML namespace
          MATHML_TEXT_INTEGRATION_POINTS = objectHasOwnProperty(cfg, 'MATHML_TEXT_INTEGRATION_POINTS') && cfg.MATHML_TEXT_INTEGRATION_POINTS && typeof cfg.MATHML_TEXT_INTEGRATION_POINTS === 'object' ? clone(cfg.MATHML_TEXT_INTEGRATION_POINTS) : addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS); // Default built-in map
          HTML_INTEGRATION_POINTS = objectHasOwnProperty(cfg, 'HTML_INTEGRATION_POINTS') && cfg.HTML_INTEGRATION_POINTS && typeof cfg.HTML_INTEGRATION_POINTS === 'object' ? clone(cfg.HTML_INTEGRATION_POINTS) : addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS); // Default built-in map
          const customElementHandling = objectHasOwnProperty(cfg, 'CUSTOM_ELEMENT_HANDLING') && cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING === 'object' ? clone(cfg.CUSTOM_ELEMENT_HANDLING) : create(null);
          CUSTOM_ELEMENT_HANDLING = create(null);
          if (objectHasOwnProperty(customElementHandling, 'tagNameCheck') && isRegexOrFunction(customElementHandling.tagNameCheck)) {
              CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck; // Default undefined
          }
          if (objectHasOwnProperty(customElementHandling, 'attributeNameCheck') && isRegexOrFunction(customElementHandling.attributeNameCheck)) {
              CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck; // Default undefined
          }
          if (objectHasOwnProperty(customElementHandling, 'allowCustomizedBuiltInElements') && typeof customElementHandling.allowCustomizedBuiltInElements === 'boolean') {
              CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements; // Default undefined
          }
          seal(CUSTOM_ELEMENT_HANDLING);
          if (SAFE_FOR_TEMPLATES) {
              ALLOW_DATA_ATTR = false;
          }
          if (RETURN_DOM_FRAGMENT) {
              RETURN_DOM = true;
          }
          /* Parse profile info */
          if (USE_PROFILES) {
              ALLOWED_TAGS = addToSet({}, text);
              ALLOWED_ATTR = create(null);
              if (USE_PROFILES.html === true) {
                  addToSet(ALLOWED_TAGS, html$1);
                  addToSet(ALLOWED_ATTR, html);
              }
              if (USE_PROFILES.svg === true) {
                  addToSet(ALLOWED_TAGS, svg$1);
                  addToSet(ALLOWED_ATTR, svg);
                  addToSet(ALLOWED_ATTR, xml);
              }
              if (USE_PROFILES.svgFilters === true) {
                  addToSet(ALLOWED_TAGS, svgFilters);
                  addToSet(ALLOWED_ATTR, svg);
                  addToSet(ALLOWED_ATTR, xml);
              }
              if (USE_PROFILES.mathMl === true) {
                  addToSet(ALLOWED_TAGS, mathMl$1);
                  addToSet(ALLOWED_ATTR, mathMl);
                  addToSet(ALLOWED_ATTR, xml);
              }
          }
          /* Always reset function-based ADD_TAGS / ADD_ATTR checks to prevent
           * leaking across calls when switching from function to array config */
          EXTRA_ELEMENT_HANDLING.tagCheck = null;
          EXTRA_ELEMENT_HANDLING.attributeCheck = null;
          /* Merge configuration parameters */
          if (objectHasOwnProperty(cfg, 'ADD_TAGS')) {
              if (typeof cfg.ADD_TAGS === 'function') {
                  EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
              }
              else if (arrayIsArray(cfg.ADD_TAGS)) {
                  if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
                      ALLOWED_TAGS = clone(ALLOWED_TAGS);
                  }
                  addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
              }
          }
          if (objectHasOwnProperty(cfg, 'ADD_ATTR')) {
              if (typeof cfg.ADD_ATTR === 'function') {
                  EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
              }
              else if (arrayIsArray(cfg.ADD_ATTR)) {
                  if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
                      ALLOWED_ATTR = clone(ALLOWED_ATTR);
                  }
                  addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
              }
          }
          if (objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') && arrayIsArray(cfg.ADD_URI_SAFE_ATTR)) {
              addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
          }
          if (objectHasOwnProperty(cfg, 'FORBID_CONTENTS') && arrayIsArray(cfg.FORBID_CONTENTS)) {
              if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
                  FORBID_CONTENTS = clone(FORBID_CONTENTS);
              }
              addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
          }
          if (objectHasOwnProperty(cfg, 'ADD_FORBID_CONTENTS') && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
              if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
                  FORBID_CONTENTS = clone(FORBID_CONTENTS);
              }
              addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
          }
          /* Add #text in case KEEP_CONTENT is set to true */
          if (KEEP_CONTENT) {
              ALLOWED_TAGS['#text'] = true;
          }
          /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
          if (WHOLE_DOCUMENT) {
              addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
          }
          /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
          if (ALLOWED_TAGS.table) {
              addToSet(ALLOWED_TAGS, ['tbody']);
              delete FORBID_TAGS.tbody;
          }
          // Re-derive the active Trusted Types policy from this configuration on
          // every parse. The active policy must never be sticky closure state that
          // outlives the config that set it: a caller-supplied policy left in place
          // after `clearConfig()` — or after a later call that supplied none, or
          // `TRUSTED_TYPES_POLICY: null` — could sign a subsequent "default"
          // `RETURN_TRUSTED_TYPE` result with a foreign, possibly unsafe policy.
          // See GHSA-vxr8-fq34-vvx9.
          if (cfg.TRUSTED_TYPES_POLICY) {
              if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
                  throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
              }
              if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
                  throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
              }
              // A caller-supplied policy applies to this configuration only.
              const previousTrustedTypesPolicy = trustedTypesPolicy;
              trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
              // Sign local variables required by `sanitize`. If the supplied policy's
              // `createHTML` is circular (i.e. it calls `DOMPurify.sanitize`), this
              // throws via the re-entrancy guard. Restore the previous policy first so
              // the instance is not left in a poisoned state. See #1422.
              try {
                  emptyHTML = _createTrustedHTML('');
              }
              catch (error) {
                  trustedTypesPolicy = previousTrustedTypesPolicy;
                  throw error;
              }
          }
          else if (cfg.TRUSTED_TYPES_POLICY === null) {
              // Explicit opt-out for this call: perform no Trusted Types signing and
              // create nothing (so a strict `trusted-types` CSP that disallows a
              // `dompurify` policy can still call `sanitize` from inside its own
              // policy — see #1422). Resetting to `undefined` rather than a sticky
              // `null` also drops any previously retained caller policy, so it cannot
              // resurface on a later call, while still allowing the next config-less
              // call to restore the internal default policy. See GHSA-vxr8-fq34-vvx9.
              trustedTypesPolicy = undefined;
              emptyHTML = '';
          }
          else {
              // No policy supplied: keep the currently active policy if one is set — a
              // previously supplied policy is intentionally sticky across config-less
              // calls — otherwise fall back to the instance's own internal policy,
              // created at most once. (A policy supplied for a *single* call still
              // lingers by design; what must not linger is a policy whose configuration
              // has been torn down via `clearConfig()`, which restores the default.)
              if (trustedTypesPolicy === undefined) {
                  trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
              }
              // Sign internal variables only when a policy is active. A falsy policy
              // (Trusted Types unsupported, creation failed, or an explicit opt-out)
              // leaves `emptyHTML` as a plain string, so we never call `.createHTML` on
              // a non-policy and throw. See #1422.
              if (trustedTypesPolicy && typeof emptyHTML === 'string') {
                  emptyHTML = _createTrustedHTML('');
              }
          }
          // Prevent further manipulation of configuration.
          // Not available in IE8, Safari 5, etc.
          if (freeze) {
              freeze(cfg);
          }
          CONFIG = cfg;
      };
      /* Keep track of all possible SVG and MathML tags
       * so that we can perform the namespace checks
       * correctly. */
      const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
      const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
      /**
       * Namespace rules for an element in the SVG namespace.
       *
       * @param tagName the element's lowercase tag name
       * @param parent the (possibly simulated) parent node
       * @param parentTagName the parent's lowercase tag name
       * @returns true if a spec-compliant parser could produce this element
       */
      const _checkSvgNamespace = function _checkSvgNamespace(tagName, parent, parentTagName) {
          // The only way to switch from HTML namespace to SVG
          // is via <svg>. If it happens via any other tag, then
          // it should be killed.
          if (parent.namespaceURI === HTML_NAMESPACE) {
              return tagName === 'svg';
          }
          // The only way to switch from MathML to SVG is via <svg>
          // if the parent is either <annotation-xml> or a MathML
          // text integration point.
          if (parent.namespaceURI === MATHML_NAMESPACE) {
              return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
          }
          // We only allow elements that are defined in SVG
          // spec. All others are disallowed in SVG namespace.
          return Boolean(ALL_SVG_TAGS[tagName]);
      };
      /**
       * Namespace rules for an element in the MathML namespace.
       *
       * @param tagName the element's lowercase tag name
       * @param parent the (possibly simulated) parent node
       * @param parentTagName the parent's lowercase tag name
       * @returns true if a spec-compliant parser could produce this element
       */
      const _checkMathMlNamespace = function _checkMathMlNamespace(tagName, parent, parentTagName) {
          // The only way to switch from HTML namespace to MathML
          // is via <math>. If it happens via any other tag, then
          // it should be killed.
          if (parent.namespaceURI === HTML_NAMESPACE) {
              return tagName === 'math';
          }
          // The only way to switch from SVG to MathML is via
          // <math> and HTML integration points
          if (parent.namespaceURI === SVG_NAMESPACE) {
              return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
          }
          // We only allow elements that are defined in MathML
          // spec. All others are disallowed in MathML namespace.
          return Boolean(ALL_MATHML_TAGS[tagName]);
      };
      /**
       * Namespace rules for an element in the HTML namespace.
       *
       * @param tagName the element's lowercase tag name
       * @param parent the (possibly simulated) parent node
       * @param parentTagName the parent's lowercase tag name
       * @returns true if a spec-compliant parser could produce this element
       */
      const _checkHtmlNamespace = function _checkHtmlNamespace(tagName, parent, parentTagName) {
          // The only way to switch from SVG to HTML is via
          // HTML integration points, and from MathML to HTML
          // is via MathML text integration points
          if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
              return false;
          }
          if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
              return false;
          }
          // We disallow tags that are specific for MathML
          // or SVG and should never appear in HTML namespace
          return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
      };
      /**
       * @param element a DOM element whose namespace is being checked
       * @returns Return false if the element has a
       *  namespace that a spec-compliant parser would never
       *  return. Return true otherwise.
       */
      const _checkValidNamespace = function _checkValidNamespace(element) {
          let parent = getParentNode(element);
          // In JSDOM, if we're inside shadow DOM, then parentNode
          // can be null. We just simulate parent in this case.
          if (!parent || !parent.tagName) {
              parent = {
                  namespaceURI: NAMESPACE,
                  tagName: 'template'
              };
          }
          const tagName = stringToLowerCase(element.tagName);
          const parentTagName = stringToLowerCase(parent.tagName);
          if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
              return false;
          }
          if (element.namespaceURI === SVG_NAMESPACE) {
              return _checkSvgNamespace(tagName, parent, parentTagName);
          }
          if (element.namespaceURI === MATHML_NAMESPACE) {
              return _checkMathMlNamespace(tagName, parent, parentTagName);
          }
          if (element.namespaceURI === HTML_NAMESPACE) {
              return _checkHtmlNamespace(tagName, parent, parentTagName);
          }
          // For XHTML and XML documents that support custom namespaces
          if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
              return true;
          }
          // The code should never reach this place (this means
          // that the element somehow got namespace that is not
          // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
          // Return false just in case.
          return false;
      };
      /**
       * _forceRemove
       *
       * @param node a DOM node
       */
      const _forceRemove = function _forceRemove(node) {
          arrayPush(DOMPurify.removed, {
              element: node
          });
          try {
              // eslint-disable-next-line unicorn/prefer-dom-node-remove
              getParentNode(node).removeChild(node);
          }
          catch (_) {
              /* The normal detach failed — this is reached for a parentless node
                 (getParentNode() is null, so .removeChild throws). Element.prototype
                 .remove() is itself a spec no-op on a parentless node, so a recorded
                 "removal" would otherwise hand the caller back an intact,
                 payload-bearing node (e.g. a detached IN_PLACE root the mXSS canary or
                 the style-with-element-child rule decided to kill). Fail closed by
                 throwing — exactly as a clobbered root does at the IN_PLACE entry —
                 rather than trying to "neutralize" the node via its own methods.
                 Neutralizing would mean calling getAttributeNames()/removeAttribute()
                 on the node, both of which a <form> root can clobber via a named child
                 (and _isClobbered does not even probe getAttributeNames), so the
                 neutralize step could itself be silently defeated, leaving the payload
                 intact. A throw touches only the cached, clobber-safe remove() and
                 getParentNode(). Generalizes GHSA-r47g-fvhr-h676 (clobbered-form root)
                 to every root-kill reason. REPORT-3.
                        This lives inside the catch, so it never fires for a normally-removed
                 in-tree node: those have a parent, removeChild() succeeds, and the
                 catch is not entered. Only a kept (parentless) root reaches here. */
              remove(node);
              if (!getParentNode(node)) {
                  throw typeErrorCreate('a node selected for removal could not be detached from its tree ' + 'and cannot be safely returned; refusing to sanitize in place');
              }
          }
      };
      /**
       * _neutralizeRoot
       *
       * Fail-closed teardown of an in-place root after the sanitize walk aborts
       * (campaign-3 F2). An internal throw mid-walk — e.g. a page-registered
       * custom element's reaction detaches a node so `_forceRemove`'s deliberate
       * parentless guard throws, or any other re-entrant engine mutation — would
       * otherwise leave the caller's *live* tree half-sanitized, with everything
       * after the abort point still carrying its handlers. There is no safe way
       * to resume the walk (the tree mutated under us), so we strip the root bare:
       * remove every child and every attribute, then let the caller's catch see
       * the original error. Clobber-safe (cached `remove`/`childNodes`/`attributes`
       * getters; the root was already clobber-pre-flighted at the IN_PLACE entry).
       *
       * @param root the in-place root to empty
       */
      const _neutralizeRoot = function _neutralizeRoot(root) {
          /* Strip every disallowed attribute (on* handlers included) off the whole
             subtree BEFORE detaching anything. Detaching first would hand back
             handler-bearing originals (e.g. an already-loading `<img onerror>`)
             whose queued resource event still fires in page scope after we throw.
             Clobber-safe reads; a doomed clobbered node's own attributes are
             irrelevant while its non-clobbered descendants are reached and scrubbed. */
          _neutralizeSubtree(root);
          const childNodes = getChildNodes(root);
          if (childNodes) {
              const snapshot = [];
              arrayForEach(childNodes, child => {
                  arrayPush(snapshot, child);
              });
              arrayForEach(snapshot, child => {
                  try {
                      remove(child);
                  }
                  catch (_) {
                      /* Best-effort teardown; a still-attached child is handled below */
                  }
              });
          }
          const attributes = getAttributes(root);
          if (attributes) {
              for (let i = attributes.length - 1; i >= 0; --i) {
                  const attribute = attributes[i];
                  const name = attribute && attribute.name;
                  if (typeof name === 'string') {
                      try {
                          root.removeAttribute(name);
                      }
                      catch (_) {
                          /* Clobbered removeAttribute — ignore (fail-closed best effort) */
                      }
                  }
              }
          }
      };
      /**
       * _removeAttribute
       *
       * @param name an Attribute name
       * @param element a DOM node
       */
      const _removeAttribute = function _removeAttribute(name, element) {
          try {
              arrayPush(DOMPurify.removed, {
                  attribute: element.getAttributeNode(name),
                  from: element
              });
          }
          catch (_) {
              arrayPush(DOMPurify.removed, {
                  attribute: null,
                  from: element
              });
          }
          element.removeAttribute(name);
          // We void attribute values for unremovable "is" attributes
          if (name === 'is') {
              if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
                  try {
                      _forceRemove(element);
                  }
                  catch (_) { }
              }
              else {
                  try {
                      element.setAttribute(name, '');
                  }
                  catch (_) { }
              }
          }
      };
      /**
       * _stripDisallowedAttributes
       *
       * Removes every attribute the active configuration does not allow from a
       * single element, using the same allowlist as the main attribute pass (so
       * `on*` handlers go, but no `/^on/` blocklist is introduced). Used only to
       * neutralise nodes that are being discarded from an in-place tree.
       *
       * @param element the element to strip
       */
      const _stripDisallowedAttributes = function _stripDisallowedAttributes(element) {
          const attributes = getAttributes(element);
          if (!attributes) {
              return;
          }
          for (let i = attributes.length - 1; i >= 0; --i) {
              const attribute = attributes[i];
              const name = attribute && attribute.name;
              if (typeof name !== 'string' || ALLOWED_ATTR[transformCaseFunc(name)]) {
                  continue;
              }
              try {
                  element.removeAttribute(name);
              }
              catch (_) {
                  /* Clobbered removeAttribute on a doomed node — ignore */
              }
          }
      };
      /**
       * _neutralizeSubtree
       *
       * Completes the audit-5 F1 fix across every removal path. The KEEP_CONTENT
       * move-hoist neutralises only disallowed-tag removals; clobber, mXSS-canary,
       * namespace, comment, processing-instruction and KEEP_CONTENT:false removals
       * all drop their subtree wholesale via `_forceRemove`. On the IN_PLACE path
       * those dropped nodes are detached from the caller's LIVE tree but a
       * handler-bearing original among them (an `<img onerror>`/`<video>` that was
       * loading) keeps its queued resource event, which fires in page scope after
       * sanitize returns. This walks a removed subtree and strips every attribute
       * the active configuration does not allow — so `on*` handlers are cancelled
       * through the SAME allowlist that governs kept nodes, not a separate `/^on/`
       * blocklist. Run synchronously before sanitize returns, i.e. before any
       * queued event can fire. Hook-free by design: these nodes leave the output,
       * so firing attribute hooks for them would be surprising. Clobber-safe reads;
       * a doomed clobbered node may shadow `removeAttribute` (its own attributes are
       * irrelevant — it is discarded — while its non-clobbered descendants, e.g.
       * the `<img>`, are reached and scrubbed).
       *
       * @param root the root of a removed subtree to neutralise
       */
      const _neutralizeSubtree = function _neutralizeSubtree(root) {
          const stack = [root];
          while (stack.length > 0) {
              const node = stack.pop();
              const nodeType = getNodeType ? getNodeType(node) : node.nodeType;
              if (nodeType === NODE_TYPE.element) {
                  _stripDisallowedAttributes(node);
              }
              const childNodes = getChildNodes(node);
              if (childNodes) {
                  for (let i = childNodes.length - 1; i >= 0; --i) {
                      stack.push(childNodes[i]);
                  }
              }
          }
      };
      /**
       * _neutralizePatchLinkage
       *
       * IN_PLACE entry pre-pass (declarative-partial-updates / streaming
       * hardening, https://github.com/WICG/declarative-partial-updates).
       *
       * The main walk strips patch linkage (`for`/`patchsrc`) and removes range
       * markers (PIs / markup comments) node-by-node, in document order, AS it
       * reaches each node. On a live in-place root that leaves a window: from the
       * moment the root is connected until the walk arrives at a given node, that
       * node's linkage is live. A patch applied on connection/stream can fire as
       * a microtask during the walk and inject or teleport an unsanitized DOM
       * range into a region the iterator has already passed and will not revisit,
       * so the post-return "tree is sanitized" contract is violated. Sweep the
       * whole tree once up front and sever every linkage before the walk begins,
       * closing that window.
       *
       * This CANNOT undo a patch that already fired before sanitize ran — that is
       * the irreducible "do not IN_PLACE a live-connected attacker tree" caveat —
       * but it closes everything from sanitize-start onward. Gated on SAFE_FOR_XML
       * to group with the rest of the declarative-partial-updates handling and
       * stay overridable, consistent with the codebase.
       *
       * Clobber-safe traversal (cached childNodes getter); per-node try/catch so a
       * clobbered root cannot defeat the sweep of its non-clobbered descendants.
       *
       * NOTE (pending real-Chrome confirmation, see test/declarative-patch-probe
       * .html Q1): this mirrors the existing policy of keeping `for` on
       * <label>/<output>. If the shipping feature can drive a patch through a
       * surviving `for`-on-label/output + `id` pair, this pre-pass and the
       * attribute check at _isBasicCustomElement's caller must additionally drop
       * that pair on the IN_PLACE path. Left as-is until the taxonomy is verified.
       *
       * @param root the in-place root to sweep
       */
      const _neutralizePatchLinkage = function _neutralizePatchLinkage(root) {
          if (!SAFE_FOR_XML) {
              return;
          }
          const stack = [root];
          while (stack.length > 0) {
              const node = stack.pop();
              const nodeType = getNodeType ? getNodeType(node) : node.nodeType;
              /* Remove range markers (the target side of a patch linkage): every
                 processing instruction, and any markup-bearing comment. */
              if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node.data)) {
                  try {
                      remove(node);
                  }
                  catch (_) {
                      /* Best-effort */
                  }
                  continue;
              }
              /* Strip patch-source attributes (the source side) off elements. */
              if (nodeType === NODE_TYPE.element) {
                  const element = node;
                  const lcTag = transformCaseFunc(getNodeName ? getNodeName(node) : node.nodeName);
                  try {
                      if (element.hasAttribute && element.hasAttribute('patchsrc')) {
                          element.removeAttribute('patchsrc');
                      }
                      if (element.hasAttribute && element.hasAttribute('for') && lcTag !== 'label' && lcTag !== 'output') {
                          element.removeAttribute('for');
                      }
                  }
                  catch (_) {
                      /* Clobbered removeAttribute/hasAttribute on a doomed node — ignore */
                  }
              }
              const childNodes = getChildNodes(node);
              if (childNodes) {
                  for (let i = childNodes.length - 1; i >= 0; --i) {
                      stack.push(childNodes[i]);
                  }
              }
          }
      };
      /**
       * _initDocument
       *
       * @param dirty - a string of dirty markup
       * @return a DOM, filled with the dirty markup
       */
      const _initDocument = function _initDocument(dirty) {
          /* Create a HTML document */
          let doc = null;
          let leadingWhitespace = null;
          if (FORCE_BODY) {
              dirty = '<remove></remove>' + dirty;
          }
          else {
              /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
              const matches = stringMatch(dirty, /^[\r\n\t ]+/);
              leadingWhitespace = matches && matches[0];
          }
          if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
              // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
              dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
          }
          const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
          /*
           * Use the DOMParser API by default, fallback later if needs be
           * DOMParser not work for svg when has multiple root element.
           */
          if (NAMESPACE === HTML_NAMESPACE) {
              try {
                  doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
              }
              catch (_) { }
          }
          /* Use createHTMLDocument in case DOMParser is not available */
          if (!doc || !doc.documentElement) {
              doc = implementation.createDocument(NAMESPACE, 'template', null);
              try {
                  doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
              }
              catch (_) {
                  // Syntax error if dirtyPayload is invalid xml
              }
          }
          const body = doc.body || doc.documentElement;
          if (dirty && leadingWhitespace) {
              body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
          }
          /* Work on whole document or just its body */
          if (NAMESPACE === HTML_NAMESPACE) {
              return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
          }
          return WHOLE_DOCUMENT ? doc.documentElement : body;
      };
      /**
       * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
       *
       * @param root The root element or node to start traversing on.
       * @return The created NodeIterator
       */
      const _createNodeIterator = function _createNodeIterator(root) {
          /* Read ownerDocument through the cached Node.prototype getter, never the
             direct property. HTMLFormElement has [LegacyOverrideBuiltIns], so a
             clobbering child (<input name="ownerDocument"> or a form-associated
             external input) shadows the prototype getter and makes a direct read
             return that <input>. createNodeIterator.call(<input>, ...) then throws
             "Illegal invocation", and on the IN_PLACE path that throw lands before
             the walk's fail-closed barrier - leaving the caller's live tree, with
             any already-armed handler in it, un-neutralized. The cached getter
             returns the real Document regardless of the clobber. */
          const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
          return createNodeIterator.call(doc || root, root, 
          // eslint-disable-next-line no-bitwise
          NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
      };
      /**
       * Replace template expression syntax (mustache, ERB, template
       * literal) with a space; shared by all SAFE_FOR_TEMPLATES scrub
       * sites. Order matters: mustache, then ERB, then template literal.
       *
       * @param value the string to scrub
       * @returns the scrubbed string
       */
      const _stripTemplateExpressions = function _stripTemplateExpressions(value) {
          value = stringReplace(value, MUSTACHE_EXPR$1, ' ');
          value = stringReplace(value, ERB_EXPR$1, ' ');
          value = stringReplace(value, TMPLIT_EXPR$1, ' ');
          return value;
      };
      /**
       * Strip template-engine expressions ({{...}}, ${...}, <%...%>) from the
       * character data of an element subtree. Used as the final safety net for
       * SAFE_FOR_TEMPLATES on every DOM-returning code path so that expressions
       * which only form after text-node normalization (e.g. fragments split across
       * stripped elements) cannot survive into a template-evaluating framework.
       *
       * Walks text/comment/CDATA/processing-instruction nodes and mutates `.data`
       * in place rather than round-tripping through innerHTML. This preserves
       * descendant node references (important for IN_PLACE callers), avoids a
       * serialize/reparse cycle, and reads literal character data — which means
       * `<%...%>` in text content matches the ERB regex against its real bytes
       * instead of the HTML-entity-escaped form innerHTML would produce.
       *
       * Attribute values are not visited here; SAFE_FOR_TEMPLATES handling for
       * attributes is performed during the per-node `_sanitizeAttributes` pass.
       *
       * @param node The root element whose character data should be scrubbed.
       */
      const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node) {
          var _node$querySelectorAl;
          node.normalize();
          /* Clobber-safe ownerDocument read, same reasoning as _createNodeIterator:
             under SAFE_FOR_TEMPLATES this runs on the live IN_PLACE root, which may
             carry a form-named-getter override of ownerDocument. */
          const doc = getOwnerDocument ? getOwnerDocument(node) : node.ownerDocument;
          const walker = createNodeIterator.call(doc || node, node, 
          // eslint-disable-next-line no-bitwise
          NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
          let currentNode = walker.nextNode();
          while (currentNode) {
              currentNode.data = _stripTemplateExpressions(currentNode.data);
              currentNode = walker.nextNode();
          }
          // NodeIterator does not descend into <template>.content per the DOM spec,
          // so we must explicitly recurse into each template's content fragment,
          // mirroring the approach used by _sanitizeShadowDOM.
          const templates = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, 'template');
          if (templates) {
              arrayForEach(templates, tmpl => {
                  if (_isDocumentFragment(tmpl.content)) {
                      _scrubTemplateExpressions2(tmpl.content);
                  }
              });
          }
      };
      /**
       * _isClobbered
       *
       * Detect DOM-clobbering on HTMLFormElement nodes. Form is the only HTML
       * interface with [LegacyOverrideBuiltIns]; a descendant element with a
       * `name` attribute matching a prototype property shadows that property
       * on direct reads. We use this check at the IN_PLACE entry-point and
       * during attribute sanitization to refuse clobbered forms.
       *
       * @param element element to check for clobbering attacks
       * @return true if clobbered, false if safe
       */
      const _isClobbered = function _isClobbered(element) {
          // Realm-independent tag-name probe. If we can't determine the tag
          // name at all, we can't reason about clobbering — return false
          // (the caller's other defences still apply).
          const realTagName = getNodeName ? getNodeName(element) : null;
          if (typeof realTagName !== 'string') {
              return false;
          }
          if (transformCaseFunc(realTagName) !== 'form') {
              return false;
          }
          return typeof element.nodeName !== 'string' || typeof element.textContent !== 'string' || typeof element.removeChild !== 'function' ||
              // Realm-safe NamedNodeMap detection: equality against the cached
              // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
              // makes the direct read diverge from the cached read; a clean form
              // (same-realm OR foreign-realm) has both reads pointing at the same
              // canonical NamedNodeMap.
              element.attributes !== getAttributes(element) || typeof element.removeAttribute !== 'function' || typeof element.setAttribute !== 'function' || typeof element.namespaceURI !== 'string' || typeof element.insertBefore !== 'function' || typeof element.hasChildNodes !== 'function' ||
              // NodeType clobbering probe. Cached Node.prototype.nodeType getter
              // returns the integer 1 for any Element regardless of realm; direct
              // read on a clobbered form (e.g. <input name="nodeType">) returns
              // the named child element. Cheap addition — nodeType is read from
              // an internal slot, no serialization cost — and removes a residual
              // clobbering surface used by several mXSS / PI / comment branches
              // in _sanitizeElements that compare currentNode.nodeType directly.
              element.nodeType !== getNodeType(element) ||
              // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
              // "childNodes" shadows the prototype getter. Direct reads of
              // form.childNodes from a clobbered form return the named child
              // instead of the real NodeList, so any walk that reads it directly
              // skips the form's real children. Compare the direct read to the
              // cached Node.prototype getter — when the form's named-property
              // getter intercepts the read, the two values differ and we flag
              // the form. This catches every clobbering child type (input,
              // select, etc.) regardless of whether the named child happens to
              // carry a numeric .length, which a typeof-based probe would miss
              // (e.g. HTMLSelectElement.length is a defined unsigned-long).
              element.childNodes !== getChildNodes(element);
      };
      /**
       * Checks whether the given value is a DocumentFragment from any realm.
       *
       * The realm-independent replacement reads `nodeType` through the cached
       * Node.prototype getter and compares to the DOCUMENT_FRAGMENT_NODE
       * constant (11). nodeType is a numeric value resolved from the node's
       * internal slot, identical across realms for the same kind of node.
       *
       * @param value object to check
       * @return true if value is a DocumentFragment-shaped node from any realm
       */
      const _isDocumentFragment = function _isDocumentFragment(value) {
          if (!getNodeType || typeof value !== 'object' || value === null) {
              return false;
          }
          try {
              return getNodeType(value) === NODE_TYPE.documentFragment;
          }
          catch (_) {
              return false;
          }
      };
      /**
       * Checks whether the given object is a DOM node, including nodes that
       * originate from a different window/realm (e.g. an iframe's
       * contentDocument). The previous `value instanceof Node` check was
       * realm-bound: nodes from a different window failed it, causing
       * sanitize() to silently stringify them and reset IN_PLACE to false,
       * returning the original node unsanitized. See GHSA-4w3q-35jp-p934.
       *
       * @param value object to check whether it's a DOM node
       * @return true if value is a DOM node from any realm
       */
      const _isNode = function _isNode(value) {
          if (!getNodeType || typeof value !== 'object' || value === null) {
              return false;
          }
          try {
              return typeof getNodeType(value) === 'number';
          }
          catch (_) {
              return false;
          }
      };
      function _executeHooks(hooks, currentNode, data) {
          if (hooks.length === 0) {
              return;
          }
          arrayForEach(hooks, hook => {
              hook.call(DOMPurify, currentNode, data, CONFIG);
          });
      }
      /**
       * Structural-threat checks that condemn a node regardless of the
       * allowlists: mXSS via namespace confusion, risky CSS construction,
       * processing instructions, markup-bearing comments. Pure predicate;
       * the caller removes. Check order is load-bearing.
       *
       * @param currentNode the node to inspect
       * @param tagName the node's transformCaseFunc'd tag name
       * @return true if the node must be removed
       */
      const _isUnsafeNode = function _isUnsafeNode(currentNode, tagName) {
          /* Detect mXSS attempts abusing namespace confusion */
          if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML)) {
              return true;
          }
          /* Remove risky CSS construction leading to mXSS */
          if (SAFE_FOR_XML && currentNode.namespaceURI === HTML_NAMESPACE && tagName === 'style' && _isNode(currentNode.firstElementChild)) {
              return true;
          }
          /* Remove any occurrence of processing instructions */
          if (currentNode.nodeType === NODE_TYPE.processingInstruction) {
              return true;
          }
          /* Remove any kind of possibly harmful comments */
          if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data)) {
              return true;
          }
          return false;
      };
      /**
       * Handle a node whose tag is forbidden or not allowlisted: keep
       * allowed custom elements (false return exits _sanitizeElements
       * early - the namespace and fallback-tag removal checks are
       * intentionally skipped for kept custom elements), else hoist
       * content per KEEP_CONTENT and remove.
       *
       * A kept custom element is the ONLY case in which this function
       * returns false, so the caller uses that return value to run the
       * afterSanitizeElements hook on the kept element and keep the
       * element-hook lifecycle consistent with normal allowlisted
       * elements (GHSA-c2j3-45gr-mqc4).
       *
       * @param currentNode the disallowed node
       * @param tagName the node's transformCaseFunc'd tag name
       * @return true if the node was removed, false if kept
       */
      const _sanitizeDisallowedNode = function _sanitizeDisallowedNode(currentNode, tagName, root) {
          /* Check if we have a custom element to handle */
          if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
              if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
                  return false;
              }
              if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
                  return false;
              }
          }
          /* Keep content except for bad-listed elements.
               Use the cached prototype getters exclusively — the previous code
               had `|| currentNode.parentNode` / `|| currentNode.childNodes`
               fallbacks, but the cached getters always return the canonical
               value (or null for a real parent-less node), so the fallback
               path was dead in safe cases and a clobbering surface in unsafe
               ones. Falsy cached results stay falsy; the `if (childNodes &&
               parentNode)` check already gates correctly. */
          if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
              const parentNode = getParentNode(currentNode);
              const childNodes = getChildNodes(currentNode);
              if (childNodes && parentNode) {
                  const childCount = childNodes.length;
                  /* Hoist by moving each child up one level rather than deep-cloning
                       it. Moving transfers every descendant exactly once, so a chain of
                       nested disallowed elements costs O(n) instead of the O(n^2) that
                       re-cloning the shrinking subtree at each level produced; it also
                       empties the removed original, so `DOMPurify.removed` no longer
                       pins whole subtrees. Moving preserves the in-place guarantee too:
                       an original carrying already-queued resource events (`<img
                       onerror>`, `<video>`/`<audio>` error, lazy/`onload`, …) is
                       relocated and sanitised rather than left detached but still armed.
                                The sole case that must clone is removing the walk root itself.
                       The result is serialised from the root's subtree, so a restrictive
                       ALLOWED_TAGS that strips the root (`body` on the string path) must
                       leave the content inside it, which only cloning does. In IN_PLACE
                       the root is pre-validated as an allowed tag and so is never removed
                       here, so that path always takes the move branch.
                                `childNodes` is live; a tail-to-head walk keeps `childNodes[i]`
                       valid whether we move (drops the trailing entry) or clone (leaves
                       the list intact). */
                  for (let i = childCount - 1; i >= 0; --i) {
                      const hoisted = currentNode === root ? cloneNode(childNodes[i], true) : childNodes[i];
                      parentNode.insertBefore(hoisted, getNextSibling(currentNode));
                  }
              }
          }
          _forceRemove(currentNode);
          return true;
      };
      /**
       * Fork a hook-mutable allowlist off its shared binding the first time a
       * (possibly lazily-installed) uponSanitize* hook is about to see it, so the
       * hook cannot widen the per-instance default or the setConfig binding by
       * reference and leak past the call. Returns the set unchanged once it is
       * already call-local, so repeated calls across elements are idempotent.
       *
       * @param hookList the uponSanitize* hook array for this event
       * @param set the current ALLOWED_TAGS / ALLOWED_ATTR binding
       * @param defaultSet the per-instance DEFAULT_ALLOWED_* constant
       * @param setConfigSet the captured setConfig() binding, or null
       * @return a call-local clone if a hook is present and set is still shared,
       *   else set unchanged
       */
      const _forkSharedAllowlist = function _forkSharedAllowlist(hookList, set, defaultSet, setConfigSet) {
          if (hookList.length === 0) {
              return set;
          }
          return set === defaultSet || set === setConfigSet ? clone(set) : set;
      };
      /**
       * _sanitizeElements
       *
       * @protect nodeName
       * @protect textContent
       * @protect removeChild
       * @param currentNode to check for permission to exist
       * @return true if node was killed, false if left alive
       */
      // eslint-disable-next-line complexity
      const _sanitizeElements = function _sanitizeElements(currentNode, root) {
          /* Execute a hook if present */
          _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
          /* A hook may have detached the node - treat it as removed (see the
             detached-node comment after the uponSanitizeElement hook below). On
             the IN_PLACE path, neutralize the detached subtree first so a queued
             resource handler on it cannot fire in page scope after we return. */
          if (currentNode !== root && getParentNode(currentNode) === null) {
              if (IN_PLACE) {
                  _neutralizeSubtree(currentNode);
              }
              return true;
          }
          /* Check if element is clobbered or can clobber */
          if (_isClobbered(currentNode)) {
              _forceRemove(currentNode);
              return true;
          }
          /* Now let's check the element's type and name */
          const tagName = transformCaseFunc(getNodeName ? getNodeName(currentNode) : currentNode.nodeName);
          /* Close the pre-walk clone-guard's timing gap: an uponSanitizeElement
             hook may have been installed after that guard sampled the hook arrays
             (e.g. lazily from beforeSanitizeElements), leaving ALLOWED_TAGS still
             aliasing a shared binding that a widening hook would mutate by
             reference. Fork it before exposing it to the hook. */
          ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
          /* Execute a hook if present */
          _executeHooks(hooks.uponSanitizeElement, currentNode, {
              tagName,
              allowedTags: ALLOWED_TAGS
          });
          /* A hook may have detached the node from the tree — a long-standing
             user pattern (issue #469; draw.io-style foreignObject filtering).
             Per the cached, unclobberable parentNode getter the node is
             genuinely out of the tree, so it can reach neither the serialized
             output nor an IN_PLACE live tree; treat it as removed and stop
             processing it. Without this guard, the unsafe-node / namespace
             checks below would call _forceRemove on a parentless node and hit
             the REPORT-3 fail-closed throw — which exists for nodes DOMPurify
             wants gone but *cannot* detach (clobbered / parentless roots), the
             opposite of a node that is already safely gone. The walk root is
             exempt: a detached IN_PLACE root is legitimate input and must still
             be fully sanitized, and a kill-decision on it must keep hitting the
             REPORT-3 throw. Nodes detached by hooks stay the hook's
             responsibility for placement: they are not recorded in
             DOMPurify.removed, so the post-walk IN_PLACE pass (which iterates
             DOMPurify.removed) does not reach them. But a hook-detached subtree
             can still hold a queued resource-event handler - e.g. an <img onload>
             that began loading when the caller built the live tree - which fires
             in page scope after sanitize returns even though the handler never
             reached the returned tree. That is the audit-5 F1 hazard, and the
             documented node.remove() hook pattern walks straight into it. So on
             the IN_PLACE path we neutralize the detached subtree inline here,
             stripping its non-allow-listed attributes before returning, exactly
             as the post-walk pass does for _forceRemove'd subtrees. */
          if (currentNode !== root && getParentNode(currentNode) === null) {
              if (IN_PLACE) {
                  _neutralizeSubtree(currentNode);
              }
              return true;
          }
          /* Remove mXSS vectors, processing instructions and risky comments */
          if (_isUnsafeNode(currentNode, tagName)) {
              _forceRemove(currentNode);
              return true;
          }
          /* Remove element if anything forbids its presence */
          if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
              const removed = _sanitizeDisallowedNode(currentNode, tagName, root);
              /* A false return means the node is a custom element kept via
                 CUSTOM_ELEMENT_HANDLING - the only keep path through
                 _sanitizeDisallowedNode. Run afterSanitizeElements on it so the
                 element-hook lifecycle matches normal allowlisted elements: a
                 security policy applied in this hook (e.g. stripping an attribute
                 from every surviving element) must not silently skip kept custom
                 elements (GHSA-c2j3-45gr-mqc4). This mirrors the normal-element
                 tail below - the hook runs, then the walker's subsequent
                 _sanitizeAttributes pass sanitizes the element's attributes. The
                 deliberately skipped namespace and fallback-tag removal checks stay
                 skipped; they are removal decisions, not the hook contract. */
              if (removed === false) {
                  _executeHooks(hooks.afterSanitizeElements, currentNode, null);
              }
              return removed;
          }
          /* Check whether element has a valid namespace.
             Realm-safe check (GHSA-hpcv-96wg-7vj8): use the cached Node.prototype
             nodeType getter rather than `instanceof Element`, which is realm-
             bound and short-circuits to false for any node minted in a different
             realm — letting a foreign-realm element with a forbidden namespace
             slip past the namespace check entirely. */
          const nt = getNodeType ? getNodeType(currentNode) : currentNode.nodeType;
          if (nt === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
              _forceRemove(currentNode);
              return true;
          }
          /* Make sure that older browsers don't get fallback-tag mXSS */
          if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
              _forceRemove(currentNode);
              return true;
          }
          /* Sanitize element content to be template-safe */
          if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
              /* Get the element's text content */
              const content = _stripTemplateExpressions(currentNode.textContent);
              if (currentNode.textContent !== content) {
                  arrayPush(DOMPurify.removed, {
                      element: currentNode.cloneNode()
                  });
                  currentNode.textContent = content;
              }
          }
          /* Execute a hook if present */
          _executeHooks(hooks.afterSanitizeElements, currentNode, null);
          return false;
      };
      /**
       * _isValidAttribute
       *
       * @param lcTag Lowercase tag name of containing element.
       * @param lcName Lowercase attribute name.
       * @param value Attribute value.
       * @return Returns true if `value` is valid, otherwise false.
       */
      // eslint-disable-next-line complexity
      const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
          /* FORBID_ATTR must always win, even if ADD_ATTR predicate would allow it */
          if (FORBID_ATTR[lcName]) {
              return false;
          }
          /* Reject declarative-partial-updates patch-linkage attributes
             (https://github.com/WICG/declarative-partial-updates).
                  Empirical note (Chrome 150, verified — see
             test/declarative-patch-probe-v3.html): expansion is NOT applied after
             sanitization. For the string path it fires during sanitize()'s own
             parse, so the walk sees and sanitizes the fully materialized expanded
             tree — teleports into MathML/SVG integration points included; a
             weaponized `<template for>`->`<img onerror>` comes back with the handler
             stripped. For the IN_PLACE path it fires on connection, before the walk.
             Either way DOMPurify is NOT blind to the patch.
                  This removal is therefore defense-in-depth rather than the sole barrier:
             it prevents live linkage from surviving into the OUTPUT and re-expanding
             in the caller's context, and keeps behaviour deterministic if a future
             engine defers expansion. `for` is legitimate only on <label>/<output>;
             anywhere else (notably <template for>) it links the element to a patch
             target and teleports or removes an arbitrary DOM range by id/marker name.
             `patchsrc` fetches remote markup and is treated as a script-loading
             mechanism (CSP). Gated on SAFE_FOR_XML so the removal groups with the
             other structural-threat checks and stays overridable, consistent with
             the rest of the codebase. PI range markers are already removed by
             _isUnsafeNode. */
          if (SAFE_FOR_XML && lcName === 'patchsrc') {
              return false;
          }
          if (SAFE_FOR_XML && lcName === 'for' && lcTag !== 'label' && lcTag !== 'output') {
              return false;
          }
          /* Make sure attribute cannot clobber */
          if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
              return false;
          }
          const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
          /* Allow valid data-* attributes: At least one character after "-"
              (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
              XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
              We don't need to check the value; it's always URI safe. */
          if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName))
              ;
          else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName))
              ;
          else if (!nameIsPermitted) {
              if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName, lcTag)) ||
                  // Alternative, second condition checks if it's an `is`-attribute, AND
                  // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
                  lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value)))
                  ;
              else {
                  return false;
              }
              /* Check value is safe. First, is attr inert? If so, is safe */
          }
          else if (URI_SAFE_ATTRIBUTES[lcName])
              ;
          else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, '')))
              ;
          else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag])
              ;
          else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, '')))
              ;
          else if (value) {
              return false;
          }
          else
              ;
          return true;
      };
      /* Names the HTML spec reserves from valid-custom-element-name; these must
       * never be treated as basic custom elements even when a permissive
       * CUSTOM_ELEMENT_HANDLING.tagNameCheck is configured. */
      const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, ['annotation-xml', 'color-profile', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'missing-glyph']);
      /**
       * _isBasicCustomElement
       * checks if at least one dash is included in tagName, and it's not the first char
       * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
       *
       * @param tagName name of the tag of the node to sanitize
       * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
       */
      const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
          return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
      };
      /**
       * Wrap an attribute value in the matching Trusted Types object when
       * the active policy requires it. Namespaced attributes pass through
       * unchanged (no TT support yet, see
       * https://bugs.chromium.org/p/chromium/issues/detail?id=1305293).
       *
       * @param lcTag lowercase tag name of the containing element
       * @param lcName lowercase attribute name
       * @param namespaceURI the attribute's namespace, if any
       * @param value the attribute value to wrap
       * @return the value, wrapped when Trusted Types demand it
       */
      const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value) {
          if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function' && !namespaceURI) {
              switch (trustedTypes.getAttributeType(lcTag, lcName)) {
                  case 'TrustedHTML':
                      {
                          return _createTrustedHTML(value);
                      }
                  case 'TrustedScriptURL':
                      {
                          return _createTrustedScriptURL(value);
                      }
              }
          }
          return value;
      };
      /**
       * Write a modified attribute value back onto the element. On
       * success, re-probe for clobbering introduced by the new value and
       * remove the element when found; otherwise pop the removal entry
       * recorded by the earlier _removeAttribute (long-standing pairing
       * with the SANITIZE_NAMED_PROPS path - do not "fix" casually). On
       * failure, remove the attribute instead.
       *
       * @param currentNode the element carrying the attribute
       * @param name the attribute name as present on the element
       * @param namespaceURI the attribute's namespace, if any
       * @param value the new attribute value
       */
      const _setAttributeValue = function _setAttributeValue(currentNode, name, namespaceURI, value) {
          try {
              if (namespaceURI) {
                  currentNode.setAttributeNS(namespaceURI, name, value);
              }
              else {
                  /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
                  currentNode.setAttribute(name, value);
              }
              if (_isClobbered(currentNode)) {
                  _forceRemove(currentNode);
              }
              else {
                  arrayPop(DOMPurify.removed);
              }
          }
          catch (_) {
              _removeAttribute(name, currentNode);
          }
      };
      /**
       * _sanitizeAttributes
       *
       * @protect attributes
       * @protect nodeName
       * @protect removeAttribute
       * @protect setAttribute
       *
       * @param currentNode to sanitize
       */
      const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
          /* Execute a hook if present */
          _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
          const attributes = currentNode.attributes;
          /* Check if we have attributes; if not we might have a text node */
          if (!attributes || _isClobbered(currentNode)) {
              return;
          }
          /* Same lazy-install guard as uponSanitizeElement (see there): fork the
             attribute allowlist off its shared binding before a hook can see it. */
          ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
          const hookEvent = {
              attrName: '',
              attrValue: '',
              keepAttr: true,
              allowedAttributes: ALLOWED_ATTR,
              forceKeepAttr: undefined
          };
          let l = attributes.length;
          const lcTag = transformCaseFunc(currentNode.nodeName);
          /* Go backwards over all attributes; safely remove bad ones */
          while (l--) {
              const attr = attributes[l];
              const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
              const lcName = transformCaseFunc(name);
              const initValue = attrValue;
              let value = name === 'value' ? initValue : stringTrim(initValue);
              /* Execute a hook if present */
              hookEvent.attrName = lcName;
              hookEvent.attrValue = value;
              hookEvent.keepAttr = true;
              hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
              _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
              value = hookEvent.attrValue;
              /* Full DOM Clobbering protection via namespace isolation,
               * Prefix id and name attributes with `user-content-`
               */
              if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name') && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
                  // Remove the attribute with this value
                  _removeAttribute(name, currentNode);
                  // Prefix the value and later re-create the attribute with the sanitized value
                  value = SANITIZE_NAMED_PROPS_PREFIX + value;
              }
              // Else: already prefixed, leave the attribute alone — the prefix is
              // itself the clobbering protection, and re-applying it is incorrect.
              /* Work around a security issue with comments inside attributes */
              if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) {
                  _removeAttribute(name, currentNode);
                  continue;
              }
              /* Make sure we cannot easily use animated hrefs, even if animations are allowed */
              if (lcName === 'attributename' && stringMatch(value, 'href')) {
                  _removeAttribute(name, currentNode);
                  continue;
              }
              /* Did the hooks force-keep the attribute? */
              if (hookEvent.forceKeepAttr) {
                  continue;
              }
              /* Did the hooks approve of the attribute? */
              if (!hookEvent.keepAttr) {
                  _removeAttribute(name, currentNode);
                  continue;
              }
              /* Work around a security issue in jQuery 3.0 */
              if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
                  _removeAttribute(name, currentNode);
                  continue;
              }
              /* Sanitize attribute content to be template-safe */
              if (SAFE_FOR_TEMPLATES) {
                  value = _stripTemplateExpressions(value);
              }
              /* Is `value` valid for this attribute? */
              if (!_isValidAttribute(lcTag, lcName, value)) {
                  _removeAttribute(name, currentNode);
                  continue;
              }
              /* Handle attributes that require Trusted Types */
              value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
              /* Handle invalid data-* attribute set by try-catching it */
              if (value !== initValue) {
                  _setAttributeValue(currentNode, name, namespaceURI, value);
              }
          }
          /* Execute a hook if present */
          _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
      };
      /**
       * _sanitizeShadowDOM
       *
       * @param fragment to iterate over recursively
       */
      const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
          let shadowNode = null;
          const shadowIterator = _createNodeIterator(fragment);
          /* Execute a hook if present */
          _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
          while (shadowNode = shadowIterator.nextNode()) {
              /* Execute a hook if present */
              _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
              /* Sanitize tags and elements */
              _sanitizeElements(shadowNode, fragment);
              /* Check attributes next */
              _sanitizeAttributes(shadowNode);
              /* Deep shadow DOM detected.
                 Realm-safe check (GHSA-hpcv-96wg-7vj8): use nodeType against the
                 DOCUMENT_FRAGMENT_NODE constant rather than instanceof, so we
                 recurse into <template>.content from foreign realms too. */
              if (_isDocumentFragment(shadowNode.content)) {
                  _sanitizeShadowDOM2(shadowNode.content);
              }
              /* An element iterated here may itself host an attached
                 shadow root. The default NodeIterator does not enter shadow
                 trees, so a shadow root nested inside template.content was
                 previously reached by no walk at all (the pre-pass at
                 _sanitizeAttachedShadowRoots descends via childNodes, which
                 doesn't enter template.content; the template-content recursion
                 above iterates the content but never inspected shadowRoot).
                 Walk it explicitly. The nodeType guard avoids reading
                 shadowRoot off text / comment / CDATA / PI nodes that the
                 iterator also surfaces. */
              const shadowNodeType = getNodeType ? getNodeType(shadowNode) : shadowNode.nodeType;
              if (shadowNodeType === NODE_TYPE.element) {
                  const innerSr = getShadowRoot(shadowNode);
                  if (_isDocumentFragment(innerSr)) {
                      _sanitizeAttachedShadowRoots(innerSr);
                      _sanitizeShadowDOM2(innerSr);
                  }
              }
          }
          /* Execute a hook if present */
          _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
      };
      /**
       * _sanitizeAttachedShadowRoots
       *
       * Walks `root` and feeds every attached shadow root we encounter into
       * the existing _sanitizeShadowDOM pipeline. The default node iterator
       * does not descend into shadow trees, so nodes inside an attached
       * shadow root would otherwise be skipped entirely.
       *
       * Two real input paths put attached shadow roots in front of us:
       *   1. IN_PLACE on a DOM node that already has shadow roots attached.
       *   2. DOM-node input where importNode(dirty, true) deep-clones the
       *      shadow root because it was created with `clonable: true`.
       *
       * This pass runs once, up front, so the main iteration loop (and the
       * existing _sanitizeShadowDOM template-content recursion) stay
       * untouched — string-input paths are not affected.
       *
       * @param root the subtree root to walk for attached shadow roots
       */
      const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots(root) {
          /* Iterative (explicit stack) rather than per-child recursion. DOM APIs
             impose no depth cap, so an attacker-shaped tree (JSON/CRDT/editor data
             built straight into the DOM — the IN_PLACE surface) deeper than the JS
             call-stack budget would otherwise overflow native recursion here and
             throw at the IN_PLACE entry pre-pass, before a single node is
             sanitized, leaving the caller's live tree untouched (fail-open). See
             campaign-3 F4. A heap stack keeps depth off the call stack.
                  Each work item is either a node to descend into, or a deferred
             `_sanitizeShadowDOM` for an already-walked shadow root. The deferred
             form preserves the original post-order discipline: a shadow root's
             nested shadow roots are discovered before the outer shadow is
             sanitized (which may remove hosts). Pushes are in reverse of the
             desired processing order (LIFO): template content, then children, then
             the shadow-sanitize, then the shadow walk — so the order matches the
             previous recursion exactly. */
          const stack = [{
                  node: root,
                  shadow: null
              }];
          while (stack.length > 0) {
              const item = stack.pop();
              /* Deferred shadow-DOM sanitisation: runs after its subtree was walked. */
              if (item.shadow) {
                  _sanitizeShadowDOM2(item.shadow);
                  continue;
              }
              const node = item.node;
              const nodeType = getNodeType ? getNodeType(node) : node.nodeType;
              const isElement = nodeType === NODE_TYPE.element;
              /* (pushed last → processed first) Children, snapshotted in reverse so
                 the first child is processed first. Snapshotting matters because a
                 hook may detach siblings mid-walk. */
              const childNodes = getChildNodes(node);
              if (childNodes) {
                  for (let i = childNodes.length - 1; i >= 0; --i) {
                      stack.push({
                          node: childNodes[i],
                          shadow: null
                      });
                  }
              }
              /* (pushed before children → processed after them, matching the old
                 "template content last" order) When the node is a <template>,
                 descend into its content. */
              if (isElement) {
                  const rootName = getNodeName ? getNodeName(node) : null;
                  if (typeof rootName === 'string' && transformCaseFunc(rootName) === 'template') {
                      const content = node.content;
                      if (_isDocumentFragment(content)) {
                          stack.push({
                              node: content,
                              shadow: null
                          });
                      }
                  }
              }
              /* Shadow root (processed first): walk its subtree, then sanitise it.
                 Realm-safe check (GHSA-hpcv-96wg-7vj8): nodeType-based detection
                 rather than `instanceof DocumentFragment`, which is realm-bound and
                 silently skipped foreign-realm shadow roots (e.g.
                 iframe.contentDocument attachShadow). */
              if (isElement) {
                  const sr = getShadowRoot(node);
                  if (_isDocumentFragment(sr)) {
                      /* Push the deferred sanitise first so it pops after the shadow
                         walk we push next, i.e. nested shadow roots are discovered
                         before this one is sanitised. */
                      stack.push({
                          node: null,
                          shadow: sr
                      }, {
                          node: sr,
                          shadow: null
                      });
                  }
              }
          }
      };
      // eslint-disable-next-line complexity
      DOMPurify.sanitize = function (dirty) {
          let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          let body = null;
          let importedNode = null;
          let currentNode = null;
          let returnNode = null;
          /* Make sure we have a string to sanitize.
            DO NOT return early, as this will return the wrong type if
            the user has requested a DOM object rather than a string */
          IS_EMPTY_INPUT = !dirty;
          if (IS_EMPTY_INPUT) {
              dirty = '<!-->';
          }
          /* Stringify, in case dirty is an object */
          if (typeof dirty !== 'string' && !_isNode(dirty)) {
              dirty = stringifyValue(dirty);
              if (typeof dirty !== 'string') {
                  throw typeErrorCreate('dirty is not a string, aborting');
              }
          }
          /* Return dirty HTML if DOMPurify cannot run */
          if (!DOMPurify.isSupported) {
              return dirty;
          }
          /* Assign config vars */
          if (SET_CONFIG) {
              /* Persistent setConfig() path: _parseConfig is skipped, so the sets are
               * not re-derived per call. Restore them from the pristine bindings
               * captured at setConfig() time so a previous call's hook clone (mutated
               * below) does not carry over. */
              ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
              ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
          }
          else {
              _parseConfig(cfg);
          }
          /* Clone the hook-mutable allowlists before the walk whenever an
           * uponSanitize* hook is registered. The hook event exposes ALLOWED_TAGS
           * and ALLOWED_ATTR by reference (as allowedTags / allowedAttributes), so
           * a hook that widens them would otherwise mutate the shared set
           * permanently: across later calls and across every element. Cloning per
           * walk keeps documented in-call widening working while scoping it to the
           * call. A single guard for both config paths - the per-call path rebinds
           * the sets in _parseConfig each call, the persistent path restores them
           * from the captured bindings just above - so the two cannot diverge. */
          if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0) {
              ALLOWED_TAGS = clone(ALLOWED_TAGS);
          }
          if (hooks.uponSanitizeAttribute.length > 0) {
              ALLOWED_ATTR = clone(ALLOWED_ATTR);
          }
          /* Clean up removed elements */
          DOMPurify.removed = [];
          /* Resolve IN_PLACE for this call without mutating persistent config.
             Writing the IN_PLACE closure variable here leaks under setConfig(),
             where _parseConfig is skipped on later calls: a single string call would
             disable in-place mode for every subsequent node call, returning a
             sanitized copy while leaving the caller's node — which in-place callers
             keep using and whose return value they ignore — unsanitized. REPORT-2. */
          const inPlace = IN_PLACE && typeof dirty !== 'string' && _isNode(dirty);
          if (inPlace) {
              /* Declarative-partial-updates / streaming pre-pass: sever every patch
                 linkage across the live tree BEFORE the walk, so no patch can fire
                 mid-walk and inject into an already-processed region. Runs first, so
                 it also covers the forbidden/clobbered roots that throw below. */
              _neutralizePatchLinkage(dirty);
              /* Do some early pre-sanitization to avoid unsafe root nodes.
                 Read nodeName through the cached prototype getter — a clobbering
                 child named "nodeName" on the form root would otherwise shadow
                 the property and let this check skip the root-allowlist
                 validation entirely. */
              const nn = getNodeName ? getNodeName(dirty) : dirty.nodeName;
              if (typeof nn === 'string') {
                  const tagName = transformCaseFunc(nn);
                  if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
                      /* Fail closed on a live root: neutralize handlers/children before
                         throwing, exactly as the mid-walk abort path does. */
                      _neutralizeRoot(dirty);
                      throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
                  }
              }
              /* Pre-flight the root through _isClobbered. The iterator-driven
                 removal path can not detach a parent-less root: _forceRemove
                 falls through to Element.prototype.remove(), which per spec
                 is a no-op on a node with no parent. A clobbered root would
                 then survive the main loop with its attributes uninspected,
                 because _sanitizeAttributes early-returns on _isClobbered. The
                 result would be an attacker-controlled form, complete with any
                 event-handler attributes the caller passed in, handed back to
                 the application unsanitized. Refuse to sanitize such a root
                 the same way we refuse a forbidden tag. GHSA-r47g-fvhr-h676. */
              if (_isClobbered(dirty)) {
                  /* Fail closed on a live clobbered root before throwing.
                     _neutralizeRoot's reads are clobber-safe (cached getters); the
                     form's non-clobbered descendants, e.g. an armed <img>, are scrubbed. */
                  _neutralizeRoot(dirty);
                  throw typeErrorCreate('root node is clobbered and cannot be sanitized in-place');
              }
              /* Sanitize attached shadow roots before the main iterator runs.
                 The iterator does not descend into shadow trees. Same fail-closed
                 barrier as the main walk (campaign-3 F2): a custom-element reaction
                 inside a shadow root could abort this pre-pass before the walk runs,
                 which would otherwise leave the entire live tree unsanitized. */
              try {
                  _sanitizeAttachedShadowRoots(dirty);
              }
              catch (error) {
                  _neutralizeRoot(dirty);
                  throw error;
              }
          }
          else if (_isNode(dirty)) {
              /* If dirty is a DOM element, append to an empty document to avoid
                 elements being stripped by the parser */
              body = _initDocument('<!---->');
              importedNode = body.ownerDocument.importNode(dirty, true);
              if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
                  /* Node is already a body, use as is */
                  body = importedNode;
              }
              else if (importedNode.nodeName === 'HTML') {
                  body = importedNode;
              }
              else {
                  // eslint-disable-next-line unicorn/prefer-dom-node-append
                  body.appendChild(importedNode);
              }
              /* Clonable shadow roots are deep-cloned by importNode(); sanitize
                 them before the main iterator runs, since the iterator does not
                 descend into shadow trees. The walk routes every read through a
                 cached prototype getter so clobbering descendants on a form root
                 cannot hide a shadow host from this pass. */
              _sanitizeAttachedShadowRoots(importedNode);
          }
          else {
              /* Exit directly if we have nothing to do */
              if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
                  // eslint-disable-next-line unicorn/prefer-includes
                  dirty.indexOf('<') === -1) {
                  return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
              }
              /* Initialize the document to work on */
              body = _initDocument(dirty);
              /* Check we have a DOM node from the data */
              if (!body) {
                  return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
              }
          }
          /* Remove first element node (ours) if FORCE_BODY is set */
          if (body && FORCE_BODY) {
              _forceRemove(body.firstChild);
          }
          /* Get node iterator */
          const walkRoot = inPlace ? dirty : body;
          /* Now start iterating over the created document.
             The walk runs inside an exception barrier (campaign-3 F2): a re-entrant
             engine/custom-element mutation can detach a node mid-walk so
             `_forceRemove`'s parentless guard throws, aborting the loop. Without the
             barrier the caller's in-place tree would be left half-sanitized with the
             unvisited tail still armed. _createNodeIterator itself is inside the
             barrier too: constructing the iterator dereferences the root's document,
             and any failure there (e.g. an exotic/clobbered root) must still fail
             closed rather than skip the neutralize. On any throw we fail closed -
             strip the in-place root bare - then rethrow so the existing throw
             contract is preserved. (String/DOM-copy paths never return the partial
             body, so the propagating throw is already fail-closed there.) */
          try {
              const nodeIterator = _createNodeIterator(walkRoot);
              while (currentNode = nodeIterator.nextNode()) {
                  /* Sanitize tags and elements */
                  _sanitizeElements(currentNode, walkRoot);
                  /* Check attributes next */
                  _sanitizeAttributes(currentNode);
                  /* Shadow DOM detected, sanitize it.
                     Realm-safe check (GHSA-hpcv-96wg-7vj8): nodeType-based detection
                     instead of instanceof, so foreign-realm <template>.content is
                     walked correctly. */
                  if (_isDocumentFragment(currentNode.content)) {
                      _sanitizeShadowDOM2(currentNode.content);
                  }
              }
          }
          catch (error) {
              if (inPlace) {
                  _neutralizeRoot(dirty);
                  /* Nodes _forceRemove'd earlier in the aborted walk are already
                     detached from the root, so _neutralizeRoot's subtree pass does not
                     reach them. Defuse them too, mirroring the success-path loop below. */
                  arrayForEach(DOMPurify.removed, entry => {
                      if (entry.element) {
                          _neutralizeSubtree(entry.element);
                      }
                  });
              }
              throw error;
          }
          /* If we sanitized `dirty` in-place, return it. */
          if (inPlace) {
              /* Fail-closed completion of the audit-5 F1 fix: every node removed from
                 the caller's live tree is detached but may still hold a queued
                 resource-event handler that fires in page scope after we return. The
                 move-hoist covers only disallowed-tag KEEP_CONTENT removals; strip the
                 non-allow-listed attributes off every other removed subtree (clobber,
                 mXSS, namespace, comments, KEEP_CONTENT:false, …) so those handlers are
                 cancelled before any event can fire. Runs synchronously, pre-return. */
              arrayForEach(DOMPurify.removed, entry => {
                  if (entry.element) {
                      _neutralizeSubtree(entry.element);
                  }
              });
              if (SAFE_FOR_TEMPLATES) {
                  _scrubTemplateExpressions2(dirty);
              }
              return dirty;
          }
          /* Return sanitized string or DOM */
          if (RETURN_DOM) {
              if (SAFE_FOR_TEMPLATES) {
                  _scrubTemplateExpressions2(body);
              }
              if (RETURN_DOM_FRAGMENT) {
                  returnNode = createDocumentFragment.call(body.ownerDocument);
                  while (body.firstChild) {
                      // eslint-disable-next-line unicorn/prefer-dom-node-append
                      returnNode.appendChild(body.firstChild);
                  }
              }
              else {
                  returnNode = body;
              }
              if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
                  /*
                    AdoptNode() is not used because internal state is not reset
                    (e.g. the past names map of a HTMLFormElement), this is safe
                    in theory but we would rather not risk another attack vector.
                    The state that is cloned by importNode() is explicitly defined
                    by the specs.
                  */
                  returnNode = importNode.call(originalDocument, returnNode, true);
              }
              return returnNode;
          }
          let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
          /* Serialize doctype if allowed */
          if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
              serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
          }
          /* Sanitize final string template-safe */
          if (SAFE_FOR_TEMPLATES) {
              serializedHTML = _stripTemplateExpressions(serializedHTML);
          }
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
      };
      DOMPurify.setConfig = function () {
          let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          _parseConfig(cfg);
          SET_CONFIG = true;
          SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
          SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
      };
      DOMPurify.clearConfig = function () {
          CONFIG = null;
          SET_CONFIG = false;
          SET_CONFIG_ALLOWED_TAGS = null;
          SET_CONFIG_ALLOWED_ATTR = null;
          // Drop any caller-supplied Trusted Types policy so it cannot poison later
          // `RETURN_TRUSTED_TYPE` output. The internal default policy (cached, and
          // never recreated — Trusted Types throws on duplicate names) is restored by
          // the next `_parseConfig`. See GHSA-vxr8-fq34-vvx9.
          trustedTypesPolicy = defaultTrustedTypesPolicy;
          emptyHTML = '';
      };
      DOMPurify.isValidAttribute = function (tag, attr, value) {
          /* Initialize shared config vars if necessary. */
          if (!CONFIG) {
              _parseConfig({});
          }
          const lcTag = transformCaseFunc(tag);
          const lcName = transformCaseFunc(attr);
          return _isValidAttribute(lcTag, lcName, value);
      };
      DOMPurify.addHook = function (entryPoint, hookFunction) {
          if (typeof hookFunction !== 'function') {
              return;
          }
          /* Reject unknown entry points. Without this, a non-hook key (e.g.
           * '__proto__') indexes off the prototype chain rather than a real
           * hook array, and arrayPush then writes to Object.prototype. Guard
           * with an own-property check against the known hook names. */
          if (!objectHasOwnProperty(hooks, entryPoint)) {
              return;
          }
          arrayPush(hooks[entryPoint], hookFunction);
      };
      DOMPurify.removeHook = function (entryPoint, hookFunction) {
          if (!objectHasOwnProperty(hooks, entryPoint)) {
              return undefined;
          }
          if (hookFunction !== undefined) {
              const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
              return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
          }
          return arrayPop(hooks[entryPoint]);
      };
      DOMPurify.removeHooks = function (entryPoint) {
          if (!objectHasOwnProperty(hooks, entryPoint)) {
              return;
          }
          hooks[entryPoint] = [];
      };
      DOMPurify.removeAllHooks = function () {
          hooks = _createHooksMap();
      };
      return DOMPurify;
  }
  var purify = createDOMPurify();
  module.exports = purify;

  }),
  (function (module, exports, require) {
  "use strict";
  /**
   * marked v18.0.9 - a markdown parser
   * Copyright (c) 2018-2026, MarkedJS. (MIT License)
   * Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
   * https://github.com/markedjs/marked
   */
  var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
      if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
      return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
  };
  var _a;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.walkTokens = exports.setOptions = exports.parser = exports.parseInline = exports.parse = exports.options = exports.lexer = exports.defaults = exports.Tokenizer = exports.TextRenderer = exports.Renderer = exports.Parser = exports.Marked = exports.Lexer = exports.Hooks = void 0;
  exports.getDefaults = C;
  exports.marked = f;
  exports.use = kt;
  /**
   * DO NOT EDIT THIS FILE
   * The code in this file is generated from files in ./src/
   */
  function C() { return { async: !1, breaks: !1, extensions: null, gfm: !0, hooks: null, pedantic: !1, renderer: null, silent: !1, tokenizer: null, walkTokens: null }; }
  var R = C();
  exports.defaults = R;
  function j(l) { exports.defaults = R = l; }
  var z = { exec: () => null };
  function A(l) { let e = []; return t => { let n = Math.max(0, Math.min(3, t - 1)), s = e[n]; return s || (s = l(n), e[n] = s), s; }; }
  function k(l, e = "") { let t = typeof l == "string" ? l : l.source, n = { replace: (s, r) => { let i = typeof r == "string" ? r : r.source; return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n; }, getRegex: () => new RegExp(t, e) }; return n; }
  var Te = ((l = "") => { try {
      return !!new RegExp("(?<=1)(?<!1)" + l);
  }
  catch {
      return !1;
  } })(), m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: l => new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: A(l => new RegExp(`^ {0,${l}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: A(l => new RegExp(`^ {0,${l}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: A(l => new RegExp(`^ {0,${l}}(?:\`\`\`|~~~)`)), headingBeginRegex: A(l => new RegExp(`^ {0,${l}}#`)), htmlBeginRegex: A(l => new RegExp(`^ {0,${l}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: A(l => new RegExp(`^ {0,${l}}>`)) }, Oe = /^(?:[ \t]*(?:\n|$))+/, we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, q = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, U = / {0,3}(?:[*+-]|\d{1,9}[.)])/, oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, ae = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Se = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), K = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, _e = /^[^\n]+/, W = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, $e = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", W).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Le = k(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, U).getRegex(), Q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", X = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, Me = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", X).replace("tag", Q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), le = l => k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", l).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex(), ze = le(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), Ee = le(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), Ce = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ee).getRegex(), J = { blockquote: Ce, code: we, def: $e, fences: ye, heading: Pe, hr: q, html: Me, lheading: ae, list: Le, newline: Oe, paragraph: ze, table: z, text: _e }, se = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex(), Ae = { ...J, lheading: Se, table: se, paragraph: k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex() }, Ie = { ...J, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", X).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: z, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(K).replace("hr", q).replace("heading", ` *#{1,6} *[^
  ]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, Be = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, De = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, pe = /^( {2,}|\\)\n(?!\s*$)/, qe = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, _ = /[\p{P}\p{S}]/u, I = /[\s\p{P}\p{S}]/u, v = /[^\s\p{P}\p{S}]/u, ve = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, I).getRegex(), He = /[\p{Pi}\p{Ps}"']/u, ue = /(?!~)[\p{P}\p{S}]/u, Ze = /(?!~)[\s\p{P}\p{S}]/u, Ge = /(?:[^\s\p{P}\p{S}]|~)/u, Qe = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Ne = k(ce, "u").replace(/punct/g, _).getRegex(), je = k(ce, "u").replace(/punct/g, ue).getRegex(), Fe = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, Ue = k(Fe, "u").replace(/openQuote/g, He).replace(/punct/g, _).getRegex(), he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Ke = k(he, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), We = k(he, "gu").replace(/notPunctSpace/g, Ge).replace(/punctSpace/g, Ze).replace(/punct/g, ue).getRegex(), Xe = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", Je = k(Xe, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), Ve = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), Ye = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", et = k(Ye, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), tt = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, _).getRegex(), nt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", rt = k(nt, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, I).replace(/punct/g, _).getRegex(), st = k(/\\(punct)/, "gu").replace(/punct/g, _).getRegex(), it = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), ot = k(X).replace("(?:-->|$)", "-->").getRegex(), at = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", ot).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), G = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, lt = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", G).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), de = k(/^!?\[(label)\]\[(ref)\]/).replace("label", G).replace("ref", W).getRegex(), ke = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", W).getRegex(), pt = k("reflink|nolink(?!\\()", "g").replace("reflink", de).replace("nolink", ke).getRegex(), ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, V = { _backpedal: z, anyPunctuation: st, autolink: it, blockSkip: Qe, br: pe, code: De, del: z, delLDelim: z, delRDelim: z, emStrongLDelim: Ne, emStrongRDelimAst: Ke, emStrongRDelimUnd: Ve, escape: Be, link: lt, nolink: ke, punctuation: ve, reflink: de, reflinkSearch: pt, tag: at, text: qe, url: z }, ut = { ...V, emStrongLDelim: Ue, emStrongRDelimAst: Je, emStrongRDelimUnd: et, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", G).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", G).getRegex() }, F = { ...V, emStrongRDelimAst: We, emStrongLDelim: je, delLDelim: tt, delRDelim: rt, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() }, ct = { ...F, br: k(pe).replace("{2,}", "*").getRegex(), text: k(F.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, H = { normal: J, gfm: Ae, pedantic: Ie }, B = { normal: V, gfm: F, breaks: ct, pedantic: ut };
  var ht = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, ge = l => ht[l];
  function O(l, e) { if (e) {
      if (m.escapeTest.test(l))
          return l.replace(m.escapeReplace, ge);
  }
  else if (m.escapeTestNoEncode.test(l))
      return l.replace(m.escapeReplaceNoEncode, ge); return l; }
  function Y(l) { try {
      l = encodeURI(l).replace(m.percentDecode, "%");
  }
  catch {
      return null;
  } return l; }
  function ee(l, e) { let t = l.replace(m.findPipe, (r, i, o) => { let p = !1, a = i; for (; --a >= 0 && o[a] === "\\";)
      p = !p; return p ? "|" : " |"; }), n = t.split(m.splitPipe), s = 0; if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
      if (n.length > e)
          n.splice(e);
      else
          for (; n.length < e;)
              n.push(""); for (; s < n.length; s++)
      n[s] = n[s].trim().replace(m.slashPipe, "|"); return n; }
  function $(l, e, t) { let n = l.length; if (n === 0)
      return ""; let s = 0; for (; s < n;) {
      let r = l.charAt(n - s - 1);
      if (r === e && !t)
          s++;
      else if (r !== e && t)
          s++;
      else
          break;
  } return l.slice(0, n - s); }
  function te(l) {
      let e = l.split(`
  `), t = e.length - 1;
      for (; t >= 0 && m.blankLine.test(e[t]);)
          t--;
      return e.length - t <= 2 ? l : e.slice(0, t + 1).join(`
  `);
  }
  function fe(l, e) { if (l.indexOf(e[1]) === -1)
      return -1; let t = 0; for (let n = 0; n < l.length; n++)
      if (l[n] === "\\")
          n++;
      else if (l[n] === e[0])
          t++;
      else if (l[n] === e[1] && (t--, t < 0))
          return n; return t > 0 ? -2 : -1; }
  function me(l, e = 0) { let t = e, n = ""; for (let s of l)
      if (s === "	") {
          let r = 4 - t % 4;
          n += " ".repeat(r), t += r;
      }
      else
          n += s, t++; return n; }
  function xe(l, e, t, n, s) { let r = e.href, i = e.title || null, o = l[1].replace(s.other.outputLinkReplace, "$1"); n.state.inLink = !0; let p = { type: l[0].charAt(0) === "!" ? "image" : "link", raw: t, href: r, title: i, text: o, tokens: n.inlineTokens(o) }; return n.state.inLink = !1, p; }
  function dt(l, e, t) {
      let n = l.match(t.other.indentCodeCompensation);
      if (n === null)
          return e;
      let s = n[1];
      return e.split(`
  `).map(r => { let i = r.match(t.other.beginningSpace); if (i === null)
          return r; let [o] = i; return o.length >= s.length ? r.slice(s.length) : r; }).join(`
  `);
  }
  var y = class {
      constructor(e) { this.options = e || R; }
      space(e) { let t = this.rules.block.newline.exec(e); if (t && t[0].length > 0)
          return { type: "space", raw: t[0] }; }
      code(e) { let t = this.rules.block.code.exec(e); if (t) {
          let n = this.options.pedantic ? t[0] : te(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
          return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
      } }
      fences(e) { let t = this.rules.block.fences.exec(e); if (t) {
          let n = t[0], s = dt(n, t[3] || "", this.rules);
          return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
      } }
      heading(e) {
          let t = this.rules.block.heading.exec(e);
          if (t) {
              let n = t[2].trim();
              if (this.rules.other.endingHash.test(n)) {
                  let s = $(n, "#");
                  (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
              }
              return { type: "heading", raw: $(t[0], `
  `), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
          }
      }
      hr(e) {
          let t = this.rules.block.hr.exec(e);
          if (t)
              return { type: "hr", raw: $(t[0], `
  `) };
      }
      blockquote(e) {
          let t = this.rules.block.blockquote.exec(e);
          if (t) {
              let n = $(t[0], `
  `).split(`
  `), s = "", r = "", i = [];
              for (; n.length > 0;) {
                  let o = !1, p = [], a;
                  for (a = 0; a < n.length; a++)
                      if (this.rules.other.blockquoteStart.test(n[a]))
                          p.push(n[a]), o = !0;
                      else if (!o)
                          p.push(n[a]);
                      else
                          break;
                  n = n.slice(a);
                  let u = p.join(`
  `), c = u.replace(this.rules.other.blockquoteSetextReplace, `
      $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
                  s = s ? `${s}
  ${u}` : u, r = r ? `${r}
  ${c}` : c;
                  let h = this.lexer.state.top;
                  if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = h, n.length === 0)
                      break;
                  let d = i.at(-1);
                  if (d?.type === "code")
                      break;
                  if (d?.type === "blockquote") {
                      let T = d, g = n.join(`
  `), w = T.raw + `
  ` + g.replace(this.rules.other.blockquoteSetextReplace2, ""), M = this.blockquote(w);
                      i[i.length - 1] = M, s = `${s}
  ${g}`, r = r.substring(0, r.length - T.text.length) + M.text;
                      break;
                  }
                  else if (d?.type === "list") {
                      let T = d, g = T.raw + `
  ` + n.join(`
  `), w = this.list(g);
                      i[i.length - 1] = w, s = s.substring(0, s.length - d.raw.length) + w.raw, r = r.substring(0, r.length - T.raw.length) + w.raw, n = g.substring(i.at(-1).raw.length).split(`
  `);
                      continue;
                  }
              }
              return { type: "blockquote", raw: s, tokens: i, text: r };
          }
      }
      list(e) {
          let t = this.rules.block.list.exec(e);
          if (t) {
              let n = t[1].trim(), s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: !1, items: [] };
              n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
              let i = this.rules.other.listItemRegex(n), o = !1;
              for (; e;) {
                  let a = !1, u = "", c = "";
                  if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
                      break;
                  u = t[0], e = e.substring(u.length);
                  let h = me(t[2].split(`
  `, 1)[0], t[1].length), d = e.split(`
  `, 1)[0], T = !h.trim(), g = 0;
                  if (this.options.pedantic ? (g = 2, c = h.trimStart()) : T ? g = t[1].length + 1 : (g = h.search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = h.slice(g), g += t[1].length), T && this.rules.other.blankLine.test(d) && (u += d + `
  `, e = e.substring(d.length + 1), a = !0), !a) {
                      let w = this.rules.other.nextBulletRegex(g), M = this.rules.other.hrRegex(g), ne = this.rules.other.fencesBeginRegex(g), re = this.rules.other.headingBeginRegex(g), be = this.rules.other.htmlBeginRegex(g), Re = this.rules.other.blockquoteBeginRegex(g);
                      for (; e;) {
                          let N = e.split(`
  `, 1)[0], D;
                          if (d = N, this.options.pedantic ? (d = d.replace(this.rules.other.listReplaceNesting, "  "), D = d) : D = d.replace(this.rules.other.tabCharGlobal, "    "), ne.test(d) || re.test(d) || be.test(d) || Re.test(d) || w.test(d) || M.test(d))
                              break;
                          if (D.search(this.rules.other.nonSpaceChar) >= g || !d.trim())
                              c += `
  ` + D.slice(g);
                          else {
                              if (T || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(h) || re.test(h) || M.test(h))
                                  break;
                              c += `
  ` + d;
                          }
                          T = !d.trim(), u += N + `
  `, e = e.substring(N.length + 1), h = D.slice(g);
                      }
                  }
                  r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(u) && (o = !0)), r.items.push({ type: "list_item", raw: u, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: !1, text: c, tokens: [] }), r.raw += u;
              }
              let p = r.items.at(-1);
              if (p)
                  p.raw = p.raw.trimEnd(), p.text = p.text.trimEnd();
              else
                  return;
              r.raw = r.raw.trimEnd();
              for (let a of r.items) {
                  this.lexer.state.top = !1, a.tokens = this.lexer.blockTokens(a.text, []);
                  let u = a.tokens[0];
                  if (a.task && (u?.type === "text" || u?.type === "paragraph")) {
                      a.text = a.text.replace(this.rules.other.listReplaceTask, ""), u.raw = u.raw.replace(this.rules.other.listReplaceTask, ""), u.text = u.text.replace(this.rules.other.listReplaceTask, "");
                      for (let h = this.lexer.inlineQueue.length - 1; h >= 0; h--)
                          if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
                              this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
                              break;
                          }
                      let c = this.rules.other.listTaskCheckbox.exec(a.raw);
                      if (c) {
                          let h = { type: "checkbox", raw: c[0] + " ", checked: c[0] !== "[ ]" };
                          a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({ type: "paragraph", raw: h.raw, text: h.raw, tokens: [h] }) : a.tokens.unshift(h);
                      }
                  }
                  else
                      a.task && (a.task = !1);
                  if (!r.loose) {
                      let c = a.tokens.filter(d => d.type === "space"), h = c.length > 0 && c.some(d => this.rules.other.anyLine.test(d.raw));
                      r.loose = h;
                  }
              }
              if (r.loose)
                  for (let a of r.items) {
                      a.loose = !0;
                      for (let u of a.tokens)
                          u.type === "text" && (u.type = "paragraph");
                  }
              return r;
          }
      }
      html(e) { let t = this.rules.block.html.exec(e); if (t) {
          let n = te(t[0]);
          return { type: "html", block: !0, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
      } }
      def(e) {
          let t = this.rules.block.def.exec(e);
          if (t) {
              let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
              return { type: "def", tag: n, raw: $(t[0], `
  `), href: s, title: r };
          }
      }
      table(e) {
          let t = this.rules.block.table.exec(e);
          if (!t || !this.rules.other.tableDelimiter.test(t[2]))
              return;
          let n = ee(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
  `) : [], i = { type: "table", raw: $(t[0], `
  `), header: [], align: [], rows: [] };
          if (n.length === s.length) {
              for (let o of s)
                  this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
              for (let o = 0; o < n.length; o++)
                  i.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: !0, align: i.align[o] });
              for (let o of r)
                  i.rows.push(ee(o, i.header.length).map((p, a) => ({ text: p, tokens: this.lexer.inline(p), header: !1, align: i.align[a] })));
              return i;
          }
      }
      lheading(e) {
          let t = this.rules.block.lheading.exec(e);
          if (t) {
              let n = t[1].trim();
              return { type: "heading", raw: $(t[0], `
  `), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
          }
      }
      paragraph(e) {
          let t = this.rules.block.paragraph.exec(e);
          if (t) {
              let n = t[1].charAt(t[1].length - 1) === `
  ` ? t[1].slice(0, -1) : t[1];
              return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
          }
      }
      text(e) { let t = this.rules.block.text.exec(e); if (t)
          return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) }; }
      escape(e) { let t = this.rules.inline.escape.exec(e); if (t)
          return { type: "escape", raw: t[0], text: t[1] }; }
      tag(e) { let t = this.rules.inline.tag.exec(e); if (t)
          return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: !1, text: t[0] }; }
      link(e) { let t = this.rules.inline.link.exec(e); if (t) {
          let n = t[2].trim();
          if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
              if (!this.rules.other.endAngleBracket.test(n))
                  return;
              let i = $(n.slice(0, -1), "\\");
              if ((n.length - i.length) % 2 === 0)
                  return;
          }
          else {
              let i = fe(t[2], "()");
              if (i === -2)
                  return;
              if (i > -1) {
                  let p = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
                  t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, p).trim(), t[3] = "";
              }
          }
          let s = t[2], r = "";
          if (this.options.pedantic) {
              let i = this.rules.other.pedanticHrefTitle.exec(s);
              i && (s = i[1], r = i[3]);
          }
          else
              r = t[3] ? t[3].slice(1, -1) : "";
          return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
      } }
      reflink(e, t) { let n; if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
          let s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
          if (!r) {
              let i = n[0].charAt(0);
              return { type: "text", raw: i, text: i };
          }
          return xe(n, r, n[0], this.lexer, this.rules);
      } }
      emStrong(e, t, n = "") { let s = this.rules.inline.emStrongLDelim.exec(e); if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric))
          return; if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
          let i = [...s[0]].length - 1, o, p, a = i, u = 0, c = s[0][0], h = n === c, d = c === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
          for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = d.exec(t)) !== null;) {
              if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o)
                  continue;
              if (p = [...o].length, s[3] || s[4]) {
                  a += p;
                  continue;
              }
              else if (s[5] || s[6]) {
                  if (i % 3 && !((i + p) % 3)) {
                      u += p;
                      continue;
                  }
                  if (h)
                      break;
              }
              if (a -= p, a > 0)
                  continue;
              p = Math.min(p, p + a + u);
              let T = [...s[0]][0].length, g = e.slice(0, i + s.index + T + p);
              if (Math.min(i, p) % 2) {
                  let M = g.slice(1, -1);
                  return { type: "em", raw: g, text: M, tokens: this.lexer.inlineTokens(M) };
              }
              let w = g.slice(2, -2);
              return { type: "strong", raw: g, text: w, tokens: this.lexer.inlineTokens(w) };
          }
      } }
      codespan(e) { let t = this.rules.inline.code.exec(e); if (t) {
          let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
          return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
      } }
      br(e) { let t = this.rules.inline.br.exec(e); if (t)
          return { type: "br", raw: t[0] }; }
      del(e, t, n = "") { let s = this.rules.inline.delLDelim.exec(e); if (!s)
          return; if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
          let i = [...s[0]].length - 1, o, p, a = i, u = this.rules.inline.delRDelim;
          for (u.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = u.exec(t)) !== null;) {
              if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (p = [...o].length, p !== i))
                  continue;
              if (s[3] || s[4]) {
                  a += p;
                  continue;
              }
              if (a -= p, a > 0)
                  continue;
              p = Math.min(p, p + a);
              let c = [...s[0]][0].length, h = e.slice(0, i + s.index + c + p), d = h.slice(i, -i);
              return { type: "del", raw: h, text: d, tokens: this.lexer.inlineTokens(d) };
          }
      } }
      autolink(e) { let t = this.rules.inline.autolink.exec(e); if (t) {
          let n, s;
          return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
      } }
      url(e) { let t; if (t = this.rules.inline.url.exec(e)) {
          let n, s;
          if (t[2] === "@")
              n = t[0], s = "mailto:" + n;
          else {
              let r;
              do
                  r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
              while (r !== t[0]);
              n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
          }
          return { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
      } }
      inlineText(e) { let t = this.rules.inline.text.exec(e); if (t) {
          let n = this.lexer.state.inRawBlock;
          return { type: "text", raw: t[0], text: t[0], escaped: n };
      } }
  };
  exports.Tokenizer = y;
  var x = class l {
      constructor(e) { this.tokens = [], this.tokens.links = Object.create(null), this.options = e || R, this.options.tokenizer = this.options.tokenizer || new y, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: !1, inRawBlock: !1, top: !0 }; let t = { other: m, block: H.normal, inline: B.normal }; this.options.pedantic ? (t.block = H.pedantic, t.inline = B.pedantic) : this.options.gfm && (t.block = H.gfm, this.options.breaks ? t.inline = B.breaks : t.inline = B.gfm), this.tokenizer.rules = t; }
      static get rules() { return { block: H, inline: B }; }
      static lex(e, t) { return new l(t).lex(e); }
      static lexInline(e, t) { return new l(t).inlineTokens(e); }
      lex(e) {
          e = e.replace(m.carriageReturn, `
  `), this.blockTokens(e, this.tokens);
          for (let t = 0; t < this.inlineQueue.length; t++) {
              let n = this.inlineQueue[t];
              this.inlineTokens(n.src, n.tokens);
          }
          return this.inlineQueue = [], this.tokens;
      }
      blockTokens(e, t = [], n = !1) {
          this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
          let s = 1 / 0;
          for (; e;) {
              if (e.length < s)
                  s = e.length;
              else {
                  this.infiniteLoopError(e.charCodeAt(0));
                  break;
              }
              let r;
              if (this.options.extensions?.block?.some(o => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), !0) : !1))
                  continue;
              if (r = this.tokenizer.space(e)) {
                  e = e.substring(r.raw.length);
                  let o = t.at(-1);
                  r.raw.length === 1 && o !== void 0 ? o.raw += `
  ` : t.push(r);
                  continue;
              }
              if (r = this.tokenizer.code(e)) {
                  e = e.substring(r.raw.length);
                  let o = t.at(-1);
                  o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
  `) ? "" : `
  `) + r.raw, o.text += `
  ` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
                  continue;
              }
              if (r = this.tokenizer.fences(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.heading(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.hr(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.blockquote(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.list(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.html(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.def(e)) {
                  e = e.substring(r.raw.length);
                  let o = t.at(-1);
                  o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
  `) ? "" : `
  `) + r.raw, o.text += `
  ` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
                  continue;
              }
              if (r = this.tokenizer.table(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              if (r = this.tokenizer.lheading(e)) {
                  e = e.substring(r.raw.length), t.push(r);
                  continue;
              }
              let i = e;
              if (this.options.extensions?.startBlock) {
                  let o = 1 / 0, p = e.slice(1), a;
                  this.options.extensions.startBlock.forEach(u => { a = u.call({ lexer: this }, p), typeof a == "number" && a >= 0 && (o = Math.min(o, a)); }), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
              }
              if (this.state.top && (r = this.tokenizer.paragraph(i))) {
                  let o = t.at(-1);
                  n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
  `) ? "" : `
  `) + r.raw, o.text += `
  ` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
                  continue;
              }
              if (r = this.tokenizer.text(e)) {
                  e = e.substring(r.raw.length);
                  let o = t.at(-1);
                  o?.type === "text" ? (o.raw += (o.raw.endsWith(`
  `) ? "" : `
  `) + r.raw, o.text += `
  ` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
                  continue;
              }
              if (e) {
                  this.infiniteLoopError(e.charCodeAt(0));
                  break;
              }
          }
          return this.state.top = !0, t;
      }
      inline(e, t = []) { return this.inlineQueue.push({ src: e, tokens: t }), t; }
      inlineTokens(e, t = []) { this.tokenizer.lexer = this; let n = e; if (this.tokens.links) {
          let o = Object.keys(this.tokens.links);
          o.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, p => o.includes(p.slice(p.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(p.length - 2) + "]" : p));
      } n = n.replace(this.tokenizer.rules.inline.anyPunctuation, "++"), n = n.replace(this.tokenizer.rules.inline.blockSkip, (o, p, a) => { let u = a ? a.length : 0; return o.slice(0, u) + "[" + "a".repeat(o.length - u - 2) + "]"; }), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n; let s = !1, r = "", i = 1 / 0; for (; e;) {
          if (e.length < i)
              i = e.length;
          else {
              this.infiniteLoopError(e.charCodeAt(0));
              break;
          }
          s || (r = ""), s = !1;
          let o;
          if (this.options.extensions?.inline?.some(a => (o = a.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1))
              continue;
          if (o = this.tokenizer.escape(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.tag(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.link(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.reflink(e, this.tokens.links)) {
              e = e.substring(o.raw.length);
              let a = t.at(-1);
              o.type === "text" && a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
              continue;
          }
          if (o = this.tokenizer.emStrong(e, n, r)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.codespan(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.br(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.del(e, n, r)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (o = this.tokenizer.autolink(e)) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          if (!this.state.inLink && (o = this.tokenizer.url(e))) {
              e = e.substring(o.raw.length), t.push(o);
              continue;
          }
          let p = e;
          if (this.options.extensions?.startInline) {
              let a = 1 / 0, u = e.slice(1), c;
              this.options.extensions.startInline.forEach(h => { c = h.call({ lexer: this }, u), typeof c == "number" && c >= 0 && (a = Math.min(a, c)); }), a < 1 / 0 && a >= 0 && (p = e.substring(0, a + 1));
          }
          if (o = this.tokenizer.inlineText(p)) {
              e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (r = o.raw.slice(-1)), s = !0;
              let a = t.at(-1);
              a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
              continue;
          }
          if (e) {
              this.infiniteLoopError(e.charCodeAt(0));
              break;
          }
      } return t; }
      infiniteLoopError(e) { let t = "Infinite loop on byte: " + e; if (this.options.silent)
          console.error(t);
      else
          throw new Error(t); }
  };
  exports.Lexer = x;
  var P = class {
      constructor(e) { this.options = e || R; }
      space(e) { return ""; }
      code({ text: e, lang: t, escaped: n }) {
          let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
  `;
          return s ? '<pre><code class="language-' + O(s) + '">' + (n ? r : O(r, !0)) + `</code></pre>
  ` : "<pre><code>" + (n ? r : O(r, !0)) + `</code></pre>
  `;
      }
      blockquote({ tokens: e }) {
          return `<blockquote>
  ${this.parser.parse(e)}</blockquote>
  `;
      }
      html({ text: e }) { return e; }
      def(e) { return ""; }
      heading({ tokens: e, depth: t }) {
          return `<h${t}>${this.parser.parseInline(e)}</h${t}>
  `;
      }
      hr(e) {
          return `<hr>
  `;
      }
      list(e) {
          let t = e.ordered, n = e.start, s = "";
          for (let o = 0; o < e.items.length; o++) {
              let p = e.items[o];
              s += this.listitem(p);
          }
          let r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
          return "<" + r + i + `>
  ` + s + "</" + r + `>
  `;
      }
      listitem(e) {
          return `<li>${this.parser.parse(e.tokens)}</li>
  `;
      }
      checkbox({ checked: e }) { return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> '; }
      paragraph({ tokens: e }) {
          return `<p>${this.parser.parseInline(e)}</p>
  `;
      }
      table(e) {
          let t = "", n = "";
          for (let r = 0; r < e.header.length; r++)
              n += this.tablecell(e.header[r]);
          t += this.tablerow({ text: n });
          let s = "";
          for (let r = 0; r < e.rows.length; r++) {
              let i = e.rows[r];
              n = "";
              for (let o = 0; o < i.length; o++)
                  n += this.tablecell(i[o]);
              s += this.tablerow({ text: n });
          }
          return s && (s = `<tbody>${s}</tbody>`), `<table>
  <thead>
  ` + t + `</thead>
  ` + s + `</table>
  `;
      }
      tablerow({ text: e }) {
          return `<tr>
  ${e}</tr>
  `;
      }
      tablecell(e) {
          let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
          return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
  `;
      }
      strong({ tokens: e }) { return `<strong>${this.parser.parseInline(e)}</strong>`; }
      em({ tokens: e }) { return `<em>${this.parser.parseInline(e)}</em>`; }
      codespan({ text: e }) { return `<code>${O(e, !0)}</code>`; }
      br(e) { return "<br>"; }
      del({ tokens: e }) { return `<del>${this.parser.parseInline(e)}</del>`; }
      link({ href: e, title: t, tokens: n }) { let s = this.parser.parseInline(n), r = Y(e); if (r === null)
          return s; e = r; let i = '<a href="' + e + '"'; return t && (i += ' title="' + O(t) + '"'), i += ">" + s + "</a>", i; }
      image({ href: e, title: t, text: n, tokens: s }) { s && (n = this.parser.parseInline(s, this.parser.textRenderer)); let r = Y(e); if (r === null)
          return O(n); e = r; let i = `<img src="${e}" alt="${O(n)}"`; return t && (i += ` title="${O(t)}"`), i += ">", i; }
      text(e) { return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : O(e.text); }
  };
  exports.Renderer = P;
  var L = class {
      strong({ text: e }) { return e; }
      em({ text: e }) { return e; }
      codespan({ text: e }) { return e; }
      del({ text: e }) { return e; }
      html({ text: e }) { return e; }
      text({ text: e }) { return e; }
      link({ text: e }) { return "" + e; }
      image({ text: e }) { return "" + e; }
      br() { return ""; }
      checkbox({ raw: e }) { return e; }
  };
  exports.TextRenderer = L;
  var b = class l {
      constructor(e) { this.options = e || R, this.options.renderer = this.options.renderer || new P, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L; }
      static parse(e, t) { return new l(t).parse(e); }
      static parseInline(e, t) { return new l(t).parseInline(e); }
      parse(e) { this.renderer.parser = this; let t = ""; for (let n = 0; n < e.length; n++) {
          let s = e[n];
          if (this.options.extensions?.renderers?.[s.type]) {
              let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
              if (o !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(i.type)) {
                  t += o || "";
                  continue;
              }
          }
          let r = s;
          switch (r.type) {
              case "space": {
                  t += this.renderer.space(r);
                  break;
              }
              case "hr": {
                  t += this.renderer.hr(r);
                  break;
              }
              case "heading": {
                  t += this.renderer.heading(r);
                  break;
              }
              case "code": {
                  t += this.renderer.code(r);
                  break;
              }
              case "table": {
                  t += this.renderer.table(r);
                  break;
              }
              case "blockquote": {
                  t += this.renderer.blockquote(r);
                  break;
              }
              case "list": {
                  t += this.renderer.list(r);
                  break;
              }
              case "checkbox": {
                  t += this.renderer.checkbox(r);
                  break;
              }
              case "html": {
                  t += this.renderer.html(r);
                  break;
              }
              case "def": {
                  t += this.renderer.def(r);
                  break;
              }
              case "paragraph": {
                  t += this.renderer.paragraph(r);
                  break;
              }
              case "text": {
                  t += this.renderer.text(r);
                  break;
              }
              default: {
                  let i = 'Token with "' + r.type + '" type was not found.';
                  if (this.options.silent)
                      return console.error(i), "";
                  throw new Error(i);
              }
          }
      } return t; }
      parseInline(e, t = this.renderer) { this.renderer.parser = this; let n = ""; for (let s = 0; s < e.length; s++) {
          let r = e[s];
          if (this.options.extensions?.renderers?.[r.type]) {
              let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
              if (o !== !1 || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
                  n += o || "";
                  continue;
              }
          }
          let i = r;
          switch (i.type) {
              case "escape": {
                  n += t.text(i);
                  break;
              }
              case "html": {
                  n += t.html(i);
                  break;
              }
              case "link": {
                  n += t.link(i);
                  break;
              }
              case "image": {
                  n += t.image(i);
                  break;
              }
              case "checkbox": {
                  n += t.checkbox(i);
                  break;
              }
              case "strong": {
                  n += t.strong(i);
                  break;
              }
              case "em": {
                  n += t.em(i);
                  break;
              }
              case "codespan": {
                  n += t.codespan(i);
                  break;
              }
              case "br": {
                  n += t.br(i);
                  break;
              }
              case "del": {
                  n += t.del(i);
                  break;
              }
              case "text": {
                  n += t.text(i);
                  break;
              }
              default: {
                  let o = 'Token with "' + i.type + '" type was not found.';
                  if (this.options.silent)
                      return console.error(o), "";
                  throw new Error(o);
              }
          }
      } return n; }
  };
  exports.Parser = b;
  var S = (_a = class {
          constructor(e) { this.options = e || R; }
          preprocess(e) { return e; }
          postprocess(e) { return e; }
          processAllTokens(e) { return e; }
          emStrongMask(e) { return e; }
          provideLexer(e = this.block) { return e ? x.lex : x.lexInline; }
          provideParser(e = this.block) { return e ? b.parse : b.parseInline; }
      },
      __setFunctionName(_a, "S"),
      _a.passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]),
      _a.passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]),
      _a);
  exports.Hooks = S;
  var Z = class {
      constructor(...e) {
          this.defaults = C();
          this.options = this.setOptions;
          this.parse = this.parseMarkdown(!0);
          this.parseInline = this.parseMarkdown(!1);
          this.Parser = b;
          this.Renderer = P;
          this.TextRenderer = L;
          this.Lexer = x;
          this.Tokenizer = y;
          this.Hooks = S;
          this.use(...e);
      }
      walkTokens(e, t) { let n = []; for (let s of e)
          switch (n = n.concat(t.call(this, s)), s.type) {
              case "table": {
                  let r = s;
                  for (let i of r.header)
                      n = n.concat(this.walkTokens(i.tokens, t));
                  for (let i of r.rows)
                      for (let o of i)
                          n = n.concat(this.walkTokens(o.tokens, t));
                  break;
              }
              case "list": {
                  let r = s;
                  n = n.concat(this.walkTokens(r.items, t));
                  break;
              }
              default: {
                  let r = s;
                  this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach(i => { let o = r[i].flat(1 / 0); n = n.concat(this.walkTokens(o, t)); }) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
              }
          } return n; }
      use(...e) { let t = this.defaults.extensions || { renderers: {}, childTokens: {} }; return e.forEach(n => { let s = { ...n }; if (s.async = this.defaults.async || s.async || !1, n.extensions && (n.extensions.forEach(r => { if (!r.name)
          throw new Error("extension name required"); if ("renderer" in r) {
          let i = t.renderers[r.name];
          i ? t.renderers[r.name] = function (...o) { let p = r.renderer.apply(this, o); return p === !1 && (p = i.apply(this, o)), p; } : t.renderers[r.name] = r.renderer;
      } if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
              throw new Error("extension level must be 'block' or 'inline'");
          let i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
      } "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens); }), s.extensions = t), n.renderer) {
          let r = this.defaults.renderer || new P(this.defaults);
          for (let i in n.renderer) {
              if (!(i in r))
                  throw new Error(`renderer '${i}' does not exist`);
              if (["options", "parser"].includes(i))
                  continue;
              let o = i, p = n.renderer[o], a = r[o];
              r[o] = (...u) => { let c = p.apply(r, u); return c === !1 && (c = a.apply(r, u)), c || ""; };
          }
          s.renderer = r;
      } if (n.tokenizer) {
          let r = this.defaults.tokenizer || new y(this.defaults);
          for (let i in n.tokenizer) {
              if (!(i in r))
                  throw new Error(`tokenizer '${i}' does not exist`);
              if (["options", "rules", "lexer"].includes(i))
                  continue;
              let o = i, p = n.tokenizer[o], a = r[o];
              r[o] = (...u) => { let c = p.apply(r, u); return c === !1 && (c = a.apply(r, u)), c; };
          }
          s.tokenizer = r;
      } if (n.hooks) {
          let r = this.defaults.hooks || new S;
          for (let i in n.hooks) {
              if (!(i in r))
                  throw new Error(`hook '${i}' does not exist`);
              if (["options", "block"].includes(i))
                  continue;
              let o = i, p = n.hooks[o], a = r[o];
              S.passThroughHooks.has(i) ? r[o] = u => { if (this.defaults.async && S.passThroughHooksRespectAsync.has(i))
                  return (async () => { let h = await p.call(r, u); return a.call(r, h); })(); let c = p.call(r, u); return a.call(r, c); } : r[o] = (...u) => { if (this.defaults.async)
                  return (async () => { let h = await p.apply(r, u); return h === !1 && (h = await a.apply(r, u)), h; })(); let c = p.apply(r, u); return c === !1 && (c = a.apply(r, u)), c; };
          }
          s.hooks = r;
      } if (n.walkTokens) {
          let r = this.defaults.walkTokens, i = n.walkTokens;
          s.walkTokens = function (o) { let p = []; return p.push(i.call(this, o)), r && (p = p.concat(r.call(this, o))), p; };
      } this.defaults = { ...this.defaults, ...s }; }), this; }
      setOptions(e) { return this.defaults = { ...this.defaults, ...e }, this; }
      lexer(e, t) { return x.lex(e, t ?? this.defaults); }
      parser(e, t) { return b.parse(e, t ?? this.defaults); }
      parseMarkdown(e) { return (n, s) => { let r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async); if (this.defaults.async === !0 && r.async === !1)
          return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.")); if (typeof n > "u" || n === null)
          return o(new Error("marked(): input parameter is undefined or null")); if (typeof n != "string")
          return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected")); if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async)
          return (async () => { let p = i.hooks ? await i.hooks.preprocess(n) : n, u = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(p, i), c = i.hooks ? await i.hooks.processAllTokens(u) : u; i.walkTokens && await Promise.all(this.walkTokens(c, i.walkTokens)); let d = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, i); return i.hooks ? await i.hooks.postprocess(d) : d; })().catch(o); try {
          i.hooks && (n = i.hooks.preprocess(n));
          let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
          i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
          let c = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
          return i.hooks && (c = i.hooks.postprocess(c)), c;
      }
      catch (p) {
          return o(p);
      } }; }
      onError(e, t) {
          return n => {
              if (n.message += `
  Please report this to https://github.com/markedjs/marked.`, e) {
                  let s = "<p>An error occurred:</p><pre>" + O(n.message + "", !0) + "</pre>";
                  return t ? Promise.resolve(s) : s;
              }
              if (t)
                  return Promise.reject(n);
              throw n;
          };
      }
  };
  exports.Marked = Z;
  var E = new Z;
  function f(l, e) { return E.parse(l, e); }
  f.options = f.setOptions = function (l) { return E.setOptions(l), f.defaults = E.defaults, j(f.defaults), f; };
  f.getDefaults = C;
  f.defaults = R;
  function kt(...l) { return E.use(...l), f.defaults = E.defaults, j(f.defaults), f; }
  f.use = kt;
  f.walkTokens = function (l, e) { return E.walkTokens(l, e); };
  f.parseInline = E.parseInline;
  f.Parser = b;
  f.parser = b.parse;
  f.Renderer = P;
  f.TextRenderer = L;
  f.Lexer = x;
  f.lexer = x.lex;
  f.Tokenizer = y;
  f.Hooks = S;
  f.parse = f;
  var nn = f.options, rn = f.setOptions, sn = f.walkTokens, on = f.parseInline, an = f, ln = b.parse, pn = x.lex;
  exports.options = nn;
  exports.setOptions = rn;
  exports.walkTokens = sn;
  exports.parseInline = on;
  exports.parse = an;
  exports.parser = ln;
  exports.lexer = pn;
  //# sourceMappingURL=marked.esm.js.map

  }),
  (function (module, exports, require) {
  "use strict";
  var __importDefault = (this && this.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.renderMarkdown = renderMarkdown;
  /**
   * Markdown 渲染：marked（GFM）解析 + DOMPurify 消毒（防 XSS）。
   * 工作区文件视为半可信内容：渲染前必须过消毒层，禁止原始 HTML 直出。
   */
  const dompurify_1 = __importDefault(require(25));
  const marked_1 = require(26);
  function renderMarkdown(source) {
      const raw = marked_1.marked.parse(source, { async: false, gfm: true, breaks: false });
      return dompurify_1.default.sanitize(raw, {
          USE_PROFILES: { html: true },
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'align', 'class'],
      });
  }

  }),
  (function (module, exports, require) {
  "use strict";
  /**
   * Host/Client 共享的 HTTP 路由契约 —— Host 注册这些路由，浏览器端通过
   * 同源 fetch 调用。路由与参数名是两端唯一需要保持一致的部分。
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ROUTE_READ = exports.ROUTE_SEARCH = exports.ROUTE_DIR = exports.ROUTE_LIST = void 0;
  /** 工作区根目录列表（一层的条目 + 根路径）。参数：session。 */
  exports.ROUTE_LIST = '/dsh-workspace-files/list';
  /** 单层目录列表。参数：session、path（相对路径）。 */
  exports.ROUTE_DIR = '/dsh-workspace-files/dir';
  /** 全工作区文件名搜索。参数：session、q。 */
  exports.ROUTE_SEARCH = '/dsh-workspace-files/search';
  /** 单文件只读预览。参数：session、path（相对路径）。 */
  exports.ROUTE_READ = '/dsh-workspace-files/read';

  }),
  (function (module, exports, require) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });

  }),
  (function (module, exports, require) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readFile = exports.searchFiles = exports.listDir = exports.listRoot = void 0;
  exports.rpc = rpc;
  /**
   * Host 路由的同源 fetch 封装 —— 与 src/contract.ts 的路由/参数名对齐。
   */
  const contract_js_1 = require(28);
  async function rpc(route, params) {
      const parts = [];
      for (const key of Object.keys(params)) {
          const value = params[key];
          if (value === undefined || value === null)
              continue;
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
      }
      const url = route + (parts.length > 0 ? '?' + parts.join('&') : '');
      const res = await fetch(url);
      return res.json();
  }
  const listRoot = (session) => rpc(contract_js_1.ROUTE_LIST, { session });
  exports.listRoot = listRoot;
  const listDir = (session, path) => rpc(contract_js_1.ROUTE_DIR, { session, path });
  exports.listDir = listDir;
  const searchFiles = (session, q) => rpc(contract_js_1.ROUTE_SEARCH, { session, q });
  exports.searchFiles = searchFiles;
  const readFile = (session, path) => rpc(contract_js_1.ROUTE_READ, { session, path });
  exports.readFile = readFile;

  }),
  (function (module, exports, require) {
  "use strict";
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || (function () {
      var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function (o) {
              var ar = [];
              for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
              return ar;
          };
          return ownKeys(o);
      };
      return function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          __setModuleDefault(result, mod);
          return result;
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.FilesView = FilesView;
  /**
   * “文件”视图组件：面包屑一层一屏浏览 + 全局搜索 + 预览。
   *
   * 交互模型（类手机文件管理器）：
   * - 每屏只显示当前一层；点击目录进入、← 返回上级、面包屑任意跳转；
   * - 筛选框触发 Host 端全工作区搜索，点击结果目录直接进入；
   * - 单击文件在右侧预览（带行号 + 语法高亮 / 图片渲染），双击系统打开；
   * - 状态按会话持久化在插件级 store 中，切换“对话/轨迹/文件”标签后恢复。
   */
  const React = __importStar(require("react"));
  const highlight_js_1 = require(23);
  const icons_js_1 = require(24);
  const markdown_js_1 = require(27);
  const rpc_js_1 = require(30);
  const ERROR_TEXT = {
      NO_WORKSPACE: '当前会话没有关联工作区',
      NOT_FOUND: '工作区目录不存在',
      NOT_A_DIRECTORY: '工作区路径不是目录',
      LIST_FAILED: '文件列表读取失败',
      READ_FAILED: '文件读取失败',
      OUT_OF_BOUNDS: '路径超出工作区范围',
      NOT_A_FILE: '目标不是文件',
      SEARCH_FAILED: '搜索失败',
  };
  function fmtSize(n) {
      if (typeof n !== 'number')
          return '';
      if (n < 1024)
          return n + ' B';
      if (n < 1048576)
          return (n / 1024).toFixed(1) + ' KB';
      return (n / 1048576).toFixed(1) + ' MB';
  }
  function parentOf(path) {
      if (path === '')
          return '';
      const i = path.lastIndexOf('/');
      return i < 0 ? '' : path.slice(0, i);
  }
  const sessionStores = new Map();
  const loadedSids = new Set();
  function sessionStore(sid) {
      let store = sessionStores.get(sid);
      if (store === undefined) {
          store = {
              state: { phase: 'loading', root: '', entries: [], error: '' },
              dirData: {},
              pending: {},
              currentPath: '',
              filter: '',
              treeVisible: true,
              preview: null,
              doc: { phase: 'idle', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: '' },
              search: { phase: 'idle', query: '', matches: [], truncated: false },
              mdView: 'render',
          };
          sessionStores.set(sid, store);
      }
      return store;
  }
  function FilesView(props) {
      const sid = typeof props.sessionId === 'string' ? props.sessionId : '';
      const workspaces = props.workspaces;
      const store = sessionStore(sid);
      const [state, setState] = React.useState(store.state);
      const [dirData, setDirData] = React.useState(store.dirData);
      const [pending, setPending] = React.useState(store.pending);
      const [currentPath, setCurrentPath] = React.useState(store.currentPath);
      const [filter, setFilter] = React.useState(store.filter);
      const [reloadKey, setReloadKey] = React.useState(0);
      const [treeVisible, setTreeVisible] = React.useState(store.treeVisible);
      const [preview, setPreview] = React.useState(store.preview);
      const [doc, setDoc] = React.useState(store.doc);
      const [search, setSearch] = React.useState(store.search);
      const [mdView, setMdView] = React.useState(store.mdView);
      // 状态镜像回 store（组件因标签切换卸载时，store 存活并恢复）。
      React.useEffect(() => { store.state = state; }, [state, sid]);
      React.useEffect(() => { store.dirData = dirData; }, [dirData, sid]);
      React.useEffect(() => { store.pending = pending; }, [pending, sid]);
      React.useEffect(() => { store.currentPath = currentPath; }, [currentPath, sid]);
      React.useEffect(() => { store.filter = filter; }, [filter, sid]);
      React.useEffect(() => { store.treeVisible = treeVisible; }, [treeVisible, sid]);
      React.useEffect(() => { store.preview = preview; }, [preview, sid]);
      React.useEffect(() => { store.doc = doc; }, [doc, sid]);
      React.useEffect(() => { store.search = search; }, [search, sid]);
      React.useEffect(() => { store.mdView = mdView; }, [mdView, sid]);
      // 根目录列表：新会话全量重置；重进标签时静默刷新。
      React.useEffect(() => {
          const isNewSession = !loadedSids.has(sid);
          loadedSids.add(sid);
          if (isNewSession) {
              setDirData({});
              setPending({});
              setCurrentPath('');
              setPreview(null);
              setFilter('');
          }
          let alive = true;
          setState((prev) => (prev.phase === 'ready' ? prev : { phase: 'loading', root: '', entries: [], error: '' }));
          (0, rpc_js_1.listRoot)(sid).then((res) => {
              if (!alive)
                  return;
              if (res.ok) {
                  setState({ phase: 'ready', root: res.root, entries: res.entries, error: '' });
                  setDirData((d) => ({ ...d, '': res.entries }));
              }
              else {
                  setState({ phase: 'error', root: '', entries: [], error: res.error });
              }
          }).catch(() => {
              if (alive)
                  setState({ phase: 'error', root: '', entries: [], error: 'UNKNOWN' });
          });
          return () => { alive = false; };
      }, [sid, reloadKey]);
      // 预览加载：store 中同路径的已就绪内容直接复用。
      React.useEffect(() => {
          if (preview === null) {
              setDoc({ phase: 'idle', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: '' });
              return;
          }
          if (store.doc.forPath === preview.path && store.doc.phase === 'ready')
              return;
          let alive = true;
          setDoc({ phase: 'loading', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: preview.path });
          (0, rpc_js_1.readFile)(sid, preview.path).then((res) => {
              if (!alive)
                  return;
              if (res.ok) {
                  setDoc({
                      phase: 'ready', kind: res.kind, text: res.text ?? '', dataUrl: res.dataUrl ?? '',
                      size: res.size, truncated: res.truncated === true, error: '', forPath: preview.path,
                  });
              }
              else {
                  setDoc({ phase: 'error', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: res.error, forPath: preview.path });
              }
          }).catch(() => {
              if (alive)
                  setDoc({ phase: 'error', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: 'UNKNOWN', forPath: preview.path });
          });
          return () => { alive = false; };
      }, [preview, sid]);
      // 全局搜索（输入即搜，Host 端有界遍历）。
      const q = filter.trim().toLowerCase();
      React.useEffect(() => {
          if (q === '') {
              setSearch({ phase: 'idle', query: '', matches: [], truncated: false });
              return;
          }
          let alive = true;
          setSearch({ phase: 'loading', query: q, matches: [], truncated: false });
          (0, rpc_js_1.searchFiles)(sid, q).then((res) => {
              if (!alive)
                  return;
              if (res.ok) {
                  setSearch({ phase: 'ready', query: q, matches: res.matches, truncated: res.truncated });
              }
              else {
                  setSearch({ phase: 'error', query: q, matches: [], truncated: false });
              }
          }).catch(() => {
              if (alive)
                  setSearch({ phase: 'error', query: q, matches: [], truncated: false });
          });
          return () => { alive = false; };
      }, [q, sid]);
      const fetchDir = (path) => {
          if (path === '' || dirData[path] !== undefined || pending[path] === true)
              return;
          setPending((p) => ({ ...p, [path]: true }));
          (0, rpc_js_1.listDir)(sid, path).then((res) => {
              setDirData((d) => ({ ...d, [path]: res.ok ? res.entries : [] }));
          }).catch(() => {
              setDirData((d) => ({ ...d, [path]: [] }));
          }).then(() => setPending((p) => ({ ...p, [path]: false })));
      };
      const navigate = (path) => {
          setCurrentPath(path);
          if (path !== '')
              fetchDir(path);
      };
      const goUp = () => navigate(parentOf(currentPath));
      const openPath = (abs) => {
          if (typeof abs === 'string' && abs !== '' && workspaces !== undefined)
              workspaces.openPath(abs).catch(() => { });
      };
      const openRoot = () => {
          if (state.root !== '' && workspaces !== undefined)
              workspaces.openPath(state.root).catch(() => { });
      };
      const openPreview = (node) => {
          setPreview({ path: node.path, abs: node.abs, name: node.name });
      };
      const isActive = (node) => preview !== null && preview.path === node.path;
      function renderRow(node) {
          if (node.type === 'dir') {
              return React.createElement('div', {
                  key: node.path || node.name, className: 'dshfm-row',
                  onClick: () => navigate(node.path), title: node.path || node.name,
              }, React.createElement('span', { className: 'dshfm-chev' }, '\u203A'), (0, icons_js_1.folderSvg)('dshfm-icon dshfm-icon-folder'), React.createElement('span', { className: 'dshfm-name' }, node.name + '/'), React.createElement('span', { className: 'dshfm-size' }, ''));
          }
          const cls = isActive(node) ? 'dshfm-row dshfm-row-active' : 'dshfm-row';
          return React.createElement('div', {
              key: node.path || node.name, className: cls,
              onClick: () => openPreview(node), onDoubleClick: () => openPath(node.abs), title: node.path || node.name,
          }, React.createElement('span', { className: 'dshfm-chev' }, ''), (0, icons_js_1.fileIcon)(node.name), React.createElement('span', { className: 'dshfm-name' }, node.name), React.createElement('span', { className: 'dshfm-size' }, fmtSize(node.size)));
      }
      function renderCrumbs() {
          const rootLabel = state.root === '' ? '工作区' : (state.root.split('/').filter(Boolean).pop() || state.root);
          const items = [];
          items.push(React.createElement('button', {
              key: 'root', type: 'button', className: 'dshfm-crumb',
              disabled: currentPath === '', onClick: () => navigate(''), title: state.root || '工作区',
          }, rootLabel));
          if (currentPath !== '') {
              const parts = currentPath.split('/');
              let acc = '';
              for (let i = 0; i < parts.length; i += 1) {
                  acc = acc === '' ? parts[i] : acc + '/' + parts[i];
                  const p = acc;
                  const isLast = i === parts.length - 1;
                  items.push(React.createElement('span', { key: 's' + i, className: 'dshfm-crumb-sep' }, '\u203A'));
                  items.push(React.createElement('button', {
                      key: 'c' + i, type: 'button', className: 'dshfm-crumb',
                      disabled: isLast, onClick: () => navigate(p),
                  }, parts[i]));
              }
          }
          return items;
      }
      const curEntries = dirData[currentPath];
      const curPending = pending[currentPath] === true;
      let treeBody;
      if (q !== '') {
          if (search.phase === 'loading') {
              treeBody = React.createElement('div', { className: 'dshfm-center' }, '搜索中…');
          }
          else if (search.phase === 'error') {
              treeBody = React.createElement('div', { className: 'dshfm-center' }, '搜索失败');
          }
          else if (search.phase === 'ready' && search.matches.length === 0) {
              treeBody = React.createElement('div', { className: 'dshfm-center' }, '没有匹配的文件');
          }
          else if (search.phase === 'ready') {
              const rows = search.matches.map((m) => {
                  if (m.type === 'dir') {
                      return React.createElement('div', {
                          key: 'd' + m.path, className: 'dshfm-row',
                          onClick: () => { navigate(m.path); setFilter(''); }, title: m.path,
                      }, (0, icons_js_1.folderSvg)('dshfm-icon dshfm-icon-folder'), React.createElement('span', { className: 'dshfm-name' }, m.path + '/'), React.createElement('span', { className: 'dshfm-size' }, ''));
                  }
                  const cls = isActive(m) ? 'dshfm-row dshfm-row-active' : 'dshfm-row';
                  return React.createElement('div', {
                      key: 'f' + m.path, className: cls,
                      onClick: () => openPreview(m), onDoubleClick: () => openPath(m.abs), title: m.path,
                  }, (0, icons_js_1.fileIcon)(m.name), React.createElement('span', { className: 'dshfm-name' }, m.path), React.createElement('span', { className: 'dshfm-size' }, fmtSize(m.size)));
              });
              treeBody = search.truncated
                  ? React.createElement(React.Fragment, null, rows, React.createElement('div', { className: 'dshfm-note', style: { borderTop: 'none' } }, '匹配过多，仅显示前 200 条'))
                  : rows;
          }
      }
      else if (state.phase === 'loading') {
          treeBody = React.createElement('div', { className: 'dshfm-center' }, '加载中…');
      }
      else if (state.phase === 'error') {
          treeBody = React.createElement('div', { className: 'dshfm-center' }, ERROR_TEXT[state.error] ?? ('加载失败：' + state.error));
      }
      else if (curEntries === undefined || curPending) {
          treeBody = React.createElement('div', { className: 'dshfm-center' }, '加载中…');
      }
      else if (curEntries.length === 0) {
          treeBody = React.createElement('div', { className: 'dshfm-center' }, '此目录为空');
      }
      else {
          treeBody = curEntries.map((entry) => renderRow(entry));
      }
      function renderCodeView(text, lang) {
          const lines = text.split('\n');
          const capped = lines.length > 3000;
          const shownText = capped ? lines.slice(0, 3000).join('\n') : text;
          const html = (0, highlight_js_1.highlightCode)(shownText, lang);
          const count = capped ? 3000 : lines.length;
          const gutter = [];
          for (let i = 0; i < count; i += 1)
              gutter.push(React.createElement('div', { className: 'dshfm-ln', key: i }, String(i + 1)));
          return React.createElement('div', { className: 'dshfm-code' }, React.createElement('div', { className: 'dshfm-gutter' }, gutter), React.createElement('div', { className: 'dshfm-code-text' }, React.createElement('pre', { className: 'dshfm-code-pre', dangerouslySetInnerHTML: { __html: html } })));
      }
      function renderPreviewBody() {
          if (preview === null)
              return React.createElement('div', { className: 'dshfm-center' }, '点击左侧文件进行预览，双击可在系统中打开');
          if (doc.phase === 'loading')
              return React.createElement('div', { className: 'dshfm-center' }, '加载中…');
          if (doc.phase === 'error')
              return React.createElement('div', { className: 'dshfm-center' }, '预览失败：' + (ERROR_TEXT[doc.error] ?? doc.error));
          if (doc.kind === 'text') {
              // Markdown：默认渲染视图（marked + DOMPurify），可切换源码视图。
              if ((0, highlight_js_1.isMarkdown)(preview.name) && mdView === 'render') {
                  const html = (0, markdown_js_1.renderMarkdown)(doc.text);
                  return React.createElement('div', { className: 'dshfm-md', dangerouslySetInnerHTML: { __html: html } });
              }
              return renderCodeView(doc.text, (0, highlight_js_1.detectLang)(preview.name));
          }
          if (doc.kind === 'image') {
              return React.createElement('div', { style: { padding: 12 } }, React.createElement('img', { className: 'dshfm-img', src: doc.dataUrl, alt: preview.name }));
          }
          return React.createElement('div', { className: 'dshfm-center' }, React.createElement('div', null, '二进制文件，无法直接预览'), React.createElement('div', { style: { marginTop: 6 } }, fmtSize(doc.size)), React.createElement('button', { type: 'button', className: 'dshfm-btn', style: { marginTop: 14 }, onClick: () => openPath(preview.abs) }, '在系统中打开'));
      }
      let note = null;
      if (preview !== null && doc.phase === 'ready' && doc.kind === 'text' && (doc.truncated || doc.text.split('\n').length > 3000)) {
          note = React.createElement('div', { className: 'dshfm-note' }, '内容过长，仅预览前 256 KB');
      }
      return React.createElement('div', { className: 'dshfm-root', 'data-conversation-composer-overlay': '' }, React.createElement('div', { className: 'dshfm-bar' }, React.createElement('button', { type: 'button', className: treeVisible ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', title: '显示/隐藏目录', onClick: () => setTreeVisible((v) => !v) }, '☰'), React.createElement('span', { className: 'dshfm-path', title: state.root }, state.root || '—'), React.createElement('input', { className: 'dshfm-input', value: filter, placeholder: '筛选…', onChange: (e) => setFilter(e.target.value) }), React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setReloadKey((k) => k + 1) }, '刷新'), React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: openRoot, disabled: state.root === '' }, '打开目录')), React.createElement('div', { className: 'dshfm-main' }, treeVisible ? React.createElement('div', { className: 'dshfm-tree' }, React.createElement('div', { className: 'dshfm-tree-head' }, React.createElement('button', { type: 'button', className: 'dshfm-btn dshfm-back', title: '返回上一级', disabled: currentPath === '', onClick: goUp }, '\u2190'), React.createElement('div', { className: 'dshfm-crumbs' }, renderCrumbs())), React.createElement('div', { className: 'dshfm-tree-body' }, treeBody)) : null, React.createElement('div', { className: 'dshfm-preview' }, React.createElement('div', { className: 'dshfm-preview-head' }, React.createElement('span', { className: 'dshfm-preview-name' }, preview === null ? '预览' : preview.name), preview === null ? null : React.createElement('span', { className: 'dshfm-preview-meta', title: preview.path }, preview.path + (doc.size > 0 ? ' · ' + fmtSize(doc.size) : '')), React.createElement('span', { className: 'dshfm-preview-spacer' }), preview !== null && doc.kind === 'text' && (0, highlight_js_1.isMarkdown)(preview.name)
          ? React.createElement('button', {
              type: 'button',
              className: mdView === 'render' ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn',
              onClick: () => setMdView((v) => (v === 'render' ? 'source' : 'render')),
          }, mdView === 'render' ? '源码' : '预览')
          : null, preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => openPath(preview.abs) }, '在系统中打开'), preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setPreview(null) }, '关闭')), React.createElement('div', { className: 'dshfm-preview-body' }, renderPreviewBody()), note)));
  }

  }),
  (function (module, exports, require) {
  "use strict";
  /**
   * 插件自有样式与注入。
   *
   * 颜色全部走 DSH 主题变量（--dsw-alias-*），自动跟随明暗主题；
   * 样式标签带 data-plugin 标记，幂等注入一次。
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CSS = void 0;
  exports.ensureCss = ensureCss;
  exports.CSS = `
    .dshfm-root { height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
    .dshfm-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); flex: none; }
    .dshfm-path { flex: 1; min-width: 0; font-family: var(--ds-font-family-code); font-size: 12px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dshfm-btn { flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; cursor: pointer; }
    .dshfm-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
    .dshfm-btn:disabled { opacity: 0.45; cursor: default; }
    .dshfm-btn-on { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
    .dshfm-input { flex: none; width: 140px; padding: 4px 8px; font-size: 12px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; outline: none; }
    .dshfm-input:focus { border-color: var(--dsw-alias-interactive-bg-hover); }
    .dshfm-main { flex: 1; min-height: 0; min-width: 0; display: flex; overflow: hidden; }
    .dshfm-tree { flex: none; width: 280px; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid var(--dsw-alias-border-l2); }
    .dshfm-tree-head { flex: none; display: flex; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
    .dshfm-back { padding: 2px 8px; }
    .dshfm-crumbs { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; overflow-x: auto; overscroll-behavior: contain; white-space: nowrap; }
    .dshfm-crumb { flex: none; border: none; background: transparent; padding: 2px 6px; border-radius: 4px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); cursor: pointer; white-space: nowrap; }
    .dshfm-crumb:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
    .dshfm-crumb:disabled { cursor: default; color: var(--dsw-alias-label-primary); font-weight: 500; }
    .dshfm-crumb-sep { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 11px; }
    .dshfm-tree-body { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding: 4px 0 96px; }
    .dshfm-preview { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
    .dshfm-preview-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
    .dshfm-preview-name { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dshfm-preview-meta { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dshfm-preview-spacer { flex: 1; }
    .dshfm-preview-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding-bottom: 96px; background: var(--dsw-alias-bg-base); }
    .dshfm-code { display: flex; min-width: 100%; width: max-content; font-family: var(--ds-font-family-code); font-size: 12px; }
    .dshfm-gutter { flex: none; padding: 10px 0; text-align: right; color: var(--dsw-alias-label-dimmed); user-select: none; border-right: 1px solid var(--dsw-alias-border-l2); }
    .dshfm-ln { line-height: 18px; padding: 0 10px 0 14px; }
    .dshfm-code-text { padding: 10px 16px; }
    .dshfm-code-pre { margin: 0; font: inherit; line-height: 18px; white-space: pre; }
    .dshfm-line { line-height: 18px; white-space: pre; }

    /* highlight.js token 主题（VS Code Dark+ 近似配色） */
    .dshfm-code-pre .hljs-comment, .dshfm-code-pre .hljs-quote { color: #6a9955; font-style: italic; }
    .dshfm-code-pre .hljs-keyword, .dshfm-code-pre .hljs-selector-tag, .dshfm-code-pre .hljs-doctag, .dshfm-code-pre .hljs-formula { color: #c586c0; }
    .dshfm-code-pre .hljs-string, .dshfm-code-pre .hljs-regexp, .dshfm-code-pre .hljs-addition { color: #ce9178; }
    .dshfm-code-pre .hljs-number, .dshfm-code-pre .hljs-literal { color: #b5cea8; }
    .dshfm-code-pre .hljs-title, .dshfm-code-pre .hljs-section, .dshfm-code-pre .hljs-title.function_ { color: #dcdcaa; }
    .dshfm-code-pre .hljs-built_in, .dshfm-code-pre .hljs-type, .dshfm-code-pre .hljs-class .hljs-title, .dshfm-code-pre .hljs-title.class_ { color: #4ec9b0; }
    .dshfm-code-pre .hljs-attr, .dshfm-code-pre .hljs-attribute, .dshfm-code-pre .hljs-variable, .dshfm-code-pre .hljs-template-variable, .dshfm-code-pre .hljs-name, .dshfm-code-pre .hljs-tag { color: #9cdcfe; }
    .dshfm-code-pre .hljs-symbol, .dshfm-code-pre .hljs-bullet, .dshfm-code-pre .hljs-link, .dshfm-code-pre .hljs-meta, .dshfm-code-pre .hljs-params { color: #569cd6; }
    .dshfm-code-pre .hljs-deletion { color: #f44747; }
    .dshfm-code-pre .hljs-emphasis { font-style: italic; }
    .dshfm-code-pre .hljs-strong { font-weight: 700; }

    /* Markdown 渲染视图 */
    .dshfm-md { padding: 16px 22px 32px; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-primary); max-width: 880px; }
    .dshfm-md h1, .dshfm-md h2, .dshfm-md h3, .dshfm-md h4, .dshfm-md h5, .dshfm-md h6 { margin: 18px 0 10px; font-weight: 600; line-height: 1.4; }
    .dshfm-md h1 { font-size: 20px; border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 8px; }
    .dshfm-md h2 { font-size: 17px; border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 6px; }
    .dshfm-md h3 { font-size: 15px; }
    .dshfm-md p { margin: 8px 0; }
    .dshfm-md code { background: var(--dsw-alias-markdown-code-block); padding: 2px 6px; border-radius: 4px; font-family: var(--ds-font-family-code); font-size: 12px; }
    .dshfm-md pre { background: var(--dsw-alias-markdown-code-block); padding: 12px 14px; border-radius: 8px; overflow: auto; margin: 10px 0; }
    .dshfm-md pre code { background: none; padding: 0; white-space: pre; }
    .dshfm-md a { color: var(--dsw-alias-state-business-primary); text-decoration: none; }
    .dshfm-md a:hover { text-decoration: underline; }
    .dshfm-md blockquote { border-left: 3px solid var(--dsw-alias-border-l2); margin: 10px 0; padding: 2px 14px; color: var(--dsw-alias-label-secondary); }
    .dshfm-md ul, .dshfm-md ol { padding-left: 24px; margin: 8px 0; }
    .dshfm-md li { margin: 3px 0; }
    .dshfm-md table { border-collapse: collapse; margin: 12px 0; }
    .dshfm-md th, .dshfm-md td { border: 1px solid var(--dsw-alias-border-l2); padding: 5px 12px; }
    .dshfm-md th { background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }
    .dshfm-md img { max-width: 100%; border-radius: 6px; }
    .dshfm-md hr { border: none; border-top: 1px solid var(--dsw-alias-border-l2); margin: 16px 0; }
    .dshfm-img { max-width: 100%; max-height: 70vh; display: block; margin: 16px auto; border-radius: 6px; }
    .dshfm-center { padding: 48px 16px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
    .dshfm-note { flex: none; padding: 6px 12px; font-size: 11px; color: var(--dsw-alias-label-tertiary); border-top: 1px solid var(--dsw-alias-border-l2); }
    .dshfm-row { display: flex; align-items: center; gap: 6px; padding: 2px 10px; font-size: 13px; line-height: 26px; cursor: pointer; user-select: none; }
    .dshfm-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
    .dshfm-row-active { background: var(--dsw-alias-interactive-bg-hover); }
    .dshfm-icon { flex: none; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; color: var(--dsw-alias-label-tertiary); }
    .dshfm-icon-folder { color: #f2a51a; }
    .dshfm-chev { flex: none; width: 12px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: var(--dsw-alias-label-tertiary); }
    .dshfm-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-primary); }
    .dshfm-size { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); }
  `;
  const TAG_ID = '@deepseek-ai/dsh-workspace-files/client.css';
  /** 幂等地把插件样式注入 document（静态 bundle 的标准做法）。 */
  function ensureCss() {
      if (typeof document === 'undefined')
          return;
      if (document.querySelector('style[data-plugin-css=' + JSON.stringify(TAG_ID) + ']') !== null)
          return;
      const tag = document.createElement('style');
      tag.dataset.plugin = '@deepseek-ai/dsh-workspace-files';
      tag.dataset.pluginCss = TAG_ID;
      tag.textContent = exports.CSS;
      document.head.appendChild(tag);
  }

  }),
  (function (module, exports, require) {
  "use strict";
  var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (this && this.__importStar) || (function () {
      var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function (o) {
              var ar = [];
              for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
              return ar;
          };
          return ownKeys(o);
      };
      return function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          __setModuleDefault(result, mod);
          return result;
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.name = void 0;
  exports.apply = apply;
  const React = __importStar(require("react"));
  const files_view_js_1 = require(31);
  const styles_js_1 = require(32);
  exports.name = 'dsh-workspace-files';
  function apply(ctx) {
      const slots = ctx.get('slots');
      if (slots === undefined)
          return;
      const workspaces = ctx.get('workspaces');
      (0, styles_js_1.ensureCss)();
      slots.inject('conversation.view', () => slots.register({ name: 'conversation.view', id: 'files', order: 11, label: () => '文件' }, (props) => React.createElement(files_view_js_1.FilesView, { ...props, workspaces })));
  }

  })
    ];
    function __r(id) {
      if (typeof id !== 'number') return require(id);
      if (cache[id]) return cache[id].exports;
      var module = { exports: {} };
      cache[id] = module;
      factories[id](module, module.exports, __r);
      return module.exports;
    }
    return __r(33);
  }
});
