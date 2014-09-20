module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('./package.json');
    var variants;

    var result = {
        options: {
            stdout: true,
            stderr: true,
            // stdin:  true,
        },
        env: {
            // Sets shell env var so other shell scripts can access them
            command: "export NODE_ENV=<%= grunt.task.current.args[0] %>",
        },

        // Deploy Targets
        gittag: {
            command: [
                'git tag v<%= pkg.version %>.<%= grunt.task.current.args[0] %>',
                'git push origin v<%= pkg.version %>.<%= grunt.task.current.args[0] %>'
            ].join("&&")
        },

        changelog_pre: {
            command: [
                'touch tmpnotes.txt',
                'git describe --abbrev=0 --tags > PREV_VERSION',
                'cat PREV_VERSION',
            ].join('&&')
        },

        changelog_post: {
            command: [
                'PREV_VERSION=`cat PREV_VERSION`',
                'NEW_VERSION=`git describe --abbrev=0 --tags`',

                'echo $PREV_VERSION ... $NEW_VERSION',

                'echo "## $NEW_VERSION (`date \"+%Y-%m-%d\"`)" >> tmpnotes.txt',
                'echo "" >> tmpnotes.txt',
                'git log --reverse --date=short --format=format:"  - %s" $PREV_VERSION...$NEW_VERSION >> tmpnotes.txt',
                'echo "" >> tmpnotes.txt',
                'echo "" >> tmpnotes.txt',

                'cat CHANGELOG.md >> tmpnotes.txt',
                'mv tmpnotes.txt CHANGELOG.md',
                'git add docs',
                'git add CHANGELOG.md',
                'git commit -m "CHANGELOG updated for v`git describe --abbrev=0 --tags` release"',
                'rm PREV_VERSION',
            ].join('&&')
        },

        create_versioned_file: {
            command: [
                'cp <%= paths.build %>/dist/js/<%= pkg.name %>.js ./release/<%= pkg.name %>.<%= pkg.version %>.js',
                // TODO: (aallison) minified version
                // 'cp GGCookieUtil-min.js ./release/GGCookieUtil-min.`git describe --abbrev=0 --tags`.js',
                'git add ./release/<%= pkg.name %>.<%= pkg.version %>.js',
                // TODO: (aallison) minified version
                // 'git add ./release/GGCookieUtil-min.`git describe --abbrev=0 --tags`.js',
                'git commit -m "Adding v`git describe --abbrev=0 --tags` release files"',
                'git push'
            ].join('&&')
        }
    };
    return result;
};
