package com.genlot.ushop.web.admin.sns.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/sns/banner")
public class BannerController {

	@Autowired
	BannerFacade bannerFacade;
	@Autowired
	private BannerCacheFacade bannerCacheFacade;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;

	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			Integer page, 
			Integer rows, 
			Integer bannerType, 
			Date startDate, 
			Date endDate, 
			Integer relationType,
			HttpServletRequest request, 
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;
		
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}

		try {
			paramMap.put("type", bannerType);
			paramMap.put("startTime", startDate);
			paramMap.put("endTime", endDate);
			paramMap.put("relationType", relationType);
			pageBean = bannerFacade.listPage(pageParam, paramMap);

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

	
	// 添加广告栏目
	@ResponseBody
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public Object add(
			String URL, 
			Integer bannerType, 
			String relationWebId, 
			String beginTime, 
			String endTime,
			String bannerName, 
			Integer relationType, 
			Integer province,
			Integer sort,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Banner banner = new Banner();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			bannerCacheFacade.clearBannerCache(bannerType,province);
			banner.setBannerType(bannerType);
			banner.setCreator(admin.getLoginName());
			banner.setEffect(1);
			banner.setRelationWebId(relationWebId);
			banner.setPictureAddress(URL);
			banner.setBeginTime(DateUtils.getDateByStr(beginTime));
			banner.setEndTime(DateUtils.getDateByStr(endTime));
			banner.setRelationType(relationType);
			banner.setBannerName(bannerName);
			banner.setProvince(province);
			banner.setSort(sort);
			bannerFacade.insert(banner);
			List<String> delFiles = new ArrayList<String>(); 
			if (StringUtils.isNotBlank(URL)) {
				String fileKey = URL.substring(URL.lastIndexOf("/") + 1);
				delFiles.add(fileKey);
			}
			uploadFileFacade.deleteByURL(delFiles);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "新增广告", admin, WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.ERROR, "新增广告", admin, WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}



	// 编辑广告栏目
	@ResponseBody
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	public Object edit(
			Long id, 
			String URL, 
			Integer bannerType, 
			String relationWebId, 
			String bannerName,
			String beginTime, 
			String endTime, 
			Integer relationType, 
			Integer province,
			Integer sort,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			Banner banner = this.bannerFacade.getById(id);
			if (banner == null) {
				throw BannerBizException.BANNER_NOT_EXIST;
			}
			List<String> discardFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 
			if (URL != null && !URL.equals(banner.getPictureAddress())) {
				if (StringUtils.isNotBlank(banner.getPictureAddress())) {
					discardFiles.add(banner.getPictureAddress().substring(banner.getPictureAddress().lastIndexOf("/") + 1));
				}
				if (StringUtils.isNotBlank(URL)) {
					tempFiles.add(URL.substring(URL.lastIndexOf("/") + 1));
				}
				banner.setPictureAddress(URL);
			}
			Integer oldType = banner.getBannerType();
			Integer oldProvince = banner.getProvince();
			Binder.bind(request, banner);
			bannerCacheFacade.clearBannerCache(0,0);
			bannerCacheFacade.clearBannerCache(oldType,oldProvince);
			bannerCacheFacade.clearBannerCache(banner.getBannerType(),province);
			
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			bannerFacade.update(banner);
			uploadFileFacade.deleteByURL(tempFiles);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "编辑广告", admin,	WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "编辑广告", admin, WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除广告栏目
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(Integer id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			Banner banner = bannerFacade.getById(id.longValue());
			List<String> discardFiles = new ArrayList<String>(); 
			if (banner != null) {

				if (StringUtils.isNotBlank(banner.getPictureAddress())) {
					String key = banner.getPictureAddress();
					key = key.substring(key.lastIndexOf("/") + 1);
					discardFiles.add(key);
				}
				bannerCacheFacade.clearBannerCache(banner.getBannerType(),banner.getProvince());
				if (!discardFiles.isEmpty()) {
					uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
				}
				bannerFacade.delete(id);
			}
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除广告", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除广告", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 通过ID获得banner
	@SuppressWarnings("unchecked")
	@ResponseBody
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	public Object getById(Long Id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		Banner banner = bannerFacade.getById(Id);
		uiModel.putAll(BeanMapUtil.convertBean(banner));
		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List bannerTypeList = BannerTypeEnum.toList();
		List bannerEffcetList = BannerEffcetEnum.toList();
		List bannerRelationTypeList = BannerRelationTypeEnum.toList();
		uiModel.put("typeList", bannerTypeList);
		uiModel.put("effcetList", bannerEffcetList);
		uiModel.put("relationList", bannerRelationTypeList);
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
