# Autism Soccer

Site dedicado ao iceberg interativo do grupo **Autism Soccer** (Discord).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres + Auth + Storage + RLS)

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

## Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
3. Cole os valores no arquivo `.env`.
4. No **SQL Editor**:
   - Projeto novo: execute `supabase/schema.sql`.
   - Projeto já existente: execute `supabase/migrations/20260814_topic_layers.sql` (não apaga tópicos).
5. Em **Authentication → Users**, crie o usuário administrador (e-mail + senha).
6. Reinicie o `npm run dev`.

A migration incremental adiciona `subtitle`, `main_image_url` e `layer` (1–8). Tópicos antigos recebem `layer = 1`. Os campos `x` e `y` ficam deprecated/nullable e não são mais usados na interface.

### Segurança

- Visitantes (anon) só leem tópicos.
- Criar / editar / excluir / upload exige login autenticado (políticas RLS).
- O botão **Entrar** abre o login; sem sessão válida a API rejeita escritas.
- Imagens vão para o bucket público `topic-images`; só usuários autenticados fazem upload.

Não use a `service_role` key no frontend.

## Uso

1. Role o iceberg pelas **8 camadas** (superfície → abismo).
2. Clique em um tópico para abrir a página dedicada (`/topico/:id`).
3. Use **Buscar tópico** para filtrar por título (e subtítulo).
4. **Entrar** (admin) → botão flutuante **+** para criar tópicos.
5. Na página do tópico, **Editar tópico** altera título, subtítulo, descrição, camada e imagem principal.

## Scripts

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `npm run dev`  | Ambiente de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run preview` | Preview do build    |

## Estrutura

```
src/
  components/   Header, Iceberg parallax, editor, infobox, busca
  pages/        Iceberg, tópico, Sobre
  services/     tópicos e upload (Supabase)
  contexts/     auth
  types/        tipagens do iceberg
supabase/
  schema.sql    tabela + RLS (instalação nova)
  migrations/   alterações incrementais
public/
  iceberg-parallax.avif   fundo da experiência
  iceberg.png             imagem original (não alterar, se existir)
```
