import { Table } from 'antd';
import { ColumnProps, TableRowSelection, TableProps } from 'antd/es/table';
import React, { Component } from 'react';
import { connect } from 'dva';
import { TableListItem } from '../../data.d';
import styles from './index.less';
import { StateType } from '../../model';
import { Dispatch } from 'redux';
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  listTableList: StateType;
}
// export interface StandardTableProps<T> extends Omit<TableProps<T>, 'columns'> {
//   columns: StandardTableColumnProps[];
//   data: {
//     list: TableListItem[];
//     pagination: StandardTableProps<TableListItem>['pagination'];
//   };
//   selectedRows: TableListItem[];
//   onSelectRow: (rows: any) => void;
// }

export interface StandardTableColumnProps extends ColumnProps<TableListItem> {
  needTotal?: boolean;
  total?: number;
}

function initTotalList(columns: StandardTableColumnProps[]) {
  if (!columns) {
    return [];
  }
  const totalList: StandardTableColumnProps[] = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

interface StandardTableState {
  selectedRowKeys: string[];
  needTotalList: StandardTableColumnProps[];
  nowRowImsi: any;
}
@connect(({ listTableList }) => ({ data:listTableList.data }))
class StandardTable extends Component<StandardTableProps<TableListItem>, StandardTableState> {
  static getDerivedStateFromProps(nextProps: StandardTableProps<TableListItem>) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  constructor(props:any) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      needTotalList,
      nowRowImsi: {},
    };
  }

  handleRowSelectChange: TableRowSelection<TableListItem>['onChange'] = (
    selectedRowKeys,
    selectedRows: TableListItem[],
  ) => {
    const currySelectedRowKeys = selectedRowKeys as string[];
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex || 0]), 0),
    }));
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys: currySelectedRowKeys, needTotalList });
  };

  handleTableChange: TableProps<TableListItem>['onChange'] = (
    pagination,
    filters,
    sorter,
    ...rest
  ) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter, ...rest);
    }
  };

  cleanSelectedKeys = () => {
    if (this.handleRowSelectChange) {
      this.handleRowSelectChange([], []);
    }
  };
  get = (record:any) => {
    return {
      onClick: () => {
        this.setState({ nowRowImsi: record });
        // console.log(this.props.data.imsi,this.props.data);
        const {dispatch} = this.props
        this.props.data.imsi = record.imsi
        dispatch(
          {
            type:'listTableList/save',
            payload:{...this.props.data}
          }
        )
      },
    };
  };
  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data, rowKey, ...rest } = this.props;
    const { list = [], pagination = true } = data || {};

    const paginationProps = pagination
      ? {
          showSizeChanger: false,
          showQuickJumper: false,
          ...pagination,
        }
      : false;

    const rowSelection: TableRowSelection<TableListItem> = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: (record: TableListItem) => ({
        disabled: record.disabled,
      }),
    };

    return (
      <div className={styles.standardTable}>
        <Table
          rowKey={rowKey || 'key'}
          rowSelection={rowSelection}
          dataSource={list}
          onRow={this.get}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
