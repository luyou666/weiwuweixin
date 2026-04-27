import{j as n,m as q,a as e}from"./proxy-RWgpSLFb.js";import{r as M}from"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";const I={sm:{padding:"var(--space-sm)"},md:{padding:"var(--space-lg)"},lg:{padding:"var(--space-xl)"}},r=M.forwardRef(({size:o="md",interactive:i=!0,textured:l=!0,tiltAngle:_=2,className:k="",children:N,...T},V)=>{const{padding:j}=I[o];return n(q.div,{ref:V,className:["weiwu-card","relative rounded-[var(--radius-lg)]",l?"paper-texture":"","border border-[var(--color-border)]","transition-[box-shadow,border-color]","duration-[var(--duration-normal)]",i?"cursor-pointer":"",k].filter(Boolean).join(" "),style:{padding:j,boxShadow:"var(--shadow-sticker)"},whileHover:i?{rotate:_,y:-4,boxShadow:"var(--shadow-sticker-hover)",transition:{type:"spring",stiffness:300,damping:15}}:void 0,whileTap:i?{scale:.98,transition:{type:"spring",stiffness:500,damping:25}}:void 0,children:[l&&e("span",{className:"pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] dark:opacity-50",style:{background:`
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(90,78,56,0.015) 2px,
                  rgba(90,78,56,0.015) 4px
                )
              `}}),e("div",{className:"relative z-10",children:N})]})});r.displayName="Card";try{r.displayName="Card",r.__docgenInfo={description:`纸面纹理 + 贴纸阴影卡片
hover时2°倾斜 + spring弹跳动画 + dark mode

暗色适配：
  - 边框色跟随 --color-border 变量（暗色下自动变深）
  - 纸面纹理叠层在暗色下降低不透明度`,displayName:"Card",props:{size:{defaultValue:{value:"md"},description:"卡片尺寸",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},interactive:{defaultValue:{value:"true"},description:"是否可悬浮交互",name:"interactive",required:!1,type:{name:"boolean"}},textured:{defaultValue:{value:"true"},description:"是否显示纸面纹理",name:"textured",required:!1,type:{name:"boolean"}},tiltAngle:{defaultValue:{value:"2"},description:"倾斜角度（hover 时叠加）",name:"tiltAngle",required:!1,type:{name:"number"}}}}}catch{}const R={title:"组件/Card 卡片",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"卡片尺寸"},interactive:{control:"boolean",description:"是否可悬浮交互（悬浮时倾斜弹跳）"},textured:{control:"boolean",description:"是否显示纸面纹理叠层"},tiltAngle:{control:{type:"number",min:0,max:10,step:.5},description:"悬浮时倾斜角度"},children:{control:"text",description:"卡片内容"}},args:{size:"md",interactive:!0,textured:!0,tiltAngle:2,children:"纸面纹理卡片，悬浮时轻微倾斜"}},a={args:{children:"围物为心，以心度物"}},u={render:()=>n("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-xl)"},children:[e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"尺寸"}),n("div",{style:{display:"flex",gap:"var(--space-lg)",flexWrap:"wrap"},children:[n(r,{size:"sm",children:[e("p",{style:{margin:0},children:"小号卡片"}),e("p",{style:{margin:"4px 0 0",color:"var(--color-text-secondary)",fontSize:"var(--text-sm)"},children:"适合紧凑信息"})]}),n(r,{size:"md",children:[e("p",{style:{margin:0},children:"中号卡片"}),e("p",{style:{margin:"4px 0 0",color:"var(--color-text-secondary)",fontSize:"var(--text-sm)"},children:"默认尺寸"})]}),n(r,{size:"lg",children:[e("p",{style:{margin:0},children:"大号卡片"}),e("p",{style:{margin:"4px 0 0",color:"var(--color-text-secondary)",fontSize:"var(--text-sm)"},children:"宽松阅读"})]})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"纹理 vs 无纹理"}),n("div",{style:{display:"flex",gap:"var(--space-lg)"},children:[e(r,{textured:!0,children:"纸面纹理卡片"}),e(r,{textured:!1,children:"纯色背景卡片"})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"交互 vs 静态"}),n("div",{style:{display:"flex",gap:"var(--space-lg)"},children:[e(r,{interactive:!0,children:"悬浮可交互"}),e(r,{interactive:!1,children:"纯静态展示"})]})]})},t={args:{children:"调整右侧控制面板查看不同配置",size:"md",interactive:!0,textured:!0,tiltAngle:2}},s={parameters:{darkMode:!0},render:()=>n("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-lg)"},children:[n(r,{size:"md",textured:!0,children:[e("p",{style:{margin:0},children:"暗色模式 — 纸面纹理"}),e("p",{style:{margin:"4px 0 0",color:"var(--color-text-secondary)",fontSize:"var(--text-sm)"},children:"阴影与边框自动适配"})]}),e(r,{size:"md",textured:!1,children:e("p",{style:{margin:0},children:"暗色模式 — 纯色卡片"})})]})};var d,c,p,m,v;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    children: '围物为心，以心度物'
  }
}`,...(p=(c=a.parameters)==null?void 0:c.docs)==null?void 0:p.source},description:{story:"默认卡片 — 纸面纹理 + 贴纸阴影",...(v=(m=a.parameters)==null?void 0:m.docs)==null?void 0:v.description}}};var y,g,x,F,E;u.parameters={...u.parameters,docs:{...(y=u.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)'
  }}>
      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>尺寸</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-lg)',
      flexWrap: 'wrap'
    }}>
        <Card size="sm">
          <p style={{
          margin: 0
        }}>小号卡片</p>
          <p style={{
          margin: '4px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)'
        }}>
            适合紧凑信息
          </p>
        </Card>
        <Card size="md">
          <p style={{
          margin: 0
        }}>中号卡片</p>
          <p style={{
          margin: '4px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)'
        }}>
            默认尺寸
          </p>
        </Card>
        <Card size="lg">
          <p style={{
          margin: 0
        }}>大号卡片</p>
          <p style={{
          margin: '4px 0 0',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)'
        }}>
            宽松阅读
          </p>
        </Card>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>纹理 vs 无纹理</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-lg)'
    }}>
        <Card textured>纸面纹理卡片</Card>
        <Card textured={false}>纯色背景卡片</Card>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>交互 vs 静态</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-lg)'
    }}>
        <Card interactive>悬浮可交互</Card>
        <Card interactive={false}>纯静态展示</Card>
      </div>
    </div>
}`,...(x=(g=u.parameters)==null?void 0:g.docs)==null?void 0:x.source},description:{story:"所有卡片变体",...(E=(F=u.parameters)==null?void 0:F.docs)==null?void 0:E.description}}};var f,h,C,A,B;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    children: '调整右侧控制面板查看不同配置',
    size: 'md',
    interactive: true,
    textured: true,
    tiltAngle: 2
  }
}`,...(C=(h=t.parameters)==null?void 0:h.docs)==null?void 0:C.source},description:{story:"可交互的卡片 — 通过 Controls 面板调整属性",...(B=(A=t.parameters)==null?void 0:A.docs)==null?void 0:B.description}}};var D,z,b,S,w;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }}>
      <Card size="md" textured>
        <p style={{
        margin: 0
      }}>暗色模式 — 纸面纹理</p>
        <p style={{
        margin: '4px 0 0',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)'
      }}>
          阴影与边框自动适配
        </p>
      </Card>
      <Card size="md" textured={false}>
        <p style={{
        margin: 0
      }}>暗色模式 — 纯色卡片</p>
      </Card>
    </div>
}`,...(b=(z=s.parameters)==null?void 0:z.docs)==null?void 0:b.source},description:{story:"暗色模式下的卡片",...(w=(S=s.parameters)==null?void 0:S.docs)==null?void 0:w.description}}};const G=["Default","Variants","Interactive","DarkMode"];export{s as DarkMode,a as Default,t as Interactive,u as Variants,G as __namedExportsOrder,R as default};
