<template>
  <div>
    <el-form
      :rules="rules"
      v-loading.fullscreen.lock="loading"
      element-loading-text="登录中..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      ref="loginForm"
      :model="loginForm"
      class="loginContainer"
    >
      <h3 class="loginTitle">YoursPan系统登录</h3>
      <el-form-item prop="userId">
        <el-input
          type="text"
          auto-complete="false"
          v-model="loginForm.userId"
          placeholder="请输入UID"
          prefix-icon="el-icon-user"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          auto-complete="false"
          v-model="loginForm.password"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
        ></el-input>
      </el-form-item>
      <el-form-item prop="verifyCode">
        <el-input
          type="text"
          auto-complete="false"
          v-model="loginForm.verifyCode"
          placeholder="点击图片更换验证码"
          style="width: 250px; margin-right: 5px"
        ></el-input>
        <img :src="captchaUrl" @click="updateCaptcha" style="border: 2px solid #eaeaea" />
      </el-form-item>
      <el-checkbox v-model="checked" class="loginRemember">记住我</el-checkbox>
      <el-button
        type="text"
        style="margin-left: 15%"
        @click="registerFormVisible = true,title = '新用户注册'"
      >新用户注册</el-button>
      <el-button
        type="text"
        style="margin-left: 12%"
        @click="registerFormVisible = true,title = '重置密码'"
      >忘记密码？</el-button>
      <el-button type="primary" class="loginButton" @click="submitLogin">登录</el-button>
    </el-form>
    <!--注册/忘记密码表单-->
    <el-dialog :title="title" :visible.sync="registerFormVisible" width="300px">
      <el-form :model="registerForm" ref="registerForm" :rules="rules1">
        <el-form-item prop="email">
          <el-input
            type="text"
            auto-complete="false"
            v-model="registerForm.email"
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            auto-complete="false"
            v-model="registerForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            type="password"
            auto-complete="false"
            v-model="registerForm.confirmPassword"
            placeholder="再次输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="verifyCode">
          <el-input
            type="text"
            auto-complete="false"
            v-model="registerForm.verifyCode"
            placeholder="请输入验证码"
            style="margin-right: 5px"
          ></el-input>
          <el-button @click="sendVerifyCode">发送验证码</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="registerFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRegister">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      captchaUrl: "/sms/system/getVerifyCodeImage?time=" + new Date(),
      loginForm: {
        userId: "1001",
        password: "123456",
        verifyCode: ""
      },
      loading: false,
      checked: false,
      rules: {
        userId: [{ required: true, message: "请输入UID", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        verifyCode: [
          { required: true, message: "请输入验证码", trigger: "blur" }
        ]
      },
      registerFormVisible: false,
      title: "",
      registerForm: {
        email: "",
        password: "",
        confirmPassword: "",
        verifyCode: ""
      },
      rules1: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
              if (!reg.test(value)) {
                callback(new Error("邮箱格式不正确"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 16, message: "密码长度在6到16个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error("两次输入密码不一致!"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        verifyCode: [
          { required: true, message: "请输入验证码", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = "/sms/system/getVerifyCodeImage?time=" + new Date();
    },
    submitLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.postRequest("/sms/system/login", this.loginForm).then(
            response => {
              if (response) {
                const token = response.data.token;
                window.sessionStorage.setItem("token", token);
                let path = this.$route.query.redirect;
                this.$router.push((path=='/' || path==undefined) ? "/home":path);
              }
              this.loading = false;
            }
          );
        } else {
          this.$message({
            message: "请输入所有字段",
            type: "error"
          });
          return false;
        }
      });
    },
    sendVerifyCode() {
      this.$refs.registerForm.validate(() => {
        // 只判断邮箱是否为空，其他字段不判断
        if (this.registerForm.email) {
          // 邮件以参数形式附加到路径上
          this.postRequest(
            "/sms/system/sendVerifyCode/" + this.registerForm.email
          ).then(response => {
            if (response) {
              this.$message({
                message: "验证码发送成功",
                type: "success"
              });
            }
          });
        } else {
          this.$message({
            message: "请输入邮箱",
            type: "error"
          });
          return false;
        }
      });
    },
    submitRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          if (this.title === "新用户注册") {
            this.postRequest(
              "/sms/system/register/" + this.registerForm.verifyCode,
              {
                email: this.registerForm.email,
                password: this.registerForm.password
              }
            ).then(response => {
              if (response) {
                this.$message({
                  message: "注册成功",
                  type: "success"
                });
                this.registerFormVisible = false;
              }
            });
          } else if (this.title === "重置密码") {
            this.postRequest(
              "/sms/system/forgetPwd/" + this.registerForm.verifyCode,
              {
                email: this.registerForm.email,
                password: this.registerForm.password
              }
            ).then(response => {
              if (response) {
                this.$message({
                  message: "重置密码成功",
                  type: "success"
                });
                this.registerFormVisible = false;
              }
            });
          } else {
            this.$message({
              message: "未知错误",
              type: "error"
            });
          }
        } else {
          this.$message({
            message: "请输入所有字段",
            type: "error"
          });
          return false;
        }
      });
    }
  }
};
</script>

<style>
.loginContainer {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 15px 35px 25px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}
.loginTitle {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
.loginRemember {
  margin-bottom: 20px;
}
.loginButton {
  width: 100%;
}
.el-form-item__content {
  display: flex;
  align-items: center;
}
.dialog-footer {
  text-align: center;
}
</style>