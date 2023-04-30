<template>
  <div>
    <el-container>
      <el-header class="homeHeader">
        <div class="title">YoursPan系统</div>
        <el-dropdown class="userInfo" @command="commandHandler">
          <span class="el-dropdown-link">
            {{user.name}}
            <i>
              <img :src="user.avatarPath" @click="changeUserAvatarDialogVisible=true" />
            </i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">注销登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <el-menu router unique-opened>
            <el-submenu
              :index="index+''"
              v-for="(item,index) in routes"
              :key="index"
              v-show="!item.hidden"
            >
              <template slot="title">
                <i :class="item.iconCls" style="color: black; margin-right: 5px"></i>
                <span>{{item.name}}</span>
              </template>
              <el-menu-item
                :index="children.path"
                v-for="(children,indexj) in item.children"
                :key="indexj"
              >
                <i :class="children.iconCls" style="color: black; margin-right: 5px"></i>
                {{children.name}}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <el-breadcrumb
            v-if="this.$router.currentRoute.path!='/home'"
            separator-class="el-icon-arrow-right"
          >
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{this.$router.currentRoute.name}}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="homeWelcome" v-if="this.$router.currentRoute.path=='/home'">欢迎使用YoursPan系统</div>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <el-dialog title="修改头像" :visible.sync="changeUserAvatarDialogVisible" width="30%">
      <el-upload
        class="avatar-uploader"
        action="http://localhost:9001/sms/userController/avatarUpload"
        :show-file-list="false"
        name="multipartFile"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="user.avatarPath" :src="user.avatarPath" class="avatar" />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      user: JSON.parse(window.sessionStorage.getItem("user")),
      changeUserAvatarDialogVisible: false
    };
  },
  computed: {
    routes() {
      return this.$store.state.routes;
    }
  },
  methods: {
    commandHandler(command) {
      if (command == "logout") {
        this.$confirm("确定注销登录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.postRequest("/sms/system/logout").then(res => {
              if (res.code == 200) {
                window.sessionStorage.removeItem("user");
                window.sessionStorage.removeItem("token");
                this.$store.commit("initRoutes", []);
                this.$router.replace("/");
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消"
            });
          });
      }
    },
    handleAvatarSuccess(res) {
      this.user.avatarPath = "http://localhost:9001/" + res.data;
      this.postRequest("/sms/userController/updateAvatarPath/", {
        avatarPath: this.user.avatarPath
      }).then(res => {
        if (res.code == 200) {
          this.$message({
            message: "修改头像成功",
            type: "success"
          });
          this.changeUserAvatarDialogVisible = false;
        } else {
          this.$message({
            message: "修改头像失败",
            type: "error"
          });
        }
      });
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG || isPNG || isLt2M;
    }
  }
};
</script>

<style>
.homeHeader {
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  box-sizing: border-box;
}
.title {
  font: 14px/1.5 "Microsoft YaHei", arial, tahoma, 5b8b4f53, sans-serif;
}
.page-scroll {
  height: 100%;
}
.page-scroll .el-scrollbar__wrap {
  overflow-x: hidden;
}
.el-aside::-webkit-scrollbar {
  display: none;
}
.el-aside {
  overflow-y: auto;
}
.el-aside .el-menu {
  border-right: none;
}
.el-aside .el-menu-item {
  padding: 0 20px;
}
.el-aside .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}
.el-aside .el-menu-item.is-active .el-submenu__title {
  color: #fff;
}
.homeHeader .userInfo {
  cursor: pointer;
}
.el-dropdown-link img {
  width: 48px;
  border-radius: 24px;
  margin-left: 8px;
}
.homeWelcome {
  text-align: center;
  font-size: 30px;
  font-family: 华文楷体;
  color: #409eff;
  padding-top: 50px;
}
.avatar-uploader {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}
.avatar {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 6px;
}
</style>