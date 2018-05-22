package com.genlot.ushop.web.admin.system.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.file.FastDFSClient;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.uplatform.facade.channel.entity.ChannelInterface;
import com.genlot.uplatform.facade.channel.service.ChannelInterfaceFacade;
import com.genlot.ushop.facade.task.enums.ActivityTypeEnum;
import com.genlot.ushop.web.admin.util.Binder;

/**
 * @author jml
 * @date 2016年7月4日 下午1:46:22
 * @version 1.0
 * @parameter
 * @since
 * @return
 */

@Controller
@RequestMapping(value = "/admin/channelInterface")
public class ChannelInterfaceController {

	private static final Logger log = LoggerFactory
			.getLogger(ChannelInterfaceController.class);

	@Autowired
	private ChannelInterfaceFacade channelfaceFacade;
	
	@Autowired
	private CouponsFacade couponsFacade;

	@Autowired
	private UploadFileFacade uploadFileFacade;

	@Autowired
	private PmsFacade pmsFacade;

	/**
	 * 获取单条VIP等级
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/channelInterface/get
	 *          /任务条件ID
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
	@ResponseBody
	public Object get(@PathVariable Long id, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ChannelInterface channelInterface;
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			channelInterface = channelfaceFacade.getById(id);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.SUCCESS, "渠道详情", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.ERROR, "渠道详情", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("channelInterface", channelInterface);

		String json = JSON.toJSONString(uiModel);

		return json;
	}


	/**
	 * 获取渠道列表
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/channelInterface/list
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(HttpServletRequest request, Integer page, Integer rows,
			HttpServletResponse response, Integer type, String name,
			Integer conditionType, Integer status, Integer auditStatus) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = new PageBean();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			Map paramMap = new HashMap();
			PageParam pageParam = new PageParam(1, 10);

			if (page != null) {
				pageParam.setPageNum(page);
			}

			if (rows != null) {
				pageParam.setNumPerPage(rows);
			}

			pageBean = channelfaceFacade.listPage(pageParam, paramMap);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.SUCCESS, "渠道列表", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.ERROR, "渠道列表", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}

		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("pagePage", pageBean.getPageCount());

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	/**
	 * 新增渠道.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/channelInterface/save
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = { "/save" }, method = RequestMethod.POST)
	@ResponseBody
	public Object save(ChannelInterface channelInterface, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			channelfaceFacade.createInterface(channelInterface);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "添加渠道", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "添加渠道", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("status", "success");

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	/**
	 * 编辑VIP等级
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/channelInterface/edit
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	@ResponseBody
	public Object edit(HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			ChannelInterface channelInterface = channelfaceFacade.getById(Long.parseLong(request.getParameter("id")));
			
			Binder.bind(request, channelInterface);
			
			channelfaceFacade.update(channelInterface);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑渠道", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑渠道", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("status", "success");

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	/**
	 * 删除活動
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/channelInterface/delete
	 *          /渠道ID
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
	@ResponseBody
	public Object delete(@PathVariable Integer id, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			channelfaceFacade.delete(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "删除渠道", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除渠道", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("status", "success");

		String json = JSON.toJSONString(uiModel);

		return json;
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
