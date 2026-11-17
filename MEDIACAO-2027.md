# CRM de mediação · 2027

## Utilização

- **Triagem**: respostas recebidas, critérios de compra e chamada por confirmar.
- **Compradores**: lista única por telefone. Quem responde a outro imóvel mantém o mesmo contacto, com outra origem registada. Uma nova origem elegível volta à fila de triagem.
- **Angariação**: proprietários, qualificação, reunião e contrato de mediação. Um contrato assinado permite preparar a ficha do imóvel.
- **Imóveis**: carteira de mediação e construção de raiz, preço e comissão.
- **Páginas e anúncios**: página de angariação contínua e página própria para cada imóvel. Cada página tem URL, imóvel, Pixel e referência à variável do token.
- **Lançamentos**: datas e compradores compatíveis por zona, tipologia, orçamento e financiamento confirmado. O prazo de 30 dias é um objetivo comercial.
- **Parceiros / indicações**: link pessoal `/comprar?ref=CODIGO`. O indicado preenche os próprios dados. O prémio fica elegível após CPCV e sinal confirmado; marcar como pago apenas regista um pagamento já realizado.
- **Base de contactos**: contactos sem enquadramento atual e interessados anteriores preservados.

O objetivo anual é de 65 vendas. A referência 1/200 é a linha de base fornecida pela equipa, não um resultado calculado. O total de vendas conta os compradores marcados como Vendido em 2027; cada apartamento deve ter uma ficha de imóvel separada.

## Organização do espaço de trabalho

- **Hoje:** prioridades de contacto, destaque permanente para angariação contínua e próximos lançamentos.
- **Compradores:** por qualificar, qualificados e sem enquadramento.
- **Imóveis:** angariação de proprietários, carteira e lançamentos. Os proprietários sem enquadramento continuam acessíveis no filtro de angariações.
- **Rede de parceiros:** parceiros, indicações e prémios.
- **Resultados:** funil por origem e conversão.
- **Configurações:** páginas/anúncios, banco de perguntas e envios à Meta. As campanhas de angariação contínua e de imóveis individuais têm listas separadas; publicar uma página não ativa anúncios no Meta Ads.


## Banco de perguntas e histórico

O separador **Banco de perguntas** permite criar, duplicar e editar conjuntos para Compradores ou Angariação. Cada pergunta tem texto, posição e regra: eliminatória com Sim/Não aceite, ou informativa. Os critérios de orçamento e financiamento também são configurados nos conjuntos de compradores. É exigida pelo menos uma pergunta eliminatória.

Editar cria uma nova versão, sem modificar versões anteriores. Em **Páginas e anúncios**, escolher o conjunto e a versão que cada página deve apresentar. As páginas de campanhas ficam presas à versão escolhida até uma alteração explícita. Os formulários gerais `/comprar` e `/angariar` usam a versão mais recente do respetivo conjunto original.

Cada contacto e cada origem de anúncio conserva uma cópia das perguntas, das regras e das respostas recebidas. Na ficha, **Conjunto de perguntas respondido** permite selecionar um conjunto para uma nova avaliação. As respostas ficam por preencher, a validação anterior é retirada e os eventos ainda pendentes são cancelados. Os eventos já enviados não são repetidos. O histórico mostra os textos e respostas tal como foram guardados; trocar perguntas não altera o passado.

Um formulário aberto antes de a página mudar de versão pede atualização antes do envio, para não aplicar regras novas a respostas antigas. Os critérios de aceitação não são incluídos nos dados enviados ao navegador público. Mantém-se a chamada validada e o consentimento antes dos sinais Meta.

`question-bank-v1.sql` acrescenta as versões e o histórico, associa os registos existentes aos conjuntos originais e preserva as respostas. O processo de build aplica esta atualização depois da migração inicial do CRM, uma única vez.

## Páginas públicas e campanhas

- `/angariar`: página geral de apresentação de imóveis, sem destino Meta por defeito.
- `/comprar`: formulário geral para a lista de compradores e referências.
- `/p/SLUG`: página publicada configurada no CRM. Para os anúncios, usar esta ligação com os parâmetros UTM da campanha.

Exemplo de organização:

| Página | Tipo | Destino |
| --- | --- | --- |
| `/p/angariacao-aveiro` | Angariação | Pixel de angariação |
| `/p/apartamento-aveiro` | Imóvel | Pixel do apartamento |
| `/p/moradia-ilhavo` | Imóvel | Pixel da moradia |

O ID de Pixel não é aceite de um formulário público: o servidor resolve o destino através da página guardada. Páginas diferentes podem usar o mesmo conjunto de dados, se essa for a opção da equipa. Depois de definido, um Pixel não é trocado numa página existente; cria-se uma página nova para preservar a atribuição.

## Configurar Meta na Vercel

1. No Gestor de Eventos, obter o ID do conjunto de dados e o token autorizado para esse destino.
2. Guardar o token apenas numa variável privada da Vercel, por exemplo `META_TOKEN_ANGARIACAO` ou `META_TOKEN_IMOVEL_01`. Nunca usar prefixo `NEXT_PUBLIC_`.
3. Em Páginas e anúncios, indicar o ID e **o nome** dessa variável. O CRM nunca recebe o valor do token pelo editor.
4. Publicar a página. O formulário guarda pedidos mesmo sem Meta configurada.
5. Validar a integração com o código de teste do Gestor de Eventos e um contacto de teste autorizado. Eventos de teste têm estado separado e não contam como sinais em produção.
6. Retirar o código de teste e ativar o envio quando a configuração estiver validada. Uma nova implantação da Vercel é necessária depois de mudar variáveis privadas.
7. Selecionar na campanha o evento de qualidade adequado, quando disponível. Aceitação pela API não prova correspondência com o anúncio nem garante que a campanha já está a otimizar para esse evento.

Não há Pixel nem token pré-configurado nesta entrega. Não foi enviado qualquer evento real à Meta durante o desenvolvimento.

### Regras dos eventos

- Formulários públicos não criam eventos de qualidade nem validam chamadas.
- Compradores: intenção de compra, zona atendida, orçamento definido e financiamento preparado; depois, validação explícita por telefone.
- Angariação: contacto confirmado, proprietário/representante, zona atendida e interesse na mediação; depois, validação explícita por telefone.
- É necessária autorização de medição, com data e versão do texto. Revogação cancela os eventos ainda pendentes.
- Compradores: `QualifiedLead`, `Schedule`, `Proposal`, `CPCV`.
- Proprietários: `QualifiedOwner`, `OwnerMeeting`, `ListingAgreement`. Os nomes de angariação são eventos personalizados.
- Eventos de etapas de um imóvel só seguem para a origem desse imóvel. A qualificação de uma nova origem exige uma chamada posterior à sua receção. A primeira submissão de cada origem é preservada, incluindo as respostas.
- Não há fallback para um Pixel global. Falta de token, Pixel ou autorização deixa o envio por fazer.
- IDs de evento estáveis e bloqueio de execução evitam duplicação em regravações e tentativas concorrentes. Cinco tentativas automáticas no máximo; eventos com mais de sete dias expiram sem alterar a data original.
- Os campos enviados são contacto codificado, identificadores publicitários consentidos, etapa, ID e data do evento. Não são enviados orçamento, crédito, localização do imóvel ou notas.

O processamento ocorre ao guardar a validação e pelo botão **Processar pendentes**. Para reprocessamento automático independente da utilização, configurar um agendador que chame `GET /api/meta-cron`, com `Authorization: Bearer CRON_SECRET`. Sem agendador, não existe promessa de tentativas em segundo plano.

Referência Meta: https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/server-event

## Base de dados e publicação

O schema usa PostgreSQL. `prisma/mediation-2027.sql` acrescenta dez tabelas; não altera nem apaga os dados antigos. A atualização é transacional, tem bloqueio de concorrência e fica registada em `_AHMigration`.

- Produção Vercel: usar o comando de build **`npm run build`**. Com `VERCEL_ENV=production`, aplica a atualização antes de compilar. Preservar as variáveis existentes de autenticação, base de dados e entrada da landing anterior.
- Outra base, explicitamente: `npm run db:mediation` com `DATABASE_URL` configurada.
- Fora de produção, `npm run build` não altera a base por defeito.
- Não usar `prisma migrate reset`, `db push --accept-data-loss` nem eliminar tabelas antigas.
- Reverter a interface para o commit anterior deixa os dados antigos intactos; as novas tabelas podem permanecer.

Os proprietários anteriores aparecem em Imóveis → Proprietários anteriores. Os compradores anteriores aparecem em Base de contactos → Interessados anteriores. A qualificação anterior não é presumida nem enviada à Meta automaticamente.

## Verificação

`npm run test:mediation` usa Node 24 e testes do domínio, guardas de qualificação, deduplicação, atribuição por origem, isolamento de tokens, payload sem dados financeiros, falhas e expiração. `node --test src/lib/landing-intake.test.mjs src/lib/session.test.mjs` verifica o formulário anterior e a autenticação.

`/dev-preview` só existe em desenvolvimento, com dados declaradamente fictícios e gravação desativada. Em produção devolve 404. `?mobile=1` mostra duas janelas de 390 px para inspeção de layout.

A página pública informa a finalidade do contacto e separa a medição opcional. A identificação legal e os contactos da entidade responsável devem corresponder à operação de mediação efetiva antes de ativar campanhas públicas.
