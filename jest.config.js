const config = {
  verbose: true,
  // Let Jasmine (already existing) handle .spec.js files.
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    // "**/?(*.)+(spec|test).[tj]s?(x)",
    "**/?(*.)+(test).[tj]s?(x)",
  ]
};

module.exports = config;
