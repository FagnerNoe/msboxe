import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
    studentName: string;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DeleteModal({ studentName, onConfirm, onClose }: DeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1A0A0A] mb-2">Excluir aluno?</h2>
                    <p className="text-[#6B4040] text-sm">
                        Tem certeza que deseja excluir <span className="font-semibold text-[#3D1A0A]">{studentName}</span>?
                        Esta ação não pode ser desfeita.
                    </p>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border-2 border-[#8B4513] text-[#8B4513] font-semibold rounded-xl hover:bg-[#8B4513]/10 transition flex items-center justify-center gap-2"
                    >
                        <X size={16} />
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}
