module.exports = {
    collectCoverage: false,
    globals: {
        'ts-jest': {
            tsConfig: {
                sourceMap: false,
                inlineSourceMap: false,
                skipLibCheck: true
            }
        },
    },
    preset: 'ts-jest',
    maxWorkers: 1,
    testEnvironment: 'node'
};