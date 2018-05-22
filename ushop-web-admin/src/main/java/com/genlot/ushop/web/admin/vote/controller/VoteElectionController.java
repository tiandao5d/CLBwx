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
import com.genlot.common.entity.PairEntity;
import com.genlot.common.enums.OpeStatusEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.entity.OrderProductVo;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.vote.entity.Election;
import com.genlot.ushop.facade.vote.enums.ElectionStatusEnum;
import com.genlot.ushop.facade.vote.exceptions.VoteBizException;
import com.genlot.ushop.facade.vote.service.ElectionFacade;
import com.genlot.ushop.facade.vote.service.VoteManagementFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/vote/election")
public class VoteElectionController {

	@Autowired
	private ElectionFacade electionFacade;
	@Autowired 
	private VoteManagementFacade voteManagementFacade;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;
	

	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page, 
			Integer rows, 
			Integer status,
			HttpServletRequest request, 
			HttpServletResponse response) {
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
			paramMap.put("status", status);
			pageBean = electionFacade.listPage(pageParam, paramMap);

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
	@RequestMapping(value = "/publish/{id}", method = RequestMethod.POST)
	public Object publish(
			@PathVariable Long id, 
			HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {		
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			electionFacade.publish(id);
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "发布投票活动", admin, WebUtils.getIpAddr(request));
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
			
	@ResponseBody
	@RequestMapping(value = "/down/{id}", method = RequestMethod.POST)
	public Object down(
			@PathVariable Long id, 
			HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			electionFacade.down(id);
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "下架投票活动", admin, WebUtils.getIpAddr(request));
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public Object add(
			Election entity,
			HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {
			
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			
			if (StringUtil.isEmpty(entity.getName()) || 
				StringUtil.isEmpty(entity.getPhone())) {
				throw BizException.PARAM_ERROR;
			}
			
			List<String> tempFiles = new ArrayList<String>(); 
			if (!StringUtil.isEmpty(entity.getHeader())) {
				List<PairEntity> headers = JSON.parseArray(entity.getHeader(), PairEntity.class);
				if (headers.isEmpty()) {
					throw BizException.PARAM_ERROR;
				}
				for(int index = 0; index < headers.size(); ++index) {
					PairEntity file = headers.get(index);
					String fileKey = file.getValue().substring(file.getValue().lastIndexOf("/") + 1);
					tempFiles.add(fileKey);
				}
			}
			
			entity.setEnroll(OpeStatusEnum.SUCCESS.getValue());
			if (StringUtil.isEmpty(entity.getEnrollTime()) || 
				StringUtil.isEmpty(entity.getCutOffTime())) {
				throw BizException.PARAM_ERROR;
			}
			
			Date enrollTime = DateUtils.parseDate(entity.getEnrollTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date cutOffTime = DateUtils.parseDate(entity.getCutOffTime(), DateUtils.DATE_FORMAT_DATETIME);
			if (enrollTime.getTime() > cutOffTime.getTime()) {
				throw BizException.PARAM_ERROR;
			}
			
			if (entity.getAudit() == null || entity.getAudit().equals(OpeStatusEnum.FAIL.getValue())) {
				entity.setAudit(OpeStatusEnum.FAIL.getValue());
			}
			
			Date voteTime = DateUtils.parseDate(entity.getVoteTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date endTime = DateUtils.parseDate(entity.getEndTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date settTime = DateUtils.parseDate(entity.getSettTime(), DateUtils.DATE_FORMAT_DATETIME);
			if (endTime.getTime()  < voteTime.getTime() || 
				settTime.getTime() < voteTime.getTime() || 
				endTime.getTime()  < settTime.getTime()) {
				throw BizException.PARAM_ERROR;
			}
			
			if (entity.getTargetTotal() == null  || 
				entity.getTargetRedo()  == null  ||
				entity.getVoteTotal()   == null  ||
				entity.getVoteLimit()   == null) {
				throw BizException.PARAM_ERROR;
			}
			
			if (entity.getSecurityCode() == null || !entity.getSecurityCode().equals(OpeStatusEnum.FAIL.getValue())) {
				entity.setSecurityCode(OpeStatusEnum.SUCCESS.getValue());
			}
			
			if(entity.getVoteSpeed() == null) {
				entity.setVoteSpeed(0);
			}
			entity.setPrizeCount(0);
			entity.setStatus(ElectionStatusEnum.SIGNUP_PREPARE.getValue());
			electionFacade.insert(entity);
			if (!tempFiles.isEmpty()) {
				uploadFileFacade.deleteByURL(tempFiles);
			}
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "添加投票活动", admin, WebUtils.getIpAddr(request));
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	
	@ResponseBody
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	public Object edit(
			Election entity,
			HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {
			
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			Election election = electionFacade.getById(entity.getId());
			if (election == null) {
				throw BizException.PARAM_ERROR;
			}
			List<String> deleteFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 
			if (!StringUtil.isEmpty(entity.getHeader())) {
				List<PairEntity> froms = JSON.parseArray(entity.getHeader(), PairEntity.class);
				if (froms.isEmpty()) {
					throw BizException.PARAM_ERROR;
				}
				if (!StringUtil.isEmpty(election.getHeader())) {
					List<PairEntity> sources = JSON.parseArray(election.getHeader(), PairEntity.class);
					if (!sources.isEmpty()) {
						for(int index1 = 0; index1 < sources.size(); ++index1) {
							PairEntity newFile = null;
							PairEntity oldFile = null;
							boolean isFind = false;
							for(int index2 = 0; index2 < froms.size(); ++index2) {
								newFile = froms.get(index2);
								oldFile = sources.get(index1);
								if (newFile.getValue().equals(oldFile.getValue())) {
									isFind = true;
								}
							}
							
							if (!isFind) {
								String fileKey = oldFile.getValue().substring(oldFile.getValue().lastIndexOf("/") + 1);
								deleteFiles.add(fileKey);
							}
						}
						
						for(int index1 = 0; index1 < froms.size(); ++index1) {
							PairEntity newFile = null;
							PairEntity oldFile = null;
							boolean isFind = false;
							for(int index2 = 0; index2 < sources.size(); ++index2) {
								newFile = froms.get(index1);
								oldFile = sources.get(index2);
								if (newFile.getValue().equals(oldFile.getValue())) {
									isFind = true;
								}
							}
							if (!isFind) {
								String fileKey = newFile.getValue().substring(newFile.getValue().lastIndexOf("/") + 1);
								tempFiles.add(fileKey);
							}
						}
					}
				}
			}
			
			if (StringUtil.isEmpty(entity.getName()) || 
				StringUtil.isEmpty(entity.getPhone())) {
				throw BizException.PARAM_ERROR;
			}
				
			entity.setEnroll(OpeStatusEnum.SUCCESS.getValue());
			if (StringUtil.isEmpty(entity.getEnrollTime()) || 
				StringUtil.isEmpty(entity.getCutOffTime())) {
				throw BizException.PARAM_ERROR;
			}
				
			Date enrollTime = DateUtils.parseDate(entity.getEnrollTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date cutOffTime = DateUtils.parseDate(entity.getCutOffTime(), DateUtils.DATE_FORMAT_DATETIME);
			if (enrollTime.getTime() > cutOffTime.getTime()) {
				throw BizException.PARAM_ERROR;
			}
				
			if (entity.getAudit() == null || entity.getAudit().equals(OpeStatusEnum.FAIL.getValue())) {
				entity.setAudit(OpeStatusEnum.FAIL.getValue());
			}
				
			Date voteTime = DateUtils.parseDate(entity.getVoteTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date endTime = DateUtils.parseDate(entity.getEndTime(), DateUtils.DATE_FORMAT_DATETIME);
			Date settTime = DateUtils.parseDate(entity.getSettTime(), DateUtils.DATE_FORMAT_DATETIME);
			if (endTime.getTime()  < voteTime.getTime() || 
				settTime.getTime() < voteTime.getTime() || 
				endTime.getTime()  < settTime.getTime()) {
				throw BizException.PARAM_ERROR;
			}
				
			if (entity.getTargetTotal() == null  || 
				entity.getTargetRedo()  == null  ||
				entity.getVoteTotal()   == null  ||
				entity.getVoteLimit()   == null) {
				throw BizException.PARAM_ERROR;
			}
				
			if (entity.getSecurityCode() == null || !entity.getSecurityCode().equals(OpeStatusEnum.FAIL.getValue())) {
				entity.setSecurityCode(OpeStatusEnum.SUCCESS.getValue());
			}
				
			if(entity.getVoteSpeed() == null) {
				entity.setVoteSpeed(0);
			}
			
			electionFacade.update(entity);
			uploadFileFacade.createAndDelete(FileTypeEnum.IMAGE.getValue(), Integer.valueOf(0), deleteFiles, new Date(), tempFiles);
			
		}
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "更新投票活动", admin, WebUtils.getIpAddr(request));
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
