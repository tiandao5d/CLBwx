package com.genlot.ushop.web.admin.product.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;

import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.product.entity.ProductActivity;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.ProductPriceRule;
import com.genlot.ushop.facade.product.entity.ProductType;
import com.genlot.ushop.facade.product.enums.ProductBrandStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductImageTypeEnum;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductActivityFacade;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductManagementFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.ProductTypeFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductCacheFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

@Controller
@RequestMapping("/product")
public class ProductController {

	@Autowired
	private ProductTypeFacade productTypeFacade;
	@Autowired
	private ProductQueryFacade productQueryFacade;
	@Autowired
	private ProductManagementFacade productManagementFacade;
	@Autowired
	private MerchantFacade merchantFacade;
	@Autowired
	private ProductImageFacade productImageFacade;
	@Autowired
	private ProductCacheFacade productCacheFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private SpellBuyProductCacheFacade spellBuyProductCacheFacade;
	@Autowired
	private ProductActivityFacade productActivityFacade;
	
	private Map<String, Object> productStyleMap;

	// 商品列表
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			// 分页
			Integer page, Integer rows,
			// 角色名称
			Integer productType, String productBrand, String productName, String merchantNo,
			// 商品状态
			Integer productStatus, Integer usage, Integer activityId, HttpSession session) {

		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = new PageBean();

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}

		List<ProductActivity> productActivityList = productActivityFacade.listBy(null);
		try {

			if (productName != null) {
				productName = productName.trim();
			}
			paramMap.put("orderBy", "CREATE_DATE");

			if (productType != null && productType.intValue() != 1) {
				paramMap.put("productType", productType);

			}

			paramMap.put("productBrand", productBrand);
			paramMap.put("productNameKey", productName);
			if(productStatus != null){
				if(productStatus != 7){
					paramMap.put("status", productStatus);
				}else{
					paramMap.put("activityStatus", productStatus);
				}
				
			}
			paramMap.put("merchantId", merchantNo);
			paramMap.put("activityId", activityId);
			paramMap.put("usage", usage);
			pageBean = productQueryFacade.listPage(pageParam, paramMap);

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}


		


		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("productActivityList", productActivityList);

		return uiModel;
	}


	// 商品详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		Product productInfo = productQueryFacade.getById(id);

		List<ProductImage> productImgList = productImageFacade.listByProductId(id);

		uiModel.put("productImgList", productImgList);
		uiModel.put("productImageType", ProductImageTypeEnum.toList());
		uiModel.put("product", productInfo);

		return uiModel;
	}

	// 审核更新商品
	// 当业务拓展后（单次购买价格可以不为1，商品限购次数可以设置的时候，后台审核应用这个方法）
	/*
	 * @RequestMapping(value = {"/auditProduct"}, method = RequestMethod.POST)
	 * 
	 * @ResponseBody public Object auditProduct( Product productInfo,
	 * HttpServletRequest request ) {
	 * 
	 * Map<String,Object> uiModel = new HashMap<String,Object>();
	 * 
	 * try { //暂时没有这个业务，所以限购次数默认为0，表示不限购 productInfo.setProductLimit(0);
	 * productManagementFacade.updatePruductInfo(productInfo);
	 * productManagementFacade
	 * .auditProductToSell(productInfo.getId().intValue());
	 * 
	 * } catch (Exception e) { setErrorMessage(e,uiModel); return uiModel; }
	 * uiModel.put("data", "SUCCESS"); return uiModel; }
	 */



	// 活动审核更新商品
	@RequestMapping(value = { "/auditProduct" }, method = RequestMethod.POST)
	@ResponseBody
	public Object auditProduct(
			Long id,
			Double productPrice,
			Double productRealPrice, 
			String rule, 
			Integer usage, 
			HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		try {
			Product productInfo = productQueryFacade.getById(id);

			// 活动商品
			if (productInfo.getActivityId() != null) {

				int flag = 0;
				List<ProductPriceRule> ProductPriceRuleList = JSON.parseArray(rule, ProductPriceRule.class);
				for (int i = 0; i < ProductPriceRuleList.size(); i++) {
					ProductPriceRuleList.get(i).setId(i);
					flag += ProductPriceRuleList.get(i).getFlag();
				}
				if (flag != 1) {
					throw ProductBizException.PRODUCT_PRICE_RULE_NOT_ACTIVE;
				}
				productInfo.setProductPrice(productPrice);
				productInfo.setProductRealPrice(productRealPrice);
				
				productInfo.setRule(JSON.toJSONString(ProductPriceRuleList));
				productManagementFacade.update(productInfo);
				productManagementFacade.changeStatus(id, ProductStatusEnum.APPROVED);

			} else {
				throw ProductBizException.PRODUCT_PRICE_USAGE_NOT_ACTIVE;
			}

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 审核并上架
	@RequestMapping(value = { "/auditProductToSell" }, method = RequestMethod.POST)
	@ResponseBody
	@Transactional(rollbackFor = Exception.class)
	public Object auditProductToSell(Long id,
			Double productPrice,
			Double singlePrice,
			Integer spellbuyCount, 
			String rule,
			Integer usage, 
			HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			Product productInfo = productQueryFacade.getById(id);

			if (usage != ProductUsageEnum.SPELLBUY.getValue()) {
				// 非拼购商品
				int flag = 0;
				List<ProductPriceRule> ProductPriceRuleList = JSON.parseArray(rule, ProductPriceRule.class);
				for (int i = 1; (i - 1) < ProductPriceRuleList.size(); i++) {
					ProductPriceRuleList.get(i - 1).setId(i);
					flag = +ProductPriceRuleList.get(i - 1).getFlag();
				}
				if (flag != 1) {
					throw ProductBizException.PRODUCT_PRICE_RULE_NOT_ACTIVE;
				}

				productInfo.setRule(JSON.toJSONString(ProductPriceRuleList));
			} else {
				// 拼购商品

				// 暂时没有这个业务，所以限购次数默认为0，表示不限购
				productInfo.setProductLimit(0);
				// 后台审核能修改商品的销售价格
				if (productPrice != null) {
					productInfo.setProductPrice(productPrice);
				}
				// 上架时对应上架次数+1
				productInfo.setUpNumber(productInfo.getUpNumber() + 1);

				// 格式化，保留两位小数
				java.text.DecimalFormat df = new java.text.DecimalFormat("#.00");
				String single = df.format(singlePrice);
				productInfo.setSinglePrice(Double.valueOf(single));

				productInfo.setSpellbuyCount(spellbuyCount);
			}
			productManagementFacade.update(productInfo);

			productManagementFacade.auditToSell(id);
			// 清除缓存
			productCacheFacade.deleteById(id);

			spellBuyProductCacheFacade.clear();

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "审核并上架商品", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "审核并上架商品", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 商品状态
		List productStatusList = ProductStatusEnum.toList();
		List productUsageList = ProductUsageEnum.toList();
		
		uiModel.put("productUsageList", productUsageList);
		uiModel.put("productStatusList", productStatusList);


		return uiModel;
	}

	// 拒绝并下架
	@ResponseBody
	@RequestMapping(value = { "/unAuditedProduct" }, method = RequestMethod.POST)
	public Object downProductFromSell(Long id, String instructionp) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			Product productInfo = productQueryFacade.getById(id);
			productInfo.setInstruction(instructionp);
			productManagementFacade.update(productInfo);

			productManagementFacade.unAudited(id);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 活动商品强制下架
	@ResponseBody
	@RequestMapping(value = { "/forcedOff" }, method = RequestMethod.POST)
	public Object forcedOff(Long id, String instructionp) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			productManagementFacade.downFromSell(id,instructionp);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	
	@ModelAttribute("productStyleMap")
	public Map<String, Object> getProductStyleMap() {
		productStyleMap = new HashMap<String, Object>();
		productStyleMap.put("新品", "0");
		productStyleMap.put("推荐", "1");
		productStyleMap.put("人气", "2");
		productStyleMap.put("限时", "3");
		return productStyleMap;
	}

	protected void setErrorMessage(Exception exception, Map<String, Object> uiModel) {
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
