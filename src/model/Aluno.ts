import type { Pagamento } from "./Pagamentos";
import type { Plano } from "./Plano";

export interface Aluno {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  data_nascimento?: string;
  foto_url:string;
  plano_id: string;
  planos?:Plano;
  slug:string;
  pagamentos: Pagamento[];
  ativo: boolean;
  created_at: string;
  updated_at: string;    
  }

  export interface UserSistema {
  id:number;
  nome:string;
 
}


   export  const Meses = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ];