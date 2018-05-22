package com.genlot.ushop.api.merchant.mall.person.controller;

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

import net.coobird.thumbnailator.Thumbnails;

import org.json.JSONArray;
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
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.api.merchant.entity.vo.MallShareDetailVo;
import com.genlot.ushop.api.merchant.entity.vo.MallShareVo;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.exceptions.MallBizException;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.sns.entity.ShareInfo;
import com.genlot.ushop.facade.sns.enums.ShareStatusEnum;
import com.genlot.ushop.facade.sns.enums.ShareTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.SocialBizException;
import com.genlot.ushop.facade.sns.service.ShareCacheFacade;
import com.genlot.ushop.facade.sns.service.ShareManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareQueryFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;

/**
 * Project Name:ushop-api-merchant 说明 ：商城商品晒单管理
 * 
 * @Date:2017年4月20日下午3:15:06
 * @author: KDS dongsheng.kang@lotplay.cn
 * 
 */

@Controller
@RequestMapping(value = "/api/mall/person/share")
public class Share2Controller {

	private static final Logger log = LoggerFactory.getLogger(Share2Controller.class);
	private static final int CONTENT_LENGTH_MAX_SIZE = 256;
	private static final int TITLE_LENGTH_MAX_SIZE = 64;

	@Autowired
	private OAuthManagementFacade oauthManagementFacade;

	@Autowired
	private ShareManagementFacade shareManagementFacade;

	@Autowired
	private ShareQueryFacade shareQueryFacade;

	@Autowired
	private ShareCacheFacade shareCacheFacade;

	@Autowired
	private TaskEventProducer taskEventProducer;

	@Autowired
	private UploadFileFacade uploadFileFacade;
	
	@Autowired
	private QiniuCloudUtil qiniuCloutUtil;

	@Autowired
	private MemberInfoFacade memberInfoFacade;

	@Autowired
	private ProductOrderFacade productOrderFacade;

	@Autowired
	private ProductQueryFacade productQueryFacade;

	/**
	 * 提交晒单.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/person/share
	 *          /private/submit
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId
	 *            拼购id.
	 * @param title
	 *            标题.
	 * @param content
	 *            内容.
	 * @param files
	 *            文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/private/submit", method = RequestMethod.POST)
	@ResponseBody
	public Object submit(
			@RequestBody MallShareVo shareVo,
			HttpServletRequest request, 
			HttpServletResponse response) {

		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 由于前面有拦截器，已经确定判断这个访问
		String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
		MemberInfo memberInfo = null;
		int i = 0;
		try {
						
			if (shareVo.getDetails().size() == 0) {
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
	
			// 判断评分数据是否合法
			if (shareVo.getScores() == null) {
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}

			if (shareVo.getScores().isEmpty() || shareVo.getScores().size() > 3) {
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			for (int index = 0; index < shareVo.getScores().size(); ++index) {
				Integer value = Integer.parseInt(shareVo.getScores().get(index));
				if (value < 0 || value > 5) {
					shareVo.getScores().set(index,"0");
				}
			}
			
			// 判断状态
			ProductOrder productOrder = productOrderFacade.getByNo(shareVo.getOrderNo());
			if (productOrder == null) {
				throw MallBizException.PRODUCT_ORDER_NOT_EXIST;
			}
			
			if (productOrder.getStatus() != ProductOrderStatusEnum.PRODUCT_ORDER_STAT_SHARE.getValue()) {
				throw MallBizException.PRODUCT_ORDER_STATUS_ERROR;
			}
			List<ShareInfo> newShareList = new ArrayList<ShareInfo>();
			List<String> temps = new ArrayList<String>(); 
			for (MallShareDetailVo entry : shareVo.getDetails()) {
				
				// 内容大小
				if (entry.getTitle().length() > TITLE_LENGTH_MAX_SIZE ||
					entry.getContent().length() > CONTENT_LENGTH_MAX_SIZE) {
					throw SocialBizException.SHARE_CONTENT_LENGTH_ERROR;
				}		
				ShareInfo shareInfo = new ShareInfo();				
				for (int index = 0; index < entry.getFiles().size(); index++) {
					String url = entry.getFiles().get(index);
					if (shareInfo.getImage1() == null) {
						shareInfo.setImage1(url);
					} else if (shareInfo.getImage2() == null) {
						shareInfo.setImage2(url);
					} else if (shareInfo.getImage3() == null) {
						shareInfo.setImage3(url);
					}
					else {
						continue;
					}
					String urlKey = url.substring(url.lastIndexOf("/") + 1);
					temps.add(urlKey);
				}

				Product productInfo = productQueryFacade.getById(entry.getProductId());
				if( productInfo != null ){					
					shareInfo.setProductImage(productInfo.getHeadImage());
				}
				shareInfo.setMerchantId(productInfo.getMerchantId());
				shareInfo.setProductUsage(ShareTypeEnum.SHOP.getValue());
				shareInfo.setProductId(entry.getProductId());
				shareInfo.setTitle(entry.getTitle());
				shareInfo.setContent(entry.getContent());
				shareInfo.setUpCount(0);
				shareInfo.setReplyCount(0);
				shareInfo.setReward(0);
				shareInfo.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
				shareInfo.setUserId(userNo);
				shareInfo.setScore(JSON.toJSONString(shareVo.getScores()));
				shareInfo.setStatus(ShareStatusEnum.AUDIT.getValue());
				shareInfo.setOrderNo(shareVo.getOrderNo());
				shareInfo.setProductType(productInfo.getProductType());
				memberInfo = memberInfoFacade.getMemberByUserNo(userNo);
				shareInfo.setUserName(memberInfo.getNickName());
				shareInfo.setUserImage(memberInfo.getHeadImage());
				newShareList.add(shareInfo);
				i = i + 1;				
			}
			shareManagementFacade.create(newShareList);	
			if (temps.size() > 0) {
				uploadFileFacade.deleteByURL(temps);
			}
						 
			// 成功返回
			uiModel.put("result", "SUCCESS");

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	/**
	 * 个人晒单列表.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/person/share
	 *          /public/listUserShare/页数/每页多少个/用户id
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param userId
	 *            用户id.
	 * @param page
	 *            第几页.
	 * @param count
	 *            每页多少个
	 * @param access_token
	 *            请求参数 访问令牌.
	 * @param files
	 *            文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listUserShare/{page}/{count}/{userId}", method = RequestMethod.GET)
	@ResponseBody
	public Object listUserShare(@PathVariable Integer page,
			@PathVariable Integer count, @PathVariable String userId,
			HttpServletRequest request, HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page, count);

		try {
			pageBean = shareCacheFacade.listPageByUserId(pageParam,
					userId, ShareTypeEnum.SHOP.getValue());
			
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
				Product object = productQueryFacade.getById(info.getProductId());
				info.setObject(object);
			}
			

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
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
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/person
	 *          /share/public/listShare/页数/每页多少个
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param page
	 *            第几页.
	 * @param count
	 *            每页多少个
	 * @param files
	 *            文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listShare/{page}/{count}", method = RequestMethod.GET)
	@ResponseBody
	public Object listShare(@PathVariable Integer page,
			@PathVariable Integer count, HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page, count);

		try {
			pageBean = shareCacheFacade.listPage(pageParam,ShareTypeEnum.SHOP.getValue());
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
				Product object = productQueryFacade.getById(info.getProductId());
				info.setObject(object);
			}
			

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
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
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person
	 *          /share/public/listShareByProductId/商品id/页数/每页个数
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param page
	 *            第几页.
	 * @param count
	 *            每页多少个
	 * @param files
	 *            文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/public/listShareByProductId/{productId}/{page}/{count}", method = RequestMethod.GET)
	@ResponseBody
	public Object listShareByProductId(@PathVariable Integer productId,
			@PathVariable Integer page, @PathVariable Integer count,
			HttpServletRequest request, HttpServletResponse response) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page, count);

		try {
			pageBean = shareCacheFacade.listPageByProductId(pageParam,
					productId);
			
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
				Product object = productQueryFacade.getById(info.getProductId());
				info.setObject(object);
			}

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());

		return uiModel;

	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		uiModel.clear();
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
