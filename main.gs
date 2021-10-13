// --- Settings --- //
var Bank_Own = [];
var Main_list = ['0.登入通知', '1.交易通知', '2.電子帳單'];
var Main_Rules = ['subject:(登入成功通知 OR 登入失敗通知 OR 成功登入 OR 密碼連續錯誤2次通知 OR 密碼錯誤通知 OR 登入通知 OR 登入安全性通知)',
                  'subject:(交易結果通知 OR 入帳通知 OR 繳款通知 OR 消費通知 OR 交易提領成功 OR 交易成功通知 OR 付款成功通知 OR 提領通知 OR 交易訊息通知 OR 交易通知 OR 交易扣款 OR 成交回報)',
                  'subject:(帳戶月結單 OR 綜合對帳單 OR 電子帳單 OR 電子對帳單 OR 月對帳單 OR 日對帳單 OR 消費對帳單) -{繳款通知 OR 入帳通知}'];
// --- Settings --- //

// 0. Main
function Main(){
  
  var Bank_JSON = GetJSON(); // 1-取得銀行資料 JSON
  
  // 01. Bank_Label
  for (var i = 0; i < Bank_Own.length; i ++) {
    var Index = Bank_Own[i]
    var Bank_Label = Bank_JSON[Index]['label_name'];
    var Bank_Email = Bank_JSON[Index]['email'];

    // Feature I: 檢查&建立標籤
    CheckLabel(Bank_Label); 
    // Feature II: 銀行信件標記
    MailLabel(Bank_Label, Bank_Email);
  }
  
  // 02. Main_Label
  for (var i = 0; i < Main_list.length; i ++) {
    var Main_Label = Main_list[i];
    
    // Feature I: 檢查&建立標籤
    CheckLabel(Main_Label); 
    // Feature II: 特定信件標記
    MainLabel(Main_Label, Main_Rules[i], i);
  }
}

// Feature I: 檢查&建立標籤
function CheckLabel(Label){
  Logger.log("+ 0. " + Label + "檢查標籤是否存在");
  if (!GmailApp.getUserLabelByName(Label)){
    Logger.log("- 0. " + Label + "標籤不存在 建立中...");
    GmailApp.createLabel(Label);
    Logger.log("+ 0. " + Label + "標籤已建立");
  }
  else{
    Logger.log("+ 0. " + Label + "標籤已存在");
  }
}

// Feature II: 銀行信件標記
function MailLabel(Label, Email){
  var label = GmailApp.getUserLabelByName(Label);
  var Count = 0;
  for (var i = 0; i < Email.length; i ++) { 
    var rule = 'from:' + Email[i] + ' AND NOT label:' + Label;
    var threads = GmailApp.search(rule, 0, 100);
    label.addToThreads(threads);
    Count = Count + threads.length;
  }
  Logger.log("+ 1. " + Label + "已完成標記（" + Count + "）");
}

// Feature II: 特定信件標記
function MainLabel(Label, Rule, i){
  var label = GmailApp.getUserLabelByName(Label);
  var rule = Rule + ' AND NOT label:' + Label;
  var Count = 0;
  while (GmailApp.search(rule) != 0){
    var threads = GmailApp.search(rule, 0, 100);
    // A.添加標籤
    label.addToThreads(threads);
    Count = Count + threads.length;
    switch(i){
      case 0: break; // 0. 登入通知
      case 1: break; // 1. 交易通知
      case 2:        // 2. 電子帳單
        GmailApp.markThreadsImportant(threads); // 標記為重要
        break;
    }
    Logger.log("+ 2. " + Label + "已完成標記（" + Count + "）");
  }
}

// Feature III: 定時刪除信件（登入通知、驗證信）
function AutoRemove(){
  // 0. 登入通知
  var days = 10;
  var rule = 'older_than:' + days + 'd label:' + Main_list[0];
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToTrash();
  }
  Logger.log('+ 3. 已刪除「' + Main_list[0] + '」中 ' + days + ' 天前的信件（' + threads.length + '）');
}

// Feature IV: 自動封存信件（登入通知、交易通知）
function AutoArchive(){
  var rule = 'in:inbox is:read {label:' + Main_list[0] + ' label:' + Main_list[1] + '}';
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToArchive();
  }
  Logger.log('+ 4. 已封存「' + Main_list[0] + '」和「' + Main_list[1] + '」的信件（' + threads.length + '）');
}

// Feature V: 備份附件（電子帳單）
function AutoSave(){
  var FolderName = '銀行電子帳單';
  Logger.log('+ 5. 檢查雲端資料夾（' + FolderName + '）是否存在');
  var ParentFolder = GetFolder_(FolderName); // 2-建立雲端資料夾
  var rule = 'has:attachment is:important label:' + Main_list[2];
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++){
      var attachments = messages[j].getAttachments();
      var subjectName = messages[j].getSubject();
      //for (var k = 0; k < attachments.length; k++){
        var attachmentBlob = attachments[0].copyBlob();
        var file = DriveApp.createFile(attachmentBlob);
        file.setName(subjectName);
        file.moveTo(ParentFolder);
        Logger.log("+ 5. " + Main_list[2] + '（' + subjectName + "）已完成備份");
      //}
    } 
    GmailApp.markThreadUnimportant(threads[i]);
  }
}

// 1-取得銀行資料 JSON
function GetJSON() {
  var aUrl = "https://raw.githubusercontent.com/HeiTang/MailCat/main/config.json";
  var response = UrlFetchApp.fetch(aUrl);
  return JSON.parse(response.getContentText());
}

// 2-建立雲端資料夾
function GetFolder_(FolderName){
  var Folder;
  var fi = DriveApp.getFoldersByName(FolderName);
  if (fi.hasNext()){
    Folder = fi.next();
    Logger.log('+ 5. 雲端資料夾（' + FolderName + '）已存在');
  }
  else{
    Logger.log('- 5. 雲端資料夾（' + FolderName + '）不存在 建立中...');
    Folder = DriveApp.createFolder(FolderName);
    Logger.log('+ 5. 雲端資料夾（' + FolderName + '）已建立');
  }
  return Folder;
}