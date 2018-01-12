import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Box extends React.Component {
  constructor(props){
    super(props);
    var w = 10,
        h = 10;
    this.state = {
      w: w,
      h: h,
      arr: new Array(w*h).fill(''),
      val: '',
      win: false
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
      val: '',
      win: false
    })
  }
  btnclick(e){
    var arr = this.state.arr,
        index = parseInt(e.target.getAttribute('data-index'), 10),
        val = this.state.val;
    if(arr[index] || this.state.win){
      return false;
    };
    val === 'X' ? val = 'O' : val = 'X';
    arr[index] = val;
    this.setState({
      arr: arr,
      val: val
    });
    this.isWin(index);
  }
  isWin(index){
    var arr = this.state.arr,//数据
        w = this.state.w,//一行有多少个
        val = arr[index];//当前值
    if(
      (this.geTctnuArr(index, 1, 'lr').length >= 5)||//水平
      (this.geTctnuArr(index, w, 'tb').length >= 5)||//垂直
      (this.geTctnuArr(index, (w - 1)).length >= 5)||//自左向右，斜上
      (this.geTctnuArr(index, (w + 1)).length >= 5)//自左向右，斜下
      ){
        this.setState({win: (val + '赢了！')});
      }
  }
  render() {
    var arr = this.state.arr,
        elearr = arr.map((txt, index) => (<div className="grid-btn" data-index={index} onClick={this.btnclick} key={index}>{this.state.arr[index]}</div>));
    return (
      <div>
        <div className="player-ele">{this.state.win || ((this.state.val === 'X' ? 'O' : 'X') + '选手落子')}</div>
        <div className="player-ele">
          <button className="reset-btn" onClick={() => {this.reset()}}>重置</button>
        </div>
        <div className="grid-box" style={{width: ((this.state.w*30 - this.state.w) + 'px')}}>{elearr}</div>
      </div>
    );
  }
}
ReactDOM.render(
  <Box/>,
  document.getElementById('root')
);
