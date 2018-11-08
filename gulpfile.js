const gulp = require('gulp')
const concat = require('gulp-concat')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const uglify = require('gulp-uglify')
const order = require('gulp-order')
const inject = require('gulp-inject')
const sass = require('gulp-sass')
const handlebars = require('gulp-compile-handlebars')
const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync')


const server = browserSync.create()

const config = {
  publicPath: '/'
}

gulp.task('serve', ['watch'], () => {
  server.init({
    server: {
      baseDir: './build/',
      routes: {
        '/node_modules': './node_modules',
        '/img': './src/img/',
        '/audio': './src/audio/',
        '/fonts': './src/fonts/',
      }
    },
  })
})

gulp.task('watch', () => {
  gulp.watch(['!src/![^_]*.hbs', 'src/**/*.hbs'], ['html'])
  gulp.watch('src/scss/**/*.scss', ['scss'])
  gulp.watch('src/js/**/*.js', ['scripts'])
  gulp.watch('src/img/**/*', ['img'])
  gulp.watch('src/audio/**/*', ['audio'])
})

gulp.task('html', () => {
  return gulp.src(['./src/*.hbs', '!src/_*.hbs'])
    .pipe(handlebars({}, {
      ignorePartials: false,
      batch: ['src/html']
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('./build/'))
    .pipe(server.stream())
})

gulp.task('html:production', () => gulp.src(['./*.html'])
  .pipe(replace('img/', config.publicPath))
  .pipe(gulp.dest('./build/'))
)

gulp.task('scripts', () => gulp.src('src/js/**/*.js')
  .pipe(order([
    'js/*.js'
  ], { base: './src' }))
  // .pipe(rename('bundle.js'))
  .pipe(gulp.dest('./build/js'))
  .pipe(server.stream())
)

gulp.task('scss', () => gulp.src(['src/scss/main.scss','src/scss/bootstrap.min.css'])
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions', 'Edge >= 12', 'iOS >= 9'],
    cascade: false
  }))
  .pipe(cleanCSS())
  // .pipe(rename('bundle.css'))
  .pipe(gulp.dest('./build/css'))
  .pipe(server.stream())
)

gulp.task('scss:production', () => gulp.src('./css/*.css')
  .pipe(replace('../img/', config.publicPath))
  .pipe(gulp.dest('./build/css'))
)

gulp.task('img', () => gulp.src(['src/img/**/*.{png,jpg,gif,svg}'])
  .pipe(gulp.dest('./build/img/'))
  .pipe(server.stream())
)

gulp.task('audio', () => gulp.src(['src/audio/**/*.*'])
  .pipe(gulp.dest('./build/audio/'))
  .pipe(server.stream())
)

gulp.task('fonts', () => gulp.src(['src/fonts/**/*.*'])
  .pipe(gulp.dest('./build/fonts/'))
  .pipe(server.stream())
)

gulp.task('default', ['build'], () => gulp.start('serve'))
gulp.task('build', ['scripts', 'scss', 'html', 'img', 'audio', 'fonts'])
gulp.task('build:production', ['scss:production', 'html:production'])
