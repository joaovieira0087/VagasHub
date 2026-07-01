'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { gerarSlug, gerarSlugCategoria } from '@/lib/utils/slug';

interface CriarVagaInput {
  titulo: string;
  descricao: string;
  requisitos?: string;
  beneficios?: string;
  categorias_ids: string[];
  nome_empresa: string;
  logo_empresa?: string;
  vendas_empresa?: string;
  link_externo: string;
  cidade?: string;
  estado?: string;
  admin_password: string;
}

export async function criarVaga(input: CriarVagaInput) {
  if (input.admin_password !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha de acesso inválida.' };
  }

  if (input.categorias_ids.length === 0) {
    return { success: false, error: 'Selecione ao menos uma categoria.' };
  }

  if (input.categorias_ids.length > 10) {
    return { success: false, error: 'Máximo de 10 categorias por vaga.' };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('[criarVaga] Falha ao criar cliente Supabase:', (err as Error).message);
    return { success: false, error: 'Erro de configuração do banco. Verifique .env.local' };
  }

  try {
    // 1. Buscar ou criar empresa
    let empresaId: string;

    const { data: empresaExistente, error: errBusca } = await supabase
      .from('empresa')
      .select('id')
      .eq('nome', input.nome_empresa.trim())
      .single();

    if (errBusca && errBusca.code !== 'PGRST116') {
      console.error('[criarVaga] Erro ao buscar empresa:', errBusca);
      return { success: false, error: 'Erro ao buscar empresa: ' + errBusca.message };
    }

    if (empresaExistente) {
      empresaId = empresaExistente.id;
      if (input.vendas_empresa || input.logo_empresa) {
        await supabase
          .from('empresa')
          .update({
            ...(input.vendas_empresa && { vendas: input.vendas_empresa.trim() }),
            ...(input.logo_empresa && { logo_url: input.logo_empresa.trim() }),
          })
          .eq('id', empresaId);
      }
    } else {
      const { data: novaEmpresa, error: errEmpresa } = await supabase
        .from('empresa')
        .insert({
          nome: input.nome_empresa.trim(),
          vendas: input.vendas_empresa?.trim() || null,
          logo_url: input.logo_empresa?.trim() || null,
        })
        .select('id')
        .single();

      if (errEmpresa || !novaEmpresa) {
        console.error('[criarVaga] Erro ao criar empresa:', errEmpresa);
        return { success: false, error: 'Erro ao criar empresa: ' + errEmpresa?.message };
      }
      empresaId = novaEmpresa.id;
    }

    // 2. Gerar slug único
    const slug = gerarSlug(input.titulo);

    // 3. Criar a vaga (id_categoria = primeiro da lista para backward compat)
    const { data: vaga, error: errVaga } = await supabase
      .from('vagas')
      .insert({
        titulo: input.titulo.trim(),
        slug,
        descricao: input.descricao.trim(),
        requisitos: input.requisitos?.trim() || null,
        beneficios: input.beneficios?.trim() || null,
        id_categoria: input.categorias_ids[0] || null,
        id_empresa: empresaId,
        link_externo: input.link_externo.trim(),
        cidade: input.cidade?.trim() || null,
        estado: input.estado?.trim() || null,
        status: 'ativa',
        visualizacoes: 0,
        ativo: true,
        origem: 'manual',
      })
      .select('id, slug, titulo')
      .single();

    if (errVaga || !vaga) {
      console.error('[criarVaga] Erro ao inserir vaga:', errVaga);
      return { success: false, error: 'Erro ao criar vaga: ' + errVaga?.message };
    }

    // 4. Inserir relações N:N na tabela de junção
    const junctionRows = input.categorias_ids.map((catId) => ({
      vaga_id: vaga.id,
      categoria_id: catId,
    }));

    const { error: errJunction } = await supabase
      .from('vagas_categorias')
      .insert(junctionRows);

    if (errJunction) {
      console.error('[criarVaga] Erro ao associar categorias:', errJunction);
      // Vaga foi criada mas categorias falharam — não é fatal
    }

    return {
      success: true,
      vaga: { id: vaga.id, slug: vaga.slug, titulo: vaga.titulo },
    };
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.error('[criarVaga] Erro inesperado:', errorMsg);
    if (errorMsg.includes('fetch failed') || errorMsg.includes('ENOTFOUND')) {
      return { success: false, error: 'Falha de conexão com Supabase. Verifique .env.local.' };
    }
    return { success: false, error: 'Erro inesperado: ' + errorMsg };
  }
}

export async function listarCategorias() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');

    if (error) {
      console.error('[listarCategorias] Erro:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[listarCategorias] Falha de conexão:', (err as Error).message);
    return [];
  }
}

export async function criarCategoria(nome: string, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.' };
  }

  try {
    const supabase = createAdminClient();
    const slug = gerarSlugCategoria(nome);

    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome: nome.trim(), slug })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, categoria: data };
  } catch (err) {
    console.error('[criarCategoria] Falha:', (err as Error).message);
    return { success: false, error: 'Falha de conexão com o banco de dados.' };
  }
}

export async function excluirVaga(id: string, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.' };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('vagas')
      .update({ status: 'inativa', ativo: false })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('[excluirVaga] Falha:', (err as Error).message);
    return { success: false, error: 'Falha de conexão com o banco de dados.' };
  }
}

export async function listarVagasAdmin(adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.', vagas: [] };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('vagas')
      .select('*, vagas_categorias(categorias(*)), empresa(*)')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message, vagas: [] };
    return { success: true, vagas: data || [] };
  } catch (err) {
    console.error('[listarVagasAdmin] Falha:', (err as Error).message);
    return { success: false, error: 'Falha de conexão com o banco de dados.', vagas: [] };
  }
}

export async function buscarLocaisExistentes() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('[buscarLocaisExistentes] Falha ao criar cliente Supabase:', (err as Error).message);
    return { cidades: [], estados: [] };
  }

  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('cidade, estado')
      .eq('ativo', true);

    if (error || !data) {
      console.error('[buscarLocaisExistentes] Erro:', error);
      return { cidades: [], estados: [] };
    }

    const cidades = Array.from(new Set(data.map(v => v.cidade).filter(Boolean))) as string[];
    const estados = Array.from(new Set(data.map(v => v.estado).filter(Boolean))) as string[];

    cidades.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    estados.sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return { cidades, estados };
  } catch (err) {
    console.error('[buscarLocaisExistentes] Erro inesperado:', (err as Error).message);
    return { cidades: [], estados: [] };
  }
}

export async function toggleAtivoVaga(id: string, ativo: boolean, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.' };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('vagas')
      .update({ 
        ativo,
        status: ativo ? 'ativa' : 'inativa' // Sincroniza status legado
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('[toggleAtivoVaga] Falha:', (err as Error).message);
    return { success: false, error: 'Falha de conexão com o banco de dados.' };
  }
}
