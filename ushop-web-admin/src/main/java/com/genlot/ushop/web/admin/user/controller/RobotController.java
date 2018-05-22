package com.genlot.ushop.web.admin.user.controller;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.conn.util.InetAddressUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
import com.genlot.common.utils.encrypt.MD5;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserTypeEnum;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ucenter.facade.user.vo.RobotVo;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

@Controller
@RequestMapping("/user/robot")
public class RobotController {

	@Autowired
	private UserManagementFacade userManagementFacade;

	@Autowired
	private UserQueryFacade userQueryFacade;

	private static final Logger log = LoggerFactory
			.getLogger(RobotController.class);

	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			// 分页
			Integer page, Integer rows, String loginName, String playerStatus,
			HttpServletRequest request) {
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
			paramMap.put("userType", UserTypeEnum.SPELLBUYROBOT.getValue());
			paramMap.put("loginName", loginName);
			paramMap.put("status", playerStatus);
			pageBean = userQueryFacade
					.listUserInfoListPage(pageParam, paramMap);
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

	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(HttpServletRequest request,
			HttpServletResponse response) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("userType", UserTypeEnum.SPELLBUYROBOT.getValue());
			paramMap.put("status", UserStatusEnum.ACTIVE.getValue());
			List<UserInfo> list = userQueryFacade.listBy(paramMap);
			uiModel.put("list", list);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	@RequestMapping(value = "/import", method = RequestMethod.POST)
	@ResponseBody
	public Object importRobot(
			@RequestParam(value = "myFile", required = false) MultipartFile myFile,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List<String> keys = new ArrayList<String>();

		Workbook workbook = null;
		String filename = myFile.getOriginalFilename();
		InputStream in = null;
		try {

			List<RobotVo> list = new ArrayList<RobotVo>();
			in = myFile.getInputStream();
			if (!filename.isEmpty()) {

				if (filename.endsWith("xls")) {
					workbook = new HSSFWorkbook(in);
				} else if (filename.endsWith("xlsx")) {
					workbook = new XSSFWorkbook(in);
				} else {
					BizException e = new BizException(2017001,
							"文件格式只能为*.xls、*.xlsx！");
					setErrorMessage(e, uiModel);
					return uiModel;
				}

				if (workbook != null) {
					int sheetNum = workbook.getNumberOfSheets();
					for (int i = 0; i < sheetNum; i++) {
						Sheet sheet = workbook.getSheetAt(i);
						if (sheet != null) {
							int rowNum = sheet.getPhysicalNumberOfRows();
							if (rowNum > 1) {
								for (int j = 1; j < rowNum; j++) {
									Row row = sheet.getRow(j);
									if (isEmptyRow(row)) {
										continue;
									}
									int cellNum = row
											.getPhysicalNumberOfCells();
									if (cellNum == 5) {

										Cell cell = row.getCell(0);

										String username = null;

										if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
											Long l = Double.valueOf(
													cell.getNumericCellValue())
													.longValue();
											username = l.toString();
										} else if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
											username = URLDecoder.decode(
													cell.getStringCellValue(),
													"UTF-8");
										}
										if (StringUtils.isBlank(username)) {
											delImg(keys);
											BizException e = new BizException(
													2017005, "第" + (j + 1)
															+ "行第" + 1
															+ "列，用户名前缀不能为空！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}
										if (!username.matches("[a-zA-Z]{3}")) {
											delImg(keys);
											BizException e = new BizException(
													2017005, "第" + (j + 1)
															+ "行第" + 1
															+ "列，用户名前缀只能是三位字母！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}
								
										cell = row.getCell(1);

										String nickname = null;

										if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
											Long l = Double.valueOf(
													cell.getNumericCellValue())
													.longValue();
											nickname = l.toString();
										} else if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
											nickname = URLDecoder.decode(
													cell.getStringCellValue(),
													"UTF-8");
										}

										if (StringUtils.isBlank(nickname)) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017006, "第" + (j + 1)
															+ "行第" + 2
															+ "列，昵称不能为空！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										cell = row.getCell(2);

										String password = null;

										if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017007, "第" + (j + 1)
															+ "行第" + 3
															+ "列，密码必须包含字母和数字！");
											setErrorMessage(e, uiModel);
											return uiModel;
										} else if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
											password = URLDecoder.decode(
													cell.getStringCellValue(),
													"UTF-8");
										}

										if (StringUtils.isBlank(password)) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017008, "第" + (j + 1)
															+ "行第" + 3
															+ "列，密码不能为空！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										if (password.length() < 6) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017008, "第" + (j + 1)
															+ "行第" + 3
															+ "列，密码长度最少6位！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}
										cell = row.getCell(3);

										String ip = null;

										if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
											ip = URLDecoder.decode(
													cell.getStringCellValue(),
													"UTF-8");
										} else {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017009, "第" + (j + 1)
															+ "行第" + 4
															+ "列，IP地址格式有误！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										if (StringUtils.isBlank(ip)) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017008, "第" + (j + 1)
															+ "行第" + 4
															+ "列，IP不能为空！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										if (!InetAddressUtils.isIPv4Address(ip)) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017009, "第" + (j + 1)
															+ "行第" + 4
															+ "列，IP地址格式有误！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										cell = row.getCell(4);

										String headImg = null;

										if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
											headImg = URLDecoder.decode(
													cell.getStringCellValue(),
													"UTF-8");
										} else {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017010, "第" + (j + 1)
															+ "行第" + 5
															+ "列，头像连接地址有误！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										if (StringUtils.isBlank(headImg)) {
											// 出现异常删除所有已上传的图片
											delImg(keys);
											BizException e = new BizException(
													2017011, "第" + (j + 1)
															+ "行第" + 5
															+ "列，头像连接地址不能为空！");
											setErrorMessage(e, uiModel);
											return uiModel;
										}

										// 先不下载到七牛云

										/*
										 * System.out.println("下载图片");
										 * log.info("下载图片"); URL url = new
										 * URL(headImg); HttpURLConnection conn
										 * =
										 * (HttpURLConnection)url.openConnection
										 * (); conn.setConnectTimeout(5 * 1000);
										 * if (conn.getResponseCode() !=
										 * HttpURLConnection.HTTP_OK) {
										 * //出现异常删除所有已上传的图片 delImg(keys);
										 * BizException e = new
										 * BizException(2017010, "第" + (j + 1) +
										 * "行第" + 5 + "列，头像链接地址有误！");
										 * setErrorMessage(e, uiModel); return
										 * uiModel; } log.info("获取图片流");
										 * System.out.println("获取图片流");
										 * InputStream inStream =
										 * conn.getInputStream();//通过输入流获取图片数据
										 * SimpleDateFormat sdf = new
										 * SimpleDateFormat("yyyyMMddHHmmssS");
										 * UUID uuid =
										 * UUID.nameUUIDFromBytes(sdf.format(new
										 * Date()).getBytes());
										 * 
										 * MyPutRet myPutRet =
										 * qiniuCloudUtil.uploadFile(inStream,
										 * uuid.toString()); log.info("上传到七牛云");
										 * System.out.println("上传到七牛云"); if
										 * (myPutRet != null) {
										 * keys.add(myPutRet.getKey()); }
										 * 
										 * String downloadUrl =
										 * qiniuCloudUtil.getDowloadBaseUrl
										 * (myPutRet.getKey());
										 * 
										 * System.out.println(downloadUrl);
										 */

										RobotVo vo = new RobotVo();
										vo.setUsernamePrefix(username);
										vo.setNickname(nickname);
										vo.setIp(ip);
										//加密
										password = MD5.getmd5Str(password);
										vo.setPassword(password);
										vo.setHeadImg(headImg);

										list.add(vo);

									} else {
										BizException e = new BizException(
												2017004, "导入数据格式错误！");
										setErrorMessage(e, uiModel);
										return uiModel;
									}
								}
							} else {
								continue;
							}
						} else {
							BizException e = new BizException(2017002,
									"模板格式有误！");
							setErrorMessage(e, uiModel);
							return uiModel;
						}
					}
				}
			} else {
				BizException e = new BizException(2017003, "导入文件为空！");
				setErrorMessage(e, uiModel);
				return uiModel;
			}
			userManagementFacade.importRobot(list);

		} catch (IOException e) {
			log.info(e.getMessage());
			delImg(keys);
			setErrorMessage(e, uiModel);
			return uiModel;
		} finally {
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

	// 判断某一行是否为空
	private boolean isEmptyRow(Row row) {
		boolean isEmpty = false;
		if (row != null) {
			Iterator iterator = row.cellIterator();
			int index = 0;
			while (iterator.hasNext() && index < 5) { // index 小于5是因为只有5列
				Cell cell = (Cell) iterator.next();
				if (cell.getCellType() == cell.CELL_TYPE_BLANK) {
					index++;
				}
			}

			if (index == 5) {
				isEmpty = true;
			}
		}
		return isEmpty;
	}

	private void delImg(List<String> list) {
//		// 如果异常则删除已上传的图片
//		for (String key : list) {
//			qiniuCloudUtil.deleteFile(key);
//		}
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户类型
		List userTypeList = UserTypeEnum.toList();
		// 用户状态
		List userStatusList = UserStatusEnum.toList();
		uiModel.put("playerTypeList", userTypeList);
		uiModel.put("playerStatusList", userStatusList);
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
