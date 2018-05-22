//package com.genlot.ushop.api.merchant.controller;
//
//import java.io.IOException;
//
//import javax.servlet.ServletException;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.ResponseBody;
//import org.springframework.web.servlet.ModelAndView;
//import org.springframework.web.servlet.mvc.support.RedirectAttributes;
//
//import com.genlot.ushop.api.merchant.biz.SpellBuyBiz;
//
//
//@Controller
//@RequestMapping(value = "/api/test")
//public class TestController {
//	
//	
//	@Autowired
//	SpellBuyBiz spellBuyBiz;
//	
//	@RequestMapping(value = "/get", method = RequestMethod.GET)
//    @ResponseBody
//    public Object submit(
//    		HttpServletRequest request,
//    		HttpServletResponse response) throws ServletException, IOException {  
//		
//		spellBuyBiz.createShare(1);
//		
////		
////		  request.setCharacterEncoding("utf-8");
////        response.setCharacterEncoding("utf-8");
////        
////        // 用户同意授权后，能获取到code
////        String code = request.getParameter("code");
////        String state = request.getParameter("state");
////        
////     	String code = "123";
////     	String state = "345";
//////        // 设置要传递的参数
//////        request.setAttribute("code", code);
//////        request.setAttribute("state", state);
//////        
////     	 ra.addAttribute("code", "code");
////		 ra.addAttribute("state", "state");
////        ModelAndView modelAndView = new ModelAndView("redirect:/html/123.html");  
//////        
//////        modelAndView.setViewName("index");  
//////      
////        return modelAndView;  
////       
//        //https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7eaf9a2e612db7b4&redirect_uri=http%3A%2F%2Fclb.lotplay.cn%2Fushop-api-merchant%2Fapi%2Ftest%2Fget&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
//        //https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7eaf9a2e612db7b4&redirect_uri=http%3A%2F%2F183.62.200.201:6080%2Fushop-api-merchant%2Fapi%2Ftest%2Fget&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
//		
//		return "123";
////
////		 return "redirect:html/123.html";
//		
//    }  
//}
