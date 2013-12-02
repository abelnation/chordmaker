module.exports = {
  dist:  {
    files: [
      { 
        cwd: '<%= paths.src %>/',
        expand: true,  
        src: ['**/*'], 
        dest: '<%= paths.dist %>/' 
      },
    ]
  },
  dev: {
    files: [
      { 
        cwd: '<%= paths.src %>/',
        expand: true,
        src: ['**/*'], 
        dest: '<%= paths.dev %>/' 
      },
    ]
  },   
  devscss: {
    files: [
      { 
        cwd: '<%= paths.src %>/scss/',
        expand: true,
        src: ['**'], 
        dest: '<%= paths.dev %>/scss/' 
      },
    ]
  },
  devdemo: {
    files: [
      { 
        cwd: '<%= paths.src %>/demo/',
        expand: true,
        src: ['**'], 
        dest: '<%= paths.dev %>/demo/' 
      },
    ]
  },
  devjs: {
    files: [
      { 
        cwd: '<%= paths.src %>/js/',
        expand: true,
        src: ['**'], 
        dest: '<%= paths.dev %>/js/' 
      },
    ]
  },
  devtest: {
    files: [
      { 
        cwd: '<%= paths.src %>/test/',
        expand: true,
        src: ['**'], 
        dest: '<%= paths.dev %>/test/' 
      },
    ]
  },
};