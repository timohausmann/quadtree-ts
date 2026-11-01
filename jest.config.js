/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
            // Library tsconfig loads @types/node only. Tests use test/tsconfig.json,
            // which adds @types/jest on top of those Node types.
            tsconfig: '<rootDir>/test/tsconfig.json',
        },
    },
};
