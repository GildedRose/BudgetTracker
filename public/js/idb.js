
let db;
const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("new_budget", {autoIncrement:true });
};
request.onsuccess = function(event) {
    db = event.target.result;
    // check if app is online
    if (navigator.onLine) {
        checkBudget();
    }
};

request.onerror = function(event) {
    //log error
    console.log(even.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    budgetObjectStore.add(record);
}

function checkBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('./api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_budget'], readwrite);
                const budgetObjectStore = transaction.objectStore('new_budget');
                //clear all items in store
                budgetObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}
    
//listen for app coming back online
window.addEventListener('online', checkBudget);