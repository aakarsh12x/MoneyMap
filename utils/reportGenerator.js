/**
 * Financial Report Generator
 * Generates various types of financial reports in different formats
 */

export class ReportGenerator {
  constructor(userData, financialData) {
    this.userData = userData;
    this.financialData = financialData;
    this.date = new Date().toLocaleDateString();
  }

  /**
   * Generate CSV report
   */
  generateCSV() {
    const data = this.prepareReportData();
    
    let csv = 'Financial Report\n';
    csv += `Generated for: ${data.user}\n`;
    csv += `Date: ${this.date}\n`;
    csv += `Email: ${data.email}\n\n`;
    
    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Total Income,₹${this.formatCurrency(data.summary.totalIncome)}\n`;
    csv += `Total Expenses,₹${this.formatCurrency(data.summary.totalExpenses)}\n`;
    csv += `Net Income,₹${this.formatCurrency(data.summary.netIncome)}\n`;
    csv += `Active Budgets,${data.summary.activeBudgets}\n`;
    csv += `Total Budget,₹${this.formatCurrency(data.summary.totalBudget)}\n`;
    csv += `Savings Rate,${data.summary.savingsRate}%\n\n`;
    
    // Budgets section
    csv += 'BUDGETS\n';
    csv += 'Name,Amount,Spent,Remaining,Utilization%\n';
    data.budgets.forEach(budget => {
      const utilization = budget.amount > 0 ? ((budget.spent / budget.amount) * 100).toFixed(1) : 0;
      csv += `${budget.name},₹${this.formatCurrency(budget.amount)},₹${this.formatCurrency(budget.spent)},₹${this.formatCurrency(budget.remaining)},${utilization}%\n`;
    });
    csv += '\n';
    
    // Incomes section
    csv += 'INCOMES\n';
    csv += 'Name,Amount,Percentage\n';
    const totalIncome = data.incomes.reduce((sum, income) => sum + income.amount, 0);
    data.incomes.forEach(income => {
      const percentage = totalIncome > 0 ? ((income.amount / totalIncome) * 100).toFixed(1) : 0;
      csv += `${income.name},₹${this.formatCurrency(income.amount)},${percentage}%\n`;
    });
    csv += '\n';
    
    // Expenses section
    csv += 'EXPENSES\n';
    csv += 'Name,Amount,Date,Category\n';
    data.expenses.forEach(expense => {
      csv += `${expense.name},₹${this.formatCurrency(expense.amount)},${expense.date},${expense.category || 'Uncategorized'}\n`;
    });
    csv += '\n';
    
    // Portfolio section (if available)
    if (data.portfolio && data.portfolio.data) {
      csv += 'PORTFOLIO\n';
      csv += 'Asset,Quantity,Value,Allocation%\n';
      data.portfolio.data.forEach(asset => {
        csv += `${asset.name},${asset.quantity || 0},₹${this.formatCurrency(asset.value || 0)},${asset.allocation || 0}%\n`;
      });
      csv += '\n';
    }
    
    // Market data section (if available)
    if (data.marketData && data.marketData.length > 0) {
      csv += 'MARKET DATA\n';
      csv += 'Symbol,Price,Change,Change%\n';
      data.marketData.forEach(stock => {
        csv += `${stock.symbol},₹${stock.price},${stock.change},${stock.changePercent}%\n`;
      });
    }
    
    return csv;
  }

  /**
   * Generate JSON report
   */
  generateJSON() {
    const data = this.prepareReportData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate HTML report
   */
  generateHTML() {
    const data = this.prepareReportData();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Report - ${data.user}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #2c3e50; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #3498db; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 1px solid #ecf0f1; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ecf0f1; }
        th { background: #3498db; color: white; }
        .positive { color: #27ae60; }
        .negative { color: #e74c3c; }
        .footer { margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Financial Report</h1>
            <p>Generated for: ${data.user}</p>
            <p>Date: ${this.date}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Income</h3>
                <div class="value positive">₹${this.formatCurrency(data.summary.totalIncome)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="value negative">₹${this.formatCurrency(data.summary.totalExpenses)}</div>
            </div>
            <div class="summary-card">
                <h3>Net Income</h3>
                <div class="value ${data.summary.netIncome >= 0 ? 'positive' : 'negative'}">₹${this.formatCurrency(data.summary.netIncome)}</div>
            </div>
            <div class="summary-card">
                <h3>Active Budgets</h3>
                <div class="value">${data.summary.activeBudgets}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Budgets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Spent</th>
                        <th>Remaining</th>
                        <th>Utilization</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.budgets.map(budget => {
                        const utilization = budget.amount > 0 ? ((budget.spent / budget.amount) * 100).toFixed(1) : 0;
                        return `
                        <tr>
                            <td>${budget.name}</td>
                            <td>₹${this.formatCurrency(budget.amount)}</td>
                            <td>₹${this.formatCurrency(budget.spent)}</td>
                            <td>₹${this.formatCurrency(budget.remaining)}</td>
                            <td>${utilization}%</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Income Streams</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.incomes.map(income => {
                        const totalIncome = data.incomes.reduce((sum, inc) => sum + inc.amount, 0);
                        const percentage = totalIncome > 0 ? ((income.amount / totalIncome) * 100).toFixed(1) : 0;
                        return `
                        <tr>
                            <td>${income.name}</td>
                            <td>₹${this.formatCurrency(income.amount)}</td>
                            <td>${percentage}%</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Recent Expenses</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.expenses.map(expense => `
                    <tr>
                        <td>${expense.name}</td>
                        <td>₹${this.formatCurrency(expense.amount)}</td>
                        <td>${expense.date}</td>
                        <td>${expense.category || 'Uncategorized'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Report generated by MoneyMap - AI-Powered Financial Management</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Prepare report data with calculations
   */
  prepareReportData() {
    const summary = {
      totalIncome: this.financialData.totalIncome || 0,
      totalExpenses: this.financialData.totalExpenses || 0,
      netIncome: (this.financialData.totalIncome || 0) - (this.financialData.totalExpenses || 0),
      activeBudgets: this.financialData.budgetList?.length || 0,
      totalBudget: this.financialData.budgetList?.reduce((sum, budget) => sum + (parseFloat(budget.amount) || 0), 0) || 0,
      savingsRate: this.financialData.totalIncome > 0 ? 
        (((this.financialData.totalIncome - this.financialData.totalExpenses) / this.financialData.totalIncome) * 100).toFixed(1) : 0
    };

    return {
      user: this.userData.fullName || this.userData.firstName,
      email: this.userData.email,
      date: this.date,
      summary,
      budgets: this.financialData.budgetList?.map(budget => ({
        name: budget.name,
        amount: parseFloat(budget.amount) || 0,
        spent: budget.totalSpend || 0,
        remaining: (parseFloat(budget.amount) || 0) - (budget.totalSpend || 0)
      })) || [],
      incomes: this.financialData.incomeList?.map(income => ({
        name: income.name,
        amount: parseFloat(income.totalAmount) || parseFloat(income.amount) || 0
      })) || [],
      expenses: this.financialData.expensesList?.map(expense => ({
        name: expense.name,
        amount: parseFloat(expense.amount) || 0,
        date: expense.createdAt,
        category: expense.category || 'Uncategorized'
      })) || [],
      portfolio: this.financialData.portfolioData,
      marketData: this.financialData.marketData
    };
  }

  /**
   * Format currency values
   */
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /**
   * Download report in specified format
   */
  downloadReport(format = 'csv') {
    let content, filename, mimeType;
    
    switch (format.toLowerCase()) {
      case 'json':
        content = this.generateJSON();
        filename = `financial_report_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'html':
        content = this.generateHTML();
        filename = `financial_report_${new Date().toISOString().split('T')[0]}.html`;
        mimeType = 'text/html';
        break;
      default:
        content = this.generateCSV();
        filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default ReportGenerator; 