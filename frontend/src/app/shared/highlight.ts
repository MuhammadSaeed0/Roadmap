// A deliberately tiny syntax highlighter for the languages used in DevPath.
// It escapes the code FIRST and only then wraps tokens in <span class="tok-…">,
// so user/seed content can never inject HTML. Angular's sanitizer runs on top.

const KEYWORDS: Record<string, string[]> = {
  csharp: ['abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'decimal', 'default', 'do', 'double', 'else', 'enum', 'false', 'finally', 'for', 'foreach', 'get', 'if', 'in', 'init',
    'int', 'interface', 'internal', 'is', 'namespace', 'new', 'not', 'null', 'object', 'or', 'and', 'out', 'override',
    'private', 'protected', 'public', 'readonly', 'record', 'required', 'return', 'sealed', 'set', 'static', 'string',
    'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'using', 'var', 'virtual', 'void', 'when', 'where',
    'while', 'with', 'yield', 'long', 'byte', 'char', 'float', 'nameof'],
  typescript: ['as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'default',
    'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'implements', 'import', 'in',
    'instanceof', 'interface', 'keyof', 'let', 'new', 'null', 'of', 'private', 'protected', 'public', 'readonly',
    'return', 'static', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'void', 'while',
    'string', 'number', 'boolean', 'never', 'unknown', 'any'],
  sql: ['select', 'from', 'where', 'and', 'or', 'not', 'insert', 'into', 'update', 'set', 'delete', 'join', 'inner',
    'left', 'outer', 'cross', 'apply', 'on', 'group', 'by', 'order', 'having', 'as', 'top', 'exec', 'declare', 'begin',
    'end', 'create', 'alter', 'table', 'index', 'event', 'session', 'server', 'add', 'target', 'action', 'go', 'null',
    'is', 'in', 'desc', 'asc', 'case', 'when', 'then', 'else', 'with', 'state', 'start', 'count', 'sum', 'max', 'min'],
};
KEYWORDS['html'] = ['@if', '@else', '@for', '@switch', '@case', '@default', 'track'];

export function highlight(code: string, language: string | null | undefined): string {
  const lang = (language ?? '').toLowerCase();
  const escaped = escapeHtml(code);
  if (lang === 'text' || lang === '') return escaped;

  const keywords = new Set(KEYWORDS[lang] ?? []);
  const lineComment = lang === 'sql' ? '--' : lang === 'bash' || lang === 'http' ? '#' : '//';

  // One regex with alternatives: comments | strings | numbers | words.
  const commentPattern = lineComment === '#' ? '#[^\\n]*' : lineComment === '--' ? '--[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/';
  const pattern = new RegExp(
    `(${commentPattern}|&lt;!--[\\s\\S]*?--&gt;)|(\\$?"(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`[^\`]*\`)|(\\b\\d+(?:\\.\\d+)?m?\\b)|(@?[A-Za-z_][\\w]*)`,
    'g',
  );

  return escaped.replace(pattern, (match, comment, str, num, word) => {
    if (comment) return `<span class="tok-comment">${comment}</span>`;
    if (str) return `<span class="tok-string">${str}</span>`;
    if (num) return `<span class="tok-number">${num}</span>`;
    if (word) {
      const check = lang === 'sql' ? word.toLowerCase() : word;
      if (keywords.has(check)) return `<span class="tok-keyword">${word}</span>`;
      if (/^[A-Z]/.test(word) && lang !== 'sql') return `<span class="tok-type">${word}</span>`;
    }
    return match;
  });
}

/** Text content (not attributes) only needs &, < and > escaped. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
