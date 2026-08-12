# Autism Soccer

Site dedicado ao iceberg interativo do grupo **Autism Soccer** (Discord).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- react-zoom-pan-pinch
- Supabase (Postgres + Auth + RLS)

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
4. No **SQL Editor**, execute o conteúdo de `supabase/schema.sql` (inclui tabela, RLS e bucket `topic-images` para imagens nas descrições).
5. Em **Authentication → Users**, crie o usuário administrador (e-mail + senha).
6. Reinicie o `npm run dev`.

### Segurança

- Visitantes (anon) só leem tópicos.
- Criar / editar / excluir exige login autenticado (políticas RLS).
- O botão **Editar Iceberg** abre o login; sem sessão válida a API rejeita escritas.

Não use a `service_role` key no frontend.

**Projeto já existente?** Se você já rodou o `schema.sql` antes, execute no SQL Editor apenas o trecho final do arquivo (bucket `topic-images` e políticas de Storage).

## Uso do editor

1. Clique em **Editar Iceberg** e entre com a conta admin.
2. **Adicionar tópico** → clique sobre o texto vermelho na imagem → preencha título/descrição → Salvar.
3. A descrição aceita formatação (negrito, listas) e **imagens coladas com Ctrl+V** diretamente no corpo do texto.
4. Clique em um hotspot existente para editar, reposicionar ou excluir.
5. Em **Reposicionar**, clique na nova posição na imagem.

Coordenadas são normalizadas (`0–1`) em relação à imagem, então acompanham zoom, pan e resize.

## Scripts

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `npm run dev`  | Ambiente de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run preview` | Preview do build    |

## Estrutura

```
src/
  components/   Header, IcebergViewer, hotspots, modais, editor
  pages/        Iceberg, Sobre
  services/     acesso aos tópicos (Supabase)
  contexts/     auth e modo de edição
  types/        tipagens do iceberg
supabase/
  schema.sql    tabela + RLS
public/
  iceberg.png   imagem original (não substituir)
```
