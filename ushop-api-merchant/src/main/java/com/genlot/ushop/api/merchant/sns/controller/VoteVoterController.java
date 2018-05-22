package com.genlot.ushop.api.merchant.sns.controller;

import java.util.ArrayList;
import java.util.Date;
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

import com.genlot.common.enums.OpeStatusEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.vote.component.VoteEventProducer;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
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
@RequestMapping(value = "/api/sns/vote/voter")
public class VoteVoterController {

private static final Logger log = LoggerFactory.getLogger(VoteVoterController.class);
	
	@Autowired
	private VoterFacade voterFacade;
	
	@Autowired
	private VoteManagementFacade voteManagementFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private VoteEventProducer voteEventProducer;
	
	@Autowired
	private ElectionFacade electionFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
		
	/**
	 * 获得.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/vote/voter/get/id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param id 投票活动id
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/get/{electionId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object get(
			@PathVariable Long electionId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Voter entity = voterFacade.getByUserNo(userNo,electionId);
			if (entity == null) {
				MemberInfo menber = memberInfoFacade.getMemberByUserNo(userNo);
				entity = new Voter();
				if (menber != null) {
					entity.setUserNo(userNo);
					entity.setUserName(menber.getMemberName());
					entity.setPhone(menber.getTelNo());
					entity.setNickName(menber.getNickName());
				}
				entity.setElectionId(electionId);
				entity.setLastTime(DateUtils.getTimeStampStr(new Date()));
				entity = voterFacade.insert(entity);
			}
				
			uiModel.putAll(BeanMapUtil.convertBean(entity));
			uiModel.put("status", 1);
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		return uiModel;
	}
	
	/**
	 * 投票.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/vote/voter/submit
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param id 投票活动id
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/submit/{electionId}/{candidateId}/{code}"}, method = RequestMethod.POST)
	@ResponseBody
	public Object submit(
			@PathVariable Long electionId,
			@PathVariable Long candidateId,
			@PathVariable String code,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);			
			Election entity = electionFacade.getById(electionId);
			if (entity.getSecurityCode().equals(OpeStatusEnum.SUCCESS.getValue())) {
				sMSFacade.checkImageCode(code);
			}
			voteManagementFacade.isCanVote(userNo, candidateId, electionId);
			MemberInfo menber = memberInfoFacade.getMemberByUserNo(userNo);
			voteEventProducer.sendEventCandidateSelect(userNo,menber.getMemberName(),menber.getNickName(),menber.getTelNo(),candidateId,electionId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("lastTime", DateUtils.getTimeStampStr(new Date()));
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