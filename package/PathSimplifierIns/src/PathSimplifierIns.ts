import { h, inject, onMounted, ref, watch } from "vue";
import { asyncDownloadScript } from '../../../utils/scriptHelper'
/**
 *巡航器 
 *
 *
 * 实时： <!-- <PathSimplifierIns  
 *              :id='currentMarkerId' 
 *              :position='realTimeData.position' 
 *              :icon='realTimeData.icon'   
 *              model='realTime' 
 *              @moveing='PathSimplifierInsmoveing'/> -->
 * 
 * position：[116.497428, 39.20923]
 * 
 * 轨迹：    <PathSimplifierIns
              :position="historyData"
              model="history"
              @moveing='PathSimplifierInsmoveing'
      />

 * 方式一 position：[
    { point: [116.497428, 39.20923], icon: icon1 },
    { point: [116.497428, 39.20923] },
    { point: [113.597428, 36.20923], icon: icon1 },
    { point: [116.697428, 39.280923] },
    { point: [115.397428, 37.20923], icon: icon1 },
  ]
 * 
 * 方式二 position：[[116.497428, 39.20923],[113.597428, 36.20923]]  icon：icon1 单独传
 * 
 * 
 */
export default {
    name: 'PathSimplifierIns',
    props: {
        // 巡航方式
        model: {
            type: String,
            default() {
                return 'realTime'// realTime/ history
            }
        },
        icon: {
            type: String || null,
            default: ''
        },
        // 巡航器更换标识，id改变，将重置巡航器
        id: null,
        //定位信息
        position: {
            type: Array,
            default() {
                return []
            }
        },
        speed:{//速度
            type:Number,
            default: 0
        }

    },
    emits: ['moveing','pointClick'],
    setup(props:any, context:any) {
        const storeData = inject<any>('storeData')
        const {  map } = storeData
        const pathSimplifierIns= ref()//pathSimplifierIns对象
            pathSimplifierIns.value=null
        const myPathSimplifier = ref()
        const emptyLineStyle = {
            lineWidth: 0,
            fillStyle: null,
            strokeStyle: null,
            borderStyle: null
        };
        const navg1 = ref();
        const data = ref([{
            name: '动态路线',
            path: [[]]
        }]);
        const historyIndex=ref(0)//轨迹当前的点记录
        asyncDownloadScript('AMapUI', 'https://webapi.amap.com/ui/1.1/main.js?v=1.1.1').then((AMapUI: any) => {
            init(AMapUI)
        })

        onMounted(() => {

        })


        watch(() => props.id, clearpathSimplifierIns,
            { immediate: true, deep: true }
        )
        watch(() => props.position, watchPosition,
            { immediate: true, deep: true }
        )


        function init(AMapUI:any) {
            AMapUI.load(['ui/misc/PathSimplifier'], function (PathSimplifier:any) {

                if (!PathSimplifier.supportCanvas) {
                    alert('当前环境不支持 Canvas！');
                    return;
                }
                myPathSimplifier.value = PathSimplifier

                initPathSimplifier();




            });

        }
        //初始化pathSimplifierIns
        function initPathSimplifier() {
            pathSimplifierIns.value = new myPathSimplifier.value({
                zIndex: 100,
                autoSetFitView: false,
                map: map, //所属的地图实例
                pathNavigatorStyle: {
                    width: 32,
                    height: 32,
                    //使用图片
                    content: myPathSimplifier.value.Render.Canvas.getImageContent(props.icon)
                },
                getPath: function (pathData:any) {
                    // console.log(2,'getPath')//实时才调用
                    return pathData.path;
                },
                getHoverTitle: function (pathData:any) {
                    
                //   console.log(pathData, pathIndex, pointIndex,'pathData, pathIndex, pointIndex')
                   

                    return pathData.name + '，点数量' + pathData.path.length;
                },
                renderOptions: props.model == 'realTime' ? {
                    //将点、线相关的style全部置emptyLineStyle
                    pathLineStyle: emptyLineStyle,
                    pathLineSelectedStyle: emptyLineStyle,
                    pathLineHoverStyle: emptyLineStyle,
                    keyPointStyle: emptyLineStyle,
                    startPointStyle: emptyLineStyle,
                    endPointStyle: emptyLineStyle,
                    keyPointHoverStyle: emptyLineStyle,
                    keyPointOnSelectedPathLineStyle: emptyLineStyle
                } : {}
            });
        }


        function realTimestart() {
            data.value[0].path[0] = props.position
            pathSimplifierIns.value.setData(data.value);
            navg1.value = pathSimplifierIns.value.createPathNavigator(0, {
                speed: props.speed||1000000, //巡航速度，单位千米/小时\
                loop: false, //循环播放
                pathNavigatorStyle: {
                    width: 32,
                    height: 32,
                    //使用图片
                    content: myPathSimplifier.value.Render.Canvas.getImageContent(props.icon)
                }
            });


            navg1.value.start();

        }

        //轨迹路劲 设置一次
        function historyStart() {
            let point =[]
            //判断传入的数据类别
            //[{point:[],icon}]
            if(props.position[0].point){
                point = props.position.map((item:{point:[]}) => {
                    return item.point
                })
            }
            //[[],[]]
            if(props.position[0].length){
                point=props.position
            }
            
           console.log(point,'historyStart')

            if (point[0]) {
                let icon=props.position[0].icon||props.icon
                console.log(props.position,'historyStart')
                //设置数据

                data.value[0].path = point
                pathSimplifierIns.value.setData(data.value);

                //对第一条线路（即索引 0）创建一个巡航器
                navg1.value = pathSimplifierIns.value.createPathNavigator(0, {
                    loop: false, //循环播放
                    speed: props.speed||1000000, //巡航速度，单位千米/小时
                    pathNavigatorStyle: {
                        width: 32,
                        height: 32,
                        //使用图片
                        content: myPathSimplifier.value.Render.Canvas.getImageContent(icon)
                    },
                    getPath: function (pathData:any) {
                        return pathData.path;
                    },
                });

                navg1.value.start();
                navg1.value.on('move', onMoveing);
                
                pathSimplifierIns.value.off('pathClick pointClick', pointClick)
            }

        }

        //实时数据 跟新路劲 更新图标
        function doExpand(position:[]) {
            if (position.length) {
                var cursor = navg1.value.getCursor().clone(), //保存巡航器的位置
                    status = navg1.value.getNaviStatus();

                //替换第0项
                if (!data.value[0].path[0].length) {
                    data.value[0].path[0] = position
                } else {
                    data.value[0].path.push(position);
                }

                pathSimplifierIns.value.setData(data.value); //延展路径

                //重新建立一个巡航器
                navg1.value = pathSimplifierIns.value.createPathNavigator(0, {
                    //loop: true, //循环播放
                    speed: props.speed||1000000, //巡航速度，单位千米/小时
                    pathNavigatorStyle: {
                        width: 32,
                        height: 32,
                        //使用图片
                        content: myPathSimplifier.value.Render.Canvas.getImageContent(props.icon)
                    }
                });

                navg1.value.on('move', onMoveing);

                if (status !== 'stop') {
                    navg1.value.start();
                }

                //恢复巡航器的位置
                if (cursor.idx >= 0) {
                    navg1.value.moveToPoint(cursor.idx, cursor.tail);
                }
            }

        }
        function onMoveing(e:any,info:any) {
           
            let index=info.dataItem.pointIndex
           
            let position = navg1.value.getPosition()
            context.emit('moveing', [position.lng, position.lat])
            if(props.model=='realTime'){

            }else{
                if(!props.position[historyIndex.value].icon)return
                //轨迹更换图标 
                if(historyIndex.value!=index){
                    historyIndex.value=index
                    let pathNavigatorStyle = navg1.value.getStyleOptions();
                    pathNavigatorStyle.content= myPathSimplifier.value.Render.Canvas.getImageContent(props.position[historyIndex.value].icon)
                     pathSimplifierIns.value.renderLater(200);
                   }
                
               
            }

        }
        function pointClick(e:any,info:any) {
            context.emit('pointClick', e,info)

        }
        /**
         * 监听实时定位数据的变化
         * 
         */
        function watchPosition(val:any) {
            if (!val[0]) return
            waitingJs(val)
        }
        /**
         * 循环等到js文件加载完成执行historyStart
         * @param val 
         */
        function waitingJs(val:any) {
            if (pathSimplifierIns.value) {//已加载完js文件
                if (props.model == 'realTime') {
                    //实时
                    if (!navg1.value) {//进行初始化
                        realTimestart()
                    } else {

                        doExpand(val)
                    }
                } else {
                    //轨迹
                    // historyStart()
                }
            } else {
                //值已传入 但js文件未加载完成  
                setTimeout(() => {
                    if (props.model == 'realTime') {
                        // 实时
                        waitingJs(val)
                    } else {

                        //轨迹
                        waitingJs(null)
                    }
                }, 200);
            }
        }

        //清空
        function clearpathSimplifierIns(newval:any, oldval:any) {
            // if (pathSimplifierIns) {
            //    pathSimplifierIns.setData([])
            //   
            //    pathSimplifierIns.off('pathClick pointClick', pathOrpointClick)
            //    navg1.off('move', onMoveing);

            // }
            if (!oldval) return
            navg1.value && destroy()
            navg1.value = null
            if (props.model == 'realTime' && newval) {
                data.value[0].path = [props.position]
                initPathSimplifier()
            }



        }

        function start(){
            historyStart()
        }
        function pause(){
             navg1.value.pause();
        }
        function resume(){
            navg1.value.resume();
       }
       function stop(){
        navg1.value.stop();
   }
   //销毁
   function destroy(){
    navg1.value.destroy();
   }
        return {
            start,
             pause,
            resume,
            stop,
            destroy
        }
    },
    render() {

        return () => h('div', { class: 'MoveAnimation' }, 'MoveAnimation')
    }
}