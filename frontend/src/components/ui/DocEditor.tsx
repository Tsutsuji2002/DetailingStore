import React, { useEffect, useRef, useCallback, useState } from 'react';
import './DocEditor.css';

interface DocEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  metaHeader?: {
    title?: string;
    brand?: string;
    vehicleModel?: string;
    category?: string;
    errorCode?: string;
    symptoms?: string;
  };
}

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'p';
type Alignment = 'left' | 'center' | 'right' | 'justify';

const DocEditor: React.FC<DocEditorProps> = ({ value, onChange, placeholder = 'Bắt đầu soạn thảo tài liệu…', readOnly = false, metaHeader }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value → editor DOM (don't trigger onChange)
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      updateWordCount();
    }
  }, [value]);

  const updateWordCount = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(text.replace(/\s/g, '').length);
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    updateWordCount();
  }, [onChange, updateWordCount]);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const execHeading = (level: HeadingLevel) => {
    exec('formatBlock', level);
  };

  const execAlign = (align: Alignment) => {
    const cmds: Record<Alignment, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    };
    exec(cmds[align]);
  };

  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    let html = '<table border="1" style="width:100%;border-collapse:collapse;margin:0.5rem 0;"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += `<th style="padding:6px 10px;background:#f1f5f9;border:1px solid #cbd5e1;font-weight:700;">Tiêu Đề ${c + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="padding:6px 10px;border:1px solid #cbd5e1;">Nội dung</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    exec('insertHTML', html);
  };

  const insertCallout = (type: 'info' | 'warning' | 'danger') => {
    const styles: Record<string, { bg: string; border: string; color: string; icon: string; label: string }> = {
      info:    { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af', icon: 'ℹ️', label: 'Lưu Ý' },
      warning: { bg: '#fffbeb', border: '#f59e0b', color: '#92400e', icon: '⚠️', label: 'Cảnh Báo' },
      danger:  { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: '🚨', label: 'Nguy Hiểm' },
    };
    const s = styles[type];
    const html = `<div style="background:${s.bg};border-left:4px solid ${s.border};color:${s.color};padding:0.75rem 1rem;border-radius:0 8px 8px 0;margin:0.5rem 0;font-size:0.9rem;"><strong>${s.icon} ${s.label}:</strong> Nhập nội dung lưu ý tại đây.</div>`;
    exec('insertHTML', html);
  };

  const insertDivider = () => {
    exec('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:1rem 0;" /><p><br/></p>');
  };

  // ── Export Handlers ──────────────────────────────────────

  const exportAsDoc = () => {
    const content = editorRef.current?.innerHTML || '';
    let headerHtml = '';
    if (metaHeader && (metaHeader.title || metaHeader.brand || metaHeader.errorCode)) {
      headerHtml = `<div style="margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #333;">
        <p style="font-size:10pt;color:#555;"><strong>HÃNG XE:</strong> ${metaHeader.brand || ''} ${metaHeader.vehicleModel ? `(${metaHeader.vehicleModel})` : ''} | <strong>DANH MỤC:</strong> ${metaHeader.category || ''} ${metaHeader.errorCode ? `| <strong style="color:red;">MÃ LỖI: ${metaHeader.errorCode}</strong>` : ''}</p>
        <h1 style="font-size:20pt;margin:5px 0;">${metaHeader.title || 'Tài Liệu Kỹ Thuật'}</h1>
        ${metaHeader.symptoms ? `<p style="background:#fff8dc;padding:8px;border-left:4px solid #d97706;"><strong>Triệu chứng:</strong> ${metaHeader.symptoms}</p>` : ''}
      </div>`;
    }
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${metaHeader?.title || 'Tài Liệu Kỹ Thuật'}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2cm; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 6px 10px; }
  h1 { font-size: 18pt; } h2 { font-size: 14pt; } h3 { font-size: 12pt; }
</style>
</head><body>${headerHtml}${content}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(metaHeader?.title || 'tai-lieu-ky-thuat').replace(/\s+/g, '-')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = () => {
    const content = editorRef.current?.innerHTML || '';
    let headerHtml = '';
    if (metaHeader && (metaHeader.title || metaHeader.brand || metaHeader.errorCode)) {
      headerHtml = `<div style="margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #333;">
        <p style="font-size:10pt;color:#555;margin:0 0 5px 0;"><strong>HÃNG XE:</strong> ${metaHeader.brand || ''} ${metaHeader.vehicleModel ? `(${metaHeader.vehicleModel})` : ''} | <strong>DANH MỤC:</strong> ${metaHeader.category || ''} ${metaHeader.errorCode ? `| <strong style="color:#b91c1c;">MÃ LỖI: ${metaHeader.errorCode}</strong>` : ''}</p>
        <h1 style="font-size:22pt;color:#0f172a;margin:5px 0;">${metaHeader.title || 'Tài Liệu Kỹ Thuật'}</h1>
        ${metaHeader.symptoms ? `<div style="background:#fff8dc;padding:8px 12px;border-left:4px solid #d97706;color:#78350f;margin-top:8px;"><strong>⚠️ Triệu chứng:</strong> ${metaHeader.symptoms}</div>` : ''}
      </div>`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metaHeader?.title || 'Tài Liệu Kỹ Thuật'}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; }
            h1 { font-size: 18pt; margin-top: 0; }
            h2 { font-size: 14pt; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            h3 { font-size: 12pt; color: #334155; }
            ul, ol { padding-left: 20px; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
          </style>
        </head>
        <body>
          ${headerHtml}
          ${content}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportAsMarkdown = () => {
    const text = editorRef.current?.innerText || '';
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tai-lieu-ky-thuat.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsTxt = () => {
    const text = editorRef.current?.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tai-lieu-ky-thuat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    exportAsPdf();
  };

  // ── Import Handler ────────────────────────────────────────

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'html' || ext === 'doc' || ext === 'docx') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        let html = text;
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) html = bodyMatch[1];
        editorRef.current!.innerHTML = html;
        isInternalChange.current = true;
        onChange(html);
        updateWordCount();
      };
      reader.readAsText(file);
    } else if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = (ev.target?.result as string)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
        const html = `<p>${text}</p>`;
        editorRef.current!.innerHTML = html;
        isInternalChange.current = true;
        onChange(html);
        updateWordCount();
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  return (
    <div className="doc-editor-wrap">
      {!readOnly && (
        <div className="doc-toolbar">
          {/* History */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn" title="Hoàn tác (Ctrl+Z)" onClick={() => exec('undo')}>↩</button>
            <button type="button" className="tb-btn" title="Làm lại (Ctrl+Y)" onClick={() => exec('redo')}>↪</button>
          </div>
          <div className="toolbar-divider" />

          {/* Block format */}
          <div className="toolbar-group">
            <select
              className="tb-select"
              onChange={(e) => execHeading(e.target.value as HeadingLevel)}
              defaultValue="p"
            >
              <option value="p">Đoạn văn</option>
              <option value="h1">Tiêu đề 1</option>
              <option value="h2">Tiêu đề 2</option>
              <option value="h3">Tiêu đề 3</option>
            </select>
          </div>
          <div className="toolbar-divider" />

          {/* Character style */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn tb-bold"   title="Đậm (Ctrl+B)"        onClick={() => exec('bold')}>B</button>
            <button type="button" className="tb-btn tb-italic" title="Nghiêng (Ctrl+I)"     onClick={() => exec('italic')}>I</button>
            <button type="button" className="tb-btn tb-under"  title="Gạch dưới (Ctrl+U)"  onClick={() => exec('underline')}>U</button>
            <button type="button" className="tb-btn tb-strike" title="Gạch ngang"           onClick={() => exec('strikethrough')}><s>S</s></button>
          </div>
          <div className="toolbar-divider" />

          {/* Font size */}
          <div className="toolbar-group">
            <select className="tb-select" onChange={(e) => exec('fontSize', e.target.value)} defaultValue="3">
              <option value="1">8pt</option>
              <option value="2">10pt</option>
              <option value="3">12pt</option>
              <option value="4">14pt</option>
              <option value="5">18pt</option>
              <option value="6">24pt</option>
              <option value="7">36pt</option>
            </select>
          </div>

          {/* Font color */}
          <div className="toolbar-group">
            <label className="tb-color-label" title="Màu chữ">
              A
              <input type="color" defaultValue="#000000" onChange={(e) => exec('foreColor', e.target.value)} />
            </label>
            <label className="tb-color-label tb-bg-color" title="Tô nền chữ">
              <span>A</span>
              <input type="color" defaultValue="#ffff00" onChange={(e) => exec('hiliteColor', e.target.value)} />
            </label>
          </div>
          <div className="toolbar-divider" />

          {/* Alignment */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn" title="Căn trái"  onClick={() => execAlign('left')}>⬅</button>
            <button type="button" className="tb-btn" title="Căn giữa" onClick={() => execAlign('center')}>⬛</button>
            <button type="button" className="tb-btn" title="Căn phải" onClick={() => execAlign('right')}>➡</button>
            <button type="button" className="tb-btn" title="Căn đều"  onClick={() => execAlign('justify')}>☰</button>
          </div>
          <div className="toolbar-divider" />

          {/* Lists */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn" title="Danh sách dấu chấm" onClick={() => exec('insertUnorderedList')}>≡•</button>
            <button type="button" className="tb-btn" title="Danh sách đánh số"  onClick={() => exec('insertOrderedList')}>1.</button>
            <button type="button" className="tb-btn" title="Thụt lề vào"        onClick={() => exec('indent')}>→</button>
            <button type="button" className="tb-btn" title="Thụt lề ra"         onClick={() => exec('outdent')}>←</button>
          </div>
          <div className="toolbar-divider" />

          {/* Insert blocks */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn" title="Chèn bảng" onClick={insertTable}>⊞ Bảng</button>
            <button type="button" className="tb-btn" title="Đường kẻ ngang" onClick={insertDivider}>─</button>
          </div>

          {/* Callouts */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn tb-info"    title="Khung Lưu Ý"   onClick={() => insertCallout('info')}>ℹ️</button>
            <button type="button" className="tb-btn tb-warning" title="Khung Cảnh Báo" onClick={() => insertCallout('warning')}>⚠️</button>
            <button type="button" className="tb-btn tb-danger"  title="Khung Nguy Hiểm" onClick={() => insertCallout('danger')}>🚨</button>
          </div>
          <div className="toolbar-divider" />

          {/* Link */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn" title="Chèn liên kết" onClick={() => {
              const url = prompt('Nhập URL:');
              if (url) exec('createLink', url);
            }}>🔗</button>
            <button type="button" className="tb-btn" title="Xoá liên kết" onClick={() => exec('unlink')}>✂</button>
          </div>
          <div className="toolbar-divider" />

          {/* Import / Export */}
          <div className="toolbar-group">
            <button type="button" className="tb-btn tb-action" title="Nhập file (.doc, .html, .txt, .md)" onClick={() => fileInputRef.current?.click()}>
              📂 Nhập
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.html,.txt,.md"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <button type="button" className="tb-btn tb-action" title="Xuất file Word (.doc)" onClick={exportAsDoc}>💾 .doc</button>
            <button type="button" className="tb-btn tb-action" title="Xuất / Lưu file PDF (.pdf)" onClick={exportAsPdf}>📕 .pdf</button>
            <button type="button" className="tb-btn tb-action" title="Xuất .md (Markdown)" onClick={exportAsMarkdown}>📝 .md</button>
            <button type="button" className="tb-btn tb-action" title="Xuất .txt" onClick={exportAsTxt}>📄 .txt</button>
          </div>
        </div>
      )}

      {/* A4 Document Canvas */}
      <div className="doc-paper-wrap">
        <div className={`doc-paper ${readOnly ? 'readonly' : ''}`}>
          {metaHeader && (metaHeader.title || metaHeader.brand || metaHeader.errorCode) && (
            <div className="doc-header-card" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0', userSelect: 'none' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                {metaHeader.brand && (
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                    {metaHeader.brand} {metaHeader.vehicleModel ? `— ${metaHeader.vehicleModel}` : ''}
                  </span>
                )}
                {metaHeader.category && (
                  <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                    {metaHeader.category}
                  </span>
                )}
                {metaHeader.errorCode && (
                  <span style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                    MÃ LỖI: {metaHeader.errorCode}
                  </span>
                )}
              </div>
              {metaHeader.title && <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>{metaHeader.title}</h1>}
              {metaHeader.symptoms && (
                <div style={{ background: '#fef3c7', borderLeft: '4px solid #b45309', padding: '0.6rem 0.8rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#78350f', marginTop: '0.5rem' }}>
                  <strong>⚠️ Triệu chứng:</strong> {metaHeader.symptoms}
                </div>
              )}
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder={placeholder}
            spellCheck={false}
            style={{ outline: 'none', minHeight: 250 }}
          />
        </div>
      </div>

      {!readOnly && (
        <div className="doc-status-bar">
          <span>{wordCount} từ</span>
          <span>·</span>
          <span>{charCount} ký tự</span>
        </div>
      )}
    </div>
  );
};

export default DocEditor;
