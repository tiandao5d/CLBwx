package com.genlot.ushop.api.merchant.sns.controller;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;
import net.coobird.thumbnailator.Thumbnails;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.genlot.common.web.file.MyPutRet;
import com.genlot.common.web.file.QiniuCloudUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.api.merchant.entity.vo.UploadFileVo;
import com.genlot.ushop.api.merchant.payment.controller.WeiXinPaymentController;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.enums.BannerEffcetEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerTypeEnum;
import com.genlot.ushop.facade.sns.exceptions.BannerBizException;
import com.genlot.ushop.facade.sns.exceptions.SocialBizException;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;
import com.genlot.ushop.facade.sns.service.BannerFacade;

@Controller
@RequestMapping(value = "/api/sns/file")
public class FileController {

	private static final Logger log = LoggerFactory.getLogger(FileController.class);
	
	private static final String SLAVE_IMAGE_PREFIX_NAME = "_S";
	
	@Autowired
	private QiniuCloudUtil qiniuCloudUtil;
	@Autowired
	private UploadFileFacade uploadFileFacade;
	
	public static byte[] Base64ImageToBytes(String base64string) throws IOException {
		ByteArrayInputStream istream = null;
	    BASE64Decoder decoder = new BASE64Decoder(); 
	    byte[] bytes = decoder.decodeBuffer(base64string);  
	    istream = new ByteArrayInputStream(bytes);  
		BufferedImage image = null;
		image = ImageIO.read(istream);
		ByteArrayOutputStream ostream = new ByteArrayOutputStream();
		ImageIO.write(image, "JPG", ostream);  
	    return ostream.toByteArray();  
	} 	
	
	// 上传文件
	@RequestMapping(value = { "submit" }, method = RequestMethod.POST)
	@ResponseBody
	public Object submit(
			@RequestBody List<UploadFileVo> files,
			HttpServletRequest request, 
			HttpServletResponse response) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			
			if (files.isEmpty()) {
				throw SocialBizException.SHARE_FILE_MAX_COUNT_OVERFLOW;
			}
			List<String> urls = new ArrayList<String>();
			for(int index = 0; index < files.size(); ++index) {
				String key;
				String downloadUrl;
				UploadFileVo file = files.get(index);
				byte [] data = Base64ImageToBytes(file.getContent());
				log.error("Data len:" + data.length);
				
				if (data.length > 500 * 1024) {
					throw SocialBizException.SHARE_FILE_MAX_SIZE_OVERFLOW;
				}
				
				SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssS");
				UUID uuid = UUID.nameUUIDFromBytes(sdf.format(new Date()).getBytes());
				key = uuid.toString() + file.getName().substring(file.getName().lastIndexOf("."));
				uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), key, new Date());
				MyPutRet myPutRet = qiniuCloudUtil.uploadFile(data, key);
				downloadUrl = qiniuCloudUtil.getDowloadBaseUrl(key);
				if (myPutRet == null) {
					throw BizException.MESSAGE_SYSTEM_ERROR;
				}
				urls.add(downloadUrl);
			}
			
			uiModel.put("urls", urls);
		} 
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
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
	
//	
//	ByteArrayOutputStream os = new ByteArrayOutputStream();
//	Thumbnails.of(image).scale(0.25f).outputFormat("jpg").toOutputStream(os);
//	
//	String smallFileName = file.getOriginalFilename().substring(0,file.getOriginalFilename().lastIndexOf(".")) + 
//	DateUtils.LONG_DATE_FORMAT_SSS.format(new Date()) + SLAVE_IMAGE_PREFIX_NAME + 
//	file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
//	InputStream in = new ByteArrayInputStream(os.toByteArray()); 
//	MyPutRet myPutRet = qiniuCloutUtil.uploadFile(in,smallFileName);
//	filePaths.add(myPutRet.getKey());
}
