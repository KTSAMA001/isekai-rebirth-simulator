
## 生命阶段迁移完成

### 统计信息
- 总事件数: 675
- birth 事件: 63（保留 minAge/maxAge）
- 种族专属事件: 293（保留 minAge/maxAge）
- 已迁移事件: 319
  - 单阶段事件: 148
  - 跨阶段事件: 171
- 跳过事件: 0

### 查看变化
所有事件文件已更新。使用以下命令查看差异：
```
git diff data/sword-and-magic/events/
```

### 验证
运行测试确保迁移正确：
```
npm test
```
