package com.genlot.ushop.web.admin.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;


import com.genlot.ushop.facade.product.entity.ProductType;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.ProductTypeFacade;

/** 
* @author  kangds 
* @date 2016年7月4日 下午1:46:22 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */


@Controller
@RequestMapping(value = "/admin/statistic")
public class StatisticsController {
	
	
	private static final Logger log = LoggerFactory.getLogger(StatisticsController.class);
	
		
//  @Autowired
//  private ReplacementRecordFacade replacementRecordFacade;
//       
//  @Autowired
//  private MarketStatisticsFacade marketStatisticsFacade;
//      
//  @Autowired
//  private ConsumeStatisticsFacade consumeStatisticsFacade;
	
//	@Autowired
//	private TaskParticipateStatisticsFacade taskParticipateStatisticsFacade;
       
    @Autowired
    private ProductTypeFacade   productTypeFacade;
       
    @Autowired
    private ProductQueryFacade  productQueryFacade;
     
    @Autowired
    private MerchantFacade merchantFacade;
		
    
//	@RequestMapping(value = {"/report"}, method = RequestMethod.GET)
//	@ResponseBody
//	public void report(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException {
//		response.sendRedirect("http://10.13.0.70:9093/ReportServer/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT101");
//	}
	
//	/**
//	 * 根据开奖次数统计商品数量.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/statistic/listProductCountGroupByLotteryCount/begin/end
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @param begin 
//	 * 			开始时间
//	 *  @param end 
//	 * 			结束时间
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = {"/listProductCountGroupByLotteryCount"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listProductCountGroupByLotteryCount(
//    		String begin,
//    		String end,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<StatisticsResultVO> listProductCountGroup;
//
//		try
//		{
//		   //根据开奖次数获得商品分组
//			listProductCountGroup = marketStatisticsFacade.listProductCountGroupByLotteryCount(begin, end);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listProductCountGroup", listProductCountGroup);
//		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	
//	/**
//	 * 根据开奖次数统计商品数量.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/statistic/listProductCountGroupByLotteryCount/begin/end
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @param begin 
//	 * 			开始时间
//	 *  @param end 
//	 * 			结束时间
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = {"/listProductByLotteryCount"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Map<String, Object> listProductByLotteryCount(			
//			//分页
//            Integer page,
//            Integer rows,            
//    		String begin,
//    		String end,
//    		Integer small,
//    		Integer old,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<Integer> productIdList;
//		Map<String, Object> paramMap = new HashMap<String, Object>();
//		PageParam pageParam = null;
//		PageBean pageBean =new PageBean();
//		
//		if (page == null || rows == null) {
//			pageParam = new PageParam(1, 10);
//		} else {
//			pageParam = new PageParam(page, rows);
//		}			
//		try
//		{  //根据开奖次数获得商品ID 列表
//			//和前端约定，最后一组（开奖次数大于500），最大值传-1
//			if(old.intValue() == -1){
//				old = null;
//			}
//			productIdList = marketStatisticsFacade.listProductIdByLotteryCount(begin, end, small, old);
//			//当ID列表为空时，直接返回空列表
//			if(productIdList.isEmpty()){				
//				uiModel.put("recordList",pageBean.getRecordList());
//				uiModel.put("currentPage", pageBean.getCurrentPage());
//				uiModel.put("pagePage", pageBean.getPageCount());
//				uiModel.put("totalCount", pageBean.getTotalCount());				
//				return uiModel;
//			}
//			paramMap.put("ids", productIdList);
//			pageBean =  productQueryFacade.listPage(pageParam, paramMap);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}		
//		uiModel.put("recordList",pageBean.getRecordList());
//		uiModel.put("currentPage", pageBean.getCurrentPage());
//		uiModel.put("pagePage", pageBean.getPageCount());
//		uiModel.put("totalCount", pageBean.getTotalCount());
//		
//		return uiModel;
//	}
//	
//	/**
//	 * 按商品分类分段统计商品销售额.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/statistic/listSalesAmountGroupByProductType_monthly
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=分类ID value=统计数 param=月份数
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = {"/listSalesAmountGroupByProductType_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listSalesAmountGroupByProductType_monthly(
//    		 String begin,
//    		 String end,
//    		 String merchantIds,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<StatisticsResultVO> listSalesAmountGroupByProductType_monthly;
//		List<ProductType> listProductCategory;
//		
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""  ){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIds = null;
//		}		
//		try
//		{
//		   //按商品分类分段统计商品销售额
//			listSalesAmountGroupByProductType_monthly = marketStatisticsFacade.listSalesAmountGroupByProductType_monthly(begin, end, merchantIdLsit);
//			//商品分类下拉框
//			listProductCategory = productTypeFacade.listProductCategory();
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesAmountGroupByProductType_monthly", listSalesAmountGroupByProductType_monthly);
//		uiModel.put("listProductCategory", listProductCategory);
//		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	/**
//	 * 按商品分类分段统计商品销量.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=分类ID value=统计数 param=月份数
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesCountGroupByProductType_monthly"}, method = RequestMethod.GET)
//	@ResponseBody 
//	public Object listSalesCountGroupByProductType_monthly(
//    		 String begin,
//    		 String end,
//    		 String merchantIds,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listSalesCountGroupByProductType_monthly;
//		List<ProductType> listProductCategory;
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIds = null;
//		}				
//		try
//		{
//			listSalesCountGroupByProductType_monthly = marketStatisticsFacade.listSalesCountGroupByProductType_monthly(begin, end, merchantIdLsit);
//			//商品分类下拉框
//			listProductCategory = productTypeFacade.listProductCategory();
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesCountGroupByProductType_monthly", listSalesCountGroupByProductType_monthly);
//		uiModel.put("listProductCategory", listProductCategory);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	
//	/**
//	 * 按商品ID分类分段统计商品销售额.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @param productIds
//	 *            商品ID，如果为或者数量为0则统计所有商品.
//	 * @param productTypes
//	 *            商品类型，如果为或者数量为0则统计所有商品.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商品分类 name=商家名字 value=统计数 param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesAmountGroupByProductId_monthly"}, method = RequestMethod.GET)
//	@ResponseBody 
//	public Object listSalesAmountGroupByProductId_monthly(
//    		 String begin,
//    		 String end,
//    		 String merchantIds,
//    		 String productIds,
//    		 String productTypes,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<ProductStatisticsResultVO> listSalesAmountGroupByProductId_monthly;
//		List<ProductType> listProductCategory;
//		List<ProductInfo> listProductInfo;
//		
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		List<String> productIdLsit =  new ArrayList<String>();
//		List<String> productTypesLsit =  new ArrayList<String>();
//
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIds = null;
//		}
//		if(productIds != null && productIds != "null" ){
//			//字符串转数组
//			String[] productId = StringUtils.split(productIds, "|,|");
//			for (int i = 0; i < productId.length; i++) {	
//				productIdLsit.add(productId[i]);
//			}
//		}else{
//			productIds = null;
//		}
//		if(productTypes != null && productTypes != "null"){
//			//字符串转数组
//			String[] productType = StringUtils.split(productTypes, "|,|");
//			for (int i = 0; i < productType.length; i++) {
//				productTypesLsit.add(productType[i]);
//			}
//		}else{
//			productTypes = null;
//		}				
//		try
//		{
//			listSalesAmountGroupByProductId_monthly = marketStatisticsFacade.listSalesAmountGroupByProductId_monthly(begin, end, merchantIdLsit, productIdLsit,productTypesLsit);
//			//商品分类下拉框
//			listProductCategory = productTypeFacade.listProductCategory();
//			//商品下拉框	
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			//任何状态的商品都有可能被统计
//			/*int status = ProductStatusEnum.UP.getValue();
//			paramMap.put("status", status);	*/
//			listProductInfo = productQueryFacade.listBy(paramMap);
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesAmountGroupByProductId_monthly", listSalesAmountGroupByProductId_monthly);
//		uiModel.put("listProductCategory", listProductCategory);
//		uiModel.put("listProductInfo", listProductInfo);
//		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	
//	/**
//	 * 按商品ID分类分段统计商品销量.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @param productIds
//	 *            商品ID，如果为或者数量为0则统计所有商品.
//	 * @param productTypes
//	 *            商品类型，如果为或者数量为0则统计所有商品.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商品分类 name=商家名字 value=统计数 param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesCountGroupByProductId_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listSalesCountGroupByProductId_monthly(
//    		 String begin,
//    		 String end,
//    		 String  merchantIds,
//    		 String  productIds,
//    		 String productTypes,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listSalesCountGroupByProductId_monthly;
//		List<ProductType> listProductCategory;
//		List<ProductInfo> listProductInfo;
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		List<String> productIdLsit =  new ArrayList<String>();
//		List<String> productTypesLsit =  new ArrayList<String>();
//
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIds = null;
//		}
//		if(productIds != null && productIds != "null" ){
//			//字符串转数组
//			String[] productId = StringUtils.split(productIds, "|,|");
//			for (int i = 0; i < productId.length; i++) {	
//				productIdLsit.add(productId[i]);
//			}
//		}else{
//			productIds = null;
//		}
//		if(productTypes != null && productTypes != "null"){
//			//字符串转数组
//			String[] productType = StringUtils.split(productTypes, "|,|");
//			for (int i = 0; i < productType.length; i++) {
//				productTypesLsit.add(productType[i]);
//			}
//		}else{
//			productTypes = null;
//		}		
//		try
//		{
//			listSalesCountGroupByProductId_monthly = marketStatisticsFacade.listSalesCountGroupByProductId_monthly(begin, end, merchantIdLsit, productIdLsit,productTypesLsit);
//			//商品分类下拉框		
//			listProductCategory = productTypeFacade.listProductCategory();
//			//商品下拉框	
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			//任何状态的商品都有可能被统计
//			/*int status = ProductStatusEnum.UP.getValue();
//			paramMap.put("status", status);*/	
//			listProductInfo = productQueryFacade.listBy(paramMap);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesCountGroupByProductId_monthly", listSalesCountGroupByProductId_monthly);
//		uiModel.put("listProductCategory", listProductCategory);
//		uiModel.put("listProductInfo", listProductInfo);
//		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
	
	
//	/**
//	 * 按商品ID分类分段统计商品销售净利润.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @param productIds
//	 *            商品ID，如果为或者数量为0则统计所有商品.
//	 * @param productTypes
//	 *            商品类型，如果为或者数量为0则统计所有商品.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商品分类 name=商家名字 value=统计数 param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesProfitGroupByProductId_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listSalesProfitGroupByProductId_monthly(
//    		 String begin,
//    		 String end,
//    		 String  merchantIds,
//    		 String  productIds,
//    		 String productTypes,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<ProductStatisticsResultVO> listSalesProfitGroupByProductId_monthly;
//		List<ProductType> listProductCategory;
//		List<ProductInfo> listProductInfo;
//
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		List<String> productIdLsit =  new ArrayList<String>();
//		List<String> productTypesLsit =  new ArrayList<String>();
//
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIds = null;
//		}
//		if(productIds != null && productIds != "null" ){
//			//字符串转数组
//			String[] productId = StringUtils.split(productIds, "|,|");
//			for (int i = 0; i < productId.length; i++) {	
//				productIdLsit.add(productId[i]);
//			}
//		}else{
//			productIds = null;
//		}
//		if(productTypes != null && productTypes != "null"){
//			//字符串转数组
//			String[] productType = StringUtils.split(productTypes, "|,|");
//			for (int i = 0; i < productType.length; i++) {
//				productTypesLsit.add(productType[i]);
//			}
//		}else{
//			productTypes = null;
//		}				
//		try
//		{
//			listSalesProfitGroupByProductId_monthly = marketStatisticsFacade.listSalesProfitGroupByProductId_monthly(begin, end, merchantIdLsit, productIdLsit,productTypesLsit);
//			//商品分类下拉框
//			listProductCategory = productTypeFacade.listProductCategory();
//			//商品下拉框	
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			//任何状态的商品都有可能被统计
//			/*int status = ProductStatusEnum.UP.getValue();
//			paramMap.put("status", status);*/	
//			listProductInfo = productQueryFacade.listBy(paramMap);
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesProfitGroupByProductId_monthly", listSalesProfitGroupByProductId_monthly);
//		uiModel.put("listProductCategory", listProductCategory);
//		uiModel.put("listProductInfo", listProductInfo);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	 	/**
//	 * 按商家ID分类分段统计商品销量.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商家ID name=商家名字 value=统计数 param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesCountGroupByMerchantId_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listSalesCountGroupByMerchantId_monthly(
//    		 String begin,
//    		 String end,
//    		 String  merchantIds,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		
//		List<StatisticsResultVO> listSalesCountGroupByMerchantId_monthly;
//		List<MerchantInfo> listMerchantInfo;
//		
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		if(merchantIds != null && merchantIds != "null" && merchantIds != "" && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIdLsit = null;
//		}	
//		try
//		{
//			listSalesCountGroupByMerchantId_monthly = marketStatisticsFacade.listSalesCountGroupByMerchantId_monthly(begin, end, merchantIdLsit);
//			//商家下拉框需要全部商家
//			Map<String, Object> merchantMap = new HashMap<String, Object>();
//			merchantMap.put("status", MerchantStatusEnum.FIRSTPASS.getValue());
//			listMerchantInfo =merchantFacade.listBy(merchantMap);
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesCountGroupByMerchantId_monthly", listSalesCountGroupByMerchantId_monthly);
//		uiModel.put("listMerchantInfo", listMerchantInfo);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	/**
//	 * 按商家ID分段统计商品销售额.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商家ID name=商家名字 value=统计数 param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listSalesAmountGroupByMerchantId_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listSalesAmountGroupByMerchantId_monthly(
//    		String begin,
//    		String end,
//    		String merchantIds,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listSalesAmountGroupByMerchantId_monthly;
//		//商家信息
//		List<MerchantInfo> listMerchantInfo;
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		if(merchantIds != null && merchantIds != "null" && merchantIds != ""){
//			//字符串转数组
// 			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}else{
//			merchantIdLsit = null;
//		}				
//		try
//		{
//			listSalesAmountGroupByMerchantId_monthly = marketStatisticsFacade.listSalesAmountGroupByMerchantId_monthly(begin, end, merchantIdLsit);
//			//商家下拉框需要全部商家
//			Map<String, Object> merchantMap = new HashMap<String, Object>();
//			merchantMap.put("status", MerchantStatusEnum.FIRSTPASS.getValue());
//			listMerchantInfo =merchantFacade.listBy(merchantMap);
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listSalesAmountGroupByMerchantId_monthly", listSalesAmountGroupByMerchantId_monthly);
//		uiModel.put("listMerchantInfo", listMerchantInfo);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	/**
//	 * 按消费金额分段统计消费人次.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @return List<StatisticsResultVO> 
//	 * 			     分组ID，由于这个分组会根据策划需求进行改变，改变分组需求需要修改数据库的分组函数
//	 * 		               以下只是按照最初的需求而规划的分组index,日后就算修改也只是范围不同
//	 * 			    例子如下:
//	 * 			  1:  1 -  5
//	 * 			  2:  5 - 10
//	 * 			  3: 10 - 20
//	 *  		  4: 20 - 30
//	 * 			  5: 30 - 40
//	 * 			  6: 40 - 50
//	 * 			  7: 50 - 100
//	 * 			  8:100 - 200
//	 * 			  9:200 - 1000
//	 * 			 10:    > 1000
//	 * @throws StatisticsBizException
//	 */	
//	@RequestMapping(value = {"/listPeopleCountGroupByMoney"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listPeopleCountGroupByMoney(
//	    	String begin,
//	    	String end,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listPeopleCountGroupByMoney;
//		try
//		{
//			listPeopleCountGroupByMoney = consumeStatisticsFacade.listPeopleCountGroupByMoney(begin, end);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listPeopleCountGroupByMoney", listPeopleCountGroupByMoney);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	/**
//	 * 按消费时间分段统计消费人次.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @return List<StatisticsResultVO> 
//	 * 			     分组ID会每个一个小时的进行分组，命名是以正点时间为分组名字
//	 * 			    例如:%Y-%m-%d %H
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listPeopleCountTimeGroupByPerHour"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listPeopleCountTimeGroupByPerHour(
//    		String begin,
//    		String end,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listPeopleCountTimeGroupByPerHour;
//		try
//		{
//			listPeopleCountTimeGroupByPerHour = consumeStatisticsFacade.listPeopleCountTimeGroupByPerHour(begin, end);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listPeopleCountTimeGroupByPerHour", listPeopleCountTimeGroupByPerHour);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	/**
//	 * 按消费月份分段统计ARPU.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @return List<StatisticsResultVO> 
//	 * 			     分组ID会年月进行命名
//	 * 			    例如:%Y-%m
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listAverageRevenuePerUserGroupByMonthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listAverageRevenuePerUserGroupByMonthly(
//    		String begin,
//    		String end,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<StatisticsResultVO> listAverageRevenuePerUserGroupByMonthly;
//		try
//		{
//			listAverageRevenuePerUserGroupByMonthly = consumeStatisticsFacade.listAverageRevenuePerUserGroupByMonthly(begin, end);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("listAverageRevenuePerUserGroupByMonthly", listAverageRevenuePerUserGroupByMonthly);
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
	
//	/**
//	 * 按商品ID分段统计换货次数.
//	 * 
//	 * @param begin
//	 *            开始时间(年月日时分秒).
//	 * @param end
//	 *            结束时间(年月日时分秒).
//	 * @param merchantIds
//	 *            商家ID，如果为或者数量为0则统计所有商家.
//	 *            
//	 * @return List<StatisticsResultVO>
//	 * 			  id=商品ID name=商家ID  value=统计数  param=月份数 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/listReplacementRecordByMerchantIds_monthly"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object listReplacementRecordByMerchantIds_monthly(
//    		 String begin,
//    		 String end,
//    		 String  merchantIds,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		List<String> merchantIdLsit =  new ArrayList<String>();	
//		if(merchantIds != null && !merchantIds.equals("null") && merchantIds != ""){
//			//字符串转数组
//			String[] merchantId = StringUtils.split(merchantIds, "|,|");
//			for (int i = 0; i < merchantId.length; i++) {	
//				merchantIdLsit.add(merchantId[i]);
//			}
//		}		
//		//从数据库查出来的结果
//		List<ReplacementRecordVO> middleList;		
//		//返回数据
//		Map returnList = new HashMap();	
//		
//		try
//		{
//			middleList = replacementRecordFacade.listReplacementRecordByMerchantIds_monthly(begin, end, merchantIdLsit);			
//			for(ReplacementRecordVO replacementRecordVO : middleList){				
//				Map map = (Map) returnList.get(replacementRecordVO.getProductId());
//				if (map != null) {
//					Map monthly = (Map) map.get("monthly");
//					if (monthly != null) {
//						monthly.put(replacementRecordVO.getGroupParam(), replacementRecordVO.getGroupValue());
//					} else {
//						monthly = new HashMap();
//						monthly.put(replacementRecordVO.getGroupParam(), "0");
//						map.put("monthly", monthly);
//					}
//				} else {
//					map = new HashMap();
//					map.put("productId", replacementRecordVO.getProductId());
//					map.put("productName", replacementRecordVO.getProductName());
//					map.put("merchantName", replacementRecordVO.getMerchantName());
//					map.put("merchantId", replacementRecordVO.getMerchantId());
//					Map monthly = new HashMap();
//					monthly.put(replacementRecordVO.getGroupParam(), replacementRecordVO.getGroupValue());
//					map.put("monthly", monthly);
//					returnList.put(replacementRecordVO.getProductId(), map);
//				}
//				
//			}
//			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("returnList", returnList);
//		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
//	}
//	
//	
//	
//	/**
//	 * 活动记录统计列表
//	 * 
//	 * @param startDate
//	 *            开始时间(年月日).
//	 * @param startDate
//	 *            结束时间(年月日).
//	 * @param taskId
//	 * 			  活动ID
//	 * @param username
//	 *           用户名
//	 * @param phone
//	 *           手机号
//	 * @param status
//	 *          中奖状态 
//	 * @param rows
//	 *          一页显示条数
//	 * @param page
//	 *          页码
//	 * @return List<ParticipateRecord> 
//	 * 			     分组ID会年月进行命名
//	 * 			    例如:%Y-%m
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/taskRecordList"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object taskRecordList(
//    		String startDate,
//    		String endDate,
//    		Integer taskId,
//    		String username,
//    		String phone,
//    		Integer status,
//    		String keywords,
//    		Integer rows,
//    		Integer page,
//			HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		PageBean pageBean = null;
//		
//		PageParam pageParam = new PageParam(1, 10);
//		
//		if (rows != null && rows > 0) {
//			pageParam.setNumPerPage(rows);
//		}
//		
//		if (page != null && page > 0) {
//			pageParam.setPageNum(page);
//		}
//		
//		if (taskId == null) {
//			return "taskId is null";
//		}
//		
//		try {
//			
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			paramMap.put("startDate", startDate);
//			paramMap.put("endDate", endDate);
//			paramMap.put("taskId", taskId);
//			paramMap.put("username", username);
//			paramMap.put("phone", phone);
//			paramMap.put("status", status);
//			paramMap.put("keywords", keywords);
//			
//			pageBean = taskParticipateStatisticsFacade.listPage(pageParam, paramMap);			
//		} catch (Exception exception) {
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//		if (pageBean != null) {
//			uiModel.put("totalCount", pageBean.getTotalCount());
//			uiModel.put("currentPage", pageBean.getCurrentPage());
//			uiModel.put("pagePage", pageBean.getPageCount());
//			uiModel.put("recordList", pageBean.getRecordList());
//		}
//		
//		
//		return uiModel;
//	}
//	
//	
//	/**
//	 * 活动记录统计列表
//	 * 
//	 * @param startDate
//	 *            开始时间(年月日).
//	 * @param startDate
//	 *            结束时间(年月日).
//	 * @param type
//	 * 			  活动类型
//	 * @param taskName
//	 *           活动名称
//	 * @param activeState
//	 *           活动状态
//	 * @return List<TaskParticipateStatisticsResultVO> 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/activityList"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object activityList(
//    		String startDate,
//    		String endDate,
//    		Integer type,
//    		String taskName,
//    		String activeState,
//			HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		
//		List<TaskParticipateStatisticsResultVO> list = new ArrayList<TaskParticipateStatisticsResultVO>();
//		
//		try {
//			
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			paramMap.put("startDate", startDate);
//			paramMap.put("endDate", endDate);
//			paramMap.put("type", type);
//			paramMap.put("taskName", taskName);
//			paramMap.put("activeState", activeState);
//			
//			list = taskParticipateStatisticsFacade.activityList(paramMap);			
//		} catch (Exception exception) {
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//		uiModel.put("recordList", list);
//		
//		return uiModel;
//	}
//	
//	/**
//	 * 活动记录 日报表
//	 * 
//	 * @param startDate
//	 *            开始时间(年月日).
//	 * @param startDate
//	 *            结束时间(年月日).
//	 * @param taskId
//	 *           活动ID
//	 * @return List<TaskParticipateStatisticsResultVO> 
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/taskDailyList"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object taskDailyList(
//    		String startDate,
//    		String endDate,
//    		Integer taskId,
//			HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		
//		List<TaskParticipateStatisticsResultVO> list = new ArrayList<TaskParticipateStatisticsResultVO>();
//		
//		try {
//			
//			Map<String, Object> paramMap = new HashMap<String, Object>();
//			paramMap.put("startDate", startDate);
//			paramMap.put("endDate", endDate);
//			paramMap.put("taskId", taskId);
//			
//			list = taskParticipateStatisticsFacade.dailyList(paramMap);			
//		} catch (Exception exception) {
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//		uiModel.put("recordList", list);
//		if (list != null && list.size() > 0) {
//			uiModel.put("taskName", list.get(0).getTaskName());
//		} else {
//			uiModel.put("taskName", "");
//		}
//		return uiModel;
//	}
	
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
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

