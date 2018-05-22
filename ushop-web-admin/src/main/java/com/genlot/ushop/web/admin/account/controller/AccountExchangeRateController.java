package com.genlot.ushop.web.admin.account.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.ExchangeRate;
import com.genlot.ucenter.facade.account.service.ExchangeRateFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;

/**
 * 货币汇率控制类
 * 
 * @author kangds
 * @date 2017-1-18 10:08:19
 * @version 1.0
 * @parameter
 * @since
 * @return
 */

@Controller
@RequestMapping(value = "/account/exchangeRate")
public class AccountExchangeRateController {

	private static final Logger log = LoggerFactory
			.getLogger(AccountExchangeRateController.class);

	@Autowired
	ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private PmsFacade pmsFacade;

	//
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			// 分页
			Integer page, Integer rows,

			Integer firstMoneyId, Integer secondMoneyId,
			HttpServletRequest request, HttpServletResponse response) {
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
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
			paramMap.put("firstMoneyId", firstMoneyId);
			paramMap.put("secondMoneyId", secondMoneyId);
			pageBean = exchangeRateFacade.listPage(pageParam, paramMap);
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
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	public Object getById(HttpServletRequest request, Long id) {

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		Map<String, Object> uiModel = new HashMap<String, Object>();

		ExchangeRate exchangeRate = exchangeRateFacade.getById(id);

		uiModel.put("exchangeRate", exchangeRate);
		return uiModel;
	}

	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(HttpServletRequest request, String firstMoney, Long firstMoneyId,
			Long secondMoneyId, String secondMoney, double rate) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		ExchangeRate exchangeRate = new ExchangeRate();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			// 汇率是要单向确定之后，双向就都确定了。只能
			ExchangeRate exist = exchangeRateFacade.getBy(firstMoneyId,
					secondMoneyId);

			ExchangeRate exist2 = exchangeRateFacade.getBy(secondMoneyId,
					firstMoneyId);
			if (exist != null || exist2 != null) {
				uiModel.put("data", "EXISTED");
				return uiModel;
			}
			exchangeRate.setFirstMoney(firstMoney);
			exchangeRate.setFirstMoneyId(firstMoneyId);
			exchangeRate.setSecondMoney(secondMoney);
			exchangeRate.setSecondMoneyId(secondMoneyId);
			exchangeRate.setRate(rate);
			exchangeRateFacade.insert(exchangeRate);
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "添加货币汇率", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "添加货币汇率", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 更新资金类型
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(HttpServletRequest request, Long id, double rate) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		ExchangeRate exchangeRate = exchangeRateFacade.getById(id);
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		if (exchangeRate == null) {
			uiModel.put("data", "NOTEXISTED");
			return uiModel;
		}
		try {
			exchangeRate.setRate(rate);
			exchangeRateFacade.update(exchangeRate);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "更新货币汇率", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "更新货币汇率", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(HttpServletRequest request, Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			exchangeRateFacade.deleteById(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "删除货币汇率", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除货币汇率", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
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
