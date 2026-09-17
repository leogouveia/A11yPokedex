# ADR-0001: Arquitetura do aplicativo e estado remoto

## Contexto

O projeto e um template React Native sem navegacao, camada de dados ou estado de servidor. A funcionalidade exige duas telas, filtros, busca, paginação, detalhes compostos e refetch de dados externos.

## Decisao

Adotar arquitetura orientada a features, com modelos e seletores de dominio separados da camada `data/pokeapi`. Usar React Navigation native stack para navegacao e TanStack Query para estado remoto, cache em memoria, deduplicacao e estados de carregamento/erro. O estado efemero de filtros e busca permanece local aos hooks/telas de feature.

## Alternativas consideradas

- Manter toda a logica em `App.tsx`: rejeitada por misturar UI, navegacao, dominio e rede.
- Criar hooks e cache HTTP proprios: possivel, mas duplica tratamento de deduplicacao, cancelamento, retry e invalidez.
- Usar Redux ou outro store global: desnecessario para o escopo atual e adiciona estado global para dados que pertencem ao servidor.
- Usar navegacao manual com estado condicional: rejeitada porque evolucao e retorno entre detalhes exigem uma pilha de navegacao previsivel.

## Justificativa

A separacao permite testar regras de busca/filtro sem React Native e trocar a fonte de dados sem alterar telas. TanStack Query atende diretamente os estados remotos exigidos e nao implica cache persistente. Native stack usa semantica de navegacao nativa e cobre Android/iOS.

## Consequencias

- Sera necessario adicionar e configurar dependencias nativas de navegacao.
- Desenvolvedores deverao manter URLs e formatos da PokéAPI confinados ao repositorio.
- O cache em memoria pode reduzir requisicoes durante a sessao, mas nao oferece uso offline.
- Componentes de UI devem receber modelos de dominio ja normalizados.

## Requisitos e Skills relacionados

- RF01-RF18, RNF08, CA01-CA10.
- Skill `react-native-accessibility`, especialmente semantica, listas, estados dinamicos e testes em VoiceOver/TalkBack.
