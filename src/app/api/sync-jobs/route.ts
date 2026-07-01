import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gerarSlug } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';

// Função auxiliar para remover acentos e normalizar strings para busca em texto
function normalizarTexto(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export async function GET(request: NextRequest) {
  // 1. Validar autenticação
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.nextUrl.searchParams.get('secret');

  const secretKey = process.env.SYNC_API_SECRET;
  if (!secretKey || token !== secretKey) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Inicializar Supabase Admin
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('[sync-jobs] Erro ao instanciar Supabase Admin:', err);
    return new Response(JSON.stringify({ error: 'Erro de configuração do Supabase no servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return new Response(
      JSON.stringify({ error: 'Credenciais da Adzuna (ADZUNA_APP_ID/KEY) não configuradas.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Estatísticas de importação
  let totalProcessadas = 0;
  let totalInseridas = 0;
  let totalAtualizadas = 0;
  let totalIgnoradas = 0;
  let erros: string[] = [];

  try {
    // 3. Buscar categorias do banco para mapeamento dinâmico
    const { data: categoriasDB, error: errCats } = await supabase
      .from('categorias')
      .select('id, nome, slug');

    if (errCats || !categoriasDB) {
      throw new Error(`Falha ao obter categorias do banco: ${errCats?.message}`);
    }

    // Achar categoria "Tecnologia" padrão (ou fallback)
    const catTecnologia = categoriasDB.find(
      (c) => normalizarTexto(c.nome) === 'tecnologia'
    ) || categoriasDB[0];

    // 4. Efetuar chamadas para a API do Adzuna Brasil
    // Buscaremos vagas com keywords "junior tecnologia" e "estagio tecnologia" separadamente para maior cobertura
    const searchTerms = ['junior tecnologia', 'estagio tecnologia'];
    const allJobsMap = new Map<string, any>();

    for (const term of searchTerms) {
      const url = `https://api.adzuna.com/v1/api/jobs/br/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(
        term
      )}&results_per_page=50&content-type=application/json`;

      try {
        const res = await fetch(url, { next: { revalidate: 0 } });
        if (!res.ok) {
          console.error(`[sync-jobs] Adzuna API retornou status ${res.status} para o termo "${term}"`);
          continue;
        }

        const data = await res.json();
        const results = data.results || [];
        for (const job of results) {
          if (job.id) {
            allJobsMap.set(String(job.id), job);
          }
        }
      } catch (err) {
        console.error(`[sync-jobs] Falha ao consultar Adzuna para "${term}":`, err);
      }
    }

    const uniqueJobs = Array.from(allJobsMap.values());
    console.log(`[sync-jobs] Total de vagas únicas retornadas pela API: ${uniqueJobs.length}`);

    // 5. Mapear e Salvar no Supabase
    for (const job of uniqueJobs) {
      totalProcessadas++;
      const titleNorm = normalizarTexto(job.title || '');
      const descNorm = normalizarTexto(job.description || '');

      // Determinar Nível (Estágio ou Júnior)
      let nivel: 'Estágio' | 'Júnior' | null = null;
      if (
        titleNorm.includes('estagio') ||
        titleNorm.includes('estágio') ||
        titleNorm.includes('estagiario') ||
        titleNorm.includes('estagiário') ||
        titleNorm.includes('internship') ||
        titleNorm.includes('intern')
      ) {
        nivel = 'Estágio';
      } else if (
        titleNorm.includes('junior') ||
        titleNorm.includes('júnior') ||
        /\bjr\b/i.test(job.title || '') ||
        titleNorm.includes('trainee')
      ) {
        nivel = 'Júnior';
      }

      // Se não conseguirmos classificar o nível estritamente, verificamos a descrição
      if (!nivel) {
        if (descNorm.includes('estagio') || descNorm.includes('estágio') || descNorm.includes('estagiario')) {
          nivel = 'Estágio';
        } else if (descNorm.includes('junior') || descNorm.includes('júnior') || /\bjr\b/i.test(job.description || '')) {
          nivel = 'Júnior';
        }
      }

      // Se mesmo assim não for de nível Estágio ou Júnior, ignoramos
      if (!nivel) {
        totalIgnoradas++;
        continue;
      }

      // Verificar se é de tecnologia (garantir relevância)
      const matchesTech = 
        titleNorm.includes('tecnologia') ||
        titleNorm.includes('desenvolvedor') ||
        titleNorm.includes('developer') ||
        titleNorm.includes('programador') ||
        titleNorm.includes('software') ||
        titleNorm.includes('frontend') ||
        titleNorm.includes('front-end') ||
        titleNorm.includes('backend') ||
        titleNorm.includes('back-end') ||
        titleNorm.includes('fullstack') ||
        titleNorm.includes('full-stack') ||
        titleNorm.includes('sistemas') ||
        titleNorm.includes('dados') ||
        titleNorm.includes('qa') ||
        titleNorm.includes('devops') ||
        titleNorm.includes('ti') ||
        titleNorm.includes('web') ||
        titleNorm.includes('mobile') ||
        titleNorm.includes('react') ||
        titleNorm.includes('node') ||
        titleNorm.includes('python') ||
        titleNorm.includes('java') ||
        titleNorm.includes('c#') ||
        titleNorm.includes('.net') ||
        titleNorm.includes('php') ||
        titleNorm.includes('javascript') ||
        titleNorm.includes('typescript') ||
        descNorm.includes('desenvolvedor') ||
        descNorm.includes('programação') ||
        descNorm.includes('programacao');

      if (!matchesTech) {
        totalIgnoradas++;
        continue;
      }

      // 6. Obter ou Criar Empresa
      const companyName = (job.company?.display_name || 'Empresa').trim();
      let companyId: string | null = null;

      try {
        const { data: existingCompany } = await supabase
          .from('empresa')
          .select('id')
          .eq('nome', companyName)
          .maybeSingle();

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const { data: newCompany, error: errNewComp } = await supabase
            .from('empresa')
            .insert({
              nome: companyName,
              logo_url: job.company?.logo_url || null,
            })
            .select('id')
            .single();

          if (errNewComp) {
            console.error(`[sync-jobs] Erro ao criar empresa "${companyName}":`, errNewComp);
          } else if (newCompany) {
            companyId = newCompany.id;
          }
        }
      } catch (errCompany) {
        console.error(`[sync-jobs] Erro inesperado com empresa:`, errCompany);
      }

      // 7. Tratar Localização (Cidade / Estado)
      let cidade: string | null = null;
      let estado: string | null = null;

      if (job.location?.display_name) {
        const locationText = String(job.location.display_name).trim();
        const parts = locationText.split(',');
        if (parts.length === 2) {
          cidade = parts[0].trim();
          estado = parts[1].trim();
        } else {
          // Se for "Home Office" ou similar, coloca na cidade
          cidade = locationText;
        }
      }

      // 8. Determinar Categorias Dinâmicas
      const jobCatsIds: string[] = [];
      if (catTecnologia) {
        jobCatsIds.push(catTecnologia.id);
      }

      // Procurar por outras categorias no banco que coincidam com o texto
      for (const cat of categoriasDB) {
        if (cat.id === catTecnologia?.id) continue;
        const catNorm = normalizarTexto(cat.nome);
        if (titleNorm.includes(catNorm) || descNorm.includes(catNorm)) {
          jobCatsIds.push(cat.id);
        }
      }

      // 9. Verificar se já existe a vaga com base no api_external_id para saber se vai inserir ou atualizar
      const apiExternalId = String(job.id);
      const slug = gerarSlug(job.title || 'vaga-de-tecnologia');

      let existingVaga = null;
      try {
        const { data } = await supabase
          .from('vagas')
          .select('id')
          .eq('api_external_id', apiExternalId)
          .maybeSingle();
        existingVaga = data;
      } catch (errQuery) {
        console.error(`[sync-jobs] Erro ao buscar vaga existente:`, errQuery);
      }

      const vagaData = {
        titulo: (job.title || 'Vaga de Tecnologia').trim(),
        descricao: job.description || 'Descrição não fornecida.',
        id_empresa: companyId,
        link_externo: job.redirect_url || null,
        cidade: cidade,
        estado: estado,
        nivel: nivel,
        ativo: true,
        status: 'ativa', // manter compatibilidade
        origem: 'api',
        api_external_id: apiExternalId,
      };

      let currentVagaId = null;

      if (existingVaga) {
        // Atualizar
        const { data: updatedVaga, error: errUpdate } = await supabase
          .from('vagas')
          .update(vagaData)
          .eq('id', existingVaga.id)
          .select('id')
          .single();

        if (errUpdate) {
          erros.push(`Erro ao atualizar vaga ${apiExternalId}: ${errUpdate.message}`);
        } else if (updatedVaga) {
          currentVagaId = updatedVaga.id;
          totalAtualizadas++;
        }
      } else {
        // Inserir
        const { data: insertedVaga, error: errInsert } = await supabase
          .from('vagas')
          .insert({
            ...vagaData,
            slug: slug, // Gerar novo slug apenas na criação
          })
          .select('id')
          .single();

        if (errInsert) {
          erros.push(`Erro ao inserir vaga ${apiExternalId}: ${errInsert.message}`);
        } else if (insertedVaga) {
          currentVagaId = insertedVaga.id;
          totalInseridas++;
        }
      }

      // 10. Atualizar Categorias Relacionadas (se inseriu ou atualizou)
      if (currentVagaId) {
        try {
          // Deleta relações antigas para evitar duplicidade
          await supabase
            .from('vagas_categorias')
            .delete()
            .eq('vaga_id', currentVagaId);

          // Insere novas
          if (jobCatsIds.length > 0) {
            const junctionRows = jobCatsIds.map((catId) => ({
              vaga_id: currentVagaId,
              categoria_id: catId,
            }));
            await supabase.from('vagas_categorias').insert(junctionRows);
          }
        } catch (errJunction) {
          console.error(`[sync-jobs] Erro ao salvar categorias da vaga ${currentVagaId}:`, errJunction);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessadas,
        totalInseridas,
        totalAtualizadas,
        totalIgnoradas,
        erros: erros.slice(0, 10), // Limita log de erros no retorno
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[sync-jobs] Erro crítico na ingestão:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro crítico durante a sincronização.',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
