# src-import
source combine for gulp

# example
```
gulp.task('src-import', function () {
  gulp.src(['devFile.js'])
    .pipe(imports())
    .pipe(gulp.dest('./dest'));
});
```

devFile.js
```
imports('./test1.js');
var b = function () {
  console.log('Hello src-import');
};
```

# options

- opt.keyword

  default:`imports`

- opt.encoding
  
  default: 'utf-8'

- opt.smart

  default: `false`, Set `true` to let `var a = imports('./b');` available.
