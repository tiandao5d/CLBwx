package com.genlot.ushop.web.admin.system.controller;

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
import com.genlot.common.web.file.MyPutRet;
import com.genlot.common.web.file.QiniuCloudUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/file")
public class FileController {

	@Autowired
	private QiniuCloudUtil qiniuCloudUtil;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;

	// 上传文件
	@RequestMapping(value = { "/add" }, method = RequestMethod.POST)
	@ResponseBody
	public Object addPicture(@RequestParam(value = "file", required = false) MultipartFile file,
			HttpServletRequest request) {
		String key;
		String downloadUrl; 
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			// 上传七牛云
			SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssS");
			UUID uuid = UUID.nameUUIDFromBytes(sdf.format(new Date()).getBytes());
			key = uuid.toString() + file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), key, new Date());
			MyPutRet myPutRet = qiniuCloudUtil.uploadFile(file.getInputStream(), key);
			downloadUrl = qiniuCloudUtil.getDowloadBaseUrl(key);
			if (myPutRet == null) {
				throw BizException.MESSAGE_SYSTEM_ERROR;
			}
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("url", downloadUrl);
		return uiModel;
	}

	// 删除图片
	@RequestMapping(value = { "/delete" }, method = RequestMethod.POST)
	@ResponseBody
	public Object deletePicture(String url, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			if (!qiniuCloudUtil.deleteFile(url)) {
				throw BizException.MESSAGE_SYSTEM_ERROR;
			}
			if (StringUtils.isNotBlank(url)) {
				List<String> keys = new ArrayList<String>();
				keys.add(url.substring(url.lastIndexOf("/") + 1));
				uploadFileFacade.deleteByURL(keys);
			}
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
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
