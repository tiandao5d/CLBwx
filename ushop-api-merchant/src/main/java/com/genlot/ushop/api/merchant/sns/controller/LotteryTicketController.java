package com.genlot.ushop.api.merchant.sns.controller;

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
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.ticket.service.LotteryTicketFacade;

/** 
* @author  hsz 
* @date 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */


@Controller
@RequestMapping(value = "/api/sns/lottery/ticket")
public class LotteryTicketController {

private static final Logger log = LoggerFactory.getLogger(LotteryTicketController.class);
	
	@Autowired
	private LotteryTicketFacade lotteryTicketFacade;
		
	/**
	 * 彩票列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/lottery/ticket/list/页数/每页多少个/状态
	 * @param 	请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/list/{page}/{count}/{status}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable Integer page,
    		@PathVariable Integer count,
    		@PathVariable Integer status,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;	
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
	
			// 请求列表
			pageBean = lotteryTicketFacade.listPageByUserNo(pageParam, userId, status);
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
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
		uiModel.clear();
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
