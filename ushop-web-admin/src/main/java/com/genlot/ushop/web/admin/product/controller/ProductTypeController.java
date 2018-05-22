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
import com.genlot.ucenter.facade.pms.entity.PmsRole;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.enums.PmsRoleTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
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

@Controller
@RequestMapping("/product/type")
public class ProductTypeController {

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

	// 商品类型列表
	@ResponseBody
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	public Object list() {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<ProductType> productTypeList = null;
		try {

			productTypeList = productTypeFacade.listCategory();
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("recordList", productTypeList);
		return uiModel;
	}


	// 获得商品类型对照列表
	@RequestMapping(value = { "/getMap" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getMap(HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		Map<String, Object> typeMap = new HashMap<String, Object>();

		List<Map> typeMapList = new ArrayList<Map>();
		try {

//			// 商品类型
//			List<ProductType> typeList = productTypeFacade.listProductCategory();
//
//			for (ProductType Type : typeList) {
//				typeMap.put("value", Type.getId());
//				typeMap.put("desc", Type.getTypeName());
//			}
			
			// 商品类型
			List<ProductType> typeList = productTypeFacade.listCategory();
	

			for (ProductType Type : typeList) {
			    typeMap = new HashMap<String, Object>();
				typeMap.put("value", Type.getId());
				typeMap.put("desc", Type.getTypeName());
				typeMapList.add(typeMap);
			}
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		
		uiModel.put("typeMap", typeMapList);
		return uiModel;
	}

	


	// 增加商品类型
	@RequestMapping(value = { "/add" }, method = RequestMethod.POST)
	@ResponseBody
	public Object add(HttpServletRequest request, String typeName, Long firstTypeId, String URL,Integer sort) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			// 创建
			productTypeFacade.createCategory(typeName, firstTypeId, 0L, URL, sort);
			// 删除临时文件
			List<String> delFiles = new ArrayList<String>(); 
			delFiles.add(URL.substring(URL.lastIndexOf("/") + 1));
			uploadFileFacade.deleteByURL(delFiles);
			// 清空缓存
			productCacheFacade.deleteType();
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "增加商品类型", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.ERROR, "增加商品类型", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}


	// 商品类型详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(
			// 品牌类型ID
			Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		ProductType productType = productTypeFacade.getBrandById(id);

		uiModel.put("productType", productType);

		return uiModel;
	}

	// 更新商品类型
	@RequestMapping(value = { "/update" }, method = RequestMethod.POST)
	@ResponseBody
	public Object update(Long id, String URL, String typeName, HttpServletRequest request,
			Long firstTypeId, Integer sort) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductType productType = productTypeFacade.getBrandById(id);

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		
		try {
			
			List<String> discardFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 
			if(productType.getPictureAddress() != null && !productType.getPictureAddress().equals("")){
				if (!URL.equals(productType.getPictureAddress())) {
					tempFiles.add(URL.substring(URL.lastIndexOf("/") + 1));
					discardFiles.add(productType.getPictureAddress().substring(productType.getPictureAddress().lastIndexOf("/") + 1));
				}
			}
			productType.setPictureAddress(URL);
			productType.setFirstTypeId(firstTypeId);
			productType.setTypeName(typeName);
			productType.setSort(sort);
			// 清空缓存
			productCacheFacade.deleteType();
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			productTypeFacade.update(productType);
			uploadFileFacade.deleteByURL(tempFiles);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "编辑商品类型", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "编辑商品类型", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	
	// 删除商品类型
	@RequestMapping(value = { "/delete" }, method = RequestMethod.POST)
	@ResponseBody
	public Object delete(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			//获得当前角色ID
			String roleId = pmsFacade.getRoleIdsByOperatorId(admin.getId());
			//获得该用户当前角色 
			PmsRole pmsRole = pmsFacade.getRoleById( Long.valueOf(roleId).longValue());
			//判断该用户是否为超级管理员
			if(!pmsRole.getRoleType().equals(PmsRoleTypeEnum.SUPER_ADMIN.getValue())){
				throw UserBizException.PERMISSION_USER_NOT_MENU; //抛出权限不足异常
			}
			else{
				List<String> discardFiles = new ArrayList<String>(); 
				ProductType productType = productTypeFacade.getBrandById(id);
				if (StringUtils.isNotBlank(productType.getPictureAddress())) {
					String key = productType.getPictureAddress();
					key = key.substring(key.lastIndexOf("/") + 1);
					discardFiles.add(key);
				}
				if (!discardFiles.isEmpty()) {
					uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
				}
				productTypeFacade.deleteCategory(id);
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除商品类型",
						admin, WebUtils.getIpAddr(request));
			}
		} catch (Exception e) {

			setErrorMessage(e, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.ERROR, "删除商品类型", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
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
