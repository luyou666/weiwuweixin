import{a as e,j as r,m as c}from"./proxy-RWgpSLFb.js";import{r as K}from"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";const P={text:{width:"100%",height:"1em",borderRadius:"var(--radius-sm)"},card:{width:"100%",height:"200px",borderRadius:"var(--radius-lg)"},avatar:{width:"48px",height:"48px",borderRadius:"50%"},custom:{}},a=K.forwardRef(({variant:i="text",lines:t,size:h="md",animated:n=!0,radius:v,width:y,height:x,className:g="",style:H,...J},f)=>{if(i==="text"&&t&&t>1)return e("div",{ref:f,className:`weiwu-skeleton-ink flex flex-col gap-[var(--space-sm)] ${g}`,...J,children:Array.from({length:t}).map((U,m)=>e(Q,{isLast:m===t-1,animated:n,lineWidth:m===t-1?"70%":y,height:x,radius:v},m))});const p=P[i];return r(c.div,{ref:f,className:["weiwu-skeleton-ink","relative overflow-hidden","bg-[var(--rice)]",g].filter(Boolean).join(" "),style:{...p,width:y??p.width,height:x??p.height,borderRadius:v??p.borderRadius,...H},initial:n?{opacity:.4}:void 0,animate:n?{opacity:[.4,.7,.4]}:void 0,transition:n?{duration:2.4,repeat:1/0,ease:"easeInOut"}:void 0,children:[n&&e(c.div,{className:"absolute inset-0 pointer-events-none",style:{background:"linear-gradient(90deg, transparent 0%, var(--ink-100) 40%, var(--ink-300) 50%, var(--ink-100) 60%, transparent 100%)",opacity:.15},animate:{x:["-100%","100%"]},transition:{duration:2,repeat:1/0,ease:"easeInOut",delay:.3}}),n&&e(c.div,{className:"absolute inset-0 pointer-events-none",style:{background:"radial-gradient(ellipse at 30% 50%, var(--ink-300) 0%, transparent 70%)",opacity:.06},animate:{opacity:[.03,.08,.03],scale:[1,1.1,1]},transition:{duration:3,repeat:1/0,ease:"easeInOut"}})]})});function Q({isLast:i,animated:t,lineWidth:h,height:n,radius:v}){return e(c.div,{className:"weiwu-skeleton-ink-line relative overflow-hidden bg-[var(--rice)]",style:{width:h??(i?"70%":"100%"),height:n??"1em",borderRadius:v??"var(--radius-sm)"},initial:t?{opacity:.4}:void 0,animate:t?{opacity:[.4,.7,.4]}:void 0,transition:t?{duration:2.4,repeat:1/0,ease:"easeInOut"}:void 0,children:t&&e(c.div,{className:"absolute inset-0 pointer-events-none",style:{background:"linear-gradient(90deg, transparent 0%, var(--ink-100) 40%, var(--ink-300) 50%, var(--ink-100) 60%, transparent 100%)",opacity:.15},animate:{x:["-100%","100%"]},transition:{duration:2,repeat:1/0,ease:"easeInOut",delay:.3}})})}a.displayName="SkeletonInk";try{a.displayName="SkeletonInk",a.__docgenInfo={description:"水墨风骨架屏加载态",displayName:"SkeletonInk",props:{variant:{defaultValue:{value:"text"},description:"骨架变体",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"card"'},{value:'"avatar"'},{value:'"custom"'}]}},lines:{defaultValue:null,description:"行数（text 变体使用）",name:"lines",required:!1,type:{name:"number"}},size:{defaultValue:{value:"md"},description:"尺寸",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},animated:{defaultValue:{value:"true"},description:"是否启用水墨晕染动画",name:"animated",required:!1,type:{name:"boolean"}},radius:{defaultValue:null,description:"圆角",name:"radius",required:!1,type:{name:"string"}},width:{defaultValue:null,description:"宽度",name:"width",required:!1,type:{name:"string | number"}},height:{defaultValue:null,description:"高度",name:"height",required:!1,type:{name:"string | number"}}}}}catch{}const ee={title:"组件/SkeletonInk 水墨骨架屏",component:a,tags:["autodocs"],argTypes:{variant:{control:"select",options:["text","card","avatar","custom"],description:"骨架变体"},lines:{control:{type:"number",min:1,max:20,step:1},description:"行数（text 变体）"},size:{control:"select",options:["sm","md","lg"],description:"尺寸"},animated:{control:"boolean",description:"是否启用水墨晕染动画"},radius:{control:"text",description:"自定义圆角"},width:{control:"text",description:"自定义宽度"},height:{control:"text",description:"自定义高度"}},args:{variant:"text",animated:!0}},s={args:{variant:"text"}},o={render:()=>r("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2xl)",maxWidth:500},children:[e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"文本行（多行）"}),e(a,{variant:"text",lines:4}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"单行文本"}),e(a,{variant:"text",width:"60%",height:"1em"}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"卡片骨架"}),e(a,{variant:"card"}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"头像骨架"}),r("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[e(a,{variant:"avatar"}),r("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:"var(--space-sm)"},children:[e(a,{variant:"text",width:"40%",height:"1em",radius:"var(--radius-sm)"}),e(a,{variant:"text",width:"80%",height:"0.8em",radius:"var(--radius-sm)"})]})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"自定义尺寸"}),e(a,{variant:"custom",width:"200px",height:"100px",radius:"var(--radius-lg)"}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"静态（无动画）"}),e(a,{variant:"text",lines:3,animated:!1})]})},l={args:{variant:"text",lines:3,animated:!0}},d={render:()=>e("div",{style:{maxWidth:400,display:"flex",flexDirection:"column",gap:"var(--space-lg)"},children:r("div",{style:{padding:"var(--space-lg)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-lg)"},children:[r("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center",marginBottom:"var(--space-md)"},children:[e(a,{variant:"avatar"}),r("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:"4px"},children:[e(a,{variant:"text",width:"50%",height:"1em",radius:"var(--radius-sm)"}),e(a,{variant:"text",width:"30%",height:"0.7em",radius:"var(--radius-sm)"})]})]}),e(a,{variant:"text",lines:3})]})})},u={parameters:{darkMode:!0},render:()=>r("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-lg)",maxWidth:400},children:[e(a,{variant:"text",lines:3}),e(a,{variant:"card"}),r("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[e(a,{variant:"avatar"}),e(a,{variant:"text",width:"60%",height:"1em",radius:"var(--radius-sm)"})]})]})};var k,F,A,I,w;s.parameters={...s.parameters,docs:{...(k=s.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    variant: 'text'
  }
}`,...(A=(F=s.parameters)==null?void 0:F.docs)==null?void 0:A.source},description:{story:"默认骨架 — 文本行 + 水墨晕染动画",...(w=(I=s.parameters)==null?void 0:I.docs)==null?void 0:w.description}}};var S,D,b,B,C;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xl)',
    maxWidth: 500
  }}>
      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>文本行（多行）</h3>
      <SkeletonInk variant="text" lines={4} />

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>单行文本</h3>
      <SkeletonInk variant="text" width="60%" height="1em" />

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>卡片骨架</h3>
      <SkeletonInk variant="card" />

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>头像骨架</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <SkeletonInk variant="avatar" />
        <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)'
      }}>
          <SkeletonInk variant="text" width="40%" height="1em" radius="var(--radius-sm)" />
          <SkeletonInk variant="text" width="80%" height="0.8em" radius="var(--radius-sm)" />
        </div>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>自定义尺寸</h3>
      <SkeletonInk variant="custom" width="200px" height="100px" radius="var(--radius-lg)" />

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>静态（无动画）</h3>
      <SkeletonInk variant="text" lines={3} animated={false} />
    </div>
}`,...(b=(D=o.parameters)==null?void 0:D.docs)==null?void 0:b.source},description:{story:"所有骨架变体",...(C=(B=o.parameters)==null?void 0:B.docs)==null?void 0:C.description}}};var E,_,R,V,N;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    lines: 3,
    animated: true
  }
}`,...(R=(_=l.parameters)==null?void 0:_.docs)==null?void 0:R.source},description:{story:"可交互的骨架 — 通过 Controls 面板调整属性",...(N=(V=l.parameters)==null?void 0:V.docs)==null?void 0:N.description}}};var q,W,O,j,z;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }}>
      {/* 卡片骨架 */}
      <div style={{
      padding: 'var(--space-lg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)'
    }}>
        <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        alignItems: 'center',
        marginBottom: 'var(--space-md)'
      }}>
          <SkeletonInk variant="avatar" />
          <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
            <SkeletonInk variant="text" width="50%" height="1em" radius="var(--radius-sm)" />
            <SkeletonInk variant="text" width="30%" height="0.7em" radius="var(--radius-sm)" />
          </div>
        </div>
        <SkeletonInk variant="text" lines={3} />
      </div>
    </div>
}`,...(O=(W=d.parameters)==null?void 0:W.docs)==null?void 0:O.source},description:{story:"模拟加载态 — 骨架屏组合示例",...(z=(j=d.parameters)==null?void 0:j.docs)==null?void 0:z.description}}};var L,M,T,$,G;u.parameters={...u.parameters,docs:{...(L=u.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)',
    maxWidth: 400
  }}>
      <SkeletonInk variant="text" lines={3} />
      <SkeletonInk variant="card" />
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <SkeletonInk variant="avatar" />
        <SkeletonInk variant="text" width="60%" height="1em" radius="var(--radius-sm)" />
      </div>
    </div>
}`,...(T=(M=u.parameters)==null?void 0:M.docs)==null?void 0:T.source},description:{story:"暗色模式下的骨架屏",...(G=($=u.parameters)==null?void 0:$.docs)==null?void 0:G.description}}};const ae=["Default","Variants","Interactive","LoadingDemo","DarkMode"];export{u as DarkMode,s as Default,l as Interactive,d as LoadingDemo,o as Variants,ae as __namedExportsOrder,ee as default};
