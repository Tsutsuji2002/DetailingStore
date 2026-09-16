import React, { useRef, useCallback, useState, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline, FiImage, FiLink, FiCode, FiAlignLeft, FiAlignCenter, FiAlignRight, FiList } from 'react-icons/fi';
import postApi from '@/services/api/postApi';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, title, active, children, disabled }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    className={`rte-btn ${active ? 'rte-btn--active' : ''}`}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <span className="rte-divider" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Bắt đầu soạn thảo nội dung bài viết...',
  minHeight = 320,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeValue, setCodeValue] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<{ node: Node; offset: number } | null>(null);

  // Initialize editor content
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && !isCodeView && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  }, [onChange]);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  }, [onChange]);

  const handleCodeToggle = () => {
    if (!isCodeView) {
      // Switch to code view: copy HTML from editor
      setCodeValue(editorRef.current?.innerHTML || '');
      setIsCodeView(true);
    } else {
      // Switch back to visual: apply HTML back
      setIsCodeView(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = codeValue;
          onChange(codeValue);
        }
      }, 0);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeValue(e.target.value);
    onChange(e.target.value);
  };

  // Heading
  const insertHeading = (level: string) => {
    exec('formatBlock', level);
  };

  // Font color
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  // Highlight color
  const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('hiliteColor', e.target.value);
  };

  // Link dialog
  const openLinkDialog = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setLinkText(sel.toString());
    }
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    setLinkDialogOpen(false);
    editorRef.current?.focus();
    if (linkText) {
      exec('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener">${linkText}</a>`);
    } else {
      exec('createLink', linkUrl);
    }
  };

  // Image upload
  const handleImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await postApi.uploadImage(file);
      const imgHtml = `<figure class="rte-image-wrap"><img src="${url}" alt="${file.name}" style="max-width:100%;border-radius:8px;" /><figcaption>${file.name}</figcaption></figure>`;
      editorRef.current?.focus();
      exec('insertHTML', imgHtml);
    } catch {
      alert('Tải ảnh lên thất bại. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUrlPrompt = () => {
    const url = prompt('Nhập URL ảnh:', 'https://');
    if (url) {
      const imgHtml = `<figure class="rte-image-wrap"><img src="${url}" alt="image" style="max-width:100%;border-radius:8px;" /></figure>`;
      exec('insertHTML', imgHtml);
    }
  };

  return (
    <div className="rte-container">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* Heading select */}
        <select
          className="rte-heading-select"
          onChange={e => insertHeading(e.target.value)}
          defaultValue=""
          title="Định Dạng Tiêu Đề"
        >
          <option value="" disabled>Định Dạng</option>
          <option value="p">Đoạn văn</option>
          <option value="h1">Tiêu Đề 1</option>
          <option value="h2">Tiêu Đề 2</option>
          <option value="h3">Tiêu Đề 3</option>
          <option value="blockquote">Trích dẫn</option>
          <option value="pre">Khối Code</option>
        </select>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton onClick={() => exec('bold')} title="In đậm (Ctrl+B)"><FiBold /></ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="In nghiêng (Ctrl+I)"><FiItalic /></ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Gạch chân (Ctrl+U)"><FiUnderline /></ToolbarButton>
        <ToolbarButton onClick={() => exec('strikeThrough')} title="Gạch giữa">
          <span style={{ textDecoration: 'line-through', fontWeight: 600, fontSize: '0.85em' }}>S</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('removeFormat')} title="Xóa định dạng (Erase Format)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/>
            <path d="M6 11 13 18"/>
          </svg>
        </ToolbarButton>


        <ToolbarDivider />

        {/* Colors */}
        <span className="rte-color-wrap" title="Màu chữ">
          <span className="rte-color-label">A</span>
          <input type="color" className="rte-color-input" defaultValue="#e53e3e" onChange={handleColorChange} title="Màu chữ" />
        </span>
        <span className="rte-color-wrap" title="Màu nền">
          <span className="rte-color-label" style={{ background: '#fef08a', color: '#000' }}>H</span>
          <input type="color" className="rte-color-input" defaultValue="#fef08a" onChange={handleHighlightChange} title="Màu nền highlight" />
        </span>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Căn trái"><FiAlignLeft /></ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Căn giữa"><FiAlignCenter /></ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyRight')} title="Căn phải"><FiAlignRight /></ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyFull')} title="Căn đều">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Danh sách chấm"><FiList /></ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Danh sách số">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Tải ảnh từ máy tính" disabled={isUploading}>
          {isUploading ? <span className="rte-spinner" /> : <FiImage />}
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUrlPrompt} title="Chèn ảnh từ URL">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 10 4-4 4 4"/><path d="M12 6v8"/></svg>
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); e.target.value = ''; }}
        />
        <ToolbarButton onClick={openLinkDialog} title="Chèn liên kết"><FiLink /></ToolbarButton>
        <ToolbarButton onClick={() => exec('insertHorizontalRule')} title="Đường gạch ngang">
          <svg width="16" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="6" x2="22" y2="6"/></svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => exec('undo')} title="Hoàn tác (Ctrl+Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 2.83-6.36L3 10"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('redo')} title="Làm lại (Ctrl+Y)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13a9 9 0 1 1-2.83-6.36L21 10"/></svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code view toggle */}
        <ToolbarButton onClick={handleCodeToggle} title={isCodeView ? 'Chế độ Soạn thảo Visual' : 'Chế độ HTML Mã Nguồn'} active={isCodeView}>
          <FiCode />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      {isCodeView ? (
        <textarea
          className="rte-code-view"
          style={{ minHeight }}
          value={codeValue}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder="<p>Nhập mã HTML ở đây...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          className="rte-content"
          contentEditable
          suppressContentEditableWarning
          style={{ minHeight }}
          onInput={handleInput}
          data-placeholder={placeholder}
          onPaste={e => {
            e.preventDefault();
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');

            if (html) {
              // Parse & strip unwanted styles: background-color, color:#000, color:black
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              doc.querySelectorAll('[style]').forEach(el => {
                const style = el.getAttribute('style') || '';
                const cleaned = style
                  .split(';')
                  .filter(rule => {
                    const r = rule.trim().toLowerCase();
                    if (r.startsWith('background') || r.startsWith('background-color')) return false;
                    // Remove explicit black/dark text colors (keep colored text like blue links)
                    if (r.startsWith('color')) {
                      const val = r.split(':')[1]?.trim() || '';
                      if (val === '#000' || val === '#000000' || val === 'black' || val === 'rgb(0,0,0)' || val === 'rgb(0, 0, 0)') return false;
                    }
                    return true;
                  })
                  .join(';');
                if (cleaned.trim()) {
                  el.setAttribute('style', cleaned);
                } else {
                  el.removeAttribute('style');
                }
              });
              // Remove font tags with fixed colors
              doc.querySelectorAll('font').forEach(el => {
                el.removeAttribute('color');
                el.removeAttribute('face');
              });
              const cleanHtml = doc.body.innerHTML;
              exec('insertHTML', cleanHtml);
            } else if (text) {
              exec('insertText', text);
            }
          }}
        />
      )}

      {/* Link dialog */}
      {linkDialogOpen && (
        <div className="rte-dialog-backdrop" onClick={() => setLinkDialogOpen(false)}>
          <div className="rte-dialog" onClick={e => e.stopPropagation()}>
            <div className="rte-dialog-title">Chèn Liên Kết</div>
            <label className="rte-dialog-label">Chữ hiển thị</label>
            <input className="rte-dialog-input" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Tên liên kết" />
            <label className="rte-dialog-label">URL đích</label>
            <input className="rte-dialog-input" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
            <div className="rte-dialog-actions">
              <button type="button" className="rte-dialog-cancel" onClick={() => setLinkDialogOpen(false)}>Hủy</button>
              <button type="button" className="rte-dialog-confirm" onClick={insertLink}>Chèn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
