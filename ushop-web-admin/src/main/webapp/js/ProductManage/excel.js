    $.fn.jqgridToExcel = function(fileName,fdate) { 
	var jqgrid = this; 
	var title = jqgrid.getGridParam('colNames'); 
	var param=jqgrid.getGridParam('postData'); 
	var excel = new ActiveXObject("Excel.Application");  
	//控制execl是否打开  true 打开  ,false  不打开 
	excel.Visible = false;  
	var workBook = excel.Workbooks.Add();  
//		workBook.ActiveSheet 等同  workBook.Worksheets(1) 
	var sheet = workBook.Worksheets(1); 
	sheet.name = "第【"+1+"】层"; 
	//调用公共方法 
	var rowNum = 0 ; 
	jqgridExcelListPublic(workBook,jqgrid,fileName,fdate,sheet,param,rowNum); 
	/*内容设置结束*/ 
	excel.UserControl = true; 
	fileName = excel.Application.GetSaveAsFilename(fileName+".xls","Excel Spreadshsheets (*.xls),*.xls,(*.xlsx),*.xlsx"); 
	if(fileName!=false)sheet.SaveAs(fileName); 
	excel.Quit(); 
	return jqgrid; 
} 
 
/** 
 * @desc 导出多个sheet的excel 
 * 原本思路是在绑定数据的时候在生成所需要的sheet,因未能解决sheet排序问题就此作罢。 
 * 例如：有sheet1、sheet2、sheet3 ，当在生成一个sheet4排序是sheet4、sheet1、sheet2、sheet3 ， 
 * 查看资料发现VB代码可以控制sheet显示的问题，js貌似没发现。 
 * 所以现在换了种方式，先计算本次导数所需要的所有sheet,虽说添加出来的顺序也是sheet4、sheet1、sheet2、sheet3, 
 * 但当填充数据的时候是按照现在的顺序填充。 
 * @author wxy 
 * @param fileName 文件标题及文件名 
 * @param fdate 日期  
 * @param urlArr url数组，设置数据来源 
 * @param showTypeArr 数据显示类型数组,设置当前数据是显示在上一个sheet中还是要重新新建个sheet 
 * @param paramArr 查询参数数组，数据过滤时时候 *  
 */ 
var idTmr=null; 
$.fn.jqgridToExcelList = function(fileName,fdate,urlArr,showTypeArr,paramArr) { 
	//判断系统类型  暂时注释 
//	var sysType = detectOS(); 
	 
	var jqgrid = this; 
	var param = jqgrid.getGridParam('postData'); 
	var excel = new ActiveXObject("Excel.Application");  
	//控制execl是否打开  true 打开  ,false  不打开 
	excel.Visible = false;  
	var workBook = excel.Workbooks.Add();  
	var sheet = null; 
	var rowNum = 0;//数据显示行 
	var count = 0;//当前sheet 显示第几次url返回的数据，用于计算当前是第几个sheet在生成数据 
	 
	//获取到当前new出excel的sheet数量  ，经测试win7默认3个sheet，xp默认1个sheet 
	var len = workBook.Sheets.count; 
	//计算生成当前导出excel所需的sheet，如果当前new的excel中sheet不够用就需要生成 
	for(var j = 0;j&lt;urlArr.length;j++){ 
			if(j&gt;=len &amp;&amp; showTypeArr[j]){ 
				workBook.Sheets.add; 
			} 
	} 
	 
	//给excel绑定数据 
	for(var i = 0;i&lt;urlArr.length;i++){ 
		var sheetNum = i+1; 
		if(i!=0){ 
			 param = paramArr[i]; 
		} 
 
		//showTypeArr 值为true: 表示新的sheet ,fasle 表示使用上一个sheet并且要记录count 
		if(showTypeArr[i]){ 
			sheetNum = sheetNum-count; 
			sheet = workBook.Worksheets(sheetNum); 
			sheet.name = "第【"+sheetNum+"】层"; 
			rowNum = 0; 
		}else{ 
			count++; 
		} 
		jqgrid = urlArr[i]; 
		rowNum = jqgridExcelListPublic(workBook,jqgrid,fileName,fdate,sheet,param,rowNum); 
	} 
	 
	/*内容设置结束*/ 
	excel.UserControl = true; 
	fileName = excel.Application.GetSaveAsFilename(fileName+".xls","Excel Spreadshsheets (*.xls),*.xls,(*.xlsx),*.xlsx"); 
	if(fileName!=false)sheet.SaveAs(fileName); 
	 
	excel.Quit(); 
 	workBook=null; 
  	excel = null; 
  	activeSheet=null;   
  	idTmr = window.setInterval("Cleanup();",1); 
	return jqgrid; 
} 
 
function Cleanup(){    
 window.clearInterval(idTmr);    
 CollectGarbage(); 
}  
 
 
/** 
 * @desc 一个sheet中显示多个列表 的公共方法 
 */ 
var jqgridExcelListPublic = function(workBook,jqgrid,fileName,fdate,sheet,param,rowNum) { 
	 
	var rowNums = 0; 
	var url = jqgrid.getGridParam('url'); 
	param.page=1; 
	param.rows = 1000000000;//设置所有数据一次返回 
	$.ajax({ 
	    type: "POST", 
	    url: url, 
	    data: param, 
	    async:false, 
	    success: function(back){ 
			var data = back; 
			if(typeof back == "string")data = $.parseJSON(back); 
			var re = /&amp;nbsp;/g;  //正则、匹配所有空格 
			var viewValue = null; 
			try{ 
				var colModel = jqgrid.getGridParam('colModel'); 
				var title = jqgrid.getGridParam('colNames'); 
				/*列头设置开始*/ 
				var start = 3; 
				if(rowNum != 0){ 
					start = rowNum+3; 
				} 
				var col = 1; 
				var tiCon = title.length; 
				for (var i=0;i&lt;tiCon;i++){ 
					//列出不隐藏的列头项 
					if(title[i].length!=0&amp;&amp;title[i].indexOf("&lt;input")>0&&colModel[i].hidden==false){ 
						sheet.Cells(start,col).HorizontalAlignment=3;//居中显示 
						sheet.Cells(start,col).Font.Bold=true;//设置粗体 
						sheet.Cells(start,col).value = title[i]; 
						sheet.Cells(start,col).Borders.LineStyle=1;//边框样式 
						sheet.Cells(start,col).Borders.ColorIndex=10;//单元格边框颜色 
						sheet.Cells(start,col).Interior.ColorIndex=2;//单元格底色 
						col++; 
					} 
				}  
				/*列头设置结束*/ 
				 
				if(rowNum == 0){ 
					/*标题开始*/ 
					sheet.Range("A1",sheet.Cells(1,col-1)).MergeCells=true;//合并标题单元格 
					sheet.Cells(1,1).HorizontalAlignment=3;//居中显示 
					sheet.Cells(1,1).Font.Bold=true;//设置粗体 
					sheet.Cells(1,1).Font.Size=15;//字体大小 
					sheet.Cells(1,1).Font.ColorIndex=10;//字体颜色 
					sheet.Cells(1,1).value=fileName; 
					/*标题结束*/ 
					 
					sheet.Range("A2",sheet.Cells(2,col-1)).MergeCells=true;//合并时间单元格 
					sheet.Cells(2,1).HorizontalAlignment=2;//居左显示 
					sheet.Cells(2,1).value = fdate; 
				} 
				 
				/*内容设置开始*/ 
				var row = data.rows; 
				var count = row.length; 
				rowNums = start+count; 
				var colModellen = colModel.length; 
				for (var i=0;i&lt;count;i++){  
					var cocl = 1; 
					for(var j=0;j&lt;colModellen;j++){ 
						//列出毎列内容 
						if(colModel[j].hidden==false&amp;&amp;colModel[j].index!=undefined){ 
							sheet.Cells(start+1+i,cocl).HorizontalAlignment=3;//居中显示 
							sheet.Cells(start+1+i,cocl).Borders.LineStyle=1;//边框样式 
							sheet.Cells(start+1+i,cocl).Borders.ColorIndex=10;//单元格边框颜色 
							sheet.Cells(start+1+i,cocl).NumberFormat = "@";//将单元置为文本，避免非数字列被自动变成科学计数法和丢失前缀的0 
							viewValue = $(row[i]).attr(colModel[j].name); 
							if(colModel[j].formatter!=undefined){//如果定义了格式化方法 
//								若有格式化，则需要格式化后显示 
								viewValue=colModel[j].formatter(viewValue); 
								//wangxiaoyuan 控制有连接的列 
								if(viewValue.indexOf("href", 1) != -1){ 
									var s = viewValue.indexOf("&gt;", 1); 
									var e = viewValue.indexOf("&lt;", 2); 
									var strValue  =viewValue.substring(s+1, e); 
									viewValue = strValue; 
								} 
							} 
							if(viewValue!=null)viewValue = (viewValue.toString()).replace(re, ""); 
							if(viewValue ==undefined){ 
								viewValue = ''; 
							} 
							//viewValue 前面加空格是为了处理 2/2的数据格式，cells默认会理解为日期 
							sheet.Cells(start+1+i,cocl).value = " "+viewValue;  
							cocl++; 
						} 
					}  
				} 
				//列自增长 
				sheet.Columns.AutoFit(); 
		 
			}catch(e){ 
			} 
	 
	    } 
	}); 
	return rowNums; 
}