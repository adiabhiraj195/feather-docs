import {
    useState,
    createContext,
    SetStateAction,
    Dispatch,
    useRef,
    MutableRefObject,
    useContext,
    useEffect
} from 'react';
import {
    Editor,
    EditorState,
    convertToRaw,
    convertFromRaw,
    RawDraftContentState
} from 'draft-js';
import { DocumentContext } from './document-context';
import DocumentInterface from '../types/interface/document-interface';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import { BASE_URL } from '../service/api';
import SocketEvents from '../types/enums/SocketEvents-enum';

interface EditorContextInterface {
    editorState: EditorState;
    setEditorState: Dispatch<SetStateAction<EditorState>>;
    handleEditorChange: (editorState: EditorState) => void;
    editorRef: null | MutableRefObject<null | Editor>;
    focusEditor: () => void;
    socket: MutableRefObject<any> | null
}

const defaultValue = {
    editorState: EditorState.createEmpty(),
    setEditorState: () => { },
    handleEditorChange: () => { },
    editorRef: null,
    focusEditor: () => { },
    socket: null
}

export const EditorContext = createContext<EditorContextInterface>(defaultValue);

interface EditorProviderInterface {
    children: JSX.Element;
}

const DEFAULT_SAVE_TIME = 1500;
let saveInterval: null | NodeJS.Timer = null;

export const EditorProvider = ({ children }: EditorProviderInterface) => {
    const [editorState, setEditorState] = useState(defaultValue.editorState);
    const editorRef = useRef<null | Editor>(defaultValue.editorRef);
    const socket = useRef<any>(defaultValue.socket);
    const lastLoadedId = useRef<number | null>(null);
    const { document, setDocument, saveDocument, setSaving, setCurrentUsers } = useContext(DocumentContext);
    // const { accessToken } = useAuth();
    const accessToken = localStorage.getItem('Token');

    const handleEditorChange = (editorState: EditorState) => {
        setEditorState(editorState);
        const content = convertToRaw(editorState.getCurrentContent());

        socket.current.emit(SocketEvents.SEND_CHANGES, content);

        const updatedDocument = {
            ...document,
            content: JSON.stringify(content)
        } as DocumentInterface;
        setDocument(updatedDocument);

        if (document === null || JSON.stringify(content) === document.content) return;

        if (saveInterval !== null) {
            clearInterval(saveInterval);
        }
        saveInterval = setInterval(async () => {
            await saveDocument(updatedDocument);
            if (saveInterval) clearInterval(saveInterval);
        }, DEFAULT_SAVE_TIME);
    }

    const focusEditor = () => {
        if (editorRef === null || editorRef.current === null) return;
        editorRef.current.focus();
    }

    //Update document state
    useEffect(() => {
        if (document === null) {
            lastLoadedId.current = null;
            return;
        }
        if (document.content === null) return;

        if (document.id !== lastLoadedId.current) {
            try {
                const contentState = convertFromRaw(JSON.parse(document.content) as RawDraftContentState);
                const newEditorState = EditorState.createWithContent(contentState);
                setEditorState(newEditorState);
                lastLoadedId.current = document.id;
            } catch (error) {
                console.log(error);
            }
        }
    }, [document]);

    //Socket connection
    useEffect(() => {
        if (
            document === null ||
            accessToken === null ||
            socket === null ||
            (socket.current !== null && socket.current.connected)
        )
            return;

        socket.current = io(BASE_URL, {
            query: { documentId: document.id, accessToken },
        }).connect();

    }, [document, accessToken, socket]);

    //Disconnect Socket
    useEffect(() => {
        if (socket.current === null) return;
        // may be return a function
        return () => socket.current.disconnect();
    }, []);

    //Recieve changes
    useEffect(() => {
        if (socket.current === null) return;

        const receiveHandler = (rawContentState: RawDraftContentState) => {
            const rawContent = convertFromRaw(rawContentState);
            const newEditorState = EditorState.createWithContent(rawContent);
            setEditorState(newEditorState);
            // console.log(newEditorState)
        }

        socket.current.on(SocketEvents.RECEIVE_CHANGES, receiveHandler);

        return () => {
            socket.current.off(SocketEvents.RECEIVE_CHANGES, receiveHandler);
        }
    }, [socket.current]);

    //Update current users 
    useEffect(() => {
        if (socket.current === null) return;

        const usersHandler = (currentUsers: Array<string>) => {
            setCurrentUsers(new Set<string>(currentUsers));
        };

        socket.current.on(SocketEvents.CURRENT_USERS_UPDATE, usersHandler);

        return () => {
            socket.current.off(SocketEvents.CURRENT_USERS_UPDATE, usersHandler);
        }
    }, [socket.current]);

    return (
        <EditorContext.Provider
            value={{
                editorState,
                setEditorState,
                handleEditorChange,
                editorRef,
                focusEditor,
                socket
            }}
        >
            {children}
        </EditorContext.Provider>
    )
}