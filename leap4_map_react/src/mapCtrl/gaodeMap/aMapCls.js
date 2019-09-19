// 底图的方法封装，方便以后更换底图
// 尽可能不要在项目中直接使用地图的原生方法属性，会造成以后更改地图比较困难
// 必须每个底图都有相同的方法和属性，否则将会造成底图切换失败问题

// 高德地图的类
// key bf7426474df5a402106cbb501c0bb6e2
import './aMapCls.css'
let MapApi = null;
class MapApiCls {
    constructor(options = {}) {
        this.options = Object.assign({ // 默认值
            container: options.el,
            zoom: 4,
            center: [105, 35]
        }, options);
    }
    async createMap(options = this.options) {
        await getMapApi();
        MapApi = this.MapApi = window.AMap;
        let mapOptions = Object.assign({
            container: options.el
        }, options);
        let map = this.map = new MapApi.Map(mapOptions.container, mapOptions);
        return new Promise((resolve, reject) => {
            map.on('complete', function () {
                resolve(map);
            });
        })
    }
    async createPoints(data, map = this.map) {
        let pointsCls = this.pointsCls;
        if (!pointsCls) {
            pointsCls = this.pointsCls = new PointsCls();
        }
        await pointsCls.create(data, map);
        return pointsCls;
    }
    async drawPolygon() {
        let drawCls = await getDraw(this.map);
        console.log(drawCls)
        drawCls.polygon();
    }
    async drawCircle() {
        let drawCls = await getDraw(this.map);
        drawCls.circle();
    }
}
let getDraw = (() => {
    let drawCls = null;
    return async (map) => {
        if ( drawCls ) {
            return Promise.resolve(drawCls);
        }
        drawCls = new DrawCls();
        await drawCls.create(map);
        return drawCls;
    }
})();

// 拖拽画图
class DrawCls {
    constructor() {
        this.mouseTool = null; // 记录画图对象
    }
    async create(map) {
        await addPlugin(['MouseTool', 'PolyEditor', 'CircleEditor']);
        this.mouseTool = new MapApi.MouseTool(map);
        this.mouseTool.on('draw', (e) => {
            let CLASS_NAME = e.obj.CLASS_NAME;
            if ( CLASS_NAME === 'MapApi.Polygon' ) {
                this.polygonFn(e.obj, map);
            } else if ( CLASS_NAME === 'MapApi.Circle' ) {
                this.circleFn(e.obj, map);
            }
            this.mouseTool.close(true);
        })
    }
    polygon(options = {}) {
        this.mouseTool.polygon()
    }
    polygonFn(obj, map) {
        let gobj = new MapApi.Polygon(obj.Je);
        let editObj = new MapApi.PolyEditor(map, gobj);
        let editType = 0;
        map.add(gobj);
        gobj.on('click', () => {
            if ( editType === 0 ) {
                editType = 1;
                editObj.open();
            }
        });
        editObj.on('end', (e) => {
            console.log(e);
        });
        document.addEventListener('contextmenu', () => {
            if ( editType === 1 ) {
                editType = 0;
                editObj.close();
            }
        });
    }
    circle(options = {}) {
        this.mouseTool.circle()
    }
    circleFn(obj, map) {
        let gobj = new MapApi.Circle(obj.Je);
        let editObj = new MapApi.CircleEditor(map, gobj);
        let editType = 0;
        map.add(gobj);
        gobj.on('click', () => {
            if ( editType === 0 ) {
                editType = 1;
                editObj.open();
            }
        }).on('mouseover', () => {
            map.setDefaultCursor('default');
        }).on('mouseout', () => {
            map.setDefaultCursor('');            
        });
        editObj.on('end', (e) => {
            console.log(e);
        });
        document.addEventListener('contextmenu', () => {
            if ( editType === 1 ) {
                editType = 0;
                editObj.close();
            }
        });
    }
}

// 创建聚合点
class PointsCls {
    constructor() {
        this.cluster = null; // 记录当前数据
    }
    async create(data, map) {
        await addPlugin('MarkerClusterer');
        let markers = this.formatPoints(data);
        if (this.cluster) {
            this.cluster.setMap(null);
        }
        this.cluster = new MapApi.MarkerClusterer(map, markers, { gridSize: 80, maxZoom: 15 });
    }
    labelSH ( bl ) {
        if ( bl ) {
            document.querySelector('#map_box').classList.add('amap-pi-ssh');
        } else {
            document.querySelector('#map_box').classList.remove('amap-pi-ssh');
        }
    }
    formatPoints(points) {
        
        points = points.slice(0, 200);
        let markers = points.map(o => {
            return new MapApi.Marker({
                position: o['lnglat'],
                content: `<div class="amap-point-item">
                    <img src="https://a.amap.com/jsapi_demos/static/images/blue.png" class="amap-pi-img1">
                    <img src="https://a.amap.com/jsapi_demos/static/images/green.png" class="amap-pi-img2">
                    <img src="https://a.amap.com/jsapi_demos/static/images/orange.png" class="amap-pi-img3">
                    <span>111</span>
                </div>`,
                // content: '<div style="background-color: hsla(60, 100%, 50%, 0.7); height: 20px; width: 20px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;"></div>',
                offset: new MapApi.Pixel(-11, -11)
            })
        });
        return markers;
    }
}

function addPlugin(ks) {
    if (typeof ks === 'string') {
        ks = [ks];
    }
    let pks = ks.map(k => {
        if (MapApi[k]) {
            return Promise.resolve(MapApi[k]);
        }
        return new Promise(resolve => {
            MapApi.plugin(('MapApi.' + k), () => {
                resolve(MapApi[k]);
            })
        })
    });
    return Promise.all(pks);
}

function getMapApi() {
    return new Promise((resolve, reject) => {
        let jsapi = document.querySelector('#map_api') || document.querySelector('[src^="https://webapi.amap.com/maps"]');
        if (jsapi) {
            resolve();
            return false;
        }
        let url = 'https://webapi.amap.com/maps?v=1.4.15&key=bf7426474df5a402106cbb501c0bb6e2';
        jsapi = document.createElement('script');
        jsapi.onload = function () {
            resolve();
        }
        jsapi.charset = 'utf-8';
        jsapi.src = url;
        jsapi.id = 'map_api';
        document.head.appendChild(jsapi);
    })
}
export default MapApiCls
