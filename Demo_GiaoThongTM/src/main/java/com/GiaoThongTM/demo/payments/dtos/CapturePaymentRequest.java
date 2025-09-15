package com.GiaoThongTM.demo.payments.dtos;

import lombok.Data;

@Data
public class CapturePaymentRequest {
    private String providerTxnId;  
}
