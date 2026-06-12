
import { type Aluno } from '../model/Aluno';
import { useEffect, useState } from 'react';
import { supabase } from '../service/supabase';
import { useAlunos } from '../hooks/useAlunos';
import { Search } from 'lucide-react';


interface ListaAlunosProps {
    alunos: Aluno[];
    onSelect: (aluno: Aluno) => void;
    onDelete: (aluno: Aluno) => void;
}





export function ListaAlunos({ alunos, onSelect }: ListaAlunosProps) {
    const [alunoBuscado, setAlunoBuscado] = useState<Aluno[]>([]);
    const [search, setSearch] = useState('');
    const { loading, error } = useAlunos();




    // Campo de busca de alunos
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!search || search.trim().length === 0) {
                setAlunoBuscado([]);
                return;
            }

            const { data, error } = await supabase
                .from("alunos")
                .select(`*, planos (*)`)
                .ilike("nome", `%${search}%`);

            if (!error && data) {
                setAlunoBuscado(data);
            }
        }, 300); // espera 300ms após digitar

        return () => clearTimeout(timeout); // limpa timeout se digitar de novo
    }, [search]);

    /*
        const inativarAluno = async (id: any) => {
            const { error } = await supabase
                .from('alunos')
                .update({ ativo: false })
                .eq('id', id)
    
            if (error) {
                console.error(error)
            } else {
                fetchAlunos(true)// recarrega lista de ativos
            }
        }
    
    
        const reativarAluno = async (id: any) => {
            const { error } = await supabase
                .from('alunos')
                .update({ ativo: true })
                .eq('id', id);
    
            if (error) {
                console.error(error)
            } else {
                fetchAlunos(false)
            }
        }
        */

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>Erro: {error.message}</p>;

    return (
        <div className="space-y-4">
            <div className="relative flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Busque por nome ..."
                        className="w-full pl-9 pr-4 py-2.5 border border-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow bg-white
                        transition-all duration-300"
                    />
                </div>

            </div>

            <ul className="flex flex-col sm:flex-row gap-4">
                {(search.trim().length > 0 ? alunoBuscado : alunos).map((aluno, index) => (
                    <li key={index}
                        onClick={() => onSelect(aluno)}
                        className={`relative flex items-cneter justify-between rounded-full shadow-sm shadow-primary/10 `}>

                        <div className={`w-full flex items-center justify-between gap-2`}>
                            {aluno.foto_url ? (
                                <div className="w-15 h-15 border-2 border-white shadow-lg shadow-gray-400 rounded-full">
                                    <img src={aluno.foto_url} alt={aluno?.nome} className={"h-full w-full object-cover rounded-full"} />
                                </div>
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(aluno?.nome)}&background=random&color=fff&size=128`} alt={aluno.nome} className="rounded-full w-14 h-14" />
                            )}
                            <h3 className="font-bold text-primary text-sm mr-5 w-45 text-start  truncate ">{aluno?.nome}</h3>
                            <div className={`${aluno.planos?.nome == "Básico" ? 'bg-gray-300 ' : 'bg-yellow '} rounded-full text-primar w-18 text-center px-2 py-2 font-bold text-xs }`}>
                                <h6>{aluno.planos?.nome ?? "----"}</h6>
                            </div>

                        </div>
                    </li>

                )
                )
                }
            </ul>



        </div>


    );
}
