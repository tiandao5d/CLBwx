(function(win){
  var Uplott = win.Uplott = win.Uplott || 
  {
    global: win
  };
  
  //算法类型
  Uplott.OPE = [
    {'type' : 'ape_omit', 'name' : '出现次数'},
    {'type' : 'avg_omit', 'name' : '平均遗漏'},
    {'type' : 'max_omit', 'name' : '最大遗漏'},
    {'type' : 'cur_omit', 'name' : '当前遗漏'},
    {'type' : 'con_omit', 'name' : '最大连出'}
  ];  
  
  //表格的行数 
  Uplott.ROW = 0;
  
  /**
   * 改变func函数的作用域scope，即this的指向。
   * @param {Function} func 要改变函数作用域的函数。
   * @param {Object} self 指定func函数的作用对象。
   * @return {Function} 一个作用域为参数self的功能与func相同的新函数。
   */
  Uplott.delegate = function(func, self)
  {
    var context = self || win;
    if (arguments.length > 2) 
    {
      var args = Array.prototype.slice.call(arguments, 2);      
      return function() 
      {
        var newArgs = Array.prototype.concat.apply(args, arguments);
        return func.apply(context, newArgs);
      };
    }else 
    {
      return function() {return func.apply(context, arguments);};
    }
  };

  //测试浏览器类型
  function detectBrowser(ns)
  {
    var ua = ns.ua = navigator.userAgent;   
    ns.isWebKit = (/webkit/i).test(ua);
    ns.isMozilla = (/mozilla/i).test(ua); 
    ns.isIE = (/msie/i).test(ua);
    ns.isFirefox = (/firefox/i).test(ua);
    ns.isChrome = (/chrome/i).test(ua);
    ns.isSafari = (/safari/i).test(ua) && !this.isChrome;
    ns.isMobile = (/mobile/i).test(ua);
    ns.isOpera = (/opera/i).test(ua);
    ns.isIOS = (/ios/i).test(ua);
    ns.isIpad = (/ipad/i).test(ua);
    ns.isIpod = (/ipod/i).test(ua);
    ns.isIphone = (/iphone/i).test(ua) && !this.isIpod;
    ns.isAndroid = (/android/i).test(ua);
    ns.isWeixin = (/MicroMessenger/i).test(ua);
    ns.supportStorage = "localStorage" in win;
    ns.supportOrientation = "orientation" in win;
    ns.supportDeviceMotion = "ondevicemotion" in win;
    ns.supportTouch = "ontouchstart" in win;
    ns.supportCanvas = document.createElement("canvas").getContext != null;
    ns.cssPrefix = ns.isWebKit ? "webkit" : ns.isFirefox ? "Moz" : ns.isOpera ? "O" : ns.isIE ? "ms" : "";
  };
  
  detectBrowser(Uplott);

  var click_touch = Uplott.supportTouch ? 'touchstart' : 'click';
  
  /**
  * 相邻表格列之间画线
  * @element 表格对象
  * @cols 表格列数组，例如第一列和第二列进行连线[1,2]
  * @clear 是否重绘，窗口变化时要重绘  */  
  Uplott.draw_td_lines = function(table,cols,clear)
  {
    if($.type(table) === "string"){
      table = $(table);
    }
    var tds = [];
    table.find('td').each(function(){
      var $self = $(this);      
      //单元格的列是否在cols集合里     
      if($.inArray(parseInt($self.attr('data-col')), cols) > -1){
        tds.push($self);
      }
    });
    var uid = table.attr('id') + '_line_' + cols . join('_'); 
    Uplott.draw(table,tds,clear,uid);   
  };
  
  /**
  * 全表格画线
  * @table 表格对象 
  * @clear 是否重绘，窗口变化时要重绘  */  
  Uplott.draw_table = function(table,clear)
  {
    if($.type(table) === "string"){
      table = $(table);
    }
    var uid = table.attr('id');
    var tds = table.find('td[data-row]');   
    Uplott.draw(table,tds,clear,uid+'_canvas');
  };
  
  /**
  * 表格画线
  * @table 表格对象
  * @tds 画线的单元格集合
  * @clear 是否重绘，窗口变化时要重绘
  * @uid   画布唯一ID 
  */
  Uplott.draw = function(table,tds,clear,uid)
  {
    $('.term_scroller').scrollTop(0);
    $('.main_scroller').scrollTop(0);   
    setTimeout(function(){
      //表格ID
      if($.type(table) === "string"){
        table = $(table);
      }
      //获取表格的高度
      var h = table.outerHeight();
      var w = table.outerWidth();
      var offset = table.position().left;
      
      //画布的ID
      //var uid="uid"+(new Date()).getTime()+parseInt(Math.random()*100000);
      //如果重绘，删除它
      if(clear == 1 && $('#'+uid).length > 0){          
        $('#'+uid).remove();
      }           
      //在表格后面创建画布
      if($('#'+uid).length == 0){
        table.after('<canvas id="'+uid+'" width="'+w+'" height="'+h+'" style="left:'+offset+'px"></canvas>');
      }     
      //画布对象
      var context = document.getElementById(uid).getContext("2d");      
      //线条颜色
      context.strokeStyle = "rgba(0,0,255,0.3)";        
      //循环
      var n = 0;
      if($.isArray(tds))
      {
        $.each(tds,function(i,td){
          //var $self = $(this);      
          //单元格的列是否在cols集合里
          //单元格不是遗漏，有数字的单元格，就画线     
          if( ! td.is('.omit')){        
            var position  = td.position();
            var tdh     = td.innerHeight();
            var tdw     = td.innerWidth();
            var x = Math.ceil(position.left + tdw/2) - offset;
            var y = Math.ceil(position.top + tdh/2);          
            n==0 ? context.moveTo(x,y) : context.lineTo(x,y);
            n++;
          }
        }); 
      }
      else
      {
        tds.each(function(){
          var $self = $(this);
          if( ! $self.is('.omit')){   
            var position  = $self.position();
            var tdh     = $self.innerHeight();
            var tdw     = $self.innerWidth();
            var x = Math.ceil(position.left + tdw/2) - offset;
            var y = Math.ceil(position.top + tdh/2);          
            n==0 ? context.moveTo(x,y) : context.lineTo(x,y);
            n++;
          }
        });
      }
      context.stroke();
    },100);
  }

  /**
  * 和值跨度画线
  * @table 表格对象
  * @tds 画线的单元格集合
  * @clear 是否重绘，窗口变化时要重绘
  * @uid   画布唯一ID 
  */
  Uplott._draw = function(table, offset, total, clear, uid)
  {
    $('.term_scroller').scrollTop(0);
    $('.main_scroller').scrollTop(0);   
    setTimeout(function(){
      //表格ID
      if($.type(table) === "string"){
        table = $(table);
      }
      //获取表格的高度
      var h = table.outerHeight();
      var w = table.outerWidth();

      //画布的ID
      //var uid="uid"+(new Date()).getTime()+parseInt(Math.random()*100000);
      //如果重绘，删除它
      if(clear == 1 && $('#'+uid).length > 0){          
        $('#'+uid).remove();
      }           
      //在表格后面创建画布
      if($('#'+uid).length == 0){
        table.after('<canvas id="'+uid+'" width="'+w+'" height="'+h+'"></canvas>');
      }     
      //线形画布对象
      var ctx = document.getElementById(uid).getContext("2d");
            ctx.strokeStyle = "rgba(0,0,255,0.3)";
            ctx.font="14px arial";

            table.find("tr").each(function(index, el) {
              var data_sum = $(el).attr("data-sum");
              var x = (data_sum - offset) * (w / total);
              var y = $(el).position().top + $(el).height() / 2;
              index==0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
            });
            ctx.stroke();

            table.find("tr").each(function(index, el) {
              var data_sum = $(el).attr("data-sum");
              var x = (data_sum - offset) * (w / total);
                var y = $(el).position().top + $(el).height() / 2;
                var sum = $(el).attr("data-sum");
                ctx.beginPath();
                ctx.arc(x,y,5,0,Math.PI*2,true);
                ctx.closePath();
                ctx.fillStyle="#FF6600";
                ctx.fill();

                //和值位置
                var tx = (x+14) > w ? (x-6) : (x+6); 
                var ty = (y+14) > h ? (y-6) : (y+6);
                ctx.fillStyle="#FF0707";
                ctx.fillText(sum, tx, ty);
            });
            
            
    },100);
  }
  
  /**
  * 返回Uplott的字符串表示形式。
  * @return {String} Quark的字符串表示形式。
  */
  Uplott.toString = function()
  {
    return "Uplott";
  };
  
  /**
   * 简单的log方法，同console.log作用相同。
   */
  Uplott.trace = function()
  {
    var logs = Array.prototype.slice.call(arguments);
    if(typeof(console) != "undefined" && typeof(console.log) != "undefined") console.log(logs.join(" "));
  };
  
  //表格运算算法
  Uplott.table_ope = function(table,carray)
  {
    if($.type(table) === "string")
    {
      table = $(table);
    }   
    //出现次数值 
    var ape_omit = [];
    //平均遗漏
    var avg_omit = [];
    //最大遗漏
    var max_omit = [];
    //当前遗漏
    var cur_omit = [];
    //最大连出
    var con_omit = [];
    //表格列数组
    var col_array = [];   
    //获取多少行，就是记录总数
    var row_count = Uplott.ROW = table.find("tr[data-row]").length;
    //表格多少列
    var col_count = table.find('tr:first').find('td').length;
    var tds,self;

    //表格列每一列保存数组[1,2,3,4]
    if(!carray)
    {       
      for(var i = 1; i < col_count + 1; i++)
      {
        col_array.push(i);
      }
    }
    else
    {
      col_array = carray;
    }

    $.each(col_array,function(i,n){
      //初始化出现次数值      
      var ape = 0;
      //初始化平均遗漏
      var avg = 0;
      //初始化最大遗漏       
      var maxo = 0;
      //初始化当前遗漏
      var cur = 0;
      //初始化最大连出
      var con = 0;
      //初始化参数       
      var nn = 1;
      var mm = 1;

      //某一列单元格集合
      tds = table.find("td[data-col='"+n+"']");
      //出现次数
      ape = tds.not('.omit').length;
      //平均遗漏
      avg = parseInt(row_count/(ape + 1));
      //列出现次数集合
      ape_omit.push(ape);
      //平均遗漏集合  
      avg_omit.push(avg);
      
      //循环
      tds.each(function(){
        self = $(this);
        if(self.is('.omit')){
          if(nn == 1) {
            self.html(1);
          }else{
            self.html(nn);
          }
          if(nn > maxo) maxo = nn;
          mm = 1;
          nn ++;
        }else{
          if(mm > con) con = mm;            
          mm ++;          
          nn = 1;
        }
      });
      //最大遗漏
      max_omit.push(maxo);
      //最大连出  
      con_omit.push(con);
      //当前遗漏
      if(tds.last().is('.omit')){
        cur = parseInt(tds.last().text());
      }else{
        cur = 0;
      }
      cur_omit.push(cur);
    });
    return {'ape_omit' : ape_omit, 'avg_omit' : avg_omit, 'max_omit' : max_omit, 'cur_omit' : cur_omit, 'con_omit' : con_omit};
  }
  
  //表格排序
  Uplott.table_sort = function(table)
  { 
    if($.type(table) === "string")
    {
      table = $(table);
    }   
    var trs = [],row_count = table.find("tr[data-row]").length,sy;
    for(var i=row_count-1; i >= 0; i--){
      trs.push(table.find('tr').eq(i).remove());      
    }
    sy    = table.html();   
    table.html(''); 
    
    $.each(trs,function(i,n){
      table.append(n);
    }); 
    if(sy)
    {
      table.append(sy);     
    }   
    table.find('tbody').each(function(){
    	
    	if($(this).html() == '') $(this).remove();
    })
    var tr = table.find('tr:first');
    
    if(tr.attr('data-row') == 1)
    {
      $('.fix_table_header').find('i').removeClass('fa-caret-up').addClass('fa-caret-down');
    }
    else
    {
      $('.fix_table_header').find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
    }   
  }
  
  //期号排序
  Uplott.table_term_sort = function()
  {
    //期号所对应表格
    var term_table = $('.term_scroller').find('table');     
    var term_trs = [],syterm;
    if(!Uplott.ROW) Uplott.ROW = term_table.find('tr').length;
    for(var i=Uplott.ROW-1; i >= 0; i--){     
      term_trs.push($('.term_scroller').find('table').find('tr').eq(i).remove());
    }   
    syterm  = term_table.html();    
    term_table.html('');    
    $.each(term_trs,function(i,n){
      term_table.append(n);
    });   
    if(syterm)
    {   
      term_table.append(syterm);
    } 
  }
  
    
  //追加
  Uplott.table_append = function(table,lists,debar)
  {
    if($.type(table) === "string")
    {
      table = $(table);
    }   
    
    var d = '', trs = '';    
    var col = (term_width2 > 0)?'colspan="2"':''; 
    $.each(U.OPE,function(i,n){ 
          
      if(lists[n.type])
      {       
        d += '<tr><td '+col+'>'+n.name+'</td></tr>';
        var c = ''
        $.each(lists[n.type],function(j,m){
          c += '<td>'+m+'</td>';                  
        });
        //判断表格第一列是否为空
        if(debar)
        {
          trs +='<tr>';
          for(var i = 1; i <= debar; i++){
            trs +='<td></td>';
          }
          trs += c+'</tr>';
        }
        else
        {
          trs += '<tr>'+c+'</tr>';
        }       
      }   
    });
    //期号下面的统计文本判断是否已经追加过了，当是中文时，就表示追加过了
    var num = $('.term_scroller').find('table td:last').html();   
    if( ! isNaN(num))
    {     
      $('.term_scroller').find('table').append(d);
    }   
    table.append(trs);  
  }
  
  
  /**
   * 默认的全局namespace为Uplott或U（当U没有被占据的情况下）。
   */
  if(win.U == undefined) win.U = Uplott;
  if(win.trace == undefined) win.trace = Uplott.trace;
  
  //下面是初始化的东西
  //窗口宽
  var ww = $(win).width();
  //窗口高
  var wh = $(win).height();
  //最左边的期号的元素
  var $term_elemment = $('.term_scroller').find('td:first');
  var $term_elemment2 =  $('.term_scroller tr:first').find('td').eq(1);
  //主区域表头高度
  var table_header_h = $('.main_table_header').outerHeight();
  var table_header_row = $('.main_table_header:first').find('tr').length;
  //主区域top
  $('.main_scroller').css('top',(table_header_h-1) + 'px');
  //期号top
  $('.term_scroller,.ball_scroller').css('top',(table_header_h-1) + 'px');
  //获取期号div宽度
  var term_width  = $term_elemment.outerWidth();  
  var term_width2  = $term_elemment2.outerWidth()?$term_elemment2.outerWidth():0;  
  var term_height = $term_elemment.innerHeight();
  var theight   = $term_elemment.height();
  //左侧菜单宽度
  var wmenu   = $('.menulists').width();
  //设置期号div宽度
  $('.term').width(term_width + term_width2 + 'px');
  $('.swiper-container-h').css('left',(term_width + term_width2) + 'px');  
  
  $('.term tr:eq(0)').find('td').height((theight*table_header_row + term_height - theight + 2) + 'px');
  
  $('.main_scroller').scroll(function(){
	$('.term_scroller').scrollTop($(this).scrollTop());
  });
  var act_index = 0;
  var mySwiper = $('.swiper-container-h').swiper({
	  onSlideChangeStart : function(swiper){
		  
		$('.term_scroller').scrollTop($('.term_scroller').scrollTop());
    	$('.main_scroller').scrollTop($('.term_scroller').scrollTop());
    	act_index = swiper.activeIndex;
      //$('.term_scroller').scrollTop(0);
      //$('.main_scroller').scrollTop(0);               
	  }
  });
  
  //touchzone.addEventListener("touchstart", draw, false);
  $(document).on(click_touch,'.menus_left',function(){
    //左侧菜单left
    var mr  = $('.menulists').css('left');
    if(mr == '-'+wmenu+'px'){
      $('.menulists').animate({left:"0px"});    
      $('.swiper-container-h').animate({left:(wmenu)+"px"});      
    }
    else
    {   
      $('.menulists').animate({left:'-'+wmenu+'px'});   
      if($('.term').width() == 0){
        $('.swiper-container-h').animate({left:"0px"});
      }
      else
      {
        $('.swiper-container-h').animate({left:(term_width)+"px"});
      }             
    }   
  });

  $(document).on(click_touch,'.menus_right',function(){
    $('.top_nav').slideToggle();    
  });  
  
  $(".term_scroller").on(click_touch,function(){
    var term = $(this).parent('.term');     
    if(term.width() > 0){     
      term.animate({width:"0px"},function(){
        term.children().hide();
      });   
      $('.swiper-container-h').animate({left:"0px"},function(){
        mySwiper.update(true);
        var omit = new U.Omit();
        omit.draw();
      });   
    }     
  }); 
  
  $(document).on(click_touch,'.swiper-container-h',function(){
    var mr  = $('.menulists').css('left');
        var tn_display = $('.top_nav').css('display');
    if(($('.term').width() == 0) && (mr == '-'+wmenu+'px')){
      $('.term').children().show();
      $('.term').animate({width:term_width + "px"});
      $('.swiper-container-h').animate({left:(term_width)+"px"},function(){
        mySwiper.update(true);
        var omit = new U.Omit();
        omit.draw();
      });
    }
        if(mr == '0px'){
            $('.menus_left').trigger(click_touch);
        }

        if(tn_display == 'block'){
            $('.menus_right').trigger(click_touch);
        }
  });
  
  $(document).on('click','#omit',function(){
    if($(this).is(':checked'))
    {
      $('.omit').css('opacity','1');
    }
    else
    {
      $('.omit').css('opacity','0');        
    }       
  });
  
  $(document).on('click','#fold_line',function(){
    if($(this).is(':checked'))
    {
      $('canvas').show();
    }
    else
    {
      $('canvas').hide();           
    }       
  });
  
  $(document).on('click',':radio[name="limit"]',function(){
    //var limit = $(this).val();
    $('#startdate').val();
    $('#enddate').val();
    $('form').submit();           
  });
  
  $(document).on(click_touch,'#send',function(){
    //var limit = $(this).val();
    var startdate   = $('#startdate').val();
    var enddate   = $('#enddate').val();
    if( ! startdate)
    {
      alert('开始日期不能为空');
      return false;
    }
    if( ! enddate)
    {
      alert('结束始日期不能为空');
      return false;
    }
    $('form').submit();           
  });
  
  
  $('#startdate').Zebra_DatePicker();
  $('#enddate').Zebra_DatePicker();   
})(window);
