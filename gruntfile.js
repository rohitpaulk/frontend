'use strict';
var modRewrite = require('connect-modrewrite');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    aws: (function() { try { return grunt.file.readYAML('../config/aws-s3.yml'); } catch(e) { return {}; }})(),
    watch: {
      jshint: {
        files: ['gruntfile.js', 'app/javascripts/**/*.js', 'test/**/*.js'],
//        tasks: ['jshint']
        tasks: []
      }
    },
    connect: {
      app: {
        options: {
          port: 9000,
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!(\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf|\\.txt|\\.woff|\\.otf)$ /index.html']),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      dist: {
        options: {
          keepalive: true,
          port: 9000,
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!(\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf|\\.txt|\\.woff|\\.otf)$ /index.html']),
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      app: {
        url: 'http://localhost:<%= connect.app.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
      dist_assets: ['dist/assets', 'dist/compiled'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      all: [
        'gruntfile.js',
        'app/javascripts/**/*.js',
        'test/**/*.js'
      ]
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/*.html'],
      css: ['dist/assets/**/*.css'],
      options: {
        dirs: ['dist']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: 'dist/assets'
        }]
      }
    },
    htmlmin: {
      index: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['*.html'],
          dest: 'dist'
        }]
      }
    },
    uglify: {
      options: {
        mangle: false
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'app',
            dest: 'dist',
            src: [
              'favicon.ico',
              'robots.txt',
            ]
          },
          {
            expand: true,
            dot: true,
            cwd: 'app',
            dest: 'dist/assets',
            src: [
              'fonts/**/*',
            ]
          }
        ]
      }
    },
    md5: {
      options: {
        encoding: null,
        keepBasename: false,
        keepExtension: true,
        afterEach: function(changes) {
          var hash_map = grunt.config('md5_hash') || {};
          hash_map[changes.oldPath.replace('dist/assets/','')] = changes.newPath.split('/').pop();
          hash_map['compiled/' + changes.newPath.split('/').pop()] = changes.newPath.split('/').pop();
          grunt.config('md5_hash', hash_map);
        }
      },

      binary: {
        files: {
          'dist/compiled/': ['dist/assets/**/*.{png,jpg,jpeg,gif,woff,otf}']
        }
      },

      css_js: {
        files: {
          'dist/compiled/': ['dist/assets/*.{css,js}']
        }
      }
    },
    md5_path: {
      css_js_local: {
        options: { base_url: '/compiled/' },
        src: ['dist/assets/*.css', 'dist/assets/*.js']
      },

      css_js_cdn: {
        options: { base_url: '<%= aws.base_url %>' },
        src: ['dist/assets/*.css', 'dist/assets/*.js']
      },

      html_cdn: {
        options: { base_url: '<%= aws.base_url %>' },
        src: 'dist/*.html'
      }
    },

    s3: {
      prod: {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          bucket: '<%= aws.bucket %>',
          access: 'public-read',
          headers: {
            // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
            "Cache-Control": "max-age=630720000, public",
            "Expires": new Date(Date.now() + 63072000000).toUTCString()
          }
        },
        upload: [{
          src: 'dist/compiled/*',
          dest: ''
        }]
      }
    }
  });

  grunt.registerTask('server', [
    'clean:server',
    'connect:app',
    'open:app',
    'watch'
  ]);

  grunt.registerTask('dist', [
    'open:app',
    'connect:dist'
  ]);

  grunt.registerTask('build', [
    'compile',
    'deploy'
  ]);

  grunt.registerTask('compile', [
    'clean:dist',        // start off with empty folder
    'copy',              // copy in static files like favicon.ico and robots.txt
    'imagemin',          // copy in minified version of images
    'htmlmin:index',     // copy index.html, 404.html, etc
    'useminPrepare',     // update in-memory configs for concat/cssmin/uglify based on "build blocks"
    'usemin',            // replace "build blocks" in html files with path to "compiled" version
    'concat',            // concat css/js files from usemin and angular templates
    'uglify',            // compress JS files
    'cssmin',            // compress CSS files
    'md5:binary',        // create md5-named copies of binary files (images, fonts, etc)
    'md5_path:css_js_local' // update css/js files with better paths
  ]);

  grunt.registerTask('deploy', [
    'md5_path:css_js_cdn', // update angular templates with CDN urls to md5:binary files
    'md5:css_js',          // create md5 copies of css/js in dist/compiled
    'md5_path:html_cdn',   // update root HTML with CDN'd css/js
    's3:prod',             // copy all of compiled/ up to CDN
    'clean:dist_assets'    // clean up assets now that they're all up on CDN
  ]);

  grunt.registerTask('default', ['test']);

  grunt.registerMultiTask('md5_path', 'Replace relative links with absolute CDN md5 urls', function() {
    var base_url = this.options().base_url;

    this.files.forEach(function(f) {
      f.src.forEach(function(filepath) {
        console.log("Processing", filepath);
        var contents = grunt.file.read(filepath);

        var md5_hash = grunt.config('md5_hash');
        for (var k in md5_hash) {
          var matcher = new RegExp('([\'"(])[./a-z_]*'+k+'([\'")])', 'g');
          var cdn_url = base_url + md5_hash[k];
          contents = contents.replace(matcher, '$1'+cdn_url+'$2');
        }
        grunt.file.write(filepath, contents);
      });
    });
  });
};
