// 底图的方法封装，方便以后更换底图
// 尽可能不要在项目中直接使用地图的原生方法属性，会造成以后更改地图比较困难
// 必须每个底图都有相同的方法和属性，否则将会造成底图切换失败问题

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
class MapboxglCls {
    constructor(options = {}) {
        this.options = Object.assign({ // 默认值
            container: options.el,
            zoom: 3,
            center: [105, 35],
            style: 'mapbox://styles/mapbox/streets-v10'
        }, options);
    }
    createMap(options = this.options) {
      return new Promise((resolve, reject) => {
        mapboxgl.accessToken = 'pk.eyJ1IjoidGlhbnNoZW40NzAiLCJhIjoiY2p6dzJheXo4MHg2eTNibWw2Mm9tMWhlMyJ9.PyNPHfxb4K8dJitdBzVchg';
        let mapOptions = Object.assign({
            container: options.el
        }, options);
        this.map = new mapboxgl.Map(mapOptions);
        this.map.on('load', () => {
          resolve(this.map);
        });
      })
    }
    draw(map = this.map) {
        if (!this.mDraw) {
            this.mDraw = new Draw(map);
        }
        return this.mDraw;
    }
}
class Draw {
    constructor(map) {
        let mDraw = this.mDraw = new MapboxDraw({
            styles: [
                // ACTIVE (being drawn)
                // line stroke
                {
                    "id": "gl-draw-line",
                    "type": "line",
                    "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                    "layout": {
                      "line-cap": "round",
                      "line-join": "round"
                    },
                    "paint": {
                      "line-color": "#D20C0C",
                      "line-dasharray": [0.2, 2],
                      "line-width": 2
                    }
                },
                // polygon fill
                {
                  "id": "gl-draw-polygon-fill",
                  "type": "fill",
                  "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                  "paint": {
                    "fill-color": "#D20C0C",
                    "fill-outline-color": "#D20C0C",
                    "fill-opacity": 0.1
                  }
                },
                // polygon outline stroke
                // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
                {
                  "id": "gl-draw-polygon-stroke-active",
                  "type": "line",
                  "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                  "layout": {
                    "line-cap": "round",
                    "line-join": "round"
                  },
                  "paint": {
                    "line-color": "#D20C0C",
                    "line-dasharray": [0.2, 2],
                    "line-width": 2
                  }
                },
                // vertex point halos
                {
                  "id": "gl-draw-polygon-and-line-vertex-halo-active",
                  "type": "circle",
                  "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                  "paint": {
                    "circle-radius": 5,
                    "circle-color": "#FFF"
                  }
                },
                // vertex points
                {
                  "id": "gl-draw-polygon-and-line-vertex-active",
                  "type": "circle",
                  "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                  "paint": {
                    "circle-radius": 3,
                    "circle-color": "#D20C0C",
                  }
                },
            
                // INACTIVE (static, already drawn)
                // line stroke
                {
                    "id": "gl-draw-line-static",
                    "type": "line",
                    "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
                    "layout": {
                      "line-cap": "round",
                      "line-join": "round"
                    },
                    "paint": {
                      "line-color": "#000",
                      "line-width": 3
                    }
                },
                // polygon fill
                {
                  "id": "gl-draw-polygon-fill-static",
                  "type": "fill",
                  "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
                  "paint": {
                    "fill-color": "#000",
                    "fill-outline-color": "#000",
                    "fill-opacity": 0.1
                  }
                },
                // polygon outline
                {
                  "id": "gl-draw-polygon-stroke-static",
                  "type": "line",
                  "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
                  "layout": {
                    "line-cap": "round",
                    "line-join": "round"
                  },
                  "paint": {
                    "line-color": "#000",
                    "line-width": 3
                  }
                }
              ],
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            }
        });
        map.addControl(mDraw);
    }
    add(data) {
        this.mDraw.add(data);
        return this;
    }
}

export default MapboxglCls
