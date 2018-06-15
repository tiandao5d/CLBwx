/*The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
(function($){
        $.fn.extend({
            tableExport: function(options) {
                var defaults = {
						separator: ',',
						ignoreColumn: [],
						tableName:'yourTableName',
						type:'csv',
						pdfFontSize:14,
						pdfLeftMargin:20,
						escape:'true',
						htmlContent:'false',
						fileName : 'exportExcel',
						aId : 'exportExcel',
						consoleLog:'false'
				};
                
				var options = $.extend(defaults, options);
				var el = this;
				
				if(defaults.type == 'csv' || defaults.type == 'txt'){
				
					// Header
					var tdData ="";
					$(el).find('thead').find('tr').each(function() {
					tdData += "\n";					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);
				}else if(defaults.type == 'sql'){
				
					// Header
					var tdData ="INSERT INTO `"+defaults.tableName+"` (";
					$(el).find('thead').find('tr').each(function() {
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '`' + parseString($(this)) + '`,' ;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					tdData += ") VALUES ";
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "(";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '",';
								}
							}
						});
						
						tdData = $.trim(tdData).substring(0, tdData.length -1);
						tdData += "),";
					});
					tdData = $.trim(tdData).substring(0, tdData.length -1);
					tdData += ";";
					
					//output
					//console.log(tdData);
					
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					
					var base64data = "base64," + $.base64.encode(tdData);
					window.open('data:application/sql;filename=exportData;' + base64data);
					
				
				}else if(defaults.type == 'json'){
				
					var jsonHeaderArray = [];
					$(el).find('thead').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonHeaderArray.push(jsonArrayTd);						
						
					});
					
					var jsonArray = [];
					$(el).find('tbody').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonArray.push(jsonArrayTd);									
						
					});
					
					var jsonExportArray =[];
					jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
					
					//Return as JSON
					//console.log(JSON.stringify(jsonExportArray));
					
					//Return as Array
					//console.log(jsonExportArray);
					if(defaults.consoleLog == 'true'){
						console.log(JSON.stringify(jsonExportArray));
					}
					var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
					window.open('data:application/json;filename=exportData;' + base64data);
				}else if(defaults.type == 'xml'){
				
					var xml = '<?xml version="1.0" encoding="utf-8"?>';
					xml += '<tabledata><fields>';

					// Header
					$(el).find('thead').find('tr').each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<field>" + parseString($(this)) + "</field>";
								}
							}
						});									
					});					
					xml += '</fields><data>';
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						xml += '<row id="'+rowCount+'">';
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
								}
							}
							colCount++;
						});															
						rowCount++;
						xml += '</row>';
					});					
					xml += '</data></tabledata>'
					
					if(defaults.consoleLog == 'true'){
						console.log(xml);
					}
					
					var base64data = "base64," + $.base64.encode(xml);
					window.open('data:application/xml;filename=exportData;' + base64data);
				}else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){
					var id = $(el).attr('id');
					if(window.navigator.userAgent.indexOf("MSIE") >= 0)  
		            {  

		            	var curTbl = document.getElementById('itemsTable1'); 
		            	var htable = $('#'+id+' .ui-jqgrid-htable').text();
		            	var a = ' ';
		            	htable = htable.split(a)
		            	console.log(htable);
			            var oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel 
			            var oWB = oXL.Workbooks.Add(); //获取workbook对象 
			            var oSheet = oWB.ActiveSheet; //激活当前sheet 
			            var Lenr = htable.length; //取得表格行数 
			            for (i = 0; i < Lenr; i++) { 
			                oSheet.Cells(1 , i+1).value = htable[i]; //赋值 
			            } 
			            var Lenr = curTbl.rows.length; //取得表格行数 
			            for (i = 1; i < Lenr; i++) { 
			                var Lenc = curTbl.rows(i).cells.length; //取得每行的列数 
			                for (j = 2; j < Lenc; j++) { 
			                    oSheet.Cells(i+1 , j-1).value = curTbl.rows(i).cells(j).innerText; //赋值 
			                } 
			            } 
			            oXL.Visible = true; //设置excel可见属性 
		  
		                try {  
		                    var fname = oXL.Application.GetSaveAsFilename(defaults.fileName+".xls", "Excel Spreadsheets (*.xls), *.xls");  
		                } catch (e) {  
		                    // print("Nested catch caught " + e);  
		                } finally {  
		                    oWB.SaveAs(fname);  
		                    oWB.Close(savechanges = false);  
		                    oXL.Quit();  
		                    oXL = null;  
		                    // idTmr = window.setInterval("Cleanup();", 1);  
		                }  
		  
		            }else{
		            	var excel="<table>";
					// Header
						$(el).find('thead').find('tr').each(function() {
							excel += "<tr>";
							var colCount=0;
							$(this).filter(':visible').find('th').each(function(index,data) {
								if ($(this).css('display') != 'none'&&colCount>1){	
									if(defaults.ignoreColumn.indexOf(index) == -1){
										excel += "<td>"+parseString($(this))+"</td>";
									}
								}
								colCount++;
							});					
							excel += '</tr>';						
							
						});					
						
						
						// Row Vs Column
						var rowCount=1;
						$(el).find('tbody').find('tr').each(function() {
							if(rowCount<2){
								
							}else{							
								excel += "<tr>";
								var colCount=0;
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'&&colCount>1){	
										if(defaults.ignoreColumn.indexOf(index) == -1){
											excel += "<td>"+parseString($(this))+"</td>";
										}
									}
									colCount++;
								});															
							}
							rowCount++;
							excel += '</tr>';
						});					
						excel += '</table>'
						
						if(defaults.consoleLog == 'true'){
							console.log(excel);
						}
						
						
						var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
						excelFile += "<head>";
						excelFile += "<meta charset='utf-8'>";
						excelFile += "<!--[if gte mso 9]>";
						excelFile += "<xml>";
						excelFile += "<x:ExcelWorkbook>";
						excelFile += "<x:ExcelWorksheets>";
						excelFile += "<x:ExcelWorksheet>";
						excelFile += "<x:Name>";
						excelFile += "{worksheet}";
						excelFile += "</x:Name>";
						excelFile += "<x:WorksheetOptions>";
						excelFile += "<x:DisplayGridlines/>";
						excelFile += "</x:WorksheetOptions>";
						excelFile += "</x:ExcelWorksheet>";
						excelFile += "</x:ExcelWorksheets>";
						excelFile += "</x:ExcelWorkbook>";
						excelFile += "</xml>";
						excelFile += "<![endif]-->";
						excelFile += "</head>";
						excelFile += "<body>";
						excelFile += excel;
						excelFile += "</body>";
						excelFile += "</html>";
						var base64data = "base64," + $.base64.encode(excelFile);
						document.getElementById(defaults.aId).href ='data:application/vnd.ms-'+defaults.type+';' + base64data;//必须是a标签的id否则无法改名
						document.getElementById(defaults.aId).download = defaults.fileName;
//						window.open('data:application/vnd.ms-'+defaults.type+';filename=' + defaults.fileName + '.asdx;'+ base64data,defaults.fileName + '.asdxls');
		            }

					
				}else if(defaults.type == 'png'){
					html2canvas($(el), {
						onrendered: function(canvas) {										
							var img = canvas.toDataURL("image/png");
							window.open(img);
							
							
						}
					});		
				}else if(defaults.type == 'pdf'){
	
					var doc = new jsPDF('p','pt', 'a4', true);
					doc.setFontSize(defaults.pdfFontSize);
					
					// Header
					var startColPosition=defaults.pdfLeftMargin;
					$(el).find('thead').find('tr').each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var colPosition = startColPosition+ (index * 50);									
									doc.text(colPosition,20, parseString($(this)));
								}
							}
						});									
					});					
				
				
					// Row Vs Column
					var startRowPosition = 20; var page =1;var rowPosition=0;
					$(el).find('tbody').find('tr').each(function(index,data) {
						rowCalc = index+1;
						
					if (rowCalc % 26 == 0){
						doc.addPage();
						page++;
						startRowPosition=startRowPosition+10;
					}
					rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);
						
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var colPosition = startColPosition+ (index * 50);									
									doc.text(colPosition,rowPosition, parseString($(this)));
								}
							}
							
						});															
						
					});					
										
					// Output as Data URI
					doc.output('datauri');
	
				}
				
				
				function parseString(data){
				
					if(defaults.htmlContent == 'true'){
						content_data = data.html().trim();
					}else{
						content_data = data.text().trim();
					}
					
					if(defaults.escape == 'true'){
						content_data = escape(content_data);
					}
					
					
					
					return content_data;
				}
			
			}
        });
    })(jQuery);
        
