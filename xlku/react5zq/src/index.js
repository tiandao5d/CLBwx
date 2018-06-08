import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import img1 from './images/001.jpg';
import img2 from './images/002.jpg';
import img3 from './images/003.jpg';

class Box extends React.Component {
  constructor(props){
    super(props);
    var w = 10,
        h = 10;
    this.state = {
      w: w,
      h: h,
      arr: new Array(w*h).fill(''),
      val: 'X',
      winarr: null
    }
    this.btnclick = this.btnclick.bind(this);
  }
  //连续可用值数组
  //返回当前序列上连续的同样值角标数组
  //i, 当前角标， intval前一个和后一个的间隔，dir遇到边界终止
  geTctnuArr(i, intval, dir){
    var b = [],
        arr = this.state.arr,//数据
        w = this.state.w,//一行有多少个
        h = this.state.h;//一列多少个格子
    var val = arr[i];
    //当前是否是边界
    //返回lr为左右边界
    //返回tb为上下编辑
    //否则不是边界返回false
    //i, 当前角标
    function isgb(i){
      var lr = (i + 1)%w,//等于0或者等于1左右边界
          tb = Math.ceil((i + 1)/w);//等于1或者等于列数为上下边界
      if((lr === 0) || (lr === 1)){//左右边界
        return 'lr';
      }else if((tb === 1) || (tb === h)){//上下边界
        return 'tb';
      }else{//不是边界
        return false;
      }
    }
    //
    function istrue(i){
      if(dir === 'lr'){
        return !(isgb(i) === 'lr');//不允许是左右边界
      }else if(dir === 'tb'){
        return !(isgb(i) === 'tb');//不允许是上下边界
      }else{
        return !(isgb(i));//不允许是边界
      }
    }
    //找出链接的最左边
    while(123){//无限循环
      //判断是否打断的条件
      if(arr[i - intval] === val && istrue(i)){
        i -= intval;
      }else{
        break;
      }
    }
    while(123){//无限循环
      b[b.length] = i;
      //判断是否打断的条件
      if((arr[i + intval] === val) && istrue(i)){
        i += intval;
      }else{
        break;
      }
    }
    return b;
  }
  //重置游戏
  reset(){
    var w = this.state.w,//一行有多少个
        h = this.state.h;//一列多少个格子
    this.setState({
      w: w,
      h: h,
      arr: new Array(w*h).fill(''),
      val: 'X',
      winarr: null
    })
  }
  btnclick(e){
    var arr = this.state.arr,
        index = parseInt(e.target.getAttribute('data-index'), 10),
        val = this.state.val;
    if(arr[index] || this.state.winarr){
      return false;
    };
    val = val === 'X' ? 'O' : val === 'O' ? 'X' : '';
    arr[index] = val;
    this.setState({
      arr: arr,
      val: val
    });
    this.isWin(index);
  }
  isWin(index){
    var w = this.state.w;//一行有多少个
    var winarr = this.geTctnuArr(index, 1, 'lr'); // 水平
    if ( !(winarr.length >= 5) ) {
      winarr = this.geTctnuArr(index, w, 'tb'); // 垂直
    }
    if ( !(winarr.length >= 5) ) {
      winarr = this.geTctnuArr(index, (w - 1)); // 自左向右，斜上
    }
    if ( !(winarr.length >= 5) ) {
      winarr = this.geTctnuArr(index, (w + 1)); // 自左向右，斜下
    }
    if( winarr.length >= 5 ){
        this.setState({winarr});
      }
  }
  formatval ( val, rev ) {
    if ( rev ) { // 逆转
      val = val === 'X' ? 'O' : val === 'O' ? 'X' : ''
    }
    if ( val === 'X' ) {
      return <img className="chess-img" alt="ll" src={img2}/>
    } else if ( val === 'O' ) {
      return <img className="chess-img" alt="xl" src={img3}/>
    } else {
      return <span></span>
    }
  }
  render() {
    var arr = this.state.arr,
        winarr = this.state.winarr,
        elearr = arr.map((txt, index) => {
          let valele = this.formatval(this.state.arr[index]),
              valcls = (winarr && (winarr.indexOf(index) >= 0)) ? 'winele' : '';
          return <div className={'grid-btn ' + valcls} data-index={index} onClick={this.btnclick} key={index}>{valele}</div>
        }),
        curele = null,
        curbox = null;
        if ( winarr ) {
          curele = this.formatval(this.state.val)
          curbox = <div>{curele}赢了！</div>
        } else if ( this.state.val ) {
          curele = this.formatval(this.state.val, true)
          curbox = <div>{curele}选手落子</div>
        }
    return (
      <div className="page-box">
        <img src={img1} alt="linling" className="linling"/>
        <div className="grid-body">
          <div className="player-ele">{curbox}</div>
          <div className="player-ele">
            <button className="reset-btn" onClick={() => {this.reset()}}>重置</button>
          </div>
          <div className="grid-box" style={{width: ((this.state.w*30 - this.state.w) + 'px')}}>{elearr}</div>
        </div>
      </div>
    );
  }
}
ReactDOM.render(
  <Box/>,
  document.getElementById('root')
);
