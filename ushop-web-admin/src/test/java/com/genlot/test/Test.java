package com.genlot.test;

import java.util.ArrayList;
import java.util.List;

import junit.framework.TestCase;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.alibaba.fastjson.JSON;
import com.genlot.common.message.order.event.entity.OrderProductVo;

public class Test extends TestCase {

	public Test() {
		super();
	}

	public void test() throws JSONException {
		List<OrderProductVo> consumeList = new ArrayList<OrderProductVo>();
		String str = "[{\"buyCount\":1,\"productDesc\":\"三级福袋\",\"productId\":179,\"productName\":\"三级福袋\",\"productPrice\":20}]";
		
		if (isJsonStr(str)) {
			JSONArray jsonArray = new JSONArray(str);
			if (jsonArray != null) {
				for (int i = 0; i < jsonArray.length(); i++) {
					OrderProductVo vo = JSON.parseObject(jsonArray.get(i).toString(), OrderProductVo.class);
					System.out.println(vo.getProductName());
					consumeList.add(vo);
				}
			}
		}
		System.out.println(consumeList);
	}

	private boolean isJsonStr(String str) {
		boolean result = true;
		try {
			new JSONArray(str);
		} catch (JSONException e) {
			result = false;
		}
		return result;
	}

}
