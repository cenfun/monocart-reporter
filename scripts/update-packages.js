#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const TARGET_OPTIONS = new Set(['latest', 'minor', 'patch']);
const SKIP_UPGRADES = new Set(['vitest']);
const PACKAGE_FILES = 'package.json package-lock.json';

function parseArgs() {
    const args = {
        log: 'update-packages.local.log'
    };
    const raw = process.argv.slice(2);
    for (let i = 0; i < raw.length; i++) {
        const arg = raw[i];
        if (arg === '--target' && raw[i + 1]) {
            args.target = raw[++i];
        } else if (arg === '--log' && raw[i + 1]) {
            args.log = raw[++i];
        } else {
            console.error(`Unknown or malformed argument: ${arg}`);
            process.exit(1);
        }
    }
    if (!args.target || !TARGET_OPTIONS.has(args.target)) {
        console.error(
            `--target is required and must be one of: ${Array.from(
                TARGET_OPTIONS
            ).join(', ')}`
        );
        process.exit(1);
    }
    return args;
}

function log(line, file, level = 'INFO') {
    const entry = `${new Date().toISOString()} - ${level} - ${line}`;
    console.log(entry);
    appendFileSync(file, `${entry}\n`);
}

function runCommand(command) {
    const result = spawnSync(command, {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf-8'
    });
    return {
        success: result.status === 0,
        output: result.stdout + result.stderr
    };
}

function requireDependency(dep, logFile) {
    const { success } = runCommand(`which ${dep}`);
    if (!success) {
        log(`${dep} is not installed. Please install it and rerun the script.`, logFile, 'ERROR');
        process.exit(1);
    }
}

function ensureDependencies(logFile) {
    for (const dep of ['node', 'jq', 'git']) {
        requireDependency(dep, logFile);
    }
}

function ensurePackageJson(logFile) {
    if (!existsSync(path.resolve('package.json'))) {
        log('package.json not found in the current directory.', logFile, 'ERROR');
        process.exit(1);
    }
}

function getUpgradeList(target, logFile) {
    const baseCommand = `npx -y npm-check-updates --target ${target} --jsonUpgraded`;
    log(`Running ${baseCommand}`, logFile, 'INFO');
    const { success, output } = runCommand(baseCommand);
    if (!success) {
        log('npx npm-check-updates failed. Exiting.', logFile, 'ERROR');
        process.exit(1);
    }
    try {
        return JSON.parse(output);
    } catch {
        log('Unable to parse ncu output as JSON.', logFile, 'ERROR');
        process.exit(1);
    }
}

function splitUpgradeList(upgradeList) {
    const skippedPackages = [];
    for (const [packageName, packageVersion] of Object.entries(upgradeList)) {
        if (SKIP_UPGRADES.has(packageName)) {
            skippedPackages.push([packageName, packageVersion]);
            delete upgradeList[packageName];
        }
    }
    return {
        packages: Object.entries(upgradeList),
        skippedPackages
    };
}

function logSkippedPackages(skippedPackages, logFile) {
    if (skippedPackages.length === 0) {
        return;
    }
    for (const [packageName, packageVersion] of skippedPackages) {
        log(`Skipped upgrading ${packageName}. Update available: ${packageVersion}`, logFile, 'WARN');
    }
}

function revertWorkingTree(logFile) {
    runCommand(`git reset HEAD ${PACKAGE_FILES}`);
    runCommand(`git checkout -- ${PACKAGE_FILES}`);
    runCommand('npm install');
    log('Working tree reverted to previous state.', logFile, 'WARN');
}

function runStep(description, command, logFile) {
    const { success, output } = runCommand(command);
    if (!success) {
        log(`${description} failed.`, logFile, 'ERROR');
        if (output) {
            log(output, logFile, 'ERROR');
        }
    }
    return success;
}

function upgradePackage(packageName, packageVersion, target, logFile, index, total) {
    log(`(${index}/${total}) Upgrading ${packageName}...`, logFile, 'INFO');

    const updateCommand = `npx npm-check-updates -u --target ${target} ${packageName}`;
    if (!runStep(`npm-check-updates for ${packageName}`, updateCommand, logFile)) {
        revertWorkingTree(logFile);
        return false;
    }

    if (!runStep('npm install', 'npm install', logFile)) {
        revertWorkingTree(logFile);
        return false;
    }

    if (!runStep('npm run test', 'npm run test', logFile)) {
        revertWorkingTree(logFile);
        return false;
    }

    if (!runStep('git add package files', `git add ${PACKAGE_FILES}`, logFile)) {
        revertWorkingTree(logFile);
        return false;
    }

    const commitCommand = `git commit -m "upgrade ${packageName} to ${packageVersion}"`;
    if (!runStep('git commit', commitCommand, logFile)) {
        revertWorkingTree(logFile);
        return false;
    }

    log(`${packageName} successfully upgraded and committed.`, logFile, 'INFO');
    return true;
}

function main() {
    const { target, log: logFile } = parseArgs();
    ensureDependencies(logFile);
    ensurePackageJson(logFile);

    const upgradeList = getUpgradeList(target, logFile);
    const { packages, skippedPackages } = splitUpgradeList(upgradeList);

    if (packages.length === 0) {
        log('No packages to upgrade.', logFile, 'INFO');
        logSkippedPackages(skippedPackages, logFile);
        return;
    }

    log(`${packages.length} packages have upgrades.`, logFile, 'INFO');
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < packages.length; i++) {
        const [packageName, packageVersion] = packages[i];
        const ok = upgradePackage(
            packageName,
            packageVersion,
            target,
            logFile,
            i + 1,
            packages.length
        );
        if (ok) {
            successful += 1;
        } else {
            failed += 1;
        }
    }

    log(`All packages processed. Successful upgrades: ${successful}, Failed upgrades: ${failed}`, logFile, 'INFO');
    logSkippedPackages(skippedPackages, logFile);
}

try {
    main();
} catch (error) {
    console.error(error);
    process.exit(1);
}
