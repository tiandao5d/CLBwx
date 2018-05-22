package com.genlot.ushop.web.admin.caipiao.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.enums.ProvinceEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.ticket.service.LotteryTicketFacade;



@Controller
@RequestMapping(value = "/lotteryTickets")
public class LotteryTicketsController {

	private static final Logger log = LoggerFactory.getLogger(LotteryTicketsController.class);
	
	@Autowired
	private LotteryTicketFacade lotteryTicketFacade;
	
	
	//获得拍彩记录列表
		@RequestMapping(value="/list" ,method= RequestMethod.GET)
		@ResponseBody
		public Object list(
				//分页
	             Integer page,
	             Integer rows,
	             //用户编码
	             String userNo, 
	             //游戏名称
	             String gameName,
	             //开始时间
	             String startDate,
	             //结束时间
	             String endDate,
	           //省份
	             String province,
				 HttpServletRequest request
				) {
			
			Map<String, Object> uiModel = new HashMap<String, Object>();
			Map<String, Object> paramMap = new HashMap<String, Object>();
			PageParam pageParam = null;
			PageBean pageBean = null;
			
			if (page == null || rows == null) {
				pageParam = new PageParam(1, 10);
			} else {
				pageParam = new PageParam(page, rows);
			}
			try {
				paramMap.put("userNo", userNo);	
				//paramMap.put("gameName", gameName);
				paramMap.put("startTime", startDate);	
				paramMap.put("endTime", endDate);	
				paramMap.put("province", province);
				log.debug(paramMap.toString());
				
			    pageBean = lotteryTicketFacade.listPage(pageParam, paramMap);	    
			} catch (Exception exception) {
				setErrorMessage(exception, uiModel);
				return uiModel;
			}
			
		
			uiModel.put("currentPage", pageBean.getCurrentPage());
			uiModel.put("pagePage", pageBean.getPageCount());
			uiModel.put("totalCount", pageBean.getTotalCount());
			uiModel.put("recordList", pageBean.getRecordList());		
			return uiModel;
		}
		@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
		@ResponseBody
		public Object constants() {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			List provinceList = ProvinceEnum.toList();
			uiModel.put("provinceList", provinceList);
			return uiModel;
		}
		
		protected void setErrorMessage(Exception exception,
				Map<String, Object> uiModel) {
			if (exception instanceof BizException) {
				BizException e = (BizException) exception;
				uiModel.put("error", e.getCode());
				uiModel.put("error_description", e.getMsg());
			} else {
				uiModel.put("error", 0);
				uiModel.put("error_description", "unknown error");
			}
		}
	
}
