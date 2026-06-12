import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Eye, EyeClosed } from 'lucide-react';


export function Auth() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { login, session, loadingSession } = useAuth();




    useEffect(() => {
        if (!loadingSession && session) {
            navigate("/home");
        }
    }, [loadingSession, session]);



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro');
        } finally {
            setLoading(false);
        }
    };






    return (
        <div className="h-screen flex  items-end bg-black  "
            style={{ backgroundImage: "url('/imagem2.jpg')", backgroundRepeat: "no-repeat", objectFit: "cover", backgroundPositionX: "center" }}>

            <div className="absolute inset-0 bg-linear-to-b from-primary/40 to-black/70"></div>

            <div className="relative z-10 w-full h-full flex justify-center items-center">
                <div className="bg-transparent w-full h-full py-50 px-10 rounded-xl z-50 sm:w-sm  lg:w-sm backdrop-blur-xs  ">
                    <div className=" flex flex-col justify-center items-center">
                        <div className="inline-flex items-center justify-center w-40 h-35  ">
                            <img src='logo-ms.png' className="w-40 h-42 text-white" />
                        </div>

                        <p className="text-gray-300  font-medium  text-sm font-[Poppins] ">
                            Gestão de Alunos
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400  mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300  bg-white/70 text-gray-900 focus:ring-2 focus:ring-yellow focus:outline"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div className='relative'>
                            <label className="block text-sm font-medium text-gray-400  mb-2">
                                Senha
                            </label>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className=" relative w-full px-4 py-3 rounded-lg border border-gray-300 00 bg-white/70 ext-gray-900 focus:ring-2 focus:ring-yellow focus:outline"
                                required
                                placeholder='**********'
                                minLength={6}
                            />
                            <div
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className='absolute right-2 top-1/2 pr-1'>
                                {mostrarSenha ? <Eye className='text-gray-400' /> : <EyeClosed className='text-gray-400' />}

                            </div>
                        </div >

                        {error && (
                            <div className="bg-red-50  border border-red-200 0 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-[Poppins] active:bg-yellow hover:bg-secondary  text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Carregando...' : 'Entrar'}
                        </button>
                    </form>



                </div>
            </div >
        </div >
    );
}
