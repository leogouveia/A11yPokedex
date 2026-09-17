# ADR-0002: Integracao, normalizacao e filtragem da PokéAPI

## Contexto

A PokéAPI oferece recursos separados para lista, tipo, geracao, detalhes, especie e evolucao. Ela nao oferece uma consulta geral de nome parcial que resolva simultaneamente os filtros do produto. O app tambem precisa exibir informacoes compostas e funcionar sem persistencia offline.

## Decisao

Criar um cliente HTTP e repositorios dedicados, com mapeadores para modelos de dominio. Usar o indice paginado de `/pokemon` como base da exploracao; obter conjuntos de IDs de `/type/{type}` e `/generation/{generation}`; aplicar filtros localmente por intersecao. A busca parcial por nome sera feita sobre o indice de nomes carregado em memoria. Detalhes visuais da lista serao obtidos de `/pokemon/{id-or-name}` somente para os itens necessarios.

Para detalhes, compor `/pokemon`, `/pokemon-species` e `/evolution-chain`, selecionando descricao pt-BR e aplicando fallback explicito quando ausente. A cadeia retornada sera normalizada para uma estrutura navegavel. O tamanho de pagina permanecera configuravel ate a decisao de QA01.

## Alternativas consideradas

- Fazer todas as filtragens somente no servidor: nao e possivel para busca parcial e combinacao uniforme usando os endpoints publicos.
- Baixar todos os detalhes antes de renderizar a lista: simplifica a UI, mas aumenta latencia, memoria e risco de rate limit.
- Usar dados derivados de uma fonte local ou arquivo estatico: viola RF17 e dificulta atualizacao.
- Persistir cache local: fora do escopo e pode sugerir suporte offline.

## Justificativa

A decisao respeita RF17, RN01, RN02 e RN03 sem acoplar a UI ao formato da API. A carga sob demanda limita custo de rede, enquanto o cache em memoria e a deduplicacao evitam requisicoes repetidas durante a sessao.

## Consequencias

- A busca inicial pode exigir uma requisicao de indice relativamente grande; deve haver loading e cancelamento.
- A lista pode realizar requisicoes adicionais para imagens/resumos; isso deve ser limitado por pagina e medido.
- Mudancas no contrato da PokéAPI ficam concentradas em `data/pokeapi`.
- QA02, QA03 e a politica de fallback pt-BR precisam ser fechados antes de concluir os mapeadores.

## Requisitos e Skills relacionados

- RF01-RF05, RF08-RF13, RF17-RF18, RN01-RN04, CA01-CA10.
- Nenhuma skill externa adicional foi encontrada no workspace para a PokéAPI; a decisao usa os contratos publicos da API a serem verificados durante a implementacao.
