const {
  generateLambdaZipFile,
} = require('./common');

async function main() {
  try {
    await generateLambdaZipFile();
  } catch (error) {
    console.error('create dependencies failed : ', {
      file: 'scripts/create-dependencies.js',
      error,
    });
  }
}

main();
