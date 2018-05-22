package com.genlot.ushop.api.merchant.entity.vo;

import java.io.Serializable;

public class UploadFileVo implements Serializable{
	
	private String name;
	private String content;
	private Integer thumb;
	private byte[] bytes;
	
	public byte[] getBytes() {
		return bytes;
	}
	public void setBytes(byte[] bytes) {
		this.bytes = bytes;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public Integer getThumb() {
		return thumb;
	}
	public void setThumb(Integer thumb) {
		this.thumb = thumb;
	}
	
	
	
}