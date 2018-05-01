<template>
  <div class="articel-edit-wrap">
    <div class="article-title">
      <Input type="text" v-model="articleTitle" placeholder="请输入文章标题" class="title-input"/>
      <Input v-model="articleintroduce" type="textarea" :rows="4" placeholder="请输入文章简介"
             class="Introduction"/>
    </div>
    <div class="article-toolbar">
      <div class="label">
        <Dropdown style="margin-left: 20px" @on-click="selectTag">
          <img src="../assets/tag.png" height="30" width="30">
          <DropdownMenu slot="list">
            <DropdownItem v-for="item in tags" :key="item._id" :name="item.tagName">
              {{item.tagName}}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Tag class="tag-style" v-for="item in list" :key="item" closable color="blue"
             @on-close="handleClose(item)"> {{item}}
        </Tag>
      </div>
      <div class="action-button">
        <Button v-if="this.$route.query.id" @click="showpubModaldelect">删除</Button>
        <Button type="primary" @click="showpubModal">{{modify ? '修改文章' : '发布文章'}}</Button>
      </div>
    </div>
    <textarea id="editor"></textarea>
    <div id="uploadbox" :class="{'flipInX': show}" v-show="show">
      <div class="imgurl">
        <li v-for="(item, key) in imgurl" :key="item.urlitem" class="uploadimg">
          <textarea :id=key style="opacity: 0;height: 0px">{{item.markedurl}}</textarea>
          <Button type="info" @click.native="copy(key)">点击复制图片链接</Button>
          <div class="img-box">
            <div class="black-bg">
              <Icon type="ios-eye-outline" class="view-icon" @click.native="handleView(item.urlitem)"></Icon>
            </div>
            <img :src="item.urlitem">
          </div>
        </li>
      </div>
      <Icon type="close-circled" id="closeupload" @click.native="closeupload" />
      <Upload
        ref="upload"
        name="image"
        :show-upload-list="false"
        :on-success="handleSuccess"
        :format="['jpg','jpeg','png']"
        :max-size="5120"
        :headers="uoloadhead"
        multiple
        type="drag"
        action="/auth/imgUpload"
        style="display: inline-block;width:150px;padding-top: 62px">
        <div style="width: 150px;height:150px;line-height: 58px;">
          <Icon type="camera" size="40" color="#666" style="margin-top: 50px"></Icon>
        </div>
      </Upload>
    </div>
    <Modal title="查看图片" v-model="visible">
      <img :src="visibleImg" style="display: block;margin: 0 auto">
    </Modal>
    <Modal
      v-model="pubmodal"
      title="发布提示"
      :loading="loading"
      @on-ok="pubulshHandleOK"
    >
      <p>确定发布该文章吗？</p>
    </Modal>
    <Modal v-model="deletemodal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>确定要删除该文章吗？</span>
      </p>
      <div style="text-align:center">
        <p>您即将删除<span
          style="color: #0b97c4;padding: 0px 5px;font-weight: 900">{{articleTitle}}</span>文章</p>
        <p>是否确定该操作？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" :loading="deleteing" @click="deleteArticle" style="width: 40%">删除</Button>
        <Button size="large" style="width: 40%;margin-left: 18%" @click="cancelModal">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import SimpleMDE from 'simplemde';
  import '../assets/simplemde.css';
  import marked from 'marked';
  import {dateFormat} from '../utils';
  import highlight from 'highlight.js';
  import '../assets/hybrid.css';
  dateFormat();
  let simplemde;

  export default {
    data() {
      return {
        articleTitle: '',
        articleintroduce: '',
        content: '',
        tags: [],
        tag: '',
        list: [],
        imgurl: [],
        dialogImageUrl: '',
        dialogVisible: false,
        upload: false,
        pubmodal: false,
        deletemodal: false,
        show: false,
        loading: false,
        deleteing: false,
        modify: false,
        visible: false,
        visibleImg: '',
        uoloadhead: {},
        user: {
          'name': '韩兆赟'
        }
      };
    },
    created() {
      const id = this.$route.query.id;
      this.uoloadhead = {lid: localStorage.getItem('lid')}
      this.$http.get('/auth/getArticleLabel')
        .then(respone => {
          this.tags = respone.data.tagList;
        });
      if (id) {
        this.modify = true;
        this.$http.get(`/auth/articleDetails/${id}`)
          .then(respone => {
            const {title, date, articleContent, label, introduce} = respone.data.articleDetails;
            this.articleTitle = title;
            this.articleintroduce = introduce;
            this.list = label;
            this.content = articleContent;
            simplemde.value(articleContent)
          });
      }
    },
    mounted() {
      simplemde = new SimpleMDE({
        element: document.getElementById('editor'),
        autofocus: false,
        autosave: {
          enabled: true,
          uniqueId: 'MyUniqueID',
          delay: 30000
        },
        blockStyles: {
          bold: '__',
          italic: '_'
        },
        placeholder: '输入文章内容...',
        promptURLs: true,
        spellChecker: true,
        toolbar: [
          {name: 'bold', title: '加粗', className: 'fa fa-bold', action: SimpleMDE.toggleBold},
          {name: 'italic', title: '斜体', className: 'fa fa-italic', action: SimpleMDE.toggleItalic},
          {
            name: 'heading',
            title: '标题',
            className: 'fa fa-header',
            action: SimpleMDE.toggleHeadingSmaller
          },
          {
            name: 'heading-smaller',
            title: '副标题',
            className: 'fa fa-header fa-header-x fa-header-smaller',
            action: SimpleMDE.toggleHeading2
          }, '|',
          {name: 'code', title: '代码格式', className: 'fa fa-code', action: SimpleMDE.toggleCodeBlock},
          {
            name: 'quote',
            title: '引用',
            className: 'fa fa-quote-left',
            action: SimpleMDE.toggleBlockquote
          },
          {
            name: 'ordered-list',
            title: '有序列表',
            className: 'fa fa-list-ol',
            action: SimpleMDE.toggleOrderedList
          },
          {
            name: 'clean-block',
            title: '清除格式',
            className: 'fa fa-eraser fa-clean-block',
            action: SimpleMDE.cleanBlock
          },
          {name: 'link', title: '插入链接', className: 'fa fa-link', action: SimpleMDE.drawLink}, '|',
          {
            name: 'horizontal-rule',
            title: '插入水平线',
            className: 'fa fa-minus',
            action: SimpleMDE.drawHorizontalRule
          },
          {name: 'image', title: '插入图片', className: 'fa fa-picture-o', action: this.uploadimgshow}, '|',
          {
            name: 'side-by-side',
            title: '全屏预览',
            className: 'fa fa-columns no-disable no-mobile',
            action: SimpleMDE.toggleSideBySide
          },
          {
            name: 'fullscreen',
            title: '全屏预览',
            className: 'fa fa-arrows-alt no-disable no-mobile',
            action: SimpleMDE.toggleFullScreen
          },
          {
            name: 'side-by-side',
            title: '预览',
            className: 'fa fa-eye no-disable',
            action: SimpleMDE.togglePreview
          }, '|',

        ],
        previewRender: function (plainText) {
          return marked(plainText, {
            renderer: new marked.Renderer(),
            gfm: true,
            pedantic: false,
            sanitize: false,
            tables: true,
            breaks: true,
            smartLists: true,
            smartypants: true,
            highlight: function (code) {
              return highlight.highlightAuto(code).value;
            }
          });
        },
      });
      simplemde.codemirror.on('change', () => {
        const value = simplemde.value();
        this.content = value;
      });
    },
    watch: {
      '$route': 'changeStatus'
    },
    methods: {
      cancelModal() {
        this.deletemodal = false;
      },
      changeStatus() {
        const id = this.$route.query.id;
        this.modify = !!id;
        if (!id) {
          this.articleTitle = '';
          this.articleintroduce = '';
          this.list = [];
          this.content = '';
        }
      },
      showpubModaldelect() {
        this.deletemodal = true;
      },
      showpubModal() {
        if (!this.articleTitle) {
          return this.$Message.info('您还未写文章标题！');
        } else if (!this.articleintroduce) {
          return this.$Message.info('您还未写文章简介！');
        } else if (!this.list.length) {
          return this.$Message.info('您还选择文章标签!');
        } else if (!this.content) {
          return this.$Message.info('您还未写文章正文！');
        }
        this.pubmodal = true;
      },
      uploadimgshow() {
        this.show = !this.show;
      },
      closeupload() {
        this.show = false;
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      handleView(data) {
        this.visibleImg = data;
        this.visible = true;
      },
      handleSuccess(res) {
        const urlitem = res.data;
        const markedurl = '![binlive前端开发,web开发,node,vue,react,webpack](' + urlitem + ')';
        this.imgurl.push({urlitem, markedurl});
      },
      copy(key) {
        document.getElementById(key).select();
        document.execCommand('Copy');
        this.$Message.success('图片链接复制成功，请粘贴到编辑器中');
      },
      deleteArticle() {
        this.$http.post('/auth/delectArticle', {id: this.$route.query.id})
          .then(respone => {
            this.deleteing = true;
            this.$root.eventbus.$emit('ArticleInformation', {id: this.$route.query.id, type: 'remove'});
            this.$router.push('/articleList/articleEdit');
            this.$Message.success('删除成功!');
            this.cancelModal();
            this.articleTitle = '';
            this.articleintroduce = '';
            this.list = [];
            this.content = '';
          });
      },
      pubulshHandleOK() {
        this.loading = true;
        let model = {
          title: this.articleTitle,
          articleContent: this.content,
          date: new Date().format('yyyy-MM-dd hh:mm:ss'),
          state: 'publish',
          label: this.list,
          user: this.user,
          introduce: this.articleintroduce,
        };
        if (this.modify) {
          model.id = this.$route.query.id;
          this.$http.post('/auth/updateArticle', {model})
            .then(respone => {
              this.loading = false;
              this.$Message.success('文章修改成功');
              model.type = 'update';
              this.$root.eventbus.$emit('ArticleInformation', JSON.parse(JSON.stringify(model)));
            });
          return;
        }
        this.$http.post('/auth/saveArticle', {model})
          .then(respone => {
            this.loading = false;
            this.pubmodal = false;
            this.$Message.success('文章保存成功');
            const {_id} = respone.data.newArticle;
            model.type = 'save';
            model.id = _id;

            this.$root.eventbus.$emit('ArticleInformation', JSON.parse(JSON.stringify(model)));
          });
      },
      selectTag(name) {
        if (this.list.length < 3) {
          if (this.list.includes(name)) {
            return this.$Message.info('不能选择相同的标签哦');
          }
          this.list.push(name);
        } else {
          this.$Message.info('最多只能选择三个标签哦');
        }
      },
      handleClose(name) {
        this.list = this.list.filter(item => item !== name);
      }
    }
  };
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }

  #uploadbox {
    display: inline-block;
    padding: 14px 20px;;
    background-color: rgba(0, 0, 0, .6);
    border-radius: 4px;
    box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, .1);
    margin-left: 10px;
    position: fixed;
    bottom: 10px;
    padding-top: 30px;
    padding-right: 40px;
    z-index: 99
  }

  #closeupload {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
  }

  .articel-edit-wrap {
    width: 100%;
    height: 100%;
  }

  .article-title {
    height: auto;
    width: 100%;
  }

  .article-toolbar {
    height: 60px;
    line-height: 60px;
  }

  .label {
    width: 60%;
    height: 60px;
    line-height: 60px;
    float: left;
    display: table-cell;
    vertical-align: middle;
    position: relative;
    padding-left: 50px;
    padding-top: 20px;
  }

  .label img {
    vertical-align: middle;
    cursor: pointer;
    position: absolute;
    bottom: 4px;
    left: -50px;
  }

  .label > img:hover {
    border-bottom: 2px solid #20a0ff;
  }

  .tag-list-wrap {
    border: 1px solid #e0e6ed;
    padding: 5px;
    max-height: 150px;
    overflow: auto;
  }

  .tag-list-wrap > li {
    margin: 2px;
    padding: 3px;
    cursor: pointer;
    height: 30px;
    line-height: 36px;
  }

  .tag-list-wrap > li:hover {
    background-color: #e0e6ed;
  }

  .action-button {
    min-width: 120px;
    float: right;
    padding-right: 20px;
  }

  .CodeMirror {
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
    border-top: 1px solid #f1f1f1 !important;
  }

  .editor-toolbar {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    opacity: 1 !important;
  }

  .editor-statusbar {
    display: none;
  }

  .label .el-tag {
    margin-right: 5px;
  }

  .tag-list-wrap li {
    line-height: 28px;
    font-size: 14px;
    text-indent: 10px;
  }

  .el-tag {
    background-color: #3e4c5f;
    color: #fff;
    border: 1px solid #3e4c5f;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, .3)
  }

  .article-title {
    background-color: #171814;
    padding-left: 20px
  }

  .article-title .title-input input {
    border: none;
    outline-style: none;
    height: 30px;
    padding-left: 10px;
    font-size: 16px;
    background-color: #3e4c5f;
    border-radius: 20px;
    width: 60%;
    color: #eee;
    margin-top: 10px;
    font-size: 16px;
  }

  .editor-toolbar {
    background-color: #2f3f51;
    opacity: 1;
    border: none !important
  }

  .editor-toolbar > a {
    background-color: #304052;
    margin-right: 2px !important;
    outline: none
  }

  .editor-toolbar a:before {
    color: #a4b5ce
  }

  .editor-toolbar a:hover, .editor-toolbar a.active {
    background-color: #253443 !important;
  }

  .editor-toolbar .separator {
    border-left: 1px solid #a4b5ce !important;
    border-right: 1px solid #a4b5ce !important
  }

  .fullscreen {
    background-color: #2f3f51 !important;
    padding-left: 40px !important;
  }

  .editor-toolbar.fullscreen::before {
    display: none
  }

  .article-toolbar {
    background-color: #171814
  }

  .addtag:hover {
    border: none !important
  }

  .el-icon-close:hover {
    background-color: #171814 !important
  }

  .el-icon-close {
    padding: 2px
  }

  .CodeMirror-scroll {
    min-height: 800px !important
  }

  .imgurl {
    list-style: none;
    overflow: hidden;
    margin-bottom: 10px;
    float: left;
  }

  .imgurl li {
    width: 146px;
    margin-right: 10px;
    float: left;
  }

  .imgurl li button {
    display: block;
    margin: 0 auto;
    background-color: #3e4c5f;
    color: #fff;
    border-color: #3e4c5f;
    margin-bottom: 10px;
  }

  .imgurl li button:hover {
    background-color: #22354e !important;
    border-color: #22354e !important;
  }

  .imgurl input {
    width: 1px;
    margin-left: -1px
  }

  .tag-style {
    position: relative;
    top: -14px
  }

  .Introduction {
    width: 80%;
    margin-top: 16px;
  }

  .Introduction textarea {
    background-color: #3e4c5f;
    height: 60px;
    border: 0px;
    color: #fff;
    font-size: 14px
  }

  @keyframes flipInX {
    from {
      transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
      animation-timing-function: ease-in;
      opacity: 0;
    }
    40% {
      transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
      animation-timing-function: ease-in;
    }
    60% {
      transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
      opacity: 1;
    }
    80% {
      transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
    }
    to {
      transform: perspective(400px);
    }
  }
  .flipInX {
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-name: flipInX;
    animation-duration: 0.5s;
    animation-fill-mode: both;
  }
  .img-box{width: 150px;height: 150px;border-radius: 5px;overflow: hidden;position: relative}
  .img-box img{height: 150px;}
  .black-bg{display: none;width: 100%;height: 100%;position: absolute;left: 0px;top: 0px;background-color: rgba(0,0,0,0.3)}
  .img-box:hover .black-bg{display: block !important;}
  .img-box:hover div{display: block !important;width: 100%;height: 100%;position: absolute;left: 0px;top: 0px}
  .view-icon{font-size: 28px;cursor: pointer; position: absolute;left: 50%;top: 50%;margin-top: -16px;margin-left: -16px;color: #fff}
</style>
