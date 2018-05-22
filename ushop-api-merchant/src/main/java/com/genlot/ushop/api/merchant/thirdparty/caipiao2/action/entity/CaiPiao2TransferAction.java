package com.genlot.ushop.api.merchant.thirdparty.caipiao2.action.entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationEvent;


public class CaiPiao2TransferAction extends ApplicationEvent{

	private String trxNo;
	
	public CaiPiao2TransferAction(Object source) {
		super(source);
		// TODO Auto-generated constructor stub
	}

	public String getTrxNo() {
		return trxNo;
	}

	public void setTrxNo(String trxNo) {
		this.trxNo = trxNo;
	}
}
