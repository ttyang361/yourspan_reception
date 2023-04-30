<template>
  <div style="margin-top: 12px">
    <el-descriptions title="用户列表"></el-descriptions>
    <el-table
      :stripe="stripe"
      ref="filterUserTable"
      :data="userList"
      border
      style="width: 90%"
      height="480"
    >
      <el-table-column fixed prop="uid" label="UID" width="180"></el-table-column>
      <el-table-column prop="name" label="用户名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="400"></el-table-column>
      <el-table-column prop="isFrozen" label="状态" width="180">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isFrozen ? 'danger' : 'success'"
            disable-transitions
          >{{scope.row.isFrozen ? '已冻结' : '正常'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="容量(MB)" width="200"></el-table-column>
      <el-table-column
        prop="isAdmin"
        label="用户类型"
        width="180"
        :filters="[{text: '普通用户',value: '普通用户'},{text: '管理员',value: '管理员'}]"
        :filter-method="filterUserType"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isAdmin === '管理员' ? 'primary' : 'success'"
            disable-transitions
          >{{scope.row.isAdmin}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="350">
        <template slot-scope="scope">
          <el-button @click="editUserCapacity(scope.row)" type="text" size="medium">修改用户存储容量</el-button>
          <el-button @click="setAsAdmin(scope.row)" type="text" size="medium">设为管理员</el-button>
          <el-button @click="freezeUser(scope.row)" type="text" size="medium">冻结</el-button>
          <el-button @click="unFreezeUser(scope.row)" type="text" size="medium">解冻</el-button>
          <el-button @click="deleteUser(scope.row)" type="text" size="medium">注销</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
  
<script>
export default {
  name: "MaUser",
  data() {
    return {
      userList: [],
      stripe: true
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    getUserList() {
      this.getRequest("/sms/adminController/getAllUserInfo").then(res => {
        if (res.code == 200) {
          const userList = res.data.userList;
          const capacityList = res.data.capacityList;
          userList.forEach(item => {
            if (item.isAdmin) {
              item.isAdmin = "管理员";
            } else {
              item.isAdmin = "普通用户";
            }
            capacityList.forEach(capacity => {
              if (item.uid == capacity.uid) {
                item.capacity = capacity.used.toFixed(2) + "/" + capacity.total;
              }
            });
          });
          this.userList = userList;
        }
      });
    },
    filterUserType(value, row) {
      return row.isAdmin === value;
    },
    freezeUser(row) {
      this.postRequest("/sms/adminController/freezeUser", {
        uid: row.uid
      }).then(res => {
        if (res.code == 200) {
          this.$message({
            message: "冻结成功",
            type: "success"
          });
          this.getUserList();
        } else {
          this.$message({
            message: "冻结失败",
            type: "error"
          });
        }
      });
    },
    unFreezeUser(row) {
      this.postRequest("/sms/adminController/unfreezeUser", {
        uid: row.uid
      }).then(res => {
        if (res.code == 200) {
          this.$message({
            message: "解冻成功",
            type: "success"
          });
          this.getUserList();
        } else {
          this.$message({
            message: "解冻失败",
            type: "error"
          });
        }
      });
    },
    deleteUser(row) {
      this.postRequest("/sms/adminController/deleteUser", {
        uid: row.uid
      }).then(res => {
        if (res.code == 200) {
          this.$message({
            message: "注销成功",
            type: "success"
          });
          this.getUserList();
        } else {
          this.$message({
            message: "注销失败",
            type: "error"
          });
        }
      });
    },
    editUserCapacity(row) {
      this.$prompt("请输入新的容量(MB)", "修改用户容量", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValidator: value => {
          if (value > 0 && value < 1048576) {
            return true;
          }
          return "请输入0-1048576正整数";
        }
      })
        .then(({ value }) => {
          // 如果value不是数字或者小于0或者大于1048576，会报错
          if (isNaN(value) || value < 0 || value > 1048576) {
            this.$message({
              message: "请输入0-1048576正整数",
              type: "error"
            });
            return;
          }
          this.postRequest("/sms/adminController/editUserCapacity/" + value, {
            uid: row.uid
          }).then(res => {
            if (res.code == 200) {
              this.$message({
                message: "修改成功",
                type: "success"
              });
              this.getUserList();
            } else {
              this.$message({
                message: "修改失败",
                type: "error"
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    setAsAdmin(row) {
      this.postRequest("/sms/adminController/setAsAdmin", {
        uid: row.uid
      }).then(res => {
        if (res.code == 200) {
          this.$message({
            message: "设置成功",
            type: "success"
          });
          this.getUserList();
        } else {
          this.$message({
            message: "设置失败",
            type: "error"
          });
        }
      });
    }
  }
};
</script>
  
<style scoped>
</style>