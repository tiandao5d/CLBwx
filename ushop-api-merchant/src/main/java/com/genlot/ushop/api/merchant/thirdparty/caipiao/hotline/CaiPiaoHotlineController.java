package com.genlot.ushop.api.merchant.thirdparty.caipiao.hotline;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.core.mq.DataMessage;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.biz.component.BizEventProducer;
import com.genlot.common.message.lotto.component.LottoEventProducer;
import com.genlot.common.message.promotion.component.PromotionEventProducer;
import com.genlot.common.message.sns.component.SnsEventProducer;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.encrypt.RC4Utils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.uplatform.facade.frontend.hotline.caipiao.service.CaiPiaoFacade;
import com.genlot.uplatform.facade.frontend.exceptions.FrontEndBizException;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyDraw;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyTicket;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyUser;
import com.genlot.ushop.facade.game.enums.LottoTriggerTypeEnum;
import com.genlot.ushop.facade.sns.enums.MarqueeTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.exceptions.TaskBizException;
import com.genlot.ushop.facade.task.service.TaskDailyFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;
import com.genlot.ushop.facade.ticket.entity.LotteryDraw;
import com.genlot.ushop.facade.ticket.entity.LotteryTicket;
import com.genlot.ushop.facade.ticket.enums.TicketStatusEnum;
import com.genlot.ushop.facade.ticket.service.LotteryDrawFacade;
import com.genlot.ushop.facade.ticket.service.LotteryTicketFacade;

@Controller
@RequestMapping(value = "/api/caipiao/hotline")
public class CaiPiaoHotlineController {
	
	private static final Logger log = LoggerFactory.getLogger(CaiPiaoHotlineController.class);
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private UserOperatorFacade userOperatorFacade;
	
	@Autowired
	private CaiPiaoFacade caiPiaoFacade;
	
	@Autowired
	private LotteryTicketFacade lotteryTicketFacade;
	
	@Autowired
	private LotteryDrawFacade lotteryDrawFacade;
	
	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;

	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private TaskDailyFacade taskDailyFacade;
	
	/**
	 * 检票
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/hotline/ticket/check/省份/平台/特征码/扫描设备
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/ticket/check/{province}/{platform}/{featureCode}/{scanner}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object checkTicket(
    		@PathVariable Integer province,
    		@PathVariable Integer platform,
    		@PathVariable String featureCode,
    		@PathVariable Integer scanner,
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			String userNo = null;
			try
			{
				// 由于前面有拦截器，已经确定判断这个访问
				userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
				
			    String code = com.genlot.common.utils.encrypt.RC4Utils.decry_RC4(featureCode.substring(0, 64));
			    code = code.split(";")[0];
				
				// 先在本地检查是否有该票
			    LotteryTicket loaclTicket = lotteryTicketFacade.getByFeatureCode(province,platform,code);
			    if (loaclTicket != null && StringUtil.isNotNull(loaclTicket.getUserNo())) {
			    	throw FrontEndBizException.FRONTEND_ERROR_TICKET_REPEAT;
			    }
			    
				// 热线查找
			    ThirdPartyTicket remoteTicket = caiPiaoFacade.checkTicket(userNo, province, platform, 2, featureCode);
				
				
				// 获得绑定关系
				UserBindRelation relation = userBindRelationFacade.getByUserNo(
						userNo, 
						province, 
						platform,
						Integer.parseInt(remoteTicket.getGameId()));
				
				// 获得签到是否已经完成
				Integer count = taskDailyFacade.isCompleted(
						userNo, 
						TaskConditionTypeEnum.SCAN_TICKET_LIMITED.getValue(),
						remoteTicket.getGameId(), 
						province);
				if (count == 0) {
					throw TaskBizException.TASK_RECORD_REPEAT;
				}
				
				uiModel.put("limit", count);
				uiModel.put("province", province);
				uiModel.put("platform", platform);
				uiModel.put("game", remoteTicket.getGameId());
				uiModel.put("ticketStationId", remoteTicket.getTicketStationId());
				uiModel.put("issue", remoteTicket.getIssue());
				uiModel.put("tickSN", remoteTicket.getTickSN());
				if (relation != null) {
					uiModel.put("relation", relation.getLoginId());
				}
			}
			catch (Exception exception)
			{
				exception.printStackTrace();
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			
	        return uiModel;
	}
	
	
	/**
	 * 获得票面
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/hotline/ticket/get/省份/平台/游戏id/期号/特征码/扫描设备
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/ticket/get/{province}/{platform}/{game}/{issue}/{featureCode}/{scanner}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object getTicket(
    		@PathVariable Integer province,
    		@PathVariable Integer platform,
    		@PathVariable Integer game,
    		@PathVariable String issue,
    		@PathVariable String featureCode,
    		@PathVariable Integer scanner,
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			String userNo = null;
			try
			{
				// 由于前面有拦截器，已经确定判断这个访问
				userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
				MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
				// 获得绑定关系
				UserBindRelation relation = userBindRelationFacade.getByUserNo(
						userNo, 
						province, 
						platform,
						game);
				if (relation == null || info == null) {
					throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
				}
				
				// 获得签到是否已经完成
				Integer count = taskDailyFacade.isCompleted(
						userNo, 
						TaskConditionTypeEnum.SCAN_TICKET_LIMITED.getValue(),
						game.toString(), 
						province);
				if (count == 0) {
					throw TaskBizException.TASK_RECORD_REPEAT;
				}
				
				// 先在本地检查是否有该票
				String code = RC4Utils.decry_RC4(featureCode.substring(0, 64));
				code = code.split(";")[0];
				LotteryTicket loaclTicket = lotteryTicketFacade.getByFeatureCode(province,platform,code);
				if (loaclTicket != null && StringUtil.isNotNull(loaclTicket.getUserNo())) {
					throw FrontEndBizException.FRONTEND_ERROR_TICKET_REPEAT;
				}
				
				// 热线查奖
				ThirdPartyTicket prize = null;
				//ThirdPartyTicket prize = caiPiaoFacade.getPrize(relation.getLoginId(), province, platform, code);
				
				// 热线查找
				ThirdPartyTicket ticket = caiPiaoFacade.getTicket(relation.getLoginId(), province, platform, featureCode);
				if (!ticket.getUserNo().equals(relation.getLoginId())) {
					throw FrontEndBizException.FRONTEND_ERROR_TICKET_REPEAT;
				}
								
				if (loaclTicket == null) {
					loaclTicket = new LotteryTicket();
					loaclTicket.setUserName(info.getNickName());
					loaclTicket.setGameName(ticket.getGameName());
					loaclTicket.setScanner(scanner);
					loaclTicket.setBetCount(ticket.getBetCount());
					loaclTicket.setCancelStationId(ticket.getCancelStationId());
					loaclTicket.setCancelTime(ticket.getCancelTime());
					loaclTicket.setFeatureCode(ticket.getFeatureCode());
					loaclTicket.setGameId(ticket.getGameId());
					loaclTicket.setIssue(ticket.getIssue());
					loaclTicket.setMultiIssue(ticket.getMultiIssue());
					loaclTicket.setParValue(ticket.getParValue());
					loaclTicket.setProvince(ticket.getProvince());
					loaclTicket.setPlatform(platform);
					loaclTicket.setTicketStat(ticket.getTicketStat());
					loaclTicket.setTicketStationId(ticket.getTicketStationId());
					loaclTicket.setTickSN(ticket.getTickSN());
					loaclTicket.setUserNo(userNo);
					loaclTicket.setVipId(ticket.getVipId());
					loaclTicket.setWagerIssue(ticket.getWagerIssue());
					loaclTicket.setWagerTime(ticket.getWagerTime());
					loaclTicket.setBets(ticket.getBets());
					loaclTicket.setReward(ticket.getReward());
					loaclTicket.setDrawTime(ticket.getDrawTime());
					//loaclTicket.setPrizeStat(prize.getPrizeStat());
					//loaclTicket.setTotalPrize(prize.getTotalPrize());
					//loaclTicket.setTotalTax(prize.getTotalTax());
					//loaclTicket.setCashTime(prize.getCashTime());
					//loaclTicket.setCashStationID(prize.getCashStationID());
					//loaclTicket.setEndCashTime(prize.getEndCashTime());
					//loaclTicket.setPrizes(prize.getPrizes());
					//loaclTicket.setPrizeCount(prize.getPrizeCount());

					lotteryTicketFacade.create(loaclTicket);

				}
				else {
					loaclTicket.setUserNo(userNo);
					lotteryTicketFacade.update(loaclTicket);
				}
				uiModel.putAll(BeanMapUtil.convertBean(ticket));
				uiModel.put("limit", count - 1);
			}
			catch (Exception exception)
			{
				exception.printStackTrace();
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			
	        return uiModel;
	}
	
	
	
	/**
	 * 获得票面开奖情况
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/hotline/ticket/prize/get/省份/平台/游戏id/期号/特征码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/ticket/prize/get/{province}/{platform}/{game}/{issue}/{featureCode}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object getTicketPrize(
    		@PathVariable Integer province,
    		@PathVariable Integer platform,
    		@PathVariable Integer game,
    		@PathVariable String issue,
    		@PathVariable String featureCode,
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();
		String userNo = null;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 获得绑定关系
			UserBindRelation relation = userBindRelationFacade.getByUserNo(
					userNo, 
					province, 
					platform,
					game);
			if (relation == null) {
				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
			}
			
			LotteryTicket loaclTicket = lotteryTicketFacade.getByFeatureCode(province,platform,featureCode);
			if (loaclTicket == null || StringUtil.isEmpty(loaclTicket.getUserNo()) || loaclTicket.getUserNo().equals(userNo)) {
				throw FrontEndBizException.FRONTEND_ERROR_TICKET_INVALID;
			}
			
			// 热线查奖
			ThirdPartyTicket prize = caiPiaoFacade.getPrize(relation.getLoginId(), province, platform, featureCode);
			loaclTicket.setPrizeStat(prize.getPrizeStat());
			loaclTicket.setTotalPrize(prize.getTotalPrize());
			loaclTicket.setTotalTax(prize.getTotalTax());
			loaclTicket.setCashTime(prize.getCashTime());
			loaclTicket.setCashStationID(prize.getCashStationID());
			loaclTicket.setEndCashTime(prize.getEndCashTime());
			loaclTicket.setPrizes(prize.getPrizes());
			loaclTicket.setPrizeCount(prize.getPrizeCount());
			lotteryTicketFacade.update(loaclTicket);
			uiModel.putAll(BeanMapUtil.convertBean(loaclTicket));
		}
		catch (Exception exception)
		{
			exception.printStackTrace();
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
        return uiModel;
	}
	
	/**
	 * 获得票面开奖情况
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/hotline/ticket/draw/get/省份/平台/游戏id/期号/特征码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/ticket/draw/get/{province}/{platform}/{game}/{issue}/{featureCode}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object getDraw(
    		@PathVariable Integer province,
    		@PathVariable Integer platform,
    		@PathVariable Integer game,
    		@PathVariable String issue,
    		@PathVariable String featureCode,
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();
		String userNo = null;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 获得绑定关系
			UserBindRelation relation = userBindRelationFacade.getByUserNo(
					userNo, 
					province, 
					platform,
					game);
			if (relation == null) {
				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
			}
			
			LotteryTicket loaclTicket = lotteryTicketFacade.getByFeatureCode(province,platform,featureCode);
			if (loaclTicket == null || StringUtil.isEmpty(loaclTicket.getUserNo()) || !loaclTicket.getUserNo().equals(userNo)) {
				throw FrontEndBizException.FRONTEND_ERROR_TICKET_INVALID;
			}			
			if (loaclTicket.getPrizeStat().equals(TicketStatusEnum.STATUS10.getValue())) {
				throw FrontEndBizException.FRONTEND_ERROR_TICKET_INVALID;
			}
			LotteryDraw localDraw = lotteryDrawFacade.getByIssue(province, platform, game.toString(), issue);
			if (localDraw != null) {
				uiModel.putAll(BeanMapUtil.convertBean(localDraw));
			}
			else {
				ThirdPartyDraw remoteDraw = caiPiaoFacade.getDraw(userNo, province, platform, game.toString(), issue);
				localDraw = new LotteryDraw();
				localDraw.setGameId(game.toString());
				localDraw.setIssue(issue);
				localDraw.setNumbers(remoteDraw.getNumbers());
				localDraw.setProvince(province);
				localDraw.setWinNumCount(remoteDraw.getWinNumCount());
				lotteryDrawFacade.create(localDraw);
			}
			
			uiModel.putAll(BeanMapUtil.convertBean(localDraw));
		}
		catch (Exception exception)
		{
			exception.printStackTrace();
			setErrorMessage(exception,uiModel);
			return uiModel;
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
