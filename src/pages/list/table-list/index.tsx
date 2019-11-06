import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Icon,
  InputNumber,
  Menu,
  Row,
  message,
} from 'antd';
import React, { Component } from 'react';

import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { SorterResult } from 'antd/es/table';
import { connect } from 'dva';
import moment from 'moment';
import { StateType } from './model';
import CreateForm from './components/CreateForm';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import UpdateForm, { FormValsType } from './components/UpdateForm';
import { TableListItem, TableListPagination, TableListParams } from './data.d';

import styles from './style.less';


const FormItem = Form.Item;
// const { Option } = Select;
const getValue = (obj: { [x: string]: string[] }) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

type IStatusMapType = 'IMSI For Recycle' | 'IMSI For New';
const srcStatus = ['IMSI For Recycle', 'IMSI For New'];
const usedType = ['Virtual RUIM', 'New RUIM'];
const imsiStatus = ['Delete', 'Active', 'Inactive'];
interface TableListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  listTableList: StateType;
}

interface TableListState {
  modalVisible: boolean;
  updateModalVisible: boolean;
  expandForm: boolean;
  selectedRows: TableListItem[];
  formValues: { [key: string]: string };
  stepFormValues: Partial<TableListItem>;
  list: [];
}

/* eslint react/no-multi-comp:0 */
@connect(({ listTableList, loading }) => ({
  listTableList,
  loading: loading.models.rule,
  imsi:listTableList.data.imsi
}))
class TableList extends Component<TableListProps, TableListState> {
  state: TableListState = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: true,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
    list: [],
  };

  columns: StandardTableColumnProps[] = [
    {
      title: 'Area',
      dataIndex: 'areaId',
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
    },
    {
      title: 'Used type',
      dataIndex: 'usedType',
      render(val) {
        return <span>{usedType[val]}</span>;
      },
    },
    {
      title: 'State',
      dataIndex: 'imsiState',
      render(val) {
        return <span>{imsiStatus[val]}</span>;
      },
    },

    {
      title: 'Source Method',
      dataIndex: 'srcMethod',
      render(val: IStatusMapType) {
        return <span>{srcStatus[val]}</span>;
      },
    },
    {
      title: 'Update Date',
      dataIndex: 'stateDate',
      sorter: true,
      render: (val: string) => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => [
        <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>,
        <span>-</span>,
        <a onClick={this.handleDelete}>删除</a>,
      ],
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'listTableList/fetch',
    });
  }

  handleStandardTableChange = (
    pagination: Partial<TableListPagination>,
    filtersArg: Record<keyof TableListItem, string[]>,
    sorter: SorterResult<TableListItem>,
  ) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params: Partial<TableListParams> = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'listTableList/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'listTableList/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = (e: { key: string }) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'listTableList/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        dispatch({
          type: 'listTableList/fetch',
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = (rows: TableListItem[]) => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };
      // console.log(values);//正确
      // this.setState({
      //   formValues: values,
      // });
      console.log(values);
      dispatch({
        type: 'listTableList/search',
        payload: values,
      });
    });
  };

  handleModalVisible = (flag?: boolean) => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag?: boolean, record?: FormValsType) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = (fields: { areaId: any; imsiState: any }) => {
    const { dispatch } = this.props;
    dispatch(
      {
        type: 'listTableList/add',
        payload: {
          areaId: fields.areaId,
          imsiState: fields.imsiState,
        },
      },
      // dispatch({type: 'listTableList/fetch'})
    );

    message.success('添加成功');
    this.handleModalVisible();
    dispatch({
      type: 'listTableList/fetch',
    });
  };

  handleUpdate = (fields: FormValsType) => {
    const { dispatch } = this.props;
    let imsi = this.props.listTableList.data.imsi
    dispatch({
      type: 'listTableList/update',
      payload: {areaId:fields.areaId,imsi:imsi},
    });
    console.log({imsi:imsi,areaId:fields.areaId})

    message.success('配置成功');
    this.handleUpdateModalVisible();
    
    dispatch({
      type: 'listTableList/fetch',
    });
  };
  handleDelete = ()=>{
    const {dispatch,imsi} = this.props
    dispatch({
      type:'listTableList/remove',
      payload:{
        imsi:imsi
      }
    })
    setTimeout(()=>{
      dispatch({
        type: 'listTableList/fetch',
      });
    },1000)
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Area">
              {getFieldDecorator('areaId')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="State">
              {getFieldDecorator('imsiState')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>

        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              search
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              reset
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const {
      listTableList: { data },
      loading,
    } = this.props;

    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>

        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<TableListProps>()(TableList);
