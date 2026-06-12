// AlunoModal.jsx
import { Calendar, PhoneCallIcon, MapPin, Clock, Trash2, Edit3 } from "lucide-react";



type DetalhesModalProps = {
    showModal: boolean;
    selectedAluno: {
        nome: string;
        foto_url?: string;
        data_nascimento?: string;
        planos?: { nome: string };
        telefone?: string;
        endereco?: string;
        created_at: string;
    } | null;
    onEdit: (aluno: any) => void;
    closeModal: () => void;
};


export default function AlunoModal({ showModal, selectedAluno, onEdit, closeModal }: DetalhesModalProps) {
    if (!showModal || !selectedAluno) return null;

    return (
        <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50">
            <div className="bg-black rounded-xl shadow-2xl shadow-gray-400 max-w-md w-full mx-4 relative">

                {/* Foto estilo Netflix */}
                <div className="relative h-48 w-full">
                    {selectedAluno.foto_url ? (
                        <img
                            src={selectedAluno.foto_url}
                            alt={selectedAluno.nome}
                            className="w-full h-full rounded-t-xl object-cover"
                        />
                    ) : (
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAluno.nome)}&background=random&color=fff&size=128`}
                            alt={selectedAluno.nome}
                            className="w-full h-full rounded-t-xl object-cover"
                        />
                    )}
                    {/* Overlay esfumado */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* Nome sobreposto */}
                    <h2 className="absolute bottom-3 left-3 text-white text-2xl font-bold drop-shadow-lg">
                        {selectedAluno.nome}
                    </h2>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-4">
                    {/* Detalhes */}
                    <div className="text-gray-400 flex items-center text-sm justify-between">
                        <div className="flex items-center gap-1">
                            <Calendar />
                            {selectedAluno.data_nascimento?.split("-").reverse().join("/")}
                        </div>
                        <div className="text-primary font-bold text-sm bg-yellow px-2 py-1 rounded-lg flex items-center gap-1">
                            {selectedAluno.planos?.nome}
                        </div>
                    </div>

                    <div className="text-gray-400 text-sm flex items-center gap-1">
                        <PhoneCallIcon />
                        {selectedAluno.telefone}
                    </div>

                    <div className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin />
                        {selectedAluno.endereco}
                    </div>

                    <div className="text-white/50 bg-yellow/20 rounded text-center">
                        Membro Desde: {new Date(selectedAluno.created_at).toLocaleDateString("pt-BR")}
                    </div>

                    <button
                        onClick={() => {/* abrir histórico de pagamentos */ }}
                        className="flex items-center gap-2 bg-yellow px-3 py-2 rounded-lg mx-auto hover:bg-yellow/80"
                    >
                        <Clock size={18} /> Histórico de Mensalidades
                    </button>

                    {/* Ações */}
                    <div className="flex justify-between items-center mt-10">
                        <button
                            onClick={() => {/* lógica inativar */ }}
                            className="flex items-center gap-2 bg-red-50/10 text-yellow/60 px-3 py-2 rounded-lg hover:bg-red-400"
                        >
                            <Trash2 size={18} /> Inativar
                        </button>
                        <button
                            onClick={() => onEdit(selectedAluno)}
                            className="flex items-center gap-2 bg-blue-50/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-400"
                        >
                            <Edit3 size={18} /> Editar
                        </button>
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={closeModal}
                        className="absolute top-2 right-2 text-primary px-3 py-2 rounded-full bg-yellow hover:text-primary"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
