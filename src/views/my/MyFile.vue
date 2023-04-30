<template>
  <div style="margin-top: 5px">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <span slot-scope="{ node,data }" class="custom-tree-node">
        <span v-if="data.isFolder">
          <el-dropdown class="folderSelectorStyle" @command="folderSelector" trigger="click">
            <span>
              <i class="el-icon-folder"></i>
              {{ data.flName }}
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="uploadFile">上传文件</el-dropdown-item>
              <el-dropdown-item command="createNewFolder">新建文件夹</el-dropdown-item>
              <el-dropdown-item v-if="!data.isRootFolder" command="deleteFolder">删除文件夹</el-dropdown-item>
              <el-dropdown-item command="reNameFolder">重命名</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
        <span v-else>
          <el-dropdown class="fileSelectorStyle" @command="fileSelector" trigger="click">
            <span>
              <i class="el-icon-document"></i>
              {{ data.flName }}
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="downloadFile">下载</el-dropdown-item>
              <el-dropdown-item command="deleteFile">移动至回收站</el-dropdown-item>
              <el-dropdown-item command="moveFile">移动到</el-dropdown-item>
              <el-dropdown-item command="shareFile">分享</el-dropdown-item>
              <el-dropdown-item command="reNameFile">重命名</el-dropdown-item>
              <el-dropdown-item command="fileDetail">详情</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </span>
    </el-tree>
    <!--上传文件dialog-->
    <el-dialog
      :title="'上传文件至'+ currentFolder.flName"
      :visible.sync="fileUploaderDialogVisible"
      width="30%"
    >
      <el-upload
        ref="upload"
        :action="uploadURL"
        :headers="{'token': token}"
        :before-upload="checkFileSize"
        :multiple="false"
        name="multipartFile"
        :auto-upload="false"
        :on-success="handleUploadSuccess"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button
          size="small"
          type="success"
          @click="handleUploadClick"
          style="margin-left: 10px;"
        >上传至服务器</el-button>
        <div slot="tip" class="el-upload__tip">只能上传一个文件，且不超过 10 MB</div>
      </el-upload>
    </el-dialog>
    <!--新建文件夹dialog-->
    <el-dialog
      :title="'在'+currentFolder.flName+'下创建新文件夹'"
      :visible.sync="createNewFolderDialogVisible"
      width="30%"
      center
    >
      <el-input
        placeholder="请输入文件夹名称"
        v-model="createdFolderName"
        clearable
        size="medium"
        maxlength="25"
        show-word-limit
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createNewFolderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createFolder">确 定</el-button>
      </span>
    </el-dialog>
    <!--文件夹重命名dialog-->
    <el-dialog title="文件夹重命名" :visible.sync="reNameFolderDialogVisible" width="30%" center>
      <el-input v-model="reNameOfFolder" clearable size="medium" maxlength="25" show-word-limit></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reNameFolderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="reNameFolder">确 定</el-button>
      </span>
    </el-dialog>
    <!--文件移动dialog，用级联选择器显示文件夹结构-->
    <el-dialog
      :title="'移动文件'+currentFile.fname+'到'"
      :visible.sync="moveFileDialogVisible"
      width="60%"
    >
      <el-cascader
        v-model="targetFolderValue"
        ref="folderCascader"
        :options="targetFolderData"
        :props="moveProps"
        filterable
      ></el-cascader>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moveFileDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="moveFile">确 定</el-button>
      </span>
    </el-dialog>
    <!--文件重命名dialog-->
    <el-dialog title="文件重命名" :visible.sync="reNameFileDialogVisible" width="30%" center>
      <el-input v-model="reNameOfFile" clearable size="medium" maxlength="25" show-word-limit></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reNameFileDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="reNameFile">确 定</el-button>
      </span>
    </el-dialog>
    <!--文件详情dialog-->
    <el-dialog title="文件详情" :visible.sync="fileDetailDialogVisible" width="30%" center>
      <el-descriptions class="margin-top" :column="1" size="medium">
        <el-descriptions-item label="文件名">{{ currentFile.fname }}</el-descriptions-item>
        <el-descriptions-item label="上传者ID">{{ currentFile.fownerId }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ currentFile.fsize }}KB</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentFile.fcreateTime }}</el-descriptions-item>
        <el-descriptions-item label="最后一次修改时间">{{ currentFile.flastModifiedTime }}</el-descriptions-item>
        <el-descriptions-item label="文件权限">
          <el-switch
            v-model="currentFile.authority"
            active-text="公开"
            inactive-text="私有"
            @change="updateFileAuth"
          ></el-switch>
          <el-tooltip class="item" effect="dark" placement="right-start">
            <div slot="content">
              注意：
              <br />文件公开后，其他用户可以浏览你公开后的文件信息并进行下载、评分等操作
              <br />文件私有后，其他用户无法浏览到你私有的文件信息
              <br />请根据您的需求合理设置文件权限
              <br />本平台不会主动公开您的文件信息也不会主动开放您的文件下载权限给其他用户
              <br />如因个人操作问题导致的文件泄露，本平台不承担任何责任
            </div>
            <i class="el-icon-info" style="margin-left:25px"></i>
          </el-tooltip>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!--文件token的Dialog-->
    <el-dialog title="文件token" :visible.sync="fileTokenDialogVisible" width="30%" center>
      <span>
        {{ fileToken }}
        <el-button size="mini" icon="el-icon-document-copy" round @click="copyToken"></el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "MyFile",
  data() {
    return {
      treeData: [],
      targetFolderData: [],
      targetFolderValue: [],
      defaultProps: {
        children: "childrenFolders",
        label: "flName"
      },
      moveProps: {
        children: "childrenFolders",
        label: "flName",
        value: "flid",
        multiple: false,
        checkStrictly: true
      },
      currentFile: {},
      currentFolder: {},
      fileUploaderDialogVisible: false,
      createNewFolderDialogVisible: false,
      reNameFolderDialogVisible: false,
      moveFileDialogVisible: false,
      reNameFileDialogVisible: false,
      fileDetailDialogVisible: false,
      fileTokenDialogVisible: false,
      uploadURL: "",
      createdFolderName: "",
      reNameOfFolder: "",
      reNameOfFile: "",
      fileToken: "",
      token: window.sessionStorage.getItem("token")
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      try {
        this.getRequest("/sms/userController/getFilesByToken").then(res => {
          this.treeData = this.formatData(res.data);
        });
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    formatData(data) {
      const queue = [];
      const result = [];
      data.isRootFolder = true;
      data.isFolder = true;
      queue.push(data);
      // 广度优先遍历
      while (queue.length > 0) {
        const node = queue.shift();
        // 将子文件夹列表中的对象的isFolder属性都设置为true，并将子文件夹列表中的对象都放入queue中
        if (node.childrenFolders) {
          node.childrenFolders.forEach(folder => {
            folder.isFolder = true;
            queue.push(folder);
          });
        }
        // 将文件夹中的文件列表中的所有文件放入到子文件夹列表中
        if (node.files) {
          node.files.forEach(file => {
            file.isFolder = false;
            file.flName = file.fname;
            file.childrenFolders = [];
            node.childrenFolders.push(file);
          });
        }
      }
      result.push(data);
      return result;
    },
    convertFolderData(data) {
      const stack = [];
      const result = [];

      stack.push(data);
      // 深度优先遍历
      while (stack.length > 0) {
        const currentFolder = stack.pop();
        if (
          !currentFolder.childrenFolders ||
          currentFolder.childrenFolders.length === 0
        ) {
          delete currentFolder.childrenFolders;
        } else {
          currentFolder.childrenFolders.forEach(folder => {
            stack.push(folder);
          });
        }
      }

      result.push(data);
      return result;
    },
    handleNodeClick(node) {
      if (node.isFolder) {
        this.currentFolder = node;
      } else {
        this.currentFile = node;
      }
    },
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.$message.success("上传成功");
        this.getData();
      } else {
        this.$message.error(response.message);
      }
    },
    folderSelector(command) {
      if (command == "uploadFile") {
        this.uploadURL =
          "http://localhost:9001/sms/userController/uploadFile/" +
          this.currentFolder.flid;
        this.fileUploaderDialogVisible = true;
      } else if (command == "createNewFolder") {
        this.createNewFolderDialogVisible = true;
      } else if (command == "deleteFolder") {
        this.$confirm(
          "确定删除该文件夹？该操作会直接彻底删除文件夹内所有文件",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            this.postRequest(
              "/sms/userController/deleteFolder/" + this.currentFolder.flid
            ).then(res => {
              if (res.code == 200) {
                this.$message({
                  type: "success",
                  message: "删除文件夹成功!"
                });
                this.getData();
              } else {
                this.$message.error(res.message);
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消"
            });
          });
      } else if (command == "reNameFolder") {
        this.reNameOfFolder = this.currentFolder.flName;
        this.reNameFolderDialogVisible = true;
      }
    },
    fileSelector(command) {
      if (command == "downloadFile") {
        window.open(
          "http://localhost:9001/sms/userController/downloadFileTest/" +
            this.currentFile.fid
        );
      } else if (command == "deleteFile") {
        this.$confirm("确定将该文件移动至回收站?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.postRequest(
              "/sms/userController/moveToRecycleBin/" + this.currentFile.fid
            ).then(res => {
              if (res.code == 200) {
                this.$message({
                  type: "success",
                  message: "已移动至回收站!"
                });
                this.getData();
              } else {
                this.$message.error(res.message);
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消"
            });
          });
      } else if (command == "moveFile") {
        this.getRequest("/sms/userController/getFilesByToken").then(res => {
          if (res.code == 200) {
            this.targetFolderData = this.convertFolderData(res.data);
          } else {
            this.$message.error(res.message);
          }
        });
        this.moveFileDialogVisible = true;
      } else if (command == "shareFile") {
        this.getRequest(
          "/sms/userController/getShareToken/" + this.currentFile.fid
        ).then(res => {
          if (res.code == 200) {
            this.fileToken = res.data;
            this.fileTokenDialogVisible = true;
          } else {
            this.$message.error(res.message);
          }
        });
      } else if (command == "reNameFile") {
        this.reNameOfFile = this.currentFile.fname;
        this.reNameFileDialogVisible = true;
      } else if (command == "fileDetail") {
        this.fileDetailDialogVisible = true;
      }
    },
    checkFileSize(file) {
      if (file.size > 10485760) {
        this.$message({
          message: "文件大小不能超过 10 MB",
          type: "error"
        });
        return false;
      }
      return true;
    },
    handleUploadClick() {
      this.$refs.upload.submit();
    },
    createFolder() {
      if (this.createdFolderName == "") {
        this.$message({
          message: "文件夹名称不能为空",
          type: "error"
        });
        return;
      }
      this.postRequest(
        "/sms/userController/createNewFolder/" + this.currentFolder.flid,
        {
          folderName: this.createdFolderName
        }
      ).then(res => {
        this.$message({
          message: "创建文件夹成功",
          type: "success"
        });
        this.createNewFolderDialogVisible = false;
        this.getData();
      });
    },
    reNameFolder() {
      if (this.reNameOfFolder == "") {
        this.$message({
          message: "文件夹名称不能为空",
          type: "error"
        });
        return;
      }
      this.postRequest(
        "/sms/userController/changeFolderName/" + this.currentFolder.flid,
        {
          folderName: this.reNameOfFolder
        }
      ).then(res => {
        this.$message({
          message: "重命名文件夹成功",
          type: "success"
        });
        this.reNameFolderDialogVisible = false;
        this.getData();
      });
    },
    moveFile() {
      const checkedNodes = this.$refs.folderCascader.getCheckedNodes();
      const targetFolderId = checkedNodes[checkedNodes.length - 1].value;
      this.postRequest("/sms/userController/moveFile/" + this.currentFile.fid, {
        targetFolderId: targetFolderId
      }).then(res => {
        this.$message({
          message: "移动文件成功",
          type: "success"
        });
        this.moveFileDialogVisible = false;
        this.getData();
      });
    },
    reNameFile() {
      if (this.reNameOfFile == "") {
        this.$message({
          message: "文件名称不能为空",
          type: "error"
        });
        return;
      }
      this.postRequest(
        "/sms/userController/changeFileName/" + this.currentFile.fid,
        {
          fileName: this.reNameOfFile
        }
      ).then(res => {
        this.$message({
          message: "重命名文件成功",
          type: "success"
        });
        this.reNameFileDialogVisible = false;
        this.getData();
      });
    },
    updateFileAuth(value) {
      this.postRequest(
        "/sms/userController/setFileAuthority/" + this.currentFile.fid,
        {
          fileAuth: value
        }
      ).then(res => {
        this.$message({
          message: "更新文件权限成功",
          type: "success"
        });
        this.fileDetailDialogVisible = false;
        this.getData();
      });
    },
    copyToken() {
      navigator.clipboard
        .writeText(this.fileToken)
        .then(() => {
          this.$message({
            message: "文件token复制成功!",
            type: "success"
          });
        })
        .catch(err => {
          this.$message({
            message: "文件token复制失败!",
            type: "error"
          });
        });
    }
  }
};
</script>

<style scoped>
.custom-tree-node {
  display: inline-flex;
  align-items: center;
}
.folderSelectorStyle {
  cursor: pointer;
}
.fileSelectorStyle {
  cursor: pointer;
}
</style>