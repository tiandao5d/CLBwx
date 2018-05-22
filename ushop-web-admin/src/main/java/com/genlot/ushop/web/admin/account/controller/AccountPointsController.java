package com.genlot.ushop.web.admin.account.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
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
import com.genlot.common.enums.ProvinceEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.DateUtils;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.vo.StatisticsResultVO;
import com.genlot.ucenter.facade.account.vo.UserPointsVo;
import com.genlot.ushop.facade.task.entity.Task;
import com.genlot.ushop.facade.task.enums.ActivityTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskTargetTypeEnum;
import com.genlot.ushop.facade.task.service.TaskFacade;
import com.google.common.annotations.Beta;

/**
 * @author jml
 * @date 2016年7月4日 下午1:46:22
 * @version 1.0
 * @parameter
 * @since
 * @return
 */

@Controller
@RequestMapping(value = "/account/points")
public class AccountPointsController {

	private static final Logger log = LoggerFactory
			.getLogger(AccountPointsController.class);

	@Autowired
	private AccountQueryFacade accountQueryFacade;

	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;

	@Autowired
	private TaskFacade taskFacade;


	/**
	 * 获取用户积分列表.
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/
	 *          listByMonthlyUserNo/begin/end/userNo
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param begin
	 *            开始时间
	 * @param end
	 *            结束时间
	 * @param userNo
	 *            用户Id 如果用户Id为0则表示所有用户
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/listByMonthlyUserNo", method = RequestMethod.GET)
	@ResponseBody
	public Object listByMonthlyUserNo(String begin, String end, String userNo, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List<UserPointsVo> list;
		try {

			// 获取用户积分列表
			list = accountQueryFacade.listByMonthlyUserNo(begin, end, userNo);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("list", list);

		String json = JSON.toJSONString(uiModel);

		return json;
	}

//	/**
//	 * 获取积分获取的统计列表
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/
//	 *          listPointsGroupByMonthlyFundType_ByMonthlyFundType
//	 *          /begin/end/fundType
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param begin
//	 *            开始时间
//	 * @param end
//	 *            结束时间
//	 * @param fundType
//	 *            积分类型
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/listPointsGroupByMonthlyFundType_ByMonthlyFundType", method = RequestMethod.GET)
//	@ResponseBody
//	public Object listPointsGroupByFundType_ByMonthlyFundType(
//			 String begin, String end,
//			 Integer fundType, HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		List<StatisticsResultVO> list;
//
//		Map resultMap = new HashMap();
//		try {
//
//			if (StringUtils.isBlank(begin) || StringUtils.isBlank(end)) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			if (fundType == null) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			Date beginDate = DateUtils.getDateFromString(begin, "yyyy-MM");
//			Date endDate = DateUtils.getDateFromString(end, "yyyy-MM");
//
//			endDate = DateUtils.addMonths(endDate, 1);
//			endDate = DateUtils.addDay(endDate, -1);
//			beginDate = DateUtils.setDays(beginDate, 1);
//
//			// 获取用户获取积分列表
//			list = accountQueryFacade
//					.listPointsGroupByMonthlyFundType_ByMonthlyFundType(begin,
//							end, fundType);
//
//			Calendar cBegin = Calendar.getInstance();
//			cBegin.setTime(beginDate);
//
//			Calendar cEnd = Calendar.getInstance();
//			cEnd.setTime(endDate);
//			long differ = cEnd.get(Calendar.MONTH) - cBegin.get(Calendar.MONTH);
//			for (StatisticsResultVO vo : list) {
//
//				if (resultMap.containsKey("k" + vo.getGroupId())) {
//					Map map = (Map) resultMap.get("k" + vo.getGroupId());
//					map.put("k" + vo.getGroupParam(), vo.getGroupValue());
//				} else {
//					Map map = new HashMap();
//
//					for (int i = 0; i <= differ; i++) {
//						map.put("k"
//								+ DateUtils.formatDate(cBegin.getTime(),
//										"yyyyMM"), 0);
//						cBegin.add(Calendar.MONTH, 1);
//					}
//					cBegin.add(Calendar.MONTH, -(int) differ);
//
//					map.put("k" + vo.getGroupParam(), vo.getGroupValue());
//
//					map.put("id", vo.getGroupId());
//					map.put("val", vo.getGroupName());
//
//					resultMap.put("k" + vo.getGroupId(), map);
//				}
//			}
//
//		} catch (Exception exception) {
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("list", resultMap.values());
//		uiModel.put("fundTypeList", getFundTypeList());
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 获取积分使用的统计列表
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/
//	 *          listPointsGroupByMonthlyFundType_ByMonthlyFundUsageFundType
//	 *          /fundUsage/begin/end/fundType
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param begin
//	 *            开始时间
//	 * @param end
//	 *            结束时间
//	 * @param fundUsage
//	 *            积分用途
//	 * @param fundType
//	 *            积分类型
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/listPointsGroupByMonthlyFundType_ByMonthlyFundUsageFundType", method = RequestMethod.GET)
//	@ResponseBody
//	public Object listPointsGroupByMonthlyFundUsageFundType(
//			 String begin, String end,
//			 Integer fundUsage, Integer fundType,
//			HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		List<StatisticsResultVO> list;
//		Map resultMap = new HashMap();
//		try {
//
//			if (StringUtils.isBlank(begin) || StringUtils.isBlank(end)) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			if (fundType == null || fundUsage == null) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			Date beginDate = DateUtils.getDateFromString(begin, "yyyy-MM");
//			Date endDate = DateUtils.getDateFromString(end, "yyyy-MM");
//
//			endDate = DateUtils.addMonths(endDate, 1);
//			endDate = DateUtils.addDay(endDate, -1);
//			beginDate = DateUtils.setDays(beginDate, 1);
//
//			// 获取用户使用积分列表
//			list = accountQueryFacade
//					.listPointsGroupByMonthlyFundType_ByMonthlyFundUsageFundType(
//							begin, end, fundUsage, fundType);
//
//			Calendar cBegin = Calendar.getInstance();
//			cBegin.setTime(beginDate);
//
//			Calendar cEnd = Calendar.getInstance();
//			cEnd.setTime(endDate);
//			long differ = cEnd.get(Calendar.MONTH) - cBegin.get(Calendar.MONTH);
//			for (StatisticsResultVO vo : list) {
//
//				if (resultMap.containsKey("k" + vo.getGroupId())) {
//					Map map = (Map) resultMap.get("k" + vo.getGroupId());
//					map.put("k" + vo.getGroupParam(), vo.getGroupValue());
//				} else {
//					Map map = new HashMap();
//
//					for (int i = 0; i <= differ; i++) {
//						map.put("k"
//								+ DateUtils.formatDate(cBegin.getTime(),
//										"yyyyMM"), 0);
//						cBegin.add(Calendar.MONTH, 1);
//					}
//					cBegin.add(Calendar.MONTH, -(int) differ);
//
//					map.put("k" + vo.getGroupParam(), vo.getGroupValue());
//					map.put("id", vo.getGroupId());
//					map.put("val", vo.getGroupName());
//
//					resultMap.put("k" + vo.getGroupId(), map);
//				}
//			}
//
//		} catch (Exception exception) {
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("list", resultMap.values());
//
//		uiModel.put("fundTypeList", getFundTypeList());
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 获取积分的产销比.
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/
//	 *          listPointsGroupByMonthly_ByMonthlyAccountFundTypeId/end
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param end
//	 *            查询时间
//	 * @param fundType
//	 *            积分类型 如果用户fundType为0则表示所有积分类型
//	 * 
//	 * @return JSON.
//	 */
//	@RequestMapping(value = "/listPointsGroupByMonthly_ByMonthlyAccountFundTypeId", method = RequestMethod.GET)
//	@ResponseBody
//	public Object listProductCountGroupByLotteryCount(String date,
//			 Integer fundType, HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		List<StatisticsResultVO> list;
//
//		try {
//			
//			if (StringUtils.isBlank(date)) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			if (fundType == null) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//
//			list = accountQueryFacade
//					.listPointsGroupByMonthly_ByMonthlyFundType(date, fundType);
//
//		} catch (Exception exception) {
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("list", list);
//		uiModel.put("fundTypeList", getFundTypeList());
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 用户获得积分明细
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/
//	 *          listByGroupByMonthly_fundUsage_byMonthlyAccountNoFundTypeFundDirection
//	 *          /begin/end
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param type
//	 *            资金动向 （obtain(获得)/use(使用) 固定值）
//	 * @param begin
//	 *            开始时间 （年月）
//	 * @param end
//	 *            结束时间 （年月）
//	 * @param userNo
//	 *            用户Id
//	 * @param fundType
//	 *            用户类型
//	 * 
//	 * @return JSON
//	 */
//	@RequestMapping(value = "/listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection/{type}", method = RequestMethod.GET)
//	@ResponseBody
//	public Object listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection(
//			@PathVariable String type,  String begin,
//			 String end,  String userNo,
//			 Integer fundType, HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		List<Map> resultList = new ArrayList<Map>();
//
//		List<String> fundUsages = new ArrayList<String>();
//
//		List<UserPointsVo> list;
//
//		try {
//			
//			if (StringUtils.isBlank(begin) || StringUtils.isBlank(end) || StringUtils.isBlank(userNo)) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//			if (fundType == null) {
//				throw new AccountBizException(20080125, "参数不能为空");
//			}
//			
//
//			int fundDirection = -1;
//			if (StringUtils.isNotBlank(type) && (type.equals("obtain"))) {
//				AccountFundUsageEnum[] ary = AccountFundUsageEnum.values();
//				for (int i = 0; i < ary.length; i++) {
//					fundUsages.add(ary[i].name().toLowerCase());
//				}
//				fundDirection = AccountFundDirectionEnum.ADD.getValue();
//			} else if (StringUtils.isNotBlank(type) && (type.equals("use"))) {
//				fundUsages.add(AccountFundUsageEnum.ACTIVITY.name()
//						.toLowerCase());
//				fundUsages.add(AccountFundUsageEnum.SHOPPING.name()
//						.toLowerCase());
//				fundUsages.add(AccountFundUsageEnum.GAME.name().toLowerCase());
//				fundDirection = AccountFundDirectionEnum.SUB.getValue();
//			}
//
//			list = accountQueryFacade
//					.listByGroupByMonthly_fundType_byMonthlyUserNoFundTypeFundDirection(
//							begin, end, userNo, fundType, fundDirection);
//
//			for (UserPointsVo userPointsVo : list) {
//
//				Map map = new HashMap();
//				map.put("date", userPointsVo.getDate());
//				for (String fundUsage : fundUsages) {
//					map.put(fundUsage, 0);
//				}
//				map.put(AccountFundUsageEnum
//						.getEnum(userPointsVo.getFundUsage()).name()
//						.toLowerCase(), userPointsVo.getAmount());
//
//				resultList.add(map);
//
//			}
//
//		} catch (Exception exception) {
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//
//		Map fundUsageMap = new HashMap();
//		AccountFundUsageEnum[] ary = AccountFundUsageEnum.values();
//		for (int i = 0; i < ary.length; i++) {
//			fundUsageMap.put(ary[i].name().toLowerCase(), ary[i].getDesc());
//		}
//
//		uiModel.put("fundUsageList", fundUsageMap);
//
//		uiModel.put("list", resultList);
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}

	/**
	 * 获取任务条件&积分用途&积分类型
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/points/listTaskConditionAndFundUsageAndFundType
	 *          
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * 
	 * @return JSON
	 */
//	@RequestMapping(value = { "/listTaskConditionAndFundUsageAndFundType" }, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listTaskCondition(HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		List<Map> taskConditionList = new ArrayList<Map>();
//		List<Map> fundUsageList = new ArrayList<Map>();
//		
//		List<Map> taskTargetTypeList = new ArrayList<Map>();
//		List<Map> taskTypeList = new ArrayList<Map>();
//
//		Object[] arr;
//		try {
//			
//			AccountFundUsageEnum[] fundUsageAry = AccountFundUsageEnum.values();
//			for (int i = 0; i < fundUsageAry.length; i++) {
//				Map map = new HashMap();
//				map.put("id", fundUsageAry[i].getValue());
//				map.put("val", fundUsageAry[i].getDesc());
//				fundUsageList.add(map);
//			}
//			
//			TaskConditionTypeEnum[] taskConditionAry = TaskConditionTypeEnum.values();
//			for (int i = 0; i < taskConditionAry.length; i++) {
//				Map map = new HashMap();
//				map.put("id", taskConditionAry[i].getValue());
//				map.put("val", taskConditionAry[i].getDesc());
//				taskConditionList.add(map);
//			}
//			
//			ActivityTypeEnum[] taskTypeAry = ActivityTypeEnum.values();
//			for (int i = 0; i < taskTypeAry.length; i++) {
//				Map map = new HashMap();
//				map.put("id", taskTypeAry[i].getValue());
//				map.put("val", taskTypeAry[i].getDesc());
//				taskTypeList.add(map);
//			}
//			
//			TaskTargetTypeEnum[] taskTargetTypeAry = TaskTargetTypeEnum.values();
//			for (int i = 0; i < taskTargetTypeAry.length; i++) {
//				Map map = new HashMap();
//				map.put("id", taskTargetTypeAry[i].getValue());
//				map.put("val", taskTargetTypeAry[i].getDesc());
//				taskTargetTypeList.add(map);
//			}
//
//		} catch (Exception exception) {
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//
//		uiModel.put("taskTypeList", taskTypeList);
//		uiModel.put("taskTargetTypeList", taskTargetTypeList);
//
//		uiModel.put("fundUsageList", fundUsageList);
//		uiModel.put("provinceList", ProvinceEnum.toList());
//		uiModel.put("taskConditionList", taskConditionList);
//		uiModel.put("fundTypeList", getFundTypeList());
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}

	private List getFundTypeList() {
		Map<String, String> fundTypeList = accountFundTypeFacade
				.getIdAndFundName();

		List<Map> list = new ArrayList<Map>();
		for (Map.Entry<String, String> entry : fundTypeList.entrySet()) {
			Map map = new HashMap();
			map.put("id", entry.getKey());
			map.put("val", entry.getValue());
			list.add(map);
		}

		return list;
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
