/*
 * grunt-less-module-branding
 *
 *
 * Copyright (c) 2015 Mark Terry
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var less = require('less');

module.exports = function(grunt) {

  //Find the correct LESS file to use under the search path
  var _findLess = function(brands, base, name){
    var found = [];
    brands.every(function(brand){
      var lessPath = path.join(base, brand, 'main.less');
      if(fs.existsSync(lessPath)){
        grunt.log.debug('Found:', lessPath);
        found.push(lessPath);
        if(brand) return false;
      }
      return true;
    });
    return found;
  };

  //Search for package dependencies that match our wanted pattern
  var _searchDependencies = function(brands, searchPrefix, searchDir, beginning){
    var currentJson = path.join(beginning, 'package.json');
    var pkg = grunt.file.readJSON(currentJson, {
      encoding: 'UTF8'
    });
    //only look in our apps shared modules
    var appDependencies = Object.keys(pkg.dependencies).filter(function(dep){
      return searchPrefix.test(dep);
    });
    var importsFound = {};
    appDependencies.forEach(function(moduleName){
      var base = path.join(beginning, 'node_modules', moduleName)
      var whereToSearch = path.join(base, searchDir);
      grunt.log.debug('Searching in:', whereToSearch);
      importsFound[moduleName] = {};
      importsFound[moduleName].files = _findLess(brands, whereToSearch, moduleName);
      if(grunt.file.exists(base, 'package.json')){  //recurse
        importsFound[moduleName].deps = _searchDependencies(brands, searchPrefix, searchDir, base);
      }
    });
    return importsFound;
  };

  //convert a level of imports into LESS
  var _writeLess = function(imports, level){
    var lines = [];
    var indent = '';
    if(level) indent = Array(level + 1).join("  "); //indent the LESS to make it readable
    if(imports.deps){
      Object.keys(imports.deps).forEach(function(name){ //recurse into each of the dependencies
        lines.push(indent + "." + name + " {");
        var newImports = imports.deps[name];
        lines = lines.concat(_writeLess(newImports, (level + 1)));
        lines.push(indent + "}");
      });
    }
    if(imports.files){
      imports.files.forEach(function(file){
        lines.push(indent + "@import " + '"' + file + '";');
      });
    }
    return lines;
  }

  grunt.registerMultiTask('lessBranding', 'Process branded LESS', function(){
    var brands = [];
    var options = this.options({
      base: path.join('src', 'style'),
      searchPrefix: '^app\-module\-',
      lessOptions: {
        syncImport: true,
        //TODO customFunctions: helpers.customLessFunc,
        compress: true,
        ieCompat: true
      }
    });
    if(options.brand) brands.push(options.brand);
    brands.push('');  //run default brand too
    grunt.log.debug('Using brands: ', brands.join("\n  "));
    var searchPrefix = new RegExp(options.searchPrefix);

    var moduleImports = {};
    moduleImports.deps = _searchDependencies(brands, searchPrefix, options.base, '');
    grunt.log.debug('Adding app specific LESS');
    moduleImports.files = _findLess(brands, options.base, '');

    grunt.log.debug('All imports: ');
    grunt.log.debug(JSON.stringify(moduleImports, null, 2));

    var tempLess = _writeLess(moduleImports, 0);
    grunt.log.debug('LESS generated:');
    grunt.log.debug(tempLess.join("\n"));

    less.render(tempLess.join("\n"), options.lessOptions).then(function(output){
      var brandFile = options.brand || 'main';
      var out = path.join(options.outputPath, brandFile + '.css');
      grunt.file.write(out, output.css);
      grunt.log.writeln('File "' + out + '" created.');
    },
    function(error){
      grunt.log.error('Error: ', error);
    });

  });

};
