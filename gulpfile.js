/* eslint-disable no-shadow */
import gulp from 'gulp';
import chalk from 'chalk';
import * as fs from 'fs-extra-plus';
import path from 'path';
import { execa } from 'execa';
import semver from 'semver';
import argv from './tools/args-parser.js';
import esBuild from './esbuild.config.js';

/* ------------------------------------------ */
/*  Configuration                             */
/* ------------------------------------------ */

const production = process.env.NODE_ENV === 'production';
const repoName = path.basename(path.resolve('.'));
const sourceDirectory = './src';
const distDirectory = './dist';
const templateExt = 'hbs';
const staticFiles = ['lib', 'lang', 'assets', 'fonts', 'scripts', 'module.json', 'LICENSE'];
const getDownloadURL = version =>
  `https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt/releases/download/v${version}/yze-combat_v${version}.zip`;
const packageJson = JSON.parse(fs.readFileSync('package.json'));

const stdio = 'inherit';

/* ------------------------------------------ */
/*  Build                                     */
/* ------------------------------------------ */

/**
 * Builds the distributable JavaScript code.
 * @async
 */
async function buildSource({ watch } = {}) {
  await esBuild({ production, watch });
}

/* ------------------------------------------ */

/**
 * Copies other source files.
 * @async
 */
async function pipeTemplates() {
  const templateFiles = await fs.glob([`${sourceDirectory}/**/*.${templateExt}`]);
  if (templateFiles && templateFiles.length > 0) {
    for (const file of templateFiles) {
      await fs.copy(
        file,
        `${distDirectory}/templates/${file.replace(`${sourceDirectory}/`, '').replace('templates/', '')}`,
      );
    }
  }
}

/* ------------------------------------------ */

/**
 * Copies other source files.
 * @async
 */
async function pipeStatics() {
  for (const file of staticFiles) {
    if (fs.existsSync(`static/${file}`)) {
      await fs.copy(`static/${file}`, `${distDirectory}/${file}`);
    }
  }
}

/* ------------------------------------------ */

/**
 * Watches for changes for each build step.
 */
function buildWatch() {
  buildSource({ watch: true });
  gulp.watch(`${sourceDirectory}/**/*.${templateExt}`, { ignoreInitial: false }, pipeTemplates);
  gulp.watch(
    staticFiles.map(file => `static/${file}`),
    { ignoreInitial: false },
    pipeStatics,
  );
}

/* ------------------------------------------ */
/*  Clean                                     */
/* ------------------------------------------ */

/**
 * Removes built files from `dist` folder while ignoring source files.
 * @async
 */
async function cleanDist() {
  if (fs.existsSync('./dist')) await fs.remove('./dist');
}

/* ------------------------------------------ */
/*  Link                                      */
/* ------------------------------------------ */

/**
 * Gets the data path of Foundry VTT based on what is configured in `foundryconfig.json`.
 * @returns {string} data path
 * @throws {Error} When user data path invalid (no data directory found)
 * @throws {Error} When no user data path defined in `foundryconfig.json`
 */
function getDataPath() {
  const config = JSON.parse(fs.readFileSync('foundryconfig.json'));

  if (config?.dataPath) {
    if (!fs.existsSync(path.resolve(config.dataPath))) {
      throw new Error('User Data path invalid, no Data directory found');
    }

    return path.resolve(config.dataPath);
  }
  else {
    throw new Error('No User Data path defined in foundryconfig.json');
  }
}

/* ------------------------------------------ */

/**
 * Links build to User Data folder.
 * @throws {Error} When could not find the `module.json`
 * @async
 */
async function linkUserData() {
  let destinationDirectory;
  if (fs.existsSync(path.resolve('static/module.json'))) {
    destinationDirectory = 'modules';
  }
  else {
    throw new Error(`Could not find ${chalk.blueBright('module.json')}`);
  }

  const linkDirectory = path.resolve(getDataPath(), destinationDirectory, repoName);

  if (argv.clean || argv.c) {
    console.log(chalk.yellow(`Removing build in ${chalk.blueBright(linkDirectory)}.`));

    await fs.remove(linkDirectory);
  }
  else if (!fs.existsSync(linkDirectory)) {
    console.log(chalk.green(`Linking dist to ${chalk.blueBright(linkDirectory)}.`));
    await fs.ensureDir(path.resolve(linkDirectory, '..'));
    await fs.symlink(path.resolve(distDirectory), linkDirectory);
  }
}

/* ------------------------------------------ */
/*  Versioning                                */
/* ------------------------------------------ */

/**
 * Gets the contents of the manifest file as object.
 * @returns {object}
 */
function getManifest() {
  const manifestPath = 'static/module.json';

  if (fs.existsSync(manifestPath)) {
    return {
      file: JSON.parse(fs.readFileSync(manifestPath)),
      name: 'module.json',
    };
  }
}

/* ------------------------------------------ */

/**
 * Gets the target version based on on the current version and the argument passed as release.
 * @param {string} currentVersion The current version
 * @param {string} release        The release type,
 *    any of `['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease']`
 * @returns {string} The target version
 */
function getTargetVersion(currentVersion, release) {
  if (['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].includes(release)) {
    return semver.inc(currentVersion, release);
  }
  else {
    return semver.valid(release);
  }
}

/* ------------------------------------------ */

/**
 * Makes a changelog.
 * @async
 */
async function changelog() {
  await execa('npx', ['standard-version', '--skip.bump', '--skip.tag', '--skip.commit'], { stdio });
}

/**
 * Commits and pushes release to Github Upstream.
 * @async
 */
async function commitTagPush() {
  const { version } = packageJson;
  const commitMsg = `chore(release): Release ${version}`;
  await execa('git', ['add', '-A'], { stdio });
  await execa('git', ['commit', '--message', commitMsg], { stdio });
  await execa('git', ['tag', `v${version}`], { stdio });
  await execa('git', ['push', 'upstream'], { stdio });
  await execa('git', ['push', 'upstream', '--tag'], { stdio });
}

/* ------------------------------------------ */

/**
 * Updates version and download URL.
 * @param {function} cb Callback function
 * @throws {Error} When manifest JSON not found
 * @throws {Error} When missing release type
 * @throws {Error} When incorrect version arguments
 * @throws {Error} When target version is identical to current version
 * @async
 */
async function bumpVersion(cb) {
  const manifest = getManifest();

  if (!manifest) cb(Error(chalk.red('Manifest JSON not found')));

  try {
    const release = argv.release || argv.r;

    const currentVersion = packageJson.version;

    if (!release) {
      return cb(Error('Missing release type'));
    }

    const targetVersion = getTargetVersion(currentVersion, release);

    if (!targetVersion) {
      return cb(new Error(chalk.red('Error: Incorrect version arguments')));
    }

    if (targetVersion === currentVersion) {
      return cb(new Error(chalk.red('Error: Target version is identical to current version')));
    }

    console.log(`Updating version number to '${targetVersion}'`);

    packageJson.version = targetVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, '  '));

    manifest.file.version = targetVersion;
    manifest.file.download = getDownloadURL(targetVersion);
    fs.writeFileSync(`static/${manifest.name}`, JSON.stringify(manifest.file, null, '  '));

    return cb();
  }
  catch (err) {
    cb(err);
  }
}

/* ------------------------------------------ */
/*  Scripts                                   */
/* ------------------------------------------ */

const execBuild = gulp.parallel(buildSource, pipeTemplates, pipeStatics);

export const clean = cleanDist;
export const link = linkUserData;
export const build = gulp.series(clean, execBuild);
export const watch = gulp.series(buildWatch);
export const bump = gulp.series(bumpVersion, changelog, clean, execBuild);
export const release = commitTagPush;
