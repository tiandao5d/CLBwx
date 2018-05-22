package com.genlot.ushop.web.admin.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.user.entity.MerchantFile;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.enums.MerchantTypeEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.MerchantFileFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;


@Controller
@RequestMapping("/user/merchant")
public class MerchantController {	
	
	@Autowired
	MerchantFacade merchantFacade;
	
	@Autowired
	MerchantFileFacade merchantFileFacade;
	
	
	@RequestMapping(value = {"/list"}, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();		
		List<MerchantInfo> listMerchantInfo;

		try
		{	
			Map<String, Object> merchantMap = new HashMap<String, Object>();
			merchantMap.put("status", MerchantStatusEnum.FIRSTPASS.getValue());
			listMerchantInfo = merchantFacade.listBy(merchantMap);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("listMerchantInfo", listMerchantInfo);
		String json = JSON.toJSONString(uiModel);
		return json;
	}

	@RequestMapping(value="/listBy" ,method=RequestMethod.GET)
	@ResponseBody
	public Object listBy( 
			String merchantName,
			//分页
            Integer page,            
            Integer rows,
            //状态
            Integer status,
            HttpServletRequest request,
            HttpSession session)
	{
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();		
		if(merchantName != null){
			merchantName = merchantName.trim();
		}
		
		
		PageParam pageParam = null;
		PageBean pageBean = new PageBean();
		if (null == page || 0 == page) {
			page = 1;
			rows = 10;
			pageParam = new PageParam(page, rows);
		}
		else
		{
			pageParam = new PageParam(page, rows);
		}
		try{
			paramMap.put("merchantName", merchantName);
			paramMap.put("status", status);
			 pageBean = merchantFacade.listPage(pageParam, paramMap);
		}
		catch(Exception exception){			
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		
		uiModel.put("recordList", pageBean.getRecordList());	
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		return uiModel;
	}
	
	
	@RequestMapping(value="/getById",method=RequestMethod.GET)
	@ResponseBody
	public Object getById(Integer id)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		MerchantInfo merchantInfo=new MerchantInfo();
		MerchantFile merchantFile=new MerchantFile();
	   try{
		     merchantInfo = merchantFacade.getById(id.longValue());
			 merchantFile = merchantFileFacade.getByMerchantNo(merchantInfo.getMerchantNo());
	   }
	   catch(Exception e){
		   setErrorMessage(e, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
	   }

		
		uiModel.put("merchantInfo", merchantInfo);
		uiModel.put("merchantFile", merchantFile);

		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List  merchantStatusList = MerchantStatusEnum.toList();
		List  merchantTypeList = MerchantTypeEnum.toList();
		uiModel.put("MerchantStatusList", merchantStatusList);
		uiModel.put("merchantTypeList", merchantTypeList);  
		return uiModel;
	}
	
	
	@ResponseBody
	@RequestMapping(value="/pass",method=RequestMethod.POST)
	public Object auditMerchant(Integer adminId)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try{
			MerchantInfo info = merchantFacade.getById(adminId.longValue());
			info.setStatus(MerchantStatusEnum.FIRSTPASS.getValue());
			merchantFacade.update(info);
		}catch(Exception e)
		{
			setErrorMessage(e, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value="/frost",method=RequestMethod.POST)
	public Object frostMerchant( Integer adminId)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try{
			MerchantInfo info = merchantFacade.getById(adminId.longValue());
			info.setStatus(MerchantStatusEnum.INACTIVE.getValue());
			merchantFacade.update(info);
		}catch(Exception e)
		{
			setErrorMessage(e, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	
	@ResponseBody
	@RequestMapping(value="/notpass",method=RequestMethod.POST)
	public Object notpassMerchant( Integer adminId,String instructions)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try{
			MerchantInfo info = merchantFacade.getById(adminId.longValue());
			info.setStatus(MerchantStatusEnum.NOPASS.getValue());
			info.setInstructions(instructions);
			merchantFacade.update(info);
		}catch(Exception e)
		{
			setErrorMessage(e, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	@RequestMapping("delete")
	@ResponseBody
	public Object delete(Model model, Integer adminId)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try{
			//暂时不允许删除
		}catch(Exception e)
		{
			e.printStackTrace();
			return e.getMessage();
		}
		
		uiModel.put("data", "SUCCESS");
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
