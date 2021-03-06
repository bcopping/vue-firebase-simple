import * as firebase from 'firebase/app'
import { mapActions } from 'vuex'
import { getDate } from '../lib/get-date'

import orderBy from 'lodash/orderBy'

export default {
    computed: {
        company() {
            return this.$store.getters.companyDetails
        },
        user() {
            return this.$store.getters.user
        },
    },
    methods: {
        ...mapActions([
            'setExpenses2',
            'setExpenseTypes',
            'setWages',
            'setEmployeeNames',
            'setDividends',
            'setDividendNames',
            'setInvoices',
            'setInvoiceCompanies',
            'setPeople',
            'setCompanyDetails',
            'setTradingYear',
            'setTotalYearsTrading',
            'filterInvoiceTradingYear',
            'filterDividendTradingYear',
            'filterWagesTradingYear',
            'filterExpensesTradingYear',
            'setTradingYearArray',
            'setHomeLoaded'
        ]),

        getExpenses() {

            const that = this;
            const ref = firebase.database().ref('users/' + this.user.uid).child('/expenses2/')

            var expenses = [];

            ref.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (expense) {
                        expenses.push(expense.val());
                    });

                    expenses = orderBy(expenses, 'timestamp', ['desc']);
                    that.setExpenses2(expenses);
                    if (that.$store.getters.expensesTradingYearActive) {
                        that.filterExpensesTradingYear(that.$store.getters.expensesViewingTradingYear)
                    }
                    that.setExpenseTypes(expenses);
                });
        },

        getWages() {

            const that = this;
            const ref = firebase.database().ref('users/' + this.user.uid).child('/wages/')

            var wages = [];

            ref.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (wage) {
                        wages.push(wage.val());
                    });

                    wages = orderBy(wages, 'timestamp', ['desc']);


                    that.setWages(wages);
                    if (that.$store.getters.wagesTradingYearActive) {
                        that.filterWagesTradingYear(that.$store.getters.wagesViewingTradingYear)
                    }
                    that.setEmployeeNames(wages);
                });
        },
        getDividends() {

            const that = this;
            const ref = firebase.database().ref('users/' + this.user.uid).child('/dividends/')

            var dividends = [];

            ref.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (dividend) {
                        dividends.push(dividend.val());
                    });

                    dividends = orderBy(dividends, 'timestamp', ['desc']);


                    that.setDividends(dividends);

                    if (that.$store.getters.dividendsTradingYearActive) {
                        that.filterDividendTradingYear(that.$store.getters.dividendsViewingTradingYear)
                    }

                    that.setDividendNames(dividends);
                });
        },
        getInvoices() {

            const that = this;
            const ref = firebase.database().ref('users/' + this.user.uid).child('/invoices/')

            var invoices = [];

            ref.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (invoice) {
                        invoices.push(invoice.val());
                    });

                    invoices = orderBy(invoices, 'timestamp', ['desc']);


                    that.setInvoices(invoices);

                    /*-- get the current viewing year, not the current trading year, as this will change when you switch years --*/
                    if (that.$store.getters.invoicesTradingYearActive) {
                        that.filterInvoiceTradingYear(that.$store.getters.invoicesViewingTradingYear)
                    }

                    that.setInvoiceCompanies();
                });
        },

        getPeople() {

            const that = this;
            const ref = firebase.database().ref('users/' + this.user.uid).child('/people/')

            var people = [];

            ref.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (person) {
                        people.push(person.val());
                    });
                    people = orderBy(people, 'timestamp', ['desc']);
                    that.setPeople(people);

                })
                .then(function () {
                    that.setHomeLoaded(true)
                });
        },
        getTradingYear(varDate, setTotalYears) {
            /*--
                Had some idea about a switch statement
                here, im sure I will remember what for!
            --*/
            const incorpDate = this.$store.getters.companyDetails.date

            //format is dd-mm-yyyy
            let year = '';

            let incorpDateArr;
            incorpDateArr = incorpDate.split('-');

            let incorpDay = incorpDateArr[0]
            let incorpMonth = incorpDateArr[1]
            let incorpYear = incorpDateArr[2]

            let varDateArr;
            varDateArr = varDate.split('-');

            let varDay = varDateArr[2]
            let varMonth = varDateArr[1]
            let varYear = varDateArr[0]

            if (incorpYear == varYear) {
                if (setTotalYears === true) {

                    this.setTotalYearsTrading(1);
                }
                else {
                    this.setTradingYear(1);
                }
            }
            else if (incorpYear < varYear && varMonth < incorpMonth) {
                if (varYear - incorpYear > 1) {

                    if (varMonth < incorpMonth) {
                        year = varYear - incorpYear
                    }
                    else {
                        year = varYear - incorpYear + 1
                    }

                    if (setTotalYears === true) {
                        this.setTotalYearsTrading(year);
                    }
                    else {
                        this.setTradingYear(year);
                    }

                }
                else {
                    if (setTotalYears === true) {
                        this.setTotalYearsTrading(1);
                    }
                    else {
                        this.setTradingYear(1);
                    }
                }

            }
            else if (incorpYear < varYear && varMonth > incorpMonth) {
                year = varYear - incorpYear + 1
                if (setTotalYears === true) {
                    this.setTotalYearsTrading(year);
                }
                else {
                    this.setTradingYear(year);
                }
            }
            else if (incorpYear < varYear && incorpMonth == varMonth) {
                if (incorpDay > varDay) {
                    if (varYear - incorpYear == 1) {
                        if (setTotalYears === true) {
                            this.setTotalYearsTrading(1);
                        }
                        else {
                            this.setTradingYear(1);
                        }
                    }
                    else {
                        year = varYear - incorpYear
                        if (setTotalYears === true) {
                            this.setTotalYearsTrading(year);
                        }
                        else {
                            this.setTradingYear(year);
                        }
                    }
                }
                else if (incorpDay <= varDay) {
                    year = varYear - incorpYear + 1
                    if (setTotalYears === true) {
                        this.setTotalYearsTrading(year);
                    }
                    else {
                        this.setTradingYear(year);
                    }
                }
            }
            //return this.$store.getters.companyDetails.date
        },


        filtersOff() {
            const el = document.getElementsByClassName('filter')
            console.log('tabs', el)
            for (var i = 0; i < el.length; i++) {
                el[i].classList.remove('is-active')
            }
        },
    }

}
