# 分析
准备：
首先public目录下的文件，我们直接拷贝到dist即可
src下的html需要压缩,使用的swig模板引擎插件，需要使用gulp-swig
scss需要转化成css，再压缩，输出 gulp-sass
js需要转化成es5的写法，压缩，输出 gulp-babel  @babel/core @babel/preset-env
字体文件(除了svg文件)不需处理直接转换、图片，压缩插件 gulp-imagemin
自动清除dist文件 del插件
我们需要一个web服务器，来在浏览器帮我们展示我们的页面 browser-sync插件，帮我们热更新代码，热更新。
安装完对应的插件
第一步：创建style，script，page，image，font，public这些任务，通过src()读取文件内容，添加转换流相关的操作，如转换，压缩，解析模板引擎等，dest('dist')输出到dist目录，然后module.exports暴漏出这些任务，方便我们通过yarn gulp 任务名的方式去执行任务；然后创建一个clean任务，用于在每次构建时，先清除之前生成的dist目录和临时目录temp
第二步：我们通过gulp提供的parallel()、series()去组合这些任务，把script、page、style这些任务parallel()组合成一个编译任务compile,我们也可以再创建一个最终构建任务build，通过series()先执行clean任务，再去执行compile任务
第三步：我们需要browserSync.create()创建一个web服务的任务，然后通过gulp中的watch监听我们本地src中js，css，html内容的变化，然后执行相应的任务，通过服务器的初始化方法init中files指定监听的目录，这个目录下的变化，引发浏览器更新，也就是watch中的内容发生变化，重新打到dist，导致dist中对应文件变化，然后dist中文件变化触发浏览器变化。当然，我们在初始化方法中也可以不用files去指定监听的目录，也可以在对应的任务上去pipe(bs.reload())去监听变化，它会以stream流的方式推到浏览器，让浏览器更新。
第四步：我们创建一个develop任务，用于我们本地开发，develop任务主要组合了编译js，css，html的compile任务以及编译后serve任务，这里得同步执行series()，因为serve需要依赖，编译后的文件
第五步：可以执行yarn gulp develop/build进行本地打包测试

优化：
1、我们用一个插件，去自动帮我们处理这些插件gulp-load-plugins
2、本地开发的代码改变需要被监听，然后去执行相应的任务（打包到dist）的更新需要watch监听本地目录
3、监听的时候
4、gulp-useref 用这个插件去把我们打包完的dist目录中，html里的js或者css引用本地node_modules的文件统一打包到dist的文件下，否则打包到线上是找不到对应node_modules下的文件的。要注意的是，我们在压缩的过程中，是要读取dist下的html，也要生成css，js文件，那么就要对这三种文件进行压缩。gulp-htmlmin(压缩html), gulp-uglify(压缩js), (压缩css)。既然是三种不同的文件，那么我们就要去判断，针对不同的文件进行不同的压缩操作，那么我们需要安装判断插件：gulp-if。
在使用useref的时候，我们不能把读取目录和输出目录都设置成dist，这样的话一边读，一边写，会导致写不进去的问题，此时，我们要创建一个临时目录temp，把我们的script、page、style这些任务从src读取完后打包到一个临时目录temp，然后clean任务中在执行时，也要清除temp目录，现在在useref任务执行时，我们只需要读取temp目录，然后最终输出到dist目录即可，像图片、字体、public那些任务最终在构建的时候直接输出到dist即可，因为这几种任务，在开发过程中很少改变。在监听任务serve中，我们去找文件时，baseurl也先从temp目录中去找
