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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.genlot.common.enums.DeviceEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.entity.OrderCurrencyVo;
import com.genlot.common.message.order.event.entity.OrderProductVo;
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
import com.genlot.ushop.facade.game.entity.LottoGame;
import com.genlot.ushop.facade.game.entity.LottoGameIssue;
import com.genlot.ushop.facade.game.entity.LottoGamePrize;
import com.genlot.ushop.facade.game.enums.LottoGameStatusEnum;
import com.genlot.ushop.facade.game.exceptions.LottoGameBizException;
import com.genlot.ushop.facade.game.service.LottoGameManagementFacade;
import com.genlot.ushop.facade.game.service.LottoGameQueryFacade;
import com.genlot.ushop.facade.sms.entity.PushMessage;
import com.genlot.ushop.facade.sms.enums.PushStatusEnum;
import com.genlot.ushop.facade.sms.exceptions.SMSBizException;
import com.genlot.ushop.facade.sms.service.PushFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;
import com.genlot.ushop.web.admin.util.Binder;
import com.genlot.uplatform.facade.frontend.push.enums.PushPlatformEnum;

@Controller
@RequestMapping(value = "/sns/push/message")
public class PushMessageController {

	@Autowired
	private PushFacade pushFacade;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;

	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page, 
			Integer rows, 
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
			pageBean = pushFacade.listPage(pageParam, paramMap);

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

	@ResponseBody
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public Object add(
			PushMessage message,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			
			String userid = request.getParameter("userid");
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			
			if (!StringUtils.isNotBlank(message.getContent()) ||
				!StringUtils.isNotBlank(message.getTitle())) {
				throw BizException.PARAM_ERROR;
			}
			if (StringUtils.isNotBlank(message.getParam())) {
				Map<String,Object> paramMap = JSON.parseObject(message.getParam(),new TypeReference<Map<String,Object>>(){});
				if (paramMap.size() <= 0) {
					throw BizException.PARAM_ERROR;
				}
			}
			
			if (message.getDevice() == null) {
				throw BizException.PARAM_ERROR;
			}
			if (message.getDevice() != DeviceEnum.IOS.getValue() && 
				message.getDevice() != DeviceEnum.ANDROID.getValue() && 
				message.getDevice() != DeviceEnum.ANDROID_H5.getValue() &&
				message.getDevice() != DeviceEnum.IOS_H5.getValue()) {
				throw BizException.PARAM_ERROR;
			}
			
			if (message.getPlatform() == null) {
				throw BizException.PARAM_ERROR;
			}
			pushFacade.push(message);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "新增推送", admin, WebUtils.getIpAddr(request));
			
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	public Object update(
			PushMessage message,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		
		try {
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			
			PushMessage lastMessage = pushFacade.getById(message.getId());
			if (lastMessage == null) {
				throw SMSBizException.MESSAGE_NOT_EXIST;
			}
			if (!lastMessage.getStatus().equals(PushStatusEnum.PREPARE.getValue())) {
				throw SMSBizException.MESSAGE_NOT_EXIST;
			}
			lastMessage.setParam(message.getParam());
			lastMessage.setContent(message.getContent());
			lastMessage.setTitle(message.getTitle());
			lastMessage.setDevice(message.getDevice());
			lastMessage.setPlatform(message.getPlatform());
			lastMessage.setProvince(message.getProvince());
			lastMessage.setType(message.getType());
			lastMessage.setSendTime(message.getSendTime());
			pushFacade.update(lastMessage);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "修改推送", admin, WebUtils.getIpAddr(request));
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object start(
			Long id,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		try {
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			pushFacade.deleteById(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除推送", admin, WebUtils.getIpAddr(request));
		}
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	

	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		uiModel.put("deviceList", DeviceEnum.toList());
		uiModel.put("pushPlatformList", PushPlatformEnum.toList());
		uiModel.put("pushStatusList", PushStatusEnum.toList());		
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
