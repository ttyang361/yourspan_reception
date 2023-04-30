<template>
  <div style="margin-top: 12px">
    <el-descriptions title="推荐方式"></el-descriptions>
    <el-row>
      <el-col :span="4">
        <el-switch
          style="display: block"
          v-model="value"
          active-color="#13ce66"
          inactive-color="#409eff"
          active-text="用户相似度"
          inactive-text="信息相似度"
        ></el-switch>
      </el-col>
      <el-col :span="2">
        <el-tooltip class="item" effect="dark" placement="right-start">
          <div slot="content">
            物品相似度：
            <br />以您评分为基准推荐物品相似度权值高的资源
            <br />用户相似度：
            <br />以您评分为基准推荐用户相似度权值高的资源
            <br />您可以根据自己的需求进行选择
          </div>
          <i class="el-icon-info" style="margin-left:25px"></i>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-descriptions title="推荐条目" style="margin-top: 20px"></el-descriptions>
    <el-col :span="12">
      <el-slider v-model="value1" :disabled="sliderDisable"></el-slider>
      <el-row>
        <el-col :span="2">
          <el-button type="text" @click="sliderOn">修改</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="text" @click="updateRecommendNumber">保存</el-button>
        </el-col>
      </el-row>
    </el-col>
  </div>
</template>

<script>
export default {
  name: "PerPreset",
  data() {
    return {
      value: true,
      value1: 20,
      sliderDisable: true
    };
  },
  methods: {
    sliderOn() {
      this.sliderDisable = false;
    },
    updateRecommendNumber() {
      this.sliderDisable = true;
    }
  }
};
</script>

<style scoped>
</style>