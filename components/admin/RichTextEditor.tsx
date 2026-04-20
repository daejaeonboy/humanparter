import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from 'react';
import {
  Bold,
  Check,
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
  enableImageSelection?: boolean;
  selectedImageUrl?: string;
  imageSelectionLabel?: string;
  onSelectImage?: (url: string) => void;
}

interface HoveredImageState {
  url: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SelectedImageIndicatorState {
  top: number;
  left: number;
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
  enableImageSelection = false,
  selectedImageUrl,
  imageSelectionLabel = '대표 이미지로 선택',
  onSelectImage,
}: RichTextEditorProps) => {
  const editorShellRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const hoveredImageRef = useRef<HTMLImageElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedLineHeight, setSelectedLineHeight] = useState('1.9');
  const [selectedColor, setSelectedColor] = useState('#111827');
  const [dragActive, setDragActive] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<HoveredImageState | null>(null);
  const [selectedImageIndicator, setSelectedImageIndicator] = useState<SelectedImageIndicatorState | null>(null);

  const isPlain = variant === 'plain';

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.querySelectorAll('img').forEach((image) => {
      image.style.cursor = enableImageSelection ? 'pointer' : '';
    });
  }, [value, enableImageSelection]);

  useEffect(() => {
    const editor = editorRef.current;
    const shell = editorShellRef.current;
    if (!editor || !shell || !selectedImageUrl) {
      setSelectedImageIndicator(null);
      return;
    }

    const selectedImage = Array.from(editor.querySelectorAll('img')).find(
      (image) => image.getAttribute('src')?.trim() === selectedImageUrl,
    );

    if (!selectedImage) {
      setSelectedImageIndicator(null);
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const imageRect = selectedImage.getBoundingClientRect();
    setSelectedImageIndicator({
      top: imageRect.top - shellRect.top + 12,
      left: imageRect.left - shellRect.left + imageRect.width - 48,
    });
  }, [selectedImageUrl, value]);

  const syncValue = useCallback(() => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

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
    Object.entries(styles).forEach(([property, styleValue]) => {
      element.style.setProperty(
        property.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`),
        styleValue,
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

  const setSelectionFromPoint = (clientX: number, clientY: number) => {
    focusEditor();

    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(clientX, clientY);
      if (!range) return;
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(clientX, clientY);
      if (!position) return;
      const range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(range);
    }
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

  const uploadAndInsertImages = async (files: File[], selectionPoint?: { clientX: number; clientY: number }) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      if (selectionPoint) {
        setSelectionFromPoint(selectionPoint.clientX, selectionPoint.clientY);
      } else {
        focusEditor();
      }

      for (const file of files) {
        const url = await uploadImage(file, uploadFolder);
        insertImageByUrl(url);
      }
    } catch (error) {
      console.error('Failed to upload editor image:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []).filter((file) => file.type.startsWith('image/'));
      await uploadAndInsertImages(files);
    };
    input.click();
  };

  const handleColorInput = (event: ChangeEvent<HTMLInputElement>) => {
    applyTextColor(event.target.value);
  };

  const updateHoveredImage = useCallback((image: HTMLImageElement | null) => {
    hoveredImageRef.current = image;

    if (!image || !editorShellRef.current) {
      setHoveredImage(null);
      return;
    }

    const shellRect = editorShellRef.current.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const url = image.getAttribute('src')?.trim() || '';

    if (!url) {
      setHoveredImage(null);
      return;
    }

    setHoveredImage({
      url,
      top: imageRect.top - shellRect.top,
      left: imageRect.left - shellRect.left,
      width: imageRect.width,
      height: imageRect.height,
    });
  }, []);

  const handleEditorMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableImageSelection) return;
    const target = event.target instanceof HTMLElement ? event.target.closest('img') : null;
    updateHoveredImage(target as HTMLImageElement | null);
  };

  const handleEditorScroll = () => {
    if (enableImageSelection && hoveredImageRef.current) {
      updateHoveredImage(hoveredImageRef.current);
    }

    const editor = editorRef.current;
    const shell = editorShellRef.current;
    if (!editor || !shell || !selectedImageUrl) return;

    const selectedImage = Array.from(editor.querySelectorAll('img')).find(
      (image) => image.getAttribute('src')?.trim() === selectedImageUrl,
    );

    if (!selectedImage) {
      setSelectedImageIndicator(null);
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const imageRect = selectedImage.getBoundingClientRect();
    setSelectedImageIndicator({
      top: imageRect.top - shellRect.top + 12,
      left: imageRect.left - shellRect.left + imageRect.width - 48,
    });
  };

  const handleEditorMouseLeave = () => {
    if (!enableImageSelection) return;
    updateHoveredImage(null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.items || []).some((item) => item.kind === 'file')) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragActive(false);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    event.preventDefault();
    await uploadAndInsertImages(files, { clientX: event.clientX, clientY: event.clientY });
  };

  const defaultButtonClassName =
    'rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50';
  const plainButtonClassName =
    'inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-50';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      {isPlain ? (
        <div className="space-y-4 border-b border-slate-200 bg-slate-50/50 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">프리셋</span>
              <div className="flex gap-1.5">
                <button type="button" onMouseDown={keepSelection} onClick={applyPresetTitle} className={plainButtonClassName}>
                  타이틀
                </button>
                <button type="button" onMouseDown={keepSelection} onClick={applyPresetBody} className={plainButtonClassName}>
                  본문
                </button>
              </div>
              <span className="ml-1 text-[10px] font-medium text-slate-400">선택한 문단 기준</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">글씨</span>
              <button
                type="button"
                onMouseDown={keepSelection}
                onClick={() => exec('bold')}
                className={`${plainButtonClassName} ${document.queryCommandState?.('bold') ? 'border-[#001e45] bg-[#001e45]/5 text-[#001e45]' : ''}`}
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
                  <button key={fontSize} type="button" onMouseDown={keepSelection} onClick={() => applyFontSize(fontSize)} className={plainButtonClassName}>
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
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110 ${selectedColor === color ? 'border-[#001e45] ring-2 ring-[#001e45]/20' : 'border-black/10'}`}
                    aria-label={`글자색 ${color}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <label className="ml-2 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-800 transition-colors hover:bg-slate-50">
                직접 선택
                <input type="color" value={selectedColor} onChange={handleColorInput} className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0" />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="min-w-[40px] text-[11px] font-bold text-slate-600">이미지</span>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  placeholder="이미지 URL 붙여넣기"
                  className="h-9 min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#001e45]"
                />
                <button type="button" onMouseDown={keepSelection} onClick={() => insertImageByUrl()} className={plainButtonClassName}>
                  URL 삽입
                </button>
                <button type="button" onMouseDown={keepSelection} onClick={handleImageUpload} disabled={uploading} className={plainButtonClassName}>
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
                <span className="text-[11px] font-medium text-slate-400">폴더에서 끌어다 놓아도 업로드됩니다.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('bold')} className={defaultButtonClassName}>
            <Bold size={16} />
          </button>
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('italic')} className={defaultButtonClassName}>
            <Italic size={16} />
          </button>
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('underline')} className={defaultButtonClassName}>
            <Underline size={16} />
          </button>
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('formatBlock', '<h2>')} className={defaultButtonClassName}>
            <Heading2 size={16} />
          </button>
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('insertUnorderedList')} className={defaultButtonClassName}>
            <List size={16} />
          </button>
          {showLinkButton && (
            <button type="button" onMouseDown={keepSelection} onClick={handleLink} className={defaultButtonClassName}>
              <Link2 size={16} />
            </button>
          )}
          <button type="button" onMouseDown={keepSelection} onClick={handleImageUpload} disabled={uploading} className={defaultButtonClassName}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          </button>
          <button type="button" onMouseDown={keepSelection} onClick={() => exec('removeFormat')} className={defaultButtonClassName}>
            <Eraser size={16} />
          </button>
        </div>
      )}

      <div
        ref={editorShellRef}
        className={`relative ${dragActive ? 'bg-[#001e45]/[0.03]' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseLeave={handleEditorMouseLeave}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          onMouseMove={handleEditorMouseMove}
          onScroll={handleEditorScroll}
          className={`prose prose-slate max-w-none overflow-y-auto outline-none ${isPlain ? 'px-4 py-5 md:px-5' : 'px-4 py-4'}`}
          style={{ minHeight }}
        />

        {dragActive && (
          <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#001e45]/30 bg-white/80 text-sm font-bold text-[#001e45] backdrop-blur-sm">
            이미지를 여기에 놓으면 본문에 바로 업로드됩니다.
          </div>
        )}

        {enableImageSelection && selectedImageIndicator && (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              top: selectedImageIndicator.top,
              left: selectedImageIndicator.left,
            }}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#001e45] text-white shadow-lg">
              <Check size={18} />
            </span>
          </div>
        )}

        {enableImageSelection && hoveredImage && hoveredImage.url !== selectedImageUrl && onSelectImage && (
          <div
            className="absolute z-10"
            style={{
              top: hoveredImage.top + Math.max(16, Math.min(hoveredImage.height - 44, 16)),
              left: hoveredImage.left + Math.max(16, Math.min(hoveredImage.width - 156, 16)),
            }}
          >
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelectImage(hoveredImage.url)}
              className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-[#001e45] shadow-lg transition hover:bg-slate-100"
            >
              {imageSelectionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
