const { generateLambdaZipFile } = require('./common');
const esbuild = require('esbuild');

let importPathPlugin = {
  name: 'import-path',
  setup(build) {
    build.onResolve({ filter: /^\.\/ssr/ }, args => {
      return { path: args.path, external: true }
    })
  },
}

/*
 *
 * Run the build process
 *
 * **/
async function runBuild() {
  return new Promise((resolve, reject) => {
    esbuild.build({
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.mjs',
      external: ['react', 'react-dom', 'serverless-http', 'express'],
      format: 'esm',
      platform: 'node',
      packages: 'external',
      //mainFields: ['module', 'main'],
      target: ['node14.0.0'],
      bundle: true,
      plugins: [importPathPlugin],
    })
    .then(resolve)
    .catch(reject)
  });
}

async function main() {
  try {
    await runBuild();
    await generateLambdaZipFile();
  } catch (error) {
    console.error('build error: ', {
      file: 'scripts/build.js',
      error,
    })
  }
}

main();
