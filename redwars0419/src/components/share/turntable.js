// canvas转盘
function CanvasTurntable () {
  var ele,
      container,
      canvas,
      num,
      prizes,
      btn,
      deg = 0,
      fnGetPrize,
      fnGotBack,
      optsPrize,
      isinit = false,
      rtype = '' // 旋转类型，匀速'linear'，停下'easeout'
  
  // 初始化转盘数据
  this.init = function ( opts ) {
    var _this = this

    ele = opts.ele
    container = ele.querySelector('.gb-turntable-container')
    btn = opts.btn
    canvas = document.createElement('canvas')
    canvas.className = 'gb-turntable-canvas'

    fnGetPrize = opts.getPrize
    fnGotBack = opts.gotBack

    opts.config(function(data) {
      prizes = opts.prizes = data
      num = prizes.length
      _this.draw(opts)
    })

    _this.events()
  }

  // 绘制转盘
  this.draw = function ( opts ) {
    opts = opts || {}
    if(!ele || num >>> 0 === 0) return;
    var cw_2 = parseInt(opts.width / 2) || 130,
        // 扇形回转角度
        rotateDeg = 180 / num + 90,
        ctx,
        // 奖项容器
        prizeItems = ele.querySelector('.gb-turntalbe-list'),
        // 文字旋转 turn 值
        turnNum = 1 / num,
        // 奖项
        html = [],
        grd = null
    canvas.width = cw_2 * 2
    canvas.height = cw_2 * 2
    ele.style.width = cw_2 * 2 + 'px'
    ele.style.height = cw_2 * 2 + 'px'
    if(!canvas.getContext) {
      alert('抱歉！浏览器不支持。')
      return
    }
    // 获取绘图上下文
    ctx = canvas.getContext('2d')
    for(var i = 0; i < num; i++) {
      // 保存当前状态
      ctx.save()
      // 开始一条新路径
      ctx.beginPath()
      // 位移到圆心，下面需要围绕圆心旋转
      ctx.translate(cw_2, cw_2)
      // 从(0, 0)坐标开始定义一条新的子路径
      ctx.moveTo(0, 0)
      // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
      ctx.rotate((360 / num * i - rotateDeg) * Math.PI / 180)
      // 绘制圆弧
      ctx.arc(0, 0, cw_2, 0, 2 * Math.PI / num, false)

      // 颜色间隔
      if(i % 2 == 0) {
        grd = ctx.createLinearGradient(0, 0, cw_2, cw_2/2)
        grd.addColorStop(0, '#bb0216')
        grd.addColorStop(1, '#fa162d')
        ctx.fillStyle = grd
      } else {
        grd = ctx.createLinearGradient(0,0,cw_2,cw_2/2)
        grd.addColorStop(0, '#ff7102')
        grd.addColorStop(1, '#ffbd00')
        ctx.fillStyle = grd
      }

      // 填充扇形
      ctx.fill()
      // 绘制边框
      ctx.lineWidth = 0.5
      ctx.strokeStyle = '#e4370e'
      ctx.stroke()

      // 恢复前一个状态
      ctx.restore()
      // 奖项列表
      html.push('<li class="gb-turntable-item"> <span style="transform-origin: 50% ' + cw_2 + 'px; transform: rotate(' + i * turnNum + 'turn)">' + prizes[i] + '</span> </li>')
      if((i + 1) === num) {
        if ( !isinit ) {
          container.innerHTML = ''
          container.appendChild(canvas)
          isinit = true
        }
        if ( !prizeItems ) {
          prizeItems = document.createElement('ul')
          prizeItems.className = 'gb-turntalbe-list'
          container.appendChild(prizeItems)
        }
        prizeItems.innerHTML = html.join('')
      }
    }
  }

  // 旋转转盘
  this.runRotate = function ( adeg ) {
    container.style['transform'] = 'rotate(' + adeg + 'deg)'
  }
  
  // 抽奖事件
  this.events = function () {
    var _this = this
    btn.addEventListener('click', () => {
      btn.classList.add('disabled')
      fnGetPrize(function(data) {
        optsPrize = {
          prizeId: data[0], // 中奖ID，从0开始
          chances: data[1] // 剩余抽奖次数
        }
        // 计算旋转角度
        deg = deg || 0;
        deg = deg + (360 - deg % 360) + (360 * 10 - data[0] * (360 / num))
        _this.runRotate(deg);
      });
    });
    // 中奖提示
    container.addEventListener('transitionend', _this.eGot, false)
  }
  
  // 旋转完成后执行
  this.eGot = function () {
    if ( optsPrize.chances ) {
      btn.classList.remove('disabled')
    }
    rtype = '' // 重置旋转状态
    fnGotBack(prizes[optsPrize.prizeId], optsPrize.prizeId)
  }
}
export default CanvasTurntable
