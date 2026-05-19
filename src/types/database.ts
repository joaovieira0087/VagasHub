// ============================================
// Tipos do Banco de Dados - Portal de Vagas
// Relação N:N via tabela de junção vagas_categorias
// ============================================

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export interface Empresa {
  id: string;
  nome: string;
  vendas: string | null; // campo reservado para uso futuro
  logo_url: string | null;
}

export interface Vaga {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  cidade: string | null;
  estado: string | null;
  id_categoria: string | null; // Legacy — mantido para compatibilidade
  id_empresa: string | null;
  link_externo: string | null;
  requisitos: string | null;
  beneficios: string | null;
  status: string;
  visualizacoes: number;
  created_at: string;
}

// Vaga com dados expandidos (joins via tabela de junção)
export interface VagaCompleta extends Vaga {
  vagas_categorias: { categorias: Categoria }[];
  empresa: Empresa | null;
}

// Categoria com contagem de vagas (para ranking na Home)
export interface CategoriaComContagem extends Categoria {
  vaga_count: number;
}
