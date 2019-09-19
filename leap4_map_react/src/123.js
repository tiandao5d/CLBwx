
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = global.document ?
          factory(global, true) :
          function (w) {
              if (!w.document) {
                  throw new Error('错误的调用');
              }
              return factory(w);
          };
  } else {
      factory(global);
  }
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
  'use strict';
  function XLToast(options) {
      if (!XLToast.prototype.open) {
          // 合并多个对象
          XLToast.prototype.extend = function () {
              var args = Array.prototype.slice.call(arguments);
              var obj = args.shift();
              args.forEach(function (o) {
                  for (var k in o) {
                      obj[k] = o[k];
                  }
              });
              return obj;
          }

          // 执行元素显示
          XLToast.prototype.open = function () {
              var options = typeof arguments[0] === 'object' ? arguments[0] : typeof arguments[0] === 'string' ? { html: arguments[0] } : {};
              options = this.extend({}, this.options, options);
              options.hasAni = ('animation' in document.body.style) && options.hasAni;
              typeof options.toBox === 'string' ? options.toBox = document.querySelector(options.toBox) : '';
              typeof options.type === 'string' ? options.type = [options.type] : '';

              var div = document.createElement('div');
              div.className = options.type.join(' ');
              div.innerHTML = options.html;

              if (options.hasAni) {
                  div.classList.add(options.animate[0], 'animated', 'ngui-show', 'xltoast-box');
                  div.addEventListener('click', function () {
                      clearTimeout(options.outIndex); // 清除定时器
                      div.classList.remove(options.animate[0], options.animate[1], 'animated', 'ngui-show');
                      div.classList.add(options.animate[1], 'animated');
                  });
                  div.addEventListener('animationend', animationend);
              } else { // 不支持动画
                  div.classList.add('xltoast-box');
                  div.addEventListener('click', function () {
                      clearTimeout(options.outIndex); // 清除定时器
                      options.toBox.removeChild(div);
                  });
                  timerBind()
              }
              div.addEventListener('mouseenter', function () { // 悬浮清除计时
                  clearTimeout(options.outIndex); // 清除定时器
              });
              div.addEventListener('mouseleave', function () { // 离开绑定计时
                  timerBind();
              });
              function animationend() {
                  if (div.classList.contains('ngui-show')) { // 显示动画完成后
                      timerBind();
                  } else { // 消失动画完成后
                      options.toBox.removeChild(div);
                  }
              }
              function timerBind() { // 延迟绑定
                  options.outIndex = setTimeout(function () {
                      if (options.hasAni) {
                          div.classList.remove(options.animate[0], 'animated', 'ngui-show');
                          div.classList.add(options.animate[1], 'animated');
                      } else {
                          options.toBox.removeChild(div);
                      }
                  }, options.timer);
              }
              options.toBox.appendChild(div); // 将元素加入dom
              return div;
          }
      }
      if (this instanceof XLToast) {
          // 所有的动画，第一个是进入，第二个是离开
          // animate.css的动画，选取了些比较好看的
          // [['bounceIn', 'bounceOut'], ['fadeIn', 'fadeOut'], ['fadeInDown', 'fadeOutDown'], ['fadeInLeft', 'fadeOutLeft'], ['fadeInRight', 'fadeOutRight'], ['fadeInUp', 'fadeOutUp'], ['flipInX', 'flipOutX'], ['flipInY', 'flipOutY'], ['lightSpeedIn', 'lightSpeedOut'], ['rotateInDownLeft', 'rotateOutDownLeft'], ['rotateInDownRight', 'rotateOutDownRight'], ['rotateInUpLeft', 'rotateOutUpLeft'], ['rotateInUpRight', 'rotateOutUpRight'], ['zoomIn', 'zoomOut'], ['zoomInDown', 'zoomOutDown'], ['zoomInLeft', 'zoomOutLeft'], ['zoomInRight', 'zoomOutRight'], ['zoomInUp', 'zoomOutUp'], ['rollIn', 'rollOut']];
          this.options = {
              hasAni: ('animation' in document.body.style), // 是否使用动画
              html: '啥也没有', // 默认的显示内容
              timer: 3000, // 默认的时间展示
              toBox: document.body, // 放入那个元素中
              animate: ['xlRotateIn', 'xlRotateOut'], // 动画，第一个是进入，第二个是离开
              type: '' // 属性，也是class 可选值有 'warning', 'error', 'success', 'info', 'normal'
          }
          options && this.extend(this.options, options); // 定义默认数据
      } else {
          return new XLToast(options)
      }
  }
  if (!noGlobal) {
      window.XLToast = XLToast;
  }
//   return XLToast
});
