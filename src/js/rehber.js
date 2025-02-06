let allData = [];
let filteredData = [];
let rowsPerPage = calculateRowsPerPage(); // Dinamik olarak hesaplanan satır sayısı

function calculateRowsPerPage() {
    const rowHeight = 50; // Ortalama satır yüksekliği (px)
    const tableHeight = window.innerHeight * 0.8; // Sayfa yüksekliğinin %80'ı
    return Math.max(Math.floor(tableHeight / rowHeight), 5); // Minimum 5 satır
}

function loadExcel() {
    fetch('./src/data/personel_listesi.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            allData = jsonData;
            filteredData = [...allData];
            updatePagination();
            displayData(1);
        })
        .catch(error => console.error('Excel yükleme hatası:', error));
}

function displayData(page) {
    const tbody = document.getElementById('personel-list');
    tbody.innerHTML = '';

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const dataToDisplay = filteredData.slice(startIndex, endIndex);
    if (dataToDisplay.length === 0) {
        // Eğer hiç sonuç yoksa "Personel Bulunmamaktadır." mesajını göster
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; font-weight: bold; color: red;">Personel Bulunmamaktadır.</td></tr>`;
        return;
    }
    dataToDisplay.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${row['Sicil No'] || ''}</td>
        <td>${row['Ad'] || ''}</td>
        <td>${row['Soyad'] || ''}</td>
        <td>${row['Ünvan'] || ''}</td>
        <td>${row['Departman'] || ''}</td>
        <td>${row['Telefon'] || ''}</td>
    `;
        tbody.appendChild(tr);
    });
}

function updatePagination() {
    rowsPerPage = calculateRowsPerPage();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    $('#pagination').pagination({
        dataSource: filteredData,
        pageSize: rowsPerPage,
        callback: function (data, pagination) {
            displayData(pagination.pageNumber);
        }
    });
}

document.getElementById('search').addEventListener('keyup', function () {
    const query = this.value.trim().toLowerCase();
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (normalizedQuery === '') {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(row => {
            const rowText = Object.values(row).join(' ').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return rowText.includes(normalizedQuery);
        });
    }

    updatePagination();
});

window.addEventListener('resize', () => {
    updatePagination();
});

loadExcel();