# Auto-Deploying Vite to GitHub Pages using Actions

## Subnetting example:
https://vincepr.github.io/vite-subnetting/


## Create the workflow
- create a new file: `.github/workflows/deploy.yml`

```yml
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install dependencies
        uses: bahmutov/npm-install@v1

      - name: Build project
        run: npm run build

      - name: Upload production-ready build files
        uses: actions/upload-artifact@v3
        with:
          name: production-files
          path: ./dist

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/master'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: production-files
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
- It will only work with the main repo named "master" like this. (main wont work for example)


## give actions write permissions:

- go to Actions Settings and select `Read and write permissions and tick` 
- and `Allow gitHub Actions to create and approve pull requests`.


## commit and push to your repo

```terminal
git add .
git commit -m "add auto deploy workflows"
git push
```

## Enable Github-pages

- go to the Pages-Settings of your repo and select the gh-pages branch and save.

## Fix subdirectory "routing" of the url

Since Github-Pages uses a subdirectory startpoint we have to adjust those settings in the vite.config.js / vite.config.ts 

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/vite-subnetting/',          //add your repo-name here
})

```