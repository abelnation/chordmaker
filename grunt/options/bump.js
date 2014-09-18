module.exports = function(grunt) {
  return {
    options: {
      files: ['package.json'],
      updateConfigs: ['pkg'],
      commit: false,

      // commitMessage: 'Release v%VERSION%',
      // commitFiles: ['package.json'], // '-a' for all files
      createTag: false,
      //tagName: 'v%VERSION%',
      //tagMessage: 'Version %VERSION%',
      push: false,
      pushTo: 'origin',
      //gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
    }
  };
};
