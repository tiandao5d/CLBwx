package com.genlot.ushop.web.admin.promoter.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.entity.PromoterSubordinateInfo;
import com.genlot.ucenter.facade.promotion.enums.PromoterRelationshipTypeEnum;
import com.genlot.ucenter.facade.promotion.enums.PromoterStatusEnum;
import com.genlot.ucenter.facade.promotion.enums.PromoterTypeEnum;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
import com.genlot.ucenter.facade.promotion.service.PromoterSubordinateFacade;
import com.genlot.ucenter.facade.promotion.service.PromotionQueryFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.web.admin.promoter.enums.RebateDateEnum;
import com.genlot.ushop.web.admin.promoter.enums.RebateLimitEnum;
import com.genlot.ushop.web.admin.promoter.vo.PromoterSubordinateInfoVo;
import com.genlot.ushop.web.admin.promoter.vo.PromoterVo;

/**
 * @author jml
 * @date 2016年7月4日 下午1:46:22
 * @version 1.0
 * @parameter
 * @since
 * @return
 */

@Controller
@RequestMapping(value = "/promoter")
public class PromoterController {

	
	
	
	
	private static final Logger log = LoggerFactory
			.getLogger(PromoterController.class);
	
	@Autowired
	private PromoterFacade promoterFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	@Autowired
	private PromotionQueryFacade promotionQueryFacade;
	
	@Autowired
	private PromoterSubordinateFacade promoterSubordinateFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	/**
	 * 
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/get/推广员ID
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
	@ResponseBody
	public Object get(@PathVariable Long id, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PromoterInfo promoterInfo;
		PromoterVo promoterVo = new PromoterVo();
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			promoterInfo = promoterFacade.getById(id);
			
			if (promoterInfo == null) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			promoterVo.setId(promoterInfo.getId());
			promoterVo.setUserNo(promoterInfo.getUserNo());
			promoterVo.setUserName(promoterInfo.getUserName());
			//如果推广员不是站点则 stationNo则为绑定站点编号
			if (promoterInfo.getType() == PromoterTypeEnum.PERSONAL.getValue()) {
//				//查询该推广员绑定站点的编号
//				PromoterInfo parent = promoterFacade.getById(promoterInfo.getStationId());
//				promoterVo.setStationNo(parent.getStationNo());
			} else {
				promoterVo.setStationNo(promoterInfo.getStationNo());
			}
			promoterVo.setLevel(promoterInfo.getLevel());
			promoterVo.setExp(promoterInfo.getExp());
			promoterVo.setTotalRebates(promoterInfo.getRebates() + promoterInfo.getRewards());
			promoterVo.setRebates(promoterInfo.getRebates());
			promoterVo.setRewards(promoterInfo.getRewards());
			promoterVo.setStationProvince(promoterInfo.getStationProvince());
			promoterVo.setMonthlyRebates(promoterInfo.getMonthlyRebates() + promoterInfo.getMonthlyRewards());
			promoterVo.setSubordinate(promoterInfo.getSubordinate());
			promoterVo.setSecondary(promoterInfo.getSecondary());
			promoterVo.setTotalSubordinate(promoterInfo.getSubordinate() + promoterInfo.getSecondary());
			promoterVo.setStationBind(promoterInfo.getStationBind());
			promoterVo.setAlipayAccount(promoterInfo.getAlipayAccount());
			MemberInfo memberInfo = memberInfoFacade.getMemberByUserNo(promoterInfo.getUserNo());
			if (memberInfo != null) {
				promoterVo.setPhone(memberInfo.getTelNo());
			}
			
//			Account account = accountQueryFacade.getAccountByAccountNo_fundType(promoterInfo.getUserNo(), AccountFundTypeEnum.PROMOTION_BONUS.getValue());
//			
//			if (account != null) {
//				promoterVo.setBalance(account.getBalance());
//			}
			
			if (promoterInfo.getType() == PromoterTypeEnum.PERSONAL.getValue()) {
				try {
					PromoterInfo entity = promoterFacade.getInviterByUserNo(promoterInfo.getUserNo());
					promoterVo.setInviter(entity.getUserName());
				} catch (PromotionBizException e) {
					
				}
			}
			
			promoterVo.setName(promoterInfo.getName());
			promoterVo.setCardNo(promoterInfo.getCardNo());
			promoterVo.setBankNo(promoterInfo.getBankNo());
			promoterVo.setBankName(promoterInfo.getBankName());
			StringBuffer bankAddress = new StringBuffer();
			bankAddress.append(promoterInfo.getBankProvince());
			bankAddress.append(promoterInfo.getBankCity());
			promoterVo.setBankAddress(bankAddress.toString());
			StringBuffer stationAddress = new StringBuffer();
			stationAddress.append(promoterInfo.getStationProvince()+"|");
			stationAddress.append(promoterInfo.getStationCity()+"|");
			if(null != promoterInfo.getStationArea()){
				stationAddress.append(promoterInfo.getStationArea()+"|");
			}
			stationAddress.append(promoterInfo.getStationAddress());
			promoterVo.setStationAddress(stationAddress.toString());

			
		} catch (Exception exception) {

			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		
		uiModel.put("promoterInfo", promoterVo);


		return uiModel;
	}
	
	/**
	 * 返利记录列表
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/rebateSubsidiary
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/listByRebateSubsidiary", method = RequestMethod.GET)
	@ResponseBody
	public Object listByRebateSubsidiary( HttpServletRequest request,
			HttpServletResponse response, Integer page, Integer rows, Integer rebateDate, Integer rebateLimit, Integer relation, String userName, @RequestParam(required = true) String rootNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		
		try {
			
			if (page == null) {
				page = new Integer(1);
			}
			
			if (rows == null) {
				rows = new Integer(10);
			}
			
			
			if (rebateDate == null) {
				rebateDate = new Integer(0);//表示不限定日期
			}
			
			if (rebateLimit == null) {
				rebateLimit = new Integer(-1);//表示不限定返利额
			}
			
			Map paramMap = new HashMap();
			paramMap.put("relation", relation);
			
			RebateDateEnum rebateDateEnum =  RebateDateEnum.getEnum(rebateDate);
			
			if (rebateDateEnum != null) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				Calendar currTime = Calendar.getInstance();
				paramMap.put("endDate", sdf.format(currTime.getTime()));
				if (rebateDateEnum.getValue() == 1) { // 一周内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.WEEK_OF_MONTH, -1);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 2) { //一个月内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -1);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 3) { // 三个月内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -3);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 4) { // 半年内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -6);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				}
			}
			
			RebateLimitEnum rebateLimitEnum = RebateLimitEnum.getEnum(rebateLimit);
			
			if (rebateLimitEnum != null) {
				if (rebateLimitEnum.getValue() == 1) { 
					paramMap.put("beginLimit", 0);
					paramMap.put("endLimit", 100);
				} else if (rebateLimitEnum.getValue() == 2) { 
					paramMap.put("beginLimit", 100);
					paramMap.put("endLimit", 500);
				} else if (rebateLimitEnum.getValue() == 3) { 
					paramMap.put("beginLimit", 500);
					paramMap.put("endLimit", 5000);
				} else if (rebateLimitEnum.getValue() == 4) { 
					paramMap.put("beginLimit", 5000);
				} else if (rebateLimitEnum.getValue() == 0) { 
					paramMap.put("beginLimit", 0);
				}
			}
			
			paramMap.put("userName", userName);
			paramMap.put("rootNo", rootNo);
			
			PageParam pageParam = new PageParam(page, rows);
			
			pageBean = promotionQueryFacade.listPageRebatesHistory(pageParam, paramMap);
			
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		JSON json = (JSON) JSON.toJSON(uiModel);

		return json;
	}
	
	/**
	 * 推广员列表
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/subordinateList
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/listBySubordinate", method = RequestMethod.GET)
	@ResponseBody
	public Object listBySubordinate( HttpServletRequest request,
			HttpServletResponse response, Integer page, Integer rows, Integer rebateDate, Integer rebateLimit, Integer relation, String userName, @RequestParam(required = true) String parentNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<PromoterSubordinateInfoVo> recordList = new ArrayList<PromoterSubordinateInfoVo>();
		PageBean pageBean = null;
		try {
			
			if (page == null) {
				page = new Integer(1);
			}
			
			if (rows == null) {
				rows = new Integer(10);
			}
			
			
			if (rebateDate == null) {
				rebateDate = new Integer(0);//表示不限定日期
			}
			
			if (rebateLimit == null) {
				rebateLimit = new Integer(-1);//表示不限定返利额
			}
			
			Map paramMap = new HashMap();
			paramMap.put("relation", relation);
			
			RebateDateEnum rebateDateEnum =  RebateDateEnum.getEnum(rebateDate);
			
			if (rebateDateEnum != null) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				Calendar currTime = Calendar.getInstance();
				paramMap.put("endDate", sdf.format(currTime.getTime()));
				if (rebateDateEnum.getValue() == 1) { // 一周内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.WEEK_OF_MONTH, -1);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 2) { //一个月内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -1);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 3) { // 三个月内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -3);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				} else if (rebateDateEnum.getValue() == 4) { // 半年内
					Calendar beginDate = Calendar.getInstance();
					beginDate.setTimeInMillis(currTime.getTimeInMillis());
					beginDate.add(Calendar.MONTH, -6);
					paramMap.put("beginDate", sdf.format(beginDate.getTime()));
				}
			}
			
			RebateLimitEnum rebateLimitEnum = RebateLimitEnum.getEnum(rebateLimit);
			
			if (rebateLimitEnum != null) {
				if (rebateLimitEnum.getValue() == 1) { 
					paramMap.put("beginLimit", 0);
					paramMap.put("endLimit", 100);
				} else if (rebateLimitEnum.getValue() == 2) { 
					paramMap.put("beginLimit", 100);
					paramMap.put("endLimit", 500);
				} else if (rebateLimitEnum.getValue() == 3) { 
					paramMap.put("beginLimit", 500);
					paramMap.put("endLimit", 5000);
				} else if (rebateLimitEnum.getValue() == 4) { 
					paramMap.put("beginLimit", 5000);
				} else if (rebateLimitEnum.getValue() == 0) { 
					paramMap.put("beginLimit", 0);
				}
			}
			
			paramMap.put("userName", userName);
			paramMap.put("parentNo", parentNo);
			
			PageParam pageParam = new PageParam(page, rows);
			
			pageBean = promoterSubordinateFacade.listPageSubordinate(pageParam, paramMap);
			
			
			if (pageBean != null) {
				for (Object obj : pageBean.getRecordList()) {
					PromoterSubordinateInfo promoterSubordinateInfo = (PromoterSubordinateInfo) obj;
					PromoterSubordinateInfoVo promoterSubordinateInfoVo = new PromoterSubordinateInfoVo();
					
					promoterSubordinateInfoVo.setId(promoterSubordinateInfo.getId());
					if (promoterSubordinateInfo.getType() == 1) {
						promoterSubordinateInfoVo.setType("是");
					} else {
						promoterSubordinateInfoVo.setType("否");
					}
					
					if (StringUtils.isNotBlank(promoterSubordinateInfo.getParent()) && promoterSubordinateInfo.getParent().equals(parentNo)) {
						promoterSubordinateInfoVo.setRebateType("一级");
						promoterSubordinateInfoVo.setRelation(PromoterRelationshipTypeEnum.FIRST.getDesc());
						promoterSubordinateInfoVo.setRebates(promoterSubordinateInfo.getRebates());
					} else if (StringUtils.isNotBlank(promoterSubordinateInfo.getSecondary()) && promoterSubordinateInfo.getSecondary().equals(parentNo)) {
						promoterSubordinateInfoVo.setRebateType("二级级");
						promoterSubordinateInfoVo.setRelation(PromoterRelationshipTypeEnum.SECONDARY.getDesc());
						promoterSubordinateInfoVo.setRebates(promoterSubordinateInfo.getRewards());
					}
					
					promoterSubordinateInfoVo.setExpenditure(promoterSubordinateInfo.getExpenditure());
					promoterSubordinateInfoVo.setUserNo(promoterSubordinateInfo.getUserNo());
					promoterSubordinateInfoVo.setUserName(promoterSubordinateInfo.getUserName());
					promoterSubordinateInfoVo.setCreateTime(promoterSubordinateInfo.getCreateTime());
					promoterSubordinateInfoVo.setExpenditure(promoterSubordinateInfo.getExpenditure());
					
					if (promoterSubordinateInfo.getType() == 100) {
						promoterSubordinateInfoVo.setType("是");
					} else {
						promoterSubordinateInfoVo.setType("否");
					}
					
					
					recordList.add(promoterSubordinateInfoVo);
				}
			}
			
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", recordList);
		
		JSON json = (JSON) JSON.toJSON(uiModel);

		return json;
	}
	
	/**
	 * 推广员列表
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/list
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list( HttpServletRequest request,
			HttpServletResponse response, Integer page, Integer rows, Integer type, String searchType, String keywords) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		
		List<PromoterVo> recordList = new ArrayList<PromoterVo>();
		try {
			
			if (type == null) {
				type = new Integer(PromoterTypeEnum.STATION.getValue());
			}
			
			if (page == null) {
				page = new Integer(1);
			}
			
			if (rows == null) {
				rows = new Integer(10);
			}
			
			Map paramMap = new HashMap();
			paramMap.put("type", type);
			if (StringUtils.isNotBlank(searchType) && StringUtils.isNotBlank(keywords)) {
				if(!"phone".equals(searchType)){//查询条件不为手机时
					paramMap.put(searchType, keywords);
				}
				
			}
			
			
			PageParam pageParam = new PageParam(page, rows);
			
			paramMap.put("status", PromoterStatusEnum.ACTIVE.getValue());
			
			pageBean = promoterFacade.listPagePromoter(pageParam, paramMap);
			
			for (Object obj : pageBean.getRecordList()) {
				PromoterInfo promoterInfo = (PromoterInfo) obj;
				PromoterVo promoterVo = new PromoterVo();
				
				promoterVo.setId(promoterInfo.getId());
				promoterVo.setUserNo(promoterInfo.getUserNo());
				promoterVo.setUserName(promoterInfo.getUserName());
				
				//如果推广员不是站点则 stationNo则为绑定站点编号
				if (promoterInfo.getType() == PromoterTypeEnum.PERSONAL.getValue()) {
//					//查询该推广员绑定站点的编号
//					PromoterInfo parent = promoterFacade.getById(promoterInfo.getStationId());
//					promoterVo.setStationNo(parent.getStationNo());
				} else {
					promoterVo.setStationNo(promoterInfo.getStationNo());
				}
				promoterVo.setLevel(promoterInfo.getLevel());
				promoterVo.setRebates(promoterInfo.getRebates() + promoterInfo.getRewards());
				promoterVo.setStationProvince(promoterInfo.getStationProvince());
				promoterVo.setMonthlyRebates(promoterInfo.getMonthlyRebates() + promoterInfo.getMonthlyRewards());
				promoterVo.setSubordinate(promoterInfo.getSubordinate());
				promoterVo.setSecondary(promoterInfo.getSecondary());
				promoterVo.setStationBind(promoterInfo.getStationBind());
				MemberInfo memberInfo = memberInfoFacade.getMemberByUserNo(promoterInfo.getUserNo());
				if (memberInfo != null) {
					promoterVo.setPhone(memberInfo.getTelNo());
				}
				if("phone".equals(searchType)){//当查询为手机时
					if(memberInfo.getTelNo().equals(keywords)){
						recordList.clear();//清除
						recordList.add(promoterVo);//添加匹配到手机的推广员
						break;
					}else if(!memberInfo.getTelNo().equals(keywords) && !StringUtils.isBlank(keywords)){
						recordList.clear();
						continue;
					}
					
				}
				recordList.add(promoterVo);
			}
			
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", recordList);
		
		JSON json = (JSON) JSON.toJSON(uiModel);

		return json;
	}
	
	
	/**
	 * 站长审核列表
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/listByStation
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/listByStation", method = RequestMethod.GET)
	@ResponseBody
	public Object auditList( HttpServletRequest request,
			HttpServletResponse response, Integer page, Integer rows, Integer status, String searchType, String keywords) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		try {
			
			if (status == null) {
				status = new Integer(PromoterStatusEnum.AUDIT.getValue());
			}
			
			if (page == null) {
				page = new Integer(1);
			}
			
			if (rows == null) {
				rows = new Integer(10);
			}
			
			Map paramMap = new HashMap();
			paramMap.put("status", status);
			paramMap.put("type", PromoterTypeEnum.STATION.getValue());
			if (StringUtils.isNotBlank(searchType) && StringUtils.isNotBlank(keywords)) {
				paramMap.put(searchType, keywords);
			}
			
			PageParam pageParam = new PageParam(page, rows);
			
			pageBean = promoterFacade.listPagePromoter(pageParam, paramMap);
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		JSON json = (JSON) JSON.toJSON(uiModel);

		return json;
	}
	
	
	/**
	 * 站长审核
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/audit
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/audit", method = RequestMethod.POST)
	@ResponseBody
	public Object audit(HttpServletRequest request,
			HttpServletResponse response, @RequestParam(value = "status", required = true) Integer status, @RequestParam(value = "id", required = true) Long id) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			PromoterInfo promoterInfo = promoterFacade.getById(id);
			
			if (promoterInfo == null) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			if (status == null) {
				throw new PromotionBizException(20070006, "参数不能为空");
			}
			
			if (promoterInfo.getStatus() != PromoterStatusEnum.AUDIT.getValue()) {
				throw new PromotionBizException(20070007, "非待审核状态，无法操作");
			}
			
			PromoterStatusEnum promoterStatusEnum = PromoterStatusEnum.getEnum(status);
			if (promoterStatusEnum == null) {
				throw new PromotionBizException(20070008, "操作失败");
			}
			
			promoterInfo.setStatus(promoterStatusEnum.getValue());
			promoterFacade.update(promoterInfo);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "审核推广员", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "审核推广员", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			uiModel.put("data", "FAILED");
			JSON json = (JSON) JSON.toJSON(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		JSON json = (JSON) JSON.toJSON(uiModel);

		return json;
	}
	
	/**
	 * 新增或设置站点推广员
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/add
	 */
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add( HttpServletRequest request,
			HttpServletResponse response, 
			String phone, 
			String stationNo, 
			String name,
			String cardNo,
			String stationProvince,
			String stationCity,
			String stationArea, 
			String stationAddress,
			String bankNo,
			String bankName,
			String alipayAccount) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PromoterInfo promoterInfo;
		PromoterVo promoterVo = new PromoterVo();
		UserInfo userInfo;
		try {
			//根据手机号查询用户
			userInfo = userQueryFacade.getUserInfoByBindMobileNo(phone);
			if(userInfo==null){
				throw new PromotionBizException(20070009, "找不到该用户");
			}
		    promoterFacade.registerStation(userInfo.getUserNo(),
									       userInfo.getLoginName(), 
									       name,
									       cardNo, 
									       bankNo,
									       bankName,
									       null, 
									       null, 
									       null, 
									       stationNo,
									       stationProvince, 
									       stationCity, 
									       stationArea, 
									       stationAddress,
									       alipayAccount);
	
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("data", "SUCCESS");
		JSON json = (JSON) JSON.toJSON(uiModel);
		return json;
	}
	
	/**
	 * 更新站点推广员
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/update
	 */
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update( HttpServletRequest request,
			HttpServletResponse response,
			Long id, 
			String stationNo, 
			String name,
			String cardNo,
			String stationProvince,
			String stationCity,
			String stationArea, 
			String stationAddress,
			String bankNo,
			String bankName,
			String alipayAccount) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PromoterInfo promoterInfo;

		try {
			promoterInfo = promoterFacade.getById(id);
			promoterInfo.setStationNo(stationNo);
			promoterInfo.setName(name);
			promoterInfo.setCardNo(cardNo);
			promoterInfo.setStationProvince(stationProvince);
			promoterInfo.setStationCity(stationCity);
			promoterInfo.setStationArea(stationArea);
			promoterInfo.setStationAddress(stationAddress);
			promoterInfo.setBankNo(bankNo);
			promoterInfo.setBankName(bankName);
			promoterInfo.setAlipayAccount(alipayAccount);
			promoterFacade.update(promoterInfo);
			
			
		} catch (Exception exception) {
			
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("data", "SUCCESS");
		JSON json = (JSON) JSON.toJSON(uiModel);
		return json;
	}
	
	/**
	 * 
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/promoter/getParams
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<Map> promoterStatusList = new ArrayList<Map>();
		List<Map> promoterRelationshipTypeList = new ArrayList<Map>();
		List<Map> promoterTypeList = new ArrayList<Map>();
		List<Map> rebateDateList = new ArrayList<Map>();
		List<Map> rebateLimitList = new ArrayList<Map>();

		try {
			
			PromoterRelationshipTypeEnum[] promoterRelationshipTypeAry = PromoterRelationshipTypeEnum.values();
			for (int i = 0; i < promoterRelationshipTypeAry.length; i++) {
				Map map = new HashMap();
				map.put("id", promoterRelationshipTypeAry[i].getValue());
				map.put("val", promoterRelationshipTypeAry[i].getDesc());
				promoterRelationshipTypeList.add(map);
			}
			
			PromoterStatusEnum[] promoterStatusAry = PromoterStatusEnum.values();
			for (int i = 0; i < promoterStatusAry.length; i++) {
				Map map = new HashMap();
				map.put("id", promoterStatusAry[i].getValue());
				map.put("val", promoterStatusAry[i].getDesc());
				promoterStatusList.add(map);
			}
			
			PromoterTypeEnum[] promoterTypeAry = PromoterTypeEnum.values();
			for (int i = 0; i < promoterTypeAry.length; i++) {
				Map map = new HashMap();
				map.put("id", promoterTypeAry[i].getValue());
				map.put("val", promoterTypeAry[i].getDesc());
				promoterTypeList.add(map);
			}
			
			RebateDateEnum[] rebateDateAry = RebateDateEnum.values();
			for (int i = 0; i < rebateDateAry.length; i++) {
				Map map = new HashMap();
				map.put("id", rebateDateAry[i].getValue());
				map.put("val", rebateDateAry[i].getDesc());
				rebateDateList.add(map);
			}
			
			RebateLimitEnum[] rebateLimitAry = RebateLimitEnum.values();
			for (int i = 0; i < rebateLimitAry.length; i++) {
				Map map = new HashMap();
				map.put("id", rebateLimitAry[i].getValue());
				map.put("val", rebateLimitAry[i].getDesc());
				rebateLimitList.add(map);
			}
			

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("promoterStatusList", promoterStatusList);
		uiModel.put("promoterRelationshipTypeList", promoterRelationshipTypeList);
		uiModel.put("promoterTypeList", promoterTypeList);
		uiModel.put("rebateDateList", rebateDateList);
		uiModel.put("rebateLimitList", rebateLimitList);
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
