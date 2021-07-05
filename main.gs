var Main_Label = ['0.登入通知', '1.交易通知', '2.電子帳單'];
var Main_Rules = ['subject:(登入成功通知 OR 登入失敗通知 OR 成功登入 OR 密碼連續錯誤2次通知 OR 密碼錯誤通知 OR 登入通知 OR 登入安全性通知)',
                  'subject:(交易結果通知 OR 入帳通知 OR 繳款通知 OR 消費通知 OR 交易提領成功 OR 交易成功通知 OR 付款成功通知 OR 提領通知 OR 交易訊息通知 OR 交易通知 OR 交易扣款 OR 成交回報)',
                  'subject:(綜合對帳單 OR 電子帳單 OR 電子對帳單 OR 月對帳單 OR 日對帳單 OR 消費對帳單) -{繳款通知 OR 入帳通知}'];
// var SearchRules = {
//   "Bills_Notice": "subject:(綜合對帳單 OR 電子帳單 OR 電子對帳單 OR 月對帳單 OR 日對帳單 OR 消費對帳單) -{繳款通知 OR 入帳通知}",
//   "Trans_Notice": "subject:(登入成功通知 OR 登入失敗通知 OR 成功登入 OR 密碼連續錯誤2次通知 OR 密碼錯誤通知 OR 登入通知 OR 登入安全性通知}",
//   "Login_Notice": "subject:(交易結果通知 OR 入帳通知 OR 繳款通知 OR 消費通知 OR 交易提領成功 OR 交易成功通知 OR 付款成功通知 OR 提領通知 OR 交易訊息通知 OR 交易通知 OR 交易扣款 OR 成交回報)"
// };
// subject:(登入成功通知 OR 登入失敗通知 OR 成功登入 OR 密碼連續錯誤2次通知 OR 密碼錯誤通知 OR 登入通知 OR 登入安全性通知) AND NOT label:銀行-0.-登入通知 
function Test(){
  var rule = Main_Rules[0] + 'AND NOT label: ' + Main_Label[0];
  while (GmailApp.search(rule) != 0){
    var threads = GmailApp.search(rule, 0, 100);
    GmailApp.markThreadsImportant(threads);
  }
  var threads = GmailApp.search(rule, 0, 101)
  
  // if (threads.length > 100){
  //   var Count = Math.ceil(threads.length / 100);
  //   for(var i = 0; i < Count; i ++){
  //     var threads123 = GmailApp.search(Main_Rules[0], 100*i , 100*(i+1)-1);
  //     Logger.log(threads123.length);
  //   }
    // var threads = GmailApp.search(Main_Rules[0],); 
  // }
  // GmailApp.markThreadsImportant(threads); // 不能超過100threads
  // for (var i = 0; i < threads.length; i ++){
  //   // GmailApp.markThreadImportant(threads[i]);
  //   threads[i].markImportant();
  //   Logger.log(i);
  // }
  // GmailApp.markThreadImportant(threads);
  // threads.markImportant();
  Logger.log(threads.length);
}

// 0. Main
function Main(){
  // 01. Bank_Label
  for (var i = 0; i < Bank.length; i ++) { // Loop: i 家銀行
    var Bank_Label = Bank[i]['label_name'];
    var Bank_Email = Bank[i]['email'];
    
    // Feature I: 檢查&建立標籤
    CheckLabel(Bank_Label); 
    // Feature II: 銀行信件標記
    MailLabel(Bank_Label, Bank_Email);
  }
  
  // 02. Main_Label
  for (var i = 0; i < Main_Label.length; i ++) {
    var Main_Label = Main_Label[i];
    
    // Feature I: 檢查&建立標籤
    CheckLabel(Main_Label); 
    // Feature II: 特定信件標記
    MainLabel(Main_Label, Main_Rules[i], i);
  }
}

// Feature I: 檢查&建立標籤
function CheckLabel(Label){
  if (GmailApp.getUserLabelByName(Label) ===  null){
    GmailApp.createLabel(Label);
    Logger.log("0. Label Create: " + Label);
  }
}

// Feature II: 銀行信件標記
function MailLabel(Label, Email){
  var Count = 0;
  for (var i = 0; i < Email.length; i ++) {  // Loop: i  個郵件地址
    var threads = GmailApp.search('from:' + Email[j]);
    Label.addToThreads(threads);
    Count++;
  }
  Logger.log("1. Add "+ Label +": " + Count + "times");
}

// Feature II: 特定信件標記
function MainLabel(Label, Rule, i){
  var label = GmailApp.getUserLabelByName(Label);
  var threads = GmailApp.search(Rule);
  label.addToThreads(threads);
  switch(i){
    case 0: // 0. 登入通知
      doSomething( valueForString1 ); 
      break;
    case 1: // 1. 交易通知
      GmailApp.markThreadsImportant(threads); 
      break;
    case 2: // 2. 電子帳單
      GmailApp.markThreadsImportant(threads);
      break;
  }
}

// Feature III: 定時刪除信件（登入通知、驗證信）
function AutoRemove(){
  // 0. 登入通知
  var days = 10;
  var threads = GmailApp.search('older_than:' + days + "d label:0. 登入通知");
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToTrash();
  }
}