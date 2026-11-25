/**
 * Scientific agent skills — general-purpose guidance for real research work.
 *
 * Bundles six domain skills: skill design, literature reading, academic
 * writing, scientific figures, academic presentations, and agent pipelines.
 * Contest-scoring playbooks are intentionally kept out of this public plugin.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PROVIDER_NAME = 'sci-agent'
const RANK = 600
const SKILLS_ROOT = new URL('../assets/skills/', import.meta.url)

const ENTRIES = [
  {
    dir: 'sci-skill-design',
    name: 'sci-skill-design',
    description:
      '为科研任务编写可被 Agent 调用、可被他人复核的 Skill：目录结构、输入输出契约、证据溯源、健壮性与自检、可编辑产物规范。当需要把某类科研流程沉淀成可复用 Skill 时使用。',
  },
  {
    dir: 'sci-literature-reading',
    name: 'sci-literature-reading',
    description:
      '文献阅读与信息抽取方法论：图表解析、结论与数据抽取、证据核验、公式解析、方法复现与数据清洗的可靠做法。当需要从论文中稳定获取可核验信息时使用。',
  },
  {
    dir: 'sci-academic-writing',
    name: 'sci-academic-writing',
    description:
      '学术写作方法论：章节写作、结构与逻辑优化、结果与讨论、审稿回复、翻译与双语、基金/开题、长文档一致性与写作评测工具。当需要产出或修改学术文本时使用。',
  },
  {
    dir: 'sci-figures',
    name: 'sci-figures',
    description:
      '科研图形方法论：示意图、机制图、装置图、数据图表与图形摘要的设计与交付——可编辑矢量源文件、真实导出、逐元素证据溯源与渲染字体陷阱。当需要绘制可复核的科研图时使用。',
  },
  {
    dir: 'sci-presentations',
    name: 'sci-presentations',
    description:
      '学术演示方法论：论文转汇报幻灯片、汇报内容组织、模板与格式适配——页级主张、证据定位、导出校验与可编辑性。当需要制作学术 PPT 时使用。',
  },
  {
    dir: 'sci-workbench',
    name: 'sci-workbench',
    description:
      '阅读/写作工作台与评测工具方法论：客户端会话闭环（定位、批注、修订、回执、版本、导出）与 Benchmark 评测体系（题卡、运行器、评分表、可追溯报告）。当需要做文献/写作工作台或科研评测工具时使用。',
  },
  {
    dir: 'sci-agent-pipelines',
    name: 'sci-agent-pipelines',
    description:
      '用 Agent 批量构建科研技能与自动化流水线：任务书设计、云端/本地协作、打包白名单、确定性自检、版本回退与故障恢复。当需要把科研工作流批量化、自动化时使用。',
  },
  {
    dir: 'sci-competition-arena',
    name: 'sci-competition-arena',
    description:
      '科研 Agent 技能竞赛方法论：赛制与额度约束、赛前基线与选题、节奏分配、评分口径与排名计算、限时提交运维。当参加或组织限时科研 Agent 技能竞赛时使用。',
  },
  {
    dir: 'sci-adversarial-skill-generation',
    name: 'sci-adversarial-skill-generation',
    description:
      '对抗式 Agent Skill 生成与评测：多候选生成、异构评委、门槛门控、弱点回喂、多轮进化与收敛。当需要在有限时间批量提升 Skill 质量时使用。',
  },
  {
    dir: 'sci-skill-submission-ops',
    name: 'sci-skill-submission-ops',
    description:
      'Skill 包提交与评测运维：preflight 门禁、trace 与单根布局、额度与 429/去重/超时处理、attempt 状态机、队列停滞诊断与投递台账。当稳定可审计地批量提交时使用。',
  },
  {
    dir: 'sci-dual-agent-collaboration',
    name: 'sci-dual-agent-collaboration',
    description:
      '双 Agent/双账号协同协议：分工矩阵、差异化交付包、文件式 INBOX、cleared 清单门控、终分互报。当两个执行体协作限时项目/竞赛时使用。',
  },
]

/** Strip a leading YAML frontmatter block; the body alone is rendered to the model. */
function stripFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) return normalized
  const end = normalized.indexOf('\n---\n', 4)
  if (end === -1) return normalized
  return normalized.slice(end + 5).replace(/^\n+/, '')
}

function candidateOf(entry) {
  return {
    name: entry.name,
    description: entry.description,
    invocation: { modelInvocable: true, userInvocable: true },
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: {
      kind: 'directory',
      path: fileURLToPath(new URL(`${entry.dir}/`, SKILLS_ROOT)),
    },
    rank: RANK,
    locator: new URL(`${entry.dir}/SKILL.md`, SKILLS_ROOT),
  }
}

const provider = {
  name: PROVIDER_NAME,
  list() {
    return Promise.resolve(ENTRIES.map(candidateOf))
  },
  async get(candidate) {
    const entry = ENTRIES.find((item) => item.name === candidate.name)
    if (entry === undefined) return undefined
    const content = await readFile(new URL(`${entry.dir}/SKILL.md`, SKILLS_ROOT), 'utf8')
    return {
      name: entry.name,
      description: entry.description,
      invocation: { modelInvocable: true, userInvocable: true },
      provider: PROVIDER_NAME,
      source: 'bundled',
      resourceBase: {
        kind: 'directory',
        path: fileURLToPath(new URL(`${entry.dir}/`, SKILLS_ROOT)),
      },
      content: stripFrontmatter(content),
    }
  },
}

/** Cordis plugin name; keeps the loader entry id and provider id distinct. */
const name = 'sci-agent'
const inject = ['skills']

function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}

export { apply, inject, name }
