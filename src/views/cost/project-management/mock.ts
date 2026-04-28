import type {
  AuditSection,
  PropertySchemaRow,
  PropertyTreeRow,
  WorkbenchRow,
  WorkbenchStageConfig,
  WorkbenchStageOption
} from "./types";

export const stageOptions: WorkbenchStageOption[] = [
  { key: "budget", label: "施工图预算" },
  { key: "tenderControl", label: "招标控制价" },
  { key: "settlement", label: "工程结算" },
  { key: "indicator", label: "造价指标" }
];

export const workTabs = [
  "项目管理",
  "其他扣相关费用",
  "项目工料机汇总",
  "项目报表",
  "典型工程",
  "编制说明"
] as const;

const fixedInfoSchema: PropertySchemaRow[] = [
  { id: "group-engineering", parentId: null, label: "工程信息" },
  {
    id: "systemNo",
    parentId: "group-engineering",
    label: "系统号",
    field: "systemNo"
  },
  {
    id: "projectNo",
    parentId: "group-engineering",
    label: "项目号",
    field: "projectNo"
  },
  {
    id: "projectCode",
    parentId: "group-engineering",
    label: "项目编号",
    field: "projectCode"
  },
  {
    id: "projectName",
    parentId: "group-engineering",
    label: "项目名称",
    field: "projectName"
  },
  {
    id: "compileType",
    parentId: "group-engineering",
    label: "编制类型",
    field: "compileType"
  },
  {
    id: "budgetCategory",
    parentId: "group-engineering",
    label: "预算类别",
    field: "budgetCategory"
  },
  {
    id: "approvalCode",
    parentId: "group-engineering",
    label: "审批编号",
    field: "approvalCode"
  },
  {
    id: "compileYear",
    parentId: "group-engineering",
    label: "编制年度",
    field: "compileYear"
  },
  {
    id: "buildCompany",
    parentId: "group-engineering",
    label: "建设单位",
    field: "buildCompany"
  },
  {
    id: "designCompany",
    parentId: "group-engineering",
    label: "设计单位",
    field: "designCompany"
  },
  {
    id: "projectCategory",
    parentId: "group-engineering",
    label: "项目类别",
    field: "projectCategory"
  },
  {
    id: "projectOwner",
    parentId: "group-engineering",
    label: "项目负责人",
    field: "projectOwner"
  },
  {
    id: "projectOwnerCert",
    parentId: "group-engineering",
    label: "项目负责人资格",
    field: "projectOwnerCert"
  },
  {
    id: "compileCompany",
    parentId: "group-engineering",
    label: "编制单位",
    field: "compileCompany"
  },
  {
    id: "compileDate",
    parentId: "group-engineering",
    label: "编制日期",
    field: "compileDate"
  },
  {
    id: "reviewCompany",
    parentId: "group-engineering",
    label: "审核单位",
    field: "reviewCompany"
  },
  {
    id: "reviewDate",
    parentId: "group-engineering",
    label: "审核日期",
    field: "reviewDate"
  },
  {
    id: "recheckUser",
    parentId: "group-engineering",
    label: "复核人",
    field: "recheckUser"
  },
  {
    id: "recheckCert",
    parentId: "group-engineering",
    label: "复核人资格",
    field: "recheckCert"
  },
  {
    id: "recheckSubmitDate",
    parentId: "group-engineering",
    label: "复核人提交",
    field: "recheckSubmitDate"
  },
  {
    id: "leaderUser",
    parentId: "group-engineering",
    label: "主管领导",
    field: "leaderUser"
  },
  {
    id: "leaderCert",
    parentId: "group-engineering",
    label: "主管领导资格",
    field: "leaderCert"
  }
];

const commonInfoValues = {
  systemNo: "SY-2026-01",
  projectNo: "XM-2026-001",
  compileType: "预算",
  budgetCategory: "施工图预算",
  approvalCode: "200 审预算 号",
  compileYear: "2026",
  buildCompany: "长庆油田分公司",
  designCompany: "石油勘察设计院",
  projectCategory: "站场安装",
  projectOwner: "王启明",
  projectOwnerCert: "ZJ-091255",
  compileCompany: "工程造价部",
  compileDate: "2026-04-22",
  reviewCompany: "工程造价部",
  reviewDate: "2026-04-23",
  recheckUser: "系统管理员",
  recheckCert: "FH-2026-009",
  recheckSubmitDate: "2026-04-24",
  leaderUser: "赵海峰",
  leaderCert: "LD-2026-115"
};

const baseColumns = [
  {
    id: "projectCode",
    title: "项目编号",
    field: "projectCode",
    minWidth: 148,
    treeNode: true
  },
  {
    id: "seq",
    title: "序号",
    field: "seq",
    width: 72,
    align: "center" as const
  },
  {
    id: "status",
    title: "状态",
    field: "status",
    width: 82,
    align: "center" as const
  },
  { id: "pricingLib", title: "计价库", field: "pricingLib", minWidth: 174 },
  { id: "projectName", title: "工程名称", field: "projectName", minWidth: 198 }
];

function reviewColumnGroup(extraChildren: any[]) {
  return {
    id: "review",
    title: "报审",
    headerAlign: "center" as const,
    children: [
      {
        id: "engineeringCost",
        title: "工程费用（元）",
        headerAlign: "center" as const,
        children: [
          {
            id: "subtotal",
            title: "小计",
            field: "subtotal",
            minWidth: 96,
            align: "right" as const
          },
          {
            id: "equipmentFee",
            title: "设备购置费",
            field: "equipmentFee",
            minWidth: 112,
            align: "right" as const
          },
          {
            id: "materialFee",
            title: "主要材料费",
            field: "materialFee",
            minWidth: 112,
            align: "right" as const
          },
          {
            id: "installFee",
            title: "安装费",
            field: "installFee",
            minWidth: 100,
            align: "right" as const
          },
          {
            id: "civilFee",
            title: "建筑工程费",
            field: "civilFee",
            minWidth: 112,
            align: "right" as const
          },
          ...extraChildren
        ]
      }
    ]
  };
}

function withCommonInfo(values: Record<string, string>) {
  return {
    ...commonInfoValues,
    ...values
  };
}

const budgetRows: WorkbenchRow[] = [
  {
    id: "budget-root",
    parentId: null,
    nodeType: "project",
    projectCode: "001",
    seq: "1",
    status: "编制",
    pricingLib: "",
    projectName: "test",
    subtotal: "2,450,000.00",
    equipmentFee: "320,000.00",
    materialFee: "1,180,000.00",
    installFee: "610,000.00",
    civilFee: "340,000.00",
    suppliedEquipmentFee: "58,000.00",
    suppliedMaterialFee: "126,000.00",
    otherFee: "72,000.00",
    totalCost: "2,522,000.00",
    vat: "227,000.00",
    infoValues: withCommonInfo({
      projectCode: "001",
      projectName: "test"
    }),
    auditNoteValues: {
      summary: "本项目为施工图预算阶段 mock 数据，当前用于页面原型还原。",
      basis: "依据《石油安装工程 2022 计价依据》及现行取费规则审核。",
      issue: "当前未接入真实审核数据，暂以示例文本占位。",
      extra: "后续接入真实接口后，可按节点保存审核意见。"
    }
  },
  {
    id: "budget-file",
    parentId: "budget-root",
    nodeType: "cost-file",
    projectCode: "0001",
    seq: "1.1",
    status: "编制",
    pricingLib: "[石油安装22]",
    projectName: "石油造价",
    subtotal: "1,265,300.00",
    equipmentFee: "168,200.00",
    materialFee: "632,400.00",
    installFee: "280,500.00",
    civilFee: "184,200.00",
    suppliedEquipmentFee: "31,000.00",
    suppliedMaterialFee: "86,300.00",
    otherFee: "33,900.00",
    totalCost: "1,299,200.00",
    vat: "116,928.00",
    infoValues: withCommonInfo({
      projectCode: "0001",
      projectName: "石油造价",
      projectNo: "XM-2026-001-01",
      systemNo: "SY-BUD-0001"
    }),
    auditNoteValues: {
      summary: "石油造价文件用于展示预算阶段的叶子节点效果。",
      basis: "按站场安装工程图纸及预算定额进行审核。",
      issue: "主要关注材料费、安装费与甲供材料金额拆分。",
      extra: "右键菜单和双击打开编制界面将在后续迭代补齐。"
    }
  }
];

const tenderRows: WorkbenchRow[] = [
  {
    id: "tender-root",
    parentId: null,
    nodeType: "project",
    projectCode: "0041",
    seq: "1",
    status: "编制",
    pricingLib: "",
    projectName: "test",
    subtotal: "3,020,000.00",
    equipmentFee: "462,000.00",
    materialFee: "1,264,000.00",
    installFee: "708,000.00",
    civilFee: "386,000.00",
    suppliedEquipmentFee: "96,000.00",
    suppliedMaterialFee: "142,000.00",
    otherFee: "88,000.00",
    totalCost: "3,108,000.00",
    vat: "279,720.00",
    infoValues: withCommonInfo({
      projectCode: "0041",
      projectName: "test",
      systemNo: "SY-TEN-0041",
      projectNo: "XM-2026-ZBKZ-0041"
    }),
    auditNoteValues: {
      summary: "招标控制价阶段，重点校核报审工程费用与其他费用组成。",
      basis: "依据招标控制价编制说明及当前审批编号进行审核。",
      issue: "主要问题集中在主要材料费、其他费用与增值税口径。",
      extra: "当前示例未引入合同及招标文件附件。"
    }
  },
  {
    id: "tender-child",
    parentId: "tender-root",
    nodeType: "single",
    projectCode: "0041-01",
    seq: "1.1",
    status: "编制",
    pricingLib: "[石油安装22]",
    projectName: "站场安装单项",
    subtotal: "2,018,000.00",
    equipmentFee: "286,000.00",
    materialFee: "856,000.00",
    installFee: "472,000.00",
    civilFee: "240,000.00",
    suppliedEquipmentFee: "64,000.00",
    suppliedMaterialFee: "84,000.00",
    otherFee: "42,000.00",
    totalCost: "2,060,000.00",
    vat: "185,400.00"
  }
];

const settlementRows: WorkbenchRow[] = [
  {
    id: "settlement-root",
    parentId: null,
    nodeType: "project",
    projectCode: "JS-001",
    seq: "1",
    status: "复核",
    pricingLib: "",
    projectName: "test",
    subtotal: "2,870,000.00",
    equipmentFee: "350,000.00",
    materialFee: "1,205,000.00",
    installFee: "690,000.00",
    civilFee: "405,000.00",
    suppliedEquipmentFee: "91,000.00",
    suppliedMaterialFee: "138,000.00",
    otherFee: "76,000.00",
    totalCost: "2,946,000.00",
    vat: "265,140.00",
    infoValues: withCommonInfo({
      projectCode: "JS-001",
      projectName: "test",
      systemNo: "SY-SET-0001",
      projectNo: "XM-2026-JS-001"
    }),
    auditNoteValues: {
      summary: "工程结算阶段关注结算编号、合同报审序与复核口径。",
      basis: "依据结算送审资料、合同清单及审批编号进行审核。",
      issue: "重点核查甲供设备费、甲供主材费与结算归档数据一致性。",
      extra: "结算附件文件和台账入口将在下一阶段补充。"
    }
  },
  {
    id: "settlement-child",
    parentId: "settlement-root",
    nodeType: "single",
    projectCode: "JS-001-01",
    seq: "1.1",
    status: "复核",
    pricingLib: "[石油安装22]",
    projectName: "结算子项"
  }
];

const indicatorRows: WorkbenchRow[] = [
  {
    id: "indicator-root",
    parentId: null,
    nodeType: "project",
    projectCode: "ZJ-8801",
    seq: "1",
    status: "分析",
    pricingLib: "",
    projectName: "test",
    subtotal: "1,620,000.00",
    equipmentFee: "188,000.00",
    materialFee: "712,000.00",
    installFee: "390,000.00",
    civilFee: "330,000.00",
    vat: "145,800.00",
    infoValues: withCommonInfo({
      projectCode: "ZJ-8801",
      projectName: "test",
      systemNo: "SY-IND-8801",
      projectNo: "XM-2026-ZB-8801"
    }),
    auditNoteValues: {
      summary: "造价指标阶段展示简化指标树表和固定属性信息。",
      basis: "依据指标库版本与当前分析口径进行审核说明。",
      issue: "当前仅展示指标类 mock 数据，不包含历史对标维度。",
      extra: "后续可在该阶段接入指标分析图表。"
    }
  },
  {
    id: "indicator-child",
    parentId: "indicator-root",
    nodeType: "single",
    projectCode: "ZJ-8801-01",
    seq: "1.1",
    status: "分析",
    pricingLib: "[石油安装22]",
    projectName: "指标子项"
  }
];

export const stageConfigs: WorkbenchStageConfig[] = [
  {
    key: "budget",
    label: "施工图预算",
    expandAll: true,
    columns: [
      ...baseColumns,
      reviewColumnGroup([
        {
          id: "suppliedEquipmentFee",
          title: "其中甲供设备费",
          field: "suppliedEquipmentFee",
          minWidth: 138,
          align: "right" as const
        },
        {
          id: "suppliedMaterialFee",
          title: "其中甲供主材费",
          field: "suppliedMaterialFee",
          minWidth: 138,
          align: "right" as const
        }
      ]),
      {
        id: "otherFee",
        title: "其他费用",
        field: "otherFee",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "totalCost",
        title: "总造价",
        field: "totalCost",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "vat",
        title: "增值税",
        field: "vat",
        minWidth: 100,
        align: "right" as const
      }
    ],
    rows: budgetRows
  },
  {
    key: "tenderControl",
    label: "招标控制价",
    columns: [
      ...baseColumns,
      reviewColumnGroup([
        {
          id: "suppliedEquipmentFee",
          title: "其中甲供设备费",
          field: "suppliedEquipmentFee",
          minWidth: 138,
          align: "right" as const
        },
        {
          id: "suppliedMaterialFee",
          title: "其中甲供主材费",
          field: "suppliedMaterialFee",
          minWidth: 138,
          align: "right" as const
        }
      ]),
      {
        id: "otherFee",
        title: "其他费用",
        field: "otherFee",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "totalCost",
        title: "总造价",
        field: "totalCost",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "vat",
        title: "增值税",
        field: "vat",
        minWidth: 100,
        align: "right" as const
      }
    ],
    rows: tenderRows
  },
  {
    key: "settlement",
    label: "工程结算",
    columns: [
      ...baseColumns,
      reviewColumnGroup([
        {
          id: "suppliedEquipmentFee",
          title: "其中甲供设备费",
          field: "suppliedEquipmentFee",
          minWidth: 138,
          align: "right" as const
        },
        {
          id: "suppliedMaterialFee",
          title: "其中甲供主材费",
          field: "suppliedMaterialFee",
          minWidth: 138,
          align: "right" as const
        }
      ]),
      {
        id: "otherFee",
        title: "其他费用",
        field: "otherFee",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "totalCost",
        title: "总造价",
        field: "totalCost",
        minWidth: 100,
        align: "right" as const
      },
      {
        id: "vat",
        title: "增值税",
        field: "vat",
        minWidth: 100,
        align: "right" as const
      }
    ],
    rows: settlementRows
  },
  {
    key: "indicator",
    label: "造价指标",
    columns: [
      ...baseColumns,
      reviewColumnGroup([]),
      {
        id: "vat",
        title: "增值税",
        field: "vat",
        minWidth: 100,
        align: "right" as const
      }
    ],
    rows: indicatorRows
  }
];

export function buildPropertyRows(
  row?: WorkbenchRow | null
): PropertyTreeRow[] {
  const values = {
    ...commonInfoValues,
    projectCode: row?.infoValues?.projectCode ?? row?.projectCode ?? "--",
    projectName: row?.infoValues?.projectName ?? row?.projectName ?? "--",
    systemNo: row?.infoValues?.systemNo ?? commonInfoValues.systemNo,
    projectNo: row?.infoValues?.projectNo ?? commonInfoValues.projectNo,
    compileType: row?.infoValues?.compileType ?? commonInfoValues.compileType,
    budgetCategory:
      row?.infoValues?.budgetCategory ?? commonInfoValues.budgetCategory,
    approvalCode:
      row?.infoValues?.approvalCode ?? commonInfoValues.approvalCode,
    compileYear: row?.infoValues?.compileYear ?? commonInfoValues.compileYear,
    buildCompany:
      row?.infoValues?.buildCompany ?? commonInfoValues.buildCompany,
    designCompany:
      row?.infoValues?.designCompany ?? commonInfoValues.designCompany,
    projectCategory:
      row?.infoValues?.projectCategory ?? commonInfoValues.projectCategory,
    projectOwner:
      row?.infoValues?.projectOwner ?? commonInfoValues.projectOwner,
    projectOwnerCert:
      row?.infoValues?.projectOwnerCert ?? commonInfoValues.projectOwnerCert,
    compileCompany:
      row?.infoValues?.compileCompany ?? commonInfoValues.compileCompany,
    compileDate: row?.infoValues?.compileDate ?? commonInfoValues.compileDate,
    reviewCompany:
      row?.infoValues?.reviewCompany ?? commonInfoValues.reviewCompany,
    reviewDate: row?.infoValues?.reviewDate ?? commonInfoValues.reviewDate,
    recheckUser: row?.infoValues?.recheckUser ?? commonInfoValues.recheckUser,
    recheckCert: row?.infoValues?.recheckCert ?? commonInfoValues.recheckCert,
    recheckSubmitDate:
      row?.infoValues?.recheckSubmitDate ?? commonInfoValues.recheckSubmitDate,
    leaderUser: row?.infoValues?.leaderUser ?? commonInfoValues.leaderUser,
    leaderCert: row?.infoValues?.leaderCert ?? commonInfoValues.leaderCert
  };

  return fixedInfoSchema.map(item => ({
    id: item.id,
    parentId: item.parentId,
    label: item.label,
    value: item.field ? (values[item.field as keyof typeof values] ?? "--") : ""
  }));
}

export function buildAuditSections(row?: WorkbenchRow | null): AuditSection[] {
  const values = row?.auditNoteValues ?? {};
  return [
    {
      id: "summary",
      title: "一、工程概况：",
      content:
        values.summary ?? "当前阶段暂无审核概况，后续可对接真实项目概述。"
    },
    {
      id: "basis",
      title: "二、审核依据：",
      content: values.basis ?? "当前阶段暂无审核依据，后续可维护依据清单。"
    },
    {
      id: "issue",
      title: "三、审核中处理的主要问题及造价调整的主要原因：",
      content:
        values.issue ?? "当前阶段暂无问题记录，后续可根据审核过程动态写入。"
    },
    {
      id: "extra",
      title: "四、其他需要说明的问题：",
      content:
        values.extra ?? "当前阶段暂无补充说明，后续可在这里展示特殊审核意见。"
    }
  ];
}
