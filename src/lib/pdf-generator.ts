
"use client";

import { PhishingUrlDetectorOutput } from "@/ai/flows/phishing-url-detector";
import jsPDF from "jspdf";

type HistoryItem = {
    id: string;
    url: string;
    apiKey: string;
    result: PhishingUrlDetectorOutput;
};

// Helper function to add a footer to each page
const addFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    const docHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, docHeight - 15, { align: 'center' });
        doc.text(`Report generated on ${new Date().toLocaleString()}`, margin, docHeight - 15);
    }
};

// Helper to add the header to a page
const addHeader = (doc: jsPDF) => {
    const docWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(232, 234, 246); // Light blue background
    doc.rect(0, 0, docWidth, 60, 'F');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(63, 81, 181); // Primary color
    doc.text("PhishHunter API Report", docWidth / 2, 35, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Muted foreground
    doc.text("Phishing URL Detection Service", docWidth / 2, 48, { align: 'center' });
    return 75; // Starting Y position for content
};

const addReportContent = (doc: jsPDF, item: HistoryItem, startY: number) => {
    const { result, url, apiKey } = item;
    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = docWidth - margin * 2;
    let y = startY;

    const checkPageBreak = (requiredHeight: number) => {
        if (y + requiredHeight > docHeight - 40) { // Increased bottom margin
            doc.addPage();
            y = addHeader(doc);
        }
    };

    const addSection = (title: string, content: {key: string, value?: string}[]) => {
        const titleHeight = 12;
        const sectionHeaderHeight = titleHeight + 25; // Header + padding
        
        // Calculate the total height of the content to see if it needs a page break before the header
        let contentHeight = 0;
        content.forEach(item => {
            const keyColWidth = 100;
            const valueColWidth = contentWidth - keyColWidth;
            const keyLines = doc.splitTextToSize(item.key, keyColWidth - 10);
            const valueLines = doc.splitTextToSize(item.value || 'N/A', valueColWidth - 10);
            contentHeight += Math.max(keyLines.length, valueLines.length) * 12 + 8;
        });

        // Check if the header and at least one row can fit, otherwise break
        checkPageBreak(sectionHeaderHeight + 40); // 40 is a rough estimate for one line of content

        // Section Title Header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(63, 81, 181); // Primary color
        doc.roundedRect(margin, y, contentWidth, titleHeight + 10, 3, 3, 'F');
        doc.text(title, margin + 5, y + titleHeight);
        y += titleHeight + 15;

        const tableStartY = y;
        // Table Content
        content.forEach((item, index) => {
            const keyText = item.key;
            const valueText = item.value || 'N/A';
            const keyColWidth = 100;
            const valueColWidth = contentWidth - keyColWidth;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const keyLines = doc.splitTextToSize(keyText, keyColWidth - 10);
            
            doc.setFont('helvetica', 'normal');
            const valueLines = doc.splitTextToSize(valueText, valueColWidth - 10);
            
            const itemHeight = Math.max(keyLines.length, valueLines.length) * 12 + 8; // Row padding
            
            checkPageBreak(itemHeight);

            // Zebra striping
            if (index % 2 === 0) {
                doc.setFillColor(243, 244, 246); // A slightly more visible grey
            } else {
                doc.setFillColor(255, 255, 255); // white
            }
            doc.rect(margin, y, contentWidth, itemHeight, 'F');
            
            // Draw text
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text(keyLines, margin + 5, y + itemHeight / 2, { baseline: 'middle', maxWidth: keyColWidth - 10 });
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(valueLines, margin + keyColWidth + 5, y + itemHeight / 2, { baseline: 'middle', maxWidth: valueColWidth - 10 });

            y += itemHeight;
        });

        // Table border
        doc.setDrawColor(200, 200, 200); // Lighter grey for inner lines
        const initialY = tableStartY;
        
        let currentY = initialY;
        // Draw horizontal lines for each row
        content.forEach(item => {
             const keyColWidth = 100;
             const valueColWidth = contentWidth - keyColWidth;
             const keyLines = doc.splitTextToSize(item.key, keyColWidth-10);
             const valueLines = doc.splitTextToSize(item.value || 'N/A', valueColWidth-10);
             const itemHeight = Math.max(keyLines.length, valueLines.length) * 12 + 8;
             doc.line(margin, currentY + itemHeight, margin + contentWidth, currentY + itemHeight);
             currentY += itemHeight;
        });

        // Draw vertical separator line
        doc.line(margin + 100, initialY, margin + 100, y);
        
        // Draw outer border
        doc.setDrawColor(150, 150, 150); // Darker grey for outer border
        doc.rect(margin, initialY, contentWidth, y - initialY);

        y += 15; // Padding after the section
    };

    const predictionColor = result.prediction === 'phishing' ? [220, 53, 69] : [25, 135, 84];
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(predictionColor[0], predictionColor[1], predictionColor[2]);
    const predictionText = `Prediction: ${result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}`;
    checkPageBreak(20);
    doc.text(predictionText, margin, y);
    y += 20;

    addSection("Analysis Summary", [
        { key: "URL Analyzed", value: url },
        { key: "API Key Used", value: `${apiKey.substring(0,4)}...` },
        { key: "Confidence Score", value: `${(result.confidenceScore * 100).toFixed(0)}%` },
        { key: "Overall Assessment", value: result.overallAssessment },
    ]);

    addSection("Threat Categorization", [
        { key: "Category", value: result.threatCategorization.category },
        { key: "Description", value: result.threatCategorization.description },
    ]);
    
    addSection("Detailed URL Analysis", [
        { key: "Domain Analysis", value: result.detailedAnalysis.domainAnalysis },
        { key: "Subdomain Analysis", value: result.detailedAnalysis.subdomainAnalysis },
        { key: "Path Analysis", value: result.detailedAnalysis.pathAnalysis },
        { key: "Character Analysis", value: result.detailedAnalysis.characterAnalysis },
    ]);

    addSection("Security Checklist", [
        { key: "Uses HTTPS", value: `${result.securityChecklist.usesHttps.value ? 'Yes' : 'No'}. ${result.securityChecklist.usesHttps.assessment}` },
        { key: "Valid SSL Certificate", value: `${result.securityChecklist.sslCertificate.valid ? 'Yes' : 'No'}. ${result.securityChecklist.sslCertificate.assessment}` },
        { key: "Domain Reputation", value: `${result.securityChecklist.domainReputation.status.charAt(0).toUpperCase() + result.securityChecklist.domainReputation.status.slice(1)}. ${result.securityChecklist.domainReputation.assessment}` },
    ]);

    addSection("Actionable Recommendations", [
        { key: "Recommended Action", value: result.actionableRecommendations.userAction },
        { key: "Security Tip", value: result.actionableRecommendations.securityTip },
    ]);
    
    return y;
};

export const generatePdf = (result: PhishingUrlDetectorOutput, url: string, apiKey: string) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
    const singleHistoryItem: HistoryItem = { id: '', result, url, apiKey };
    
    const startY = addHeader(doc);
    addReportContent(doc, singleHistoryItem, startY);
    addFooter(doc);

    doc.save(`phishhunter-report-${url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

export const generateBulkPdf = (historyItems: HistoryItem[]) => {
    if (historyItems.length === 0) {
        alert("No history to download.");
        return;
    }
    
    const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
    let y = 0;

    historyItems.forEach((item, index) => {
        y = addHeader(doc);
        y = addReportContent(doc, item, y);

        if (index < historyItems.length - 1) {
            doc.addPage();
        }
    });

    addFooter(doc);
    doc.save(`phishhunter-history-report.pdf`);
};
