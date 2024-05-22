const uploadFileHandler = () => {
  const formData = new FormData();
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file.');
    return;
  }

  formData.append('csvFile', file);

  fetch('/process_csv', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.error) {
        alert(data.error);

        return;
      }

      const { password_complexities } = data;

      const fileContainer = document.getElementById('file-info-container');
      fileContainer.innerHTML = '';

      const fileCard = document.createElement('div');
      fileCard.classList.add('file-card');

      password_complexities.forEach((password, index) => {
        const divElement = document.createElement('div');
        const labelSpan = document.createElement('div');
        const valueSpan = document.createElement('div');
        const complexitySpan = document.createElement('div');

        divElement.classList.add('file-password-wrapper');

        labelSpan.classList.add('file-password-label');
        labelSpan.textContent = `${index + 1}- ${password[0]}: `;

        valueSpan.classList.add('file-password-value');
        valueSpan.textContent = password[1];

        complexitySpan.classList.add('file-password-complexity');
        complexitySpan.textContent = password[2];

        divElement.appendChild(labelSpan);
        divElement.appendChild(valueSpan);
        divElement.appendChild(complexitySpan);

        fileCard.appendChild(divElement);
      });

      fileContainer.appendChild(fileCard);

      // Add buttons for downloading as PDF or CSV
      const downloadPdfButton = document.createElement('button');
      downloadPdfButton.textContent = 'Download as PDF';
      downloadPdfButton.classList.add('download-button');
      // Dynamically create a script tag to load pdf-lib library
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/pdf-lib/dist/pdf-lib.js';
      script.async = true;

      // Execute the function after the script has been loaded
      script.onload = function () {
        // Inside the downloadPdfButton.onclick event handler:

        downloadPdfButton.onclick = async () => {
          try {
            // Create a new PDF document
            const pdfDoc = await PDFLib.PDFDocument.create();

            // Add the image to the first page
            const firstPage = pdfDoc.addPage();
            const imageUrl = '/static/assets/icon-bg.png';
            const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
            const image = await pdfDoc.embedPng(imageBytes);
            const dimensions = image.scale(0.5);

            firstPage.drawImage(image, {
              x: 210,
              width: dimensions.width,
              height: dimensions.height,
              y: firstPage.getHeight() - 380,
            });

            firstPage.drawText('PassProtectorPro', {
              x: 90,
              size: 50,
              y: firstPage.getHeight() - 445,
              font: await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold),
            });

            // Define constants for table layout
            const rowHeight = 50;
            const margin = 10;
            const columns = [
              { header: '#', width: 20 },
              { header: 'Password', width: 150 },
              { header: 'Complexity', width: 200 },
              { header: 'Crack Time', width: 205 },
            ];
            const columnWidths = columns.map((col) => col.width);
            const columnHeaders = columns.map((col) => col.header);

            // Function to split text into lines that fit within the cell width
            const splitText = (text, maxWidth, font, size) => {
              const lines = [];
              let line = '';
              const words = text.split(' ');

              for (let word of words) {
                const testLine = line + word + ' ';
                const testWidth = font.widthOfTextAtSize(testLine, size);
                if (testWidth > maxWidth) {
                  lines.push(line.trim());
                  line = word + ' ';
                } else {
                  line = testLine;
                }
              }
              lines.push(line.trim());
              return lines;
            };

            // Function to draw table row with wrapped text
            const drawRow = (page, y, row, font, size, color) => {
              let x = margin;
              row.forEach((cell, i) => {
                const lines = splitText(cell.toString(), columnWidths[i] - 10, font, size);
                let lineY = y;
                lines.forEach((line) => {
                  page.drawText(line, {
                    x: x + 5,
                    y: lineY,
                    size: size,
                    font: font,
                    color: color,
                  });
                  lineY -= size + 2; // Line height adjustment
                });
                page.drawRectangle({
                  x,
                  y: y - rowHeight + 15,
                  width: columnWidths[i],
                  height: rowHeight,
                  borderColor: PDFLib.rgb(0, 0, 0),
                  borderWidth: 1,
                });
                x += columnWidths[i];
              });
            };

            // Function to draw table header
            const drawTableHeader = (page, y) => {
              let x = margin;
              columnHeaders.forEach((header, i) => {
                page.drawRectangle({
                  x,
                  y: y - rowHeight + 15,
                  width: columnWidths[i],
                  height: rowHeight,
                  color: PDFLib.rgb(0.125, 0.125, 0.161),
                  borderColor: PDFLib.rgb(0, 0, 0),
                  borderWidth: 1,
                });
                page.drawText(header, {
                  x: x + 5,
                  y,
                  size: 12,
                  font: boldFont,
                  color: PDFLib.rgb(1, 1, 1),
                });
                x += columnWidths[i];
              });
            };

            // Initialize page and font
            let currentPage = pdfDoc.addPage();
            let currentPageY = currentPage.getHeight() - 50;
            const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

            // Draw table headers
            drawTableHeader(currentPage, currentPageY);
            currentPageY -= rowHeight;

            // Add table content
            let overallIndex = 1;
            for (let i = 0; i < password_complexities.length; i++) {
              const row = [
                overallIndex++,
                password_complexities[i][0],
                password_complexities[i][1],
                password_complexities[i][2],
              ];

              // Check if there is enough space on the current page, otherwise add a new page
              if (currentPageY < 50 + rowHeight) {
                currentPage = pdfDoc.addPage();
                currentPageY = currentPage.getHeight() - 50;

                // Draw table headers on the new page
                drawTableHeader(currentPage, currentPageY);
                currentPageY -= rowHeight;
              }

              // Draw the row with wrapped text
              drawRow(currentPage, currentPageY, row, font, 12, PDFLib.rgb(0, 0, 0));
              currentPageY -= rowHeight;
            }

            // Save the PDF to a Uint8Array
            const pdfBytes = await pdfDoc.save();

            // Create a blob from the PDF data
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'file_passwords.pdf';

            // Trigger the download
            link.click();
          } catch (error) {
            console.error('Error generating PDF:', error);
          }
        };
      };

      // Append the script tag to the document body
      document.body.appendChild(script);

      const downloadCsvButton = document.createElement('button');
      downloadCsvButton.textContent = 'Download as CSV';
      downloadCsvButton.classList.add('download-button');
      downloadCsvButton.onclick = () => {
        // Logic for downloading as CSV
        let csvContent = 'data:text/csv;charset=utf-8,';
        password_complexities.forEach((password, index) => {
          csvContent += `${index + 1}- ${password[0]}, ${password[1]}, ${password[2]}\r\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'file_passwords.csv');
        document.body.appendChild(link);
        link.click();
      };

      fileContainer.appendChild(downloadPdfButton);
      fileContainer.appendChild(downloadCsvButton);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const showFileName = (input) => {
  const uploadButton = document.querySelector('.upload-button');

  const fileName = input.files[0].name;
  const fileCustom = input.nextElementSibling;
  fileCustom.setAttribute('data-file-name', fileName);

  uploadButton.disabled = false;
};
