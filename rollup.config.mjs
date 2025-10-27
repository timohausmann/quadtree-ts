import pkg from './package.json' with { type: 'json' };
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import banner2 from 'rollup-plugin-banner2';
import copy from 'rollup-plugin-copy';

export default [
    // browser-friendly UMD build (all)
    {
        input: 'src/index.umd.all.ts',
        output: {
            name: 'Quadtree',
            file: pkg.browser,
            format: 'umd',
            exports: 'default',
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // so Rollup can convert TypeScript to JavaScript
            terser(), // minify,
            banner2(() => `/* ${pkg.repository.url} v${pkg.version} */\n`),
        ],
    },
    // browser-friendly UMD build (basic)
    {
        input: 'src/index.umd.basic.ts',
        output: {
            name: 'Quadtree',
            file: pkg.browser.replace('.umd.full.', '.umd.basic.'),
            format: 'umd',
            exports: 'default',
        },
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // so Rollup can convert TypeScript to JavaScript
            terser(), // minify,
            banner2(() => `/* ${pkg.repository.url} v${pkg.version} */\n`),
            // copy the full version deferred
            copy({
                targets: [{ src: pkg.browser, dest: 'docs/examples/assets/' }],
            }),
        ],
    },

    // CommonJS (for Node) and ES module (for bundlers) build
    {
        input: 'src/index.esm.ts',
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // so Rollup can convert TypeScript to JavaScript
        ],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ],
    },
];
