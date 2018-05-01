<template>
  <div class="article-label-wrap">
    <div class="article-label-nav">
      <div class="article-instructions">
        <span>标签</span>
        <Icon type="ios-pricetags" @click.native="showModal" size="22" color="#2d8cf0" style="cursor: pointer"></Icon>
      </div>
      <ul>
        <li v-for="item in articleLabel" style="position: relative">
          <Icon type="android-delete" @click.native="showdeleteModal(item.tagName)" class="delete-icon" />
          <h3 class="articleLabel-title" @click="labelClassification(item.tagName)">{{item.tagName}}
            <span style="color:#7e7e7e;">({{item.tagNumber}})</span></h3>
        </li>
      </ul>

    </div>
    <Modal
      v-model="tagModal"
      title="添加标签"
      @on-ok="addHandleOk"
      :loading="adding"
    >
      <Input v-model="addTag" icon="edit" placeholder="请输入标签名"/>
    </Modal>
    <Modal v-model="deletemodal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>确定要删除该标签吗？</span>
      </p>
      <div style="text-align:center">
        <p>您即将删除<span style="color: #0b97c4;padding: 0px 5px;font-weight: 900">{{deleteTag}}</span>标签</p>
        <p>是否确定该操作？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" :loading="deleteing" @click="deletetag" style="width: 40%">删除</Button>
        <Button size="large" style="width: 40%;margin-left: 18%" @click="cancelModal">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        articleLabel: [],
        tagName: '',
        addTag: '',
        deleteTag: '',
        isTagInputShow: false,
        tagModal: false,
        deletemodal: false,
        adding: false,
        deleteing: false,
      };
    },
    mounted() {
      this.$http.get('/auth/getArticleLabel')
        .then(res => {
          this.articleLabel = res.data.tagList;
        })
        .catch(err => this.$Message.error('请求数据出错，请重新刷新页面'));
    },
    methods: {
      showdeleteModal(tagName) {
        this.deletemodal = true;
        this.deleteTag = tagName;
      },
      deletetag() {
        this.deleteing = true;
        this.$http.post('/auth/delectTag', {tagName: this.deleteTag}).then(
          respone => {
            this.$Message.success('标签删除成功');
            this.deleteing = false;
            this.deletemodal = false;
            this.articleLabel = this.articleLabel.filter(item => item.tagName !== this.deleteTag);
          });
      },
      labelClassification: function (title) {
        localStorage.setItem('lebelTitle', title);
        this.$router.push('/articleList');
      },
      cancelModal() {
        this.tagModal = false;
        this.deletemodal = false;
      },
      addHandleOk() {
        const tagName = this.addTag.trim();
        this.adding = true;
        if (!tagName) {
          return this.$Message.info('标签不能为空');
        }
        this.$http.post('/auth/saveArticleLabel', {tagName, tagNumber: 0})
          .then(res => {
              this.$Message.success('标签保存成功');
              this.articleLabel.push({tagName, tagNumber: 0});
              this.adding = false;
              this.cancelModal();
            }).catch(err => console.log(err));
      },
      showModal() {
        this.tagModal = true;
      }
    }
  };
</script>

<style>
  .article-label-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    margin-left: 90px;
  }

  .article-label-nav {
    width: 230px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 70px;
    border-right: 1px solid #f1f1f1;
    z-index: 1;
    background-color: #fff;
  }

  .article-label-nav > ul {
    overflow: auto;
    padding-left: 22px;
    padding-right: 22px;
  }

  .article-label-nav > ul > li {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f1f1f1;
    padding: 5px 10px 5px 10px;
    position: relative;
  }

  .article-label-nav > ul > li > img {
    display: block;
    float: left;
    padding-top: 13px;
    padding-right: 5px;
  }

  .article-label-nav > ul > li > h3 {
    width: 170px;
    padding: 15px 10px 15px 2px;
    display: inline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #00b692;
    font-size: 16px;
  }

  .tagName-input {
    margin: 5px 5px 0px;
    position: absolute;
    bottom: 13px
  }

  .el-icon-delete {
    cursor: pointer;
    color: #999;
    position: absolute;
    right: 4px;
    top: 16px;
    display: none
  }

  .el-icon-delete:hover {
    color: #f7ba2a;
  }

  .article-label-nav > ul > li:hover .el-icon-delete {
    display: block
  }

  .articleLabel-title:hover {
    color: #243342
  }
  .delete-icon{position: absolute; right: 0px; font-size: 20px; color: #888;top: 10px; cursor: pointer}
</style>
