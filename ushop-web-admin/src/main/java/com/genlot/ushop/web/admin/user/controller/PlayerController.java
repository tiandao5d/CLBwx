package com.genlot.ushop.web.admin.user.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserTypeEnum;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.common.enums.ExpressCompanyEnum;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.enums.PaymentTypeEnum;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyOrderStatusEnum;
import com.genlot.ushop.facade.sns.entity.VipLevel;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;

@Controller
@RequestMapping(value = "/user/player")
public class PlayerController {

	private static final Logger log = LoggerFactory.getLogger(PlayerController.class);

	
	@Autowired
	UserQueryFacade userQueryFacade;

	@Autowired
	MemberInfoFacade memberInfoFacade;

	@Autowired
	UserManagementFacade userManagementFacade;

	@Autowired
	AccountQueryFacade accountQueryFacade;

	@Autowired
	UserOperatorFacade userOperatorFacade;

	@Autowired
	VipLevelFacade vipLevelFacade;

	@Autowired
	private PmsFacade pmsFacade;
	
	@Autowired 
	private UploadFileFacade uploadFileFacade;

	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			// 分页
			Integer page, Integer rows,
			Integer playerType, String loginName, 
			String playerStatus, String mobileNo,
			String beginTime , String endTime,
			HttpServletRequest request, HttpSession session) {
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

			if (playerType == null) {
				StringBuffer userType = new StringBuffer();
				userType.append(UserTypeEnum.CUSTOMER.getValue());
				userType.append(",");
				userType.append(UserTypeEnum.MERCHANT.getValue());
				paramMap.put("userType", userType.toString());
			} else {
				paramMap.put("userType", playerType);
			}
			paramMap.put("loginName", loginName);
			paramMap.put("status", playerStatus);
			paramMap.put("bindMobileNo", mobileNo);
			paramMap.put("startDate", beginTime);
			paramMap.put("endDate", endTime);
			pageBean = userQueryFacade.listUserInfoListPage(pageParam, paramMap);

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
	@RequestMapping(value = "/stopping", method = RequestMethod.POST)
	public Object stopping(String userNo, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			userQueryFacade.changeUserStatus(userNo, UserStatusEnum.INACTIVE);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "冻结用户", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "冻结用户", admin,
					WebUtils.getIpAddr(request));
			e.printStackTrace();
			return e.getMessage();
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	@ResponseBody
	@RequestMapping(value = "/opening", method = RequestMethod.POST)
	public Object opening(String userNo, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			userQueryFacade.changeUserStatus(userNo, UserStatusEnum.ACTIVE);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "激活用户", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "激活用户", admin,
					WebUtils.getIpAddr(request));
			e.printStackTrace();
			return e.getMessage();
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	@ResponseBody
	@RequestMapping(value = "/addImg", method = RequestMethod.POST)
	public Object addImg(Long memberId, String userNo, String url, HttpServletRequest request) {

		MemberInfo memberInfo = memberInfoFacade.getById(memberId);
		Map<String, Object> uiModel = new HashMap<String, Object>();

		try {
			List<String> discardFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 

			if (StringUtils.isNotBlank(memberInfo.getHeadImage())) {
				String key = memberInfo.getHeadImage();
				key = key.substring(key.lastIndexOf("/") + 1);
				discardFiles.add(key);
			}
			if (StringUtils.isNotBlank(url)) {
				tempFiles.add(url.substring(url.lastIndexOf("/") + 1));
			}
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			memberInfo.setHeadImage(url);
			memberInfoFacade.update(memberInfo);
			uploadFileFacade.deleteByURL(tempFiles);
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 通过ID获得对象
	@ResponseBody
	@RequestMapping(value = "/getById", method = RequestMethod.POST)
	public Object getById(String id) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		if (id == null || id == "") {

			return "id IS NULL";
		}
		UserInfo userInfo = userQueryFacade.getUserInfoByID(id);
		uiModel.put("userInfo", userInfo);
		return uiModel;
	}

	// 获取用户账号信息
	@ResponseBody
	@RequestMapping(value = "/getByUserNo", method = RequestMethod.GET)
	public Object getByUserNo(String userNo) throws Exception {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
		MemberInfo memberInfo = memberInfoFacade.getMemberByUserNo(userNo);
		String loginName = userInfo.getLoginName();
		UserOperator userOperator = userOperatorFacade.getByLoginName(loginName);

		VipLevel vipLevel = vipLevelFacade.getLevel(userNo);

		uiModel.put("userInfo", userInfo);
		uiModel.put("vipLevel", vipLevel);
		uiModel.put("memberInfo", memberInfo);
		uiModel.put("userOperator", userOperator);
		return uiModel;
	}

	

	@RequestMapping(value = "/getUserLevel", method = RequestMethod.GET)
	public Object getUserLevel(String userNo) throws Exception {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		UserInfo userInfo;
		VipLevel vipLevel;
		try {
			userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
			vipLevel = vipLevelFacade.getLevel(userNo);

		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("userInfo", userInfo);
		uiModel.put("vipLevel", vipLevel);

		return uiModel;
	}
	// 获得所有枚举
		@RequestMapping(value = { "/getConstants" }, method = RequestMethod.GET)
		@ResponseBody
		public Object constants(){

			Map<String, Object> uiModel = new HashMap<String, Object>();
			List accountStatusList = AccountStatusEnum.toList();
			List accountTypeList = AccountTypeEnum.toList();
			// 用户类型
			List userTypeList = UserTypeEnum.toList();
			// 用户状态
			List userStatusList = UserStatusEnum.toList();
			Iterator iterator = userTypeList.iterator();

			while (iterator.hasNext()) {
				Object obj = iterator.next();
				Map map = (Map) obj;
				if (Integer.valueOf((String) map.get("value")) == UserTypeEnum.ROBOT.getValue()) {
					iterator.remove();
				}
			}
			uiModel.put("playerTypeList", userTypeList);
			uiModel.put("playerStatusList", userStatusList);
			uiModel.put("accountStatusList", accountStatusList);
			uiModel.put("accountTypeList", accountTypeList);
			return uiModel;
		}

//	@ResponseBody
//	@RequestMapping(value = "/vipLevelSubmit", method = RequestMethod.POST)
//	public Object vipLevelEdit(String userNo, Integer rewardUploadCount, Integer rewardSmsCount,
//			Integer rewardCouponCount, Integer exp, HttpServletRequest request) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//
//			vipLevelFacade.addExp(userNo, exp);
//			// Map<String, Object> paramMap = new HashMap<String, Object>();
//			// paramMap.put("rewardCouponCount", rewardCouponCount);
//			// paramMap.put("rewardSmsCount", rewardSmsCount);
//			// paramMap.put("rewardUploadCount", rewardUploadCount);
//			// vipLevelFacade.updateByUserNo(userNo, paramMap);
//
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "修改用户等级信息",
//					admin, WebUtils.getIpAddr(request));
//		} catch (Exception e) {
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "修改用户等级信息", admin,
//					WebUtils.getIpAddr(request));
//			e.printStackTrace();
//			return e.getMessage();
//		}
//		uiModel.put("data", "SUCCESS");
//		return uiModel;
//	}

	@RequestMapping(value = "/listByTester", method = RequestMethod.GET)
	@ResponseBody
	public Object listByTester(
			// 分页
			Integer page, Integer rows, String loginName, String playerStatus, HttpServletRequest request) {
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
			paramMap.put("userType", UserTypeEnum.ROBOT.getValue());
			paramMap.put("loginName", loginName);
			paramMap.put("status", playerStatus);
			pageBean = userQueryFacade.listUserInfoListPage(pageParam, paramMap);
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

	@RequestMapping(value = "/tester/batch/create", method = RequestMethod.POST)
	@ResponseBody
	public Object batchGenerateRobot(String loginName, String password, Integer number, Double balance,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		if (StringUtils.isBlank(loginName)) {
			return "\"loginName\" is null";
		}

		if (StringUtils.isBlank(password)) {
			return "\"password\" is null";
		}

		if (number == null) {
			return "\"number\" is null";
		}

		if (balance == null) {
			return "\"balance\" is null";
		}

		if (number < 1) {
			return "\"number\" less than to 1";
		}

		if (balance < 0) {
			return "\"balance\" value less than to 0";
		}

		if (loginName.length() < 3) {
			return "loginName length must be equal or greater than to 3";
		}

		try {
			userManagementFacade.createTester(loginName, password, number, balance);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}

		uiModel.put("data", "success");

		return uiModel;
	}

	@RequestMapping(value = "/tester/batch/import", method = RequestMethod.POST)
	@ResponseBody
	public Object importGenerateRobot(@RequestParam(value = "myFile", required = false) MultipartFile myFile,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		InputStream in = null;
		BufferedReader bufferedReader = null;
		try {

			String filename = myFile.getOriginalFilename();
			long size = myFile.getSize();

			if (size < 1) {
				return "The file cannot be empty";
			}

			if (!filename.endsWith(".txt")) {
				return "Must be a TXT file format";
			}

			in = myFile.getInputStream();

			bufferedReader = new BufferedReader(new InputStreamReader(in));
			String line = "";

			List<Map> list = new ArrayList<Map>();
			int count = 0;
			while ((line = bufferedReader.readLine()) != null) {
				count++;
				Map map = new HashMap();
				String[] info = line.split(",");
				if (info == null || info.length != 3) {
					return "Data format error in line " + count;
				}

				String loginName = info[0];
				if (loginName.length() < 6) {
					return "\"loginName\" length must be equal or greater than to 6 in line " + count;
				}
				map.put("loginName", loginName);
				map.put("password", info[1]);

				String balance = info[2];
				if (!StringUtil.isDouble(balance)) {
					return "\"balance\" value must be numeric in line " + count;
				}

				if (Double.valueOf(balance) < 0) {
					return "\"balance\" value less than to 0 in line " + count;
				}

				map.put("balance", Double.valueOf(balance));
				list.add(map);
			}

			userManagementFacade.importTester(list);

		} catch (IOException e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		} finally {
			if (bufferedReader != null) {
				try {
					bufferedReader.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}

			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		uiModel.put("data", "success");

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
