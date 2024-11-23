let transactions = [];

// Função para adicionar uma transação
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const month = parseInt(document.getElementById('month').value);
    const year = parseInt(document.getElementById('year').value);  // Corrected this line

    if (description === "" || isNaN(amount) || isNaN(month) || isNaN(year)) { // Corrected the logical OR operator here
        alert("Por favor, preencha todos os campos.");  // Corrected the alert message
        return;
    }

    transactions.push({ month, year, description, amount, type });

    addToTable(month, year, description, type, amount);
    clearForm();
}

// Função para adicionar os dados na tabela dinâmica
function addToTable(month, year, description, type, amount) {
    const tableBody = document.getElementById("dynamicTable").getElementsByTagName("tbody")[0];
    const newRow = tableBody.insertRow();

    newRow.insertCell(0).textContent = month + 1; // Exibe o mês em formato 1-12
    newRow.insertCell(1).textContent = year;
    newRow.insertCell(2).textContent = description;
    newRow.insertCell(3).textContent = type === "income" ? "Receita" : "Despesa";
    newRow.insertCell(4).textContent = `R$ ${amount.toFixed(2)}`;
}

// Função para limpar os campos do formulário
function clearForm() {
    document.getElementById('description').value = "";
    document.getElementById('amount').value = "";
    document.getElementById('type').value = "income";
    document.getElementById('month').value = "0"; // Reinicia para Janeiro
    document.getElementById('year').value = "";
}

// Função para exportar a planilha
function exportSpreadsheet() {  // Corrected the syntax here
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();  // Corrected this line
    XLSX.utils.book_append_sheet(wb, ws, "Transações");

    XLSX.writeFile(wb, "planilha_financeira.xlsx");
}

// Gráfico de Pizza (Mensal)
const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
let monthlyChart = new Chart(ctxMonthly, {
    type: 'pie',
    data: {
        labels: ['Receita', 'Despesa'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['green', 'red'],
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        }
    }
});

// Gráfico de Linha (Anual)
const ctxAnnual = document.getElementById('annualChart').getContext('2d');
let annualChart = new Chart(ctxAnnual, {
    type: 'line',
    data: {
        labels: [], // Meses
        datasets: [{
            label: 'Balanço',
            data: [],  // Empty array for monthly totals
            fill: false,
            borderColor: 'blue',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        }
    }
});

// Atualiza os gráficos com os dados do mês e ano selecionados
document.getElementById('updateGraphsBtn').addEventListener('click', function() {
    const selectedMonth = parseInt(document.getElementById('graphMonth').value);
    const selectedYear = parseInt(document.getElementById('graphYear').value);
    updateMonthlyGraph(selectedMonth, selectedYear);
    updateAnnualGraph(selectedYear);
});

// Atualiza o gráfico mensal
function updateMonthlyGraph(month, year) {
    const income = transactions.filter(t => t.type === 'income' && t.month === month && t.year === year);
    const expense = transactions.filter(t => t.type === 'expense' && t.month === month && t.year === year);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);

    // Verifica se as despesas são maiores que as receitas
    if (totalExpense > totalIncome) {
        monthlyChart.data.datasets[0].data = [0, totalExpense]; // Somente despesa
        monthlyChart.data.datasets[0].backgroundColor = ['transparent', 'red']; // Gráfico todo vermelho
    } else {
        monthlyChart.data.datasets[0].data = [totalIncome, totalExpense];
        monthlyChart.data.datasets[0].backgroundColor = ['green', 'red'];
    }

    monthlyChart.update();
}

// Atualiza o gráfico anual
function updateAnnualGraph(year) {
    const monthlyTotals = new Array(12).fill(0);
    transactions.forEach(t => {
        if (t.year === year) {  // Added missing parentheses
            monthlyTotals[t.month] += (t.type === 'income' ? t.amount : -t.amount);
        }
    });

    annualChart.data.labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    annualChart.data.datasets[0].data = monthlyTotals;
    annualChart.update();
}

// Adiciona o evento ao botão de adicionar transação
document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);  // Fixed the event listener
