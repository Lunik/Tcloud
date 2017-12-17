import NProgressCSS from 'nprogress/nprogress.css'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

class Loading {
  constructor () {
    this.progress = NProgress
    this.progress.configure({ showSpinner: false })
  }

  start () {
    this.progress.start()
  }

  done () {
    this.progress.done()
  }
}

export default new Loading()