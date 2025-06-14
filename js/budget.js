// budget.js
document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const budgetContainer = document.getElementById('budgetContainer');
    const budgetTotal = document.getElementById('budgetTotal');
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');

    let budgetData = JSON.parse(localStorage.getItem('tripBudget')) || {
        categories: [],
        total: 0
    };

    // Initialize
    renderBudget();

    addCategoryBtn.addEventListener('click', addCategory);
    saveBudgetBtn.addEventListener('click', saveBudget);

    function addCategory(categoryData = { name: '', amount: 0 }) {
        const categoryId = Date.now();
        const category = document.createElement('div');
        category.className = 'budget-category';
        category.dataset.id = categoryId;

        category.innerHTML = `
            <select class="category-type">
                <option value="flight" ${categoryData.name === 'flight' ? 'selected' : ''}>Flight</option>
                <option value="hotel" ${categoryData.name === 'hotel' ? 'selected' : ''}>Hotel</option>
                <option value="meal" ${categoryData.name === 'meal' ? 'selected' : ''}>Meals</option>
                <option value="activity" ${categoryData.name === 'activity' ? 'selected' : ''}>Activities</option>
                <option value="other" ${categoryData.name === 'other' ? 'selected' : ''}>Other</option>
            </select>
            <input type="number" class="category-amount" value="${categoryData.amount}" placeholder="0.00" step="0.01">
            <button class="remove-category">×</button>
        `;

        budgetContainer.appendChild(category);
        addEventListeners(category);
        updateTotal();
    }

    function addEventListeners(category) {
        category.querySelector('.category-amount').addEventListener('input', updateTotal);
        category.querySelector('.remove-category').addEventListener('click', () => {
            category.remove();
            updateTotal();
        });
    }

    function updateTotal() {
        let total = 0;
        document.querySelectorAll('.budget-category').forEach(category => {
            total += parseFloat(category.querySelector('.category-amount').value) || 0;
        });
        budgetTotal.textContent = `$${total.toFixed(2)}`;
        budgetData.total = total;
    }

    function saveBudget() {
        const categories = [];
        document.querySelectorAll('.budget-category').forEach(category => {
            categories.push({
                name: category.querySelector('.category-type').value,
                amount: parseFloat(category.querySelector('.category-amount').value) || 0
            });
        });

        budgetData.categories = categories;
        localStorage.setItem('tripBudget', JSON.stringify(budgetData));

        // Show confirmation
        saveBudgetBtn.textContent = 'Saved!';
        setTimeout(() => {
            saveBudgetBtn.textContent = 'Save Budget';
        }, 2000);
    }

    function renderBudget() {
        budgetContainer.innerHTML = '';
        if (budgetData.categories.length > 0) {
            budgetData.categories.forEach(category => {
                addCategory(category);
            });
        } else {
            // Default categories
            addCategory({ name: 'flight', amount: 0 });
            addCategory({ name: 'hotel', amount: 0 });
        }
        budgetTotal.textContent = `$${budgetData.total.toFixed(2)}`;
    }
});