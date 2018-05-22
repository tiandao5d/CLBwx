package com.genlot.ushop.web.admin.vote.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
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
import com.genlot.ushop.facade.vote.entity.Candidate;
import com.genlot.ushop.facade.vote.entity.Election;
import com.genlot.ushop.facade.vote.enums.ElectionStatusEnum;
import com.genlot.ushop.facade.vote.enums.VoteRecordTypeEnum;
import com.genlot.ushop.facade.vote.exceptions.VoteBizException;
import com.genlot.ushop.facade.vote.service.CandidateFacade;
import com.genlot.ushop.facade.vote.service.ElectionFacade;
import com.genlot.ushop.facade.vote.service.VoteManagementFacade;
import com.genlot.ushop.facade.vote.service.VoteRecordFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/vote/record")
public class VoteRecordController {

	@Autowired
	private VoteRecordFacade voteRecordFacade;
	@Autowired
	private PmsFacade pmsFacade;

	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page, 
			Integer rows, 
			Long electionId,
			String userName,
			String nickName,
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
			paramMap.put("type", VoteRecordTypeEnum.VOTE.getValue());
			paramMap.put("relation", electionId);
			paramMap.put("userName", userName);
			paramMap.put("nickName", nickName);
			pageBean = voteRecordFacade.listPage(pageParam, paramMap);
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
