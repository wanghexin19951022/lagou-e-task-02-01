// 实现这个项目的构建任务
const { src, dest, series, parallel, watch } = require('gulp')
// const sass = require('gulp-sass') // sass转化成css
const sass = require('gulp-sass')(require('sass'))
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins() // 这个plugins是个对象，所有的插件都会成为这个对象的一个属性，也就是把gulp-删除掉，如果出现glup-xx-zz会把后面转成.xxZz这个格式
const del = require('del')
const browserSync = require('browser-sync')
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')
// const cleanCss = require('gulp-clean-css')
// const rename = require('gulp-rename')

const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src'})
    .pipe(sass({ outputStyle:'expanded' }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true})) // reload方法把文件以流的方式推到浏览器，更新浏览器，这种写法更常见。这样的话和下面serve里的files功能是一样的，二者取一即可
}
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src'})
    .pipe(plugins.babel({
      presets:['@babel/preset-env']
    }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true}))
}
const page = () => {
  return src('src/*.html')
    .pipe(plugins.swig({
      defaults: {cache: false}
    }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true}))
}
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
const extra = () => { // 这个任务是处理public目录的，虽然也可以并行处理，但是我们还是单独出来
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}
const clean = () => { // del()返回的是一个promise，它执行完可以标记这个clean任务执行完成
  return del(['dist', 'temp'])
}
const bs = browserSync.create()// 自动创建一个开发服务器

const serve = () => {
  // 监听下面这些任务，目录下文件内容有变化就立即执行，执行完就会编译到dist，dist监听到变化，就会同步到浏览器
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // 图片，字体文件，public目录下的东西，在开发阶段，没有必要去监听，否则会有额外的开销
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)

  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)
  // 如果上面这三文件也变化了，那么可以用bs.reload，监听变化，重新请求浏览器

  bs.init({
    notify: false, // 关闭打开浏览器右上角的提示
    port: 2080, // 指定端口号
    // open: false, // 浏览器自动打开，false取消
    // files: 'dist/**', // 指定路径下的哪些文件变化时，浏览器更新
    server: {
      // baseDir: 'dist', //网页根目录，dist是加工后代码
      // baseDir: ['dist', 'src', 'public'], // 这里指定成数组的话，会先从第一个目录开始找，找不到再往后面找;开发阶段一个请求过来，先从dist找，图片，字体文件，public这些从本地目录找也可以
      baseDir: ['temp', 'src', 'public'], // 这里指定成数组的话，会先从第一个目录开始找，找不到再往后面找;开发阶段一个请求过来，先从temp找，图片，字体文件，public这些从本地目录找也可以
      routes: { // 先走routes，走完routes再走baseDir
        '/node_modules': 'node_modules' // 这个是相对路径，相对我们根目录下的node_modules
      }
    }
  })
}

const useref = () => {
  // return src('dist/*.html',{ base: 'dist'})
  return src('temp/*.html',{ base: 'temp'})
    .pipe(plugins.useref({
      searchPath: ['temp', '.'] // 类似于这种数组的形式，我们把用的更多的目录放前面
    }))
    .pipe(plugins.if(/\.js$/, plugins.uglify())) // 判断js，对其进行压缩
    .pipe(plugins.if(/\.css$/, plugins.cleanCss())) // 判断css，对其进行压缩
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    }))) // 判断html，对其进行压缩
    .pipe(dest('dist'))
  }
// const compile = parallel(style, script, page, image, font)
const compile = parallel(style, script, page) // 优化：这里就没必要去转化img，font这些了，等build的时候转换一次就可以了

// const build = series(clean, parallel(compile, extra, image, font)) // 上线之前执行的任务
const build = series(clean, parallel(series(compile, useref), extra, image, font)) // useref要在打完包之后去处理

const develop = series(compile, serve) // compile执行完，html、js、css就已经转换过去了，然后启动serve


module.exports = {
  compile,
  build,
  develop
}
