(function(){
	var app = angular.module('BudgetApp', []);

	app.controller('MainCtrl', ['TransactionStore', 'formattedDateFilter', 'filterTransactions', function(TransactionStore, formattedDateFilter, filterTransactions) {
		var self = this;
		self.transactions = [];
		self.balance = 0;
        self.displayedTransactions = 'both';

        self.changeDisplay = function(type) {
            self.displayedTransactions = type;
          }

        self.calculateBalance = function() {
            self.balance = 0;

            self.transactions.forEach(function(entry) {
                self.balance = self.balance + entry.amount;
            });
        };

		self.displayItems = function() {
            TransactionStore.getTransactionsInMonth(moment().format('YYYY-MM')).then(function(items) {
                self.transactions = items;
                self.calculateBalance();
            });
        }

        self.deleteItem = function(id) {
            TransactionStore.delete(id).then(self.displayItems);
        }

        self.displayItems();
	}])

    app.filter('formattedDate', function() {
        return function(input) {
            var ordinal = "th";
            switch(input.substring(8,10)) {
                case "01":
                    ordinal = "st";
                    break;
                case "02":
                    ordinal = "nd";
                    break;
                case "03":
                    ordinal = "rd";
                    break;
            }
            var output = parseFloat(input.substring(8,10)) + ordinal + " @ " + input.substring(11,16);

            return output;
        };
    })

    

	app.factory('TransactionStore', function($http, $q) {
        return (function() {
            var URL = 'http://server.godev.ro:8080/api/alex/transactions';

            var getTransactionsInMonth = function(month) {
                return $q(function(resolve, reject) {
                    $http({url: URL + '?month=' + month})
                        .then(
                            function(xhr) {
                                if (xhr.status == 200) {
                                    resolve(xhr.data);
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            var add = function(data) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(data)
                    })
                    .then(
                        function(xhr) {
                            if (xhr.status == 201) {
                                resolve(xhr.data);
                            } else {
                                reject();
                            }
                        },
                        reject
                    );
                });
            };

            var del = function(id) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL + '/' + id,
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(
                        function(xhr) {
                            if (xhr.status == 204) {
                                resolve();
                            } else {
                                reject();
                            }
                        },
                        reject
                    );
                });
            };

            return {
                getTransactionsInMonth: getTransactionsInMonth,
                add: add,
                delete: del
            };
        })();
    });
})();