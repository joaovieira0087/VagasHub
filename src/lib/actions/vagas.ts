'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { gerarSlug, gerarSlugCategoria } from '@/lib/utils/slug';

interface CriarVagaInput {
  titulo: string;
  descricao: string;
  id_categoria: string;
  nome_empresa: string;
  logo_empresa?: string;
  vendas_empresa?: string;
  link_externo: string;
  admin_password: string;
}

export async function criarVaga(input: CriarVagaInput) {
  // Validar senha admin
  if (input.admin_password !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha de acesso inválida.' };
  }

  const supabase = createAdminClient();

  try {
    // 1. Buscar ou criar empresa
    let empresaId: string;

    const { data: empresaExistente } = await supabase
      .from('empresa')
      .select('id')
      .eq('nome', input.nome_empresa.trim())
      .single();

    if (empresaExistente) {
      empresaId = empresaExistente.id;
      // Atualizar campos opcionais da empresa se fornecidos
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
        return { success: false, error: 'Erro ao criar empresa: ' + errEmpresa?.message };
      }
      empresaId = novaEmpresa.id;
    }

    // 2. Gerar slug único
    const slug = gerarSlug(input.titulo);

    // 3. Criar a vaga
    const { data: vaga, error: errVaga } = await supabase
      .from('vagas')
      .insert({
        titulo: input.titulo.trim(),
        slug,
        descricao: input.descricao.trim(),
        id_categoria: input.id_categoria,
        id_empresa: empresaId,
        link_externo: input.link_externo.trim(),
        status: 'ativa',
        visualizacoes: 0,
      })
      .select('id, slug, titulo')
      .single();

    if (errVaga || !vaga) {
      return { success: false, error: 'Erro ao criar vaga: ' + errVaga?.message };
    }

    return {
      success: true,
      vaga: {
        id: vaga.id,
        slug: vaga.slug,
        titulo: vaga.titulo,
      },
    };
  } catch (err) {
    return { success: false, error: 'Erro inesperado: ' + (err as Error).message };
  }
}

export async function listarCategorias() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome');

  if (error) return [];
  return data || [];
}

export async function criarCategoria(nome: string, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.' };
  }

  const supabase = createAdminClient();
  const slug = gerarSlugCategoria(nome);

  const { data, error } = await supabase
    .from('categorias')
    .insert({ nome: nome.trim(), slug })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, categoria: data };
}

export async function excluirVaga(id: string, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('vagas')
    .update({ status: 'inativa' })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function listarVagasAdmin(adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Senha inválida.', vagas: [] };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('vagas')
    .select('*, categorias(*), empresa(*)')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, vagas: [] };
  return { success: true, vagas: data || [] };
}
