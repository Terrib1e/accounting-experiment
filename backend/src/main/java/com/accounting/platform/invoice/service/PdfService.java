package com.accounting.platform.invoice.service;

import com.accounting.platform.invoice.entity.Invoice;
import com.accounting.platform.invoice.entity.InvoiceLine;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            document.add(new Paragraph("INVOICE")
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(20)
                    .setBold());

            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth();

            // Company Info (Placeholder)
            headerTable.addCell(new Cell().add(new Paragraph("My Company Name\n123 Business Rd.\nCity, State 12345"))
                    .setBorder(Border.NO_BORDER));

            // Invoice Info
            String invoiceInfo = String.format("Invoice #: %s\nDate: %s\nDue Date: %s",
                    invoice.getInvoiceNumber(),
                    invoice.getIssueDate().format(DATE_FORMATTER),
                    invoice.getDueDate().format(DATE_FORMATTER));

            headerTable.addCell(new Cell().add(new Paragraph(invoiceInfo))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(Border.NO_BORDER));

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // Bill To
            document.add(new Paragraph("Bill To:").setBold());
            if (invoice.getContact() != null) {
                document.add(new Paragraph(invoice.getContact().getName()));
                // Add address if available in Contact entity
            }
            document.add(new Paragraph("\n"));

            // Lines Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 1, 1, 1, 1}))
                    .useAllAvailableWidth();

            // Table Header
            table.addHeaderCell(new Cell().add(new Paragraph("Description")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Qty")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Price")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Tax")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Amount")).setBackgroundColor(ColorConstants.LIGHT_GRAY));

            // Rows
            for (InvoiceLine line : invoice.getLines()) {
                table.addCell(new Paragraph(line.getDescription()));
                table.addCell(new Paragraph(line.getQuantity().toString()).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Paragraph(line.getUnitPrice().toString()).setTextAlignment(TextAlignment.RIGHT));

                BigDecimal tax = line.getTaxAmount() != null ? line.getTaxAmount() : BigDecimal.ZERO;
                table.addCell(new Paragraph(tax.toString()).setTextAlignment(TextAlignment.RIGHT));

                table.addCell(new Paragraph(line.getAmount().add(tax).toString()).setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(table);

            // Totals
            document.add(new Paragraph("\n"));
            Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{4, 1}))
                    .useAllAvailableWidth(); // Actually allow it to align right

            totalsTable.addCell(new Cell().add(new Paragraph("Total:")).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).setBold());
            totalsTable.addCell(new Cell().add(new Paragraph(invoice.getTotalAmount() != null ? invoice.getTotalAmount().toString() : "0.00"))
                    .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).setBold());

            document.add(totalsTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return out.toByteArray();
    }
}
