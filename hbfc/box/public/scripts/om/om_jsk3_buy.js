var radioType='';
var isHz3_18=false;
var bl = false;
function hasFastBet(childName,e){
	switch(childName){
	case "code":
	case "2thspan":
	case "2thxt":
	case "tx":
		return false;
	default:
		return true;
	}
}

function replaceChildType(childType, childName, content){
	if(content=='3' || content=='18'){
		isHz3_18=true;
		return "K3THDX";
	}
	if(childType=='2m'){
		var temp = content.split(",");
		if(temp[0]==temp[1]){
			return "K3ETFX";
		}else{
			return "K3EBT";
		}
	}
	
	switch(childType){
	case "3thdx":return "K3THDX";
	case "3bt":return "K3SBT";
	case "sum":return "K3HZ";
	case "2thdx":return "K3ETDX";
	case "2th2m":return "K3ETDX";
	case "2th3m":return "K3ETDX";
	case "2thbkb":return "K3ETDX";
	case "2thsum":return "K3ETDX";
	case "2th2c":return "K3ETDX";
	case "3bt2c":return "K3SBT";
	default:
		break;		
	}
}

function getDescription(_childType){
	switch (_childType) {
	case "K3HZ":return "和值";
	case "K3THTX":return "三同号通选";
	case "K3THDX":return "三同号单选";
	case "K3ETFX":return "二同号复选";
	case "K3ETDX":return "二同号单选";
	case "K3SBT":return "三不同号";
	case "K3EBT":return "二不同号";
	case "K3SLH":return "三连号通选";
	default:
		break;
	}
}

function isBasketContainsNumber(childName,target,content){
	var legalBetRows = obtainLegalBetRows(childName,target);
	for(var i=0;i<legalBetRows.size();i++){
		if(legalBetRows.elements[i]==content) return true;
	}
	return false;
}

function obtainLegalBetRows(childName,content){
	var result = new Set();
	switch(childName){
	case "3thdx":{
		var number='';
		var temp = content.split(",");
		for(var i=0;i<temp.length;i++){
			number+=temp[i];
		}
		result.push(number);
	}
		break;
	case "sum":{
		var temp ='';
		if(content=='3'){
			temp='111';
		}else if(content=='18'){
			temp='666';
		}else{
			temp = content;
		}
		result.push(temp);
	}
		break;
	case "2thdx":{
		var temp = content.split(",");
		if(temp[0]==temp[1]){
			result.push(temp[0]+temp[1]+"#"+temp[2]);
		}else if(temp[1]==temp[2]){
			result.push(temp[1]+temp[2]+"#"+temp[0]);
		}
	}
		break;
	case "2thbkb":{
		var temp = content.split(";");
		for(var i=0;i<temp.length;i++){
			var n1 = temp[i].substring(0,1);
			var n2 = temp[i].substring(1,2);
			var n3 = temp[i].substring(2,3);
			if(n1==n2){
				result.push(n1+n2+"#"+n3);
			}else if(n2==n3){
				result.push(n2+n3+"#"+n1);
			}
		}
		bl = true;
	}
		break;
	case "2th2c":{
		var temp = content.split(";");
		for(var i=0;i<temp.length;i++){
			var n1 = temp[i].substring(0,1);
			var n2 = temp[i].substring(1,2);
			var n3 = temp[i].substring(2,3);
			if(n1==n2){
				result.push(n1+n2+"#"+n3);
			}else if(n2==n3){
				result.push(n2+n3+"#"+n1);
			}
		}
		bl = true;
	}
		break;
	case "3bt2c":{
		var temp = content.split(";");
		for(var i=0;i<temp.length;i++){
			var n1 = temp[i].substring(0,1);
			var n2 = temp[i].substring(1,2);
			var n3 = temp[i].substring(2,3);

			result.push(n1+","+n2+","+n3);
		}
		bl = true;
	}
		break;
	case "2thsum":{
		for(var a=1;a<=6;a++){
			for(var b=1;b<=6;b++){
				for(var c=1;c<=6;c++){
					var sum=a+b+c;
					var num = Number(content);
					if(sum==num){
						if(a==b && b==c) continue;
						
						if(a==b){
							result.push(a+""+b+"#"+c);
						}else if(b==c){
							result.push(b+""+c+"#"+a);
						}
					}					
				}
			}
		}
		bl = true;
	}
		break;
	case "2m":{
		var temp = content.split(",");
		if(temp[0]==temp[1]){
			result.push(temp[0]+temp[1]+"*");
		}else{
			result.push(temp);
		}
	}
		break;
	case "3bt_6":{
		var temp = Number(content);
		for(var a=1;a<=6;a++){
			for(var b=a+1;b<=6;b++){
				for(var c=b+1;c<=6;c++){
					var sum=a+b+c;
					if(temp == sum){
						result.push(a+","+b+","+c);						
					}
				}
			}
		}
		bl = true;
	}
		break;
	default:
		result.push(content);
		break;
	}
	return result;
}

function getContentFormat(_childType, content){
	switch(_childType){
	case "K3THDX":{
		var number='';
		var temp = content.split(",");
		for(var i=0;i<temp.length;i++){
			number+=temp[i];
		}
		return number;
	}
	case "K3HZ":{
		if(content=='3'){
			content='111';
		}else if(content=='18'){
			content='666';
		}
		return content;		
	}
	case "K3ETDX":{
		var temp = content.split(",");
		if(temp[0]==temp[1]){
			return temp[0]+temp[1]+"#"+temp[2];
		}else if(temp[1]==temp[2]){
			return temp[1]+temp[2]+"#"+temp[0];
		}
	}
	default:
		return content;
	}
}

function contentBetNum(childType, content, childName){
	var result = new Set();
	var temp = content.split(",");
	for(var i =0;i<temp.length;i++){
		result.push(temp[i]);
	}
	var betNum = 0;
	switch(childType){
	case "K3SBT":
		if(childName=='3bt2c' || childName=='3bt_6') betNum=1;
		else betNum = comb(result.size(),3);
		break;
	case "K3THDX":
		betNum = 1;
		break;
	case "K3HZ":
		betNum = 1;
		break;
	case "K3ETDX":
		if(childName=='2th2m' || childName=='2th3m'){
			betNum = temp.length;
		}else{
			betNum = 1;
		}
		break;
	case "K3THTX":
		betNum = 1;
		break;
	case "K3SLH":
		betNum = 1;
		break;
	case "K3ETFX":
		betNum = 1;
		break;
	case "K3EBT":
		betNum = 1;
		break;
	default:
		break;
	}
	return betNum;
}

function deleteItem(e){
	var ul=$(e).parent().parent();
	var lis=ul.find("dd");
	var _childType=$(lis[0]).text();
	var _betNum=Number($(lis[1]).text());
	var _content=$(lis[2]).find("span").text();
	removeItem(_childType,_content,_betNum);
	ul.remove();
	$("#tatalBetCount").text(tatalBetCount);
	$("#totalMoney").text(tatalBetCount * 2);
	//移除table tr tr_click的样式
	removeTrClass(_childType, _content);
}

function removeTrClass(_childType, _content){
	radioType = getChildName();
	if(bl){
		$(".table_box tr").find("#content").each(function(i){
			var tdContent = $(this).text();
			var ii=0;
			for(var i=0;i<items.length;i++){
				var newNum='';
				var m = 0;
				var item_content = items[i].content;
				switch(radioType){
				case "2thbkb":
				case "2th2c":{
					var oldNum = tdContent.split(";");
					var temp = item_content.split("#");
					var same = temp[0].substring(0,1);
					if(Number(same) > Number(temp[1])){
						newNum = temp[1]+temp[0];
					}else{
						newNum = temp[0]+temp[1];
					}
					
					if(oldNum[0]==newNum || oldNum[1]==newNum){
						ii++;
					}
				}
					break;
				case "2thsum":{
					var n = Number(tdContent);
					var temp = item_content.split("#");
					var same1 = Number(temp[0].substring(0,1));
					var same2 = Number(temp[0].substring(1,2));
					var dif = Number(temp[1]);
					var sum = same1+same2+dif;
					if(sum == n) ii++;
				}
					break;
				case "3bt2c":{
					var oldNum = tdContent.split(";");
					var temp = item_content.replace(",","").replace(",","");
					if(oldNum[0]==temp || oldNum[1]==temp){
						ii++;
					}				
				}
					break;
				case "3bt_6":{
					var oldNum = Number(tdContent);
					var temp = item_content.split(",");
					var sum = Number(temp[0])+Number(temp[1])+Number(temp[2]);
					if(oldNum==sum){
						ii++;
					}
				}
					break;
				default:
					break;
				}				
			}	
			if(ii==0)$(this).parent().parent().parent().parent().parent().removeClass("tr_click");
		});		
	}else{
		$(".table_box tr").find("#content").each(function(i){
			var tdContent = '';
			if(isHz3_18) _childType="K3HZ";
			switch(_childType){
			case "K3THDX":{
				var temp = $(this).text().split(",");
				for(var i=0;i<temp.length;i++){
					tdContent+=temp[i];
				}
			}
				break;
			case "K3HZ":{
				var temp = $(this).text();
				if(temp=='3'){
					tdContent='111';
				}else if(temp=='18'){
					tdContent='666';
				}else{
					tdContent = $(this).text();
				}
			}
				break;
			case "K3ETDX":{
				if(radioType=='2th2m' || radioType=='2th3m'){
					tdContent = $(this).text();
				}else{
					var temp = $(this).text().split(",");
					if(temp[0]==temp[1]){
						tdContent = temp[0]+temp[1]+"#"+temp[2];
					}else if(temp[1]==temp[2]){
						tdContent = temp[1]+temp[2]+"#"+temp[0];
					}
				}
			}
				break;
			case "K3ETFX":{
				var temp = $(this).text().replace(",","");
				tdContent = temp+"*";				
			}
				break;
			default:
				tdContent = $(this).text();
				break;
			}
			if(tdContent==_content){
				$(this).parent().parent().parent().parent().parent().removeClass("tr_click");
			}
		});
	}
}
