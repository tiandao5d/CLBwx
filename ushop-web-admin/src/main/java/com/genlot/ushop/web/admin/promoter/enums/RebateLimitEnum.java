package com.genlot.ushop.web.admin.promoter.enums;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/***
 * 状态枚举
 * 
 * @author hsz
 * 
 */
public enum RebateLimitEnum {

	ZERO("0", 0), HUNDRED("0~100彩分", 1), FIVEHUNDRED("100~500彩分", 2), FIVETHOUSAND("500~5000彩分", 3), MORETHANFIVETHOUSAND("5000彩分以上", 4);
	
	
	/** 枚举值 */
	private int value;

	/** 描述 */
	private String desc;

	private RebateLimitEnum(String desc, int value) {
		this.value = value;
		this.desc = desc;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public void setValue(int value) {
		this.value = value;
	}

	public int getValue() {
		return value;
	}

	public static RebateLimitEnum getEnum(int value) {
		RebateLimitEnum resultEnum = null;
		RebateLimitEnum[] enumAry = RebateLimitEnum.values();
		for (int i = 0; i < enumAry.length; i++) {
			if (enumAry[i].getValue() == value) {
				resultEnum = enumAry[i];
				break;
			}
		}
		return resultEnum;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List toList() {
		RebateLimitEnum[] ary = RebateLimitEnum.values();
		List list = new ArrayList();
		for (int i = 0; i < ary.length; i++) {
			Map<String, String> map = new HashMap<String, String>();
			map.put("value", String.valueOf(ary[i].getValue()));
			map.put("desc", ary[i].getDesc());
			list.add(map);
		}
		return list;
	}

	public static Map<String, Map<String, Object>> toMap() {
		RebateLimitEnum[] ary = RebateLimitEnum.values();
		Map<String, Map<String, Object>> enumMap = new HashMap<String, Map<String, Object>>();
		for (int num = 0; num < ary.length; num++) {
			Map<String, Object> map = new HashMap<String, Object>();
			String key = String.valueOf(getEnum(ary[num].getValue()));
			map.put("value", String.valueOf(ary[num].getValue()));
			map.put("desc", ary[num].getDesc());
			enumMap.put(key, map);
		}
		return enumMap;
	}

}
