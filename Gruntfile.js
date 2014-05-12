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
      options: {
        //compass: true,
        precision: 6
      },
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= paths.stylesheets %>application.css': ['<%= paths.scss %>application.scss']
        }
      },
      dist: {
        options: {
          style: 'compressed'
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
