
import type { Aluno } from "../model/Aluno";
import { supabase } from "../service/supabase";
import type React from "react";

// FilterKey represents the possible filter states used by this component
type FilterKey = 'all' | 'pago' | 'pendente';



type MesProps = {
    alunos: Aluno[];
    setAlunos: React.Dispatch<React.SetStateAction<Aluno[]>>;
    filter: FilterKey;
    currentMonth: number;
    currentYear: number;
    onFilterChange: (key: FilterKey) => void;
    pago: boolean;
    onSelected: (aluno: Aluno) => void
};



export function Mes({ alunos, setAlunos, filter, currentMonth, currentYear, onFilterChange, onSelected }: MesProps) {

    function isCurrentMonthPaid(s: Aluno, currentMonth: number, currentYear: number): boolean {
        const pagamentos = Array.isArray(s.pagamentos) ? s.pagamentos : [];
        return pagamentos.some(
            p => p.mes === currentMonth && p.ano === currentYear && p.pago === true
        );
    }


    const filterButtons: { key: FilterKey; label: string; count: number }[] = [
        { key: "pendente", label: "Pendentes", count: alunos.filter(s => !isCurrentMonthPaid(s, currentMonth, currentYear)).length },
        { key: "pago", label: "Pagos", count: alunos.filter(s => isCurrentMonthPaid(s, currentMonth, currentYear)).length },
        { key: "all", label: "Todos", count: alunos.length },
    ];

    const alunosFiltrados =
        filter === "all"
            ? alunos
            : filter === "pago"
                ? alunos.filter(s => isCurrentMonthPaid(s, currentMonth, currentYear))
                : alunos.filter(s => !isCurrentMonthPaid(s, currentMonth, currentYear));

    const togglePagamento = async (alunoId: string, mes: number, ano: number, pago: boolean, valorPlano: number) => {
        const { error } = await supabase
            .from("pagamentos")
            .upsert(
                {
                    aluno_id: alunoId,
                    mes,
                    ano,
                    pago,
                    valor_pago: valorPlano,
                    data_pagamento: new Date()

                },
                { onConflict: "aluno_id,mes,ano" } // ✅ precisa ser string única
            );

        if (error) {
            console.error("Erro ao atualizar pagamento:", error);
        } else {
            setAlunos(prev =>
                prev.map(a => {
                    if (a.id !== alunoId) {
                        return a;
                    }

                    const pagamentos = Array.isArray(a.pagamentos) ? [...a.pagamentos] : [];
                    const pagamentoIndex = pagamentos.findIndex(p => p.mes === mes && p.ano === ano);

                    if (pagamentoIndex >= 0) {
                        pagamentos[pagamentoIndex] = {
                            ...pagamentos[pagamentoIndex],
                            pago,
                            valor_pago: valorPlano,
                            data_pagamento: new Date(),
                        };
                    } else {
                        pagamentos.push({
                            id: "",
                            aluno_id: alunoId,
                            mes,
                            ano,
                            pago,
                            data_pagamento: new Date(),
                            valor_pago: valorPlano,
                        });
                    }

                    return {
                        ...a,
                        pagamentos,
                    };
                })
            );
        }
    };


    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-md border rounded-md px-4 py-1 font-bold text-primary 
            cursor-pointer hover:bg-primary hover:text-yellow shadow-sm shadow-yellow">Maio 2026</span>



            <div className="flex bg-yellow/20 rounded-xl p-1 gap-1">
                {filterButtons.map(btn => (
                    <button
                        key={btn.key}
                        onClick={() => onFilterChange(btn.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === btn.key
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-yellow hover:bg-white/60'
                            }`}
                    >
                        {btn.label}
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === btn.key ? 'bg-white/20 text-white' : 'bg-yellow/20 text-[#8B4513]'
                            }`}>
                            {btn.count}
                        </span>
                    </button>
                ))}
            </div>
            <ul className="w-full px-2 space-y-3">
                {alunosFiltrados.map(s => {
                    const Pago = isCurrentMonthPaid(s, currentMonth, currentYear);

                    return (
                        <li key={s.id}
                            className="flex items-center border-b p-1 w-full justify-between ">

                            <span onClick={() => onSelected(s)}
                                className="bg-primary px-2 py-1 rounded-full truncate w-27 text-white/70 text-sm">{s.nome}</span>

                            <div className="flex items-center space-x-3">

                                <span className="ml-3 text-xs font-medium">
                                    {Pago ? "Pago" : "Pendente"}
                                </span>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Pago}
                                        onChange={() => togglePagamento(s.id, currentMonth, currentYear, !Pago, s.planos?.valor ?? 0)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-yellow peer-checked:bg-primary rounded-full peer transition-colors"></div>
                                    <div className="absolute w-5 h-5 bg-white rounded-full translate-x-1 peer-checked:translate-x-6 transition-transform"></div>
                                </label>

                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}