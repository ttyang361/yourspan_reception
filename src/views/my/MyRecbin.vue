<template>
  <div style="margin-top: 5px">
    <div
      class="fileList"
      v-infinite-scroll="loadMore"
      infinite-scroll-disable="loading"
      infinite-distance="10"
      v-loading="loadings"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
    >
      <p v-for="item in fileList" :key="item.fid">
        <el-card shadow="hover" class="box-card" style="margin-top: 10px">
          <div slot="header" class="clearfix">
            <span>{{ item.fname }}</span>
          </div>
          <el-button type="primary" size="small" @click="deleteFile(item)">删除</el-button>
          <el-button type="primary" size="small" @click="recoverFile(item)">恢复</el-button>
          <el-button type="text" size="small" @click="fileDetail(item)" style="margin-left: 25px">详情</el-button>
        </el-card>
      </p>
    </div>
    <el-backtop :visibilityHeight="200" />
    <el-dialog title="文件详情" :visible.sync="fileDetailDialogVisible" width="30%" center>
      <el-descriptions class="margin-top" :column="1" size="medium">
        <el-descriptions-item label="文件名">{{ currentFile.fname }}</el-descriptions-item>
        <el-descriptions-item label="上传者ID">{{ currentFile.fownerId }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ currentFile.fsize }}KB</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentFile.fcreateTime }}</el-descriptions-item>
        <el-descriptions-item label="最后一次修改时间">{{ currentFile.flastModifiedTime }}</el-descriptions-item>
        <el-descriptions-item label="文件描述">这是一段普通的文件描述</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "MyRecbin",
  data() {
    return {
      fileList: [],
      loading: false,
      loadings: true,
      currentFile: {},
      fileDetailDialogVisible: false
    };
  },
  created() {
    this.getFileList();
  },
  methods: {
    getFileList() {
      try {
        this.getRequest("/sms/userController/getRecycleBinFileList").then(
          res => {
            if (res.data.length === 0) {
              this.$message({
                message: "暂无回收站文件",
                type: "warning"
              });
              this.loadings = false;
            } else {
              for (let i = 0; i < res.data.length; i++) {
                this.fileList.push(res.data[i]);
              }
              this.loadings = false;
            }
          }
        );
      } catch (e) {
        this.$message({
          message: "获取回收站文件列表失败",
          type: "error"
        });
      }
    },
    loadMore() {
      this.loading = true;
    },
    fileDetail(item) {
      this.currentFile = item;
      this.fileDetailDialogVisible = true;
    },
    deleteFile(item) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.postRequest("/sms/userController/deleteFile/" + item.fid).then(
            res => {
              if (res.code == 200) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                this.fileList = [];
                this.getFileList();
              } else {
                this.$message({
                  message: "删除失败",
                  type: "error"
                });
              }
            }
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    recoverFile(item) {
      this.$confirm("此操作将恢复该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.postRequest(
            "/sms/userController/restoreFromRecycleBin/" + item.fid
          ).then(res => {
            if (res.code == 200) {
              this.$message({
                message: "恢复成功",
                type: "success"
              });
              this.fileList = [];
              this.getFileList();
            } else {
              this.$message({
                message: "恢复失败",
                type: "error"
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消恢复"
          });
        });
    }
  }
};
</script>

<style scoped>
</style>