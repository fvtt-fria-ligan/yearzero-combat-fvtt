# Contributing

## Setup

```bash
# Install the Node packages
npm install

# Build the distribution
npm run dev

# Then link the project
# Unix
ln -s dist/* /absolute/path/to/foundry/data/system-name

# Windows
mklink /J /absolute/path/to/link /absolute/path/to/this/repo/dist
```
