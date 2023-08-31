import 'dotenv/config';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import { sassPlugin } from 'esbuild-sass-plugin';
import sveltePreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules';
import copyNewer from 'copy-newer';
import mergeFiles from 'merge-files';
import fs from 'fs/promises';

const BANNER =
`/*
- THIS IS A GENERATED/BUNDLED FILE BY ESBUILD -
Please visit the repository linked to view the source code:
https://github.com/noatpad/obsidian-banners
*/`;
const prod = (process.argv[2] === 'prod');
const outdir = 'dist';

const obsimove: esbuild.Plugin = {
  name: 'obsimove',
  setup(build) {
    build.onEnd(async () => {
			// Merge Svelte stylesheets and styles.scss
			await mergeFiles([`${outdir}/styles.css`, `${outdir}/main.css`], `${outdir}/merged.css`);
			await fs.rename(`${outdir}/merged.css`, `${outdir}/styles.css`);
			await fs.rm(`${outdir}/main.css`, { force: true });
			await fs.rm(`${outdir}/merged.css`, { force: true });
      // Move static files to output folder
      await fs.copyFile('manifest.json', `${outdir}/manifest.json`);
      await fs.writeFile(`${outdir}/.hotreload`, '');
      // Copy to dev vault if needed
      if (!prod && process.env.DEVDIR) {
        copyNewer('{.*,**}', process.env.DEVDIR, { cwd: outdir });
      }
    })
  },
}

const context = await esbuild.context({
	banner: { js: BANNER },
	entryPoints: ['src/main.ts', 'src/styles.scss'],
	bundle: true,
  plugins: [
    esbuildSvelte({
      compilerOptions: { css: 'external' },
      preprocess: sveltePreprocess()
    }),
		sassPlugin(),
    obsimove
  ],
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins
  ],
	format: 'cjs',
	target: 'es2020',
	treeShaking: true,
  minify: prod,
	sourcemap: prod ? false : 'inline',
  color: true,
	outdir,
  logLevel: 'info'
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}