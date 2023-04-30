<template>
  <div style="margin-top: 5px">
    <el-descriptions title="个人资料" :column="1" border>
      <template slot="extra">
        <el-button type="primary" size="medium" @click="changeUserInfoDialog = true">修改资料</el-button>
      </template>
      <el-descriptions-item>
        <template slot="label">
          <i class="fa fa-user-o"></i>
          用户名
        </template>
        {{ user.name }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="fa fa-vcard-o"></i>
          UID
        </template>
        {{ user.uid }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="fa fa-envelope-o"></i>
          邮箱
        </template>
        {{ user.email }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-mobile"></i>
          手机
        </template>
        {{ user.telephone }}
      </el-descriptions-item>
    </el-descriptions>
    <el-divider></el-divider>
    <el-row>
      <el-col :span="14">
        <el-descriptions title="存储容量" style="margin-top:20px" :column="1" border>
          <el-descriptions-item>
            <template slot="label">
              <i class="fa fa-database"></i>
              已用容量
            </template>
            {{ capacity.used }}MB
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              <i class="fa fa-database"></i>
              全部容量
            </template>
            {{ capacity.total }}MB
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
    <div>
      <el-progress
        type="dashboard"
        :percentage="percentage"
        :color="colors"
        :stroke-width="7"
        stroke-linecap="butt"
        style="margin-top: 20px"
      ></el-progress>
    </div>
    <el-divider></el-divider>
    <el-descriptions title="解析文件token"></el-descriptions>
    <el-row>
      <el-col :span="16">
        <el-input type="text" v-model="needFileToken" clearable></el-input>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="4">
        <el-button type="primary" @click="analyzeToken">解析</el-button>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row>
      <el-col>
        <el-button
          type="text"
          @click="changePasswordDialog = true"
          style="margin-top: 12px;font-size: 17px"
        >修改密码</el-button>
      </el-col>
    </el-row>
    <!--修改个人信息dialog-->
    <el-dialog title="修改资料" :visible.sync="changeUserInfoDialog" width="30%" center>
      <el-form :model="userInfoForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userInfoForm.name"></el-input>
        </el-form-item>
        <el-form-item label="UID">
          <el-input v-model="user.uid" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="userInfoForm.telephone"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeUserInfoDialog = false">取 消</el-button>
        <el-button type="primary" @click="changeUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改密码dialog-->
    <el-dialog title="修改密码" :visible.sync="changePasswordDialog" width="30%" center>
      <el-form
        :model="changePasswordForm"
        label-width="80px"
        ref="changePasswordForm"
        :rules="rule"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            placeholder="请输入原密码"
            v-model="changePasswordForm.oldPassword"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            placeholder="请输入新密码"
            v-model="changePasswordForm.newPassword"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            placeholder="请再次输入新密码"
            v-model="changePasswordForm.confirmPassword"
            show-password
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changePasswordDialog = false">取 消</el-button>
        <el-button type="primary" @click="changePassword">确 定</el-button>
      </span>
    </el-dialog>
    <!--解析后的分享文件信息dialog-->
    <el-dialog title="文件详情" :visible.sync="fileDetailDialogVisible" width="30%" center>
      <el-descriptions class="margin-top" :column="1" size="medium">
        <el-descriptions-item label="文件名">{{ fileFromToken.fname }}</el-descriptions-item>
        <el-descriptions-item label="上传者ID">{{ fileFromToken.fownerId }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ fileFromToken.fsize }}KB</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ fileFromToken.fcreateTime }}</el-descriptions-item>
        <el-descriptions-item label="最后一次修改时间">{{ fileFromToken.flastModifiedTime }}</el-descriptions-item>
      </el-descriptions>
      <el-button type="primary" size="medium" @click="downloadShareFile">下载</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "PerCenter",
  data() {
    return {
      user: JSON.parse(window.sessionStorage.getItem("user")),
      changeUserInfoDialog: false,
      changePasswordDialog: false,
      userInfoForm: {
        name: "",
        uid: "",
        email: "",
        telephone: ""
      },
      changePasswordForm: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      },
      rule: {
        oldPassword: [
          { required: true, message: "请输入原密码", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在6到20个字符", trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在6到20个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "密码长度在6到20个字符",
            trigger: "blur"
          },
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请再次输入新密码"));
              } else if (value !== this.changePasswordForm.newPassword) {
                callback(new Error("两次输入密码不一致!"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      },
      capacity: {},
      percentage: 0,
      colors: [
        { color: "#f56c6c", percentage: 100 },
        { color: "#e6a23c", percentage: 80 },
        { color: "#5cb87a", percentage: 60 },
        { color: "#1989fa", percentage: 40 },
        { color: "#6f7ad3", percentage: 20 }
      ],
      needFileToken: "",
      fileFromToken: {},
      fileDetailDialogVisible: false
    };
  },
  created() {
    this.userInfoForm.name = this.user.name;
    this.userInfoForm.uid = this.user.uid;
    this.userInfoForm.email = this.user.email;
    this.userInfoForm.telephone = this.user.telephone;
    this.getCapacity();
  },
  methods: {
    changeUserInfo() {
      this.postRequest("/sms/userController/saveOrUpdate", {
        uid: this.user.uid,
        password: this.user.password,
        email: this.user.email,
        name: this.userInfoForm.name,
        telephone: this.userInfoForm.telephone,
        rootFdirPath: this.user.rootFdirPath,
        avatarPath: this.user.avatarPath
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("修改成功");
          this.changeUserInfoDialog = false;
          this.user.name = this.userInfoForm.name;
          this.user.telephone = this.userInfoForm.telephone;
          window.sessionStorage.setItem("user", JSON.stringify(this.user));
        } else {
          this.$message.error(res.message);
        }
      });
    },
    changePassword() {
      this.$refs.changePasswordForm.validate(valid => {
        if (valid) {
          this.postRequest(
            "/sms/userController/resetPwd/" +
              this.changePasswordForm.oldPassword +
              "/" +
              this.changePasswordForm.newPassword
          ).then(res => {
            if (res.code === 200) {
              this.$message.success("修改密码成功");
              this.changePasswordDialog = false;
              this.user.password = this.changePasswordForm.newPassword;
              window.sessionStorage.setItem("user", JSON.stringify(this.user));
            } else {
              this.$message.error(res.message);
            }
          });
        } else {
          return false;
        }
      });
    },
    getCapacity() {
      this.getRequest("/sms/userController/getCapacity").then(res => {
        if (res.code === 200) {
          this.capacity = res.data.capacity;
          this.capacity.used = this.capacity.used.toFixed(2);
          this.percentage = Number(
            ((this.capacity.used / this.capacity.total) * 100).toFixed(2)
          );
        } else {
          this.$message.error(res.message);
        }
      });
    },
    analyzeToken() {
      this.getRequest(
        "/sms/userController/parseShareToken/" + this.needFileToken
      ).then(res => {
        if (res.code === 200) {
          this.fileFromToken = res.data;
          this.fileDetailDialogVisible = true;
        } else {
          this.$message.error(res.message);
        }
      });
    },
    downloadShareFile() {
      window.open(
        "http://localhost:9001/sms/userController/downloadFileTest/" +
          this.fileFromToken.fid
      );
    }
  }
};
</script>

<style scoped>
</style>