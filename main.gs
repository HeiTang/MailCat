// M1-取得資料 JSON
function GetJSON(aUrl) {
  var response = UrlFetchApp.fetch(aUrl);
  response.getResponseCode
  var response_code = response.getResponseCode();
  if (response_code == 200) {
    Logger.log("+ 1. 資料取得成功（%s）", aUrl);
    return JSON.parse(response.getContentText());
  }
  else {
    Logger.log("- 1. 資料取得失敗 %d（%s）", response_code, aUrl);
    return 0;
  }
}

// M2-檢查標籤
function CheckLabel(label_name) {
  if (!GmailApp.getUserLabelByName(label_name)) {
    Logger.log("- 2. 「%s」標籤不存在", label_name);
    CreateNestedLabel(label_name);
    Logger.log("+ 2. 「%s」標籤已建立", label_name);
  }
  else {
    Logger.log("+ 2. 「%s」標籤已存在", label_name);
  }
}

// M2-建立標籤（巢狀）
function CreateNestedLabel(label_name) {
  var labels = label_name.split("/");
  var label = "";

  for (var i = 0; i < labels.length; i++) {
    if (labels[i] !== "") {
      label = label + ((i===0) ? "" : "/") + labels[i];
      GmailApp.getUserLabelByName(label) ? GmailApp.getUserLabelByName(label) : GmailApp.createLabel(label);
    }
  }
}

// M3-信件標記（信件來源、信件類型）
function MarkLabel(label_name, label_factor, data_type, isImportant) {
  var label = GmailApp.getUserLabelByName(label_name);
  var count = 0;

  for (var i = 0; i < label_factor.length; i++) {
    switch (data_type) { 
      case 1: // 依「寄件者」分類
        // var rule = 'from:' + label_factor[i] + ' AND NOT label:' + label_name;
        var rule = Utilities.formatString("from:%s AND NOT label:%s", label_factor[i], label_name);
        break;
      case 2: // 依「類型」分類
        // var rule = label_factor[i] + ' AND NOT label:' + label_name;
        var rule = Utilities.formatString("%s AND NOT label:%s", label_factor[i], label_name);
        break;
    }
    while (GmailApp.search(rule) != 0) {
      var threads = GmailApp.search(rule, 0, 100);
      label.addToThreads(threads);
      count = count + threads.length;
      if (isImportant == 1) {
        GmailApp.markThreadsImportant(threads); // 標記為重要
      }
    }
  }  
  Logger.log("+ 3. 「%s」已完成標記（%d）", label_name, count);
}

// M4-定時刪除信件（登入通知、驗證信）
function AutoRemove(delete_days, label_name) {
  var rule = Utilities.formatString("older_than:%dd label:%s", delete_days, label_name);
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToTrash();
  }
  Logger.log("+ 4. 已刪除「%s」中 %d 天前的信件（%d）", label_name, delete_days, threads.length);
}

// M5-自動封存信件（登入通知、交易通知）
function AutoArchive(label_name) {
  var rule = Utilities.formatString("in:inbox is:read label:%s", label_name);
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    threads[i].moveToArchive();
  }
  Logger.log("+ 5. 已封存「%s」的信件（%d）", label_name, threads.length);
}

// M6-檢查＆建立雲端資料夾
function GetFolder_(folder_name) {
  var folder;
  var fi = DriveApp.getFoldersByName(folder_name);
  Logger.log("? 6. 檢查雲端資料夾「%s」是否存在", folder_name);
  if (fi.hasNext()) {
    folder = fi.next();
    Logger.log("+ 6. 雲端資料夾「%s」已存在", folder_name);
  }
  else {
    Logger.log("- 6. 雲端資料夾「%s」不存在", folder_name);
    folder = DriveApp.createFolder(folder_name);
    Logger.log("+ 6. 雲端資料夾「%s」已建立", folder_name);
  }
  return folder;
}

// M7-備份附件
function AutoSave(folder_name, label_name, rule) {
  var parent_folder = GetFolder_(folder_name); // 2-建立雲端資料夾
  var threads = GmailApp.search(rule);
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var attachments = messages[j].getAttachments();
      var subjectName = messages[j].getSubject();
      //for (var k = 0; k < attachments.length; k++) {
        var attachmentBlob = attachments[0].copyBlob();
        var file = DriveApp.createFile(attachmentBlob);
        file.setName(subjectName);
        file.moveTo(parent_folder);
        Logger.log("+ 7. 「%s」（%s）已完成備份", label_name, subjectName);
      //}
    } 
    GmailApp.markThreadUnimportant(threads[i]);
  }
}