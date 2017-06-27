// @flow
const Bs = require('browser-sync').create('server')
const ChildProcess = require('child_process')
const Notifier = require('node-notifier')
const Path = require('path')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const log = require('debug')('my-app:FobWatchModePlugin')

const Spawn = ChildProcess.spawn

let server
let lastPercentage = 0


function FobWatchModePlugin (options) {}

FobWatchModePlugin.prototype.apply = compiler => {


  compiler.apply(new ProgressPlugin((percentage, msg) => {

    const parsed = parseInt((percentage * 100), 10)
    if ((parsed - lastPercentage) >= 5) {

      // eslint-disable-next-line
      console.log(`${parsed}% ${msg}`)
      lastPercentage = parsed

    }

  }))


  compiler.plugin('after-emit', () => {

    if (!server) {

      // Start server process
      log('starting server')
      server = Spawn('node', [Path.resolve(__dirname, '../../build/server.js')])
      server.stdout.on('data', data => console.log(data.toString())) // eslint-disable-line
      server.stderr.on('data', data => console.log(data.toString())) // eslint-disable-line

      // Initialize BrowserSync proxy
      Bs.init({
        proxy: 'localhost:8000',
        ghostMode: false,
        open: false,
        logFileChanges: true,
        logLevel: 'info',
        reloadOnRestart: true,
        reloadDebounce: 500,
      })

      Notifier.notify({
        title: 'Webpack',
        message: 'Dev server started!',
        icon: 'https://avatars3.githubusercontent.com/u/25012217?v=3&s=200',
        open: 'http://localhost:3000',
      })

    }

  })


  compiler.plugin('done', stats => {

    // eslint-disable-next-line
    console.log('\n')
    if (stats.hasErrors()) return

    // Not working with webpack/hot/signal :( ...probably `concurrently`
    // if (!outputProcess) {

    //   const outputDirectory = stats.stats[0].compilation.compiler.outputPath
    //   const outputFilename = 'views/Html.js'
    //     // = stats.toJson().children[0].assetsByChunkName.bundle[0]
    //   const outputPath = Path.join(outputDirectory, outputFilename)
    //   log('outputFile', outputPath)
    //   outputProcess = ChildProcess.fork(outputPath)

    // }

    // log('KILL')
    // outputProcess.kill('SIGUSR2')

    log('compiled', stats.toString({
      colors: true,
        // Debugging options
        // https://webpack.github.io/docs/node.js-api.html#stats-tojson
      chunks: false,
    }))

    Bs.reload()

  })

}


module.exports = FobWatchModePlugin
