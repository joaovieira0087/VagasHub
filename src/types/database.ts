// ============================================
// Tipos do Banco de Dados - Portal de Vagas
// ============================================

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export interface Empresa {
  id: string;
  nome: string;
  vendas: string | null; // categoria extra/dinâmica (texto livre)
  logo_url: string | null;
}

export interface Vaga {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  id_categoria: string | null;
  id_empresa: string | null;
  link_externo: string | null;
  status: string;
  visualizacoes: number;
  created_at: string;
}

// Vaga com dados expandidos (joins)
export interface VagaCompleta extends Vaga {
  categorias: Categoria | null;
  empresa: Empresa | null;
}

// Categoria com contagem de vagas (para ranking)
export interface CategoriaComContagem extends Categoria {
  vaga_count: number;
}

// Categoria unificada (normal + vendas de empresa)
export interface CategoriaUnificada {
  nome: string;
  slug: string;
  count: number;
  origem: 'categoria' | 'vendas';
}
