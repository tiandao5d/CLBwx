import './style.css';
import './style.less';
import 'jquery';
// import keys from 'core-js/features/object/keys';
let component = () => {
    let el = document.createElement('div');
    let a = [1,2,3,4];
    let b = {a: 1, b: 2, c: 3};

    // console.log(keys)
    el.className = 'box';
    el.innerHTML = '你sdf大爷的1' + [...a, 456].join('|') + Object.keys(b).join('|');

    return el;
}

document.body.appendChild(component());