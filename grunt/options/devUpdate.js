module.exports = function(grunt) {
  return {
    main: {
      options: {
        // task options go here
        updateType: 'fail', // just report outdated packages
        // updateType: 'report', // just report outdated packages
        reportUpdated: false, // don't report up-to-date packages
        semver: true, // stay within semver when updating
        packages: {
          devDependencies: true, //only check for devDependencies
          dependencies: true
        },
        packageJson: null, // use matchdep default findup to locate package.json
        reportOnlyPkgs: [] // use updateType action on all packages
      }
    }
  };
};
