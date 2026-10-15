# 🌿 PAULISTA VERDE — projeto para GitHub Pages (MVP educativo)

**Quer publicar no GitHub? Leia primeiro [COMO_PUBLICAR_NO_GITHUB.md](COMO_PUBLICAR_NO_GITHUB.md).** Os arquivos já estão preparados para uma publicação estática; envie o conteúdo extraído na raiz do repositório.

Site feito com **HTML, CSS e JavaScript**, usando programação acessível a iniciantes. Funcionalidades: catálogo, filtros, mapa interativo, GPS com permissão, estimativa de distâncias, época de colheita, formulário com validação, cadastro salvo no navegador, exclusão local, guia e, opcionalmente, cadastro em banco de dados compartilhado.

## Começar

1. Extraia o ZIP e abra a pasta `paulista_verde_completo`.
2. Abra `index.html` no navegador. **A lista e as ferramentas básicas funcionam imediatamente.** O mapa precisa de internet (Leaflet / OpenStreetMap).
3. Para testar o GPS, abra a pasta com **Live Server** no VS Code ou rode `python -m http.server 8000`, acessando `http://localhost:8000`. Após publicar, use **HTTPS**, como GitHub Pages/Netlify.
4. No site, clique em **Marcar no mapa**, escolha uma região e preencha o formulário. Sem banco configurado, o cadastro fica salvo **somente neste navegador** (localStorage).
5. Os quatro registros identificados como **EXEMPLO FICTÍCIO** são inventados para testar o protótipo. **Não** representam locais reais de coleta, e o sistema avisa isso.

## Para compartilhar os cadastros entre celulares/computadores

Essa etapa usa o serviço externo gratuito **Supabase**, que oferece um banco de dados. Pode exigir criação de conta e configuração manual. A disponibilidade dos planos gratuitos depende do serviço.

1. Crie um projeto em https://supabase.com/.
2. Abra o **SQL Editor**, cole todo o conteúdo de `banco_supabase.sql` e execute.
3. No projeto, localize a **Project URL** e a **publishable key** (`sb_publishable_...`).
4. No arquivo `config.js`, substitua apenas `supabaseUrl` e `supabaseKey` pelos seus valores.
5. Recarregue o site. O status do mapa mostrará **Cadastros compartilhados**, e os registros ficarão visíveis para todos que acessarem o mesmo site.
6. Nunca coloque a **secret key** nem a **service_role key** no JavaScript público.

**Limitação importante:** a configuração pública desse MVP permite a qualquer visitante cadastrar sem autenticação e, portanto, pode sofrer spam e registros falsos. Não recomenda-se abrir para usuários reais sem moderação, proteção antiabuso, política de privacidade e mecanismo de corrigir/remover dados. Os cadastros públicos também não podem ser apagados pelo visitante neste protótipo, por segurança.

## Arquivos

- `index.html`: estrutura visual e campos do site.
- `style.css`: aparência e adaptação a celulares.
- `script.js`: busca, cálculo de distâncias, GPS, mapa, formulário, datas, armazenamento e API.
- `config.js`: configuração opcional de compartilhamento (vazio por padrão).
- `banco_supabase.sql`: criação e regras de segurança mínimas da tabela online.

## Como o JavaScript funciona

1. Um array `ESPECIES` guarda nomes, tipos, emojis e meses estimados de colheita.
2. `atualizarTela()` percorre uma lista e filtra pelo texto, tipo e mês.
3. `criarMapa()` inicializa o Leaflet. `desenharPontos()` coloca marcadores para as plantas filtradas.
4. `pedirGps()` solicita permissão ao navegador; a função `distanciaKm()` usa a fórmula de Haversine para calcular distância aproximada em linha reta (**não** o trajeto pelas ruas).
5. `registrarPlanta()` valida o formulário e salva no `localStorage` ou, após configuração, envia um `POST` à API do Supabase.
6. `montarSafra()` compara o mês atual com os meses informados no array.

## Privacidade, clima e qualidade da informação

- Não inclua **endereço residencial exato, telefone ou contato privado**. Use bairro e referência pública.
- As coordenadas cadastradas são **arredondadas a três casas decimais** (~100 m de precisão em latitude). Ainda assim podem indicar uma área habitada: prefira um ponto público autorizado.
- O botão de GPS só usa sua localização após autorização. A localização do visitante utilizada para calcular distância **não é enviada ao banco** por esse botão.
- As épocas de colheita são **estimativas didáticas**. Dependem do clima, da variedade e dos cuidados. Confirmar com informações agrícolas locais antes de divulgar dados como definitivos.
- Jamais incentive coleta em propriedade privada sem autorização ou retirada de alimentos não disponíveis para compartilhamento.
- Imagens e mapa dependem de acesso à internet. Os dados públicos precisam de verificação e moderação.

## Publicar gratuitamente

No GitHub Pages: crie um repositório, envie os arquivos, ative **Settings → Pages → Deploy from a branch**, escolha `main` e `/ (root)`. Depois acesse a URL HTTPS gerada. Se você configurar o banco, use a chave publicável (não a secreta).

## Para a Maratona DevImpacto

**Atenção às regras enviadas pela equipe:** o regulamento informado proíbe que a IA gere integralmente o código/lógica central e exige declaração de uso de IA. **Este exemplo foi gerado com assistência de IA e, portanto, não deve ser submetido como código original integral da equipe.** Use-o para estudar, entender cada função e reimplementar a lógica central com trabalho próprio e divisão das tarefas entre os três integrantes. Descrevam com transparência no vídeo e no formulário o que foi feito pelos estudantes e o que recebeu apoio de IA.

Sugestão de divisão: (1) HTML e navegação; (2) CSS/responsividade; (3) JavaScript/GPS e validação; todos revisam e apresentam os testes e decisões.

## Testes rápidos

1. Pesquise "Mangueira"; a lista deve filtrar.
2. Selecione "Hortaliças"; a lista mostra apenas a categoria correspondente.
3. Clique em "Ver no mapa"; o mapa centraliza na planta.
4. Clique "Marcar no mapa", selecione um lugar e cadastre uma espécie. Ela aparece na lista.
5. Recarregue a página: o cadastro local continua no mesmo navegador.
6. Use "Excluir meu cadastro" para remover um item salvo localmente.
7. Libere o GPS e selecione "Mais próximas"; aparecem as distâncias aproximadas.
8. No modo online, confira os cadastros em outro navegador que acesse o mesmo link.
