# ADR-0005: Filtros de exploracao em painel compacto

## Contexto

A tela de listagem exibe permanentemente todas as opcoes de tipo e geracao acima da lista de Pokemon. Como os filtros usam quebra de linha e alvos de toque de pelo menos 48dp, a barra ocupa varias linhas e reduz significativamente a area disponivel para explorar a lista.

Os requisitos RF02, RF03 e RF04 exigem filtros por tipo, por geracao e a combinacao simultanea dos dois. Os criterios de aceite tambem descrevem a aplicacao dos filtros quando eles sao confirmados. A acessibilidade exige alvos de toque adequados, ordem de leitura coerente, suporte a fonte ampliada e operacao com TalkBack e VoiceOver.

## Decisao

Substituir a barra de filtros expandida por um controle compacto na tela de listagem, com:

- um botao acessivel para abrir os filtros;
- um resumo dos filtros ativos;
- um painel modal ou bottom sheet rolavel contendo as selecoes de tipo e geracao;
- acao para limpar os filtros;
- acoes explicitas para cancelar ou aplicar as alteracoes.

As selecoes feitas no painel permanecerao em estado temporario ate a confirmacao. A consulta da lista sera atualizada somente ao aplicar os filtros, preservando a combinacao por intersecao entre tipo e geracao. O painel devera fechar depois de aplicar ou cancelar a operacao.

O painel sera implementado com componentes nativos e layout flexivel, sem alturas fixas para texto. Seus controles deverao manter semantica de selecao, rotulos em pt-BR, ordem de foco coerente, alvos de toque de pelo menos 48dp e suporte a fonte ampliada.

## Alternativas consideradas

- Manter a barra expandida: rejeitada porque reduz excessivamente a area da lista e cria um custo constante mesmo quando nenhum filtro esta ativo.
- Usar linhas horizontais com rolagem: rejeitada porque esconde opcoes lateralmente e dificulta a descoberta e a navegacao por leitores de tela.
- Usar um accordion inline: considerada, mas rejeitada porque ainda desloca a lista quando aberto e pode produzir uma tela alta para os dois grupos de opcoes.
- Usar um painel modal ou bottom sheet: escolhida porque concentra as opcoes fora da area principal, permite rolagem com fonte ampliada e suporta aplicacao atomica dos filtros.

## Justificativa

A decisao preserva RF02, RF03 e RF04 sem alterar a regra de dominio de intersecao. O resumo compacto torna o estado atual visivel, enquanto o painel sob demanda devolve a maior parte da tela a lista de Pokemon. A aplicacao explicita evita requisicoes intermediarias durante a configuracao de filtros combinados e alinha a interacao aos criterios de aceite.

## Consequencias

- A tela tera um estado adicional para abertura do painel e valores temporarios dos filtros.
- A implementacao devera definir o comportamento de cancelamento, limpeza e aplicacao sem perder os filtros atualmente confirmados.
- Sera necessario testar o painel com muitos itens, fonte ampliada, TalkBack e VoiceOver.
- Os testes de tela deverao deixar de depender da presenca permanente dos chips e cobrir abertura, selecao, combinacao, cancelamento, limpeza e aplicacao.
- A escolha entre modal e bottom sheet permanece uma decisao de implementacao, desde que preserve os contratos de acessibilidade e comportamento definidos neste ADR.

## Requisitos e Skills relacionados

- RF02, RF03, RF04, RNF01, RNF02, RNF03, RNF05 e RNF06.
- CA02, CA03, CA07, CA11 e CA12.
- Skill local `react-native-accessibility`, especialmente semantica, alvos de toque, texto dinamico, ordem de foco e validacao com TalkBack/VoiceOver.
