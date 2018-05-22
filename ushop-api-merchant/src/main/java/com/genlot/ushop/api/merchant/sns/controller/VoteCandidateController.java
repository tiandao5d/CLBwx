package com.genlot.ushop.api.merchant.sns.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.vote.entity.Candidate;
import com.genlot.ushop.facade.vote.entity.Election;
import com.genlot.ushop.facade.vote.exceptions.VoteBizException;
import com.genlot.ushop.facade.vote.service.CandidateFacade;
import com.genlot.ushop.facade.vote.service.ElectionFacade;
import com.genlot.ushop.facade.vote.service.VoteManagementFacade;

/** 
 * @author  hsz 
 */
@Controller
@RequestMapping(value = "/api/sns/vote/candidate")
public class VoteCandidateController {

private static final Logger log = LoggerFactory.getLogger(VoteCandidateController.class);
	
	@Autowired
	private CandidateFacade candidateFacade;
		
	@Autowired
	private VoteManagementFacade voteManagementFacade;
	
	@Autowired
	private UploadFileFacade uploadFileFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
	
	/**
	 * 报名.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/vote/candidate/signUp
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param entity JSON BODY 报名信息
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/signUp"}, method = RequestMethod.POST)
	@ResponseBody
	public Object signUp(
			@RequestBody Candidate entity,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			entity.setUserNo(userId);
			
			// 验证码判断
			sMSFacade.checkVerificationCode(entity.getPhone(), SMSTypeEnum.USER_VERIFY_PHONE, entity.getWarning().toString(), 1);

			List<String> deletes = new ArrayList<String>(); 
			List<String> temps = new ArrayList<String>();
			Candidate old = candidateFacade.getBySignedUp(null, userId, entity.getElectionId());
			if (old != null && !StringUtil.isEmpty(old.getUrl())) {
				deletes.add(old.getUrl().substring(old.getUrl().lastIndexOf("/") + 1));
			}
			
			voteManagementFacade.signUp(entity);
			if (!StringUtil.isEmpty(entity.getUrl())) {
				temps.add(entity.getUrl().substring(entity.getUrl().lastIndexOf("/") + 1));
			}
			
			uploadFileFacade.createAndDelete(FileTypeEnum.IMAGE.getValue(), Integer.valueOf(0), deletes, new Date(), temps);
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
	 * 获得用户报名结果.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/vote/candidate/signedUp
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param 
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/signedUp/{electionId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object signedUp(
			@PathVariable Long electionId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Integer status = voteManagementFacade.signedUp(electionId,userId);
			uiModel.put("result", status);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		return uiModel;
	}
	
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page, 
			Integer rows, 
			String district,
			String serialNo,
			Long electionId,
			Integer self,
			HttpServletRequest request, 
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;
		
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		
		try {
			String userNo = null;
			if (self != null) {
				userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			}
			pageBean = candidateFacade.listPageByFinalist(pageParam, district, serialNo, electionId, userNo);

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
	
	@RequestMapping(value = "/listByTopN/{electionId}/{district}", method = RequestMethod.GET)
	@ResponseBody
	public Object topN(
			@PathVariable Long electionId,
			@PathVariable String district,
			HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		try {
			
		    List<Candidate> recordList = candidateFacade.listByTopN(electionId, district, 100);
			uiModel.put("recordList", recordList);
			
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
		}
		
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