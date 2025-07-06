# sharedlint

A collection of shareable linting and formatting configurations for web development.

## Quick Start

```bash
# List available configurations
npx sharedlint list

# Add a specific config
npx sharedlint add biome.json

# Add all configs to a directory
npx sharedlint add-all -d configs
```

## Available Configurations

- `biome.json` - Biome linter and formatter
- `prettier.config.mjs` - Prettier formatter
- `stylelint.config.mjs` - Stylelint CSS linter
- `.editorconfig` - Editor settings
- `tsconfig.*.json` - TypeScript configurations

## API

```bash
curl https://sharedlint.vercel.app/configs
curl https://sharedlint.vercel.app/biome.json
```

## License

MIT
