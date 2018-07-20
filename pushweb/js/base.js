$(function() {

	//查看表格
    $(document).on('click', '#check', function() {
        $("select[name='sel']").each(function() {
            var red = $('.redBall').val(); //选红球数
            var blue = $('.blueBall').val(); //选篮球数
            $('#prize').html(fun_prize(red, blue)); //总奖金
            $('#zzs').html(fun_zzs(red, blue)); //总注数

        	for(var i = 1; i < 11; i++){ //行
        		for(var j = 1; j < 7; j++){ //列

        			if(blue == 1){
            			switch(i){
            				case 1: if(j==1){ //一等奖
            							var aa = C(6,6)*C(red-6,0);
            							td_val(i,j,aa);
			            			} else if(j==2){ //二等奖
			            				var aa = '0';
			            				td_val(i,j,aa);
			            			} else if(j==3){ //三等奖
			            				var aa = C(6,5)*C(red-6,1);
			            				td_val(i,j,aa);
			            			} else if(j==4){ //四等奖
			            				var aa = C(6,4)*C(red-6,2);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(6,3)*C(red-6,3);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(6,2)*C(red-6,4)+C(6,1)*C(red-6,5)+C(6,0)*C(red-6,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
			            	case 2: if(j==2){ //二等奖
			            				var aa = C(6,6)*C(red-6,0);
			            				td_val(i,j,aa);
			            			} else if(j==4){ //四等奖
			            				var aa = C(6,5)*C(red-6,1);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(6,4)*C(red-6,2);
			            				td_val(i,j,aa);
			            			}
			            			break;
			            	case 3: if(j==3){ //三等奖
			            				var aa = C(5,5)*C(red-5,1);
			            				td_val(i,j,aa);
			            			} else if(j==4){ //四等奖
			            				var aa = C(5,4)*C(red-5,2);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(5,3)*C(red-5,3);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(5,2)*C(red-5,4)+C(5,1)*C(red-5,5)+C(5,0)*C(red-5,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
			            	case 4: if(j==4){ //四等奖
			            				var aa = C(5,5)*C(red-5,1);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(5,4)*C(red-5,2);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			case 5: if(j==4){ //四等奖
			            				var aa = C(4,4)*C(red-4,2);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(4,3)*C(red-4,3);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(4,2)*C(red-4,4)+C(4,1)*C(red-4,5)+C(4,0)*C(red-4,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			case 6: if(j==5){ //五等奖
			            				var aa = C(4,4)*C(red-4,2);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			case 7: if(j==5){ //五等奖
			            				var aa = C(3,3)*C(red-3,3);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(3,2)*C(red-3,4)+C(3,1)*C(red-3,5)+C(3,0)*C(red-3,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			default: if(j==6){ //六等奖
			            				var aa = C(2,2)*C(red-2,4)+C(2,1)*C(red-2,5)+C(2,0)*C(red-2,6);
			            				td_val(i,j,aa);
			            			 }
			            			 break;
            			}
        			} else {
        				switch(i){
            				case 1: if(j==1){ //一等奖
            							var aa = C(6,6)*C(red-6,0);
		            					td_val(i,j,aa);
			            			} else if(j==2){ //二等奖
			            				var aa = C(6,6)*C(red-6,0)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==3){ //三等奖
			            				var aa = C(6,5)*C(red-6,1);
			            				td_val(i,j,aa);
			            			} else if(j==4){ //四等奖
			            				var aa = C(6,4)*C(red-6,2)+C(6,5)*C(red-6,1)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(6,3)*C(red-6,3)+C(6,4)*C(red-6,2)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖 
			            				var aa = C(6,2)*C(red-6,4)+C(6,1)*C(red-6,5)+C(6,0)*C(red-6,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
			            	case 2: if(blue==16){
			            				var aa = '0';
			            				td_val(i,j,aa);
			            			} else {
			            				if(j==2){ //二等奖
				            				var aa = C(6,6)*C(red-6,0)*C(blue,1);
				            				td_val(i,j,aa);
				            			} else if(j==4){ //四等奖 
				            				var aa = C(6,5)*C(red-6,1)*C(blue,1);
				            				td_val(i,j,aa);
				            			} else if(j==5){ //五等奖
				            				var aa = C(6,4)*C(red-6,2)*C(blue,1);
				            				td_val(i,j,aa);
				            			}
			            			}
			            			break;
			            	case 3: if(j==3){ //三等奖
			            				var aa = C(5,5)*C(red-5,1);
			            				td_val(i,j,aa);
			            			} else if(j==4){ //四等奖
			            				var aa = C(5,4)*C(red-5,2)+C(5,5)*C(red-5,1)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(5,3)*C(red-5,3)+C(5,4)*C(red-5,2)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(5,2)*C(red-5,4)+C(5,1)*C(red-5,5)+C(5,0)*C(red-5,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
			            	case 4: if(blue == 16){
			            				var aa = '0';
			            				td_val(i,j,aa);
					            	} else{
					            		if(j==4){ //四等奖
				            				var aa = C(5,5)*C(red-5,1)*C(blue,1);
				            				td_val(i,j,aa);
				            			} else if(j==5){ //五等奖
				            				var aa = C(5,4)*C(red-5,2)*C(blue,1);
				            				td_val(i,j,aa);
				            			}
				            		}
			            			break;
	            			case 5: if(j==4){ //四等奖
			            				var aa = C(4,4)*C(red-4,2)+C(4,5)*C(red-4,1)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==5){ //五等奖
			            				var aa = C(4,3)*C(red-4,3)+C(4,4)*C(red-4,2)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(4,2)*C(red-4,4)+C(4,1)*C(red-4,5)+C(4,0)*C(red-4,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			case 6: if(blue==16){
	            						var aa = '0';
			            				td_val(i,j,aa);
	            					} else {
	            						if(j==5){ //五等奖
				            				var aa = C(4,4)*C(red-4,2)*C(blue,1);
				            				td_val(i,j,aa);
				            			}
	            					}
			            			break;
	            			case 7: if(j==5){ //五等奖
			            				var aa = C(3,3)*C(red-3,3)+C(3,4)*C(red-3,2)*C(blue-1,1);
			            				td_val(i,j,aa);
			            			} else if(j==6){ //六等奖
			            				var aa = C(3,2)*C(red-3,4)+C(3,1)*C(red-3,5)+C(3,0)*C(red-3,6);
			            				td_val(i,j,aa);
			            			}
			            			break;
	            			default: if(j==6){ //六等奖
			            				var aa = C(2,2)*C(red-2,4)+C(2,1)*C(red-2,5)+C(2,0)*C(red-2,6);
			            				td_val(i,j,aa);
			            			 }
			            			 break;
            			}
        			}
        		}
        	}
        });
    });
});
//阶乘
function AA(n) {
    var num = 1;
    if (n > 1) {
        for (var i = n; i >= 1; i--) {
            num *= i;
        }
    }
    return num;
}
//组合
function C(n, r) {
	if(n >= r){
		if(n == r || r == 0){
			return 1;
		} else{
			return Math.floor( AA(n) / (AA(n - r)*AA(r)) );
		}
	} else {
		return 0;
	} 
}
//总金额
function fun_prize(m, k) {
    var prize0 = C(m, 6) * C(k, 1) * 2;
    return prize0;
}
//总注数
function fun_zzs(m, k) {
    var zzs0 = C(m, 6) * C(k, 1);
    return zzs0;
}
function td_val(i,j,aa){
	$('.sel_con tbody tr').eq(i).find('td').eq(j).html(aa);
}
