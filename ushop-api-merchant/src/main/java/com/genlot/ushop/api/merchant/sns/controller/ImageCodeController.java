package com.genlot.ushop.api.merchant.sns.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.imageio.ImageIO;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.sms.service.SMSFacade;

@Controller
@RequestMapping(value = "/api/sns/image/verify")
public class ImageCodeController {

	private static final Logger log = LoggerFactory
			.getLogger(ImageCodeController.class);

	@Autowired
	private SMSFacade sMSFacade;

	@Autowired
	private UserQueryFacade userQueryFacade;

	/**
	 * 获得图片验证码.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/image/verify/code/get
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @param mobile
	 *            手机号码.
	 * @return
	 */
	@SuppressWarnings("restriction")
	@RequestMapping(value = { "/code/get" }, method = RequestMethod.GET)
	@ResponseBody
	public Object get(HttpServletRequest request, HttpServletResponse response) {
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try {
			//利用图片工具生成图片  
		    //第一个参数是生成的验证码，第二个参数是生成的图片  
		    Object[] objs = createImage();  
		    //将验证码缓存
		    sMSFacade.setImageCode((String)objs[0]);
		    //将图片输出给浏览器  
		    BufferedImage image = (BufferedImage) objs[1];  
		    response.setContentType("image/jpeg");  
		    ByteArrayOutputStream os = new ByteArrayOutputStream();
		    ImageIO.write(image, "jpeg", os);  
		    BASE64Encoder encoder = new BASE64Encoder();
		    String bufferString = encoder.encode(os.toByteArray());
		    bufferString.replaceAll("\n", "").replaceAll("\r", "");
		    bufferString = "data:image/JPEG;base64," + bufferString;
		    uiModel.put("code", bufferString);
		} 
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
	    return uiModel;
	}

	// 验证码字符集  
    private static final char[] chars = {   
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',   
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',  
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',  
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',   
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};  
    
    // 字符数量  
    private static final int SIZE = 5;  
    // 干扰线数量  
    private static final int LINES = 5;  
    // 宽度  
    private static final int WIDTH = 100;  
    // 高度  
    private static final int HEIGHT = 40;  
    // 字体大小  
    private static final int FONT_SIZE = 30;  
  
    /** 
     * 生成随机验证码及图片 
     * Object[0]：验证码字符串； 
     * Object[1]：验证码图片。 
     */  
    public static Object[] createImage() {  
        StringBuffer sb = new StringBuffer();  
        // 1.创建空白图片  
        BufferedImage image = new BufferedImage(  
            WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);  
        // 2.获取图片画笔  
        Graphics graphic = image.getGraphics();  
        // 3.设置画笔颜色  
        graphic.setColor(Color.LIGHT_GRAY);  
        // 4.绘制矩形背景  
        graphic.fillRect(0, 0, WIDTH, HEIGHT);  
        // 5.画随机字符  
        Random ran = new Random();  
        for (int i = 0; i <SIZE; i++) {  
            // 取随机字符索引  
            int n = ran.nextInt(chars.length);  
            // 设置随机颜色  
            graphic.setColor(getRandomColor());  
            // 设置字体大小  
            graphic.setFont(new Font(  
                null, Font.BOLD + Font.ITALIC, FONT_SIZE));  
            // 画字符  
            graphic.drawString(  
                chars[n] + "", i * WIDTH / SIZE, HEIGHT*2/3);  
            // 记录字符  
            sb.append(chars[n]);  
        }  
        // 6.画干扰线  
        for (int i = 0; i < LINES; i++) {  
            // 设置随机颜色  
            graphic.setColor(getRandomColor());  
            // 随机画线  
            graphic.drawLine(ran.nextInt(WIDTH), ran.nextInt(HEIGHT),  
                    ran.nextInt(WIDTH), ran.nextInt(HEIGHT));  
        }  
        // 7.返回验证码和图片  
        return new Object[]{sb.toString(), image};  
    }  
  
    /** 
     * 随机取色 
     */  
    public static Color getRandomColor() {  
        Random ran = new Random();  
        Color color = new Color(ran.nextInt(256),   
                ran.nextInt(256), ran.nextInt(256));  
        return color;  
    }  

    protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
		uiModel.clear();
		if (exception instanceof BizException)
		{
			BizException e = (BizException)exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		}
		else
		{
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
}
