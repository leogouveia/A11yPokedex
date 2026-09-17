# Plano tecnico: A11yPokedex

## 1. Contexto atual

- Aplicativo bare React Native 0.87.1, React 19.2.3 e TypeScript.
- O bundler alvo aprovado e Re.Pack 5 com Rspack; o projeto ainda esta no Metro e a migracao nao foi executada.
- O `App.tsx` ainda e o template inicial; nao existem telas de produto.
- Dependencias atuais: `react-native-safe-area-context` e componentes do template.
- Nao existe navegacao, cliente HTTP, cache de estado remoto, camada de dominio ou componentes de UI do produto.
- Jest esta configurado com o preset do React Native e possui apenas um teste de renderizacao do template.
- O `metro.config.js` e os scripts atuais ainda pertencem ao fluxo Metro e deverao ser revisados durante a migracao, sem preservar configuracao Metro sem necessidade.
- Android esta configurado com `minSdkVersion 24`; a versao minima de iOS ainda e herdada da configuracao do React Native e deve ser confirmada antes da implementacao.

## 2. Arquitetura alvo

Organizar o codigo por responsabilidade e por feature, mantendo a PokéAPI fora dos componentes:

```text
src/
  app/
    AppNavigator.tsx
    queryClient.ts
  features/
    pokemon-list/
      screens/PokemonListScreen.tsx
      components/
      hooks/
    pokemon-search/
    pokemon-detail/
      screens/PokemonDetailScreen.tsx
      components/
  domain/pokemon/
    models.ts
    selectors.ts
    formatters.ts
  data/pokeapi/
    client.ts
    endpoints.ts
    mappers.ts
    repositories/
  ui/
    components/
    theme/
  i18n/
    pt-BR.ts
```

A camada `data/pokeapi` sera responsavel por HTTP, tratamento de resposta, normalizacao e conversao de nomes/status para modelos de dominio. Telas e componentes consumirao hooks de feature, nunca URLs ou formatos brutos da API.

## 3. Dependencias tecnicas propostas

Adicionar, em versoes compativeis com React Native 0.87.1:

- Re.Pack 5 e Rspack, usando a inicializacao/migracao oficial e a configuracao padrao minima compativel com a versao instalada.
- React Navigation com native stack para a tela de lista e a tela de detalhes.
- TanStack Query para estado remoto, deduplicacao, loading, erro, retry manual e cache somente em memoria.
- `react-native-screens` e `react-native-gesture-handler` conforme exigido pelo stack escolhido.

Nao adicionar biblioteca de UI ou i18n completa inicialmente. O escopo possui apenas pt-BR; componentes primitivos do React Native com um tema proprio reduzem dependencia e permitem controlar semantica, contraste e escalabilidade tipografica.

O bundling deve permanecer simples: nao introduzir Module Federation, remotes, chunks dinamicos ou code splitting sem um requisito adicional e um novo registro arquitetural.

## 3.1. Impacto do bundler e fluxo de build

- Confirmar a versao instalada do Node, React Native e Re.Pack antes de configurar; Re.Pack 5 requer Node 20+ e React Native 0.77+.
- Executar a ferramenta oficial de inicializacao/migracao do Re.Pack antes de criar arquivos manualmente.
- Revisar os arquivos gerados, `package.json`, scripts da CLI, `metro.config.js` e qualquer configuracao nativa alterada; remover somente configuracao Metro que deixar de ser necessaria.
- Manter o desenvolvimento iniciado pela React Native Community CLI, com Fast Refresh, source maps e comunicacao entre app nativo e servidor Re.Pack.
- Validar separadamente compilacao Rspack, conectividade do servidor, build nativo e falhas JavaScript em runtime.
- Validar Android debug, Android release quando a configuracao de release for tocada, e iOS quando houver ambiente disponivel.

## 4. Fluxos e responsabilidades

### Lista e filtros

1. Carregar o indice paginado de `/pokemon`, ordenado pelo `offset` retornado pela API.
2. Para cada pagina visivel, carregar os resumos necessarios em `/pokemon/{name-or-id}` para numero, tipos e imagem.
3. Manter no estado de tela os filtros selecionados e o termo de busca; manter respostas remotas no TanStack Query.
4. Derivar resultados por intersecao de IDs quando tipo e geracao forem aplicados.
5. Usar `FlatList` com `onEndReached` e protecao contra chamadas concorrentes; exibir loading inicial, loading incremental, erro com retry e estado vazio.

Como a PokéAPI nao oferece busca parcial por nome, o repositorio devera obter o indice de especies/nomes necessario e filtrar localmente, sem diferenciar maiusculas/minusculas e removendo diacriticos para atender RN01. Busca por numero deve validar um ID inteiro positivo e busca por tipo deve usar o endpoint de tipo.

O tamanho da pagina deve ser uma constante configuravel depois da resposta de QA01; nao fixar uma decisao de produto no plano.

### Detalhes

O repositorio de detalhes compora:

- `/pokemon/{id-or-name}` para dados basicos, tipos, estatisticas, habilidades e movimentos;
- `/pokemon-species/{id-or-name}` para descricao em pt-BR e referencia da cadeia evolutiva;
- `/evolution-chain/{id}` para a arvore completa de evolucao.

O mapeador deve achatar a arvore de evolucao em uma sequencia navegavel, preservando todos os estagios anteriores e posteriores. A tela exibira secoes independentes e omitira ou marcara como `Nao disponivel` dados ausentes, conforme RN04. A regra para formas alternativas/regionais depende de QA03.

### Navegacao

- `PokemonList` e a rota inicial.
- `PokemonDetail` recebe `pokemonId` como parametro, nao um objeto completo, para manter a rota pequena e permitir recarregamento/refetch.
- Itens da cadeia de evolucao navegam para a mesma rota com outro `pokemonId`.
- Falhas de rede permanecem na tela com acao explicita de tentar novamente.

## 5. Contratos e estados de UI

Cada tela deve modelar explicitamente os estados `loading`, `success`, `empty` e `error`. O estado de erro deve diferenciar, quando possivel, falha de rede, resposta invalida e recurso inexistente, mas sempre apresentar mensagem em pt-BR compreensivel.

O cliente HTTP deve:

- usar timeout e abortar requisicoes substituidas por nova busca;
- validar o status HTTP antes de mapear o corpo;
- converter falhas em um erro de dominio estavel para a UI;
- evitar retry automatico agressivo; a tentativa manual deve estar sempre disponivel nos estados de erro.

Nao havera armazenamento persistente ou modo offline, conforme fora de escopo. Cache em memoria durante a sessao e permitido apenas como detalhe de desempenho, sem alterar o comportamento funcional.

## 6. Acessibilidade e UI

Aplicar a skill `react-native-accessibility` desde o primeiro componente:

- definir `accessibilityRole`, rotulos, dicas, estados e valores apenas onde a semantica nativa nao for suficiente;
- garantir que cada item de Pokemon anuncie nome, numero e acao de abertura;
- tratar imagens como informativas quando comunicarem o Pokemon e como decorativas quando houver texto equivalente;
- usar alvos de toque de pelo menos 48dp;
- nao comunicar tipo ou estado somente por cor;
- usar layout flexivel, texto com font scaling habilitado e evitar alturas fixas em textos dinamicos;
- anunciar mudancas relevantes de loading, vazio e erro sem excesso de interrupcoes;
- manter ordem de foco/leitura coerente em lista, filtros, detalhes e cadeia evolutiva.

O tema devera centralizar cores, espacamentos e tipografia. Contraste sera verificado por medicao, nao por avaliacao visual.

## 7. Estrategia de testes

### Unitarios

- normalizacao de busca sem acentos e sem diferenca de caixa;
- intersecao tipo + geracao;
- ordenacao por numero;
- flatten da cadeia evolutiva;
- mapeamento de ausencia de dados e descricao pt-BR;
- conversao de erros HTTP/rede para erro de dominio.

### Componentes e integracao

- lista com loading inicial, pagina seguinte, vazio, erro e retry;
- filtro combinado e busca por nome, numero e tipo;
- navegacao lista -> detalhe e detalhe -> outro Pokemon da evolucao;
- detalhe com todas as secoes e com secoes sem dados;
- mock da camada de repositorio, sem depender da rede real nos testes Jest.

### Validacao manual

Executar em Android/TalkBack e iOS/VoiceOver: ordem de leitura, rotulos, foco, ativacao dos itens, loading, erro, vazio, tamanho de toque e navegacao. Repetir com fonte ampliada e validar contraste de texto, icones e indicadores de foco. Testes automatizados nao substituem essa validacao.

## 8. Sequencia de implementacao

1. Confirmar QA01-QA04 e a versao minima de iOS.
2. Migrar o bundler para Re.Pack 5/Rspack usando a ferramenta oficial; validar servidor, Fast Refresh, build Android e build iOS quando disponivel.
3. Instalar e configurar navegacao, TanStack Query e dependencias nativas; repetir validacao dos builds.
4. Criar modelos de dominio, cliente PokéAPI, repositorios, mapeadores e testes unitarios.
5. Criar tema, componentes acessiveis de estado, lista e filtros.
6. Implementar busca e paginação com testes de fluxo.
7. Implementar detalhes, evolucao e movimentos com navegacao.
8. Executar validacao de acessibilidade manual, build de release quando aplicavel e revisar todos os criterios CA01-CA13.

## 9. Riscos e questoes abertas

- A API publica pode impor rate limit; carregar detalhes por pagina exige deduplicacao e controle de concorrencia.
- Buscar por nome parcial exige carregar um indice local em memoria; o impacto de latencia e volume deve ser medido em dispositivo real.
- QA01 define o tamanho da pagina e afeta latencia, consumo e frequencia de requisicoes.
- QA02 define se movimentos serao todos os movimentos retornados ou filtrados por metodo de aprendizado.
- QA03 define identificacao, exibicao e busca de formas alternativas/regionais.
- QA04 e a versao minima de iOS ainda precisam ser confirmados para fechar a matriz de compatibilidade.
- A PokéAPI fornece nomes e descricoes em varios idiomas; deve ser definido o fallback quando nao houver entrada pt-BR.
- A migracao pode exigir ajustes nos scripts da React Native Community CLI e nos pontos nativos de carregamento do bundle; sucesso da compilacao Rspack isolada nao prova que o app nativo inicia.
- A configuracao de Re.Pack deve ser mantida compativel com a versao instalada; exemplos de Re.Pack anteriores nao devem ser copiados sem verificacao. A implementacao atual fixa temporariamente o canary 5.4.0 por causa das mudancas de layout do RN 0.87, devendo migrar para uma release estavel compativel quando disponivel.
