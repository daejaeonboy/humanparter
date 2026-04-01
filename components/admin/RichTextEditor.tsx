import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react';
import {
  Bold,
  Eraser,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Loader2,
  Underline,
} from 'lucide-react';
import { uploadImage } from '../../src/api/storageApi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  uploadFolder?: string;
  showLinkButton?: boolean;
  variant?: 'default' | 'plain';
}

const FONT_SIZE_OPTIONS = ['14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const COLOR_OPTIONS = ['#111827', '#4b5563', '#9ca3af', '#22c55e', '#2563eb', '#ef4444'];

export const RichTextEditor = ({
  value,
  onChange,
  minHeight = 280,
  uploadFolder = 'editor',
  showLinkButton = true,
  variant = 'default',
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedLineHeight, setSelectedLineHeight] = useState('1.9');
  const [selectedColor, setSelectedColor] = useState('#111827');

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const isPlain = variant === 'plain';

  const syncValue = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const keepSelection = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const isHeadingTag = (tagName: string) => /^H[1-6]$/.test(tagName);

  const exec = (command: string, commandValue?: string) => {
    focusEditor();
    document.execCommand(command, false, commandValue);
    syncValue();
    focusEditor();
  };

  const getSelectionRange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return null;
    }

    return range;
  };

  const setStyleValues = (element: HTMLElement, styles: Record<string, string>) => {
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(
        property.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`),
        value,
      );
    });
  };

  const replaceElementTag = (element: HTMLElement, tagName: 'p' | 'div') => {
    const replacement = document.createElement(tagName);

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name === 'style') {
        replacement.setAttribute('style', attribute.value);
        return;
      }
      replacement.setAttribute(attribute.name, attribute.value);
    });

    replacement.innerHTML = element.innerHTML;
    element.replaceWith(replacement);
    return replacement;
  };

  const normalizePlainBlockElement = (element: HTMLElement | null) => {
    if (!element) return null;
    if (!isPlain || !isHeadingTag(element.tagName)) return element;
    return replaceElementTag(element, 'p');
  };

  const findClosestBlock = (node: Node | null): HTMLElement | null => {
    let currentNode = node;

    while (currentNode && currentNode !== editorRef.current) {
      if (
        currentNode instanceof HTMLElement &&
        /^(P|DIV|H1|H2|H3|H4|H5|H6|LI|BLOCKQUOTE)$/.test(currentNode.tagName)
      ) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }

    return editorRef.current;
  };

  const findClosestInlineTarget = (node: Node | null): HTMLElement | null => {
    if (!node || !editorRef.current) return null;

    const element = node instanceof HTMLElement ? node : node.parentElement;
    if (!element) return null;

    const inlineTarget = element.closest('span');
    if (inlineTarget && editorRef.current.contains(inlineTarget)) {
      return inlineTarget as HTMLElement;
    }

    return findClosestBlock(node);
  };

  const selectionContainsBlockElements = (fragment: DocumentFragment) => {
    return Array.from(fragment.childNodes).some(
      (node) =>
        node instanceof HTMLElement &&
        /^(P|DIV|H1|H2|H3|H4|H5|H6|LI|UL|OL|BLOCKQUOTE)$/.test(node.tagName),
    );
  };

  const restoreSelectionToEnd = (node: Node | null) => {
    if (!node) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();

    if (node.nodeType === Node.TEXT_NODE) {
      range.setStart(node, node.textContent?.length || 0);
      range.collapse(true);
    } else {
      range.selectNodeContents(node);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyInlineStyle = (styles: Record<string, string>) => {
    focusEditor();
    const range = getSelectionRange();
    if (!range) return;

    if (range.collapsed) {
      const target = normalizePlainBlockElement(findClosestInlineTarget(range.startContainer));
      if (!target) return;
      setStyleValues(target, styles);
      syncValue();
      focusEditor();
      return;
    }

    const fragment = range.extractContents();

    if (selectionContainsBlockElements(fragment)) {
      const container = document.createElement('div');
      container.appendChild(fragment);

      const blockElements = Array.from(
        container.querySelectorAll<HTMLElement>('p, div, h1, h2, h3, h4, h5, h6, li, blockquote'),
      );

      if (blockElements.length > 0) {
        blockElements.forEach((element) => {
          const normalizedElement =
            isPlain && isHeadingTag(element.tagName) ? replaceElementTag(element, 'p') : element;
          setStyleValues(normalizedElement, styles);
        });
      }

      const nodes = Array.from(container.childNodes);
      const resultFragment = document.createDocumentFragment();
      nodes.forEach((node) => resultFragment.appendChild(node));
      range.insertNode(resultFragment);
      restoreSelectionToEnd(nodes[nodes.length - 1] || null);
      syncValue();
      focusEditor();
      return;
    }

    const wrapper = document.createElement('span');
    setStyleValues(wrapper, styles);
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);
    restoreSelectionToEnd(wrapper);
    syncValue();
    focusEditor();
  };

  const applyLineHeight = (lineHeight: string) => {
    const selection = window.getSelection();
    const blockElement = normalizePlainBlockElement(
      findClosestBlock(selection?.anchorNode || editorRef.current),
    );

    if (!blockElement) return;

    blockElement.style.lineHeight = lineHeight;
    setSelectedLineHeight(lineHeight);
    syncValue();
    focusEditor();
  };

  const applyFontSize = (fontSize: string) => {
    applyInlineStyle({ fontSize });
  };

  const applyTextColor = (color: string) => {
    setSelectedColor(color);
    applyInlineStyle({ color });
  };

  const applyPresetTitle = () => {
    if (isPlain) {
      applyInlineStyle({ fontSize: '32px' });
      applyLineHeight('1.4');
      return;
    }

    exec('formatBlock', '<h2>');
    applyLineHeight('1.4');
  };

  const applyPresetBody = () => {
    if (isPlain) {
      const selection = window.getSelection();
      const blockElement = normalizePlainBlockElement(
        findClosestBlock(selection?.anchorNode || editorRef.current),
      );

      if (blockElement) {
        blockElement.style.fontSize = '16px';
        blockElement.style.fontWeight = '400';
      }

      applyLineHeight(selectedLineHeight);
      syncValue();
      focusEditor();
      return;
    }

    exec('formatBlock', '<p>');
    applyLineHeight(selectedLineHeight);
  };

  const handleLink = () => {
    const link = window.prompt('링크 URL을 입력해 주세요.');
    if (!link) return;
    exec('createLink', link);
  };

  const insertImageByUrl = (url?: string) => {
    const targetUrl = (url || imageUrlInput).trim();
    if (!targetUrl) {
      alert('이미지 URL을 입력해 주세요.');
      return;
    }
    exec('insertImage', targetUrl);
    setImageUrlInput('');
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const url = await uploadImage(file, uploadFolder);
        insertImageByUrl(url);
      } catch (error) {
        console.error('Failed to upload editor image:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleColorInput = (event: ChangeEvent<HTMLInputElement>) => {
    applyTextColor(event.target.value);
  };

  const defaultButtonClassName =
    'rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50';
  const plainButtonClassName =
    'inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-50';
  const plainIconButtonClassName =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-50';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      {isPlain ? (
        <div className="space-y-4 border-b border-slate-200 bg-slate-50/50 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">프리셋</span>
              <div className="flex gap-1.5">
                <button
                  key="preset-title"
                  type="button"
                  onMouseDown={keepSelection}
                  onClick={applyPresetTitle}
                  className={plainButtonClassName}
                >
                  타이틀
                </button>
                <button
                  key="preset-body"
                  type="button"
                  onMouseDown={keepSelection}
                  onClick={applyPresetBody}
                  className={plainButtonClassName}
                >
                  본문
                </button>
              </div>
              <span className="ml-1 text-[10px] font-medium text-slate-400">선택한 문단 기준</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">글자</span>
              <button
                type="button"
                onMouseDown={keepSelection}
                onClick={() => exec('bold')}
                className={`${plainButtonClassName} ${
                  document.queryCommandState?.('bold') ? 'border-[#001e45] bg-[#001e45]/5 text-[#001e45]' : ''
                }`}
              >
                <Bold size={14} className="mr-1" />
                굵게
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">폰트 크기</span>
              <div className="flex flex-wrap gap-1.5">
                {FONT_SIZE_OPTIONS.map((fontSize) => (
                  <button
                    key={fontSize}
                    type="button"
                    onMouseDown={keepSelection}
                    onClick={() => applyFontSize(fontSize)}
                    className={plainButtonClassName}
                  >
                    {fontSize}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">행간</span>
              <select
                value={selectedLineHeight}
                onChange={(event) => applyLineHeight(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-extrabold text-slate-800 outline-none focus:border-[#001e45]"
              >
                <option value="1.0">1.0</option>
                <option value="1.2">1.2</option>
                <option value="1.4">1.4</option>
                <option value="1.5">1.5</option>
                <option value="1.6">1.6</option>
                <option value="1.8">1.8</option>
                <option value="1.9">1.9</option>
                <option value="2">2.0</option>
              </select>
              <span className="ml-1 text-[10px] font-medium text-slate-400">선택한 문단 기준</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">글자색</span>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={keepSelection}
                    onClick={() => applyTextColor(color)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                      selectedColor === color ? 'border-[#001e45] ring-2 ring-[#001e45]/20' : 'border-black/10'
                    }`}
                    aria-label={`글자색 ${color}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <label className="ml-2 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-50">
                직접 선택
                <input
                  type="color"
                  value={selectedColor}
                  onChange={handleColorInput}
                  className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">이미지 삽입</span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  placeholder="이미지 URL 붙여넣기"
                  className="h-9 min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#001e45]"
                />
                <button
                  type="button"
                  onMouseDown={keepSelection}
                  onClick={() => insertImageByUrl()}
                  className={plainButtonClassName}
                >
                  URL 삽입
                </button>
                <button
                  type="button"
                  onMouseDown={keepSelection}
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className={plainButtonClassName}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      업로드 중
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} className="mr-1" />
                      이미지 업로드
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('bold')}
            className={defaultButtonClassName}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('italic')}
            className={defaultButtonClassName}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('underline')}
            className={defaultButtonClassName}
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('formatBlock', '<h2>')}
            className={defaultButtonClassName}
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('insertUnorderedList')}
            className={defaultButtonClassName}
          >
            <List size={16} />
          </button>
          {showLinkButton && (
            <button
              type="button"
              onMouseDown={keepSelection}
              onClick={handleLink}
              className={defaultButtonClassName}
            >
              <Link2 size={16} />
            </button>
          )}
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={handleImageUpload}
            disabled={uploading}
            className={defaultButtonClassName}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          </button>
          <button
            type="button"
            onMouseDown={keepSelection}
            onClick={() => exec('removeFormat')}
            className={defaultButtonClassName}
          >
            <Eraser size={16} />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        className={`prose prose-slate max-w-none overflow-y-auto outline-none ${
          isPlain ? 'px-4 py-5 md:px-5' : 'px-4 py-4'
        }`}
        style={{ minHeight }}
      />
    </div>
  );
};
