package com.accounting.platform.report.service;

import com.accounting.platform.report.dto.FinancialReportDto;
import com.accounting.platform.report.dto.ReportLineDto;
import com.accounting.platform.report.dto.AgingReportDto;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ReportExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(Locale.US);
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(51, 65, 85); // slate-700
    private static final DeviceRgb SECTION_COLOR = new DeviceRgb(241, 245, 249); // slate-100

    // ==================== PDF EXPORT ====================

    public byte[] exportFinancialReportToPdf(FinancialReportDto report) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph(report.getReportName())
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5));

            // Date line
            String dateStr;
            if (report.getStartDate() != null) {
                dateStr = "Period: " + report.getStartDate().format(DATE_FORMATTER) +
                         " to " + report.getEndDate().format(DATE_FORMATTER);
            } else {
                dateStr = "As of " + report.getEndDate().format(DATE_FORMATTER);
            }
            document.add(new Paragraph(dateStr)
                    .setFontSize(11)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Sections
            for (Map.Entry<String, List<ReportLineDto>> section : report.getSections().entrySet()) {
                // Section header
                document.add(new Paragraph(section.getKey().toUpperCase())
                        .setFontSize(12)
                        .setBold()
                        .setBackgroundColor(SECTION_COLOR)
                        .setPadding(8)
                        .setMarginTop(15)
                        .setMarginBottom(5));

                // Lines table
                Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1}))
                        .useAllAvailableWidth();

                for (ReportLineDto line : section.getValue()) {
                    table.addCell(new Cell().add(new Paragraph(line.getAccountName()))
                            .setBorder(Border.NO_BORDER)
                            .setPaddingLeft(20));
                    table.addCell(new Cell().add(new Paragraph(line.getAccountCode() != null ? line.getAccountCode() : ""))
                            .setBorder(Border.NO_BORDER)
                            .setTextAlignment(TextAlignment.CENTER));
                    table.addCell(new Cell().add(new Paragraph(formatCurrency(line.getBalance())))
                            .setBorder(Border.NO_BORDER)
                            .setTextAlignment(TextAlignment.RIGHT));
                }

                document.add(table);

                // Section total
                BigDecimal sectionTotal = section.getValue().stream()
                        .map(ReportLineDto::getBalance)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                document.add(new Paragraph("Total " + section.getKey() + ": " + formatCurrency(sectionTotal))
                        .setBold()
                        .setTextAlignment(TextAlignment.RIGHT)
                        .setMarginTop(5));
            }

            // Summary
            document.add(new Paragraph("\n"));
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth();

            for (Map.Entry<String, BigDecimal> entry : report.getSummary().entrySet()) {
                summaryTable.addCell(new Cell().add(new Paragraph(entry.getKey()))
                        .setBold()
                        .setBorder(Border.NO_BORDER));
                summaryTable.addCell(new Cell().add(new Paragraph(formatCurrency(entry.getValue())))
                        .setBold()
                        .setBorder(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(summaryTable);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] exportAgingReportToPdf(AgingReportDto report) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            String title = report.reportType().equals("RECEIVABLES") ?
                    "Accounts Receivable Aging" : "Accounts Payable Aging";
            document.add(new Paragraph(title)
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5));

            document.add(new Paragraph("As of " + report.reportDate().format(DATE_FORMATTER))
                    .setFontSize(11)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Summary
            document.add(new Paragraph("Total Outstanding: " + formatCurrency(report.totalOutstanding()))
                    .setFontSize(14)
                    .setBold()
                    .setMarginBottom(15));

            // Bucket summary table
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{2, 1, 1}))
                    .useAllAvailableWidth();

            summaryTable.addHeaderCell(createHeaderCell("Bucket"));
            summaryTable.addHeaderCell(createHeaderCell("Count"));
            summaryTable.addHeaderCell(createHeaderCell("Amount"));

            for (AgingReportDto.AgingBucketDto bucket : report.buckets()) {
                summaryTable.addCell(new Cell().add(new Paragraph(bucket.label())));
                summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(bucket.count())))
                        .setTextAlignment(TextAlignment.CENTER));
                summaryTable.addCell(new Cell().add(new Paragraph(formatCurrency(bucket.amount())))
                        .setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(summaryTable);
            document.add(new Paragraph("\n"));

            // Detailed breakdown by bucket
            for (AgingReportDto.AgingBucketDto bucket : report.buckets()) {
                if (bucket.details().isEmpty()) continue;

                document.add(new Paragraph(bucket.label())
                        .setFontSize(12)
                        .setBold()
                        .setBackgroundColor(SECTION_COLOR)
                        .setPadding(8)
                        .setMarginTop(10));

                Table detailTable = new Table(UnitValue.createPercentArray(new float[]{2, 1.5f, 1, 1, 0.5f, 1}))
                        .useAllAvailableWidth();

                String contactHeader = report.reportType().equals("RECEIVABLES") ? "Customer" : "Vendor";
                detailTable.addHeaderCell(createHeaderCell(contactHeader));
                detailTable.addHeaderCell(createHeaderCell("Document"));
                detailTable.addHeaderCell(createHeaderCell("Date"));
                detailTable.addHeaderCell(createHeaderCell("Due Date"));
                detailTable.addHeaderCell(createHeaderCell("Days"));
                detailTable.addHeaderCell(createHeaderCell("Amount"));

                for (AgingReportDto.AgingLineDto line : bucket.details()) {
                    detailTable.addCell(new Cell().add(new Paragraph(line.contactName())));
                    detailTable.addCell(new Cell().add(new Paragraph(line.documentNumber())));
                    detailTable.addCell(new Cell().add(new Paragraph(line.documentDate().format(DATE_FORMATTER))));
                    detailTable.addCell(new Cell().add(new Paragraph(line.dueDate().format(DATE_FORMATTER))));
                    detailTable.addCell(new Cell().add(new Paragraph(String.valueOf(line.daysOverdue())))
                            .setTextAlignment(TextAlignment.CENTER));
                    detailTable.addCell(new Cell().add(new Paragraph(formatCurrency(line.amount())))
                            .setTextAlignment(TextAlignment.RIGHT));
                }

                document.add(detailTable);
            }

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return out.toByteArray();
    }

    // ==================== EXCEL EXPORT ====================

    public byte[] exportFinancialReportToExcel(FinancialReportDto report) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(report.getReportName());

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle boldStyle = createBoldStyle(workbook);
            CellStyle sectionStyle = createSectionStyle(workbook);

            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(report.getReportName());
            titleCell.setCellStyle(boldStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

            // Date
            Row dateRow = sheet.createRow(rowNum++);
            String dateStr = report.getStartDate() != null ?
                    "Period: " + report.getStartDate() + " to " + report.getEndDate() :
                    "As of " + report.getEndDate();
            dateRow.createCell(0).setCellValue(dateStr);
            rowNum++; // blank row

            // Sections
            for (Map.Entry<String, List<ReportLineDto>> section : report.getSections().entrySet()) {
                Row sectionRow = sheet.createRow(rowNum++);
                org.apache.poi.ss.usermodel.Cell sectionCell = sectionRow.createCell(0);
                sectionCell.setCellValue(section.getKey().toUpperCase());
                sectionCell.setCellStyle(sectionStyle);

                for (ReportLineDto line : section.getValue()) {
                    Row lineRow = sheet.createRow(rowNum++);
                    lineRow.createCell(0).setCellValue("    " + line.getAccountName());
                    lineRow.createCell(1).setCellValue(line.getAccountCode() != null ? line.getAccountCode() : "");
                    org.apache.poi.ss.usermodel.Cell amountCell = lineRow.createCell(2);
                    amountCell.setCellValue(line.getBalance().doubleValue());
                    amountCell.setCellStyle(currencyStyle);
                }

                // Section total
                BigDecimal total = section.getValue().stream()
                        .map(ReportLineDto::getBalance)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                Row totalRow = sheet.createRow(rowNum++);
                org.apache.poi.ss.usermodel.Cell totalLabel = totalRow.createCell(0);
                totalLabel.setCellValue("Total " + section.getKey());
                totalLabel.setCellStyle(boldStyle);
                org.apache.poi.ss.usermodel.Cell totalAmount = totalRow.createCell(2);
                totalAmount.setCellValue(total.doubleValue());
                totalAmount.setCellStyle(currencyStyle);

                rowNum++; // blank row
            }

            // Summary
            for (Map.Entry<String, BigDecimal> entry : report.getSummary().entrySet()) {
                Row summaryRow = sheet.createRow(rowNum++);
                org.apache.poi.ss.usermodel.Cell labelCell = summaryRow.createCell(0);
                labelCell.setCellValue(entry.getKey());
                labelCell.setCellStyle(boldStyle);
                org.apache.poi.ss.usermodel.Cell valueCell = summaryRow.createCell(2);
                valueCell.setCellValue(entry.getValue().doubleValue());
                valueCell.setCellStyle(currencyStyle);
            }

            // Auto-size columns
            sheet.setColumnWidth(0, 8000);
            sheet.setColumnWidth(1, 3000);
            sheet.setColumnWidth(2, 4000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportAgingReportToExcel(AgingReportDto report) {
        try (Workbook workbook = new XSSFWorkbook()) {
            String sheetName = report.reportType().equals("RECEIVABLES") ? "AR Aging" : "AP Aging";
            Sheet sheet = workbook.createSheet(sheetName);

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle boldStyle = createBoldStyle(workbook);

            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue(
                report.reportType().equals("RECEIVABLES") ? "Accounts Receivable Aging" : "Accounts Payable Aging");
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            Row dateRow = sheet.createRow(rowNum++);
            dateRow.createCell(0).setCellValue("As of " + report.reportDate());
            rowNum++;

            // Summary header
            Row summaryHeader = sheet.createRow(rowNum++);
            summaryHeader.createCell(0).setCellValue("Bucket");
            summaryHeader.createCell(1).setCellValue("Count");
            summaryHeader.createCell(2).setCellValue("Amount");
            for (int i = 0; i < 3; i++) {
                summaryHeader.getCell(i).setCellStyle(headerStyle);
            }

            // Bucket summary
            for (AgingReportDto.AgingBucketDto bucket : report.buckets()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(bucket.label());
                row.createCell(1).setCellValue(bucket.count());
                org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(2);
                amountCell.setCellValue(bucket.amount().doubleValue());
                amountCell.setCellStyle(currencyStyle);
            }

            // Total row
            Row totalRow = sheet.createRow(rowNum++);
            org.apache.poi.ss.usermodel.Cell totalLabel = totalRow.createCell(0);
            totalLabel.setCellValue("TOTAL");
            totalLabel.setCellStyle(boldStyle);
            totalRow.createCell(1).setCellValue(report.totalCount());
            org.apache.poi.ss.usermodel.Cell totalAmount = totalRow.createCell(2);
            totalAmount.setCellValue(report.totalOutstanding().doubleValue());
            totalAmount.setCellStyle(currencyStyle);

            rowNum += 2;

            // Detailed breakdown
            String contactHeader = report.reportType().equals("RECEIVABLES") ? "Customer" : "Vendor";
            Row detailHeader = sheet.createRow(rowNum++);
            String[] headers = {contactHeader, "Document", "Date", "Due Date", "Days", "Amount"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = detailHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            for (AgingReportDto.AgingBucketDto bucket : report.buckets()) {
                for (AgingReportDto.AgingLineDto line : bucket.details()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(line.contactName());
                    row.createCell(1).setCellValue(line.documentNumber());
                    row.createCell(2).setCellValue(line.documentDate().toString());
                    row.createCell(3).setCellValue(line.dueDate().toString());
                    row.createCell(4).setCellValue(line.daysOverdue());
                    org.apache.poi.ss.usermodel.Cell amountCell = row.createCell(5);
                    amountCell.setCellValue(line.amount().doubleValue());
                    amountCell.setCellStyle(currencyStyle);
                }
            }

            // Auto-size columns
            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    // ==================== HELPERS ====================

    private String formatCurrency(BigDecimal amount) {
        return CURRENCY_FORMAT.format(amount);
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setBackgroundColor(new DeviceRgb(51, 65, 85))
                .setFontColor(ColorConstants.WHITE)
                .setBold();
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle createBoldStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createSectionStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}
