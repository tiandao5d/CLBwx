package com.genlot.ushop.web.admin.lotto.controller;

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
import com.genlot.ushop.facade.game.entity.LottoGame;
import com.genlot.ushop.facade.game.entity.LottoGameIssue;
import com.genlot.ushop.facade.game.entity.LottoGamePrize;
import com.genlot.ushop.facade.game.enums.LottoGameStatusEnum;
import com.genlot.ushop.facade.game.exceptions.LottoGameBizException;
import com.genlot.ushop.facade.game.service.LottoGameIssueQueryFacade;
import com.genlot.ushop.facade.game.service.LottoGameManagementFacade;
import com.genlot.ushop.facade.game.service.LottoGameQueryFacade;
import com.genlot.ushop.facade.game.service.LottoGameTicketQueryFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/lotto/game/ticket")
public class LottoGameTicketController {

	@Autowired
	private LottoGameManagementFacade lottoGameManagementFacade;
	@Autowired
	private LottoGameIssueQueryFacade lottoGameIssueQueryFacade;
	@Autowired
	private LottoGameTicketQueryFacade lottoGameTicketQueryFacade;
	@Autowired
	private PmsFacade pmsFacade;
	@Autowired
	private UploadFileFacade uploadFileFacade;

	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page, 
			Integer rows, 
			Integer gameId, 
			Integer prizeId,
			Integer issue,
			Integer ticketId, 
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
		if (gameId != null) {
			paramMap.put("gameId", gameId);
		}
		if (prizeId != null) {
			paramMap.put("prizeId", prizeId);
		}
		if (issue != null) {
			paramMap.put("issue", issue);
		}
		
		try {
			pageBean = lottoGameTicketQueryFacade.listPage(pageParam, paramMap);

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
	@RequestMapping(value = "/postDeliver", method = RequestMethod.POST)
	public Object postDeliver(
			Long id,
			String expressNo,
			String expressCompany,
			String expressRemarks,
			String consignee,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
 			String userid = request.getParameter("userid");
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			lottoGameManagementFacade.postDeliver(id, expressNo, expressCompany, expressRemarks, consignee);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "中奖票发奖", admin, WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
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
