package com.genlot.ushop.api.merchant.lotto.game.controller;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ushop.facade.game.entity.LottoGame;
import com.genlot.ushop.facade.game.entity.LottoGameIssue;
import com.genlot.ushop.facade.game.entity.LottoGameTicket;
import com.genlot.ushop.facade.game.exceptions.LottoGameBizException;
import com.genlot.ushop.facade.game.service.LottoGameIssueQueryFacade;
import com.genlot.ushop.facade.game.service.LottoGameManagementFacade;
import com.genlot.ushop.facade.game.service.LottoGameQueryFacade;
import com.genlot.ushop.facade.game.service.LottoGameTicketQueryFacade;

/** 
* @author  
* @date 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */
@Controller
@RequestMapping(value = "/api/lotto/issue")
public class LottoIssueController {

	private static final Logger log = LoggerFactory.getLogger(LottoIssueController.class);

	@Autowired
	private LottoGameIssueQueryFacade  lottoGameIssueQueryFacade;
	
	@Autowired
	private LottoGameManagementFacade  lottoGameManagementFacade;
	
	@Autowired
	private LottoGameQueryFacade lottoGameQueryFacade;
	
	@Autowired
	private LottoGameTicketQueryFacade lottoGameTicketQueryFacade;
    
      
    /**
   	 * 根据id获得
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/lotto/issue/get/{id}
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * 			
   	 * @return Model 视图对象.
   	 */   
    @SuppressWarnings("unchecked")
	@RequestMapping(value = {"/get/{id}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object getById(
   			@PathVariable Long id,
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
   		LottoGameIssue issue = null;
		try
		{
			issue = lottoGameIssueQueryFacade.getById(id);
			if (issue == null) {
				throw LottoGameBizException.LOTTO_ISSUE_NOT_EXIST;
			}
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.putAll(BeanMapUtil.convertBean(issue));
		return uiModel;			
	}
    
    /**
   	 * 获得开奖中和揭晓中期次
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/lotto/issue/visible/listBy/
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * 			
   	 * @return Model 视图对象.
   	 */   
    @RequestMapping(value = {"/visible/listBy/{page}/{gameId}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object listByVisible(
   			@PathVariable Integer page,
   			@PathVariable Long gameId,
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
   		PageParam pageParam = new PageParam(page, 10);
		PageBean pageBean = null;
		try
		{
			pageBean = lottoGameIssueQueryFacade.listPageByVisible(pageParam, gameId);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	
	}
    
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
		if (exception instanceof BizException)
		{
			BizException e = (BizException)exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		}
		else
		{
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
}

