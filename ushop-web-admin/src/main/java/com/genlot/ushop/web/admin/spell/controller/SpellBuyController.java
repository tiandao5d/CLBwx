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
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

@Controller
@RequestMapping("/spellBuy")
public class SpellBuyController {

	@Autowired
	SpellBuyProductQueryFacade spellBuyProductQueryFacade;

	@Autowired
	SpellBuyRecordFacade spellBuyRecordFacade;
	
	@Autowired
	RandomNumberFacade randomNumberFacade;
	
	@Autowired
	SpellBuyProductFacade spellBuyProductFacade;

	// 拼购商品列表
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
	// 分页
			Integer page, Integer rows, Integer spellbuyStatus) {

		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = new PageBean();

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		try {

			if (spellbuyStatus != null) {
				paramMap.put("spellbuyStatus", spellbuyStatus);
			}

			pageBean = spellBuyProductQueryFacade.listPage(pageParam, paramMap);

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}

		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());

		return uiModel;
	}
	
	// 更新拼购产品
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(int spellBuyStatus, int spellbuyCount, long spellBuyProductId) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			SpellBuyProduct spellBuyProduct = spellBuyProductFacade.getById(spellBuyProductId);
			spellBuyProduct.setSpellbuyStatus(spellBuyStatus);
			spellBuyProduct.setSpellbuyCount(spellbuyCount);
			spellBuyProductFacade.update(spellBuyProduct);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("data", "success");
		return uiModel;
	}
	

	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List spellBuyStatusList = SpellBuyStatusEnum.toList();

		List spellBuyWinList = SpellBuyWinEnum.toList();
		
		uiModel.put("spellBuyStatusList", spellBuyStatusList);
		uiModel.put("spellBuyWinList", spellBuyWinList);

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
