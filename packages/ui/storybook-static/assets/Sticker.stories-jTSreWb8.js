import{j as t,m as N,a as e}from"./proxy-RWgpSLFb.js";import{r as q}from"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";const T={sm:"min-w-[80px] min-h-[80px]",md:"min-w-[120px] min-h-[120px]",lg:"min-w-[180px] min-h-[180px]"},r=q.forwardRef(({size:s="md",draggable:w=!1,rotatable:I=!0,initialRotation:R,folded:_=!0,className:V="",children:o,...W},j)=>{var u;const M=R??Math.sin(((u=o==null?void 0:o.toString())==null?void 0:u.length)||0)*6-3;return t(N.div,{ref:j,className:["weiwu-sticker","relative inline-flex items-center justify-center","rounded-[var(--radius-md)]","paper-texture","border border-[var(--color-border)]","transition-[border-color,background-color]","duration-[var(--duration-normal)]",T[s],"select-none",V].filter(Boolean).join(" "),style:{boxShadow:"var(--shadow-sticker)",transform:`rotate(${M}deg)`},whileHover:{scale:1.08,rotate:I?0:void 0,y:-6,boxShadow:"var(--shadow-sticker-hover)",transition:{type:"spring",stiffness:350,damping:12}},whileTap:{scale:.95,transition:{type:"spring",stiffness:500,damping:20}},drag:w,dragElastic:.1,dragMomentum:!1,children:[_&&e("span",{className:"pointer-events-none absolute -top-0 -right-0 z-20",style:{width:"20px",height:"20px",background:"linear-gradient(225deg, var(--rice) 50%, var(--ink-100) 50%)",borderBottomLeftRadius:"var(--radius-sm)",boxShadow:"-2px 2px 3px rgba(26,26,36,0.06)"}}),e("div",{className:"relative z-10 p-3 flex items-center justify-center",children:o})]})});r.displayName="Sticker";try{r.displayName="Sticker",r.__docgenInfo={description:`贴纸风格组件
- 轻微随机旋转
- 悬浮弹跳反馈
- 可选折角装饰
- dark mode 支持

暗色适配：
  - 折角渐变在暗色下使用 --rice（暗底色）和 --ink-100（暗色边）
  - 阴影通过 CSS 变量自动调整
  - 边框色跟随 --color-border`,displayName:"Sticker",props:{size:{defaultValue:{value:"md"},description:"尺寸",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},draggable:{defaultValue:{value:"false"},description:"是否可拖拽",name:"draggable",required:!1,type:{name:"boolean"}},rotatable:{defaultValue:{value:"true"},description:"是否可旋转",name:"rotatable",required:!1,type:{name:"boolean"}},initialRotation:{defaultValue:null,description:"初始随机旋转角度",name:"initialRotation",required:!1,type:{name:"number"}},folded:{defaultValue:{value:"true"},description:"是否显示折角",name:"folded",required:!1,type:{name:"boolean"}}}}}catch{}const $={title:"组件/Sticker 贴纸",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"贴纸尺寸"},draggable:{control:"boolean",description:"是否可拖拽"},rotatable:{control:"boolean",description:"悬浮时是否旋转回正"},initialRotation:{control:{type:"number",min:-15,max:15,step:1},description:"初始旋转角度（默认随机）"},folded:{control:"boolean",description:"是否显示折角装饰"},children:{control:"text",description:"贴纸内容"}},args:{size:"md",draggable:!1,rotatable:!0,folded:!0,children:"贴纸"}},n={args:{children:"贴纸文字"}},a={render:()=>t("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2xl)"},children:[e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"尺寸"}),t("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center",flexWrap:"wrap"},children:[e(r,{size:"sm",children:"小号"}),e(r,{size:"md",children:"中号"}),e(r,{size:"lg",children:"大号贴纸"})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"折角 vs 无折角"}),t("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center"},children:[e(r,{folded:!0,children:"有折角"}),e(r,{folded:!1,children:"无折角"})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"可拖拽"}),e("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center"},children:e(r,{draggable:!0,children:"拖我试试"})}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"自定义旋转角度"}),t("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center"},children:[e(r,{initialRotation:-8,children:"-8°"}),e(r,{initialRotation:0,children:"0°"}),e(r,{initialRotation:8,children:"+8°"})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"富内容"}),t("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"flex-start"},children:[e(r,{size:"lg",children:t("div",{style:{textAlign:"center"},children:[e("div",{style:{fontSize:"24px",marginBottom:"4px"},children:"🏔"}),e("div",{style:{fontSize:"var(--text-sm)",color:"var(--color-text-secondary)"},children:"山水之乐"})]})}),e(r,{size:"lg",children:t("div",{style:{textAlign:"center"},children:[e("div",{style:{fontSize:"24px",marginBottom:"4px"},children:"🍵"}),e("div",{style:{fontSize:"var(--text-sm)",color:"var(--color-text-secondary)"},children:"一盏清茶"})]})})]})]})},i={args:{children:"交互贴纸",size:"md",draggable:!1,rotatable:!0,folded:!0}},l={parameters:{darkMode:!0},render:()=>t("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center"},children:[e(r,{size:"sm",children:"小号"}),e(r,{size:"md",children:"暗色贴纸"}),e(r,{size:"lg",folded:!1,children:e("div",{style:{textAlign:"center"},children:"大号无折角"})})]})};var d,c,p,m,v;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    children: '贴纸文字'
  }
}`,...(p=(c=n.parameters)==null?void 0:c.docs)==null?void 0:p.source},description:{story:"默认贴纸 — 轻微旋转 + 折角装饰 + 弹跳悬浮",...(v=(m=n.parameters)==null?void 0:m.docs)==null?void 0:v.description}}};var g,f,y,x,h;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xl)'
  }}>
      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>尺寸</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
        <Sticker size="sm">小号</Sticker>
        <Sticker size="md">中号</Sticker>
        <Sticker size="lg">大号贴纸</Sticker>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>折角 vs 无折角</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center'
    }}>
        <Sticker folded>有折角</Sticker>
        <Sticker folded={false}>无折角</Sticker>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>可拖拽</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center'
    }}>
        <Sticker draggable>拖我试试</Sticker>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>自定义旋转角度</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center'
    }}>
        <Sticker initialRotation={-8}>-8°</Sticker>
        <Sticker initialRotation={0}>0°</Sticker>
        <Sticker initialRotation={8}>+8°</Sticker>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>富内容</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'flex-start'
    }}>
        <Sticker size="lg">
          <div style={{
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: '24px',
            marginBottom: '4px'
          }}>🏔</div>
            <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)'
          }}>山水之乐</div>
          </div>
        </Sticker>
        <Sticker size="lg">
          <div style={{
          textAlign: 'center'
        }}>
            <div style={{
            fontSize: '24px',
            marginBottom: '4px'
          }}>🍵</div>
            <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)'
          }}>一盏清茶</div>
          </div>
        </Sticker>
      </div>
    </div>
}`,...(y=(f=a.parameters)==null?void 0:f.docs)==null?void 0:y.source},description:{story:"所有贴纸变体",...(h=(x=a.parameters)==null?void 0:x.docs)==null?void 0:h.description}}};var F,D,S,E,k;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    children: '交互贴纸',
    size: 'md',
    draggable: false,
    rotatable: true,
    folded: true
  }
}`,...(S=(D=i.parameters)==null?void 0:D.docs)==null?void 0:S.source},description:{story:"可交互的贴纸 — 通过 Controls 面板调整属性",...(k=(E=i.parameters)==null?void 0:E.docs)==null?void 0:k.description}}};var B,C,b,z,A;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => <div style={{
    display: 'flex',
    gap: 'var(--space-xl)',
    alignItems: 'center'
  }}>
      <Sticker size="sm">小号</Sticker>
      <Sticker size="md">暗色贴纸</Sticker>
      <Sticker size="lg" folded={false}>
        <div style={{
        textAlign: 'center'
      }}>大号无折角</div>
      </Sticker>
    </div>
}`,...(b=(C=l.parameters)==null?void 0:C.docs)==null?void 0:b.source},description:{story:"暗色模式下的贴纸",...(A=(z=l.parameters)==null?void 0:z.docs)==null?void 0:A.description}}};const G=["Default","Variants","Interactive","DarkMode"];export{l as DarkMode,n as Default,i as Interactive,a as Variants,G as __namedExportsOrder,$ as default};
