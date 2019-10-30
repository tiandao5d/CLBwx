import { request } from '../utils/utilsIndex';
import { userInfoL } from '../utils/storage';
import blue from '../img/blue.png';
import green from '../img/green.png';
import orange from '../img/orange.png';

let mapCls = null;
class VenueIndex {
    constructor() {
        this.mapCls = null;
    }
    async init(cls) {
        mapCls = this.mapCls = cls;
        // await venueService.login();
        async function aaa(body) {
            let res = await venueService.search(body);
            if ( !res.data ) {
                return false;
            }
            res.data = res.data.map(o => {
                return Object.assign(o, {imgs: [blue, green, orange]})
            });
            if (res.data) {
                mapCls.markerCluster({
                    data: res.data,
                    type: res.type.includes('geo') ? 'cluster' : 'detail'
                });
            }
        }
        // let yy = venueService.getFilterObj();
        // yy.aggs = 'point';
        // venueService.search(yy)
        //     .then(res => {
        //         console.log(res)
        //     })
        let fil = venueService.getFilterObj();
        aaa();
        let a = (e) => {
            let zoom = mapCls.get('zoom');
            let aggs = fil.aggs;
            if (zoom > 15) {
                fil.filter.bbox = mapCls.get('extent');
                fil.aggs !== 'point' && Object.assign(fil, { aggs: 'point' });
            } else if (zoom > 12) {
                fil.bbox = null;
                fil.aggs !== 'geo4' && Object.assign(fil, { aggs: 'geo4' });
            } else if (zoom > 8) {
                fil.bbox = null;
                fil.aggs !== 'geo3' && Object.assign(fil, { aggs: 'geo3' });
            } else if (zoom > 4) {
                fil.bbox = null;
                fil.aggs !== 'geo2' && Object.assign(fil, { aggs: 'geo2' });
            }
            if (aggs !== fil.aggs || aggs === 'point') {
                aaa(fil);
            }
        }
        mapCls.on('centerZoomChange', a)
    }
}

class VenueService {
    getFilterObj() {
        return {
            search: null,
            filter: {
                geo3_id: [],
                venue_status: ['open', 'remodelling', 'future', 'closed'],
                lgl_category: [],
                lgl_sku: [],
                venue_group: [],
                open_date: [null, null],
                lgl_lsku: [],
                store_sku: {
                    has_any: [],
                    min_has: 0,
                    lack_any: [],
                    min_lack: 0,
                    combine: 'and'
                },
                total_area: [null, null],
                has_ifp: true,
                has_wsa: null,
                lgl_venue_of_interest: null,
                coordinate: [],
                bbox: null
            },
            coord_sys: 'gww',
            only_vcl: true,
            sort: null,
            offset: 0,
            limit: 50,
            aggs: 'geo2'
        }
    }
    search(body = this.getFilterObj()) {
        return request({
            method: 'post',
            url: '/layers/venues/_search',
            body: body
        }).then(res => {
            if (res.aggregations) {
                res = this.formatPointData(res);
                return res;
            }
            return res;
        });
    }
    formatPointData(res) {
        let data = res.aggregations;
        let type = Object.keys(data)[0];
        data = data[type].buckets;
        type = type.split('_').pop();
        if (type.startsWith('geo')) {
            data = data.map(o => {
                return {
                    lnglat: {
                        lat: o.centroid.location.lat,
                        lng: o.centroid.location.lon
                    },
                    text: o.doc_count,
                    [(type + 'Id')]: o.key
                }
            });
        } else if (type === 'latlng') {
            type = 'point';
            data = data.map(o => {
                let ll = o.key.split(',').map(s => parseFloat(s));
                let arr = ((o.venue_samples || {}).hits || {}).hits;
                arr = arr.map(obj => {
                    let polygon = null;
                    for (let k in obj) {
                        if (k.startsWith('b_txt_')) {
                            polygon = JSON.parse(obj[k]);
                        }
                    }
                    return {
                        index: obj._index,
                        polygon,
                        ...obj._source
                    }
                });
                return {
                    lnglat: {
                        lng: ll[1],
                        lat: ll[0]
                    },
                    arr
                }
            })
        }
        return { data, type };
    }
    login(obj) {
        return request({
            url: '/login',
            method: 'post',
            body: JSON.stringify(obj)
        }).then(res => {
            if (res.token) {
                return userInfoL(res);
            }
        })
    }
}
const venueService = new VenueService();
const venueIndex = new VenueIndex();
export default venueIndex;
