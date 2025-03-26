# SharedLint

A collection of shareable linting and formatting presets for modern web development.

## Configuration Packages

- `@sharedlint/eslint` - ESLint configurations
- `@sharedlint/prettier` - Prettier configuration
- `@sharedlint/stylelint` - Stylelint configuration
- `@sharedlint/biome` - Biome configuration
- `@sharedlint/editorconfig` - EditorConfig configuration
- `@sharedlint/typescript` - TypeScript configurations

## Development

```bash
# Install dependencies
pnpm install

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Create a commit (uses commitizen)
pnpm commit
```

## Contributing

1. Create a feature branch from `canary`
2. Make your changes
3. Run `pnpm changeset` to document your changes
4. Commit your changes (use `pnpm commit` for conventional commits)
5. Create a pull request

## Attribution

- https://github.com/haydenbleasel/ultracite

## License

MIT
