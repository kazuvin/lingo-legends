# @lingo-legends/shared

Shared API types and client code generated from TypeSpec.

## Development

### Generate API Client

TypeSpecからOpenAPIスペックとAPIクライアントコードを生成します：

```bash
pnpm generate
```

これにより以下が実行されます：
1. TypeSpecのコンパイル（OpenAPI YAML生成）
2. Orvalによるコード生成（Zod schemas、React Query hooks、Axios client）

### Watch Mode

TypeSpecファイルの変更を監視して自動コンパイルします：

```bash
pnpm typespec:watch
```

### View API Documentation

Swagger UIでOpenAPI仕様を確認できます：

```bash
pnpm swagger
```

起動後、ブラウザで http://localhost:3001/api-docs にアクセスしてください。

## Exports

このパッケージは以下をエクスポートします：

- `@lingo-legends/shared/generated/zod` - Zod validation schemas
- `@lingo-legends/shared/generated/react-query` - React Query hooks
- `@lingo-legends/shared/generated/axios` - Axios client instance
