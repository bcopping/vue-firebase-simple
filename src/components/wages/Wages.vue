<template>
    <div>
        <v-client-table :data="tableData" :columns="['date', 'name', 'wage', 'erase']" :options="options">
            <template slot="wage" scope="props">
                <div>
                    {{props.row.wage | currency('£')}}
                </div>
            </template>
            <template slot="erase" scope="props">
                <div>
                    <a class="fa fa-trash-o" @click="erase(props.row.id)"></a>
                </div>
            </template>
        </v-client-table>

        <table class="el-table__body">
            <tr class="totals" style="width: 100%">
                <td width="180">&nbsp;</td>
                <td width="180">&nbsp;</td>
                <td width="180">&nbsp;</td>
                <td><div class="cell">{{wageAmountsAry | currency('£')}}</div></td>
                <td>&nbsp;</td>
            </tr>
        </table>

        <app-csv-download :data="tableData" :filename="csvTitle"></app-csv-download>

    </div>
  </template>

<script>
  import * as firebase from 'firebase/app';
  import {mapActions} from 'vuex'
  import accounting from 'accounting'
  import {addDecimals} from '../../lib/decimal-operations'
  import csvDownload from '../csvdownloader/csvDownload.vue'
  import getWages from '../mixins'

  export default {
    data() {
      return {
        csvTitle: "wages",
        options: {
            filterable: false
        }
      }
    },
    mixins: [getWages],

    components: {
          appCsvDownload: csvDownload,

    },
    computed: {

      tableData(){
        if (this.$store.getters.wagesFilterActive) {
          return this.$store.getters.wagesFiltered
        }
        if (this.$store.getters.wagesTradingYearActive) {
          return this.$store.getters.wagesTradingYear
        }
        else {
          return this.$store.getters.wages
        }
      },
    wageAmountsAry(){
        let sum = 0;
        if (this.$store.getters.wagesFilterActive) {
          sum = this.$store.getters.filteredWageAmountsAry;
        }
        else if (this.$store.getters.wagesTradingYearActive) {
          sum = this.$store.getters.tradingYearWageAmountsAry
        }
        else {
          sum = sum = this.$store.getters.wageAmountsAry;
        }
        return addDecimals(sum).toFixed(2);
      },
      totalYearsTrading(){
        return this.$store.getters.totalYearsTrading
      },
    },
    methods:{
      ...mapActions([
          'removeFilterWages',
          'filterWagesTradingYear'
        ]),
      //format the amounts row...
      formatter(row, column){
        var value = row.wage
        var c = '£'
        return accounting.formatMoney(value, c);
      },
      handleDelete(index, row){
        firebase.database().ref('users/'+ this.user.uid).child('/wages/').child(row.id).remove();
        this.removeFilterWages();
        this.getWages();
      },
      erase(t){
        firebase.database().ref('users/'+ this.user.uid).child('/wages/').child(t).remove();
         this.removeFilterWages();
        this.getWages();
        },
      csvDownload(){
        downloadCSV({ filename: "wages.csv", data: this.tableData });
      }
    },
    created(){
        this.filterWagesTradingYear(this.totalYearsTrading)
      }
  }
</script>
