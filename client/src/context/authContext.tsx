import { createContext, useState, Dispatch, SetStateAction, useEffect } from "react";
import jwtDecode from "jwt-decode";

interface AuthContextInterface {
    email: string | null;
    setEmail: Dispatch<SetStateAction<string | null>>;
    accessToken: string | null;
    setAccessToken: Dispatch<SetStateAction<string | null>>;
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    loadingAuth: boolean;
    setLoadingAuth: Dispatch<SetStateAction<boolean>>;
    errors: Array<string>;
    setErrors: Dispatch<SetStateAction<Array<string>>>;
    userId: number | null;
    setUserId: Dispatch<SetStateAction<number | null>>;
    userName: string | null;
    setUserName: Dispatch<SetStateAction<string | null>>;
}

const defaultValues = {
    email: null,
    setEmail: () => { },
    accessToken: null,
    setAccessToken: () => { },
    isAuthenticated: false,
    setIsAuthenticated: () => { },
    loading: false,
    setLoading: () => { },
    loadingAuth: true,
    setLoadingAuth: () => { },
    errors: [],
    setErrors: () => { },
    userId: null,
    setUserId: () => { },
    userName: null,
    setUserName: () => { }
}

export const AuthContext = createContext<AuthContextInterface>(defaultValues);

interface AuthProviderInterface {
    children: JSX.Element;
}

export const AuthProvider = ({ children }: AuthProviderInterface) => {
    const [email, setEmail] = useState<string | null>(defaultValues.email);
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem('Token')
    );
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        defaultValues.isAuthenticated
    );
    const [loading, setLoading] = useState<boolean>(defaultValues.loading);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(
        defaultValues.loadingAuth
    );
    const [errors, setErrors] = useState<Array<string>>(defaultValues.errors);
    const [userId, setUserId] = useState<number | null>(defaultValues.userId);
    const [userName, setUserName] = useState<string | null>(defaultValues.userName);

    // Automatically recover and decode stored Token on browser refresh
    useEffect(() => {
        const token = localStorage.getItem('Token');
        if (token) {
            try {
                const userData: any = jwtDecode(token);
                if (userData && userData.user) {
                    setUserId(userData.user.id);
                    setEmail(userData.user.email);
                    setUserName(userData.user.userName);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Failed to decode token on refresh:", error);
                localStorage.removeItem('Token');
                setAccessToken(null);
                setIsAuthenticated(false);
            }
        }
        setLoadingAuth(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                email,
                setEmail,
                accessToken,
                setAccessToken,
                isAuthenticated,
                setIsAuthenticated,
                loading,
                setLoading,
                loadingAuth,
                setLoadingAuth,
                errors,
                setErrors,
                userId,
                setUserId,
                userName,
                setUserName
            }}
        >
            {children}
        </AuthContext.Provider>

    )
}   