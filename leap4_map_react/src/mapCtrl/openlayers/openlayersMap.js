import './openlayersMap.css';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import LayerGroup from 'ol/layer/Group';
import { Tile as TileLayer } from 'ol/layer.js';
import { transform, transformExtent } from 'ol/proj.js';
import { OSM, XYZ } from 'ol/source.js';
import Collection from 'ol/Collection';

let baseTileMap = null; // 底图瓦片的切换
let map = null; // 只能渲染一个地图出来
let mapEventBind = null; // 事件绑定的方式
class OpenLayers {
    constructor(options = {}) {
        this.options = Object.assign({ // 默认值
            container: options.el,
            zoom: 5,
            center: { lat: 35, lng: 105 }
        }, options);
    }
    async createMap(options = {}) { // 弄成异步比较方便
        if ( map ) {
            return false;
        }
        let mapOptions = Object.assign({
            container: options.el,
            enableMapClick: false
        }, options);
        mapOptions.container = typeof mapOptions.container === 'string' ? document.getElementById(mapOptions.container) : mapOptions.container;
        mapOptions.container.innerHTML = ''; // 容器必须是空的
        map = new Map({
            view: new View({
                center: mapOptions.center ? formatCoord([mapOptions.center.lng, mapOptions.center.lat]) : formatCoord([104.218032, 35.599101]),
                zoom: mapOptions.zoom || 4
            }),
            layers: [
                baseTileMap.layerGroup
            ],
            overlays: markerCluster.overlays,
            target: mapOptions.container
        });
    }
    on() {
        mapEventBind.on(...arguments);
    }

    off() {
        mapEventBind.off(...arguments);
    }

    get(type) { // 暴露的获取数据的接口
        let view = map.getView();
        if ( type === 'extent' ) { // 获取当前显示的矩形界面
            return transformExtent(view.calculateExtent(), 'EPSG:3857', 'EPSG:4326')
        }
        if ( type === 'center' ) { // 获取中心点坐标
            let arr = formatCoord(view.getCenter(), true);
            return {
                lng: arr[0],
                lat: arr[1]
            }
        }
        if ( type === 'zoom' ) { // 获取缩放层级
            return view.getZoom();
        }
    }

    set(type, val) { // 暴露的这是接口
        let view = map.getView();
        if ( type === 'center' ) {
            return view.setCenter(formatCoord(val));
        }
        if ( type === 'zoom' ) {
            return view.setZoom(val);
        }
    }

    // 批量的点聚合
    async markerCluster(data) {
        markerCluster.render(data);
    }
}

// 外部可以绑定的地图事件
class MapEventBindCls {
    constructor() {
        this.evtObj = {
            centerZoomChange: this.centerZoomChange()
        }
    }
    centerZoomChange() {
        let o = {
            type: 'moveend',
            arr: [],
            refn
        }
        function refn (e) {
            o.arr.forEach(fn => fn());
        }
        return o;
    }
    on(type, fn) {
        if ( !Object.keys(this.evtObj).includes(type) ) { // 没有这个事件
            return false;
        }
        let o = this.evtObj[type];
        if ( o.arr.includes(fn) ) { // 已经绑定了同一个函数了
            return false;
        }
        if ( o.arr.length === 0 ) { // 还没有绑定过这个事件
            map.on(o.type, o.refn);
        }
        o.arr.push(fn); // 添加一个新的事件回调
    }
    off(type, fn) {
        if ( !Object.keys(this.evtObj).includes(type) ) { // 没有这个事件
            return false;
        }
        let o = this.evtObj[type];
        if ( !o.arr.includes(fn) ) { // 没有绑定过这个函数，无需解绑
            return false;
        }
        o.arr = o.arr.filter(afn => !(afn === fn));
        if ( o.arr.length === 0 ) { // 已经没有可执行函数了，可以解除整个的事件绑定
            map.un(o.type, o.refn);
        }
    }
}
mapEventBind = new MapEventBindCls();

class MarkerClusterCls {
    constructor(options) {
        this.markers = [];
        this.overlays = new Collection();
    }
    render(res) {
        this.overlays.clear()
        this.markers = res.data.map(o => {
            return this.marker({
                position: o.lnglat,
                text: o.text,
                type: res.type,
                imgs: (o.imgs || [])
            })
        })
        this.overlays.extend(this.markers);
    }
    marker(options) {
        let div = document.createElement('div');
        div.className = 'lgolmap-labelmarker';
        if ( options.type === 'cluster' ) { // 聚合点
            div.innerHTML = this.getClusterHtml(options);
        } else if ( options.type === 'detail' ) { // 详情点
            div.innerHTML = this.getDetailHtml(options);
        }
        return new Overlay({
            position: formatCoord(options.position),
            positioning: 'center-center',
            element: div,
            stopEvent: false
        });
    }
    showTxt() {
        document.body.classList.add('lgolmap-lm-ssh');
    }
    getClusterHtml(options) {
        return `
            <div class="lgolmap-lm-circle"></div>
            <div class="lgolmap-lm-txt txt-show center">${options.text || ''}</div>
        `
    }
    getDetailHtml(options) {
        return `
            <div class="lgolmap-lm-imgs">
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
                        return `<img src="${s}" class="lgolmap-lm-img${i + 1} ${c}">`
                    }).join('')
                }
            </div>
            <div class="lgolmap-lm-txt">${options.text || ''}</div>
        `
    }
}
let markerCluster = new MarkerClusterCls();

function formatCoord() {
    let arg0 = arguments[0];
    let arg1 = arguments[1];
    let reverse = false;
    let t = typeof arg0;
    let o = { lat: 0, lng: 0 };
    if ( t === 'number' ) {
        o.lng = arg0;
        o.lat = arg1;
        reverse = !!arguments[2];
    } else if ( t === 'object' ) {
        if ( arg0 instanceof Array ) {
            o.lng = arg0[0];
            o.lat = arg0[1];
        } else {
            o.lng = arg0.lng;
            o.lat = arg0.lat;
        }
        reverse = !!arguments[1];
    }
    if ( reverse ) {
        return transform([o.lng, o.lat], 'EPSG:3857', 'EPSG:4326');
    }
    return transform([o.lng, o.lat], 'EPSG:4326', 'EPSG:3857');
}

// 底图设置与切换
class BaseTileMapCls {
    constructor() {
        this.oldTileMap = null;
        this.curTileMap = null;
        this.layerGroup = new LayerGroup({
            layers: [this.get('goole')]
        });
    }
    switchMap(type) {
        if ( !type || this.curTileMap.get('type') === type ) {
            return false;
        }
        this.layerGroup.setLayers(new Collection([this.get(type)]));
    }
    get(type = 'OSM') {
        this.oldTileMap = this.curTileMap;
        this.curTileMap = (this[type] && this[type]()) || this.OSM();
        return this.curTileMap;
    }
    goole() {
        return new TileLayer({
            title: 'google street',
            coordSys: 'gww',
            type: 'goole',
            visible: true,
            source: new XYZ({
                url: 'https://mt2.google.cn/maps/vt?lyrs=m&hl=en-US&gl=CN&&x={x}&y={y}&z={z}',
                crossOrigin: 'anonymous'
            })
        })
    }
    OSM() {
        return new TileLayer({
            type: 'OSM',
            source: new OSM()
        })
    }
}
baseTileMap = new BaseTileMapCls();

export default OpenLayers;