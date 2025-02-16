export interface CriteriaItem {
  Id: number;
  domaines: string;
  criteres: string;
  origine_data: string;
  data: number;
}

export interface PageInfo {
  totalRows: number;
  page: number;
  pageSize: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface NocoDBResponse {
  list: CriteriaItem[];
  pageInfo: PageInfo;
}
