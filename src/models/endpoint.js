import { queryEndPointById } from 'services/endpointApi'

export default {
  namespace: 'endpoint',

  state: {
    id: '',
    endpointAuthDto: {},
    project: {},
    specification: {},
    metaData: "{}",
  },

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryEndPointById(payload.id, payload.tenantId)
        .then(res => {
          console.log("获取endpoint详情 by id:", res)
          return res
        })
      if(res.status === 200){
        yield put({
          type: 'save',
          payload: res.data,
        });
      }

      return res

    }
  },

  reducers: {
    save(state, action) {
      return {...state, ...action.payload}
    },
    edit(state, action) {
      return {...state, ...action.payload}
    }
  },

}

// state = {
//   cctId: null,
//     alertStatus: "NORMAL",
//     assignment: null,
//     assignmentToken: "3d640daa-bf47-4e88-ba89-8f664b81b704",
//     connectedTime: null,
//     createdBy: "aclab_admin",
//     createdTime: 1528971878000,
//     description: null,
//     endDate: null,
//     endpointAclDtoList: null,
//     endpointAuthDto: null,
//     iccid: null,
//     id: "demoEp01",
//     ipAddress: null,
//     metaData: null,
//     nodeName: null,
//     password: null,
//     profileFilter: null,
//     project: {
//     createdTime: 1528871074000,
//       updateTime: 1528871074000,
//       createdBy: "aclab_admin",
//       token: "fb047a00-c934-4b0e-826a-b34a7c9e6cd4",
//       name: "demo_project_01",
//   },
//   projectToken: "fb047a00-c934-4b0e-826a-b34a7c9e6cd4",
//     returnCount: 0,
//     specToken: "5a02fa16-e792-4782-b702-3b5496c0de43",
//     specification: {
//     createdTime: 1527840359000, updateTime:
//     1527840359000, createdBy:
//     "aclab", token:
//     "5a02fa16-e792-4782-b702-3b5496c0de43", name:
//     "T13100842",
//   },
//   startDate: null,
//     status: "INIT",
//     statusUpdateTime: null,
//     tenantId: "aclab",
//     updateTime: 1528971878000,
//     userName: null
// }


