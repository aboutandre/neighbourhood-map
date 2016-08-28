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
            // scp: {
            //     options: {
            //         host: 'dehamsl611.int.kn',
            //         username: 'cft',
            //         password: 'cft'
            //     },
            //     your_target: {
            //         files: [{
            //                 cwd: './showcase/',
            //                 src: '**/*',
            //                 filter: 'isFile',
            //                 // path on the server
            //                 dest: 'public_html/showcase/'
            //             }, {
            //                 cwd: './dist/',
            //                 src: '**/*',
            //                 filter: 'isFile',
            //                 // path on the server
            //                 dest: 'public_html/dist/'
            //             }, {
            //                 cwd: './css/',
            //                 src: '**/*',
            //                 // filter: 'isFile',
            //                 // path on the server
            //                 dest: 'public_html/css/'
            //             }, {
            //                 cwd: './img/',
            //                 src: '**/*',
            //                 // filter: 'isFile',
            //                 // path on the server
            //                 dest: 'public_html/img/'
            //             } //,
            //             // {
            //             //     cwd: './bower_components/',
            //             //     src: '**/*',
            //             //     filter: 'isFile',
            //             //     // path on the server
            //             //     dest: 'public_html/bower_components/'
            //             // }
            //         ]
            //     }
            // },
            // rsync: {
            //      deploy: {
            //        files: './',
            //        options: {
            //          host      : "dehamsl611.int.kn",
            //          port      : "1023",
            //          user      : "cft",
            //          remoteBase: "public_html/"
            //        }
            //      }
            //    },
            // rsync: {
            //     options: {
            //         // args: ["--verbose"],
            //         exclude: [".git*", "*.scss", "node_modules"],
            //         recursive: true
            //     },
            //     showcase: {
            //         options: {
            //             src: "./showcase/",
            //             dest: "cft@dehamsl611.int.kn:~cft/public_html/showcase/",
            //             ssh: true,
            //             recursive: true
            //         }
            //     }
            // },
            // backstop: {
            //     setup: {
            //         options: {
            //             backstop_path: './node_modules/backstopjs',
            //             test_path: './tests',
            //             setup: false,
            //             configure: true
            //         }
            //     },
            //     test: {
            //         options: {
            //             backstop_path: './node_modules/backstopjs',
            //             test_path: './tests',
            //             create_references: false,
            //             run_tests: true
            //         }
            //     },
            //     reference: {
            //         options: {
            //             backstop_path: './node_modules/backstopjs',
            //             test_path: './tests',
            //             create_references: true,
            //             run_tests: false
            //         }
            //     }
            // },
            // bless: {
            //     css: {
            //         options: {
            //             logCount: true
            //         },
            //         files: {
            //             'dist/bless/bootstrap.css': 'dist/css/bootstrap.css'
            //         }
            //     }
            // },
            // 'string-replace': {
            //     version: {
            //         files: {
            //             "<%= target %>/css/bootstrap.css": "<%= target %>/css/bootstrap.css",
            //             "<%= target %>/css/bootstrap.min.css": "<%= target %>/css/bootstrap.min.css",
            //             "<%= target %>/css/bootstrap-responsive.min.css": "<%= target %>/css/bootstrap-responsive.min.css",
            //             "<%= target %>/css/bootstrap-responsive.css": "<%= target %>/css/bootstrap-responsive.css"
            //         },
            //         options: {
            //             replacements: [{
            //                 pattern: /{{ VERSION }}/g,
            //                 replacement: '<%= pkg.version %>'
            //             }]
            //         }
            //     }
            // },
            // csscomb: {
            //     dist: {
            //         options: {
            //             config: '.csscomb.json',
            //         },
            //         expand: true,
            //         cwd: 'bootstrap/scss/cft/',
            //         src: '*.scss',
            //         dest: 'bootstrap/scss/cft/'
            //     }
            // }
        });

    grunt.loadNpmTasks('grunt-contrib-copy');
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
