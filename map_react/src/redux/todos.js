// todos的管理详情
// 包括action,reducer


// 方便查看和防止全局字段污染
const acType = typeInit();
const { addTodo } = actionInit();
const { todos } = reducerInit();
export { addTodo, todos };

// 字符串常量初始化
function typeInit() {
    return {
        // 数据添加请求
        REQUEST_ADD_TODO: 'REQUEST_ADD_TODO',
        SUCCESS_ADD_TODO: 'SUCCESS_ADD_TODO',
        ERROR_ADD_TODO: 'ERROR_ADD_TODO',

        // 数据获取请求
        REQUEST_GET_TODOS: 'REQUEST_GET_TODOS',
        SUCCESS_GET_TODOS: 'SUCCESS_GET_TODOS',
        ERROR_GET_TODOS: 'ERROR_GET_TODOS'
    }
}

// 数据 reducer
function reducerInit() {
    function todos(state = {
        isFetching: false,
        items: [],
        error_msg: ''
    }, action) {
        switch (action.type) {
            // 添加新项目
            case acType.REQUEST_ADD_TODO:
                return Object.assign({}, state, { isFetching: true });

            case acType.SUCCESS_ADD_TODO:
                return Object.assign({}, state, action.res, { isFetching: false });

            case acType.ERROR_ADD_TODO:
                return Object.assign({}, state, { isFetching: false, error_msg: '错误' });

            // 原数据获取
            case acType.REQUEST_GET_TODO:
                return Object.assign({}, state, { isFetching: true });

            case acType.SUCCESS_GET_TODO:
                return Object.assign({}, state, action.res, { isFetching: false });

            case acType.ERROR_GET_TODO:
                return Object.assign({}, state, { isFetching: false, error_msg: '错误' });

            default:
                return state;
        }
    }
    return { todos };
}

// action
function actionInit() {
    function requestAddTodo(req) {
        return {
            type: acType.REQUEST_ADD_TODO,
            req
        }
    }
    function successAddTodo(res) {
        return {
            type: acType.SUCCESS_ADD_TODO,
            res
        }
    }
    function errorAddTodo(res) {
        return {
            type: acType.ERROR_ADD_TODO,
            res
        }
    }

    function addTodo(req) {
        return function (dispatch) {
            dispatch(requestAddTodo({ a: '132' }));
            return getyy().then(res => {
                dispatch(successAddTodo(res));
                return res;
            }).catch(res => {
                dispatch(errorAddTodo(res));
                return res;
            })
        }
    }

    function getTodo(req) {
        return function (dispatch) {
            dispatch(requestAddTodo({ a: '132' }));
            return getyy().then(res => {
                dispatch(successAddTodo(res));
                return res;
            }).catch(res => {
                dispatch(errorAddTodo(res));
                return res;
            })
        }
    }

    function getyy() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ items: [{ txt: 1, id: 1 }] });
                // reject({error_msg: '错误'});
            }, 2000);
        })
    }
    return { addTodo, getTodo };
}