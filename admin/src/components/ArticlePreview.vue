<template>
  <div class="artivcle-preview">
    <transition name="fade" mode="out-in">
      <div v-for="item in list" v-if="list.length>0">
        <div class="atticle-title">{{item.title}}</div>
        <div style="color:#34495e" v-compiledMarkdown>{{item.articleContent}}</div>
        <div class="article-preview-footer">
          <Button type="primary" icon="edit" @click="modify(item._id)">修改</Button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import marked from 'marked';
  import highlight from 'highlight.js';
  import '../assets/atom-one-light.css';

  export default {
    data() {
      return {
        list: [],
      };
    },
    created() {
      this.fetchData();
    },
    mounted() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: function (code) {
          return highlight.highlightAuto(code).value;
        }
      });
    },
    methods: {
      fetchData() {
        const id = this.$route.params.id;
        this.$http.get(`/auth/articleDetails/${id}`).then(respone => {
          this.list = [respone.data.articleDetails];
        });
      },
      modify: function (id) {
        this.$router.push({path: '/admin/articleEdit', query: {id: id}});
      }
    },
    watch: {
      '$route': 'fetchData'
    },
    directives: {
      compiledMarkdown: {
        bind: function (el) {
          el.innerHTML = marked(el.innerText);
        }
      }
    }
  };
</script>

<style>
  .article-preview-footer {
    position: fixed;
    right: 20px;
    bottom: 30px;
  }

  .artivcle-preview {
    padding: 15px;
  }

  .atticle-title {
    font-size: 22px;
    cursor: pointer;
    border-left: 3px #a0a0a1 solid;
    padding-left: 10px;
    color: #2c3e50;
    font-weight: bold;
    margin-bottom: 10px;
  }
</style>
