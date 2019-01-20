module.exports = function(grunt) {
    require('time-grunt')(grunt);
    grunt
        .initConfig({
            pkg: grunt.file.readJSON('package.json'),

            scssFolder: 'scss',

            devStyles: 'dist/css',

            banner: '/*!\n * Created (<%= grunt.template.today("yyyy-mmm-dd, dddd") %>) - <%= pkg.name %> */',

            bannerdev: '/*!\n * <%= pkg.name %> (<%= grunt.template.today("dddd, d mmm, yyyy - HH:MM:ss") %>) */',

            bootstrapBanner: '/*!\n * Bootstrap v4.0 (http://getbootstrap.com)\n * Copyright 2011-2016 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n*/\n',

            target: 'dist',

            bumpup: 'package.json',

            compass: { // Task
                // dist: { // Target
                //     options: { // Target options
                //         sassDir: '<%= scssFolder =%>',
                //         cssDir: 'showcase/css',
                //         environment: 'production'
                //     }
                // },
                dev: {
                    options: { // Target options
                        environment: 'development',
                        sassDir: '<%= scssFolder %>',
                        cssDir: '<%= devStyles %>', //The generated CSS files are in the showcase/css dir
                        // outputStyle: 'expanded',
                        sourcemap: true,
                        banner: '<%= bannerdev %>',
                        // },

                        specify: '<%= scssFolder %>/bootstrap.scss'

                    }
                },


                production: {
                    options: { // Target options
                        environment: 'production',
                        sassDir: '<%= scssFolder %>',
                        cssDir: '<%= target %>/css',
                        outputStyle: 'compressed',
                        sourcemap: false

                    }
                }
            },
            copy: {
                main: {
                    files: [{
                        expand: true,
                        src: 'js/**',
                        dest: '<%= target %>/'
                    }, {
                        expand: true,
                        src: 'fonts/**',
                        dest: '<%= target %>/'
                    }, {
                        expand: true,
                        src: 'img/**',
                        dest: '<%= target %>/'
                    }]
                }
            },
            notify: {
                validation: {
                    options: {
                        title: 'Task Complete', // optional
                        message: 'All files are valid html5' //required
                    }
                },
                watch: {
                    options: {
                        title: 'Task Complete', // optional
                        message: 'SASS and Uglify finished running' //required
                    }
                }
            },

            watch: {
                scss: {
                    files: '<%= scssFolder %>/**/*',
                    tasks: ['compass:dev']
                },
                img: {
                    files: 'img/**/*',
                    tasks: ['copy'],
                    options: {
                        livereload: true
                    }
                },
                showcase: {
                    files: ['*.html'],
                    tasks: [], //'valid','bootvalid'
                    options: {
                        livereload: true
                    }
                },
                // css : {
                // 	files : [ 'dist/css/bootstrap.css', 'showcase/css/bootswatch.css' ],
                // 	options : {
                // 		livereload : true
                // 	}
                // },
                livereload: {
                    // live reload on css changes injects css w/o browser
                    // reload
                    files: ['dist/css/bootstrap.css', 'css/bootstrap.css', 'showcase/css/*.css'],
                    options: {
                        livereload: true
                    }
                }
            },

            connect: {
                server: {
                    options: {
                        base: '.',
                        livereload: true,
                        middleware: function(connect, options, middlewares) {
                            middlewares
                                .unshift(function(req, res, next) {
                                    res
                                        .setHeader(
                                            'Access-Control-Allow-Origin',
                                            '*');
                                    res
                                        .setHeader(
                                            'Access-Control-Allow-Methods',
                                            '*');
                                    next();
                                });
                            return middlewares;
                        },
                        hostname: 'localhost',
                        open: {
                            target: 'http://localhost:8000/'
                        }
                    }
                }
            },
        
        });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    // grunt.loadNpmTasks('grunt-csscomb');
    grunt.registerTask('valid', ['newer:validation:files']);
    grunt.registerTask('bootvalid', ['newer:bootlint:files']);
    grunt.registerTask('dist', ['uglify', 'string-replace', 'copy']);
    grunt.registerTask('default', ['compass:dev', 'copy', 'connect', 'watch', 'notify']);
    grunt.registerTask('publish', ['dist', 'rsync:showcase', 'notify']);
    grunt.registerTask('build', ['dist']);
    grunt.registerTask('ghostlab', ['dist', 'watch', 'notify']);
    grunt.registerTask('bsref', ['connect', 'backstop:reference', 'notify']);
    grunt.registerTask('bstest', ['connect', 'backstop:test', 'notify']);
    grunt.registerTask('webstorm', ['compass:dev', 'watch', 'notify']);
    grunt.registerTask('release', ['uglify', 'less:production', 'less:minified', 'less:swatch', 'string-replace', 'copy']);
    grunt.registerTask('dco', ['compass:dev', 'string-replace', 'copy', 'connect', 'watch', 'notify']);

};
