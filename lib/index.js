import { reactive as N, provide as W, onMounted as T, nextTick as O, h as S, inject as M, ref as p, watch as g } from "vue";
const R = function(e, r) {
  return window[e] ? window[e]._preloader ? window[e]._preloader : Promise.resolve(window[e]) : (window[e] = {}, window[e]._preloader = new Promise(function(d, i) {
    window._initMap = function() {
      d(window[e]), window[e]._preloader = null, window._initMap = null;
    };
    var t = document.createElement("script");
    t.type = "text/javascript", window.document.body.appendChild(t), t.src = r + "&callback=_initMap";
  }), window[e]._preloader);
}, F = function(e, r) {
  return window[e] ? window[e]._preloader ? window[e]._preloader : Promise.resolve(window[e]) : (window[e] = {}, window[e]._preloader = new Promise((d, i) => {
    const t = document.createElement("script");
    t.src = r, window.document.body.appendChild(t), t.onload = function() {
      d(window[e]), window[e]._preloader = null;
    };
  }), window[e]._preloader);
}, B = {
  name: "Map",
  props: {
    //地图名称 高德AMap
    name: {
      type: String,
      default() {
        return "AMap";
      }
    },
    //地图级别  值越大 城市约清晰
    zoom: {
      type: Number,
      default() {
        return 13;
      }
    },
    //中心点坐标
    center: {
      type: Array,
      default() {
        return [116.397428, 39.90923];
      }
    },
    //使用地图视图
    viewMode: {
      type: String,
      default: "2D"
    },
    //在同一个页面使用  需要加id区分 不然只会初始化一个
    id: {
      type: String,
      default: () => "mapDom" + Math.random() * 1001
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  setup(e, { attrs: r, slots: d, emit: i, expose: t }) {
    const n = N({
      map: {},
      //地图对象
      isReady: !1
      //地图对象是否加载完成
    });
    W("storeData", n), T(() => {
      O(() => {
        l();
      });
      function l() {
        document.getElementById(e.id) ? a() : setTimeout(() => {
          l();
        }, 50);
      }
    });
    function a() {
      let l = "";
      switch (e.name) {
        case "AMap":
          l = "https://webapi.amap.com/maps?v=2.1Beta&key=966a1cec27bf619fc0b3d8683e8f4c01&plugin=AMap.MarkerCluster";
          break;
      }
      R(e.name, l).then((c) => {
        o(c);
      });
    }
    function o(l) {
      n.map = new l.Map(e.id, {
        zoom: e.zoom,
        //级别
        center: e.center,
        //中心点坐标
        viewMode: e.viewMode,
        //使用地图视图
        ...e.options
      }), n.isReady = !0;
    }
    function s() {
      n.map.clearMap();
    }
    function v() {
      n.map.setFitView();
    }
    function w(l, c = !0) {
      n.map.setCenter(l, c);
    }
    return t({ storeData: n, clearMap: s, setFitView: v, setCenter: w }), () => S("div", {
      class: "Map",
      id: e.id,
      style: {
        height: "500px"
      }
    }, S("div", {
      class: "Map_slots"
    }, n.isReady && d.default ? d.default() : ""));
  }
}, H = {
  name: "Marker",
  props: {
    //[116.478935, 39.997761]
    //点标记在地图上显示的位置
    position: {
      type: Array,
      default() {
        return [];
      }
    },
    size: {
      type: Array,
      default() {
        return [32, 32];
      }
    },
    id: null,
    //点标记中显示的图标
    Icon: {
      type: String || null,
      default: null
    },
    //是否使用平滑移动
    usemoveTransform: {
      type: Boolean,
      default() {
        return !1;
      }
    },
    offset: {
      type: Array,
      default() {
        return [-13, 0];
      }
    }
    //是否拖尾
    // drawLine: {
    //     type: Boolean,
    //     default() {
    //         return false
    //     }
    // },
    //平滑速度
    // moveSpeed: {
    //     type: Number,
    //     default() {
    //         return 1000
    //     }
    // },
    // Editor: null,//function
    //初始化就加载显示到地图上
    // intoMap: {
    //     type: Boolean,
    //     default() {
    //         return true
    //     }
    // },
    //是否删除
    // remove: {
    //     type: Boolean,
    //     default() {
    //         return false
    //     }
    // },
  },
  emits: ["click", "moving"],
  setup(e, r) {
    const d = M("storeData"), { map: i } = d, t = p();
    n(), g(
      () => e.position,
      a,
      { immediate: !0, deep: !0 }
    ), g(
      () => e.Icon,
      o,
      { immediate: !0, deep: !0 }
    );
    function n() {
      e.position.length && (t.value = new window.AMap.Marker({
        map: i,
        position: e.position,
        offset: e.offset,
        // icon:props.Icon,
        size: e.size,
        // 图标尺寸  宽  高
        // anchor: anchor[i], //设置锚点
        zIndex: 0
      }), t.value.setIcon(e.Icon), t.value.id = e.id, t.value.on("click", w), t.value.on("moving", l));
    }
    function a(c) {
      if (!t.value)
        return n();
      c.length ? (t.value.setMap(i), s(c)) : t.value.setMap(null);
    }
    function o(c, f) {
      t.value && c != f && t.value.setIcon(c);
    }
    function s(c, f = 1e3) {
      e.usemoveTransform ? t.value.moveTo(c, {
        duration: f,
        delay: 500
      }) : t.value.setPosition(c), t.value.setMap(i);
    }
    function v() {
      t.value && (t.value.off("click", w), t.value.off("moving", l), i.remove(t.value), t.value = null);
    }
    function w(c) {
      r.emit("click", {
        // e,
        id: e.id,
        lnglat: e.position
      });
    }
    function l(c) {
      r.emit("moving", {
        id: e.id,
        lnglat: c.target._position
      });
    }
    return O(() => {
    }), {
      removeMarker: v,
      myMarker: t
    };
  },
  render() {
  }
}, U = {
  name: "Liner",
  props: {
    //路径数组 [[],[]]
    path: {
      type: Array,
      default() {
        return [];
      }
    },
    //线条的属性配置
    options: {
      type: Object,
      default() {
        return {
          borderWeight: 2,
          // 线条宽度，默认为 1
          strokeColor: "#28F",
          // 线条颜色
          strokeWeight: 6,
          //轮廓线宽度
          strokeOpacity: 0.8
          //线透明度
        };
      }
    }
  },
  setup(e) {
    const r = M("storeData"), { map: d } = r, i = p();
    t(), g(
      () => e.path,
      n,
      { immediate: !0, deep: !0 }
    );
    function t() {
      i.value = new window.AMap.Polyline({
        map: d,
        ...e.options,
        zIndex: 1
      }), i.value.on("click", o);
    }
    function n(v) {
      i.value || (t(), a()), v.length ? a() : i.value.setMap(null);
    }
    function a() {
      i.value.setPath(e.path), i.value.setMap(d);
    }
    function o(v, w) {
    }
    function s() {
      i.value && (i.value.off("click", o), d.remove(i.value), i.value = null);
    }
    return {
      removeLiner: s,
      myLiner: i
    };
  },
  render() {
  }
}, V = {
  name: "InfoWindow",
  props: {
    position: {
      type: Array || Object
    },
    content: null
  },
  emits: ["close"],
  setup(e, { emit: r, expose: d }) {
    const i = M("storeData"), { map: t } = i, n = p();
    a(), T(() => {
    }), g(
      () => e.position,
      l,
      { immediate: !0, deep: !0 }
    ), g(
      () => e.content,
      f,
      { immediate: !0, deep: !0 }
    );
    function a() {
      n.value = new window.AMap.InfoWindow({
        offset: new window.AMap.Pixel(0, -30)
        // autoMove: true,
      }), n.value.id = e.id, n.value.on("close", s);
    }
    function o() {
      n.value.open(t, e.position);
    }
    function s() {
      e.position ? r("close") : console.log(e.position, "onclose手动调用");
    }
    function v() {
      n.value.setContent(e.content);
    }
    function w(y) {
      v(), n.value.setPosition(y);
    }
    function l(y) {
      n.value.setMap(t), n.value && y ? n.value.getIsOpen() && w(y) : n.value.close();
    }
    function c() {
      n.value.close();
    }
    function f(y) {
      n.value.setContent(y);
    }
    return {
      close: c,
      open: o
    };
  },
  render() {
  }
}, $ = {
  name: "MouseTool",
  props: {
    type: {
      type: String,
      default: "marker"
    }
  },
  emits: ["draw"],
  setup(e, r) {
    const d = M("storeData"), { map: i } = d, t = p(), n = p([{}]);
    i.plugin(["AMap.MouseTool"], function() {
      a();
    }), g(
      () => e.type,
      w,
      { immediate: !0, deep: !0 }
    );
    function a() {
      t.value = new window.AMap.MouseTool(i);
    }
    function o(l) {
      n.value.push(l.obj), r.emit("draw", { obj: l.obj, overlays: n.value });
    }
    function s() {
      i.remove(n.value);
    }
    function v(l = !0) {
      t.value.close(l);
    }
    function w(l) {
      l && l != t.value && (t.value[l](), t.value.on("draw", o));
    }
    return {
      remove: s,
      close: v
    };
  },
  render() {
    return () => S("div", { class: "MouseTool" }, "MouseTool");
  }
}, J = {
  name: "PathSimplifierIns",
  props: {
    // 巡航方式
    model: {
      type: String,
      default() {
        return "realTime";
      }
    },
    icon: {
      type: String || null,
      default: ""
    },
    // 巡航器更换标识，id改变，将重置巡航器
    id: null,
    //定位信息
    position: {
      type: Array,
      default() {
        return [];
      }
    },
    speed: {
      //速度
      type: Number,
      default: 0
    }
  },
  emits: ["moveing", "pointClick"],
  setup(e, r) {
    const d = M("storeData"), { map: i } = d, t = p();
    t.value = null;
    const n = p(), a = {
      lineWidth: 0,
      fillStyle: null,
      strokeStyle: null,
      borderStyle: null
    }, o = p(), s = p([{
      name: "动态路线",
      path: [[]]
    }]), v = p(0);
    F("AMapUI", "https://webapi.amap.com/ui/1.1/main.js?v=1.1.1").then((u) => {
      w(u);
    }), T(() => {
    }), g(
      () => e.id,
      _,
      { immediate: !0, deep: !0 }
    ), g(
      () => e.position,
      h,
      { immediate: !0, deep: !0 }
    );
    function w(u) {
      u.load(["ui/misc/PathSimplifier"], function(m) {
        if (!m.supportCanvas) {
          alert("当前环境不支持 Canvas！");
          return;
        }
        n.value = m, l();
      });
    }
    function l() {
      t.value = new n.value({
        zIndex: 100,
        autoSetFitView: !1,
        map: i,
        //所属的地图实例
        pathNavigatorStyle: {
          width: 32,
          height: 32,
          //使用图片
          content: n.value.Render.Canvas.getImageContent(e.icon)
        },
        getPath: function(u) {
          return u.path;
        },
        getHoverTitle: function(u) {
          return u.name + "，点数量" + u.path.length;
        },
        renderOptions: e.model == "realTime" ? {
          //将点、线相关的style全部置emptyLineStyle
          pathLineStyle: a,
          pathLineSelectedStyle: a,
          pathLineHoverStyle: a,
          keyPointStyle: a,
          startPointStyle: a,
          endPointStyle: a,
          keyPointHoverStyle: a,
          keyPointOnSelectedPathLineStyle: a
        } : {}
      });
    }
    function c() {
      s.value[0].path[0] = e.position, t.value.setData(s.value), o.value = t.value.createPathNavigator(0, {
        speed: e.speed || 1e6,
        //巡航速度，单位千米/小时\
        loop: !1,
        //循环播放
        pathNavigatorStyle: {
          width: 32,
          height: 32,
          //使用图片
          content: n.value.Render.Canvas.getImageContent(e.icon)
        }
      }), o.value.start();
    }
    function f() {
      let u = [];
      if (e.position[0].point && (u = e.position.map((m) => m.point)), e.position[0].length && (u = e.position), console.log(u, "historyStart"), u[0]) {
        let m = e.position[0].icon || e.icon;
        console.log(e.position, "historyStart"), s.value[0].path = u, t.value.setData(s.value), o.value = t.value.createPathNavigator(0, {
          loop: !1,
          //循环播放
          speed: e.speed || 1e6,
          //巡航速度，单位千米/小时
          pathNavigatorStyle: {
            width: 32,
            height: 32,
            //使用图片
            content: n.value.Render.Canvas.getImageContent(m)
          },
          getPath: function(A) {
            return A.path;
          }
        }), o.value.start(), o.value.on("move", k), t.value.off("pathClick pointClick", P);
      }
    }
    function y(u) {
      if (u.length) {
        var m = o.value.getCursor().clone(), A = o.value.getNaviStatus();
        s.value[0].path[0].length ? s.value[0].path.push(u) : s.value[0].path[0] = u, t.value.setData(s.value), o.value = t.value.createPathNavigator(0, {
          //loop: true, //循环播放
          speed: e.speed || 1e6,
          //巡航速度，单位千米/小时
          pathNavigatorStyle: {
            width: 32,
            height: 32,
            //使用图片
            content: n.value.Render.Canvas.getImageContent(e.icon)
          }
        }), o.value.on("move", k), A !== "stop" && o.value.start(), m.idx >= 0 && o.value.moveToPoint(m.idx, m.tail);
      }
    }
    function k(u, m) {
      let A = m.dataItem.pointIndex, b = o.value.getPosition();
      if (r.emit("moveing", [b.lng, b.lat]), e.model != "realTime") {
        if (!e.position[v.value].icon)
          return;
        if (v.value != A) {
          v.value = A;
          let L = o.value.getStyleOptions();
          L.content = n.value.Render.Canvas.getImageContent(e.position[v.value].icon), t.value.renderLater(200);
        }
      }
    }
    function P(u, m) {
      r.emit("pointClick", u, m);
    }
    function h(u) {
      u[0] && I(u);
    }
    function I(u) {
      t.value ? e.model == "realTime" && (o.value ? y(u) : c()) : setTimeout(() => {
        e.model == "realTime" ? I(u) : I(null);
      }, 200);
    }
    function _(u, m) {
      m && (o.value && D(), o.value = null, e.model == "realTime" && u && (s.value[0].path = [e.position], l()));
    }
    function x() {
      f();
    }
    function E() {
      o.value.pause();
    }
    function j() {
      o.value.resume();
    }
    function z() {
      o.value.stop();
    }
    function D() {
      o.value.destroy();
    }
    return {
      start: x,
      pause: E,
      resume: j,
      stop: z,
      destroy: D
    };
  },
  render() {
    return () => S("div", { class: "MoveAnimation" }, "MoveAnimation");
  }
}, q = {
  name: "MoveAnimation",
  props: {
    // 轨迹路径
    lineArr: {
      type: Array,
      default() {
        return [];
      }
    },
    Icon: {
      type: String,
      default: null
    },
    size: {
      type: Array,
      default() {
        return [50, 50];
      }
    },
    offset: {
      type: Array,
      default() {
        return [-13, 0];
      }
    }
    // id:''
  },
  emits: ["moving", "pointClick"],
  setup(e, r) {
    const d = M("storeData"), { map: i } = d, t = p(), n = p(), a = p(e.lineArr);
    g(
      () => e.lineArr,
      o,
      { immediate: !0, deep: !0 }
    ), g(
      () => e.Icon,
      s,
      { immediate: !1, deep: !0 }
    );
    function o(h) {
      a.value = e.lineArr, h[0] && v();
    }
    function s(h) {
      t.value && t.value.setIcon(h);
    }
    function v() {
      window.AMap.plugin("AMap.MoveAnimation", function() {
        t.value && i.remove(t.value), t.value = new window.AMap.Marker({
          map: i,
          // icon:props.Icon,
          // size: new window.AMap.Size(props.size[0], props.size[1]), 
          position: a.value[0],
          offset: e.offset,
          zIndex: 13
        }), t.value.setIcon(e.Icon), n.value = new window.AMap.Polyline({
          map: i,
          strokeColor: "#AF5",
          //线颜色
          strokeWeight: 6,
          //线宽
          zIndex: 10,
          strokeOpacity: 0.8
          //线透明度
        }), i.setFitView(), t.value.on("moving", l), t.value.on("click", w), t.value.on("movealong", c);
      });
    }
    function w(h) {
      r.emit("pointClick", h);
    }
    function l(h) {
      n.value.setPath(h.passedPath), r.emit("moving", h);
    }
    function c() {
      console.log("onmoveAlong");
    }
    function f(h) {
      P(), console.log(a.value.length, "lineArr"), t.value.moveAlong(a.value, {
        // 每一段的时长
        duration: 500,
        //可根据实际采集时间间隔设置
        // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
        autoRotation: !0,
        ...h
      });
    }
    function y() {
      t.value.pauseMove();
    }
    function k() {
      t.value.resumeMove();
    }
    function P() {
      console.log("停止动画"), t.value && t.value.stopMove();
    }
    return {
      lineArr: a,
      startAnimation: f,
      pauseAnimation: y,
      resumeAnimation: k,
      stopAnimation: P,
      init: v
    };
  },
  render() {
  }
}, G = {
  name: "EditPlugin",
  props: {
    type: {
      type: String,
      default: ""
    },
    //是否开启 编辑模式
    edit: {
      type: Boolean,
      default: !1
    },
    overlayOptions: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  emits: ["end"],
  setup(e, r) {
    const d = M("storeData"), { map: i } = d, t = p(""), n = p(), a = p();
    g(
      () => e.edit,
      w,
      { immediate: !0, deep: !0 }
    ), g(
      () => e.type,
      l,
      { immediate: !0, deep: !0 }
    );
    function o() {
      if (!t.value)
        return;
      let f = {};
      e.type == "rectangle" && (f.bounds = new window.AMap.Bounds(e.overlayOptions.southWest, e.overlayOptions.northEast)), n.value = new window.AMap[t.value]({
        ...e.overlayOptions,
        ...f
      }), n.value.setMap(i), e.edit && s();
    }
    function s() {
      if (t.value) {
        if (e.type == "marker")
          return n.value.setDraggable(!0);
        i.plugin(["AMap." + t.value + "Editor"], function() {
          a.value = new window.AMap[t.value + "Editor"](i, n.value), a.value.open(), a.value.on("end", v);
        });
      }
    }
    function v(f) {
      r.emit("end", f);
    }
    function w(f) {
      e.type && (f ? n.value ? s() : o() : a.value && a.value.close());
    }
    function l(f) {
      if (c(), f) {
        let y = f.split("");
        y[0] = y[0].toUpperCase(), t.value = y.join(""), o();
      }
    }
    function c() {
      n.value && (i.remove(n.value), n.value = null), a.value && (a.value.close(), a.value.off("end", v), a.value = null);
    }
  },
  render() {
    return () => S("div", { class: "EditPlugin" }, "EditPlugin");
  }
}, C = {
  Map: B,
  Marker: H,
  Liner: U,
  InfoWindow: V,
  MouseTool: $,
  PathSimplifierIns: J,
  MoveAnimation: q,
  EditPlugin: G
}, K = function(e) {
  for (var r in C)
    e.component(r, C[r]);
};
let X = {
  version: "0.0.6",
  install: K,
  ...C
};
export {
  X as default
};
