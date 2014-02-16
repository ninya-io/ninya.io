module.exports = function (grunt) {

  grunt.initConfig({

    paths: {
      src: 'client/src/',
      scss: 'client/src/assets/scss/',
      stylesheets: 'client/src/assets/stylesheets/'
    },

    watch: {
      sass: {
        files: ['<%= paths.scss %>**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      }
    },

    sass: {
      dev: {
        options: {
          style: 'compressed',
          compass: true,
          precision: 6
        },
        files: {
          '<%= paths.stylesheets %>application.css': ['<%= paths.scss %>application.scss']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

};