import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// 擴展 jsPDF 類型以包含 lastAutoTable
interface jsPDFWithAutoTable extends jsPDF {
	lastAutoTable: {
		finalY: number;
	};
}
const addFooters = (doc: jsPDF) => {
	const pageCount = doc.internal.pages.length;

	doc.setFontSize(8);
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.text(`─ 如果可以，讓我們一起探索世界的每個⾓落 ─`, doc.internal.pageSize.width / 2, 200, {
			align: 'center'
		});
		doc.text(`${i} / ${pageCount}`, doc.internal.pageSize.width - 18, 200, {
			align: 'center'
		});
	}
};
const handleCreatePDF = async (groupCode: string, groupName: string) => {
	const pdf = new jsPDF('l', 'mm', [208, 295]);
	pdf.addFont('/assets/fonts/ChironHeiHK-N.ttf', 'ChironHeiHK', 'normal');
	pdf.addFont('/assets/fonts/ChironHeiHK-B.ttf', 'ChironHeiHK', 'bold');
	pdf.setFont('ChironHeiHK');
	pdf.setFontSize(10);
	pdf.text(`${groupCode} - ${groupName}`, 15, 15);

	// 取得所有在 #totalReport 底下的 Paper 元素（每個包含標題和表格）
	const sections = document.querySelectorAll('#totalReport > div');
	let currentY = 25; // 初始 Y 位置

	// 迭代每個 section 並加入標題和表格到 PDF
	sections.forEach((section) => {
		// 找出標題（Typography h6 元素）
		const titleElement = section.querySelector('h6');
		const title = titleElement?.textContent || '';

		// 找出表格
		const table = section.querySelector('table');

		if (table && title) {
			// 先加入標題
			pdf.setFontSize(12);
			pdf.setFont('ChironHeiHK', 'bold');
			pdf.text(title, 15, currentY);
			currentY += 8; // 標題後的間距

			// 切換回正常字體
			pdf.setFont('ChironHeiHK', 'normal');
			pdf.setFontSize(10);

			// 再加入表格
			autoTable(pdf, {
				html: table as HTMLTableElement,
				styles: {
					fillColor: [255, 255, 255],
					font: 'ChironHeiHK',
					textColor: [0, 0, 0],
					valign: 'middle',
					lineWidth: { top: 0.1, right: 0, bottom: 0.1, left: 0 },
					cellPadding: { top: 5, right: 2, bottom: 5, left: 2 }
				},
				theme: 'grid',
				startY: currentY,
				columnStyles: {},
				headStyles: {
					halign: 'center',
					lineWidth: { top: 0, right: 0, bottom: 0.1, left: 0 }
				},
				footStyles: {
					fontSize: 14,
					textColor: [106, 114, 128],
					halign: 'right',
					lineWidth: { top: 0.1, right: 0, bottom: 0, left: 0 }
				},
				didParseCell: (data) => {
					// 取得該表格的總欄數
					const columnCount = data.table.columns.length;

					// 排除表頭和表尾的特殊處理
					if (data.section === 'body') {
						// 如果是最後一欄，設為右對齊（通常是金額）
						if (data.column.index === columnCount - 1) {
							data.cell.styles.halign = 'right';
						} else {
							// 其他欄位設為置中對齊
							data.cell.styles.halign = 'center';
						}
					}
				},
				showFoot: 'lastPage'
			});

			// 更新下一個表格的起始位置，加上 15mm 間距（給下一個標題更多空間）
			currentY = (pdf as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
		}
	});

	addFooters(pdf);
	pdf.save(`${groupCode}-${groupName}結帳明細.pdf`);
};
export default handleCreatePDF;
