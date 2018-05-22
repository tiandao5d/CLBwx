  
package com.genlot.ushop.api.merchant.entity.vo;  

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.commons.CommonsMultipartFile;


public class MallShareVo implements Serializable{
	
    private List<String> scores;
	private String orderNo;
	private List<MallShareDetailVo> details;
	private Date createTime = new Date();

	public List<String> getScores() {
		return scores;
	}

	public void setScores(List<String> scores) {
		this.scores = scores;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public List<MallShareDetailVo> getDetails() {
		return details;
	}

	public void setDetails(List<MallShareDetailVo> details) {
		this.details = details;
	}

	public String getOrderNo() {
		return orderNo;
	}

	public void setOrderNo(String orderNo) {
		this.orderNo = orderNo;
	}
	
	
}
 