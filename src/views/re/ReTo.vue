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
          <el-button type="primary" size="small" @click="downloadFile(item)">下载</el-button>
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
  name: "ReTo",
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
        this.getRequest("/sms/userController/getRecommendFileDetail").then(
          res => {
            if (res.length === 0) {
              this.$message({
                message: "暂无推荐文件",
                type: "warning"
              });
            }
            // 将res.data中的元素取出并放入fileList中
            for (let i = 0; i < res.length; i++) {
              this.fileList.push(res[i]);
            }
            this.loadings = false;
          }
        );
      } catch (error) {
        console.log(error);
      }
    },
    loadMore() {
      this.loading = true;
    },
    downloadFile(item) {
      window.open(
        "http://localhost:9001/sms/userController/downloadFileTest/" + item.fid
      );
    },
    fileDetail(item) {
      this.currentFile = item;
      this.fileDetailDialogVisible = true;
    }
  }
};
</script>

<style scoped>
</style>