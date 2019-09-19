import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import {IntlProvider} from 'react-intl';
import './index.css';
import App from './App';
import store from './redux/store';
import * as serviceWorker from './serviceWorker';
// 使用redux给，多语言props赋值
let IntlProviderCon = connect(
    state => {
        return {
            messages: state.languages,
            locale: 'en'
        }
    }
)(IntlProvider);
ReactDOM.render(
    (<Provider store={store}>
        <IntlProviderCon>
            <App />
        </IntlProviderCon>
    </Provider>),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
