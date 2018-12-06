import React , { Fragment }  from 'react'
import {
  Row,
  Col
} from 'antd';
import ReactEcharts from 'echarts-for-react';
import { injectIntl } from 'acom/Intl'
import {connect} from "dva";
import store from 'store2';
import log from 'utils/log';
import { GraphicCard, ProjectMapTitle } from './Components';
import Map from './Map';

@injectIntl()
@connect(({ events }) => ({
  events
}))
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.userLevel = store.get('user').level;

    this.state = {
      quotaStatOption: null,
      isQuotaStatLoaded: false,
      realtimeAlertStatOption: null,
      isAlertStatLoaded: false,
      storageStatOption: null,
      isStorageStatLoaded: false,
      joinupEndpointStatOption: null,
      isJoinupEndpointStatLoaded: false,
      realtimeEndpointStatOption: null,
      isRealtimeEndpointStatLoaded: false,
      sysMsgStatOption: null,
      isSysMsgStatLoaded: false,
      sysApiStatOption: null,
      isSysApiStatLoaded: false,
      sysEndpointStatOption: null,
      isSysEndpointStatLoaded: false,
      sysStorageStatOption: null,
      isSysStorageStatLoaded: false,
      projectEndpointStatus: null,
      isProjectEndpointStatLoaded: false
    };
  }

  componentDidMount() {
    this.refreshGraphic();
    this.timerID = setInterval(() => this.refreshGraphic(), process.env.GRAPH_REFRESH_INTERVAL*1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      log.debug('componentDidUpdate dispatch events: ', this.props.events);
      if (this.userLevel === 2) {
        this.setQuotaStatData(this.props.events.quota.data);
        this.setRealtimeAlertStatData(this.props.events.alert.data);
        this.setStorageStatStatData(this.props.events.storage.data)
        this.setJoinupEndpointStatData(this.props.events.joinedEndpoints.data);
        this.setRealtimeEndpointStatData(this.props.events.realtimeEndpoints.data);
      }else if (this.userLevel === 1) {
        this.setMsgStatDataSys(this.props.events.sysMsg.data);
        this.setAPIStatDataSys(this.props.events.sysApi.data);
        this.setEpStatDataSys(this.props.events.sysEndpoint.data);
        this.setStorageStatDataSys(this.props.events.sysStorage.data)
      }else if (this.userLevel === 3) {
        this.setQuotaStatData(this.props.events.projectQuota.data);
        this.setRealtimeAlertStatData(this.props.events.projectAlert.data);
        this.setProjectEndpointStatusStat(this.props.events.projectEndpoint.data);
      }
    }
  }

  refreshGraphic() {
    const { dispatch } = this.props;

    // 租户级用户
    if (this.userLevel === 2) {
      const tenantId = store.get('user').tenantId;
      dispatch({ type: 'events/fetch', payload: { 
          quotaParam: { tenantId: tenantId }, 
          alertParam: { tenantId: tenantId,  days: 1 },
          storageParam: { tenantId: tenantId },
          joinedEndpointParam: { tenantId: tenantId, days: 30 },
          realtimeEndpointParam: { tenantId: tenantId, hours: 24 },
        }
      });
    }else if (this.userLevel === 1) {
      dispatch({ type: 'events/fetchSys' });
    }else if (this.userLevel === 3) {
      const userInfo = store.get('user');
      this.tenantId = userInfo.tenantId;
      this.projectToken = userInfo.projectToken;
      dispatch({ type: 'events/fetchProject' , payload: {
          quotaParam: { tenantId: userInfo.tenantId, projectToken: userInfo.projectToken },
          alertParam: { tenantId: userInfo.tenantId, token: userInfo.projectToken },
          endpointParam: { tenantId: userInfo.tenantId, token: userInfo.projectToken },
        }
      });
    }
  }

  // 租户级/项目级 当月消息量统计图表
  setQuotaStatData(quotaStatData) {
    const { intl: {messages} } = this.props;
    if (!quotaStatData) {
        return;
    }else{
        log.debug('setQuotaStatData start: ', quotaStatData);
        const quotaStData = quotaStatData;
        let quotaMsgDateData = [];
        let quotaReceiveMsgData, quotaSendMsgData, quotaStartValue, quotaEndValue, quotaStAll;
        for (let i = quotaStData.length - 1; i >= 0; i--) {
            switch(quotaStData[i].level) {
                case "receiveMessage":
                    quotaReceiveMsgData = quotaStData[i].data;
                break;
                case "sendMessage":
                    quotaSendMsgData = quotaStData[i].data;
                break;
                // 获取最近7天开始和结束时间
                case "startDate":
                    quotaStartValue = quotaStData[i].data;
                break;
                case "endDate":
                    quotaEndValue = quotaStData[i].data;
                break;
                case "all":
                    quotaStAll = quotaStData[i].data;
                break;
                default:
                break;
            }
        }

        log.debug('setQuotaStatData: ', quotaReceiveMsgData);

        for (let i = 1; i <= quotaReceiveMsgData.length; i++) {
            quotaMsgDateData.push(messages['home.dayForMessageGraphic'] + i);
        }
        const quota = {
          quotaReceiveMsgData,
          quotaSendMsgData,
          quotaStartValue,
          quotaEndValue,
          quotaStAll,
          quotaMsgDateData
        };
        this.setQuotaStatGraphic(quota);
    }
  };

  setQuotaStatGraphic(quota) {
    const { intl: {messages} } = this.props;
    const {          
      quotaReceiveMsgData,
      quotaSendMsgData,
      quotaStAll,
      quotaMsgDateData
     } = quota;
    this.setState({
      quotaStatOption: {
        title: {
            text: quotaStAll.toString(),
            subtext: messages['home.messageTotal'],
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    background: '#6a7985'
                }
            }
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        dataZoom: [
            {
                type: 'slider',
                start: 0,
                end: 100
            }
        ],
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data:[messages['home.currentMonthReceivedMsgTotal'], messages['home.currentMonthSendMsgTotal']]
        },
        grid: {
            left: 30,
            right: 30,
            bottom: 50,
            top: 85,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: quotaMsgDateData
            }
        ],
        yAxis: [
            {
                name: messages['common.item'],
                nameGap:10,
                nameTextStyle:{
                    color:"#aaa"
                },
                type: 'value'
            }
        ],
        series: [
            {
                name: messages['home.currentMonthReceivedMsgTotal'],
                type:'line',
                // stack: '总量',
                lineStyle: {normal: {color: 'rgba(10,149,221,1)'}},
                areaStyle: {normal: {color: 'rgba(10,149,221,0.5)'}},
                itemStyle: {
                    normal: {
                        color: 'rgba(10,149,221,1)'
                    }
                },
                data: quotaReceiveMsgData
            },
            {
                name: messages['home.currentMonthSendMsgTotal'],
                type:'line',
                // stack: '总量',
                lineStyle: {normal: {color: 'rgba(28,195,39,1)'}},
                areaStyle: {normal: {color: 'rgba(28,195,39,0.5)'}},
                itemStyle: {
                    normal: {
                        color: 'rgba(28,195,39,1)'
                    }
                },
                data: quotaSendMsgData
            }
        ]
      },
      isQuotaStatLoaded: true
    });
  };

  // 租户级/项目级 实时告警统计(最近一个小时)
  setRealtimeAlertStatData(realtimeAlertData) {
    const { intl: {messages} } = this.props;
    if (!realtimeAlertData) {
        return;
    }
    const rtAlertData = realtimeAlertData;
    let realtimeAlertGraphicData = [];
    let realtimeAlertAll = 0;
    let infoCnt = 0, warningCnt = 0, criticalCnt = 0, errorCnt = 0;
    for (let i = rtAlertData.length - 1; i >= 0; i--) {
        switch(rtAlertData[i].level) {
            case "Info":
                infoCnt = rtAlertData[i].count;
            break;
            case "Warning":
                warningCnt = rtAlertData[i].count;
            break
            case "Critical":
                criticalCnt = rtAlertData[i].count;
            break;
            case "Error":
                errorCnt = rtAlertData[i].count;
            break;
            default:
            break;
        }
    }

    realtimeAlertGraphicData.push({value:infoCnt, name: messages['trigger.triggerRule.info'], itemStyle: {normal:{color: '#12caff'}}});
    realtimeAlertGraphicData.push({value:warningCnt, name: messages['trigger.triggerRule.warning'], itemStyle: {normal:{color: '#ffc600'}}});
    realtimeAlertGraphicData.push({value:errorCnt, name: messages['trigger.triggerRule.error'], itemStyle: {normal:{color: '#ff8a00'}}});
    realtimeAlertGraphicData.push({value:criticalCnt, name: messages['trigger.triggerRule.critical'], itemStyle: {normal:{color: '#e80000'}}});

    realtimeAlertAll = infoCnt + warningCnt + criticalCnt + errorCnt;

    const alert = {
      realtimeAlertGraphicData,
      realtimeAlertAll
    };
    this.setRealtimeAlertStatGraphic(alert);
  };

  setRealtimeAlertStatGraphic(alert) {
    const { intl: {messages} } = this.props;
    const {
      realtimeAlertAll,
      realtimeAlertGraphicData
    } = alert;
    const realtimeAlertStatOption = {
      title: {
          text: messages['common.alertAllCount'],
          subtext: realtimeAlertAll.toString(),
          textAlign: 'center',
          left: "34%",
          top: "40%",
          textStyle: {
              color: "#666",
              fontSize: 14
          },
          subtextStyle: {
              color: "#000",
              fontSize: 32
          }
      },
      tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b}: {c} ({d}%)",
          position: "top"
      },
      toolbox: {
          right: 20,
          feature: {
              saveAsImage: {
                  show: true,
                  backgroundColor: '#fff',
                  title: messages['common.saveAsImage']
              }
          }
      },
      legend: {
          top: 50,
          orient: 'vertical',
          x: 'right',
          align: 'left',
          data:[ messages['trigger.triggerRule.info'],messages['trigger.triggerRule.warning'],messages['trigger.triggerRule.error'],messages['trigger.triggerRule.critical']],
          formatter:function(name){
              let oa = realtimeAlertStatOption.series[0].data;
              let num = oa[0].value + oa[1].value + oa[2].value + oa[3].value;
              for(let i = 0; i < realtimeAlertStatOption.series[0].data.length; i++){
                  if(name === oa[i].name){
                      if (num === 0) {
                          return name + ' 0%';
                      }else {
                          return name + ' ' + (oa[i].value/num * 100).toFixed(2) + '%';
                      }
                  }
              }
          }
      },
      series: [
        {
          name: messages['common.alertStat'],
          type:'pie',
          center: ['35%', '50%'],
          radius: ['60%', '70%'],
          avoidLabelOverlap: false,
          label: {
              normal: {
                  show: false,
                  position: 'center'
              }
          },
          labelLine: {
              normal: {
                  show: false
              }
          },
          data: realtimeAlertGraphicData
        }
      ]
    };

    this.setState({
      realtimeAlertStatOption: realtimeAlertStatOption,
      isAlertStatLoaded: true
    });
  };

  // 租户级 存储用量统计(当前)
  setStorageStatStatData(storageStatData) {
    if (!storageStatData) {
        return;
    }
    const { intl: {messages} } = this.props;
    let storageStatGraphicData = [];
    let usedCnt = storageStatData[0].used, availableCnt = storageStatData[1].unused;
    let storageStatAll = 0;

    storageStatGraphicData.push({value:usedCnt, name: messages['home.currentUsage'], itemStyle: {normal:{color: '#36c0ff'}}});
    storageStatGraphicData.push({value:availableCnt, name: messages['home.currentAvailable'], itemStyle: {normal:{color: '#57df60'}}});
    storageStatAll = usedCnt;

    const storage = {
      storageStatGraphicData,
      storageStatAll
    };

    this.setStorageStatStatGraphic(storage);
  };

  setStorageStatStatGraphic(storage) {
    const { intl: {messages} } = this.props;
    const {
      storageStatGraphicData,
      storageStatAll
    } = storage;
    const storageStatOption = {
        title: {
            text: messages['home.currentUsage'],
            subtext: storageStatAll.toString(),
            textAlign: 'center',
            left: "34%",
            top: "40%",
            textStyle: {
                color: "#666",
                fontSize: 14
            },
            subtextStyle: {
                color: "#000",
                fontSize: 28
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)",
            position: "top"
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 50,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data:[messages['home.currentUsage'], messages['home.currentAvailable']],
            formatter:function(name){
                let oa = storageStatOption.series[0].data;
                let num = oa[0].value + oa[1].value;
                for(let i = 0; i < storageStatOption.series[0].data.length; i++){
                    if(name === oa[i].name){
                        if (num === 0) {
                            return name + ' 0%';
                        }else {
                            return name + ' ' + (oa[i].value/num * 100).toFixed(2) + '%';
                        }
                    }
                }
            }
        },
        series: [
            {
                name: messages['home.storageUsageStat'],
                type:'pie',
                center: ['35%', '50%'],
                radius: ['60%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: storageStatGraphicData
            }
        ]
    };

    this.setState({
      storageStatOption: storageStatOption,
      isStorageStatLoaded: true
    });
  };

  // 租户级 接入终端数量统计
  setJoinupEndpointStatData(joinupEndpointStatData) {
    if (!joinupEndpointStatData) {
        return;
    }
    let joinupEndpointFromProjects = [];
    const joinupEndpointStData = joinupEndpointStatData;
    let joinupEndpointDateData, joinupEndpointSeriesData, joinupEndpointStAll, joinupEndpointStartValue,joinupEndpointEndValue;
    for (let i = joinupEndpointStData.length - 1; i >= 0; i--) {
        switch(joinupEndpointStData[i].level) {
            case "date":
                joinupEndpointDateData = joinupEndpointStData[i].data;
            break;
            case "project":
                joinupEndpointSeriesData = joinupEndpointStData[i].data;
            break;
            case "all":
                joinupEndpointStAll = joinupEndpointStData[i].count;
            break;
            // 获取最近7天开始和结束时间
            case "startDate":
                joinupEndpointStartValue = joinupEndpointStData[i].data;
            break;
            case "endDate":
                joinupEndpointEndValue = joinupEndpointStData[i].data;
            break;
            default:
            break;
        }
    }

    for (let i = 0; i < joinupEndpointSeriesData.length; i++) {
        joinupEndpointFromProjects.push(joinupEndpointSeriesData[i].name);
    }

    const joined = {
      joinupEndpointStAll,
      joinupEndpointStartValue,
      joinupEndpointEndValue,
      joinupEndpointFromProjects,
      joinupEndpointDateData,
      joinupEndpointSeriesData
    };
    
    this.setJoinupEndpointStatGraphic(joined);
  };

  setJoinupEndpointStatGraphic(joined) {
    const { intl: {messages} } = this.props;
    const {
      joinupEndpointStAll,
      joinupEndpointStartValue,
      joinupEndpointEndValue,
      joinupEndpointFromProjects,
      joinupEndpointDateData,
      joinupEndpointSeriesData
    } = joined;
    const joinupEndpointStatOption = {
        title: {
            text: joinupEndpointStAll.toString(),
            subtext: messages['home.joinEndpointTatal'],
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                label: {
                    background: '#6a7985'
                }
            }
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        dataZoom: [{
            type: 'slider',
            startValue: joinupEndpointStartValue,
            endValue: joinupEndpointEndValue,
        }],
        legend: {
            top: 40,
            right: 10,
            width: '50%',
            align: 'left',
            type: 'scroll',
            data: (function() {
                let list =[];
                for (let i = 0; i < joinupEndpointFromProjects.length; i++) {
                    list.push(joinupEndpointFromProjects[i]);
                }
                return list;
            })()
        },
        grid: {
            bottom: 50,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                axisTick:{
                    interval:0,
                    alignWithLabel:true
                },

                data: joinupEndpointDateData
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: joinupEndpointSeriesData
    };

    this.setState({
      joinupEndpointStatOption: joinupEndpointStatOption,
      isJoinupEndpointStatLoaded: true
    })
  };

  // 租户级 实时监控终端数量统计
  setRealtimeEndpointStatData(realtimeEndpointStatData) {
    if (!realtimeEndpointStatData) {
        return;
    }
    const realtimeEndpointStData = realtimeEndpointStatData;
    let realtimeEndpointDateData, realtimeEndpointSeriesData, realtimeEndpointStAll;
    for (let i = realtimeEndpointStData.length - 1; i >= 0; i--) {
        switch(realtimeEndpointStData[i].level) {
            case "date":
                realtimeEndpointDateData = realtimeEndpointStData[i].data;
            break;
            case "endpoint":
                realtimeEndpointSeriesData = realtimeEndpointStData[i].data;
            break;
            case "all":
                realtimeEndpointStAll = realtimeEndpointStData[i].count;
            break;
            default:
            break;
        }
    }

    const realtime = {
      realtimeEndpointDateData,
      realtimeEndpointSeriesData,
      realtimeEndpointStAll
    };

    this.setRealtimeEndpointStatGraphic(realtime);
  };

  setRealtimeEndpointStatGraphic(realtime) {
    const { intl: {messages} } = this.props;
    const {
      realtimeEndpointDateData,
      realtimeEndpointSeriesData,
      realtimeEndpointStAll
    } = realtime;
    const realtimeEndpointStatOption = {
        title: {
            text: realtimeEndpointStAll.toString(),
            subtext: messages['home.endpointTotal'],
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: "#fff"
                }
            },
            formatter: function (params, ticket, callback) {
                let text = '';
                for(let i=0;i<params.length;i++){
                    text += params[i].seriesName;
                    text += ' : ';
                    text += params[i].value;
                    text += '<br/>';
                }
               return text;
            }
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data: [messages['home.onlineEndpointCount'], messages['home.offlineEndpointCount']]
        },
        grid: {
            left: 30,
            right: 30,
            bottom: 50,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: realtimeEndpointDateData
            }
        ],
        yAxis: [
            {
                type: 'value',
                show: false
            },
            {
                type: 'value',
                show: false
            }
        ],
        series: realtimeEndpointSeriesData
    };

    this.setState({
      realtimeEndpointStatOption: realtimeEndpointStatOption,
      isRealtimeEndpointStatLoaded: true
    });
  };

  // 系统级用户 消息量统计
  setMsgStatDataSys(msgData) {
    if (!msgData) {
        return;
    }

    const { intl: {messages} } = this.props;
    let tenantsMsgData = msgData;
    let msgTenants = [];
    let msgReceives = [];
    let msgSent = [];
    let msgStatSeriesDataSys, msgStatTenantDataSys;
    for (let i = 0; i < tenantsMsgData.length; i++) {
        msgTenants.push(tenantsMsgData[i].tenantId);
        msgReceives.push(tenantsMsgData[i].received);
        msgSent.push(tenantsMsgData[i].sent);
    }
    let statData = [
      {type:"tenantIds", data: msgTenants},
      {type:"series", data: [
          {
              name: messages['home.monthReceivedMessage'],
              stack: messages['home.messageTotal'],
              type:"bar",
              itemStyle:{
                  normal: {
                      color: "rgba(28,195,39,0.5)"
                  }
              },
              data: msgReceives
          },
          {
              name: messages['home.monthSendMessage'],
              stack: messages['home.messageTotal'],
              type:"bar",
              itemStyle:{
                  normal: {
                      color: "rgba(10,149,221,0.5)"
                  }
              },
              data: msgSent
          }
      ]}
    ];

    for (let i = statData.length - 1; i >= 0; i--) {
      switch(statData[i].type) {
        case "series":
          msgStatSeriesDataSys = statData[i].data;
        break;
        case "tenantIds":
          msgStatTenantDataSys = statData[i].data;
        break;
        default:
        break;
      }
    }

    const sysMsgStat = {
      msgStatSeriesDataSys,
      msgStatTenantDataSys
    };

    this.setMsgStatGraphicSystem(sysMsgStat);
  };

  setMsgStatGraphicSystem(sysMsgStat) {
    const { intl: {messages} } = this.props;
    const {
      msgStatSeriesDataSys,
      msgStatTenantDataSys
    } = sysMsgStat;
    const sysMsgStatOption = {
        title: {
            text: "",
            subtext: "",
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: "#fff"
                }
            },
            formatter: "{a0}: {c0} <br /> {a1}: {c1}",
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data: [messages['home.monthReceivedMessage'], messages['home.monthSendMessage']]
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 10,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                axisLabel: {
                    interval: 0,
                    rotate: 45
                },
                max: 20,
                data: msgStatTenantDataSys
            }
        ],
        yAxis: [
            {
                type: 'value',
                show: false
            },
            {
                type: 'value',
                show: false
            }
        ],
        series: msgStatSeriesDataSys
    };

    this.setState({
      sysMsgStatOption: sysMsgStatOption,
      isSysMsgStatLoaded: true
    })
  };

  // 系统级用户 API接口调用次数
  setAPIStatDataSys(statData) {
    if (!statData) {
        return;
    }
    const { intl: {messages} } = this.props;
    let apiInvokedTenants = [];
    let apiInvokedCount = [];
    for (let i = 0; i < statData.length; i++) {
        apiInvokedTenants.push(statData[i].tenantId);
        apiInvokedCount.push(statData[i].count);
    }
    let apiStatDataSys = [
        {type:"tenantIds", data: apiInvokedTenants},
        {type:"series", data: [
            {
                name: messages['home.apiInvokeCount'],
                type:"bar",
                itemStyle:{
                    normal: {
                        color: "rgba(10,149,221,0.8)"
                    }
                },
                data: apiInvokedCount
            }
        ]}
    ];

    let apiStatSeriesDataSys, apiStatTenantDataSys;
    for (let i = apiStatDataSys.length - 1; i >= 0; i--) {
        switch(apiStatDataSys[i].type) {
            case "series":
                apiStatSeriesDataSys = apiStatDataSys[i].data;
            break;
            case "tenantIds":
                apiStatTenantDataSys = apiStatDataSys[i].data;
            break;
            default:
            break;
        }
    }

    const apiStat = {
      apiStatSeriesDataSys,
      apiStatTenantDataSys
    };

    this.setAPIStatGraphicSystem(apiStat);
  };

  setAPIStatGraphicSystem(apiStat) {
    const { intl: {messages} } = this.props;
    const {
      apiStatSeriesDataSys,
      apiStatTenantDataSys
    } = apiStat;
    const sysApiStatOption = {
        title: {
            text: "",
            subtext: "",
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: "#fff"
                }
            },
            formatter: "{a0}: {c0}",
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data: [messages['home.apiInvokeCount']]
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 10,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                axisLabel: {
                    interval: 0,
                    rotate: 45
                },
                max: 20,
                data: apiStatTenantDataSys
            }
        ],
        yAxis: [
            {
                type: 'value',
                show: false
            },
            {
                type: 'value',
                show: false
            }
        ],
        series: apiStatSeriesDataSys
    };

    this.setState({
      sysApiStatOption: sysApiStatOption,
      isSysApiStatLoaded: true
    });
  };

  // 系统级用户 终端数量统计
  setEpStatDataSys(statData) {
    if (!statData) {
        return;
    }
    const { intl: {messages} } = this.props;
    let endpointsTenants = [];
    let endpointsOnlineCount = [];
    let endpointsOfflineCount = [];
    for (let i = 0; i < statData.length; i++) {
        endpointsTenants.push(statData[i].tenantId);
        endpointsOnlineCount.push(statData[i].online);
        endpointsOfflineCount.push(statData[i].total - statData[i].online);
    }
    let epStatDataSys = [
        {type:"tenantIds", data: endpointsTenants},
        {type:"series", data: [
            {
                name: messages['endpoint.common.online'],
                stack: messages['home.endpointTotal'],
                type:"bar",
                itemStyle:{
                    normal: {
                        color: "rgba(28,195,39,0.5)"
                    }
                },
                data: endpointsOnlineCount
            },
            {
                name: messages['endpoint.common.offline'],
                stack: messages['home.endpointTotal'],
                type:"bar",
                itemStyle:{
                    normal: {
                        color: "rgba(10,149,221,0.5)"
                    }
                },
                data: endpointsOfflineCount
            }
        ]}
    ];

    let epStatSeriesDataSys, epStatTenantDataSys;
    for (let i = epStatDataSys.length - 1; i >= 0; i--) {
        switch(epStatDataSys[i].type) {
            case "series":
                epStatSeriesDataSys = epStatDataSys[i].data;
            break;
            case "tenantIds":
                epStatTenantDataSys = epStatDataSys[i].data;
            break;
            default:
            break;
        }
    }

    const endpoint = {
      epStatSeriesDataSys,
      epStatTenantDataSys
    }

    this.setEpStatGraphicSystem(endpoint);
  };

  setEpStatGraphicSystem(endpoint) {
    const { intl: {messages} } = this.props;
    const {
      epStatSeriesDataSys,
      epStatTenantDataSys
    } = endpoint;
    const sysEndpointStatOption = {
        title: {
            text: "",
            subtext: "",
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: "#fff"
                }
            },
            formatter: "{a0}: {c0} <br /> {a1}: {c1}"
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data: [messages['endpoint.common.online'], messages['endpoint.common.offline']]
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 10,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                axisLabel: {
                    interval: 0,
                    rotate: 45
                },
                max: 20,
                data: epStatTenantDataSys
            }
        ],
        yAxis: [
            {
                type: 'value',
                show: false
            },
            {
                type: 'value',
                show: false
            }
        ],
        series: epStatSeriesDataSys
    };

    this.setState({
      sysEndpointStatOption: sysEndpointStatOption,
      isSysEndpointStatLoaded: true
    });
  };

  // 系统级用户 存储用量统计
  setStorageStatDataSys(statData) {
    if (!statData) {
        return;
    }
    const { intl: {messages} } = this.props;
    let storageTenants = [];
    let storageUsed = [];
    for (let i = 0; i < statData.length; i++) {
        storageTenants.push(statData[i].tenantId);
        storageUsed.push(statData[i].data);
    }
    let storageStatDataSys = [
        {type:"tenantIds", data: storageTenants},
        {type:"series", data: [
            {
                name: messages['home.currentStorage'],
                stack: messages['home.storageTotal'],
                type:"bar",
                itemStyle:{
                    normal: {
                        color: "rgba(10,149,221,0.5)"
                    }
                },
                data: storageUsed
            }
        ]}
    ];

    let storageStatSeriesDataSys, storageStatTenantDataSys;
    for (let i = storageStatDataSys.length - 1; i >= 0; i--) {
      switch(storageStatDataSys[i].type) {
        case "series":
          storageStatSeriesDataSys = storageStatDataSys[i].data;
        break;
        case "tenantIds":
          storageStatTenantDataSys = storageStatDataSys[i].data;
        break;
        default:
        break;
      }
    }

    const storage = {
      storageStatSeriesDataSys,
      storageStatTenantDataSys
    }
    this.setStorageStatGraphicSystem(storage);
  };

  setStorageStatGraphicSystem(storage) {
    const {
      storageStatSeriesDataSys,
      storageStatTenantDataSys
    } = storage;
    const { intl: {messages} } = this.props;
    const sysStorageStatOption = {
        title: {
            text: "",
            subtext: "",
            textAlign: 'left',
            left: 0,
            top: 0,
            textStyle: {
                color: "#000",
                fontSize: 28
            },
            subtextStyle: {
                color: "#666",
                fontSize: 12
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                textStyle: {
                    color: "#fff"
                }
            },
            formatter: "{a0}: {c0}",
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    backgroundColor: '#fff',
                    title: messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 40,
            orient: 'vertical',
            x: 'right',
            align: 'left',
            data: [messages['home.currentStorage']]
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 10,
            top: 80,
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                axisLabel: {
                    interval: 0,
                    rotate: 45
                },
                max: 20,
                data: storageStatTenantDataSys
            }
        ],
        yAxis: [
            {
                type: 'value',
                show: false
            },
            {
                type: 'value',
                show: false
            }
        ],
        series: storageStatSeriesDataSys
    };

    this.setState({
      sysStorageStatOption: sysStorageStatOption,
      isSysStorageStatLoaded: true
    });
  };

  // 项目级用户 终端接入统计
  setProjectEndpointStatusStat(projectEpStats) {
    let normalCntEP = 0, 
        infoCntEP = 0, 
        warningCntEP = 0, 
        errorCntEP = 0, 
        criticalCntEP = 0, 
        offlineCntEP = 0, 
        projectAllJoinCount= 0;
    for (var i = projectEpStats.length - 1; i >= 0; i--) {
        switch(projectEpStats[i].status) {
          case "OFFLINE":
            offlineCntEP = projectEpStats[i].counts;
            break;
          default:
            break;
        }
        switch(projectEpStats[i].alertStatus) {
          case "NORMAL":
            normalCntEP = projectEpStats[i].counts;
            break;
          case "INFO":
            infoCntEP = projectEpStats[i].counts;
            break;
          case "WARNING":
            warningCntEP = projectEpStats[i].counts;
            break;
          case "ERROR":
            errorCntEP = projectEpStats[i].counts;
            break;
          case "CRITICAL":
            criticalCntEP = projectEpStats[i].counts;
            break;
          default:
            break;
        }
    }

    projectAllJoinCount = normalCntEP + infoCntEP + warningCntEP + errorCntEP + criticalCntEP + offlineCntEP;

    this.setState({
      projectEndpointStatus: {
        projectAllJoinCount: projectAllJoinCount,
        normalCntEP: normalCntEP,
        infoCntEP: infoCntEP,
        warningCntEP: warningCntEP,
        errorCntEP: errorCntEP,
        criticalCntEP: criticalCntEP,
        offlineCntEP: offlineCntEP
      },
      isProjectEndpointStatLoaded: true
    });
  }

  render () {
    const { intl: {messages} } = this.props;
    const { 
      quotaStatOption, 
      isQuotaStatLoaded, 
      realtimeAlertStatOption, 
      isAlertStatLoaded, 
      storageStatOption, 
      isStorageStatLoaded,
      joinupEndpointStatOption,
      isJoinupEndpointStatLoaded,
      realtimeEndpointStatOption,
      isRealtimeEndpointStatLoaded,
      sysMsgStatOption,
      isSysMsgStatLoaded,
      sysApiStatOption,
      isSysApiStatLoaded,
      sysEndpointStatOption,
      isSysEndpointStatLoaded,
      sysStorageStatOption,
      isSysStorageStatLoaded,
      projectEndpointStatus,
      isProjectEndpointStatLoaded
    } = this.state;
    
    return (
      <Fragment>
        { this.userLevel === 2 && <div>
          <Row gutter={12} style={{ marginBottom: 10 }}>
            <Col span={8}>
              <GraphicCard graphTitle={messages['home.quotaStat']}>
              { isQuotaStatLoaded && <ReactEcharts
                style={{minHeight: 300}}
                option={quotaStatOption}
              />
              }
              </GraphicCard>
            </Col>
            <Col span={8}>
              <GraphicCard graphTitle={messages['home.oneHourRealtimeAlertStat']}>
              { isAlertStatLoaded && <ReactEcharts
                style={{minHeight: 300}}
                option={realtimeAlertStatOption}
              />
              }
              </GraphicCard>
            </Col>
            <Col span={8}>
              <GraphicCard graphTitle={messages['home.storageStat']}>
              { isStorageStatLoaded && <ReactEcharts
                style={{minHeight: 300}}
                option={storageStatOption}
              />
              }
              </GraphicCard>
            </Col>
          </Row>
          <Row gutter={12} style={{ marginBottom: 10 }}>
            <Col span={12}>
              <GraphicCard graphTitle={messages['home.joinUpEndpointStat']}>
              { isJoinupEndpointStatLoaded && <ReactEcharts
                style={{minHeight: 300}}
                option={joinupEndpointStatOption}
                theme="walden"
              />
              }
              </GraphicCard>
            </Col>
            <Col span={12}>
              <GraphicCard graphTitle={messages['home.realtimeEndpointStatHome']}>
              { isRealtimeEndpointStatLoaded && <ReactEcharts
                style={{minHeight: 300}}
                option={realtimeEndpointStatOption}
              />
              }
              </GraphicCard>
            </Col>
          </Row>
          <GraphicCard graphTitle={messages['home.tenantRealtimeEndpointsStat']}>
            <Map 
              tenantId={this.tenantId} 
              />
          </GraphicCard>
          </div>
        }
        {
          this.userLevel === 1 && <div>
            <Row gutter={12} style={{ marginBottom: 10 }}>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.quotaStat']}>
                { isSysMsgStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={sysMsgStatOption}
                />
                }
                </GraphicCard>
              </Col>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.apiInvokeStat']}>
                { isSysApiStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={sysApiStatOption}
                />
                }
                </GraphicCard>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.endpointStat']}>
                { isSysEndpointStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={sysEndpointStatOption}
                />
                }
                </GraphicCard>
              </Col>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.storageStat']}>
                { isSysStorageStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={sysStorageStatOption}
                />
                }
                </GraphicCard>
              </Col>
            </Row>
          </div>
        }
        {
          this.userLevel === 3 && 
          <div>
            {isProjectEndpointStatLoaded && <GraphicCard graphTitle={<ProjectMapTitle epStatus={projectEndpointStatus} />}>
                <Map 
                  tenantId={this.tenantId} 
                  projectToken={this.projectToken} 
                />
              </GraphicCard>
            }
            <Row gutter={12} style={{marginTop: 10}}>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.quotaStat']}>
                { isQuotaStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={quotaStatOption}
                />
                }
                </GraphicCard>
              </Col>
              <Col span={12}>
                <GraphicCard graphTitle={messages['home.oneHourRealtimeAlertStat']}>
                { isAlertStatLoaded && <ReactEcharts
                  style={{minHeight: 300}}
                  option={realtimeAlertStatOption}
                />
                }
                </GraphicCard>
              </Col>
            </Row>
          </div>
        }
      </Fragment>
    )
  }
}
