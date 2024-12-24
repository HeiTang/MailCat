// --- Settings --- //
var BankList_Own = ['009', '013', '700']
var BankList_Url = "https://raw.githubusercontent.com/HeiTang/MailCat/main/bank_list.json";
var BankRule_Url = "https://raw.githubusercontent.com/HeiTang/MailCat/main/bank_rule.json";

const SheetID = '1GjPuvsMa1OsEcIUwqhpDM1DWWiCIx-VoIhXQuUqf8OI'
// --- Settings --- //

// 0. Initial
var BankList_JSON = GetJSON(BankList_Url); // 1-取得銀行資料 JSON
var BankRule_JSON = GetJSON(BankRule_Url);

// IMPORTANT !!!
// load library 1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0 to use Cheerio to parse mail

// 1. MailLabelManage
function Bank_Label() {
  for (var bankIndex = 0; bankIndex < BankList_Own.length; bankIndex++) {
    // 01. BankListLabel
    var isImportant = [0, 0, 0];
    var data_type = 1;
    var index = BankList_Own[bankIndex];
    var bank_label_name = BankList_JSON[index]['label_name'];
    var bank_email = BankList_JSON[index]['email'];

    // 檢查&建立標籤
    CheckLabel(bank_label_name);
    // 銀行信件標記
    MarkLabel(bank_label_name, bank_email, data_type, isImportant[bankIndex]);

    // 02. BankRuleLabel // 0.登入通知 1.交易通知 2.電子帳單
    var isImportant = [0, 0, 1];
    data_type = 2;
    for (var ruleIndex = 0; ruleIndex < BankRule_JSON.length; ruleIndex++) {
      var label_name = BankRule_JSON[ruleIndex]['label_name'];
      var bank_rule = [Utilities.formatString("label:%s %s", bank_label_name, BankRule_JSON[ruleIndex]['rule'])];

      // 檢查&建立標籤
      CheckLabel(label_name);
      // 特定信件標記
      MarkLabel(label_name, bank_rule, data_type, isImportant[ruleIndex]);
    }
  }
}

// 2. 定時刪除信件（登入通知）
function Bank_AutoRemove() {
  var delete_days = [7];
  var label_name = [BankRule_JSON[0]['label_name']];
  for (var i = 0; i < label_name.length; i++) {
    AutoRemove(delete_days[i], label_name[i]);
  }
}

// 3. 自動封存信件（登入通知、交易通知）
function Bank_AutoArchive() {
  var label_name = [BankRule_JSON[0]['label_name'], BankRule_JSON[1]['label_name']];
  for (var i = 0; i < label_name.length; i++) {
    AutoArchive(label_name[i]);
  }
}

// 4. 備份附件（電子帳單）
function Bank_AutoSave() {
  var folder_name = '銀行電子帳單';
  var label_name = BankRule_JSON[2]['label_name'];
  var rule = Utilities.formatString("has:attachment is:important label:%s", label_name);
  AutoSave(folder_name, label_name, rule);
}

function ParseMoney(money) {
  // TODO: 其他貨幣沒測試過
  let s = money.split('$')
  return {
    currency: s[0],
    amount: Number(s[1].replaceAll(',', '')),
  }
}

const supportBanks = { '013-國泰世華': Parse013 }

function Bank_Parse() {
  const parsedLabel = '銀行/已建檔'
  for (const [bank, parser] of Object.entries(supportBanks)) {
    const rule = Utilities.formatString("label:銀行-%s label:銀行-1.交易通知 subject: 消費彙整通知 NOT label:銀行/已建檔", bank)

    /**
     * @param {string[]} header
     * @return {SpreadsheetApp.Sheet} 
     */
    function initSheet(header) {
      // ensure sheet is open
      const ss = SpreadsheetApp.openById(SheetID)
      let sheet = ss.getSheetByName(bank);
      if (sheet == null) {
        sheet = ss.insertSheet(bank)
      }

      if (sheet.getLastRow() != 0) return sheet// already inited

      sheet.appendRow(header)

      return sheet
    }

    console.log('開始尋找 %s', bank)
    const results = parser(initSheet, rule, parsedLabel)
    console.log("%s 找到 %d 筆未登錄交易紀錄", bank, results.length)
  }
}
