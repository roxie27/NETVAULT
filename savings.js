const select = document.getElementById("sel");
const amount = document.getElementById("amot");
const date = document.getElementById("date1");
const adaBody = document.getElementById("his-body");
const form1 = document.getElementById("form1");
const balan = document.getElementById("balc");
const sel = document.getElementById("sel2");
const clearBtn = document.getElementById("but2");

let transactions = [];
let balance = 0;
let editIndex = -1;

window.onload = function () {
    const savedBal = localStorage.getItem("balance");
    const savedTrans = localStorage.getItem("transactions");

    if (savedBal !== null) {
        balance = parseFloat(savedBal);
        updateBalanceUI();
    }

    if (savedTrans) {
        transactions = JSON.parse(savedTrans);
        renderTable(transactions);
    }
};

form1.addEventListener("submit", function (event) {
    event.preventDefault();

    const amt = parseFloat(amount.value);
    const dt = date.value;
    const type = select.value;

    if (amt < 0 || isNaN(amt)) {
        alert("Enter a valid positive amount");
        return;
    }

    if (type === "choose") {
        alert("Please select income or expense");
        return;
    }

    const newEntry = {
        type: type.toUpperCase(),
        amount: amt,
        date: dt
    };

    if (editIndex >= 0) {
        const old = transactions[editIndex];
        
        if (old.type === "INCOME") balance -= old.amount;
        else balance += old.amount;

        
        if (newEntry.type === "INCOME") balance += newEntry.amount;
        else balance -= newEntry.amount;

        transactions[editIndex] = newEntry;
        editIndex = -1;
    } else {
        transactions.push(newEntry);
        if (type === "income") balance += amt;
        else balance -= amt;
    }

    saveToLocalStorage();
    updateBalanceUI();
    renderTable(transactions);
    form1.reset();
});

function updateBalanceUI() {
    balan.textContent = balance.toFixed(2);
    balan.style.width = "200px";
    balan.style.height = "40px";
    balan.style.backgroundColor = "pink";
    balan.style.textAlign = "center";
    balan.style.borderRadius = "10px";
}

function saveToLocalStorage() {
    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTable(data) {
    adaBody.innerHTML = "";

    if (data.length === 0) {
        const row = adaBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = "No transactions found.";
        cell.style.textAlign = "center";
        return;
    }

    data.forEach((tx, index) => {
        const row = adaBody.insertRow();
        row.insertCell(0).textContent = tx.type;
        row.insertCell(1).textContent = tx.amount.toFixed(2);
        row.insertCell(2).textContent = tx.date;

        const actionCell = row.insertCell(3);

        
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginRight = "5px";
        delBtn.onclick = function () {
            deleteTransaction(index, tx);
        };
        actionCell.appendChild(delBtn);

        
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function () {
            loadTransactionForEdit(index);
        };
        actionCell.appendChild(editBtn);
    });
}

function deleteTransaction(index, txToDelete) {
    if (confirm(`Delete this ${txToDelete.type} of ${txToDelete.amount} on ${txToDelete.date}?`)) {
        transactions.splice(index, 1);

        if (txToDelete.type === "INCOME") {
            balance -= txToDelete.amount;
        } else {
            balance += txToDelete.amount;
        }

        saveToLocalStorage();
        updateBalanceUI();
        fil(); 
    }
}

function loadTransactionForEdit(index) {
    const tx = transactions[index];
    select.value = tx.type.toLowerCase();
    amount.value = tx.amount;
    date.value = tx.date;
    editIndex = index;
}

function fil() {
    const f = sel.value.toUpperCase();
    const today = new Date().toISOString().split("T")[0];
    let filtered = transactions;

    if (f === "INCOME") {
        filtered = transactions.filter(tx => tx.type === "INCOME");
    } else if (f === "EXPENSE") {
        filtered = transactions.filter(tx => tx.type === "EXPENSE");
    } else if (f === "DATE") {
        filtered = transactions.filter(tx => tx.date === today);
    }

    renderTable(filtered);
}

clearBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all transactions?")) {
        localStorage.removeItem("balance");
        localStorage.removeItem("transactions");

        balance = 0;
        transactions = [];
        renderTable([]);
        updateBalanceUI();
    }
});



