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
import com.genlot.ushop.facade.game.service.LottoGameManagementFacade;
import com.genlot.ushop.facade.game.service.LottoGameQueryFacade;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;
import com.genlot.ushop.web.admin.util.Binder;

@Controller
@RequestMapping(value = "/lotto/game")
public class LottoGameController {

	@Autowired
	private LottoGameManagementFacade lottoGameManagementFacade;
	@Autowired
	private LottoGameQueryFacade lottoGameQueryFacade;
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
			pageBean = lottoGameQueryFacade.listPage(pageParam, paramMap);

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
			LottoGame game,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			
			String userid = request.getParameter("userid");
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			game.setPrizesList(JSON.parseArray(game.getPrizes(), LottoGamePrize.class));
			if (game.getPrizesList() == null || game.getPrizesList().size() != game.getPrizeCount()) {
				throw BizException.PARAM_ERROR;
			}
			
			List<String> files = new ArrayList<String>(); 
			int issueCount = 0;
			for (int index = 0; index < game.getPrizeCount(); ++index) {
				LottoGamePrize prize = game.getPrizesList().get(index);
				issueCount += prize.getIssueCount();
				if (StringUtils.isNotBlank(prize.getUrl())) {
					String fileKey = prize.getUrl().substring(prize.getUrl().lastIndexOf("/") + 1);
					files.add(fileKey);
				}
				if (prize.getPrizeCount() == null || prize.getPrizeCount() <= 0) {
					throw BizException.PARAM_ERROR;
				}
			}

			game.setIssuesList(JSON.parseArray(game.getIssues(), LottoGameIssue.class));
			if (game.getIssuesList() == null || game.getIssuesList().size() != issueCount) {
				throw BizException.PARAM_ERROR;
			}
			
			// 验证每一期的有效时间
			for (int index = 0; index < game.getIssuesList().size(); ++index) {
				
				LottoGameIssue issue = game.getIssuesList().get(index);
				if (issue.getIssue() == null || issue.getIssue() <= 0) {
					throw BizException.PARAM_ERROR;
				}
				issue.setStatus(LottoGameStatusEnum.LOTTO_GAME_STAT_INVISIBLE.getValue());
				Date startSaleTime = DateUtils.parseDate(issue.getStartSaleTime(), DateUtils.DATE_SAVE_DATETIME);
				Date endSaleTime = DateUtils.parseDate(issue.getEndSaleTime(), DateUtils.DATE_SAVE_DATETIME);
				Date drawTime = DateUtils.parseDate(issue.getDrawTime(), DateUtils.DATE_SAVE_DATETIME);
				Date cashTime = DateUtils.parseDate(issue.getCashTime(), DateUtils.DATE_SAVE_DATETIME);
				if (startSaleTime.getTime() > endSaleTime.getTime() || 
					endSaleTime.getTime() > drawTime.getTime() 		|| 
					drawTime.getTime() > cashTime.getTime()) {
					throw BizException.PARAM_ERROR;
				}
			}
			// 设置活动信息
			game.setStatus(LottoGameStatusEnum.LOTTO_GAME_STAT_INVISIBLE.getValue());
			game.setPrizes(JSON.toJSONString(game.getPrizesList()));
			lottoGameManagementFacade.createGame(game);
			// 删除临时文件
			if (files.size() > 0) {
				uploadFileFacade.deleteByURL(files);
			}
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "新增抽奖游戏", admin, WebUtils.getIpAddr(request));
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
			LottoGame game,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		
		try {
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			List<String> deleteFiles = new ArrayList<String>(); 
			LottoGame lastGame = lottoGameQueryFacade.getById(game.getId());
			if (lastGame == null) {
				throw LottoGameBizException.LOTTO_GAME_NOT_EXIST;
			}
			// 只能修改文字性的属性
			// 或者支付的方式
			lastGame.setName(game.getName());
			lastGame.setParType(game.getParType());
			lastGame.setParValue(game.getParValue());
			lastGame.setRemark(game.getRemark());
			List<LottoGamePrize> lastPrizesList = JSON.parseArray(lastGame.getPrizes(), LottoGamePrize.class);
			List<LottoGamePrize> newPrizesList  = JSON.parseArray(game.getPrizes(), LottoGamePrize.class);
			if (lastPrizesList.size() != newPrizesList.size()) {
				throw BizException.PARAM_ERROR;
			}
			for(int index = 0; index < lastPrizesList.size(); ++index) {
				LottoGamePrize last = lastPrizesList.get(index);
				LottoGamePrize news = newPrizesList.get(index);
				if (!last.getIndex().equals(news.getIndex())) {
					throw BizException.PARAM_ERROR;
				}	
				last.setAbout(news.getAbout());
				last.setName(news.getName());
				last.setRemark(news.getRemark());
				last.setTitle(news.getTitle());
				if (StringUtils.isNotBlank(news.getUrl()) && !news.getUrl().equals(last.getUrl())) {
					String fileKey = last.getUrl().substring(last.getUrl().lastIndexOf("/") + 1);
					deleteFiles.add(fileKey);
					last.setUrl(news.getUrl());
				}
			}
			lastGame.setPrizes(JSON.toJSONString(lastPrizesList));
			lottoGameManagementFacade.updateGame(lastGame);
			if (deleteFiles.size() > 0) {
				uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), deleteFiles, new Date());
			}
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "修改抽奖游戏", admin, WebUtils.getIpAddr(request));
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/start", method = RequestMethod.POST)
	public Object start(
			Long gameId,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		try {
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			lottoGameManagementFacade.startGame(gameId);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "启动抽奖游戏", admin, WebUtils.getIpAddr(request));
		}
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/pause", method = RequestMethod.POST)
	public Object pause(
			Long gameId,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		try {
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			lottoGameManagementFacade.pauseGame(gameId);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "暂停抽奖游戏", admin, WebUtils.getIpAddr(request));
		}
		catch (Exception exception) {
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
