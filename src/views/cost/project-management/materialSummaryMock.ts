import type {
  MaterialSummaryRow,
  MaterialSummaryTreeNode,
  WorkbenchColumn
} from "./types";

export const materialSummaryTree: MaterialSummaryTreeNode[] = [
  {
    id: "all",
    label: "所有工料机",
    category: "all",
    children: [
      { id: "labor", label: "人工", category: "labor" },
      { id: "material", label: "材料", category: "material" },
      { id: "machine", label: "机械", category: "machine" },
      { id: "mainMaterial", label: "主材", category: "mainMaterial" },
      { id: "equipment", label: "设备", category: "equipment" },
      {
        id: "mainMaterialAndEquipment",
        label: "主材及设备",
        category: "mainMaterialAndEquipment"
      }
    ]
  }
];

export const materialSummaryColumns: WorkbenchColumn[] = [
  {
    id: "classificationGroup",
    title: "分类信息",
    headerAlign: "center",
    children: [
      {
        id: "discipline",
        title: "专业",
        field: "discipline",
        minWidth: 88
      },
      {
        id: "categoryLabel",
        title: "分类",
        field: "categoryLabel",
        minWidth: 88
      }
    ]
  },
  {
    id: "basicInfoGroup",
    title: "基础信息",
    headerAlign: "center",
    children: [
      { id: "code", title: "编号", field: "code", minWidth: 94 },
      { id: "name", title: "名称", field: "name", minWidth: 220 },
      { id: "spec", title: "规格", field: "spec", minWidth: 120 },
      {
        id: "unit",
        title: "单位",
        field: "unit",
        minWidth: 82,
        align: "center"
      },
      {
        id: "quantity",
        title: "数量",
        field: "quantity",
        minWidth: 92,
        align: "right"
      }
    ]
  },
  {
    id: "unitPriceGroup",
    title: "单价",
    headerAlign: "center",
    children: [
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
      }
    ]
  },
  {
    id: "totalPriceGroup",
    title: "合价",
    headerAlign: "center",
    children: [
      {
        id: "quotaTotal",
        title: "定额价",
        field: "quotaTotal",
        minWidth: 102,
        align: "right"
      },
      {
        id: "marketTotal",
        title: "市场价",
        field: "marketTotal",
        minWidth: 102,
        align: "right"
      }
    ]
  },
  {
    id: "varianceGroup",
    title: "价差",
    headerAlign: "center",
    children: [
      {
        id: "variance",
        title: "价差",
        field: "variance",
        minWidth: 96,
        align: "right"
      },
      {
        id: "varianceTotal",
        title: "价差合计",
        field: "varianceTotal",
        minWidth: 108,
        align: "right"
      }
    ]
  },
  {
    id: "otherInfoGroup",
    title: "其他信息",
    headerAlign: "center",
    children: [
      {
        id: "budgetBook",
        title: "所属预算书",
        field: "budgetBook",
        minWidth: 132
      },
      {
        id: "remark",
        title: "备注",
        field: "remark",
        minWidth: 166
      }
    ]
  }
];

export const materialSummaryRows: MaterialSummaryRow[] = [
  {
    id: "ms-001",
    discipline: "石油安装",
    category: "labor",
    categoryLabel: "人工",
    code: "1",
    name: "综合工日",
    spec: "",
    unit: "工日",
    quantity: "1112.32",
    quotaPrice: "169.60",
    marketPrice: "169.60",
    quotaTotal: "188649.64",
    marketTotal: "188649.64",
    variance: "0.00",
    varianceTotal: "0.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-002",
    discipline: "石油安装",
    category: "material",
    categoryLabel: "材料",
    code: "1047",
    name: "白垩",
    spec: "",
    unit: "kg",
    quantity: "0.00",
    quotaPrice: "0.31",
    marketPrice: "0.31",
    quotaTotal: "0.00",
    marketTotal: "0.00",
    variance: "0.00",
    varianceTotal: "0.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-003",
    discipline: "石油安装",
    category: "material",
    categoryLabel: "材料",
    code: "2599",
    name: "镀锌管卡子(钢管用),DN50",
    spec: "DN50",
    unit: "个",
    quantity: "1213.00",
    quotaPrice: "1.47",
    marketPrice: "1.47",
    quotaTotal: "1783.11",
    marketTotal: "1783.11",
    variance: "0.00",
    varianceTotal: "0.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-004",
    discipline: "石油安装",
    category: "material",
    categoryLabel: "材料",
    code: "2799",
    name: "位置牌",
    spec: "",
    unit: "个",
    quantity: "1213.00",
    quotaPrice: "0.46",
    marketPrice: "0.46",
    quotaTotal: "557.98",
    marketTotal: "557.98",
    variance: "0.00",
    varianceTotal: "0.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-005",
    discipline: "石油安装",
    category: "material",
    categoryLabel: "材料",
    code: "3060",
    name: "方木(综合)",
    spec: "m3",
    unit: "m3",
    quantity: "0.00",
    quotaPrice: "1338.05",
    marketPrice: "1338.05",
    quotaTotal: "0.00",
    marketTotal: "0.00",
    variance: "0.00",
    varianceTotal: "0.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-006",
    discipline: "石油安装",
    category: "machine",
    categoryLabel: "机械",
    code: "4124",
    name: "汽车式起重机,起重量(t)16",
    spec: "16t",
    unit: "台班",
    quantity: "32.00",
    quotaPrice: "989.41",
    marketPrice: "1015.00",
    quotaTotal: "31661.12",
    marketTotal: "32480.00",
    variance: "25.59",
    varianceTotal: "818.88",
    budgetBook: "[造价文件-001]",
    remark: "含进退场"
  },
  {
    id: "ms-007",
    discipline: "石油安装",
    category: "machine",
    categoryLabel: "机械",
    code: "4208",
    name: "载重汽车,载重量(t)10",
    spec: "10t",
    unit: "台班",
    quantity: "48.00",
    quotaPrice: "624.99",
    marketPrice: "636.00",
    quotaTotal: "29999.52",
    marketTotal: "30528.00",
    variance: "11.01",
    varianceTotal: "528.48",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-008",
    discipline: "石油安装",
    category: "mainMaterial",
    categoryLabel: "主材",
    code: "M-001",
    name: "螺旋缝埋弧焊钢管",
    spec: "DN300",
    unit: "m",
    quantity: "850.00",
    quotaPrice: "186.40",
    marketPrice: "194.60",
    quotaTotal: "158440.00",
    marketTotal: "165410.00",
    variance: "8.20",
    varianceTotal: "6970.00",
    budgetBook: "[造价文件-001]",
    remark: "主材调价"
  },
  {
    id: "ms-009",
    discipline: "石油安装",
    category: "equipment",
    categoryLabel: "设备",
    code: "EQ-102",
    name: "防爆配电箱",
    spec: "BXF-12",
    unit: "台",
    quantity: "6.00",
    quotaPrice: "3650.00",
    marketPrice: "3788.00",
    quotaTotal: "21900.00",
    marketTotal: "22728.00",
    variance: "138.00",
    varianceTotal: "828.00",
    budgetBook: "[造价文件-001]",
    remark: ""
  },
  {
    id: "ms-010",
    discipline: "石油安装",
    category: "mainMaterialAndEquipment",
    categoryLabel: "主材及设备",
    code: "ME-001",
    name: "撬装阀组",
    spec: "PN4.0",
    unit: "套",
    quantity: "2.00",
    quotaPrice: "24600.00",
    marketPrice: "25180.00",
    quotaTotal: "49200.00",
    marketTotal: "50360.00",
    variance: "580.00",
    varianceTotal: "1160.00",
    budgetBook: "[造价文件-001]",
    remark: "设备成套"
  },
  {
    id: "ms-011",
    discipline: "土建",
    category: "labor",
    categoryLabel: "人工",
    code: "2",
    name: "综合普工",
    spec: "",
    unit: "工日",
    quantity: "460.00",
    quotaPrice: "138.00",
    marketPrice: "142.00",
    quotaTotal: "63480.00",
    marketTotal: "65320.00",
    variance: "4.00",
    varianceTotal: "1840.00",
    budgetBook: "[土建预算书]",
    remark: ""
  },
  {
    id: "ms-012",
    discipline: "土建",
    category: "material",
    categoryLabel: "材料",
    code: "TC-221",
    name: "商品混凝土",
    spec: "C30",
    unit: "m3",
    quantity: "280.00",
    quotaPrice: "412.00",
    marketPrice: "425.00",
    quotaTotal: "115360.00",
    marketTotal: "119000.00",
    variance: "13.00",
    varianceTotal: "3640.00",
    budgetBook: "[土建预算书]",
    remark: ""
  }
];
