# sharedlint

Shareable personal linting and formatting configs, served by a tiny HTTP API.

- Live: https://sharedlint.vercel.app

## API

- List configs

```sh
    curl https://sharedlint.vercel.app/api/configs
```

- Fetch a file (raw)

```sh
  curl -L -o biome.json "https://sharedlint.vercel.app/api/configs/biome/biome.json?format=raw"
  curl -L -o .editorconfig "https://sharedlint.vercel.app/api/configs/editorconfig/.editorconfig?format=raw"
  curl -L -o prettier.config.mjs "https://sharedlint.vercel.app/api/configs/prettier/prettier.config.mjs?format=raw"
  curl -L -o stylelint.config.mjs "https://sharedlint.vercel.app/api/configs/stylelint/stylelint.config.mjs?format=raw"
```

## Dev

- vercel dev

## License

MIT