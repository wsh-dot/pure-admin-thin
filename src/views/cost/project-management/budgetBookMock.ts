import type { WorkbenchColumn } from "./types";
import type {
  BudgetBookExtraFeeRow,
  BudgetBookFeeMainCategoryRow,
  BudgetBookFeeMainCategoryState,
  BudgetBookFeeMainSettingRow,
  BudgetBookFeeProgramRow,
  BudgetBookFeeRateRow,
  BudgetBookFormulaRow,
  BudgetBookLaborRow,
  BudgetBookMainMaterialRow,
  BudgetBookNodeDetailState,
  BudgetBookQuotaContent,
  BudgetBookTreeRow,
  BudgetBookWorkspaceContext
} from "./budgetBookTypes";
import type { BudgetBookRoutePayload } from "./workspaceState";

const budgetBookNodeIds = {
  project: "budget-book-project",
  quota: "budget-book-quota",
  mainMaterialLeaf: "budget-book-main-material-leaf"
} as const;

const mainColumns: WorkbenchColumn[] = [
  {
    id: "code",
    title: "编号",
    field: "code",
    minWidth: 132,
    treeNode: true
  },
  {
    id: "marker",
    title: "标识",
    field: "marker",
    width: 82,
    align: "center"
  },
  { id: "name", title: "名称", field: "name", minWidth: 300 },
  { id: "unit", title: "单位", field: "unit", width: 72, align: "center" },
  {
    id: "formula",
    title: "工程量计算式",
    field: "formula",
    minWidth: 110
  },
  {
    id: "quantity",
    title: "工程量",
    field: "quantity",
    minWidth: 96,
    align: "right"
  },
  {
    id: "price",
    title: "单价",
    field: "price",
    minWidth: 96,
    align: "right"
  },
  {
    id: "laborUnitPrice",
    title: "人工单价",
    field: "laborUnitPrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "materialUnitPrice",
    title: "材料单价",
    field: "materialUnitPrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "machineUnitPrice",
    title: "机械单价",
    field: "machineUnitPrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "mainMaterialUnitPrice",
    title: "主材单价",
    field: "mainMaterialUnitPrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "equipmentUnitPrice",
    title: "设备单价",
    field: "equipmentUnitPrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "quotaInclusivePrice",
    title: "定额含价",
    field: "quotaInclusivePrice",
    minWidth: 102,
    align: "right"
  },
  {
    id: "feeCategory",
    title: "取费类别",
    field: "feeCategory",
    minWidth: 102
  },
  {
    id: "feeTotal",
    title: "取费合价",
    field: "feeTotal",
    minWidth: 102,
    align: "right"
  },
  {
    id: "laborTotal",
    title: "人工合价",
    field: "laborTotal",
    minWidth: 102,
    align: "right"
  },
  {
    id: "materialTotal",
    title: "材料合价",
    field: "materialTotal",
    minWidth: 102,
    align: "right"
  },
  {
    id: "machineTotal",
    title: "机械合价",
    field: "machineTotal",
    minWidth: 102,
    align: "right"
  },
  {
    id: "mainMaterialTotal",
    title: "主材合价",
    field: "mainMaterialTotal",
    minWidth: 102,
    align: "right"
  },
  {
    id: "equipmentTotal",
    title: "设备合价",
    field: "equipmentTotal",
    minWidth: 102,
    align: "right"
  },
  { id: "remark", title: "备注", field: "remark", minWidth: 102 }
];

const laborColumns: WorkbenchColumn[] = [
  { id: "code", title: "编号", field: "code", width: 92 },
  { id: "name", title: "名称", field: "name", minWidth: 228 },
  { id: "type", title: "类型", field: "type", width: 82, align: "center" },
  { id: "spec", title: "规格", field: "spec", width: 82, align: "center" },
  { id: "unit", title: "单位", field: "unit", width: 74, align: "center" },
  {
    id: "quotaPrice",
    title: "定额价",
    field: "quotaPrice",
    minWidth: 96,
    align: "right"
  },
  {
    id: "marketPrice",
    title: "市场价",
    field: "marketPrice",
    minWidth: 96,
    align: "right"
  },
  {
    id: "quotaConsumption",
    title: "定额消耗",
    field: "quotaConsumption",
    minWidth: 100,
    align: "right"
  },
  {
    id: "actualConsumption",
    title: "实际消耗",
    field: "actualConsumption",
    minWidth: 100,
    align: "right"
  },
  {
    id: "quantity",
    title: "用量",
    field: "quantity",
    minWidth: 96,
    align: "right"
  },
  {
    id: "amount",
    title: "金额（元）",
    field: "amount",
    minWidth: 108,
    align: "right"
  },
  { id: "remark", title: "备注", field: "remark", minWidth: 96 }
];

const mainMaterialColumns: WorkbenchColumn[] = [
  { id: "code", title: "编号", field: "code", width: 96 },
  { id: "name", title: "名称", field: "name", minWidth: 200 },
  { id: "type", title: "类型", field: "type", width: 72, align: "center" },
  { id: "spec", title: "规格", field: "spec", width: 120, align: "center" },
  { id: "unit", title: "单位", field: "unit", width: 74, align: "center" },
  {
    id: "amountQty",
    title: "数量",
    field: "amountQty",
    width: 96,
    align: "right"
  },
  {
    id: "taxIncludedPrice",
    title: "含税市场价",
    field: "taxIncludedPrice",
    minWidth: 112,
    align: "right"
  },
  {
    id: "taxExcludedPrice",
    title: "除税市场价",
    field: "taxExcludedPrice",
    minWidth: 112,
    align: "right"
  },
  {
    id: "actualContent",
    title: "实际含量",
    field: "actualContent",
    minWidth: 102,
    align: "right"
  },
  {
    id: "actualUsage",
    title: "实际用量",
    field: "actualUsage",
    minWidth: 102,
    align: "right"
  },
  {
    id: "importedEquipment",
    title: "引进设备",
    field: "importedEquipment",
    minWidth: 102,
    align: "center"
  },
  {
    id: "exchangeRate",
    title: "汇率",
    field: "exchangeRate",
    width: 74,
    align: "right"
  },
  {
    id: "amount",
    title: "金额（元）",
    field: "amount",
    minWidth: 96,
    align: "right"
  },
  {
    id: "quotaContent",
    title: "定额含量",
    field: "quotaContent",
    minWidth: 96,
    align: "right"
  },
  { id: "remark", title: "备注", field: "remark", minWidth: 96 }
];

const formulaColumns: WorkbenchColumn[] = [
  { id: "param", title: "参数", field: "param", width: 120 },
  { id: "description", title: "说明", field: "description", minWidth: 180 },
  {
    id: "expression",
    title: "工程量计算式",
    field: "expression",
    minWidth: 260
  },
  {
    id: "quantity",
    title: "工程量",
    field: "quantity",
    width: 100,
    align: "right"
  }
];

const extraFeeColumns: WorkbenchColumn[] = [
  { id: "code", title: "编号", field: "code", width: 110 },
  { id: "name", title: "名称", field: "name", minWidth: 220 },
  { id: "factor", title: "系数", field: "factor", width: 108, align: "right" },
  {
    id: "laborShare",
    title: "人工费占%",
    field: "laborShare",
    width: 110,
    align: "right"
  },
  {
    id: "materialShare",
    title: "材料费占%",
    field: "materialShare",
    width: 112,
    align: "right"
  },
  {
    id: "machineShare",
    title: "机械费占%",
    field: "machineShare",
    width: 112,
    align: "right"
  },
  {
    id: "otherShare",
    title: "其它费占%",
    field: "otherShare",
    width: 112,
    align: "right"
  },
  {
    id: "laborFee",
    title: "人工费",
    field: "laborFee",
    width: 108,
    align: "right"
  },
  {
    id: "materialFee",
    title: "材料费",
    field: "materialFee",
    width: 108,
    align: "right"
  },
  {
    id: "machineFee",
    title: "机械费",
    field: "machineFee",
    width: 108,
    align: "right"
  },
  {
    id: "otherFee",
    title: "其它费",
    field: "otherFee",
    width: 108,
    align: "right"
  },
  {
    id: "total",
    title: "合计",
    field: "total",
    width: 108,
    align: "right"
  }
];

const budgetRowsTemplate: BudgetBookTreeRow[] = [
  {
    id: budgetBookNodeIds.project,
    parentId: null,
    nodeType: "project",
    code: "测试",
    marker: "工程",
    name: "测试11111",
    unit: "",
    formula: "",
    quantity: "",
    price: "",
    laborUnitPrice: "",
    materialUnitPrice: "",
    machineUnitPrice: "",
    mainMaterialUnitPrice: "",
    equipmentUnitPrice: "",
    quotaInclusivePrice: "",
    feeCategory: "",
    feeTotal: "",
    laborTotal: "",
    materialTotal: "",
    machineTotal: "",
    mainMaterialTotal: "",
    equipmentTotal: "",
    remark: ""
  },
  {
    id: budgetBookNodeIds.quota,
    parentId: budgetBookNodeIds.project,
    nodeType: "quota",
    code: "3-4",
    marker: "定额",
    name: "低压管道安装 有缝钢管(螺纹连接),DN32",
    unit: "10m",
    formula: "",
    quantity: "",
    price: "",
    laborUnitPrice: "45.28",
    materialUnitPrice: "0.34",
    machineUnitPrice: "0.11",
    mainMaterialUnitPrice: "",
    equipmentUnitPrice: "",
    quotaInclusivePrice: "",
    feeCategory: "一般安装工程",
    feeTotal: "",
    laborTotal: "",
    materialTotal: "",
    machineTotal: "",
    mainMaterialTotal: "",
    equipmentTotal: "",
    remark: ""
  },
  {
    id: budgetBookNodeIds.mainMaterialLeaf,
    parentId: budgetBookNodeIds.quota,
    nodeType: "leaf",
    leafType: "mainMaterial",
    code: "6269",
    marker: "主材",
    name: "低压碳钢管",
    unit: "m",
    formula: "0.0",
    quantity: "",
    price: "",
    laborUnitPrice: "",
    materialUnitPrice: "",
    machineUnitPrice: "",
    mainMaterialUnitPrice: "",
    equipmentUnitPrice: "",
    quotaInclusivePrice: "",
    feeCategory: "",
    feeTotal: "",
    laborTotal: "",
    materialTotal: "",
    machineTotal: "",
    mainMaterialTotal: "",
    equipmentTotal: "",
    remark: ""
  }
];

const parentLaborRowsTemplate: BudgetBookLaborRow[] = [
  {
    id: "parent-labor-1",
    code: "1",
    name: "综合工日",
    type: "人工",
    spec: "",
    unit: "工日",
    quotaPrice: "169.6",
    marketPrice: "169.6",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-2",
    code: "342",
    name: "乙炔气",
    type: "材料",
    spec: "",
    unit: "kg",
    quotaPrice: "27.44",
    marketPrice: "27.44",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-3",
    code: "344",
    name: "氧气",
    type: "材料",
    spec: "",
    unit: "m3",
    quotaPrice: "3.19",
    marketPrice: "3.19",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-4",
    code: "3229",
    name: "尼龙砂轮片,Φ400",
    type: "材料",
    spec: "",
    unit: "片",
    quotaPrice: "19.03",
    marketPrice: "19.03",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-5",
    code: "3609",
    name: "其他材料费",
    type: "材料",
    spec: "",
    unit: "%",
    quotaPrice: "",
    marketPrice: "",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-6",
    code: "4474",
    name: "电动套丝机,TQ3A",
    type: "机械",
    spec: "",
    unit: "台班",
    quotaPrice: "23.89",
    marketPrice: "23.89",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "parent-labor-7",
    code: "4501",
    name: "砂轮切割机,φ500",
    type: "机械",
    spec: "",
    unit: "台班",
    quotaPrice: "14.1",
    marketPrice: "14.1",
    quotaConsumption: "",
    actualConsumption: "",
    quantity: "",
    amount: "",
    remark: ""
  }
];

const quotaLaborRowsTemplate: BudgetBookLaborRow[] = [
  {
    id: "quota-labor-1",
    code: "1",
    name: "综合工日",
    type: "人工",
    spec: "",
    unit: "工日",
    quotaPrice: "169.6",
    marketPrice: "169.6",
    quotaConsumption: "0.267",
    actualConsumption: "0.267",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-2",
    code: "342",
    name: "乙炔气",
    type: "材料",
    spec: "",
    unit: "kg",
    quotaPrice: "27.44",
    marketPrice: "27.44",
    quotaConsumption: "0.005",
    actualConsumption: "0.005",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-3",
    code: "344",
    name: "氧气",
    type: "材料",
    spec: "",
    unit: "m3",
    quotaPrice: "3.19",
    marketPrice: "3.19",
    quotaConsumption: "0.013",
    actualConsumption: "0.013",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-4",
    code: "3229",
    name: "尼龙砂轮片,Φ400",
    type: "材料",
    spec: "",
    unit: "片",
    quotaPrice: "19.03",
    marketPrice: "19.03",
    quotaConsumption: "0.008",
    actualConsumption: "0.008",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-5",
    code: "3609",
    name: "其他材料费",
    type: "材料",
    spec: "",
    unit: "%",
    quotaPrice: "",
    marketPrice: "",
    quotaConsumption: "3",
    actualConsumption: "3",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-6",
    code: "4474",
    name: "电动套丝机,TQ3A",
    type: "机械",
    spec: "",
    unit: "台班",
    quotaPrice: "23.89",
    marketPrice: "23.89",
    quotaConsumption: "0.003",
    actualConsumption: "0.003",
    quantity: "",
    amount: "",
    remark: ""
  },
  {
    id: "quota-labor-7",
    code: "4501",
    name: "砂轮切割机,φ500",
    type: "机械",
    spec: "",
    unit: "台班",
    quotaPrice: "14.1",
    marketPrice: "14.1",
    quotaConsumption: "0.003",
    actualConsumption: "0.003",
    quantity: "",
    amount: "",
    remark: ""
  }
];

const mainMaterialRowsTemplate: BudgetBookMainMaterialRow[] = [
  {
    id: "main-material-1",
    code: "6269",
    name: "低压碳钢管",
    type: "主材",
    spec: "",
    unit: "m",
    amountQty: "",
    taxIncludedPrice: "",
    taxExcludedPrice: "",
    actualContent: "10",
    actualUsage: "",
    importedEquipment: "",
    exchangeRate: "",
    amount: "",
    quotaContent: "10",
    remark: ""
  }
];

const formulaRowsTemplate: BudgetBookFormulaRow[] = [
  {
    id: "formula-1",
    param: "",
    description: "",
    expression: "0.0",
    quantity: "",
    accumulate: true
  }
];

const feeProgramRowsTemplate: BudgetBookFeeProgramRow[] = [
  {
    id: "fee-direct",
    parentId: null,
    feeCode: "--",
    feeItem: "直接费",
    base: "（一） + （二）",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额直接费+其他直接费",
    printable: true
  },
  {
    id: "fee-install",
    parentId: "fee-direct",
    feeCode: "（一）",
    feeItem: "定额直接费",
    base: "RGF+CLF+JXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "人工费+材料费+机械费",
    printable: true
  },
  {
    id: "fee-rgf",
    parentId: "fee-install",
    feeCode: "RGF",
    feeItem: "人工费",
    base: "DERGF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额人工费",
    printable: true
  },
  {
    id: "fee-clf",
    parentId: "fee-install",
    feeCode: "CLF",
    feeItem: "材料费",
    base: "(1) + (2) + (3) + (4)",
    rate: "99.98",
    amount: "",
    excluded: false,
    description: "[（1） + （2） + （3） + （4）]材料调整系数",
    printable: true
  },
  {
    id: "fee-clf-1",
    parentId: "fee-clf",
    feeCode: "(1)",
    feeItem: "定额材料费",
    base: "DECLF",
    rate: "",
    amount: "",
    excluded: false,
    description: "预算值",
    printable: true
  },
  {
    id: "fee-clf-2",
    parentId: "fee-clf",
    feeCode: "(2)",
    feeItem: "材料矿区运杂费",
    base: "(2.1) + (2.2)",
    rate: "",
    amount: "",
    excluded: false,
    description: "(2.1) + (2.2)",
    printable: true
  },
  {
    id: "fee-clf-2-1",
    parentId: "fee-clf-2",
    feeCode: "(2.1)",
    feeItem: "定额计价材料",
    base: "(1)",
    rate: "2.5",
    amount: "",
    excluded: false,
    description: "定额材料费*材料调整系数",
    printable: true
  },
  {
    id: "fee-clf-2-2",
    parentId: "fee-clf-2",
    feeCode: "(2.2)",
    feeItem: "主材计价材料",
    base: "",
    rate: "2.5",
    amount: "",
    excluded: false,
    description: "主材材料矿区运杂费率",
    printable: true
  },
  {
    id: "fee-jxf",
    parentId: "fee-install",
    feeCode: "JXF",
    feeItem: "机械费",
    base: "DEJXF",
    rate: "100.53",
    amount: "",
    excluded: false,
    description: "定额机械费*机械调整系数",
    printable: true
  },
  {
    id: "fee-tax",
    parentId: null,
    feeCode: "SJ",
    feeItem: "税金",
    base: "ZZS_ZC+ZZS_SB+ZZS_AZ",
    rate: "",
    amount: "",
    excluded: false,
    description: "主材费增值税+设备费增值税+安装施工费增值税",
    printable: true
  }
];

const feeRateRowsTemplate: BudgetBookFeeRateRow[] = [
  {
    id: "fee-rate-1",
    tag: "",
    feeRateCode: "sp_fl_cltz",
    name: "材料调整系数",
    rate: "99.98",
    fixed: false
  },
  {
    id: "fee-rate-2",
    tag: "",
    feeRateCode: "sp_fl_jxtz",
    name: "机械调整系数",
    rate: "100.53",
    fixed: false
  },
  {
    id: "fee-rate-3",
    tag: "",
    feeRateCode: "sp_FL_CL",
    name: "定额计价材料矿区运杂费率",
    rate: "2.5",
    fixed: false
  },
  {
    id: "fee-rate-4",
    tag: "",
    feeRateCode: "sp_FL_ZC",
    name: "主契材料矿区运杂费率",
    rate: "2.5",
    fixed: false
  },
  {
    id: "fee-rate-5",
    tag: "",
    feeRateCode: "sp_FL_SB",
    name: "设备矿区运杂费率",
    rate: "1",
    fixed: false
  },
  {
    id: "fee-rate-6",
    tag: "",
    feeRateCode: "sp_FL_GD",
    name: "长输光管矿区运杂费率",
    rate: "2.5",
    fixed: false
  },
  {
    id: "fee-rate-7",
    tag: "",
    feeRateCode: "sp_FL_QT",
    name: "其他直接费率",
    rate: "0",
    fixed: false
  },
  {
    id: "fee-rate-8",
    tag: "",
    feeRateCode: "sp_FL_JJ",
    name: "间接费率",
    rate: "0",
    fixed: false
  }
];

const extraFeeRowsTemplate: BudgetBookExtraFeeRow[] = [
  {
    id: "extra-fee-1",
    code: "sy3-2",
    name: "脚手架搭拆费（第三册）",
    factor: "0.1",
    laborShare: "50.00",
    materialShare: "50.00",
    machineShare: "0.00",
    otherShare: "0.00",
    laborFee: "0.00",
    materialFee: "0.00",
    machineFee: "0.00",
    otherFee: "0.00",
    total: "0.00"
  }
];

const quotaContentTemplate: BudgetBookQuotaContent = {
  heading:
    "第三册 工艺管道安装工程\\n第一章 油气处理、石油化工工艺管道安装\\n第一节 管道安装\\n一、低压管道安装\\n1.有缝钢管(螺纹连接)",
  description: "工作内容：管子切口、套丝、管口连接，管道安装。"
};

const leafQuotaContentTemplate: BudgetBookQuotaContent = {
  heading: "当前选中主材叶子节点",
  description: "该叶子节点默认定位到主材设备标签，可查看当前主材的单条明细。"
};

const feeMainCategoryRowsTemplate: BudgetBookFeeMainCategoryRow[] = [
  { id: "fee-main-general", name: "一般安装工程", totalAmount: "" },
  { id: "fee-main-manual-earth", name: "人工土石方工程", totalAmount: "" },
  { id: "fee-main-machine-earth", name: "机械土石方工程", totalAmount: "" },
  { id: "fee-main-other-civil", name: "其他土建工程", totalAmount: "" },
  { id: "fee-main-install-no-fee", name: "安装不取费", totalAmount: "" }
];

const feeMainBaseSettingRowsTemplate: BudgetBookFeeMainSettingRow[] = [
  { id: "fee-setting-1", item: "工程所在地", value: "甘肃庆阳地区" },
  { id: "fee-setting-2", item: "费率标准", value: "石油安装工程费率标准2022" },
  { id: "fee-setting-3", item: "工程类别", value: "站场工程" },
  { id: "fee-setting-4", item: "工程类型", value: "II类" },
  { id: "fee-setting-5", item: "企业类别", value: "石油企业" },
  { id: "fee-setting-6", item: "地形", value: "平原地区" },
  { id: "fee-setting-7", item: "距企业基地", value: "≤25KM" },
  { id: "fee-setting-8", item: "主耍材料矿区运输距离", value: "≤100KM" },
  { id: "fee-setting-9", item: "定额计价材料矿区运输距离", value: "≤100KM" },
  {
    id: "fee-setting-10",
    item: "设备矿区运输距离(不含长输光管)",
    value: "≤100KM"
  },
  { id: "fee-setting-11", item: "长输光管矿区运输距离", value: "≤100KM" },
  { id: "fee-setting-12", item: "机械调整系数", value: "2023年" },
  { id: "fee-setting-13", item: "税金", value: "计" }
];

const feeMainGeneralRowsTemplate: BudgetBookFeeProgramRow[] = [
  ...feeProgramRowsTemplate,
  {
    id: "fee-general-extra-1",
    parentId: "fee-tax",
    feeCode: "ZZS_ZC",
    feeItem: "主材费增值税",
    base: "ZZS_GZC",
    rate: "13",
    amount: "",
    excluded: false,
    description: "国内主材增值税",
    printable: true
  }
];

const feeMainManualEarthRowsTemplate: BudgetBookFeeProgramRow[] = [
  {
    id: "fee-manual-direct",
    parentId: null,
    feeCode: "--",
    feeItem: "直接费",
    base: "（一）+QT+XC",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额直接费+其他直接费+现场经费",
    printable: true
  },
  {
    id: "fee-manual-install",
    parentId: "fee-manual-direct",
    feeCode: "（一）",
    feeItem: "定额直接费",
    base: "RGF+CLF+JXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "人工费+材料费+机械费",
    printable: true
  },
  {
    id: "fee-manual-rgf",
    parentId: "fee-manual-install",
    feeCode: "RGF",
    feeItem: "人工费",
    base: "DERGF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额人工费",
    printable: true
  },
  {
    id: "fee-manual-clf",
    parentId: "fee-manual-install",
    feeCode: "CLF",
    feeItem: "材料费",
    base: "DECLF*sp_fl_cltz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额材料费*材料调整系数",
    printable: true
  },
  {
    id: "fee-manual-jxf",
    parentId: "fee-manual-install",
    feeCode: "JXF",
    feeItem: "机械费",
    base: "DEJXF*sp_fl_jxtz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额机械费*机械调整系数",
    printable: true
  },
  {
    id: "fee-manual-qt",
    parentId: "fee-manual-direct",
    feeCode: "QT",
    feeItem: "其他直接费",
    base: "RGF",
    rate: "5.59",
    amount: "",
    excluded: false,
    description: "人工费*费率",
    printable: true
  },
  {
    id: "fee-manual-xc",
    parentId: "fee-manual-direct",
    feeCode: "XC",
    feeItem: "现场经费",
    base: "RGF",
    rate: "15.83",
    amount: "",
    excluded: false,
    description: "人工费*费率",
    printable: true
  },
  {
    id: "fee-manual-indirect",
    parentId: null,
    feeCode: "二",
    feeItem: "间接费",
    base: "RGF",
    rate: "17.69",
    amount: "",
    excluded: false,
    description: "人工费*费率",
    printable: true
  },
  {
    id: "fee-manual-profit",
    parentId: null,
    feeCode: "LR",
    feeItem: "利润",
    base: "RGF",
    rate: "9.31",
    amount: "",
    excluded: false,
    description: "人工费*费率",
    printable: true
  },
  {
    id: "fee-manual-safe",
    parentId: null,
    feeCode: "AQSC",
    feeItem: "安全生产费",
    base: "RGF",
    rate: "2.2",
    amount: "",
    excluded: false,
    description: "人工费*费率",
    printable: true
  },
  {
    id: "fee-manual-tax",
    parentId: null,
    feeCode: "SJ",
    feeItem: "税金",
    base: "ZZS_JZ",
    rate: "",
    amount: "",
    excluded: false,
    description: "建筑工程增值税",
    printable: true
  },
  {
    id: "fee-manual-tax-1",
    parentId: "fee-manual-tax",
    feeCode: "ZZS_JZ",
    feeItem: "建筑工程费增值税",
    base: "--+二+LR+AQSC",
    rate: "9",
    amount: "",
    excluded: false,
    description: "(直接费+间接费+利润+安全生产费)",
    printable: true
  },
  {
    id: "fee-manual-total",
    parentId: null,
    feeCode: "JZGCF",
    feeItem: "总造价",
    base: "JZGCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "建筑工程费",
    printable: true
  }
];

const feeMainMachineEarthRowsTemplate: BudgetBookFeeProgramRow[] = [
  {
    id: "fee-machine-direct",
    parentId: null,
    feeCode: "--",
    feeItem: "直接费",
    base: "（一）",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额直接费",
    printable: true
  },
  {
    id: "fee-machine-install",
    parentId: "fee-machine-direct",
    feeCode: "（一）",
    feeItem: "定额直接费",
    base: "RGF+CLF+JXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "人工费+材料费+机械费",
    printable: true
  },
  {
    id: "fee-machine-rgf",
    parentId: "fee-machine-install",
    feeCode: "RGF",
    feeItem: "人工费",
    base: "DERGF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额人工费",
    printable: true
  },
  {
    id: "fee-machine-clf",
    parentId: "fee-machine-install",
    feeCode: "CLF",
    feeItem: "材料费",
    base: "DECLF*sp_fl_cltz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额材料费*材料调整系数",
    printable: true
  },
  {
    id: "fee-machine-jxf",
    parentId: "fee-machine-install",
    feeCode: "JXF",
    feeItem: "机械费",
    base: "DEJXF*sp_fl_jxtz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额机械费*机械调整系数",
    printable: true
  },
  {
    id: "fee-machine-qt",
    parentId: null,
    feeCode: "QT",
    feeItem: "其他直接费",
    base: "（一）",
    rate: "2.42",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-machine-xc",
    parentId: null,
    feeCode: "XC",
    feeItem: "现场经费",
    base: "（一）",
    rate: "7.08",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-machine-indirect",
    parentId: null,
    feeCode: "二",
    feeItem: "间接费",
    base: "（一）",
    rate: "7.63",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-machine-profit",
    parentId: null,
    feeCode: "LR",
    feeItem: "利润",
    base: "（一）",
    rate: "3.26",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-machine-safe",
    parentId: null,
    feeCode: "AQSC",
    feeItem: "安全生产费",
    base: "（一）",
    rate: "1.8",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-machine-tax",
    parentId: null,
    feeCode: "SJ",
    feeItem: "税金",
    base: "ZZS_JZ",
    rate: "",
    amount: "",
    excluded: false,
    description: "建筑工程增值税",
    printable: true
  },
  {
    id: "fee-machine-tax-1",
    parentId: "fee-machine-tax",
    feeCode: "ZZS_JZ",
    feeItem: "建筑工程费增值税",
    base: "--+二+LR+AQSC",
    rate: "9",
    amount: "",
    excluded: false,
    description: "(直接费+间接费+利润+安全生产费)",
    printable: true
  },
  {
    id: "fee-machine-total",
    parentId: null,
    feeCode: "ZZJ",
    feeItem: "总造价",
    base: "JZGCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "建筑工程费",
    printable: true
  }
];

const feeMainOtherCivilRowsTemplate: BudgetBookFeeProgramRow[] = [
  {
    id: "fee-civil-direct",
    parentId: null,
    feeCode: "--",
    feeItem: "直接费",
    base: "（一）+QT+XC",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额直接费+其他直接费+现场经费",
    printable: true
  },
  {
    id: "fee-civil-install",
    parentId: "fee-civil-direct",
    feeCode: "（一）",
    feeItem: "定额直接费",
    base: "RGF+CLF+JXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "人工费+材料费+机械费",
    printable: true
  },
  {
    id: "fee-civil-rgf",
    parentId: "fee-civil-install",
    feeCode: "RGF",
    feeItem: "人工费",
    base: "DERGF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额人工费",
    printable: true
  },
  {
    id: "fee-civil-clf",
    parentId: "fee-civil-install",
    feeCode: "CLF",
    feeItem: "材料费",
    base: "DECLF*sp_fl_cltz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额材料费*材料调整系数",
    printable: true
  },
  {
    id: "fee-civil-jxf",
    parentId: "fee-civil-install",
    feeCode: "JXF",
    feeItem: "机械费",
    base: "DEJXF*sp_fl_jxtz",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额机械费*机械调整系数",
    printable: true
  },
  {
    id: "fee-civil-zcf",
    parentId: "fee-civil-install",
    feeCode: "ZCF_1",
    feeItem: "主材费(不含指标主材费)",
    base: "BZZCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "预算值",
    printable: true
  },
  {
    id: "fee-civil-qt",
    parentId: null,
    feeCode: "QT",
    feeItem: "其他直接费",
    base: "（一）",
    rate: "3.17",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-civil-xc",
    parentId: null,
    feeCode: "XC",
    feeItem: "现场经费",
    base: "（一）",
    rate: "7.45",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-civil-indirect",
    parentId: null,
    feeCode: "二",
    feeItem: "间接费",
    base: "（一）",
    rate: "10.24",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-civil-profit",
    parentId: null,
    feeCode: "LR",
    feeItem: "利润",
    base: "（一）",
    rate: "3.26",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-civil-safe",
    parentId: null,
    feeCode: "AQSC",
    feeItem: "安全生产费",
    base: "（一）",
    rate: "1.9",
    amount: "",
    excluded: false,
    description: "定额直接费*费率",
    printable: true
  },
  {
    id: "fee-civil-jg",
    parentId: null,
    feeCode: "JG_ZCF",
    feeItem: "甲供主材费",
    base: "J_ZCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "甲供主材费",
    printable: true
  },
  {
    id: "fee-civil-tax",
    parentId: null,
    feeCode: "SJ",
    feeItem: "税金",
    base: "ZZS_ZC+ZZS_JZ",
    rate: "",
    amount: "",
    excluded: false,
    description: "主材费增值税+建筑工程费增值税",
    printable: true
  },
  {
    id: "fee-civil-tax-1",
    parentId: "fee-civil-tax",
    feeCode: "ZZS_ZC",
    feeItem: "主材费增值税",
    base: "ZZS_GZC",
    rate: "",
    amount: "",
    excluded: false,
    description: "国内主材增值税",
    printable: true
  },
  {
    id: "fee-civil-tax-2",
    parentId: "fee-civil-tax-1",
    feeCode: "ZZS_GZC",
    feeItem: "甲供主材增值税",
    base: "JG_ZCF",
    rate: "13",
    amount: "",
    excluded: false,
    description: "甲供主材费*费率",
    printable: true
  },
  {
    id: "fee-civil-total",
    parentId: null,
    feeCode: "ZZJ",
    feeItem: "总造价",
    base: "JZGCF+ZCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "建筑工程费+主材费",
    printable: true
  }
];

const feeMainInstallNoFeeRowsTemplate: BudgetBookFeeProgramRow[] = [
  {
    id: "fee-no-direct",
    parentId: null,
    feeCode: "--",
    feeItem: "直接费",
    base: "RGF+CLF+JXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "人工费+材料费+机械费",
    printable: true
  },
  {
    id: "fee-no-rgf",
    parentId: "fee-no-direct",
    feeCode: "RGF",
    feeItem: "人工费",
    base: "DERGF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额人工费",
    printable: true
  },
  {
    id: "fee-no-clf",
    parentId: "fee-no-direct",
    feeCode: "CLF",
    feeItem: "材料费",
    base: "DECLF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额材料费",
    printable: true
  },
  {
    id: "fee-no-jxf",
    parentId: "fee-no-direct",
    feeCode: "JXF",
    feeItem: "机械费",
    base: "DEJXF",
    rate: "",
    amount: "",
    excluded: false,
    description: "定额机械费",
    printable: true
  },
  {
    id: "fee-no-zcf",
    parentId: "fee-no-direct",
    feeCode: "ZCF_1",
    feeItem: "主材费(不含指标主材费)",
    base: "BZZCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "主材费",
    printable: true
  },
  {
    id: "fee-no-sbf",
    parentId: "fee-no-direct",
    feeCode: "SBF_1",
    feeItem: "设备费(不含指标设备费)",
    base: "BZSBF",
    rate: "",
    amount: "",
    excluded: false,
    description: "设备费",
    printable: true
  },
  {
    id: "fee-no-index",
    parentId: "fee-no-direct",
    feeCode: "AZ",
    feeItem: "预算指标造价",
    base: "AZSGF_ZB+JZGCF_ZB+ZCF_ZB+SBF_ZB",
    rate: "",
    amount: "",
    excluded: false,
    description: "指标预算价",
    printable: true
  },
  {
    id: "fee-no-index-1",
    parentId: "fee-no-index",
    feeCode: "AZSGF_ZB",
    feeItem: "指标安装费",
    base: "bp_zb_azf*bp_gcl",
    rate: "",
    amount: "",
    excluded: false,
    description: "指标安装费",
    printable: true
  },
  {
    id: "fee-no-index-2",
    parentId: "fee-no-index",
    feeCode: "JZGCF_ZB",
    feeItem: "指标建筑费",
    base: "bp_zb_jzf*bp_gcl",
    rate: "",
    amount: "",
    excluded: false,
    description: "指标建筑费",
    printable: true
  },
  {
    id: "fee-no-index-3",
    parentId: "fee-no-index",
    feeCode: "SBF_2",
    feeItem: "指标设备费",
    base: "bp_zb_sb_dj*bp_gcl",
    rate: "",
    amount: "",
    excluded: false,
    description: "指标设备费",
    printable: true
  },
  {
    id: "fee-no-index-4",
    parentId: "fee-no-index",
    feeCode: "ZCF_2",
    feeItem: "指标主材费",
    base: "bp_zb_zc_dj*bp_gcl",
    rate: "",
    amount: "",
    excluded: false,
    description: "指标主材费",
    printable: true
  },
  {
    id: "fee-no-jg-zcf",
    parentId: null,
    feeCode: "JG_ZCF",
    feeItem: "甲供主材费",
    base: "J_ZCF",
    rate: "",
    amount: "",
    excluded: false,
    description: "甲供主材费",
    printable: true
  },
  {
    id: "fee-no-jg-sbf",
    parentId: null,
    feeCode: "JG_SBF",
    feeItem: "甲供设备费",
    base: "J_SBF",
    rate: "",
    amount: "",
    excluded: false,
    description: "甲供设备费",
    printable: true
  },
  {
    id: "fee-no-tax",
    parentId: null,
    feeCode: "SJ",
    feeItem: "税金",
    base: "ZZS_ZC+ZZS_SB+ZZS_JZ+ZZS_AZ",
    rate: "",
    amount: "",
    excluded: false,
    description: "主材费增值税+设备费增值税",
    printable: true
  }
];

function buildFeeSettingRows(overrides: Partial<Record<string, string>>) {
  return feeMainBaseSettingRowsTemplate.map(row => ({
    ...row,
    value: overrides[row.item] ?? row.value
  }));
}

function createFeeMainCategoryStateMap(): Record<
  string,
  BudgetBookFeeMainCategoryState
> {
  return {
    "fee-main-general": {
      settingRows: buildFeeSettingRows({
        工程类别: "一般安装工程",
        工程类型: "II类"
      }),
      feeProgramRows: cloneTreeRows(feeMainGeneralRowsTemplate)
    },
    "fee-main-manual-earth": {
      settingRows: buildFeeSettingRows({
        工程类别: "人工土石方工程",
        工程类型: "I类",
        地形: "山地地区"
      }),
      feeProgramRows: cloneTreeRows(feeMainManualEarthRowsTemplate)
    },
    "fee-main-machine-earth": {
      settingRows: buildFeeSettingRows({
        工程类别: "机械土石方工程",
        工程类型: "I类",
        地形: "丘陵地区"
      }),
      feeProgramRows: cloneTreeRows(feeMainMachineEarthRowsTemplate)
    },
    "fee-main-other-civil": {
      settingRows: buildFeeSettingRows({
        工程类别: "其他土建工程",
        工程类型: "III类",
        企业类别: "地方企业"
      }),
      feeProgramRows: cloneTreeRows(feeMainOtherCivilRowsTemplate)
    },
    "fee-main-install-no-fee": {
      settingRows: buildFeeSettingRows({
        工程类别: "安装不取费",
        工程类型: "不取费"
      }),
      feeProgramRows: cloneTreeRows(feeMainInstallNoFeeRowsTemplate)
    }
  };
}

function cloneRows<T extends { id: string }>(rows: T[]) {
  return rows.map(row => ({ ...row }));
}

function cloneTreeRows<T extends { id: string; parentId: string | null }>(
  rows: T[]
) {
  return rows.map(row => ({ ...row }));
}

function buildTreeRows(routeInfo: BudgetBookRoutePayload): BudgetBookTreeRow[] {
  return cloneTreeRows(
    budgetRowsTemplate.map(row => {
      if (row.id !== budgetBookNodeIds.project) return row;

      return {
        ...row,
        code: routeInfo.projectCode || row.code,
        name: routeInfo.projectName || row.name
      };
    })
  );
}

function createNodeDetailStateMap() {
  const parentState: BudgetBookNodeDetailState = {
    mode: "parent-only",
    defaultTab: "labor",
    visibleTabs: ["labor"],
    laborRows: cloneRows(parentLaborRowsTemplate),
    mainMaterialRows: [],
    formulaRows: [],
    formulaUnit: "",
    feeProgramRows: [],
    feeRateRows: [],
    extraFeeRows: [],
    quotaContent: {
      heading: "",
      description: ""
    }
  };

  const quotaState: BudgetBookNodeDetailState = {
    mode: "tabbed",
    defaultTab: "labor",
    visibleTabs: [
      "labor",
      "mainMaterial",
      "formula",
      "feeProgram",
      "extraFee",
      "quotaContent"
    ],
    laborRows: cloneRows(quotaLaborRowsTemplate),
    mainMaterialRows: cloneRows(mainMaterialRowsTemplate),
    formulaRows: cloneRows(formulaRowsTemplate),
    formulaUnit: "m",
    feeProgramRows: cloneTreeRows(feeProgramRowsTemplate),
    feeRateRows: cloneRows(feeRateRowsTemplate),
    extraFeeRows: cloneRows(extraFeeRowsTemplate),
    quotaContent: { ...quotaContentTemplate }
  };

  const leafState: BudgetBookNodeDetailState = {
    mode: "tabbed",
    defaultTab: "mainMaterial",
    visibleTabs: ["mainMaterial", "formula", "feeProgram"],
    laborRows: [],
    mainMaterialRows: cloneRows(mainMaterialRowsTemplate),
    formulaRows: [],
    formulaUnit: "m",
    feeProgramRows: [],
    feeRateRows: [],
    extraFeeRows: [],
    quotaContent: { ...leafQuotaContentTemplate }
  };

  return {
    [budgetBookNodeIds.project]: parentState,
    [budgetBookNodeIds.quota]: quotaState,
    [budgetBookNodeIds.mainMaterialLeaf]: leafState
  };
}

export function buildBudgetBookWorkspaceContext(
  routeInfo: BudgetBookRoutePayload
): BudgetBookWorkspaceContext {
  return {
    routeInfo,
    defaultNodeId: budgetBookNodeIds.project,
    mainTabs: [
      { key: "base", label: "基本信息" },
      { key: "budget", label: "预算书" },
      { key: "summary", label: "工料机汇总" },
      { key: "fee", label: "取费程序" },
      { key: "report", label: "报表" },
      { key: "analysis", label: "造价分析" }
    ],
    detailTabs: [
      { key: "labor", label: "人材机" },
      { key: "mainMaterial", label: "主材设备" },
      { key: "formula", label: "工程量计算式" },
      { key: "feeProgram", label: "取费程序" },
      { key: "extraFee", label: "子目增加费" },
      { key: "quotaContent", label: "定额子目内容" }
    ],
    toolbarGroups: [
      [
        { key: "save", label: "保存", icon: "ri:save-line" },
        { key: "copy", label: "复制", icon: "ri:file-copy-line" },
        { key: "paste", label: "粘贴", icon: "ri:clipboard-line" },
        { key: "cut", label: "剪切", icon: "ri:scissors-cut-line" },
        { key: "delete", label: "删除", icon: "ri:delete-bin-line" }
      ],
      [
        { key: "sign", label: "符号", icon: "ri:function-line" },
        { key: "search", label: "查找", icon: "ri:search-line" },
        { key: "calculate", label: "计算", icon: "ri:calculator-line" },
        { key: "move-up", label: "上移", icon: "ri:arrow-up-line" },
        { key: "move-down", label: "下移", icon: "ri:arrow-down-line" }
      ],
      [
        { key: "expand", label: "展开层级", icon: "ri:node-tree" },
        { key: "sort", label: "自动排序", icon: "ri:sort-asc" },
        { key: "fill", label: "填充颜色", icon: "ri:paint-line" },
        { key: "check", label: "检查", icon: "ri:file-search-line" },
        { key: "precision", label: "精度设置", icon: "ri:settings-3-line" }
      ],
      [
        { key: "clear", label: "清除颜色", icon: "ri:eraser-line" },
        { key: "summary", label: "局部汇总", icon: "ri:file-excel-2-line" }
      ]
    ],
    feeToolbarGroups: [
      [
        { key: "save", label: "保存", icon: "ri:save-line" },
        { key: "search", label: "查找", icon: "ri:search-line" },
        { key: "calculate", label: "计算", icon: "ri:calculator-line" },
        { key: "refresh-rate", label: "刷新费率", icon: "ri:refresh-line" },
        { key: "rate-weight", label: "费率加权", icon: "ri:percent-line" },
        { key: "clear", label: "清除颜色", icon: "ri:eraser-line" }
      ],
      [
        { key: "move-up", label: "上移", icon: "ri:arrow-up-line" },
        { key: "move-down", label: "下移", icon: "ri:arrow-down-line" },
        { key: "downgrade", label: "降级", icon: "ri:indent-decrease" }
      ]
    ],
    shortcutBadges: ["定", "Z", "S"],
    shortcutLinks: ["主材设备选择", "定额计价"],
    mainColumns,
    laborColumns,
    mainMaterialColumns,
    formulaColumns,
    extraFeeColumns,
    rows: buildTreeRows(routeInfo),
    detailStateMap: createNodeDetailStateMap(),
    feeMainWorkspace: {
      defaultCategoryId: "fee-main-general",
      defaultTemplate: "石油安装工程取费模板2022",
      templateOptions: [
        "石油安装工程取费模板2022",
        "人工土石方工程模板2022",
        "机械土石方工程模板2022",
        "其他土建工程模板2022",
        "安装不取费模板2022"
      ],
      categoryRows: cloneRows(feeMainCategoryRowsTemplate),
      categoryStateMap: createFeeMainCategoryStateMap()
    }
  };
}
