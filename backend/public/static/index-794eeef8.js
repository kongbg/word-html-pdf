import{_ as q,e as A,f as d,g as I,h as N,r as D,o as g,c as h,a as o,b as m,w as y,d as r,t as x,i as H,j as O,v as j,k as P,n as W,l as G}from"./index-c0ece4a2.js";import{a as Y}from"./axios-917b1704.js";const z={class:"app-container"},J={class:"navbar"},K={class:"nav-brand"},Q={class:"nav-menu"},X={class:"main-container"},Z={class:"left-panel"},ee={class:"action-buttons"},te=["disabled"],oe=["disabled"],ne={class:"upload-section"},le={key:0,class:"file-name"},se={key:0,class:"loading-tip"},ae={class:"doc-render-box"},re={class:"right-panel"},ce={class:"style-section"},de={class:"css-editor"},ie=P({name:"PreviewDemo"}),pe=Object.assign(ie,{async setup(ue){let i,k;const E=()=>G(()=>import("./docx-preview.min-ec3ce43d.js"),[]),U=([i,k]=A(()=>E()),i=await i,k(),i);Y.create({baseURL:"/api",timeout:6e4*5});const w=d(null),C=d(null),f=d(""),M=d(null),p=d(`
  .docx{
    padding: 72pt 0pt!important;
  }
  .docx_2 {
    padding: 0 70pt;
  }
  .docx_2+p{
    padding: 0 60pt 0 70pt;
  }`),s=I({html:!1,vue:!1,pdf:!1}),v=N(()=>s.html||s.vue||s.pdf),S=()=>{const n=document.getElementById("custom-docx-styles");n&&n.remove();const e=document.createElement("style");e.id="custom-docx-styles",e.textContent=p.value,document.head.appendChild(e),console.log("自定义CSS已应用")},R=()=>{const n=document.getElementById("custom-docx-styles");n&&n.remove(),p.value="",console.log("自定义CSS已清除")},L=()=>{let n="";return document.querySelectorAll("style").forEach(e=>{let t=e.textContent||e.innerHTML;t=t.replace(/@charset\s+["']UTF-8["']\s*;?\s*/g,""),t=t.replace(/\[[^\]]+\]/g,"");const a=`<style scoped>${t}</style>`;n+=a}),document.querySelectorAll('link[rel="stylesheet"]').forEach(e=>{n+=e.outerHTML}),n},T=n=>n.replace(/style="([^"]*&quot;[^"]*)"/g,(e,t)=>`style='${t.replace(/&quot;/g,'"')}'`).replace(/style="([^"]*)"/g,(e,t)=>`style='${t}'`),B=async()=>{try{s.html=!0;const n=document.querySelector(".docx-wrapper");if(!n){alert("未找到 .docx-wrapper 区域");return}const e=n.cloneNode(!0);e.querySelectorAll("footer").forEach(b=>b.remove());let t=`<div class="docx-wrapper">${e.innerHTML}</div>`;t=T(t);const u=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${L()}
        <style type="text/css">
          .docx-wrapper {
            background: #fff;
            padding: 0;
            padding-bottom: 0px;
            display: block;
          }

          .docx-wrapper>section.docx {
            box-shadow: none;
          }
          .docx-wrapper table tr {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${t}
      </body>
      </html>
        `,_=new Blob([u],{type:"text/html"}),c=URL.createObjectURL(_),l=document.createElement("a");l.href=c,l.download="index.html",document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c),console.log("HTML生成成功")}catch(n){console.error("HTML生成失败:",n),alert("HTML生成失败: "+n.message)}finally{s.html=!1}},$=async()=>{try{s.html=!0;const n=document.querySelector(".docx-wrapper");if(!n){alert("未找到 .docx-wrapper 区域");return}const e=n.cloneNode(!0);e.querySelectorAll("footer").forEach(b=>b.remove());let t=`<div class="docx-wrapper">${e.innerHTML}</div>`;t=T(t),console.log("wrapperHtml:",t);let a=L();const u=`
      <template>
      ${t}
      </template>
      ${a}
      <style scoped>
          .docx-wrapper {
            background: #fff;
            padding: 0;
            padding-bottom: 0px;
            display: block;
          }
          .docx-wrapper>section.docx {
            box-shadow: none;
          }
          .docx-wrapper table tr {
            page-break-inside: avoid;
          }
        </style>
     `;console.log("htmlContent:",u);const _=new Blob([u],{type:"text/plain"}),c=URL.createObjectURL(_),l=document.createElement("a");l.href=c,l.download="DocumentViewer.vue",document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c),console.log("HTML生成成功")}catch(n){console.error("HTML生成失败:",n),alert("HTML生成失败: "+n.message)}finally{s.html=!1}},F=()=>{C.value.click()},V=async n=>{const e=n.target.files[0];if(e){if(!e.name.match(/\.(docx|doc)$/i)){alert("请选择 Word 文件 (.docx 或 .doc)");return}f.value=e.name;try{const t=await e.arrayBuffer();M.value=t,await U.renderAsync(t,w.value),await W(),S(),console.log("文件上传成功，已渲染预览")}catch(t){console.error("文件处理失败:",t),alert("文件处理失败，请重试")}}};return(n,e)=>{const t=D("router-link");return g(),h("div",z,[o("nav",J,[o("div",K,[m(t,{to:"/",class:"nav-link"},{default:y(()=>e[1]||(e[1]=[r("Word转PDF工具")])),_:1,__:[1]})]),o("div",Q,[m(t,{to:"/",class:"nav-link","active-class":"active"},{default:y(()=>e[2]||(e[2]=[r("首页")])),_:1,__:[2]}),m(t,{to:"/preview",class:"nav-link","active-class":"active"},{default:y(()=>e[3]||(e[3]=[r("预览")])),_:1,__:[3]}),m(t,{to:"/print",class:"nav-link","active-class":"active"},{default:y(()=>e[4]||(e[4]=[r("打印")])),_:1,__:[4]}),e[5]||(e[5]=o("a",{href:"https://github.com/kongbg/word-html-pdf",target:"_blank",class:"nav-link github-link"},[o("span",{class:"github-icon"},"🐙"),r(" GitHub ")],-1)),e[6]||(e[6]=o("a",{href:"https://hub.docker.com/repository/docker/kongbg/word-html-pdf/general",target:"_blank",class:"nav-link github-link"},[o("span",{class:"github-icon"},"🐙"),r(" docker ")],-1))])]),o("div",X,[o("div",Z,[o("div",ee,[o("button",{onClick:F,class:"btn-primary"}," 上传文件 "),o("button",{onClick:B,class:"btn-success",disabled:v.value},x(s.html?"生成中...":"生成HTML"),9,te),o("button",{onClick:$,class:"btn-info",disabled:v.value},x(s.vue?"生成中...":"生成Vue3"),9,oe)]),o("div",ne,[o("input",{type:"file",ref_key:"fileInput",ref:C,onChange:V,accept:".docx,.doc",style:{display:"none"}},null,544),f.value?(g(),h("span",le," 已上传: "+x(f.value),1)):H("",!0)]),v.value?(g(),h("div",se,e[7]||(e[7]=[o("div",{class:"loading-spinner"},null,-1),o("span",null,"正在生成文件，请稍候...",-1)]))):H("",!0),o("div",ae,[o("div",{ref_key:"refFile",ref:w},null,512)])]),o("div",re,[e[9]||(e[9]=o("h3",null,"CSS 样式编辑",-1)),o("div",ce,[e[8]||(e[8]=o("h4",null,"自定义样式",-1)),o("div",de,[O(o("textarea",{"onUpdate:modelValue":e[0]||(e[0]=a=>p.value=a),placeholder:`输入CSS代码，例如：
            .doc-render-box {
              background: #f5f5f5;
              border: 2px solid #007bff;
            }

            .docx-wrapper {
              font-family: 'Times New Roman', serif;
              line-height: 1.8;
            }

            .docx-wrapper p {
              margin-bottom: 15px;
              color: #333;
            }`,onInput:S},null,544),[[j,p.value]])]),o("div",{class:"button-group"},[o("button",{onClick:R,class:"btn-danger"},"清除样式")])])])])])}}}),fe=q(pe,[["__scopeId","data-v-b2a7acda"]]);export{fe as default};
