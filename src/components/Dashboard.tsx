'use client';

import { Users, DollarSign, CheckCircle, Clock, TrendingUp, Award, ChevronDown } from 'lucide-react';

import { Meses } from '../model/Aluno';

import { useAlunos } from '../hooks/useAlunos';



export default function Dashboard({ mesAtual, anoAtual }: { mesAtual: number; anoAtual: number }) {

    const { alunos, loading } = useAlunos()







    // Alunos que já pagaram no mês/ano atual
    const paidStudents = alunos.filter(s =>
        s.pagamentos?.some((p: { mes: number; ano: number; pago: boolean }) =>
            p.mes === mesAtual && p.ano === anoAtual && p.pago == true
        )
    );

    // Alunos pendentes (não têm pagamento registrado no mês/ano atual)
    const pendingStudents = alunos.filter(s =>
        !s.pagamentos?.some((p: { mes: number; ano: number; pago: boolean }) =>
            p.mes === mesAtual && p.ano === anoAtual && p.pago == true
        )
    );




    const totalRevenue = alunos.reduce((acc, s) => acc + (s.planos?.valor ?? 0), 0);
    const receivedRevenue = paidStudents.reduce((acc, s) => acc + (s.planos?.valor ?? 0), 0);
    const pendingRevenue = totalRevenue - receivedRevenue;

    const planCounts = {
        "Básico": alunos.filter(s => s.planos?.nome === "Básico").length,
        "Master": alunos.filter(s => s.planos?.nome === "Master").length,
    };

    const cards = [
        {
            label: 'Total de Alunos',
            value: alunos.length,
            icon: Users,
            bg: 'from-sky-800 to-sky-600',
            suffix: 'alunos',
        },
        {
            label: 'Receita Total Esperada',
            value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
            icon: TrendingUp,
            bg: 'from-amber-700 to-yellow',
            suffix: '/mês',
        },
        {
            label: 'Pagamentos Recebidos',
            value: `R$ ${receivedRevenue.toLocaleString('pt-BR')}`,
            icon: CheckCircle,
            bg: 'from-green-800 to-green-600',
            suffix: `${paidStudents.length} alunos`,
        },
        {
            label: 'A Receber',
            value: `R$ ${pendingRevenue.toLocaleString('pt-BR')}`,
            icon: Clock,
            bg: 'from-red-800 to-danger',
            suffix: `${pendingStudents.length} alunos`,
        },
    ];

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="h-8 w-1 bg-linear-to-b from-secondary to-primary rounded-full" />
                <h2 className="text-xl font-bold text-primary ">
                    Relatório
                </h2>
                <span className="flex border ml-5 shadow-md gap-4 text-yellow/80  px-4 py-1 text-lg rounded-full">
                    {Meses[mesAtual - 1]} {anoAtual}
                    <ChevronDown />
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`bg-linear-to-br ${card.bg} rounded-2xl p-5 text-white shadow-lg`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white/80 text-sm font-medium leading-tight">{card.label}</p>
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center ">
                                    <Icon size={18} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-white/70 text-xs mt-1">{card.suffix}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-[#EDD5B3] p-5">
                    <h3 className="font-bold text-[#3D1A0A] mb-4 flex items-center gap-2">
                        <Award size={18} className="text-[#8B4513]" />
                        Distribuição por Plano
                    </h3>
                    <div className="space-y-3">
                        {(['Básico', 'Master'] as const).map(plan => {
                            const count = planCounts[plan];
                            const pct = alunos.length > 0 ? (count / alunos.length) * 100 : 0;
                            const colors: Record<'Básico' | 'Master', { bar: string; badge: string }> = {
                                'Básico': { bar: 'bg-secondary', badge: 'bg-[#001F5B]/10 text-secondary' },
                                'Master': { bar: 'bg-yellow', badge: 'bg-yellow/10 text-yellow' }
                            };
                            return (
                                <div key={plan}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-[#3D1A0A]">{[plan]}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[plan].badge}`}>
                                                {count} aluno{count !== 1 ? 's' : ''}
                                            </span>

                                        </div>
                                    </div>
                                    <div className="h-2 bg-yellow/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[plan].bar} rounded-full transition-all duration-500`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#EDD5B3] p-5">
                    <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <DollarSign size={18} className="text-[#8B4513]" />
                        Resumo Financeiro
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-yellow">
                            <span className="text-sm text-yellow">Receita total esperada</span>
                            <span className="font-bold text-yellow">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-yellow">
                            <span className="text-sm text-primary flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                                Recebido
                            </span>
                            <span className="font-bold text-green-600">R$ {receivedRevenue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-yellow">
                            <span className="text-sm text-red-800 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
                                A receber
                            </span>
                            <span className="font-bold text-[#8B1A1A]">R$ {pendingRevenue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-primary">Taxa de recebimento</span>
                            <span className="font-bold text-primary">
                                {totalRevenue > 0 ? Math.round((receivedRevenue / totalRevenue) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
