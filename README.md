<div align="center">
  <h1>MailCat</h1>
  
  <a href="https://github.com/HeiTang/MailCat/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/HeiTang/MailCat?color=orange">
  </a>
  <a href="https://github.com/HeiTang/MailCat/releases">
    <img src="https://img.shields.io/github/v/release/HeiTang/MailCat?color=brightgreen">
  </a>
  <a href="https://github.com/HeiTang/MailCat">
    <img src="https://img.shields.io/github/repo-size/HeiTang/MailCat">
  </a>
  <a href="https://github.com/HeiTang/MailCat">
    <img src="https://img.shields.io/github/stars/HeiTang/MailCat?color=ff69b4">
  </a>
  <br><br>
  <img src="https://raw.githubusercontent.com/HeiTang/MailCat/main/demo/page.png">
  <p>- - -</p>
  <p><i>“ Gmail 自動化管理工具！ ”</i></p>
</div>

## 說明

MailCat 是一個以 Google Apps Script 開發的一套規則管理器。不同於以往需要使用者自行在 Gmail 設定中添加的篩選器，MailCat ~~直接讓你複製貼上就搞定~~，適合擁有多家網路銀行帳戶的人。

## 功能

### 1. 標記銀行/電子支付信件 🔖

- 目前支援：
  - 銀行
    - `008 華南銀行`
    - `009 彰化銀行`
    - `013 國泰世華`
    - `053 台中銀行`
    - `700 中華郵政`
    - `803 聯邦銀行`
    - `805 遠東銀行`
    - `807 永豐銀行`
    - `812 台新銀行`
    - `822 中國信託`
    - `823 將來銀行`
    - `824 連線銀行`
  - 電子支付
    - `397 歐付寶`
    - `000 PayPal`

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

1. 登入 Google 帳戶並且開啟 [Apps Script](https://script.google.com/home/start) 頁面。

2. 建立新專案，然後將 [`main.gs`](https://github.com/HeiTang/MailCat/blob/main/main.gs) 和 [`bank.gs`](https://github.com/HeiTang/MailCat/blob/main/bank.gs) 檔案複製進去並存檔。

3. 在 `bank.gs` 中的 `BankList_Own` 中填入需管理的銀行代碼（請參考上述所支援銀行）。

   範例：

   ```
   var BankList_Own = ['008', '013', '803', '805', '807', '812', '822', '824'];
   ```

4. 選擇「觸發條件」點選「新增觸發條件」。

   |    執行的功能    | 部署作業 | 活動來源 | 時間型觸發條件類型 |    小時間隔    |
   | :--------------: | :------: | :------: | :----------------: | :------------: |
   |    Bank_Label    |   上端   | 時間驅動 |     小時計時器     |     每小時     |
   | Bank_AutoRemove  |   上端   | 時間驅動 |      日計時器      | 午夜到上午一點 |
   | Bank_AutoArchive |   上端   | 時間驅動 |     小時計時器     |     每小時     |
   |  Bank_AutoSave   |   上端   | 時間驅動 |      日計時器      | 午夜到上午一點 |

   > 參考設定，可自行調整。

5. 如果尚未支援您的銀行，歡迎來發個 PR ~(=^‥^)/
