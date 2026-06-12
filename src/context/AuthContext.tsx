// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../service/supabase';
import { useNavigate } from 'react-router-dom';
import type { UserSistema } from '../model/Aluno';

interface AuthContextType {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    user: UserSistema | null;
    session: any;
    isAuthenticated: boolean;
    loadingSession: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserSistema | null>(null);
    const [session, setSession] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingSession, setLoadingSession] = useState(true);
    const navigate = useNavigate();



    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Erro ao fazer login:', error.message);
            throw error;
        }

        if (!data?.user) {
            throw new Error('Usuário não encontrado ou credenciais inválidas');
        }

        console.log('Login realizado com sucesso!', data.user);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // Limpa o token manualmente
        localStorage.removeItem('supabase.auth.token');

        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };


    useEffect(() => {
        let sessionChecked = false;
        const fetchAdminData = async (id: any, _email: string) => {
            const { data: usuarioData, error: adminError } = await supabase
                .from('usuario_sistema')
                .select('id, nome')
                .eq('id', id)
                .single();

            if (!usuarioData || adminError) {
                console.warn('Membro não encontrado ou erro na consulta.');
                setUser(null);
                setIsAuthenticated(false);
                return;
            }
            setUser(usuarioData);
            setIsAuthenticated(true);
        };



        const getSession = async () => {
            if (sessionChecked) return;
            sessionChecked = true;
            setLoadingSession(true);

            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;
            setSession(data?.session || null);

            if (sessionUser && sessionUser?.email) {
                await fetchAdminData(sessionUser.id, sessionUser.email);
            } else {
                //tentar recuperar com getUser como fallback
                const { data: userData } = await supabase.auth.getUser();
                if (userData?.user?.email) {
                    await fetchAdminData(userData.user.id, userData.user.email);
                } else {
                    setUser(null);
                    setIsAuthenticated(false)
                }
            }
            console.log("Sessão verificada:", data?.session);
            setLoadingSession(false);


        };
        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setTimeout(async () => {

                setSession(session)
                const sessionUser = session?.user;
                if (sessionUser && sessionUser.email) {
                    await fetchAdminData(sessionUser.id, sessionUser.email);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }

            }, 0)
        });

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                const { data } = await supabase.auth.getSession();
                const sessionUser = data?.session?.user;
                setSession(data?.session || null);

                if (sessionUser?.email) {
                    await fetchAdminData(sessionUser.id, sessionUser.email);
                } else {
                    const { data: userData } = await supabase.auth.getUser();
                    if (userData?.user?.email) {
                        await fetchAdminData(userData.user.id, userData.user.email);
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            listener?.subscription?.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };



    }, []);



    return (
        <AuthContext.Provider value={{ login, user, session, isAuthenticated, loadingSession, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};