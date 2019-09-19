import './App.css';
import React, { Suspense, Component } from 'react';
import { HashRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { switchLanguage } from './redux/languages'
import Loading from './components/loading';
import MapCls from './mapCtrl/mapCls';
import venueIndex from './venue/VenueIndex';
class Home extends Component {
    constructor() {
        super();
        this.state = {
            a: 1
        }
    }
    async componentDidMount() {
        let mapCls = this.mapCls = new MapCls();
        mapCls.createMap({
            el: 'map_box',
            zoom: 4,
            center: {lat: 34.397, lng: 105.644}
        });
        venueIndex.init(mapCls)
    }
    async btnClick(type) {
        let mapCls = this.mapCls;
        console.log(mapCls.set('center', [110, 50]))
    }

    render() {
        return (
            <div className="btns">
                <Loading />
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
)(Home);
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Eric',
            unreadCount: 1000
        }
    }
    render() {
        return (
            <div className="app-box">
                <FormattedMessage
                    id="hello.abc"
                    tagName="div"
                    description="<b>asdf<b>似懂非懂"
                    defaultMessage="没有翻译的数据"
                    values={{ name: <b>{this.state.name}</b> }}
                ></FormattedMessage>
                <div id="map_box" className="map-box"></div>
                <Router>
                    <Suspense fallback={Loading}>
                        <Switch>
                            <Route exact path="/" component={HomeCon} />
                            <Redirect to="/" />
                        </Switch>
                    </Suspense>
                </Router>
            </div>
        );
    }
}

export default App;
