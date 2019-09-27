export interface TableListItem {
  key: number;
  disabled?: boolean;
  href: string;
  avatar: string;
  name: string;
  title: string;
  owner: string;
  desc: string;
  callNo: number;
  status: number;
  updatedAt: Date;
  createdAt: Date;
  progress: number;
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  pageNum: number;
}

export interface TableListData {
  list: TableListItem[];
  total: number;
  pageSize: number;
  pageNum: number;
  pagination:any;
  imsi:any
}

export interface TableListParams {
  sorter: string;
  status: string;
  name: string;
  pageSize: number;
  pageNum: number;
  imsi:string
  //currentPage:number
}
