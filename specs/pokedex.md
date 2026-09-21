# Visão Geral

A11yPokedex é um aplicativo mobile que permite ao usuário explorar, pesquisar e consultar detalhes de Pokémon, utilizando dados da PokéAPI. O produto é construído com foco forte em acessibilidade, garantindo que usuários que dependem de leitores de tela, ajuste de contraste e tamanho de fonte dinâmico consigam utilizar o app de forma plena e independente.

O conteúdo do aplicativo é exibido em português (pt-BR).

# Escopo

- Listagem paginada de Pokémon com filtros por tipo e geração.
- Busca de Pokémon por nome, número da Pokédex ou tipo.
- Tela de detalhes completa de um Pokémon (dados básicos, habilidades, descrição, cadeia de evolução e movimentos).
- Consumo de dados da PokéAPI.
- Acessibilidade como requisito transversal a todas as telas e funcionalidades.

# Requisitos Funcionais

## Exploração de Pokémon

- RF01: O sistema deve exibir uma lista de Pokémon ordenada por número da Pokédex, carregada incrementalmente conforme o usuário percorre a lista.
- RF02: O usuário deve poder filtrar a lista de Pokémon por tipo (ex.: fogo, água, elétrico).
- RF03: O usuário deve poder filtrar a lista de Pokémon por geração.
- RF04: O usuário deve poder combinar filtro de tipo e geração simultaneamente.
- RF05: Cada item da lista deve exibir, no mínimo: número da Pokédex, nome e imagem (sprite/artwork) do Pokémon.
- RF06: O sistema deve indicar visualmente e de forma acessível quando novos itens estão sendo carregados (estado de carregamento).
- RF07: O sistema deve exibir uma mensagem clara quando não houver Pokémon correspondentes aos filtros aplicados.

## Pesquisa de Pokémon

- RF08: O usuário deve poder pesquisar Pokémon digitando parte ou todo o nome.
- RF09: O usuário deve poder pesquisar Pokémon pelo número da Pokédex.
- RF10: O usuário deve poder pesquisar Pokémon por tipo.
- RF11: O resultado da busca deve ser atualizado conforme o usuário digita ou confirma a pesquisa.
- RF12: O sistema deve exibir uma mensagem clara quando nenhum Pokémon corresponder ao termo pesquisado.

## Detalhes do Pokémon

- RF13: Ao selecionar um Pokémon, o sistema deve exibir uma tela de detalhes contendo:
  - Nome e número da Pokédex.
  - Imagem (artwork) do Pokémon.
  - Tipo(s).
  - Altura e peso.
  - Estatísticas base (HP, ataque, defesa, ataque especial, defesa especial, velocidade).
  - Habilidades.
  - Descrição textual da Pokédex.
  - Cadeia de evolução (Pokémon anteriores e/ou seguintes na linha evolutiva).
  - Lista de movimentos aprendidos por subida de nível (`level-up`).
- RF14: A partir da cadeia de evolução, o usuário deve poder navegar para a tela de detalhes de outro Pokémon da mesma linha evolutiva.
- RF15: O sistema deve indicar de forma acessível o estado de carregamento enquanto os detalhes do Pokémon são obtidos.
- RF16: O sistema deve exibir uma mensagem de erro compreensível caso não seja possível carregar os detalhes de um Pokémon.

## Integração com a PokéAPI

- RF17: O sistema deve obter todos os dados de Pokémon (listagem, busca, detalhes, evolução, tipos, gerações) a partir da PokéAPI.
- RF18: O sistema deve tratar falhas de comunicação com a PokéAPI exibindo mensagem de erro compreensível ao usuário, com opção de tentar novamente.

# Requisitos não funcionais

- RNF01: O aplicativo deve atender ao padrão de acessibilidade WCAG 2.1, nível AA, em todas as telas e fluxos.
- RNF02: Todos os elementos interativos e informativos devem ser compatíveis com leitores de tela (VoiceOver no iOS e TalkBack no Android), incluindo rótulos (labels) descritivos e ordem de leitura coerente.
- RNF03: O aplicativo deve respeitar as configurações de tamanho de fonte dinâmico do sistema operacional, ajustando o texto sem quebrar o layout ou cortar conteúdo.
- RNF04: O aplicativo deve garantir contraste de cores adequado entre texto/ícones e fundo, conforme critérios de contraste do WCAG 2.1 AA.
- RNF05: Todos os elementos interativos (botões, itens de lista, campos de busca, filtros) devem possuir área de toque e indicação de foco compatíveis com diretrizes de acessibilidade mobile.
- RNF06: O aplicativo deve fornecer feedback perceptível (visual e via leitor de tela) para estados de carregamento, sucesso, vazio e erro.
- RNF07: O conteúdo textual do aplicativo (rótulos, mensagens, descrições de interface) deve ser exibido em português (pt-BR).
- RNF08: O aplicativo deve funcionar nas plataformas iOS e Android.

# Regras de Negócio

- RN01: A busca deve considerar o texto digitado de forma não sensível a maiúsculas/minúsculas e sem exigir acentuação exata.
- RN02: Quando múltiplos filtros (tipo e geração) forem aplicados, o resultado deve exibir apenas Pokémon que atendam a todos os critérios simultaneamente (operação de interseção, não de união).
- RN03: A cadeia de evolução exibida na tela de detalhes deve refletir a linha evolutiva oficial do Pokémon, incluindo estágios anteriores e posteriores, quando existirem.
- RN04: Pokémon sem determinada informação (ex.: sem habilidades registradas, sem descrição disponível) devem ter essa seção omitida ou sinalizada como "não disponível", nunca exibida em branco sem explicação.
- RN05: A listagem e a busca devem considerar somente a variedade padrão (`is_default`) de cada espécie.

# Critérios de Aceite

- CA01: Dado que o usuário abre a lista de Pokémon, quando a tela carrega, então os Pokémon são exibidos em ordem crescente de número da Pokédex e novos itens são carregados incrementalmente conforme o usuário rola a lista.
- CA02: Dado que o usuário aplica um filtro de tipo, quando o filtro é confirmado, então apenas Pokémon daquele tipo são exibidos na lista.
- CA03: Dado que o usuário aplica filtros de tipo e geração simultaneamente, quando os filtros são confirmados, então apenas Pokémon que atendem a ambos os critérios são exibidos.
- CA04: Dado que o usuário digita um nome parcial de Pokémon no campo de busca, quando a busca é executada, então são exibidos todos os Pokémon cujo nome contém o texto digitado, independente de maiúsculas/minúsculas.
- CA05: Dado que o usuário pesquisa por um número de Pokédex válido, quando a busca é executada, então o Pokémon correspondente é exibido no resultado.
- CA06: Dado que o usuário pesquisa por um tipo, quando a busca é executada, então todos os Pokémon daquele tipo são exibidos.
- CA07: Dado que nenhum Pokémon corresponde à busca ou aos filtros aplicados, quando o resultado é exibido, então uma mensagem clara de "nenhum resultado encontrado" é apresentada.
- CA08: Dado que o usuário seleciona um Pokémon na lista, quando a tela de detalhes carrega, então são exibidos nome, número, imagem, tipos, altura, peso, estatísticas base, habilidades, descrição, cadeia de evolução e movimentos aprendidos por subida de nível (`level-up`).
- CA09: Dado que o usuário está na tela de detalhes e a cadeia de evolução é exibida, quando o usuário seleciona outro Pokémon da cadeia, então a tela de detalhes desse Pokémon é aberta.
- CA10: Dado que ocorre uma falha ao buscar dados da PokéAPI, quando a falha acontece, então uma mensagem de erro compreensível é exibida com opção de tentar novamente.
- CA11: Dado que o usuário ativa um leitor de tela (VoiceOver/TalkBack), quando navega por qualquer tela do aplicativo, então todos os elementos interativos e informativos são anunciados com rótulos descritivos e em ordem de leitura coerente.
- CA12: Dado que o usuário aumenta o tamanho de fonte nas configurações do sistema operacional, quando abre qualquer tela do aplicativo, então o texto é redimensionado sem cortes ou sobreposições de conteúdo.
- CA13: Dado que o usuário está em qualquer tela do aplicativo, quando inspeciona o contraste de cores entre texto/ícones e fundo, então os valores atendem aos critérios mínimos do WCAG 2.1 AA.

# Fora do Escopo

- Autenticação e contas de usuário.
- Funcionalidade de favoritos ou histórico de Pokémon consultados.
- Funcionamento offline ou cache persistente de dados.
- Suporte a múltiplos idiomas (internacionalização/i18n) além do português (pt-BR).
- Comparação entre Pokémon.
- Batalhas, simulações ou qualquer mecânica de jogo.
- Edição ou criação de dados (o aplicativo é somente leitura, consumindo dados da PokéAPI).
- Formas e variedades alternativas ou regionais de Pokémon; a listagem e a busca consideram somente a variedade padrão (`is_default`).

# Questões em Aberto

