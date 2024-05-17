export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // <type>枚举
    'type-enum': [
      2,
      'always',
      [
        'add', // 添加依赖
        'delete', // 删除代码/文件
        'feat', // 增加新功能
        'fix', // 修复bug
        'style', // 样式修改不影响逻辑
        'merge', // 合并分支
        'perfect', // 功能完善
        'docs', // 修改文档
        'refactor', // 代码重构
        'test', // 单元测试修改
        'ci', // 持续继承
        'release', // 发布
        'deploy', // 部署
        'chore', // 更改配置文件
        'revert', // 版本回退
        'wip' // 正在开发中
      ]
    ],
  }
}
