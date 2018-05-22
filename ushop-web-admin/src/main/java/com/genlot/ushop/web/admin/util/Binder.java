package com.genlot.ushop.web.admin.util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.ConversionException;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.Converter;
import org.apache.commons.beanutils.converters.CalendarConverter;
import org.apache.commons.beanutils.converters.DateConverter;
import org.apache.commons.httpclient.util.DateParseException;
import org.apache.commons.httpclient.util.DateUtil;
import org.apache.log4j.Logger;


/**
 * 页面参数自动绑定
 * @author jml
 * @time 2016-12-5优化修改使用BindWebFormToClass时日期类型字段被赋值的问题
 *
 */
public class Binder {
	/**
	 * Logger for this class
	 */
	private static final Logger logger = Logger.getLogger(Binder.class);

	/**
	 * 数据库存在该记录时使用
	 * @param request
	 * @param bean
	 */
	public static void bind(HttpServletRequest request, Object bean) {
		ConvertUtils.register(new Converter()  
	       {  
            
			  
	           @SuppressWarnings("rawtypes")  
	           public Object convert(Class arg0, Object arg1)  
	           {  
	               if(arg1 == null)  
	               {  
	                   return null;  
	               }  
	               if(!(arg1 instanceof String))  
	               {  
	                   throw new ConversionException("只支持字符串转换 !");  
	               }  
	                  
	               String str = (String)arg1;  
	               if(str.trim().equals(""))  
	               {  
	                   return null;  
	               }  
	               String format = "yyyy-MM-dd HH:mm:ss";
	               if ("yyyy-MM-dd".length() == str.length()) {
	            	   format = "yyyy-MM-dd";
	               } else if ("yyyy-MM-dd HH:mm".length() == str.length()) {
	            	   format = "yyyy-MM-dd HH:mm";
	               }
	               
	              
	               SimpleDateFormat sd = new SimpleDateFormat(format);  
	                  
	               try{  
	                   return sd.parse(str);  
	               }  
	               catch(ParseException e)  
	               {  
	                   throw new RuntimeException(e);  
	               }  
	                  
	           }  
	              
	       }, Date.class);
		ConvertUtils.register(new CalendarConverter(), Calendar.class);
		Map map = new HashMap();
		Enumeration names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = (String) names.nextElement();
			String v = "";
			if (request.getParameter(name) != null
					&& !request.getParameter(name).equals(""))
				v = request.getParameter(name);
			map.put(name, v);
		}
		try {
			BeanUtils.populate(bean, map);
		} catch (IllegalAccessException e) {
			logger.debug(e.getMessage(), e);
		} catch (InvocationTargetException e) {
			logger.debug(e.getMessage(), e);
		}
	}

	/**
	 * // 数据库不存在该记录时使用
	 * @param request
	 * @param ObjInstance
	 */
	public static void BindWebFormToClass(HttpServletRequest request,
			Object ObjInstance) {
		BindWebFormToClass(request, ObjInstance, null);
	}

	public static void BindWebFormToClass(HttpServletRequest request,
			Object ObjInstance, String paramPre) {
		Class ObjClass = ObjInstance.getClass();
		Method[] MethodList = ObjClass.getMethods();
		for (int i = 0; i < MethodList.length; i++) {
			Method SetMethod = MethodList[i];
			String szMethodName = SetMethod.getName();
			if (szMethodName.startsWith("set")) {
				String szParameterName = szMethodName.substring(3);
				String szParameterValue;
				if (paramPre == null)
					szParameterValue = request.getParameter(szParameterName);
				else
					szParameterValue = request.getParameter(paramPre + "."
							+ szParameterName);

				if (szParameterValue == null) {
					String szSubString = szParameterName.substring(1);
					char szFirstChar = szParameterName.charAt(0);
					if (Character.isLowerCase(szFirstChar))
						szFirstChar = Character.toUpperCase(szFirstChar);
					else
						szFirstChar = Character.toLowerCase(szFirstChar);
					szParameterName = szFirstChar + szSubString;
					szParameterValue = request.getParameter(szParameterName);
				}
				if (szParameterValue != null) {
					Class ParameterType = SetMethod.getParameterTypes()[0];
					if (ParameterType.equals(String.class)) {
						try {
							if (szParameterValue.compareTo("") != 0)
								SetMethod.invoke(ObjInstance,
										new Object[] { szParameterValue.trim() });
							else
								SetMethod.invoke(ObjInstance, "");
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}
					}
					if (ParameterType.equals(Date.class)) {
						try {
							List<String> formarts = new ArrayList<String>();
							formarts.add("yyyy-MM-dd");
							formarts.add("yyyy-MM-dd HH:mm");
							formarts.add("yyyy-MM-dd HH:mm:ss");
							
							Date ParameterValue = DateUtil.parseDate(szParameterValue, formarts);
							SetMethod.invoke(ObjInstance, new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						} catch (DateParseException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					if (ParameterType.equals(int.class)
							&& szParameterValue != null
							&& !szParameterValue.equals("")) {

						int ParameterValue = Integer.parseInt(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}

					}
					
					if (ParameterType.equals(double.class) && szParameterValue != null
							&& !szParameterValue.equals("")) {
						double ParameterValue = Double.parseDouble(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}

					}
					
					if (ParameterType.equals(Double.class) && szParameterValue != null
							&& !szParameterValue.equals("")) {
						Double ParameterValue = Double.parseDouble(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}

					}

					if (ParameterType.equals(Float.class)
							&& szParameterValue != null
							&& !szParameterValue.equals("")) {
						Float ParameterValue = Float.valueOf(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}
					}
					if (ParameterType.equals(Integer.class)
							&& szParameterValue != null
							&& !szParameterValue.equals("")) {
						Integer ParameterValue = Integer
								.parseInt(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}
					}
					if (ParameterType.equals(float.class)
							&& szParameterValue != null
							&& !szParameterValue.equals("")) {
						float ParameterValue = Float
								.parseFloat(szParameterValue);
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { ParameterValue });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}
					}
				} else {
					Class ParameterType = SetMethod.getParameterTypes()[0];
//					if (ParameterType.equals(String.class)) {
//						try {
//							SetMethod.invoke(ObjInstance, null);
//						} catch (IllegalArgumentException e) {
//							e.printStackTrace();
//						} catch (IllegalAccessException e) {
//							e.printStackTrace();
//						} catch (InvocationTargetException e) {
//							e.printStackTrace();
//						}
//					}
//					if (ParameterType.equals(Date.class)) {
////						Date ParameterValue = new Date();
//						try {
//							SetMethod.invoke(ObjInstance, new Object[] { null });
//						} catch (IllegalArgumentException e) {
//							e.printStackTrace();
//						} catch (IllegalAccessException e) {
//							e.printStackTrace();
//						} catch (InvocationTargetException e) {
//							e.printStackTrace();
//						}
//					}
					if (ParameterType.equals(Calendar.class)) {

//						Calendar ParameterValue = Calendar.getInstance();
						try {
							SetMethod.invoke(ObjInstance,
									new Object[] { null });
						} catch (IllegalArgumentException e) {
							e.printStackTrace();
						} catch (IllegalAccessException e) {
							e.printStackTrace();
						} catch (InvocationTargetException e) {
							e.printStackTrace();
						}
					}
				}
			}
		}
	}

}
