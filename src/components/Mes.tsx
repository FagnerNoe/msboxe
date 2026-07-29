
import { useEffect, useState } from "react";
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
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);


    useEffect(() => {
        const fetchAlunos = async () => {
            const { data, error } = await supabase
                .from("alunos")
                .select("*, pagamentos(*)") // pega alunos + pagamentos
                .order("nome", { ascending: true });

            if (error) {
                console.error(error);
            } else {
                setAlunos(data);
            }
        };

        fetchAlunos();
    }, [selectedMonth, selectedYear]);

    function getDataVencimento(dia: number, mes: number, ano: number) {
        return new Date(ano, mes - 1, dia);
    }

    function verificarAtraso(aluno: Aluno, selectedMonth: number, selectedYear: number) {
        const hoje = new Date();
        const vencimento = getDataVencimento(
            aluno.data_vencimento ? aluno.data_vencimento : 1,
            selectedMonth,
            selectedYear
        );

        // Está pendente se não há pagamento quitado para o mês/ano
        const estaPendente = Array.isArray(aluno.pagamentos) &&
            aluno.pagamentos.every(
                p => !(p.mes === selectedMonth && p.ano === selectedYear && p.pago)
            );

        // Está vencido se já passou do vencimento e ainda está pendente
        return estaPendente && hoje > vencimento;
    }

    function isCurrentMonthPaid(s: Aluno, selectedMonth: number, selectedYear: number): boolean {
        const pagamentos = Array.isArray(s.pagamentos) ? s.pagamentos : [];
        return pagamentos.some(
            p => p.mes === selectedMonth && p.ano === selectedYear && p.pago === true
        );
    }

    const alunosVisiveis = alunos.filter(a => {
        const pagamentos = Array.isArray(a.pagamentos) ? a.pagamentos : [];
        const temPagamentoNoPeriodo = pagamentos.some(
            p => p.mes === selectedMonth && p.ano === selectedYear
        );

        return a.ativo === true || temPagamentoNoPeriodo;
    });


    const filterButtons: { key: FilterKey; label: string; count: number }[] = [
        { key: "pendente", label: "Pendentes", count: alunosVisiveis.filter(s => !isCurrentMonthPaid(s, selectedMonth, selectedYear)).length },
        { key: "pago", label: "Pagos", count: alunosVisiveis.filter(s => isCurrentMonthPaid(s, selectedMonth, selectedYear)).length },
        { key: "all", label: "Todos", count: alunosVisiveis.length },
    ];



    const alunosFiltrados =
        filter === "all"
            ? alunosVisiveis
            : filter === "pago"
                ? alunosVisiveis.filter(s => isCurrentMonthPaid(s, selectedMonth, selectedYear))
                : alunosVisiveis.filter(s => !isCurrentMonthPaid(s, selectedMonth, selectedYear));

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
            <div className="flex gap-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                            {new Date(0, i).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                        </option>
                    ))}
                </select>

                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>


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
                    const Pago = isCurrentMonthPaid(s, selectedMonth, selectedYear);

                    return (
                        <li key={s.id}
                            className={`flex items-center ${verificarAtraso(s, selectedMonth, selectedYear) ? "bg-danger border-2 border-danger shadow-md shadow-red-300 rounded-full" : "border-b"}  p-1 w-full justify-between ${s.ativo ? "" : "bg-gray-300"}`}>

                            <div className="flex items-center gap-2 sm:w-70 ">
                                <span onClick={() => onSelected(s)}
                                    className={`${s.ativo ? "bg-primary" : "bg-gray-500 text-white/40"} px-2 py-1 rounded-full truncate w-35 sm:max-w-max md:w-100   text-white text-sm`}>{s.nome}</span>
                            </div>

                            {!Pago && (
                                <div className="flex items-center gap-0.5">
                                    <p className="text-[0.5rem] sm:text-sm text-gray-400">Dia</p>
                                    <span className="text-xs sm:text-lg bg-gray-200 rounded-full px-2 font-bold">{s.data_vencimento} </span>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">

                                <span className="ml-3 text-xs font-medium ">
                                    {isCurrentMonthPaid(s, selectedMonth, selectedYear) ? "Pago" : "Pendente"}
                                </span>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Pago}
                                        disabled={!s.ativo}
                                        onChange={() => togglePagamento(s.id, selectedMonth, selectedYear, !Pago, s.planos?.valor ?? 0)}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-11 h-6 bg-yellow ${s.ativo ? "peer-checked:bg-primary" : "peer-checked:bg-gray-500"} rounded-full peer transition-colors`}></div>
                                    <div className={`absolute w-5 h-5 ${s.ativo ? "bg-white" : "bg-gray-300"} rounded-full translate-x-1 peer-checked:translate-x-6 transition-transform`}></div>
                                </label>

                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}