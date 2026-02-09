/**
 * MyCarousel - 练习原生JS实现的轮播图组件
 * 
 * 这是毛毛熊自学JS时，实现的轮播图组件，支持自动轮播、点击切换、底部指示点、标题显示等功能。
 * 轮播图支持自定义背景颜色、标题、链接等，并且实现了无限轮播效果（在最后一张图片后自动切换到第一张）。
 * 
 * @author 小毛毛熊
 * @version 1.0.0
 */
class MyCarousel {
  /**
   * 创建一个轮播图实例
   * 
   * @param {HTMLElement} dom - 轮播图容器元素
   * @param {Array<string>} imgUrls - 轮播图图片URL数组
   * @param {Array<string>|null} titles - 轮播图标题数组，可选
   * @param {Array<string>|null} BackgroundColors - 轮播图底部背景颜色数组，可选
   * @param {Array<string>|null} links - 轮播图链接数组，可选
   * @param {boolean} autoPlay - 是否自动播放，默认为true
   * @param {number} autoPlayTime - 自动播放间隔时间(毫秒)，默认为3000
   * @param {number} carouselIndex - 初始显示的轮播图索引，默认为0
   */
  constructor(dom, imgUrls, titles = null, BackgroundColors = null, links = null, autoPlay = true, autoPlayTime = 3000, carouselIndex = 0) {
    // 入参检查
    if (!dom || !dom.nodeType || dom.nodeType !== 1) {
      return console.error('dom类型错误')
    }
    if (!Array.isArray(imgUrls) || imgUrls.length === 0) {
      return console.error('imgUrls类型错误或长度为0')
    }
    if (BackgroundColors && !Array.isArray(BackgroundColors)) {
      return console.error('BackgroundColors类型错误')
    }
    if (titles && !Array.isArray(titles)) {
      return console.error('titles类型错误')
    }
    if (links && !Array.isArray(links)) {
      return console.error('links类型错误')
    }
    if (carouselIndex < 0 || carouselIndex >= imgUrls.length) {
      return console.error('carouselIndex越界')
    }
    if (typeof autoPlay !== 'boolean') {
      return console.error('autoPlay类型错误')
    }
    if (typeof autoPlayTime !== 'number' || autoPlayTime < 0) {
      return console.error('autoPlayTime类型错误或小于0')
    }
    if (BackgroundColors && BackgroundColors.length !== imgUrls.length) {
      return console.error('BackgroundColors长度与imgUrls长度不一致')
    }
    if (titles && titles.length !== imgUrls.length) {
      return console.error('titles长度与imgUrls长度不一致')
    }
    if (links && links.length !== imgUrls.length) {
      return console.error('links长度与imgUrls长度不一致')
    }

    // 检查父节点是否可见
    const { width, height } = dom.getBoundingClientRect()
    if (width === 0 || height === 0) {
      return console.error('父节点不可见')
    }

    // 初始化
    this.ref = dom  // 父节点
    this.div = null  // 轮播图节点
    this.itemNum = imgUrls.length  // 轮播图数量
    this.imgUrls = imgUrls  // 轮播图url
    this.currentIndex = carouselIndex  // 当前轮播图索引
    this.BackgroundColors = BackgroundColors  // 轮播图底部背景颜色
    this.titles = titles  // 轮播图底部标题
    this.links = links  // 轮播图链接
    this.timer = null  // 定时器
    this.autoPlay = autoPlay  // 是否自动播放
    this.autoPlayTime = autoPlayTime  // 自动播放间隔时间
    this.init()
  }

  /**
   * 初始化轮播图
   */
  init() {
    // 让父节点开启定位。如果已经开启了别的定位，则不修改
    const { position } = window.getComputedStyle(this.ref, null)
    if (position === 'static') {
      dom.style.position = 'relative'
    }

    // 构建轮播图html
    this.div = document.createElement('div')
    this.div.innerHTML = `
      <div class="main_carousel_container">
        <div class="carousel">
    ` +
      // 轮播图
      this.imgUrls.map((item, index) =>
        `<a href="${this.links ? this.links[index] : ''}"><img class="carousel_item" src="${item}"></a>`
      ).join('') +
      // 添加虚拟尾节点
      `
          <a href="${this.links ? this.links[0] : ''}"><img class="carousel_item" src="${this.imgUrls[0]}"></a>
    ` +
      `
        </div>
        <div class="carousel_bottom">
          <div class="carousel_bottom_left">
            <div class="carousel_bottom_title">${this.titles ? this.titles[this.currentIndex] : ''}</div>
            <div class="carousel_bottom_dots">
    ` +
      // 底部点点
      this.imgUrls.map((item, index) =>
        `<div class="carousel_bottom_dot ${index === this.currentIndex ? 'carousel_dot_active' : ''}"></div>`
      ).join('') +
      `
            </div>
          </div>
          <button class="carousel_bottom_btn carousel_left_btn">
            <svg t="1687749658278" style="transform: rotate(90deg);" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2053" id="mx_n_1687749658280" width="16" height="16"><path d="M722.773333 381.44a64 64 0 0 1 90.453334 90.453333l-252.970667 253.013334a68.266667 68.266667 0 0 1-96.512 0l-253.013333-253.013334a64 64 0 0 1 90.538666-90.453333L512 592.128l210.773333-210.773333z" fill="#ffffff" p-id="2054"></path></svg>
          </button>
          <button class="carousel_bottom_btn carousel_right_btn">
            <svg t="1687749658278" style="transform: rotate(-90deg);" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2053" id="mx_n_1687749658280" width="16" height="16"><path d="M722.773333 381.44a64 64 0 0 1 90.453334 90.453333l-252.970667 253.013334a68.266667 68.266667 0 0 1-96.512 0l-253.013333-253.013334a64 64 0 0 1 90.538666-90.453333L512 592.128l210.773333-210.773333z" fill="#ffffff" p-id="2054"></path></svg>
          </button>
        </div>
      </div>
    `
    this.ref.appendChild(this.div)

    // 获取节点
    this.carousel = this.div.querySelector('.carousel')
    this.carousel_bottom = this.div.querySelector('.carousel_bottom')
    this.carousel_bottom_title = this.div.querySelector('.carousel_bottom_title')
    this.carousel_bottom_dots = this.div.querySelector('.carousel_bottom_dots')
    this.carousel_btns = this.div.querySelectorAll('.carousel_bottom_btn')
    this.carousel_dots = this.div.querySelectorAll('.carousel_bottom_dot')

    // 初始化底部样式
    this.setCarouselBottomStyle(false)
    // 添加左按钮点击事件
    this.carousel_btns[0].addEventListener('click', () => { this.go(this.currentIndex - 1, true) })
    // 添加右按钮点击事件
    this.carousel_btns[1].addEventListener('click', () => { this.go(this.currentIndex + 1, true) })
    // 添加点点的点击事件
    this.carousel_dots.forEach((dot, index) => {
      dot.addEventListener('click', () => { this.go(index) })
    })
    // 开启自动轮播
    this.setAutoPlay()
  }

  /**
   * 设置底部样式
   * 
   * @param {boolean} isInitialized - 是否是初始化，默认为false
   * @param {number} index - 当前索引，默认为currentIndex
   */
  setCarouselBottomStyle(isInitialized = false, index = this.currentIndex) {
    // 初始化设置轮播图数量
    if (!isInitialized) {
      this.carousel.style.setProperty('--itemNum', this.itemNum)
    }
    // 设置点点激活样式
    this.carousel_dots.forEach(item => {
      item.classList.remove('carousel_dot_active')
    })
    this.carousel_dots[index].classList.add('carousel_dot_active')
    // 设置底部背景颜色、阴影颜色
    if (this.BackgroundColors) {
      this.carousel_bottom.style.setProperty('--carouselBottomColor', this.BackgroundColors[index])
    }
    // 设置底部标题
    if (this.titles) {
      this.carousel_bottom_title.innerText = this.titles[index]
    }
  }

  /**
   * 切换图片
   * 
   * @param {number} pageIndex - 目标索引
   * @param {boolean} animation - 是否有动画，默认为false
   */
  go(pageIndex, animation = false) {
    if (pageIndex < -1 || pageIndex > this.itemNum) {
      return console.error('pageIndex超出范围!')

    }
    // 情况一：点击了左按钮，且当前显示的是第一张图片
    if (animation && pageIndex == -1) {
      this.currentIndex = this.itemNum - 1
      // 1.先瞬移到虚拟尾节点
      this.carousel.style.transition = 'none'
      this.carousel.style.transform = `translateX(-${this.itemNum / (this.itemNum + 1) * 100}%)`
      // 2.再从虚拟尾节点切到最后一张图片
      setTimeout(() => {
        this.carousel.style.transition = 'all 0.3s'
        this.carousel.style.transform = `translateX(-${this.currentIndex / (this.itemNum + 1) * 100}%)`
      }, 0)
    }
    // 情况二：点击了右按钮，且当前显示的是最后一张图片
    else if (animation && pageIndex == this.itemNum) {
      this.currentIndex = 0
      // 1.先从最后一张图片切到虚拟尾节点
      this.carousel.style.transition = 'all 0.3s'
      this.carousel.style.transform = `translateX(-${this.itemNum / (this.itemNum + 1) * 100}%)`
      // 2.再从虚拟尾节点瞬移到第一张图片
      setTimeout(() => {
        this.carousel.style.transition = 'none'
        this.carousel.style.transform = `translateX(0)`
      }, 300)
      // transitionEnd
    }
    // 情况三：正常切换图片，但是有动画
    else if (animation) {
      this.currentIndex = pageIndex
      this.carousel.style.transition = 'all 0.3s'
      this.carousel.style.transform = `translateX(-${this.currentIndex / (this.itemNum + 1) * 100}%)`
    }
    // 情况四：正常切换图片，但是没有动画
    else {
      this.currentIndex = pageIndex
      this.carousel.style.transition = 'none'
      this.carousel.style.transform = `translateX(-${this.currentIndex / (this.itemNum + 1) * 100}%)`
    }
    // 修改轮播图底部样式
    this.setCarouselBottomStyle()
  }

  /**
   * 开启关闭自动轮播
   * 
   * @param {boolean} isAutoPlay - 是否自动播放，默认为true
   * @param {number} autoPlayTime - 自动播放间隔时间(毫秒)，默认为3000
   */
  setAutoPlay(isAutoPlay = this.autoPlay, autoPlayTime = this.autoPlayTime) {
    if (isAutoPlay) {
      this.timer = setInterval(() => {
        this.go(this.currentIndex + 1, true)
      }, autoPlayTime)
    } else {
      clearInterval(this.timer)
    }
  }
}

// 测试
const data = [{
  title: '绝境之下！华丽地反击！',
  imgUrl: './public/carousel_cover0.webp',
  BackgroundColor: 'rgb(115, 58, 74)',
  link: 'https://www.bilibili.com/',
}, {
  title: '一键领取星穹铁道首款个性装扮啦！',
  imgUrl: './public/carousel_cover1.webp',
  BackgroundColor: 'rgb(50, 57, 85)',
  link: 'https://www.bilibili.com/',
}, {
  title: '什么，ta竟然在背着你做攻略？！',
  imgUrl: './public/carousel_cover2.webp',
  BackgroundColor: 'rgb(147, 88, 155)',
  link: 'https://www.bilibili.com/',
}, {
  title: '致敬！中国缉毒警察跨国缉拿金三角毒贩',
  imgUrl: './public/carousel_cover3.webp',
  BackgroundColor: 'rgb(40, 45, 35)',
  link: 'https://www.bilibili.com/',
}, {
  title: '是老师也是UP主！来投稿你的课堂实录~',
  imgUrl: './public/carousel_cover4.webp',
  BackgroundColor: 'rgb(38, 33, 27)',
  link: 'https://www.bilibili.com/',
}, {
  title: '原神3.7版本图文攻略征集大赛',
  imgUrl: './public/carousel_cover5.webp',
  BackgroundColor: 'rgb(76, 150, 206)',
  link: 'https://www.bilibili.com/',
}]

const dom = document.querySelector('#myCarouselContainer')
const myCarousel = new MyCarousel(dom,
  data.map(item => item.imgUrl),
  data.map(item => item.title),
  data.map(item => item.BackgroundColor),
  null,
  true,
  3000,
  carouselIndex = 0
)
