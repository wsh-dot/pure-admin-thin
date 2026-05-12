export type PartyWorkStatus = "0" | "1";

export interface PartyWorkRow {
  id: string;
  topic: string;
  infoType: string;
  ableDate: string;
  createUserName: string;
  fileId?: string;
  issuanceTag: PartyWorkStatus;
  topStatus: PartyWorkStatus;
}

export interface PartyWorkQuery {
  topic?: string;
  topStatus?: PartyWorkStatus | "";
  issuanceTag?: PartyWorkStatus | "";
  infoType?: string;
  dateRange?: [string, string] | [];
  pageNo: number;
  pageSize: number;
}

export interface PartyWorkPageResult {
  list: PartyWorkRow[];
  total: number;
}
