function NavbarService() {
  "ngInject";

  var that = this;
  that.conf = {};
  that.conf.search = "";
  that.conf.showSearchBox = false;
  that.conf.showMainNavBar = true;
  that.conf.showLanguage = true;
  that.conf.showSignOut = true;
  that.conf.showTitle = false;
  that.conf.title = "";
  that.conf.username = "";
  that.conf.showSwitch = false;
  that.conf.linkedFilterInstance = null;
  that.conf.showGeoSelector = false;
  that.conf.showExport = true;
  that.conf.showEye = true;
  that.conf.showRST = true;
  that.conf.showMessage = true;
  that.switchConf = {
    map: {
      state: "",
    },
    table: {
      state: "",
    },
  };
  // 重置所有的NAV上的按键显示隐藏字段
  // ks 就是当前控制器中想要显示的数据字段
  that.resetConf = function (ks = []) {
    // 初始化所有的默认值
    for (let k in that.conf) {
      let v = that.conf[k];
      if (typeof v === "boolean") {
        if (ks.includes(k)) {
          that.conf[k] = true;
        } else {
          that.conf[k] = false;
        }
      }
    }
  };
}

module.exports.fn = NavbarService;
module.exports.name = "NavbarService";
