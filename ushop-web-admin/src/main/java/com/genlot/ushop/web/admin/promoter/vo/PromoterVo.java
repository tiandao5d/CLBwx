package com.genlot.ushop.web.admin.promoter.vo;

import java.math.BigDecimal;
import java.util.Date;

import com.genlot.common.entity.BaseEntity;


public class PromoterVo {

	private static final long serialVersionUID = 1L;

	
	
	
	private Long id;
	
	/** 账户编号 */
	private String userNo;
	
	/** 账户用户名 */
	private String userName;
	
	/** 邀请人 */
	private String inviter;
	
	/** 等级 */
	private Integer level;
	
	/** 经验 */
	private Integer exp;
	
	/** 彩分余额 */
	private Double balance;
	
	/** 一级返利额 */
	private Double rebates;
	
	/** 二级返利额 */
	private Double rewards;
	
	/** 直属数量 */
	private Integer subordinate;

	/** 次属数量 */
	private Integer secondary;
	
	
	/** 站点编号 **/
	private String stationNo;
	
	/** 站点省份 **/
	private String stationProvince;
	
	/** 站点下线 **/
	private Integer stationBind;
	
	/** 下家总数 **/
	private Integer totalSubordinate;
	
	/** 总返利额 */
	private Double totalRebates;
	
	/** 本月业绩 */
	private Double monthlyRebates;
	
	private String stationAddress;
	
	private String bankName;
	
	private String bankAddress;
	
	private String bankNo;
	
	private String cardNo;
	
	private String name;
	
	private String phone;
	
	private String alipayAccount;
	
	
	
	public String getAlipayAccount() {
		return alipayAccount;
	}

	public void setAlipayAccount(String alipayAccount) {
		this.alipayAccount = alipayAccount;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
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
	
	public Double getRebates() {
		return rebates;
	}

	public void setRebates(Double rebates) {
		this.rebates = rebates;
	}

	public Integer getLevel() {
		return level;
	}

	public void setLevel(Integer level) {
		this.level = level;
	}

	public String getStationNo() {
		return stationNo;
	}

	public void setStationNo(String stationNo) {
		this.stationNo = stationNo;
	}

	public String getStationProvince() {
		return stationProvince;
	}

	public void setStationProvince(String stationProvince) {
		this.stationProvince = stationProvince;
	}

	public Integer getStationBind() {
		return stationBind;
	}

	public void setStationBind(Integer stationBind) {
		this.stationBind = stationBind;
	}

	public Double getMonthlyRebates() {
		return monthlyRebates;
	}

	public void setMonthlyRebates(Double monthlyRebates) {
		this.monthlyRebates = monthlyRebates;
	}

	public Integer getSubordinate() {
		return subordinate;
	}

	public void setSubordinate(Integer subordinate) {
		this.subordinate = subordinate;
	}

	

	public String getInviter() {
		return inviter;
	}

	public void setInviter(String inviter) {
		this.inviter = inviter;
	}

	public Integer getExp() {
		return exp;
	}

	public void setExp(Integer exp) {
		this.exp = exp;
	}

	public Double getBalance() {
		return balance;
	}

	public void setBalance(Double balance) {
		this.balance = balance;
	}

	public Double getRewards() {
		return rewards;
	}

	public void setRewards(Double rewards) {
		this.rewards = rewards;
	}

	public Integer getSecondary() {
		return secondary;
	}

	public void setSecondary(Integer secondary) {
		this.secondary = secondary;
	}

	public Integer getTotalSubordinate() {
		return totalSubordinate;
	}

	public void setTotalSubordinate(Integer totalSubordinate) {
		this.totalSubordinate = totalSubordinate;
	}

	public Double getTotalRebates() {
		return totalRebates;
	}

	public void setTotalRebates(Double totalRebates) {
		this.totalRebates = totalRebates;
	}

	public String getStationAddress() {
		return stationAddress;
	}

	public void setStationAddress(String stationAddress) {
		this.stationAddress = stationAddress;
	}

	public String getBankName() {
		return bankName;
	}

	public void setBankName(String bankName) {
		this.bankName = bankName;
	}

	public String getBankAddress() {
		return bankAddress;
	}

	public void setBankAddress(String bankAddress) {
		this.bankAddress = bankAddress;
	}

	public String getBankNo() {
		return bankNo;
	}

	public void setBankNo(String bankNo) {
		this.bankNo = bankNo;
	}

	public String getCardNo() {
		return cardNo;
	}

	public void setCardNo(String cardNo) {
		this.cardNo = cardNo;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
	
	
	
}
