// --- Settings --- //
var BankList_Own = []
var BankList_Url = "https://raw.githubusercontent.com/HeiTang/MailCat/main/bank_list.json";
var BankRule_Url = "https://raw.githubusercontent.com/HeiTang/MailCat/main/bank_rule.json";
var Label_All = true;
// --- Settings --- //

// 0. Initial
var BankList_JSON = GetJSON(BankList_Url); // 1-取得銀行資料 JSON
var BankRule_JSON = GetJSON(BankRule_Url);


// 1. MailLabelManage
function Bank_Label(){
  // 01. BankListLabel
  var isImportant = [0, 0, 0];
  var data_type = 1;
  for (var i = 0; i < BankList_Own.length; i++) {
    var index = BankList_Own[i];
    var bank_label_name = BankList_JSON[index]['label_name'];
    var bank_email = BankList_JSON[index]['email'];

    // 檢查&建立標籤
    CheckLabel(bank_label_name); 
    // 銀行信件標記
    MarkLabel(bank_label_name, bank_email, data_type, isImportant[i]);

    // 02. BankRuleLabel // 0.登入通知 1.交易通知 2.電子帳單
    var isImportant = [0, 0, 1];
    var data_type = 2;
    for (var i = 0; i < BankRule_JSON.length; i++) {
      var label_name = BankRule_JSON[i]['label_name'];
      // var bank_rule = BankRule_JSON[i]['rule'];
      var bank_rule = [Utilities.formatString("label:%s %s", bank_label_name , BankRule_JSON[i]['rule'])];
      // 檢查&建立標籤
      CheckLabel(label_name); 
      // 特定信件標記
      MarkLabel(label_name, bank_rule, data_type, isImportant[i]);
    }
  }
}

// 2. 定時刪除信件（登入通知）
function Bank_AutoRemove(){
  var delete_days = [7];
  var label_name = [BankRule_JSON[0]['label_name']];
  for (var i = 0; i < label_name.length; i++) {
    AutoRemove(delete_days[i], label_name[i]);
  }
}

// 3. 自動封存信件（登入通知、交易通知）
function Bank_AutoArchive(){
  var label_name = [BankRule_JSON[0]['label_name'], BankRule_JSON[1]['label_name']];
  for (var i = 0; i < label_name.length; i++) {
    AutoArchive(label_name[i]);
  }
}

// 4. 備份附件（電子帳單）
function Bank_AutoSave(){
  var folder_name = '銀行電子帳單';
  var label_name = BankRule_JSON[2]['label_name'];
  var rule = Utilities.formatString("has:attachment is:important label:%s", label_name);
  AutoSave(folder_name, label_name, rule);
}