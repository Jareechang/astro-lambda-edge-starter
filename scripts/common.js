const { exec } = require('child_process');
const fs = require('fs');

/*
 *
 * Run the build
 *
 * **/
async function runBuild() {
  return new Promise((resolve, reject) => {
    exec('pnpm build', (err, stdout, stderr) => {
      if (err) return reject(stderr);
      return resolve(stdout);
    });
  });
}

/*
 *
 * Cleans the node_modules folder
 *
 * **/
async function runCleanNodeModules() {
  return new Promise((resolve, reject) => {
    exec('pnpm clean:node_modules', (err, stdout, stderr) => {
      if (err) return reject(stderr);
      return resolve(stdout);
    });
  });
}

/*
 *
 * Cleans the dist folder
 *
 * **/
async function runInstall(env) {
  return new Promise((resolve, reject) => {
    if (env === 'prod') {
      console.log('executing prod install')
      exec('pnpm install --prod --ignore-scripts --prefer-offline', (err, stdout, stderr) => {
        if (err) return reject(stderr);
        return resolve(stdout);
      });
    }
    exec('pnpm install', (err, stdout, stderr) => {
      if (err) return reject(stderr);
      return resolve(stdout);
    });
  });
}

/*
 *
 * Append lambda code to existing zip file with dependencies
 *
 * **/
async function generateLambdaZipFile() {
  const filename = process.env.LAMBDA_ZIP_FILENAME || 'main.zip';
  console.log('Creating new zip file... ', filename);
  return new Promise((resolve, reject) => {
    exec(`zip -r ${filename} dist node_modules`, (err, stdout, stderr) => {
      console.log(err, stderr);
      if (err) {
        return reject(stderr)
      };
      if (stdout) {
        console.log(`File created. name: ${filename}`);
        return resolve(filename);
      }
    });
  });
}

/*
 *
 * Generate a  zip file of the node_module deps
 *
 * **/
async function generateDependencyZipFile() {
  const filename = process.env.LAMBDA_ZIP_FILENAME || 'main.zip';
  const hasNodeModules = fs.existsSync('node_modules');
  if (!hasNodeModules) return;
  console.log('Creating new zip file... ', filename);
  return new Promise((resolve, reject) => {
    exec(`zip -r ${filename} node_modules`, {maxBuffer: 1024 * 1000},(err, stdout, stderr) => {
      if (err) return reject(err);
      if (stdout) {
        console.log(`File created. name: ${filename}`);
        return resolve(filename);
      }
    });
  });
}

module.exports = {
  runBuild,
  runCleanNodeModules,
  runInstall,
  generateLambdaZipFile,
  generateDependencyZipFile
};
