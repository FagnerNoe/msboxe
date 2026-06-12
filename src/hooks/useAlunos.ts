import { useEffect, useState } from "react";
import { supabase } from "../service/supabase";
import type { Aluno } from "../model/Aluno";

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlunos = async (ativo = true) => {
    setLoading(true);
    const { data, error } = await supabase.
    from("alunos")
    .select(`*, planos (*), pagamentos (*)`)
    .eq('ativo',ativo)
    .order('nome', { ascending: true });
    if (error) {
    setError(error);
    }
    else {
  setAlunos(data.map(a => ({
  ...a,
  pagamentos: Array.isArray(a.pagamentos) ? a.pagamentos : []
})));
console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlunos(true);
  }, []);

  return { alunos,setAlunos, loading, error, fetchAlunos };
}