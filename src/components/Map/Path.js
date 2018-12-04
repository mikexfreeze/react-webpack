import React, {Component} from 'react';

class Path extends Component {

  loadUI = () => {
    window.AMapUI.loadUI(['misc/PathSimplifier'], (PathSimplifier) => {
      const map = this.props.__map__;

      if (!PathSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！');
        return;
      }

      var pathSimplifierIns = new PathSimplifier({
        zIndex: 100,
        //autoSetFitView:false,
        map: map, //所属的地图实例

        getPath: function(pathData, pathIndex) {

          return pathData.path;
        },
        getHoverTitle: function(pathData, pathIndex, pointIndex) {

          if (pointIndex >= 0) {
            let point = pathData.path[pointIndex]
            //point
            return `经度：${point[0]},纬度：${point[1]},点：${pointIndex+1}/${pathData.path.length}`
          }

          return pathData.name + '，点数量' + pathData.path.length;
        },
        renderOptions: {

          renderAllPointsIfNumberBelow: 100 //绘制路线节点，如不需要可设置为-1
        }
      });

      this.props.onReady(pathSimplifierIns)

    })

  }

  componentDidMount () {
    this.loadUI();
  }

  render() {
    return (
      <div>

      </div>
    );
  }
}

export default Path;
