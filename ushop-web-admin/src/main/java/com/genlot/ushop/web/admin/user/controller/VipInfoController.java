package com.genlot.ushop.web.admin.user.controller;
//package com.genlot.ushop.web.admin.controller;
//
//import java.text.SimpleDateFormat;
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.UUID;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.commons.lang3.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.ResponseBody;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.alibaba.fastjson.JSON;
//import com.genlot.common.exceptions.BizException;
//import com.genlot.common.page.PageBean;
//import com.genlot.common.page.PageParam;
//import com.genlot.common.web.file.MyPutRet;
//import com.genlot.common.web.file.QiniuCloudUtil;
//import com.genlot.common.web.utils.WebUtils;
//import com.genlot.ucenter.facade.pms.entity.PmsOperator;
//import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
//import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
//import com.genlot.ucenter.facade.pms.service.PmsFacade;
//import com.genlot.uplatform.facade.application.entity.UploadFile;
//import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
//import com.genlot.uplatform.facade.application.service.UploadFileFacade;
//import com.genlot.ushop.facade.sns.entity.VipInfo;
//import com.genlot.ushop.facade.sns.exceptions.VipBizException;
//import com.genlot.ushop.facade.sns.service.VipInfoCacheFacade;
//import com.genlot.ushop.facade.sns.service.VipInfoFacade;
//import com.genlot.ushop.web.admin.util.Binder;
//
///**
// * @author jml
// * @date 2016年7月4日 下午1:46:22
// * @version 1.0
// * @parameter
// * @since
// * @return
// */
//
//@Controller
//@RequestMapping(value = "/admin/vipInfo")
//public class VipInfoController {
//
//	private static final int IMAGE_MAX_WIDTH = 200;
//	private static final int IMAGE_MAX_HEIGHT = 200;
//
//	private static final Logger log = LoggerFactory.getLogger(VipInfoController.class);
//
//	@Autowired
//	private VipInfoFacade vipInfoFacade;
//
//	@Autowired
//	private UploadFileFacade uploadFileFacade;
//
//	@Autowired
//	private QiniuCloudUtil qiniuCloudUtil;
//
//	@Autowired
//	private PmsFacade pmsFacade;
//
//	@Autowired
//	private VipInfoCacheFacade vipInfoCacheFacade;
//
//	/**
//	 * 获取单条VIP等级
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/get/
//	 *          VIP等级ID
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 */
//	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
//	@ResponseBody
//	public Object get(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		VipInfo vipInfo;
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//
//			vipInfo = vipInfoFacade.getById(id);
//
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA, PmsOperatorLogStatusEnum.SUCCESS, "查看VIP等级详情",
//					admin, WebUtils.getIpAddr(request));
//		} catch (Exception exception) {
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "查看VIP等级详情", admin,
//					WebUtils.getIpAddr(request));
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("vipInfo", vipInfo);
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 添加VIP等级
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/list/
//	 *          页数/数据条数
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 */
//	@RequestMapping(value = "/list", method = RequestMethod.GET)
//	@ResponseBody
//	public Object list(Integer page, Integer rows, HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		PageBean pageBean;
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//
//			if (page == null || rows == null) {
//				throw new VipBizException(20134006, "参数不能为空");
//			}
//
//			Map paramMap = new HashMap();
//			PageParam pageParam = new PageParam(page, rows);
//			pageBean = vipInfoFacade.listPage(pageParam, paramMap);
//
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA, PmsOperatorLogStatusEnum.SUCCESS, "查看VIP等级列表",
//					admin, WebUtils.getIpAddr(request));
//		} catch (Exception exception) {
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA, PmsOperatorLogStatusEnum.ERROR, "查看VIP等级列表",
//					admin, WebUtils.getIpAddr(request));
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//
//		uiModel.put("currentPage", pageBean.getCurrentPage());
//
//		uiModel.put("pagePage", pageBean.getPageCount());
//
//		uiModel.put("totalCount", pageBean.getTotalCount());
//
//		uiModel.put("recordList", pageBean.getRecordList());
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 添加VIP等级
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/save
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 */
//	@RequestMapping(value = "/save", method = RequestMethod.POST)
//	@ResponseBody
//	public Object save(VipInfo vipInfo, HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		String filePath = null;
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//			vipInfoFacade.insert(vipInfo);
//
//			// 新增VIP信息，清除缓存
//			vipInfoCacheFacade.clearVipInfoCache();
//
//			deleteUploadFile(vipInfo.getImage());
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.SUCCESS, "添加VIP等级", admin,
//					WebUtils.getIpAddr(request));
//		} catch (Exception exception) {
//
//			if (filePath != null) {
//				try {
//					qiniuCloudUtil.deleteFile(filePath.substring(String.format("%s%s", "http://", qiniuCloudUtil.getDomain()).length() + 1, filePath.length()));
//					
//				} catch (Exception e) {
//					log.error(e.toString());
//				}
//			}
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD, PmsOperatorLogStatusEnum.ERROR, "添加VIP等级", admin,
//					WebUtils.getIpAddr(request));
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("data", "SUCCESS");
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 编辑VIP等级
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/save
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 */
//	@RequestMapping(value = "/edit", method = RequestMethod.POST)
//	@ResponseBody
//	public Object edit(HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//			long id = Long.valueOf(request.getParameter("id"));
//
//			VipInfo entity = vipInfoFacade.getById(id);
//			String image = request.getParameter("image");
//
//			if (entity != null && StringUtils.isNotBlank(entity.getImage()) && StringUtils.isNotBlank(image)
//					&& !entity.getImage().equals(image)) {
//				try {
//					qiniuCloudUtil.deleteFile(entity.getImage().substring(String.format("%s%s", "http://", qiniuCloudUtil.getDomain()).length() + 1, entity.getImage().length()));
//				} catch (Exception e) {
//					log.error(e.toString());
//				}
//			}
//
//			Binder.bind(request, entity);
//
//			vipInfoFacade.update(entity);
//
//			vipInfoCacheFacade.clearVipInfoCache();
//
//			deleteUploadFile(entity.getImage());
//
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.SUCCESS, "编辑VIP等级", admin,
//					WebUtils.getIpAddr(request));
//		} catch (Exception exception) {
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT, PmsOperatorLogStatusEnum.ERROR, "编辑VIP等级", admin,
//					WebUtils.getIpAddr(request));
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("data", "SUCCESS");
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 删除VIP等级
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/get/
//	 *          VIP等级ID
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 */
//	@RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
//	@ResponseBody
//	public Object delete(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		VipInfo vipInfo;
//		String userid = request.getParameter("userid");
//		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
//		try {
//
//			vipInfo = vipInfoFacade.getById(id);
//
//			vipInfoFacade.delete(id);
//
//			vipInfoCacheFacade.clearVipInfoCache();
//
//			if (StringUtils.isNotBlank(vipInfo.getImage())) {
//				try {
//					qiniuCloudUtil.deleteFile(vipInfo.getImage());
//				} catch (Exception e) {
//					log.error(e.toString());
//				}
//			}
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.SUCCESS, "删除VIP等级",
//					admin, WebUtils.getIpAddr(request));
//		} catch (Exception exception) {
//			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE, PmsOperatorLogStatusEnum.ERROR, "删除VIP等级", admin,
//					WebUtils.getIpAddr(request));
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//		uiModel.put("data", "SUCCESS");
//
//		String json = JSON.toJSONString(uiModel);
//
//		return json;
//	}
//
//	/**
//	 * 上传游戏图片.
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/uplatform-web-admin/uplatform/
//	 *          gameManagement /auditApp/游戏ID
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param appName
//	 *            游戏名称
//	 * @param
//	 * 
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = { "/addPicture" }, method = RequestMethod.POST)
//	@ResponseBody
//	public Object addPicture(@RequestParam(value = "myFile", required = false) MultipartFile picture,
//			HttpServletRequest request) {
//		String downloadUrl;
//		String key;
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		
//		try {
//
//			// 上传七牛云
//			SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssS");
//			UUID uuid = UUID.nameUUIDFromBytes(sdf.format(new Date()).getBytes());
//			key = uuid.toString()
//					+ picture.getOriginalFilename().substring(picture.getOriginalFilename().lastIndexOf("."));
//			MyPutRet myPutRet = qiniuCloudUtil.uploadFile(picture.getInputStream(), key);
//
//			downloadUrl = qiniuCloudUtil.getDowloadBaseUrl(key);
//			// 添加文件临时记录
//			if (myPutRet != null) {
//				this.uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), key,
//						new Date());
//			}
//
//		} catch (Exception e) {
//
//			setErrorMessage(e, uiModel);
//			return uiModel;
//		}
//
//		uiModel.put("url", key);
//		return uiModel;
//	}
//
//	/**
//	 * 删除图片.
//	 * 
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/vipInfo/
//	 *          deletePicture
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @param url
//	 * 
//	 * @return
//	 */
//	@RequestMapping(value = { "/deletePicture" }, method = RequestMethod.POST)
//	@ResponseBody
//	public Map<String, String> deletePicture(String url, HttpServletRequest request) {
//		boolean result;
//		Map<String, String> map = new HashMap<String, String>();
//		try {
//			result = qiniuCloudUtil.deleteFile(url);
//			deleteUploadFile(url);
//		} catch (Exception e) {
//			map.put("data", e.toString());
//			return map;
//		}
//		if (result) {
//
//			map.put("data", "SUCCESS");
//		} else {
//			map.put("data", "FALSE");
//		}
//
//		return map;
//
//	}
//
//	protected void setErrorMessage(Exception exception, Map<String, Object> uiModel) {
//		exception.printStackTrace();
//		if (exception instanceof BizException) {
//			BizException e = (BizException) exception;
//			uiModel.put("error", e.getCode());
//			uiModel.put("error_description", e.getMsg());
//		} else {
//			uiModel.put("error", 0);
//			uiModel.put("error_description", "unknown error");
//		}
//	}
//
//	/**
//	 * 
//	 * @param url
//	 *            需删除记录的URL
//	 */
//	private void deleteUploadFile(String url) {
//
//		UploadFile uploadFile = uploadFileFacade.getByUrl(url);
//		if (uploadFile != null) {
//			uploadFileFacade.deleteById(uploadFile.getId());
//		}
//	}
//}
