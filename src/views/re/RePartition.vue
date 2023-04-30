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
      <el-row :gutter="20">
        <el-col :span="12" v-for="item in fileList" :key="item.fid">
          <el-card shadow="hover" class="box-card" style="margin-top: 10px">
            <div slot="header" class="clearfix">
              <span>{{ item.fname }}</span>
            </div>
            <el-button type="primary" size="small" @click="downloadFile(item)">下载</el-button>
            <el-button
              type="text"
              size="small"
              @click="fileDetail(item)"
              style="margin-left: 25px"
            >详情</el-button>
            <el-divider></el-divider>
            <el-row>
              <el-col :span="6">
                <el-rate v-if="!item.rated" v-model="item.rate"></el-rate>
                <el-rate v-else v-model="item.rate" disabled></el-rate>
              </el-col>
              <el-col :span="3">
                <el-button type="text" size="small" @click="addRate(item)">提交评分</el-button>
              </el-col>
              <el-col :span="3">
                <el-button type="text" size="small" @click="changeRate(item)">修改评分</el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-backtop :visibilityHeight="200" />
    <!--文件详情dialog-->
    <el-dialog title="文件详情" :visible.sync="fileDetailDialogVisible" width="30%" center>
      <el-descriptions class="margin-top" :column="1" size="medium">
        <el-descriptions-item label="文件名">{{ currentFile.fname }}</el-descriptions-item>
        <el-descriptions-item label="上传者ID">
          <el-button
            type="text"
            @click="getUserFiles(currentFile.fownerId)"
            style="padding: 0; margin: 0"
          >{{ currentFile.fownerId }}</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentFile.fcreateTime }}</el-descriptions-item>
        <el-descriptions-item label="最后一次修改时间">{{ currentFile.flastModifiedTime }}</el-descriptions-item>
        <el-descriptions-item label="文件评分">
          <el-rate
            v-model="currentFile.avgRate"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          ></el-rate>
          <el-tooltip class="item" effect="dark" placement="right-start">
            <div slot="content">该文件评分是所有参与评价用户评分的平均分</div>
            <i class="el-icon-info" style="margin-left:25px"></i>
          </el-tooltip>
        </el-descriptions-item>
        <el-descriptions-item label="文件描述">这是一段普通的文件描述</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!--用户公开文件列表dialog-->
    <el-dialog
      title="用户公开文件列表"
      :visible.sync="userPublicFileListDialogVisible"
      width="60%"
      center
      :before-close="clearFileList"
    >
      <el-table :data="userPublicFileList" style="width: 100%">
        <el-table-column prop="fname" label="文件名"></el-table-column>
        <el-table-column prop="fcreateTime" label="上传时间"></el-table-column>
        <el-table-column prop="flastModifiedTime" label="最后一次修改时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="downloadFile(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "RePartition",
  data() {
    return {
      fileList: [],
      loading: false,
      loadings: true,
      currentFile: {},
      fileDetailDialogVisible: false,
      userPublicFileList: [],
      userPublicFileListDialogVisible: false,
      currentFileRate: null
    };
  },
  created() {
    this.getFileList();
  },
  methods: {
    getFileList() {
      try {
        this.getRequest("/sms/userController/getPublicFiles").then(res => {
          if (res.code === 200) {
            if (res.data.length === 0) {
              this.$message({
                message: "暂无公开文件",
                type: "warning"
              });
            } else {
              // 将res.data中的元素取出并放入fileList中
              for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].rate != null) {
                  res.data[i].rated = true;
                } else {
                  res.data[i].rated = false;
                }
                this.fileList.push(res.data[i]);
              }
            }
            this.loadings = false;
          }
        });
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
    },
    getUserFiles(uid) {
      try {
        this.getRequest("/sms/userController/getUserPublicFiles/" + uid).then(
          res => {
            if (res.code === 200) {
              for (let i = 0; i < res.data.length; i++) {
                this.userPublicFileList.push(res.data[i]);
              }
              this.userPublicFileListDialogVisible = true;
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    },
    clearFileList(done) {
      this.userPublicFileList = [];
      done();
    },
    addRate(item) {
      if (item.rated) {
        this.$message({
          message: "您已经评分过了",
          type: "warning"
        });
        return;
      }
      try {
        this.postRequest("/sms/userController/addFileRate/" + item.fid, {
          rate: item.rate
        }).then(res => {
          if (res.code === 200) {
            this.$message({
              message: "评分成功",
              type: "success"
            });
            item.rated = true;
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    changeRate(item) {
      item.rated = false;
    }
  }
};
</script>

<style scoped>
</style>