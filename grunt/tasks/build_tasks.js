module.exports = function(grunt) {

    grunt.registerTask('build', "Build ChordMaker Lib", function(target) {
        if (typeof target === "undefined") {
          target = "dev";
        }

        grunt.task.run([
          'todos',
          'devUpdate',
        ]);

        if (target === "dev") {
            grunt.task.run([
                'jshint:src',
                'jscs:src',
                'clean:devjscompiled',
                'copy:dev',
                'preprocess:dev',
                /* 'sass:dev',*/

                'concat:dev',
                'indent:dev',
                'wrap:dev',

                /*'uglify:dev',*/
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
                'indent:dist',
                'wrap:dist',

                'uglify:dist',
                // 'clean:scrub_dist',

                'groc',
            ]);
        } else {
            grunt.log.error("Invalid build target.  Choices: dev, dist");
        }

    });
};
