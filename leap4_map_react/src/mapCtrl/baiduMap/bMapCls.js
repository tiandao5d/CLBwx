// 底图的方法封装，方便以后更换底图
// 尽可能不要在项目中直接使用地图的原生方法属性，会造成以后更改地图比较困难
// 必须每个底图都有相同的方法和属性，否则将会造成底图切换失败问题
// 只有‘BMapCls’暴露出去，外面调用api必须通过这个类，其他底图也是如此，便于以后切换底图

// key gQcPsF9ORlRKtQ1loLHVPzmwFXCpM0ol
import React from 'react';
import ReactDOM from 'react-dom';
import './bMapCls.css';
import img1 from '../../img/m1.png';
import img2 from '../../img/m2.png';
import img3 from '../../img/m3.png';
import img4 from '../../img/m4.png';
import img5 from '../../img/m5.png';
import blue from '../../img/blue.png';
import green from '../../img/green.png';
import orange from '../../img/orange.png';
let BMap = null; // 用于储存地图的API对象，方便全局调用，地图api加载完毕后存在
let mapMethod = null; // 全局的地图方法，地图创建后存在
let map = null; // 创建的地图实例，只能创建一个地图实例，地图创建后存在
let drawCls = null; // 拖拽类
let BMapLib = null; // 地图的给的开源方法存放地址
let mapEventArr = { // 记录所有的地图绑定事件，也是地图可以绑定的事件列表
    click: {},
    rightclick: {},
    zoomend: {},
    dragend: {}
};
class BMapCls { // 唯一对外输出的类，所有地图的API在这里封装后输出
    constructor(options = {}) {
        this.options = Object.assign({ // 默认值
            container: options.el,
            zoom: 5,
            center: { lat: 35, lng: 105 }
        }, options);
    }
    // 创建底图
    // 异步函数，因为需要异步加载底图的API
    async createMap(options = this.options) {
        await getMap();
        let mapOptions = Object.assign({
            container: options.el,
            enableMapClick: false
        }, options);
        mapOptions.container = typeof mapOptions.container === 'string' ? document.getElementById(mapOptions.container) : mapOptions.container;
        mapOptions.container.innerHTML = ''; // 容器必须是空的
        map = new BMap.Map(mapOptions.container, mapOptions); // 创建一个map
        map.centerAndZoom(new BMap.Point(mapOptions.center.lng, mapOptions.center.lat), mapOptions.zoom);
        map.enableScrollWheelZoom();
        mapMethod = new MapMethod(); // 创建一个简单方便使用的map方法类
        return this;
    }
    // 点的聚合
    lotMarkers(res) {
        let lotMarkers = new LotMarkers();
        lotMarkers.render(res);
        lotMarkers.showTxt();
    }
    // 创建画图
    async draw() { // 接入画图插件
        if (drawCls) {
            return drawCls;
        }
        drawCls = new DrawCls({
            overlays: []
        });
        await drawCls.create();
        return {
            circle: drawCls.circle.bind(drawCls),
            polygon: drawCls.polygon.bind(drawCls),
            marker: drawCls.marker.bind(drawCls)
        };
    }
}


// 拖拽画图
class DrawCls {
    constructor(options) {
        this.overlays = options.overlays || []; // 存储所有的图形

        this.drawingManager = null; // 记录画图对象
        this.selectOverlay = null; // 存储当前选中的图像对象
    }
    async create() {
        await Promise.all([
            getPlugin('http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js', 'drawing_manager'),
            getPluginCss('http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css', 'drawing_manager_css')
        ]);
        BMapLib = window.BMapLib;
        BMapLib.DrawingManager.prototype._bindPolylineOrPolygon = this._bindPolylineOrPolygon;
        let styleOptions = mapMethod.getStyle();
        // 实例化鼠标绘制工具
        this.drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: false, // 是否开启绘制模式
            enableDrawingTool: true, // 是否显示工具栏
            drawingToolOptions: { // 工具栏的参数
                anchor: window.BMAP_ANCHOR_TOP_RIGHT, // 位置
                offset: new BMap.Size(5, 5) // 偏离值
            },
            circleOptions: styleOptions, // 圆的样式
            polygonOptions: styleOptions, // 多边形的样式
            rectangleOptions: styleOptions // 矩形的样式
        });
        this.mapEventBind(); // 事件绑定
    }
    // 绑定画图功能事件
    mapEventBind() {
        let drawingManager = this.drawingManager;
        drawingManager.addEventListener('overlaycomplete', (e) => {
            e.overlay.drawingMode = e.drawingMode; // 添加一个识别类型
            if (e.overlay.drawingMode === 'rectangle') { // 矩形当成多边形处理
                e.overlay.drawingMode = 'polygon';
            }
            this.overlays.push(e.overlay);
            drawingManager.close();
            this.overlaycomplete(e.overlay);
        });
    }
    // 画图完成后执行
    overlaycomplete(overlay) {
        overlay.addEventListener('click', () => {
            if (overlay.drawingMode === 'circle' || overlay.drawingMode === 'polygon') {
                if (overlay.statusType === 'select') { // 已经是选中状态，进入编辑状态
                    this.enableEditing(overlay);
                } else if (!overlay.statusType) { // 没有任何状态时进入选中状态
                    this.enableChecked(overlay);
                }
            }
        });
        overlay.addEventListener('rightclick', () => {
            if (overlay.statusType === 'select') {
                this.disableChecked(overlay);
            } else if (overlay.statusType === 'edit') {
                this.disableEditing(overlay);
            }
        });
    }
    // 进入选中状态
    enableChecked(overlay) {
        if (this.selectOverlay) { // 已经存在一个选中的状态了
            this.disableChecked(this.selectOverlay);
        }
        overlay.statusType = 'select';
        overlay.oldStrokeColor = overlay.getStrokeColor();
        overlay.setStrokeColor('red');
        this.selectOverlay = overlay;
    }
    // 退出选中状态
    disableChecked(overlay) {
        // 如果直接退出选中状态会判断是否是编辑状态也会一并退出
        if (overlay.statusType === 'edit') {
            this.disableEditing(overlay);
        }
        overlay.statusType = '';
        overlay.setStrokeColor(overlay.oldStrokeColor);
        this.selectOverlay = null;
    }
    // 进入编辑状态
    // 参数为当前进入编辑状态的对象
    enableEditing(overlay) {
        overlay.statusType = 'edit';
        overlay.enableEditing();
        this.bindDrag(overlay); // 绑定拖拽事件
    }
    // 退出编辑状态
    disableEditing(overlay) {
        overlay.statusType = 'select';
        overlay.disableEditing();
        this.unbindDrag(overlay); // 解除拖拽绑定的事件
    }
    // 绑定拖拽事件
    bindDrag(overlay) {
        let obj = overlay.drawObj = {
            status: 0, // 记录拖动状态
            start: null, // 记录拖动的起始点
            end: null, // 记录拖动的结束点
            center: null, // 记录圆的中心位置
            paths: null, // 记录多边形的路径
            mouseDownFn(e) {
                if (overlay.statusType === 'edit' && e.domEvent.button === 0) {
                    map.disableDragging(); // 禁止地图拖动
                    overlay.disableEditing(); // 禁止编辑
                    obj.status = 1;
                    obj.start = e.point;
                    if (overlay.drawingMode === 'circle') {
                        obj.center = overlay.getCenter();
                    } else if (overlay.drawingMode === 'polygon') {
                        obj.paths = overlay.getPath();
                    }
                }
            },
            mouseMoveFn(e) {
                if (obj.status === 1) {
                    obj.end = e.point;
                    let lng = obj.end.lng - obj.start.lng;
                    let lat = obj.end.lat - obj.start.lat;
                    if (overlay.drawingMode === 'circle') {
                        lng += obj.center.lng;
                        lat += obj.center.lat;
                        overlay.setCenter(new BMap.Point(lng, lat));
                    } else if (overlay.drawingMode === 'polygon') {
                        let paths = obj.paths.map(o => {
                            return new BMap.Point((o.lng + lng), (o.lat + lat))
                        });
                        overlay.setPath(paths);
                    }
                }
            },
            mouseUpOUtFn(e) {
                if (obj.status === 1) {
                    map.enableDragging(); // 恢复地图拖动
                    overlay.enableEditing(); // 恢复编辑状态
                    obj.status = 0;
                }
            }
        }
        overlay.addEventListener('mousedown', obj.mouseDownFn);
        map.addEventListener('mousemove', obj.mouseMoveFn);
        map.addEventListener('mouseup', obj.mouseUpOUtFn); // 地图似乎没有mouseout事件
    }
    // 解除拖拽绑定的事件
    unbindDrag(overlay) {
        let obj = overlay.drawObj;
        overlay.removeEventListener('mousedown', obj.mouseDownFn);
        map.removeEventListener('mousemove', obj.mouseMoveFn);
        map.removeEventListener('mouseup', obj.mouseUpOUtFn); // 地图似乎没有mouseout事件
        overlay.drawObj = null;
    }
    circle() { // 进入画圆状态
        this.drawingManager.setDrawingMode(window.BMAP_DRAWING_CIRCLE);
        this.drawingManager.open();
    }
    polygon() { // 进入画多边形状态
        this.drawingManager.setDrawingMode(window.BMAP_DRAWING_POLYGON);
        this.drawingManager.open();
    }
    marker(imgSrc) { // 进入打点状态
        if ( imgSrc ) {
            this.drawingManager.markerOptions = {
                icon: new BMap.Icon(imgSrc, new BMap.Size(20, 20), {imageSize: new BMap.Size(20, 20)})
            }
        } else {
            this.drawingManager.markerOptions = {};
        }
        this.drawingManager.setDrawingMode(window.BMAP_DRAWING_MARKER);
        this.drawingManager.open();
    }
    /**
     * 源码中的方法，重置
     * 画线和画多边形相似性比较大，公用一个方法
     */
    _bindPolylineOrPolygon() {
        var me = this,
            map = this._map,
            mask = this._mask,
            points = [],   //用户绘制的点
            drawPoint = null, //实际需要画在地图上的点
            overlay = null,
            isBinded = false;

        /**
         * 鼠标点击的事件
         */
        var startAction = function (e) {
            if (me.controlButton === "right" && (e.button === 1 || e.button === 0)) {
                return;
            }
            points.push(e.point);
            drawPoint = points.concat(points[points.length - 1]);
            if (points.length === 1) {
                if (me._drawingType === window.BMAP_DRAWING_POLYLINE) {

                    overlay = new BMap.Polyline(drawPoint, me.polylineOptions);
                } else if (me._drawingType === window.BMAP_DRAWING_POLYGON) {
                    overlay = new BMap.Polygon(drawPoint, me.polygonOptions);
                }
                map.addOverlay(overlay);
            } else {
                overlay.setPath(drawPoint);
            }
            if (!isBinded) {
                isBinded = true;
                mask.enableEdgeMove();
                mask.addEventListener('mousemove', mousemoveAction);
                mask.addEventListener('dblclick', dblclickAction);
            }
            if (e.button === 2) { // 右键退出画图
                dblclickAction(e);
            }
        }

        /**
         * 鼠标移动过程的事件
         */
        var mousemoveAction = function (e) {
            overlay.setPositionAt(drawPoint.length - 1, e.point);
        }

        /**
         * 鼠标双击的事件
         */
        var dblclickAction = function (e) {
            e.stopPropagation();
            isBinded = false;
            mask.disableEdgeMove();
            mask.removeEventListener('mousedown', startAction);
            mask.removeEventListener('mousemove', mousemoveAction);
            mask.removeEventListener('dblclick', dblclickAction);
            //console.log(me.controlButton);
            if (me.controlButton === "right") {
                points.push(e.point);
            } else {
                points.pop();
            }

            // 如果不足以组成多边形，则直接删除并推出
            if (me._drawingType === window.BMAP_DRAWING_POLYGON && points.length < 3) {
                map.removeOverlay(overlay);
            } else {
                overlay.setPath(points);
                var calculate = me._calculate(overlay, points.pop());
                me._dispatchOverlayComplete(overlay, calculate);
            }
            points.length = 0;
            drawPoint.length = 0;
            me.close();

        }

        mask.addEventListener('mousedown', startAction);

        //双击时候不放大地图级别
        mask.addEventListener('dblclick', function (e) {
            e.stopPropagation();
        });
    }
}

// 地图功能的一些基本封装
// 为了统一接口输出，方便日后更换其他底图
class MapMethod {
    createPoint(...args) { // 创建点
        if (args[0] instanceof BMap.Point) {
            return args[0];
        }
        let obj = {};
        if (args.length === 2) {
            obj.lng = +args[0];
            obj.lat = +args[1];
        } else if (args[0] instanceof Array) {
            obj.lng = +args[0][0];
            obj.lat = +args[0][1];
        } else if (args[0]) {
            obj.lng = +args[0]['lng'];
            obj.lat = +args[0]['lat'];
        }
        return new BMap.Point(obj.lng, obj.lat);
    }
    // 创建圆
    createCircle(options) { // 创建圆
        let center = this.createPoint(options.center);
        let radius = options.radius;
        let map = options.map;
        let obj = this.getStyle();
        for (let k in obj) {
            if (options[k]) {
                obj[k] = options[k];
            }
        }
        let shape = new BMap.Circle(center, radius, obj);
        if (map) {
            map.addOverlay(shape);
        }
        return shape;
    }
    // 创建多边形
    createPolygon(options) {
        let points = options.points.map(o => this.createPoint(o));
        let map = options.map;
        let obj = this.getStyle();
        for (let k in obj) {
            obj[k] = options[k];
        }
        let shape = new BMap.Polygon(points, obj);
        if (map) {
            map.addOverlay(shape);
        }
        return shape;
    }
    // 创建覆盖物
    createMarker(options) {
        let point = this.createPoint(options.point);
        let map = options.map;
        delete options.point;
        delete options.map;
        let shape = new BMap.Maker(point, options);
        if (map) {
            map.addOverlay(shape);
        }
        return shape;
    }
    // 基本样式，圆，多边形
    getStyle() {
        let obj = {
            strokeColor: 'blue',    //边线颜色
            strokeWeight: 3,       //边线的宽度，以像素为单位
            strokeOpacity: 1,	   //边线透明度，取值范围0 - 1
            strokeStyle: 'solid',   //边线的样式，solid或dashed

            fillColor: 'white',      //填充颜色。当参数为空时，圆形将没有填充效果
            fillOpacity: 0.3      //填充的透明度，取值范围0 - 1
        }
        return obj;
    }
}


// 聚合点，海量点
class LotMarkers {
    constructor() {
        this.markers = []; // 记录所有的点
        this.options = {}; // 记录参数数据
    }
    render(options = {}) {
        options = this.options = Object.assign({}, this.options, options);
        this.clear();
        let data = null;
        if ( options.type === 'cluster' ) { // 聚合点
            data = this.clusterPoints(options.data);
        } else if ( options.type === 'detail' ) { // 详情点
            data = this.detailPoints(options.data);
        }
        this.markers = data;
        data.forEach(o => {
            map.addOverlay(o);
        });
    }
    clear() {
        this.markers.forEach(o => {
            map.removeOverlay(o);
        });
    }
    // geo层的聚合点
    clusterPoints(data) {
        let type = this.options.type;
        return data.map((o, i) => {
            let point = new BMap.Point(o.lnglat.lng, o.lnglat.lat)
            return new BMap.LabelMarker({
                position: point,
                txt: o.text,
                type: type,
                onClick(e, me) {
                    let div = document.createElement('div');
                    ReactDOM.render(
                        (<ActionLink />),
                        div
                    );
                    map.openInfoWindow(new BMap.InfoWindow(div), point)
                }
            });
        });

    }
    // 详情点信息
    detailPoints(data) {

    }
    showTxt() {
        document.body.classList.add('lgbmap-lm-ssh');
    }
    getStyles() {
        return [
            { url: img1, size: new BMap.Size(53, 53) },
            { url: img2, size: new BMap.Size(56, 56) },
            { url: img3, size: new BMap.Size(66, 66) },
            { url: img4, size: new BMap.Size(78, 78) },
            { url: img5, size: new BMap.Size(90, 90) }
        ];
    }
}

// 自定义marker
function _LabelMarker() {
    function LabelMarker(options = {}) {
        // 可以是{src: '', class: ''}类型对象的数组, 也可以是src字符串的数组
        // class为加给对应图片的类名
        options.imgs = options.imgs || [];
        if ( options.imgs.length > 3 ) {
            options.imgs.length = 3;
        }
        this.options = options;
        this.position = options.position;
    }
    LabelMarker.prototype = new BMap.Overlay();
    LabelMarker.prototype.getEl = function () {
        return this.el;
    }
    LabelMarker.prototype.initialize = function (map) {
        this.map = map;
        let options = this.options;
        let div = document.createElement('div');
        if ( options.type === 'cluster' ) { // 聚合点
            div.innerHTML = this.getClusterHtml();
        } else if ( options.type === 'detail' ) { // 详情点
            div.innerHTML = this.getDetailHtml();
        }
        div.className = 'lgmap-labelmarker';
        this.el = div;
        map.getPanes().markerMouseTarget.appendChild(div);
        div.addEventListener('click', (...args) => {
            if (options.onClick) {
                options.onClick(...args, this);
            }
        });
        return div;
    };
    LabelMarker.prototype.getClusterHtml = function(options = this.options) {
        return `
            <div class="lgbmap-lm-circle"></div>
            <div class="lgbmap-lm-txt center">${options.txt || ''}</div>
        `
    }
    LabelMarker.prototype.getDetailHtml = function(options = this.options) {
        return `
            <div class="lgbmap-lm-imgs">
                ${
                    options.imgs.map((o, i) => {
                        let s = '';
                        let c = '';
                        if ( typeof o === 'object' ) {
                            s = o.src;
                            c = o.class || '';
                        } else {
                            s = o;
                        }
                        return `<img src="${s}" class="lgbmap-lm-img${i + 1} ${c}">`
                    }).join('')
                }
            </div>
            <div class="lgbmap-lm-txt">${options.txt || ''}</div>
        `
    }
    LabelMarker.prototype.getMap = function () {
        return this.map;
    }
    LabelMarker.prototype.getPosition = function () {
        return this.position;
    }
    LabelMarker.prototype.draw = function () {
        this._updatePosition();
    }
    LabelMarker.prototype._updatePosition = function (position = this.position) {
        var pixelPosition = this.map.pointToOverlayPixel(position);
        this.el.style.left = pixelPosition.x + 'px';
        this.el.style.top = pixelPosition.y + 'px';
    }
    return LabelMarker;
}

function ActionLink() {
    let arr = [1,2,3,4,5,6,7]
    function aa (e) {
        console.log(e)
    }
    return (
      <div>
          {arr.map(n => (<div className="li" key={n} onClick={(e) => aa(e)}>10x1x0 {n}</div>))}
      </div>
    );
  }


// 自定义覆盖物
function createCustomOverlay() {
    BMap.LabelMarker = _LabelMarker();
}


// 获取插件，就是创建一个script的标签插入dom
// 返回一个Promise，加载完成后执行
function getPlugin(src, id) {
    let jsapi = document.getElementById(id);
    if (jsapi) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        jsapi = document.createElement('script');
        jsapi.onload = function () {
            resolve();
        }
        jsapi.charset = 'utf-8';
        jsapi.src = src;
        jsapi.id = id;
        document.head.appendChild(jsapi);
    })
}

function getPluginCss(href, id) {
    let jsapi = document.getElementById(id);
    if (jsapi) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        jsapi = document.createElement('link');
        jsapi.onload = function () {
            resolve();
        }
        jsapi.rel = 'stylesheet';
        jsapi.href = href;
        jsapi.id = id;
        document.head.appendChild(jsapi);
    })
}

var bmapInitResolve = null;
window.initMap = async function initMap() {
    BMap = window.BMap;
    createCustomOverlay(); // 自定义覆盖物
    bmapInitResolve(); // 初始化完成后响应
}
// 获取地图
async function getMap() {
    await getPlugin('//api.map.baidu.com/api?v=3.0&ak=gQcPsF9ORlRKtQ1loLHVPzmwFXCpM0ol&callback=initMap', 'map_api');
    await (new Promise(resolve => {
        bmapInitResolve = resolve;
    }));
    return BMap;
}
export default BMapCls
