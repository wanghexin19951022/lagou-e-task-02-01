const Generator = require('yeoman-generator')
module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'please input your project name',
        default: this.appname
      }
    ]).then(result => {
      this.result = result
    })
  }
  writing() {
    const templates = [
      'config/dev.env.js',
      'config/index.js',
      'config/prod.env.js',
      'src/assets/logo.png',
      'src/components/FooterGuide.vue',
      'src/components/HelloWorld.vue',
      'src/router/index.js',
      'src/App.vue',
      'src/main.js',
      'static/css/reset.css',
      'static/.gitkeep',
      '.babelrc',
      '.editorconfig',
      '.gitignore',
      '.postcssrc.js',
      'index.html',
      'package-lock.json',
      'package.json',
      'README.md'
    ]
    templates.forEach(item => {
      // 为每个模板在目标目录生成对应的文件
      this.fs.copyTpl(
        this.templatePath(item),
        this.destinationPath(item),
        this.result
      )
    })
  }
}