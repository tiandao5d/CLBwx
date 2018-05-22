package com.genlot.ushop.web.admin.promoter.vo;

import java.math.BigDecimal;
import java.util.Date;

import com.genlot.common.entity.BaseEntity;

/**
 * 
 * 下属信息
 * 
 * @author hsz
 * @date
 * @version
 * 
 */
public class PromoterSubordinateInfoVo {

	private static final long serialVersionUID = 1L;

	
	
	/** 账户编号 */
	private String userNo;
	
	/** 账户用户名 */
	private String userName;

	/** 直属编号 */
	private String parent;

	/** 推广标志(100:是推广员,101:不是推广员) */
	private String type;

	/** 返利额 */
	private Double rebates;
	
	/** 返利类型*/
	private String rebateType;
	
	/** 总消费 */
	private Double expenditure;
	
	/** 关系 */
	private String relation;
	
	private Date createTime;
	
	private Long id;
	
	public String getUserNo() {
		return userNo;
	}

	public void setUserNo(String userNo) {
		this.userNo = userNo;
	}
	
	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	

	public String getParent() {
		return parent;
	}

	public void setParent(String parent) {
		this.parent = parent;
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

	public void increaseExpenditure(Double value)
	{
		this.expenditure += value;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getRebateType() {
		return rebateType;
	}

	public void setRebateType(String rebateType) {
		this.rebateType = rebateType;
	}

	public String getRelation() {
		return relation;
	}

	public void setRelation(String relation) {
		this.relation = relation;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	
}
