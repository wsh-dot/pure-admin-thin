import type {
  ReportBundle,
  ReportDocument,
  ReportPageData,
  ReportTreeNode,
  ReportWorkspaceContext,
  WorkbenchRow
} from "./types";

function createTablePage(
  id: string,
  title: string,
  pageNo: number,
  totalPages: number,
  projectName: string,
  columns: string[],
  rows: string[][],
  options: Partial<ReportPageData> = {}
): ReportPageData {
  return {
    id,
    title,
    templateType: options.templateType ?? "table",
    subtitle: options.subtitle ?? `工程名称:${projectName}`,
    pageNo,
    totalPages,
    table: {
      columns,
      rows
    },
    footerLeft: options.footerLeft ?? "编制：系统管理员",
    footerCenter: options.footerCenter,
    footerRight: options.footerRight ?? `第${pageNo}页      共${totalPages}页`,
    metaFields: options.metaFields,
    noteLines: options.noteLines,
    centerLines: options.centerLines,
    directoryItems: options.directoryItems,
    description: options.description
  };
}

function buildFeeCalcPages(
  prefix: string,
  projectName: string,
  title: string,
  totalPages: number
) {
  const sharedRows = [
    ["一", "直接费", "", "定额直接费+其他直接费", ""],
    ["(一)", "定额直接费", "", "人工费+材料费+机械费", ""],
    ["RGF", "人工费", "99.98", "定额人工费", ""],
    ["CLF", "材料费", "99.98", "定额材料费*材料调整系数", ""],
    ["JXF", "机械费", "100.53", "定额机械费*机械调整系数", ""]
  ];

  return Array.from({ length: totalPages }, (_, index) =>
    createTablePage(
      `${prefix}-page-${index + 1}`,
      title,
      index + 1,
      totalPages,
      projectName,
      ["费用代号", "费用项目名称", "费率%", "计算说明", "金额（元）"],
      [
        ...sharedRows,
        [
          `(${index + 1})`,
          `分段说明${index + 1}`,
          `${(index + 1) * 2.54}`,
          `第${index + 1}页示例计算口径`,
          ""
        ],
        ["ZZJ", "总造价", "", "综合费用合计", ""]
      ],
      {
        subtitle: `工程名称:${projectName}`,
        footerLeft: "编制：系统管理员(长庆油田分公司)"
      }
    )
  );
}

function buildApprovalPages(
  prefix: string,
  projectName: string
): ReportPageData[] {
  return [
    createTablePage(
      `${prefix}-page-1`,
      "工程预算审查审批表(审预表一)",
      1,
      2,
      projectName,
      ["字段", "内容", "字段", "内容"],
      [
        ["工程名称", projectName, "预算类别", "施工图预算"],
        ["编制单位", "长庆油田分公司", "预算编号", "003"],
        ["送审预算金额", "0.0万元", "审核预算金额", "0.0万元"]
      ],
      {
        templateType: "approval",
        centerLines: [
          "一、工程概况：",
          "二、审核依据：",
          "三、审核中处理的主要问题及造价调整的主要原因：",
          "四、其他需要说明的问题："
        ],
        footerRight: "第1页      共2页"
      }
    ),
    createTablePage(
      `${prefix}-page-2`,
      "工程预算审查审批表(审预表一)",
      2,
      2,
      projectName,
      ["续页字段", "内容"],
      [
        ["审核补充说明", "第二页用于展示审批表续页内容"],
        ["审核人", "系统管理员"],
        ["审核时间", "2026-04-23"]
      ],
      {
        templateType: "approval",
        centerLines: ["续页说明：", "当前为审批表续页 mock 内容。"],
        footerRight: "第2页      共2页"
      }
    )
  ];
}

function buildDocuments(
  projectName: string,
  projectCode: string
): ReportDocument[] {
  return [
    {
      id: "cover",
      label: "施工图预算封面",
      templateType: "cover",
      pages: [
        {
          id: "cover-page-1",
          title: "施工图预算封面",
          templateType: "cover",
          pageNo: 1,
          totalPages: 1,
          centerLines: [
            projectName,
            projectName,
            "施工图预算",
            projectCode,
            "共 册    第 册"
          ],
          footerRight: "二〇二六年四月二十三日"
        }
      ]
    },
    {
      id: "directory",
      label: "目录",
      templateType: "directory",
      pages: [
        {
          id: "directory-page-1",
          title: "目录",
          templateType: "directory",
          pageNo: 1,
          totalPages: 1,
          directoryItems: [
            { label: "施工图预算封面", page: 1 },
            { label: "目录", page: 2 },
            { label: "编制说明", page: 3 },
            { label: "总预算表", page: 4 },
            { label: "建筑安装费汇总表", page: 5 }
          ],
          footerRight: "第1页      共1页"
        }
      ]
    },
    {
      id: "compile-note",
      label: "编制说明",
      templateType: "narrative",
      pages: [
        {
          id: "compile-note-page-1",
          title: "编制说明",
          templateType: "narrative",
          pageNo: 1,
          totalPages: 1,
          centerLines: [
            `${projectName} 编制说明`,
            "1. 本报表为 mock 页面，用于还原项目报表原型。",
            "2. 后续可替换成真实报表数据和打印模板。",
            "3. 当前内容展示编制说明的排版和页脚位置。"
          ],
          footerRight: "第1页      共1页"
        }
      ]
    },
    {
      id: "budget-summary",
      label: "总预算表",
      templateType: "table",
      pages: [
        createTablePage(
          "budget-summary-page-1",
          "总预算表",
          1,
          1,
          projectName,
          ["序号", "项目及费用名称", "报审预算金额", "审核后预算金额", "备注"],
          [
            ["1", "第一部分 工程费用", "0.0", "0.0", ""],
            ["1.1", projectName, "0.0", "0.0", ""],
            ["2", "增值税", "0.0", "0.0", ""]
          ]
        )
      ]
    },
    {
      id: "build-install-summary",
      label: "建筑安装费汇总表",
      templateType: "table",
      pages: [
        createTablePage(
          "build-install-summary-page-1",
          "建筑安装费汇总表",
          1,
          1,
          projectName,
          [
            "序号",
            "概预算编号",
            "工程或费用名称",
            "设备费",
            "建筑工程费",
            "安装施工费",
            "主材费",
            "其他费用",
            "工程造价",
            "备注"
          ],
          [["I", "I", projectName, "", "", "", "", "", "", ""]]
        )
      ]
    },
    {
      id: "general-fee-calc",
      label: "一般安装工程取费计算表",
      templateType: "table",
      pages: buildFeeCalcPages(
        "general-fee-calc",
        projectName,
        "一般安装工程取费计算表",
        3
      )
    },
    {
      id: "earthwork-fee-calc",
      label: "人工土石方工程取费计算表",
      templateType: "table",
      pages: buildFeeCalcPages(
        "earthwork-fee-calc",
        projectName,
        "人工土石方工程取费计算表",
        1
      )
    },
    {
      id: "machine-earthwork-fee-calc",
      label: "机械土石方工程取费计算表",
      templateType: "table",
      pages: buildFeeCalcPages(
        "machine-earthwork-fee-calc",
        projectName,
        "机械土石方工程取费计算表",
        1
      )
    },
    {
      id: "other-civil-fee-calc",
      label: "其他土建工程取费计算表",
      templateType: "table",
      pages: buildFeeCalcPages(
        "other-civil-fee-calc",
        projectName,
        "其他土建工程取费计算表",
        1
      )
    },
    {
      id: "install-no-fee-calc",
      label: "安装不取费取费计算表",
      templateType: "table",
      pages: buildFeeCalcPages(
        "install-no-fee-calc",
        projectName,
        "安装不取费取费计算表",
        1
      )
    },
    {
      id: "construction-fee-summary",
      label: "建设安装工程取费汇总表",
      templateType: "table",
      pages: [
        createTablePage(
          "construction-fee-summary-page-1",
          "建设安装工程取费汇总表",
          1,
          1,
          projectName,
          ["项目", "人工费", "材料费", "机械费", "合计"],
          [[projectName, "0.0", "0.0", "0.0", "0.0"]]
        )
      ]
    },
    {
      id: "approval-one",
      label: "工程预算审查审批表(审预表一)",
      templateType: "approval",
      pages: buildApprovalPages("approval-one", projectName)
    },
    {
      id: "approval-two",
      label: "工程预算审查汇总表(审预表二)",
      templateType: "table",
      pages: [
        createTablePage(
          "approval-two-page-1",
          "长庆油田公司工程预算审查汇总表(审预表二)",
          1,
          1,
          projectName,
          [
            "编号",
            "项目及费用名称",
            "报审预算金额",
            "审定后预算金额",
            "增减额",
            "备注"
          ],
          [["1.1", projectName, "", "", "", ""]]
        )
      ]
    },
    {
      id: "approval-three",
      label: "工程预算审查记录表(审预表三)",
      templateType: "table",
      pages: [
        createTablePage(
          "approval-three-page-1",
          "工程预算审查记录表(审预表三)",
          1,
          1,
          projectName,
          ["序号", "审查事项", "说明", "结论"],
          [
            ["1", "资料完整性", "送审资料齐全", "通过"],
            ["2", "工程量核对", "当前为 mock 记录", "通过"]
          ]
        )
      ]
    },
    {
      id: "review-note",
      label: "编制说明（审后）",
      templateType: "narrative",
      pages: [
        {
          id: "review-note-page-1",
          title: "编制说明（审后）",
          templateType: "narrative",
          pageNo: 1,
          totalPages: 1,
          centerLines: [
            `${projectName} 审后编制说明`,
            "1. 审核意见已同步到当前 mock 报表。",
            "2. 后续可扩展为真实的审后编制说明页面。"
          ],
          footerRight: "第1页      共1页"
        }
      ]
    },
    {
      id: "design-fee-list",
      label: "设计费计算清单",
      templateType: "table",
      pages: [
        createTablePage(
          "design-fee-list-page-1",
          "设计费计算清单",
          1,
          1,
          projectName,
          ["序号", "设计项目", "计费基数", "费率", "金额"],
          [["1", "设计费", "0.00", "0%", "0.00"]]
        )
      ]
    },
    {
      id: "nonstandard-design-fee",
      label: "非标设备设计费详表",
      templateType: "table",
      pages: [
        createTablePage(
          "nonstandard-design-fee-page-1",
          "非标设备设计费详表",
          1,
          1,
          projectName,
          ["序号", "设备名称", "规格", "数量", "金额"],
          [["1", "非标设备", "示例规格", "1", "0.00"]]
        )
      ]
    },
    {
      id: "survey-fee",
      label: "勘察费计算主要工作量表",
      templateType: "table",
      pages: [
        createTablePage(
          "survey-fee-page-1",
          "勘察费计算主要工作量表",
          1,
          1,
          projectName,
          ["序号", "工作量名称", "单位", "数量", "备注"],
          [["1", "勘察工作量", "项", "1", "mock"]]
        )
      ]
    },
    {
      id: "material-machine-summary",
      label: "人工、材料、机械汇总表",
      templateType: "table",
      pages: [
        createTablePage(
          "material-machine-summary-page-1",
          "人工、材料、机械汇总表",
          1,
          1,
          projectName,
          ["分类", "名称", "单位", "数量", "合价"],
          [["人工", "综合工日", "工日", "1112.32", "188649.64"]]
        )
      ]
    },
    {
      id: "main-material-equipment-summary",
      label: "主材、设备汇总表",
      templateType: "table",
      pages: [
        createTablePage(
          "main-material-equipment-summary-page-1",
          "主材、设备汇总表",
          1,
          1,
          projectName,
          ["分类", "名称", "规格", "数量", "金额"],
          [["主材", "螺旋缝埋弧焊钢管", "DN300", "850.00", "158440.00"]]
        )
      ]
    },
    {
      id: "imported-equipment-summary",
      label: "进口设备汇总表",
      templateType: "table",
      pages: [
        createTablePage(
          "imported-equipment-summary-page-1",
          "进口设备汇总表",
          1,
          1,
          projectName,
          ["序号", "设备名称", "数量", "金额", "备注"],
          [["1", "进口设备示例", "1", "0.00", "当前为 mock"]]
        )
      ]
    },
    {
      id: "quantity-sheet",
      label: "工程量计算表",
      templateType: "table",
      pages: [
        createTablePage(
          "quantity-sheet-page-1",
          "工程量计算表",
          1,
          1,
          projectName,
          ["序号", "清单项目", "单位", "工程量", "备注"],
          [["1", "示例工程量", "项", "1.00", ""]]
        )
      ]
    }
  ];
}

function buildTree(itemLabel: string): ReportTreeNode[] {
  return [
    {
      id: `root-${itemLabel}`,
      label: `${itemLabel}预算报表(标准模板)`,
      children: [
        {
          id: "compile-group",
          label: "编制报表",
          children: [
            { id: "cover-node", label: "施工图预算封面", documentId: "cover" },
            { id: "directory-node", label: "目录", documentId: "directory" },
            {
              id: "compile-note-node",
              label: "编制说明",
              documentId: "compile-note"
            },
            {
              id: "budget-summary-node",
              label: "总预算表",
              documentId: "budget-summary"
            },
            {
              id: "build-install-summary-node",
              label: "建筑安装费汇总表",
              documentId: "build-install-summary"
            },
            {
              id: "general-fee-calc-node",
              label: "一般安装工程取费计算表",
              documentId: "general-fee-calc"
            },
            {
              id: "earthwork-fee-calc-node",
              label: "人工土石方工程取费计算表",
              documentId: "earthwork-fee-calc"
            },
            {
              id: "machine-earthwork-fee-calc-node",
              label: "机械土石方工程取费计算表",
              documentId: "machine-earthwork-fee-calc"
            },
            {
              id: "other-civil-fee-calc-node",
              label: "其他土建工程取费计算表",
              documentId: "other-civil-fee-calc"
            },
            {
              id: "install-no-fee-calc-node",
              label: "安装不取费取费计算表",
              documentId: "install-no-fee-calc"
            },
            {
              id: "construction-fee-summary-node",
              label: "建设安装工程取费汇总表",
              documentId: "construction-fee-summary"
            }
          ]
        },
        {
          id: "review-group",
          label: "审核报表",
          children: [
            {
              id: "approval-one-node",
              label: "工程预算审查审批表(审预表一)",
              documentId: "approval-one"
            },
            {
              id: "approval-two-node",
              label: "工程预算审查汇总表(审预表二)",
              documentId: "approval-two"
            },
            {
              id: "approval-three-node",
              label: "工程预算审查记录表(审预表三)",
              documentId: "approval-three"
            },
            {
              id: "review-note-node",
              label: "编制说明（审后）",
              documentId: "review-note"
            },
            {
              id: "design-fee-list-node",
              label: "设计费计算清单",
              documentId: "design-fee-list"
            },
            {
              id: "nonstandard-design-fee-node",
              label: "非标设备设计费详表",
              documentId: "nonstandard-design-fee"
            },
            {
              id: "survey-fee-node",
              label: "勘察费计算主要工作量表",
              documentId: "survey-fee"
            }
          ]
        },
        {
          id: "price-group",
          label: "价格报表",
          children: [
            {
              id: "material-machine-summary-node",
              label: "人工、材料、机械汇总表",
              documentId: "material-machine-summary"
            },
            {
              id: "main-material-equipment-summary-node",
              label: "主材、设备汇总表",
              documentId: "main-material-equipment-summary"
            },
            {
              id: "imported-equipment-summary-node",
              label: "进口设备汇总表",
              documentId: "imported-equipment-summary"
            },
            {
              id: "quantity-sheet-node",
              label: "工程量计算表",
              documentId: "quantity-sheet"
            }
          ]
        }
      ]
    }
  ];
}

function collectDescendantCostFiles(
  rows: WorkbenchRow[],
  source: WorkbenchRow
) {
  const children = new Map<string, WorkbenchRow[]>();

  rows.forEach(row => {
    if (!row.parentId) return;
    const bucket = children.get(row.parentId) ?? [];
    bucket.push(row);
    children.set(row.parentId, bucket);
  });

  const result: WorkbenchRow[] = [];
  const queue: WorkbenchRow[] = [source];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    const nextChildren = children.get(current.id) ?? [];
    nextChildren.forEach(child => {
      if (child.nodeType === "cost-file") {
        result.push(child);
      } else {
        queue.push(child);
      }
    });
  }

  return result;
}

function buildBundle(row: WorkbenchRow): ReportBundle {
  return {
    loadedItem: {
      id: row.id,
      rowId: row.id,
      label: row.projectName,
      sourceType: row.nodeType
    },
    tree: buildTree(row.projectName),
    documents: buildDocuments(row.projectName, row.projectCode)
  };
}

export function buildReportWorkspaceContext(
  sourceRow: WorkbenchRow,
  rows: WorkbenchRow[]
): ReportWorkspaceContext {
  if (sourceRow.nodeType === "cost-file") {
    return {
      entryMode: "cost-file",
      sourceRowId: sourceRow.id,
      bundles: [buildBundle(sourceRow)],
      defaultLoadedItemId: sourceRow.id
    };
  }

  const descendantCostFiles = collectDescendantCostFiles(rows, sourceRow);
  const targetRows = [sourceRow, ...descendantCostFiles];
  const bundles = targetRows.map(buildBundle);

  return {
    entryMode: "parent",
    sourceRowId: sourceRow.id,
    bundles,
    defaultLoadedItemId: sourceRow.id
  };
}
