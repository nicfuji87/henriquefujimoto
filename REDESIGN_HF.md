# Redesign de identidade visual — Henrique Fujimoto (HF)

Aplicação da marca oficial HF (kit `Atualizacao/HF_Henrique_Fujimoto_Identidade_Visual_v2`)
em todo o site público, preservando funcionalidades, integrações e módulos internos.

Data: 19/10/2026 · Branch: `main` (alterações **não commitadas**)

---

## 1. Resumo do que mudou

| Antes | Depois |
|---|---|
| Fundo quase preto `#09090b` + acento verde-limão `#c6f24e` | Azul-marinho `#0B1426` + dourado `#D4A336` como assinatura |
| Hanken Grotesk + Fraunces (serifada itálica) | **Montserrat** (títulos) + **Inter** (textos e interface) |
| Sem logotipo no site; "HF" em texto | Monograma oficial HF no cabeçalho, barra de artigos, rodapé e favicon |
| Home sem cabeçalho; páginas internas com barras diferentes entre si | Cabeçalho único (`PublicHeader`) + barra de detalhe (`PublicTopBar`) |
| Hero com chamada "Um sonho olímpico…" | Hero com o slogan oficial **UM TREINO DE CADA VEZ.** |
| Alcance com fallback fixo de "170 mil" e indicadores zerados | Apenas dados verificáveis; sem dado, mensagem de indisponibilidade |
| Sem favicon, sem Open Graph | Favicon HF, Open Graph/Twitter com imagem 1200×630 da marca |

**Princípio aplicado à cor:** azul-marinho domina as superfícies, branco gelo garante leitura e o
dourado aparece só como detalhe — filete sob os títulos, estado ativo, ação principal, 1º lugar,
ícones pequenos e o slogan.

## 2. Design system público (novo)

- `components/ui/hf.ts` — tokens de classe reutilizáveis: tipografia (`hfTitle`, `hfKicker`,
  `hfLead`, `hfBody`), botões (`hfBtnPrimary`, `hfBtnSecondary`, `hfBtnGhost`, `hfLink`),
  superfícies (`hfCard`, `hfCardHover`, `hfMedia`, `hfTag`, `hfTagGold`, `hfIconBox`),
  estados (`hfEmpty`, `hfSkeleton`, `hfError`) e animação padrão (`hfFadeUp`).
- `components/brand/HFLogo.tsx` — `HFSymbol`, `HFLockup` e `HFSignature`. A geometria é **cópia
  literal** dos polígonos do SVG aprovado (`viewBox 0 0 752 618`); a cor base usa `currentColor` e
  o dourado está apenas no polígono da ponta direita da barra central.
- `components/PublicHeader.tsx` — cabeçalho fixo com logo, navegação, CTA e menu mobile.
  `variant="overlay"` na home (transparente sobre o hero, vidro após a rolagem).
- `components/PublicTopBar.tsx` — barra das páginas de detalhe (voltar + monograma + ação).
- `components/PageIntro.tsx` — abertura padrão das páginas internas.
- Tokens Tailwind (em `index.html`): `hf-navy`, `hf-navy-deep`, `hf-surface`, `hf-surface-2`,
  `hf-line`, `hf-gold`, `hf-gold-dim`, `hf-gold-soft`, `hf-ice`, `hf-graphite`.
  Os tokens antigos do site público (`night`, `coal`, `line`, `ink*`) foram repontados para a
  paleta HF — eles não são usados por `/admin`, `/app`, `/gym`, `/escola` nem `/nutri`.

## 3. Arquivos

### Novos
```
components/brand/HFLogo.tsx
components/ui/hf.ts
components/PublicHeader.tsx
components/PublicTopBar.tsx
components/PageIntro.tsx
public/favicon.svg
public/brand/  (símbolos, assinaturas, selo, avatar e hf-og.png)
scripts/generate-og-image.cjs
```

### Alterados (41)
```
index.html                    tokens HF, Montserrat+Inter, favicon, SEO/Open Graph, foco visível
App.tsx                       rolagem até a âncora ao navegar com #hash entre páginas
hooks/useSiteConfig.ts        remove o valor fictício padrão de live_views ("73.4k")

pages/HomePage.tsx            cabeçalho, ordem das seções (conquistas antes dos números), fonte
pages/NumerosPage.tsx         PublicHeader + PageIntro
pages/ApoiarPage.tsx          PublicHeader + PageIntro
pages/ConteudoPage.tsx        PublicHeader no lugar do SectionNav
pages/BlogPage.tsx            PublicHeader, paleta, tipografia
pages/BlogPostPage.tsx        PublicTopBar, paleta, tipografia
pages/ProductPage.tsx         PublicTopBar, fundo #0a0a0f -> azul-marinho, paleta
pages/PartnershipPage.tsx     PublicTopBar, paleta, tipografia

components/home/HomeHero.tsx           hero com o slogan oficial, CTAs do manual, reduced-motion
components/home/SectionHeading.tsx     Montserrat caixa alta + filete dourado
components/home/ProofSection.tsx       indicadores só com dado verificável
components/home/AchievementsSection.tsx cards HF, medalhas em ícone (sem emoji)
components/home/BeyondTatame.tsx · StorySection · FollowJourney · SponsorsStrip ·
HowToSupportSection · ProductsSection · BlogTeaser · ClosingCTA · StickyApoiar ·
IntentionStrip · WhySupportSection                              paleta e tipografia HF
components/Footer.tsx                  assinatura HF + slogan + navegação + redes + créditos
components/ROIDashboard.tsx            estados vazios honestos, paleta HF, título sem duplicação
components/AudienceCharts.tsx · BrazilMap · TopContent · WhySupport · HowToSupport ·
AffiliateProducts · TrustWall · StickyCTA · SectionNav · Hero · LatestPosts ·
CompetitionsSection · blog/AboutHenrique                        paleta e tipografia HF
```

## 4. Veracidade de dados (item 4.5 do briefing)

- Removido o texto fixo "170 mil" que substituía o alcance real quando a métrica não vinha.
- `ProofSection` só monta um indicador quando o valor é maior que zero; sem nenhum dado, exibe
  "Os indicadores de audiência não estão disponíveis no momento…" em vez de zeros.
- `ROIDashboard` (/numeros) passa a mostrar "—" no lugar de "0", esconde o badge de crescimento
  quando não há variação e troca o painel inteiro pela mensagem de indisponibilidade quando não
  existe nenhum indicador.
- `useSiteConfig` não traz mais "73.4k" como valor padrão de `live_views`.
- Conquistas, parceiros, produtos e posts continuam vindo do Supabase; nenhuma seção inventa dado
  e todas somem quando a consulta volta vazia.

## 5. Testes executados

| Verificação | Resultado |
|---|---|
| `npm run build` (produção) | **Passou** — `✓ built in ~20s` |
| `npx tsc --noEmit` | Sem erros nos arquivos novos/reescritos. Erros remanescentes são anteriores a este trabalho (projeto não tem `@types/react`, o que faz o TS recusar a prop `key`): `pages/BlogPage.tsx`, `pages/ConteudoPage.tsx`, `pages/app/AppHome.tsx`, `pages/gym/GymHistory.tsx`, módulos escola/admin e as funções Deno do Supabase |
| `npm run lint` | 1 erro **pré-existente** em `lib/api-escola.ts:729` (`no-useless-escape`); nenhum erro novo. Os dois avisos que eu havia introduzido (imports `ArrowLeft` sem uso) foram corrigidos |
| Navegação real no navegador | `/`, `/numeros`, `/apoiar`, `/conteudo`, `/blog`, `/blog/:slug`, `/produto/:slug` carregados, sem erro de console |
| Responsividade | 360, 390, 768, 1024 e 1440 px — sem rolagem horizontal indevida (`scrollWidth == clientWidth`); menu mobile abre, fecha e trava o fundo |
| Marca | Monograma conferido contra `HF_Referencia_Aprovada.png`: haste do H conectada à barra central, topo do F na cor base, dourado só na ponta direita da barra central |

Não foram executados testes automatizados porque o projeto não possui suíte de testes.

## 6. Pendências e limitações

1. **Título da aba vem do banco.** `hooks/useTracking.ts` sobrescreve `document.title` com
   `site_config.site_title`, hoje "Henrique Fujimoto — Judô & Alta Performance". O título novo
   ("Henrique Fujimoto · Judoca — Um treino de cada vez.") só aparece quando esse campo for
   atualizado no painel `/admin`. É um dado de conteúdo, não de código — não alterei o banco.
2. **Imagem Open Graph.** `public/brand/hf-og.png` foi gerada por `scripts/generate-og-image.cjs`
   (node-canvas) com o monograma oficial vetorial; o lettering usa a fonte do sistema porque
   Montserrat não está instalada na máquina. Se quiser a tipografia exata, vale refazer a arte no
   design e substituir o arquivo — o caminho e as metatags já estão prontos.
3. **Fotografia e vídeo.** O hero continua configurável pelo `/admin` (imagem/vídeo mobile e
   desktop). As recomendações de `HF_LUTs_e_Color_Grade.md` são direção de edição; nenhuma mídia
   foi gerada, alterada ou sintetizada.
4. **Componentes legados sem uso.** `components/Hero.tsx`, `LatestPosts.tsx`,
   `CompetitionsSection.tsx`, `SectionNav.tsx`, `home/IntentionStrip.tsx` e
   `home/WhySupportSection.tsx` não são importados por nenhuma rota. Foram repaginados para a
   paleta HF por consistência, mas podem ser removidos num passo de limpeza.
5. **Página `/parceria/:slug`** foi repaginada no código, mas não validei no navegador por não ter
   um slug de parceria ativo à mão.
6. **Tailwind via CDN.** O projeto configura o Tailwind por `cdn.tailwindcss.com` dentro do
   `index.html` (o próprio CDN avisa no console que não é para produção). Mantive o formato para
   não mexer no build, mas migrar para o Tailwind compilado é a recomendação técnica.

## 7. Segurança (item 10 do briefing)

**`.env` e `token.txt` estão versionados no repositório** (`git ls-files` confirma os dois).
Não li, não copiei e não reproduzi nenhum valor. Recomendação, fora do escopo visual e sem ação
minha até sua autorização:

1. Revogar e rotacionar todas as credenciais que estiverem nesses arquivos (Supabase, Meta/
   Instagram, Gemini e quaisquer tokens).
2. Remover os arquivos do versionamento (`git rm --cached .env token.txt`) e acrescentá-los ao
   `.gitignore`.
3. Como o histórico já contém os segredos, considerar limpeza de histórico se o repositório for
   público ou compartilhado.

Nada de autenticação, permissões, Supabase, APIs, formulários, links de contato, tracking ou
analytics foi alterado. Os módulos `/admin`, `/app`, `/gym`, `/escola` e `/nutri` não tiveram
tokens, fontes ou componentes modificados.

## 8. Passos para publicação

1. Revisar as alterações (`git diff`) e conferir o site rodando (`npm run dev`).
2. Criar uma branch, commitar e abrir PR — nada foi commitado nem publicado automaticamente.
3. Atualizar `site_title` no `/admin` (ver pendência 1).
4. Após o deploy, revalidar o compartilhamento em Facebook/WhatsApp/LinkedIn para que a nova
   imagem Open Graph entre em cache.
5. `sitemap.xml`, `robots.txt`, URLs e `facebook-domain-verification` foram preservados — nenhuma
   URL mudou.
---

## 9. Rodada 2 — layout dos mockups e nova copy (19/10/2026)

Aplicação das quatro telas enviadas (home desktop, home mobile, blog e apoiar) somada ao documento
de copy, com **todo o conteúdo checado contra o banco**. O hero manteve o vídeo, conforme pedido.

### O que entrou

- **Cabeçalho** com a navegação das telas — Início, História, Jornada, Blog, Apoiar — item ativo
  sublinhado em dourado e botão contornado "Acompanhar jornada".
- **Hero** com o vídeo real do atleta, breadcrumb (`Henrique Fujimoto / Judô / Sub-15 / História em
  andamento`), a manchete **"Você chegou antes."**, o complemento "Antes de quê? Ninguém sabe
  ainda." e a trilha vertical de palavras (`components/home/WordRail.tsx`).
- **Faixa dupla escura** com fotos reais dos marcos: "Fujimoto não é um nome novo no judô. Henrique
  é." e "Aqui não tem trailer. Tem treino."
- **Faixa clara em branco gelo** para as competições — "Terminou no tatame. Continua aqui." — com os
  três registros mais recentes em cards, o resumo real (18 competições, 13 pódios, 5 ouros, 2
  pratas, 6 bronzes) e a lista completa expansível.
- **"Não coube no Reels."** na home e como hero do blog.
- **Fechamentos** "Não temos o final." (home) e "Não sabemos qual será a próxima medalha." (apoiar),
  ambos com a trilha de palavras.
- **Blog** reorganizado em coluna principal + barra lateral (busca, categorias e lista de artigos).
- **Apoiar** com hero próprio, quatro cards de apoio, faixa clara de valores, bloco institucional e
  fechamento.
- Tokens de faixa clara no design system: `hfSectionLight`, `hfTitleOnLight`, `hfKickerOnLight`,
  `hfLeadOnLight`, `hfBodyOnLight`, `hfCardLight`, `hfLinkOnLight`, `hfBtnOutlineGold`.

### Dados fictícios das telas que NÃO foram copiados

As telas enviadas eram comps com conteúdo de exemplo. O que foi substituído pelo dado real:

| Na tela | No site |
|---|---|
| "Campeonato Brasileiro Sub-18", "Copa São Paulo", "Open Pan-Americano Sub-18" | As três competições mais recentes do banco (Copa do Ovo, 5ª Etapa Ranking Brasília, 1ª Etapa Circuito Escolar), todas **Sub-15** |
| Textos descritivos inventados em cada card de competição | Colocação, categoria, peso e cidade — campos reais do registro |
| Categorias do blog com contagens 12/8/11/9/14/6 | Categorias reais dos posts publicados, com a contagem real (hoje: Judô, 3) |
| "Artigos mais lidos — 32 mil visualizações" | Lista "Todos os artigos" — **não existe contador de visualizações** na base, então nenhum número foi exibido |
| Citação atribuída ao Henrique ("Acreditar no processo…") | **Removida.** Não invento fala de pessoa real; se houver uma frase dita por ele, basta enviar que eu insiro |
| Fotos de banco de imagens | Fotos reais dos marcos cadastrados (`athlete_profile.milestones`) e o vídeo do hero |

O bloco "Sobre o projeto" da página de apoio monta o texto a partir do banco (idade, categoria,
total de competições e ano da primeira), em vez de números escritos à mão que envelhecem sozinhos.

### Verificações desta rodada

- `npm run build` — passou.
- `npx tsc --noEmit` — **zero erros em todas as páginas públicas** (BlogPage e ConteudoPage, que já
  falhavam antes deste trabalho, foram corrigidas de quebra).
- `npx eslint` nos arquivos tocados — sem erros e sem avisos novos.
- Navegador: `/`, `/blog`, `/apoiar` em 390 px — sem rolagem horizontal, sem erro de console,
  contagens e categorias batendo com o banco.

### Observação sobre as capturas de tela

O painel do navegador não compõe texto sobre imagens de fundo nas capturas desta sessão (a camada
de texto sai em branco) e o recorte sai ampliado em telas largas. Validei a geometria por medição no
DOM e capturei com as imagens de fundo ocultas. Vale uma conferência no seu navegador.
