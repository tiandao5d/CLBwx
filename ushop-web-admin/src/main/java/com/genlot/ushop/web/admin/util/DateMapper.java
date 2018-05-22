//package com.genlot.ushop.web.admin.util;
//
//import java.io.IOException;
//import java.text.SimpleDateFormat;
//import java.util.Date;
//
//import javax.annotation.PostConstruct;
//
//import org.codehaus.jackson.JsonGenerator;
//import org.codehaus.jackson.JsonProcessingException;
//import org.codehaus.jackson.map.JsonSerializer;
//import org.codehaus.jackson.map.ObjectMapper;
//import org.codehaus.jackson.map.SerializationConfig;
//import org.codehaus.jackson.map.SerializerProvider;
//import org.codehaus.jackson.map.ser.CustomSerializerFactory;
//
//public class DateMapper extends ObjectMapper {
//	private String mask = "yyyy-MM-dd HH:mm:ss";
//
//	@PostConstruct
//	public void afterPropertiesSet() throws Exception {
//		CustomSerializerFactory factory = new CustomSerializerFactory();  
//        factory.addGenericMapping(Date.class, new JsonSerializer<Date>(){  
//            @Override  
//            public void serialize(Date value,   
//                    JsonGenerator jsonGenerator,   
//                    SerializerProvider provider)  
//                    throws IOException, JsonProcessingException {  
//                SimpleDateFormat sdf = new SimpleDateFormat(mask);  
//                jsonGenerator.writeString(sdf.format(value));  
//            }  
//        }); 
//        this.setSerializerFactory(factory);  
//	}
//
//	public void setMask(String mask) {
//		this.mask = mask;
//	}
//}
