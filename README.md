# 科研 Agent 技能经验插件（DSH Plugins）

把真实科研工作中可复用的 **Agent 技能经验**，按板块整理为可直接安装的 [DSH（DeepSeek Harness）](https://github.com/deepseek-ai/deepseek-harness) 插件。安装后，Agent 会在技能目录中看到这些经验技能，按需加载。

> 本仓库只包含**面向真实科研工作**的方法与规范（可迁移、可复核），不包含任何竞赛得分技巧。
> 竞赛相关的额度/评分/排名/队列博弈类经验保存在**私有配套仓库**，不在此发布。

## 一、插件

| 插件 | 主题 | 技能数 |
|---|---|---:|
| `sci-agent` | 科研 Agent 技能经验：文献阅读 / 学术写作 / 科研图形 / 学术演示 / 工作台与评测 / Skill 设计 / 云端流水线 | 7 |

## 二、技能清单

| 技能 | 用途 |
|---|---|
| `sci-skill-design` | 为科研任务编写可被 Agent 调用、可被他人复核的 Skill：目录、契约、证据溯源、健壮性、自检 |
| `sci-literature-reading` | 文献阅读与信息抽取：图表解析、字段抽取、证据核验、公式解析、方法复现、数据清洗 |
| `sci-academic-writing` | 学术写作：章节写作、结构逻辑、结果讨论、审稿回复、翻译双语、基金/开题、长文档一致性 |
| `sci-figures` | 科研图形：示意图/机制图/装置图/数据图/图形摘要；可编辑 SVG + 真实 PDF + 证据映射 + 字体陷阱 |
| `sci-presentations` | 学术演示：论文转 PPT、汇报组织、模板适配；页级主张、来源定位、导出校验 |
| `sci-workbench` | 阅读/写作工作台与评测工具：客户端会话闭环（定位、批注、修订、回执、版本、导出）+ Benchmark（题卡、运行器、评分表、可追溯报告） |
| `sci-agent-pipelines` | 用 Agent 批量构建科研技能与自动化流水线：任务书、打包白名单、确定性自检、回退与恢复 |

## 三、设计原则

1. **可复核优先**：结论、数值、图元都能指回原始材料的逐字片段；"未报告"与"不存在"严格区分。
2. **可复现**：同一输入两次运行结果一致；纯标准库、离线、退出码恒 0、先写 partial 再完善。
3. **可编辑**：图形给 SVG（文字可编辑、分层），文档给可打开的源文件，同时给导出件。
4. **缺口显式**：材料不足写 `insufficient_evidence` / `pending_human`，不编造数据、引用或结论。
5. **环境鲁棒**：目标环境可能没有中文字体、没有网络、没有第三方库——关键标签英文优先、PDF 内建矢量字体、脚本零依赖。

## 四、安装

### 方式 A：插件市场索引

本仓库根目录 `index.json` 提供 DSH 插件市场索引；插件以 git source 固定到一个提交，索引指向该提交即可安装。

### 方式 B：手动安装

```bash
# 1) 克隆
git clone https://github.com/Richard-He-happy/sci-agent.git
# 2) 复制技能到 DSH 技能目录
cp -r sci-agent/plugins/sci-agent/assets/skills/* "$DSH_HOME/skills/"
```

## 五、仓库结构

```text
index.json                       # 插件市场索引（format 1）
scripts/build-index.mjs          # 生成索引（以仓库 + 提交为参数）
scripts/validate.mjs             # 校验插件/技能结构与命名
plugins/sci-agent/    # 公开插件
  ├── package.json               # dsh.bundle.patch → cordis.patch.yml
  ├── cordis.patch.yml
  ├── lib/index.js               # 技能 provider
  ├── assets/skills/             # 7 个领域技能
  ├── locale/{zh,en}.json
  ├── icon.svg
  └── README.md
```

## 六、范围与个人信息

- 只包含科研工作方法与规范；不含竞赛评分、额度、排名等竞赛特有信息。
- 已清除个人信息与平台内部标识（姓名、团队名、账号、凭据、密钥、本地路径、内网地址、第三方参赛者身份、平台内部 ID 等），不含资金或用量信息。
- 示例均为构造示例，非真实案例结果。

## 七、许可

MIT，见 `LICENSE`。

## 新增：竞赛作战与 Agent 运维（2026-11 P4 沉淀）

- `sci-competition-arena`：限时科研 Agent 技能竞赛方法论（赛制/额度/节奏/排名）
- `sci-adversarial-skill-generation`：对抗式生成 + 异构评委 + 门槛门控的多轮提分流水线
- `sci-skill-submission-ops`：提交与评测运维（preflight、429/去重/超时、attempt 状态机、队列停滞诊断）
- `sci-dual-agent-collaboration`：双 Agent/双账号协同协议（分工、差异包、INBOX、cleared 清单、终分互报）

