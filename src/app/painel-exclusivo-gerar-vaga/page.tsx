'use client';

import { useState, useEffect } from 'react';
import { criarVaga, listarCategorias, listarVagasAdmin, excluirVaga, criarCategoria } from '@/lib/actions/vagas';
import { gerarTextoWhatsApp, gerarUrlVaga, copiarParaClipboard } from '@/lib/utils/whatsapp';
import type { Categoria } from '@/types/database';

export default function AdminPage() {
  // State - Form
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [categoriasIds, setCategoriasIds] = useState<string[]>([]);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [logoEmpresa, setLogoEmpresa] = useState('');
  const [vendasEmpresa, setVendasEmpresa] = useState('');
  const [linkExterno, setLinkExterno] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // State - UI
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [vagaCriada, setVagaCriada] = useState<{ slug: string; titulo: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // State - Admin List
  const [tab, setTab] = useState<'criar' | 'listar'>('criar');
  const [vagasAdmin, setVagasAdmin] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // State - Nova Categoria
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    const cats = await listarCategorias();
    setCategorias(cats);
  }

  function toggleCategoria(id: string) {
    setCategoriasIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 10) return prev; // Max 10
      return [...prev, id];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !linkExterno.trim() || !adminPassword.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    if (categoriasIds.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Selecione ao menos uma categoria.' });
      return;
    }

    setLoading(true);
    setMensagem(null);
    setVagaCriada(null);

    const resultado = await criarVaga({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      requisitos: requisitos.trim() || undefined,
      beneficios: beneficios.trim() || undefined,
      categorias_ids: categoriasIds,
      nome_empresa: nomeEmpresa.trim() || 'Empresa',
      logo_empresa: logoEmpresa.trim() || undefined,
      vendas_empresa: vendasEmpresa.trim() || undefined,
      link_externo: linkExterno.trim(),
      cidade: cidade.trim() || undefined,
      estado: estado.trim() || undefined,
      admin_password: adminPassword,
    });

    setLoading(false);

    if (resultado.success && resultado.vaga) {
      setMensagem({ tipo: 'sucesso', texto: '✅ Vaga criada com sucesso!' });
      setVagaCriada(resultado.vaga);

      // Limpar formulário (exceto senha)
      setTitulo('');
      setDescricao('');
      setRequisitos('');
      setBeneficios('');
      setCategoriasIds([]);
      setNomeEmpresa('');
      setLogoEmpresa('');
      setVendasEmpresa('');
      setLinkExterno('');
      setCidade('');
      setEstado('');
    } else {
      setMensagem({ tipo: 'erro', texto: resultado.error || 'Erro desconhecido.' });
    }
  }

  async function handleCopiarWhatsApp() {
    if (!vagaCriada) return;
    const url = gerarUrlVaga(vagaCriada.slug);
    const texto = gerarTextoWhatsApp(vagaCriada.titulo, url);
    const ok = await copiarParaClipboard(texto);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  }

  async function handleCopiarLink(slug: string, tituloVaga: string) {
    const url = gerarUrlVaga(slug);
    const texto = gerarTextoWhatsApp(tituloVaga, url);
    await copiarParaClipboard(texto);
  }

  async function handleListarVagas() {
    setTab('listar');
    setLoadingList(true);
    const result = await listarVagasAdmin(adminPassword);
    if (result.success) {
      setVagasAdmin(result.vagas);
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao listar.' });
    }
    setLoadingList(false);
  }

  async function handleExcluir(id: string) {
    if (!confirm('Deseja desativar esta vaga?')) return;
    const result = await excluirVaga(id, adminPassword);
    if (result.success) {
      setVagasAdmin((prev) => prev.filter((v) => v.id !== id));
    }
  }

  async function handleCriarCategoria() {
    if (!novaCategoriaInput.trim() || !adminPassword.trim()) return;
    setCriandoCategoria(true);
    const result = await criarCategoria(novaCategoriaInput.trim(), adminPassword);
    if (result.success) {
      await carregarCategorias();
      setNovaCategoriaInput('');
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao criar categoria.' });
    }
    setCriandoCategoria(false);
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Painel de Gestão</h1>
            <p className="text-text-muted text-xs">Gerencie suas vagas e categorias</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('criar')}
          className={`badge cursor-pointer transition-all ${tab === 'criar' ? 'badge-active' : 'badge-primary'}`}
        >
          ➕ Criar Vaga
        </button>
        <button
          onClick={handleListarVagas}
          className={`badge cursor-pointer transition-all ${tab === 'listar' ? 'badge-active' : 'badge-primary'}`}
        >
          📋 Listar Vagas
        </button>
      </div>

      {/* ================== TAB CRIAR ================== */}
      {tab === 'criar' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Senha de acesso */}
          <div className="glass-card p-4 border-warning/30 hover:transform-none">
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              🔐 Senha de Acesso *
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="Digite a senha admin"
              required
              id="input-admin-password"
            />
          </div>

          {/* Título */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Título da Vaga *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="Ex: Analista de Dados — São Paulo"
              required
              id="input-titulo"
            />
          </div>

          {/* Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                Cidade (opcional)
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Ex: São Paulo"
                id="input-cidade"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                Estado (opcional)
              </label>
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Ex: SP"
                id="input-estado"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Descrição (Markdown)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={8}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-y font-mono text-[13px] leading-relaxed"
              placeholder={"Detalhes da vaga..."}
              id="input-descricao"
            />
          </div>

          {/* Requisitos (opcional) */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              📋 Requisitos (opcional)
            </label>
            <textarea
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              rows={4}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-y font-mono text-[13px] leading-relaxed"
              placeholder={"Experiência com React\nConhecimento em TypeScript\nInglês intermediário"}
              id="input-requisitos"
            />
            <p className="text-text-muted text-xs mt-1">
              Insira cada item pulando uma linha com o Enter para que o sistema gere os tópicos automáticos.
            </p>
          </div>

          {/* Benefícios (opcional) */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              🎁 Benefícios (opcional)
            </label>
            <textarea
              value={beneficios}
              onChange={(e) => setBeneficios(e.target.value)}
              rows={4}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-y font-mono text-[13px] leading-relaxed"
              placeholder={"Vale Refeição\nPlano de Saúde\nHome Office flexível"}
              id="input-beneficios"
            />
            <p className="text-text-muted text-xs mt-1">
              Insira cada item pulando uma linha com o Enter para que o sistema gere os tópicos automáticos.
            </p>
          </div>

          {/* Categorias — Multi-Select Tags */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Categorias * (clique para selecionar)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoria(cat.id)}
                  className={`badge cursor-pointer transition-all duration-200 ${
                    categoriasIds.includes(cat.id)
                      ? 'badge-active'
                      : 'badge-primary hover:bg-primary/20'
                  }`}
                  id={`tag-cat-${cat.slug}`}
                >
                  {categoriasIds.includes(cat.id) && '✓ '}
                  {cat.nome}
                </button>
              ))}
              {categorias.length === 0 && (
                <p className="text-text-muted text-xs italic">Nenhuma categoria carregada. Verifique a conexão.</p>
              )}
            </div>
            <p className="text-text-muted text-xs">
              {categoriasIds.length}/10 categorias selecionadas
              {categoriasIds.length >= 10 && <span className="text-warning ml-1">(máximo atingido)</span>}
            </p>

            {/* Criar nova categoria inline */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={novaCategoriaInput}
                onChange={(e) => setNovaCategoriaInput(e.target.value)}
                className="flex-1 bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-primary transition-all"
                placeholder="Nova categoria..."
                id="input-nova-categoria"
              />
              <button
                type="button"
                onClick={handleCriarCategoria}
                disabled={criandoCategoria}
                className="badge badge-accent cursor-pointer hover:opacity-80 transition-opacity text-xs"
              >
                {criandoCategoria ? '...' : '+ Add'}
              </button>
            </div>
          </div>

          {/* Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Ex: Tech Solutions Ltda"
                required
                id="input-empresa"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                Logo URL (opcional)
              </label>
              <input
                type="url"
                value={logoEmpresa}
                onChange={(e) => setLogoEmpresa(e.target.value)}
                className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="https://..."
                id="input-logo"
              />
            </div>
          </div>

          {/* Vendas (campo extra da empresa) */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Tag Extra da Empresa (campo Vendas)
            </label>
            <input
              type="text"
              value={vendasEmpresa}
              onChange={(e) => setVendasEmpresa(e.target.value)}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="Ex: Freelance, PCD, Primeiro Emprego..."
              id="input-vendas"
            />
            <p className="text-text-muted text-xs mt-1">
              Campo de texto livre da empresa. Reservado para uso futuro.
            </p>
          </div>

          {/* Link externo */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Link da Vaga (externo) *
            </label>
            <input
              type="url"
              value={linkExterno}
              onChange={(e) => setLinkExterno(e.target.value)}
              className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="https://careers.empresa.com/vaga-xyz"
              required
              id="input-link"
            />
          </div>

          {/* Mensagem */}
          {mensagem && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium animate-scale-in ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          {/* Link gerado */}
          {vagaCriada && (
            <div className="glass-card p-4 animate-scale-in hover:transform-none">
              <p className="text-text-secondary text-xs uppercase tracking-wider mb-2 font-semibold">
                🔗 Link para compartilhar no WhatsApp
              </p>
              <div className="bg-surface-elevated rounded-lg px-3 py-2.5 mb-3 border border-border-subtle">
                <p className="text-text-primary text-sm font-mono break-all">
                  {gerarUrlVaga(vagaCriada.slug)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopiarWhatsApp}
                className="btn-primary w-full text-sm"
                id="btn-copiar-whatsapp"
              >
                {copiado ? (
                  <>✅ Copiado!</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Copiar para WhatsApp
                  </>
                )}
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-criar-vaga"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Criando...
              </span>
            ) : (
              '🚀 Criar Vaga'
            )}
          </button>
        </form>
      )}

      {/* ================== TAB LISTAR ================== */}
      {tab === 'listar' && (
        <div>
          {!adminPassword.trim() && (
            <div className="glass-card p-4 mb-4 hover:transform-none">
              <p className="text-warning text-sm">⚠️ Digite a senha de acesso na aba &quot;Criar Vaga&quot; primeiro.</p>
            </div>
          )}

          {loadingList ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : vagasAdmin.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">Nenhuma vaga encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vagasAdmin.map((vaga) => {
                const cats = vaga.vagas_categorias?.map((vc: any) => vc.categorias?.nome).filter(Boolean) || [];
                return (
                  <div key={vaga.id} className="glass-card p-4 hover:transform-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-semibold text-sm truncate">{vaga.titulo}</h3>
                        <p className="text-text-muted text-xs mt-0.5">
                          {vaga.empresa?.nome} • {vaga.visualizacoes} views •{' '}
                          <span className={vaga.status === 'ativa' ? 'text-success' : 'text-danger'}>
                            {vaga.status}
                          </span>
                        </p>
                        {cats.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {cats.map((nome: string) => (
                              <span key={nome} className="text-[0.6rem] bg-primary/10 text-primary-light px-1.5 py-0.5 rounded-full">
                                {nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCopiarLink(vaga.slug, vaga.titulo)}
                          className="badge badge-accent cursor-pointer text-[0.65rem] hover:opacity-80"
                          title="Copiar link WhatsApp"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleExcluir(vaga.id)}
                          className="badge text-[0.65rem] cursor-pointer hover:opacity-80 bg-danger/10 text-danger border border-danger/20"
                          title="Desativar vaga"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
