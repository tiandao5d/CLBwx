package com.genlot.ushop.api.merchant.spellbuy.person.controller;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.imageio.ImageIO;
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
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.common.web.file.MyPutRet;
import com.genlot.common.web.file.QiniuCloudUtil;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.api.merchant.entity.vo.SpellBuyShareVo;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryCacheFacade;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.sns.entity.ShareInfo;
import com.genlot.ushop.facade.sns.enums.ShareStatusEnum;
import com.genlot.ushop.facade.sns.enums.ShareTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.SocialBizException;
import com.genlot.ushop.facade.sns.service.ShareCacheFacade;
import com.genlot.ushop.facade.sns.service.ShareManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareQueryFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;

import net.coobird.thumbnailator.Thumbnails;

@Controller
@RequestMapping(value = "/api/spellbuy/person/share")
public class ShareController {
	
	private static final Logger log = LoggerFactory.getLogger(ShareController.class);
	private static final String SLAVE_IMAGE_PREFIX_NAME = "_s";
	private static final int CONTENT_LENGTH_MAX_SIZE = 256;
	private static final int TITLE_LENGTH_MAX_SIZE = 64;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;	
	
	@Autowired
	private LatestLotteryFacade latestLotteryFacade;

	@Autowired
	private ShareManagementFacade shareManagementFacade;
	
	@Autowired
	private ShareQueryFacade shareQueryFacade;
	
	@Autowired
	private ShareCacheFacade shareCacheFacade;
	
	@Autowired
	private LatestLotteryCacheFacade latestLotteryCacheFacade;
	
	@Autowired
	private TaskEventProducer taskEventProducer;
	
	@Autowired
	private QiniuCloudUtil qiniuCloutUtil;
	
	@Autowired
	private  MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private UploadFileFacade uploadFileFacade;
	
	/**
	 * 提交晒单.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/share/private/submit
	 * @param 	请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.
	 * @param title 
	 * 			标题.
	 * @param content 
	 * 			内容.
	 * @param files 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/private/submit", method = RequestMethod.POST)
	@ResponseBody
	public Object submit(
			@RequestBody SpellBuyShareVo shareVo,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 判断评分数据是否合法 
			if (shareVo.getScore() == null)
			{
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			List<Integer> scores = JSON.parseArray(shareVo.getScore(),Integer.class);
			if (scores.isEmpty() || scores.size() > 3)
			{
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			for(int index = 0; index < scores.size(); ++index)
			{
				if (scores.get(index) < 0 || scores.get(index) > 5)
				{
					scores.set(index, 0);
				}
			}
			
			// 文件个数
			if (shareVo.getFiles() == null) { 
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			
			List<String> files = JSON.parseArray(shareVo.getFiles(),String.class);
			if (files.size() < 0 || files.size() > 3) {
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			
			// 内容大小
			if (shareVo.getTitle() == null 		||
				shareVo.getContent() == null 	||
				shareVo.getTitle().length() > TITLE_LENGTH_MAX_SIZE || 
				shareVo.getContent().length() > CONTENT_LENGTH_MAX_SIZE) {
				throw SocialBizException.SHARE_CONTENT_LENGTH_ERROR;
			}
				
			// 判断状态
			LatestLottery lottery = latestLotteryFacade.getBySpellbuyId(shareVo.getSpellbuyId());
			if (lottery == null) {
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
			if (lottery.getStatus() != LotteryLogisticsStatusEnum.SHARE.getValue()) {
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
			
			List<String> temps = new ArrayList<String>(); 
			ShareInfo shareInfo = new ShareInfo();
			for(int index = 0; index < files.size(); index++)
			{
				String url = files.get(index);
				if (index == 0) {
					shareInfo.setImage1(url);
				}
				else if (index == 1) {
					shareInfo.setImage2(url);
				}
				else if (index == 2) {
					shareInfo.setImage3(url);
				}
				else {
					continue;
				}
				
				temps.add(url);
				String urlKey = url.substring(url.lastIndexOf("/") + 1);
				temps.add(urlKey);
            }  
			
			shareInfo.setMerchantId(lottery.getMerchantId());
			shareInfo.setProductId(lottery.getProductId());
			shareInfo.setSpellbuyProductId(lottery.getSpellbuyProductId());
			shareInfo.setTitle(shareVo.getTitle());
			shareInfo.setContent(shareVo.getContent());
			shareInfo.setUpCount(0);
			shareInfo.setReplyCount(0);
			shareInfo.setReward(0);
			shareInfo.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
			shareInfo.setUserId(userNo);
			shareInfo.setScore(shareVo.getScore());
			shareInfo.setStatus(ShareStatusEnum.AUDIT.getValue());
			shareInfo.setProductType(lottery.getProductType());
			shareInfo.setProductUsage(ShareTypeEnum.SPELLBUY.getValue());
			
			//通过用户编码获得会员昵称
			MemberInfo memberInfo = memberInfoFacade.getMemberByUserNo(userNo);
			shareInfo.setUserName(memberInfo.getNickName());
			
			// 添加晒单
			shareManagementFacade.create(shareInfo);
			
			// 使用文件
			if (temps.size() > 0) {
				uploadFileFacade.deleteByURL(temps);
			}

			// 成功返回
			uiModel.put("share", shareInfo);
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
	 * 个人晒单列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/share/public/listUserShare/页数/每页多少个/用户id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userId 
	 * 			用户id.
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param access_token 
	 * 			请求参数 访问令牌.
	 * @param files 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listUserShare/{page}/{count}/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable Integer page,
    		@PathVariable Integer count,
    		@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);

		try
		{
			pageBean = shareCacheFacade.listPageByUserId(pageParam, userId,ShareTypeEnum.SPELLBUY.getValue());
			List<Long> lotteryIdList = new ArrayList<Long>();
			if (pageBean.getRecordList() != null && pageBean.getRecordList().size() > 0)
			{
				for(int index = 0; index < pageBean.getRecordList().size(); ++index)
				{
					ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
					lotteryIdList.add(info.getSpellbuyProductId());
				}
				
				Boolean result = false;
				if (lotteryIdList.size() > 0)
				{
					List<LatestLottery> lotterys = latestLotteryCacheFacade.listBySpellbuyIds(lotteryIdList);
					if (lotterys.size() == pageBean.getRecordList().size())
					{
						for(int index = 0; index < pageBean.getRecordList().size(); ++index)
						{
							ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
							LatestLottery object = lotterys.get(index);
							info.setObject(object);
						}
						
						result = true;
					}
				}
				
				if (result == false)
				{
					pageBean.setRecordList(null);
					pageBean.setTotalCount(0);
					pageBean.setPageCount(0);
				}
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("userId", userId);
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
		
	}
	
	/**
	 * 晒单列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/share/public/listShare/页数/每页多少个
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param files 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listShare/{page}/{count}", method = RequestMethod.GET)
	@ResponseBody
	public Object listShare(
			@PathVariable Integer page,
    		@PathVariable Integer count,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);

		try
		{
			pageBean = shareCacheFacade.listPage(pageParam,ShareTypeEnum.SPELLBUY.getValue());
			List<Long> lotteryIdList = new ArrayList<Long>();
			
			if (pageBean.getRecordList() != null && pageBean.getRecordList().size() > 0)
			{
				for(int index = 0; index < pageBean.getRecordList().size(); ++index)
				{
					ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
					lotteryIdList.add(info.getSpellbuyProductId());
				}
				
				Boolean result = false;
				
				if (lotteryIdList.size() > 0)
				{
					List<LatestLottery> lotterys = latestLotteryCacheFacade.listBySpellbuyIds(lotteryIdList);
					if (lotterys.size() == pageBean.getRecordList().size())
					{
						for(int index = 0; index < pageBean.getRecordList().size(); ++index)
						{
							ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
							LatestLottery object = lotterys.get(index);
							info.setObject(object);
						}
						
						result = true;
					}
					
					
				}
				
				if (result == false)
				{
					pageBean.setRecordList(null);
					pageBean.setTotalCount(0);
					pageBean.setPageCount(0);
				}
			}
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
	
	/**
	 * 某件商品的晒单列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/share/public/listShareByProductId/商品id/页数/每页个数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param files 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listShareByProductId/{productId}/{page}/{count}", method = RequestMethod.GET)
	@ResponseBody
	public Object listShareByProductId(
			@PathVariable Integer productId,
			@PathVariable Integer page,
    		@PathVariable Integer count,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);

		try
		{
			pageBean = shareCacheFacade.listPageByProductId(pageParam, productId);
			List<Long> lotteryIdList = new ArrayList<Long>();
			if (pageBean.getRecordList() != null && pageBean.getRecordList().size() > 0)
			{
				for(int index = 0; index < pageBean.getRecordList().size(); ++index)
				{
					ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
					lotteryIdList.add(info.getSpellbuyProductId());
				}
				
				Boolean result = false;
				
				if (lotteryIdList.size() > 0)
				{
					List<LatestLottery> lotterys = latestLotteryCacheFacade.listBySpellbuyIds(lotteryIdList);
					if (lotterys.size() == pageBean.getRecordList().size())
					{
						for(int index = 0; index < pageBean.getRecordList().size(); ++index)
						{
							ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
							LatestLottery object = lotterys.get(index);
							info.setObject(object);
						}
						
						result = true;
					}		
					
				}
				
				if (result == false)
				{
					pageBean.setRecordList(null);
					pageBean.setTotalCount(0);
					pageBean.setPageCount(0);
				}
			}
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
