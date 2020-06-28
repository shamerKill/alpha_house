# 数据流转流程

``` mermaid
graph TD
  view -->|通知数据获取| reducers
  reducers -->|异步处理| Observable{redux-observable - epics}
  Observable -->|获取本地数据| realm
  Observable -->|获取网络数据数据| fetch
  realm -->|通知数据更新| value
  value -->|通知视图更新| view
  fetch -->|通知本地数据更新| realm
  fetch -->|通知视图更新| value
```