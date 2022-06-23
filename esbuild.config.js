import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import templatePaths from './tools/get-template-paths.js';

export default ({ watch = false, production = false } = {}) =>
  build({
    bundle: true,
    entryPoints: ['./src/yze-combat.js', './src/yze-combat.scss'],
    outdir: 'dist',
    format: 'esm',
    logLevel: 'info',
    sourcemap: !production ? 'inline' : false,
    ignoreAnnotations: !production,
    minifyWhitespace: true,
    minifySyntax: true,
    drop: production ? ['console', 'debugger'] : [],
    watch,
    define: {
      PATHS: JSON.stringify(templatePaths),
    },
    plugins: [
      sassPlugin({
        logger: {
          warn: () => '',
        },
      }),
      {
        name: 'external-files',
        setup(inBuild) {
          inBuild.onResolve({ filter: /(\.\/assets|\.\/fonts|\/systems)/ }, () => {
            return { external: true };
          });
        },
      },
    ],
  });
