import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gerarSlug } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';

/**
 * Normaliza texto para comparação segura:
 * - Converte para minúsculas
 * - Remove TODOS os acentos (á→a, ê→e, ç→c, etc.)
 * - Mantém espaços e caracteres alfanuméricos
 */
function normalizar(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Verifica se o texto normalizado contém termos de nível Estágio/Júnior.
 * Retorna 'Estágio', 'Júnior', ou null se não encontrar.
 */
function detectarNivel(textoNorm: string): 'Estágio' | 'Júnior' | null {
  // Termos de Estágio (todos sem acento, pois o texto já foi normalizado)
  const termosEstagio = ['estagio', 'estagiario', 'estagiaria', 'internship', 'intern '];
  for (const t of termosEstagio) {
    if (textoNorm.includes(t)) return 'Estágio';
  }

  // Termos de Júnior (todos sem acento)
  const termosJunior = ['junior', ' jr ', ' jr.', '(jr)', 'trainee', 'nivel 1', 'entry level', 'entry-level'];
  for (const t of termosJunior) {
    if (textoNorm.includes(t)) return 'Júnior';
  }

  // Checar se termina com " jr"
  if (textoNorm.endsWith(' jr')) return 'Júnior';

  return null;
}

/**
 * Verifica se o texto normalizado (título + descrição) indica ser da área de tecnologia.
 */
function ehTecnologia(tituloNorm: string, descNorm: string): boolean {
  const termosTitle = [
    'tecnologia', 'desenvolvedor', 'desenvolvedora', 'developer',
    'programador', 'programadora', 'software', 'frontend', 'front-end',
    'backend', 'back-end', 'fullstack', 'full-stack', 'full stack',
    'sistemas', 'dados', 'data', 'devops', 'web', 'mobile',
    'react', 'angular', 'vue', 'node', 'python', 'java',
    'c#', 'csharp', '.net', 'dotnet', 'php', 'ruby',
    'javascript', 'typescript', 'golang', 'rust', 'swift',
    'kotlin', 'flutter', 'android', 'ios', 'cloud',
    'aws', 'azure', 'gcp', 'linux', 'sql', 'banco de dados',
    'machine learning', 'inteligencia artificial', 'cybersecurity',
    'seguranca da informacao', 'redes', 'suporte tecnico',
    'analista de sistemas', 'engenheiro de software', 'scrum',
    'agile', 'api', 'microservicos', 'infra',
  ];

  // Checar termos curtos com word boundary via regex
  const regexTermos = [/\bti\b/, /\bqa\b/, /\bux\b/, /\bui\b/];

  for (const t of termosTitle) {
    if (tituloNorm.includes(t)) return true;
  }
  for (const r of regexTermos) {
    if (r.test(tituloNorm)) return true;
  }

  // Fallback: checar descrição para termos-chave fortes
  const termosDesc = [
    'desenvolvedor', 'desenvolvedora', 'programacao', 'programador',
    'software', 'tecnologia da informacao', 'linguagem de programacao',
  ];
  for (const t of termosDesc) {
    if (descNorm.includes(t)) return true;
  }

  return false;
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

  // Estatísticas
  let totalProcessadas = 0;
  let totalInseridas = 0;
  let totalAtualizadas = 0;
  let totalIgnoradas = 0;
  const erros: string[] = [];

  try {
    // 3. Buscar categorias do banco para mapeamento dinâmico
    const { data: categoriasDB, error: errCats } = await supabase
      .from('categorias')
      .select('id, nome, slug');

    if (errCats || !categoriasDB) {
      throw new Error(`Falha ao obter categorias do banco: ${errCats?.message}`);
    }

    // Achar categoria "Tecnologia" padrão (fallback garantido)
    let catTecnologia = categoriasDB.find(
      (c) => normalizar(c.nome) === 'tecnologia'
    );

    // Se não existir, criar a categoria Tecnologia dinamicamente
    if (!catTecnologia) {
      const { data: novaCat } = await supabase
        .from('categorias')
        .insert({ nome: 'Tecnologia', slug: 'tecnologia' })
        .select('id, nome, slug')
        .single();
      catTecnologia = novaCat || categoriasDB[0];
    }

    // 4. Chamadas à API da Adzuna Brasil
    // Fazemos chamadas separadas com termos que cobrem nível + área
    const searchTerms = [
      'desenvolvedor junior',
      'desenvolvedor estagio',
      'developer junior',
      'programador junior',
      'estagio tecnologia',
      'estagio desenvolvedor',
      'estagio TI',
      'junior TI',
      'trainee tecnologia',
    ];
    const allJobsMap = new Map<string, any>();

    for (const term of searchTerms) {
      const url = `https://api.adzuna.com/v1/api/jobs/br/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(term)}&results_per_page=50&content-type=application/json`;

      console.log('[sync-jobs] URL chamada:', url);

      try {
        const res = await fetch(url, { next: { revalidate: 0 } });
        if (!res.ok) {
          console.error(`[sync-jobs] Adzuna retornou status ${res.status} para "${term}"`);
          continue;
        }

        const data = await res.json();
        const results = data.results || [];
        console.log(`[sync-jobs] Termo "${term}": ${results.length} resultados recebidos`);

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
    console.log(`[sync-jobs] Total de vagas únicas após deduplicação: ${uniqueJobs.length}`);

    // 5. Processar cada vaga
    for (const job of uniqueJobs) {
      totalProcessadas++;

      const tituloOriginal = (job.title || '').trim();
      const descOriginal = (job.description || '').trim();
      const tituloNorm = normalizar(tituloOriginal);
      const descNorm = normalizar(descOriginal);
      const textoCompleto = `${tituloNorm} ${descNorm}`;

      // 5a. Detectar nível (Estágio / Júnior)
      let nivel = detectarNivel(tituloNorm);
      if (!nivel) {
        nivel = detectarNivel(descNorm);
      }

      if (!nivel) {
        totalIgnoradas++;
        console.log(`[SYNC Rejeitada - Nível] Título: "${tituloOriginal}" | Nenhum termo de nível encontrado no título/descrição normalizada.`);
        continue;
      }

      // 5b. Verificar se é de Tecnologia
      if (!ehTecnologia(tituloNorm, descNorm)) {
        totalIgnoradas++;
        console.log(`[SYNC Rejeitada - Tech] Título: "${tituloOriginal}" | Não corresponde a nenhum termo de tecnologia.`);
        continue;
      }

      console.log(`[SYNC Aceita] Título: "${tituloOriginal}" | Nível: ${nivel}`);

      // 6. Obter ou Criar Empresa (nunca travar o loop)
      const companyName = (job.company?.display_name || 'Empresa não informada').trim();
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
              logo_url: null,
            })
            .select('id')
            .single();

          if (errNewComp) {
            console.error(`[sync-jobs] Erro ao criar empresa "${companyName}":`, errNewComp.message);
          } else if (newCompany) {
            companyId = newCompany.id;
          }
        }
      } catch (errCompany) {
        console.error(`[sync-jobs] Erro inesperado com empresa "${companyName}":`, errCompany);
        // Não travar — segue sem empresa
      }

      // 7. Tratar Localização
      let cidade: string | null = null;
      let estado: string | null = null;

      if (job.location?.display_name) {
        const locationText = String(job.location.display_name).trim();
        const parts = locationText.split(',');
        if (parts.length >= 2) {
          cidade = parts[0].trim();
          estado = parts[parts.length - 1].trim();
        } else {
          cidade = locationText;
        }
      }

      // 8. Categorias
      const jobCatsIds: string[] = [];
      if (catTecnologia) {
        jobCatsIds.push(catTecnologia.id);
      }

      // Verificar se outras categorias do banco também se aplicam
      for (const cat of categoriasDB) {
        if (cat.id === catTecnologia?.id) continue;
        const catNorm = normalizar(cat.nome);
        if (catNorm.length >= 3 && (tituloNorm.includes(catNorm) || descNorm.includes(catNorm))) {
          jobCatsIds.push(cat.id);
        }
      }

      // 9. Upsert via api_external_id
      const apiExternalId = String(job.id);
      const slug = gerarSlug(tituloOriginal || 'vaga-de-tecnologia');

      let existingVaga = null;
      try {
        const { data } = await supabase
          .from('vagas')
          .select('id')
          .eq('api_external_id', apiExternalId)
          .maybeSingle();
        existingVaga = data;
      } catch (errQuery) {
        console.error(`[sync-jobs] Erro ao buscar vaga existente (${apiExternalId}):`, errQuery);
      }

      const vagaData = {
        titulo: tituloOriginal || 'Vaga de Tecnologia',
        descricao: descOriginal || 'Descrição não fornecida.',
        id_empresa: companyId,
        link_externo: job.redirect_url || null,
        cidade,
        estado,
        nivel,
        ativo: true,
        status: 'ativa',
        origem: 'api',
        api_external_id: apiExternalId,
      };

      let currentVagaId: string | null = null;

      if (existingVaga) {
        // Atualizar vaga existente
        const { data: updatedVaga, error: errUpdate } = await supabase
          .from('vagas')
          .update(vagaData)
          .eq('id', existingVaga.id)
          .select('id')
          .single();

        if (errUpdate) {
          erros.push(`Update falhou (${apiExternalId}): ${errUpdate.message}`);
          console.error(`[sync-jobs] Erro ao atualizar vaga ${apiExternalId}:`, errUpdate.message);
        } else if (updatedVaga) {
          currentVagaId = updatedVaga.id;
          totalAtualizadas++;
        }
      } else {
        // Inserir nova vaga
        const { data: insertedVaga, error: errInsert } = await supabase
          .from('vagas')
          .insert({
            ...vagaData,
            slug,
            visualizacoes: 0,
          })
          .select('id')
          .single();

        if (errInsert) {
          erros.push(`Insert falhou (${apiExternalId}): ${errInsert.message}`);
          console.error(`[sync-jobs] Erro ao inserir vaga ${apiExternalId}:`, errInsert.message);
        } else if (insertedVaga) {
          currentVagaId = insertedVaga.id;
          totalInseridas++;
        }
      }

      // 10. Associar categorias (junction table)
      if (currentVagaId && jobCatsIds.length > 0) {
        try {
          await supabase
            .from('vagas_categorias')
            .delete()
            .eq('vaga_id', currentVagaId);

          const junctionRows = jobCatsIds.map((catId) => ({
            vaga_id: currentVagaId,
            categoria_id: catId,
          }));
          await supabase.from('vagas_categorias').insert(junctionRows);
        } catch (errJunction) {
          console.error(`[sync-jobs] Erro ao salvar categorias da vaga ${currentVagaId}:`, errJunction);
        }
      }
    }

    console.log(`[sync-jobs] === RESULTADO FINAL === Processadas: ${totalProcessadas} | Inseridas: ${totalInseridas} | Atualizadas: ${totalAtualizadas} | Ignoradas: ${totalIgnoradas}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessadas,
        totalInseridas,
        totalAtualizadas,
        totalIgnoradas,
        erros: erros.slice(0, 10),
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
