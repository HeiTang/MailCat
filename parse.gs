/**
 * @param {SpreadsheetApp.Sheet} sheet
 * @param {any[][]} rows
 */
function appendRows(sheet, rows) {
  if (rows.length == 0) return
  if (rows.length == 1) {
    sheet.appendRow(rows[0])
    return
  }

  sheet.getRange(
    sheet.getLastRow() + 1,
    1,
    rows.length,
    rows[0].length
  ).setValues(rows)

}

// 國泰世華
/**
 * @param {(string[]) => SpreadsheetApp.Sheet} initSheet
 * @param {string} rule
 * @param {string} parsedLabel
 * @return {string[][]} Transactions
 */
function Parse013(initSheet, rule, parsedLabel) {
  // parse data
  const keys = [
    "卡別",
    "行動卡號後4碼",
    "授權日期",
    "授權時間",
    "消費地區",
    "消費金額",
    "商店名稱",
    "消費類別",
    "備註",
  ]

  const sheet = initSheet(keys)

  let results = []

  for (let thread of GmailApp.search(rule)) {
    let body = thread.getMessages()[0].getBody()
    const $ = Cheerio.load(body)

    $('tbody').each(function () {
      let t = $(this)

      // 過濾掉嵌套的 table 和不包含刷卡訊息的 tbody
      if (t.find('table').length != 0 || !t.text().includes('卡別')) return

      let result = {}
      let tr = t.find('tr')
      for (let i = 0; i < tr.length; i += 2) {
        let labels = tr.eq(i).children()
        let values = tr.eq(i + 1).children()
        for (let j = 0; j < labels.length; j++) {
          result[labels.eq(j).text()] = values.eq(j).text().trim()
        }
      }
      results.push(keys.map(key => result[key]))
    })

    const label = GmailApp.getUserLabelByName(parsedLabel);
    thread.addLabel(label)
  }

  appendRows(sheet, results)

  return results
}
