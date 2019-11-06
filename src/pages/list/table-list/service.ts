import request from '@/utils/request';
//import { TableListParams } from './data.d';

export async function queryRule(params: any) {
  return request('http://10.45.202.81:8082/query?pageNum=1&pageSize=150', {
    data: {
      ...params,
    },
  });
}

export async function removeRule(params: any) {
  return request((`http://10.45.202.81:8082/delByPrimKey/${params}`), {
    method: 'DELETE',
  });
}

export async function addRule(params: any) {
  return request('http://10.45.202.81:8082/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function searchRule(params: Object) {
  return request('http://10.45.202.81:8082/queryByCondition', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateRule(params: any) {
  return request('http://10.45.202.81:8082/updateByPrimKeySelective', {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}
