# ADR-0004: Re.Pack 5 com Rspack como bundler

## Contexto

O projeto atualmente usa o fluxo padrao do React Native Community CLI com Metro (`metro.config.js` e o script `start`). Foi aprovada a restricao de que o aplicativo deve utilizar Re.Pack 5 com Rspack no lugar do Metro. O projeto usa React Native 0.87.1 e declara Node `>= 22.11.0`, atendendo aos requisitos minimos conhecidos da skill local de Re.Pack 5. Durante a migracao, a versao estavel 5.3.0 nao resolveu a remocao de `rn-get-polyfills.js` feita no RN 0.87.

## Decisao

Adotar Re.Pack 5 com Rspack como bundler oficial para desenvolvimento e builds do aplicativo. A migracao devera usar a ferramenta oficial de inicializacao/migracao do Re.Pack antes de configuracao manual, com a menor configuracao explicita necessaria para a versao instalada. Para manter compatibilidade com React Native 0.87, o projeto fixa temporariamente `@callstack/repack@5.4.0-canary-20260913172854`, que contem a resolucao de polyfills e aliases necessaria para esse layout.

O fluxo devera continuar integrado a React Native Community CLI e aos builds nativos Android/iOS. A validacao sera feita em quatro camadas: compilacao Rspack, servidor/conectividade, build e inicializacao nativa, e comportamento JavaScript/Fast Refresh. A configuracao atual do Metro sera revisada e removida ou mantida somente quando houver necessidade documentada.

Nao adotar Module Federation, remotes, code splitting ou chunks dinamicos nesta fase.

## Alternativas consideradas

- Permanecer com Metro: rejeitada porque viola a restricao tecnica aprovada.
- Usar Re.Pack com webpack: rejeitada porque Rspack e a alternativa preferida no Re.Pack 5 e nao existe requisito para webpack.
- Configurar Re.Pack manualmente a partir de exemplos antigos: rejeitada por risco de incompatibilidade com Re.Pack 5 e React Native 0.87.1.
- Introduzir Module Federation/code splitting junto com a migracao: rejeitada porque aumenta a superficie de falha sem requisito funcional.

## Justificativa

Re.Pack 5 e compativel com as versoes atuais do projeto e atende explicitamente a restricao de substituir Metro. Rspack preserva um modelo de bundling simples, enquanto a migracao oficial reduz o risco de esquecer ajustes na CLI ou na integracao nativa. Manter o escopo do bundler minimo facilita distinguir problemas de bundling, conectividade, build nativo e runtime.

## Consequencias

- A implementacao futura devera adicionar e fixar versoes compativeis de Re.Pack 5/Rspack.
- Scripts de desenvolvimento e possivelmente configuracoes nativas serao alterados durante a migracao.
- `metro.config.js` nao deve ser mantido automaticamente apenas por existir.
- O pipeline de validacao precisara cobrir Android e iOS, alem de Fast Refresh e source maps.
- A dependencia do bundler passa a ser uma restricao operacional: upgrades de React Native e Re.Pack deverao ser avaliados em conjunto.
- A versao canary deve ser reavaliada quando uma versao estavel do Re.Pack 5 com suporte ao RN 0.87 estiver disponivel.
- `@react-native/js-polyfills` e declarado diretamente na versao `0.87.1` para tornar explicita a compatibilidade exigida pelo layout do React Native 0.87.
- O Re.Pack canary mantem `image-size@1.2.1`, com duas vulnerabilidades altas reportadas pelo npm audit e sem correcao compativel disponivel; isso permanece como divida tecnica ate correcao upstream segura.
- Nenhum beneficio de code splitting ou Module Federation sera assumido sem novo requisito e novo ADR.

## Requisitos e Skills relacionados

- Restricao tecnica aprovada: Re.Pack 5 com Rspack no lugar do Metro.
- RNF08 e os criterios de aceite que dependem de inicializacao e funcionamento do aplicativo.
- Skill local `react-native-repack`, incluindo compatibilidade de versoes, migracao oficial, integracao com CLI, validacao nativa e ausencia de complexidade desnecessaria.
