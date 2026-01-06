package com.accounting.platform.common.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    // TODO: Inject EncryptionService here when implemented
    // For now, identity transformation to allow compilation

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        // TODO: Encrypt
        return attribute;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // TODO: Decrypt
        return dbData;
    }
}
