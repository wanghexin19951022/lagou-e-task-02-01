#!/usr/bin/env node
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'your projetc name ?'
  }
])
.then(anwsers => {
  const tmpdir = path.join(__dirname, 'templates')
  const destDir = process.cwd()

  fs.readdir(tmpdir, (err, files) => {
    if(err) throw err
    files.forEach(file => {
      // console.log(file)
      ejs.renderFile(path.join(tmpdir, file), anwsers, (err, result) => {
        if(err) throw err
        // console.log(result)
        fs.writeFileSync(path.join(destDir, file), result)
      })
    })
  })
})