package com.genlot.ushop.api.merchant.sns.controller;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.coobird.thumbnailator.Thumbnails;

import org.apache.oltu.oauth2.common.OAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.common.web.file.FastDFSClient;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserAddressFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.sns.entity.AnnounceInfo;
import com.genlot.ushop.facade.sns.entity.RemindInfo;
import com.genlot.ushop.facade.sns.entity.ShareInfo;
import com.genlot.ushop.facade.sns.enums.ShareStatusEnum;
import com.genlot.ushop.facade.sns.exceptions.SocialBizException;
import com.genlot.ushop.facade.sns.service.NotifyManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareQueryFacade;

@Controller
@RequestMapping(value = "/api/sns/notify")
public class NotifyController {
	
	private static final Logger log = LoggerFactory.getLogger(NotifyController.class);
	
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;	

	@Autowired
	private NotifyManagementFacade notifyManagementFacade;
	
	@Autowired
	private LatestLotteryFacade latestLotteryFacade;	

	
	
	/**
	 * 拉取公告(获得最新公告数量).
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/announce/pull/type/userId
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param type 
	 * 			类型(系统公告，版本更新公告).
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/announce/pull/{type}/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object pullAnnounce(
			@PathVariable Integer type,
			@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		long counts = 0;
		try
		{
			counts = notifyManagementFacade.pullAnnounce(userId, type);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
		uiModel.put("recordCount", counts);
		return uiModel;
	}	
	
	/**
	 * 读取公告，如果不执行拉取操作是无法得到最新公告.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/announce/read/type/userId
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param type 
	 * 			类型(系统公告，版本更新公告).
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/announce/read/{type}/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object readAnnounce(
			@PathVariable Integer type,
			@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<AnnounceInfo> infos = null;
		try
		{
			infos = notifyManagementFacade.listReadAnnounce(userId, type);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		// 成功返回
		uiModel.put("recordList", infos);
		return uiModel;
	}
	
	/**
	 * 拉取提醒(目前没有订阅功能，但是为了扩展和接口统一，还是需要有一个拉取的请求).
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/remain/pull/userId
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/remain/pull/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object pullRemain(
			@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		long counts = 0;
		try
		{
			counts = notifyManagementFacade.pullRemind(userId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
		uiModel.put("recordCount", counts);
		return uiModel;
	}	
	
	/**
	 * 读取提醒，按目前来说如果不执行拉取操作也是可读取到提醒的，因为目前没有做关联订阅功能.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/remain/read/userId
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/remain/read/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object readRemind(
			@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<RemindInfo> infos = null;
		try
		{
			infos = notifyManagementFacade.listReadRemind(userId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		// 成功返回
		uiModel.put("recordList", infos);
		return uiModel;
	}
	
	/**
	 * 拉取跑马灯公告.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/marquee/pull/最后时间戳
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/marquee/pull/{lastTime}", method = RequestMethod.GET)
	@ResponseBody
	public Object pullLottery(
			@PathVariable String lastTime,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try
		{
			List<String> params = notifyManagementFacade.pullMarquee(lastTime);
			if (params.get(0).equals("0") && params.get(1).equals("0"))
			{
//				// 加载
//				PageParam pageParam = new PageParam(1,20);
//				Map<String, Object> paramMap = new HashMap<String, Object>();
//				PageBean pageBean = latestLotteryFacade.listPageLatestLotteryOrderByAnnouncedTime(pageParam, paramMap);
//				
//				if (pageBean.getRecordList().size() > 0)
//				{
//					List<AnnounceInfo> winners = new ArrayList<AnnounceInfo>();
//					for(int index = 0; index < pageBean.getRecordList().size(); ++index)
//					{
//						LatestLottery lottery = (LatestLottery) pageBean.getRecordList().get(index);
//						
//						AnnounceInfo info = new AnnounceInfo();
//						info.setParam1(lottery.getSpellbuyProductId().toString());
//						info.setBeginTime(lottery.getAnnouncedTime());
//						info.setTitle(lottery.getUserName());
//						info.setContent(lottery.getProductName());
//						winners.add(info);
//					}
//					
//					Long nowTime = System.currentTimeMillis();
//					Integer size = winners.size(); 
//					uiModel.put("lastTime", nowTime.toString());
//					uiModel.put("pageSize", size.toString());
//					notifyManagementFacade.ps(winners);
//				}
//				else
				{
					uiModel.put("lastTime", "0");
					uiModel.put("pageSize", "0");
				}
				
			}
			else
			{
				uiModel.put("lastTime", params.get(0));
				uiModel.put("pageSize", params.get(1));
			}
			
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
	 * 读取中奖公告 按目前来说如果不执行拉取操作也是可读取到公告的 只是为了节省流量才需要有拉取功能，同时与其他消息的接口保持一致
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/notify/marquee/read
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/marquee/read", method = RequestMethod.GET)
	@ResponseBody
	public Object readLottery(
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<AnnounceInfo> recordList = null;
		try
		{
			recordList = notifyManagementFacade.listReadMarquee();
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		// 成功返回
		uiModel.put("recordList", recordList);
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
