# ADR-0006: Orchestrator Agent para coordenar o workflow entre Agents

## Contexto

O workspace ja possui Agents especializados e sequenciais: Spec Writer, Tech Lead, Developer, Reviewer e QA. Hoje, a decisao de qual Agent acionar em seguida, e em que etapa do trabalho o projeto se encontra, e feita inteiramente pelo humano, sem apoio automatizado e sem um registro persistido do estado do fluxo.

A medida que o numero de incrementos cresce, torna-se dificil para o humano lembrar, entre sessoes, qual foi o ultimo Agent executado, qual foi o resultado (aprovado, aprovado com ressalvas, reprovado) e qual e a proxima etapa esperada. Os relatorios de Reviewer e QA existem apenas como mensagens de chat e nao sobrevivem a uma nova sessao.

Esta decisao trata exclusivamente da primeira versao do Orchestrator: escolha do proximo Agent e da proxima etapa, com aprovacao humana obrigatoria em toda transicao e sem qualquer participacao do Orchestrator na escolha do modelo de linguagem usado pelos Agents.

Para a POC, a aprovacao humana sera operacionalizada por handoffs explicitos: o Orchestrator propoe o destino e o humano aciona o Agent seguinte. O Orchestrator continua autorizado a atualizar automaticamente o registro persistido apos a aprovacao, mas essa escrita sera feita com `edit` como guardrail comportamental, sem enforcement tecnico de allowlist de paths.

## Decisao

Criar um novo Agent, Orchestrator, responsavel por:

1. Inferir o estado atual do trabalho a partir de artefatos do repositorio (`specs/pokedex.md`, `docs/technical-plan.md`, ADRs, estado do Git) e de um novo registro de estado compartilhado, `docs/workflow/state.md`.
2. Propor o proximo Agent e a proxima etapa, com justificativa, usando uma tabela de decisao fixa (ver `docs/orchestrator-agent-plan.md`, secao 5).
3. Sempre pedir aprovacao humana explicita antes de qualquer transicao, oferecendo no minimo as opcoes de aprovar a proposta, escolher outro Agent ou interromper.
4. Registrar a transicao em `docs/workflow/state.md` em duas fases distintas: aprovacao/inicio (Agent autorizado, sem resultado ainda) e conclusao (resultado efetivamente recebido do Agent). Essa e a unica escrita pretendida ao Orchestrator, e o Orchestrator nunca marca uma transicao como concluida sem ter recebido o resultado do Agent.
5. Exibir um handoff explicito para o Agent aprovado, sem invoca-lo como subagent. A escolha do modelo fica inteiramente a cargo da configuracao/selecao humana da sessao.
6. Executar uma unica transicao por aprovacao, sem encadear etapas automaticamente.
7. Restringir suas capacidades a `read`, `search` e `edit`; remover `execute` e `agent` do conjunto de ferramentas do Orchestrator.
8. Tratar a restricao de escrita a `docs/workflow/state.md` como guardrail comportamental aceito para a POC, documentando que Custom Agents nao fornecem enforcement tecnico de path allowlist para `edit`.
9. Tornar explicito um ciclo de correcao e re-review: toda correcao do Developer originada por findings do Reviewer retorna ao Reviewer para uma nova revisao antes de qualquer avanco para QA; uma reprovacao do QA segue o mesmo principio, retornando ao Reviewer antes de nova tentativa de QA. O Orchestrator nunca propoe QA como proxima etapa logo apos uma correcao do Developer.
10. Identificar, por heuristica sobre os arquivos alterados, incrementos com provavel impacto visual relevante e propor ao humano um checkpoint de validacao visual (`docs/orchestrator-agent-plan.md`, secao 5.2). A confirmacao ou o ajuste dessa classificacao e sempre humana, e o Orchestrator nunca avalia a qualidade do resultado visual; ele apenas nao propoe "Concluido" enquanto o checkpoint estiver pendente.
11. Ao ser introduzido em um projeto existente cujo `state.md` ainda nao possui baseline, executar um bootstrap de reconciliacao antes de propor uma etapa. O bootstrap identifica o incremento ativo, separa evidencias historicas de decisoes humanas registradas e apresenta ao humano um baseline proposto; nao trata implementacao existente como aprovacao de produto.
12. Tratar questoes abertas historicas como pendencias fora do incremento ativo por padrao. Uma questao historica so pode bloquear ou redirecionar o incremento atual quando o humano confirmar que ela se aplica ao incremento e que a decisao e necessaria para prosseguir; nesse caso, o Orchestrator propoe a etapa adequada, sem reiniciar automaticamente todo o projeto.
13. Persistir, para toda transicao cujo Agent seja o Developer, um campo Motivo (`IMPLEMENTACAO_INICIAL`, `CORRECAO_POS_REVIEWER` ou `CORRECAO_POS_QA`) em `docs/workflow/state.md`, mantendo esse valor tambem na linha correspondente do Historico. O objetivo e preservar entre sessoes a causalidade necessaria para aplicar de forma confiavel a regra de re-review obrigatoria do item 9, sem depender do historico de conversa.

O detalhamento tecnico completo (estrutura do registro de estado, tabela de decisao, ciclo de correcao/re-review, checkpoint de validacao visual, diagramas de sequencia e de estados, especificacao minima do arquivo do Agent) esta em `docs/orchestrator-agent-plan.md`.

Esta decisao cobre o desenho da POC. O Agent foi implementado em `.github/agents/orchestrator.agent.md` com `disable-model-invocation: true`, sem `execute` ou `agent` no frontmatter, com handoffs humanos explicitos e `edit` mantido apenas para persistencia comportamental do estado; a implementacao esta em ciclo de revisao/re-review, e este ADR deve ser mantido sincronizado com o arquivo vigente.

## Alternativas consideradas

- **Nao criar um Orchestrator; manter a escolha do proximo Agent inteiramente manual**: rejeitada porque o custo de coordenacao cresce com o numero de incrementos e o humano ja demonstrou dificuldade em rastrear o estado entre sessoes.
- **Orchestrator decide e executa transicoes automaticamente, sem aprovacao humana**: rejeitada explicitamente pelo pedido do usuario nesta primeira versao; tambem aumenta o risco de o Orchestrator acionar um Agent errado com base em uma inferencia incorreta do estado, sem chance de correcao previa.
- **Orchestrator tambem escolhe o modelo de linguagem de cada Agent**: rejeitada explicitamente nesta versao; a escolha de modelo tem implicacoes de custo e qualidade que o usuario quer manter sob controle humano direto.
- **Inferir o estado apenas da conversa atual, sem registro persistido em arquivo**: rejeitada porque o Orchestrator pode ser acionado em uma sessao nova, sem acesso ao historico de chat de Reviewer/QA; sem um registro em arquivo, a deteccao de estado ficaria dependente de o humano relatar manualmente tudo de novo a cada acionamento.
- **Encadear automaticamente varias transicoes quando o estado parecer permitir (ex.: Spec Writer -> Tech Lead -> Developer em sequencia)**: rejeitada nesta versao porque contraria o requisito de aprovacao humana em toda transicao; cada etapa concluida pode revelar informacao que muda a proxima decisao.
- **Invocar Agents automaticamente via `agent` depois da aprovacao textual**: rejeitada para a POC porque a plataforma nao transforma a aprovacao conversacional em um controle transacional; handoffs explicitos mantem a acao de iniciar o proximo Agent sob controle humano.
- **Remover tambem `edit` e exigir persistencia manual do estado**: rejeitada para a POC porque elimina a atualizacao automatica desejada; a perda de enforcement de path allowlist e aceita e documentada como risco.
- **Apos uma correcao pontual do Developer, seguir direto para QA sem nova revisao do Reviewer**: rejeitada porque enfraquece o portao de revisao de codigo justamente no momento de maior risco de regressao, logo apos uma mudanca.
- **Orchestrator avaliar diretamente a qualidade do resultado visual de um incremento**: rejeitada; essa avaliacao exige julgamento humano sobre a renderizacao real da interface, fora do escopo e da capacidade do Orchestrator, que deve se limitar a identificar a necessidade do checkpoint e bloquear a conclusao ate a confirmacao humana.
- **Nao distinguir uma transicao aprovada/iniciada do resultado efetivamente concluido pelo Agent**: rejeitada porque cria falsos positivos de conclusao quando uma transicao foi aprovada mas o Agent ainda nao respondeu ou a sessao foi interrompida entre a aprovacao e a resposta.
- **Confiar apenas na sequencia Agent+Resultado do Historico para inferir se uma conclusao do Developer e uma correcao sujeita a re-review obrigatoria**: rejeitada porque um historico truncado, resumido ou lido fora de ordem pode nao deixar claro se um Developer concluido e uma implementacao nova ou uma correcao originada por Reviewer/QA, arriscando pular a re-review obrigatoria (item 9) justamente no cenario de maior risco de regressao.

## Justificativa

Um registro de estado compartilhado e a unica forma pratica de o Orchestrator funcionar de forma confiavel entre sessoes distintas, dado que os relatorios de Reviewer e QA hoje sao efemeros. Em um projeto existente, porem, um arquivo inicial sem historico nao representa automaticamente o inicio do produto: ele exige um bootstrap explicito para reconciliar o estado persistido com os artefatos e a historia disponiveis. Handoffs explicitos evitam que o Orchestrator tenha de invocar subagents e deixam a decisao operacional de iniciar cada etapa com o humano. Manter `edit` permite persistir automaticamente o estado apos a aprovacao, enquanto a remocao de `execute` e `agent` reduz o raio de acao do Agent.

A restricao de escrita a `docs/workflow/state.md` nao pode ser garantida tecnicamente por Custom Agents nesta POC, porque o campo `tools` nao oferece allowlist de paths para `edit`. Essa limitacao e aceita conscientemente como trade-off pragmatico: as instrucoes exigem o path correto, mas hooks ou controlador externo/MCP serao necessarios no futuro para enforcement deterministico.

Exigir aprovacao humana em toda transicao, uma de cada vez, preserva o controle humano sobre o fluxo enquanto ainda reduz o esforco de diagnostico manual do estado atual. Manter a escolha de modelo fora do escopo do Orchestrator evita introduzir uma decisao de custo/qualidade dentro de um Agent cuja responsabilidade e apenas de coordenacao de processo.

O bootstrap e necessario porque artefatos de codigo, commits e ADRs demonstram trabalho realizado, mas nao provam sozinhos que uma decisao de produto foi aprovada. Da mesma forma, uma questao aberta antiga pode ser irrelevante para o incremento atual ou ainda exigir uma decisao; essa classificacao deve ser explicitada e confirmada pelo humano, em vez de ser inferida pelo Orchestrator a partir da idade da questao ou da existencia de implementacao relacionada.

Tornar explicito o ciclo de correcao e re-review evita que uma correcao pontual do Developer avance para QA sem que o Reviewer confirme que os findings foram de fato resolvidos e que nenhuma regressao foi introduzida. Prever um checkpoint de validacao visual, sem atribui-lo ao Orchestrator, reconhece que qualidade visual e uma avaliacao humana por natureza, enquanto ainda garante que o incremento nao seja considerado concluido sem essa confirmacao. Por fim, distinguir transicao aprovada de resultado concluido no registro de estado evita que o Orchestrator, ao ser reacionado apos uma interrupcao, trate uma etapa apenas iniciada como se ja tivesse um resultado.

## Consequencias

- Novo arquivo de estado `docs/workflow/state.md`, com escrita pretendida pelo Orchestrator apenas apos aprovacao humana; o arquivo passa a ter um campo de status do bootstrap (`NAO_APLICAVEL`, `PENDENTE` ou `CONFIRMADO`), um campo de status de transicao (`NENHUMA` no estado inicial, depois aprovada/em execucao/concluida), um campo de Motivo da transicao (significativo quando o Agent e o Developer: `IMPLEMENTACAO_INICIAL`, `CORRECAO_POS_REVIEWER` ou `CORRECAO_POS_QA`), um campo de resultado do Agent e um campo de Checkpoint de validacao visual, alem do historico de transicoes concluidas, que tambem preserva o Motivo de cada transicao de Developer.
- O Agent da POC usara `disable-model-invocation: true`, `read`, `search` e `edit`; nao tera `execute`, `agent` ou invocacao automatica de outros Agents.
- A ausencia de path allowlist para `edit` e um risco aceito e explicitamente nao resolvido nesta POC. O cumprimento de "editar somente `docs/workflow/state.md`" depende das instrucoes do Agent e da supervisao humana.
- Para que a deteccao de estado seja confiavel a partir de uma nova sessao, sera necessario avaliar, em uma decisao futura separada, se Developer, Reviewer e QA devem passar a registrar um resumo curto de resultado nesse arquivo ao final de sua propria saida. Essa mudanca nos Agents existentes nao esta aprovada por este ADR e exige aprovacao humana antes de ser implementada.
- O Orchestrator introduz uma heuristica baseada em leitura de artefatos (spec, plano, ADRs, Git) que pode nao cobrir todos os casos; ambiguidades devem sempre ser escaladas ao humano, nunca resolvidas por suposicao. O mesmo vale para a heuristica de impacto visual: falsos positivos/negativos sao esperados e a classificacao final e sempre humana.
- Incrementos com impacto visual relevante nao podem ser propostos como concluidos pelo Orchestrator sem confirmacao humana explicita do checkpoint de validacao visual, mesmo com Reviewer e QA ja aprovados.
- Quando o Orchestrator for introduzido em um projeto existente, o primeiro acionamento pode ficar com `Status do bootstrap = PENDENTE` ate que o humano confirme o incremento ativo e o baseline reconciliado. Esse bootstrap nao e uma transicao para Spec Writer, Tech Lead ou Developer.
- Pendencias historicas devem manter seu identificador e classificacao explicita (`HISTORICA_NAO_APLICAVEL`, `HISTORICA_A_RECONCILIAR` ou `BLOQUEADORA_DO_INCREMENTO`) ate que o humano confirme seu tratamento. Implementacao existente pode ser registrada como evidencia de uma suposicao adotada, mas nao como decisao de produto aprovada.
- Correcoes do Developer, sejam originadas por Reviewer ou por QA, sempre retornam ao Reviewer antes de qualquer nova tentativa de QA, o que pode aumentar o numero de ciclos ate a conclusao de incrementos com varias rodadas de findings.
- Esta primeira versao assume um unico incremento ativo por vez; multiplos incrementos concorrentes nao sao cobertos e podem exigir revisao futura da tabela de decisao.
- O bootstrap depende de evidencias disponiveis e de confirmacao humana; quando nao for possivel identificar o incremento ativo, o Orchestrator deve parar e pedir essa identificacao, sem escolher um Agent por padrao.
- A implementacao do arquivo `.github/agents/orchestrator.agent.md` foi concluida e esta em ciclo de revisao/re-review; ajustes decorrentes de findings de Reviewer/QA sobre o Agent seguem o mesmo ciclo de correcao e re-review descrito no item 9, aplicado ao proprio Agent como incremento.

## Requisitos e Skills relacionados

- Esta decisao nao deriva de requisitos funcionais do produto (`specs/pokedex.md`); trata-se de uma decisao de processo de engenharia assistida por Agents, solicitada diretamente pelo usuario.
- Nenhuma Skill do workspace (`react-native-accessibility`, `react-native-repack`) se aplica diretamente a esta decisao, por ser especifica de processo e nao de implementacao do aplicativo.
- Detalhamento tecnico completo em `docs/orchestrator-agent-plan.md`.
