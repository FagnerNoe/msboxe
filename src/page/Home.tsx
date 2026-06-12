import { useState } from "react";
import { supabase } from "../service/supabase";
import type { Aluno } from "../model/Aluno";
import { BarChart2, Users, Plus, Power, Calendar } from "lucide-react";
import FormAluno from "../components/FormAluno";
import Dashboard from "../components/Dashboard";
import { useAuth } from "../context/AuthContext";

import DeleteModal from "../components/DeleteModal";
import { Mes } from "../components/Mes";
import { ListaAlunos } from "../components/ListaAlunos";
import { useAlunos } from "../hooks/useAlunos";
import DetalhesModal from "../components/DetalhesModal";


type FilterKey = 'all' | 'pago' | 'pendente';


export default function Home() {

    const [tab, setTab] = useState<Tab>('Mês');
    const [showForm, setShowForm] = useState(false);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editaluno, setEditaluno] = useState<Aluno | null>(null);
    const [deleteAluno, setDeleteAluno] = useState<Aluno | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const { logout } = useAuth();
    const [filter, setFilter] = useState<FilterKey>("pendente");
    const { alunos, setAlunos, loading, fetchAlunos } = useAlunos();




    const now = new Date();
    const CURRENT_MONTH = now.getMonth() + 1;
    const CURRENT_YEAR = now.getFullYear();
    type Tab = 'Mês' | 'Relatório' | 'Alunos';





    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaved = (alunoSalvo: Aluno) => {
        setAlunos(prev => {
            const exists = prev.some(a => a.id === alunoSalvo.id);
            if (exists) return prev.map(a => a.id === alunoSalvo.id ? alunoSalvo : a);
            return [alunoSalvo, ...prev];
        });
        setShowForm(false);
        setEditaluno(null);
        showToast('Aluno salvo com sucesso', 'success');
    };

    const handleSelectAluno = (aluno: Aluno) => {
        setSelectedAluno(aluno);
        setShowModal(true);
    };

    const handleEdit = (aluno: Aluno) => {
        setEditaluno(aluno);
        setShowForm(true);
        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!deleteAluno) return; // se não tiver aluno selecionado, sai da função

        const { error } = await supabase
            .from('alunos')
            .delete()
            .eq('id', deleteAluno.id); // aqui você passa o ID do aluno

        if (error) {
            showToast('Erro ao excluir aluno', 'error');
        } else {
            showToast('Aluno excluído com sucesso!', 'success');
            setDeleteAluno(null);
            fetchAlunos(); // recarrega a lista
        }
    };



    const openNew = () => {
        setEditaluno(null);
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="relative bg-primary shadow-xl">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-30 h-30 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-white/15">
                            <img src="/logo-ms.png" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-2xl ">MSBoxe</h1>
                            <p className="text-white/60 text-xs ">Gestao de Alunos</p>
                        </div>
                    </div>
                    <div className=" absolute top-4 right-5 h-45 flex flex-col items-end justify-between">
                        <button className="flex flex-col items-center "
                            onClick={() => logout()}>
                            <Power className=" text-yellow/80" />
                            <label className="text-yellow/80 text-xs">Sair</label>
                        </button>

                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-4 pb-0 flex gap-1 ">
                    {([
                        { key: 'Mês', label: 'Mês', icon: Calendar },
                        { key: 'Alunos', label: 'Alunos', icon: Users },
                        { key: 'Relatório', label: 'Relatório', icon: BarChart2 },
                    ] as const).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as Tab)}
                            className={`flex items-center gap-2 p-5 text-sm font-semibold rounded-t-xl  transition-all ${tab === t.key
                                ? 'bg-white text-primary'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <t.icon size={15} />
                            {t.label}
                        </button>

                    ))}


                </div>


            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {tab === 'Alunos' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1 linear-to-b from-primary to-[#001F5B] rounded-full" />
                                <h2 className="text-2xl font-bold text-primary">Meus Alunos</h2>
                            </div>
                            <button
                                onClick={openNew}
                                className="flex items-center gap-2 bg-primary hover:bg-yellow  text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-green-900 transition-all active:scale-95"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Novo Aluno</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-3 text-yellow">
                                    <div className="w-10 h-10 border-4 border-primary border-t-secondary rounded-full animate-spin" />
                                    <span className="text-sm">Carregando alunos...</span>
                                </div>
                            </div>
                        ) : (
                            <ListaAlunos
                                alunos={alunos}
                                onSelect={handleSelectAluno}
                                onDelete={(aluno) => {
                                    setDeleteAluno(aluno); // Define o aluno que será excluído e abre o modal de deletar
                                }}
                            />

                        )}
                    </div>
                )}


                {tab === 'Relatório' && (
                    <Dashboard
                        mesAtual={CURRENT_MONTH}
                        anoAtual={CURRENT_YEAR}

                    />
                )}

                {tab === 'Mês' && (
                    <Mes
                        alunos={alunos}        // ✅ passa como prop
                        setAlunos={setAlunos}
                        pago={true}
                        filter={filter}
                        onSelected={handleSelectAluno}
                        currentMonth={CURRENT_MONTH} // Usando a constante do topo
                        currentYear={CURRENT_YEAR}   // Usando a constante do topo
                        onFilterChange={setFilter}
                    />

                )}

            </main>

            {/* Modals */}
            {showForm && (
                <FormAluno
                    aluno={editaluno}
                    onSaved={handleSaved}
                    onClose={() => { setShowForm(false); setEditaluno(null); }}
                />
            )}

            <DetalhesModal
                showModal={showModal}
                selectedAluno={selectedAluno}
                onEdit={handleEdit}
                closeModal={() => setShowModal(false)}
            />


            {deleteAluno && (
                < DeleteModal
                    studentName={deleteAluno.nome}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteAluno(null)}
                />
            )}

            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2  px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {toast.msg}
                </div>
            )}

        </div>
    )

}
