package com.genlot.ushop.api.merchant.entity.vo;

import java.util.Date;

public class PromoterSubordinateDetailVo {
	
	private String userName;
	private Integer type;
	private Integer relationship;
	private Double rebates;
	private Double expenditure;
	private Date   createTime;
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public Integer getType() {
		return type;
	}
	public void setType(Integer type) {
		this.type = type;
	}
	public Integer getRelationship() {
		return relationship;
	}
	public void setRelationship(Integer relationship) {
		this.relationship = relationship;
	}
	public Double getRebates() {
		return rebates;
	}
	public void setRebates(Double rebates) {
		this.rebates = rebates;
	}
	public Double getExpenditure() {
		return expenditure;
	}
	public void setExpenditure(Double expenditure) {
		this.expenditure = expenditure;
	}
	public Date getCreateTime() {
		return createTime;
	}
	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}
	
	
	
}
