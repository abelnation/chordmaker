module.exports = function(grunt) {

    var _ = require("underscore");

    grunt.registerTask('updatepkgconfig', function() {
        var pkg = grunt.file.readJSON('./package.json');
        grunt.config('pkg', pkg);
    });

    grunt.registerTask('release_js', "Build release version of library, and update CHANGELOG", function(release_type) {

        // TODO: (aallison) implement
        if (!release_type) {
            release_type = 'minor';
        }

        if (!_.contains(['major', 'minor', 'patch'], release_type)) {
            grunt.log.error('usage: `grunt release_js:[major|minor|patch]');
            return;
        }

        grunt.task.run([
            // create versioned copy of GGCookieUtil.js in release/ dir
            'build',
            'test',

            'shell:changelog_pre',
            'release:' + release_type,
            'shell:changelog_post',

            'updatepkgconfig',
            'build:dist', // re-build to ensure version number is correct in files
            'shell:create_versioned_file',
        ]);
    });

};
