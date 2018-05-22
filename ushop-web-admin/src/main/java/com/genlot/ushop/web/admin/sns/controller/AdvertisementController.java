	package com.genlot.ushop.web.admin.sns.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.service.ProductManagementFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.sns.entity.Advertisement;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.service.AdvertisementFacade;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/sns/advertisement")
public class AdvertisementController {

	@Autowired
	private AdvertisementFacade advertisementFacade;
		
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private BannerCacheFacade bannerCacheFacade;
	
	@Autowired 
	private UploadFileFacade uploadFileFacade;
	
	@Autowired
	private PmsFacade pmsFacade;
	
	@Autowired
	private ProductManagementFacade productManagementFacade;
	
	@Autowired
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;

	// 通过ID获得advertisement
	@ResponseBody
	@RequestMapping(value = "/get", method = RequestMethod.GET)
	public Object getById(Long Id, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		Advertisement advertisement = advertisementFacade.getById(Id);		
		uiModel.put("advertisement", advertisement);
		return uiModel;
	}

	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			// 分页
			Integer page, Integer rows, Integer relationType,Integer position,
			Integer isLeaf,Integer province,
			String startDate, String endDate, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			paramMap.put("relationType", relationType);
			paramMap.put("position", position);
			paramMap.put("beginDate", startDate);
			paramMap.put("endDate", endDate);
			paramMap.put("isLeaf", isLeaf);
			paramMap.put("province", province);
			pageBean = advertisementFacade.listPage(pageParam, paramMap);

		} catch (Exception exception) {
			exception.printStackTrace();
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		
		for (Object obj : pageBean.getRecordList()) {
			Advertisement advertisement = (Advertisement) obj;
			if (StringUtils.isBlank(advertisement.getImageUrl()) 
					&& StringUtils.isNotBlank(advertisement.getRelationId()) 
					&& StringUtils.isNumeric(advertisement.getRelationId())
					&& advertisement.getRelationType() == BannerRelationTypeEnum.PRODUCT.getValue()) {
				Product product = productQueryFacade.getById(Long.valueOf(advertisement.getRelationId()));
				if (product != null) {
					advertisement.setImageUrl(product.getHeadImage());
				}
			}
		}
		
		
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	}

	// 添加橱窗或者广告位
	@ResponseBody
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public Object add(
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Advertisement advertisement = new Advertisement();
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			Binder.BindWebFormToClass(request, advertisement);
			bannerCacheFacade.clearAdvertisementCache(advertisement.getProvince());
			advertisementFacade.insert(advertisement);
			
			if(advertisement.getRelationType()==2){//判断是否为游戏广告位
				if (advertisement != null && StringUtils.isNotBlank(advertisement.getImageUrl())) {
					String fileKey = advertisement.getImageUrl().substring(advertisement.getImageUrl().lastIndexOf("/") + 1);
					List<String> delFiles = new ArrayList<String>(); 
					delFiles.add(fileKey);
					uploadFileFacade.deleteByURL(delFiles);
				}
			}
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增橱窗广告", admin,
					WebUtils.getIpAddr(request));
			
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增橱窗广告", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}



	// 编辑广告栏目

	@ResponseBody
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	public Object edit(Long id, 
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			Advertisement advertisement = advertisementFacade.getById(id);
			bannerCacheFacade.clearAdvertisementCache(advertisement.getProvince());//去除老的的省份缓存
			String origImageUrl = advertisement.getImageUrl();

			if (advertisement != null) {
				Binder.bind(request, advertisement);
			}
			
			List<String> discardFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 
			
			if(advertisement.getIsLeaf()==null){
				Advertisement newAdvertisement=new Advertisement();
				newAdvertisement.setIsLeaf(Integer.parseInt(advertisement.getId().toString()));
				newAdvertisement.setBeginTime(advertisement.getBeginTime());
				newAdvertisement.setEndTime(advertisement.getEndTime());
				advertisementFacade.updateByIsLeaf(newAdvertisement);//同步该橱窗下所有广告位的时间
			}
			
			bannerCacheFacade.clearAdvertisementCache(advertisement.getProvince());//去除新的的省份缓存
			if (StringUtils.isNotBlank(advertisement.getImageUrl())) {
				//删除临时记录
				tempFiles.add(advertisement.getImageUrl().substring(advertisement.getImageUrl().lastIndexOf("/") + 1));
			}
			
			//删除原来的文件
			if (StringUtils.isNotBlank(origImageUrl) && 
				StringUtils.isNotBlank(advertisement.getImageUrl()) && 
				!origImageUrl.equals(advertisement.getImageUrl())) {
				discardFiles.add(origImageUrl.substring(origImageUrl.lastIndexOf("/") + 1));
			}
			
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			advertisementFacade.update(advertisement);
			uploadFileFacade.deleteByURL(tempFiles);
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑首页广告", admin,
					WebUtils.getIpAddr(request));
			
			
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑首页广告", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除广告栏目
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			Advertisement advertisement = advertisementFacade.getById(id);
			List<String> discardFiles = new ArrayList<String>(); 
			bannerCacheFacade.clearAdvertisementCache(advertisement.getProvince());
			if (advertisement != null) {
				
				if (StringUtils.isNotBlank(advertisement.getImageUrl())) {
					String key = advertisement.getImageUrl();
					key = key.substring(key.lastIndexOf("/") + 1);
					discardFiles.add(key);
				}
				if (!discardFiles.isEmpty()) {
					uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
				}
				advertisementFacade.delete(id);
			}
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "删除橱窗或广告位", admin,
					WebUtils.getIpAddr(request));
			
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除橱窗或广告位", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	// 同步
	@ResponseBody
	@RequestMapping(value = "/sync", method = RequestMethod.GET)
	public Object syncByRelationId(String relationId, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try{
			String[] strs=relationId.split("\\|");//分割字符串	
			Long realRelationId=Long.parseLong(strs[1]);
			Product product = productQueryFacade.getById(realRelationId);

			if(product==null){
				uiModel.put("failed", "can't find the goods");
			}else{
				uiModel.put("imageUrl", product.getHeadImage());
				if("2".equals(strs[0])){//判断是否为电商商品
					uiModel.put("rule", product.getRule());
				}else{
					uiModel.put("productPrice", product.getProductPrice());
				}
				
				uiModel.put("data", "SUCCESS");
			}
		}
		catch(Exception exception){
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}	
		return uiModel;
	}
	
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		uiModel.put("relationTypeList", BannerRelationTypeEnum.toList());
		uiModel.put("postitionTypeList", AdvertPostitionTypeEnum.toList());
		return uiModel;
	}
	


	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		exception.printStackTrace();
		
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
