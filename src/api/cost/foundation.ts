import type {
  PartyWorkPageResult,
  PartyWorkQuery,
  PartyWorkRow
} from "@/views/cost/foundation/types";
import {
  deletePartyWorkMock,
  fetchPartyWorkPageMock,
  updatePartyWorkStatusMock
} from "@/views/cost/foundation/mock";

export function fetchPartyWorkPage(
  params: PartyWorkQuery
): Promise<PartyWorkPageResult> {
  return fetchPartyWorkPageMock(params);
}

export function updatePartyWorkStatus(
  id: string,
  payload: Partial<Pick<PartyWorkRow, "issuanceTag" | "topStatus">>
) {
  return updatePartyWorkStatusMock(id, payload);
}

export function deletePartyWork(id: string) {
  return deletePartyWorkMock(id);
}
