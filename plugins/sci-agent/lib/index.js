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
    dir: 'sci-literature-reading-extraction',
    name: 'sci-literature-reading-extraction',
    description:
      '文献阅读与信息抽取：文档/图表解析、结论与数据提取、证据溯源、公式解析、多文档比较、结构化笔记、方法复现、数据清洗、知识图谱。当需要稳定产出可核验信息时使用。',
  },
  {
    dir: 'sci-literature-search-systematic',
    name: 'sci-literature-search-systematic',
    description:
      '文献检索与筛选：学术检索、问题驱动检索、筛选排序、引文追踪、多库联合、覆盖与遗漏分析、系统检索纳排、质量评价、跨语言与专利检索。当需要可复现检索与证据清单时使用。',
  },
  {
    dir: 'sci-knowledge-library-ops',
    name: 'sci-knowledge-library-ops',
    description:
      '科研知识库与资料管理：文件管理、智能检索、自动分类、知识库问答、批注与知识沉淀。当需要组织科研资料并支持可追溯检索/问答时使用。',
  },
  {
    dir: 'sci-data-analysis-pipeline',
    name: 'sci-data-analysis-pipeline',
    description:
      '科研数据分析：数据清洗、统计分析与解读、可视化、代码生成执行、多步骤分析、数据库查询。当需要可复现地从数据得到结论与图表时使用。',
  },
  {
    dir: 'sci-experiment-design-analysis',
    name: 'sci-experiment-design-analysis',
    description:
      '实验方案与参数优化：方案生成、可行性评估、参数优化建议、方案比较、结果解释与异常分析。当需要设计/评估/优化实验方案时使用。',
  },
  {
    dir: 'sci-research-synthesis-review',
    name: 'sci-research-synthesis-review',
    description:
      '研究综合与审查：综述/系统综述、前沿趋势、选题评估，以及论文质量、引用、方法统计、逻辑与合规审查。当需要从文献产生综合判断与审查意见时使用。',
  },
  {
    dir: 'sci-academic-writing-workflow',
    name: 'sci-academic-writing-workflow',
    description:
      '学术写作全流程：论文写作、润色、格式模板、引用管理、章节写作、审稿回复、翻译双语、LaTeX、基金/开题、长文档、思维导图。当需要产出或修改学术文本时使用。',
  },
  {
    dir: 'sci-paper-to-slides-deck',
    name: 'sci-paper-to-slides-deck',
    description:
      '学术演示与 PPT：论文转 PPT、PPT 生成编辑、汇报组织、模板适配。当需要把论文变成可讲可交付演示文稿时使用。',
  }
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
