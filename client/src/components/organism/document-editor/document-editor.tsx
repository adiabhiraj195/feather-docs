import { useContext, useCallback } from 'react'
import { Editor, RichUtils, EditorState } from "draft-js";
import { EditorContext } from '../../../context/editor-context';
import './document-editor.css';

// Define custom styles for font sizes and colors
export const customStyleMap = {
    // Font Sizes
    FONT_SIZE_12: { fontSize: '12px' },
    FONT_SIZE_14: { fontSize: '14px' },
    FONT_SIZE_16: { fontSize: '16px' },
    FONT_SIZE_18: { fontSize: '18px' },
    FONT_SIZE_20: { fontSize: '20px' },
    FONT_SIZE_24: { fontSize: '24px' },
    FONT_SIZE_30: { fontSize: '30px' },
    FONT_SIZE_36: { fontSize: '36px' },
    FONT_SIZE_48: { fontSize: '48px' },

    // Colors
    COLOR_PRIMARY: { color: 'var(--text-primary)' },
    COLOR_GREY: { color: '#64748b' },
    COLOR_RED: { color: '#ef4444' },
    COLOR_ORANGE: { color: '#f97316' },
    COLOR_YELLOW: { color: '#eab308' },
    COLOR_GREEN: { color: '#22c55e' },
    COLOR_BLUE: { color: '#3b82f6' },
    COLOR_PURPLE: { color: '#a855f7' },
    COLOR_PINK: { color: '#ec4899' },
};

const DocumentEditor = () => {
    const { editorState, editorRef, handleEditorChange, focusEditor } = useContext(EditorContext);

    // Support keyboard shortcuts like Cmd/Ctrl+B, Cmd/Ctrl+I, Cmd/Ctrl+U
    const handleKeyCommand = useCallback((command: string, state: EditorState) => {
        const newState = RichUtils.handleKeyCommand(state, command);
        if (newState) {
            handleEditorChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }, [handleEditorChange]);

    // Custom CSS style classes for blockquotes and code blocks
    const blockStyleFn = useCallback((contentBlock: any) => {
        const type = contentBlock.getType();
        if (type === 'blockquote') {
            return 'editor-blockquote';
        }
        if (type === 'code-block') {
            return 'editor-code-block';
        }
        return '';
    }, []);

    return (

        <div className='document-editor-container'>
            <div className='editor-wrap' onClick={focusEditor}>
                <Editor
                    ref={editorRef}
                    editorState={editorState}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    blockStyleFn={blockStyleFn}
                    customStyleMap={customStyleMap}
                    placeholder="Start typing your document..."
                />
            </div>
        </div>
    )
}
export default DocumentEditor;
