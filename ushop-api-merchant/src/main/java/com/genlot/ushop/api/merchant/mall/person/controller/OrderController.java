package com.genlot.ushop.api.merchant.mall.person.controller;

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
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.entity.vo.ProductSalesReturnVo;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.exceptions.MallBizException;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;

@Controller
@RequestMapping(value = "/api/mall/person/order")
public class OrderController {

	private static final Logger log = LoggerFactory
			.getLogger(OrderController.class);

	@Autowired
	private OAuthManagementFacade oauthManagementFacade;

	@Autowired
	private ProductOrderFacade productOrderFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;

	// 用户个人订单列表
	@RequestMapping(value = { "/orderlist/{page}/{status}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object orderlist(
			// 页码
			@PathVariable Integer page, @PathVariable Integer status,
			HttpServletRequest request, HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageParam pageParam = new PageParam(page, 10);
		PageBean pageBean = null;
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request
					.getParameter(AccessToken.OAUTH_PARAM_USERID);
			pageBean = productOrderFacade.listPageByUser(pageParam, userId,
					status);
			//300表示用户全部订单，其中包括未支付订单，所以还需要返回用户账户信息
			if(status == ProductOrderStatusEnum.PRODUCT_ORDER_STAT_NOT_PAID.getValue() ||
			   status == ProductOrderStatusEnum.PRODUCT_ORDER_STAT_ALL.getValue() ){
				Account RMBAccount = accountQueryFacade.getAccountByUserNo_fundType(userId,Long.valueOf(AccountFundTypeEnum.RMB.getValue()));
				Account pointAccount = accountQueryFacade.getAccountByUserNo_fundType(userId,Long.valueOf(AccountFundTypeEnum.POINT.getValue()));

				uiModel.put("RMB", RMBAccount.getBalance());
				uiModel.put("point", pointAccount.getBalance());
			}
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

	// 用户个人订单详情
	@RequestMapping(value = { "/getOrderByOrderNo/{orderNo}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getOrderByOrderNo(
			// 页码
			@PathVariable String orderNo, HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		try {
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request
					.getParameter(AccessToken.OAUTH_PARAM_USERID);
			ProductOrder productOrder = productOrderFacade.getByNo(orderNo);
		
			uiModel.put("productOrder", productOrder);
			uiModel.put("userId", userId);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("ProductOrderStatusList", ProductOrderStatusEnum.toList());

		return uiModel;
	}

	// 获得我的页面各种状态未处理记录数据
	@RequestMapping(value = { "/getCount" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getCount(HttpServletRequest request, HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request
					.getParameter(AccessToken.OAUTH_PARAM_USERID);

			// 待支付
			Integer noPayCount = productOrderFacade.getOrderCount(userId,
					ProductOrderStatusEnum.PRODUCT_ORDER_STAT_NOT_PAID);
			// 待发货
			Integer noExperssCount = productOrderFacade.getOrderCount(userId,
					ProductOrderStatusEnum.PRODUCT_ORDER_STAT_EXPRESS);
			// 待收货
			Integer noReceiveCount = productOrderFacade.getOrderCount(userId,
					ProductOrderStatusEnum.PRODUCT_ORDER_STAT_RECEIVE);
			// 待晒单
			Integer noShareCount = productOrderFacade.getOrderCount(userId,
					ProductOrderStatusEnum.PRODUCT_ORDER_STAT_SHARE);
			// 退货
			Integer backCount = productOrderFacade.getOrderCount(userId,
					ProductOrderStatusEnum.PRODUCT_ORDER_STAT_BACK);

			uiModel.put("backCount", backCount);
			uiModel.put("noPayCount", noPayCount);
			uiModel.put("noExperssCount", noExperssCount);
			uiModel.put("noReceiveCount", noReceiveCount);
			uiModel.put("noShareCount", noShareCount);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	/**
	 * 订单取消请求.
	 * 
	 * @param 请求参数
	 *            访问令牌
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo
	 *            订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/cancel", method = RequestMethod.POST)
	@ResponseBody
	public Object cancel(
			@RequestBody(required=true) Map<String,Object> parMap,
			HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		// 通过令牌获得用户ID
		try {
			
			String orderNo = null;
			String comment = null;
			if (parMap.get("orderNo") != null) {
				orderNo = parMap.get("orderNo").toString();
			}
			if (parMap.get("comment") != null) {
				comment = parMap.get("comment").toString();
			}
			
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);

			ProductOrder productOrder = productOrderFacade.getByNo(orderNo);
			
			if (productOrder == null) {
				throw MallBizException.PRODUCT_ORDER_NOT_EXIST;
			}
			productOrderFacade.cancel(userId,orderNo, comment);


		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");

		return uiModel;
	}

	/**
	 * 收货.
	 * 
	 * @param 请求参数
	 *            访问令牌
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo
	 *            订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/receive/{orderNo}", method = RequestMethod.POST)
	@ResponseBody
	public Object receive(@PathVariable String orderNo,
			HttpServletRequest request, HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		// 通过令牌获得用户ID
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			ProductOrder productOrder = productOrderFacade.getByNo(orderNo);
			if (productOrder == null) {
				throw MallBizException.PRODUCT_ORDER_NOT_EXIST;
			}
			productOrderFacade.receive(orderNo);

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");

		return uiModel;
	}

	/**
	 * 退货申请.
	 * 
	 * @param 请求参数
	 *            访问令牌
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo
	 *            订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/postBack/{orderNo}", method = RequestMethod.POST)
	@ResponseBody
	public Object postBack(
			 @RequestBody List<ProductSalesReturnVo> items,
			 @PathVariable String orderNo,
			HttpServletRequest request, HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		// 通过令牌获得用户ID
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			productOrderFacade.postBack(userId, orderNo, items);

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	
	/**
	 * 取消退货申请.
	 * 
	 * @param 请求参数
	 *            访问令牌
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo
	 *            订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/cancelPostBack/{orderNo}", method = RequestMethod.POST)
	@ResponseBody
	public Object cancelPostBack(
			@PathVariable String orderNo,
			HttpServletRequest request, HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		// 通过令牌获得用户ID
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			productOrderFacade.cancelBack(userId, orderNo);

		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");

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
