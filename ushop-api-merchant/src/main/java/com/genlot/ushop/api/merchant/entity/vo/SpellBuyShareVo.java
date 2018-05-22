package com.genlot.ushop.api.merchant.entity.vo;

import org.springframework.web.bind.annotation.PathVariable;

public class SpellBuyShareVo {
	
	private Long spellbuyId;
	private String title;
	private String content;
	private String score;
	private String files;
	
	public String getScore() {
		return score;
	}
	public void setScore(String score) {
		this.score = score;
	}
	public String getFiles() {
		return files;
	}
	public void setFiles(String files) {
		this.files = files;
	}
	public Long getSpellbuyId() {
		return spellbuyId;
	}
	public void setSpellbuyId(Long spellbuyId) {
		this.spellbuyId = spellbuyId;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}	
}
