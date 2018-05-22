package com.genlot.ushop.web.admin.spell.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ushop.facade.product.entity.RandomNumber;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.entity.SpellBuyRecord;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyWinEnum;
import com.genlot.ushop.facade.product.service.RandomNumberFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;

@Controller
@RequestMapping("/spellBuy/randomNumber")
public class SpellBuyRandomNumberController {

	@Autowired
	SpellBuyProductQueryFacade spellBuyProductQueryFacade;

	@Autowired
	SpellBuyRecordFacade spellBuyRecordFacade;
	
	@Autowired
	RandomNumberFacade randomNumberFacade;
	
	@Autowired
	SpellBuyProductFacade spellBuyProductFacade;



	// 幸运号码列表
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(String userNo, Integer spellBuyProductId) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<RandomNumber> list = new ArrayList<RandomNumber>();
		
		if (StringUtils.isBlank(userNo)) {
			return "userNo IS NULL";
		}
		
		if (spellBuyProductId == null) {
			return "spellBuyProductId IS NULL";
		}
		
		Map<String, Object> paramMap = new HashMap<String, Object>();
		
		try {
			
			paramMap.put("spellbuyProductId", spellBuyProductId);
			paramMap.put("userId", userNo);
			// 拼购记录
			list = randomNumberFacade.listBy(paramMap);

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("recordList", list);
		
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
