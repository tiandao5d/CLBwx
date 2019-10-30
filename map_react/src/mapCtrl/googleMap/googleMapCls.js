// 底图的方法封装，方便以后更换底图
// 尽可能不要在项目中直接使用地图的原生方法属性，会造成以后更改地图比较困难
// 必须每个底图都有相同的方法和属性，否则将会造成底图切换失败问题
// 只有‘MapApiCls’暴露出去，外面调用api必须通过这个类，其他底图也是如此，便于以后切换底图

// 高德地图的类
// key AIzaSyCvoNRaKHgdvaZFCH_MYcTpU_Dtlpf3784
import './googleMapCls.css';
import img1 from '../../img/m1.png';
import img2 from '../../img/m2.png';
import img3 from '../../img/m3.png';
import img4 from '../../img/m4.png';
import img5 from '../../img/m5.png';
let MapApi = null; // 用于储存地图的API对象，方便全局调用
class MapApiCls {
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
        this.MapApi = await getMap();
        let mapOptions = Object.assign({
            container: options.el
        }, options);
        mapOptions.container = typeof mapOptions.container === 'string' ? document.getElementById(mapOptions.container) : mapOptions.container;
        let map = this.map = new MapApi.Map(mapOptions.container, mapOptions);
        return map;
    }
    // 点的聚合
    async markerClusterer(data) {
        data = data.map(o => {
            return {
                lat: +o.lnglat[1],
                lng: +o.lnglat[0]
            }
        });
        let markersClusterCls = await getMarkersCluster(this.map, data);
        markersClusterCls.showTxt();
    }
    // 画图，多边形
    // 异步函数，因为可能有的地图需要异步加载插件
    async drawPolygon() {
        let drawCls = await getDraw();
        drawCls.polygon(this.map);
    }
    // 画图，圆
    // 异步函数，因为可能有的地图需要异步加载插件
    async drawCircle() {
        let drawCls = await getDraw(this.map);
        drawCls.circle(this.map);
    }
    // 画图，打点
    // 异步函数，因为可能有的地图需要异步加载插件
    async drawMarker() {
        let drawCls = await getDraw(this.map);
        drawCls.marker(this.map);
    }
}

let getDraw = (() => {
    let drawCls = null;
    return (...args) => {
        if (drawCls) {
            return Promise.resolve(drawCls);
        }
        drawCls = new DrawCls();
        drawCls.create(...args);
        return Promise.resolve(drawCls);
    }
})();

let getMarkersCluster = (() => {
    let markersClusterCls = null;
    return async (...args) => {
        if (markersClusterCls) {
            return markersClusterCls;
        }
        markersClusterCls = new MarkersClusterCls();
        await markersClusterCls.create(...args);
        return markersClusterCls;
    }
})();

// 聚合点，海量点
class MarkersClusterCls {
    constructor() {
        this.markersCluster = null; // 聚合对象
    }
    async create(map, data) {
        await getPlugin('https://developers.google.cn/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js', 'marker_clusterer');
        let latlng = { lat: 44.008315, lng: 87.658551 };
        new LabelMarker({ map, latlng });
        data = data.map((o, i) => { // 数据转为标记点
            let markerObj = new LabelMarker({
                latlng: o,
                map
            });
            try {
                markerObj.onClick = (e) => {
                    console.log(this)
                }
            } catch (err) {

            }
            if (i === 1) {
                console.log(markerObj)
            }
            return markerObj;
        });
        if (this.markersCluster) {
            this.markersCluster.addMarkers(data);
        } else {
            this.markersCluster = new window.MarkerClusterer(map, data, {
                styles: this.getStyles()
                // imagePath: 'https://developers.google.cn/maps/documentation/javascript/examples/markerclusterer/m',
                // maxZoom: 13,
                // minimumClusterSize: 1
            });
        }
    }
    showTxt() {
        document.body.classList.add('googlemap-pi-ssh');
    }
    getStyles() {
        return [
            { url: img1, height: 53, width: 53 },
            { url: img2, height: 56, width: 56 },
            { url: img3, height: 66, width: 66 },
            { url: img4, height: 78, width: 78 },
            { url: img5, height: 90, width: 90 }
        ];
    }
}
async function initMap() {
    setLabelMarkerProto();
}

// 自定义标记点
function LabelMarker(options = {}) {
    this.position = new MapApi.LatLng(options.latlng.lat, options.latlng.lng);
    this.bounds = new MapApi.LatLngBounds(this.position);
    this.map = options.map;
    this.el = null;
}
// 自定义标记点的属性赋值，配置
function setLabelMarkerProto() {
    LabelMarker.prototype = new MapApi.OverlayView();
    LabelMarker.prototype.onAdd = function () {
        var div = document.createElement('div');
        div.innerHTML = `
            <div class="gmlm-imgs">
                <img src="https://a.amap.cn/jsapi_demos/static/images/blue.png" class="gmlm-img1">
                <img src="https://a.amap.cn/jsapi_demos/static/images/green.png" class="gmlm-img2">
                <img src="https://a.amap.cn/jsapi_demos/static/images/orange.png" class="gmlm-img3">
            </div>
            <div class="gmlm-txt">111</div>
        `
        div.className = 'googlemap-labelmarker-box';
        this.el = div;
        var panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(div);
        MapApi.event.addDomListener(this.el, 'click', (e) => {
            if (typeof this.onClick === 'function') {
                this.onClick(e);
            }
        });
    };
    LabelMarker.prototype.getPosition = function () {
        return this.position;
    }
    LabelMarker.prototype.draw = function () {
        var overlayProjection = this.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());
        var div = this.el;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
    };
    LabelMarker.prototype.onRemove = function () {
        this.el.parentNode.removeChild(this.el);
        this.el = null;
    };
}

// 拖拽画图
class DrawCls {
    constructor() {
        this.drawingManager = null; // 记录画图对象
    }
    create() {
        let drawingManager = this.drawingManager = new MapApi.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            markerOptions: { // 打点参数
                icon: 'https://developers.google.cn/maps/documentation/javascript/examples/full/images/beachflag.png'
            },
            polygonOptions: { // 多边形参数参数
                fillColor: '#ffff00',
                fillOpacity: 0.5,
                strokeWeight: 1,
                editable: false
            },
            circleOptions: { // 圆形参数
                fillColor: '#ffff00',
                fillOpacity: 0.5,
                strokeWeight: 1,
                editable: false
            }
        });
        this.eventBind();
        return drawingManager;
    }
    circle(map) { // 创建圆形
        this.drawingManager.setDrawingMode(MapApi.drawing.OverlayType.CIRCLE);
        this.drawingManager.setMap(map);
    }
    circleEventComplete(obj) { // 圆创建完成后的事件绑定，参数为元素对象
        obj.addListener('click', function () {
            this.setEditable(true);
            this.setDraggable(true);
        });
        obj.addListener('rightclick', function () {
            this.setEditable(false);
            this.setDraggable(false);
        });
    }
    polygon(map) { // 创建多边形
        this.drawingManager.setDrawingMode(MapApi.drawing.OverlayType.POLYGON);
        this.drawingManager.setMap(map);
    }
    polygonEventComplete(obj) { // 多边形创建完成后的事件绑定，参数为元素对象
        obj.addListener('click', function () {
            this.setEditable(true);
            this.setDraggable(true);
        });
        obj.addListener('rightclick', function () {
            this.setEditable(false);
            this.setDraggable(false);
        });
    }
    marker(map) { // 创建标记点
        this.drawingManager.setDrawingMode(MapApi.drawing.OverlayType.MARKER);
        this.drawingManager.setMap(map);
    }
    markerEventComplete(obj) { // 标记点创建完成后的事件绑定，参数为元素对象
        obj.addListener('click', function () {
            this.setDraggable(true);
        });
        obj.addListener('dragend', function () {
            this.setDraggable(false);
        });
    }
    eventBind() { // 方便操作的事件绑定
        MapApi.event.addListener(this.drawingManager, 'overlaycomplete', (e) => {
            this.drawingManager.setMap(null); // 取消画图状态
            if (e.type === 'circle') {
                this.circleEventComplete(e.overlay);
            } else if (e.type === 'polygon') {
                this.polygonEventComplete(e.overlay);
            } else if (e.type === 'marker') {
                this.markerEventComplete(e.overlay);
            }
        });
    }
}

// 获取插件
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

// 获取地图
async function getMap() {
    await getPlugin('http://www.google.cn/maps/api/js?key=AIzaSyCvoNRaKHgdvaZFCH_MYcTpU_Dtlpf3784&libraries=drawing', 'map_api');
    MapApi = window.google.maps;
    if (typeof initMap === 'function') {
        await initMap();
    }
    return MapApi;
}
export default MapApiCls
