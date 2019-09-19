// 创建全局的数据管理，store
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';

// 引入所有的需要管理的数据，reducer
import { languages } from './languages';
import { todos } from './todos';
const reducers = combineReducers({
    languages,
    todos
});

const store = createStore(reducers, applyMiddleware(thunkMiddleware));

export default store;