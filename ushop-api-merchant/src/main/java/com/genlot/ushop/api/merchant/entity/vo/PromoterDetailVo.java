package com.genlot.ushop.api.merchant.entity.vo;

import java.util.Date;

public class PromoterDetailVo {
	
	private Integer type;
	private String userNo;
	private String userName;
	private Long stationId;
	private String stationNo;
	private String stationProvince;
	private String stationCity;
	private String stationArea;
	private String stationAddress;
	
	
	public Long getStationId() {
		return stationId;
	}
	public void setStationId(Long stationId) {
		this.stationId = stationId;
	}
	public Integer getType() {
		return type;
	}
	public void setType(Integer type) {
		this.type = type;
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
	public String getStationCity() {
		return stationCity;
	}
	public void setStationCity(String stationCity) {
		this.stationCity = stationCity;
	}
	public String getStationArea() {
		return stationArea;
	}
	public void setStationArea(String stationArea) {
		this.stationArea = stationArea;
	}
	public String getStationAddress() {
		return stationAddress;
	}
	public void setStationAddress(String stationAddress) {
		this.stationAddress = stationAddress;
	}
	
	
}
