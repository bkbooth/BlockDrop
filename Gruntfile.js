/* jshint quotmark: single */
/* global module */

module.exports = function(grunt) {
    'use strict';

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Configuration paths
        blockdrop: {
            src: 'src',
            dist: 'dist'
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['<%= blockdrop.dist %>']
                }]
            },
            build: {
                files: [{
                    dot: true,
                    src: ['.tmp']
                }]
            },
            release: {
                files: [{
                    dot: true,
                    src: [
                        'audio',
                        'css',
                        'fonts',
                        'js',
                        'template',
                        'favicon.png',
                        'index.html',
                        'manifest.appcache'
                    ]
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            build: [
                'Gruntfile.js',
                '<%= blockdrop.src %>/js/*.js'
            ],
            report: [
                '<%= blockdrop.src %>/js/*.js'
            ]
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= blockdrop.dist %>/js/*.js',
                        '<%= blockdrop.dist %>/css/*.css'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= blockdrop.dist %>'
            },
            html: '<%= blockdrop.src %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= blockdrop.dist %>']
            },
            html: ['<%= blockdrop.dist %>/index.html'],
            css: ['<%= blockdrop.dist %>/css/*.css']
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= blockdrop.src %>',
                    dest: '<%= blockdrop.dist %>',
                    src: [
                        '*.{html,png}',
                        'audio/*',
                        'fonts/*',
                        'template/*'
                    ]
                }, {
                    expand: true,
                    cwd: '<%= blockdrop.src %>/components/font-awesome',
                    dest: '<%= blockdrop.dist %>',
                    src: [
                        'fonts/fontawesome*'
                    ]
                }]
            },
            release: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= blockdrop.dist %>',
                    src: ['**'],
                    dest: ''
                }]
            }
        },
        manifest: {
            generate: {
                options: {
                    basePath: '<%= blockdrop.dist %>',
                    verbose: false,
                    timestamp: true,
                    hash: true, // NOT WORKING?
                    master: ['index.html']
                },
                src: [
                    'index.html',
                    'favicon.png',
                    'audio/*',
                    'css/*',
                    'fonts/*',
                    'js/*',
                    'template/*'
                ],
                dest: '<%= blockdrop.dist %>/manifest.appcache'
            }
        },
        gitcheckout: {
            release: {
                options: {
                    branch: 'gh-pages',
                    create: false
                }
            }
        },
        gitreset: {
            release: {
                options: {
                    mode: 'hard',
                    commit: 'master'
                }
            }
        },
        gitcommit: {
            release: {
                options: {
                    message: 'Build'
                },
                files: {
                    src: ['.']
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-manifest');
    grunt.loadNpmTasks('grunt-git');

    grunt.registerTask('build', [
        'clean',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'rev',
        'usemin',
        'manifest',
        'clean:build'
    ]);

    grunt.registerTask('release', [
        'gitcheckout:release',
        'gitreset:release',
        'default',
        'clean:release',
        'copy:release',
        'clean:dist',
        'gitcommit:release'
    ]);

    // Defualt task, just run 'grunt'
    grunt.registerTask('default', [
        'jshint:build',
        'build'
    ]);

};
