// Lightweight markdown renderer for AI chat messages
// Handles: headings, bold, italic, bullet/numbered lists, inline code, code blocks, horizontal rules

function parseInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold + italic: ***text***
    let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (match) {
      parts.push(<strong key={key++} className="text-[#00ffc8] italic">{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold: **text**
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      parts.push(<strong key={key++} className="text-[#00ffc8]">{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic: *text*
    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      parts.push(<em key={key++} className="text-[#c8cdd5]">{match[1]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code: `code`
    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 bg-[#1a1f2b] text-[#ff6b35] rounded text-xs font-mono">
          {match[1]}
        </code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Plain text — consume up to next special character
    match = remaining.match(/^[^*`]+/);
    if (match) {
      parts.push(match[0]);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // If nothing matched, consume one character to avoid infinite loop
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return parts;
}

function renderBlock(line, index) {
  // Headings: ### Heading
  const h3Match = line.match(/^###\s+(.+)/);
  if (h3Match) {
    return (
      <h3 key={index} className="text-sm font-bold text-[#00ffc8] mt-3 mb-1.5">
        {parseInline(h3Match[1])}
      </h3>
    );
  }

  const h2Match = line.match(/^##\s+(.+)/);
  if (h2Match) {
    return (
      <h2 key={index} className="text-base font-bold text-[#00ffc8] mt-4 mb-1.5">
        {parseInline(h2Match[1])}
      </h2>
    );
  }

  const h1Match = line.match(/^#\s+(.+)/);
  if (h1Match) {
    return (
      <h1 key={index} className="text-lg font-bold text-[#00ffc8] mt-4 mb-2">
        {parseInline(h1Match[1])}
      </h1>
    );
  }

  // Horizontal rule
  if (/^[-*_]{3,}\s*$/.test(line)) {
    return <hr key={index} className="border-[#252c3a] my-3" />;
  }

  // Bullet list: - item or * item
  const bulletMatch = line.match(/^[\s]*[-*]\s+(.+)/);
  if (bulletMatch) {
    return (
      <div key={index} className="flex gap-2 pl-2 py-0.5">
        <span className="text-[#00ffc8] shrink-0">•</span>
        <span>{parseInline(bulletMatch[1])}</span>
      </div>
    );
  }

  // Numbered list: 1. item
  const numberMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)/);
  if (numberMatch) {
    return (
      <div key={index} className="flex gap-2 pl-2 py-0.5">
        <span className="text-[#5a6478] shrink-0 min-w-[1.2em] text-right">{numberMatch[1]}.</span>
        <span>{parseInline(numberMatch[2])}</span>
      </div>
    );
  }

  // Empty line → spacer
  if (!line.trim()) {
    return <div key={index} className="h-2" />;
  }

  // Regular paragraph
  return <p key={index} className="py-0.5">{parseInline(line)}</p>;
}

export function MarkdownMessage({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle: ```language
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${i}`} className="my-2 rounded-lg overflow-hidden">
            {codeLang && (
              <div className="bg-[#1a1f2b] px-3 py-1 text-xs text-[#5a6478] border-b border-[#252c3a]">
                {codeLang}
              </div>
            )}
            <pre className="bg-[#0d1117] p-3 overflow-x-auto text-xs font-mono text-[#c8cdd5] leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeLines = [];
        codeLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    elements.push(renderBlock(line, i));
  }

  // Handle unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key="code-unclosed" className="bg-[#0d1117] p-3 rounded-lg overflow-x-auto text-xs font-mono text-[#c8cdd5] leading-relaxed my-2">
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-0">{elements}</div>;
}
