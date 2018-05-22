package com.genlot.ushop.web.admin.util;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.apache.http.protocol.HttpService;
import org.springframework.web.multipart.MultipartFile;

import com.genlot.common.web.file.FastDFSClient;

public class FileInUtil {

	public static String fileData(FastDFSClient fastDFSClient, MultipartFile file,HttpServletRequest request,String savePath) throws Exception, IOException
	{
//		String path = request.getSession().getServletContext()
//				.getRealPath(savePath);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		String fileName = sdf.format(new Date())+file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
		//String fileName =FastDFSClient.uploadFile(file, fileName);
//		File targetFile = new File(path, fileName);
//		if (!targetFile.exists()) {
//			targetFile.mkdirs();
//		}
//		file.transferTo(targetFile);
		//return request.getContextPath() + "/"+savePath+"/"+ fileName;
		return fastDFSClient.uploadFile(file, fileName);
	}
	
}
