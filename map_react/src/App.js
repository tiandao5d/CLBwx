import './App.css';
import React, { Suspense, Component } from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { switchLanguage } from './redux/languages'
import Loading from './components/loading';
import mapCls from './mapCtrl/mapCls';
import venueIndex from './venue/VenueIndex';
import { mapOptionsL, languageL } from './utils/storage';
import WrappedNormalLoginForm from './components/login';
class Others extends Component {
    constructor() {
        super();
        this.state = {
            name: 'Eric',
            unreadCount: 1000,
            a: 1
        }
    }
    async componentDidMount() {
        venueIndex.init(mapCls);
    }
    async btnClick(type) {
        this.props.history.push('/login')
        // let lan = languageL().language;
        // this.props.dispatch(switchLanguage((lan === 'zh_cn' ? 'en_us' : 'zh_cn')));
        // let mapCls = this.mapCls;
        // console.log(mapCls.set('center', [110, 50]))
    }

    render() {
        return (
            <div className="btns">
                <Loading />
                <FormattedMessage
                    id="hello.abc"
                    tagName="div"
                    description="<b>asdf<b>似懂非懂"
                    defaultMessage="没有翻译的数据"
                    values={{ name: <b>{this.state.name}</b> }}
                ></FormattedMessage>
                <button onClick={() => { this.btnClick('polygon') }}>polygon</button>
                <button onClick={() => { this.btnClick('circle') }}>circle</button>
                <button onClick={() => { this.btnClick() }}>123</button>
            </div>
        );
    }
}
let HomeCon = connect(
    state => {
        return { languages: state.languages }
    }
)(Others);
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMapSuccess: false
        }
    }
    async mapInit () {
        let obj = mapOptionsL() || {};
        await mapCls.createMap({
            el: 'map_box',
            zoom: obj.zoom,
            center: obj.center
        });
        mapCls.on('centerZoomChange', () => {
            let obj = {
                center: mapCls.get('center'),
                zoom: mapCls.get('zoom')
            }
            mapOptionsL(obj);
        });
        // 地图加载完成之后才改变状态，执行其余的操作
        // 本应用的所有操作都是基于地图上面的
        this.setState({
            isMapSuccess: true
        });
    }
    componentDidMount() {
        this.mapInit();
    }
    render() {
        return (
            <div className="app-box">
                <div id="map_box" className="map-box"></div>
                {this.state.isMapSuccess ? (
                    <Router>
                        <Suspense fallback={Loading}>
                            <Switch>
                                <Route exact path="/" component={HomeCon} />
                                <Route path="/login" component={WrappedNormalLoginForm}/>
                                <Redirect to="/" />
                            </Switch>
                        </Suspense>
                    </Router>
                ) : null}
            </div>
        );
    }
}

export default App;
