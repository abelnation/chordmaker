module.exports = function(grunt) {

    grunt.registerTask('build', "Build ChordMaker Lib", function(target) {
        if (typeof target === "undefined") {
          target = "dev"
        }

        if (target === "dev") {
            grunt.task.run([
                'jshint:src',
                'jscs:src',
                'clean:devjscompiled',
                'copy:dev',
                'preprocess:dev',
                /* 'sass:dev',
                */ 'concat:dev',
                /*'uglify:dev',*/
                'test',
                'groc'
            ]);
        } else if (target === "dist") {
            grunt.task.run([
                'clean:dist',
                'jshint:src',
                'jscs:src',
                'copy:dist',
                'preprocess:dist',
                'strip:dist',
                /* 'sass:dist',*/
                'concat:dist',
                'uglify:dist',
                'clean:scrub_dist',
                'groc',
                'dev'
            ]);
        } else {
            grunt.log.error("Invalid build target.  Choices: dev, dist");
        }

    });
};
