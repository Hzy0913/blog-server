<template>
  <div>
    <div class="article-list">
      <div class="article-instructions">
        <i class="el-icon-menu"></i>
        <span>文章列表</span>
        <Icon type="edit" color="#2d8cf0" size="22" style="cursor:pointer;position: relative;right: -14px" @click.native="addArticle"></Icon>
      </div>
      <ul v-articleListHeight>
        <li v-for="item in articleList" :key="item._id" @click="articlePreview(item._id)">
          <h3
            :class="{'articlePreview-title-draft': item.state=='draft', 'articlePreview-title-publish': item.state=='publish'}">
            {{item.title}}
          </h3>
          <p>
            <span class="lab2els" v-for="list in item.label">{{list}}</span>
          </p>
          <p>
            <i class="el-icon-time"></i>
            {{new Date(item.date).format('yyyy-MM-dd hh:mm:ss')}}
          </p>
        </li>
      </ul>
    </div>
    <div class="router-view">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
  import {dateFormat} from '../utils';
  dateFormat();
  export default {
    data() {
      return {
        articleList: []
      };
    },
    mounted() {
      this.$root.eventbus.$on('ArticleInformation', model => {
        const {id, title, label, date, type} = model;
        if (type === 'save') {
          this.articleList.unshift({_id: id, title, label, date});
        } else if (type === 'update') {
          const index = this.articleList.findIndex(item => item._id === id);
          this.articleList.splice(index, 1, {_id: id, title, label, date});
        } else if (type === 'remove') {
          const index = this.articleList.findIndex(item => item._id === id);
          this.articleList.splice(index, 1);
        }
      });
    },
    created() {
      this.$http.get('/auth/adminArticleList')
        .then(respone => {
          this.articleList = respone.data.ArticleList.reverse();
        });
    },
    methods: {
      addArticle() {
        this.$router.push('/admin/articleEdit');
      },
      articlePreview(id) {
        this.$router.push(`/admin/articlePreview/${id}`);
      },
    },
    directives: {
      articleListHeight: {
        bind: function (el) {
          var height = window.innerHeight - 80;
          el.style.maxHeight = height + 'px';
        }
      }
    }
  };
</script>

<style>
  .article-list {
    width: 230px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 70px;
    border-right: 1px solid #f1f1f1;
    z-index: 1;
    background-color: #fff;
  }

  .article-list > ul {
    overflow: auto;

  }

  .article-list > ul > li {
    border-bottom: 1px solid #f1f1f1;
    padding: 5px 10px 5px 10px;
    padding-left: 12px;
    padding-right: 12px;
    cursor: pointer;
  }

  .article-list > ul > li:hover {
    background-color: #EFF2F7
  }

  .article-list > ul > li > h3 {
    width: 170px;
    padding: 5px 0 5px 0;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .article-list > ul > li > p {
    font-size: 12px;
    color: #b3bbbc;
    margin-bottom: 8px;;
  }

  .router-view {
    position: relative;
    height: 100%;
    margin-left: 300px;
  }

  .articlePreview-title-publish {
    color: #508cc3;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .articlePreview-title-draft {
    color: #FF4949;
  }

  .label-item {
    border: 1px #ccc solid;
    border-radius: 5px;
    padding: 2px 4px;
  }

  .lab2els {
    padding: 3px 4px;
    background-color: #1ab495;
    color: #fff;
    margin-right: 4px;
    border-radius: 3px;
  }
</style>
