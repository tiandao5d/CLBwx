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
@RequestMapping("/product/brand")
public class ProductBrandController {

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

	
	
	// 商品品牌列表
	@ResponseBody
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	public Object list(String status) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<ProductType> productTypeList = null;
		try {
			productTypeList = productTypeFacade.listBrand(status);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
	
		uiModel.put("recordList", productTypeList);
		return uiModel;
	}

	// 获得商品品牌对照列表
	@RequestMapping(value = { "/getMap" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getProductBandMap(HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		Map<String, Object> bandMap = new HashMap<String, Object>();
		
		List<Map> brandMapList = new ArrayList<Map>();
		try {

//			// 商品品牌
//			List<ProductType> bandList = productTypeFacade
//					.listProductBrand(String.valueOf(ProductBrandStatusEnum.UP.getValue()));
//
//			for (ProductType band : bandList) {
//				bandMap.put("value", band.getId());
//				bandMap.put("desc", band.getTypeName());
//			}
			// 商品品牌
			List<ProductType> bandList = productTypeFacade
					.listBrand(String.valueOf(ProductBrandStatusEnum.UP.getValue()));
			
			for (ProductType band : bandList) {
				bandMap = new HashMap<String, Object>();
				bandMap.put("value", band.getId());
				bandMap.put("desc", band.getTypeName());
				bandMap.put("father", band.getFirstTypeId());
				brandMapList.add(bandMap);
			}

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("bandMap", brandMapList);
		return uiModel;
	}

	


	// 商品品牌详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(
			// 品牌类型ID
			Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		ProductType productType = productTypeFacade.getBrandById(id);

		uiModel.put("productBrand", productType);
		return uiModel;
	}

	
	
	// 更新商品品牌
	@RequestMapping(value = { "/update" }, method = RequestMethod.POST)
	@ResponseBody
	public Object update(Long id, String typeName, HttpServletRequest request, Long firstTypeId) {

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductType productType = productTypeFacade.getBrandById(id);
		try {
			productType.setFirstTypeId(firstTypeId);
			productType.setTypeName(typeName);
			// 后台编辑直接生效
			productType.setStatus(ProductBrandStatusEnum.UP.getValue());
			productTypeFacade.update(productType);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "编辑商品品牌", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "编辑商品品牌", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 审核通过商品品牌
	@RequestMapping(value = { "/audit" }, method = RequestMethod.POST)
	@ResponseBody
	public Object audit(Long id, HttpServletRequest request) {

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductType productType = productTypeFacade.getBrandById(id);
		try {
			productType.setStatus(ProductBrandStatusEnum.UP.getValue());
			productType.setInstructions(null);

			productTypeFacade.update(productType);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "审核通过商品品牌",
					admin, WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "审核通过商品品牌", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 拒绝通过商品品牌
	@RequestMapping(value = { "/noPass" }, method = RequestMethod.POST)
	@ResponseBody
	public Object noPassProductBand(Long id, String instructions, HttpServletRequest request) {

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductType productType = productTypeFacade.getBrandById(id);
		try {
			productType.setStatus(ProductBrandStatusEnum.ILLEGAL.getValue());
			productType.setInstructions(instructions);
			productTypeFacade.update(productType);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "拒绝通过商品品牌",
					admin, WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "拒绝通过商品品牌", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	

	// 删除商品品牌
	@RequestMapping(value = { "/delete" }, method = RequestMethod.POST)
	@ResponseBody
	public Object deleteProductBrand(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			productTypeFacade.deleteBrand(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除商品品牌",
					admin, WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.ERROR, "删除商品品牌", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 增加商品品牌
	@RequestMapping(value = { "/add" }, method = RequestMethod.POST)
	@ResponseBody
	public Object addProductBrand(String typeName, HttpServletRequest request, Long firstTypeId) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {

			productTypeFacade.createBrand(typeName, firstTypeId, 0L, ProductBrandStatusEnum.UP.getValue());

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "增加商品品牌", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.ERROR, "增加商品品牌", admin,
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
		List productBrandStatusList = ProductBrandStatusEnum.toList();
		uiModel.put("productBrandStatusList", productBrandStatusList);
		return uiModel;
	}
	

	

	

//	// 拒绝并下架
//	@ResponseBody
//	@RequestMapping(value = { "/unAuditedProduct" }, method = RequestMethod.POST)
//	public Object downProductFromSell(Long id, String instructionp) {
//
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		try {
//			Product productInfo = productQueryFacade.getById(id);
//			productInfo.setInstructionp(instructionp);
//			productManagementFacade.update(productInfo);
//
//			productManagementFacade.unAudited(id);
//		} catch (Exception e) {
//			setErrorMessage(e, uiModel);
//			return uiModel;
//		}
//		uiModel.put("data", "SUCCESS");
//		return uiModel;
//	}




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
