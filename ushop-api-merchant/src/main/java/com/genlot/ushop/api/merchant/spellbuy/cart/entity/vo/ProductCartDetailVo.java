package com.genlot.ushop.api.merchant.spellbuy.cart.entity.vo;

public class ProductCartDetailVo {
	
	private Long spellbuyProductId;
	private Long productId;
	private Double productPrice;
	private Double singlePrice;
	private Integer productLimit;
	private Integer productStyle;
	private Integer currentBuyCount;
	private Integer productPeriod;
	private Integer buyLimit;
	private Integer buyCount;
	private Integer buyMoney;
	private String merchantNo;

	
	public String getMerchantNo() {
		return merchantNo;
	}
	public void setMerchantNo(String merchantNo) {
		this.merchantNo = merchantNo;
	}
	public Long getProductId() {
		return productId;
	}
	public void setProductId(Long productId) {
		this.productId = productId;
	}
	public Long getSpellbuyProductId() {
		return spellbuyProductId;
	}
	public void setSpellbuyProductId(Long spellbuyProductId) {
		this.spellbuyProductId = spellbuyProductId;
	}
	public Double getProductPrice() {
		return productPrice;
	}
	public void setProductPrice(Double productPrice) {
		this.productPrice = productPrice;
	}
	public Double getSinglePrice() {
		return singlePrice;
	}
	public void setSinglePrice(Double singlePrice) {
		this.singlePrice = singlePrice;
	}
	public Integer getProductLimit() {
		return productLimit;
	}
	public void setProductLimit(Integer productLimit) {
		this.productLimit = productLimit;
	}
	public Integer getProductStyle() {
		return productStyle;
	}
	public void setProductStyle(Integer productStyle) {
		this.productStyle = productStyle;
	}
	public Integer getCurrentBuyCount() {
		return currentBuyCount;
	}
	public void setCurrentBuyCount(Integer currentBuyCount) {
		this.currentBuyCount = currentBuyCount;
	}
	public Integer getProductPeriod() {
		return productPeriod;
	}
	public void setProductPeriod(Integer productPeriod) {
		this.productPeriod = productPeriod;
	}
	public Integer getBuyLimit() {
		return buyLimit;
	}
	public void setBuyLimit(Integer buyLimit) {
		this.buyLimit = buyLimit;
	}
	public Integer getBuyCount() {
		return buyCount;
	}
	public void setBuyCount(Integer buyCount) {
		this.buyCount = buyCount;
	}
	public Integer getBuyMoney() {
		return buyMoney;
	}
	public void setBuyMoney(Integer buyMoney) {
		this.buyMoney = buyMoney;
	}
	
	
}
