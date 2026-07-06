#!/bin/bash

echo "🔍 Linting code..."

# Run ESLint if available
if command -v npx &> /dev/null && [ -f "package.json" ]; then
    if grep -q '"eslint"' package.json; then
        npx eslint . --ext .ts,.tsx --fix
        echo "✅ ESLint completed"
    fi
fi

# Run Prettier if available
if command -v npx &> /dev/null && [ -f "package.json" ]; then
    if grep -q '"prettier"' package.json; then
        npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
        echo "✅ Prettier completed"
    fi
fi

echo "✅ Linting completed"
