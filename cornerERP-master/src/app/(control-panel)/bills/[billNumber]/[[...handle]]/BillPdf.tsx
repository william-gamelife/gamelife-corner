import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const addFooters = (doc: jsPDF) => {
	const pageCount = doc.getNumberOfPages(); // 獲取實際頁數
	doc.setFontSize(8);

	// 為每頁添加頁腳
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.text(
			`─ 如果可以，讓我們一起探索世界的每個⾓落 ─`,
			doc.internal.pageSize.getWidth() / 2,
			doc.internal.pageSize.getHeight() - 10, // 靠近底部
			{ align: 'center' }
		);
		doc.text(
			`${i} / ${pageCount}`, // 動態頁碼
			doc.internal.pageSize.getWidth() - 18,
			doc.internal.pageSize.getHeight() - 10,
			{ align: 'center' }
		);
	}
};

const handleCreatePDF = async (billNumber: string, billDate: string) => {
	const pdf = new jsPDF('l', 'mm', [208, 295]);

	// 設定字體
	pdf.addFont('/assets/fonts/ChironHeiHK-N.ttf', 'ChironHeiHK', 'normal');
	pdf.addFont('/assets/fonts/ChironHeiHK-B.ttf', 'ChironHeiHK', 'bold');
	pdf.setFont('ChironHeiHK');

	// 添加表頭
	pdf.setFontSize(14);
	pdf.text(`出納單號 ${billNumber}`, 15, 15);
	pdf.setFontSize(12);
	pdf.text(`出帳日期: ${billDate}`, 15, 22);

	// 添加表格
	autoTable(pdf, {
		html: '#pdfTable',
		styles: {
			fillColor: [255, 255, 255],
			font: 'ChironHeiHK',
			textColor: [0, 0, 0],
			valign: 'middle',
			lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 },
			cellPadding: { top: 5, right: 2, bottom: 5, left: 2 }
		},
		theme: 'grid',
		startY: 25,
		columnStyles: {
			0: { halign: 'left', minCellWidth: 20 },
			1: { halign: 'left', minCellWidth: 30 },
			2: { halign: 'left', minCellWidth: 20 },
			3: { halign: 'left', minCellWidth: 30 },
			4: { halign: 'left' },
			5: { halign: 'right', minCellWidth: 20 },
			6: { halign: 'right', minCellWidth: 20 }
		},
		footStyles: {
			fontSize: 14,
			textColor: [106, 114, 128],
			halign: 'right',
			lineWidth: { top: 0.1, right: 0, bottom: 0, left: 0 }
		},
		didParseCell: (data) => {
			// 動態調整對齊方式
			data.table.head.forEach((head) => {
				head.cells[5].styles.halign = 'right';
				head.cells[6].styles.halign = 'right';
			});
			data.table.foot.forEach((footRow) => {
				footRow.cells[0].styles.halign = 'left';
			});
		},
		showFoot: 'lastPage'
	});

	// 添加頁腳
	addFooters(pdf);

	// 保存 PDF
	pdf.save(`${billNumber}.pdf`);
};

export default handleCreatePDF;
