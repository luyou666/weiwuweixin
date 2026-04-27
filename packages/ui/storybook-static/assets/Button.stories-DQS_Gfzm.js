import{j as t,a as n}from"./proxy-RWgpSLFb.js";import{B as e}from"./Button-CIPQ5Vpe.js";import"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";const M={title:"组件/Button 按钮",component:e,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"],description:"按钮尺寸"},fullWidth:{control:"boolean",description:"是否占满父容器宽度"},disabled:{control:"boolean",description:"是否禁用"},loading:{control:"boolean",description:"是否加载中"},htmlType:{control:"select",options:["button","submit","reset"],description:"HTML 按钮类型"},children:{control:"text",description:"按钮内容"}},args:{children:"点击此处",size:"md",fullWidth:!1,disabled:!1,loading:!1,htmlType:"button"}},r={args:{children:"默认按钮"}},a={render:()=>t("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-lg)"},children:[n("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"尺寸"}),t("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[n(e,{size:"sm",children:"小号按钮"}),n(e,{size:"md",children:"中号按钮"}),n(e,{size:"lg",children:"大号按钮"})]}),n("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"状态"}),t("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[n(e,{children:"正常"}),n(e,{disabled:!0,children:"禁用"}),n(e,{loading:!0,children:"加载中"})]}),n("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"全宽"}),n("div",{style:{maxWidth:400},children:n(e,{fullWidth:!0,children:"全宽按钮"})}),n("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"带图标"}),t("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[n(e,{iconLeft:n("span",{children:"←"}),children:"返回"}),n(e,{iconRight:n("span",{children:"→"}),children:"继续"}),n(e,{iconLeft:n("span",{children:"✦"}),iconRight:n("span",{children:"✦"}),children:"两端图标"})]})]})},i={args:{children:"交互按钮",size:"md",disabled:!1,loading:!1}},s={parameters:{darkMode:!0},render:()=>t("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-lg)"},children:[t("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[n(e,{size:"sm",children:"小号"}),n(e,{size:"md",children:"中号"}),n(e,{size:"lg",children:"大号"})]}),t("div",{style:{display:"flex",gap:"var(--space-md)",alignItems:"center"},children:[n(e,{children:"正常"}),n(e,{disabled:!0,children:"禁用"}),n(e,{loading:!0,children:"加载中"})]})]})};var o,l,u,d,c;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    children: '默认按钮'
  }
}`,...(u=(l=r.parameters)==null?void 0:l.docs)==null?void 0:u.source},description:{story:"默认按钮 — 朱砂红填色白字",...(c=(d=r.parameters)==null?void 0:d.docs)==null?void 0:c.description}}};var p,m,h,g,y;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }}>
      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>尺寸</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <Button size="sm">小号按钮</Button>
        <Button size="md">中号按钮</Button>
        <Button size="lg">大号按钮</Button>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>状态</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <Button>正常</Button>
        <Button disabled>禁用</Button>
        <Button loading>加载中</Button>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>全宽</h3>
      <div style={{
      maxWidth: 400
    }}>
        <Button fullWidth>全宽按钮</Button>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>带图标</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <Button iconLeft={<span>←</span>}>返回</Button>
        <Button iconRight={<span>→</span>}>继续</Button>
        <Button iconLeft={<span>✦</span>} iconRight={<span>✦</span>}>两端图标</Button>
      </div>
    </div>
}`,...(h=(m=a.parameters)==null?void 0:m.docs)==null?void 0:h.source},description:{story:"所有尺寸与状态变体",...(y=(g=a.parameters)==null?void 0:g.docs)==null?void 0:y.description}}};var v,f,B,E,x;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: '交互按钮',
    size: 'md',
    disabled: false,
    loading: false
  }
}`,...(B=(f=i.parameters)==null?void 0:f.docs)==null?void 0:B.source},description:{story:"可交互的按钮 — 通过 Controls 面板调整属性",...(x=(E=i.parameters)==null?void 0:E.docs)==null?void 0:x.description}}};var F,D,A,z,b;s.parameters={...s.parameters,docs:{...(F=s.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
  }}>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <Button size="sm">小号</Button>
        <Button size="md">中号</Button>
        <Button size="lg">大号</Button>
      </div>
      <div style={{
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'center'
    }}>
        <Button>正常</Button>
        <Button disabled>禁用</Button>
        <Button loading>加载中</Button>
      </div>
    </div>
}`,...(A=(D=s.parameters)==null?void 0:D.docs)==null?void 0:A.source},description:{story:"暗色模式下的按钮",...(b=(z=s.parameters)==null?void 0:z.docs)==null?void 0:b.description}}};const k=["Default","Variants","Interactive","DarkMode"];export{s as DarkMode,r as Default,i as Interactive,a as Variants,k as __namedExportsOrder,M as default};
