# MailCat

## 描述
MailCat 是一個以 Google Apps Scripts 開發的一套規則管理器。不同於以往需要使用者自行在設定中添加的篩選器，MailCat ~~直接讓你複製貼上就搞定~~，適合擁有多家網路銀行帳戶的人。

## 功能
### 1. 標記銀行信件 🔖
- 目前支援：
  - `013 國泰世華`
  - `803 聯邦銀行`
  - `805 遠東銀行`
  - `807 永豐銀行`
  - `812 台新銀行`
  - `822 中國信託`
  - `824 連線銀行`

### 2. 標記特定信件 🔖
- 銀行信件分成三類：
    - `0.登入通知`
    - `1.交易通知`
    - `2.電子帳單`

### 3. 定時刪除信件 ⏳
- 主要針對登入通知、~~驗證信~~的信件。
- 使用者可以決定信件要在多少天後自動刪除。

### 4. 自動封存信件 🗃️
- 主要針對登入通知、交易通知的信件。
- MailCat 會將已讀的信件進行封存。

### 5. 備份附件 ☁️
- 主要針對電子帳單的信件。
- MailCat 會將資料夾建立在 Google Drive 的根目錄下。

## 使用方法
1. 首先，Clone 此專案。
    
    ```
    git clone https://github.com/HeiTang/MailCat.git
    ```

2. 登入 Google 帳戶並且開啟 [Apps Script](https://script.google.com/home/start) 頁面。 

3. 建立新專案，然後將 `.gs` 檔案複製進去並存檔。
  
  - config.gs：自行刪除不需要的銀行。
    
    ```
    var Bank = [
      {
        "name": "國泰世華",
        "label_name": "013 國泰世華",
        "domain_name": "cathaybk",
        "email":[
          "service@pxbillrc01.cathaybk.com.tw", 
          "webservice@cathaybk.com.tw",
          "e-notification@ebill1.cathaysec.com.tw", 
          "Service@edm2.cathaysec.com.tw", 
          "service@news.mybank.com.tw", 
          "etrade@cathaysec.com.tw", 
          "cathaybk@news.mybank.com.tw",
          "Service@edm1.cathaysec.com.tw"
        ]
      },
      (以下部份省略...)
    ```
4. 選擇「觸發條件」點選「新增觸發條件」。

    | 執行的功能 | 部署作業 | 活動來源 | 時間型觸發條件類型 | 小時間隔 | 
    | :-------------: | :--------------: | :---------: | :----------------: | :--------: |
    | Main        | 上端 | 時間驅動 | 分鐘計時器 | 每 5 分鐘 |
    | AutoRemove  | 上端 | 時間驅動 | 日計時器  | 午夜到上午一點 |
    | AutoArchive | 上端 | 時間驅動 | 小時計時器 | 每小時 |
    | AutoSave    | 上端 | 時間驅動 | 日計時器  | 午夜到上午一點 |
    > 參考設定，可自行調整。
