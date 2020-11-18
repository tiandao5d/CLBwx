const fs = require("fs");
const path = require("path");

// id: number;
// title?: string; // 标题
// icon?: string; // 图标
// content?: string; // 文字说明
// type?: string; // 主要讨论的语言
// createTime?: number; // 添加日期
// updateTime?: number; // 修改日期
// {
//   id: 1, // 最大id要自增
//   items: [],
// }

class BKList {
  constructor() {
    this.fileSrc = path.resolve(__dirname, "../xlku/bk_list.json");
    this.defaultItem = {
      id: 0,
      title: "",
      icon: "",
      content: "",
      type: "",
      createTime: 0,
      updateTime: 0,
    };
    this.fileObjType = {
      id: 1,
      items: [],
    };
  }
  formatItems(items) {
    items = items.map((item) => {
      for (let k in item) {
        if (!(k in this.defaultItem)) {
          item[k] = undefined;
        }
      }
      return item;
    });
    return items;
  }
  assign(...items) {
    const fn = (items) => {
      if (items.length === 0) {
        return null;
      } else if (items.length === 1) {
        return items[0];
      }
      let item2 = items.pop();
      let item1 = items[items.length - 1];
      for (let k in item2) {
        if (item2[k] !== undefined) {
          item1[k] = item2[k];
        }
      }
      return fn(items);
    };
    // items = this.formatItems(items);
    return fn(items);
  }
  getSouce() {
    let res = fs.readFileSync(this.fileSrc).toString().trim();
    res = res
      ? JSON.parse(res)
      : {
          id: 1,
          items: [],
        };
    return res;
  }
  get(ids) {
    let res = this.getSouce();
    const items = res.items.filter((o) => ids.includes(o.id));
    if (items.length) {
      return this.msg(items, "获取成功", "success");
    }
    return this.msg(res.items, "获取成功", "success");
  }
  del(ids) {
    let res = this.getSouce();
    ids = ids.filter((id) => res.items.some((o) => o.id === id));
    if (ids.length) {
      res.items = res.items.filter((o) => !ids.includes(o.id));
      const items = res.items.filter((o) => ids.includes(o.id));
      this.reset(res);
      return this.msg(items, "删除成功", "success");
    }
    return this.msg([], "未能找到可删除数据", "error");
  }
  update(items) {
    let res = this.getSouce();
    let tt = Date.now();
    items = items.filter((o) => res.items.some((oo) => oo.id === o.id));
    if (items.length) {
      items = this.formatItems(items);
      items = items.map((o) => {
        let n_o = o;
        res.items.some((oo) => {
          if (oo.id === o.id) {
            this.assign(oo, o);
            oo.updateTime = tt;
            n_o = oo;
            return true;
          }
        });
        return n_o;
      });
      this.reset(res);
      return this.msg(items, "更新成功", "success");
    }
    return this.msg([], "未能找到可更新数据", "error");
  }
  add(items) {
    let res = this.getSouce();
    let tt = Date.now();
    items = this.formatItems(items);
    items = items.map((item) => {
      item.id = ++res.id;
      item = this.assign({}, this.defaultItem, item);
      item.createTime = tt;
      return item;
    });
    res.items = [...items, ...res.items];
    this.reset(res);
    return this.msg(items, "添加成功", "success");
  }
  reset(res) {
    res = typeof res === "object" ? JSON.stringify(res) : "" + res;
    fs.writeFileSync(this.fileSrc, res);
  }
  msg(data, msg, type) {
    return { data, msg, type };
  }
}
const bkListCls = new BKList();
module.exports = { bkListCls };
