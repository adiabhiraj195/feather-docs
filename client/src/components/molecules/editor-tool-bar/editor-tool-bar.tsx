import './editor-tool-bar.css';
import { useContext, useState } from 'react';
import { EditorContext } from '../../../context/editor-context';
import { 
  BiUndo, 
  BiRedo, 
  BiBold, 
  BiItalic, 
  BiUnderline, 
  BiCode, 
  BiListUl, 
  BiListOl, 
  BiChevronDown,
  BiPalette
} from 'react-icons/bi';
import { EditorState, RichUtils, Modifier } from 'draft-js';
import { MdLockOutline, MdFormatClear } from 'react-icons/md';
import { DocumentContext } from '../../../context/document-context';
import ShareUser from '../../atom/share-user/share-user';
import useAuth from '../../../hooks/useAuth';
import { customStyleMap } from '../../organism/document-editor/document-editor';

const EditorToolBar = () => {
  const { editorState, handleEditorChange } = useContext(EditorContext);
  const { setShareDocWindow, document } = useContext(DocumentContext);
  const { userId } = useAuth();

  // Dropdown visibility states
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  // Formatting options mapping
  const blockTypes = [
    { label: 'Normal Text', style: 'unstyled' },
    { label: 'Heading 1', style: 'header-one' },
    { label: 'Heading 2', style: 'header-two' },
    { label: 'Heading 3', style: 'header-three' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'Code Block', style: 'code-block' },
  ];

  const fontSizes = [
    { label: '12px', style: 'FONT_SIZE_12' },
    { label: '14px', style: 'FONT_SIZE_14' },
    { label: '16px', style: 'FONT_SIZE_16' },
    { label: '18px', style: 'FONT_SIZE_18' },
    { label: '20px', style: 'FONT_SIZE_20' },
    { label: '24px', style: 'FONT_SIZE_24' },
    { label: '30px', style: 'FONT_SIZE_30' },
    { label: '36px', style: 'FONT_SIZE_36' },
    { label: '48px', style: 'FONT_SIZE_48' },
  ];

  const colors = [
    { label: 'Default', style: 'COLOR_PRIMARY', hex: 'var(--text-primary)' },
    { label: 'Grey', style: 'COLOR_GREY', hex: '#64748b' },
    { label: 'Red', style: 'COLOR_RED', hex: '#ef4444' },
    { label: 'Orange', style: 'COLOR_ORANGE', hex: '#f97316' },
    { label: 'Yellow', style: 'COLOR_YELLOW', hex: '#eab308' },
    { label: 'Green', style: 'COLOR_GREEN', hex: '#22c55e' },
    { label: 'Blue', style: 'COLOR_BLUE', hex: '#3b82f6' },
    { label: 'Purple', style: 'COLOR_PURPLE', hex: '#a855f7' },
    { label: 'Pink', style: 'COLOR_PINK', hex: '#ec4899' },
  ];

  // Derive active selection states
  const currentInlineStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const currentBlockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  const activeBlockLabel = blockTypes.find(b => b.style === currentBlockType)?.label || 'Normal Text';
  
  const activeFontSizeKey = currentInlineStyle.find(s => s ? s.startsWith('FONT_SIZE_') : false) || 'FONT_SIZE_16';
  const activeFontSizeLabel = fontSizes.find(f => f.style === activeFontSizeKey)?.label || '16px';

  const activeColorKey = currentInlineStyle.find(s => s ? s.startsWith('COLOR_') : false) || 'COLOR_PRIMARY';
  const activeColorObject = colors.find(c => c.style === activeColorKey) || colors[0];

  // Core Formatting Toggles
  const toggleInlineStyle = (style: string) => {
    const nextState = RichUtils.toggleInlineStyle(editorState, style);
    handleEditorChange(nextState);
  };

  const toggleBlockType = (blockType: string) => {
    const nextState = RichUtils.toggleBlockType(editorState, blockType);
    handleEditorChange(nextState);
    setIsBlockDropdownOpen(false);
  };

  const toggleFontSize = (sizeName: string) => {
    const selectionState = editorState.getSelection();
    let nextContentState = editorState.getCurrentContent();
    const fontSizeKeys = Object.keys(customStyleMap).filter(key => key.startsWith('FONT_SIZE_'));
    
    // Remove other font sizes first
    fontSizeKeys.forEach(style => {
      nextContentState = Modifier.removeInlineStyle(nextContentState, selectionState, style);
    });

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    const currentStyles = editorState.getCurrentInlineStyle();

    if (selectionState.isCollapsed()) {
      nextEditorState = currentStyles.reduce((state: EditorState | undefined, style?: string) => {
        const currentState = state || nextEditorState;
        if (style && style.startsWith('FONT_SIZE_')) {
          return RichUtils.toggleInlineStyle(currentState, style);
        }
        return currentState;
      }, nextEditorState);
    }

    if (!currentStyles.has(sizeName)) {
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, sizeName);
    }

    handleEditorChange(nextEditorState);
    setIsFontSizeDropdownOpen(false);
  };

  const toggleColor = (colorName: string) => {
    const selectionState = editorState.getSelection();
    let nextContentState = editorState.getCurrentContent();
    const colorKeys = Object.keys(customStyleMap).filter(key => key.startsWith('COLOR_'));
    
    // Remove other text colors first
    colorKeys.forEach(style => {
      nextContentState = Modifier.removeInlineStyle(nextContentState, selectionState, style);
    });

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    const currentStyles = editorState.getCurrentInlineStyle();

    if (selectionState.isCollapsed()) {
      nextEditorState = currentStyles.reduce((state: EditorState | undefined, style?: string) => {
        const currentState = state || nextEditorState;
        if (style && style.startsWith('COLOR_')) {
          return RichUtils.toggleInlineStyle(currentState, style);
        }
        return currentState;
      }, nextEditorState);
    }

    if (!currentStyles.has(colorName)) {
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, colorName);
    }

    handleEditorChange(nextEditorState);
    setIsColorDropdownOpen(false);
  };

  const clearFormatting = () => {
    const selectionState = editorState.getSelection();
    if (selectionState.isCollapsed()) return;

    let nextContentState = editorState.getCurrentContent();
    const allStyleKeys = [
      'BOLD', 'ITALIC', 'UNDERLINE', 'CODE',
      ...Object.keys(customStyleMap)
    ];

    allStyleKeys.forEach(style => {
      nextContentState = Modifier.removeInlineStyle(nextContentState, selectionState, style);
    });

    const nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    handleEditorChange(nextEditorState);
  };

  const handleUndo = () => {
    const nextState = EditorState.undo(editorState);
    handleEditorChange(nextState);
  };

  const handleRedo = () => {
    const nextState = EditorState.redo(editorState);
    handleEditorChange(nextState);
  };

  const handleShareBtn = () => {
    setShareDocWindow(true);
  };

  return (
    <div className='editor-tool-bar'>
      <div className='editor-tool-bar-left-wrap'>
        {/* Undo Redo section */}
        <div className='undo-redo-wrap'>
          <button 
            className='toolbar-btn tooltip' 
            data-tooltip="Undo" 
            onMouseDown={(e) => {
              e.preventDefault();
              handleUndo();
            }}
          >
            <BiUndo />
          </button>
          <button 
            className='toolbar-btn tooltip' 
            data-tooltip="Redo" 
            onMouseDown={(e) => {
              e.preventDefault();
              handleRedo();
            }}
          >
            <BiRedo />
          </button>
        </div>

        <div className='toolbar-divider' />

        {/* Block Type Dropdown */}
        <div className='toolbar-dropdown-container'>
          <button 
            className={`toolbar-dropdown-trigger ${isBlockDropdownOpen ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsBlockDropdownOpen(!isBlockDropdownOpen);
              setIsFontSizeDropdownOpen(false);
              setIsColorDropdownOpen(false);
            }}
          >
            <span>{activeBlockLabel}</span>
            <BiChevronDown className='arrow-icon' />
          </button>
          {isBlockDropdownOpen && (
            <div className='toolbar-dropdown-menu glass-panel'>
              {blockTypes.map((type) => (
                <button 
                  key={type.style}
                  className={`toolbar-dropdown-item ${currentBlockType === type.style ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlockType(type.style);
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='toolbar-divider' />

        {/* Font Size Dropdown */}
        <div className='toolbar-dropdown-container'>
          <button 
            className={`toolbar-dropdown-trigger ${isFontSizeDropdownOpen ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen);
              setIsBlockDropdownOpen(false);
              setIsColorDropdownOpen(false);
            }}
          >
            <span>{activeFontSizeLabel}</span>
            <BiChevronDown className='arrow-icon' />
          </button>
          {isFontSizeDropdownOpen && (
            <div className='toolbar-dropdown-menu font-size-menu glass-panel'>
              {fontSizes.map((size) => (
                <button 
                  key={size.style}
                  className={`toolbar-dropdown-item ${activeFontSizeKey === size.style ? 'selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleFontSize(size.style);
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='toolbar-divider' />

        {/* Inline formatting buttons */}
        <div className='inline-styles-wrap'>
          <button 
            className={`toolbar-btn tooltip ${currentInlineStyle.has('BOLD') ? 'active' : ''}`}
            data-tooltip="Bold" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleInlineStyle('BOLD');
            }}
          >
            <BiBold />
          </button>
          <button 
            className={`toolbar-btn tooltip ${currentInlineStyle.has('ITALIC') ? 'active' : ''}`}
            data-tooltip="Italic" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleInlineStyle('ITALIC');
            }}
          >
            <BiItalic />
          </button>
          <button 
            className={`toolbar-btn tooltip ${currentInlineStyle.has('UNDERLINE') ? 'active' : ''}`}
            data-tooltip="Underline" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleInlineStyle('UNDERLINE');
            }}
          >
            <BiUnderline />
          </button>
          <button 
            className={`toolbar-btn tooltip ${currentInlineStyle.has('CODE') ? 'active' : ''}`}
            data-tooltip="Code" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleInlineStyle('CODE');
            }}
          >
            <BiCode />
          </button>
        </div>

        <div className='toolbar-divider' />

        {/* Lists options */}
        <div className='list-styles-wrap'>
          <button 
            className={`toolbar-btn tooltip ${currentBlockType === 'unordered-list-item' ? 'active' : ''}`}
            data-tooltip="Bullet List" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockType('unordered-list-item');
            }}
          >
            <BiListUl />
          </button>
          <button 
            className={`toolbar-btn tooltip ${currentBlockType === 'ordered-list-item' ? 'active' : ''}`}
            data-tooltip="Numbered List" 
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockType('ordered-list-item');
            }}
          >
            <BiListOl />
          </button>
        </div>

        <div className='toolbar-divider' />

        {/* Text Color Popover */}
        <div className='toolbar-dropdown-container'>
          <button 
            className={`toolbar-dropdown-trigger color-trigger ${isColorDropdownOpen ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsColorDropdownOpen(!isColorDropdownOpen);
              setIsBlockDropdownOpen(false);
              setIsFontSizeDropdownOpen(false);
            }}
            style={{ borderBottom: `3px solid ${activeColorObject.hex}` }}
          >
            <BiPalette className='palette-icon' />
            <BiChevronDown className='arrow-icon' />
          </button>
          {isColorDropdownOpen && (
            <div className='toolbar-dropdown-menu color-picker-menu glass-panel'>
              <div className='color-picker-grid'>
                {colors.map((color) => (
                  <button 
                    key={color.style}
                    className={`color-picker-cell ${activeColorKey === color.style ? 'selected' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleColor(color.style);
                    }}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='toolbar-divider' />

        {/* Clear formatting */}
        <button 
          className='toolbar-btn tooltip' 
          data-tooltip="Clear Formatting" 
          onMouseDown={(e) => {
            e.preventDefault();
            clearFormatting();
          }}
        >
          <MdFormatClear />
        </button>
      </div>

      <div className='tool-bar-operation-wrap'>
        <div className='shared-user-container'>
          {document?.users?.map((user) => {
            return (
              <ShareUser
                key={user?.id}
                id={user?.id as number}
                email={user?.email as string}
              />)
          })}
        </div>
        <button
          className='share-document-window-btn'
          onClick={handleShareBtn}
          disabled={userId === document?.userId ? false : true}
        >
          <MdLockOutline />
          <p>Share</p>
        </button>
      </div>
    </div>
  )
}

export default EditorToolBar;