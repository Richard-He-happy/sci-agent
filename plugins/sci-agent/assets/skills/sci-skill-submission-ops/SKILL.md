---
name: sci-skill-submission-ops
description: Agent Skill 包提交与评测运维：preflight 门禁、单根布局、trace 与元数据、额度与 429/重复/超时处理、attempt 状态机、队列停滞诊断、投递台账。当需要稳定、可审计地向评测平台提交大量 Skill 包时使用。
version: 1.0.0
license: MIT
---

# 适用场景

平台（示例：玻尔 Playground）对每题有提交额度上限，评测队列/写回可能异常。目标是"每一发都有目的、可追溯、不浪费额度"。

## 1. 提交前门禁（每条都过）

- 目录：单根（outputs/submission 或包根），无 `__pycache__`/`.pyc`/`GITHUB_URL.txt`
- SKILL.md：frontmatter 完整（name/description/version/license），正文有流程/契约/证据/SELFTEST/降级/增益
- 引用：SKILL.md 提到的每个脚本/资源都真实存在
- trace：真实 Agent 会话 trace，`trace validate` 通过
- 体积：单包 ≤150KB、文件数 ≤ 合理范围；过大先裁

## 2. 提交与幂等

- 每次提交前把 题号/包版本/purpose 写入台账
- 同一（题, 包 sha）重复提交会被去重拦截 → 改动后 sha 变化才重投
- 遇到 429：
  - `contest_quota_exceeded`：该题额度已满，停止该题
  - `Too Many Requests`（频率）：指数退避 1/3/10/30s，仍失败则停 30-60 分钟
  - 上传失败但记录已建：`attempt` 可能为 `evaluation_failed`，不扣额；可用 `--attempt-id` 只补传 bundle
- 不要并发轰同一账号接口；并行度 ≤3，提交间隔 ≥8-15s

## 3. 状态机与台账

- 状态：queued → evaluating → scored / failed；失败不扣额（多数平台）
- 台账字段：key / attempt / 包 / created / status / score / 备注
- 每日汇总：新增 final、pending 年龄、failed 数、队列 frontier（最新 final attempt id）

## 4. 队列停滞诊断

- 记录平台返回的 `latest_final_id` 与队列 stage；若 frontier 数小时不动而 n_final 小增 → 写回停滞
- 诊断证据：同一 attempt 的 `scoringState`/`workerStatus`、`updatedAt` 冻结、score 为 null
- 应对：停止新增投递、保留证据、等待恢复；恢复后按"已验证包"顺序补投

## 5. 常见失败

- 盲投未评测包 → 额度耗尽
- 同一包反复重投 → 去重/429
- 忽略 attempt 状态 → 把 failed 当 pending 等
- 不记录 frontier → 平台停滞数小时才发现
