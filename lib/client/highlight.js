/**
 * 轻量语法高亮：按扩展名选语言，逐行正则分词着色（VS Code Dark+ 配色）。
 *
 * 有意保持“够用”而非完备：单行扫描、超长行跳过，保证大文件预览不卡顿；
 * 每种语言一组有序规则，先匹配者胜出（注释、字符串、数字、关键字、字面量、调用、类型）。
 */
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
export function hlFor(lang) {
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
export function tokenizeLine(line, hl) {
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
export function detectLang(name) {
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
