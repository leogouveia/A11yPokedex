# ADR-0003: Acessibilidade como contrato de UI e validacao

## Contexto

A acessibilidade e requisito transversal e possui criterios de aceite especificos para leitores de tela, fonte ampliada, contraste, foco, alvos de toque e estados dinamicos. O template atual nao possui componentes de produto nem uma estrategia de validacao.

## Decisao

Projetar cada componente com semantica React Native nativa e aplicar explicitamente `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, `accessibilityState` e `accessibilityValue` somente quando necessario. Usar componentes nativos e layout flexivel, manter font scaling habilitado, garantir alvo de toque de pelo menos 48dp e centralizar cores/estilos para verificacao de contraste.

Cada tela devera modelar loading, vazio, erro e sucesso, com feedback visual e anuncio acessivel apropriado. A definicao de pronto inclui testes Jest de estados e semantica relevante, mais validacao manual com TalkBack, VoiceOver, fonte ampliada, ordem de foco, toque e contraste.

## Alternativas consideradas

- Tratar acessibilidade apenas em uma revisao final: rejeitada porque escolhas de layout, navegacao e componentes podem impedir correcoes tardias.
- Usar somente snapshots/renderizacao: insuficiente para comportamento de leitores de tela, foco, contraste e dimensionamento dinamico.
- Depender exclusivamente de uma biblioteca de UI: rejeitada neste momento porque a biblioteca nao foi escolhida e nao substitui validacao nativa.

## Justificativa

A decisao segue a skill local `react-native-accessibility` e cobre RNF01-RNF06 e CA11-CA13. A separacao entre testes automatizados e validacao manual evita declarar conformidade WCAG apenas por inspeção estatica.

## Consequencias

- Componentes acessiveis precisarao ser especificados antes das telas finais.
- Contraste e comportamento com fonte grande entram no ciclo normal de desenvolvimento, nao apenas no QA final.
- Sera necessario manter uma matriz de verificacao Android/iOS e registrar falhas por tela/estado.
- A conformidade final depende de execucao em VoiceOver e TalkBack, nao apenas do codigo.

## Requisitos e Skills relacionados

- RNF01-RNF07, CA07, CA10-CA13.
- Skill local `react-native-accessibility`.
