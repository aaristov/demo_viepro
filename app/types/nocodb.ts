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

export interface CriteriaData {
  id: number;
  origins: Set<string>;
}

export interface DomainMapData {
  [domain: string]: Map<string, CriteriaData>;
}

export interface DomainData {
  [domain: string]: Map<string, CriteriaData>;
}

export interface SectorCriteria {
  criteres: string;
  id: number;
  origine_data: string[];
}

export interface Sector {
  text: string;
  color: string;
  criteria: SectorCriteria[];
}