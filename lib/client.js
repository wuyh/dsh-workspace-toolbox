window.__ModuleLoader__.load({
  id: "dsh-workspace-files",
  factory: (require) => {
    var cache = {};
    var factories = [
  (function (module, exports, require) {
  "use strict";
  /**
   * 轻量语法高亮：按扩展名选语言，逐行正则分词着色（VS Code Dark+ 配色）。
   *
   * 有意保持“够用”而非完备：单行扫描、超长行跳过，保证大文件预览不卡顿；
   * 每种语言一组有序规则，先匹配者胜出（注释、字符串、数字、关键字、字面量、调用、类型）。
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hlFor = hlFor;
  exports.tokenizeLine = tokenizeLine;
  exports.detectLang = detectLang;
  const HL_RULES = {
      js: [
          [/\/\/.*|\/\*.*\*\//, '#6a9955'],
          [/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/, '#ce9178'],
          [/\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, '#b5cea8'],
          [/\b(?:function|return|if|else|for|while|do|switch|case|default|break|continue|const|let|var|class|extends|super|new|import|export|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|yield|static|get|set|interface|type|enum|implements|public|private|protected|readonly|declare|namespace|module|require)\b/, '#c586c0'],
          [/\b(?:true|false|null|undefined|this|NaN|Infinity)\b/, '#569cd6'],
          [/\b[A-Za-z_$][\w$]*(?=\()/, '#dcdcaa'],
          [/\b[A-Z][A-Za-z0-9_]*\b/, '#4ec9b0'],
      ],
      py: [
          [/#.*/, '#6a9955'],
          [/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/, '#ce9178'],
          [/\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, '#b5cea8'],
          [/\b(?:def|return|if|elif|else|for|while|in|not|and|or|is|import|from|as|class|try|except|finally|raise|with|lambda|yield|pass|break|continue|global|nonlocal|assert|del|async|await)\b/, '#c586c0'],
          [/\b(?:True|False|None|self|cls)\b/, '#569cd6'],
          [/\b[A-Za-z_][\w]*(?=\()/, '#dcdcaa'],
          [/@[\w.]+/, '#dcdcaa'],
      ],
      go: [
          [/\/\/.*|\/\*.*\*\//, '#6a9955'],
          [/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"/, '#ce9178'],
          [/\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, '#b5cea8'],
          [/\b(?:func|return|if|else|for|range|switch|case|default|break|continue|package|import|var|const|type|struct|interface|map|chan|go|defer|select|fallthrough|goto)\b/, '#c586c0'],
          [/\b(?:true|false|nil)\b/, '#569cd6'],
          [/\b[A-Za-z_][\w]*(?=\()/, '#dcdcaa'],
      ],
      rust: [
          [/\/\/.*|\/\*.*\*\//, '#6a9955'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
          [/\b0[xX][0-9a-fA-F_]+\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, '#b5cea8'],
          [/\b(?:fn|let|mut|return|if|else|for|while|loop|match|impl|struct|enum|trait|pub|use|mod|as|in|move|ref|where|async|await|dyn|self|Self|super|crate|unsafe|extern|type|const|static)\b/, '#c586c0'],
          [/\b(?:true|false|None|Some|Ok|Err)\b/, '#569cd6'],
          [/\b[A-Za-z_][\w]*(?=\()/, '#dcdcaa'],
      ],
      c: [
          [/\/\/.*|\/\*.*\*\//, '#6a9955'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
          [/\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFlLdDuU]*\b/, '#b5cea8'],
          [/\b(?:if|else|for|while|do|switch|case|default|break|continue|return|struct|class|interface|enum|public|private|protected|static|final|void|int|long|short|char|float|double|bool|boolean|String|var|val|fun|let|const|new|delete|this|super|try|catch|finally|throw|throws|namespace|using|import|package|extends|implements|abstract|override|virtual|template|typename|sizeof|typedef|unsigned|signed|auto|async|await|func)\b/, '#c586c0'],
          [/\b(?:true|false|null|nil|NULL|None)\b/, '#569cd6'],
          [/\b[A-Za-z_][\w]*(?=\()/, '#dcdcaa'],
          [/\b[A-Z][A-Za-z0-9_]*\b/, '#4ec9b0'],
      ],
      css: [
          [/\/\*.*\*\//, '#6a9955'],
          [/#[0-9a-fA-F]{3,8}\b/, '#ce9178'],
          [/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/, '#ce9178'],
          [/\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|pt|ch|ex)?\b/, '#b5cea8'],
          [/@[\w-]+/, '#c586c0'],
          [/[\w-]+(?=\s*:)/, '#9cdcfe'],
          [/\b[\w-]+(?=\()/, '#dcdcaa'],
      ],
      html: [
          [/<!--.*-->/, '#6a9955'],
          [/&[a-zA-Z]+;|&#\d+;/, '#b5cea8'],
          [/<\/?[a-zA-Z][\w-]*/, '#569cd6'],
          [/[a-zA-Z-]+(?==)/, '#9cdcfe'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
      ],
      json: [
          [/"(?:\\.|[^"\\\n])*"(?=\s*:)/, '#9cdcfe'],
          [/"(?:\\.|[^"\\\n])*"/, '#ce9178'],
          [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, '#b5cea8'],
          [/\b(?:true|false|null)\b/, '#569cd6'],
      ],
      yaml: [
          [/#.*/, '#6a9955'],
          [/^\s*[\w.-]+(?=\s*:)/, '#9cdcfe'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
          [/\b\d+(?:\.\d+)?\b/, '#b5cea8'],
          [/\b(?:true|false|null|yes|no|on|off)\b/, '#569cd6'],
      ],
      sh: [
          [/#.*/, '#6a9955'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
          [/\$\{?[\w@*#?$!-]+\}?/, '#9cdcfe'],
          [/\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|local|export|readonly|shift|source|echo|cd|alias|unset|set)\b/, '#c586c0'],
          [/\b\d+\b/, '#b5cea8'],
          [/\b(?:sudo|git|npm|pnpm|yarn|node|python3?|curl|wget|grep|sed|awk|cat|ls|mkdir|rm|mv|cp|tar|ssh|docker|kubectl|brew|make)\b/, '#dcdcaa'],
      ],
      sql: [
          [/--.*|\/\*.*\*\//, '#6a9955'],
          [/'(?:''|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/, '#ce9178'],
          [/\b\d+(?:\.\d+)?\b/, '#b5cea8'],
          [/\b(?:select|from|where|and|or|not|insert|into|values|update|set|delete|create|table|index|view|drop|alter|add|join|left|right|inner|outer|on|group|by|order|having|limit|offset|union|all|distinct|as|case|when|then|else|end|between|like|in|is|null|primary|key|foreign|references|constraint|default|unique|exists)\b/, '#c586c0'],
          [/\b[A-Za-z_][\w]*(?=\()/, '#dcdcaa'],
      ],
      md: [
          [/^#{1,6}\s.*$/, '#569cd6'],
          [/`[^`\n]*`/, '#ce9178'],
          [/\*\*[^*\n]+\*\*/, '#dcdcaa'],
          [/https?:\/\/[^\s)]+/, '#4ec9b0'],
          [/^>\s?.*$/, '#6a9955'],
      ],
      xml: [
          [/<!--.*-->/, '#6a9955'],
          [/<\/?[a-zA-Z][\w:.-]*/, '#569cd6'],
          [/[a-zA-Z:-]+(?==)/, '#9cdcfe'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/, '#ce9178'],
      ],
      ini: [
          [/[;#].*/, '#6a9955'],
          [/^\[[^\]]*\]/, '#569cd6'],
          [/^\s*[\w.-]+(?=\s*=)/, '#9cdcfe'],
          [/\b(?:true|false|yes|no|null|on|off)\b/i, '#b5cea8'],
          [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b\d+(?:\.\d+)?\b/, '#ce9178'],
      ],
  };
  /** 个别语言整体忽略大小写（SQL/INI 的关键字）。 */
  const HL_FLAGS = { sql: 'gi', ini: 'gi' };
  const HL_CACHE = {};
  /** 按语言编译（缓存）合并正则：一个捕获组对应一条规则。 */
  function hlFor(lang) {
      if (HL_CACHE[lang] !== undefined)
          return HL_CACHE[lang] ?? null;
      const rules = HL_RULES[lang];
      if (rules === undefined || rules.length === 0) {
          HL_CACHE[lang] = null;
          return null;
      }
      const re = new RegExp(rules.map((r) => '(' + r[0].source + ')').join('|'), HL_FLAGS[lang] || 'g');
      const compiled = { re, colors: rules.map((r) => r[1]) };
      HL_CACHE[lang] = compiled;
      return compiled;
  }
  /** 单行分词：未命中规则的片段保持原色（color 为空串）。 */
  function tokenizeLine(line, hl) {
      const tokens = [];
      let last = 0;
      hl.re.lastIndex = 0;
      let m;
      while ((m = hl.re.exec(line)) !== null) {
          if (m[0] === '') {
              hl.re.lastIndex += 1;
              continue;
          }
          if (m.index > last)
              tokens.push({ text: line.slice(last, m.index), color: '' });
          let color = '';
          for (let g = 1; g < m.length; g += 1) {
              if (m[g] !== undefined) {
                  color = hl.colors[g - 1] ?? '';
                  break;
              }
          }
          tokens.push({ text: m[0], color });
          last = m.index + m[0].length;
          if (hl.re.lastIndex <= m.index)
              hl.re.lastIndex = m.index + 1;
      }
      if (last < line.length)
          tokens.push({ text: line.slice(last), color: '' });
      return tokens;
  }
  /** 扩展名 → 语言键。 */
  function detectLang(name) {
      const dot = name.lastIndexOf('.');
      const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
      if (['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'].includes(ext))
          return 'js';
      if (ext === 'py')
          return 'py';
      if (ext === 'go')
          return 'go';
      if (ext === 'rs')
          return 'rust';
      if (['c', 'h', 'cpp', 'cc', 'cxx', 'hpp', 'hh', 'cs', 'java', 'kt', 'kts', 'swift'].includes(ext))
          return 'c';
      if (['css', 'scss', 'sass', 'less'].includes(ext))
          return 'css';
      if (['html', 'htm', 'vue', 'svelte'].includes(ext))
          return 'html';
      if (['json', 'jsonc'].includes(ext))
          return 'json';
      if (['yaml', 'yml', 'toml'].includes(ext))
          return 'yaml';
      if (['sh', 'bash', 'zsh', 'fish'].includes(ext))
          return 'sh';
      if (ext === 'sql')
          return 'sql';
      if (['md', 'markdown', 'mdown'].includes(ext))
          return 'md';
      if (['xml', 'plist', 'svg'].includes(ext))
          return 'xml';
      if (['ini', 'cfg', 'conf', 'env', 'properties'].includes(ext))
          return 'ini';
      return 'plain';
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
  const contract_js_1 = require(2);
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
  const highlight_js_1 = require(0);
  const icons_js_1 = require(1);
  const rpc_js_1 = require(4);
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
      function renderPreviewBody() {
          if (preview === null)
              return React.createElement('div', { className: 'dshfm-center' }, '点击左侧文件进行预览，双击可在系统中打开');
          if (doc.phase === 'loading')
              return React.createElement('div', { className: 'dshfm-center' }, '加载中…');
          if (doc.phase === 'error')
              return React.createElement('div', { className: 'dshfm-center' }, '预览失败：' + (ERROR_TEXT[doc.error] ?? doc.error));
          if (doc.kind === 'text') {
              const hl = (0, highlight_js_1.hlFor)((0, highlight_js_1.detectLang)(preview.name));
              const lines = doc.text.split('\n');
              const capped = lines.length > 3000;
              const shown = capped ? lines.slice(0, 3000) : lines;
              const gutter = [];
              for (let i = 0; i < shown.length; i += 1)
                  gutter.push(React.createElement('div', { className: 'dshfm-ln', key: i }, String(i + 1)));
              const codeLines = shown.map((line, i) => {
                  let content = line;
                  if (hl !== null && line.length <= 2000) {
                      const tokens = (0, highlight_js_1.tokenizeLine)(line, hl);
                      content = tokens.map((t, j) => t.color === '' ? t.text : React.createElement('span', { key: j, style: { color: t.color } }, t.text));
                  }
                  return React.createElement('div', { className: 'dshfm-line', key: i }, content);
              });
              return React.createElement('div', { className: 'dshfm-code' }, React.createElement('div', { className: 'dshfm-gutter' }, gutter), React.createElement('div', { className: 'dshfm-code-text' }, codeLines));
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
      return React.createElement('div', { className: 'dshfm-root', 'data-conversation-composer-overlay': '' }, React.createElement('div', { className: 'dshfm-bar' }, React.createElement('button', { type: 'button', className: treeVisible ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', title: '显示/隐藏目录', onClick: () => setTreeVisible((v) => !v) }, '☰'), React.createElement('span', { className: 'dshfm-path', title: state.root }, state.root || '—'), React.createElement('input', { className: 'dshfm-input', value: filter, placeholder: '筛选…', onChange: (e) => setFilter(e.target.value) }), React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setReloadKey((k) => k + 1) }, '刷新'), React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: openRoot, disabled: state.root === '' }, '打开目录')), React.createElement('div', { className: 'dshfm-main' }, treeVisible ? React.createElement('div', { className: 'dshfm-tree' }, React.createElement('div', { className: 'dshfm-tree-head' }, React.createElement('button', { type: 'button', className: 'dshfm-btn dshfm-back', title: '返回上一级', disabled: currentPath === '', onClick: goUp }, '\u2190'), React.createElement('div', { className: 'dshfm-crumbs' }, renderCrumbs())), React.createElement('div', { className: 'dshfm-tree-body' }, treeBody)) : null, React.createElement('div', { className: 'dshfm-preview' }, React.createElement('div', { className: 'dshfm-preview-head' }, React.createElement('span', { className: 'dshfm-preview-name' }, preview === null ? '预览' : preview.name), preview === null ? null : React.createElement('span', { className: 'dshfm-preview-meta', title: preview.path }, preview.path + (doc.size > 0 ? ' · ' + fmtSize(doc.size) : '')), React.createElement('span', { className: 'dshfm-preview-spacer' }), preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => openPath(preview.abs) }, '在系统中打开'), preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setPreview(null) }, '关闭')), React.createElement('div', { className: 'dshfm-preview-body' }, renderPreviewBody()), note)));
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
    .dshfm-line { line-height: 18px; white-space: pre; }
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
  const files_view_js_1 = require(5);
  const styles_js_1 = require(6);
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
    return __r(7);
  }
});
