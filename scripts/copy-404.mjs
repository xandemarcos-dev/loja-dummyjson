// Fallback de SPA para o GitHub Pages: qualquer URL inexistente devolve o 404.html,
// que é uma cópia do index.html. O React Router então lê a URL e renderiza a rota certa,
// fazendo links diretos e F5 em /produtos/10 funcionarem.
import { copyFileSync } from 'node:fs';
copyFileSync('dist/index.html', 'dist/404.html');
console.log('404.html gerado a partir de index.html');
