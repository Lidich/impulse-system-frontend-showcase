export function createMatrixInput(idPrefix, idContainer, rowCount, columnCount, rowHeaders, columnHeaders) {
    let container = document.getElementById(idContainer);
    
    if (!container) {
        console.error(`Container with id ${idContainer} not found.`);
        return;
    }

    // Создаем элемент таблицы
    const table = document.createElement('table');
    table.border = '1'; // Добавьте рамку для визуализации

    // Задаем размеры матрицы (например, 3x3)
    const rows = 3;
    const cols = 3;

    for (let i = 0; i < rowCount; i++) {
        let row = document.createElement('tr');
        
        let firstCellInRow = document.createElement('td')
        if(i==0 && columnHeaders!=null){
            row.style.display = "block"
            firstCellInRow.innerHTML = ""
            row.appendChild(firstCellInRow)
            for(let j=0;j<columnCount;j++){
                const cell = document.createElement('td');
                cell.innerHTML = columnHeaders[j]
                row.appendChild(cell)
            }
            table.appendChild(row)
            row = document.createElement('tr');
        }
        row.style.display = "block"
        row.id = `${idPrefix}Row:${i}`;
            firstCellInRow = document.createElement('td')
            firstCellInRow.innerHTML = rowHeaders[i]
            row.appendChild(firstCellInRow)
            for (let j = 0; j < columnCount; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                
                // Устанавливаем уникальный id для каждого input
                input.id = `${idPrefix}Input:${i}-${j}`;
                input.type = 'number';
                cell.style.width = (100/columnCount).toString()+"%"
                input.style.width = (90).toString()+"%"
    
                // Добавляем input в ячейку
                cell.appendChild(input);
                row.appendChild(cell);
            }
        table.appendChild(row);
    }

    // Добавляем таблицу в контейнер
    container.innerHTML = ''
    container.appendChild(table);
}