import type {
  PartyWorkPageResult,
  PartyWorkQuery,
  PartyWorkRow,
  PartyWorkStatus
} from "./types";

export const infoTypeOptions = [
  { label: "党建信息", value: "10" },
  { label: "通知公告", value: "20" },
  { label: "学习园地", value: "30" },
  { label: "廉政建设", value: "40" },
  { label: "群团工作", value: "50" }
];

export const partyWorkRows: PartyWorkRow[] = [
  {
    id: "PW20260509001",
    topic: "造价管理中心党支部召开专题学习会议",
    infoType: "10",
    ableDate: "2026-05-01 至 2026-05-31",
    createUserName: "王海军",
    fileId: "ATT-001",
    issuanceTag: "1",
    topStatus: "1"
  },
  {
    id: "PW20260509002",
    topic: "关于开展工程造价业务廉洁风险排查的通知",
    infoType: "20",
    ableDate: "2026-05-03 至 2026-06-03",
    createUserName: "李敏",
    fileId: "ATT-002",
    issuanceTag: "1",
    topStatus: "0"
  },
  {
    id: "PW20260509003",
    topic: "基础工作党建宣传材料报送要求",
    infoType: "30",
    ableDate: "2026-05-06 至 2026-05-20",
    createUserName: "张强",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509004",
    topic: "造价业务骨干党员责任区创建方案",
    infoType: "10",
    ableDate: "2026-04-28 至 2026-06-30",
    createUserName: "赵静",
    fileId: "ATT-004",
    issuanceTag: "0",
    topStatus: "1"
  },
  {
    id: "PW20260509005",
    topic: "关于组织观看警示教育片的安排",
    infoType: "40",
    ableDate: "2026-05-08 至 2026-05-18",
    createUserName: "周宁",
    issuanceTag: "1",
    topStatus: "0"
  },
  {
    id: "PW20260509006",
    topic: "青年突击队参与项目结算攻坚活动简报",
    infoType: "50",
    ableDate: "2026-05-09 至 2026-06-09",
    createUserName: "刘洋",
    fileId: "ATT-006",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509007",
    topic: "第一季度党建工作资料归档清单",
    infoType: "30",
    ableDate: "2026-04-01 至 2026-05-15",
    createUserName: "马越",
    issuanceTag: "1",
    topStatus: "0"
  },
  {
    id: "PW20260509008",
    topic: "党员示范岗工程量清单复核经验交流",
    infoType: "10",
    ableDate: "2026-05-10 至 2026-06-10",
    createUserName: "孙洁",
    fileId: "ATT-008",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509009",
    topic: "基层党组织标准化建设自查提醒",
    infoType: "20",
    ableDate: "2026-05-12 至 2026-05-28",
    createUserName: "陈刚",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509010",
    topic: "工程造价领域纪律教育学习资料",
    infoType: "40",
    ableDate: "2026-05-01 至 2026-12-31",
    createUserName: "何璐",
    fileId: "ATT-010",
    issuanceTag: "1",
    topStatus: "1"
  },
  {
    id: "PW20260509011",
    topic: "党小组五月份主题党日活动计划",
    infoType: "10",
    ableDate: "2026-05-01 至 2026-05-31",
    createUserName: "朱峰",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509012",
    topic: "造价管理中心工会活动报名通知",
    infoType: "50",
    ableDate: "2026-05-15 至 2026-05-25",
    createUserName: "沈悦",
    fileId: "ATT-012",
    issuanceTag: "0",
    topStatus: "0"
  },
  {
    id: "PW20260509013",
    topic: "关于征集党建品牌案例的通知",
    infoType: "20",
    ableDate: "2026-05-02 至 2026-05-30",
    createUserName: "邓琳",
    issuanceTag: "1",
    topStatus: "0"
  },
  {
    id: "PW20260509014",
    topic: "预算审核党员先锋队工作纪实",
    infoType: "30",
    ableDate: "2026-04-20 至 2026-06-20",
    createUserName: "曹磊",
    fileId: "ATT-014",
    issuanceTag: "0",
    topStatus: "1"
  },
  {
    id: "PW20260509015",
    topic: "中心党委理论学习资料目录",
    infoType: "10",
    ableDate: "2026-05-01 至 2026-07-01",
    createUserName: "杨帆",
    issuanceTag: "1",
    topStatus: "0"
  }
];

const rows = [...partyWorkRows];

function includes(value: string, keyword?: string) {
  return !keyword || value.includes(keyword);
}

function equalStatus(value: PartyWorkStatus, expected?: PartyWorkStatus | "") {
  return !expected || value === expected;
}

export function getInfoTypeLabel(value: string) {
  return infoTypeOptions.find(item => item.value === value)?.label ?? value;
}

export async function fetchPartyWorkPageMock(
  query: PartyWorkQuery
): Promise<PartyWorkPageResult> {
  const filtered = rows
    .filter(row => includes(row.topic, query.topic))
    .filter(row => equalStatus(row.topStatus, query.topStatus))
    .filter(row => equalStatus(row.issuanceTag, query.issuanceTag))
    .filter(row => !query.infoType || row.infoType === query.infoType)
    .sort((a, b) => Number(b.topStatus) - Number(a.topStatus));

  const start = (query.pageNo - 1) * query.pageSize;
  return {
    list: filtered.slice(start, start + query.pageSize),
    total: filtered.length
  };
}

export async function updatePartyWorkStatusMock(
  id: string,
  payload: Partial<Pick<PartyWorkRow, "issuanceTag" | "topStatus">>
) {
  const row = rows.find(item => item.id === id);
  if (row) Object.assign(row, payload);
}

export async function deletePartyWorkMock(id: string) {
  const index = rows.findIndex(item => item.id === id);
  if (index > -1) rows.splice(index, 1);
}

export function upsertPartyWorkMock(row: PartyWorkRow) {
  const index = rows.findIndex(item => item.id === row.id);
  if (index > -1) rows.splice(index, 1, row);
  else rows.unshift(row);
}
