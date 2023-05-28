// Helpers for logging

import chalk from 'chalk'

export const logWarn = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.hex("#FFA500")(...args));
};

export const logSuccess = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.green(...args));
};

export const logInfo = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.yellow(...args));
};

export const logError = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.red(...args));
};

export const logTrace = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.grey(...args));
};

export const logDebug = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.magenta(...args));
};

export const logFatal = (...args: any[]): void => {
    console.log(`[${new Date().toISOString()}]`, chalk.redBright(...args));
};