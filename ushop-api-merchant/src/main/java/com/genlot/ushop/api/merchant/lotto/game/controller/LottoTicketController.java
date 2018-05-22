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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ushop.facade.game.entity.LottoGame;
import com.genlot.ushop.facade.game.entity.LottoGameIssue;
import com.genlot.ushop.facade.game.entity.LottoGameTicket;
import com.genlot.ushop.facade.game.enums.LottoTicketStatusEnum;
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
@RequestMapping(value = "/api/lotto/ticket")
public class LottoTicketController {

	private static final Logger log = LoggerFactory.getLogger(LottoTicketController.class);

	@Autowired
	private LottoGameIssueQueryFacade  lottoGameIssueQueryFacade;
	
	@Autowired
	private LottoGameManagementFacade  lottoGameManagementFacade;
	
	@Autowired
	private LottoGameQueryFacade lottoGameQueryFacade;
	
	@Autowired
	private LottoGameTicketQueryFacade lottoGameTicketQueryFacade;
    
    
    /**
   	 * 获得中奖票
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/lotto/ticket/topn/listBy/页数/游戏id/期号id/排序风格
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * 			
   	 * @return Model 视图对象.
   	 */   
    @RequestMapping(value = {"/topn/listBy/{page}/{gameId}/{issueId}/{orderBy}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object listByTopN(
   			@PathVariable Integer page, 
   			@PathVariable Long gameId,
   			@PathVariable Long issueId,
   			@PathVariable Integer orderBy,
   			HttpServletRequest request,
			HttpServletResponse response)
    {
    	Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		try
		{
			PageParam pageParam = null;
			if (orderBy == 1) {
				pageParam = new PageParam(1, 50);
			}
			else if (orderBy == 2) {
				pageParam = new PageParam(page, 10);
			}
			pageBean = lottoGameTicketQueryFacade.listPage(
					pageParam, 
					null, 
					gameId, 
					issueId,
					orderBy, 
					LottoTicketStatusEnum.LOTTO_TICKET_STAT_WIN.getValue(),
					null);
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
    
    
    
    
    /**
   	 * 获得用户票
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/lotto/ticket/user/listBy
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * 			
   	 * @return Model 视图对象.
   	 */   
    @RequestMapping(value = {"/user/listBy"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object listByUser(
   			Integer page, 
   			Long gameId,
   			Integer status,
   			String date,
   			HttpServletRequest request,
			HttpServletResponse response)
    {
    	Map<String,Object> uiModel = new HashMap<String,Object>();
   		PageParam pageParam = new PageParam(page, 10);
		PageBean pageBean = null;
		String userNo = null;
		try
		{
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			pageBean = lottoGameTicketQueryFacade.listPage(
					pageParam, 
					userNo, 
					gameId, 
					null,
					1, 
					status,
					date);
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
    
    
    /**
   	 * 兑奖
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/lotto/ticket/user/cash
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * 			
   	 * @return Model 视图对象.
   	 */   
    @RequestMapping(value = {"/user/cash"}, method = RequestMethod.POST)
   	@ResponseBody
   	public Object cash(
   			@RequestBody(required=true) Map<String,Object> param,
			HttpServletRequest request,
			HttpServletResponse response) {
    
    	Map<String,Object> uiModel = new HashMap<String,Object>();
    	String userNo = null;
    	try
		{
    		Long id 			= null;
    		String phone 		= null;
    		String address 		= null;
    		String zipCode 		= null;
    		String consignee	= null; 
    		if (param.get("id") != null) {
    			id = Long.valueOf(param.get("id").toString());
    		}
    		if (id == null) {
    			throw LottoGameBizException.LOTTO_TICKET_NOT_EXIST;
    		}
    		if (param.get("phone") != null) {
    			phone = param.get("phone").toString();
    		}
    		if (param.get("address") != null) {
    			address = param.get("address").toString();
    		}
    		if (param.get("zipCode") != null) {
    			zipCode = param.get("zipCode").toString();
    		}
    		if (param.get("consignee") != null) {
    			consignee = param.get("consignee").toString();
    		}
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			lottoGameManagementFacade.cashTicket(userNo, id, phone, address, zipCode, consignee);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
    	uiModel.put("result", "SUCCESS");
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

