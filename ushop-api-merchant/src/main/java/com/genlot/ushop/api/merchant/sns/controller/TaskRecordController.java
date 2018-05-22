package com.genlot.ushop.api.merchant.sns.controller;

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
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ushop.facade.game.service.LottoGameTicketQueryFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;
import com.genlot.ushop.facade.vote.entity.Election;
import com.genlot.ushop.facade.vote.entity.Voter;
import com.genlot.ushop.facade.vote.exceptions.VoteBizException;
import com.genlot.ushop.facade.vote.service.ElectionFacade;
import com.genlot.ushop.facade.vote.service.VoteManagementFacade;
import com.genlot.ushop.facade.vote.service.VoterFacade;

/** 
 * @author  hsz 
 */
@Controller
@RequestMapping(value = "/api/sns/task/record")
public class TaskRecordController {

private static final Logger log = LoggerFactory.getLogger(TaskRecordController.class);
	
	@Autowired
	private TaskRecordFacade taskRecordFacade;
	
	/**
	 * 访问.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/record/visit/id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param id 投票活动id
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/visit/{id}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object visit(
			@PathVariable Long id,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			taskRecordFacade.visit(userNo, id);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	/**
	 * 分享.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/record/share/id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param id 投票活动id
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/share/{id}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object share(
			@PathVariable Long id,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			taskRecordFacade.share(userNo, id);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
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