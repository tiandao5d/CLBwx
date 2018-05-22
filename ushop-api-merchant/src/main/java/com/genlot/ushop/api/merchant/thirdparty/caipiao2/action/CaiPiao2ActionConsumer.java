//package com.genlot.ushop.api.merchant.thirdparty.caipiao2.action;
//
//import java.util.HashMap;
//import java.util.Map;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.ApplicationEvent;
//import org.springframework.context.ApplicationListener;
//import org.springframework.scheduling.annotation.Async;
//
//import com.alibaba.fastjson.JSON;
//import com.genlot.common.core.mq.BaseMQConsumerImpl;
//import com.genlot.common.core.mq.DataMessage;
//import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
//import com.genlot.ucenter.facade.account.service.AccountTransferFacade;
//import com.genlot.ucenter.facade.account.entity.AccountFundType;
//import com.genlot.ucenter.facade.account.entity.AccountTransferOrder;
//import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
//import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
//import com.genlot.uplatform.facade.frontend.hotline.caipiao2.service.CaiPiao2Facade;
//import com.genlot.ushop.api.merchant.thirdparty.caipiao2.action.entity.CaiPiao2TransferAction;
//
//
//@Async
//public class CaiPiao2ActionConsumer implements  ApplicationListener{
//
//	private static final Logger log = LoggerFactory.getLogger(CaiPiao2ActionConsumer.class);
//	
//	@Autowired
//	private CaiPiao2Facade caiPiao2Facade;
//	
//	@Autowired
//	private AccountTransferFacade accountTransferFacade;
//	
//	@Autowired
//	private AccountFundTypeFacade accountFundTypeFacade;
//	
//	@Override
//	public void onApplicationEvent(ApplicationEvent action)
//	{
//		if(action instanceof CaiPiao2TransferAction)
//		{
//			onActionTransfer((CaiPiao2TransferAction) action);
//		}
//	}
//	
//	private void onActionTransfer(CaiPiao2TransferAction action)
//	{
//		try
//		{
//			AccountTransferOrder order = accountTransferFacade.getByTrxNo(action.getTrxNo());
//			
//			if (order.getTrxType().equals(AccountTradeTypeEnum.ACCOUNT_DEPOSIT.getValue())) {
//				
//				AccountFundType fundType = accountFundTypeFacade.getById(order.getSourceFund().longValue());
//				
//				accountTransferFacade.transferIn(action.getTrxNo());
//				
//				caiPiao2Facade.withdraw(
//						action.getTrxNo(),
//						order.getSourceAgentUserNo(), 
//						order.getAmount(), 
//						Integer.parseInt(fundType.getParentId()), 
//						fundType.getProvinceId(), 
//						fundType.getPlatformId(), 
//						order.getUrl());
//			}
//			else if (order.getTrxType().equals(AccountTradeTypeEnum.ATM.getValue())) {
//				
//				AccountFundType fundType = accountFundTypeFacade.getById(order.getTargetFund().longValue());
//				
//				accountTransferFacade.transferOut(action.getTrxNo());
//				
//				caiPiao2Facade.deposit(
//						action.getTrxNo(), 
//						order.getTargetAgentUserNo(),
//						fundType.getProvinceId(), 
//						fundType.getPlatformId(), 
//						order.getAmount(), 
//						Integer.parseInt(fundType.getParentId()), 
//						order.getUrl());
//				
//			}
//			else if (order.getTrxType().equals(AccountTradeTypeEnum.ACCOUNT_TRANSFER.getValue())) {
//				
//				AccountFundType targetFundType = accountFundTypeFacade.getById(order.getTargetFund().longValue());
//				AccountFundType sourceFundType = accountFundTypeFacade.getById(order.getSourceFund().longValue());
//				
//				caiPiao2Facade.exchange(
//						action.getTrxNo(), 
//						order.getTargetAgentUserNo(),
//						Integer.parseInt(sourceFundType.getParentId()),
//						Integer.parseInt(targetFundType.getParentId()), 
//						order.getAmount(),
//						order.getRate(),
//						targetFundType.getProvinceId(), 
//						targetFundType.getPlatformId(), 
//						order.getUrl());
//			}
//		}
//		catch (Exception e)
//		{
//			log.error("Transfer error:" + action.getTrxNo());
//			log.error(e.toString());
//		}
//	}
//}
