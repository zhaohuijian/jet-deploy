/**
 * Copyright (c) 2020, chanjet-fe, https://github.com/chanjet-fe.
 * Jet-Deploy应用文件远端部署工具
 */
'use strict';

const program = require('commander');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const boxen = require('boxen');
const merge = require('lodash.merge')
const through2 = require('through2')
const Client = require('ssh2').Client
const vfs = require('vinyl-fs')
const inquirer = require('inquirer')
const isWin = /^win/.test(process.platform)

program
  .version(require(path.join(__dirname, 'package.json')).version)
  .option('-h --host [ip]', '服务器地址', '')
  .option('-p --port [number]', '服务器端口', 0)
  .option('-u --user [string]', '服务器用户名', '')
  .option('-P --password [string]', '服务器密码', '')
  .option('-r --remotePath [string]', '服务器目标路径', '')
  .option('-i --includeHtml [string]', '是否包含 html 文件', true)
  .parse(process.argv);

const deployConfig = {
  host: program.host, // ssh服务器地址
  port: program.port, // ssh服务器端口号,默认是22
  user: program.user, // ssh服务器登录用户名
  password: program.password, // ssh服务器登录密码
  remotePath: program.remotePath, // 上传到ssh服务器的目录
  includeHtml: program.includeHtml === 'false' ? false : true // 是否包含 html 文件
}

const uploader = (sftp, deployConfig) => {

  return through2.obj(function (file, enc, cb) {

    const stats = fs.statSync(file.path)

    let writeStreamPath = path.join(deployConfig.remotePath, file.relative)
    if (isWin) {
      writeStreamPath = writeStreamPath.replace(/\\/g, '/')
    }

    if (stats.isDirectory() && (stats.isDirectory() !== '.' || stats.isDirectory() !== '..')) {
      sftp.mkdir(writeStreamPath, {
        mode: '0755'
      }, function (err) {
        if (!err) {
          console.log(chalk.yellow(`创建目录：${file.relative}`))
        }
        cb()
      })
    } else {
      let readStream = fs.createReadStream(file.path)
      let writeStream = sftp.createWriteStream(writeStreamPath)

      writeStream.on('close', function () {
        console.log(chalk.green(`成功上传：${file.relative}`))
        cb()
      })

      readStream.pipe(writeStream)
    }
  })
}

function vfsStart(sftp, deployConfig, uploadFiles) {
  return new Promise((resolve, reject) => {
    vfs.src(uploadFiles)
      .pipe(uploader(sftp, deployConfig))
      .on('data', function (data) {
        // console.log(data)
      })
      .on('error', function (err) {
        console.log(orr)
        reject()
      })
      .on('end', function () {
        resolve()
      })
  })
}

function sftpUpload(uploadFiles) {
  inquirer.prompt([{
    type: 'input',
    name: 'host',
    message: '请填写服务器IP地址：',
    when: deployConfig.host === ''
  }, {
    type: 'input',
    name: 'port',
    message: '请填写服务器端口号：',
    default: '22',
    when: deployConfig.port === 0
  }, {
    type: 'input',
    name: 'user',
    message: '请填写服务器用户名：',
    when: deployConfig.user === ''
  }, {
    type: 'password',
    name: 'password',
    message: '请填写服务器密码：',
    when: deployConfig.password === ''
  }, {
    type: 'input',
    name: 'remotePath',
    message: '请填写服务器目标路径：',
    default: '',
    when: deployConfig.remotePath === ''
  }])
    .then(answers => {
      merge(deployConfig, answers)
      const connSettings = {
        host: deployConfig.host,
        port: deployConfig.port,
        username: deployConfig.user,
        password: deployConfig.password
      }

      const conn = new Client()

      conn.on('authentication', function (ctx) {
        console.log(ctx)
      }).on('ready', function () {
        conn.sftp(function (err, sftp) {
          if (!err) {
            sftp.stat(deployConfig.remotePath, async function (err, stats) {
              if (stats && stats.isDirectory()) {
                await vfsStart(sftp, deployConfig, uploadFiles.static);
                deployConfig.includeHtml && await vfsStart(sftp, deployConfig, uploadFiles.html);

                conn.end()
                // conn.close()
                console.log(chalk.magenta('deploy succeed.'))
              } else {
                console.log(chalk.red(`上传目录不存在`))
                console.log(chalk.red(`请在服务器上先创建目录：${deployConfig.remotePath}`))
                conn.end()
              }
            })
          }
        })
      }).on('error', function (err) {
        if (err.errno === 'ENETUNREACH') {
          console.log(chalk.red('请检查网络是否连接正常。'))
        } else if (err.level === 'client-authentication') {
          console.log(chalk.red('用户名或密码不正确'))
        } else {
          console.log(chalk.red(`请确认可以正常联通远程服务器：IP/${deployConfig.host} 端口号/${deployConfig.port}`))
        }
      }).connect(connSettings)
    }).catch((error) => {
      if (error) {
        throw new Error(error)
      }
    })
}

(async () => {
  let message = chalk.cyan('欢迎使用jet-deploy应用文件远端部署工具');
  console.log(boxen(message, {
    padding: 1,
    borderColor: 'white',
    margin: 0,
    borderStyle: 'classic'
  }));

  const uploadPath = path.resolve(process.cwd(), program.args[0] || '');

  if (!fs.existsSync(uploadPath)) return console.log(chalk.red('\n请确认你上传的目录路径是否正确\n'));

  // const uploadFiles = deployConfig.includeHtml ? path.join(uploadPath, '/**/*') : [path.join(uploadPath, '/**/*'), `!${path.join(uploadPath, '/**/*.html')}`]
  const uploadFiles = {
    static: [path.join(uploadPath, '/**/*'), `!${path.join(uploadPath, '/**/*.html')}`],
    html: [`${path.join(uploadPath, '/**/*.html')}`]
  }
  sftpUpload(uploadFiles)
})()
